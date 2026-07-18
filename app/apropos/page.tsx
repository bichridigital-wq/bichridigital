import type { Metadata } from "next";
import AproposClient from "./apropos-client";

const description =
  "Découvrez Bichridigital Agency, agence de communication digitale basée à Ndiagne, Louga, Sénégal, spécialisée en audiovisuel, streaming live, photographie, design graphique, impression et développement web.";

export const metadata: Metadata = {
  title: "À propos",

  description,

  alternates: {
    canonical: "/apropos",
  },

  openGraph: {
    title: "À propos | Bichridigital Agency",
    description:
      "Bichridigital Agency accompagne entreprises, associations, institutions, événements et particuliers dans leur communication depuis 2019.",
    url: "/apropos",
    siteName: "Bichridigital Agency",
    locale: "fr_SN",
    type: "website",
    images: [
      {
        url: "/icons/icon-512.png",
        width: 512,
        height: 512,
        alt: "À propos de Bichridigital Agency",
      },
    ],
  },

  twitter: {
    card: "summary",
    title: "À propos | Bichridigital Agency",
    description,
    images: ["/icons/icon-512.png"],
  },
};

export default function AproposPage() {
  return <AproposClient />;
}