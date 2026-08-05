import "server-only";

import { createAdminClient } from "../supabase/admin";
import { validateScheduleImage } from "../schedule/media";
import { GUEST_IMAGE_MAX_BYTES } from "../../types/guest";
import { validateGuestId } from "./validation";

const BUCKET = "product-images";

export function readGuestPhoto(formData: FormData) {
  const files = formData
    .getAll("photo_file")
    .filter(
      (value): value is File =>
        value instanceof File && (value.name.length > 0 || value.size > 0),
    );
  if (files.length > 1) throw new Error("Une seule photo peut être envoyée.");
  return files[0] ?? null;
}

export async function uploadGuestPhoto(guestId: string, file: File) {
  validateGuestId(guestId);
  if (file.size > GUEST_IMAGE_MAX_BYTES) {
    throw new Error("La photo ne doit pas dépasser 5 Mo.");
  }
  const checked = await validateScheduleImage(file);
  const storagePath =
    `guests/${guestId}/${crypto.randomUUID()}.${checked.extension}`;
  const supabase = createAdminClient();
  const { error } = await supabase.storage.from(BUCKET).upload(storagePath, file, {
    cacheControl: "3600",
    contentType: checked.mime,
    upsert: false,
  });
  if (error) throw new Error("Le téléversement de la photo a échoué.");
  return {
    storagePath,
    publicUrl: supabase.storage.from(BUCKET).getPublicUrl(storagePath).data
      .publicUrl,
  };
}

export function isOwnedGuestPhotoPath(guestId: string, path: string | null) {
  if (!path) return false;
  try {
    validateGuestId(guestId);
  } catch {
    return false;
  }
  return new RegExp(
    `^guests/${guestId}/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\\.(?:jpg|png|webp)$`,
    "i",
  ).test(path);
}

export async function removeGuestPhoto(guestId: string, path: string) {
  if (!isOwnedGuestPhotoPath(guestId, path)) return;
  const { error } = await createAdminClient().storage.from(BUCKET).remove([path]);
  if (error) throw new Error("Le nettoyage de la photo a échoué.");
}
