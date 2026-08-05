"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { saveGuestAction } from "./guest-actions";
import {
  GUEST_IMAGE_MAX_BYTES,
  GUEST_IMAGE_MIME_TYPES,
  type BroadcastGuest,
} from "../../../types/guest";

export default function GuestForm({
  guest,
  onCancel,
  onSaved,
}: {
  guest: BroadcastGuest | null;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState(guest?.photoUrl ?? "");
  const [removePhoto, setRemovePhoto] = useState(false);
  useEffect(() => () => {
    if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
  }, [preview]);

  function selectPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const allowed = GUEST_IMAGE_MIME_TYPES.includes(
      file.type as (typeof GUEST_IMAGE_MIME_TYPES)[number],
    );
    const extension = file.name.split(".").pop()?.toLowerCase();
    const extensionValid =
      (file.type === "image/jpeg" && ["jpg", "jpeg"].includes(extension ?? "")) ||
      (file.type === "image/png" && extension === "png") ||
      (file.type === "image/webp" && extension === "webp");
    if (!allowed || !extensionValid || file.size <= 0 || file.size > GUEST_IMAGE_MAX_BYTES) {
      event.target.value = "";
      setMessage("Choisissez une image JPG, PNG ou WebP de 5 Mo maximum.");
      return;
    }
    setPreview(URL.createObjectURL(file));
    setRemovePhoto(false);
    setMessage("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    const form = event.currentTarget;
    try {
      const response = await saveGuestAction(guest?.id ?? null, new FormData(form));
      setMessage(response.message);
      if (response.success) {
        if (!guest) {
          form.reset();
          setPreview("");
          setRemovePhoto(false);
          if (fileRef.current) fileRef.current.value = "";
        }
        router.refresh();
        onSaved();
      }
    } finally {
      setBusy(false);
    }
  }

  const input = "mt-2 w-full rounded-2xl border border-white/10 bg-[#020B2E] px-4 py-3 outline-none focus:border-[#FCCD12]";
  return (
    <section className="rounded-[28px] border border-white/10 bg-white/5 p-6">
      <h2 className="text-2xl font-black">{guest ? "Modifier l’invité" : "Créer un invité"}</h2>
      <form onSubmit={(event) => void submit(event)} className="mt-6 space-y-4">
        <label className="block font-bold">Nom *<input name="full_name" required maxLength={180} defaultValue={guest?.fullName ?? ""} className={input} /></label>
        <label className="block font-bold">Slug *<input name="slug" required maxLength={140} pattern="[a-z0-9]+(-[a-z0-9]+)*" defaultValue={guest?.slug ?? ""} className={input} /></label>
        <label className="block font-bold">Titre ou fonction<input name="title" maxLength={180} defaultValue={guest?.title ?? ""} className={input} /></label>
        <label className="block font-bold">Spécialité<input name="specialty" maxLength={180} defaultValue={guest?.specialty ?? ""} className={input} /></label>
        <label className="block font-bold">Biographie courte<textarea name="short_bio" rows={4} maxLength={3000} defaultValue={guest?.shortBio ?? ""} className={input} /></label>
        {(["instagram", "facebook", "youtube", "website"] as const).map((network) => (
          <label key={network} className="block font-bold capitalize">{network}<input name={`${network}_url`} type="url" maxLength={2048} defaultValue={guest?.[`${network}Url`] ?? ""} className={input} /></label>
        ))}
        <div className="rounded-2xl border border-white/10 bg-[#020B2E] p-4">
          <p className="font-bold">Photo</p>
          <input ref={fileRef} id="guest-photo" name="photo_file" type="file" accept="image/jpeg,image/png,image/webp" onChange={selectPhoto} className="sr-only" />
          <input name="remove_photo" type="hidden" value={removePhoto ? "true" : "false"} />
          <div className="mt-3 aspect-video overflow-hidden rounded-xl bg-[#08143D]">
            {preview ? <Image src={preview} alt="Aperçu de la photo" width={480} height={270} unoptimized className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-gray-500">Aucune photo</div>}
          </div>
          <div className="mt-3 flex gap-2">
            <label htmlFor="guest-photo" className="cursor-pointer rounded-full bg-[#FCCD12] px-4 py-2 font-black text-[#020B2E]">Choisir</label>
            {preview ? <button type="button" onClick={() => { setPreview(""); setRemovePhoto(Boolean(guest?.photoUrl)); if (fileRef.current) fileRef.current.value = ""; }} className="rounded-full border border-red-400/30 px-4 py-2 text-red-300">Retirer</button> : null}
          </div>
        </div>
        <label className="block font-bold">Ordre<input name="sort_order" type="number" min={0} required defaultValue={guest?.sortOrder ?? 0} className={input} /></label>
        <label className="flex items-center gap-3 font-bold"><input name="is_active" type="checkbox" defaultChecked={guest?.isActive ?? true} />Invité actif</label>
        {message ? <p role="status" className="rounded-xl bg-white/5 p-3">{message}</p> : null}
        <div className="flex gap-3">
          <button disabled={busy} className="rounded-full bg-[#FCCD12] px-6 py-3 font-black text-[#020B2E] disabled:opacity-50">{busy ? "Enregistrement…" : "Enregistrer"}</button>
          {guest ? <button type="button" onClick={onCancel} className="rounded-full border border-white/15 px-6 py-3">Annuler</button> : null}
        </div>
      </form>
    </section>
  );
}
