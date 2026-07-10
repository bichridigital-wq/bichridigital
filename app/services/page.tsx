import type { Metadata } from "next";
import ServicesClient from "./services-client";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Découvrez les services de Bichridigital Agency : communication digitale, création graphique, audiovisuel, streaming live, photographie, impression, personnalisation et développement web au Sénégal.",
  alternates: {
    canonical: "/services",
  },
  openGraph: {
    title: "Services | Bichridigital Agency",
    description:
      "Communication digitale, audiovisuel, streaming live, photographie, design graphique, impression et développement web au Sénégal.",
    url: "https://bichridigital.com/services",
    images: ["/icons/icon-512.png"],
  },
};

export default function ServicesPage() {
  return <ServicesClient />;
}