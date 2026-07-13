import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "../../../../../lib/supabase/server";
import EditProductForm from "./edit-product-form";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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

  const { data: product, error } = await supabase
    .from("products")
    .select(
      "id, name, category, description, price, old_price, specs, image_url, is_promo, is_active"
    )
    .eq("id", id)
    .single();

  if (error || !product) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#020B2E] px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl">
        <header className="rounded-[30px] border border-white/10 bg-white/5 p-7 md:p-10">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-[#FCCD12]">
            Bichridigital Admin
          </p>

          <h1 className="mt-3 text-4xl font-black md:text-5xl">
            Modifier le produit
          </h1>

          <p className="mt-3 text-gray-400">
            Modifiez les informations de {product.name}.
          </p>

          <Link
            href="/admin/products"
            className="mt-6 inline-block font-bold text-gray-400 transition hover:text-[#FCCD12]"
          >
            ← Retour aux produits
          </Link>
        </header>

        <section className="mt-8 rounded-[30px] border border-white/10 bg-white/5 p-7 md:p-10">
          <EditProductForm product={product} />
        </section>
      </div>
    </main>
  );
}