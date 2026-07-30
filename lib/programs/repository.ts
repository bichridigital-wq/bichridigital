import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  BroadcastProgramInput,
  BroadcastProgramRow,
} from "../../types/program";

export const PROGRAM_SELECT =
  "id,name,slug,category,default_description,default_thumbnail_url,default_thumbnail_storage_path,default_duration_minutes,is_active,sort_order,created_at,updated_at";
const ADMIN_QUERY_TIMEOUT_MS = 10_000;

function toDatabaseInput(input: BroadcastProgramInput) {
  return {
    name: input.name,
    slug: input.slug,
    category: input.category,
    default_description: input.defaultDescription,
    default_thumbnail_url: input.defaultThumbnailUrl,
    default_thumbnail_storage_path: input.defaultThumbnailStoragePath,
    default_duration_minutes: input.defaultDurationMinutes,
    is_active: input.isActive,
    sort_order: input.sortOrder,
  };
}

export function selectPrograms(supabase: SupabaseClient, activeOnly = false) {
  let query = supabase
    .from("broadcast_programs")
    .select(PROGRAM_SELECT)
    .order("sort_order")
    .order("name")
    .abortSignal(AbortSignal.timeout(ADMIN_QUERY_TIMEOUT_MS));
  if (activeOnly) query = query.eq("is_active", true);
  return query;
}

export function selectProgramById(supabase: SupabaseClient, id: string) {
  return supabase
    .from("broadcast_programs")
    .select(PROGRAM_SELECT)
    .eq("id", id)
    .maybeSingle();
}

export function insertProgram(
  supabase: SupabaseClient,
  input: BroadcastProgramInput,
) {
  return supabase
    .from("broadcast_programs")
    .insert(toDatabaseInput(input))
    .select(PROGRAM_SELECT)
    .single();
}

export function updateProgramRow(
  supabase: SupabaseClient,
  id: string,
  input: BroadcastProgramInput,
) {
  return supabase
    .from("broadcast_programs")
    .update(toDatabaseInput(input))
    .eq("id", id)
    .select(PROGRAM_SELECT)
    .single();
}

export function deleteProgramRow(supabase: SupabaseClient, id: string) {
  return supabase.from("broadcast_programs").delete().eq("id", id);
}

export function asProgramRows(value: unknown): BroadcastProgramRow[] {
  return Array.isArray(value) ? (value as BroadcastProgramRow[]) : [];
}
