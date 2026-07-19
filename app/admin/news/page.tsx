import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import { getAllTvNews } from "../../../lib/tv-news";
import { getAllTvNewsMedia } from "../../../lib/tv-news-media";
import NewsClient from "./news-client";

export const dynamic = "force-dynamic";

export default async function AdminNewsPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/admin/login");
  }

  const { data: isAdmin, error: adminError } =
    await supabase.rpc("is_admin");

  if (adminError || !isAdmin) {
    redirect("/admin/login");
  }

  const [news, media] = await Promise.all([getAllTvNews(), getAllTvNewsMedia()]);

  return (
    <main className="min-h-screen bg-[#020B2E] px-5 py-10 text-white md:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col justify-between gap-6 rounded-[30px] border border-white/10 bg-white/5 p-7 md:flex-row md:items-center md:p-10">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-[#FCCD12]">
              Bichridigital Admin
            </p>
            <h1 className="mt-3 text-4xl font-black md:text-5xl">
              Bichridigital News
            </h1>
            <p className="mt-4 max-w-2xl leading-7 text-gray-400">
              Créez, modifiez, publiez ou masquez les actualités affichées sur Bichridigital TV.
            </p>
          </div>
          <Link
            href="/admin"
            className="rounded-full border border-white/15 px-6 py-3 text-center font-bold transition hover:border-[#FCCD12] hover:text-[#FCCD12]"
          >
            ← Tableau de bord
          </Link>
        </header>

        <div className="mt-10">
          <NewsClient news={news} media={media} />
        </div>
      </div>
    </main>
  );
}
