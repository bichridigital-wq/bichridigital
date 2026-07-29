import { getPlaylistVideos } from "@/lib/youtube/service";
import {
  invalidLimit,
  invalidPlaylistId,
  isValidPlaylistId,
  STANDARD_CACHE_CONTROL,
  youtubeError,
  youtubeSuccess,
} from "@/lib/youtube/route";
import type { Video } from "@/lib/youtube/types";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";
const MAX_REQUESTED_VIDEOS = 500;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ playlistId: string }> }
) {
  const { playlistId } = await params;
  if (!isValidPlaylistId(playlistId)) return invalidPlaylistId<Video[]>();

  const rawLimit = request.nextUrl.searchParams.get("limit");
  const limit =
    rawLimit === null || !/^\d+$/.test(rawLimit) ? undefined : Number(rawLimit);
  if (
    rawLimit !== null &&
    (!Number.isSafeInteger(limit) || limit === undefined || limit < 1 || limit > MAX_REQUESTED_VIDEOS)
  ) {
    return invalidLimit<Video[]>();
  }

  try {
    return youtubeSuccess(
      await getPlaylistVideos(playlistId, limit),
      STANDARD_CACHE_CONTROL
    );
  } catch (error) {
    return youtubeError<Video[]>(error);
  }
}
