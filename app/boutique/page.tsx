import type { Metadata } from "next";
import BoutiqueClient from "./boutique-client";

const description =
  "BichriStore, la boutique de Bichridigital Agency : ordinateurs, t-shirts, pulls, casquettes, articles personnalisés, tableaux muraux et supports de communication.";

export const metadata: Metadata = {
  title: "Boutique",

  description,

  alternates: {
    canonical: "/boutique",
  },

  openGraph: {
    title: "Boutique | Bichridigital Agency",
    description,
    url: "/boutique",
    siteName: "Bichridigital Agency",
    locale: "fr_SN",
    type: "website",
    images: [
      {
        url: "/icons/icon-512.png",
        width: 512,
        height: 512,
        alt: "BichriStore, boutique de Bichridigital Agency",
      },
    ],
  },

  twitter: {
    card: "summary",
    title: "Boutique | Bichridigital Agency",
    description,
    images: ["/icons/icon-512.png"],
  },
};

export default function BoutiquePage() {
  return <BoutiqueClient />;
}