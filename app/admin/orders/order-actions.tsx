"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";

export type OrderStatus =
  | "nouvelle"
  | "contactee"
  | "confirmee"
  | "terminee"
  | "annulee";

type OrderActionsProps = {
  id: string;
  status: OrderStatus;
};

const statusOptions: {
  value: OrderStatus;
  label: string;
}[] = [
  {
    value: "nouvelle",
    label: "Nouvelle",
  },
  {
    value: "contactee",
    label: "Contactée",
  },
  {
    value: "confirmee",
    label: "Confirmée",
  },
  {
    value: "terminee",
    label: "Terminée",
  },
  {
    value: "annulee",
    label: "Annulée",
  },
];

export default function OrderActions({
  id,
  status,
}: OrderActionsProps) {
  const router = useRouter();

  const [currentStatus, setCurrentStatus] =
    useState<OrderStatus>(status);

  const [loadingAction, setLoadingAction] = useState<
    "status" | "delete" | null
  >(null);

  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setCurrentStatus(status);
  }, [status]);

  const updateStatus = async (
    newStatus: OrderStatus
  ) => {
    setLoadingAction("status");
    setErrorMessage("");

    const supabase = createClient();

    const { error } = await supabase
      .from("orders")
      .update({
        status: newStatus,
      })
      .eq("id", id);

    if (error) {
      setErrorMessage(
        `Modification impossible : ${error.message}`
      );

      setLoadingAction(null);
      return;
    }

    setCurrentStatus(newStatus);
    setLoadingAction(null);
    router.refresh();
  };

  const deleteOrder = async () => {
    const confirmed = window.confirm(
      "Voulez-vous vraiment supprimer définitivement cette commande ?"
    );

    if (!confirmed) return;

    setLoadingAction("delete");
    setErrorMessage("");

    const supabase = createClient();

    const { error } = await supabase
      .from("orders")
      .delete()
      .eq("id", id);

    if (error) {
      setErrorMessage(
        `Suppression impossible : ${error.message}`
      );

      setLoadingAction(null);
      return;
    }

    setLoadingAction(null);
    router.refresh();
  };

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center gap-3">
        <select
          aria-label="Modifier le statut"
          value={currentStatus}
          disabled={loadingAction !== null}
          onChange={(event) =>
            updateStatus(
              event.target.value as OrderStatus
            )
          }
          className="rounded-full border border-white/15 bg-[#020B2E] px-5 py-3 text-sm font-black text-white outline-none transition focus:border-[#FCCD12] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {statusOptions.map((option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={deleteOrder}
          disabled={loadingAction !== null}
          className="rounded-full border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm font-black text-red-300 transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loadingAction === "delete"
            ? "Suppression..."
            : "Supprimer"}
        </button>
      </div>

      {loadingAction === "status" && (
        <p className="mt-3 text-sm font-bold text-[#FCCD12]">
          Modification du statut...
        </p>
      )}

      {errorMessage && (
        <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm font-bold text-red-300">
          {errorMessage}
        </p>
      )}
    </div>
  );
}