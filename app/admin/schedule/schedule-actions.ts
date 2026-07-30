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
  try {
    const input = validateScheduleFormData(formData);
    if (id) await updateScheduleEvent(id, input);
    else await createScheduleEvent(input);
    refreshSchedule();
    return {
      success: true,
      message: id ? "Événement modifié." : "Événement créé.",
    };
  } catch (error) {
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
    await deleteScheduleEvent(id);
    refreshSchedule();
    return { success: true, message: "Événement supprimé." };
  } catch (error) {
    return actionError(error);
  }
}
