"use server";

import { revalidatePath } from "next/cache";
import {
  createProgram,
  deleteProgram,
  getProgramAdminById,
  updateProgram,
} from "../../../lib/programs/service";
import { validateProgramFormData } from "../../../lib/programs/validation";
import {
  readProgramImage,
  removeProgramImage,
  uploadProgramImage,
} from "../../../lib/programs/media";
import type { ProgramActionState } from "../../../types/program";

function resultError(error: unknown): ProgramActionState {
  return {
    success: false,
    message:
      error instanceof Error
        ? error.message
        : "Une erreur inattendue est survenue.",
  };
}

function refreshPrograms() {
  revalidatePath("/admin/programs");
  revalidatePath("/admin/schedule");
}

export async function saveProgramAction(
  id: string | null,
  formData: FormData,
): Promise<ProgramActionState> {
  let createdId: string | null = null;
  let uploadedPath: string | null = null;
  try {
    const input = validateProgramFormData(formData);
    const image = readProgramImage(formData);
    const removeImage = formData.get("remove_thumbnail") === "true";

    if (id) {
      const current = await getProgramAdminById(id);
      if (!current) throw new Error("Programme introuvable.");
      let thumbnailUrl = removeImage ? null : current.defaultThumbnailUrl;
      let thumbnailPath = removeImage
        ? null
        : current.defaultThumbnailStoragePath;
      if (image) {
        const uploaded = await uploadProgramImage(id, image);
        uploadedPath = uploaded.storagePath;
        thumbnailUrl = uploaded.publicUrl;
        thumbnailPath = uploaded.storagePath;
      }
      await updateProgram(id, {
        ...input,
        defaultThumbnailUrl: thumbnailUrl,
        defaultThumbnailStoragePath: thumbnailPath,
      });
      if (
        current.defaultThumbnailStoragePath &&
        (removeImage ||
          (uploadedPath &&
            uploadedPath !== current.defaultThumbnailStoragePath))
      ) {
        try {
          await removeProgramImage(id, current.defaultThumbnailStoragePath);
        } catch {
          console.error("Programmes : ancienne miniature non supprimée.");
        }
      }
    } else {
      const created = await createProgram(input);
      createdId = created.id;
      if (image) {
        const uploaded = await uploadProgramImage(created.id, image);
        uploadedPath = uploaded.storagePath;
        await updateProgram(created.id, {
          ...input,
          defaultThumbnailUrl: uploaded.publicUrl,
          defaultThumbnailStoragePath: uploaded.storagePath,
        });
      }
    }
    refreshPrograms();
    return {
      success: true,
      message: id ? "Programme modifié." : "Programme créé.",
    };
  } catch (error) {
    if (uploadedPath) {
      try {
        await removeProgramImage(id ?? createdId ?? "", uploadedPath);
      } catch {
        console.error("Programmes : miniature temporaire non supprimée.");
      }
    }
    if (createdId) {
      try {
        await deleteProgram(createdId);
      } catch {
        console.error("Programmes : programme incomplet non supprimé.");
      }
    }
    return resultError(error);
  }
}

export async function setProgramActiveAction(
  id: string,
  isActive: boolean,
): Promise<ProgramActionState> {
  try {
    if (typeof isActive !== "boolean") {
      throw new Error("État d’activation invalide.");
    }
    const current = await getProgramAdminById(id);
    if (!current) throw new Error("Programme introuvable.");
    await updateProgram(id, {
      name: current.name,
      slug: current.slug,
      category: current.category,
      defaultDescription: current.defaultDescription,
      defaultThumbnailUrl: current.defaultThumbnailUrl,
      defaultThumbnailStoragePath: current.defaultThumbnailStoragePath,
      defaultDurationMinutes: current.defaultDurationMinutes,
      isActive,
      sortOrder: current.sortOrder,
    });
    refreshPrograms();
    return {
      success: true,
      message: isActive ? "Programme activé." : "Programme désactivé.",
    };
  } catch (error) {
    return resultError(error);
  }
}
