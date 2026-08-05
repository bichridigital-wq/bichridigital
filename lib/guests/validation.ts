import type {
  BroadcastGuestFormValues,
  GuestSelection,
} from "../../types/guest";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function text(value: FormDataEntryValue | null, maximum: number, label: string) {
  if (typeof value !== "string") return null;
  const normalized = value.trim().replace(/\s+/g, " ");
  if (!normalized) return null;
  if (normalized.length > maximum) {
    throw new Error(`${label} ne doit pas dépasser ${maximum} caractères.`);
  }
  return normalized;
}

function url(value: FormDataEntryValue | null, label: string) {
  const normalized = text(value, 2048, label);
  if (!normalized) return null;
  let parsed: URL;
  try {
    parsed = new URL(normalized);
  } catch {
    throw new Error(`${label} doit être une URL valide.`);
  }
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error(`${label} doit utiliser HTTP ou HTTPS.`);
  }
  return parsed.toString();
}

function order(value: FormDataEntryValue | null, label: string) {
  if (typeof value !== "string" || !/^\d+$/.test(value)) {
    throw new Error(`${label} doit être un entier positif.`);
  }
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 0 || parsed > 100000) {
    throw new Error(`${label} est invalide.`);
  }
  return parsed;
}

export function validateGuestId(value: string, label = "L’invité") {
  if (!UUID_PATTERN.test(value)) throw new Error(`${label} est invalide.`);
  return value;
}

export function validateGuestFormData(
  formData: FormData,
): BroadcastGuestFormValues {
  const fullName = text(formData.get("full_name"), 180, "Le nom");
  if (!fullName) throw new Error("Le nom est obligatoire.");
  const slug = text(formData.get("slug"), 140, "Le slug")?.toLowerCase();
  if (!slug || !SLUG_PATTERN.test(slug)) {
    throw new Error(
      "Le slug doit contenir uniquement des minuscules, chiffres et tirets.",
    );
  }
  return {
    fullName,
    slug,
    title: text(formData.get("title"), 180, "Le titre"),
    shortBio: text(formData.get("short_bio"), 3000, "La biographie"),
    specialty: text(formData.get("specialty"), 180, "La spécialité"),
    photoUrl: null,
    photoStoragePath: null,
    instagramUrl: url(formData.get("instagram_url"), "Instagram"),
    facebookUrl: url(formData.get("facebook_url"), "Facebook"),
    youtubeUrl: url(formData.get("youtube_url"), "YouTube"),
    websiteUrl: url(formData.get("website_url"), "Le site web"),
    isActive: formData.get("is_active") === "on",
    sortOrder: order(formData.get("sort_order"), "L’ordre"),
  };
}

export function validateGuestSelections(formData: FormData): GuestSelection[] {
  const raw = formData.get("guest_selections");
  if (typeof raw !== "string" || !raw.trim()) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("La sélection des invités est invalide.");
  }
  if (!Array.isArray(parsed) || parsed.length > 50) {
    throw new Error("La sélection des invités est invalide.");
  }
  const seen = new Set<string>();
  const seenAssociations = new Set<string>();
  return parsed.map((value, index) => {
    if (!value || typeof value !== "object") {
      throw new Error("Un invité sélectionné est invalide.");
    }
    const item = value as Record<string, unknown>;
    const associationId =
      typeof item.associationId === "string" && item.associationId
        ? validateGuestId(item.associationId, "L’association")
        : null;
    const guestId =
      typeof item.guestId === "string" && item.guestId
        ? validateGuestId(item.guestId)
        : null;
    const fullName =
      typeof item.fullName === "string"
        ? item.fullName.trim().replace(/\s+/g, " ")
        : "";
    if (!guestId && !associationId) {
      throw new Error("Un invité sélectionné est invalide.");
    }
    if (associationId && seenAssociations.has(associationId)) {
      throw new Error("Une association d’invité est présente deux fois.");
    }
    if (associationId) seenAssociations.add(associationId);
    if (guestId && seen.has(guestId)) {
      throw new Error("Un invité est sélectionné deux fois.");
    }
    if (guestId) seen.add(guestId);
    const roleLabel =
      typeof item.roleLabel === "string"
        ? item.roleLabel.trim().replace(/\s+/g, " ") || null
        : null;
    if (roleLabel && roleLabel.length > 120) {
      throw new Error("Le rôle ne doit pas dépasser 120 caractères.");
    }
    return {
      associationId,
      guestId,
      fullName,
      title:
        typeof item.title === "string" && item.title.trim()
          ? item.title.trim()
          : null,
      photoUrl:
        typeof item.photoUrl === "string" && item.photoUrl.trim()
          ? item.photoUrl.trim()
          : null,
      roleLabel,
      sortOrder: index,
      isActive: true,
      refreshSnapshot:
        typeof item.refreshSnapshot === "boolean"
          ? item.refreshSnapshot
          : false,
    };
  });
}
