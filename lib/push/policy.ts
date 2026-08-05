import type { PushNavigationData } from "../../types/push";

export type PushEligibilityDevice = {
  is_active: boolean;
  notifications_enabled: boolean;
  notify_new_videos: boolean;
  notify_live_starts: boolean;
  notify_followed_emissions: boolean;
};

export function isDeviceEligible(
  device: PushEligibilityDevice,
  destination: PushNavigationData,
) {
  if (!device.is_active || !device.notifications_enabled) return false;
  if (destination.type === "video") return device.notify_new_videos;
  if (destination.type === "live") return device.notify_live_starts;
  if (destination.type === "emission") return device.notify_followed_emissions;
  return true;
}

export function shouldDisableDevice(errorCode: string | undefined) {
  return errorCode === "DeviceNotRegistered";
}
