import Link from "next/link";
import { redirect } from "next/navigation";
import { requirePushAdmin } from "../../../lib/push/admin-auth";
import { getPushAdminDashboard } from "../../../lib/push/service";
import NotificationsClient from "./notifications-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminNotificationsPage() {
  try { await requirePushAdmin(); } catch { redirect("/admin/login"); }
  let dashboard;
  try { dashboard = await getPushAdminDashboard(); } catch {
    return <main className="min-h-screen bg-[#020B2E] px-6 py-12 text-white"><div className="mx-auto max-w-3xl rounded-[28px] border border-red-400/20 bg-red-500/10 p-8"><h1 className="text-3xl font-black">Notifications indisponibles</h1><p className="mt-4">La migration est peut-être absente ou Supabase est indisponible.</p><Link href="/admin/notifications" className="mt-6 inline-flex rounded-full bg-[#FCCD12] px-6 py-3 font-black text-[#020B2E]">Réessayer</Link></div></main>;
  }
  const { devices, deliveries, stats } = dashboard;
  const cards = [["Total", stats.total], ["Actifs", stats.active], ["Désactivés", stats.disabled], ["iOS", stats.ios], ["Android", stats.android], ["Notifications actives", stats.notificationsEnabled]] as const;
  return <main className="min-h-screen bg-[#020B2E] px-5 py-10 text-white md:px-10"><div className="mx-auto max-w-7xl"><header className="flex flex-wrap items-center justify-between gap-5 rounded-[30px] border border-white/10 bg-white/5 p-7"><div><p className="font-black uppercase tracking-[.2em] text-[#FCCD12]">Administration</p><h1 className="mt-3 text-4xl font-black">Notifications push</h1><p className="mt-3 text-white/60">Diagnostic, test unitaire et suivi des reçus Expo.</p></div><div className="flex flex-wrap gap-3"><Link href="/admin/notifications" className="rounded-full border border-[#FCCD12]/40 px-5 py-3 font-bold text-[#FCCD12]">Actualiser</Link><Link href="/admin" className="rounded-full border border-white/20 px-5 py-3 font-bold">Tableau de bord</Link></div></header><section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">{cards.map(([label, value]) => <article key={label} className="rounded-2xl border border-white/10 bg-white/5 p-5"><p className="text-xs font-bold uppercase text-white/50">{label}</p><p className="mt-2 text-3xl font-black">{value}</p></article>)}</section><p className="mt-5 text-sm text-white/55">Dernière inscription : {stats.lastRegistration ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short", timeZone: "Africa/Dakar" }).format(new Date(stats.lastRegistration)) : "aucune"}</p>{stats.lastDeliveryError ? <p className="mt-5 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-100">Dernière erreur : {stats.lastDeliveryError}</p> : null}<NotificationsClient devices={devices} deliveries={deliveries} /></div></main>;
}
