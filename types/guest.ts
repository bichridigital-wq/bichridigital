export const GUEST_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const GUEST_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type BroadcastGuest = {
  id: string;
  fullName: string;
  slug: string;
  title: string | null;
  shortBio: string | null;
  specialty: string | null;
  photoUrl: string | null;
  photoStoragePath: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  youtubeUrl: string | null;
  websiteUrl: string | null;
  isActive: boolean;
  sortOrder: number;
  linkedEventCount: number;
  createdAt: string;
  updatedAt: string;
};

export type BroadcastGuestFormValues = Omit<
  BroadcastGuest,
  "id" | "linkedEventCount" | "createdAt" | "updatedAt"
>;

export type BroadcastGuestRow = {
  id: string;
  full_name: string;
  slug: string;
  title: string | null;
  short_bio: string | null;
  specialty: string | null;
  photo_url: string | null;
  photo_storage_path: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  youtube_url: string | null;
  website_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  broadcast_schedule_guests?: Array<{ count: number }>;
};

export type BroadcastScheduleGuest = {
  id: string;
  scheduleId: string;
  guestId: string | null;
  guestNameSnapshot: string;
  guestTitleSnapshot: string | null;
  guestPhotoUrlSnapshot: string | null;
  roleLabel: string | null;
  sortOrder: number;
};

export type BroadcastScheduleGuestRow = {
  id: string;
  schedule_id: string;
  guest_id: string | null;
  guest_name_snapshot: string;
  guest_title_snapshot: string | null;
  guest_photo_url_snapshot: string | null;
  role_label: string | null;
  sort_order: number;
};

export type GuestSelection = {
  associationId: string | null;
  guestId: string | null;
  fullName: string;
  title: string | null;
  photoUrl: string | null;
  roleLabel: string | null;
  sortOrder: number;
  isActive: boolean;
  refreshSnapshot: boolean;
};

export type GuestActionState = {
  success: boolean;
  message: string;
};

export type GuestValidationError = {
  field: string;
  message: string;
};

export type PublicGuestProfile = {
  id: string;
  fullName: string;
  slug: string;
  title: string | null;
  shortBio: string | null;
  specialty: string | null;
  photoUrl: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  youtubeUrl: string | null;
  websiteUrl: string | null;
};

export type PublicGuestAppearance = {
  eventId: string;
  title: string;
  slug: string | null;
  scheduledStartTime: string;
  scheduledEndTime: string | null;
  youtubeVideoId: string | null;
  thumbnailUrl: string | null;
  location: string | null;
  role: string | null;
};

export type PublicGuestSitemapRow = {
  slug: string;
  updatedAt: string;
};
