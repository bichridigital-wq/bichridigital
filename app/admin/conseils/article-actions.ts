"use server";

import { revalidatePath, updateTag } from "next/cache";
import { createClient } from "../../../lib/supabase/server";
import { isArticleId, validateArticleFormData } from "../../../lib/bichridigital-articles";
import { validateArticleStoragePath } from "../../../lib/article-media-urls";
import { ARTICLE_IMAGE_MAX_BYTES, ARTICLE_IMAGE_MIME_TYPES, ARTICLE_MEDIA_BUCKET, type ArticleActionResult } from "../../../types/bichridigital-article";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Vous devez être connecté.");
  const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");
  if (adminError || !isAdmin) throw new Error("Accès administrateur requis.");
  return supabase;
}

function refresh(slug?: string) {
  updateTag("bichridigital-articles");
  revalidatePath("/conseils");
  if (slug) revalidatePath(`/conseils/${slug}`);
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin");
  revalidatePath("/admin/conseils");
}

function failure(error: unknown): ArticleActionResult {
  return { success: false, message: error instanceof Error ? error.message : "Une erreur inattendue est survenue." };
}

async function detectImageMime(blob: Blob) {
  const bytes = new Uint8Array(await blob.slice(0, 16).arrayBuffer());
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 && bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a) return "image/png";
  if (bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP") return "image/webp";
  return null;
}

export async function createArticleAction(formData: FormData): Promise<ArticleActionResult> {
  try {
    const supabase = await requireAdmin();
    const input = validateArticleFormData(formData);
    const { data, error } = await supabase.from("bichridigital_articles").insert({ ...input, is_published: false }).select("id,slug").single();
    if (error) throw new Error(error.code === "23505" ? "Ce slug est déjà utilisé." : "Impossible de créer l’article.");
    refresh(data.slug);
    return { success: true, message: "Article créé.", articleId: data.id };
  } catch (error) { return failure(error); }
}

export async function updateArticleAction(id: string, formData: FormData): Promise<ArticleActionResult> {
  try {
    const supabase = await requireAdmin();
    if (!isArticleId(id)) throw new Error("Identifiant d’article invalide.");
    const input = validateArticleFormData(formData);
    const { data: previous } = await supabase.from("bichridigital_articles").select("slug").eq("id", id).maybeSingle();
    const { error } = await supabase.from("bichridigital_articles").update(input).eq("id", id);
    if (error) throw new Error(error.code === "23505" ? "Ce slug est déjà utilisé." : "Impossible de modifier l’article.");
    refresh(input.slug); if (previous?.slug) refresh(previous.slug);
    return { success: true, message: "Article modifié.", articleId: id };
  } catch (error) { return failure(error); }
}

export async function setArticlePublishedAction(id: string, published: boolean): Promise<ArticleActionResult> {
  try {
    const supabase = await requireAdmin();
    if (!isArticleId(id) || typeof published !== "boolean") throw new Error("Publication invalide.");
    const { data, error } = await supabase.from("bichridigital_articles").update({ is_published: published }).eq("id", id).select("slug").single();
    if (error) throw new Error("Impossible de modifier la publication.");
    refresh(data.slug);
    return { success: true, message: published ? "Article publié." : "Article masqué." };
  } catch (error) { return failure(error); }
}

export async function registerArticleCoverAction(id: string, storagePath: string): Promise<ArticleActionResult> {
  const supabase = await requireAdmin();
  let validPath = false;
  try {
    if (!isArticleId(id)) throw new Error("Identifiant d’article invalide.");
    validateArticleStoragePath(id, storagePath);
    validPath = true;
    const { data: blob, error: downloadError } = await supabase.storage.from(ARTICLE_MEDIA_BUCKET).download(storagePath);
    if (downloadError || !blob) throw new Error("La couverture téléversée est introuvable.");
    const actualMime = await detectImageMime(blob);
    if (blob.size <= 0 || blob.size > ARTICLE_IMAGE_MAX_BYTES || !actualMime || actualMime !== blob.type || !ARTICLE_IMAGE_MIME_TYPES.includes(blob.type as (typeof ARTICLE_IMAGE_MIME_TYPES)[number])) {
      throw new Error("La couverture doit être une image JPEG, PNG ou WebP de 8 Mo maximum.");
    }
    const { data: current, error: lookupError } = await supabase.from("bichridigital_articles").select("cover_storage_path,slug").eq("id", id).single();
    if (lookupError) throw new Error("Article introuvable.");
    const { error } = await supabase.from("bichridigital_articles").update({ cover_storage_path: storagePath }).eq("id", id);
    if (error) throw new Error("Impossible d’enregistrer la couverture.");
    if (current.cover_storage_path && current.cover_storage_path !== storagePath) {
      validateArticleStoragePath(id, current.cover_storage_path);
      const { error: removeError } = await supabase.storage.from(ARTICLE_MEDIA_BUCKET).remove([current.cover_storage_path]);
      if (removeError) throw new Error("Couverture remplacée, mais l’ancien fichier n’a pas pu être supprimé.");
    }
    refresh(current.slug);
    return { success: true, message: "Couverture enregistrée.", articleId: id };
  } catch (error) {
    if (validPath) await supabase.storage.from(ARTICLE_MEDIA_BUCKET).remove([storagePath]);
    return failure(error);
  }
}

export async function deleteArticleCoverAction(id: string): Promise<ArticleActionResult> {
  try {
    const supabase = await requireAdmin();
    if (!isArticleId(id)) throw new Error("Identifiant d’article invalide.");
    const { data, error } = await supabase.from("bichridigital_articles").select("cover_storage_path,slug").eq("id", id).single();
    if (error) throw new Error("Article introuvable.");
    if (data.cover_storage_path) {
      validateArticleStoragePath(id, data.cover_storage_path);
      const { error: removeError } = await supabase.storage.from(ARTICLE_MEDIA_BUCKET).remove([data.cover_storage_path]);
      if (removeError) throw new Error("La couverture n’a pas pu être supprimée.");
    }
    const { error: updateError } = await supabase.from("bichridigital_articles").update({ cover_storage_path: null }).eq("id", id);
    if (updateError) throw new Error("Impossible de retirer la couverture.");
    refresh(data.slug); return { success: true, message: "Couverture supprimée." };
  } catch (error) { return failure(error); }
}

export async function deleteArticleAction(id: string): Promise<ArticleActionResult> {
  try {
    const supabase = await requireAdmin();
    if (!isArticleId(id)) throw new Error("Identifiant d’article invalide.");
    const { data, error } = await supabase.from("bichridigital_articles").select("cover_storage_path,slug").eq("id", id).single();
    if (error) throw new Error("Article introuvable.");
    if (data.cover_storage_path) {
      validateArticleStoragePath(id, data.cover_storage_path);
      const { error: removeError } = await supabase.storage.from(ARTICLE_MEDIA_BUCKET).remove([data.cover_storage_path]);
      if (removeError) throw new Error("La couverture n’a pas pu être supprimée ; l’article est conservé.");
    }
    const { error: deleteError } = await supabase.from("bichridigital_articles").delete().eq("id", id);
    if (deleteError) throw new Error("Impossible de supprimer l’article.");
    refresh(data.slug); return { success: true, message: "Article supprimé." };
  } catch (error) { return failure(error); }
}
