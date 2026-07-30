"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import ProgramForm from "./program-form";
import { setProgramActiveAction } from "./program-actions";
import type { BroadcastProgram } from "../../../types/program";

export default function ProgramsClient({
  programs,
}: {
  programs: BroadcastProgram[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<BroadcastProgram | null>(null);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  function toggle(program: BroadcastProgram) {
    startTransition(async () => {
      const result = await setProgramActiveAction(program.id, !program.isActive);
      setMessage(result.message);
      if (result.success) router.refresh();
    });
  }

  return (
    <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_430px]">
      <section>
        {message && <p className="mb-5 rounded-2xl border border-white/10 bg-white/5 p-4">{message}</p>}
        <div className="grid gap-5 md:grid-cols-2">
          {programs.map((program) => (
            <article key={program.id} className="overflow-hidden rounded-[26px] border border-white/10 bg-[#071542]">
              <div className="aspect-video bg-[#08143D]">
                {program.defaultThumbnailUrl ? (
                  <Image src={program.defaultThumbnailUrl} alt={`Miniature de ${program.name}`} width={720} height={405} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-gray-500">Aucune miniature</div>
                )}
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-[#FCCD12]/15 px-3 py-1 text-xs font-black text-[#FCCD12]">{program.category}</span>
                  <span className="text-sm text-gray-500">Ordre {program.sortOrder}</span>
                </div>
                <h2 className="mt-4 text-xl font-black">{program.name}</h2>
                <p className="mt-2 text-sm text-gray-400">{program.defaultDurationMinutes} minutes · {program.slug}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <button onClick={() => setEditing(program)} className="rounded-full border border-white/15 px-4 py-2 font-bold">Modifier</button>
                  <button disabled={pending} onClick={() => toggle(program)} className={`rounded-full px-4 py-2 font-bold ${program.isActive ? "bg-green-500/15 text-green-300" : "bg-white/10 text-gray-400"}`}>
                    {program.isActive ? "Actif" : "Inactif"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
      <ProgramForm
        key={editing?.id ?? "create"}
        program={editing}
        onCancel={() => setEditing(null)}
        onSaved={() => setEditing(null)}
      />
    </div>
  );
}
