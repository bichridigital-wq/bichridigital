import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "../supabase/server";
import {
  asScheduleRows,
  deleteScheduleEventRow,
  insertScheduleEvent,
  selectAdminSchedule,
  selectPublicUpcomingSchedule,
  selectScheduleEventById,
  updateScheduleEventRow,
} from "./repository";
import type {
  AdminScheduleEvent,
  CreateScheduleEventInput,
  PublicScheduleEvent,
  ScheduleRow,
  UpdateScheduleEventInput,
} from "../../types/schedule";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const RECENT_START_WINDOW_MS = 6 * 60 * 60 * 1000;

function publicEvent(row: ScheduleRow): PublicScheduleEvent {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    category: row.category,
    scheduledStartTime: row.scheduled_start_time,
    scheduledEndTime: row.scheduled_end_time,
    status: row.status,
    youtubeVideoId: row.youtube_video_id,
    thumbnailUrl: row.thumbnail_url,
    location: row.location,
  };
}

function adminEvent(row: ScheduleRow): AdminScheduleEvent {
  return {
    ...publicEvent(row),
    programId: row.program_id,
    isPublished: row.is_published,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function validateId(id: string) {
  if (!UUID_PATTERN.test(id)) {
    throw new Error("Identifiant d’événement invalide.");
  }
}

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("Vous devez être connecté.");

  const { data: isAdmin, error: adminError } =
    await supabase.rpc("is_admin");
  if (adminError || !isAdmin) throw new Error("Accès administrateur requis.");
  return supabase;
}

async function loadPublicUpcomingSchedule(): Promise<PublicScheduleEvent[]> {
  const cutoff = new Date(Date.now() - RECENT_START_WINDOW_MS).toISOString();
  const { data, error } = await selectPublicUpcomingSchedule(cutoff);
  if (error) throw new Error("Impossible de charger l’agenda public.");
  return asScheduleRows(data).map(publicEvent);
}

export async function getPublicUpcomingSchedule() {
  return loadPublicUpcomingSchedule();
}

export async function getAdminSchedule(supabase?: SupabaseClient) {
  const authenticatedClient = supabase ?? (await requireAdmin());
  const { data, error } = await selectAdminSchedule(authenticatedClient);
  if (error) {
    console.error("[schedule] Échec de la lecture de l’agenda.", {
      code: error.code,
      message: error.message,
    });
    throw new Error("Impossible de charger l’agenda.");
  }
  return asScheduleRows(data).map(adminEvent);
}

export async function getScheduleEventById(id: string) {
  validateId(id);
  const supabase = await requireAdmin();
  const { data, error } = await selectScheduleEventById(supabase, id);
  if (error) throw new Error("Impossible de charger cet événement.");
  return data ? adminEvent(data as ScheduleRow) : null;
}

export async function createScheduleEvent(input: CreateScheduleEventInput) {
  const supabase = await requireAdmin();
  const { data, error } = await insertScheduleEvent(supabase, input);
  if (error || !data) throw new Error("Impossible de créer l’événement.");
  return adminEvent(data as ScheduleRow);
}

export async function updateScheduleEvent(
  id: string,
  input: UpdateScheduleEventInput,
) {
  validateId(id);
  const supabase = await requireAdmin();
  const { data, error } = await updateScheduleEventRow(supabase, id, input);
  if (error || !data) throw new Error("Impossible de modifier l’événement.");
  return adminEvent(data as ScheduleRow);
}

export async function deleteScheduleEvent(id: string) {
  validateId(id);
  const supabase = await requireAdmin();
  const { error } = await deleteScheduleEventRow(supabase, id);
  if (error) throw new Error("Impossible de supprimer l’événement.");
}
