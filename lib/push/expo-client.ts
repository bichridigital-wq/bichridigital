import "server-only";

import { Expo } from "expo-server-sdk";

export type ExpoClient = Pick<
  Expo,
  | "chunkPushNotifications"
  | "sendPushNotificationsAsync"
  | "chunkPushNotificationReceiptIds"
  | "getPushNotificationReceiptsAsync"
>;

export function createExpoClient(): ExpoClient {
  const accessToken = process.env.EXPO_ACCESS_TOKEN;
  return new Expo(accessToken ? { accessToken } : undefined);
}

export async function withExpoTimeout<T>(operation: Promise<T>, timeoutMs = 15_000) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      operation,
      new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error("ExpoTimeout")), timeoutMs);
      }),
    ]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}
