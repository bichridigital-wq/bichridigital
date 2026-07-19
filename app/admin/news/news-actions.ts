"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../../../lib/supabase/server";
import { validateTvNewsFormData } from "../../../lib/tv-news";
import type { TvNewsActionState } from "../../../types/tv-news";

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

function refreshNewsPaths() {
  revalidatePath("/admin");
  revalidatePath("/admin/news");
  revalidatePath("/tv");
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

export async function createNewsAction(
  _previousState: TvNewsActionState,
  formData: FormData
): Promise<TvNewsActionState> {
  try {
    const supabase = await requireAdmin();
    const input = validateTvNewsFormData(formData);
    const { error } = await supabase.from("tv_news").insert(input);

    if (error) {
      throw new Error("Impossible de créer l’actualité.");
    }

    refreshNewsPaths();
    return { success: true, message: "Actualité créée avec succès." };
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
    const { error } = await supabase
      .from("tv_news")
      .update(input)
      .eq("id", id);

    if (error) {
      throw new Error("Impossible de modifier l’actualité.");
    }

    refreshNewsPaths();
    return { success: true, message: "Actualité modifiée avec succès." };
  } catch (error) {
    return actionError(error);
  }
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
