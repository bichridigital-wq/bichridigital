import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { RegisterPushDeviceInput } from "../../types/push";

const TIMEOUT_MS = 10_000;
const DEVICE_ADMIN_SELECT =
  "id,token_last_four,platform,app_version,device_name,locale,timezone,notifications_enabled,notify_new_videos,notify_live_starts,notify_followed_emissions,followed_emission_slugs,is_active,last_seen_at,last_registered_at,disabled_reason,last_delivery_error";

export function registerDevice(
  supabase: SupabaseClient,
  input: RegisterPushDeviceInput,
) {
  return supabase
    .rpc("register_push_device", {
      p_installation_id: input.installationId,
      p_expo_push_token: input.expoPushToken,
      p_platform: input.platform,
      p_runtime_environment: input.runtimeEnvironment,
      p_app_version: input.appVersion,
      p_device_name: input.deviceName,
      p_locale: input.locale,
      p_timezone: input.timezone,
      p_notifications_enabled: input.preferences.notificationsEnabled,
      p_notify_new_videos: input.preferences.notifyNewVideos,
      p_notify_live_starts: input.preferences.notifyLiveStarts,
      p_notify_followed_emissions: input.preferences.notifyFollowedEmissions,
      p_followed_emission_slugs: input.preferences.followedEmissionSlugs,
    })
    .abortSignal(AbortSignal.timeout(TIMEOUT_MS));
}

export function updatePreferences(
  supabase: SupabaseClient,
  installationId: string,
  tokenHash: string,
  preferences: RegisterPushDeviceInput["preferences"],
) {
  return supabase
    .rpc("update_push_device_preferences", {
      p_installation_id: installationId,
      p_token_hash: tokenHash,
      p_notifications_enabled: preferences.notificationsEnabled,
      p_notify_new_videos: preferences.notifyNewVideos,
      p_notify_live_starts: preferences.notifyLiveStarts,
      p_notify_followed_emissions: preferences.notifyFollowedEmissions,
      p_followed_emission_slugs: preferences.followedEmissionSlugs,
    })
    .abortSignal(AbortSignal.timeout(TIMEOUT_MS));
}

export function unregisterDevice(
  supabase: SupabaseClient,
  installationId: string,
  tokenHash: string,
) {
  return supabase
    .rpc("unregister_push_device", {
      p_installation_id: installationId,
      p_token_hash: tokenHash,
    })
    .abortSignal(AbortSignal.timeout(TIMEOUT_MS));
}

export function consumeRateLimit(
  supabase: SupabaseClient,
  keyHash: string,
  endpoint:
    | "register"
    | "preferences"
    | "unregister"
    | "program_subscriptions_list"
    | "program_subscriptions_follow"
    | "program_subscriptions_unfollow",
  limit: number,
) {
  return supabase
    .rpc("consume_push_rate_limit", {
      p_key_hash: keyHash,
      p_endpoint: endpoint,
      p_limit: limit,
      p_window_seconds: 900,
    })
    .abortSignal(AbortSignal.timeout(TIMEOUT_MS));
}

export function selectOwnedPushDevice(
  supabase: SupabaseClient,
  installationId: string,
  tokenHash: string,
) {
  return supabase
    .from("push_devices")
    .select("id")
    .eq("installation_id", installationId)
    .eq("token_hash", tokenHash)
    .eq("is_active", true)
    .abortSignal(AbortSignal.timeout(TIMEOUT_MS))
    .maybeSingle();
}

export function selectProgramSubscriptions(
  supabase: SupabaseClient,
  deviceId: string,
) {
  return supabase
    .from("push_device_program_subscriptions")
    .select("program_id")
    .eq("push_device_id", deviceId)
    .order("program_id")
    .limit(100)
    .abortSignal(AbortSignal.timeout(TIMEOUT_MS));
}

export function followProgram(
  supabase: SupabaseClient,
  installationId: string,
  tokenHash: string,
  programId: string,
) {
  return supabase.rpc("follow_push_device_program", {
    p_installation_id: installationId,
    p_token_hash: tokenHash,
    p_program_id: programId,
    p_limit: 100,
  });
}

export function unfollowProgram(
  supabase: SupabaseClient,
  installationId: string,
  tokenHash: string,
  programId: string,
) {
  return supabase.rpc("unfollow_push_device_program", {
    p_installation_id: installationId,
    p_token_hash: tokenHash,
    p_program_id: programId,
  });
}

export function selectDevicesAdmin(supabase: SupabaseClient) {
  return supabase
    .from("push_devices")
    .select(DEVICE_ADMIN_SELECT)
    .order("last_seen_at", { ascending: false })
    .limit(200)
    .abortSignal(AbortSignal.timeout(TIMEOUT_MS));
}

export function selectRecentDeliveries(supabase: SupabaseClient) {
  return supabase
    .from("push_notification_deliveries")
    .select("id,token_last_four,ticket_status,ticket_error_code,receipt_status,receipt_error_code,created_at")
    .order("created_at", { ascending: false })
    .limit(20)
    .abortSignal(AbortSignal.timeout(TIMEOUT_MS));
}

export function selectActiveDeviceForSend(supabase: SupabaseClient, id: string) {
  return supabase
    .from("push_devices")
    .select("id,expo_push_token,token_last_four,platform,notifications_enabled,notify_new_videos,notify_live_starts,notify_followed_emissions,is_active")
    .eq("id", id)
    .abortSignal(AbortSignal.timeout(TIMEOUT_MS))
    .maybeSingle();
}

export function selectActiveProgramBySlug(supabase: SupabaseClient, slug: string) {
  return supabase
    .from("broadcast_programs")
    .select("id")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
}

export function insertBatch(
  supabase: SupabaseClient,
  input: { requestKey: string; title: string; body: string; data: object; requestedBy: string },
) {
  return supabase
    .from("push_notification_batches")
    .insert({
      request_key: input.requestKey,
      notification_type: "manual_test",
      title: input.title,
      body: input.body,
      data: input.data,
      audience_type: "single_device",
      requested_by: input.requestedBy,
      status: "sending",
      requested_count: 1,
      started_at: new Date().toISOString(),
    })
    .select("id")
    .single();
}

export function claimLiveStartBatch(
  supabase: SupabaseClient,
  input: { requestKey: string; title: string; body: string; data: object },
) {
  return supabase
    .from("push_notification_batches")
    .insert({
      request_key: input.requestKey,
      notification_type: "live_start",
      title: input.title,
      body: input.body,
      data: input.data,
      audience_type: "live_opt_in",
      status: "sending",
      requested_count: 0,
      started_at: new Date().toISOString(),
    })
    .select("id")
    .single();
}

export function claimVideoPublishedBatch(
  supabase: SupabaseClient,
  input: { requestKey: string; title: string; body: string; data: object },
) {
  return supabase
    .from("push_notification_batches")
    .insert({
      request_key: input.requestKey,
      notification_type: "video_published",
      title: input.title,
      body: input.body,
      data: input.data,
      audience_type: "video_opt_in",
      status: "sending",
      requested_count: 0,
      started_at: new Date().toISOString(),
    })
    .select("id")
    .single();
}

export function selectLiveStartDevices(supabase: SupabaseClient) {
  return supabase
    .from("push_devices")
    .select("id,expo_push_token,token_last_four")
    .eq("is_active", true)
    .eq("notifications_enabled", true)
    .eq("notify_live_starts", true)
    .not("expo_push_token", "is", null)
    .abortSignal(AbortSignal.timeout(TIMEOUT_MS));
}

export function selectVideoPublishedDevices(supabase: SupabaseClient) {
  return supabase
    .from("push_devices")
    .select("id,expo_push_token,token_last_four")
    .eq("is_active", true)
    .eq("notifications_enabled", true)
    .eq("notify_new_videos", true)
    .not("expo_push_token", "is", null)
    .abortSignal(AbortSignal.timeout(TIMEOUT_MS));
}

export function selectVideoAutomationState(supabase: SupabaseClient) {
  return supabase
    .from("youtube_push_automation_state")
    .select("last_seen_video_id,last_seen_published_at")
    .eq("automation_key", "video_published")
    .maybeSingle();
}

export function advanceVideoAutomationState(
  supabase: SupabaseClient,
  videoId: string,
  publishedAt: string,
) {
  return supabase.rpc("advance_youtube_video_push_state", {
    p_video_id: videoId,
    p_published_at: publishedAt,
  });
}

export function selectBatchByRequestKey(supabase: SupabaseClient, requestKey: string) {
  return supabase.from("push_notification_batches").select("id,status").eq("request_key", requestKey).maybeSingle();
}

export function insertDelivery(supabase: SupabaseClient, batchId: string, deviceId: string, lastFour: string | null) {
  return supabase.from("push_notification_deliveries").insert({
    batch_id: batchId,
    device_id: deviceId,
    token_last_four: lastFour,
    attempts: 1,
  }).select("id").single();
}

export function updateDeliveryTicket(supabase: SupabaseClient, id: string, ticket: { status: string; ticketId?: string; code?: string; message?: string }) {
  return supabase.from("push_notification_deliveries").update({
    expo_ticket_id: ticket.ticketId ?? null,
    ticket_status: ticket.status,
    ticket_error_code: ticket.code ?? null,
    ticket_error_message: ticket.message?.slice(0, 500) ?? null,
    sent_at: new Date().toISOString(),
  }).eq("id", id);
}

export function finishBatch(supabase: SupabaseClient, id: string, accepted: boolean, error?: string) {
  return supabase.from("push_notification_batches").update({
    status: accepted ? "completed" : "failed",
    accepted_count: accepted ? 1 : 0,
    failed_count: accepted ? 0 : 1,
    completed_at: new Date().toISOString(),
    error_message: error?.slice(0, 500) ?? null,
  }).eq("id", id);
}

export function finishLiveStartBatch(
  supabase: SupabaseClient,
  id: string,
  counts: { requested: number; accepted: number; failed: number },
  error?: string,
) {
  return supabase.from("push_notification_batches").update({
    status: counts.failed === 0 ? "completed" : "failed",
    requested_count: counts.requested,
    accepted_count: counts.accepted,
    failed_count: counts.failed,
    completed_at: new Date().toISOString(),
    error_message: error?.slice(0, 500) ?? null,
  }).eq("id", id);
}

export function finishVideoPublishedBatch(
  supabase: SupabaseClient,
  id: string,
  counts: { requested: number; accepted: number; failed: number },
  error?: string,
) {
  return supabase.from("push_notification_batches").update({
    status: counts.failed === 0 ? "completed" : "failed",
    requested_count: counts.requested,
    accepted_count: counts.accepted,
    failed_count: counts.failed,
    completed_at: new Date().toISOString(),
    error_message: error?.slice(0, 500) ?? null,
  }).eq("id", id);
}

export function selectPendingReceipts(supabase: SupabaseClient, cutoff: string) {
  return supabase.from("push_notification_deliveries")
    .select("id,device_id,expo_ticket_id")
    .not("expo_ticket_id", "is", null)
    .is("receipt_status", null)
    .lte("sent_at", cutoff)
    .order("sent_at")
    .limit(300);
}

export function updateDeliveryReceipt(supabase: SupabaseClient, id: string, receipt: { status: string; code?: string; message?: string }) {
  return supabase.from("push_notification_deliveries").update({
    receipt_status: receipt.status,
    receipt_error_code: receipt.code ?? null,
    receipt_error_message: receipt.message?.slice(0, 500) ?? null,
    receipt_checked_at: new Date().toISOString(),
  }).eq("id", id);
}

export function disableDevice(supabase: SupabaseClient, id: string, reason: string, error?: string) {
  return supabase.from("push_devices").update({
    expo_push_token: null,
    is_active: false,
    notifications_enabled: false,
    disabled_at: new Date().toISOString(),
    disabled_reason: reason.slice(0, 120),
    last_delivery_error: error?.slice(0, 500) ?? null,
  }).eq("id", id);
}
