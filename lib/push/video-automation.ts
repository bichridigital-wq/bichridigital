import type { PublicVideoUpload } from "../youtube/video-uploads";

const YOUTUBE_VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

export const VIDEO_PUBLISHED_TITLE = "Nouvelle vidéo Bichridigital 🎬";
export const VIDEO_PUBLISHED_FALLBACK_BODY =
  "Une nouvelle vidéo Bichridigital vient d’être publiée.";

export type VideoAutomationState = {
  lastSeenVideoId: string;
  lastSeenPublishedAt: string;
};

export type VideoPublishedNotification = {
  requestKey: string;
  youtubeVideoId: string;
  publishedAt: string;
  title: string;
  body: string;
  data: { type: "video"; videoId: string };
};

export type VideoPublishedCheckResult =
  | { outcome: "source_error" }
  | { outcome: "baseline_initialized" }
  | { outcome: "disabled" }
  | { outcome: "no_new_video" }
  | { outcome: "duplicate"; duplicates: number }
  | {
      outcome: "processed";
      processed: number;
      duplicates: number;
      requested: number;
      accepted: number;
      failed: number;
    };

export function videoPublishedNotification(
  video: PublicVideoUpload,
): VideoPublishedNotification | null {
  if (
    !YOUTUBE_VIDEO_ID_PATTERN.test(video.id) ||
    !Number.isFinite(Date.parse(video.publishedAt))
  ) {
    return null;
  }
  return {
    requestKey: `video-published:${video.id}`,
    youtubeVideoId: video.id,
    publishedAt: video.publishedAt,
    title: VIDEO_PUBLISHED_TITLE,
    body: video.title.trim() || VIDEO_PUBLISHED_FALLBACK_BODY,
    data: { type: "video", videoId: video.id },
  };
}

export async function runVideoPublishedCheck<TClaim>(input: {
  enabled: boolean;
  maxPerPoll?: number;
  getRecentUploads: () => Promise<PublicVideoUpload[]>;
  getState: () => Promise<VideoAutomationState | null>;
  advanceState: (video: PublicVideoUpload) => Promise<void>;
  claim: (notification: VideoPublishedNotification) => Promise<TClaim | null>;
  send: (
    claim: TClaim,
    notification: VideoPublishedNotification,
  ) => Promise<{ requested: number; accepted: number; failed: number }>;
}): Promise<VideoPublishedCheckResult> {
  let uploads: PublicVideoUpload[];
  try {
    uploads = (await input.getRecentUploads())
      .filter((video) => videoPublishedNotification(video) !== null)
      .sort((left, right) => Date.parse(left.publishedAt) - Date.parse(right.publishedAt));
  } catch {
    return { outcome: "source_error" };
  }

  if (uploads.length === 0) return { outcome: "no_new_video" };
  const state = await input.getState();
  const newest = uploads.at(-1)!;

  if (!state) {
    await input.advanceState(newest);
    return { outcome: "baseline_initialized" };
  }

  if (!input.enabled) {
    if (Date.parse(newest.publishedAt) > Date.parse(state.lastSeenPublishedAt)) {
      await input.advanceState(newest);
    }
    return { outcome: "disabled" };
  }

  const limit = Math.min(5, Math.max(1, input.maxPerPoll ?? 5));
  const candidates = uploads
    .filter((video) => Date.parse(video.publishedAt) > Date.parse(state.lastSeenPublishedAt))
    .slice(0, limit);
  if (candidates.length === 0) return { outcome: "no_new_video" };

  let processed = 0;
  let duplicates = 0;
  let requested = 0;
  let accepted = 0;
  let failed = 0;

  for (const video of candidates) {
    const notification = videoPublishedNotification(video)!;
    const claim = await input.claim(notification);
    if (!claim) {
      duplicates += 1;
      await input.advanceState(video);
      continue;
    }
    const counts = await input.send(claim, notification);
    processed += 1;
    requested += counts.requested;
    accepted += counts.accepted;
    failed += counts.failed;
    await input.advanceState(video);
  }

  if (processed === 0) return { outcome: "duplicate", duplicates };
  return { outcome: "processed", processed, duplicates, requested, accepted, failed };
}
