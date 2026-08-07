import assert from "node:assert/strict";
import test from "node:test";
import {
  buildPublicGuestAppearances,
  buildPublicGuestLinks,
  getPublicGuestHref,
  safePublicUrl,
  toPublicGuestProfile,
} from "../lib/guests/public-profiles.ts";

const ACTIVE_ID = "10000000-0000-4000-8000-000000000001";
const activeProfile = {
  id: ACTIVE_ID,
  full_name: "Invité actif",
  slug: "invite-actif",
  title: "Titre public",
  short_bio: "Biographie publique",
  specialty: "Spécialité publique",
  photo_url: "https://example.com/profile.webp",
  instagram_url: null,
  facebook_url: null,
  youtube_url: null,
  website_url: null,
  is_active: true,
  updated_at: "2026-08-06T00:00:00.000Z",
  photo_storage_path: "private/path.webp",
  created_at: "2026-08-01T00:00:00.000Z",
  sort_order: 1,
};

test("un profil public actif n’expose aucun champ administratif", () => {
  const profile = toPublicGuestProfile(activeProfile);
  assert.deepEqual(profile, {
    id: ACTIVE_ID,
    fullName: "Invité actif",
    slug: "invite-actif",
    title: "Titre public",
    shortBio: "Biographie publique",
    specialty: "Spécialité publique",
    photoUrl: "https://example.com/profile.webp",
    instagramUrl: null,
    facebookUrl: null,
    youtubeUrl: null,
    websiteUrl: null,
  });
  assert.equal("photoStoragePath" in profile, false);
  assert.equal("sortOrder" in profile, false);
  assert.equal("createdAt" in profile, false);
});

test("un profil inactif n’est ni listé ni lié", () => {
  const inactive = { ...activeProfile, is_active: false };
  assert.equal(toPublicGuestProfile(inactive), null);
  assert.deepEqual(buildPublicGuestLinks([inactive]), {});
  assert.equal(getPublicGuestHref(ACTIVE_ID, {}), null);
});

test("un snapshot supprimé ou historique reste du texte sans lien", () => {
  const links = buildPublicGuestLinks([activeProfile]);
  assert.equal(getPublicGuestHref(null, links), null);
  assert.equal(
    getPublicGuestHref("20000000-0000-4000-8000-000000000002", links),
    null,
  );
  assert.equal(
    getPublicGuestHref(ACTIVE_ID, links),
    "/tv/invites/invite-actif",
  );
});

test("les événements publiés de plusieurs programmes sont exposés sans filtre", () => {
  const schedules = [
    {
      id: "event-published",
      title: "Émission publiée",
      slug: "programme-un",
      scheduled_start_time: "2026-08-09T21:30:00.000Z",
      scheduled_end_time: null,
      youtube_video_id: null,
      thumbnail_url: null,
      location: null,
      is_published: true,
    },
    {
      id: "event-draft",
      title: "Brouillon",
      slug: "programme-un",
      scheduled_start_time: "2026-08-10T21:30:00.000Z",
      scheduled_end_time: null,
      youtube_video_id: null,
      thumbnail_url: null,
      location: null,
      is_published: false,
    },
    {
      id: "event-other-program",
      title: "Autre programme",
      slug: "autre-programme",
      scheduled_start_time: "2026-08-11T21:30:00.000Z",
      scheduled_end_time: null,
      youtube_video_id: null,
      thumbnail_url: null,
      location: null,
      is_published: true,
    },
    {
      id: "event-past",
      title: "Émission passée",
      slug: "programme-trois",
      scheduled_start_time: "2026-08-01T21:30:00.000Z",
      scheduled_end_time: null,
      youtube_video_id: null,
      thumbnail_url: null,
      location: null,
      is_published: true,
    },
  ];
  const associations = [
    { schedule_id: "event-published", role_label: "Intervenant", sort_order: 0 },
    { schedule_id: "event-draft", role_label: null, sort_order: 0 },
    { schedule_id: "event-other-program", role_label: null, sort_order: 0 },
    { schedule_id: "event-past", role_label: null, sort_order: 0 },
  ];
  const appearances = buildPublicGuestAppearances(
    schedules,
    associations,
    new Date("2026-08-06T00:00:00.000Z"),
  );
  assert.deepEqual(
    appearances.map(({ eventId }) => eventId),
    ["event-published", "event-other-program", "event-past"],
  );
});

test("un événement publié sans association n’est pas attribué au profil", () => {
  const schedule = {
    id: "event-without-guest",
    title: "Sans invité",
    slug: "programme-sans-invite",
    scheduled_start_time: "2026-08-12T21:30:00.000Z",
    scheduled_end_time: null,
    youtube_video_id: null,
    thumbnail_url: null,
    location: null,
    is_published: true,
  };
  assert.deepEqual(buildPublicGuestAppearances([schedule], []), []);
});

test("un profil actif sans événement conserve une liste de participations vide", () => {
  assert.ok(toPublicGuestProfile(activeProfile));
  assert.deepEqual(buildPublicGuestAppearances([], []), []);
});

test("les URL publiques dangereuses sont supprimées défensivement", () => {
  assert.equal(safePublicUrl("javascript:alert(1)"), null);
  assert.equal(safePublicUrl("data:text/html,invalid"), null);
  assert.equal(safePublicUrl("pas une url"), null);
  assert.equal(safePublicUrl("https://example.com/profile"), "https://example.com/profile");

  const profile = toPublicGuestProfile({
    ...activeProfile,
    photo_url: "javascript:alert(1)",
    instagram_url: "data:text/html,invalid",
    website_url: "https://example.com/",
  });
  assert.equal(profile.photoUrl, null);
  assert.equal(profile.instagramUrl, null);
  assert.equal(profile.websiteUrl, "https://example.com/");
});

test("les médias d’événement invalides ne deviennent pas des liens publics", () => {
  const appearances = buildPublicGuestAppearances(
    [{
      id: "event-safe-media",
      title: "Émission",
      slug: "emission",
      scheduled_start_time: "2026-08-09T21:30:00.000Z",
      scheduled_end_time: null,
      youtube_video_id: "identifiant-invalide",
      thumbnail_url: "javascript:alert(1)",
      location: null,
      is_published: true,
    }],
    [{ schedule_id: "event-safe-media", role_label: null, sort_order: 0 }],
  );
  assert.equal(appearances[0].youtubeVideoId, null);
  assert.equal(appearances[0].thumbnailUrl, null);
});
