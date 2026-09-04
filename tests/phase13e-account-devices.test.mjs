import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
test("deviceId distant exige un UUID canonique", async () => {
  const validation = await readFile(new URL("../lib/account/validation.ts", import.meta.url), "utf8");
  assert.match(validation, /validateAccountDeviceId[\s\S]+UUID_PATTERN\.test\(value\)/);
  assert.match(validation, /AccountError\(422, "invalid_request", "Appareil invalide\."\)/);
});

test("GET devices exige le JWT avant le rate limit et la lecture", async () => {
  const route = await readFile(new URL("../app/api/me/devices/route.ts", import.meta.url), "utf8");
  const authPosition = route.indexOf("requireAuthenticatedUser(request)");
  const ratePosition = route.indexOf("enforceAccountRateLimit(user.id, \"me_get\")");
  const readPosition = route.indexOf("getAccountDevices(user.id)");
  assert.ok(authPosition >= 0 && authPosition < ratePosition && ratePosition < readPosition);
  assert.match(route, /accountApiError\(error\)/);
});

test("GET filtre exclusivement par auth user et expose une projection minimale", async () => {
  const repository = await readFile(new URL("../lib/account/repository.ts", import.meta.url), "utf8");
  const service = await readFile(new URL("../lib/account/service.ts", import.meta.url), "utf8");
  const dto = await readFile(new URL("../lib/account/device-dto.ts", import.meta.url), "utf8");
  assert.match(repository, /ACCOUNT_DEVICE_SELECT = "id,platform,device_name,app_version,last_seen_at,is_active"/);
  assert.match(repository, /listAccountDevices[\s\S]+\.eq\("user_id", userId\)/);
  assert.match(service, /return \{ devices: \(data \?\? \[\]\)\.map/);
  assert.doesNotMatch(dto, /expo_push_token|ExpoPushToken|token_hash|token_last_four|installation_id|installationId|user_id/i);
});

test("DELETE valide JWT, ownership et retourne un 404 g\u00e9n\u00e9rique", async () => {
  const route = await readFile(new URL("../app/api/me/devices/[deviceId]/route.ts", import.meta.url), "utf8");
  const repository = await readFile(new URL("../lib/account/repository.ts", import.meta.url), "utf8");
  const service = await readFile(new URL("../lib/account/service.ts", import.meta.url), "utf8");
  assert.match(route, /requireAuthenticatedUser\(request\)[\s\S]+account_unlink_device[\s\S]+validateAccountDeviceId/);
  assert.match(repository, /detachAccountDevice[\s\S]+update\(\{ user_id: null \}\)\.eq\("id", deviceId\)\.eq\("user_id", userId\)/);
  assert.match(service, /if \(!data\) throw new AccountError\(404, "device_not_found", "Appareil non trouv\u00e9\."\)/);
  assert.doesNotMatch(service, /appartient \u00e0|associ\u00e9 \u00e0 user/i);
});

test("remote unlink ne modifie que user_id et pr\u00e9serve lost phone A2 et toutes les subscriptions", async () => {
  const repository = await readFile(new URL("../lib/account/repository.ts", import.meta.url), "utf8");
  const operation = repository.match(/export function detachAccountDevice[\s\S]+?\n\}/)?.[0] ?? "";
  assert.match(operation, /update\(\{ user_id: null \}\)/);
  assert.doesNotMatch(operation, /delete\(|expo_push_token|notifications_enabled|notify_|disabled_at|installation_id|push_device_program_subscriptions|user_program_subscriptions/i);
  assert.match(operation, /\.eq\("id", deviceId\)\.eq\("user_id", userId\)/);
});

test("routes devices sont dynamiques, rate-limit\u00e9es et no-store y compris CDN", async () => {
  const listRoute = await readFile(new URL("../app/api/me/devices/route.ts", import.meta.url), "utf8");
  const deleteRoute = await readFile(new URL("../app/api/me/devices/[deviceId]/route.ts", import.meta.url), "utf8");
  const http = await readFile(new URL("../lib/account/http.ts", import.meta.url), "utf8");
  assert.match(listRoute, /dynamic = "force-dynamic"/);
  assert.match(deleteRoute, /dynamic = "force-dynamic"/);
  assert.match(listRoute, /enforceAccountRateLimit/);
  assert.match(deleteRoute, /enforceAccountRateLimit/);
  assert.match(http, /"Cache-Control": "private, no-store, max-age=0"/);
  assert.match(http, /"CDN-Cache-Control": "no-store"/);
  assert.match(http, /"Vercel-CDN-Cache-Control": "no-store"/);
  assert.match(deleteRoute, /ACCOUNT_NO_STORE_HEADERS/);
});
