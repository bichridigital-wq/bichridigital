"use client";

export default function ShareButtons({ title }: { title: string }) {
  const share = async () => {
    if (navigator.share) await navigator.share({ title, url: window.location.href });
    else await navigator.clipboard.writeText(window.location.href);
  };
  return <button type="button" onClick={() => void share()} className="rounded-full border border-white/15 px-5 py-3 font-bold transition hover:border-[#FCCD12] hover:text-[#FCCD12]">Partager l’actualité</button>;
}
