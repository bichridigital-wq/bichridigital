import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  liveSearchParameters,
  mapLiveSearchItem,
} from "../lib/youtube/live.ts";

const channelId = "UCrm-wKWYVhHX5S7usD6jMKQ";
const liveItem = {
  id: { videoId: "abcdefghijk" },
  snippet: {
    title: "Le véritable titre YouTube",
    description: "Description",
    publishedAt: "2026-08-08T12:00:00Z",
    liveBroadcastContent: "live",
    thumbnails: { high: { url: "https://example.test/live.jpg" } },
  },
};

test("search.list cible les directs vidéo de la chaîne configurée", () => {
  assert.deepEqual(liveSearchParameters(channelId, "live"), {
    part: "snippet",
    channelId,
    eventType: "live",
    type: "video",
    maxResults: 1,
    order: "date",
  });
});

test("items vide retourne null", () => {
  assert.equal(mapLiveSearchItem(undefined, "live"), null);
});

test("le premier item live valide conserve son identifiant et son titre", () => {
  const result = mapLiveSearchItem(liveItem, "live");
  assert.equal(result?.id, "abcdefghijk");
  assert.equal(result?.status, "live");
  assert.equal(result?.title, "Le véritable titre YouTube");
});

test("un item sans videoId ou sans état live cohérent retourne null", () => {
  assert.equal(mapLiveSearchItem({ ...liveItem, id: {} }, "live"), null);
  assert.equal(
    mapLiveSearchItem(
      { ...liveItem, snippet: { ...liveItem.snippet, liveBroadcastContent: "none" } },
      "live",
    ),
    null,
  );
});

test("les lectures live sont explicitement sans cache persistant", async () => {
  const [service, route] = await Promise.all([
    readFile(new URL("../lib/youtube/service.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/youtube/route.ts", import.meta.url), "utf8"),
  ]);
  assert.match(service, /liveSearchParameters\(getYouTubeChannelId\(\), eventType\)/);
  assert.equal((service.match(/cache: "no-store"/g) ?? []).length, 2);
  assert.match(route, /LIVE_CACHE_CONTROL = "no-store"/);
  assert.doesNotMatch(service, /YOUTUBE_API_KEY/);
});
