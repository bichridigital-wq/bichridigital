import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSchedule } from "../../../lib/schedule/service";
import { createClient } from "../../../lib/supabase/server";
import ScheduleClient from "./schedule-client";

export const dynamic = "force-dynamic";

export default async function AdminSchedulePage() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) redirect("/admin/login");

  const { data: isAdmin, error: adminError } =
    await supabase.rpc("is_admin");
  if (adminError || !isAdmin) redirect("/admin/login");

  const events = await getAdminSchedule();

  return (
    <main className="min-h-screen bg-[#020B2E] px-5 py-10 text-white md:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col justify-between gap-6 rounded-[30px] border border-white/10 bg-white/5 p-7 md:flex-row md:items-center md:p-10">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-[#FCCD12]">
              Bichridigital Admin
            </p>
            <h1 className="mt-3 text-4xl font-black md:text-5xl">Agenda</h1>
            <p className="mt-4 max-w-2xl leading-7 text-gray-400">
              Administrez les programmations officielles. Toutes les heures
              affichées et saisies sont celles de Dakar.
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
          <ScheduleClient events={events} />
        </div>
      </div>
    </main>
  );
}
