import type { Metadata } from "next";
import BoutiqueClient from "./boutique-client";

export const metadata: Metadata = {
  title: "Boutique",
  description:
    "BichriStore, la boutique de Bichridigital Agency : ordinateurs, t-shirts, pulls, casquettes, articles personnalisés, tableaux muraux et supports de communication.",
  alternates: {
    canonical: "/boutique",
  },
  openGraph: {
    title: "Boutique | Bichridigital Agency",
    description:
      "Ordinateurs, textile personnalisé, casquettes, pulls, tableaux muraux et supports de communication par Bichridigital Agency.",
    url: "https://bichridigital.com/boutique",
    images: ["/icons/icon-512.png"],
  },
};

export default function BoutiquePage() {
  return <BoutiqueClient />;
}