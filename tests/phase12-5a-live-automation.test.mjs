import assert from "node:assert/strict";
import test from "node:test";
import {
  LIVE_START_FALLBACK_BODY,
  LIVE_START_TITLE,
  hasPushToken,
  liveStartNotification,
  runLiveStartCheck,
} from "../lib/push/live-automation.ts";
import { isDeviceEligible } from "../lib/push/policy.ts";
import { receiptState } from "../lib/push/delivery-state.ts";

const LIVE = {
  id: "abcdefghijk",
  title: "Le véritable titre YouTube",
  description: "",
  thumbnailUrl: "",
  scheduledStartTime: "2026-08-08T12:00:00Z",
  actualStartTime: "2026-08-08T12:01:00Z",
  status: "live",
};

for (const value of [null, { ...LIVE, status: "upcoming" }, { ...LIVE, status: "completed" }]) {
  test(`${value?.status ?? "offline"} ne produit aucune notification`, () => {
    assert.equal(liveStartNotification(value), null);
  });
}

test("un live valide utilise le titre YouTube et le payload live", () => {
  assert.deepEqual(liveStartNotification(LIVE), {
    requestKey: "live-start:abcdefghijk",
    youtubeVideoId: "abcdefghijk",
    title: LIVE_START_TITLE,
    body: LIVE.title,
    data: { type: "live" },
  });
});

test("un titre vide utilise exclusivement le fallback", () => {
  assert.equal(liveStartNotification({ ...LIVE, title: "   " }).body, LIVE_START_FALLBACK_BODY);
});

test("un live sans identifiant YouTube fiable est ignoré", () => {
  assert.equal(liveStartNotification({ ...LIVE, id: "trop-court" }), null);
});

test("automation OFF vérifie la source sans réserver ni envoyer", async () => {
  let claims = 0;
  let sends = 0;
  const result = await runLiveStartCheck({
    enabled: false,
    getLiveBroadcast: async () => LIVE,
    claim: async () => { claims += 1; return "batch"; },
    send: async () => { sends += 1; return { requested: 1, accepted: 1, failed: 0 }; },
  });
  assert.equal(result.outcome, "disabled");
  assert.equal(claims, 0);
  assert.equal(sends, 0);
});

test("une erreur YouTube ne crée aucun batch", async () => {
  let claims = 0;
  const result = await runLiveStartCheck({
    enabled: true,
    getLiveBroadcast: async () => { throw new Error("YouTube indisponible"); },
    claim: async () => { claims += 1; return "batch"; },
    send: async () => ({ requested: 0, accepted: 0, failed: 0 }),
  });
  assert.equal(result.outcome, "source_error");
  assert.equal(claims, 0);
});

test("un live déjà traité ne déclenche aucun doublon", async () => {
  let sends = 0;
  const result = await runLiveStartCheck({
    enabled: true,
    getLiveBroadcast: async () => LIVE,
    claim: async () => null,
    send: async () => { sends += 1; return { requested: 1, accepted: 1, failed: 0 }; },
  });
  assert.equal(result.outcome, "duplicate");
  assert.equal(sends, 0);
});

test("deux checks concurrents ne produisent qu’une notification logique", async () => {
  let claimed = false;
  let sends = 0;
  const dependencies = {
    enabled: true,
    getLiveBroadcast: async () => LIVE,
    claim: async () => {
      if (claimed) return null;
      claimed = true;
      return "batch";
    },
    send: async () => { sends += 1; return { requested: 1, accepted: 1, failed: 0 }; },
  };
  const outcomes = await Promise.all([runLiveStartCheck(dependencies), runLiveStartCheck(dependencies)]);
  assert.deepEqual(outcomes.map((result) => result.outcome).sort(), ["duplicate", "sent"]);
  assert.equal(sends, 1);
});

test("tous les critères d’audience sont obligatoires", () => {
  const eligible = {
    is_active: true,
    notifications_enabled: true,
    notify_new_videos: true,
    notify_live_starts: true,
    notify_followed_emissions: true,
  };
  assert.equal(isDeviceEligible(eligible, { type: "live" }), true);
  assert.equal(isDeviceEligible({ ...eligible, notifications_enabled: false }, { type: "live" }), false);
  assert.equal(isDeviceEligible({ ...eligible, notify_live_starts: false }, { type: "live" }), false);
  assert.equal(isDeviceEligible({ ...eligible, is_active: false }, { type: "live" }), false);
});

test("un token absent est exclu de l’audience", () => {
  assert.equal(hasPushToken(null), false);
  assert.equal(hasPushToken(""), false);
  assert.equal(hasPushToken("   "), false);
  assert.equal(hasPushToken("ExponentPushToken[fixture]"), true);
});

test("DeviceNotRegistered conserve la logique de désactivation existante", () => {
  assert.equal(receiptState({
    status: "error",
    message: "gone",
    details: { error: "DeviceNotRegistered" },
  }).disableDevice, true);
});

test("aucun token n’entre dans les résultats ou logs du check", async () => {
  const token = "ExponentPushToken[secretfixturetoken]";
  const result = await runLiveStartCheck({
    enabled: true,
    getLiveBroadcast: async () => LIVE,
    claim: async () => "batch",
    send: async () => ({ requested: 1, accepted: 1, failed: 0 }),
  });
  assert.equal(JSON.stringify(result).includes(token), false);
});
