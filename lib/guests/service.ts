import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  BroadcastGuest,
  BroadcastGuestFormValues,
  BroadcastGuestRow,
  BroadcastScheduleGuest,
  BroadcastScheduleGuestRow,
  GuestSelection,
} from "../../types/guest";
import { validateGuestId } from "./validation";
import { hasHistoricalPhotoReferences } from "./photo-retention";
import {
  countScheduleGuestPhotoReferences,
  deleteGuestRow,
  guestRows,
  insertGuest,
  scheduleGuestRows,
  selectGuestById,
  selectGuests,
  selectScheduleGuests,
  syncScheduleGuests,
  updateGuestRow,
} from "./repository";

function guest(row: BroadcastGuestRow): BroadcastGuest {
  return {
    id: row.id,
    fullName: row.full_name,
    slug: row.slug,
    title: row.title,
    shortBio: row.short_bio,
    specialty: row.specialty,
    photoUrl: row.photo_url,
    photoStoragePath: row.photo_storage_path,
    instagramUrl: row.instagram_url,
    facebookUrl: row.facebook_url,
    youtubeUrl: row.youtube_url,
    websiteUrl: row.website_url,
    isActive: row.is_active,
    sortOrder: row.sort_order,
    linkedEventCount: row.broadcast_schedule_guests?.[0]?.count ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function scheduleGuest(row: BroadcastScheduleGuestRow): BroadcastScheduleGuest {
  return {
    id: row.id,
    scheduleId: row.schedule_id,
    guestId: row.guest_id,
    guestNameSnapshot: row.guest_name_snapshot,
    guestTitleSnapshot: row.guest_title_snapshot,
    guestPhotoUrlSnapshot: row.guest_photo_url_snapshot,
    roleLabel: row.role_label,
    sortOrder: row.sort_order,
  };
}

function failure(scope: string, error: { code?: string; message: string }) {
  console.error(`[guests] ${scope}`, {
    code: error.code,
    message: error.message,
  });
}

export async function getGuestsAdmin(
  supabase: SupabaseClient,
  activeOnly = false,
) {
  const { data, error } = await selectGuests(supabase, activeOnly);
  if (error) {
    failure("Lecture impossible.", error);
    throw new Error("Impossible de charger les invités.");
  }
  return guestRows(data).map(guest);
}

export async function getGuestAdminById(
  supabase: SupabaseClient,
  id: string,
) {
  validateGuestId(id);
  const { data, error } = await selectGuestById(supabase, id);
  if (error) throw new Error("Impossible de charger cet invité.");
  return data ? guest(data as BroadcastGuestRow) : null;
}

export async function createGuest(
  supabase: SupabaseClient,
  input: BroadcastGuestFormValues,
) {
  const { data, error } = await insertGuest(supabase, input);
  if (error || !data) {
    if (error?.code === "23505") throw new Error("Ce slug est déjà utilisé.");
    throw new Error("Impossible de créer l’invité.");
  }
  return guest(data as BroadcastGuestRow);
}

export async function updateGuest(
  supabase: SupabaseClient,
  id: string,
  input: BroadcastGuestFormValues,
) {
  validateGuestId(id);
  const { data, error } = await updateGuestRow(supabase, id, input);
  if (error || !data) {
    if (error?.code === "23505") throw new Error("Ce slug est déjà utilisé.");
    throw new Error("Impossible de modifier l’invité.");
  }
  return guest(data as BroadcastGuestRow);
}

export async function deleteGuest(supabase: SupabaseClient, id: string) {
  validateGuestId(id);
  const { error } = await deleteGuestRow(supabase, id);
  if (error) throw new Error("Impossible de supprimer l’invité.");
}

export async function isGuestPhotoReferenced(
  supabase: SupabaseClient,
  photoUrl: string,
) {
  const { count, error } = await countScheduleGuestPhotoReferences(
    supabase,
    photoUrl,
  );
  if (error) {
    failure("Vérification de l’historique de la photo impossible.", error);
    throw new Error(
      "Impossible de vérifier si la photo est utilisée dans l’historique.",
    );
  }
  return hasHistoricalPhotoReferences(count);
}

export async function getScheduleGuestsAdmin(
  supabase: SupabaseClient,
  scheduleIds: string[],
) {
  const { data, error } = await selectScheduleGuests(supabase, scheduleIds);
  if (error) throw new Error("Impossible de charger les invités de l’agenda.");
  return scheduleGuestRows(data).map(scheduleGuest);
}

export async function syncGuestsForSchedule(
  supabase: SupabaseClient,
  scheduleId: string,
  selections: GuestSelection[],
) {
  validateGuestId(scheduleId, "L’événement");
  const { error } = await syncScheduleGuests(supabase, scheduleId, selections);
  if (error) {
    failure("Synchronisation impossible.", error);
    throw new Error("Impossible d’associer les invités à l’événement.");
  }
}
