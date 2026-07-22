"use client";

import { useState } from "react";
import { ARTICLE_CATEGORIES, ARTICLE_CATEGORY_LABELS, type ArticleCategory, type BichridigitalArticle } from "../../types/bichridigital-article";
import ArticleCard from "./article-card";

export default function ArticleGrid({ articles }: { articles: BichridigitalArticle[] }) {
  const [category, setCategory] = useState<ArticleCategory | "all">("all");
  const filtered = category === "all" ? articles : articles.filter((item) => item.category === category);
  return <><div className="mt-10 flex flex-wrap gap-2"><button onClick={() => setCategory("all")} className={`rounded-full px-4 py-2 text-sm font-bold ${category === "all" ? "bg-[#FCCD12] text-[#020B2E]" : "border border-white/15 text-white/70"}`}>Tous</button>{ARTICLE_CATEGORIES.map((item) => <button key={item} onClick={() => setCategory(item)} className={`rounded-full px-4 py-2 text-sm font-bold ${category === item ? "bg-[#FCCD12] text-[#020B2E]" : "border border-white/15 text-white/70"}`}>{ARTICLE_CATEGORY_LABELS[item]}</button>)}</div><div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">{filtered.map((article) => <ArticleCard key={article.id} article={article} />)}</div>{!filtered.length && <p className="mt-10 rounded-[28px] border border-white/10 bg-white/5 p-10 text-center text-white/60">Aucun article publié dans cette catégorie pour le moment.</p>}</>;
}
