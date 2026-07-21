export const TV_NEWS_MEDIA_BUCKET = "tv-news-media";
export const TV_NEWS_MEDIA_MAX_COUNT = 10;
export const TV_NEWS_TUS_THRESHOLD = 6 * 1024 * 1024;

export const TV_NEWS_MEDIA_LIMITS = {
  image: 8 * 1024 * 1024,
  pdf: 20 * 1024 * 1024,
  audio: 20 * 1024 * 1024,
  video: 50 * 1024 * 1024,
} as const;

export const TV_NEWS_ALLOWED_MIME_TYPES = {
  "image/jpeg": "image",
  "image/png": "image",
  "image/webp": "image",
  "application/pdf": "pdf",
  "audio/mpeg": "audio",
  "audio/mp4": "audio",
  "video/mp4": "video",
  "video/webm": "video",
} as const;

export type TvNewsUploadedMediaType =
  (typeof TV_NEWS_ALLOWED_MIME_TYPES)[keyof typeof TV_NEWS_ALLOWED_MIME_TYPES];
export type TvNewsMediaType = TvNewsUploadedMediaType | "youtube";

export type TvNewsMedia = {
  id: string;
  news_id: string;
  media_type: TvNewsMediaType;
  storage_path: string | null;
  external_url: string | null;
  file_name: string;
  mime_type: string | null;
  file_size: number | null;
  title: string | null;
  alt_text: string | null;
  sort_order: number;
  is_cover: boolean;
  created_at: string;
};

export type AdminTvNewsMedia = TvNewsMedia & {
  signed_url: string | null;
};

export type PublicTvNewsMedia = Pick<
  TvNewsMedia,
  | "id"
  | "media_type"
  | "file_name"
  | "mime_type"
  | "file_size"
  | "title"
  | "alt_text"
  | "sort_order"
  | "is_cover"
> & {
  url: string;
  youtube_embed_url: string | null;
};

export type RegisterUploadedMediaInput = {
  newsId: string;
  storagePath: string;
  fileName: string;
  mimeType: string;
  expectedSize: number;
  title?: string;
  altText?: string;
  isCover?: boolean;
};

export function getMediaTypeFromMime(
  mimeType: string
): TvNewsUploadedMediaType | null {
  return (
    TV_NEWS_ALLOWED_MIME_TYPES[
      mimeType as keyof typeof TV_NEWS_ALLOWED_MIME_TYPES
    ] ?? null
  );
}

export function sanitizeMediaFileName(fileName: string) {
  const normalized = fileName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);

  return normalized || "fichier";
}

export function validateMediaFileMetadata(file: {
  name: string;
  type: string;
  size: number;
}) {
  const mediaType = getMediaTypeFromMime(file.type);

  if (!mediaType) {
    throw new Error(`Type de fichier interdit ou inconnu : ${file.name}`);
  }

  const limit = TV_NEWS_MEDIA_LIMITS[mediaType];

  if (file.size <= 0 || file.size > limit) {
    throw new Error(
      `${file.name} dépasse la limite autorisée pour le type ${mediaType}.`
    );
  }

  return mediaType;
}

export async function hasAllowedFileSignature(file: Blob, mimeType: string) {
  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const starts = (...values: number[]) =>
    values.every((value, index) => bytes[index] === value);
  const text = new TextDecoder("latin1").decode(bytes);

  switch (mimeType) {
    case "image/jpeg":
      return starts(0xff, 0xd8, 0xff);
    case "image/png":
      return starts(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a);
    case "image/webp":
      return text.startsWith("RIFF") && text.slice(8, 12) === "WEBP";
    case "application/pdf":
      return text.startsWith("%PDF-");
    case "audio/mpeg":
      return text.startsWith("ID3") || (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0);
    case "audio/mp4":
    case "video/mp4":
      return text.slice(4, 8) === "ftyp";
    case "video/webm":
      return starts(0x1a, 0x45, 0xdf, 0xa3);
    default:
      return false;
  }
}
