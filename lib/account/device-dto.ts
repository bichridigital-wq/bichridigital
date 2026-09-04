import type { AccountDevice } from "../../types/account";

export function accountDeviceDto(row: Record<string, unknown>): AccountDevice {
  return {
    deviceId: String(row.id),
    platform: row.platform === "ios" ? "ios" : "android",
    deviceName: typeof row.device_name === "string" ? row.device_name : null,
    appVersion: typeof row.app_version === "string" ? row.app_version : null,
    lastSeenAt: String(row.last_seen_at),
    active: row.is_active === true,
  };
}
