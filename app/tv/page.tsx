import type { Metadata } from "next";
import { getPublishedTvNews } from "../../lib/tv-news";
import TvClient from "./tv-client";
import { getLatestBichridigitalVideo } from "../../lib/youtube";

const description =
  "Regardez Bichridigital TV : émissions, directs, interviews, programmes culturels, religieux et rediffusions de Bichridigital au Sénégal.";

const socialDescription =
  "Suivez les émissions, directs, interviews, programmes culturels et religieux, ainsi que les rediffusions de Bichridigital TV au Sénégal.";

export const metadata: Metadata = {
  title: "Bichridigital TV",

  description,

  alternates: {
    canonical: "/tv",
  },

  openGraph: {
    title: "Bichridigital TV | Émissions, directs et rediffusions",
    description: socialDescription,
    url: "/tv",
    siteName: "Bichridigital Agency",
    locale: "fr_SN",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 1920,
        height: 1080,
        alt: "Bichridigital TV, émissions, directs et rediffusions",
      },
    ],
  },

  twitter: {
    card: "summary",
    title: "Bichridigital TV | Émissions, directs et rediffusions",
    description: socialDescription,
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
