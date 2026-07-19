"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import NewsForm from "./news-form";
import {
  deleteNewsAction,
  setNewsPublishedAction,
} from "./news-actions";
import type { TvNews } from "../../../types/tv-news";
import type { TvNewsMedia } from "../../../types/tv-news-media";
import NewsMediaUploader from "./components/news-media-uploader";
import NewsMediaList from "./components/news-media-list";

function formatDate(value: string | null) {
  if (!value) return "Date non définie";

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Dakar",
  }).format(new Date(value));
}

export default function NewsClient({ news, media }: { news: TvNews[]; media: TvNewsMedia[] }) {
  const router = useRouter();
  const [editingNews, setEditingNews] = useState<TvNews | null>(null);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [pending, startTransition] = useTransition();

  const closeEditor = useCallback(() => setEditingNews(null), []);

  const togglePublished = (item: TvNews) => {
    setMessage("");
    startTransition(async () => {
      const result = await setNewsPublishedAction(item.id, !item.is_published);
      setMessage(result.message);
      setIsError(!result.success);
      if (result.success) router.refresh();
    });
  };

  const removeNews = (item: TvNews) => {
    if (!window.confirm(`Supprimer définitivement « ${item.title} » ?`)) return;

    setMessage("");
    startTransition(async () => {
      const result = await deleteNewsAction(item.id);
      setMessage(result.message);
      setIsError(!result.success);
      if (result.success) {
        if (editingNews?.id === item.id) setEditingNews(null);
        router.refresh();
      }
    });
  };

  return (
    <>
      <NewsForm
        key={editingNews?.id ?? "create"}
        news={editingNews}
        onSaved={closeEditor}
        onCancel={closeEditor}
      />
      {editingNews && (
        <section className="mt-6 rounded-[30px] border border-white/10 bg-white/5 p-7 md:p-10">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-[#FCCD12]">Pièces jointes</p>
          <NewsMediaUploader newsId={editingNews.id} currentCount={media.filter((item) => item.news_id === editingNews.id).length} onChanged={() => router.refresh()} />
          <NewsMediaList newsId={editingNews.id} media={media.filter((item) => item.news_id === editingNews.id).sort((a, b) => a.sort_order - b.sort_order)} onChanged={() => router.refresh()} />
        </section>
      )}

      <section className="mt-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-[#FCCD12]">
              Rédaction
            </p>
            <h2 className="mt-3 text-3xl font-black">Toutes les actualités</h2>
          </div>
          <span className="rounded-full border border-white/10 px-5 py-2 font-bold text-gray-300">
            {news.length} actualité{news.length > 1 ? "s" : ""}
          </span>
        </div>

        {message && (
          <p
            role="status"
            className={`mt-6 rounded-2xl border p-4 font-bold ${
              isError
                ? "border-red-500/30 bg-red-500/10 text-red-300"
                : "border-green-500/30 bg-green-500/10 text-green-300"
            }`}
          >
            {message}
          </p>
        )}

        {news.length === 0 ? (
          <div className="mt-8 rounded-[28px] border border-dashed border-white/15 bg-white/5 p-12 text-center">
            <h3 className="text-2xl font-black">Aucune actualité</h3>
            <p className="mt-3 text-gray-400">
              Utilisez le formulaire pour créer la première actualité.
            </p>
          </div>
        ) : (
          <div className="mt-8 space-y-5">
            {news.map((item) => (
              <article
                key={item.id}
                className="rounded-[28px] border border-white/10 bg-[#071542] p-6 md:p-8"
              >
                <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-blue-500/15 px-4 py-2 text-xs font-black uppercase tracking-wider text-blue-300">
                        {item.category}
                      </span>
                      {item.is_breaking && (
                        <span className="rounded-full bg-red-500 px-4 py-2 text-xs font-black uppercase text-white">
                          Urgent
                        </span>
                      )}
                      <span
                        className={`rounded-full px-4 py-2 text-xs font-black uppercase ${
                          item.is_published
                            ? "bg-green-500/15 text-green-300"
                            : "bg-white/5 text-gray-400"
                        }`}
                      >
                        {item.is_published ? "Publiée" : "Masquée"}
                      </span>
                    </div>

                    <h3 className="mt-5 text-2xl font-black">{item.title}</h3>
                    <p className="mt-3 whitespace-pre-wrap leading-7 text-gray-400">
                      {item.summary}
                    </p>
                    <p className="mt-4 text-sm font-bold text-gray-500">
                      Publication : {formatDate(item.published_at)}
                    </p>
                    {item.source_name && (
                      <p className="mt-2 text-sm text-gray-500">
                        Source : {item.source_name}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingNews(item);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      disabled={pending}
                      className="rounded-full border border-blue-500/30 bg-blue-500/10 px-5 py-3 text-sm font-black text-blue-300 transition hover:bg-blue-500 hover:text-white disabled:opacity-50"
                    >
                      Modifier
                    </button>
                    <button
                      type="button"
                      onClick={() => togglePublished(item)}
                      disabled={pending}
                      className="rounded-full border border-orange-500/30 bg-orange-500/10 px-5 py-3 text-sm font-black text-orange-300 transition hover:bg-orange-500 hover:text-white disabled:opacity-50"
                    >
                      {item.is_published ? "Masquer" : "Publier"}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeNews(item)}
                      disabled={pending}
                      className="rounded-full border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm font-black text-red-300 transition hover:bg-red-500 hover:text-white disabled:opacity-50"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
