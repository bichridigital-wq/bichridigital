import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { createClient } from "@supabase/supabase-js";

function authClientWith(fetch) {
  return createClient("https://example.supabase.co", "sb_publishable_test", {
    global: { fetch },
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

test("SDK install\u00e9 accepte une session active et rejette session_not_found", async () => {
  const activeClient = authClientWith(async () => Response.json({ id: "user-a", aud: "authenticated" }));
  const active = await activeClient.auth.getUser("active-jwt");
  assert.equal(active.error, null);
  assert.equal(active.data.user?.id, "user-a");

  const revokedClient = authClientWith(async () => Response.json(
    { code: "session_not_found", message: "Session not found" },
    { status: 403, headers: { "X-Supabase-Api-Version": "2024-01-01" } },
  ));
  const revoked = await revokedClient.auth.getUser("revoked-jwt");
  assert.equal(revoked.data.user, null);
  assert.equal(revoked.error?.name, "AuthSessionMissingError");
});

test("SDK install\u00e9 envoie la r\u00e9vocation others avec le JWT courant", async () => {
  let capturedUrl = "";
  let capturedAuthorization = "";
  const client = authClientWith(async (input, init) => {
    capturedUrl = String(input);
    capturedAuthorization = new Headers(init?.headers).get("authorization") ?? "";
    return new Response(null, { status: 204 });
  });
  const { error } = await client.auth.admin.signOut("current-jwt", "others");
  assert.equal(error, null);
  assert.match(capturedUrl, /\/auth\/v1\/logout\?scope=others$/);
  assert.equal(capturedAuthorization, "Bearer current-jwt");
});

test("remote unlink retire seulement le device du compte et ne simule aucun logout Auth", async () => {
  const repository = await readFile(new URL("../lib/account/repository.ts", import.meta.url), "utf8");
  const operation = repository.match(/export function detachAccountDevice[\s\S]+?\n\}/)?.[0] ?? "";
  assert.match(operation, /update\(\{ user_id: null \}\)/);
  assert.doesNotMatch(operation, /signOut|auth\.|session_id|refresh_token|access_token/i);
});

test("toutes les routes compte valident la session aupr\u00e8s de Supabase Auth", async () => {
  const auth = await readFile(new URL("../lib/account/auth.ts", import.meta.url), "utf8");
  const routes = await Promise.all([
    "../app/api/me/route.ts",
    "../app/api/me/program-subscriptions/route.ts",
    "../app/api/me/devices/route.ts",
    "../app/api/account/link-device/route.ts",
    "../app/api/account/unlink-device/route.ts",
  ].map((path) => readFile(new URL(path, import.meta.url), "utf8")));
  assert.match(auth, /client\.auth\.getUser\(match\[1\]\)/);
  for (const route of routes) assert.match(route, /requireAuthenticatedUser\(request\)/);
  assert.match(auth, /error \|\| !user[\s\S]+AccountError\(401, "unauthorized"/);
});

test("l'action s\u00e9curit\u00e9 r\u00e9voque uniquement les autres sessions", async () => {
  const auth = await readFile(new URL("../lib/account/auth.ts", import.meta.url), "utf8");
  const route = await readFile(new URL("../app/api/me/sessions/sign-out-others/route.ts", import.meta.url), "utf8");
  assert.match(auth, /client\.auth\.admin\.signOut\(accessToken, "others"\)/);
  assert.doesNotMatch(auth, /signOut\(accessToken, "global"\)|signOut\(accessToken, "local"\)/);
  assert.match(route, /requireAuthenticatedUser\(request\)[\s\S]+enforceAccountRateLimit[\s\S]+signOutOtherSessions/);
  assert.match(route, /status: 204/);
});

test("session r\u00e9voqu\u00e9e ou invalide retourne un 401 g\u00e9n\u00e9rique sans identifiant de session", async () => {
  const auth = await readFile(new URL("../lib/account/auth.ts", import.meta.url), "utf8");
  const http = await readFile(new URL("../lib/account/http.ts", import.meta.url), "utf8");
  assert.match(auth, /error\.status === 401 \|\| error\.status === 403/);
  assert.match(auth, /AccountError\(401, "unauthorized", "Authentification requise\."\)/);
  assert.doesNotMatch(http, /session_id|refresh_token|access_token/i);
});

test("DTO appareil n'expose aucun secret ni session_id", async () => {
  const dto = await readFile(new URL("../lib/account/device-dto.ts", import.meta.url), "utf8");
  assert.doesNotMatch(dto, /session_id|access_token|refresh_token|expo_push_token|token_hash|installation_id/i);
});

test("ownership A/B, rate limit et no-store restent obligatoires", async () => {
  const repository = await readFile(new URL("../lib/account/repository.ts", import.meta.url), "utf8");
  const route = await readFile(new URL("../app/api/me/sessions/sign-out-others/route.ts", import.meta.url), "utf8");
  assert.match(repository, /detachAccountDevice[\s\S]+\.eq\("id", deviceId\)\.eq\("user_id", userId\)/);
  assert.match(route, /enforceAccountRateLimit\(user\.id, "me_update"\)/);
  assert.match(route, /ACCOUNT_NO_STORE_HEADERS/);
});
