import "server-only";

import { createAdminClient } from "./supabase/admin";
import { createClient } from "./supabase/server";
import { TV_NEWS_MEDIA_BUCKET } from "../types/tv-news-media";

const UUID_PATTERN =
  "[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}";

export const TV_NEWS_PUBLIC_SIGNED_URL_TTL = 60 * 60;
export const TV_NEWS_ADMIN_SIGNED_URL_TTL = 15 * 60;

export type TvNewsMediaStorageSource = {
  news_id: string;
  storage_path: string | null;
};

const LEGACY_PUBLIC_PATH =
  `/storage/v1/object/public/${TV_NEWS_MEDIA_BUCKET}/`;

export function validateTvNewsMediaStoragePath(newsId: string, path: string) {
  if (
    path.includes("..") ||
    path.includes("://") ||
    path.startsWith("/") ||
    path.includes("\\")
  ) {
    throw new Error("Chemin Storage invalide.");
  }

  const pattern = new RegExp(
    `^news/${newsId}/${UUID_PATTERN}-[a-zA-Z0-9][a-zA-Z0-9._-]*$`,
    "i"
  );

  if (!pattern.test(path)) {
    throw new Error("Chemin Storage invalide.");
  }
}

export function getLegacyTvNewsMediaStoragePath(
  newsId: string,
  imageUrl: string | null
) {
  if (!imageUrl) return null;

  let url: URL;
  let supabaseUrl: URL;
  try {
    url = new URL(imageUrl);
    supabaseUrl = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "");
  } catch {
    return null;
  }

  if (
    url.origin !== supabaseUrl.origin ||
    !url.pathname.startsWith(LEGACY_PUBLIC_PATH)
  ) {
    return null;
  }

  let storagePath: string;
  try {
    storagePath = decodeURIComponent(url.pathname.slice(LEGACY_PUBLIC_PATH.length));
  } catch {
    throw new Error("URL Storage historique invalide.");
  }

  validateTvNewsMediaStoragePath(newsId, storagePath);
  return storagePath;
}

async function createSignedUrlMap(
  media: readonly TvNewsMediaStorageSource[],
  expiresIn: number
) {
  const paths = [
    ...new Set(
      media.flatMap((item) => {
        if (!item.storage_path) return [];
        validateTvNewsMediaStoragePath(item.news_id, item.storage_path);
        return [item.storage_path];
      })
    ),
  ];

  if (paths.length === 0) return {} as Record<string, string>;

  const { data, error } = await createAdminClient()
    .storage.from(TV_NEWS_MEDIA_BUCKET)
    .createSignedUrls(paths, expiresIn);

  if (error || !data) {
    throw new Error("Impossible de préparer les médias.");
  }

  const signedUrls: Record<string, string> = {};
  for (const item of data) {
    if (item.error || !item.path || !item.signedUrl) {
      throw new Error("Impossible de préparer les médias.");
    }
    signedUrls[item.path] = item.signedUrl;
  }

  return signedUrls;
}

export function createPublicTvNewsMediaSignedUrls(
  media: readonly TvNewsMediaStorageSource[]
) {
  return createSignedUrlMap(media, TV_NEWS_PUBLIC_SIGNED_URL_TTL);
}

export async function createAdminTvNewsMediaSignedUrls(
  media: readonly TvNewsMediaStorageSource[]
) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Vous devez être connecté.");
  }

  const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");
  if (adminError || !isAdmin) {
    throw new Error("Accès administrateur requis.");
  }

  return createSignedUrlMap(media, TV_NEWS_ADMIN_SIGNED_URL_TTL);
}
