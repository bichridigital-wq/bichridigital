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

const STATUS_LABELS: Record<ScheduleStatus, string> = {
  scheduled: "Programmé",
  completed: "Terminé",
  cancelled: "Annulé",
};

const EXTENSION_PATTERN = /\.(?:jpe?g|png|webp)$/i;

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

export default function ScheduleForm({
  event,
  onCancel,
  onSaved,
}: {
  event: AdminScheduleEvent | null;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [status, setStatus] = useState<ScheduleStatus>(
    event?.status ?? "scheduled",
  );
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(event?.thumbnailUrl ?? "");
  const [removeThumbnail, setRemoveThumbnail] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputClass =
    "w-full rounded-2xl border border-white/10 bg-[#020B2E] px-5 py-4 text-white outline-none transition placeholder:text-gray-600 focus:border-[#FCCD12]";

  useEffect(
    () => () => {
      if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );

  const selectImage = (changeEvent: ChangeEvent<HTMLInputElement>) => {
    const file = changeEvent.target.files?.[0] ?? null;
    if (!file) return;
    const validMime = SCHEDULE_IMAGE_MIME_TYPES.includes(
      file.type as (typeof SCHEDULE_IMAGE_MIME_TYPES)[number],
    );
    const extension = /\.([a-z0-9]+)$/i.exec(file.name)?.[1]?.toLowerCase();
    const extensionMatches =
      (file.type === "image/jpeg" &&
        (extension === "jpg" || extension === "jpeg")) ||
      (file.type === "image/png" && extension === "png") ||
      (file.type === "image/webp" && extension === "webp");
    if (
      !validMime ||
      !EXTENSION_PATTERN.test(file.name) ||
      !extensionMatches ||
      file.size <= 0 ||
      file.size > SCHEDULE_IMAGE_MAX_BYTES
    ) {
      changeEvent.target.value = "";
      setMessage(
        "Choisissez une image JPG, PNG ou WebP de 5 Mo maximum, avec une extension cohérente.",
      );
      setIsError(true);
      return;
    }
    setSelectedImage(file);
    setRemoveThumbnail(false);
    setPreviewUrl(URL.createObjectURL(file));
    setMessage("");
    setIsError(false);
  };

  const removeImage = () => {
    setSelectedImage(null);
    setPreviewUrl("");
    setRemoveThumbnail(Boolean(event?.thumbnailUrl));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const submit = async (submitEvent: FormEvent<HTMLFormElement>) => {
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
        if (!event) {
          submitEvent.currentTarget.reset();
          setSelectedImage(null);
          setPreviewUrl("");
          setRemoveThumbnail(false);
          setStatus("scheduled");
        }
        router.refresh();
        onSaved();
      }
    } finally {
      setSubmitting(false);
    }
  };

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

      <form onSubmit={(formEvent) => void submit(formEvent)} className="mt-8 space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <label className="block text-sm font-bold text-gray-300">
            Titre *
            <input name="title" required maxLength={180} defaultValue={event?.title ?? ""} className={`${inputClass} mt-2`} />
          </label>
          <label className="block text-sm font-bold text-gray-300">
            Slug d’émission
            <input name="slug" maxLength={140} pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="jotaayu-bichri" defaultValue={event?.slug ?? ""} className={`${inputClass} mt-2`} />
          </label>
        </div>

        <label className="block text-sm font-bold text-gray-300">
          Description
          <textarea name="description" rows={5} maxLength={5000} defaultValue={event?.description ?? ""} className={`${inputClass} mt-2 resize-y`} />
        </label>

        <div className="grid gap-6 md:grid-cols-2">
          <label className="block text-sm font-bold text-gray-300">
            Catégorie
            <input name="category" maxLength={120} defaultValue={event?.category ?? ""} className={`${inputClass} mt-2`} />
          </label>
          <label className="block text-sm font-bold text-gray-300">
            Lieu
            <input name="location" maxLength={200} defaultValue={event?.location ?? ""} className={`${inputClass} mt-2`} />
          </label>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <label className="block text-sm font-bold text-gray-300">
            Début — Heure de Dakar *
            <input name="scheduled_start_time" type="datetime-local" required defaultValue={toDakarInputValue(event?.scheduledStartTime ?? null)} className={`${inputClass} mt-2`} />
          </label>
          <label className="block text-sm font-bold text-gray-300">
            Fin — Heure de Dakar
            <input name="scheduled_end_time" type="datetime-local" defaultValue={toDakarInputValue(event?.scheduledEndTime ?? null)} className={`${inputClass} mt-2`} />
          </label>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <label className="block text-sm font-bold text-gray-300">
            Vidéo YouTube
            <input name="youtube_video" maxLength={2048} placeholder="Identifiant ou URL YouTube" defaultValue={event?.youtubeVideoId ?? ""} className={`${inputClass} mt-2`} />
          </label>
        </div>

        <div className="grid gap-5 rounded-2xl border border-white/10 bg-[#020B2E] p-5 md:grid-cols-[1fr_280px]">
          <div>
            <p className="text-sm font-bold text-gray-300">
              Miniature de l’événement
            </p>
            <input
              ref={fileInputRef}
              id="schedule-thumbnail"
              name="thumbnail_file"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={selectImage}
              className="sr-only"
            />
            <input
              name="remove_thumbnail"
              type="hidden"
              value={removeThumbnail ? "true" : "false"}
            />
            <div className="mt-3 flex flex-wrap gap-3">
              <label
                htmlFor="schedule-thumbnail"
                className="inline-flex min-h-11 cursor-pointer items-center rounded-full bg-[#FCCD12] px-5 py-3 font-black text-[#020B2E]">
                Choisir une image
              </label>
              {previewUrl ? (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={removeImage}
                  className="min-h-11 rounded-full border border-red-400/30 px-5 py-3 font-bold text-red-300 disabled:opacity-50">
                  Retirer l’image
                </button>
              ) : null}
            </div>
            <p className="mt-3 text-sm text-gray-400">
              Formats acceptés : JPG, PNG ou WebP. Taille maximale : 5 Mo.
              Format recommandé : 16:9.
            </p>
            {selectedImage ? (
              <p className="mt-2 break-all text-sm font-bold text-white">
                {selectedImage.name}
              </p>
            ) : event?.thumbnailUrl && !removeThumbnail ? (
              <p className="mt-2 text-sm text-gray-400">
                Miniature actuelle conservée.
              </p>
            ) : null}
          </div>
          <div className="aspect-video overflow-hidden rounded-2xl border border-white/10 bg-[#08143D]">
            {previewUrl ? (
              <Image
                src={previewUrl}
                alt="Aperçu de la miniature de l’événement"
                width={560}
                height={315}
                unoptimized
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center px-6 text-center text-sm text-gray-500">
                Aucune miniature
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-bold text-gray-300">
            Statut
            <select
              name="status"
              value={status}
              onChange={(changeEvent) =>
                setStatus(changeEvent.target.value as ScheduleStatus)
              }
              className={`${inputClass} mt-2`}>
              {SCHEDULE_STATUSES.map((status) => (
                <option key={status} value={status}>{STATUS_LABELS[status]}</option>
              ))}
            </select>
          </label>
          <label className="flex cursor-pointer items-center gap-4 self-end rounded-2xl border border-white/10 bg-[#020B2E] p-5">
            <input name="is_published" type="checkbox" defaultChecked={event?.isPublished ?? false} className="h-5 w-5 accent-[#FCCD12]" />
            <span className="font-bold">Publier dans l’API publique</span>
          </label>
        </div>

        {status === "cancelled" ? (
          <p role="alert" className="rounded-2xl border border-orange-400/30 bg-orange-400/10 p-4 font-bold text-orange-200">
            Les événements annulés ne sont pas affichés publiquement dans le
            site ou l’application.
          </p>
        ) : null}

        {message && (
          <p role="status" className={`rounded-2xl border p-4 font-bold ${isError ? "border-red-500/30 bg-red-500/10 text-red-300" : "border-green-500/30 bg-green-500/10 text-green-300"}`}>
            {message}
          </p>
        )}

        <div className="flex flex-wrap gap-4">
          <button type="submit" disabled={submitting} className="rounded-full bg-[#FCCD12] px-8 py-4 font-black text-[#020B2E] disabled:cursor-not-allowed disabled:opacity-60">
            {submitting ? "Enregistrement…" : event ? "Enregistrer" : "Créer l’événement"}
          </button>
          {event && (
            <button type="button" onClick={onCancel} disabled={submitting} className="rounded-full border border-white/15 px-8 py-4 font-bold">
              Annuler
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
