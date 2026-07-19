import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "../../../components/navbar";
import Footer from "../../../components/footer";
import { getPublishedTvNewsById } from "../../../../lib/tv-news";
import NewsMediaGallery from "./news-media-gallery";
import ShareButtons from "./share-buttons";

type Props = { params: Promise<{ id: string }> };
const formatDate = (value: string | null) => value ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeStyle: "short", timeZone: "Africa/Dakar" }).format(new Date(value)) : "";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params; const result = await getPublishedTvNewsById(id);
  if (!result) return { title: "Actualité introuvable" };
  const cover = result.media.find((item) => item.is_cover && item.media_type === "image")?.url ?? result.news.image_url;
  return { title: result.news.title, description: result.news.summary, alternates: { canonical: `/tv/news/${id}` }, openGraph: { title: result.news.title, description: result.news.summary, type: "article", publishedTime: result.news.published_at ?? undefined, images: cover ? [{ url: cover }] : undefined } };
}

export default async function TvNewsPage({ params }: Props) {
  const { id } = await params; const result = await getPublishedTvNewsById(id); if (!result) notFound();
  const { news, media } = result;
  return <><Navbar /><main className="min-h-screen bg-[#020B2E] px-6 pb-24 pt-36 text-white"><article className="mx-auto max-w-5xl"><div className="flex flex-wrap gap-3"><span className="rounded-full bg-blue-500/15 px-4 py-2 text-sm font-black text-blue-300">{news.category}</span>{news.is_breaking && <span className="rounded-full bg-red-500 px-4 py-2 text-sm font-black">Urgent</span>}</div><h1 className="mt-6 text-4xl font-black leading-tight md:text-6xl">{news.title}</h1><p className="mt-6 whitespace-pre-wrap text-lg leading-8 text-white/70">{news.summary}</p><div className="mt-6 flex flex-wrap items-center gap-5 text-sm text-white/50"><time dateTime={news.published_at ?? undefined}>{formatDate(news.published_at)}</time>{news.source_name && <span>Source : {news.source_name}</span>}{news.source_url && <a href={news.source_url} target="_blank" rel="noopener noreferrer" className="text-[#FCCD12] hover:underline">Voir la source</a>}<ShareButtons title={news.title} /></div><NewsMediaGallery media={media} /></article></main><Footer /></>;
}
