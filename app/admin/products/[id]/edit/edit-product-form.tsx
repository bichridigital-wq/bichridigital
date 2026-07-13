"use client";

import Link from "next/link";
import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../../../lib/supabase/client";

type Product = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  price: string | null;
  old_price: string | null;
  specs: string | null;
  image_url: string | null;
  is_promo: boolean;
  is_active: boolean;
};

const allowedImageTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const maxFileSize = 5 * 1024 * 1024;

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

export default function EditProductForm({
  product,
}: {
  product: Product;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [form, setForm] = useState({
    name: product.name ?? "",
    category: product.category ?? "",
    description: product.description ?? "",
    price: product.price ?? "",
    old_price: product.old_price ?? "",
    specs: product.specs ?? "",
    is_promo: product.is_promo ?? false,
    is_active: product.is_active ?? true,
  });

  const [imageFile, setImageFile] =
    useState<File | null>(null);

  const [localPreviewUrl, setLocalPreviewUrl] =
    useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const displayedImage =
    localPreviewUrl || product.image_url || "";

  useEffect(() => {
    return () => {
      if (localPreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(localPreviewUrl);
      }
    };
  }, [localPreviewUrl]);

  const handleImageChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    setMessage("");
    setIsError(false);

    if (!file) {
      setImageFile(null);

      if (localPreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(localPreviewUrl);
      }

      setLocalPreviewUrl("");
      return;
    }

    if (!allowedImageTypes.includes(file.type)) {
      setMessage(
        "Format refusé. Utilisez une image JPG, PNG ou WEBP."
      );
      setIsError(true);
      event.target.value = "";
      return;
    }

    if (file.size > maxFileSize) {
      setMessage(
        "L’image sélectionnée dépasse la limite de 5 Mo."
      );
      setIsError(true);
      event.target.value = "";
      return;
    }

    if (localPreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(localPreviewUrl);
    }

    setImageFile(file);
    setLocalPreviewUrl(URL.createObjectURL(file));
  };

  const cancelNewImage = () => {
    if (localPreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(localPreviewUrl);
    }

    setImageFile(null);
    setLocalPreviewUrl("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setIsError(false);

    let finalImageUrl = product.image_url;
    let uploadedPath: string | null = null;

    try {
      /*
       * 1. Envoyer la nouvelle image si une image
       * a été sélectionnée.
       */
      if (imageFile) {
        const extensions: Record<string, string> = {
          "image/jpeg": "jpg",
          "image/png": "png",
          "image/webp": "webp",
        };

        const extension =
          extensions[imageFile.type] ?? "jpg";

        uploadedPath =
          `products/${Date.now()}-` +
          `${crypto.randomUUID()}.${extension}`;

        const { error: uploadError } =
          await supabase.storage
            .from("product-images")
            .upload(uploadedPath, imageFile, {
              cacheControl: "3600",
              upsert: false,
              contentType: imageFile.type,
            });

        if (uploadError) {
          throw new Error(
            `Envoi de l’image impossible : ${uploadError.message}`
          );
        }

        const { data: publicUrlData } =
          supabase.storage
            .from("product-images")
            .getPublicUrl(uploadedPath);

        finalImageUrl = publicUrlData.publicUrl;
      }

      /*
       * 2. Modifier le produit dans la base.
       */
      const { error: updateError } = await supabase
        .from("products")
        .update({
          name: form.name.trim(),
          category: form.category,
          description:
            form.description.trim() || null,
          price: form.price.trim(),
          old_price:
            form.old_price.trim() || null,
          specs: form.specs.trim() || null,
          image_url: finalImageUrl,
          is_promo: form.is_promo,
          is_active: form.is_active,
        })
        .eq("id", product.id);

      if (updateError) {
        /*
         * Si la modification échoue, retirer
         * la nouvelle image envoyée.
         */
        if (uploadedPath) {
          await supabase.storage
            .from("product-images")
            .remove([uploadedPath]);
        }

        throw new Error(
          `Modification impossible : ${updateError.message}`
        );
      }

      /*
       * 3. Une fois le produit modifié avec succès,
       * retirer l’ancienne image Supabase.
       */
      if (imageFile && uploadedPath) {
        const oldStoragePath = getStoragePath(
          product.image_url
        );

        if (
          oldStoragePath &&
          oldStoragePath !== uploadedPath
        ) {
          const { error: removeError } =
            await supabase.storage
              .from("product-images")
              .remove([oldStoragePath]);

          if (removeError) {
            console.error(
              "Ancienne image non supprimée :",
              removeError.message
            );
          }
        }
      }

      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Une erreur inattendue est survenue."
      );

      setIsError(true);
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-2xl border border-white/10 " +
    "bg-[#020B2E] px-5 py-4 text-white outline-none " +
    "transition placeholder:text-gray-600 " +
    "focus:border-[#FCCD12]";

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-10 space-y-6"
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-bold text-gray-300">
            Nom du produit
          </label>

          <input
            required
            value={form.name}
            onChange={(event) =>
              setForm({
                ...form,
                name: event.target.value,
              })
            }
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-gray-300">
            Catégorie
          </label>

          <select
            required
            value={form.category}
            onChange={(event) =>
              setForm({
                ...form,
                category: event.target.value,
              })
            }
            className={inputClass}
          >
            <option value="ordinateur">
              Ordinateur
            </option>

            <option value="tshirt">
              T-shirt
            </option>

            <option value="pull">
              Pull
            </option>

            <option value="casquette">
              Casquette
            </option>

            <option value="tableau">
              Tableau mural
            </option>

            <option value="autre">
              Autre produit
            </option>
          </select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-bold text-gray-300">
            Prix actuel
          </label>

          <input
            required
            value={form.price}
            onChange={(event) =>
              setForm({
                ...form,
                price: event.target.value,
              })
            }
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-gray-300">
            Ancien prix
          </label>

          <input
            value={form.old_price}
            onChange={(event) =>
              setForm({
                ...form,
                old_price: event.target.value,
              })
            }
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-gray-300">
          Description
        </label>

        <textarea
          rows={4}
          value={form.description}
          onChange={(event) =>
            setForm({
              ...form,
              description: event.target.value,
            })
          }
          className={`${inputClass} resize-none`}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-gray-300">
          Caractéristiques
        </label>

        <textarea
          rows={5}
          value={form.specs}
          onChange={(event) =>
            setForm({
              ...form,
              specs: event.target.value,
            })
          }
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* IMAGE */}
      <div>
        <label className="mb-2 block text-sm font-bold text-gray-300">
          Image du produit
        </label>

        <div className="rounded-[24px] border border-dashed border-white/15 bg-[#020B2E] p-6">
          {displayedImage && (
            <div className="mb-6 overflow-hidden rounded-[22px] border border-white/10">
              <img
                src={displayedImage}
                alt={`Aperçu de ${product.name}`}
                className="h-72 w-full object-cover"
              />
            </div>
          )}

          <input
            ref={fileInputRef}
            id="edit-product-image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
            className="hidden"
          />

          <div className="flex flex-wrap gap-4">
            <label
              htmlFor="edit-product-image"
              className="inline-flex cursor-pointer items-center rounded-full bg-[#FCCD12] px-7 py-4 font-black text-[#020B2E] transition hover:scale-105"
            >
              Remplacer l’image
            </label>

            {imageFile && (
              <button
                type="button"
                onClick={cancelNewImage}
                className="rounded-full border border-white/15 px-7 py-4 font-bold text-gray-300 transition hover:border-red-400 hover:text-red-300"
              >
                Annuler la nouvelle image
              </button>
            )}
          </div>

          {imageFile && (
            <p className="mt-4 text-sm font-bold text-green-300">
              Nouvelle image : {imageFile.name}
            </p>
          )}

          <p className="mt-3 text-sm text-gray-500">
            JPG, PNG ou WEBP — 5 Mo maximum.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex cursor-pointer items-center gap-4 rounded-2xl border border-white/10 bg-[#020B2E] p-5">
          <input
            type="checkbox"
            checked={form.is_promo}
            onChange={(event) =>
              setForm({
                ...form,
                is_promo: event.target.checked,
              })
            }
            className="h-5 w-5 accent-[#FCCD12]"
          />

          <span className="font-bold">
            Produit en promotion
          </span>
        </label>

        <label className="flex cursor-pointer items-center gap-4 rounded-2xl border border-white/10 bg-[#020B2E] p-5">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(event) =>
              setForm({
                ...form,
                is_active: event.target.checked,
              })
            }
            className="h-5 w-5 accent-[#FCCD12]"
          />

          <span className="font-bold">
            Produit actif
          </span>
        </label>
      </div>

      {message && (
        <div
          role="alert"
          className={`rounded-2xl border px-5 py-4 font-bold ${
            isError
              ? "border-red-500/30 bg-red-500/10 text-red-300"
              : "border-green-500/30 bg-green-500/10 text-green-300"
          }`}
        >
          {message}
        </div>
      )}

      <div className="flex flex-wrap gap-4">
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-[#FCCD12] px-10 py-4 font-black text-[#020B2E] transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? "Enregistrement..."
            : "Enregistrer les modifications"}
        </button>

        <Link
          href="/admin/products"
          className="rounded-full border border-white/15 px-10 py-4 font-bold transition hover:border-[#FCCD12] hover:text-[#FCCD12]"
        >
          Annuler
        </Link>
      </div>
    </form>
  );
}