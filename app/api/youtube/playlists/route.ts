import { getPlaylists } from "@/lib/youtube/service";
import {
  STANDARD_CACHE_CONTROL,
  youtubeError,
  youtubeSuccess,
} from "@/lib/youtube/route";
import type { Playlist } from "@/lib/youtube/types";

export const runtime = "nodejs";

export async function GET() {
  try {
    return youtubeSuccess(await getPlaylists(), STANDARD_CACHE_CONTROL);
  } catch (error) {
    return youtubeError<Playlist[]>(error);
  }
}
