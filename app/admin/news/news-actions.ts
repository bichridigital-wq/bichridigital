"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { after } from "next/server";
import { createClient } from "../../../lib/supabase/server";
import { validateTvNewsFormData } from "../../../lib/tv-news";
import type { TvNewsActionState } from "../../../types/tv-news";
import {
  TV_NEWS_MEDIA_BUCKET,
  TV_NEWS_MEDIA_MAX_COUNT,
  type RegisterUploadedMediaInput,
} from "../../../types/tv-news-media";
import {
  assertMediaCapacity,
  normalizeYoutubeUrl,
  validateUploadedObject,
} from "../../../lib/tv-news-media";
import { sendPushNotificationForNews } from "../../../lib/web-push";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Vous devez être connecté.");
  }

  const { data: isAdmin, error: adminError } =
    await supabase.rpc("is_admin");

  if (adminError || !isAdmin) {
    throw new Error("Accès administrateur requis.");
  }

  return supabase;
}

function validateId(id: string) {
  if (!UUID_PATTERN.test(id)) {
    throw new Error("Identifiant d’actualité invalide.");
  }
}

function optionalMediaText(value: string | undefined, maximum: number) {
  const text = value?.trim() || null;
  if (text && text.length > maximum) throw new Error("Texte de média trop long.");
  return text;
}

function refreshNewsPaths() {
  revalidateTag("published-tv-news", "max");
  revalidatePath("/admin");
  revalidatePath("/admin/news");
  revalidatePath("/tv");
}

function schedulePush(newsId: string) {
  after(async () => {
    try { await sendPushNotificationForNews(newsId); }
    catch { console.error("L’envoi Web Push planifié a échoué."); }
  });
}

function actionError(error: unknown): TvNewsActionState {
  return {
    success: false,
    message:
      error instanceof Error
        ? error.message
        : "Une erreur inattendue est survenue.",
  };
}

export async function createNewsDraftAction(
  _previousState: TvNewsActionState,
  formData: FormData
): Promise<TvNewsActionState> {
  try {
    const supabase = await requireAdmin();
    const input = validateTvNewsFormData(formData);
    const { data, error } = await supabase.from("tv_news").insert({
      ...input,
      image_url: null,
      is_published: false,
      notification_requested: false,
    }).select("id").single();

    if (error) {
      throw new Error("Impossible de créer l’actualité.");
    }

    refreshNewsPaths();
    return { success: true, message: "Brouillon créé.", newsId: data.id };
  } catch (error) {
    return actionError(error);
  }
}

export async function updateCreationDraftAction(
  id: string,
  _previousState: TvNewsActionState,
  formData: FormData
): Promise<TvNewsActionState> {
  try {
    const supabase = await requireAdmin();
    validateId(id);
    const input = validateTvNewsFormData(formData);
    const { error } = await supabase.from("tv_news").update({
      ...input,
      image_url: null,
      is_published: false,
      notification_requested: false,
    }).eq("id", id).eq("is_published", false);
    if (error) throw new Error("Impossible de mettre à jour le brouillon.");
    refreshNewsPaths();
    return { success: true, message: "Brouillon mis à jour.", newsId: id };
  } catch (error) {
    return actionError(error);
  }
}

export async function finalizeNewsCreationAction(
  id: string,
  publish: boolean,
  notificationRequested: boolean
): Promise<TvNewsActionState> {
  try {
    const supabase = await requireAdmin();
    validateId(id);
    const { data, error } = await supabase.from("tv_news").update({
      is_published: publish,
      notification_requested: publish && notificationRequested,
    }).eq("id", id).eq("is_published", false).select("id").single();
    if (error || !data) throw new Error("Impossible de finaliser l’actualité.");
    refreshNewsPaths();
    if (publish && notificationRequested) schedulePush(id);
    return {
      success: true,
      message: publish ? "Actualité publiée avec succès." : "Actualité conservée en brouillon.",
      newsId: id,
    };
  } catch (error) {
    return actionError(error);
  }
}

export async function updateNewsAction(
  id: string,
  _previousState: TvNewsActionState,
  formData: FormData
): Promise<TvNewsActionState> {
  try {
    const supabase = await requireAdmin();
    validateId(id);
    const input = validateTvNewsFormData(formData);
    const { data: previous, error: previousError } = await supabase.from("tv_news").select("is_published,notification_requested,notified_at,image_url").eq("id", id).single();
    if (previousError) throw new Error("Impossible de vérifier l’état de publication.");
    const transitionedToPublished = !previous.is_published && input.is_published;
    const notificationRequested = transitionedToPublished && formData.get("notification_requested") === "on";
    const { error } = await supabase
      .from("tv_news")
      .update({ ...input, image_url: previous.image_url, notification_requested: transitionedToPublished ? notificationRequested : previous.notification_requested })
      .eq("id", id);

    if (error) {
      throw new Error("Impossible de modifier l’actualité.");
    }

    refreshNewsPaths();
    if (notificationRequested && !previous.notified_at) schedulePush(id);
    return { success: true, message: "Actualité modifiée avec succès." };
  } catch (error) {
    return actionError(error);
  }
}

export async function retryNewsPushAction(id: string): Promise<TvNewsActionState> {
  try {
    const supabase = await requireAdmin(); validateId(id);
    const { data, error } = await supabase.from("tv_news").select("is_published,notification_requested,notified_at").eq("id", id).single();
    if (error || !data.is_published || !data.notification_requested || data.notified_at) throw new Error("Cette notification ne peut pas être relancée.");
    schedulePush(id);
    return { success: true, message: "Nouvelle tentative planifiée." };
  } catch (error) { return actionError(error); }
}

export async function setNewsPublishedAction(
  id: string,
  isPublished: boolean
): Promise<TvNewsActionState> {
  try {
    const supabase = await requireAdmin();
    validateId(id);

    if (typeof isPublished !== "boolean") {
      throw new Error("Statut de publication invalide.");
    }

    const { error } = await supabase
      .from("tv_news")
      .update({ is_published: isPublished })
      .eq("id", id);

    if (error) {
      throw new Error("Impossible de modifier la publication.");
    }

    refreshNewsPaths();
    return {
      success: true,
      message: isPublished ? "Actualité publiée." : "Actualité masquée.",
    };
  } catch (error) {
    return actionError(error);
  }
}

export async function deleteNewsAction(
  id: string
): Promise<TvNewsActionState> {
  try {
    const supabase = await requireAdmin();
    validateId(id);
    const { data: media, error: mediaError } = await supabase
      .from("tv_news_media").select("storage_path").eq("news_id", id);
    if (mediaError) throw new Error("Impossible de vérifier les fichiers associés.");
    const paths = (media ?? []).flatMap((item) => item.storage_path ? [item.storage_path] : []);
    if (paths.length) {
      const { error: storageError } = await supabase.storage.from(TV_NEWS_MEDIA_BUCKET).remove(paths);
      if (storageError) throw new Error("La suppression des fichiers a échoué ; l’actualité a été conservée.");
    }
    const { error } = await supabase
      .from("tv_news")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error("Impossible de supprimer l’actualité.");
    }

    refreshNewsPaths();
    return { success: true, message: "Actualité supprimée." };
  } catch (error) {
    return actionError(error);
  }
}

export async function registerUploadedMediaAction(input: RegisterUploadedMediaInput): Promise<TvNewsActionState> {
  let supabase;
  try {
    supabase = await requireAdmin();
    validateId(input.newsId);
    await assertMediaCapacity(input.newsId);
    const checked = await validateUploadedObject(input);
    const { count } = await supabase.from("tv_news_media").select("id", { count: "exact", head: true }).eq("news_id", input.newsId);
    if ((count ?? 0) >= TV_NEWS_MEDIA_MAX_COUNT) throw new Error("Une actualité ne peut contenir que 10 médias.");
    if (input.isCover && checked.mediaType !== "image") {
      throw new Error("La couverture doit être une image.");
    }
    if (input.isCover) {
      await supabase.from("tv_news_media").update({ is_cover: false }).eq("news_id", input.newsId);
    }
    const { data: inserted, error } = await supabase.from("tv_news_media").insert({
      news_id: input.newsId, media_type: checked.mediaType, storage_path: input.storagePath,
      file_name: input.fileName.slice(0, 255), mime_type: checked.actualMime,
      file_size: checked.actualSize, title: optionalMediaText(input.title, 180),
      alt_text: optionalMediaText(input.altText, 300), sort_order: count ?? 0,
      is_cover: Boolean(input.isCover),
    }).select("id").single();
    if (error) throw new Error("L’enregistrement du média a échoué.");
    refreshNewsPaths();
    return { success: true, message: "Média ajouté.", mediaId: inserted.id };
  } catch (error) {
    if (supabase && input.storagePath) await supabase.storage.from(TV_NEWS_MEDIA_BUCKET).remove([input.storagePath]);
    return actionError(error);
  }
}

export async function addYoutubeMediaAction(newsId: string, url: string, title?: string): Promise<TvNewsActionState> {
  try {
    const supabase = await requireAdmin();
    validateId(newsId);
    await assertMediaCapacity(newsId);
    const normalized = normalizeYoutubeUrl(url);
    const { count } = await supabase.from("tv_news_media").select("id", { count: "exact", head: true }).eq("news_id", newsId);
    const { error } = await supabase.from("tv_news_media").insert({ news_id: newsId, media_type: "youtube", external_url: normalized.url, file_name: "Vidéo YouTube", title: optionalMediaText(title, 180), sort_order: count ?? 0 });
    if (error) throw new Error("Impossible d’ajouter la vidéo YouTube.");
    refreshNewsPaths();
    return { success: true, message: "Vidéo YouTube ajoutée." };
  } catch (error) { return actionError(error); }
}

export async function updateNewsMediaAction(id: string, title: string, altText: string, isCover: boolean): Promise<TvNewsActionState> {
  try {
    const supabase = await requireAdmin(); validateId(id);
    const { data: media, error: lookupError } = await supabase.from("tv_news_media").select("news_id,media_type").eq("id", id).single();
    if (lookupError) throw new Error("Média introuvable.");
    if (isCover && media.media_type !== "image") throw new Error("La couverture doit être une image.");
    if (isCover) await supabase.from("tv_news_media").update({ is_cover: false }).eq("news_id", media.news_id);
    const { error } = await supabase.from("tv_news_media").update({ title: optionalMediaText(title, 180), alt_text: optionalMediaText(altText, 300), is_cover: isCover }).eq("id", id);
    if (error) throw new Error("Impossible de modifier le média.");
    refreshNewsPaths(); return { success: true, message: "Média modifié." };
  } catch (error) { return actionError(error); }
}

export async function reorderNewsMediaAction(newsId: string, ids: string[]): Promise<TvNewsActionState> {
  try {
    const supabase = await requireAdmin(); validateId(newsId);
    if (ids.length > TV_NEWS_MEDIA_MAX_COUNT || ids.some((id) => !UUID_PATTERN.test(id))) throw new Error("Ordre des médias invalide.");
    for (const [sort_order, id] of ids.entries()) {
      const { error } = await supabase.from("tv_news_media").update({ sort_order }).eq("id", id).eq("news_id", newsId);
      if (error) throw new Error("Impossible de réorganiser les médias.");
    }
    refreshNewsPaths(); return { success: true, message: "Ordre enregistré." };
  } catch (error) { return actionError(error); }
}

export async function deleteNewsMediaAction(id: string): Promise<TvNewsActionState> {
  try {
    const supabase = await requireAdmin(); validateId(id);
    const { data, error: lookupError } = await supabase.from("tv_news_media").select("storage_path").eq("id", id).single();
    if (lookupError) throw new Error("Média introuvable.");
    if (data.storage_path) {
      const { error } = await supabase.storage.from(TV_NEWS_MEDIA_BUCKET).remove([data.storage_path]);
      if (error) throw new Error("Le fichier n’a pas pu être supprimé ; la ligne a été conservée.");
    }
    const { error } = await supabase.from("tv_news_media").delete().eq("id", id);
    if (error) throw new Error("Impossible de supprimer le média.");
    refreshNewsPaths(); return { success: true, message: "Média supprimé." };
  } catch (error) { return actionError(error); }
}
