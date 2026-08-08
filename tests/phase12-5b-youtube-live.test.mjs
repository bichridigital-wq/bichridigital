import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { quotaSafeBroadcast } from "../lib/youtube/video-uploads.ts";

const channelId = "UC0000000000000000000000";
const liveItem = {
  id: "abcdefghijk",
  snippet: {
    channelId,
    title: "Le véritable titre YouTube",
    description: "Description",
    publishedAt: "2026-08-08T12:00:00Z",
    liveBroadcastContent: "live",
    thumbnails: { high: { url: "https://example.test/live.jpg" } },
  },
  status: { privacyStatus: "public" },
  liveStreamingDetails: { scheduledStartTime: "2026-08-08T12:00:00Z" },
};

test("items vide retourne null", () => {
  assert.equal(quotaSafeBroadcast([], channelId), null);
});

test("un live conserve son identifiant et son vrai titre sans actualStartTime", () => {
  const result = quotaSafeBroadcast([liveItem], channelId);
  assert.equal(result?.id, "abcdefghijk");
  assert.equal(result?.status, "live");
  assert.equal(result?.title, "Le véritable titre YouTube");
  assert.equal(result?.actualStartTime, undefined);
});

test("les lectures live fraîches restent explicitement sans cache persistant", async () => {
  const [service, route] = await Promise.all([
    readFile(new URL("../lib/youtube/service.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/youtube/route.ts", import.meta.url), "utf8"),
  ]);
  assert.match(service, /getRecentChannelVideoItems\(10\)/);
  assert.ok((service.match(/cache: "no-store"/g) ?? []).length >= 2);
  assert.match(route, /LIVE_CACHE_CONTROL = "no-store"/);
  assert.doesNotMatch(service, /YOUTUBE_API_KEY/);
});
