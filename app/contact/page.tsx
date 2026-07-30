import type { Metadata } from "next";
import ContactClient from "./contact-client";

const description =
  "Contactez Bichridigital Agency à Ndiagne, Louga, Sénégal pour vos projets de communication digitale, audiovisuel, streaming live, photographie, impression, personnalisation et développement web.";

const socialDescription =
  "Besoin d’une affiche, d’un live, d’une vidéo, d’un site web, d’un shooting photo ou d’un support personnalisé ? Contactez Bichridigital Agency.";

export const metadata: Metadata = {
  title: "Contact",

  description,

  alternates: {
    canonical: "/contact",
  },

  openGraph: {
    title: "Contact | Bichridigital Agency",
    description: socialDescription,
    url: "/contact",
    siteName: "Bichridigital Agency",
    locale: "fr_SN",
    type: "website",
    images: [
      {
        url: "/icons/icon-512.png",
        width: 512,
        height: 512,
        alt: "Contacter Bichridigital Agency",
      },
    ],
  },

  twitter: {
    card: "summary",
    title: "Contact | Bichridigital Agency",
    description: socialDescription,
    images: ["/icons/icon-512.png"],
  },
};

export default function ContactPage() {
  return <ContactClient />;
}
