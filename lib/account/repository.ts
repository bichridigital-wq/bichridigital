import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { UpdateAccountProfileInput } from "../../types/account";

const TIMEOUT_MS = 10_000;
const PROFILE_SELECT = "display_name,avatar_url,created_at,updated_at";
const ACCOUNT_DEVICE_SELECT = "id,platform,device_name,app_version,last_seen_at,is_active";

export function createProfileIfMissing(supabase: SupabaseClient, userId: string, displayName: string) {
  return supabase.from("profiles").upsert(
    { user_id: userId, display_name: displayName },
    { onConflict: "user_id", ignoreDuplicates: true },
  ).abortSignal(AbortSignal.timeout(TIMEOUT_MS));
}

export function selectProfile(supabase: SupabaseClient, userId: string) {
  return supabase.from("profiles").select(PROFILE_SELECT).eq("user_id", userId)
    .abortSignal(AbortSignal.timeout(TIMEOUT_MS)).single();
}

export function updateProfile(supabase: SupabaseClient, userId: string, input: UpdateAccountProfileInput) {
  const row = {
    ...(input.displayName !== undefined ? { display_name: input.displayName } : {}),
    ...(input.avatarUrl !== undefined ? { avatar_url: input.avatarUrl } : {}),
  };
  return supabase.from("profiles").update(row).eq("user_id", userId).select(PROFILE_SELECT)
    .abortSignal(AbortSignal.timeout(TIMEOUT_MS)).single();
}

export function consumeAccountRateLimit(supabase: SupabaseClient, keyHash: string, endpoint: string, limit: number) {
  return supabase.rpc("consume_account_rate_limit", {
    p_key_hash: keyHash, p_endpoint: endpoint, p_limit: limit, p_window_seconds: 900,
  }).abortSignal(AbortSignal.timeout(TIMEOUT_MS));
}

export function selectDeviceByProof(supabase: SupabaseClient, installationId: string, tokenHash: string) {
  return supabase.from("push_devices").select("id,user_id").eq("installation_id", installationId)
    .eq("token_hash", tokenHash).abortSignal(AbortSignal.timeout(TIMEOUT_MS)).maybeSingle();
}

export function attachDevice(supabase: SupabaseClient, deviceId: string, userId: string) {
  return supabase.from("push_devices").update({ user_id: userId }).eq("id", deviceId).is("user_id", null)
    .select("id").abortSignal(AbortSignal.timeout(TIMEOUT_MS)).maybeSingle();
}

export function detachDevice(supabase: SupabaseClient, deviceId: string, userId: string) {
  return supabase.from("push_devices").update({ user_id: null }).eq("id", deviceId).eq("user_id", userId)
    .select("id").abortSignal(AbortSignal.timeout(TIMEOUT_MS)).maybeSingle();
}

export function listAccountDevices(supabase: SupabaseClient, userId: string) {
  return supabase.from("push_devices").select(ACCOUNT_DEVICE_SELECT).eq("user_id", userId)
    .order("last_seen_at", { ascending: false })
    .abortSignal(AbortSignal.timeout(TIMEOUT_MS));
}

export function detachAccountDevice(supabase: SupabaseClient, deviceId: string, userId: string) {
  return supabase.from("push_devices").update({ user_id: null }).eq("id", deviceId).eq("user_id", userId)
    .select("id").abortSignal(AbortSignal.timeout(TIMEOUT_MS)).maybeSingle();
}

export function listUserProgramSubscriptions(supabase: SupabaseClient, userId: string) {
  return supabase.from("user_program_subscriptions").select("program_id,created_at")
    .eq("user_id", userId).order("program_id").limit(100)
    .abortSignal(AbortSignal.timeout(TIMEOUT_MS));
}

export function selectProgram(supabase: SupabaseClient, programId: string) {
  return supabase.from("broadcast_programs").select("id,is_active").eq("id", programId)
    .abortSignal(AbortSignal.timeout(TIMEOUT_MS)).maybeSingle();
}

export function addUserProgramSubscription(supabase: SupabaseClient, userId: string, programId: string) {
  return supabase.from("user_program_subscriptions").upsert(
    { user_id: userId, program_id: programId }, { onConflict: "user_id,program_id", ignoreDuplicates: true },
  ).abortSignal(AbortSignal.timeout(TIMEOUT_MS));
}

export function removeUserProgramSubscription(supabase: SupabaseClient, userId: string, programId: string) {
  return supabase.from("user_program_subscriptions").delete().eq("user_id", userId).eq("program_id", programId)
    .abortSignal(AbortSignal.timeout(TIMEOUT_MS));
}

export function reconcileProgramSubscriptions(
  supabase: SupabaseClient,
  userId: string,
  deviceId: string | null,
  localProgramIds: string[],
) {
  return supabase.rpc("reconcile_user_program_subscriptions", {
    p_user_id: userId,
    p_push_device_id: deviceId,
    p_local_program_ids: localProgramIds,
  }).abortSignal(AbortSignal.timeout(TIMEOUT_MS));
}

export function followAccountProgram(supabase: SupabaseClient, userId: string, programId: string) {
  return supabase.rpc("follow_user_program_subscription", {
    p_user_id: userId, p_program_id: programId, p_limit: 100,
  }).abortSignal(AbortSignal.timeout(TIMEOUT_MS));
}

export function unfollowAccountProgram(supabase: SupabaseClient, userId: string, programId: string) {
  return supabase.rpc("unfollow_user_program_subscription", {
    p_user_id: userId, p_program_id: programId,
  }).abortSignal(AbortSignal.timeout(TIMEOUT_MS));
}
