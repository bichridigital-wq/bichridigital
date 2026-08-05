import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import LogoutButton from "./logout-button";

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: isAdmin } = await supabase.rpc(
    "is_admin"
  );

  if (!isAdmin) {
    redirect("/admin/login");
  }

  const [
    productsResult,
    activeProductsResult,
    ordersResult,
    newOrdersResult,
  ] = await Promise.all([
    supabase
      .from("products")
      .select("*", {
        count: "exact",
        head: true,
      }),

    supabase
      .from("products")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("is_active", true),

    supabase
      .from("orders")
      .select("*", {
        count: "exact",
        head: true,
      }),

    supabase
      .from("orders")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("status", "nouvelle"),
  ]);

  const totalProducts =
    productsResult.count ?? 0;

  const activeProducts =
    activeProductsResult.count ?? 0;

  const totalOrders =
    ordersResult.count ?? 0;

  const newOrders =
    newOrdersResult.count ?? 0;

  return (
    <main className="min-h-screen bg-[#020B2E] px-5 py-10 text-white md:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-[#FCCD12]">
              Bichridigital
            </p>

            <h1 className="mt-3 text-4xl font-black md:text-5xl">
              Tableau de bord
            </h1>

            <p className="mt-4 text-gray-400">
              Bienvenue dans l’espace d’administration.
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Connecté avec : {user.email}
            </p>
          </div>

          <LogoutButton />
        </header>

        {/* STATISTIQUES */}
        <section className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-[25px] border border-white/10 bg-white/5 p-6">
            <p className="text-sm font-bold text-gray-400">
              Total produits
            </p>

            <p className="mt-3 text-4xl font-black">
              {totalProducts}
            </p>
          </article>

          <article className="rounded-[25px] border border-green-500/20 bg-green-500/10 p-6">
            <p className="text-sm font-bold text-green-300">
              Produits actifs
            </p>

            <p className="mt-3 text-4xl font-black">
              {activeProducts}
            </p>
          </article>

          <article className="rounded-[25px] border border-purple-500/20 bg-purple-500/10 p-6">
            <p className="text-sm font-bold text-purple-300">
              Total commandes
            </p>

            <p className="mt-3 text-4xl font-black">
              {totalOrders}
            </p>
          </article>

          <article className="rounded-[25px] border border-blue-500/20 bg-blue-500/10 p-6">
            <p className="text-sm font-bold text-blue-300">
              Nouvelles demandes
            </p>

            <p className="mt-3 text-4xl font-black">
              {newOrders}
            </p>
          </article>
        </section>

        {/* ACTIONS */}
        <section className="mt-10 grid gap-6 md:grid-cols-2">
          <Link
            href="/admin/products"
            className="group rounded-[30px] border border-white/10 bg-white/5 p-8 transition hover:-translate-y-1 hover:border-[#FCCD12]"
          >
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.2em] text-[#FCCD12]">
                  Boutique
                </p>

                <h2 className="mt-4 text-3xl font-black">
                  Gérer les produits
                </h2>

                <p className="mt-4 leading-7 text-gray-400">
                  Ajouter, modifier, désactiver ou
                  supprimer les produits de la boutique.
                </p>
              </div>

              <span className="text-3xl transition group-hover:translate-x-2">
                →
              </span>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <span className="rounded-full bg-[#FCCD12] px-5 py-2 text-sm font-black text-[#020B2E]">
                {totalProducts} produits
              </span>

              <span className="rounded-full border border-green-500/30 bg-green-500/10 px-5 py-2 text-sm font-black text-green-300">
                {activeProducts} actifs
              </span>
            </div>
          </Link>

          <Link
            href="/admin/orders"
            className="group relative rounded-[30px] border border-white/10 bg-white/5 p-8 transition hover:-translate-y-1 hover:border-blue-400"
          >
            {newOrders > 0 && (
              <span className="absolute right-6 top-6 flex min-h-10 min-w-10 items-center justify-center rounded-full bg-red-500 px-3 text-sm font-black text-white">
                {newOrders}
              </span>
            )}

            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-300">
                  Clients
                </p>

                <h2 className="mt-4 text-3xl font-black">
                  Commandes et devis
                </h2>

                <p className="mt-4 max-w-lg leading-7 text-gray-400">
                  Consulter les demandes, contacter les
                  clients et mettre à jour les statuts.
                </p>
              </div>

              <span className="mr-12 text-3xl transition group-hover:translate-x-2">
                →
              </span>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-5 py-2 text-sm font-black text-purple-300">
                {totalOrders} demandes
              </span>

              <span
                className={`rounded-full px-5 py-2 text-sm font-black ${
                  newOrders > 0
                    ? "bg-red-500 text-white"
                    : "border border-white/10 bg-white/5 text-gray-400"
                }`}
              >
                {newOrders} nouvelles
              </span>
            </div>
          </Link>

          <Link
            href="/admin/news"
            className="group rounded-[30px] border border-white/10 bg-white/5 p-8 transition hover:-translate-y-1 hover:border-red-400"
          >
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.2em] text-red-300">
                  Bichridigital TV
                </p>

                <h2 className="mt-4 text-3xl font-black">
                  Bichridigital News
                </h2>

                <p className="mt-4 leading-7 text-gray-400">
                  Créer, modifier, publier ou masquer les actualités affichées sur la page TV.
                </p>
              </div>

              <span className="text-3xl transition group-hover:translate-x-2">
                →
              </span>
            </div>

            <p className="mt-8 font-black text-red-300">
              Gérer les actualités →
            </p>
          </Link>

          <Link
            href="/admin/conseils"
            className="group rounded-[30px] border border-white/10 bg-white/5 p-8 transition hover:-translate-y-1 hover:border-[#FCCD12]"
          >
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.2em] text-[#FCCD12]">Éditorial</p>
                <h2 className="mt-4 text-3xl font-black">Conseils Bichridigital</h2>
                <p className="mt-4 leading-7 text-gray-400">Créer, modifier et publier les articles de conseil.</p>
              </div>
              <span className="text-3xl transition group-hover:translate-x-2">→</span>
            </div>
            <p className="mt-8 font-black text-[#FCCD12]">Gérer les articles →</p>
          </Link>

          <Link
            href="/admin/schedule"
            className="group rounded-[30px] border border-white/10 bg-white/5 p-8 transition hover:-translate-y-1 hover:border-purple-400"
          >
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.2em] text-purple-300">
                  Bichridigital TV
                </p>
                <h2 className="mt-4 text-3xl font-black">Agenda</h2>
                <p className="mt-4 leading-7 text-gray-400">
                  Programmer, publier, terminer ou annuler les prochains
                  événements officiels.
                </p>
              </div>
              <span className="text-3xl transition group-hover:translate-x-2">→</span>
            </div>
            <p className="mt-8 font-black text-purple-300">
              Gérer l’agenda →
            </p>
          </Link>

          <Link
            href="/admin/programs"
            className="group rounded-[30px] border border-white/10 bg-white/5 p-8 transition hover:-translate-y-1 hover:border-[#FCCD12]"
          >
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.2em] text-[#FCCD12]">
                  Bichridigital TV
                </p>
                <h2 className="mt-4 text-3xl font-black">Programmes</h2>
                <p className="mt-4 leading-7 text-gray-400">
                  Gérer les modèles réutilisés pour préremplir l’agenda.
                </p>
              </div>
              <span className="text-3xl transition group-hover:translate-x-2">
                →
              </span>
            </div>
            <p className="mt-8 font-black text-[#FCCD12]">
              Gérer les modèles →
            </p>
          </Link>

          <Link
            href="/admin/guests"
            className="group rounded-[30px] border border-white/10 bg-white/5 p-8 transition hover:-translate-y-1 hover:border-cyan-400"
          >
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.2em] text-cyan-300">
                  Bichridigital TV
                </p>
                <h2 className="mt-4 text-3xl font-black">Invités</h2>
                <p className="mt-4 leading-7 text-gray-400">
                  Gérez les intervenants associés aux émissions et aux
                  événements.
                </p>
              </div>
              <span className="text-3xl transition group-hover:translate-x-2">
                →
              </span>
            </div>
            <p className="mt-8 font-black text-cyan-300">
              Gérer les invités →
            </p>
          </Link>

          <Link
            href="/admin/notifications"
            className="group rounded-[30px] border border-white/10 bg-white/5 p-8 transition hover:-translate-y-1 hover:border-green-400"
          >
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.2em] text-green-300">Application mobile</p>
                <h2 className="mt-4 text-3xl font-black">Notifications push</h2>
                <p className="mt-4 leading-7 text-gray-400">Diagnostiquer les appareils, tester un envoi unitaire et vérifier les reçus Expo.</p>
              </div>
              <span className="text-3xl transition group-hover:translate-x-2">→</span>
            </div>
            <p className="mt-8 font-black text-green-300">Gérer les notifications →</p>
          </Link>

          <Link
            href="/boutique"
            className="rounded-[30px] border border-white/10 bg-white/5 p-8 transition hover:border-[#FCCD12]"
          >
            <p className="text-sm font-black uppercase tracking-[0.2em] text-[#FCCD12]">
              Site public
            </p>

            <h2 className="mt-4 text-3xl font-black">
              Voir la boutique
            </h2>

            <p className="mt-4 leading-7 text-gray-400">
              Vérifier l’affichage public des produits et
              tester le formulaire de commande.
            </p>

            <p className="mt-8 font-black text-[#FCCD12]">
              Ouvrir la boutique →
            </p>
          </Link>

          <Link
            href="/"
            className="rounded-[30px] border border-white/10 bg-white/5 p-8 transition hover:border-blue-400"
          >
            <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-300">
              Bichridigital
            </p>

            <h2 className="mt-4 text-3xl font-black">
              Voir le site
            </h2>

            <p className="mt-4 leading-7 text-gray-400">
              Retourner à la page d’accueil du site
              Bichridigital.
            </p>

            <p className="mt-8 font-black text-blue-300">
              Ouvrir le site →
            </p>
          </Link>
        </section>
      </div>
    </main>
  );
}
