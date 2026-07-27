import { getPlaylistVideos } from "@/lib/youtube/service";
import {
  invalidPlaylistId,
  isValidPlaylistId,
  STANDARD_CACHE_CONTROL,
  youtubeError,
  youtubeSuccess,
} from "@/lib/youtube/route";
import type { Video } from "@/lib/youtube/types";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ playlistId: string }> }
) {
  const { playlistId } = await params;
  if (!isValidPlaylistId(playlistId)) return invalidPlaylistId<Video[]>();

  try {
    return youtubeSuccess(
      await getPlaylistVideos(playlistId),
      STANDARD_CACHE_CONTROL
    );
  } catch (error) {
    return youtubeError<Video[]>(error);
  }
}
