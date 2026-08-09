import type {
  BroadcastProgramRow,
  PublicBroadcastProgram,
} from "../../types/program";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function toPublicProgram(
  row: BroadcastProgramRow,
): PublicBroadcastProgram {
  if (
    !UUID_PATTERN.test(row.id) ||
    !row.name.trim() ||
    !SLUG_PATTERN.test(row.slug) ||
    !row.category.trim() ||
    !Number.isInteger(row.default_duration_minutes) ||
    row.default_duration_minutes < 15 ||
    row.default_duration_minutes > 360
  ) {
    throw new Error("Invalid public program data");
  }
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    category: row.category,
    defaultDescription: row.default_description,
    defaultThumbnailUrl: row.default_thumbnail_url,
    defaultDurationMinutes: row.default_duration_minutes,
  };
}
