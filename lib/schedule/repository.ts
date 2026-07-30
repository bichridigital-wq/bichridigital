import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "../supabase/admin";
import type {
  CreateScheduleEventInput,
  ScheduleRow,
  UpdateScheduleEventInput,
} from "../../types/schedule";

export const SCHEDULE_SELECT =
  "id,program_id,title,slug,description,category,scheduled_start_time,scheduled_end_time,status,youtube_video_id,thumbnail_url,location,is_published,created_at,updated_at";
const ADMIN_QUERY_TIMEOUT_MS = 10_000;

function toDatabaseInput(
  input: CreateScheduleEventInput | UpdateScheduleEventInput,
) {
  return {
    program_id: input.programId,
    title: input.title,
    slug: input.slug,
    description: input.description,
    category: input.category,
    scheduled_start_time: input.scheduledStartTime,
    scheduled_end_time: input.scheduledEndTime,
    status: input.status,
    youtube_video_id: input.youtubeVideoId,
    thumbnail_url: input.thumbnailUrl,
    location: input.location,
    is_published: input.isPublished,
  };
}

export async function selectPublicUpcomingSchedule(cutoff: string) {
  const supabase = createAdminClient();
  return supabase
    .from("broadcast_schedule")
    .select(SCHEDULE_SELECT)
    .eq("is_published", true)
    .eq("status", "scheduled")
    .gte("scheduled_start_time", cutoff)
    .order("scheduled_start_time", { ascending: true })
    .limit(20);
}

export async function selectAdminSchedule(supabase: SupabaseClient) {
  return supabase
    .from("broadcast_schedule")
    .select(SCHEDULE_SELECT)
    .order("scheduled_start_time", { ascending: true })
    .abortSignal(AbortSignal.timeout(ADMIN_QUERY_TIMEOUT_MS));
}

export async function selectScheduleEventById(
  supabase: SupabaseClient,
  id: string,
) {
  return supabase
    .from("broadcast_schedule")
    .select(SCHEDULE_SELECT)
    .eq("id", id)
    .maybeSingle();
}

export async function insertScheduleEvent(
  supabase: SupabaseClient,
  input: CreateScheduleEventInput,
) {
  return supabase
    .from("broadcast_schedule")
    .insert(toDatabaseInput(input))
    .select(SCHEDULE_SELECT)
    .single();
}

export async function updateScheduleEventRow(
  supabase: SupabaseClient,
  id: string,
  input: UpdateScheduleEventInput,
) {
  return supabase
    .from("broadcast_schedule")
    .update(toDatabaseInput(input))
    .eq("id", id)
    .select(SCHEDULE_SELECT)
    .single();
}

export async function deleteScheduleEventRow(
  supabase: SupabaseClient,
  id: string,
) {
  return supabase.from("broadcast_schedule").delete().eq("id", id);
}

export function asScheduleRows(value: unknown): ScheduleRow[] {
  return Array.isArray(value) ? (value as ScheduleRow[]) : [];
}
