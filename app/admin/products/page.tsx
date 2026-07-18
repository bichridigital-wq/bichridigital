import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import ProductForm from "./product-form";
import ProductActions from "./product-actions";

export const dynamic = "force-dynamic";

type Product = {
  id: string;
  created_at: string;
  name: string;
  category: string;
  description: string | null;
  price: string | null;
  old_price: string | null;
  specs: string | null;
  image_url: string | null;
  is_promo: boolean;
  is_active: boolean;
};

const categoryLabels: Record<string, string> = {
  ordinateur: "Ordinateur",
  tshirt: "T-shirt",
  pull: "Pull",
  casquette: "Casquette",
  tableau: "Tableau mural",
  autre: "Autre produit",
};

export default async function AdminProductsPage() {
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

  const { data, error } = await supabase
    .from("products")
    .select(
      "id, created_at, name, category, description, price, old_price, specs, image_url, is_promo, is_active"
    )
    .order("created_at", { ascending: false });

  const products = (data ?? []) as Product[];

  return (
    <main className="min-h-screen bg-[#020B2E] px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-6 rounded-[30px] border border-white/10 bg-white/5 p-7 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-[#FCCD12]">
              Bichridigital Admin
            </p>

            <h1 className="mt-3 text-4xl font-black md:text-5xl">
              Gestion des produits
            </h1>

            <p className="mt-3 text-gray-400">
              Ajoutez et consultez les produits enregistrés dans Supabase.
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
          <ProductForm />
        </div>

        <section className="mt-14">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-[#FCCD12]">
                Catalogue
              </p>

              <h2 className="mt-3 text-3xl font-black">
                Produits enregistrés
              </h2>
            </div>

            <div className="rounded-full border border-white/10 px-5 py-2 font-bold text-gray-300">
              {products.length} produit{products.length > 1 ? "s" : ""}
            </div>
          </div>

          {error && (
            <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-red-300">
              Impossible de charger les produits : {error.message}
            </div>
          )}

          {!error && products.length === 0 && (
            <div className="mt-6 rounded-[28px] border border-dashed border-white/15 bg-white/5 p-12 text-center">
              <div className="text-6xl">📦</div>

              <h3 className="mt-5 text-2xl font-black">
                Aucun produit enregistré
              </h3>

              <p className="mt-3 text-gray-400">
                Utilisez le formulaire ci-dessus pour ajouter votre premier
                produit.
              </p>
            </div>
          )}

          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <article
                key={product.id}
                className="overflow-hidden rounded-[28px] border border-white/10 bg-[#071542]"
              >
                <div className="relative h-56 bg-[#020B2E]">
                  {product.image_url ? (
                   <Image
  src={
    product.image_url.startsWith("http://") ||
    product.image_url.startsWith("https://") ||
    product.image_url.startsWith("/")
      ? product.image_url
      : `/${product.image_url}`
  }
  alt={product.name}
  fill
  sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
  className="object-cover"
/>
                  ) : (
                    <div className="flex h-full items-center justify-center text-6xl">
                      📦
                    </div>
                  )}

                  <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                    {product.is_promo && (
                      <span className="rounded-full bg-[#FCCD12] px-4 py-2 text-xs font-black text-[#020B2E]">
                        PROMO
                      </span>
                    )}

                    <span
                      className={`rounded-full px-4 py-2 text-xs font-black ${
                        product.is_active
                          ? "bg-green-500 text-white"
                          : "bg-gray-700 text-gray-300"
                      }`}
                    >
                      {product.is_active ? "ACTIF" : "INACTIF"}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <p className="text-sm font-bold uppercase tracking-wider text-[#FCCD12]">
                    {categoryLabels[product.category] ?? product.category}
                  </p>

                  <h3 className="mt-3 text-2xl font-black">
                    {product.name}
                  </h3>

                  {product.description && (
                    <p className="mt-3 line-clamp-3 leading-7 text-gray-400">
                      {product.description}
                    </p>
                  )}

                  {product.specs && (
                    <p className="mt-4 rounded-xl bg-[#020B2E] p-4 text-sm leading-6 text-gray-300">
                      {product.specs}
                    </p>
                  )}

                  <div className="mt-5 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-2xl font-black text-[#FCCD12]">
                        {product.price || "Prix sur demande"}
                      </p>

                      {product.old_price && (
                        <p className="mt-1 text-sm text-gray-500 line-through">
                          {product.old_price}
                        </p>
                      )}
                    </div>
                    
                  </div>
  <ProductActions
  id={product.id}
  isActive={product.is_active}
  imageUrl={product.image_url}
/>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
