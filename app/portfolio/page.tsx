import type { Metadata } from "next";
import PortfolioClient from "./portfolio-client";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "Découvrez les réalisations de Bichridigital Agency : affiches, miniatures YouTube, visuels événementiels, productions audiovisuelles, designs graphiques et projets digitaux.",
  alternates: {
    canonical: "/portfolio",
  },
  openGraph: {
    title: "Portfolio | Bichridigital Agency",
    description:
      "Réalisations graphiques, audiovisuelles et digitales de Bichridigital Agency.",
    url: "https://bichridigital.com/portfolio",
    images: ["/icons/icon-512.png"],
  },
};

export default function PortfolioPage() {
  return <PortfolioClient />;
}