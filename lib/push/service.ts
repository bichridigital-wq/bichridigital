import "server-only";

import { Expo } from "expo-server-sdk";
import { createAdminClient } from "../supabase/admin";
import type {
  PushAdminStats,
  PushDeviceAdmin,
  PushDeliveryAdmin,
  PushNavigationData,
  PushPreferences,
  RegisterPushDeviceInput,
} from "../../types/push";
import { createExpoClient, type ExpoClient, withExpoTimeout } from "./expo-client";
import { receiptState, ticketState } from "./delivery-state";
import { PushOwnershipError, PushRateLimitError } from "./errors";
import { isDeviceEligible } from "./policy";
import { hashPushSecret, safePushError } from "./security";
import {
  consumeRateLimit,
  advanceVideoAutomationState,
  claimLiveStartBatch,
  claimVideoPublishedBatch,
  disableDevice,
  finishBatch,
  finishLiveStartBatch,
  finishVideoPublishedBatch,
  insertBatch,
  insertDelivery,
  registerDevice,
  selectActiveDeviceForSend,
  selectActiveProgramBySlug,
  selectBatchByRequestKey,
  selectDevicesAdmin,
  selectPendingReceipts,
  selectRecentDeliveries,
  selectLiveStartDevices,
  selectVideoAutomationState,
  selectVideoPublishedDevices,
  unregisterDevice,
  updateDeliveryReceipt,
  updateDeliveryTicket,
  updatePreferences,
} from "./repository";
import { getLiveBroadcast, getRecentPublicVideoUploads } from "../youtube/service";
import {
  hasPushToken,
  runLiveStartCheck,
  type LiveStartNotification,
} from "./live-automation";
import {
  runVideoPublishedCheck,
  type VideoPublishedNotification,
} from "./video-automation";

async function enforceRateLimit(
  endpoint: "register" | "preferences" | "unregister",
  installationId: string,
  token: string,
  requestRateKey: string,
) {
  const supabase = createAdminClient();
  const keys = [
    hashPushSecret(`installation:${installationId}`),
    hashPushSecret(`token:${token}`),
    requestRateKey,
  ];
  for (const key of keys) {
    const { data, error } = await consumeRateLimit(supabase, key, endpoint, 20);
    if (error) throw new Error("Rate limit unavailable");
    if (!data) throw new PushRateLimitError("Trop de requêtes.");
  }
}

export async function registerPushInstallation(input: RegisterPushDeviceInput, requestRateKey: string) {
  await enforceRateLimit("register", input.installationId, input.expoPushToken, requestRateKey);
  const { data, error } = await registerDevice(
    createAdminClient(),
    input,
  );
  if (error || !data) throw new Error("Registration failed");
}

export async function updatePushPreferences(
  installationId: string,
  token: string,
  preferences: PushPreferences,
  requestRateKey: string,
) {
  await enforceRateLimit("preferences", installationId, token, requestRateKey);
  const { data, error } = await updatePreferences(
    createAdminClient(), installationId, hashPushSecret(token), preferences,
  );
  if (error) throw new Error("Preferences failed");
  if (!data) throw new PushOwnershipError("Preuve de possession invalide.");
}

export async function unregisterPushInstallation(
  installationId: string,
  token: string,
  requestRateKey: string,
) {
  await enforceRateLimit("unregister", installationId, token, requestRateKey);
  const { data, error } = await unregisterDevice(
    createAdminClient(), installationId, hashPushSecret(token),
  );
  if (error) throw new Error("Unregister failed");
  if (!data) throw new PushOwnershipError("Preuve de possession invalide.");
}

type DeviceRow = {
  id: string; token_last_four: string | null; platform: "ios" | "android";
  app_version: string | null; device_name: string | null; locale: string | null;
  timezone: string | null; notifications_enabled: boolean; notify_new_videos: boolean;
  notify_live_starts: boolean; notify_followed_emissions: boolean;
  followed_emission_slugs: string[]; is_active: boolean; last_seen_at: string;
  last_registered_at: string; disabled_reason: string | null; last_delivery_error: string | null;
};

export async function getPushAdminDashboard(): Promise<{ devices: PushDeviceAdmin[]; deliveries: PushDeliveryAdmin[]; stats: PushAdminStats }> {
  const supabase = createAdminClient();
  const [devicesResult, deliveriesResult] = await Promise.all([
    selectDevicesAdmin(supabase),
    selectRecentDeliveries(supabase),
  ]);
  if (devicesResult.error || deliveriesResult.error) throw new Error("Impossible de charger les appareils.");
  const data = devicesResult.data;
  const rows = (Array.isArray(data) ? data : []) as DeviceRow[];
  const devices = rows.map((row) => ({
    id: row.id,
    tokenLastFour: row.token_last_four,
    platform: row.platform,
    appVersion: row.app_version,
    deviceName: row.device_name,
    locale: row.locale,
    timezone: row.timezone,
    preferences: {
      notificationsEnabled: row.notifications_enabled,
      notifyNewVideos: row.notify_new_videos,
      notifyLiveStarts: row.notify_live_starts,
      notifyFollowedEmissions: row.notify_followed_emissions,
      followedEmissionSlugs: row.followed_emission_slugs,
    },
    isActive: row.is_active,
    lastSeenAt: row.last_seen_at,
    lastRegisteredAt: row.last_registered_at,
    disabledReason: row.disabled_reason,
    lastDeliveryError: row.last_delivery_error,
  }));
  const stats: PushAdminStats = {
    total: devices.length,
    active: devices.filter((device) => device.isActive).length,
    disabled: devices.filter((device) => !device.isActive).length,
    ios: devices.filter((device) => device.platform === "ios").length,
    android: devices.filter((device) => device.platform === "android").length,
    notificationsEnabled: devices.filter((device) => device.preferences.notificationsEnabled).length,
    lastRegistration: devices.reduce<string | null>(
      (latest, device) =>
        !latest || device.lastRegisteredAt > latest ? device.lastRegisteredAt : latest,
      null,
    ),
    lastDeliveryError: devices.find((device) => device.lastDeliveryError)?.lastDeliveryError ?? null,
  };
  const deliveries = (Array.isArray(deliveriesResult.data) ? deliveriesResult.data : []).map((row) => ({
    id: row.id,
    tokenLastFour: row.token_last_four,
    ticketStatus: row.ticket_status,
    ticketErrorCode: row.ticket_error_code,
    receiptStatus: row.receipt_status,
    receiptErrorCode: row.receipt_error_code,
    createdAt: row.created_at,
  }));
  return { devices, deliveries, stats };
}

export async function sendManualTest(
  input: { deviceId: string; requestKey: string; title: string; body: string; destination: PushNavigationData },
  requestedBy: string,
  expo: ExpoClient = createExpoClient(),
) {
  const supabase = createAdminClient();
  const { data: existing } = await selectBatchByRequestKey(supabase, input.requestKey);
  if (existing) return { duplicate: true, status: existing.status };

  const { data: device, error: deviceError } = await selectActiveDeviceForSend(supabase, input.deviceId);
  if (deviceError || !device || !device.expo_push_token || !Expo.isExpoPushToken(device.expo_push_token)) {
    throw new Error("Appareil actif introuvable.");
  }
  if (!isDeviceEligible(device, input.destination)) {
    throw new Error("Les préférences de cet appareil interdisent cet envoi.");
  }
  if (input.destination.type === "emission") {
    const { data: program, error: programError } = await selectActiveProgramBySlug(
      supabase,
      input.destination.emissionSlug!,
    );
    if (programError || !program) throw new Error("Émission inconnue.");
  }

  const { data: batch, error: batchError } = await insertBatch(supabase, {
    requestKey: input.requestKey, title: input.title, body: input.body,
    data: input.destination, requestedBy,
  });
  if (batchError) {
    if (batchError.code === "23505") return { duplicate: true, status: "existing" };
    throw new Error("Impossible de créer le lot.");
  }
  const { data: delivery, error: deliveryError } = await insertDelivery(
    supabase, batch.id, device.id, device.token_last_four,
  );
  if (deliveryError) throw new Error("Impossible de créer la livraison.");

  const message = {
    to: device.expo_push_token,
    title: input.title,
    body: input.body,
    data: input.destination,
    sound: "default" as const,
    channelId: "bichridigital-general",
  };
  try {
    const chunks = expo.chunkPushNotifications([message]);
    const tickets = await withExpoTimeout(expo.sendPushNotificationsAsync(chunks[0]));
    const ticket = ticketState(tickets[0]);
    if (ticket.status === "ok") {
      await updateDeliveryTicket(supabase, delivery.id, ticket);
      await finishBatch(supabase, batch.id, true);
      return { duplicate: false, status: "ok", ticketId: ticket.ticketId };
    }
    await updateDeliveryTicket(supabase, delivery.id, ticket);
    await finishBatch(supabase, batch.id, false, ticket.code);
    if (ticket.disableDevice) {
      await disableDevice(supabase, device.id, ticket.code, ticket.message);
    }
    return { duplicate: false, status: "error", code: ticket.code };
  } catch (error) {
    const code = safePushError(error);
    await updateDeliveryTicket(supabase, delivery.id, { status: "error", code, message: "Erreur temporaire Expo" });
    await finishBatch(supabase, batch.id, false, code);
    throw new Error("Expo temporairement indisponible.");
  }
}

export async function checkPendingReceipts(expo: ExpoClient = createExpoClient()) {
  const supabase = createAdminClient();
  const cutoff = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  const { data, error } = await selectPendingReceipts(supabase, cutoff);
  if (error) throw new Error("Impossible de charger les reçus en attente.");
  const rows = (Array.isArray(data) ? data : []).filter((row) => row.expo_ticket_id);
  const byTicket = new Map(rows.map((row) => [row.expo_ticket_id as string, row]));
  let checked = 0;
  for (const chunk of expo.chunkPushNotificationReceiptIds([...byTicket.keys()])) {
    const receipts = await withExpoTimeout(expo.getPushNotificationReceiptsAsync(chunk));
    for (const [ticketId, receipt] of Object.entries(receipts)) {
      const row = byTicket.get(ticketId);
      if (!row) continue;
      const state = receiptState(receipt);
      await updateDeliveryReceipt(supabase, row.id, state);
      if (state.status === "error" && state.disableDevice && row.device_id) {
        await disableDevice(supabase, row.device_id, state.code, state.message);
      }
      checked += 1;
    }
  }
  return checked;
}

type LiveDeviceRow = {
  id: string;
  expo_push_token: string | null;
  token_last_four: string | null;
};

async function sendLiveStartBatch(
  batchId: string,
  notification: LiveStartNotification,
  expo: ExpoClient,
) {
  const supabase = createAdminClient();
  const { data, error } = await selectLiveStartDevices(supabase);
  if (error) throw new Error("Impossible de charger l’audience du direct.");

  const devices = ((Array.isArray(data) ? data : []) as LiveDeviceRow[]).filter(
    (device): device is LiveDeviceRow & { expo_push_token: string } =>
      hasPushToken(device.expo_push_token) && Expo.isExpoPushToken(device.expo_push_token),
  );
  let accepted = 0;
  let failed = 0;

  const entries = [];
  for (const device of devices) {
    const { data: delivery, error: deliveryError } = await insertDelivery(
      supabase,
      batchId,
      device.id,
      device.token_last_four,
    );
    if (deliveryError || !delivery) {
      failed += 1;
      continue;
    }
    entries.push({
      device,
      deliveryId: delivery.id,
      message: {
        to: device.expo_push_token,
        title: notification.title,
        body: notification.body,
        data: notification.data,
        sound: "default" as const,
        channelId: "bichridigital-general",
      },
    });
  }

  for (const chunk of expo.chunkPushNotifications(entries.map((entry) => entry.message))) {
    const chunkEntries = entries.splice(0, chunk.length);
    try {
      const tickets = await withExpoTimeout(expo.sendPushNotificationsAsync(chunk));
      for (let index = 0; index < chunkEntries.length; index += 1) {
        const entry = chunkEntries[index];
        const state = ticketState(tickets[index]);
        await updateDeliveryTicket(supabase, entry.deliveryId, state);
        if (state.status === "ok") accepted += 1;
        else {
          failed += 1;
          if (state.disableDevice) {
            await disableDevice(supabase, entry.device.id, state.code, state.message);
          }
        }
      }
    } catch (sendError) {
      const code = safePushError(sendError);
      for (const entry of chunkEntries) {
        await updateDeliveryTicket(supabase, entry.deliveryId, {
          status: "error",
          code,
          message: "Erreur temporaire Expo",
        });
        failed += 1;
      }
    }
  }

  const counts = { requested: devices.length, accepted, failed };
  const { error: finishError } = await finishLiveStartBatch(
    supabase,
    batchId,
    counts,
    failed ? "Une ou plusieurs livraisons ont échoué." : undefined,
  );
  if (finishError) throw new Error("Impossible de finaliser le lot du direct.");
  return counts;
}

export async function checkLiveStartAutomation(
  expo: ExpoClient = createExpoClient(),
) {
  return runLiveStartCheck({
    enabled: process.env.PUSH_LIVE_AUTOMATION_ENABLED === "true",
    getLiveBroadcast,
    async claim(notification) {
      const { data, error } = await claimLiveStartBatch(createAdminClient(), notification);
      if (error?.code === "23505") return null;
      if (error || !data) throw new Error("Impossible de réserver le lot du direct.");
      return data.id as string;
    },
    send: (batchId, notification) => sendLiveStartBatch(batchId, notification, expo),
  });
}

async function sendVideoPublishedBatch(
  batchId: string,
  notification: VideoPublishedNotification,
  expo: ExpoClient,
) {
  const supabase = createAdminClient();
  const { data, error } = await selectVideoPublishedDevices(supabase);
  if (error) throw new Error("Impossible de charger l’audience des vidéos.");

  const devices = ((Array.isArray(data) ? data : []) as LiveDeviceRow[]).filter(
    (device): device is LiveDeviceRow & { expo_push_token: string } =>
      hasPushToken(device.expo_push_token) && Expo.isExpoPushToken(device.expo_push_token),
  );
  let accepted = 0;
  let failed = 0;
  const entries = [];

  for (const device of devices) {
    const { data: delivery, error: deliveryError } = await insertDelivery(
      supabase,
      batchId,
      device.id,
      device.token_last_four,
    );
    if (deliveryError || !delivery) {
      failed += 1;
      continue;
    }
    entries.push({
      device,
      deliveryId: delivery.id,
      message: {
        to: device.expo_push_token,
        title: notification.title,
        body: notification.body,
        data: notification.data,
        sound: "default" as const,
        channelId: "bichridigital-general",
      },
    });
  }

  for (const chunk of expo.chunkPushNotifications(entries.map((entry) => entry.message))) {
    const chunkEntries = entries.splice(0, chunk.length);
    try {
      const tickets = await withExpoTimeout(expo.sendPushNotificationsAsync(chunk));
      for (let index = 0; index < chunkEntries.length; index += 1) {
        const entry = chunkEntries[index];
        const state = ticketState(tickets[index]);
        await updateDeliveryTicket(supabase, entry.deliveryId, state);
        if (state.status === "ok") accepted += 1;
        else {
          failed += 1;
          if (state.disableDevice) {
            await disableDevice(supabase, entry.device.id, state.code, state.message);
          }
        }
      }
    } catch (sendError) {
      const code = safePushError(sendError);
      for (const entry of chunkEntries) {
        await updateDeliveryTicket(supabase, entry.deliveryId, {
          status: "error",
          code,
          message: "Erreur temporaire Expo",
        });
        failed += 1;
      }
    }
  }

  const counts = { requested: devices.length, accepted, failed };
  const { error: finishError } = await finishVideoPublishedBatch(
    supabase,
    batchId,
    counts,
    failed ? "Une ou plusieurs livraisons ont échoué." : undefined,
  );
  if (finishError) throw new Error("Impossible de finaliser le lot vidéo.");
  return counts;
}

export async function checkVideoPublishedAutomation(
  expo: ExpoClient = createExpoClient(),
) {
  return runVideoPublishedCheck({
    enabled: process.env.PUSH_VIDEO_AUTOMATION_ENABLED === "true",
    getRecentUploads: () => getRecentPublicVideoUploads(10),
    async getState() {
      const { data, error } = await selectVideoAutomationState(createAdminClient());
      if (error) throw new Error("Impossible de charger l’état vidéo.");
      return data
        ? {
            lastSeenVideoId: data.last_seen_video_id,
            lastSeenPublishedAt: data.last_seen_published_at,
          }
        : null;
    },
    async advanceState(video) {
      const { error } = await advanceVideoAutomationState(
        createAdminClient(),
        video.id,
        video.publishedAt,
      );
      if (error) throw new Error("Impossible d’avancer l’état vidéo.");
    },
    async claim(notification) {
      const { data, error } = await claimVideoPublishedBatch(
        createAdminClient(),
        notification,
      );
      if (error?.code === "23505") return null;
      if (error || !data) throw new Error("Impossible de réserver le lot vidéo.");
      return data.id as string;
    },
    send: (batchId, notification) =>
      sendVideoPublishedBatch(batchId, notification, expo),
  });
}

export async function disablePushDeviceManually(deviceId: string) {
  const { error } = await disableDevice(createAdminClient(), deviceId, "admin_disabled");
  if (error) throw new Error("Impossible de désactiver l’appareil.");
}
