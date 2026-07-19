"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  createNewsAction,
  updateNewsAction,
} from "./news-actions";
import {
  TV_NEWS_CATEGORIES,
  type TvNews,
  type TvNewsActionState,
} from "../../../types/tv-news";

const initialState: TvNewsActionState = {
  success: false,
  message: "",
};

function toDakarInputValue(value: string | null) {
  if (!value) return "";

  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Africa/Dakar",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(value));

  return parts.replace(" ", "T");
}

export default function NewsForm({
  news,
  onSaved,
  onCancel,
}: {
  news: TvNews | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const action = news
    ? updateNewsAction.bind(null, news.id)
    : createNewsAction;
  const [state, formAction, pending] = useActionState(action, initialState);

  useEffect(() => {
    if (!state.success) return;

    formRef.current?.reset();
    router.refresh();
    onSaved();
  }, [onSaved, router, state.success]);

  const inputClass =
    "w-full rounded-2xl border border-white/10 bg-[#020B2E] px-5 py-4 text-white outline-none transition placeholder:text-gray-600 focus:border-[#FCCD12]";

  return (
    <section className="rounded-[30px] border border-white/10 bg-white/5 p-7 md:p-10">
      <p className="text-sm font-black uppercase tracking-[0.2em] text-[#FCCD12]">
        {news ? "Modification" : "Nouvelle actualité"}
      </p>
      <h2 className="mt-3 text-3xl font-black">
        {news ? `Modifier « ${news.title} »` : "Publier une information"}
      </h2>

      <form ref={formRef} action={formAction} className="mt-8 space-y-6">
        <div>
          <label htmlFor="news-title" className="mb-2 block text-sm font-bold text-gray-300">
            Titre *
          </label>
          <input
            id="news-title"
            name="title"
            required
            maxLength={180}
            defaultValue={news?.title ?? ""}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="news-summary" className="mb-2 block text-sm font-bold text-gray-300">
            Résumé *
          </label>
          <textarea
            id="news-summary"
            name="summary"
            required
            maxLength={1000}
            rows={5}
            defaultValue={news?.summary ?? ""}
            className={`${inputClass} resize-y`}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="news-category" className="mb-2 block text-sm font-bold text-gray-300">
              Catégorie *
            </label>
            <select
              id="news-category"
              name="category"
              required
              defaultValue={news?.category ?? "National"}
              className={inputClass}
            >
              {TV_NEWS_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="news-published-at" className="mb-2 block text-sm font-bold text-gray-300">
              Date de publication (Africa/Dakar)
            </label>
            <input
              id="news-published-at"
              name="published_at"
              type="datetime-local"
              defaultValue={toDakarInputValue(news?.published_at ?? null)}
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="news-source" className="mb-2 block text-sm font-bold text-gray-300">
              Source
            </label>
            <input
              id="news-source"
              name="source_name"
              maxLength={160}
              defaultValue={news?.source_name ?? ""}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="news-source-url" className="mb-2 block text-sm font-bold text-gray-300">
              URL de la source
            </label>
            <input
              id="news-source-url"
              name="source_url"
              type="url"
              maxLength={2048}
              placeholder="https://…"
              defaultValue={news?.source_url ?? ""}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label htmlFor="news-image-url" className="mb-2 block text-sm font-bold text-gray-300">
            URL publique de l’image Supabase
          </label>
          <input
            id="news-image-url"
            name="image_url"
            type="url"
            maxLength={2048}
            placeholder="https://yqgcsaxzpzrueepcomzr.supabase.co/storage/v1/object/public/…"
            defaultValue={news?.image_url ?? ""}
            className={inputClass}
          />
          <p className="mt-2 text-sm text-gray-500">
            Aucun téléversement : utilisez seulement une image publique existante du projet Supabase.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex cursor-pointer items-center gap-4 rounded-2xl border border-white/10 bg-[#020B2E] p-5">
            <input
              name="is_breaking"
              type="checkbox"
              defaultChecked={news?.is_breaking ?? false}
              className="h-5 w-5 accent-[#FCCD12]"
            />
            <span className="font-bold">Marquer comme urgente</span>
          </label>

          <label className="flex cursor-pointer items-center gap-4 rounded-2xl border border-white/10 bg-[#020B2E] p-5">
            <input
              name="is_published"
              type="checkbox"
              defaultChecked={news?.is_published ?? false}
              className="h-5 w-5 accent-[#FCCD12]"
            />
            <span className="font-bold">Publier immédiatement</span>
          </label>
        </div>

        {state.message && (
          <p
            role="status"
            className={`rounded-2xl border p-4 font-bold ${
              state.success
                ? "border-green-500/30 bg-green-500/10 text-green-300"
                : "border-red-500/30 bg-red-500/10 text-red-300"
            }`}
          >
            {state.message}
          </p>
        )}

        <div className="flex flex-wrap gap-4">
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-[#FCCD12] px-8 py-4 font-black text-[#020B2E] transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending
              ? "Enregistrement…"
              : news
                ? "Enregistrer les modifications"
                : "Créer l’actualité"}
          </button>

          {news && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-full border border-white/15 px-8 py-4 font-bold transition hover:border-[#FCCD12] hover:text-[#FCCD12]"
            >
              Annuler
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
