export const SCHEDULE_STATUSES = [
  "scheduled",
  "cancelled",
  "completed",
] as const;

export const SCHEDULE_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const SCHEDULE_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type ScheduleStatus = (typeof SCHEDULE_STATUSES)[number];

export type PublicScheduleEvent = {
  id: string;
  title: string;
  slug: string | null;
  description: string | null;
  category: string | null;
  scheduledStartTime: string;
  scheduledEndTime: string | null;
  status: ScheduleStatus;
  youtubeVideoId: string | null;
  thumbnailUrl: string | null;
  location: string | null;
};

export type AdminScheduleEvent = PublicScheduleEvent & {
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateScheduleEventInput = {
  title: string;
  slug: string | null;
  description: string | null;
  category: string | null;
  scheduledStartTime: string;
  scheduledEndTime: string | null;
  status: ScheduleStatus;
  youtubeVideoId: string | null;
  thumbnailUrl: string | null;
  location: string | null;
  isPublished: boolean;
};

export type UpdateScheduleEventInput = CreateScheduleEventInput;

export type ScheduleActionState = {
  success: boolean;
  message: string;
};

export type ScheduleRow = {
  id: string;
  title: string;
  slug: string | null;
  description: string | null;
  category: string | null;
  scheduled_start_time: string;
  scheduled_end_time: string | null;
  status: ScheduleStatus;
  youtube_video_id: string | null;
  thumbnail_url: string | null;
  location: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};
