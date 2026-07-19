"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  createNewsDraftAction,
  finalizeNewsCreationAction,
  updateCreationDraftAction,
  updateNewsAction,
} from "./news-actions";
import NewsMediaUploader, { type NewsMediaUploaderHandle } from "./components/news-media-uploader";
import {
  TV_NEWS_CATEGORIES,
  type TvNews,
} from "../../../types/tv-news";

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
  const [willPublish, setWillPublish] = useState(news?.is_published ?? false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [createdDraftId, setCreatedDraftId] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const uploaderRef = useRef<NewsMediaUploaderHandle>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true); setMessage(""); setIsError(false);
    const formData = new FormData(event.currentTarget);
    const publish = formData.get("is_published") === "on";
    const notification = formData.get("notification_requested") === "on";
    try {
      if (news) {
        const result = await updateNewsAction(news.id, { success: false, message: "" }, formData);
        setMessage(result.message); setIsError(!result.success);
        if (result.success) { router.refresh(); onSaved(); }
        return;
      }
      const draftResult = createdDraftId
        ? await updateCreationDraftAction(createdDraftId, { success: false, message: "" }, formData)
        : await createNewsDraftAction({ success: false, message: "" }, formData);
      if (!draftResult.success || !draftResult.newsId) throw new Error(draftResult.message);
      const newsId = draftResult.newsId;
      setCreatedDraftId(newsId);
      const uploadResult = await uploaderRef.current?.uploadQueued(newsId);
      if (uploadResult && !uploadResult.success) {
        setMessage(`${uploadResult.message} L’actualité reste en brouillon ; corrigez le fichier puis réessayez.`);
        setIsError(true); router.refresh(); return;
      }
      const finalResult = await finalizeNewsCreationAction(newsId, publish, notification);
      setMessage(finalResult.message); setIsError(!finalResult.success);
      if (finalResult.success) { formRef.current?.reset(); setCreatedDraftId(null); router.refresh(); onSaved(); }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Une erreur inattendue est survenue.");
      setIsError(true);
    } finally {
      setSubmitting(false);
    }
  };

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

      <form ref={formRef} onSubmit={(event) => void submit(event)} className="mt-8 space-y-6">
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

        {!news && (
          <NewsMediaUploader
            ref={uploaderRef}
            currentCount={0}
            onChanged={() => router.refresh()}
            creationMode
          />
        )}

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
              onChange={(event) => setWillPublish(event.target.checked)}
              className="h-5 w-5 accent-[#FCCD12]"
            />
            <span className="font-bold">Publier immédiatement</span>
          </label>
        </div>

        <label className={`flex items-center gap-4 rounded-2xl border border-white/10 bg-[#020B2E] p-5 ${willPublish ? "cursor-pointer" : "opacity-50"}`}>
          <input
            name="notification_requested"
            type="checkbox"
            disabled={!willPublish || Boolean(news?.is_published) || Boolean(news?.notified_at)}
            defaultChecked={news?.notification_requested && !news.notified_at}
            className="h-5 w-5 accent-[#FCCD12]"
          />
          <span><strong>Envoyer une notification lors de la publication</strong><span className="mt-1 block text-sm text-gray-500">L’envoi ne démarre qu’après l’enregistrement d’une publication.</span></span>
        </label>

        {message && (
          <p
            role="status"
            className={`rounded-2xl border p-4 font-bold ${
              isError
                ? "border-red-500/30 bg-red-500/10 text-red-300"
                : "border-green-500/30 bg-green-500/10 text-green-300"
            }`}
          >
            {message}
          </p>
        )}

        <div className="flex flex-wrap gap-4">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-[#FCCD12] px-8 py-4 font-black text-[#020B2E] transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting
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
