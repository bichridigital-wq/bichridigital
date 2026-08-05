"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../../../lib/supabase/server";
import {
  createGuest,
  deleteGuest,
  getGuestAdminById,
  isGuestPhotoReferenced,
  updateGuest,
} from "../../../lib/guests/service";
import { validateGuestFormData, validateGuestId } from "../../../lib/guests/validation";
import {
  readGuestPhoto,
  removeGuestPhoto,
  uploadGuestPhoto,
} from "../../../lib/guests/media";
import type { GuestActionState } from "../../../types/guest";
import type { SupabaseClient } from "@supabase/supabase-js";

async function authenticatedClient() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("Vous devez être connecté.");
  const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");
  if (adminError || !isAdmin) throw new Error("Accès administrateur requis.");
  return supabase;
}

function result(error: unknown): GuestActionState {
  return {
    success: false,
    message:
      error instanceof Error
        ? error.message
        : "Une erreur inattendue est survenue.",
  };
}

function refresh() {
  revalidatePath("/admin/guests");
  revalidatePath("/admin/schedule");
}

export async function saveGuestAction(
  id: string | null,
  formData: FormData,
): Promise<GuestActionState> {
  let createdId: string | null = null;
  let uploadedPath: string | null = null;
  let persisted = false;
  let supabase: SupabaseClient | null = null;
  try {
    supabase = await authenticatedClient();
    const values = validateGuestFormData(formData);
    const photo = readGuestPhoto(formData);
    const removePhoto = formData.get("remove_photo") === "true";
    if (id) {
      validateGuestId(id);
      const current = await getGuestAdminById(supabase, id);
      if (!current) throw new Error("Invité introuvable.");
      let photoUrl = removePhoto ? null : current.photoUrl;
      let photoStoragePath = removePhoto ? null : current.photoStoragePath;
      if (photo) {
        const uploaded = await uploadGuestPhoto(id, photo);
        uploadedPath = uploaded.storagePath;
        photoUrl = uploaded.publicUrl;
        photoStoragePath = uploaded.storagePath;
      }
      const shouldRemovePreviousPhoto =
        Boolean(
          current.photoUrl &&
            current.photoStoragePath &&
            (removePhoto ||
              (uploadedPath && uploadedPath !== current.photoStoragePath)),
        ) &&
        !(await isGuestPhotoReferenced(supabase, current.photoUrl as string));
      await updateGuest(supabase, id, { ...values, photoUrl, photoStoragePath });
      if (shouldRemovePreviousPhoto && current.photoStoragePath) {
        try {
          await removeGuestPhoto(id, current.photoStoragePath);
        } catch {
          console.error("[guests] Ancienne photo non supprimée.");
        }
      }
    } else {
      const created = await createGuest(supabase, values);
      createdId = created.id;
      if (photo) {
        const uploaded = await uploadGuestPhoto(created.id, photo);
        uploadedPath = uploaded.storagePath;
        await updateGuest(supabase, created.id, {
          ...values,
          photoUrl: uploaded.publicUrl,
          photoStoragePath: uploaded.storagePath,
        });
      }
    }
    persisted = true;
    refresh();
    return {
      success: true,
      message: id ? "Invité modifié." : "Invité créé.",
    };
  } catch (error) {
    if (!persisted && createdId && supabase) {
      try {
        await deleteGuest(supabase, createdId);
      } catch {
        console.error("[guests] Fiche incomplète non supprimée.");
      }
    }
    if (!persisted && uploadedPath) {
      try {
        await removeGuestPhoto(id ?? createdId ?? "", uploadedPath);
      } catch {
        console.error("[guests] Photo temporaire non supprimée.");
      }
    }
    return result(error);
  }
}

export async function setGuestActiveAction(
  id: string,
  isActive: boolean,
): Promise<GuestActionState> {
  try {
    if (typeof isActive !== "boolean") throw new Error("Statut invalide.");
    const supabase = await authenticatedClient();
    const current = await getGuestAdminById(supabase, id);
    if (!current) throw new Error("Invité introuvable.");
    await updateGuest(supabase, id, {
      fullName: current.fullName,
      slug: current.slug,
      title: current.title,
      shortBio: current.shortBio,
      specialty: current.specialty,
      photoUrl: current.photoUrl,
      photoStoragePath: current.photoStoragePath,
      instagramUrl: current.instagramUrl,
      facebookUrl: current.facebookUrl,
      youtubeUrl: current.youtubeUrl,
      websiteUrl: current.websiteUrl,
      isActive,
      sortOrder: current.sortOrder,
    });
    refresh();
    return {
      success: true,
      message: isActive ? "Invité activé." : "Invité désactivé.",
    };
  } catch (error) {
    return result(error);
  }
}

export async function deleteGuestAction(id: string): Promise<GuestActionState> {
  try {
    const supabase = await authenticatedClient();
    const current = await getGuestAdminById(supabase, id);
    if (!current) throw new Error("Invité introuvable.");
    const shouldRemovePhoto =
      Boolean(current.photoUrl && current.photoStoragePath) &&
      !(await isGuestPhotoReferenced(supabase, current.photoUrl as string));
    await deleteGuest(supabase, id);
    if (shouldRemovePhoto && current.photoStoragePath) {
      try {
        await removeGuestPhoto(id, current.photoStoragePath);
      } catch {
        console.error("[guests] Fiche supprimée, photo Storage non supprimée.");
      }
    }
    refresh();
    return { success: true, message: "Invité supprimé définitivement." };
  } catch (error) {
    return result(error);
  }
}
