import type { Metadata } from "next";
import HomeClient from "./home-client";

const description =
  "Bichridigital Agency accompagne entreprises, institutions, associations, événements et particuliers en communication digitale, audiovisuel, photographie, streaming live, design graphique, impression et développement web au Sénégal.";

const socialDescription =
  "Découvrez Bichridigital Agency, votre partenaire en communication digitale, audiovisuel, photographie, streaming live, design, impression et développement web au Sénégal.";

export const metadata: Metadata = {
  title: {
    absolute: "Bichridigital Agency | Communication digitale au Sénégal",
  },
  description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Bichridigital Agency | Votre histoire, image par image",
    description: socialDescription,
    url: "/",
    siteName: "Bichridigital Agency",
    locale: "fr_SN",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 1920,
        height: 1080,
        alt: "Bichridigital Agency, agence de communication digitale au Sénégal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bichridigital Agency | Communication digitale au Sénégal",
    description: socialDescription,
    images: ["/logo.png"],
  },
};

export default function HomePage() {
  return <HomeClient />;
}
