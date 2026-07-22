import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../../../lib/supabase/server";
import ArticleForm from "../article-form";

export const dynamic = "force-dynamic";
export default async function NewArticlePage() {
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect("/admin/login");
  const { data: isAdmin } = await supabase.rpc("is_admin"); if (!isAdmin) redirect("/admin/login");
  return <main className="min-h-screen bg-[#020B2E] px-5 py-10 text-white md:px-10"><div className="mx-auto max-w-5xl"><Link href="/admin/conseils" className="text-sm font-bold text-[#FCCD12]">← Retour aux articles</Link><h1 className="mt-5 text-4xl font-black">Nouvel article</h1><ArticleForm /></div></main>;
}
