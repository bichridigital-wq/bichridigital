import "server-only";

import { getYouTubeChannelId, youtubeRequest } from "./client";
import type { LiveBroadcast, Playlist, Video } from "./types";

const DEFAULT_VIDEO_LIMIT = 12;
const MAX_VIDEO_LIMIT = 25;
const PLAYLIST_LIMIT = 25;
const STANDARD_CACHE_SECONDS = 300;
const LIVE_CACHE_SECONDS = 60;

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
type SearchItem = { id?: { videoId?: string } };

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

function boundedLimit(limit: number): number {
  return Math.max(1, Math.min(Math.trunc(limit), MAX_VIDEO_LIMIT));
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
  const response = await youtubeRequest<{ items?: VideoItem[] }>(
    "videos",
    {
      part: "snippet,contentDetails,liveStreamingDetails",
      id: ids.join(","),
      maxResults: ids.length,
    },
    { revalidate: STANDARD_CACHE_SECONDS, tags: ["youtube-videos"] }
  );
  const byId = new Map((response.items ?? []).map((item) => [item.id, item]));
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
  limit = DEFAULT_VIDEO_LIMIT
): Promise<Video[]> {
  const maxResults = boundedLimit(limit);
  const response = await youtubeRequest<{ items?: PlaylistItem[] }>(
    "playlistItems",
    {
      part: "snippet,contentDetails",
      playlistId,
      maxResults,
    },
    { revalidate: STANDARD_CACHE_SECONDS, tags: ["youtube-playlist-items"] }
  );
  const ids = (response.items ?? [])
    .map((item) => item.contentDetails?.videoId ?? item.snippet?.resourceId?.videoId)
    .filter((id): id is string => Boolean(id));
  return getVideoDetails(ids, playlistId);
}

async function findBroadcast(eventType: "live" | "upcoming"): Promise<LiveBroadcast | null> {
  const search = await youtubeRequest<{ items?: SearchItem[] }>(
    "search",
    {
      part: "id",
      channelId: getYouTubeChannelId(),
      eventType,
      type: "video",
      maxResults: 1,
      order: "date",
    },
    { revalidate: LIVE_CACHE_SECONDS, tags: ["youtube-live"] }
  );
  const id = search.items?.[0]?.id?.videoId;
  if (!id) return null;

  const details = await youtubeRequest<{ items?: VideoItem[] }>(
    "videos",
    { part: "snippet,liveStreamingDetails", id },
    { revalidate: LIVE_CACHE_SECONDS, tags: ["youtube-live"] }
  );
  const item = details.items?.[0];
  if (!item?.id || !item.snippet) return null;
  const live = item.liveStreamingDetails;
  return {
    id: item.id,
    title: item.snippet.title ?? "",
    description: item.snippet.description ?? "",
    thumbnailUrl: thumbnailUrl(item.snippet.thumbnails),
    scheduledStartTime:
      live?.scheduledStartTime ?? item.snippet.publishedAt ?? "",
    ...(live?.actualStartTime ? { actualStartTime: live.actualStartTime } : {}),
    status: live?.actualEndTime
      ? "completed"
      : live?.actualStartTime
        ? "live"
        : "upcoming",
  };
}

export async function getLiveBroadcast(): Promise<LiveBroadcast | null> {
  return (await findBroadcast("live")) ?? findBroadcast("upcoming");
}
