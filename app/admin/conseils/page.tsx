import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import { getAllArticlesAdmin } from "../../../lib/bichridigital-articles";
import ArticlesAdminClient from "./articles-admin-client";

export const dynamic = "force-dynamic";

export default async function AdminArticlesPage() {
  const supabase = await createClient(); const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/admin/login");
  const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");
  if (adminError || !isAdmin) redirect("/admin/login");
  const articles = await getAllArticlesAdmin();
  return <main className="min-h-screen bg-[#020B2E] px-5 py-10 text-white md:px-10"><div className="mx-auto max-w-7xl"><header className="flex flex-col justify-between gap-6 rounded-[30px] border border-white/10 bg-white/5 p-7 md:flex-row md:items-center"><div><p className="font-black uppercase tracking-[.2em] text-[#FCCD12]">Administration</p><h1 className="mt-3 text-4xl font-black">Conseils Bichridigital</h1><p className="mt-3 text-white/60">Rédiger, publier et organiser les articles éditoriaux.</p></div><div className="flex gap-3"><Link href="/admin" className="rounded-full border border-white/20 px-5 py-3 font-bold">Tableau de bord</Link><Link href="/admin/conseils/nouveau" className="rounded-full bg-[#FCCD12] px-5 py-3 font-black text-[#020B2E]">Nouvel article</Link></div></header><ArticlesAdminClient articles={articles} /></div></main>;
}
