import { Expo } from "expo-server-sdk";
import type { LinkDeviceInput, ReconcileProgramSubscriptionsInput, UpdateAccountProfileInput } from "../../types/account";
import { AccountError } from "./errors";
import { hasCompleteDeviceProof, normalizeLocalProgramIds } from "./reconcile-input";

export const ACCOUNT_BODY_MAX_BYTES = 16 * 1024;
export const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const LEGACY_INSTALLATION_PATTERN = /^install_[a-z0-9]+_[a-z0-9]{8,160}$/;
const UUID_V4_INSTALLATION_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

function isSupportedInstallationId(value: string) {
  return value.length <= 220 && (
    LEGACY_INSTALLATION_PATTERN.test(value) || UUID_V4_INSTALLATION_PATTERN.test(value)
  );
}

function object(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new AccountError(422, "invalid_request", "Requête invalide.");
  }
  return value as Record<string, unknown>;
}

function exactKeys(value: Record<string, unknown>, allowed: string[]) {
  if (Object.keys(value).some((key) => !allowed.includes(key))) {
    throw new AccountError(422, "invalid_request", "Requête invalide.");
  }
}

export async function readAccountJson(request: Request) {
  if (request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase() !== "application/json") {
    throw new AccountError(415, "invalid_request", "Content-Type application/json requis.");
  }
  const text = await request.text();
  if (Buffer.byteLength(text, "utf8") > ACCOUNT_BODY_MAX_BYTES) {
    throw new AccountError(413, "invalid_request", "Requête trop volumineuse.");
  }
  try { return JSON.parse(text) as unknown; }
  catch { throw new AccountError(422, "invalid_request", "JSON invalide."); }
}

export function validateProfileUpdate(value: unknown): UpdateAccountProfileInput {
  const input = object(value);
  exactKeys(input, ["displayName", "avatarUrl"]);
  if (!Object.keys(input).length) throw new AccountError(422, "invalid_profile", "Profil invalide.");
  const output: UpdateAccountProfileInput = {};
  if ("displayName" in input) {
    if (typeof input.displayName !== "string") throw new AccountError(422, "invalid_profile", "Nom invalide.");
    const displayName = input.displayName.trim();
    if (displayName.length < 2 || displayName.length > 80) throw new AccountError(422, "invalid_profile", "Nom invalide.");
    output.displayName = displayName;
  }
  if ("avatarUrl" in input) {
    if (input.avatarUrl === null || input.avatarUrl === "") output.avatarUrl = null;
    else {
      if (typeof input.avatarUrl !== "string" || input.avatarUrl.length > 2048) throw new AccountError(422, "invalid_profile", "Avatar invalide.");
      try {
        const url = new URL(input.avatarUrl);
        if (url.protocol !== "https:" || url.username || url.password) throw new Error();
        output.avatarUrl = url.toString();
      } catch { throw new AccountError(422, "invalid_profile", "Avatar invalide."); }
    }
  }
  return output;
}

export function validateDeviceProof(value: unknown): LinkDeviceInput {
  const input = object(value);
  exactKeys(input, ["installationId", "expoPushToken"]);
  if (typeof input.installationId !== "string" || !isSupportedInstallationId(input.installationId)) {
    throw new AccountError(422, "invalid_request", "Appareil invalide.");
  }
  if (typeof input.expoPushToken !== "string" || !Expo.isExpoPushToken(input.expoPushToken)) {
    throw new AccountError(422, "invalid_request", "Appareil invalide.");
  }
  return { installationId: input.installationId, expoPushToken: input.expoPushToken };
}

export function validateProgramId(value: string) {
  if (!UUID_PATTERN.test(value)) throw new AccountError(422, "invalid_request", "Programme invalide.");
  return value;
}

export function validateReconcileInput(value: unknown): ReconcileProgramSubscriptionsInput {
  const input = object(value);
  exactKeys(input, ["installationId", "expoPushToken", "localProgramIds"]);
  let localProgramIds: string[];
  try {
    localProgramIds = normalizeLocalProgramIds(input.localProgramIds);
  } catch {
    throw new AccountError(422, "invalid_request", "Programmes invalides.");
  }
  let hasProof: boolean;
  try {
    hasProof = hasCompleteDeviceProof(input);
  } catch {
    throw new AccountError(422, "invalid_request", "Preuve appareil incomplète.");
  }
  if (!hasProof) return { localProgramIds };
  const proof = validateDeviceProof({
    installationId: input.installationId,
    expoPushToken: input.expoPushToken,
  });
  return { ...proof, localProgramIds };
}
