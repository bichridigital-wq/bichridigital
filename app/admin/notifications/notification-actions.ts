"use server";

import { revalidatePath } from "next/cache";
import type { PushActionState } from "../../../types/push";
import { requirePushAdmin } from "../../../lib/push/admin-auth";
import {
  checkPendingReceipts,
  disablePushDeviceManually,
  sendManualTest,
} from "../../../lib/push/service";
import { validateTestMessage } from "../../../lib/push/validation";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function sendTestPushAction(
  _previous: PushActionState,
  formData: FormData,
): Promise<PushActionState> {
  try {
    const { userId } = await requirePushAdmin();
    if (formData.get("confirmation") !== "confirmed") {
      return { success: false, message: "Confirmation d’envoi obligatoire." };
    }
    const destinationType = String(formData.get("destination_type") ?? "");
    const input = validateTestMessage({
      deviceId: formData.get("device_id"),
      requestKey: formData.get("request_key"),
      title: formData.get("title"),
      body: formData.get("body"),
      destination: {
        type: destinationType,
        ...(destinationType === "emission" ? { emissionSlug: formData.get("emission_slug") } : {}),
        ...(destinationType === "video" ? { videoId: formData.get("video_id") } : {}),
      },
    });
    const result = await sendManualTest(input, userId);
    revalidatePath("/admin/notifications");
    return {
      success: result.status === "ok" || result.duplicate,
      message: result.duplicate
        ? "Cette demande a déjà été traitée ; aucun second envoi n’a été créé."
        : result.status === "ok"
          ? "Ticket Expo accepté. Vérifiez le reçu après quinze minutes."
          : `Ticket Expo refusé (${result.code ?? "erreur"}).`,
    };
  } catch {
    return { success: false, message: "Envoi impossible. Vérifiez l’appareil et les champs." };
  }
}

export async function checkReceiptsAction(): Promise<PushActionState> {
  try {
    await requirePushAdmin();
    const checked = await checkPendingReceipts();
    revalidatePath("/admin/notifications");
    return { success: true, message: `${checked} reçu(s) mis à jour.` };
  } catch {
    return { success: false, message: "Vérification des reçus impossible." };
  }
}

export async function disableDeviceAction(formData: FormData): Promise<void> {
  await requirePushAdmin();
  const deviceId = String(formData.get("device_id") ?? "");
  const confirmation = formData.get("confirmation");
  if (!UUID_PATTERN.test(deviceId) || confirmation !== "disable") {
    throw new Error("Confirmation invalide.");
  }
  await disablePushDeviceManually(deviceId);
  revalidatePath("/admin/notifications");
}
