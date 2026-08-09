import { Expo } from "expo-server-sdk";
import type {
  PushNavigationData,
  PushOwnershipInput,
  PushProgramSubscriptionInput,
  PushPreferences,
  RegisterPushDeviceInput,
} from "../../types/push";

export const PUSH_BODY_MAX_BYTES = 16 * 1024;
export const PUSH_MESSAGE_MAX_BYTES = 4096;
const LEGACY_INSTALLATION_PATTERN = /^install_[a-z0-9]+_[a-z0-9]{8,160}$/;
const UUID_V4_INSTALLATION_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const YOUTUBE_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

export class PushValidationError extends Error {}

function record(value: unknown, label = "payload"): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new PushValidationError(`${label} doit être un objet JSON.`);
  }
  return value as Record<string, unknown>;
}

function exactKeys(value: Record<string, unknown>, allowed: string[]) {
  const unknown = Object.keys(value).filter((key) => !allowed.includes(key));
  if (unknown.length) throw new PushValidationError(`Champ inconnu : ${unknown[0]}.`);
}

function requiredString(value: unknown, label: string, max: number) {
  if (typeof value !== "string" || !value.trim() || value.trim().length > max) {
    throw new PushValidationError(`${label} est invalide.`);
  }
  return value.trim();
}

function nullableString(value: unknown, label: string, max: number) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string" || value.trim().length > max) {
    throw new PushValidationError(`${label} est invalide.`);
  }
  return value.trim() || null;
}

function bool(value: unknown, label: string) {
  if (typeof value !== "boolean") throw new PushValidationError(`${label} doit être booléen.`);
  return value;
}

export function isLegacyInstallationId(value: string) {
  return LEGACY_INSTALLATION_PATTERN.test(value);
}

export function isUuidV4InstallationId(value: string) {
  return UUID_V4_INSTALLATION_PATTERN.test(value);
}

export function isSupportedInstallationId(value: string) {
  return value.length <= 220 && (
    isLegacyInstallationId(value) || isUuidV4InstallationId(value)
  );
}

function installationId(value: unknown) {
  if (typeof value !== "string" || !isSupportedInstallationId(value)) {
    throw new PushValidationError("installationId est invalide.");
  }
  return value;
}

function expoToken(value: unknown) {
  const token = requiredString(value, "expoPushToken", 255);
  if (!Expo.isExpoPushToken(token)) {
    throw new PushValidationError("ExpoPushToken invalide.");
  }
  return token;
}

function normalizeSlugs(value: unknown): string[] {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > 100) {
    throw new PushValidationError("Liste d’émissions invalide.");
  }
  const normalized = value.map((item) => requiredString(item, "Slug", 140).toLowerCase());
  if (normalized.some((slug) => !SLUG_PATTERN.test(slug))) {
    throw new PushValidationError("Un slug d’émission est invalide.");
  }
  return [...new Set(normalized)];
}

function preferences(value: unknown): PushPreferences {
  const input = record(value, "preferences");
  exactKeys(input, [
    "notificationsEnabled",
    "notifyNewVideos",
    "notifyLiveStarts",
    "notifyFollowedEmissions",
    "followedEmissionSlugs",
  ]);
  return {
    notificationsEnabled: bool(input.notificationsEnabled, "notificationsEnabled"),
    notifyNewVideos: bool(input.notifyNewVideos, "notifyNewVideos"),
    notifyLiveStarts: bool(input.notifyLiveStarts, "notifyLiveStarts"),
    notifyFollowedEmissions: bool(input.notifyFollowedEmissions, "notifyFollowedEmissions"),
    followedEmissionSlugs: normalizeSlugs(input.followedEmissionSlugs),
  };
}

function timezone(value: unknown) {
  const normalized = nullableString(value, "timezone", 100);
  if (!normalized) return null;
  try {
    new Intl.DateTimeFormat("fr", { timeZone: normalized }).format();
    return normalized;
  } catch {
    throw new PushValidationError("timezone IANA invalide.");
  }
}

export function validateRegistration(value: unknown): RegisterPushDeviceInput {
  const input = record(value);
  exactKeys(input, ["installationId", "expoPushToken", "platform", "runtimeEnvironment", "appVersion", "device", "preferences", "locale", "timezone"]);
  if (input.platform !== "ios" && input.platform !== "android") {
    throw new PushValidationError("Plateforme invalide.");
  }
  if (input.runtimeEnvironment !== "development-build" && input.runtimeEnvironment !== "production") {
    throw new PushValidationError("Environnement d’exécution invalide.");
  }
  const device = record(input.device, "device");
  exactKeys(device, ["brand", "modelName", "osName", "osVersion"]);
  const brand = nullableString(device.brand, "device.brand", 80);
  const model = nullableString(device.modelName, "device.modelName", 80);
  nullableString(device.osName, "device.osName", 40);
  nullableString(device.osVersion, "device.osVersion", 40);
  return {
    installationId: installationId(input.installationId),
    expoPushToken: expoToken(input.expoPushToken),
    platform: input.platform,
    runtimeEnvironment: input.runtimeEnvironment,
    appVersion: nullableString(input.appVersion, "appVersion", 40),
    deviceName: [brand, model].filter(Boolean).join(" ").slice(0, 160) || null,
    locale: nullableString(input.locale, "locale", 35),
    timezone: timezone(input.timezone),
    preferences: preferences(input.preferences),
  };
}

export function validateOwnership(value: unknown): PushOwnershipInput {
  const input = record(value);
  exactKeys(input, ["installationId", "expoPushToken"]);
  return {
    installationId: installationId(input.installationId),
    expoPushToken: expoToken(input.expoPushToken),
  };
}

export function validateProgramSubscription(
  value: unknown,
): PushProgramSubscriptionInput {
  const input = record(value);
  exactKeys(input, ["installationId", "expoPushToken", "programId"]);
  const programId = requiredString(input.programId, "programId", 36);
  if (!UUID_PATTERN.test(programId)) {
    throw new PushValidationError("programId est invalide.");
  }
  return {
    installationId: installationId(input.installationId),
    expoPushToken: expoToken(input.expoPushToken),
    programId,
  };
}

export function validatePreferenceUpdate(value: unknown) {
  const input = record(value);
  exactKeys(input, ["installationId", "expoPushToken", "preferences"]);
  return {
    installationId: installationId(input.installationId),
    expoPushToken: expoToken(input.expoPushToken),
    preferences: preferences(input.preferences),
  };
}

export function validateNavigation(value: unknown): PushNavigationData {
  const input = record(value, "destination");
  exactKeys(input, ["type", "emissionSlug", "videoId"]);
  if (!["profile", "live", "emission", "video"].includes(String(input.type))) {
    throw new PushValidationError("Destination invalide.");
  }
  const type = input.type as PushNavigationData["type"];
  const emissionSlug = nullableString(input.emissionSlug, "emissionSlug", 140) ?? undefined;
  const videoId = nullableString(input.videoId, "videoId", 11) ?? undefined;
  if (type === "emission" && (!emissionSlug || !SLUG_PATTERN.test(emissionSlug))) {
    throw new PushValidationError("Une émission valide est obligatoire.");
  }
  if (type === "video" && (!videoId || !YOUTUBE_ID_PATTERN.test(videoId))) {
    throw new PushValidationError("Un identifiant vidéo valide est obligatoire.");
  }
  if (type !== "emission" && emissionSlug) throw new PushValidationError("emissionSlug n’est pas autorisé.");
  if (type !== "video" && videoId) throw new PushValidationError("videoId n’est pas autorisé.");
  return { type, ...(emissionSlug ? { emissionSlug } : {}), ...(videoId ? { videoId } : {}) };
}

export function validateTestMessage(value: unknown) {
  const input = record(value);
  exactKeys(input, ["deviceId", "requestKey", "title", "body", "destination"]);
  const deviceId = requiredString(input.deviceId, "deviceId", 36);
  const requestKey = requiredString(input.requestKey, "requestKey", 36);
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(deviceId) ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestKey)) {
    throw new PushValidationError("Identifiant invalide.");
  }
  const title = requiredString(input.title, "Titre", 100);
  const body = requiredString(input.body, "Message", 500);
  const destination = validateNavigation(input.destination);
  if (Buffer.byteLength(JSON.stringify({ title, body, data: destination }), "utf8") > PUSH_MESSAGE_MAX_BYTES) {
    throw new PushValidationError("Notification trop volumineuse.");
  }
  return { deviceId, requestKey, title, body, destination };
}
