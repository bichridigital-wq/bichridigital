"use client";

import { useEffect, useState } from "react";

function urlBase64ToUint8Array(value: string) {
  const padding = "=".repeat((4 - value.length % 4) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(window.atob(base64), (character) => character.charCodeAt(0));
}

export default function PushSubscriptionButton() {
  const [supported, setSupported] = useState<boolean | null>(null); const [active, setActive] = useState(false);
  const [urgentOnly, setUrgentOnly] = useState(false); const [loading, setLoading] = useState(false); const [message, setMessage] = useState("");
  useEffect(() => {
    const compatible = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
    void Promise.resolve(compatible).then(setSupported);
    if (compatible) void navigator.serviceWorker.ready.then((registration) => registration.pushManager.getSubscription()).then((subscription) => setActive(Boolean(subscription)));
  }, []);
  const subscribe = async () => {
    setLoading(true); setMessage("");
    try {
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY; if (!publicKey) throw new Error("Notifications non configurées.");
      const permission = await Notification.requestPermission(); if (permission !== "granted") throw new Error("Autorisation de notification refusée.");
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(publicKey) });
      const response = await fetch("/api/push/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...subscription.toJSON(), endpoint: subscription.endpoint, scope: urgentOnly ? "breaking_only" : "all" }) });
      if (!response.ok) { await subscription.unsubscribe(); throw new Error("Souscription impossible."); }
      setActive(true); setMessage("Notifications activées.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Une erreur est survenue."); } finally { setLoading(false); }
  };
  const unsubscribe = async () => {
    setLoading(true); setMessage("");
    try {
      const registration = await navigator.serviceWorker.ready; const subscription = await registration.pushManager.getSubscription();
      if (subscription) { const response = await fetch("/api/push/unsubscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ endpoint: subscription.endpoint }) }); if (!response.ok) throw new Error("Désabonnement impossible."); await subscription.unsubscribe(); }
      setActive(false); setMessage("Notifications désactivées.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Une erreur est survenue."); } finally { setLoading(false); }
  };
  if (supported === false) return <p className="text-xs text-white/45">Les notifications ne sont pas compatibles avec ce navigateur.</p>;
  return <div className="mt-4"><label className="mb-3 flex items-center gap-2 text-xs text-white/60"><input type="checkbox" checked={urgentOnly} disabled={active || loading} onChange={(event) => setUrgentOnly(event.target.checked)} className="accent-[#FCCD12]" />Recevoir uniquement les alertes urgentes</label><button type="button" disabled={!supported || loading} onClick={() => void (active ? unsubscribe() : subscribe())} className="rounded-full border border-[#FCCD12]/35 bg-[#FCCD12]/10 px-4 py-2 text-sm font-black text-[#FCCD12] transition hover:bg-[#FCCD12] hover:text-[#020B2E] disabled:opacity-50">{loading ? "Chargement…" : active ? "Désactiver les notifications" : "Activer les notifications"}</button>{active && <p className="mt-2 text-xs text-green-300">Notifications activées</p>}{message && <p role="status" className="mt-2 text-xs text-white/55">{message}</p>}</div>;
}
