import { getLiveBroadcast } from "@/lib/youtube/service";
import {
  LIVE_CACHE_CONTROL,
  youtubeError,
  youtubeSuccess,
} from "@/lib/youtube/route";
import type { LiveBroadcast } from "@/lib/youtube/types";

export const runtime = "nodejs";

export async function GET() {
  try {
    return youtubeSuccess(await getLiveBroadcast(), LIVE_CACHE_CONTROL);
  } catch (error) {
    return youtubeError<LiveBroadcast | null>(error);
  }
}
