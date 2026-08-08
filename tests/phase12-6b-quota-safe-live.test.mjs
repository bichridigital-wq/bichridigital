import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { quotaSafeBroadcast } from "../lib/youtube/video-uploads.ts";

const channelId = "UC0000000000000000000000";
const base = {
  id: "abcdefghijk",
  snippet: {
    channelId,
    title: "Titre réel",
    publishedAt: "2026-08-08T12:00:00Z",
    liveBroadcastContent: "live",
  },
  status: { privacyStatus: "public" },
};

test("liveBroadcastContent=live suffit sans actualStartTime", () => {
  assert.equal(quotaSafeBroadcast([base], channelId)?.status, "live");
});

test("liveBroadcastContent=upcoming produit un upcoming", () => {
  const upcoming = {
    ...base,
    snippet: { ...base.snippet, liveBroadcastContent: "upcoming" },
    liveStreamingDetails: { scheduledStartTime: "2026-08-09T12:00:00Z" },
  };
  assert.equal(quotaSafeBroadcast([upcoming], channelId)?.status, "upcoming");
});

test("une archive et une vidéo normale ne sont jamais live", () => {
  const none = { ...base, snippet: { ...base.snippet, liveBroadcastContent: "none" } };
  assert.equal(quotaSafeBroadcast([
    { ...none, liveStreamingDetails: { actualEndTime: "2026-08-08T13:00:00Z" } },
    { ...none, id: "normalvid01" },
  ], channelId), null);
});

test("un live actif est prioritaire parmi plusieurs items", () => {
  const upcoming = {
    ...base,
    id: "upcoming001",
    snippet: { ...base.snippet, liveBroadcastContent: "upcoming" },
  };
  const live = { ...base, id: "livevideo01" };
  assert.equal(quotaSafeBroadcast([upcoming, live], channelId)?.id, "livevideo01");
});

test("playlist vide, mauvais channelId, videoId invalide et privé sont exclus", () => {
  assert.equal(quotaSafeBroadcast([], channelId), null);
  assert.equal(quotaSafeBroadcast([{ ...base, snippet: { ...base.snippet, channelId: "other" } }], channelId), null);
  assert.equal(quotaSafeBroadcast([{ ...base, id: "court" }], channelId), null);
  assert.equal(quotaSafeBroadcast([{ ...base, status: { privacyStatus: "private" } }], channelId), null);
});

test("le chemin automatique live-check ne peut atteindre aucun search.list", async () => {
  const files = await Promise.all([
    "../app/api/internal/push/live-check/route.ts",
    "../lib/push/service.ts",
    "../lib/youtube/service.ts",
    "../lib/youtube/video-uploads.ts",
  ].map((path) => readFile(new URL(path, import.meta.url), "utf8")));
  const automaticPath = files.join("\n");
  assert.doesNotMatch(automaticPath, /youtubeRequest\s*<[^>]*>\s*\(\s*["']search["']/s);
  assert.doesNotMatch(automaticPath, /liveSearchParameters|eventType\s*:/);
  assert.match(automaticPath, /uploadsPlaylistParameters/);
  assert.match(automaticPath, /uploadVideoDetailsParameters/);
  assert.doesNotMatch(automaticPath, /YOUTUBE_API_KEY/);
});
