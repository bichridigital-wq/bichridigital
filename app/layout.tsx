import type { Metadata } from "next";
import "./globals.css";
import ServiceWorkerRegister from "./components/service-worker-register";

export const metadata: Metadata = {
  metadataBase: new URL("https://bichridigital.com"),
  manifest: "/manifest.webmanifest",

  title: {
    default: "Bichridigital Agency | Communication digitale au Sénégal",
    template: "%s | Bichridigital Agency",
  },

  description:
    "Bichridigital Agency est une agence de communication digitale, audiovisuelle, photographie, streaming live, design graphique, impression et développement web basée à Ndiagne, Louga, Sénégal.",

  keywords: [
    "Bichridigital",
    "Bichridigital Agency",
    "agence digitale Sénégal",
    "communication digitale Sénégal",
    "streaming live Sénégal",
    "photographie Sénégal",
    "développement web Sénégal",
    "création site web Sénégal",
    "design graphique Sénégal",
    "impression numérique Sénégal",
    "Dakar",
    "Thies",
    "Ndiagne",
    "Louga",
  ],

  authors: [{ name: "Bichridigital Agency" }],
  creator: "Bichridigital Agency",
  publisher: "Bichridigital Agency",
  applicationName: "Bichridigital",
  category: "Communication digitale",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    title: "Bichridigital Agency | Votre histoire, image par image",
    description:
      "Agence de communication digitale, audiovisuelle, photographie, streaming live, design graphique, impression et développement web au Sénégal.",
    url: "https://bichridigital.com",
    siteName: "Bichridigital Agency",
    locale: "fr_SN",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Bichridigital Agency",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Bichridigital Agency",
    description:
      "Communication digitale, audiovisuel, streaming live, photographie, impression et développement web au Sénégal.",
    images: ["/logo.png"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

icons: {
  icon: "/icons/icon-192.png",
  shortcut: "/icons/icon-192.png",
  apple: "/icons/icon-512.png",
},
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
 return (
  <html lang="fr">
    <body>
      <ServiceWorkerRegister />
      {children}
    </body>
  </html>
);
}