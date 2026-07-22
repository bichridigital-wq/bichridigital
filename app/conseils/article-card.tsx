import Image from "next/image";
import Link from "next/link";
import { ARTICLE_CATEGORY_LABELS, type BichridigitalArticle } from "../../types/bichridigital-article";
import { readingMinutes } from "../../lib/article-format";

export default function ArticleCard({ article }: { article: BichridigitalArticle }) {
  const date = article.published_at ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeZone: "Africa/Dakar" }).format(new Date(article.published_at)) : "";
  return <article className="group overflow-hidden rounded-[28px] border border-white/10 bg-white/[.05] transition hover:-translate-y-1 hover:border-[#FCCD12]/50">
    <div className="relative aspect-[16/10] bg-[#08143D]">{article.cover_url ? <Image src={article.cover_url} alt={`Couverture de ${article.title}`} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover transition duration-500 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center text-sm font-black uppercase tracking-[.2em] text-white/30">Bichridigital</div>}</div>
    <div className="p-6"><p className="text-xs font-black uppercase tracking-[.14em] text-[#FCCD12]">{ARTICLE_CATEGORY_LABELS[article.category]}</p><h2 className="mt-3 text-2xl font-black leading-tight text-white"><Link href={`/conseils/${article.slug}`}>{article.title}</Link></h2><p className="mt-4 line-clamp-3 leading-7 text-white/60">{article.excerpt}</p><div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs text-white/45"><span>{article.author_name}</span><time dateTime={article.published_at ?? undefined}>{date}</time><span>{readingMinutes(article.content)} min de lecture</span></div><Link href={`/conseils/${article.slug}`} className="mt-6 inline-flex rounded-full bg-[#FCCD12] px-5 py-2.5 text-sm font-black text-[#020B2E]">Lire l’article</Link></div>
  </article>;
}
