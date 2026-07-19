import Image from "next/image";
import type { PublicTvNewsMedia } from "../../../../types/tv-news-media";

export default function NewsMediaGallery({ media }: { media: PublicTvNewsMedia[] }) {
  if (!media.length) return null;
  return <section aria-label="Médias de l’actualité" className="mt-10 grid gap-6 md:grid-cols-2">
    {media.map((item) => <article key={item.id} className="overflow-hidden rounded-[24px] border border-white/10 bg-[#070F33] p-4">
      {item.media_type === "image" && <div className="relative aspect-video overflow-hidden rounded-2xl bg-black"><Image src={item.url} alt={item.alt_text || `Illustration : ${item.title || item.file_name}`} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-contain" /></div>}
      {item.media_type === "video" && <video controls preload="metadata" className="aspect-video w-full rounded-2xl bg-black"><source src={item.url} type={item.mime_type ?? undefined} /></video>}
      {item.media_type === "audio" && <audio controls preload="none" className="mt-4 w-full"><source src={item.url} type={item.mime_type ?? undefined} /></audio>}
      {item.media_type === "youtube" && item.youtube_embed_url && <div className="relative aspect-video overflow-hidden rounded-2xl"><iframe src={item.youtube_embed_url} title={item.title || "Vidéo YouTube associée"} className="absolute inset-0 h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /></div>}
      {item.media_type === "pdf" && <div className="flex flex-wrap gap-3 p-4"><a href={item.url} target="_blank" rel="noopener noreferrer" className="rounded-full bg-[#FCCD12] px-5 py-3 font-black text-[#020B2E]">Consulter le PDF</a><a href={item.url} download className="rounded-full border border-white/15 px-5 py-3 font-bold">Télécharger</a></div>}
      {item.title && <h2 className="mt-4 text-lg font-black">{item.title}</h2>}
    </article>)}
  </section>;
}
