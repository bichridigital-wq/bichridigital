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

export async function saveScheduleEventAction(
  id: string | null,
  formData: FormData,
): Promise<ScheduleActionState> {
  let uploadedPath: string | null = null;
  let createdId: string | null = null;
  let persisted = false;
  try {
    const input = validateScheduleFormData(formData);
    const image = readScheduleImage(formData);
    const removeImage = formData.get("remove_thumbnail") === "true";
    if (image) await validateScheduleImage(image);

    if (id) {
      const current = await getScheduleEventById(id);
      if (!current) throw new Error("Événement introuvable.");
      let thumbnailUrl = removeImage ? null : current.thumbnailUrl;
      if (image) {
        const uploaded = await uploadScheduleImage(id, image);
        uploadedPath = uploaded.path;
        thumbnailUrl = uploaded.publicUrl;
      }
      await updateScheduleEvent(id, { ...input, thumbnailUrl });

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
      const created = await createScheduleEvent({
        ...input,
        thumbnailUrl: null,
      });
      createdId = created.id;
      if (image) {
        const uploaded = await uploadScheduleImage(created.id, image);
        uploadedPath = uploaded.path;
        await updateScheduleEvent(created.id, {
          ...input,
          thumbnailUrl: uploaded.publicUrl,
        });
      }
      persisted = true;
    }
    refreshSchedule();
    return {
      success: true,
      message: id ? "Événement modifié." : "Événement créé.",
    };
  } catch (error) {
    if (!persisted && uploadedPath) {
      try {
        await removeScheduleImage(uploadedPath);
      } catch {
        console.error("Agenda : miniature temporaire non supprimée.");
      }
    }
    if (!persisted && createdId) {
      try {
        await deleteScheduleEvent(createdId);
      } catch {
        console.error("Agenda : événement incomplet non supprimé.");
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
    if (typeof isPublished !== "boolean") {
      throw new Error("Statut de publication invalide.");
    }
    const event = await getScheduleEventById(id);
    if (!event) throw new Error("Événement introuvable.");
    await updateScheduleEvent(id, {
      ...event,
      isPublished,
    });
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
    if (!SCHEDULE_STATUSES.includes(status)) {
      throw new Error("Statut invalide.");
    }
    const event = await getScheduleEventById(id);
    if (!event) throw new Error("Événement introuvable.");
    await updateScheduleEvent(id, { ...event, status });
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
    const event = await getScheduleEventById(id);
    if (!event) throw new Error("Événement introuvable.");
    const imagePath = getOwnedScheduleImagePath(id, event.thumbnailUrl);
    await deleteScheduleEvent(id);
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
