export const PROGRAM_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const PROGRAM_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type BroadcastProgram = {
  id: string;
  name: string;
  slug: string;
  category: string;
  defaultDescription: string | null;
  defaultThumbnailUrl: string | null;
  defaultThumbnailStoragePath: string | null;
  defaultDurationMinutes: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type BroadcastProgramInput = {
  name: string;
  slug: string;
  category: string;
  defaultDescription: string | null;
  defaultThumbnailUrl: string | null;
  defaultThumbnailStoragePath: string | null;
  defaultDurationMinutes: number;
  isActive: boolean;
  sortOrder: number;
};

export type BroadcastProgramRow = {
  id: string;
  name: string;
  slug: string;
  category: string;
  default_description: string | null;
  default_thumbnail_url: string | null;
  default_thumbnail_storage_path: string | null;
  default_duration_minutes: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ProgramActionState = {
  success: boolean;
  message: string;
};
