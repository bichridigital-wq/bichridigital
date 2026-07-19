"use client";

import Link from "next/link";
import { useEffect } from "react";
import type { TvNewsListItem } from "../../../types/tv-news";

export default function TvNewsToast({ news, onClose }: { news: TvNewsListItem; onClose: () => void }) {
  useEffect(() => { const timer = window.setTimeout(onClose, 8000); return () => window.clearTimeout(timer); }, [news.id, onClose]);
  return <div role="status" className="fixed bottom-5 right-5 z-[100] w-[calc(100%-2.5rem)] max-w-sm rounded-[24px] border border-[#FCCD12]/30 bg-[#071542] p-5 text-white shadow-2xl transition motion-reduce:transition-none"><button type="button" onClick={onClose} aria-label="Fermer la notification" className="absolute right-4 top-3 text-xl text-white/50">×</button><p className="text-xs font-black uppercase tracking-wider text-[#FCCD12]">Nouvelle actualité</p>{news.is_breaking && <span className="mt-2 inline-block rounded-full bg-red-500 px-2 py-1 text-[10px] font-black uppercase">Urgent</span>}<p className="mt-3 pr-6 font-black">{news.title}</p><Link href={`/tv/news/${news.id}`} onClick={onClose} className="mt-4 inline-block text-sm font-bold text-[#FCCD12] hover:underline">Lire l’actualité</Link></div>;
}
