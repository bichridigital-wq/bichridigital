import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSchedule } from "../../../lib/schedule/service";
import { createClient } from "../../../lib/supabase/server";
import ScheduleClient from "./schedule-client";
import { getProgramsAdmin } from "../../../lib/programs/service";
import { getGuestsAdmin } from "../../../lib/guests/service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function ScheduleLoadError() {
  return (
    <main className="min-h-screen bg-[#020B2E] px-5 py-10 text-white md:px-10">
      <div className="mx-auto max-w-3xl rounded-[30px] border border-red-400/20 bg-red-500/10 p-8">
        <h1 className="text-3xl font-black">Agenda indisponible</h1>
        <p className="mt-4 text-red-100">
          Impossible de charger les programmes ou l’agenda. Réessayez ou
          consultez les journaux du serveur.
        </p>
        <Link
          href="/admin/schedule"
          className="mt-6 inline-flex rounded-full bg-[#FCCD12] px-6 py-3 font-black text-[#020B2E]"
        >
          Réessayer
        </Link>
      </div>
    </main>
  );
}

export default async function AdminSchedulePage() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) {
    console.error("[schedule] Échec de la vérification de session.", {
      message: userError.message,
    });
    return <ScheduleLoadError />;
  }
  if (!user) redirect("/admin/login");

  const { data: isAdmin, error: adminError } =
    await supabase.rpc("is_admin");
  if (adminError) {
    console.error("[schedule] Échec de la vérification administrateur.", {
      code: adminError.code,
      message: adminError.message,
    });
    return <ScheduleLoadError />;
  }
  if (!isAdmin) redirect("/admin/login");

  const [eventsResult, programsResult, guestsResult] = await Promise.allSettled([
    getAdminSchedule(supabase),
    getProgramsAdmin(supabase),
    getGuestsAdmin(supabase),
  ]);
  if (eventsResult.status === "rejected") {
    console.error("[schedule] Chargement de l’agenda interrompu.", eventsResult.reason);
  }
  if (programsResult.status === "rejected") {
    console.error(
      "[schedule] Chargement des programmes interrompu.",
      programsResult.reason,
    );
  }
  if (guestsResult.status === "rejected") {
    console.error("[schedule] Chargement des invités interrompu.", guestsResult.reason);
  }
  if (
    eventsResult.status === "rejected" ||
    programsResult.status === "rejected" ||
    guestsResult.status === "rejected"
  ) {
    return <ScheduleLoadError />;
  }
  const events = eventsResult.value;
  const programs = programsResult.value;
  const guests = guestsResult.value;

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
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/programs"
              className="rounded-full bg-[#FCCD12] px-6 py-3 text-center font-black text-[#020B2E]"
            >
              Modèles de programmes
            </Link>
            <Link
              href="/admin"
              className="rounded-full border border-white/15 px-6 py-3 text-center font-bold transition hover:border-[#FCCD12] hover:text-[#FCCD12]"
            >
              ← Tableau de bord
            </Link>
          </div>
        </header>
        <div className="mt-10">
          <ScheduleClient events={events} programs={programs} guests={guests} />
        </div>
      </div>
    </main>
  );
}
