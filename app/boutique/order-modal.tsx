"use client";

import {
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createClient } from "../../lib/supabase/client";

type OrderProduct = {
  id: string;
  name: string;
  price: string;
};

type OrderModalProps = {
  product: OrderProduct | null;
  onClose: () => void;
};

const initialForm = {
  customer_name: "",
  phone: "",
  email: "",
  quantity: 1,
  request_type: "commande",
  message: "",
};

export default function OrderModal({
  product,
  onClose,
}: OrderModalProps) {
  const supabase = useMemo(() => createClient(), []);

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!product) return;

    setForm(initialForm);
    setSuccess(false);
    setErrorMessage("");

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [product]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && product) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [product, onClose]);

  if (!product) return null;

  const submitOrder = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setLoading(true);
    setErrorMessage("");
    setSuccess(false);

    const cleanName = form.customer_name.trim();
    const cleanPhone = form.phone.trim();
    const cleanEmail = form.email.trim();
    const cleanMessage = form.message.trim();

    if (cleanName.length < 2) {
      setErrorMessage(
        "Veuillez saisir correctement votre nom."
      );
      setLoading(false);
      return;
    }

    if (cleanPhone.length < 8) {
      setErrorMessage(
        "Veuillez saisir un numéro de téléphone valide."
      );
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from("orders")
      .insert({
        customer_name: cleanName,
        phone: cleanPhone,
        email: cleanEmail || null,

        product_id: product.id,
        product_name: product.name,
        price_snapshot: product.price,

        quantity: Number(form.quantity),
        request_type: form.request_type,

        message: cleanMessage || null,
        status: "nouvelle",
        source: "boutique",
      });

    if (error) {
      console.error(
        "Erreur pendant l’enregistrement :",
        error
      );

      setErrorMessage(
        "La demande n’a pas pu être envoyée. Veuillez réessayer."
      );

      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  const whatsappMessage = encodeURIComponent(
    `Bonjour Bichridigital,

Je viens d’envoyer une ${form.request_type} depuis la boutique.

Produit : ${product.name}
Quantité : ${form.quantity}
Nom : ${form.customer_name}
Téléphone : ${form.phone}`
  );

  const inputClass =
    "w-full rounded-2xl border border-white/10 " +
    "bg-[#020B2E] px-5 py-4 text-white outline-none " +
    "transition placeholder:text-gray-600 " +
    "focus:border-[#FCCD12]";

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 px-4 py-8 backdrop-blur-md"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-modal-title"
        className="max-h-full w-full max-w-2xl overflow-y-auto rounded-[30px] border border-white/10 bg-[#071542] shadow-[0_0_80px_rgba(0,87,255,0.3)]"
      >
        <div className="flex items-start justify-between gap-6 border-b border-white/10 p-6 md:p-8">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-[#FCCD12]">
              BichriStore
            </p>

            <h2
              id="order-modal-title"
              className="mt-2 text-3xl font-black text-white"
            >
              Commander un produit
            </h2>

            <p className="mt-3 text-gray-400">
              {product.name}
            </p>

            <p className="mt-1 text-xl font-black text-[#FCCD12]">
              {product.price}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer le formulaire"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 text-2xl text-white transition hover:border-red-400 hover:text-red-300"
          >
            ×
          </button>
        </div>

        {success ? (
          <div className="p-7 text-center md:p-10">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-500/15 text-4xl">
              ✓
            </div>

            <h3 className="mt-6 text-3xl font-black text-white">
              Demande enregistrée
            </h3>

            <p className="mx-auto mt-4 max-w-lg leading-7 text-gray-300">
              Merci {form.customer_name}. Votre demande concernant{" "}
              <strong className="text-white">
                {product.name}
              </strong>{" "}
              a bien été reçue. Bichridigital vous contactera
              prochainement.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <a
                href={`https://wa.me/221773211096?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-[#25D366] px-7 py-4 font-black text-white transition hover:scale-105"
              >
                Confirmer aussi sur WhatsApp
              </a>

              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-white/15 px-7 py-4 font-bold text-white transition hover:border-[#FCCD12] hover:text-[#FCCD12]"
              >
                Fermer
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={submitOrder}
            className="space-y-6 p-6 md:p-8"
          >
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label
                  htmlFor="customer_name"
                  className="mb-2 block text-sm font-bold text-gray-300"
                >
                  Nom complet *
                </label>

                <input
                  id="customer_name"
                  type="text"
                  required
                  autoComplete="name"
                  value={form.customer_name}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      customer_name: event.target.value,
                    })
                  }
                  placeholder="Votre nom complet"
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-bold text-gray-300"
                >
                  Téléphone / WhatsApp *
                </label>

                <input
                  id="phone"
                  type="tel"
                  required
                  autoComplete="tel"
                  value={form.phone}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      phone: event.target.value,
                    })
                  }
                  placeholder="+221 77 000 00 00"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-bold text-gray-300"
              >
                Adresse e-mail
              </label>

              <input
                id="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(event) =>
                  setForm({
                    ...form,
                    email: event.target.value,
                  })
                }
                placeholder="exemple@email.com"
                className={inputClass}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label
                  htmlFor="quantity"
                  className="mb-2 block text-sm font-bold text-gray-300"
                >
                  Quantité *
                </label>

                <input
                  id="quantity"
                  type="number"
                  min={1}
                  max={99}
                  required
                  value={form.quantity}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      quantity: Math.max(
                        1,
                        Number(event.target.value)
                      ),
                    })
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="request_type"
                  className="mb-2 block text-sm font-bold text-gray-300"
                >
                  Type de demande *
                </label>

                <select
                  id="request_type"
                  value={form.request_type}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      request_type: event.target.value,
                    })
                  }
                  className={inputClass}
                >
                  <option value="commande">
                    Passer une commande
                  </option>

                  <option value="devis">
                    Demander un devis
                  </option>
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="message"
                className="mb-2 block text-sm font-bold text-gray-300"
              >
                Précisions
              </label>

              <textarea
                id="message"
                rows={4}
                value={form.message}
                onChange={(event) =>
                  setForm({
                    ...form,
                    message: event.target.value,
                  })
                }
                placeholder="Couleur, taille, personnalisation, adresse ou autres précisions..."
                className={`${inputClass} resize-none`}
              />
            </div>

            {errorMessage && (
              <div
                role="alert"
                className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 font-bold text-red-300"
              >
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#FCCD12] px-8 py-4 font-black text-[#020B2E] transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Envoi en cours..."
                : form.request_type === "devis"
                  ? "Envoyer la demande de devis →"
                  : "Envoyer la commande →"}
            </button>

            <p className="text-center text-xs leading-5 text-gray-500">
              Vos coordonnées sont utilisées uniquement pour
              traiter cette demande.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}