import type { Metadata } from "next";
import AproposClient from "./apropos-client";

export const metadata: Metadata = {
  title: "À propos",
  description:
    "Découvrez Bichridigital Agency, agence de communication digitale basée à Ndiagne, Louga, Sénégal, spécialisée en audiovisuel, streaming live, photographie, design graphique, impression et développement web.",
  alternates: {
    canonical: "/apropos",
  },
  openGraph: {
    title: "À propos | Bichridigital Agency",
    description:
      "Bichridigital Agency accompagne entreprises, associations, institutions, événements et particuliers dans leur communication depuis 2019.",
    url: "https://bichridigital.com/apropos",
    images: ["/icons/icon-512.png"],
  },
};

export default function AproposPage() {
  return <AproposClient />;
}