import type { LiveBroadcast } from "./types";

const YOUTUBE_VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

type ThumbnailSet = Record<string, { url?: string } | undefined>;

export type YouTubeUploadVideoItem = {
  id?: string;
  snippet?: {
    channelId?: string;
    title?: string;
    description?: string;
    publishedAt?: string;
    liveBroadcastContent?: string;
    thumbnails?: ThumbnailSet;
  };
  status?: {
    privacyStatus?: string;
  };
  liveStreamingDetails?: {
    scheduledStartTime?: string;
    actualStartTime?: string;
    actualEndTime?: string;
  };
};

export type PublicVideoUpload = {
  id: string;
  title: string;
  publishedAt: string;
};

function thumbnailUrl(thumbnails?: ThumbnailSet): string {
  return (
    thumbnails?.maxres?.url ??
    thumbnails?.standard?.url ??
    thumbnails?.high?.url ??
    thumbnails?.medium?.url ??
    thumbnails?.default?.url ??
    ""
  );
}

export function uploadsChannelParameters(channelId: string) {
  return { part: "contentDetails", id: channelId } as const;
}

export function uploadsPlaylistParameters(playlistId: string, maxResults = 10) {
  return {
    part: "snippet,contentDetails,status",
    playlistId,
    maxResults,
  } as const;
}

export function uploadVideoDetailsParameters(ids: string[]) {
  return {
    part: "snippet,status,liveStreamingDetails",
    id: ids.join(","),
  } as const;
}

export function recentUploadIds(items: Array<{
  contentDetails?: { videoId?: string };
  snippet?: { resourceId?: { videoId?: string } };
}> | undefined): string[] {
  return [...new Set((items ?? []).flatMap((item) => {
    const id = item.contentDetails?.videoId ?? item.snippet?.resourceId?.videoId;
    return id && YOUTUBE_VIDEO_ID_PATTERN.test(id) ? [id] : [];
  }))];
}

export function publicVideoUploads(
  items: YouTubeUploadVideoItem[] | undefined,
  channelId: string,
): PublicVideoUpload[] {
  return (items ?? []).flatMap((item) => {
    const id = item.id;
    const snippet = item.snippet;
    const publishedAt = snippet?.publishedAt;
    if (
      !id ||
      !YOUTUBE_VIDEO_ID_PATTERN.test(id) ||
      !snippet ||
      snippet.channelId !== channelId ||
      item.status?.privacyStatus !== "public" ||
      !publishedAt ||
      !Number.isFinite(Date.parse(publishedAt)) ||
      item.liveStreamingDetails !== undefined
    ) {
      return [];
    }
    return [{ id, title: snippet.title ?? "", publishedAt }];
  }).sort((left, right) =>
    Date.parse(left.publishedAt) - Date.parse(right.publishedAt)
    || left.id.localeCompare(right.id)
  );
}

function mapBroadcast(
  item: YouTubeUploadVideoItem,
  channelId: string,
  status: "live" | "upcoming",
): LiveBroadcast | null {
  const id = item.id;
  const snippet = item.snippet;
  if (
    !id ||
    !YOUTUBE_VIDEO_ID_PATTERN.test(id) ||
    !snippet ||
    snippet.channelId !== channelId ||
    item.status?.privacyStatus !== "public" ||
    snippet.liveBroadcastContent !== status
  ) {
    return null;
  }

  return {
    id,
    title: snippet.title ?? "",
    description: snippet.description ?? "",
    thumbnailUrl: thumbnailUrl(snippet.thumbnails),
    scheduledStartTime:
      item.liveStreamingDetails?.scheduledStartTime ?? snippet.publishedAt ?? "",
    ...(item.liveStreamingDetails?.actualStartTime
      ? { actualStartTime: item.liveStreamingDetails.actualStartTime }
      : {}),
    status,
  };
}

export function quotaSafeBroadcast(
  items: YouTubeUploadVideoItem[] | undefined,
  channelId: string,
): LiveBroadcast | null {
  for (const status of ["live", "upcoming"] as const) {
    for (const item of items ?? []) {
      const broadcast = mapBroadcast(item, channelId, status);
      if (broadcast) return broadcast;
    }
  }
  return null;
}
