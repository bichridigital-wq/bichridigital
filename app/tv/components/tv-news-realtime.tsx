"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "../../../lib/supabase/client";
import {
  TV_NEWS_PUBLIC_LIMIT,
  type TvNews,
} from "../../../types/tv-news";
import TvNewsSidebar from "./tv-news-sidebar";

const TV_NEWS_SELECT =
  "id,title,summary,category,source_name,source_url,image_url,is_breaking,is_published,published_at,created_at,updated_at";
const MIN_RESYNC_INTERVAL = 60_000;

function sortAndLimit(news: TvNews[]) {
  return [...new Map(news.map((item) => [item.id, item])).values()]
    .sort((left, right) => {
      const leftTime = left.published_at
        ? new Date(left.published_at).getTime()
        : 0;
      const rightTime = right.published_at
        ? new Date(right.published_at).getTime()
        : 0;
      return rightTime - leftTime;
    })
    .slice(0, TV_NEWS_PUBLIC_LIMIT);
}

export default function TvNewsRealtime({
  initialNews,
}: {
  initialNews: TvNews[];
}) {
  const supabase = useMemo(() => createClient(), []);
  const [news, setNews] = useState(() => sortAndLimit(initialNews));
  const lastSyncRef = useRef(0);
  const hasSubscribedRef = useRef(false);

  const resync = useCallback(
    async (force = false) => {
      const now = Date.now();

      if (!force && now - lastSyncRef.current < MIN_RESYNC_INTERVAL) {
        return;
      }

      lastSyncRef.current = now;
      const { data, error } = await supabase
        .from("tv_news")
        .select(TV_NEWS_SELECT)
        .eq("is_published", true)
        .order("published_at", { ascending: false, nullsFirst: false })
        .limit(TV_NEWS_PUBLIC_LIMIT);

      if (!error) {
        setNews(sortAndLimit((data ?? []) as TvNews[]));
      }
    },
    [supabase]
  );

  useEffect(() => {
    const channel = supabase
      .channel("public-tv-news")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tv_news" },
        (payload) => {
          if (payload.eventType === "DELETE") {
            const deleted = payload.old as Partial<TvNews>;
            if (deleted.id) {
              setNews((current) =>
                current.filter((item) => item.id !== deleted.id)
              );
            }
            return;
          }

          const changed = payload.new as TvNews;

          if (changed.id && changed.is_published) {
            setNews((current) => sortAndLimit([...current, changed]));
          } else if (changed.id) {
            setNews((current) =>
              current.filter((item) => item.id !== changed.id)
            );
          }

          if (payload.eventType === "UPDATE") {
            void resync(true);
          }
        }
      )
      .subscribe((status) => {
        if (status !== "SUBSCRIBED") return;

        if (hasSubscribedRef.current) {
          void resync(true);
        } else {
          hasSubscribedRef.current = true;
        }
      });

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        void resync();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      void supabase.removeChannel(channel);
    };
  }, [resync, supabase]);

  return <TvNewsSidebar news={news} />;
}
