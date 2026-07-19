import "server-only";

import { createClient } from "./supabase/server";
import {
  TV_NEWS_CATEGORIES,
  TV_NEWS_PUBLIC_LIMIT,
  type TvNews,
  type TvNewsCategory,
  type TvNewsInput,
} from "../types/tv-news";
import type { TvNewsListItem } from "../types/tv-news";
import { TV_NEWS_MEDIA_BUCKET, type TvNewsMedia, type PublicTvNewsMedia } from "../types/tv-news-media";
import { TV_NEWS_MEDIA_SELECT, toPublicMedia } from "./tv-news-media";

const TV_NEWS_SELECT =
  "id,title,summary,category,source_name,source_url,image_url,is_breaking,is_published,published_at,created_at,updated_at,notification_requested,notified_at";

const SUPABASE_IMAGE_HOST = "yqgcsaxzpzrueepcomzr.supabase.co";
const SUPABASE_PUBLIC_IMAGE_PATH = "/storage/v1/object/public/";

function optionalText(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return null;
  return value.trim() || null;
}

function validateOptionalUrl(
  value: string | null,
  fieldName: string,
  imageOnly = false
) {
  if (!value) return null;

  if (value.length > 2048) {
    throw new Error(`${fieldName} ne doit pas dépasser 2048 caractères.`);
  }

  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new Error(`${fieldName} n’est pas une URL valide.`);
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error(`${fieldName} doit utiliser HTTP ou HTTPS.`);
  }

  if (
    imageOnly &&
    (url.protocol !== "https:" ||
      url.hostname !== SUPABASE_IMAGE_HOST ||
      !url.pathname.startsWith(SUPABASE_PUBLIC_IMAGE_PATH))
  ) {
    throw new Error(
      "L’image doit être une URL publique valide du projet Supabase autorisé."
    );
  }

  return url.toString();
}

function parsePublishedAt(value: string | null) {
  if (!value) return null;

  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
    throw new Error("La date de publication est invalide.");
  }

  const date = new Date(`${value}:00Z`);

  if (Number.isNaN(date.getTime())) {
    throw new Error("La date de publication est invalide.");
  }

  return date.toISOString();
}

export function validateTvNewsFormData(formData: FormData): TvNewsInput {
  const title = optionalText(formData.get("title"));
  const summary = optionalText(formData.get("summary"));
  const category = optionalText(formData.get("category"));
  const sourceName = optionalText(formData.get("source_name"));
  const sourceUrl = optionalText(formData.get("source_url"));
  const imageUrl = optionalText(formData.get("image_url"));
  const publishedAt = optionalText(formData.get("published_at"));

  if (!title || title.length > 180) {
    throw new Error("Le titre doit contenir entre 1 et 180 caractères.");
  }

  if (!summary || summary.length > 1000) {
    throw new Error("Le résumé doit contenir entre 1 et 1000 caractères.");
  }

  if (
    !category ||
    !TV_NEWS_CATEGORIES.includes(category as TvNewsCategory)
  ) {
    throw new Error("La catégorie sélectionnée est invalide.");
  }

  if (sourceName && sourceName.length > 160) {
    throw new Error("La source ne doit pas dépasser 160 caractères.");
  }

  return {
    title,
    summary,
    category: category as TvNewsCategory,
    source_name: sourceName,
    source_url: validateOptionalUrl(sourceUrl, "L’URL de la source"),
    image_url: validateOptionalUrl(imageUrl, "L’URL de l’image", true),
    is_breaking: formData.get("is_breaking") === "on",
    is_published: formData.get("is_published") === "on",
    published_at: parsePublishedAt(publishedAt),
  };
}

export async function getPublishedTvNews(): Promise<TvNewsListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tv_news")
    .select(`${TV_NEWS_SELECT},tv_news_media(media_type,storage_path,is_cover,sort_order)`)
    .eq("is_published", true)
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(TV_NEWS_PUBLIC_LIMIT);

  if (error) {
    console.error("Impossible de charger Bichridigital News.");
    return [];
  }

  return (data ?? []).map((item) => {
    const media = (item.tv_news_media ?? []) as Pick<TvNewsMedia, "media_type" | "storage_path" | "is_cover" | "sort_order">[];
    const cover = media.find((entry) => entry.is_cover && entry.media_type === "image" && entry.storage_path);
    return {
      ...item,
      cover_image_url: cover?.storage_path
        ? supabase.storage.from(TV_NEWS_MEDIA_BUCKET).getPublicUrl(cover.storage_path).data.publicUrl
        : item.image_url,
      media_types: [...new Set(media.map((entry) => entry.media_type))],
      tv_news_media: undefined,
    } as TvNewsListItem;
  });
}

export async function getPublishedTvNewsById(id: string): Promise<{ news: TvNews; media: PublicTvNewsMedia[] } | null> {
  const supabase = await createClient();
  const { data: news, error } = await supabase.from("tv_news").select(TV_NEWS_SELECT).eq("id", id).eq("is_published", true).maybeSingle();
  if (error || !news) return null;
  const { data: media, error: mediaError } = await supabase.from("tv_news_media").select(TV_NEWS_MEDIA_SELECT).eq("news_id", id).order("sort_order").order("created_at");
  if (mediaError) return null;
  const publicUrl = (path: string) => supabase.storage.from(TV_NEWS_MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;
  return { news: news as TvNews, media: ((media ?? []) as TvNewsMedia[]).map((item) => toPublicMedia(item, publicUrl)) };
}

export async function getAllTvNews(): Promise<TvNews[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tv_news")
    .select(TV_NEWS_SELECT)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Impossible de charger les actualités.");
  }

  return (data ?? []) as TvNews[];
}
