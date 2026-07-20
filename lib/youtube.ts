import "server-only";

const CHANNEL_ID = "UCrm-wKWYVhHX5S7usD6jMKQ";
const FALLBACK_VIDEO_ID = "1BsxzOBSvQM";
const FALLBACK_TITLE = "Vidéo de Bichridigital";
const API_BASE_URL = "https://www.googleapis.com/youtube/v3";
const FETCH_OPTIONS: RequestInit = {
  next: {
    revalidate: 300,
    tags: ["bichridigital-youtube-latest"],
  },
};

type RegionRestriction = { allowed?: string[]; blocked?: string[] };
type ChannelsResponse = {
  items?: Array<{
    contentDetails?: { relatedPlaylists?: { uploads?: string } };
  }>;
};
type PlaylistItemsResponse = {
  items?: Array<{
    contentDetails?: { videoId?: string };
    snippet?: { resourceId?: { videoId?: string } };
  }>;
};
type VideosResponse = {
  items?: Array<{
    id?: string;
    snippet?: { title?: string };
    status?: { privacyStatus?: string; embeddable?: boolean; uploadStatus?: string };
    contentDetails?: { regionRestriction?: RegionRestriction };
  }>;
};

export type BichridigitalVideo = { videoId: string; title: string };

const fallback: BichridigitalVideo = {
  videoId: FALLBACK_VIDEO_ID,
  title: FALLBACK_TITLE,
};

async function youtubeFetch<T>(
  path: string,
  parameters: Record<string, string>,
  apiKey: string
): Promise<T> {
  const search = new URLSearchParams(parameters);
  const response = await fetch(`${API_BASE_URL}/${path}?${search.toString()}`, {
    ...FETCH_OPTIONS,
    headers: { "X-Goog-Api-Key": apiKey },
  });
  if (!response.ok) throw new Error("La requête YouTube a échoué.");
  return response.json() as Promise<T>;
}

function isAvailableInSenegal(restriction?: RegionRestriction) {
  if (!restriction) return true;
  if (restriction.blocked?.includes("SN")) return false;
  return !restriction.allowed || restriction.allowed.includes("SN");
}

export async function getLatestBichridigitalVideo(): Promise<BichridigitalVideo> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return fallback;

  try {
    const channels = await youtubeFetch<ChannelsResponse>(
      "channels",
      {
        part: "contentDetails",
        id: CHANNEL_ID,
      },
      apiKey
    );
    const uploadsPlaylist = channels.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
    if (!uploadsPlaylist) return fallback;

    const playlist = await youtubeFetch<PlaylistItemsResponse>(
      "playlistItems",
      {
        part: "snippet,contentDetails",
        playlistId: uploadsPlaylist,
        maxResults: "10",
      },
      apiKey
    );
    const videoIds = (playlist.items ?? [])
      .map((item) => item.contentDetails?.videoId ?? item.snippet?.resourceId?.videoId)
      .filter((id): id is string => typeof id === "string" && /^[A-Za-z0-9_-]{11}$/.test(id));
    if (videoIds.length === 0) return fallback;

    const videos = await youtubeFetch<VideosResponse>("videos", {
      part: "status,contentDetails,snippet",
      id: videoIds.join(","),
    }, apiKey);
    const videosById = new Map((videos.items ?? []).map((video) => [video.id, video]));

    for (const videoId of videoIds) {
      const video = videosById.get(videoId);
      if (
        video?.status?.privacyStatus === "public" &&
        video.status.embeddable === true &&
        video.status.uploadStatus === "processed" &&
        isAvailableInSenegal(video.contentDetails?.regionRestriction)
      ) {
        return {
          videoId,
          title: video.snippet?.title?.trim() || FALLBACK_TITLE,
        };
      }
    }
  } catch {
    // Une erreur API ne doit jamais empêcher l’affichage du lecteur de secours.
  }

  return fallback;
}
