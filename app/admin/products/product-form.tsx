"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";

const initialForm = {
  name: "",
  category: "",
  description: "",
  price: "",
  old_price: "",
  specs: "",
  is_promo: false,
  is_active: true,
};

const allowedImageTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const maxFileSize = 5 * 1024 * 1024;

export default function ProductForm() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [form, setForm] = useState(initialForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    setMessage("");
    setIsError(false);

    if (!file) {
      setImageFile(null);

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      setPreviewUrl("");
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
      setMessage("L’image ne doit pas dépasser 5 Mo.");
      setIsError(true);
      event.target.value = "";
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setIsError(false);

    let imageUrl: string | null = null;
    let uploadedPath: string | null = null;

    try {
      if (imageFile) {
        const extensions: Record<string, string> = {
          "image/jpeg": "jpg",
          "image/png": "png",
          "image/webp": "webp",
        };

        const extension = extensions[imageFile.type] ?? "jpg";

        uploadedPath =
          `products/${Date.now()}-${crypto.randomUUID()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(uploadedPath, imageFile, {
            cacheControl: "3600",
            upsert: false,
            contentType: imageFile.type,
          });

        if (uploadError) {
          throw new Error(
            `Téléversement impossible : ${uploadError.message}`
          );
        }

        const { data: publicUrlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(uploadedPath);

        imageUrl = publicUrlData.publicUrl;
      }

      const { error: insertError } = await supabase
        .from("products")
        .insert({
          name: form.name.trim(),
          category: form.category,
          description: form.description.trim() || null,
          price: form.price.trim(),
          old_price: form.old_price.trim() || null,
          specs: form.specs.trim() || null,
          image_url: imageUrl,
          is_promo: form.is_promo,
          is_active: form.is_active,
        });

      if (insertError) {
        if (uploadedPath) {
          await supabase.storage
            .from("product-images")
            .remove([uploadedPath]);
        }

        throw new Error(
          `Enregistrement impossible : ${insertError.message}`
        );
      }

      setForm(initialForm);
      setImageFile(null);

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      setPreviewUrl("");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setMessage("Produit et image ajoutés avec succès.");
      setIsError(false);

      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Une erreur inattendue est survenue."
      );

      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-2xl border border-white/10 bg-[#020B2E] px-5 py-4 text-white outline-none transition placeholder:text-gray-600 focus:border-[#FCCD12]";

  return (
    <section className="rounded-[30px] border border-white/10 bg-white/5 p-7 md:p-10">
      <div>
        <p className="text-sm font-black uppercase tracking-[0.2em] text-[#FCCD12]">
          Nouveau produit
        </p>

        <h2 className="mt-3 text-3xl font-black">
          Ajouter un produit
        </h2>

        <p className="mt-3 text-gray-400">
          Remplissez les informations et choisissez directement
          l’image du produit.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-bold text-gray-300"
            >
              Nom du produit *
            </label>

            <input
              id="name"
              type="text"
              required
              value={form.name}
              onChange={(event) =>
                setForm({
                  ...form,
                  name: event.target.value,
                })
              }
              placeholder="HP EliteBook 840 G8"
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="category"
              className="mb-2 block text-sm font-bold text-gray-300"
            >
              Catégorie *
            </label>

            <select
              id="category"
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
              <option value="">
                Choisir une catégorie
              </option>

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
            <label
              htmlFor="price"
              className="mb-2 block text-sm font-bold text-gray-300"
            >
              Prix actuel *
            </label>

            <input
              id="price"
              type="text"
              required
              value={form.price}
              onChange={(event) =>
                setForm({
                  ...form,
                  price: event.target.value,
                })
              }
              placeholder="185 000 FCFA"
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="old_price"
              className="mb-2 block text-sm font-bold text-gray-300"
            >
              Ancien prix
            </label>

            <input
              id="old_price"
              type="text"
              value={form.old_price}
              onChange={(event) =>
                setForm({
                  ...form,
                  old_price: event.target.value,
                })
              }
              placeholder="210 000 FCFA"
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="description"
            className="mb-2 block text-sm font-bold text-gray-300"
          >
            Description
          </label>

          <textarea
            id="description"
            rows={4}
            value={form.description}
            onChange={(event) =>
              setForm({
                ...form,
                description: event.target.value,
              })
            }
            placeholder="Description du produit..."
            className={`${inputClass} resize-none`}
          />
        </div>

        <div>
          <label
            htmlFor="specs"
            className="mb-2 block text-sm font-bold text-gray-300"
          >
            Caractéristiques
          </label>

          <textarea
            id="specs"
            rows={5}
            value={form.specs}
            onChange={(event) =>
              setForm({
                ...form,
                specs: event.target.value,
              })
            }
            placeholder="Core i5 • 16 Go RAM • SSD 512 Go"
            className={`${inputClass} resize-none`}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-gray-300">
            Image du produit
          </label>

          <div className="rounded-[24px] border border-dashed border-white/15 bg-[#020B2E] p-6">
            <input
              ref={fileInputRef}
              id="product-image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              className="hidden"
            />

            <label
              htmlFor="product-image"
              className="inline-flex cursor-pointer items-center rounded-full bg-[#FCCD12] px-7 py-4 font-black text-[#020B2E] transition hover:scale-105"
            >
              Choisir une image
            </label>

            <p className="mt-4 text-sm text-gray-500">
              JPG, PNG ou WEBP — 5 Mo maximum.
            </p>

            {imageFile && (
              <p className="mt-3 text-sm font-bold text-green-300">
                Image choisie : {imageFile.name}
              </p>
            )}

            {previewUrl && (
              <div className="mt-6 overflow-hidden rounded-[22px] border border-white/10">
                <img
                  src={previewUrl}
                  alt="Aperçu du produit"
                  className="h-72 w-full object-cover"
                />
              </div>
            )}
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

            <span>
              <span className="block font-bold">
                Produit en promotion
              </span>

              <span className="text-sm text-gray-500">
                Afficher l’étiquette promotion.
              </span>
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

            <span>
              <span className="block font-bold">
                Produit actif
              </span>

              <span className="text-sm text-gray-500">
                Le produit sera visible dans la boutique.
              </span>
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

        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-[#FCCD12] px-10 py-4 font-black text-[#020B2E] transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? "Envoi et ajout en cours..."
            : "Ajouter le produit →"}
        </button>
      </form>
    </section>
  );
}