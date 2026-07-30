import {
  SCHEDULE_STATUSES,
  type CreateScheduleEventInput,
  type ScheduleStatus,
} from "../../types/schedule";

const DAKAR_DATE_TIME_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const YOUTUBE_VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

function optionalText(
  value: FormDataEntryValue | null,
  maximum: number,
  label: string,
) {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  if (!normalized) return null;
  if (normalized.length > maximum) {
    throw new Error(`${label} ne doit pas dépasser ${maximum} caractères.`);
  }
  return normalized;
}

function parseDakarDateTime(value: FormDataEntryValue | null, label: string) {
  if (typeof value !== "string") {
    throw new Error(`${label} est obligatoire.`);
  }
  const match = DAKAR_DATE_TIME_PATTERN.exec(value);
  if (!match) throw new Error(`${label} est invalide.`);

  // Africa/Dakar reste à UTC+00:00 toute l’année. Le suffixe Z empêche
  // toute interprétation avec le fuseau local du navigateur ou du serveur.
  const instant = new Date(`${value}:00.000Z`);
  if (
    Number.isNaN(instant.getTime()) ||
    instant.getUTCFullYear() !== Number(match[1]) ||
    instant.getUTCMonth() + 1 !== Number(match[2]) ||
    instant.getUTCDate() !== Number(match[3]) ||
    instant.getUTCHours() !== Number(match[4]) ||
    instant.getUTCMinutes() !== Number(match[5])
  ) {
    throw new Error(`${label} est invalide.`);
  }
  return instant.toISOString();
}

function validateOptionalUrl(value: string | null, label: string) {
  if (!value) return null;
  if (value.length > 2048) {
    throw new Error(`${label} ne doit pas dépasser 2048 caractères.`);
  }
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error();
    return url.toString();
  } catch {
    throw new Error(`${label} doit être une URL HTTP ou HTTPS valide.`);
  }
}

export function extractYoutubeVideoId(value: string | null) {
  if (!value) return null;
  if (YOUTUBE_VIDEO_ID_PATTERN.test(value)) return value;

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("La vidéo YouTube est invalide.");
  }

  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  let candidate: string | null = null;
  if (host === "youtu.be") {
    candidate = url.pathname.split("/").filter(Boolean)[0] ?? null;
  } else if (host === "youtube.com" || host === "m.youtube.com") {
    candidate = url.searchParams.get("v");
    if (!candidate) {
      const [kind, id] = url.pathname.split("/").filter(Boolean);
      if (["embed", "shorts", "live"].includes(kind)) candidate = id ?? null;
    }
  }

  if (!candidate || !YOUTUBE_VIDEO_ID_PATTERN.test(candidate)) {
    throw new Error("La vidéo YouTube est invalide.");
  }
  return candidate;
}

export function validateScheduleFormData(
  formData: FormData,
): CreateScheduleEventInput {
  const title = optionalText(formData.get("title"), 180, "Le titre");
  if (!title) throw new Error("Le titre est obligatoire.");

  const slug = optionalText(formData.get("slug"), 140, "Le slug");
  if (slug && !SLUG_PATTERN.test(slug)) {
    throw new Error(
      "Le slug doit contenir uniquement des minuscules, chiffres et tirets.",
    );
  }

  const statusValue = optionalText(formData.get("status"), 20, "Le statut");
  if (
    !statusValue ||
    !SCHEDULE_STATUSES.includes(statusValue as ScheduleStatus)
  ) {
    throw new Error("Le statut sélectionné est invalide.");
  }

  const scheduledStartTime = parseDakarDateTime(
    formData.get("scheduled_start_time"),
    "La date de début",
  );
  const endValue = optionalText(
    formData.get("scheduled_end_time"),
    16,
    "La date de fin",
  );
  const scheduledEndTime = endValue
    ? parseDakarDateTime(endValue, "La date de fin")
    : null;
  if (
    scheduledEndTime &&
    new Date(scheduledEndTime).getTime() <=
      new Date(scheduledStartTime).getTime()
  ) {
    throw new Error("La date de fin doit être postérieure à la date de début.");
  }

  const youtubeValue = optionalText(
    formData.get("youtube_video"),
    2048,
    "La vidéo YouTube",
  );
  const thumbnailValue = optionalText(
    formData.get("thumbnail_url"),
    2048,
    "La miniature",
  );

  return {
    title,
    slug,
    description: optionalText(
      formData.get("description"),
      5000,
      "La description",
    ),
    category: optionalText(formData.get("category"), 120, "La catégorie"),
    scheduledStartTime,
    scheduledEndTime,
    status: statusValue as ScheduleStatus,
    youtubeVideoId: extractYoutubeVideoId(youtubeValue),
    thumbnailUrl: validateOptionalUrl(thumbnailValue, "La miniature"),
    location: optionalText(formData.get("location"), 200, "Le lieu"),
    isPublished: formData.get("is_published") === "on",
  };
}
