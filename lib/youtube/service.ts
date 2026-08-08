import "server-only";

import {
  getYouTubeChannelId,
  youtubeRequest,
  YouTubeInvalidResponseError,
} from "./client";
import {
  liveSearchParameters,
  mapLiveSearchItem,
  type LiveEventType,
  type LiveSearchItem,
} from "./live";
import type { LiveBroadcast, Playlist, Video } from "./types";

const DEFAULT_VIDEO_LIMIT = 12;
const YOUTUBE_PAGE_LIMIT = 50;
const PLAYLIST_LIMIT = 25;
const STANDARD_CACHE_SECONDS = 300;

type ThumbnailSet = Record<string, { url?: string } | undefined>;
type Snippet = {
  title?: string;
  description?: string;
  channelTitle?: string;
  publishedAt?: string;
  thumbnails?: ThumbnailSet;
  resourceId?: { videoId?: string };
};
type PageInfo = { totalResults?: number };
type ChannelItem = {
  id?: string;
  snippet?: Snippet;
  contentDetails?: { relatedPlaylists?: { uploads?: string } };
};
type PlaylistItem = {
  snippet?: Snippet;
  contentDetails?: { videoId?: string };
};
type PlaylistItemsResponse = {
  items?: PlaylistItem[];
  nextPageToken?: string;
};
type VideoItem = {
  id?: string;
  snippet?: Snippet;
  contentDetails?: { duration?: string };
  liveStreamingDetails?: {
    scheduledStartTime?: string;
    actualStartTime?: string;
    actualEndTime?: string;
  };
};
type PlaylistResource = {
  id?: string;
  snippet?: Snippet;
  contentDetails?: { itemCount?: number };
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

function mapVideo(item: VideoItem, playlistId?: string): Video | null {
  if (!item.id || !item.snippet) return null;
  return {
    id: item.id,
    title: item.snippet.title ?? "",
    description: item.snippet.description ?? "",
    thumbnailUrl: thumbnailUrl(item.snippet.thumbnails),
    publishedAt: item.snippet.publishedAt ?? "",
    duration: item.contentDetails?.duration ?? "PT0S",
    channelTitle: item.snippet.channelTitle ?? "",
    ...(playlistId ? { playlistId } : {}),
    isLive:
      Boolean(item.liveStreamingDetails?.actualStartTime) &&
      !item.liveStreamingDetails?.actualEndTime,
  };
}

async function getVideoDetails(ids: string[], playlistId?: string): Promise<Video[]> {
  if (ids.length === 0) return [];

  const detailPages = await Promise.all(
    Array.from({ length: Math.ceil(ids.length / YOUTUBE_PAGE_LIMIT) }, (_, index) => {
      const pageIds = ids.slice(
        index * YOUTUBE_PAGE_LIMIT,
        (index + 1) * YOUTUBE_PAGE_LIMIT
      );
      return youtubeRequest<{ items?: VideoItem[] }>(
        "videos",
        {
          part: "snippet,contentDetails,liveStreamingDetails",
          id: pageIds.join(","),
          maxResults: pageIds.length,
        },
        { revalidate: STANDARD_CACHE_SECONDS, tags: ["youtube-videos"] }
      );
    })
  );
  const byId = new Map(
    detailPages.flatMap((response) => response.items ?? []).map((item) => [item.id, item])
  );
  return ids
    .map((id) => byId.get(id))
    .map((item) => (item ? mapVideo(item, playlistId) : null))
    .filter((video): video is Video => video !== null);
}

export async function getChannel(): Promise<ChannelItem> {
  const response = await youtubeRequest<{ items?: ChannelItem[] }>(
    "channels",
    { part: "snippet,contentDetails", id: getYouTubeChannelId() },
    { revalidate: 3600, tags: ["youtube-channel"] }
  );
  const channel = response.items?.[0];
  if (!channel) throw new Error("YOUTUBE_CHANNEL_NOT_FOUND");
  return channel;
}

export async function getUploadsPlaylistId(): Promise<string> {
  const uploadsId = (await getChannel()).contentDetails?.relatedPlaylists?.uploads;
  if (!uploadsId) throw new Error("YOUTUBE_UPLOADS_PLAYLIST_NOT_FOUND");
  return uploadsId;
}

export async function getLatestVideos(
  limit = DEFAULT_VIDEO_LIMIT
): Promise<Video[]> {
  return getPlaylistVideos(await getUploadsPlaylistId(), limit);
}

/**
 * Règle temporaire : les vidéos mises en avant sont les six publications
 * les plus récentes de la chaîne, dans l'ordre de la playlist uploads.
 */
export async function getFeaturedVideos(): Promise<Video[]> {
  return getLatestVideos(6);
}

export async function getPlaylists(): Promise<Playlist[]> {
  const response = await youtubeRequest<{
    items?: PlaylistResource[];
    pageInfo?: PageInfo;
  }>(
    "playlists",
    {
      part: "snippet,contentDetails",
      channelId: getYouTubeChannelId(),
      maxResults: PLAYLIST_LIMIT,
    },
    { revalidate: 900, tags: ["youtube-playlists"] }
  );

  return (response.items ?? []).flatMap((item) =>
    item.id && item.snippet
      ? [{
          id: item.id,
          title: item.snippet.title ?? "",
          description: item.snippet.description ?? "",
          thumbnailUrl: thumbnailUrl(item.snippet.thumbnails),
          itemCount: item.contentDetails?.itemCount ?? 0,
        }]
      : []
  );
}

export async function getPlaylistVideos(
  playlistId: string,
  limit?: number
): Promise<Video[]> {
  const requestedLimit =
    limit === undefined ? undefined : Math.max(1, Math.trunc(limit));
  const ids: string[] = [];
  const seenVideoIds = new Set<string>();
  const seenPageTokens = new Set<string>();
  let pageToken: string | undefined;

  do {
    if (pageToken) {
      if (seenPageTokens.has(pageToken)) {
        throw new YouTubeInvalidResponseError();
      }
      seenPageTokens.add(pageToken);
    }

    const remaining =
      requestedLimit === undefined ? YOUTUBE_PAGE_LIMIT : requestedLimit - ids.length;
    const response: PlaylistItemsResponse =
      await youtubeRequest<PlaylistItemsResponse>(
        "playlistItems",
        {
          part: "snippet,contentDetails",
          playlistId,
          maxResults: Math.min(YOUTUBE_PAGE_LIMIT, remaining),
          ...(pageToken ? { pageToken } : {}),
        },
        { revalidate: STANDARD_CACHE_SECONDS, tags: ["youtube-playlist-items"] }
      );

    if (
      !response ||
      !Array.isArray(response.items) ||
      (response.nextPageToken !== undefined &&
        typeof response.nextPageToken !== "string")
    ) {
      throw new YouTubeInvalidResponseError();
    }

    for (const item of response.items) {
      const videoId =
        item.contentDetails?.videoId ?? item.snippet?.resourceId?.videoId;
      if (!videoId || seenVideoIds.has(videoId)) continue;
      seenVideoIds.add(videoId);
      ids.push(videoId);
      if (requestedLimit !== undefined && ids.length >= requestedLimit) break;
    }

    pageToken = response.nextPageToken || undefined;
  } while (
    pageToken &&
    (requestedLimit === undefined || ids.length < requestedLimit)
  );

  return getVideoDetails(ids, playlistId);
}

async function findBroadcast(eventType: LiveEventType): Promise<LiveBroadcast | null> {
  const search = await youtubeRequest<{ items?: LiveSearchItem[] }>(
    "search",
    liveSearchParameters(getYouTubeChannelId(), eventType),
    { cache: "no-store" }
  );
  const broadcast = mapLiveSearchItem(search.items?.[0], eventType);
  if (!broadcast) return null;

  const details = await youtubeRequest<{ items?: VideoItem[] }>(
    "videos",
    { part: "snippet,liveStreamingDetails", id: broadcast.id },
    { cache: "no-store" }
  );
  const item = details.items?.[0];
  if (!item?.id || !item.snippet) return broadcast;
  const live = item.liveStreamingDetails;
  return {
    id: item.id,
    title: item.snippet.title ?? "",
    description: item.snippet.description ?? "",
    thumbnailUrl: thumbnailUrl(item.snippet.thumbnails),
    scheduledStartTime:
      live?.scheduledStartTime ?? item.snippet.publishedAt ?? "",
    ...(live?.actualStartTime ? { actualStartTime: live.actualStartTime } : {}),
    status: eventType,
  };
}

export async function getLiveBroadcast(): Promise<LiveBroadcast | null> {
  return (await findBroadcast("live")) ?? findBroadcast("upcoming");
}
