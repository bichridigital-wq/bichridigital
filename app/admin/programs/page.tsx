import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import { getProgramsAdmin } from "../../../lib/programs/service";
import ProgramsClient from "./programs-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function ProgramsLoadError() {
  return (
    <main className="min-h-screen bg-[#020B2E] px-5 py-10 text-white md:px-10">
      <div className="mx-auto max-w-3xl rounded-[30px] border border-red-400/20 bg-red-500/10 p-8">
        <h1 className="text-3xl font-black">Programmes indisponibles</h1>
        <p className="mt-4 text-red-100">
          Impossible de charger les programmes. Réessayez ou consultez les
          journaux du serveur.
        </p>
        <Link
          href="/admin/programs"
          className="mt-6 inline-flex rounded-full bg-[#FCCD12] px-6 py-3 font-black text-[#020B2E]"
        >
          Réessayer
        </Link>
      </div>
    </main>
  );
}

export default async function AdminProgramsPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) {
    console.error("[programs] Échec de la vérification de session.", {
      message: userError.message,
    });
    return <ProgramsLoadError />;
  }
  if (!user) redirect("/admin/login");
  const { data: isAdmin, error: adminError } =
    await supabase.rpc("is_admin");
  if (adminError) {
    console.error("[programs] Échec de la vérification administrateur.", {
      code: adminError.code,
      message: adminError.message,
    });
    return <ProgramsLoadError />;
  }
  if (!isAdmin) redirect("/admin/login");

  let programs;
  try {
    programs = await getProgramsAdmin(supabase);
  } catch (error) {
    console.error("[programs] Chargement interrompu.", error);
    return <ProgramsLoadError />;
  }

  return (
    <main className="min-h-screen bg-[#020B2E] px-5 py-10 text-white md:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col justify-between gap-6 rounded-[30px] border border-white/10 bg-white/5 p-7 md:flex-row md:items-center">
          <div>
            <p className="font-black uppercase tracking-[.2em] text-[#FCCD12]">
              Administration
            </p>
            <h1 className="mt-3 text-4xl font-black">Modèles de programmes</h1>
            <p className="mt-3 text-white/60">
              Gérez les informations réutilisées lors de la programmation.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/schedule" className="rounded-full border border-white/20 px-5 py-3 font-bold">Agenda</Link>
            <Link href="/admin" className="rounded-full border border-white/20 px-5 py-3 font-bold">Tableau de bord</Link>
          </div>
        </header>
        <ProgramsClient programs={programs} />
      </div>
    </main>
  );
}
