import type { BroadcastScheduleGuestRow } from "../../types/guest";
import type {
  PublicScheduleEvent,
  PublicScheduleGuest,
  ScheduleRow,
} from "../../types/schedule";

function publicGuest(row: BroadcastScheduleGuestRow): PublicScheduleGuest {
  return {
    id: row.id,
    guestId: row.guest_id,
    name: row.guest_name_snapshot,
    title: row.guest_title_snapshot,
    role: row.role_label,
    photoUrl: row.guest_photo_url_snapshot,
    sortOrder: row.sort_order,
  };
}

function publicEvent(
  row: ScheduleRow,
  guests: PublicScheduleGuest[],
): PublicScheduleEvent {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    category: row.category,
    scheduledStartTime: row.scheduled_start_time,
    scheduledEndTime: row.scheduled_end_time,
    status: row.status,
    youtubeVideoId: row.youtube_video_id,
    thumbnailUrl: row.thumbnail_url,
    location: row.location,
    guests,
  };
}

export function buildPublicScheduleEvents(
  scheduleRows: ScheduleRow[],
  associationRows: BroadcastScheduleGuestRow[],
): PublicScheduleEvent[] {
  const guestsBySchedule = new Map<string, PublicScheduleGuest[]>();

  for (const row of associationRows) {
    const guests = guestsBySchedule.get(row.schedule_id) ?? [];
    guests.push(publicGuest(row));
    guestsBySchedule.set(row.schedule_id, guests);
  }

  for (const guests of guestsBySchedule.values()) {
    guests.sort(
      (left, right) =>
        left.sortOrder - right.sortOrder || left.id.localeCompare(right.id),
    );
  }

  return scheduleRows.map((row) =>
    publicEvent(row, guestsBySchedule.get(row.id) ?? []),
  );
}
