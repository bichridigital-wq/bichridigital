import "server-only";

import { createHash } from "node:crypto";
import type { User } from "@supabase/supabase-js";
import { createAdminClient } from "../supabase/admin";
import { hashPushSecret } from "../push/security";
import type { LinkDeviceInput, UpdateAccountProfileInput } from "../../types/account";
import { AccountError } from "./errors";
import * as repository from "./repository";

export type AccountRateEndpoint =
  | "me_get" | "me_update" | "account_link_device" | "account_unlink_device"
  | "me_program_subscriptions_list" | "me_program_subscriptions_follow"
  | "me_program_subscriptions_unfollow";

function safeDisplayName(user: User) {
  const localPart = user.email?.split("@", 1)[0].replace(/[._-]+/g, " ").trim() ?? "";
  return localPart.length >= 2 && localPart.length <= 80 ? localPart : "Utilisateur";
}

function profileDto(row: Record<string, unknown>) {
  return {
    displayName: String(row.display_name),
    avatarUrl: typeof row.avatar_url === "string" ? row.avatar_url : null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export async function enforceAccountRateLimit(userId: string, endpoint: AccountRateEndpoint) {
  const key = createHash("sha256").update(`account:${userId}`).digest("hex");
  const limits: Record<AccountRateEndpoint, number> = {
    me_get: 120, me_update: 30, account_link_device: 20, account_unlink_device: 20,
    me_program_subscriptions_list: 120, me_program_subscriptions_follow: 60,
    me_program_subscriptions_unfollow: 60,
  };
  const { data, error } = await repository.consumeAccountRateLimit(createAdminClient(), key, endpoint, limits[endpoint]);
  if (error) throw new AccountError(500, "internal_error", "Service temporairement indisponible.");
  if (!data) throw new AccountError(429, "rate_limited", "Trop de requêtes.");
}

export async function getMe(user: User) {
  const supabase = createAdminClient();
  const created = await repository.createProfileIfMissing(supabase, user.id, safeDisplayName(user));
  if (created.error) throw new AccountError(500, "internal_error", "Profil indisponible.");
  const { data, error } = await repository.selectProfile(supabase, user.id);
  if (error || !data) throw new AccountError(500, "internal_error", "Profil indisponible.");
  return { user: { id: user.id, email: user.email ?? null }, profile: profileDto(data) };
}

export async function patchMe(user: User, input: UpdateAccountProfileInput) {
  await getMe(user);
  const { data, error } = await repository.updateProfile(createAdminClient(), user.id, input);
  if (error || !data) throw new AccountError(500, "internal_error", "Profil indisponible.");
  return profileDto(data);
}

async function ownedDevice(input: LinkDeviceInput) {
  const { data, error } = await repository.selectDeviceByProof(
    createAdminClient(), input.installationId, hashPushSecret(input.expoPushToken),
  );
  if (error) throw new AccountError(500, "internal_error", "Service temporairement indisponible.");
  if (!data) throw new AccountError(404, "device_not_found", "Appareil non reconnu.");
  return data as { id: string; user_id: string | null };
}

export async function linkDevice(userId: string, input: LinkDeviceInput) {
  const device = await ownedDevice(input);
  if (device.user_id === userId) return { outcome: "already_linked" as const };
  if (device.user_id) throw new AccountError(409, "device_conflict", "Appareil déjà associé.");
  const { data, error } = await repository.attachDevice(createAdminClient(), device.id, userId);
  if (error) throw new AccountError(500, "internal_error", "Service temporairement indisponible.");
  if (!data) {
    const current = await ownedDevice(input);
    if (current.user_id === userId) return { outcome: "already_linked" as const };
    throw new AccountError(409, "device_conflict", "Appareil déjà associé.");
  }
  return { outcome: "linked" as const };
}

export async function unlinkDevice(userId: string, input: LinkDeviceInput) {
  const device = await ownedDevice(input);
  if (device.user_id === null) return { outcome: "already_unlinked" as const };
  if (device.user_id !== userId) throw new AccountError(409, "device_conflict", "Appareil associé à un autre compte.");
  const { data, error } = await repository.detachDevice(createAdminClient(), device.id, userId);
  if (error) throw new AccountError(500, "internal_error", "Service temporairement indisponible.");
  if (!data) throw new AccountError(409, "device_conflict", "Appareil associé à un autre compte.");
  return { outcome: "unlinked" as const };
}

export async function getUserProgramSubscriptions(userId: string) {
  const { data, error } = await repository.listUserProgramSubscriptions(createAdminClient(), userId);
  if (error) throw new AccountError(500, "internal_error", "Subscriptions indisponibles.");
  return { programIds: (data ?? []).map((row) => row.program_id as string) };
}

export async function followUserProgram(userId: string, programId: string) {
  const supabase = createAdminClient();
  const { data: program, error: lookupError } = await repository.selectProgram(supabase, programId);
  if (lookupError) throw new AccountError(500, "internal_error", "Service temporairement indisponible.");
  if (!program) throw new AccountError(404, "program_not_found", "Programme introuvable.");
  if (!program.is_active) throw new AccountError(409, "program_inactive", "Programme inactif.");
  const { error } = await repository.addUserProgramSubscription(supabase, userId, programId);
  if (error) throw new AccountError(500, "internal_error", "Subscription indisponible.");
}

export async function unfollowUserProgram(userId: string, programId: string) {
  const { error } = await repository.removeUserProgramSubscription(createAdminClient(), userId, programId);
  if (error) throw new AccountError(500, "internal_error", "Subscription indisponible.");
}
