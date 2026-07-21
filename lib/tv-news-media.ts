import "server-only";

import { createClient } from "./supabase/server";
import {
  TV_NEWS_MEDIA_BUCKET,
  TV_NEWS_MEDIA_MAX_COUNT,
  getMediaTypeFromMime,
  hasAllowedFileSignature,
  type PublicTvNewsMedia,
  type AdminTvNewsMedia,
  type RegisterUploadedMediaInput,
  type TvNewsMedia,
} from "../types/tv-news-media";
import { createAdminClient } from "./supabase/admin";
import {
  createAdminTvNewsMediaSignedUrls,
  validateTvNewsMediaStoragePath,
} from "./tv-news-media-urls";

export const TV_NEWS_MEDIA_SELECT =
  "id,news_id,media_type,storage_path,external_url,file_name,mime_type,file_size,title,alt_text,sort_order,is_cover,created_at";

export function normalizeYoutubeUrl(value: string) {
  if (value.length > 2048) throw new Error("L’URL YouTube est trop longue.");
  let url: URL;
  try { url = new URL(value); } catch { throw new Error("L’URL YouTube est invalide."); }
  const host = url.hostname.toLowerCase();
  let id = "";
  if (host === "youtu.be") id = url.pathname.slice(1).split("/")[0] ?? "";
  else if (host === "youtube.com" || host === "www.youtube.com") {
    if (url.pathname === "/watch") id = url.searchParams.get("v") ?? "";
    else if (/^\/(embed|shorts)\//.test(url.pathname)) id = url.pathname.split("/")[2] ?? "";
  } else throw new Error("Seuls youtube.com, www.youtube.com et youtu.be sont autorisés.");
  if (!/^[A-Za-z0-9_-]{6,20}$/.test(id)) throw new Error("Identifiant de vidéo YouTube invalide.");
  return { url: `https://www.youtube.com/watch?v=${id}`, embedUrl: `https://www.youtube.com/embed/${id}` };
}

export async function validateUploadedObject(input: RegisterUploadedMediaInput) {
  validateTvNewsMediaStoragePath(input.newsId, input.storagePath);
  const mediaType = getMediaTypeFromMime(input.mimeType);
  if (!mediaType) throw new Error("Type MIME interdit.");
  const supabase = createAdminClient();
  const slash = input.storagePath.lastIndexOf("/");
  const folder = input.storagePath.slice(0, slash);
  const objectName = input.storagePath.slice(slash + 1);
  const { data, error } = await supabase.storage.from(TV_NEWS_MEDIA_BUCKET).list(folder, { search: objectName, limit: 10 });
  const object = data?.find((entry) => entry.name === objectName);
  if (error || !object) throw new Error("Le fichier téléversé est introuvable.");
  const actualSize = Number(object.metadata?.size);
  const actualMime = String(object.metadata?.mimetype ?? "");
  if (actualSize !== input.expectedSize || actualMime !== input.mimeType) throw new Error("Les métadonnées Storage ne correspondent pas au fichier annoncé.");
  const { data: blob, error: downloadError } = await supabase.storage.from(TV_NEWS_MEDIA_BUCKET).download(input.storagePath);
  if (downloadError || !(await hasAllowedFileSignature(blob, input.mimeType))) throw new Error("La signature du fichier ne correspond pas à son type autorisé.");
  return { mediaType, actualSize, actualMime };
}

export async function getAllTvNewsMedia(): Promise<AdminTvNewsMedia[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("tv_news_media").select(TV_NEWS_MEDIA_SELECT).order("sort_order");
  if (error) throw new Error("Impossible de charger les médias.");
  const media = (data ?? []) as TvNewsMedia[];
  const signedUrls = await createAdminTvNewsMediaSignedUrls(media);
  return media.map((item) => ({
    ...item,
    signed_url: item.storage_path ? signedUrls[item.storage_path] ?? null : null,
  }));
}

export async function assertMediaCapacity(newsId: string) {
  const supabase = await createClient();
  const { count, error } = await supabase.from("tv_news_media").select("id", { count: "exact", head: true }).eq("news_id", newsId);
  if (error || (count ?? 0) >= TV_NEWS_MEDIA_MAX_COUNT) throw new Error("Une actualité ne peut contenir que 10 médias.");
}

export function toPublicMedia(
  media: TvNewsMedia,
  signedUrls: Readonly<Record<string, string>>
): PublicTvNewsMedia {
  const youtube = media.external_url ? normalizeYoutubeUrl(media.external_url) : null;
  return {
    id: media.id, media_type: media.media_type, file_name: media.file_name,
    mime_type: media.mime_type, file_size: media.file_size, title: media.title,
    alt_text: media.alt_text, sort_order: media.sort_order, is_cover: media.is_cover,
    url: media.storage_path ? signedUrls[media.storage_path] ?? "" : youtube!.url,
    youtube_embed_url: youtube?.embedUrl ?? null,
  };
}
