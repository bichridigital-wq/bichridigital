import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("validation profil, device et UUID est stricte", async () => {
  const source = await readFile(new URL("../lib/account/validation.ts", import.meta.url), "utf8");
  assert.match(source, /exactKeys\(input, \["displayName", "avatarUrl"\]\)/);
  assert.match(source, /displayName\.trim\(\)/);
  assert.match(source, /displayName\.length < 2 \|\| displayName\.length > 80/);
  assert.match(source, /url\.protocol !== "https:"/);
  assert.match(source, /exactKeys\(input, \["installationId", "expoPushToken"\]\)/);
  assert.match(source, /Expo\.isExpoPushToken/);
  assert.match(source, /UUID_PATTERN\.test/);
  assert.doesNotMatch(source, /userId.*allowed/i);
});

test("migration compte est additive, isolée et préserve les automations Push", async () => {
  const sql = await readFile(new URL("../supabase/migrations/20260810231901_add_user_accounts_backend.sql", import.meta.url), "utf8");
  assert.match(sql, /create table public\.profiles/i);
  assert.match(sql, /create table public\.user_program_subscriptions/i);
  assert.match(sql, /add column user_id uuid null references auth\.users\(id\) on delete set null/i);
  assert.match(sql, /primary key \(user_id, program_id\)/i);
  assert.match(sql, /auth\.uid\(\)\) = user_id/g);
  assert.doesNotMatch(sql, /alter table public\.admin_users|create or replace function public\.is_admin/i);
  assert.doesNotMatch(sql, /drop\s+(table|column|function)\b/i);
});

test("routes valident le JWT, sont no-store et ne retournent aucun rôle", async () => {
  const auth = await readFile(new URL("../lib/account/auth.ts", import.meta.url), "utf8");
  const http = await readFile(new URL("../lib/account/http.ts", import.meta.url), "utf8");
  const me = await readFile(new URL("../app/api/me/route.ts", import.meta.url), "utf8");
  assert.match(auth, /auth\.getUser\(match\[1\]\)/);
  assert.doesNotMatch(auth, /decode|user_metadata|app_metadata/);
  assert.match(http, /private, no-store/);
  assert.match(me, /requireAuthenticatedUser/);
  assert.doesNotMatch(me, /is_admin|admin_users|refresh_token|access_token/);
});

test("ownership ne transfère jamais silencieusement et ne supprime pas le device", async () => {
  const service = await readFile(new URL("../lib/account/service.ts", import.meta.url), "utf8");
  const repository = await readFile(new URL("../lib/account/repository.ts", import.meta.url), "utf8");
  assert.match(service, /hashPushSecret\(input\.expoPushToken\)/);
  assert.match(service, /device\.user_id[\s\S]+device_conflict/);
  assert.match(repository, /\.is\("user_id", null\)/);
  assert.match(repository, /update\(\{ user_id: null \}\)/);
  assert.doesNotMatch(repository, /from\("push_devices"\)\.delete/);
});

test("subscriptions compte centralisées avec matérialisation appareil 13D", async () => {
  const repository = await readFile(new URL("../lib/account/repository.ts", import.meta.url), "utf8");
  assert.match(repository, /from\("user_program_subscriptions"\)/);
  assert.match(repository, /reconcile_user_program_subscriptions/);
  assert.match(repository, /follow_user_program_subscription/);
  assert.match(repository, /unfollow_user_program_subscription/);
});

test("suite SQL couvre isolation A/B, anon et frontière admin", async () => {
  const sql = await readFile(new URL("./phase13b-account-backend.sql", import.meta.url), "utf8");
  assert.match(sql, /set local role authenticated/i);
  assert.match(sql, /profile RLS isolation failed/i);
  assert.match(sql, /cross-user profile update succeeded/i);
  assert.match(sql, /set local role anon/i);
  assert.match(sql, /user metadata granted admin/i);
  assert.match(sql, /rollback;\s*$/i);
});
