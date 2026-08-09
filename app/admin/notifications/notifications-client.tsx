"use client";

import { useActionState, useState } from "react";
import type { PushActionState, PushDeliveryAdmin, PushDeviceAdmin } from "../../../types/push";
import {
  checkReceiptsAction,
  disableDeviceAction,
  sendTestPushAction,
} from "./notification-actions";

const initialState: PushActionState = { success: false, message: "" };
const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "Africa/Dakar",
});

function formatAdminDate(value: string) {
  return dateFormatter.format(new Date(value));
}

export default function NotificationsClient({ devices, deliveries }: { devices: PushDeviceAdmin[]; deliveries: PushDeliveryAdmin[] }) {
  const activeDevices = devices.filter((device) => device.isActive && device.tokenLastFour);
  const [requestKey] = useState(() => crypto.randomUUID());
  const [previewTitle, setPreviewTitle] = useState("");
  const [previewBody, setPreviewBody] = useState("");
  const [sendState, sendAction, sendPending] = useActionState(sendTestPushAction, initialState);
  const [receiptState, receiptAction, receiptPending] = useActionState(checkReceiptsAction, initialState);

  return (
    <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_1.2fr]">
      <form action={sendAction} className="rounded-[28px] border border-white/10 bg-white/5 p-6">
        <h2 className="text-2xl font-black">Notification de test</h2>
        <p className="mt-2 text-sm text-white/55">Un seul appareil actif, après confirmation explicite.</p>
        <input type="hidden" name="request_key" value={requestKey} />
        <label className="mt-5 block text-sm font-bold">Appareil
          <select name="device_id" required className="mt-2 w-full rounded-xl border border-white/15 bg-[#071238] px-4 py-3">
            <option value="">Sélectionner</option>
            {activeDevices.map((device) => (
              <option key={device.id} value={device.id}>{device.platform.toUpperCase()} · ••••{device.tokenLastFour} · {device.deviceName ?? "Appareil"}</option>
            ))}
          </select>
        </label>
        <label className="mt-4 block text-sm font-bold">Titre
          <input name="title" required maxLength={100} value={previewTitle} onChange={(event) => setPreviewTitle(event.target.value)} className="mt-2 w-full rounded-xl border border-white/15 bg-[#071238] px-4 py-3" />
        </label>
        <label className="mt-4 block text-sm font-bold">Message
          <textarea name="body" required maxLength={500} rows={4} value={previewBody} onChange={(event) => setPreviewBody(event.target.value)} className="mt-2 w-full rounded-xl border border-white/15 bg-[#071238] px-4 py-3" />
        </label>
        <label className="mt-4 block text-sm font-bold">Destination
          <select name="destination_type" className="mt-2 w-full rounded-xl border border-white/15 bg-[#071238] px-4 py-3">
            <option value="profile">Profil</option><option value="live">Direct</option><option value="emission">Émission</option><option value="video">Vidéo</option>
          </select>
        </label>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-bold">Slug émission<input name="emission_slug" className="mt-2 w-full rounded-xl border border-white/15 bg-[#071238] px-4 py-3" /></label>
          <label className="text-sm font-bold">ID vidéo<input name="video_id" maxLength={11} className="mt-2 w-full rounded-xl border border-white/15 bg-[#071238] px-4 py-3" /></label>
        </div>
        <label className="mt-5 flex items-start gap-3 text-sm text-white/70"><input type="checkbox" name="confirmation" value="confirmed" required className="mt-1" />Je confirme l’envoi réel de ce test à l’appareil sélectionné.</label>
        <div className="mt-5 rounded-2xl border border-white/10 bg-[#020B2E] p-4" aria-live="polite"><p className="text-xs font-black uppercase tracking-wider text-[#FCCD12]">Aperçu</p><p className="mt-2 font-black">{previewTitle || "Titre de la notification"}</p><p className="mt-1 text-sm text-white/60">{previewBody || "Le message apparaîtra ici avant confirmation."}</p></div>
        <button disabled={sendPending || activeDevices.length === 0} className="mt-5 rounded-full bg-[#FCCD12] px-6 py-3 font-black text-[#020B2E] disabled:opacity-50">{sendPending ? "Envoi…" : "Envoyer le test"}</button>
        {sendState.message ? <p className={`mt-4 text-sm ${sendState.success ? "text-green-300" : "text-red-300"}`}>{sendState.message}</p> : null}
      </form>

      <section className="rounded-[28px] border border-white/10 bg-white/5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div><h2 className="text-2xl font-black">Appareils</h2><p className="mt-2 text-sm text-white/55">Aucun token complet n’est affiché.</p></div>
          <form action={receiptAction}><button disabled={receiptPending} className="rounded-full border border-[#FCCD12]/50 px-5 py-2.5 font-bold text-[#FCCD12] disabled:opacity-50">{receiptPending ? "Vérification…" : "Vérifier les reçus"}</button></form>
        </div>
        {receiptState.message ? <p className="mt-4 text-sm text-white/65">{receiptState.message}</p> : null}
        {devices.length === 0 ? <p className="mt-8 rounded-2xl border border-dashed border-white/15 p-6 text-white/55">Aucun appareil enregistré.</p> : (
          <div className="mt-6 space-y-4">{devices.map((device) => (
            <article key={device.id} className="rounded-2xl border border-white/10 bg-[#071238] p-5">
              <div className="flex flex-wrap justify-between gap-4"><div><p className="font-black">{device.deviceName ?? "Appareil sans nom"}</p><p className="mt-1 text-sm text-white/55">{device.platform.toUpperCase()} · token ••••{device.tokenLastFour ?? "absent"} · {device.appVersion ?? "version inconnue"}</p></div><span className={`h-fit rounded-full px-3 py-1 text-xs font-black ${device.isActive ? "bg-green-500/15 text-green-300" : "bg-red-500/15 text-red-300"}`}>{device.isActive ? "Actif" : "Désactivé"}</span></div>
              <p className="mt-3 text-sm text-white/55">{device.locale ?? "locale inconnue"} · {device.timezone ?? "timezone inconnue"} · dernière activité {formatAdminDate(device.lastSeenAt)}</p>
              <p className="mt-2 text-xs text-white/45">Vidéos {device.preferences.notifyNewVideos ? "oui" : "non"} · Directs {device.preferences.notifyLiveStarts ? "oui" : "non"} · Émissions {device.preferences.notifyFollowedEmissions ? "oui" : "non"}</p>
              {device.isActive ? (
                <form action={disableDeviceAction} className="mt-4">
                  <input type="hidden" name="device_id" value={device.id} />
                  <input type="hidden" name="confirmation" value="disable" />
                  <button className="rounded-full border border-red-400/40 px-4 py-2 text-sm font-bold text-red-300" onClick={(event) => { if (!window.confirm("Désactiver cet appareil ?")) event.preventDefault(); }}>Désactiver</button>
                </form>
              ) : null}
            </article>
          ))}</div>
        )}
      </section>
      <section className="rounded-[28px] border border-white/10 bg-white/5 p-6 xl:col-span-2">
        <h2 className="text-2xl font-black">Tickets et reçus récents</h2>
        {deliveries.length === 0 ? <p className="mt-4 text-white/55">Aucune livraison enregistrée.</p> : <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{deliveries.map((delivery) => <article key={delivery.id} className="rounded-2xl border border-white/10 bg-[#071238] p-4"><p className="text-xs font-black uppercase tracking-wider text-[#FCCD12]">{delivery.notificationType ?? "type inconnu"}</p><p className="mt-2 font-bold">Token ••••{delivery.tokenLastFour ?? "absent"}</p><p className="mt-2 text-sm text-white/60">Ticket : {delivery.ticketStatus ?? "en attente"}{delivery.ticketErrorCode ? ` (${delivery.ticketErrorCode})` : ""}</p><p className="mt-1 text-sm text-white/60">Reçu : {delivery.receiptStatus ?? "en attente"}{delivery.receiptErrorCode ? ` (${delivery.receiptErrorCode})` : ""}</p><p className="mt-2 text-xs text-white/40">{formatAdminDate(delivery.createdAt)}</p></article>)}</div>}
      </section>
    </div>
  );
}
