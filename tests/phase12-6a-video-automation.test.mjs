import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { hasValidCronAuthorization } from "../lib/push/cron-auth.ts";
import { isDeviceEligible } from "../lib/push/policy.ts";
import {
  VIDEO_PUBLISHED_FALLBACK_BODY,
  runVideoPublishedCheck,
  videoPublishedNotification,
} from "../lib/push/video-automation.ts";

const videos = [
  { id: "oldestvid01", title: "Ancienne", publishedAt: "2026-08-08T12:01:00Z" },
  { id: "newestvid01", title: "Nouveau titre", publishedAt: "2026-08-08T12:02:00Z" },
];

function dependencies(overrides = {}) {
  const stateUpdates = [];
  let claims = 0;
  let sends = 0;
  return {
    stateUpdates,
    get claims() { return claims; },
    get sends() { return sends; },
    input: {
      enabled: true,
      getRecentUploads: async () => videos,
      getState: async () => ({
        lastSeenVideoId: "previous001",
        lastSeenPublishedAt: "2026-08-08T12:00:00Z",
      }),
      advanceState: async (video) => { stateUpdates.push(video.id); },
      claim: async () => { claims += 1; return `batch-${claims}`; },
      send: async () => { sends += 1; return { requested: 1, accepted: 1, failed: 0 }; },
      ...overrides,
    },
  };
}

test("le premier passage initialise le baseline sans batch ni envoi", async () => {
  const context = dependencies({ getState: async () => null });
  const result = await runVideoPublishedCheck(context.input);
  assert.deepEqual(result, { outcome: "baseline_initialized" });
  assert.equal(context.claims, 0);
  assert.equal(context.sends, 0);
  assert.deepEqual(context.stateUpdates, ["newestvid01"]);
});

for (const enabled of [false, undefined]) {
  test(`safety gate ${String(enabled)} avance le baseline sans Push`, async () => {
    const context = dependencies({ enabled: enabled === true });
    const result = await runVideoPublishedCheck(context.input);
    assert.deepEqual(result, { outcome: "disabled" });
    assert.equal(context.claims, 0);
    assert.equal(context.sends, 0);
    assert.deepEqual(context.stateUpdates, ["newestvid01"]);
  });
}

test("plusieurs nouvelles vidéos sont traitées chronologiquement", async () => {
  const context = dependencies();
  const result = await runVideoPublishedCheck(context.input);
  assert.equal(result.outcome, "processed");
  assert.deepEqual(context.stateUpdates, ["oldestvid01", "newestvid01"]);
  assert.equal(context.sends, 2);
});

test("la limite anti-tempête borne un poll à cinq notifications", async () => {
  const manyVideos = Array.from({ length: 8 }, (_, index) => ({
    id: `videoid${String(index).padStart(4, "0")}`,
    title: `Vidéo ${index}`,
    publishedAt: `2026-08-08T12:${String(index + 1).padStart(2, "0")}:00Z`,
  }));
  const context = dependencies({ getRecentUploads: async () => manyVideos });
  const result = await runVideoPublishedCheck(context.input);
  assert.equal(result.outcome, "processed");
  assert.equal(context.sends, 5);
  assert.deepEqual(context.stateUpdates, manyVideos.slice(0, 5).map((video) => video.id));
});

test("une erreur YouTube est contrôlée sans batch", async () => {
  const context = dependencies({ getRecentUploads: async () => { throw new Error("Google"); } });
  assert.deepEqual(await runVideoPublishedCheck(context.input), { outcome: "source_error" });
  assert.equal(context.claims, 0);
  assert.equal(context.sends, 0);
});

test("le même videoId concurrent ne réserve qu’un batch logique", async () => {
  const claimed = new Set();
  let sends = 0;
  const run = () => runVideoPublishedCheck(dependencies({
    getRecentUploads: async () => [videos[1]],
    claim: async (notification) => {
      if (claimed.has(notification.requestKey)) return null;
      claimed.add(notification.requestKey);
      return "batch";
    },
    send: async () => { sends += 1; return { requested: 1, accepted: 1, failed: 0 }; },
  }).input);
  const results = await Promise.all([run(), run()]);
  assert.equal(claimed.size, 1);
  assert.equal(sends, 1);
  assert.deepEqual(results.map((result) => result.outcome).sort(), ["duplicate", "processed"]);
});

test("notification conserve le titre, le fallback et le payload vidéo", () => {
  const notification = videoPublishedNotification(videos[1]);
  assert.equal(notification?.requestKey, "video-published:newestvid01");
  assert.equal(notification?.body, "Nouveau titre");
  assert.deepEqual(notification?.data, { type: "video", videoId: "newestvid01" });
  assert.equal(videoPublishedNotification({ ...videos[1], title: "   " })?.body, VIDEO_PUBLISHED_FALLBACK_BODY);
});

test("l’audience réutilise exactement notify_new_videos", () => {
  const eligible = {
    is_active: true,
    notifications_enabled: true,
    notify_new_videos: true,
    notify_live_starts: true,
    notify_followed_emissions: true,
  };
  assert.equal(isDeviceEligible(eligible, { type: "video", videoId: "abcdefghijk" }), true);
  assert.equal(isDeviceEligible({ ...eligible, notify_new_videos: false }, { type: "video", videoId: "abcdefghijk" }), false);
  assert.equal(isDeviceEligible({ ...eligible, notifications_enabled: false }, { type: "video", videoId: "abcdefghijk" }), false);
  assert.equal(isDeviceEligible({ ...eligible, is_active: false }, { type: "video", videoId: "abcdefghijk" }), false);
});

test("Authorization refuse secret absent ou incorrect sans le révéler", () => {
  const previous = process.env.CRON_SECRET;
  delete process.env.CRON_SECRET;
  assert.equal(hasValidCronAuthorization(new Request("https://example.test")), false);
  process.env.CRON_SECRET = "fixture-secret";
  assert.equal(hasValidCronAuthorization(new Request("https://example.test", { headers: { authorization: "Bearer wrong" } })), false);
  assert.equal(hasValidCronAuthorization(new Request("https://example.test", { headers: { authorization: "Bearer fixture-secret" } })), true);
  if (previous === undefined) delete process.env.CRON_SECRET;
  else process.env.CRON_SECRET = previous;
});

test("la route retourne 401 et des réponses sans secret", async () => {
  const route = await readFile(
    new URL("../app/api/internal/push/video-check/route.ts", import.meta.url),
    "utf8",
  );
  assert.match(route, /outcome: "unauthorized".*status: 401/s);
  assert.doesNotMatch(route, /YOUTUBE_API_KEY|EXPO_ACCESS_TOKEN|ExpoPushToken|installationId/);
});
