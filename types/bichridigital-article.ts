export const ARTICLE_MEDIA_BUCKET = "bichridigital-article-media";
export const ARTICLE_PUBLIC_LIMIT = 10;
export const ARTICLE_IMAGE_MAX_BYTES = 8 * 1024 * 1024;
export const ARTICLE_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export const ARTICLE_CATEGORIES = [
  "communication-digitale",
  "audiovisuel-streaming",
  "photographie",
  "design-graphique",
  "web-seo",
  "coulisses-bichridigital",
] as const;

export type ArticleCategory = (typeof ARTICLE_CATEGORIES)[number];

export const ARTICLE_CATEGORY_LABELS: Record<ArticleCategory, string> = {
  "communication-digitale": "Communication digitale",
  "audiovisuel-streaming": "Audiovisuel & streaming",
  photographie: "Photographie",
  "design-graphique": "Design graphique",
  "web-seo": "Web & SEO",
  "coulisses-bichridigital": "Coulisses Bichridigital",
};

export type BichridigitalArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: ArticleCategory;
  author_name: string;
  cover_storage_path: string | null;
  cover_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
  is_featured: boolean;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ArticleActionResult = {
  success: boolean;
  message: string;
  articleId?: string;
};
