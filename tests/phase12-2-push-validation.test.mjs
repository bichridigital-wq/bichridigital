import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import { readPushJson } from "../lib/push/request.ts";
import { isDeviceEligible, shouldDisableDevice } from "../lib/push/policy.ts";
import {
  derivePushRequestRateKey,
  maskPushToken,
  PushRateLimitConfigurationError,
} from "../lib/push/security.ts";
import {
  PUSH_BODY_MAX_BYTES,
  validateNavigation,
  validateOwnership,
  validateRegistration,
  validateTestMessage,
} from "../lib/push/validation.ts";

const TOKEN = "Exponent" + "PushToken[" + "abcdefghijklmnopqrstuv" + "]";
const INSTALLATION = "install_mep7p2_abcdefghijklmno1";

function registration(overrides = {}) {
  return {
    installationId: INSTALLATION,
    expoPushToken: TOKEN,
    platform: "android",
    runtimeEnvironment: "production",
    appVersion: "1.0.0",
    device: { brand: "Google", modelName: "Pixel", osName: "Android", osVersion: "16" },
    preferences: {
      notificationsEnabled: true,
      notifyNewVideos: true,
      notifyLiveStarts: true,
      notifyFollowedEmissions: true,
    },
    ...overrides,
  };
}

test("un enregistrement mobile valide est normalisé sans exposer le token", () => {
  const parsed = validateRegistration(registration());
  assert.equal(parsed.deviceName, "Google Pixel");
  assert.deepEqual(parsed.preferences.followedEmissionSlugs, []);
  assert.equal(JSON.stringify({ ok: true }).includes(TOKEN), false);
  assert.equal(maskPushToken(TOKEN), "••••tuv]");
});

test("token Expo, installation et plateforme invalides sont rejetés", () => {
  assert.throws(() => validateRegistration(registration({ expoPushToken: "invalid" })), /ExpoPushToken/i);
  assert.throws(() => validateRegistration(registration({ installationId: "uuid-inattendu" })), /installationId/i);
  assert.throws(() => validateRegistration(registration({ platform: "web" })), /Plateforme/i);
});

test("les préférences et slugs sont stricts et dédupliqués", () => {
  const input = registration();
  input.preferences.followedEmissionSlugs = ["Jotaayu-Bichri", "jotaayu-bichri"];
  assert.deepEqual(validateRegistration(input).preferences.followedEmissionSlugs, ["jotaayu-bichri"]);
  input.preferences.followedEmissionSlugs = ["slug invalide"];
  assert.throws(() => validateRegistration(input), /slug/i);
});

test("les champs inconnus et navigations arbitraires sont rejetés", () => {
  assert.throws(() => validateRegistration({ ...registration(), admin: true }), /Champ inconnu/i);
  assert.throws(() => validateNavigation({ type: "url", url: "https://example.com" }), /Champ inconnu|Destination/i);
  assert.throws(() => validateNavigation({ type: "video", videoId: "court" }), /vidéo/i);
  assert.deepEqual(validateNavigation({ type: "live" }), { type: "live" });
});

test("PATCH et DELETE exigent installationId et ExpoPushToken", () => {
  assert.deepEqual(validateOwnership({ installationId: INSTALLATION, expoPushToken: TOKEN }), {
    installationId: INSTALLATION,
    expoPushToken: TOKEN,
  });
  assert.throws(() => validateOwnership({ installationId: INSTALLATION }), /expoPushToken/i);
});

test("Content-Type et taille HTTP sont contrôlés", async () => {
  await assert.rejects(
    readPushJson(new Request("https://example.test", { method: "POST", body: "{}", headers: { "Content-Type": "text/plain" } })),
    (error) => error.status === 415,
  );
  await assert.rejects(
    readPushJson(new Request("https://example.test", { method: "POST", body: "{}", headers: { "Content-Type": "application/json", "Content-Length": String(PUSH_BODY_MAX_BYTES + 1) } })),
    (error) => error.status === 413,
  );
  await assert.rejects(
    readPushJson(new Request("https://example.test", { method: "POST", body: "x".repeat(PUSH_BODY_MAX_BYTES + 1), headers: { "Content-Type": "application/json" } })),
    (error) => error.status === 413,
  );
});

test("la clé réseau du rate limiting est dérivée et ne contient jamais l’adresse brute", () => {
  const previousSecret = process.env.PUSH_RATE_LIMIT_SECRET;
  process.env.PUSH_RATE_LIMIT_SECRET = "test-rate-limit-secret-at-least-32-bytes";
  const first = derivePushRequestRateKey(new Request("https://example.test", {
    headers: { "x-vercel-forwarded-for": "203.0.113.42, 10.0.0.1" },
  }));
  const second = derivePushRequestRateKey(new Request("https://example.test", {
    headers: { "x-vercel-forwarded-for": "203.0.113.43" },
  }));
  assert.match(first, /^[0-9a-f]{64}$/);
  assert.equal(first.includes("203.0.113.42"), false);
  assert.equal(first, createHmac("sha256", process.env.PUSH_RATE_LIMIT_SECRET)
    .update("network:203.0.113.42", "utf8").digest("hex"));
  assert.notEqual(first, second);
  if (previousSecret === undefined) delete process.env.PUSH_RATE_LIMIT_SECRET;
  else process.env.PUSH_RATE_LIMIT_SECRET = previousSecret;
});

test("la production refuse le rate limiting sans secret serveur", () => {
  const previousNodeEnv = process.env.NODE_ENV;
  const previousSecret = process.env.PUSH_RATE_LIMIT_SECRET;
  process.env.NODE_ENV = "production";
  delete process.env.PUSH_RATE_LIMIT_SECRET;
  assert.throws(
    () => derivePushRequestRateKey(new Request("https://example.test", {
      headers: { "x-vercel-forwarded-for": "203.0.113.42" },
    })),
    PushRateLimitConfigurationError,
  );
  if (previousNodeEnv === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = previousNodeEnv;
  if (previousSecret === undefined) delete process.env.PUSH_RATE_LIMIT_SECRET;
  else process.env.PUSH_RATE_LIMIT_SECRET = previousSecret;
});

test("titre, corps et taille totale de notification sont bornés", () => {
  const base = {
    deviceId: "10000000-0000-4000-8000-000000000001",
    requestKey: "20000000-0000-4000-8000-000000000001",
    title: "Test",
    body: "Message",
    destination: { type: "profile" },
  };
  assert.equal(validateTestMessage(base).title, "Test");
  assert.throws(() => validateTestMessage({ ...base, body: "x".repeat(501) }), /Message/i);
});

test("les appareils et préférences désactivés sont exclus", () => {
  const device = {
    is_active: true,
    notifications_enabled: true,
    notify_new_videos: true,
    notify_live_starts: true,
    notify_followed_emissions: true,
  };
  assert.equal(isDeviceEligible({ ...device, is_active: false }, { type: "profile" }), false);
  assert.equal(isDeviceEligible({ ...device, notifications_enabled: false }, { type: "live" }), false);
  assert.equal(isDeviceEligible({ ...device, notify_live_starts: false }, { type: "live" }), false);
  assert.equal(isDeviceEligible(device, { type: "video", videoId: "abcdefghijk" }), true);
});

test("seul DeviceNotRegistered impose la désactivation", () => {
  assert.equal(shouldDisableDevice("DeviceNotRegistered"), true);
  assert.equal(shouldDisableDevice("MessageRateExceeded"), false);
  assert.equal(shouldDisableDevice("InvalidCredentials"), false);
});
