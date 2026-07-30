import "server-only";

import { createAdminClient } from "../supabase/admin";
import {
  PROGRAM_IMAGE_MAX_BYTES,
  PROGRAM_IMAGE_MIME_TYPES,
} from "../../types/program";

const BUCKET = "product-images";
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EXTENSIONS = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;
type AllowedMime = (typeof PROGRAM_IMAGE_MIME_TYPES)[number];

function isAllowedMime(value: string): value is AllowedMime {
  return PROGRAM_IMAGE_MIME_TYPES.includes(value as AllowedMime);
}

async function detectMime(file: File): Promise<AllowedMime | null> {
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

export function readProgramImage(formData: FormData) {
  const files = formData
    .getAll("thumbnail_file")
    .filter(
      (value): value is File =>
        value instanceof File && (value.name.length > 0 || value.size > 0),
    );
  if (files.length > 1) throw new Error("Une seule miniature peut être envoyée.");
  return files[0] ?? null;
}

async function validateProgramImage(file: File) {
  if (file.size <= 0) throw new Error("Le fichier image est vide.");
  if (file.size > PROGRAM_IMAGE_MAX_BYTES) {
    throw new Error("La miniature ne doit pas dépasser 5 Mo.");
  }
  if (!isAllowedMime(file.type)) {
    throw new Error("La miniature doit être une image JPG, PNG ou WebP.");
  }
  const detected = await detectMime(file);
  if (!detected || detected !== file.type) {
    throw new Error("Le contenu du fichier ne correspond pas à son format.");
  }
  const extension = file.name.split(".").pop()?.toLowerCase();
  const allowed =
    detected === "image/jpeg" ? ["jpg", "jpeg"] : [EXTENSIONS[detected]];
  if (!extension || !allowed.includes(extension)) {
    throw new Error("L’extension du fichier ne correspond pas à son format.");
  }
  return { mime: detected, extension: EXTENSIONS[detected] };
}

export async function uploadProgramImage(programId: string, file: File) {
  if (!UUID_PATTERN.test(programId)) {
    throw new Error("Identifiant de programme invalide.");
  }
  const checked = await validateProgramImage(file);
  const storagePath =
    `programs/${programId}/${crypto.randomUUID()}.${checked.extension}`;
  const supabase = createAdminClient();
  const { error } = await supabase.storage.from(BUCKET).upload(storagePath, file, {
    cacheControl: "3600",
    contentType: checked.mime,
    upsert: false,
  });
  if (error) throw new Error("Le téléversement de la miniature a échoué.");
  const publicUrl = supabase.storage.from(BUCKET).getPublicUrl(storagePath)
    .data.publicUrl;
  return { storagePath, publicUrl };
}

export function isOwnedProgramImagePath(programId: string, path: string | null) {
  if (!path || !UUID_PATTERN.test(programId)) return false;
  return new RegExp(
    `^programs/${programId}/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\\.(?:jpg|png|webp)$`,
    "i",
  ).test(path);
}

export async function removeProgramImage(programId: string, path: string) {
  if (!isOwnedProgramImagePath(programId, path)) return;
  const { error } = await createAdminClient().storage.from(BUCKET).remove([path]);
  if (error) throw new Error("Le nettoyage de la miniature a échoué.");
}
