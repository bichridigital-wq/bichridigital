import type {
  PublicGuestAppearance,
  PublicGuestProfile,
} from "../../types/guest";

const PUBLIC_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const YOUTUBE_VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

export function safePublicUrl(value: string | null) {
  if (!value) return null;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:"
      ? parsed.toString()
      : null;
  } catch {
    return null;
  }
}

export type PublicGuestProfileRow = {
  id: string;
  full_name: string;
  slug: string;
  title: string | null;
  short_bio: string | null;
  specialty: string | null;
  photo_url: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  youtube_url: string | null;
  website_url: string | null;
  is_active: boolean;
  updated_at: string;
};

export type PublicAppearanceAssociationRow = {
  schedule_id: string;
  role_label: string | null;
  sort_order: number;
};

export type PublicAppearanceScheduleRow = {
  id: string;
  title: string;
  slug: string | null;
  scheduled_start_time: string;
  scheduled_end_time: string | null;
  youtube_video_id: string | null;
  thumbnail_url: string | null;
  location: string | null;
  is_published: boolean;
};

export function isPublicGuestSlug(value: string) {
  return value.length <= 140 && PUBLIC_SLUG_PATTERN.test(value);
}

export function toPublicGuestProfile(
  row: PublicGuestProfileRow,
): PublicGuestProfile | null {
  if (!row.is_active || !isPublicGuestSlug(row.slug)) return null;
  return {
    id: row.id,
    fullName: row.full_name,
    slug: row.slug,
    title: row.title,
    shortBio: row.short_bio,
    specialty: row.specialty,
    photoUrl: safePublicUrl(row.photo_url),
    instagramUrl: safePublicUrl(row.instagram_url),
    facebookUrl: safePublicUrl(row.facebook_url),
    youtubeUrl: safePublicUrl(row.youtube_url),
    websiteUrl: safePublicUrl(row.website_url),
  };
}

export function buildPublicGuestLinks(rows: PublicGuestProfileRow[]) {
  const links: Record<string, string> = {};
  for (const row of rows) {
    const profile = toPublicGuestProfile(row);
    if (profile) links[profile.id] = profile.slug;
  }
  return links;
}

export function getPublicGuestHref(
  guestId: string | null,
  links: Record<string, string>,
) {
  if (!guestId) return null;
  const slug = links[guestId];
  return slug && isPublicGuestSlug(slug) ? `/tv/invites/${slug}` : null;
}

export function buildPublicGuestAppearances(
  schedules: PublicAppearanceScheduleRow[],
  associations: PublicAppearanceAssociationRow[],
  now = new Date(),
): PublicGuestAppearance[] {
  const associationBySchedule = new Map(
    associations.map((association) => [association.schedule_id, association]),
  );

  return schedules
    .filter(
      (schedule) =>
        schedule.is_published &&
        associationBySchedule.has(schedule.id),
    )
    .sort((left, right) => {
      const nowTime = now.getTime();
      const leftTime = new Date(left.scheduled_start_time).getTime();
      const rightTime = new Date(right.scheduled_start_time).getTime();
      const leftUpcoming = leftTime >= nowTime;
      const rightUpcoming = rightTime >= nowTime;
      if (leftUpcoming !== rightUpcoming) return leftUpcoming ? -1 : 1;
      const dateOrder = leftUpcoming
        ? leftTime - rightTime
        : rightTime - leftTime;
      return dateOrder || left.id.localeCompare(right.id);
    })
    .map((schedule) => ({
      eventId: schedule.id,
      title: schedule.title,
      slug: schedule.slug,
      scheduledStartTime: schedule.scheduled_start_time,
      scheduledEndTime: schedule.scheduled_end_time,
      youtubeVideoId:
        schedule.youtube_video_id &&
        YOUTUBE_VIDEO_ID_PATTERN.test(schedule.youtube_video_id)
          ? schedule.youtube_video_id
          : null,
      thumbnailUrl: safePublicUrl(schedule.thumbnail_url),
      location: schedule.location,
      role: associationBySchedule.get(schedule.id)?.role_label ?? null,
    }));
}
