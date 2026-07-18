import type { Metadata } from "next";
import ContactClient from "./contact-client";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contactez Bichridigital Agency à Ndiagne, Louga, Sénégal pour vos projets de communication digitale, audiovisuel, streaming live, photographie, impression, personnalisation et développement web.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact | Bichridigital Agency",
    description:
      "Besoin d’une affiche, d’un live, d’une vidéo, d’un site web, d’un shooting photo ou d’un support personnalisé ? Contactez Bichridigital Agency.",
    url: "https://www.bichridigital.com/contact",
    images: ["/icons/icon-512.png"],
  },
  twitter: {
    card: "summary",
    title: "Contact | Bichridigital Agency",
    description:
      "Besoin d’une affiche, d’un live, d’une vidéo, d’un site web, d’un shooting photo ou d’un support personnalisé ? Contactez Bichridigital Agency.",
    images: ["/icons/icon-512.png"],
  },
};

export default function ContactPage() {
  return <ContactClient />;
}
