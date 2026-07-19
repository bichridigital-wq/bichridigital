export const TV_NEWS_CATEGORIES = [
  "National",
  "International",
  "Ndiagne & régions",
  "Culture",
  "Sport",
  "Urgent",
] as const;

export const TV_NEWS_PUBLIC_LIMIT = 20;

export type TvNewsCategory = (typeof TV_NEWS_CATEGORIES)[number];

export type TvNews = {
  id: string;
  title: string;
  summary: string;
  category: TvNewsCategory;
  source_name: string | null;
  source_url: string | null;
  image_url: string | null;
  is_breaking: boolean;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  notification_requested: boolean;
  notified_at: string | null;
};

export type TvNewsListItem = TvNews & {
  cover_image_url: string | null;
  media_types: string[];
};

export type TvNewsInput = {
  title: string;
  summary: string;
  category: TvNewsCategory;
  source_name: string | null;
  source_url: string | null;
  image_url: string | null;
  is_breaking: boolean;
  is_published: boolean;
  published_at: string | null;
};

export type TvNewsActionState = {
  success: boolean;
  message: string;
};
