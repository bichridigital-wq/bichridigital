import type { BroadcastProgramInput } from "../../types/program";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function requiredText(
  value: FormDataEntryValue | null,
  maximum: number,
  label: string,
) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${label} est obligatoire.`);
  }
  const normalized = value.trim();
  if (normalized.length > maximum) {
    throw new Error(`${label} ne doit pas dépasser ${maximum} caractères.`);
  }
  return normalized;
}

function optionalText(
  value: FormDataEntryValue | null,
  maximum: number,
  label: string,
) {
  if (typeof value !== "string" || !value.trim()) return null;
  const normalized = value.trim();
  if (normalized.length > maximum) {
    throw new Error(`${label} ne doit pas dépasser ${maximum} caractères.`);
  }
  return normalized;
}

function integerValue(
  value: FormDataEntryValue | null,
  label: string,
  minimum: number,
  maximum: number,
) {
  if (typeof value !== "string" || !/^\d+$/.test(value)) {
    throw new Error(`${label} doit être un nombre entier.`);
  }
  const number = Number(value);
  if (number < minimum || number > maximum) {
    throw new Error(`${label} doit être compris entre ${minimum} et ${maximum}.`);
  }
  return number;
}

export function validateProgramFormData(
  formData: FormData,
): BroadcastProgramInput {
  const slug = requiredText(formData.get("slug"), 140, "Le slug");
  if (!SLUG_PATTERN.test(slug)) {
    throw new Error(
      "Le slug doit contenir uniquement des minuscules, chiffres et tirets.",
    );
  }
  return {
    name: requiredText(formData.get("name"), 180, "Le nom"),
    slug,
    category: requiredText(formData.get("category"), 120, "La catégorie"),
    defaultDescription: optionalText(
      formData.get("default_description"),
      5000,
      "La description",
    ),
    defaultThumbnailUrl: null,
    defaultThumbnailStoragePath: null,
    defaultDurationMinutes: integerValue(
      formData.get("default_duration_minutes"),
      "La durée",
      15,
      360,
    ),
    isActive: formData.get("is_active") === "on",
    sortOrder: integerValue(formData.get("sort_order"), "L’ordre", 0, 100000),
  };
}
