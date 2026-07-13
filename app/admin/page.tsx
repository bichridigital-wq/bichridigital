import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import LogoutButton from "./logout-button";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = await createClient();

  // Vérifier que l'utilisateur est connecté
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/admin/login");
  }

  // Vérifier que l'utilisateur est administrateur
  const { data: isAdmin, error: adminError } =
    await supabase.rpc("is_admin");

  if (adminError || !isAdmin) {
    redirect("/admin/login");
  }

  // Compter les produits enregistrés
  const { count: productsCount, error: productsError } =
    await supabase
      .from("products")
      .select("*", {
        count: "exact",
        head: true,
      });

  return (
    <main className="min-h-screen bg-[#020B2E] px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        {/* EN-TÊTE */}
        <header className="flex flex-col gap-6 rounded-[30px] border border-white/10 bg-white/5 p-7 backdrop-blur-xl md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-[#FCCD12]">
              Bichridigital Admin
            </p>

            <h1 className="mt-3 text-3xl font-black md:text-5xl">
              Tableau de bord
            </h1>

            <p className="mt-3 text-gray-400">
              Gérez la boutique et les contenus de Bichridigital.
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Connecté avec : {user.email}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-full border border-white/15 px-6 py-3 font-bold transition hover:border-[#FCCD12] hover:text-[#FCCD12]"
            >
              Voir le site
            </Link>

            <LogoutButton />
          </div>
        </header>

        {/* STATISTIQUES */}
        <section className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-[28px] border border-blue-500/20 bg-[#071542] p-7">
            <p className="text-sm font-bold uppercase tracking-wider text-gray-400">
              Produits
            </p>

            <p className="mt-4 text-5xl font-black text-[#FCCD12]">
              {productsError ? "—" : productsCount ?? 0}
            </p>

            <p className="mt-3 text-gray-400">
              Produits enregistrés
            </p>
          </div>

          <div className="rounded-[28px] border border-blue-500/20 bg-[#071542] p-7">
            <p className="text-sm font-bold uppercase tracking-wider text-gray-400">
              Portfolio
            </p>

            <p className="mt-4 text-5xl font-black text-[#FCCD12]">
              0
            </p>

            <p className="mt-3 text-gray-400">
              Réalisations enregistrées
            </p>
          </div>

          <div className="rounded-[28px] border border-blue-500/20 bg-[#071542] p-7">
            <p className="text-sm font-bold uppercase tracking-wider text-gray-400">
              Messages
            </p>

            <p className="mt-4 text-5xl font-black text-[#FCCD12]">
              0
            </p>

            <p className="mt-3 text-gray-400">
              Demandes reçues
            </p>
          </div>

          <div className="rounded-[28px] border border-blue-500/20 bg-[#071542] p-7">
            <p className="text-sm font-bold uppercase tracking-wider text-gray-400">
              Statut
            </p>

            <p className="mt-4 text-3xl font-black text-green-400">
              En ligne
            </p>

            <p className="mt-3 text-gray-400">
              Administration opérationnelle
            </p>
          </div>
        </section>

        {/* GESTION RAPIDE */}
        <section className="mt-10">
          <h2 className="text-3xl font-black">
            Gestion rapide
          </h2>

          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/admin/products"
              className="group rounded-[28px] border border-white/10 bg-white/5 p-8 transition hover:-translate-y-2 hover:border-[#FCCD12]"
            >
              <div className="text-5xl">📦</div>

              <h3 className="mt-6 text-2xl font-black transition group-hover:text-[#FCCD12]">
                Gérer les produits
              </h3>

              <p className="mt-3 leading-7 text-gray-400">
                Ajouter, modifier, désactiver ou supprimer les produits
                de la boutique.
              </p>
            </Link>

            <div className="rounded-[28px] border border-white/10 bg-white/5 p-8 opacity-60">
              <div className="text-5xl">🎨</div>

              <h3 className="mt-6 text-2xl font-black">
                Gérer le portfolio
              </h3>

              <p className="mt-3 leading-7 text-gray-400">
                Cette fonctionnalité sera ajoutée après la boutique.
              </p>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/5 p-8 opacity-60">
              <div className="text-5xl">📩</div>

              <h3 className="mt-6 text-2xl font-black">
                Voir les messages
              </h3>

              <p className="mt-3 leading-7 text-gray-400">
                Cette fonctionnalité sera ajoutée ultérieurement.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}