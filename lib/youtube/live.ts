import type { LiveBroadcast } from "./types";

export type LiveEventType = "live" | "upcoming";

type ThumbnailSet = Record<string, { url?: string } | undefined>;

export type LiveSearchItem = {
  id?: { videoId?: string };
  snippet?: {
    title?: string;
    description?: string;
    publishedAt?: string;
    liveBroadcastContent?: string;
    thumbnails?: ThumbnailSet;
  };
};

export function liveSearchParameters(
  channelId: string,
  eventType: LiveEventType,
) {
  return {
    part: "snippet",
    channelId,
    eventType,
    type: "video",
    maxResults: 1,
    order: "date",
  } as const;
}

export function mapLiveSearchItem(
  item: LiveSearchItem | undefined,
  eventType: LiveEventType,
): LiveBroadcast | null {
  const id = item?.id?.videoId;
  const snippet = item?.snippet;
  if (!id || !snippet || snippet.liveBroadcastContent !== eventType) return null;

  const thumbnails = snippet.thumbnails;
  return {
    id,
    title: snippet.title ?? "",
    description: snippet.description ?? "",
    thumbnailUrl:
      thumbnails?.maxres?.url ??
      thumbnails?.standard?.url ??
      thumbnails?.high?.url ??
      thumbnails?.medium?.url ??
      thumbnails?.default?.url ??
      "",
    scheduledStartTime: snippet.publishedAt ?? "",
    status: eventType,
  };
}
