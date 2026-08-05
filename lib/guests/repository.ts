import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  BroadcastGuestFormValues,
  BroadcastGuestRow,
  BroadcastScheduleGuestRow,
  GuestSelection,
} from "../../types/guest";

const TIMEOUT_MS = 10_000;
export const GUEST_SELECT =
  "id,full_name,slug,title,short_bio,specialty,photo_url,photo_storage_path,instagram_url,facebook_url,youtube_url,website_url,is_active,sort_order,created_at,updated_at";
export const SCHEDULE_GUEST_SELECT =
  "id,schedule_id,guest_id,guest_name_snapshot,guest_title_snapshot,guest_photo_url_snapshot,role_label,sort_order";

function databaseInput(input: BroadcastGuestFormValues) {
  return {
    full_name: input.fullName,
    slug: input.slug,
    title: input.title,
    short_bio: input.shortBio,
    specialty: input.specialty,
    photo_url: input.photoUrl,
    photo_storage_path: input.photoStoragePath,
    instagram_url: input.instagramUrl,
    facebook_url: input.facebookUrl,
    youtube_url: input.youtubeUrl,
    website_url: input.websiteUrl,
    is_active: input.isActive,
    sort_order: input.sortOrder,
  };
}

export function selectGuests(supabase: SupabaseClient, activeOnly = false) {
  let query = supabase
    .from("broadcast_guests")
    .select(`${GUEST_SELECT},broadcast_schedule_guests(count)`)
    .order("sort_order")
    .order("full_name")
    .abortSignal(AbortSignal.timeout(TIMEOUT_MS));
  if (activeOnly) query = query.eq("is_active", true);
  return query;
}

export function selectGuestById(supabase: SupabaseClient, id: string) {
  return supabase
    .from("broadcast_guests")
    .select(`${GUEST_SELECT},broadcast_schedule_guests(count)`)
    .eq("id", id)
    .maybeSingle();
}

export function insertGuest(
  supabase: SupabaseClient,
  input: BroadcastGuestFormValues,
) {
  return supabase
    .from("broadcast_guests")
    .insert(databaseInput(input))
    .select(GUEST_SELECT)
    .single();
}

export function updateGuestRow(
  supabase: SupabaseClient,
  id: string,
  input: BroadcastGuestFormValues,
) {
  return supabase
    .from("broadcast_guests")
    .update(databaseInput(input))
    .eq("id", id)
    .select(GUEST_SELECT)
    .single();
}

export function deleteGuestRow(supabase: SupabaseClient, id: string) {
  return supabase.from("broadcast_guests").delete().eq("id", id);
}

export function countScheduleGuestPhotoReferences(
  supabase: SupabaseClient,
  photoUrl: string,
) {
  return supabase
    .from("broadcast_schedule_guests")
    .select("id", { count: "exact", head: true })
    .eq("guest_photo_url_snapshot", photoUrl)
    .abortSignal(AbortSignal.timeout(TIMEOUT_MS));
}

export function selectScheduleGuests(
  supabase: SupabaseClient,
  scheduleIds: string[],
) {
  if (scheduleIds.length === 0) {
    return Promise.resolve({
      data: [] as BroadcastScheduleGuestRow[],
      error: null,
    });
  }
  return supabase
    .from("broadcast_schedule_guests")
    .select(SCHEDULE_GUEST_SELECT)
    .in("schedule_id", scheduleIds)
    .order("sort_order")
    .abortSignal(AbortSignal.timeout(TIMEOUT_MS));
}

export function syncScheduleGuests(
  supabase: SupabaseClient,
  scheduleId: string,
  selections: GuestSelection[],
) {
  return supabase.rpc("sync_broadcast_schedule_guests", {
    p_schedule_id: scheduleId,
    p_guests: selections.map((selection, index) => ({
      association_id: selection.associationId,
      guest_id: selection.guestId,
      role_label: selection.roleLabel,
      sort_order: index,
      refresh_snapshot: selection.refreshSnapshot,
    })),
  });
}

export function guestRows(value: unknown): BroadcastGuestRow[] {
  return Array.isArray(value) ? (value as BroadcastGuestRow[]) : [];
}

export function scheduleGuestRows(value: unknown): BroadcastScheduleGuestRow[] {
  return Array.isArray(value) ? (value as BroadcastScheduleGuestRow[]) : [];
}
