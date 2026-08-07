import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

const TIMEOUT_MS = 10_000;
export const PUBLIC_GUEST_SELECT =
  "id,full_name,slug,title,short_bio,specialty,photo_url,instagram_url,facebook_url,youtube_url,website_url,is_active,updated_at";
const PUBLIC_APPEARANCE_SCHEDULE_SELECT =
  "id,title,slug,scheduled_start_time,scheduled_end_time,youtube_video_id,thumbnail_url,location,is_published";

export function selectActivePublicGuests(supabase: SupabaseClient) {
  return supabase
    .from("broadcast_guests")
    .select(PUBLIC_GUEST_SELECT)
    .eq("is_active", true)
    .order("sort_order")
    .order("full_name")
    .abortSignal(AbortSignal.timeout(TIMEOUT_MS));
}

export function selectActivePublicGuestSitemapRows(supabase: SupabaseClient) {
  return supabase
    .from("broadcast_guests")
    .select("slug,updated_at")
    .eq("is_active", true)
    .order("slug")
    .abortSignal(AbortSignal.timeout(TIMEOUT_MS));
}

export function selectActivePublicGuestBySlug(
  supabase: SupabaseClient,
  slug: string,
) {
  return supabase
    .from("broadcast_guests")
    .select(PUBLIC_GUEST_SELECT)
    .eq("slug", slug)
    .eq("is_active", true)
    .abortSignal(AbortSignal.timeout(TIMEOUT_MS))
    .maybeSingle();
}

export function selectActivePublicGuestLinks(
  supabase: SupabaseClient,
  guestIds: string[],
) {
  return supabase
    .from("broadcast_guests")
    .select(PUBLIC_GUEST_SELECT)
    .in("id", guestIds)
    .eq("is_active", true)
    .abortSignal(AbortSignal.timeout(TIMEOUT_MS));
}

export function selectPublicGuestAssociations(
  supabase: SupabaseClient,
  guestId: string,
) {
  return supabase
    .from("broadcast_schedule_guests")
    .select("schedule_id,role_label,sort_order")
    .eq("guest_id", guestId)
    .order("sort_order")
    .abortSignal(AbortSignal.timeout(TIMEOUT_MS));
}

export function selectPublishedScheduleByIds(
  supabase: SupabaseClient,
  scheduleIds: string[],
) {
  return supabase
    .from("broadcast_schedule")
    .select(PUBLIC_APPEARANCE_SCHEDULE_SELECT)
    .in("id", scheduleIds)
    .eq("is_published", true)
    .order("scheduled_start_time")
    .abortSignal(AbortSignal.timeout(TIMEOUT_MS));
}
