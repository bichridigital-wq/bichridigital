"use client";

import { useState } from "react";
export default function ShareButtons({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false); const encoded = encodeURIComponent(url); const text = encodeURIComponent(title);
  return <div className="flex flex-wrap gap-2"><a href={`https://www.facebook.com/sharer/sharer.php?u=${encoded}`} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold">Facebook</a><a href={`https://wa.me/?text=${text}%20${encoded}`} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold">WhatsApp</a><button onClick={async () => { await navigator.clipboard.writeText(url); setCopied(true); }} className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold">{copied ? "Lien copié" : "Copier le lien"}</button></div>;
}
