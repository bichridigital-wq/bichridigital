import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Bichridigital Agency",
    short_name: "Bichridigital",
    description:
      "Application officielle de Bichridigital Agency : communication digitale, audiovisuel, streaming live, photographie, impression et développement web au Sénégal.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#020B2E",
    theme_color: "#020B2E",
    categories: ["business", "photo", "productivity"],
    lang: "fr",
    icons: [
      {
        src: "/logo.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}