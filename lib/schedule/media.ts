import "server-only";

import { createAdminClient } from "../supabase/admin";
import {
  SCHEDULE_IMAGE_MAX_BYTES,
  SCHEDULE_IMAGE_MIME_TYPES,
} from "../../types/schedule";

const SCHEDULE_MEDIA_BUCKET = "product-images";
const PUBLIC_STORAGE_MARKER =
  `/storage/v1/object/public/${SCHEDULE_MEDIA_BUCKET}/`;
const UUID_PATTERN =
  "[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}";
const EXTENSIONS = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

type AllowedMime = (typeof SCHEDULE_IMAGE_MIME_TYPES)[number];

function isAllowedMime(value: string): value is AllowedMime {
  return SCHEDULE_IMAGE_MIME_TYPES.includes(value as AllowedMime);
}

function extensionFromName(name: string) {
  const match = /\.([a-z0-9]+)$/i.exec(name);
  return match?.[1]?.toLowerCase() ?? "";
}

async function detectImageMime(file: File): Promise<AllowedMime | null> {
  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "image/png";
  }
  if (
    bytes.length >= 12 &&
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

export function readScheduleImage(formData: FormData): File | null {
  const value = formData.get("thumbnail_file");
  return value instanceof File && value.size > 0 ? value : null;
}

export async function validateScheduleImage(file: File) {
  if (file.size <= 0) throw new Error("Le fichier image est vide.");
  if (file.size > SCHEDULE_IMAGE_MAX_BYTES) {
    throw new Error("La miniature ne doit pas dépasser 5 Mo.");
  }
  if (!isAllowedMime(file.type)) {
    throw new Error("La miniature doit être une image JPG, PNG ou WebP.");
  }

  const extension = extensionFromName(file.name);
  const allowedExtensions =
    file.type === "image/jpeg" ? ["jpg", "jpeg"] : [EXTENSIONS[file.type]];
  if (!allowedExtensions.includes(extension)) {
    throw new Error("L’extension du fichier ne correspond pas à son format.");
  }

  const detectedMime = await detectImageMime(file);
  if (!detectedMime || detectedMime !== file.type) {
    throw new Error("Le contenu du fichier ne correspond pas à une image autorisée.");
  }
  return { mime: detectedMime, extension: EXTENSIONS[detectedMime] };
}

export async function uploadScheduleImage(eventId: string, file: File) {
  const checked = await validateScheduleImage(file);
  const path = `schedule/${eventId}/${crypto.randomUUID()}.${checked.extension}`;
  const supabase = createAdminClient();
  const { error } = await supabase.storage
    .from(SCHEDULE_MEDIA_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      contentType: checked.mime,
      upsert: false,
    });
  if (error) throw new Error("Le téléversement de la miniature a échoué.");

  const { data } = supabase.storage
    .from(SCHEDULE_MEDIA_BUCKET)
    .getPublicUrl(path);
  return { path, publicUrl: data.publicUrl };
}

export function getOwnedScheduleImagePath(
  eventId: string,
  imageUrl: string | null,
) {
  if (!imageUrl) return null;
  let url: URL;
  try {
    url = new URL(imageUrl);
  } catch {
    return null;
  }
  const markerIndex = url.pathname.indexOf(PUBLIC_STORAGE_MARKER);
  if (markerIndex === -1) return null;
  const encodedPath = url.pathname.slice(
    markerIndex + PUBLIC_STORAGE_MARKER.length,
  );
  let path: string;
  try {
    path = decodeURIComponent(encodedPath);
  } catch {
    return null;
  }
  const pattern = new RegExp(
    `^schedule/${eventId}/${UUID_PATTERN}\\.(?:jpg|png|webp)$`,
    "i",
  );
  return pattern.test(path) ? path : null;
}

export async function removeScheduleImage(path: string) {
  const { error } = await createAdminClient().storage
    .from(SCHEDULE_MEDIA_BUCKET)
    .remove([path]);
  if (error) throw new Error("Le nettoyage de la miniature a échoué.");
}
