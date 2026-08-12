import type { Metadata } from "next";
import TvClient from "./tv-client";
import { getLatestBichridigitalVideo } from "../../lib/youtube";
import { getPublicUpcomingSchedule } from "../../lib/schedule/service";
import TvAgenda from "./components/tv-agenda";
import { getActivePublicGuestLinks } from "../../lib/guests/public-service";

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

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function loadUpcomingSchedule() {
  try {
    const now = Date.now();
    const events = (await getPublicUpcomingSchedule())
      .filter((event) => new Date(event.scheduledStartTime).getTime() > now)
      .slice(0, 5);

    let guestProfileSlugs: Record<string, string> = {};
    try {
      guestProfileSlugs = await getActivePublicGuestLinks(
        events.flatMap((event) =>
          (event.guests ?? []).flatMap((guest) =>
            guest.guestId ? [guest.guestId] : [],
          ),
        ),
      );
    } catch (error) {
      console.error("[tv] Liens des profils invités indisponibles.", {
        message: error instanceof Error ? error.message : "Erreur inconnue",
      });
    }

    return { events, unavailable: false, guestProfileSlugs };
  } catch (error) {
    console.error("[tv] Chargement de l’agenda public interrompu.", error);
    return { events: [], unavailable: true, guestProfileSlugs: {} };
  }
}

export default async function TvPage() {
  const [video, schedule] = await Promise.all([
    getLatestBichridigitalVideo(),
    loadUpcomingSchedule(),
  ]);

  return (
    <TvClient
      videoId={video.videoId}
      title={video.title}
      agenda={
        <TvAgenda
          events={schedule.events}
          unavailable={schedule.unavailable}
          guestProfileSlugs={schedule.guestProfileSlugs}
        />
      }
    />
  );
}
