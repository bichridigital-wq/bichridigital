import Image from "next/image";
import Link from "next/link";
import { FileAudio, FileImage, FileText, FileVideo, Newspaper } from "lucide-react";
import type { TvNewsListItem } from "../../../types/tv-news";

function formatDate(value: string | null) {
  if (!value) return "";

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Dakar",
  }).format(new Date(value));
}

const mediaIcons = { image: FileImage, video: FileVideo, youtube: FileVideo, audio: FileAudio, pdf: FileText };

export default function TvNewsSidebar({ news }: { news: TvNewsListItem[] }) {
  return (
    <aside className="min-w-0 lg:sticky lg:top-24">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FCCD12] text-[#020B2E]">
          <Newspaper className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#FCCD12]">
            L’actualité
          </p>
          <h2 className="text-xl font-black">Bichridigital News</h2>
        </div>
      </div>

      {news.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-white/15 bg-[#070F33] p-6 text-sm leading-6 text-white/55">
          Aucune actualité publiée pour le moment.
        </div>
      ) : (
        <div className="flex snap-x gap-4 overflow-x-auto pb-3 lg:max-h-[calc(100vh-9rem)] lg:block lg:space-y-4 lg:overflow-x-hidden lg:overflow-y-auto lg:pb-8 lg:pr-2">
          {news.map((item) => (
            <article
              key={item.id}
              className="w-[82vw] min-w-[280px] max-w-[330px] snap-start overflow-hidden rounded-[24px] border border-white/10 bg-[#070F33] shadow-[0_16px_45px_rgba(0,0,0,0.2)] lg:w-auto lg:min-w-0 lg:max-w-none"
            >
              {item.cover_image_url && (
                <div className="relative aspect-[16/9] bg-[#020B2E]">
                  <Image
                    src={item.cover_image_url}
                    alt={`Illustration de l’actualité : ${item.title}`}
                    fill
                    sizes="(max-width: 1023px) 82vw, 340px"
                    className="object-cover"
                  />
                </div>
              )}

              <div className="p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-[#FCCD12]">
                    {item.category}
                  </span>
                  {item.is_breaking && (
                    <span className="rounded-full bg-red-500 px-2.5 py-1 text-[10px] font-black uppercase text-white">
                      Urgent
                    </span>
                  )}
                </div>

                <h3 className="mt-3 text-lg font-black leading-snug">
                  {item.title}
                </h3>
                <p className="mt-3 line-clamp-4 text-sm leading-6 text-white/60">
                  {item.summary}
                </p>
                <p className="mt-4 text-xs font-bold text-white/35">
                  {formatDate(item.published_at)}
                </p>

                {item.media_types.length > 0 && <div className="mt-3 flex gap-2" aria-label="Types de médias">{item.media_types.map((type) => { const Icon = mediaIcons[type as keyof typeof mediaIcons]; return Icon ? <Icon key={type} className="h-4 w-4 text-white/45" aria-label={type} /> : null; })}</div>}

                {item.source_name && (
                  <p className="mt-2 text-xs text-white/45">
                    Source : {item.source_name}
                  </p>
                )}

                <Link
                    href={`/tv/news/${item.id}`}
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-black text-[#FCCD12] hover:underline"
                  >
                    Lire la suite
                  </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </aside>
  );
}
