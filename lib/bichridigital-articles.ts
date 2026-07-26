import "server-only";

import { unstable_cache } from "next/cache";
import { createAdminClient } from "./supabase/admin";
import { createClient } from "./supabase/server";
import { createAdminArticleCoverUrls, createPublicArticleCoverUrls } from "./article-media-urls";
import {
  ARTICLE_CATEGORIES,
  ARTICLE_PUBLIC_LIMIT,
  type ArticleCategory,
  type BichridigitalArticle,
} from "../types/bichridigital-article";

export const ARTICLE_SELECT = "id,title,slug,excerpt,content,category,author_name,cover_storage_path,seo_title,seo_description,is_featured,is_published,published_at,created_at,updated_at";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function logSupabaseError(context: string, error: unknown) {
  const supabaseError = error && typeof error === "object" ? error as {
    message?: unknown;
    code?: unknown;
    details?: unknown;
    hint?: unknown;
  } : null;
  console.error(context, {
    message: typeof supabaseError?.message === "string" ? supabaseError.message : String(error),
    code: supabaseError?.code ?? null,
    details: supabaseError?.details ?? null,
    hint: supabaseError?.hint ?? null,
    source: "Supabase",
  });
}

export function isArticleId(value: string) { return UUID.test(value); }
function text(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

export function validateArticleFormData(formData: FormData) {
  const title = text(formData, "title");
  const slug = text(formData, "slug").toLowerCase();
  const excerpt = text(formData, "excerpt");
  const content = text(formData, "content");
  const category = text(formData, "category");
  const author_name = text(formData, "author_name") || "Bichridigital Agency";
  const seo_title = text(formData, "seo_title") || null;
  const seo_description = text(formData, "seo_description") || null;
  if (title.length < 10 || title.length > 120) throw new Error("Le titre doit contenir entre 10 et 120 caractères.");
  if (slug.length < 3 || slug.length > 140 || !SLUG.test(slug)) throw new Error("Le slug doit contenir 3 à 140 caractères minuscules, chiffres et tirets.");
  if (excerpt.length < 80 || excerpt.length > 300) throw new Error("Le résumé doit contenir entre 80 et 300 caractères.");
  if (content.length < 600) throw new Error("Le contenu doit contenir au moins 600 caractères.");
  if (!ARTICLE_CATEGORIES.includes(category as ArticleCategory)) throw new Error("Catégorie invalide.");
  if (author_name.length > 120) throw new Error("Le nom de l’auteur est trop long.");
  if (seo_title && seo_title.length > 60) throw new Error("Le titre SEO ne doit pas dépasser 60 caractères.");
  if (seo_description && (seo_description.length < 120 || seo_description.length > 160)) throw new Error("La description SEO doit contenir entre 120 et 160 caractères.");
  return { title, slug, excerpt, content, category: category as ArticleCategory, author_name, seo_title, seo_description, is_featured: formData.get("is_featured") === "on", is_published: formData.get("is_published") === "on" };
}

async function attachPublicCovers(rows: Omit<BichridigitalArticle, "cover_url">[]) {
  const urls = await createPublicArticleCoverUrls(rows);
  return rows.map((row) => ({ ...row, cover_url: row.cover_storage_path ? urls[row.cover_storage_path] ?? null : null })) as BichridigitalArticle[];
}

const loadPublicArticles = unstable_cache(async (page: number) => {
  const safePage = Number.isInteger(page) && page > 0 ? page : 1;
  const from = (safePage - 1) * ARTICLE_PUBLIC_LIMIT;
  const { data, error } = await createAdminClient().from("bichridigital_articles").select(ARTICLE_SELECT)
    .eq("is_published", true)
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(from, from + ARTICLE_PUBLIC_LIMIT);
  if (error) {
    logSupabaseError("Impossible de charger les Conseils Bichridigital.", error);
    throw new Error("Impossible de charger les Conseils Bichridigital.");
  }
  const rows = (data ?? []) as Omit<BichridigitalArticle, "cover_url">[];
  return { articles: await attachPublicCovers(rows.slice(0, ARTICLE_PUBLIC_LIMIT)), hasMore: rows.length > ARTICLE_PUBLIC_LIMIT };
}, ["published-bichridigital-articles"], { revalidate: 300, tags: ["bichridigital-articles"] });

export function getPublishedArticlePage(page = 1) { return loadPublicArticles(page); }

export const getFeaturedArticle = unstable_cache(async () => {
  const supabase = createAdminClient();
  const featured = await supabase.from("bichridigital_articles").select(ARTICLE_SELECT).eq("is_published", true).eq("is_featured", true).order("published_at", { ascending: false }).limit(1).maybeSingle();
  if (featured.error) {
    logSupabaseError("Impossible de charger l’article à la une.", featured.error);
    throw new Error("Impossible de charger l’article à la une.");
  }
  let row = featured.data;
  if (!row) {
    const latest = await supabase.from("bichridigital_articles").select(ARTICLE_SELECT).eq("is_published", true).order("published_at", { ascending: false }).limit(1).maybeSingle();
    if (latest.error) {
      logSupabaseError("Impossible de charger le dernier article publié.", latest.error);
      throw new Error("Impossible de charger le dernier article publié.");
    }
    row = latest.data;
  }
  if (!row) return null;
  return (await attachPublicCovers([row as Omit<BichridigitalArticle, "cover_url">]))[0];
}, ["featured-bichridigital-article"], { revalidate: 300, tags: ["bichridigital-articles"] });

export const getPublishedArticleBySlug = unstable_cache(async (slug: string) => {
  if (!SLUG.test(slug)) return null;
  const { data, error } = await createAdminClient().from("bichridigital_articles").select(ARTICLE_SELECT)
    .eq("slug", slug).eq("is_published", true).maybeSingle();
  if (error) {
    logSupabaseError(`Impossible de charger l’article publié « ${slug} ».`, error);
    throw new Error("Impossible de charger l’article publié.");
  }
  if (!data) return null;
  return (await attachPublicCovers([data as Omit<BichridigitalArticle, "cover_url">]))[0];
}, ["published-bichridigital-article-detail"], { revalidate: 300, tags: ["bichridigital-articles"] });

export const getRelatedArticles = unstable_cache(async (id: string, category: ArticleCategory) => {
  if (!isArticleId(id) || !ARTICLE_CATEGORIES.includes(category)) return [];
  const { data, error } = await createAdminClient().from("bichridigital_articles").select(ARTICLE_SELECT)
    .eq("is_published", true).eq("category", category).neq("id", id).order("published_at", { ascending: false }).limit(3);
  if (error) {
    logSupabaseError("Impossible de charger les articles associés.", error);
    throw new Error("Impossible de charger les articles associés.");
  }
  return attachPublicCovers((data ?? []) as Omit<BichridigitalArticle, "cover_url">[]);
}, ["related-bichridigital-articles"], { revalidate: 300, tags: ["bichridigital-articles"] });

export async function getPublishedArticleSitemapRows() {
  const { data, error } = await createAdminClient().from("bichridigital_articles").select("slug,published_at,updated_at").eq("is_published", true);
  if (error) {
    logSupabaseError("Impossible de charger les articles du sitemap.", error);
    throw new Error("Sitemap articles indisponible.");
  }
  return data ?? [];
}

export async function getAllArticlesAdmin() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("bichridigital_articles").select(ARTICLE_SELECT).order("created_at", { ascending: false });
  if (error) throw new Error("Impossible de charger les articles.");
  const rows = (data ?? []) as Omit<BichridigitalArticle, "cover_url">[];
  const urls = await createAdminArticleCoverUrls(rows);
  return rows.map((row) => ({ ...row, cover_url: row.cover_storage_path ? urls[row.cover_storage_path] ?? null : null })) as BichridigitalArticle[];
}

export async function getArticleAdminById(id: string) {
  if (!isArticleId(id)) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.from("bichridigital_articles").select(ARTICLE_SELECT).eq("id", id).maybeSingle();
  if (error || !data) return null;
  const urls = await createAdminArticleCoverUrls([data]);
  return { ...data, cover_url: data.cover_storage_path ? urls[data.cover_storage_path] ?? null : null } as BichridigitalArticle;
}
