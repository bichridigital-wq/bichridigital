"use client";

import { useEffect, useState } from "react";

function countdownUntil(target: string) {
  const remaining = Math.max(0, new Date(target).getTime() - Date.now());

  if (remaining === 0) return "Commence bientôt";

  const totalMinutes = Math.floor(remaining / 60_000);
  const days = Math.floor(totalMinutes / 1_440);
  const hours = Math.floor((totalMinutes % 1_440) / 60);
  const minutes = totalMinutes % 60;

  return [
    days > 0 ? `${days} j` : null,
    `${hours} h`,
    `${minutes} min`,
  ]
    .filter(Boolean)
    .join(" · ");
}

export default function TvCountdown({ startsAt }: { startsAt: string }) {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    const update = () => setLabel(countdownUntil(startsAt));
    update();
    const interval = window.setInterval(update, 60_000);
    return () => window.clearInterval(interval);
  }, [startsAt]);

  return (
    <span aria-live="polite" suppressHydrationWarning>
      {label ?? "Calcul en cours…"}
    </span>
  );
}
