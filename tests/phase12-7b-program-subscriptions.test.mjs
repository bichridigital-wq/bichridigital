import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { toPublicProgram } from "../lib/programs/public.ts";
import {
  validateOwnership,
  validateProgramSubscription,
} from "../lib/push/validation.ts";

const TOKEN = "ExponentPushToken[abcdefghijklmnopqrstuv]";
const INSTALLATION = "550e8400-e29b-41d4-a716-446655440000";
const PROGRAM = "10000000-0000-4000-8000-000000000001";

test("FOLLOW et UNFOLLOW valident strictement la preuve et le programme", () => {
  const payload = {
    installationId: INSTALLATION,
    expoPushToken: TOKEN,
    programId: PROGRAM,
  };
  assert.deepEqual(validateProgramSubscription(payload), payload);
  assert.throws(
    () => validateProgramSubscription({ ...payload, programId: "incorrect" }),
    /programId/i,
  );
  assert.throws(
    () => validateProgramSubscription({ ...payload, admin: true }),
    /Champ inconnu/i,
  );
  assert.throws(
    () => validateProgramSubscription({ ...payload, expoPushToken: "secret" }),
    /ExpoPushToken/i,
  );
});

test("LIST conserve exactement la preuve d'appartenance existante", () => {
  assert.deepEqual(
    validateOwnership({ installationId: INSTALLATION, expoPushToken: TOKEN }),
    { installationId: INSTALLATION, expoPushToken: TOKEN },
  );
});

test("le catalogue public expose seulement le contrat mobile minimal", () => {
  const program = toPublicProgram({
    id: PROGRAM,
    name: "Firi Gent",
    slug: "firi-gent",
    category: "Religion",
    default_description: "Description",
    default_thumbnail_url: "https://example.com/firi.webp",
    default_thumbnail_storage_path: "programs/internal.webp",
    default_duration_minutes: 60,
    is_active: true,
    sort_order: 1,
    created_at: "2026-08-09T00:00:00.000Z",
    updated_at: "2026-08-09T00:00:00.000Z",
  });
  assert.deepEqual(Object.keys(program), [
    "id",
    "name",
    "slug",
    "category",
    "defaultDescription",
    "defaultThumbnailUrl",
    "defaultDurationMinutes",
  ]);
  assert.equal(JSON.stringify(program).includes("storage_path"), false);
});

test("le catalogue public rejette UUID, slug et durÃ©e non canoniques", () => {
  const base = {
    id: PROGRAM,
    name: "Programme",
    slug: "programme",
    category: "Magazine",
    default_description: null,
    default_thumbnail_url: null,
    default_thumbnail_storage_path: null,
    default_duration_minutes: 60,
    is_active: true,
    sort_order: 0,
    created_at: "2026-08-09T00:00:00.000Z",
    updated_at: "2026-08-09T00:00:00.000Z",
  };
  assert.throws(() => toPublicProgram({ ...base, id: "invalid" }));
  assert.throws(() => toPublicProgram({ ...base, slug: "Slug Invalide" }));
  assert.throws(() => toPublicProgram({ ...base, default_duration_minutes: 5 }));
});

test("la migration reste additive, privÃ©e et synchronise le legacy", async () => {
  const sql = await readFile(
    new URL(
      "../supabase/migrations/20260809134520_add_program_push_subscriptions.sql",
      import.meta.url,
    ),
    "utf8",
  );
  assert.match(sql, /create table public\.push_device_program_subscriptions/i);
  assert.match(sql, /primary key \(push_device_id, program_id\)/i);
  assert.match(sql, /references public\.push_devices\(id\) on delete cascade/i);
  assert.match(sql, /references public\.broadcast_programs\(id\) on delete cascade/i);
  assert.match(sql, /enable row level security/i);
  assert.match(sql, /revoke all[\s\S]+from public, anon, authenticated/i);
  assert.match(sql, /sync_push_device_program_subscriptions/i);
  assert.match(sql, /on conflict \(push_device_id, program_id\) do nothing/i);
  assert.doesNotMatch(sql, /drop\s+(table|column)\b/i);
});

test("aucune automation de rappel n'est introduite en 12.7B", async () => {
  const sql = await readFile(
    new URL(
      "../supabase/migrations/20260809134520_add_program_push_subscriptions.sql",
      import.meta.url,
    ),
    "utf8",
  );
  assert.doesNotMatch(sql, /program_reminder|program_followers/i);
});
