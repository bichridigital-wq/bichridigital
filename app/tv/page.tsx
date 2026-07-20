import type { Metadata } from "next";
import { getPublishedTvNews } from "../../lib/tv-news";
import TvClient from "./tv-client";
import { getLatestBichridigitalVideo } from "../../lib/youtube";

const description =
  "Regardez Bichridigital TV : directs, émissions, reportages, interviews et contenus audiovisuels produits par Bichridigital Agency.";

export const metadata: Metadata = {
  title: "Bichridigital TV",
  description,
  alternates: {
    canonical: "/tv",
  },
  openGraph: {
    title: "Bichridigital TV | Bichridigital Agency",
    description,
    url: "https://www.bichridigital.com/tv",
    siteName: "Bichridigital Agency",
    locale: "fr_SN",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Bichridigital TV",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bichridigital TV | Bichridigital Agency",
    description,
    images: ["/logo.png"],
  },
};

export default async function TvPage() {
  const [news, video] = await Promise.all([
    getPublishedTvNews(),
    getLatestBichridigitalVideo(),
  ]);

  return <TvClient initialNews={news} videoId={video.videoId} title={video.title} />;
}
