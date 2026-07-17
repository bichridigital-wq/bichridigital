import type { Metadata } from "next";
import PortfolioClient from "./portfolio-client";

const description =
  "Découvrez les réalisations de Bichridigital Agency : affiches, miniatures YouTube, visuels événementiels, productions audiovisuelles, designs graphiques et projets digitaux.";

export const metadata: Metadata = {
  title: "Portfolio",

  description,

  alternates: {
    canonical: "/portfolio",
  },

  openGraph: {
    title: "Portfolio | Bichridigital Agency",
    description,
    url: "/portfolio",
    siteName: "Bichridigital Agency",
    locale: "fr_SN",
    type: "website",
    images: [
      {
        url: "/icons/icon-512.png",
        width: 512,
        height: 512,
        alt: "Portfolio et réalisations de Bichridigital Agency",
      },
    ],
  },

  twitter: {
    card: "summary",
    title: "Portfolio | Bichridigital Agency",
    description,
    images: ["/icons/icon-512.png"],
  },
};

export default function PortfolioPage() {
  return <PortfolioClient />;
}