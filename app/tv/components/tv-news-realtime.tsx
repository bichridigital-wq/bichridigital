"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "../../../lib/supabase/client";
import { TV_NEWS_PUBLIC_LIMIT, type TvNews, type TvNewsListItem } from "../../../types/tv-news";
import { TV_NEWS_MEDIA_BUCKET } from "../../../types/tv-news-media";
import TvNewsSidebar from "./tv-news-sidebar";
import TvNewsToast from "./tv-news-toast";

const SELECT = "id,title,summary,category,source_name,source_url,image_url,is_breaking,is_published,published_at,created_at,updated_at,tv_news_media(media_type,storage_path,is_cover,sort_order)";
const MIN_RESYNC_INTERVAL = 60_000;
type Raw = TvNews & { tv_news_media?: { media_type: string; storage_path: string | null; is_cover: boolean }[] };

export default function TvNewsRealtime({ initialNews }: { initialNews: TvNewsListItem[] }) {
  const supabase = useMemo(() => createClient(), []); const [news, setNews] = useState(initialNews); const [toast, setToast] = useState<TvNewsListItem | null>(null);
  const lastSync = useRef(0); const subscribed = useRef(false); const seen = useRef(new Set(initialNews.map((item) => item.id)));
  const resync = useCallback(async (force = false) => {
    const now = Date.now(); if (!force && now - lastSync.current < MIN_RESYNC_INTERVAL) return; lastSync.current = now;
    const { data, error } = await supabase.from("tv_news").select(SELECT).eq("is_published", true).order("published_at", { ascending: false, nullsFirst: false }).limit(TV_NEWS_PUBLIC_LIMIT);
    if (error) return;
    const mapped = ((data ?? []) as unknown as Raw[]).map((item) => { const cover = item.tv_news_media?.find((media) => media.is_cover && media.media_type === "image" && media.storage_path); return { ...item, cover_image_url: cover?.storage_path ? supabase.storage.from(TV_NEWS_MEDIA_BUCKET).getPublicUrl(cover.storage_path).data.publicUrl : item.image_url, media_types: [...new Set(item.tv_news_media?.map((media) => media.media_type) ?? [])] } as TvNewsListItem; });
    setNews(mapped);
  }, [supabase]);
  useEffect(() => {
    const channel = supabase.channel("public-tv-news").on("postgres_changes", { event: "*", schema: "public", table: "tv_news" }, (payload) => {
      if (payload.eventType === "INSERT") { const inserted = payload.new as TvNews; if (inserted.is_published && !seen.current.has(inserted.id)) { seen.current.add(inserted.id); setToast({ ...inserted, cover_image_url: inserted.image_url, media_types: [] }); } }
      void resync(true);
    }).subscribe((status) => { if (status === "SUBSCRIBED") { if (subscribed.current) void resync(true); else subscribed.current = true; } });
    const visible = () => { if (document.visibilityState === "visible") void resync(); }; document.addEventListener("visibilitychange", visible);
    return () => { document.removeEventListener("visibilitychange", visible); void supabase.removeChannel(channel); };
  }, [resync, supabase]);
  const closeToast = useCallback(() => setToast(null), []);
  return <><TvNewsSidebar news={news} />{toast && <TvNewsToast news={toast} onClose={closeToast} />}</>;
}
