"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "../../../lib/supabase/client";
import { type TvNews, type TvNewsListItem } from "../../../types/tv-news";
import { getPublishedTvNewsAction } from "../tv-news-actions";
import TvNewsSidebar from "./tv-news-sidebar";
import TvNewsToast from "./tv-news-toast";

const MIN_RESYNC_INTERVAL = 60_000;

export default function TvNewsRealtime({ initialNews }: { initialNews: TvNewsListItem[] }) {
  const supabase = useMemo(() => createClient(), []); const [news, setNews] = useState(initialNews); const [toast, setToast] = useState<TvNewsListItem | null>(null);
  const lastSync = useRef(0); const subscribed = useRef(false); const seen = useRef(new Set(initialNews.map((item) => item.id)));
  const resync = useCallback(async (force = false) => {
    const now = Date.now(); if (!force && now - lastSync.current < MIN_RESYNC_INTERVAL) return; lastSync.current = now;
    try { setNews(await getPublishedTvNewsAction()); } catch { return; }
  }, []);
  useEffect(() => {
    const channel = supabase.channel("public-tv-news").on("postgres_changes", { event: "*", schema: "public", table: "tv_news" }, (payload) => {
      if (payload.eventType === "INSERT") { const inserted = payload.new as TvNews; if (inserted.is_published && !seen.current.has(inserted.id)) { seen.current.add(inserted.id); setToast({ ...inserted, image_url: null, cover_image_url: null, media_types: [] }); } }
      void resync(true);
    }).subscribe((status) => { if (status === "SUBSCRIBED") { if (subscribed.current) void resync(true); else subscribed.current = true; } });
    const visible = () => { if (document.visibilityState === "visible") void resync(); }; document.addEventListener("visibilitychange", visible);
    return () => { document.removeEventListener("visibilitychange", visible); void supabase.removeChannel(channel); };
  }, [resync, supabase]);
  const closeToast = useCallback(() => setToast(null), []);
  return <><TvNewsSidebar news={news} />{toast && <TvNewsToast news={toast} onClose={closeToast} />}</>;
}
