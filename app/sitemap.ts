import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.bichridigital.com";

  const mainRoutes = [
    "",
    "/services",
    "/portfolio",
    "/boutique",
    "/apropos",
    "/contact",
  ];

  const legalRoutes = [
    "/mentions-legales",
    "/politique-confidentialite",
  ];

  return [
    ...mainRoutes.map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.8,
    })),

    ...legalRoutes.map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.4,
    })),
  ];
}