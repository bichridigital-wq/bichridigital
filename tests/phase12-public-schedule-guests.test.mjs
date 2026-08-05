import assert from "node:assert/strict";
import test from "node:test";
import { buildPublicScheduleEvents } from "../lib/schedule/public-events.ts";

const schedule = {
  id: "10000000-0000-4000-8000-000000000001",
  program_id: null,
  title: "Jotaayu Bichri",
  slug: "jotaayu-bichri",
  description: "Description publique",
  category: "Magazine",
  scheduled_start_time: "2026-08-10T12:00:00.000Z",
  scheduled_end_time: null,
  status: "scheduled",
  youtube_video_id: null,
  thumbnail_url: null,
  location: "Ndiagne",
  is_published: true,
  created_at: "2026-08-01T00:00:00.000Z",
  updated_at: "2026-08-01T00:00:00.000Z",
};

function association(overrides = {}) {
  return {
    id: "20000000-0000-4000-8000-000000000001",
    schedule_id: schedule.id,
    guest_id: "30000000-0000-4000-8000-000000000001",
    guest_name_snapshot: "Bounama",
    guest_title_snapshot: "PDG",
    guest_photo_url_snapshot: "https://example.com/photo.webp",
    role_label: "Présentateur",
    sort_order: 0,
    ...overrides,
  };
}

test("un événement sans invité conserve son contrat et retourne guests vide", () => {
  const [event] = buildPublicScheduleEvents([schedule], []);
  assert.deepEqual(event.guests, []);
  assert.equal(event.id, schedule.id);
  assert.equal(event.title, schedule.title);
  assert.equal(event.slug, schedule.slug);
  assert.equal(event.description, schedule.description);
  assert.equal(event.category, schedule.category);
  assert.equal(event.scheduledStartTime, schedule.scheduled_start_time);
  assert.equal(event.scheduledEndTime, schedule.scheduled_end_time);
  assert.equal(event.status, schedule.status);
  assert.equal(event.youtubeVideoId, schedule.youtube_video_id);
  assert.equal(event.thumbnailUrl, schedule.thumbnail_url);
  assert.equal(event.location, schedule.location);
});

test("un invité expose uniquement ses snapshots publics", () => {
  const [event] = buildPublicScheduleEvents([schedule], [association()]);
  assert.deepEqual(event.guests, [
    {
      id: "20000000-0000-4000-8000-000000000001",
      guestId: "30000000-0000-4000-8000-000000000001",
      name: "Bounama",
      title: "PDG",
      role: "Présentateur",
      photoUrl: "https://example.com/photo.webp",
      sortOrder: 0,
    },
  ]);
});

test("plusieurs invités sont triés par sort_order", () => {
  const first = association({
    id: "20000000-0000-4000-8000-000000000002",
    guest_name_snapshot: "Deuxième",
    sort_order: 2,
  });
  const second = association({
    id: "20000000-0000-4000-8000-000000000003",
    guest_name_snapshot: "Premier",
    sort_order: 1,
  });
  const [event] = buildPublicScheduleEvents([schedule], [first, second]);
  assert.deepEqual(event.guests?.map((guest) => guest.name), ["Premier", "Deuxième"]);
});

test("un invité historique sans guest_id conserve ses snapshots", () => {
  const historical = association({
    guest_id: null,
    guest_name_snapshot: "Invité historique",
    guest_title_snapshot: null,
    guest_photo_url_snapshot: null,
    role_label: null,
  });
  const [event] = buildPublicScheduleEvents([schedule], [historical]);
  assert.equal(event.guests?.[0].guestId, null);
  assert.equal(event.guests?.[0].name, "Invité historique");
  assert.equal(event.guests?.[0].photoUrl, null);
  assert.equal(event.guests?.[0].role, null);
});
