import "server-only";

import { NextResponse } from "next/server";
import {
  YouTubeApiError,
  YouTubeConfigurationError,
  YouTubeInvalidResponseError,
  YouTubeTimeoutError,
} from "./client";
import type { ApiResponse } from "./types";

export const STANDARD_CACHE_CONTROL =
  "public, s-maxage=300, stale-while-revalidate=600";
export const LIVE_CACHE_CONTROL =
  "public, s-maxage=60, stale-while-revalidate=120";

export function youtubeSuccess<T>(data: T, cacheControl: string) {
  return NextResponse.json<ApiResponse<T>>(
    { data, source: "youtube" },
    { status: 200, headers: { "Cache-Control": cacheControl } }
  );
}

export function youtubeError<T>(error: unknown) {
  let status = 502;
  let message = "Le service YouTube est temporairement indisponible.";

  if (error instanceof YouTubeConfigurationError) {
    status = 503;
    message = "Le service YouTube n’est pas configuré.";
  } else if (error instanceof YouTubeTimeoutError) {
    status = 504;
    message = "Le service YouTube n’a pas répondu à temps.";
  } else if (
    error instanceof YouTubeApiError ||
    error instanceof YouTubeInvalidResponseError
  ) {
    status = 502;
  }

  return NextResponse.json<ApiResponse<T>>(
    { data: null, source: "youtube", error: message },
    { status, headers: { "Cache-Control": "no-store" } }
  );
}

export function invalidPlaylistId<T>() {
  return NextResponse.json<ApiResponse<T>>(
    { data: null, source: "youtube", error: "Identifiant de playlist invalide." },
    { status: 400, headers: { "Cache-Control": "no-store" } }
  );
}

export function isValidPlaylistId(value: string): boolean {
  return /^[A-Za-z0-9_-]{10,80}$/.test(value);
}
