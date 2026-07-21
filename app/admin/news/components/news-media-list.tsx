"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { deleteNewsMediaAction, reorderNewsMediaAction, updateNewsMediaAction } from "../news-actions";
import type { AdminTvNewsMedia } from "../../../../types/tv-news-media";

export default function NewsMediaList({ newsId, media, onChanged }: { newsId: string; media: AdminTvNewsMedia[]; onChanged: () => void }) {
  const [message, setMessage] = useState(""); const [pending, startTransition] = useTransition();
  const run = (task: () => Promise<{ success: boolean; message: string }>) => startTransition(async () => { const result = await task(); setMessage(result.message); if (result.success) onChanged(); });
  const move = (index: number, offset: number) => { const next = [...media]; const target = index + offset; if (target < 0 || target >= next.length) return; [next[index], next[target]] = [next[target]!, next[index]!]; run(() => reorderNewsMediaAction(newsId, next.map((item) => item.id))); };
  if (!media.length) return null;
  return <div className="mt-4 space-y-3">{media.map((item, index) => (
    <form key={item.id} className="rounded-2xl border border-white/10 bg-[#020B2E] p-4" onSubmit={(e) => { e.preventDefault(); const data = new FormData(e.currentTarget); run(() => updateNewsMediaAction(item.id, String(data.get("title") ?? ""), String(data.get("alt") ?? ""), data.get("cover") === "on")); }}>
      <div className="flex flex-wrap items-center justify-between gap-2"><strong>{item.file_name}</strong><span className="text-xs uppercase text-gray-400">{item.media_type}{item.file_size ? ` · ${(item.file_size / 1024 / 1024).toFixed(2)} Mo` : ""}</span></div>
      {item.signed_url && item.media_type === "image" && <div className="relative mt-3 aspect-video overflow-hidden rounded-xl bg-black"><Image src={item.signed_url} alt={item.alt_text || `Aperçu de ${item.file_name}`} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-contain" /></div>}
      {item.signed_url && item.media_type === "video" && <video controls preload="metadata" className="mt-3 aspect-video w-full rounded-xl bg-black"><source src={item.signed_url} type={item.mime_type ?? undefined} /></video>}
      {item.signed_url && item.media_type === "audio" && <audio controls preload="none" className="mt-3 w-full"><source src={item.signed_url} type={item.mime_type ?? undefined} /></audio>}
      {item.signed_url && item.media_type === "pdf" && <a href={item.signed_url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm font-bold text-[#FCCD12] hover:underline">Aperçu du PDF</a>}
      <div className="mt-3 grid gap-3 md:grid-cols-2"><input name="title" maxLength={180} defaultValue={item.title ?? ""} placeholder="Titre facultatif" className="rounded-xl border border-white/10 bg-[#071542] px-4 py-3" /><input name="alt" maxLength={300} defaultValue={item.alt_text ?? ""} placeholder="Texte alternatif" className="rounded-xl border border-white/10 bg-[#071542] px-4 py-3" /></div>
      <div className="mt-3 flex flex-wrap items-center gap-2">{item.media_type === "image" && <label className="mr-auto flex gap-2"><input name="cover" type="checkbox" defaultChecked={item.is_cover} /> Couverture</label>}<button type="button" onClick={() => move(index, -1)} disabled={pending || index === 0}>↑</button><button type="button" onClick={() => move(index, 1)} disabled={pending || index === media.length - 1}>↓</button><button className="rounded-full border border-blue-400/30 px-4 py-2 text-blue-300">Enregistrer</button><button type="button" className="rounded-full border border-red-400/30 px-4 py-2 text-red-300" onClick={() => { if (confirm(`Supprimer « ${item.file_name} » ?`)) run(() => deleteNewsMediaAction(item.id)); }}>Supprimer</button></div>
    </form>
  ))}{message && <p role="status" className="text-sm text-[#FCCD12]">{message}</p>}</div>;
}
