import "server-only";

import { cache } from "react";
import { createAdminClient } from "../supabase/admin";
import type {
  PublicGuestAppearance,
  PublicGuestProfile,
  PublicGuestSitemapRow,
} from "../../types/guest";
import {
  buildPublicGuestAppearances,
  buildPublicGuestLinks,
  isPublicGuestSlug,
  type PublicAppearanceAssociationRow,
  type PublicAppearanceScheduleRow,
  type PublicGuestProfileRow,
  toPublicGuestProfile,
} from "./public-profiles";
import {
  selectActivePublicGuestBySlug,
  selectActivePublicGuestLinks,
  selectActivePublicGuestSitemapRows,
  selectActivePublicGuests,
  selectPublicGuestAssociations,
  selectPublishedScheduleByIds,
} from "./public-repository";

function rows(value: unknown): PublicGuestProfileRow[] {
  return Array.isArray(value) ? (value as PublicGuestProfileRow[]) : [];
}

export async function getActivePublicGuests(): Promise<PublicGuestProfile[]> {
  const { data, error } = await selectActivePublicGuests(createAdminClient());
  if (error) throw new Error("Impossible de charger les profils invités.");
  return rows(data)
    .map(toPublicGuestProfile)
    .filter((guest): guest is PublicGuestProfile => guest !== null);
}

export async function getActivePublicGuestLinks(guestIds: string[]) {
  const uniqueIds = [...new Set(guestIds)];
  if (uniqueIds.length === 0) return {};
  const { data, error } = await selectActivePublicGuestLinks(
    createAdminClient(),
    uniqueIds,
  );
  if (error) throw new Error("Impossible de charger les liens invités.");
  return buildPublicGuestLinks(rows(data));
}

async function getPublishedGuestAppearances(
  guestId: string,
): Promise<PublicGuestAppearance[]> {
  const supabase = createAdminClient();
  const { data: associationData, error: associationError } =
    await selectPublicGuestAssociations(supabase, guestId);
  if (associationError) throw new Error("Impossible de charger les participations.");
  const associations = Array.isArray(associationData)
    ? (associationData as PublicAppearanceAssociationRow[])
    : [];
  if (associations.length === 0) return [];

  const { data: scheduleData, error: scheduleError } =
    await selectPublishedScheduleByIds(
      supabase,
      associations.map((association) => association.schedule_id),
    );
  if (scheduleError) throw new Error("Impossible de charger les émissions.");
  const schedules = Array.isArray(scheduleData)
    ? (scheduleData as PublicAppearanceScheduleRow[])
    : [];
  return buildPublicGuestAppearances(schedules, associations);
}

export const getActivePublicGuestPage = cache(async function getActivePublicGuestPage(
  slug: string,
): Promise<{
  guest: PublicGuestProfile;
  appearances: PublicGuestAppearance[];
} | null> {
  if (!isPublicGuestSlug(slug)) return null;
  const { data, error } = await selectActivePublicGuestBySlug(
    createAdminClient(),
    slug,
  );
  if (error) throw new Error("Impossible de charger ce profil invité.");
  if (!data) return null;
  const guest = toPublicGuestProfile(data as PublicGuestProfileRow);
  if (!guest) return null;
  return {
    guest,
    appearances: await getPublishedGuestAppearances(guest.id),
  };
});

export async function getPublicGuestSitemapRows(): Promise<
  PublicGuestSitemapRow[]
> {
  const { data, error } = await selectActivePublicGuestSitemapRows(
    createAdminClient(),
  );
  if (error) throw new Error("Impossible de charger le sitemap des invités.");
  const sitemapRows = Array.isArray(data)
    ? (data as Array<{ slug: string; updated_at: string }>)
    : [];
  return sitemapRows
    .filter((row) => isPublicGuestSlug(row.slug))
    .map((row) => ({ slug: row.slug, updatedAt: row.updated_at }));
}
