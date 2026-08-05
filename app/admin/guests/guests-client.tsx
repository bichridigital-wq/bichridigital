"use client";

import Image from "next/image";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import GuestForm from "./guest-form";
import {
  deleteGuestAction,
  setGuestActiveAction,
} from "./guest-actions";
import type { BroadcastGuest } from "../../../types/guest";

type Filter = "all" | "active" | "inactive";

export default function GuestsClient({ guests }: { guests: BroadcastGuest[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<BroadcastGuest | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const visible = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("fr");
    return guests.filter((guest) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "active" ? guest.isActive : !guest.isActive);
      return (
        matchesFilter &&
        (!query ||
          guest.fullName.toLocaleLowerCase("fr").includes(query) ||
          guest.specialty?.toLocaleLowerCase("fr").includes(query))
      );
    });
  }, [filter, guests, search]);

  function run(operation: () => Promise<{ success: boolean; message: string }>) {
    startTransition(async () => {
      const response = await operation();
      setMessage(response.message);
      if (response.success) router.refresh();
    });
  }

  function remove(guest: BroadcastGuest) {
    const warning = guest.linkedEventCount
      ? `Cette fiche est liée à ${guest.linkedEventCount} événement(s). Les snapshots seront conservés.`
      : "Cette fiche n’est liée à aucun événement.";
    if (
      window.confirm(
        `${warning}\n\nSupprimer définitivement « ${guest.fullName} » ?`,
      )
    ) {
      run(() => deleteGuestAction(guest.id));
    }
  }

  return (
    <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_430px]">
      <section>
        <div className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 sm:grid-cols-[1fr_auto]">
          <label className="font-bold">
            Rechercher
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nom ou spécialité" className="mt-2 w-full rounded-xl border border-white/10 bg-[#020B2E] px-4 py-3" />
          </label>
          <label className="font-bold">
            Statut
            <select value={filter} onChange={(event) => setFilter(event.target.value as Filter)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#020B2E] px-4 py-3">
              <option value="all">Tous</option>
              <option value="active">Actifs</option>
              <option value="inactive">Inactifs</option>
            </select>
          </label>
        </div>
        {message ? <p role="status" className="mt-5 rounded-2xl bg-white/5 p-4">{message}</p> : null}
        {guests.length === 0 ? (
          <div className="mt-6 rounded-[28px] border border-dashed border-white/15 p-12 text-center text-gray-300">
            Aucun invité n’a encore été enregistré.
          </div>
        ) : visible.length === 0 ? (
          <p className="mt-6 rounded-2xl bg-white/5 p-8 text-center text-gray-400">Aucun invité ne correspond aux filtres.</p>
        ) : (
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {visible.map((guest) => (
              <article key={guest.id} className="overflow-hidden rounded-[26px] border border-white/10 bg-[#071542]">
                <div className="aspect-video bg-[#08143D]">
                  {guest.photoUrl ? <Image src={guest.photoUrl} alt={`Photo de ${guest.fullName}`} width={720} height={405} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-gray-500">Aucune photo</div>}
                </div>
                <div className="p-6">
                  <div className="flex justify-between gap-3">
                    <span className={guest.isActive ? "text-green-300" : "text-gray-500"}>{guest.isActive ? "Actif" : "Inactif"}</span>
                    <span className="text-gray-500">Ordre {guest.sortOrder}</span>
                  </div>
                  <h2 className="mt-3 text-xl font-black">{guest.fullName}</h2>
                  {guest.title ? <p className="mt-1 text-gray-300">{guest.title}</p> : null}
                  {guest.specialty ? <p className="mt-1 text-sm text-[#FCCD12]">{guest.specialty}</p> : null}
                  <p className="mt-2 text-sm text-gray-500">{guest.linkedEventCount} événement(s) lié(s)</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <button type="button" onClick={() => setEditing(guest)} className="rounded-full border border-white/15 px-4 py-2 font-bold">Modifier</button>
                    <button type="button" disabled={pending} onClick={() => run(() => setGuestActiveAction(guest.id, !guest.isActive))} className="rounded-full border border-white/15 px-4 py-2 font-bold">{guest.isActive ? "Désactiver" : "Activer"}</button>
                    <button type="button" disabled={pending} onClick={() => remove(guest)} className="rounded-full border border-red-400/30 px-4 py-2 font-bold text-red-300">Supprimer</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
      <GuestForm key={editing?.id ?? "create"} guest={editing} onCancel={() => setEditing(null)} onSaved={() => setEditing(null)} />
    </div>
  );
}
