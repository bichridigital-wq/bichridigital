import type { Metadata } from "next";
import ServicesClient from "./services-client";

const description =
  "Découvrez les services de Bichridigital Agency : communication digitale, création graphique, audiovisuel, streaming live, photographie, impression, personnalisation et développement web au Sénégal.";

export const metadata: Metadata = {
  title: "Services",

  description,

  alternates: {
    canonical: "/services",
  },

  openGraph: {
    title: "Services | Bichridigital Agency",
    description,
    url: "/services",
    siteName: "Bichridigital Agency",
    locale: "fr_SN",
    type: "website",
    images: [
      {
        url: "/icons/icon-512.png",
        width: 512,
        height: 512,
        alt: "Services de Bichridigital Agency",
      },
    ],
  },

  twitter: {
    card: "summary",
    title: "Services | Bichridigital Agency",
    description,
    images: ["/icons/icon-512.png"],
  },
};

export default function ServicesPage() {
  return <ServicesClient />;
}