"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "../../../lib/supabase/client";
import { type TvNews, type TvNewsListItem } from "../../../types/tv-news";
import {
  getPublishedTvNewsAction,
  getPublishedTvNewsToastAction,
} from "../tv-news-actions";
import TvNewsSidebar from "./tv-news-sidebar";
import TvNewsToast from "./tv-news-toast";

const MIN_RESYNC_INTERVAL = 60_000;
const pendingToastIds = new Set<string>();
const toastedNewsIds = new Set<string>();

export default function TvNewsRealtime({ initialNews }: { initialNews: TvNewsListItem[] }) {
  const supabase = useMemo(() => createClient(), []); const [news, setNews] = useState(initialNews); const [toast, setToast] = useState<TvNewsListItem | null>(null);
  const lastSync = useRef(0); const subscribed = useRef(false);
  const resync = useCallback(async (force = false) => {
    const now = Date.now(); if (!force && now - lastSync.current < MIN_RESYNC_INTERVAL) return; lastSync.current = now;
    try {
      const latestNews = await getPublishedTvNewsAction();
      setNews(latestNews);
    } catch { return; }
  }, []);
  const loadToast = useCallback(async (newsId: string) => {
    try {
      const publishedNews = await getPublishedTvNewsToastAction(newsId);
      if (publishedNews && !toastedNewsIds.has(newsId)) {
        toastedNewsIds.add(newsId);
        setToast(publishedNews);
      }
    } catch { return; }
    finally { pendingToastIds.delete(newsId); }
  }, []);
  useEffect(() => {
    const channel = supabase.channel("public-tv-news").on("postgres_changes", { event: "*", schema: "public", table: "tv_news" }, (payload) => {
      const changed = payload.eventType === "INSERT" || payload.eventType === "UPDATE"
        ? payload.new as TvNews
        : null;
      const toastNewsId = changed?.is_published === true &&
        Boolean(changed.published_at) &&
        Boolean(changed.updated_at) &&
        changed.published_at === changed.updated_at &&
        !pendingToastIds.has(changed.id) &&
        !toastedNewsIds.has(changed.id)
        ? changed.id
        : undefined;
      if (toastNewsId) pendingToastIds.add(toastNewsId);
      if (toastNewsId) void loadToast(toastNewsId);
      void resync(true);
    }).subscribe((status) => { if (status === "SUBSCRIBED") { if (subscribed.current) void resync(true); else subscribed.current = true; } });
    const visible = () => { if (document.visibilityState === "visible") void resync(); }; document.addEventListener("visibilitychange", visible);
    return () => { document.removeEventListener("visibilitychange", visible); void supabase.removeChannel(channel); };
  }, [loadToast, resync, supabase]);
  const closeToast = useCallback(() => setToast(null), []);
  return <><TvNewsSidebar news={news} />{toast && <TvNewsToast news={toast} onClose={closeToast} />}</>;
}
