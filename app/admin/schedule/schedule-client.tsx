"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import ScheduleForm from "./schedule-form";
import {
  deleteScheduleEventAction,
  setSchedulePublishedAction,
  setScheduleStatusAction,
} from "./schedule-actions";
import type {
  AdminScheduleEvent,
  ScheduleStatus,
} from "../../../types/schedule";
import type { BroadcastProgram } from "../../../types/program";

function formatDakarDate(value: string | null) {
  if (!value) return "Non définie";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Africa/Dakar",
  }).format(new Date(value));
}

const statusLabels: Record<ScheduleStatus, string> = {
  scheduled: "Programmé",
  cancelled: "Annulé",
  completed: "Terminé",
};

export default function ScheduleClient({
  events,
  programs,
}: {
  events: AdminScheduleEvent[];
  programs: BroadcastProgram[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<AdminScheduleEvent | null>(null);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [pending, startTransition] = useTransition();

  const run = (operation: () => Promise<{ success: boolean; message: string }>) => {
    setMessage("");
    startTransition(async () => {
      const result = await operation();
      setMessage(result.message);
      setIsError(!result.success);
      if (result.success) router.refresh();
    });
  };

  const remove = (event: AdminScheduleEvent) => {
    if (!window.confirm(`Supprimer définitivement « ${event.title} » ?`)) return;
    run(() => deleteScheduleEventAction(event.id));
    if (editing?.id === event.id) setEditing(null);
  };

  return (
    <>
      <ScheduleForm
        key={editing?.id ?? "create"}
        event={editing}
        programs={programs}
        onCancel={() => setEditing(null)}
        onSaved={() => setEditing(null)}
      />

      <section className="mt-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-[#FCCD12]">
              Programmation
            </p>
            <h2 className="mt-3 text-3xl font-black">Tous les événements</h2>
          </div>
          <span className="rounded-full border border-white/10 px-5 py-2 font-bold text-gray-300">
            {events.length} événement{events.length > 1 ? "s" : ""}
          </span>
        </div>

        {message && (
          <p role="status" className={`mt-6 rounded-2xl border p-4 font-bold ${isError ? "border-red-500/30 bg-red-500/10 text-red-300" : "border-green-500/30 bg-green-500/10 text-green-300"}`}>
            {message}
          </p>
        )}

        {events.length === 0 ? (
          <div className="mt-8 rounded-[28px] border border-dashed border-white/15 bg-white/5 p-12 text-center">
            <h3 className="text-2xl font-black">Agenda vide</h3>
            <p className="mt-3 text-gray-400">
              Aucun événement officiel n’a encore été créé.
            </p>
          </div>
        ) : (
          <div className="mt-8 space-y-5">
            {events.map((event) => (
              <article key={event.id} className="overflow-hidden rounded-[28px] border border-white/10 bg-[#071542]">
                <div className="aspect-video w-full bg-[#08143D]">
                  {event.thumbnailUrl ? (
                    <Image
                      src={event.thumbnailUrl}
                      alt={`Miniature de ${event.title}`}
                      width={1280}
                      height={720}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center px-6 text-center text-sm font-bold text-gray-500">
                      Aucune miniature
                    </div>
                  )}
                </div>
                <div className="flex flex-col justify-between gap-6 p-6 md:p-8 lg:flex-row lg:items-start">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap gap-2">
                      {event.category && <span className="rounded-full bg-blue-500/15 px-4 py-2 text-xs font-black uppercase text-blue-300">{event.category}</span>}
                      <span className="rounded-full bg-purple-500/15 px-4 py-2 text-xs font-black uppercase text-purple-300">{statusLabels[event.status]}</span>
                      <span className={`rounded-full px-4 py-2 text-xs font-black uppercase ${event.isPublished ? "bg-green-500/15 text-green-300" : "bg-white/5 text-gray-400"}`}>
                        {event.isPublished ? "Publié" : "Brouillon"}
                      </span>
                    </div>
                    <h3 className="mt-5 text-2xl font-black">{event.title}</h3>
                    <p className="mt-3 font-bold text-[#FCCD12]">
                      {formatDakarDate(event.scheduledStartTime)}
                    </p>
                    {event.location && <p className="mt-2 text-gray-400">Lieu : {event.location}</p>}
                    <p className="mt-2 text-sm text-gray-500">
                      {event.youtubeVideoId ? `Vidéo liée : ${event.youtubeVideoId}` : "Aucune vidéo liée"}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-3">
                    <button type="button" disabled={pending} onClick={() => { setEditing(event); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="rounded-full border border-blue-500/30 bg-blue-500/10 px-5 py-3 text-sm font-black text-blue-300 disabled:opacity-50">
                      Modifier
                    </button>
                    <button type="button" disabled={pending} onClick={() => run(() => setSchedulePublishedAction(event.id, !event.isPublished))} className="rounded-full border border-orange-500/30 bg-orange-500/10 px-5 py-3 text-sm font-black text-orange-300 disabled:opacity-50">
                      {event.isPublished ? "Dépublier" : "Publier"}
                    </button>
                    {event.status !== "completed" && (
                      <button type="button" disabled={pending} onClick={() => run(() => setScheduleStatusAction(event.id, "completed"))} className="rounded-full border border-purple-500/30 bg-purple-500/10 px-5 py-3 text-sm font-black text-purple-300 disabled:opacity-50">
                        Terminer
                      </button>
                    )}
                    {event.status !== "cancelled" && (
                      <button type="button" disabled={pending} onClick={() => run(() => setScheduleStatusAction(event.id, "cancelled"))} className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-5 py-3 text-sm font-black text-yellow-300 disabled:opacity-50">
                        Annuler
                      </button>
                    )}
                    <button type="button" disabled={pending} onClick={() => remove(event)} className="rounded-full border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm font-black text-red-300 disabled:opacity-50">
                      Supprimer
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
