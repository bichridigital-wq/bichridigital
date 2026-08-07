import type { MetadataRoute } from "next";
import { getPublishedArticleSitemapRows } from "../lib/bichridigital-articles";
import { getPublicGuestSitemapRows } from "../lib/guests/public-service";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.bichridigital.com";

  const mainRoutes = [
    "",
    "/services",
    "/portfolio",
    "/boutique",
    "/tv",
    "/tv/invites",
    "/conseils",
    "/apropos",
    "/contact",
  ];

  const legalRoutes = [
    "/mentions-legales",
    "/politique-confidentialite",
  ];

  let articleRoutes: MetadataRoute.Sitemap = [];
  try {
    const articles = await getPublishedArticleSitemapRows();
    articleRoutes = articles.map((article) => ({
      url: `${baseUrl}/conseils/${article.slug}`,
      lastModified: article.published_at ?? article.updated_at,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error("Impossible de générer les URL d’articles du sitemap.", {
      message: error instanceof Error ? error.message : String(error),
      code: null,
      details: null,
      source: "Supabase",
    });
    articleRoutes = [];
  }

  let guestRoutes: MetadataRoute.Sitemap = [];
  try {
    const guests = await getPublicGuestSitemapRows();
    guestRoutes = guests.map((guest) => ({
      url: `${baseUrl}/tv/invites/${guest.slug}`,
      lastModified: guest.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
  } catch (error) {
    console.error("Impossible de générer les URL des invités du sitemap.", {
      message: error instanceof Error ? error.message : String(error),
      source: "Supabase",
    });
    guestRoutes = [];
  }

  return [
    ...mainRoutes.map((route) => ({
      url: `${baseUrl}${route}`,
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.8,
    })),

    ...legalRoutes.map((route) => ({
      url: `${baseUrl}${route}`,
      changeFrequency: "yearly" as const,
      priority: 0.4,
    })),
    ...articleRoutes,
    ...guestRoutes,
  ];
}
