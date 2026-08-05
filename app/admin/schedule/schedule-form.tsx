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
import { saveScheduleEventAction } from "./schedule-actions";
import {
  SCHEDULE_IMAGE_MAX_BYTES,
  SCHEDULE_IMAGE_MIME_TYPES,
  SCHEDULE_STATUSES,
  type AdminScheduleEvent,
  type ScheduleStatus,
} from "../../../types/schedule";
import type { BroadcastProgram } from "../../../types/program";
import type {
  BroadcastGuest,
  GuestSelection,
} from "../../../types/guest";

const STATUS_LABELS: Record<ScheduleStatus, string> = {
  scheduled: "Programmé",
  completed: "Terminé",
  cancelled: "Annulé",
};

function toDakarInputValue(value: string | null) {
  if (!value) return "";
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Africa/Dakar",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  })
    .format(new Date(value))
    .replace(" ", "T");
}

function addMinutes(value: string, minutes: number) {
  if (!value) return "";
  const instant = new Date(`${value}:00.000Z`);
  if (Number.isNaN(instant.getTime())) return "";
  instant.setUTCMinutes(instant.getUTCMinutes() + minutes);
  return instant.toISOString().slice(0, 16);
}

export default function ScheduleForm({
  event,
  programs,
  guests,
  onCancel,
  onSaved,
}: {
  event: AdminScheduleEvent | null;
  programs: BroadcastProgram[];
  guests: BroadcastGuest[];
  onCancel: () => void;
  onSaved: () => void;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [status, setStatus] = useState<ScheduleStatus>(
    event?.status ?? "scheduled",
  );
  const [programId, setProgramId] = useState(event?.programId ?? "");
  const [appliedProgram, setAppliedProgram] =
    useState<BroadcastProgram | null>(
      programs.find((program) => program.id === event?.programId) ?? null,
    );
  const [manuallyChanged, setManuallyChanged] = useState(false);
  const [title, setTitle] = useState(event?.title ?? "");
  const [slug, setSlug] = useState(event?.slug ?? "");
  const [description, setDescription] = useState(event?.description ?? "");
  const [category, setCategory] = useState(event?.category ?? "");
  const [startTime, setStartTime] = useState(
    toDakarInputValue(event?.scheduledStartTime ?? null),
  );
  const [endTime, setEndTime] = useState(
    toDakarInputValue(event?.scheduledEndTime ?? null),
  );
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(event?.thumbnailUrl ?? "");
  const [removeThumbnail, setRemoveThumbnail] = useState(false);
  const [useProgramThumbnail, setUseProgramThumbnail] = useState(false);
  const [guestIdToAdd, setGuestIdToAdd] = useState("");
  const [selectedGuests, setSelectedGuests] = useState<GuestSelection[]>(
    event?.guests ?? [],
  );
  const inputClass =
    "w-full rounded-2xl border border-white/10 bg-[#020B2E] px-5 py-4 text-white outline-none transition placeholder:text-gray-600 focus:border-[#FCCD12]";

  useEffect(
    () => () => {
      if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );

  function selectImage(changeEvent: ChangeEvent<HTMLInputElement>) {
    const file = changeEvent.target.files?.[0] ?? null;
    if (!file) return;
    const validMime = SCHEDULE_IMAGE_MIME_TYPES.includes(
      file.type as (typeof SCHEDULE_IMAGE_MIME_TYPES)[number],
    );
    const extension = file.name.split(".").pop()?.toLowerCase();
    const extensionMatches =
      (file.type === "image/jpeg" &&
        (extension === "jpg" || extension === "jpeg")) ||
      (file.type === "image/png" && extension === "png") ||
      (file.type === "image/webp" && extension === "webp");
    if (
      !validMime ||
      !extensionMatches ||
      file.size <= 0 ||
      file.size > SCHEDULE_IMAGE_MAX_BYTES
    ) {
      changeEvent.target.value = "";
      setMessage("Choisissez une image JPG, PNG ou WebP de 5 Mo maximum.");
      setIsError(true);
      return;
    }
    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setRemoveThumbnail(false);
    setUseProgramThumbnail(false);
    setMessage("");
    setIsError(false);
  }

  function removeImage() {
    setSelectedImage(null);
    setPreviewUrl("");
    setRemoveThumbnail(Boolean(event?.thumbnailUrl));
    setUseProgramThumbnail(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function applyProgram(program: BroadcastProgram, confirmReplace = true) {
    if (
      confirmReplace &&
      (manuallyChanged || Boolean(event)) &&
      !window.confirm(
        "Remplacer les valeurs actuelles par celles de ce programme ?",
      )
    ) {
      return false;
    }
    setProgramId(program.id);
    setAppliedProgram(program);
    setTitle(program.name);
    setSlug(program.slug);
    setCategory(program.category);
    setDescription(program.defaultDescription ?? "");
    if (startTime) {
      setEndTime(addMinutes(startTime, program.defaultDurationMinutes));
    }
    if (!selectedImage && program.defaultThumbnailUrl) {
      setPreviewUrl(program.defaultThumbnailUrl);
      setRemoveThumbnail(false);
      setUseProgramThumbnail(true);
    }
    setManuallyChanged(false);
    return true;
  }

  function selectProgram(value: string) {
    if (!value) {
      setProgramId("");
      setAppliedProgram(null);
      return;
    }
    const program = programs.find((item) => item.id === value);
    if (program) applyProgram(program);
  }

  function addGuest() {
    const selected = guests.find((guest) => guest.id === guestIdToAdd);
    if (!selected || selectedGuests.some((guest) => guest.guestId === selected.id)) {
      return;
    }
    setSelectedGuests((current) => [
      ...current,
      {
        associationId: null,
        guestId: selected.id,
        fullName: selected.fullName,
        title: selected.title,
        photoUrl: selected.photoUrl,
        roleLabel: null,
        sortOrder: current.length,
        isActive: selected.isActive,
        refreshSnapshot: true,
      },
    ]);
    setGuestIdToAdd("");
  }

  function updateGuestSelection(
    index: number,
    update: Partial<GuestSelection>,
  ) {
    setSelectedGuests((current) =>
      current.map((selection, position) =>
        position === index ? { ...selection, ...update } : selection,
      ),
    );
  }

  function moveGuest(index: number, direction: -1 | 1) {
    const destination = index + direction;
    if (destination < 0 || destination >= selectedGuests.length) return;
    setSelectedGuests((current) => {
      const reordered = [...current];
      [reordered[index], reordered[destination]] = [
        reordered[destination],
        reordered[index],
      ];
      return reordered.map((selection, position) => ({
        ...selection,
        sortOrder: position,
      }));
    });
  }

  function refreshGuestSnapshot(index: number) {
    const selection = selectedGuests[index];
    if (!selection.guestId) return;
    const current = guests.find((guest) => guest.id === selection.guestId);
    if (
      !current ||
      !window.confirm(
        `Actualiser les informations de « ${selection.fullName} » depuis sa fiche ?`,
      )
    ) {
      return;
    }
    updateGuestSelection(index, {
      fullName: current.fullName,
      title: current.title,
      photoUrl: current.photoUrl,
      isActive: current.isActive,
      refreshSnapshot: true,
    });
  }

  async function submit(submitEvent: FormEvent<HTMLFormElement>) {
    submitEvent.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setMessage("");
    setIsError(false);
    try {
      const result = await saveScheduleEventAction(
        event?.id ?? null,
        new FormData(submitEvent.currentTarget),
      );
      setMessage(result.message);
      setIsError(!result.success);
      if (result.success) {
        router.refresh();
        onSaved();
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="rounded-[30px] border border-white/10 bg-white/5 p-7 md:p-10">
      <p className="text-sm font-black uppercase tracking-[0.2em] text-[#FCCD12]">
        {event ? "Modification" : "Nouvelle programmation"}
      </p>
      <h2 className="mt-3 text-3xl font-black">
        {event ? `Modifier « ${event.title} »` : "Ajouter un événement officiel"}
      </h2>
      <p className="mt-3 text-sm text-gray-400">
        Les dates sont saisies en heure de Dakar puis enregistrées en UTC.
      </p>

      <form
        onSubmit={(formEvent) => void submit(formEvent)}
        className="mt-8 space-y-6"
      >
        <input
          type="hidden"
          name="guest_selections"
          value={JSON.stringify(selectedGuests)}
        />
        <div className="rounded-2xl border border-[#FCCD12]/25 bg-[#FCCD12]/5 p-5">
          <label className="block text-sm font-bold text-gray-300">
            Programme
            <select
              name="program_id"
              value={programId}
              onChange={(changeEvent) => selectProgram(changeEvent.target.value)}
              className={`${inputClass} mt-2`}
            >
              <option value="">Aucun programme</option>
              {programs
                .filter((program) => program.isActive || program.id === programId)
                .map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.name}
                  </option>
                ))}
            </select>
          </label>
          {appliedProgram && (
            <div className="mt-4 grid gap-4 rounded-2xl border border-white/10 bg-[#020B2E] p-4 sm:grid-cols-[96px_1fr]">
              <div className="aspect-video overflow-hidden rounded-xl bg-[#08143D]">
                {appliedProgram.defaultThumbnailUrl ? (
                  <Image
                    src={appliedProgram.defaultThumbnailUrl}
                    alt={`Miniature de ${appliedProgram.name}`}
                    width={192}
                    height={108}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-[10px] text-gray-500">
                    Sans image
                  </div>
                )}
              </div>
              <div>
                <span className="rounded-full bg-[#FCCD12]/15 px-3 py-1 text-xs font-black text-[#FCCD12]">
                  Modèle appliqué
                </span>
                <p className="mt-3 font-black">{appliedProgram.name}</p>
                <p className="mt-1 text-sm text-gray-400">
                  {appliedProgram.category} ·{" "}
                  {appliedProgram.defaultDurationMinutes} minutes
                </p>
                <button
                  type="button"
                  onClick={() => applyProgram(appliedProgram, false)}
                  className="mt-3 text-sm font-black text-[#FCCD12] hover:underline"
                >
                  Réappliquer le modèle
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <label className="text-sm font-bold text-gray-300">
            Titre *
            <input name="title" required maxLength={180} value={title} onChange={(changeEvent) => { setTitle(changeEvent.target.value); setManuallyChanged(true); }} className={`${inputClass} mt-2`} />
          </label>
          <label className="text-sm font-bold text-gray-300">
            Slug d’émission
            <input name="slug" maxLength={140} pattern="[a-z0-9]+(-[a-z0-9]+)*" value={slug} onChange={(changeEvent) => { setSlug(changeEvent.target.value); setManuallyChanged(true); }} className={`${inputClass} mt-2`} />
          </label>
        </div>

        <label className="block text-sm font-bold text-gray-300">
          Description
          <textarea name="description" rows={5} maxLength={5000} value={description} onChange={(changeEvent) => { setDescription(changeEvent.target.value); setManuallyChanged(true); }} className={`${inputClass} mt-2 resize-y`} />
        </label>

        <section className="rounded-2xl border border-white/10 bg-[#020B2E] p-5">
          <h3 className="text-xl font-black">Invités</h3>
          <p className="mt-2 text-sm text-gray-400">
            Ajoutez les intervenants et conservez les informations utilisées
            pour cet événement.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <label className="flex-1 text-sm font-bold text-gray-300">
              Ajouter un invité
              <select
                value={guestIdToAdd}
                onChange={(changeEvent) => setGuestIdToAdd(changeEvent.target.value)}
                className={`${inputClass} mt-2`}
              >
                <option value="">Sélectionner…</option>
                {guests
                  .filter(
                    (guest) =>
                      guest.isActive &&
                      !selectedGuests.some(
                        (selection) => selection.guestId === guest.id,
                      ),
                  )
                  .map((guest) => (
                    <option key={guest.id} value={guest.id}>
                      {guest.fullName}
                    </option>
                  ))}
              </select>
            </label>
            <button
              type="button"
              disabled={!guestIdToAdd}
              onClick={addGuest}
              className="self-end rounded-full bg-[#FCCD12] px-5 py-3 font-black text-[#020B2E] disabled:opacity-50"
            >
              Ajouter
            </button>
          </div>
          {selectedGuests.length === 0 ? (
            <p className="mt-5 rounded-xl border border-dashed border-white/10 p-5 text-center text-gray-500">
              Aucun invité sélectionné.
            </p>
          ) : (
            <div className="mt-5 space-y-3">
              {selectedGuests.map((selection, index) => (
                <article
                  key={`${selection.guestId ?? "snapshot"}-${index}`}
                  className="grid gap-4 rounded-2xl border border-white/10 bg-[#071542] p-4 sm:grid-cols-[72px_1fr]"
                >
                  <div className="aspect-square overflow-hidden rounded-xl bg-[#08143D]">
                    {selection.photoUrl ? (
                      <Image
                        src={selection.photoUrl}
                        alt={`Photo de ${selection.fullName}`}
                        width={144}
                        height={144}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-gray-500">Sans photo</div>
                    )}
                  </div>
                  <div>
                    <p className="font-black">{selection.fullName}</p>
                    {selection.title ? <p className="text-sm text-gray-400">{selection.title}</p> : null}
                    {!selection.guestId ? <p className="mt-1 text-xs text-orange-300">Fiche supprimée — snapshot conservé</p> : null}
                    <label className="mt-3 block text-sm font-bold text-gray-300">
                      Rôle facultatif
                      <input
                        value={selection.roleLabel ?? ""}
                        maxLength={120}
                        onChange={(changeEvent) =>
                          updateGuestSelection(index, {
                            roleLabel: changeEvent.target.value,
                          })
                        }
                        className={`${inputClass} mt-2`}
                      />
                    </label>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button type="button" disabled={index === 0} onClick={() => moveGuest(index, -1)} className="rounded-full border border-white/15 px-3 py-2 disabled:opacity-30" aria-label={`Monter ${selection.fullName}`}>↑</button>
                      <button type="button" disabled={index === selectedGuests.length - 1} onClick={() => moveGuest(index, 1)} className="rounded-full border border-white/15 px-3 py-2 disabled:opacity-30" aria-label={`Descendre ${selection.fullName}`}>↓</button>
                      {selection.guestId ? <button type="button" onClick={() => refreshGuestSnapshot(index)} className="rounded-full border border-blue-400/30 px-3 py-2 text-blue-300">Actualiser depuis la fiche</button> : null}
                      <button type="button" onClick={() => setSelectedGuests((current) => current.filter((_, position) => position !== index).map((item, position) => ({ ...item, sortOrder: position })))} className="rounded-full border border-red-400/30 px-3 py-2 text-red-300">Retirer</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <div className="grid gap-6 md:grid-cols-2">
          <label className="text-sm font-bold text-gray-300">
            Catégorie
            <input name="category" maxLength={120} value={category} onChange={(changeEvent) => { setCategory(changeEvent.target.value); setManuallyChanged(true); }} className={`${inputClass} mt-2`} />
          </label>
          <label className="text-sm font-bold text-gray-300">
            Lieu
            <input name="location" maxLength={200} defaultValue={event?.location ?? ""} className={`${inputClass} mt-2`} />
          </label>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <label className="text-sm font-bold text-gray-300">
            Début — Heure de Dakar *
            <input name="scheduled_start_time" type="datetime-local" required value={startTime} onChange={(changeEvent) => { const value = changeEvent.target.value; setStartTime(value); setManuallyChanged(true); if (appliedProgram && value) setEndTime(addMinutes(value, appliedProgram.defaultDurationMinutes)); }} className={`${inputClass} mt-2`} />
          </label>
          <label className="text-sm font-bold text-gray-300">
            Fin — Heure de Dakar
            <input name="scheduled_end_time" type="datetime-local" value={endTime} onChange={(changeEvent) => { setEndTime(changeEvent.target.value); setManuallyChanged(true); }} className={`${inputClass} mt-2`} />
          </label>
        </div>

        <label className="block text-sm font-bold text-gray-300">
          Vidéo YouTube
          <input name="youtube_video" maxLength={2048} defaultValue={event?.youtubeVideoId ?? ""} className={`${inputClass} mt-2`} />
        </label>

        <div className="grid gap-5 rounded-2xl border border-white/10 bg-[#020B2E] p-5 md:grid-cols-[1fr_280px]">
          <div>
            <p className="text-sm font-bold text-gray-300">
              Miniature de l’événement
            </p>
            <input ref={fileInputRef} id="schedule-thumbnail" name="thumbnail_file" type="file" accept="image/jpeg,image/png,image/webp" onChange={selectImage} className="sr-only" />
            <input name="remove_thumbnail" type="hidden" value={removeThumbnail ? "true" : "false"} />
            <input name="use_program_thumbnail" type="hidden" value={useProgramThumbnail ? "true" : "false"} />
            <div className="mt-3 flex flex-wrap gap-3">
              <label htmlFor="schedule-thumbnail" className="cursor-pointer rounded-full bg-[#FCCD12] px-5 py-3 font-black text-[#020B2E]">Choisir une image</label>
              {previewUrl && <button type="button" onClick={removeImage} className="rounded-full border border-red-400/30 px-5 py-3 font-bold text-red-300">Retirer l’image</button>}
            </div>
            <p className="mt-3 text-sm text-gray-400">
              Une image spécifique remplace la miniature du modèle sans modifier ce dernier.
            </p>
          </div>
          <div className="aspect-video overflow-hidden rounded-2xl bg-[#08143D]">
            {previewUrl ? (
              <Image src={previewUrl} alt="Aperçu de la miniature de l’événement" width={560} height={315} unoptimized className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-gray-500">Aucune miniature</div>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-bold text-gray-300">
            Statut
            <select name="status" value={status} onChange={(changeEvent) => setStatus(changeEvent.target.value as ScheduleStatus)} className={`${inputClass} mt-2`}>
              {SCHEDULE_STATUSES.map((value) => <option key={value} value={value}>{STATUS_LABELS[value]}</option>)}
            </select>
          </label>
          <label className="flex items-center gap-4 self-end rounded-2xl border border-white/10 bg-[#020B2E] p-5">
            <input name="is_published" type="checkbox" defaultChecked={event?.isPublished ?? false} className="h-5 w-5 accent-[#FCCD12]" />
            <span className="font-bold">Publier dans l’API publique</span>
          </label>
        </div>

        {message && <p role="status" className={`rounded-2xl p-4 font-bold ${isError ? "bg-red-500/15 text-red-300" : "bg-green-500/15 text-green-300"}`}>{message}</p>}
        <div className="flex flex-wrap gap-4">
          <button disabled={submitting} className="rounded-full bg-[#FCCD12] px-8 py-4 font-black text-[#020B2E] disabled:opacity-50">
            {submitting ? "Enregistrement…" : event ? "Enregistrer" : "Créer l’événement"}
          </button>
          {event && <button type="button" onClick={onCancel} className="rounded-full border border-white/15 px-8 py-4 font-bold">Annuler</button>}
        </div>
      </form>
    </section>
  );
}
