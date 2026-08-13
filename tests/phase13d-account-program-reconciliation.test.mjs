import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { hasCompleteDeviceProof, normalizeLocalProgramIds } from "../lib/account/reconcile-input.ts";

const PROGRAM_A = "91000000-0000-4000-8000-000000000001";
const PROGRAM_B = "91000000-0000-4000-8000-000000000002";

test("reconcile accepte le mode compte sans Push et déduplique les UUID", () => {
  assert.deepEqual(normalizeLocalProgramIds([PROGRAM_B, PROGRAM_A, PROGRAM_A]), [PROGRAM_B, PROGRAM_A]);
  assert.equal(hasCompleteDeviceProof({ localProgramIds: [] }), false);
});

test("reconcile limite à 100 programmes et exige une preuve device complète", () => {
  assert.throws(() => normalizeLocalProgramIds(Array(101).fill(PROGRAM_A)), /invalid_programs/);
  assert.throws(() => hasCompleteDeviceProof({ installationId: "91000000-0000-4000-8000-000000000010" }), /incomplete_device_proof/);
  assert.throws(() => hasCompleteDeviceProof({ expoPushToken: "ExponentPushToken[test]" }), /incomplete_device_proof/);
  assert.throws(() => normalizeLocalProgramIds(["incorrect"]), /invalid_programs/);
});

test("route reconcile exige le JWT, rate-limit et no-store", async () => {
  const route = await readFile(new URL("../app/api/me/program-subscriptions/reconcile/route.ts", import.meta.url), "utf8");
  const auth = await readFile(new URL("../lib/account/auth.ts", import.meta.url), "utf8");
  const http = await readFile(new URL("../lib/account/http.ts", import.meta.url), "utf8");
  assert.match(route, /requireAuthenticatedUser\(request\)/);
  assert.match(route, /me_program_subscriptions_reconcile/);
  assert.match(route, /validateReconcileInput/);
  assert.match(auth, /auth\.getUser\(match\[1\]\)/);
  assert.match(http, /private, no-store/);
});

test("service utilise auth user, preuve hachée et RPC centrales", async () => {
  const service = await readFile(new URL("../lib/account/service.ts", import.meta.url), "utf8");
  assert.match(service, /hashPushSecret\(input\.expoPushToken\)/);
  assert.match(service, /device\.user_id !== userId/);
  assert.match(service, /reconcileProgramSubscriptions/);
  assert.match(service, /followAccountProgram/);
  assert.match(service, /unfollowAccountProgram/);
  assert.doesNotMatch(service, /user_metadata|app_metadata|access_token|refresh_token/);
});

test("migration 13D matérialise multi-device sans modifier les préférences", async () => {
  const sql = await readFile(new URL("../supabase/migrations/20260813132930_reconcile_user_program_subscriptions.sql", import.meta.url), "utf8");
  assert.match(sql, /reconcile_user_program_subscriptions/i);
  assert.match(sql, /union[\s\S]+push_device_program_subscriptions/i);
  assert.match(sql, /where device\.user_id = p_user_id/i);
  assert.match(sql, /on conflict \(push_device_id, program_id\) do nothing/i);
  assert.match(sql, /unfollow_user_program_subscription/i);
  assert.match(sql, /revoke all[\s\S]+from public, anon, authenticated/i);
  assert.doesNotMatch(sql, /notifications_enabled\s*=|notify_live_starts\s*=|notify_new_videos\s*=|notify_followed_emissions\s*=|expo_push_token\s*=/i);
});

test("réponse reconcile ne contient que les programIds", async () => {
  const service = await readFile(new URL("../lib/account/service.ts", import.meta.url), "utf8");
  assert.match(service, /return \{ programIds:/);
  assert.doesNotMatch(service, /return \{[^}]*userId|return \{[^}]*deviceId|return \{[^}]*expoPushToken/);
});
