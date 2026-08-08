import type { LiveBroadcast } from "../youtube/types";

const YOUTUBE_VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

export const LIVE_START_TITLE = "Bichridigital est en direct 🔴";
export const LIVE_START_FALLBACK_BODY =
  "Un nouveau direct Bichridigital vient de commencer.";

export type LiveStartNotification = {
  requestKey: string;
  youtubeVideoId: string;
  title: string;
  body: string;
  data: { type: "live" };
};

export type LiveStartCheckResult =
  | { outcome: "source_error" }
  | { outcome: "not_live" }
  | { outcome: "disabled"; youtubeVideoId: string }
  | { outcome: "duplicate"; youtubeVideoId: string }
  | { outcome: "sent"; youtubeVideoId: string; requested: number; accepted: number; failed: number };

export function hasPushToken(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function liveStartNotification(
  broadcast: LiveBroadcast | null,
): LiveStartNotification | null {
  if (
    !broadcast ||
    broadcast.status !== "live" ||
    !YOUTUBE_VIDEO_ID_PATTERN.test(broadcast.id)
  ) {
    return null;
  }

  return {
    requestKey: `live-start:${broadcast.id}`,
    youtubeVideoId: broadcast.id,
    title: LIVE_START_TITLE,
    body: broadcast.title.trim() || LIVE_START_FALLBACK_BODY,
    data: { type: "live" },
  };
}

export async function runLiveStartCheck<TClaim>(input: {
  enabled: boolean;
  getLiveBroadcast: () => Promise<LiveBroadcast | null>;
  claim: (notification: LiveStartNotification) => Promise<TClaim | null>;
  send: (
    claim: TClaim,
    notification: LiveStartNotification,
  ) => Promise<{ requested: number; accepted: number; failed: number }>;
}): Promise<LiveStartCheckResult> {
  let notification: LiveStartNotification | null;
  try {
    notification = liveStartNotification(await input.getLiveBroadcast());
  } catch {
    return { outcome: "source_error" };
  }

  if (!notification) return { outcome: "not_live" };
  if (!input.enabled) {
    return { outcome: "disabled", youtubeVideoId: notification.youtubeVideoId };
  }

  const claim = await input.claim(notification);
  if (!claim) {
    return { outcome: "duplicate", youtubeVideoId: notification.youtubeVideoId };
  }

  const counts = await input.send(claim, notification);
  return {
    outcome: "sent",
    youtubeVideoId: notification.youtubeVideoId,
    ...counts,
  };
}
