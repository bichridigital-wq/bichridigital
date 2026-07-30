"use client";

import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import { saveProgramAction } from "./program-actions";
import {
  PROGRAM_IMAGE_MAX_BYTES,
  PROGRAM_IMAGE_MIME_TYPES,
  type BroadcastProgram,
} from "../../../types/program";

export default function ProgramForm({
  program,
  onSaved,
  onCancel,
}: {
  program: BroadcastProgram | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [preview, setPreview] = useState(program?.defaultThumbnailUrl ?? "");
  const [removeThumbnail, setRemoveThumbnail] = useState(false);

  useEffect(
    () => () => {
      if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    },
    [preview],
  );

  function selectImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const allowed = PROGRAM_IMAGE_MIME_TYPES.includes(
      file.type as (typeof PROGRAM_IMAGE_MIME_TYPES)[number],
    );
    if (!allowed || file.size <= 0 || file.size > PROGRAM_IMAGE_MAX_BYTES) {
      event.target.value = "";
      setError(true);
      setMessage("Choisissez une image JPG, PNG ou WebP de 5 Mo maximum.");
      return;
    }
    setPreview(URL.createObjectURL(file));
    setRemoveThumbnail(false);
    setMessage("");
    setError(false);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setMessage("");
    const form = event.currentTarget;
    const result = await saveProgramAction(
      program?.id ?? null,
      new FormData(form),
    );
    setBusy(false);
    setMessage(result.message);
    setError(!result.success);
    if (result.success) {
      if (!program) {
        form.reset();
        setPreview("");
        setRemoveThumbnail(false);
      }
      router.refresh();
      onSaved();
    }
  }

  const inputClass =
    "mt-2 w-full rounded-2xl border border-white/10 bg-[#020B2E] px-5 py-4 text-white outline-none focus:border-[#FCCD12]";

  return (
    <section className="rounded-[28px] border border-white/10 bg-white/5 p-6 md:p-8">
      <p className="text-sm font-black uppercase tracking-[.2em] text-[#FCCD12]">
        {program ? "Modification" : "Nouveau modèle"}
      </p>
      <h2 className="mt-3 text-3xl font-black">
        {program ? program.name : "Créer un programme"}
      </h2>
      <form onSubmit={(event) => void submit(event)} className="mt-7 space-y-5">
        <div className="grid gap-5 md:grid-cols-2">
          <label className="font-bold text-gray-300">
            Nom *
            <input name="name" required maxLength={180} defaultValue={program?.name ?? ""} className={inputClass} />
          </label>
          <label className="font-bold text-gray-300">
            Slug *
            <input name="slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={140} defaultValue={program?.slug ?? ""} className={inputClass} />
          </label>
        </div>
        <label className="block font-bold text-gray-300">
          Catégorie *
          <input name="category" required maxLength={120} defaultValue={program?.category ?? ""} className={inputClass} />
        </label>
        <label className="block font-bold text-gray-300">
          Description par défaut
          <textarea name="default_description" rows={4} maxLength={5000} defaultValue={program?.defaultDescription ?? ""} className={`${inputClass} resize-y`} />
        </label>
        <div className="grid gap-5 md:grid-cols-2">
          <label className="font-bold text-gray-300">
            Durée habituelle (minutes) *
            <input name="default_duration_minutes" type="number" min={15} max={360} required defaultValue={program?.defaultDurationMinutes ?? 60} className={inputClass} />
          </label>
          <label className="font-bold text-gray-300">
            Ordre d’affichage *
            <input name="sort_order" type="number" min={0} step={1} required defaultValue={program?.sortOrder ?? 0} className={inputClass} />
          </label>
        </div>
        <div className="grid gap-5 rounded-2xl border border-white/10 bg-[#020B2E] p-5 md:grid-cols-[1fr_240px]">
          <div>
            <p className="font-bold text-gray-300">Miniature par défaut</p>
            <input ref={fileRef} id="program-thumbnail" name="thumbnail_file" type="file" accept="image/jpeg,image/png,image/webp" onChange={selectImage} className="sr-only" />
            <input type="hidden" name="remove_thumbnail" value={removeThumbnail ? "true" : "false"} />
            <div className="mt-4 flex flex-wrap gap-3">
              <label htmlFor="program-thumbnail" className="cursor-pointer rounded-full bg-[#FCCD12] px-5 py-3 font-black text-[#020B2E]">
                Choisir une image
              </label>
              {preview && (
                <button type="button" onClick={() => { setPreview(""); setRemoveThumbnail(Boolean(program?.defaultThumbnailUrl)); if (fileRef.current) fileRef.current.value = ""; }} className="rounded-full border border-red-400/30 px-5 py-3 font-bold text-red-300">
                  Retirer
                </button>
              )}
            </div>
            <p className="mt-3 text-sm text-gray-400">JPG, PNG ou WebP, 5 Mo maximum. Aucune image n’est inventée.</p>
          </div>
          <div className="aspect-video overflow-hidden rounded-2xl bg-[#08143D]">
            {preview ? (
              <Image src={preview} alt="Aperçu de la miniature du programme" width={480} height={270} unoptimized className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-gray-500">Aucune miniature</div>
            )}
          </div>
        </div>
        <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#020B2E] p-5 font-bold">
          <input name="is_active" type="checkbox" defaultChecked={program?.isActive ?? true} className="h-5 w-5 accent-[#FCCD12]" />
          Programme actif
        </label>
        {message && <p role="status" className={`rounded-2xl p-4 font-bold ${error ? "bg-red-500/15 text-red-300" : "bg-green-500/15 text-green-300"}`}>{message}</p>}
        <div className="flex flex-wrap gap-3">
          <button disabled={busy} className="rounded-full bg-[#FCCD12] px-7 py-3.5 font-black text-[#020B2E] disabled:opacity-50">
            {busy ? "Enregistrement…" : program ? "Enregistrer" : "Créer"}
          </button>
          {program && <button type="button" onClick={onCancel} className="rounded-full border border-white/15 px-7 py-3.5 font-bold">Annuler</button>}
        </div>
      </form>
    </section>
  );
}
