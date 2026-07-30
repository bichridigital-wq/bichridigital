import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "../supabase/server";
import {
  asProgramRows,
  deleteProgramRow,
  insertProgram,
  selectProgramById,
  selectPrograms,
  updateProgramRow,
} from "./repository";
import type {
  BroadcastProgram,
  BroadcastProgramInput,
  BroadcastProgramRow,
} from "../../types/program";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function toProgram(row: BroadcastProgramRow): BroadcastProgram {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    category: row.category,
    defaultDescription: row.default_description,
    defaultThumbnailUrl: row.default_thumbnail_url,
    defaultThumbnailStoragePath: row.default_thumbnail_storage_path,
    defaultDurationMinutes: row.default_duration_minutes,
    isActive: row.is_active,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Vous devez être connecté.");
  const { data: isAdmin, error: adminError } =
    await supabase.rpc("is_admin");
  if (adminError || !isAdmin) throw new Error("Accès administrateur requis.");
  return supabase;
}

function validateId(id: string) {
  if (!UUID_PATTERN.test(id)) {
    throw new Error("Identifiant de programme invalide.");
  }
}

export async function getProgramsAdmin(
  supabase?: SupabaseClient,
  activeOnly = false,
) {
  const authenticatedClient = supabase ?? (await requireAdmin());
  const { data, error } = await selectPrograms(authenticatedClient, activeOnly);
  if (error) {
    console.error("[programs] Échec de la lecture des programmes.", {
      code: error.code,
      message: error.message,
    });
    throw new Error("Impossible de charger les programmes.");
  }
  return asProgramRows(data).map(toProgram);
}

export async function getProgramAdminById(id: string) {
  validateId(id);
  const supabase = await requireAdmin();
  const { data, error } = await selectProgramById(supabase, id);
  if (error) throw new Error("Impossible de charger ce programme.");
  return data ? toProgram(data as BroadcastProgramRow) : null;
}

export async function createProgram(input: BroadcastProgramInput) {
  const supabase = await requireAdmin();
  const { data, error } = await insertProgram(supabase, input);
  if (error || !data) {
    if (error?.code === "23505") throw new Error("Ce slug est déjà utilisé.");
    throw new Error("Impossible de créer le programme.");
  }
  return toProgram(data as BroadcastProgramRow);
}

export async function updateProgram(
  id: string,
  input: BroadcastProgramInput,
) {
  validateId(id);
  const supabase = await requireAdmin();
  const { data, error } = await updateProgramRow(supabase, id, input);
  if (error || !data) {
    if (error?.code === "23505") throw new Error("Ce slug est déjà utilisé.");
    throw new Error("Impossible de modifier le programme.");
  }
  return toProgram(data as BroadcastProgramRow);
}

export async function deleteProgram(id: string) {
  validateId(id);
  const supabase = await requireAdmin();
  const { error } = await deleteProgramRow(supabase, id);
  if (error) throw new Error("Impossible de supprimer le programme.");
}
