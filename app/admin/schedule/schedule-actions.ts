"use server";

import { revalidatePath, updateTag } from "next/cache";
import {
  createScheduleEvent,
  deleteScheduleEvent,
  getScheduleEventById,
  updateScheduleEvent,
} from "../../../lib/schedule/service";
import { validateScheduleFormData } from "../../../lib/schedule/validation";
import {
  getOwnedScheduleImagePath,
  readScheduleImage,
  removeScheduleImage,
  uploadScheduleImage,
  validateScheduleImage,
} from "../../../lib/schedule/media";
import { getProgramAdminById } from "../../../lib/programs/service";
import { createClient } from "../../../lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { syncGuestsForSchedule } from "../../../lib/guests/service";
import { validateGuestSelections } from "../../../lib/guests/validation";
import {
  SCHEDULE_STATUSES,
  type ScheduleActionState,
  type ScheduleStatus,
} from "../../../types/schedule";

function refreshSchedule() {
  updateTag("public-broadcast-schedule");
  revalidatePath("/admin");
  revalidatePath("/admin/schedule");
}

function actionError(error: unknown): ScheduleActionState {
  return {
    success: false,
    message:
      error instanceof Error
        ? error.message
        : "Une erreur inattendue est survenue.",
  };
}

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

export async function saveScheduleEventAction(
  id: string | null,
  formData: FormData,
): Promise<ScheduleActionState> {
  let uploadedPath: string | null = null;
  let createdId: string | null = null;
  let persisted = false;
  let supabase: SupabaseClient | null = null;
  let previousEvent: Awaited<ReturnType<typeof getScheduleEventById>> = null;
  let existingEventUpdated = false;
  try {
    supabase = await authenticatedClient();
    const input = validateScheduleFormData(formData);
    const guestSelections = validateGuestSelections(formData);
    const program = input.programId
      ? await getProgramAdminById(input.programId, supabase)
      : null;
    if (input.programId && !program) {
      throw new Error("Programme introuvable.");
    }
    const image = readScheduleImage(formData);
    const removeImage = formData.get("remove_thumbnail") === "true";
    const useProgramThumbnail =
      formData.get("use_program_thumbnail") === "true";
    if (image) await validateScheduleImage(image);

    if (id) {
      const current = await getScheduleEventById(id, supabase);
      if (!current) throw new Error("Événement introuvable.");
      previousEvent = current;
      let thumbnailUrl = removeImage
        ? null
        : useProgramThumbnail
          ? program?.defaultThumbnailUrl ?? null
          : current.thumbnailUrl;
      if (image) {
        const uploaded = await uploadScheduleImage(id, image);
        uploadedPath = uploaded.path;
        thumbnailUrl = uploaded.publicUrl;
      }
      await updateScheduleEvent(id, { ...input, thumbnailUrl }, supabase);
      existingEventUpdated = true;
      await syncGuestsForSchedule(supabase, id, guestSelections);

      const previousPath = getOwnedScheduleImagePath(id, current.thumbnailUrl);
      if (
        previousPath &&
        (removeImage || (uploadedPath && previousPath !== uploadedPath))
      ) {
        try {
          await removeScheduleImage(previousPath);
        } catch {
          console.error(
            "Agenda : ancienne miniature non supprimée après mise à jour.",
          );
        }
      }
      persisted = true;
    } else {
      const created = await createScheduleEvent(
        {
          ...input,
          thumbnailUrl: program?.defaultThumbnailUrl ?? null,
        },
        supabase,
      );
      createdId = created.id;
      if (image) {
        const uploaded = await uploadScheduleImage(created.id, image);
        uploadedPath = uploaded.path;
        await updateScheduleEvent(
          created.id,
          {
            ...input,
            thumbnailUrl: uploaded.publicUrl,
          },
          supabase,
        );
      }
      await syncGuestsForSchedule(supabase, created.id, guestSelections);
      persisted = true;
    }
    refreshSchedule();
    return {
      success: true,
      message: id ? "Événement modifié." : "Événement créé.",
    };
  } catch (error) {
    let canRemoveUploadedImage = !existingEventUpdated && !createdId;
    if (!persisted && existingEventUpdated && id && previousEvent && supabase) {
      try {
        await updateScheduleEvent(id, previousEvent, supabase);
        canRemoveUploadedImage = true;
      } catch {
        console.error(
          "Agenda : échec de restauration après synchronisation des invités.",
        );
      }
    }
    if (!persisted && createdId && supabase) {
      try {
        await deleteScheduleEvent(createdId, supabase);
        canRemoveUploadedImage = true;
      } catch {
        console.error("Agenda : événement incomplet non supprimé.");
      }
    }
    if (!persisted && uploadedPath && canRemoveUploadedImage) {
      try {
        await removeScheduleImage(uploadedPath);
      } catch {
        console.error("Agenda : miniature temporaire non supprimée.");
      }
    }
    return actionError(error);
  }
}

export async function setSchedulePublishedAction(
  id: string,
  isPublished: boolean,
): Promise<ScheduleActionState> {
  try {
    const supabase = await authenticatedClient();
    if (typeof isPublished !== "boolean") {
      throw new Error("Statut de publication invalide.");
    }
    const event = await getScheduleEventById(id, supabase);
    if (!event) throw new Error("Événement introuvable.");
    await updateScheduleEvent(id, {
      ...event,
      isPublished,
    }, supabase);
    refreshSchedule();
    return {
      success: true,
      message: isPublished ? "Événement publié." : "Événement dépublié.",
    };
  } catch (error) {
    return actionError(error);
  }
}

export async function setScheduleStatusAction(
  id: string,
  status: ScheduleStatus,
): Promise<ScheduleActionState> {
  try {
    const supabase = await authenticatedClient();
    if (!SCHEDULE_STATUSES.includes(status)) {
      throw new Error("Statut invalide.");
    }
    const event = await getScheduleEventById(id, supabase);
    if (!event) throw new Error("Événement introuvable.");
    await updateScheduleEvent(id, { ...event, status }, supabase);
    refreshSchedule();
    return { success: true, message: "Statut mis à jour." };
  } catch (error) {
    return actionError(error);
  }
}

export async function deleteScheduleEventAction(
  id: string,
): Promise<ScheduleActionState> {
  try {
    const supabase = await authenticatedClient();
    const event = await getScheduleEventById(id, supabase);
    if (!event) throw new Error("Événement introuvable.");
    const imagePath = getOwnedScheduleImagePath(id, event.thumbnailUrl);
    await deleteScheduleEvent(id, supabase);
    if (imagePath) {
      try {
        await removeScheduleImage(imagePath);
      } catch {
        console.error(
          "Agenda : événement supprimé, mais miniature Storage non supprimée.",
        );
      }
    }
    refreshSchedule();
    return { success: true, message: "Événement supprimé." };
  } catch (error) {
    return actionError(error);
  }
}
