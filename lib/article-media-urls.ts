import "server-only";

import { createAdminClient } from "./supabase/admin";
import { createClient } from "./supabase/server";
import { ARTICLE_MEDIA_BUCKET } from "../types/bichridigital-article";

const UUID = "[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}";
export const ARTICLE_PUBLIC_URL_TTL = 60 * 60;
export const ARTICLE_ADMIN_URL_TTL = 15 * 60;

export function validateArticleStoragePath(articleId: string, path: string) {
  if (path.includes("..") || path.includes("://") || path.startsWith("/") || path.includes("\\")) {
    throw new Error("Chemin de couverture invalide.");
  }
  if (!new RegExp(`^articles/${articleId}/${UUID}-[a-zA-Z0-9][a-zA-Z0-9._-]*$`, "i").test(path)) {
    throw new Error("Chemin de couverture invalide.");
  }
}

type CoverSource = { id: string; cover_storage_path: string | null };

function logCoverError(message: string, error: unknown, details?: string) {
  const supabaseError = error && typeof error === "object" ? error as {
    message?: unknown;
    code?: unknown;
    details?: unknown;
    statusCode?: unknown;
  } : null;
  console.error(message, {
    message: typeof supabaseError?.message === "string" ? supabaseError.message : String(error),
    code: supabaseError?.code ?? supabaseError?.statusCode ?? null,
    details: supabaseError?.details ?? details ?? null,
    source: "Supabase Storage",
  });
}

async function signCovers(items: readonly CoverSource[], expiresIn: number) {
  const paths = [...new Set(items.flatMap((item) => {
    if (!item.cover_storage_path) return [];
    try {
      validateArticleStoragePath(item.id, item.cover_storage_path);
      return [item.cover_storage_path];
    } catch (error) {
      logCoverError("Chemin de couverture d’article invalide.", error, `articleId=${item.id}`);
      return [];
    }
  }))];
  if (!paths.length) return {} as Record<string, string>;

  const { data, error } = await createAdminClient().storage
    .from(ARTICLE_MEDIA_BUCKET)
    .createSignedUrls(paths, expiresIn);
  if (error || !data) {
    logCoverError("Impossible de préparer les couvertures.", error ?? "Réponse vide");
    return {};
  }

  const result: Record<string, string> = {};
  for (const item of data) {
    if (item.error || !item.path || !item.signedUrl) {
      logCoverError("Impossible de préparer une couverture.", item.error ?? "URL signée absente", item.path ?? undefined);
      continue;
    }
    result[item.path] = item.signedUrl;
  }
  return result;
}

export function createPublicArticleCoverUrls(items: readonly CoverSource[]) {
  return signCovers(items, ARTICLE_PUBLIC_URL_TTL);
}

export async function createAdminArticleCoverUrls(items: readonly CoverSource[]) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Vous devez être connecté.");
  const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");
  if (adminError || !isAdmin) throw new Error("Accès administrateur requis.");
  return signCovers(items, ARTICLE_ADMIN_URL_TTL);
}
