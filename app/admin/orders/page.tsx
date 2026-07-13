import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import OrderActions, {
  type OrderStatus,
} from "./order-actions";

type Order = {
  id: string;
  created_at: string;
  customer_name: string;
  phone: string;
  email: string | null;
  product_name: string;
  price_snapshot: string | null;
  quantity: number;
  request_type: "commande" | "devis";
  message: string | null;
  status: OrderStatus;
  source: string;
};

const statusLabels: Record<OrderStatus, string> = {
  nouvelle: "Nouvelle",
  contactee: "Contactée",
  confirmee: "Confirmée",
  terminee: "Terminée",
  annulee: "Annulée",
};

const statusClasses: Record<OrderStatus, string> = {
  nouvelle:
    "border-blue-500/30 bg-blue-500/10 text-blue-300",

  contactee:
    "border-orange-500/30 bg-orange-500/10 text-orange-300",

  confirmee:
    "border-green-500/30 bg-green-500/10 text-green-300",

  terminee:
    "border-purple-500/30 bg-purple-500/10 text-purple-300",

  annulee:
    "border-red-500/30 bg-red-500/10 text-red-300",
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Dakar",
  }).format(new Date(date));
}

function getWhatsAppNumber(phone: string) {
  const digits = phone.replace(/\D/g, "");

  if (digits.startsWith("221")) {
    return digits;
  }

  if (digits.length === 9) {
    return `221${digits}`;
  }

  return digits;
}

export default async function OrdersPage() {
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

  const { data, error } = await supabase
    .from("orders")
    .select(
      `
        id,
        created_at,
        customer_name,
        phone,
        email,
        product_name,
        price_snapshot,
        quantity,
        request_type,
        message,
        status,
        source
      `
    )
    .order("created_at", {
      ascending: false,
    });

  const orders = (data ?? []) as Order[];

  const totalOrders = orders.length;

  const newOrders = orders.filter(
    (order) => order.status === "nouvelle"
  ).length;

  const confirmedOrders = orders.filter(
    (order) => order.status === "confirmee"
  ).length;

  const completedOrders = orders.filter(
    (order) => order.status === "terminee"
  ).length;

  return (
    <main className="min-h-screen bg-[#020B2E] px-5 py-10 text-white md:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-[#FCCD12]">
              Administration
            </p>

            <h1 className="mt-3 text-4xl font-black md:text-5xl">
              Commandes et devis
            </h1>

            <p className="mt-4 max-w-2xl leading-7 text-gray-400">
              Consultez les demandes envoyées depuis la
              boutique et suivez leur traitement.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin"
              className="rounded-full border border-white/15 px-6 py-3 font-bold transition hover:border-[#FCCD12] hover:text-[#FCCD12]"
            >
              Tableau de bord
            </Link>

            <Link
              href="/admin/products"
              className="rounded-full bg-[#FCCD12] px-6 py-3 font-black text-[#020B2E] transition hover:scale-105"
            >
              Gérer les produits
            </Link>
          </div>
        </header>

        <section className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-[25px] border border-white/10 bg-white/5 p-6">
            <p className="text-sm font-bold text-gray-400">
              Total
            </p>

            <p className="mt-3 text-4xl font-black">
              {totalOrders}
            </p>
          </article>

          <article className="rounded-[25px] border border-blue-500/20 bg-blue-500/10 p-6">
            <p className="text-sm font-bold text-blue-300">
              Nouvelles
            </p>

            <p className="mt-3 text-4xl font-black">
              {newOrders}
            </p>
          </article>

          <article className="rounded-[25px] border border-green-500/20 bg-green-500/10 p-6">
            <p className="text-sm font-bold text-green-300">
              Confirmées
            </p>

            <p className="mt-3 text-4xl font-black">
              {confirmedOrders}
            </p>
          </article>

          <article className="rounded-[25px] border border-purple-500/20 bg-purple-500/10 p-6">
            <p className="text-sm font-bold text-purple-300">
              Terminées
            </p>

            <p className="mt-3 text-4xl font-black">
              {completedOrders}
            </p>
          </article>
        </section>

        {error && (
          <div className="mt-10 rounded-2xl border border-red-500/30 bg-red-500/10 p-5 font-bold text-red-300">
            Impossible de récupérer les commandes :{" "}
            {error.message}
          </div>
        )}

        {!error && orders.length === 0 && (
          <section className="mt-10 rounded-[30px] border border-dashed border-white/15 bg-white/5 p-12 text-center">
            <h2 className="text-3xl font-black">
              Aucune commande
            </h2>

            <p className="mt-4 text-gray-400">
              Les nouvelles demandes envoyées depuis la
              boutique apparaîtront ici.
            </p>
          </section>
        )}

        <section className="mt-10 space-y-6">
          {orders.map((order) => {
            const whatsappNumber =
              getWhatsAppNumber(order.phone);

            const whatsappMessage = encodeURIComponent(
              `Bonjour ${order.customer_name},

Nous vous contactons concernant votre ${order.request_type} envoyée sur BichriStore.

Produit : ${order.product_name}
Quantité : ${order.quantity}
Statut : ${statusLabels[order.status]}`
            );

            return (
              <article
                key={order.id}
                className="overflow-hidden rounded-[30px] border border-white/10 bg-white/5"
              >
                <div className="flex flex-col justify-between gap-4 border-b border-white/10 p-6 md:flex-row md:items-center md:p-8">
                  <div>
                    <p className="text-sm font-bold text-gray-500">
                      {formatDate(order.created_at)}
                    </p>

                    <h2 className="mt-2 text-2xl font-black">
                      {order.customer_name}
                    </h2>
                  </div>

                  <span
                    className={`w-fit rounded-full border px-5 py-2 text-sm font-black ${statusClasses[order.status]}`}
                  >
                    {statusLabels[order.status]}
                  </span>
                </div>

                <div className="grid gap-8 p-6 md:grid-cols-2 md:p-8">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-[#FCCD12]">
                      Client
                    </p>

                    <div className="mt-4 space-y-3">
                      <p>
                        <span className="text-gray-500">
                          Téléphone :
                        </span>{" "}
                        <strong>{order.phone}</strong>
                      </p>

                      {order.email && (
                        <p>
                          <span className="text-gray-500">
                            E-mail :
                          </span>{" "}
                          <a
                            href={`mailto:${order.email}`}
                            className="font-bold text-blue-300 hover:underline"
                          >
                            {order.email}
                          </a>
                        </p>
                      )}

                      <p>
                        <span className="text-gray-500">
                          Type :
                        </span>{" "}
                        <strong className="capitalize">
                          {order.request_type}
                        </strong>
                      </p>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <a
                        href={`tel:${order.phone}`}
                        className="rounded-full border border-white/15 px-5 py-3 text-sm font-black transition hover:border-[#FCCD12] hover:text-[#FCCD12]"
                      >
                        Appeler
                      </a>

                      <a
                        href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full bg-[#25D366] px-5 py-3 text-sm font-black text-white transition hover:scale-105"
                      >
                        WhatsApp
                      </a>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-[#FCCD12]">
                      Demande
                    </p>

                    <div className="mt-4 space-y-3">
                      <p>
                        <span className="text-gray-500">
                          Produit :
                        </span>{" "}
                        <strong>{order.product_name}</strong>
                      </p>

                      <p>
                        <span className="text-gray-500">
                          Quantité :
                        </span>{" "}
                        <strong>{order.quantity}</strong>
                      </p>

                      {order.price_snapshot && (
                        <p>
                          <span className="text-gray-500">
                            Prix affiché :
                          </span>{" "}
                          <strong className="text-[#FCCD12]">
                            {order.price_snapshot}
                          </strong>
                        </p>
                      )}

                      {order.message && (
                        <div className="mt-5 rounded-2xl border border-white/10 bg-[#020B2E] p-5">
                          <p className="text-sm font-bold text-gray-500">
                            Précisions du client
                          </p>

                          <p className="mt-2 whitespace-pre-wrap leading-7 text-gray-300">
                            {order.message}
                          </p>
                        </div>
                      )}
                    </div>

                    <OrderActions
                      id={order.id}
                      status={order.status}
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}