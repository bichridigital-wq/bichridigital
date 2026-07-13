"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";

type ProductActionsProps = {
  id: string;
  isActive: boolean;
  imageUrl: string | null;
};

const storageMarker =
  "/storage/v1/object/public/product-images/";

function getStoragePath(
  imageUrl: string | null
): string | null {
  if (!imageUrl) return null;

  const markerIndex = imageUrl.indexOf(storageMarker);

  if (markerIndex === -1) {
    return null;
  }

  const encodedPath = imageUrl.slice(
    markerIndex + storageMarker.length
  );

  try {
    return decodeURIComponent(encodedPath);
  } catch {
    return encodedPath;
  }
}

export default function ProductActions({
  id,
  isActive,
  imageUrl,
}: ProductActionsProps) {
  const router = useRouter();

  const [loadingAction, setLoadingAction] =
    useState<"toggle" | "delete" | null>(null);

  const [errorMessage, setErrorMessage] =
    useState("");

  const toggleActive = async () => {
    setLoadingAction("toggle");
    setErrorMessage("");

    const supabase = createClient();

    const { error } = await supabase
      .from("products")
      .update({
        is_active: !isActive,
      })
      .eq("id", id);

    if (error) {
      setErrorMessage(error.message);
      setLoadingAction(null);
      return;
    }

    router.refresh();
    setLoadingAction(null);
  };

  const deleteProduct = async () => {
    const confirmed = window.confirm(
      "Voulez-vous vraiment supprimer définitivement ce produit et son image ?"
    );

    if (!confirmed) return;

    setLoadingAction("delete");
    setErrorMessage("");

    const supabase = createClient();

    /*
     * Supprimer d’abord le produit.
     */
    const { error: deleteError } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (deleteError) {
      setErrorMessage(deleteError.message);
      setLoadingAction(null);
      return;
    }

    /*
     * Retirer l’image seulement si elle vient
     * du bucket Supabase product-images.
     */
    const storagePath = getStoragePath(imageUrl);

    if (storagePath) {
      const { error: imageDeleteError } =
        await supabase.storage
          .from("product-images")
          .remove([storagePath]);

      if (imageDeleteError) {
        console.error(
          "Produit supprimé, mais image non supprimée :",
          imageDeleteError.message
        );
      }
    }

    router.refresh();
    setLoadingAction(null);
  };

  return (
    <div className="mt-6">
      <div className="flex flex-wrap gap-3">
        <Link
          href={`/admin/products/${id}/edit`}
          className="rounded-full border border-blue-500/30 bg-blue-500/10 px-5 py-3 text-sm font-black text-blue-300 transition hover:bg-blue-500 hover:text-white"
        >
          Modifier
        </Link>

        <button
          type="button"
          onClick={toggleActive}
          disabled={loadingAction !== null}
          className={`rounded-full px-5 py-3 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-50 ${
            isActive
              ? "border border-orange-500/30 bg-orange-500/10 text-orange-300 hover:bg-orange-500 hover:text-white"
              : "border border-green-500/30 bg-green-500/10 text-green-300 hover:bg-green-500 hover:text-white"
          }`}
        >
          {loadingAction === "toggle"
            ? "Traitement..."
            : isActive
              ? "Désactiver"
              : "Activer"}
        </button>

        <button
          type="button"
          onClick={deleteProduct}
          disabled={loadingAction !== null}
          className="rounded-full border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm font-black text-red-300 transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loadingAction === "delete"
            ? "Suppression..."
            : "Supprimer"}
        </button>
      </div>

      {errorMessage && (
        <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm font-bold text-red-300">
          Erreur : {errorMessage}
        </p>
      )}
    </div>
  );
}