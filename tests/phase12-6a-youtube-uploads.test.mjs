import assert from "node:assert/strict";
import test from "node:test";
import {
  publicVideoUploads,
  recentUploadIds,
  uploadVideoDetailsParameters,
  uploadsChannelParameters,
  uploadsPlaylistParameters,
} from "../lib/youtube/video-uploads.ts";

const channelId = "UC0000000000000000000000";

test("la source utilise channels puis la playlist officielle des uploads", () => {
  assert.deepEqual(uploadsChannelParameters(channelId), {
    part: "contentDetails",
    id: channelId,
  });
  assert.deepEqual(uploadsPlaylistParameters("UUuploads", 10), {
    part: "snippet,contentDetails,status",
    playlistId: "UUuploads",
    maxResults: 10,
  });
  assert.deepEqual(uploadVideoDetailsParameters(["abcdefghijk"]), {
    part: "snippet,status,liveStreamingDetails",
    id: "abcdefghijk",
  });
});

test("une playlist vide ne produit aucun candidat", () => {
  assert.deepEqual(recentUploadIds([]), []);
  assert.deepEqual(publicVideoUploads([], channelId), []);
});

test("les videoId absents ou invalides sont exclus", () => {
  assert.deepEqual(recentUploadIds([
    {},
    { contentDetails: { videoId: "court" } },
    { snippet: { resourceId: { videoId: "abcdefghijk" } } },
  ]), ["abcdefghijk"]);
});

test("une vidéo normale publique et un Short restent éligibles", () => {
  const items = ["normalvid01", "shortvideo1"].map((id, index) => ({
    id,
    snippet: {
      channelId,
      title: index ? "Short public" : "Vidéo publique",
      publishedAt: `2026-08-0${index + 1}T12:00:00Z`,
    },
    status: { privacyStatus: "public" },
  }));
  assert.deepEqual(publicVideoUploads(items, channelId).map((item) => item.id), [
    "normalvid01",
    "shortvideo1",
  ]);
});

test("privée, autre chaîne, date invalide et archive de live sont exclues", () => {
  const base = {
    id: "abcdefghijk",
    snippet: { channelId, title: "Titre", publishedAt: "2026-08-08T12:00:00Z" },
    status: { privacyStatus: "public" },
  };
  assert.equal(publicVideoUploads([{ ...base, status: { privacyStatus: "private" } }], channelId).length, 0);
  assert.equal(publicVideoUploads([{ ...base, snippet: { ...base.snippet, channelId: "other" } }], channelId).length, 0);
  assert.equal(publicVideoUploads([{ ...base, snippet: { ...base.snippet, publishedAt: "invalide" } }], channelId).length, 0);
  assert.equal(publicVideoUploads([{ ...base, liveStreamingDetails: { actualEndTime: "2026-08-08T13:00:00Z" } }], channelId).length, 0);
});

test("plusieurs uploads sont triés du plus ancien au plus récent", () => {
  const make = (id, publishedAt) => ({
    id,
    snippet: { channelId, title: id, publishedAt },
    status: { privacyStatus: "public" },
  });
  const result = publicVideoUploads([
    make("newestvid01", "2026-08-08T12:03:00Z"),
    make("oldestvid01", "2026-08-08T12:01:00Z"),
    make("middlevid01", "2026-08-08T12:02:00Z"),
  ], channelId);
  assert.deepEqual(result.map((item) => item.id), ["oldestvid01", "middlevid01", "newestvid01"]);
});
