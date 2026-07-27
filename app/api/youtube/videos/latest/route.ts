import { getLatestVideos } from "@/lib/youtube/service";
import {
  STANDARD_CACHE_CONTROL,
  youtubeError,
  youtubeSuccess,
} from "@/lib/youtube/route";
import type { Video } from "@/lib/youtube/types";

export const runtime = "nodejs";

export async function GET() {
  try {
    return youtubeSuccess(await getLatestVideos(), STANDARD_CACHE_CONTROL);
  } catch (error) {
    return youtubeError<Video[]>(error);
  }
}
