import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CalendarDays, ExternalLink, MapPin, UserRound } from "lucide-react";
import { notFound } from "next/navigation";
import Navbar from "../../../components/navbar";
import Footer from "../../../components/footer";
import { getActivePublicGuestPage } from "../../../../lib/guests/public-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = { params: Promise<{ slug: string }> };
const BASE_URL = "https://www.bichridigital.com";
const DAKAR_TIME_ZONE = "Africa/Dakar";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
    timeZone: DAKAR_TIME_ZONE,
  }).format(new Date(value));
}

function metadataDescription(value: string) {
  return value.length <= 260 ? value : `${value.slice(0, 257).trimEnd()}…`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await getActivePublicGuestPage(slug);
  if (!page) {
    return {
      title: "Invité introuvable",
      robots: { index: false, follow: false },
    };
  }
  const { guest } = page;
  const description = metadataDescription(
    guest.shortBio ??
      `Découvrez le profil public de ${guest.fullName} sur Bichridigital TV.`,
  );
  const url = `/tv/invites/${guest.slug}`;
  return {
    title: `${guest.fullName} | Bichridigital TV`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${guest.fullName} | Bichridigital TV`,
      description,
      url,
      siteName: "Bichridigital Agency",
      locale: "fr_SN",
      type: "profile",
      images: guest.photoUrl
        ? [{ url: guest.photoUrl, alt: `Photo de ${guest.fullName}` }]
        : undefined,
    },
    twitter: {
      card: guest.photoUrl ? "summary_large_image" : "summary",
      title: `${guest.fullName} | Bichridigital TV`,
      description,
      images: guest.photoUrl ? [guest.photoUrl] : undefined,
    },
  };
}

export default async function TvGuestPage({ params }: Props) {
  const { slug } = await params;
  const page = await getActivePublicGuestPage(slug);
  if (!page) notFound();
  const { guest, appearances } = page;
  const sameAs = [
    guest.instagramUrl,
    guest.facebookUrl,
    guest.youtubeUrl,
    guest.websiteUrl,
  ].filter((url): url is string => Boolean(url));
  const personLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: guest.fullName,
    url: `${BASE_URL}/tv/invites/${guest.slug}`,
    image: guest.photoUrl ?? undefined,
    jobTitle: guest.title ?? undefined,
    description: guest.shortBio ?? undefined,
    sameAs: sameAs.length > 0 ? sameAs : undefined,
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#020B2E] px-6 pb-24 pt-36 text-white">
        <article className="mx-auto max-w-7xl">
          <nav className="flex flex-wrap items-center gap-2 text-sm text-white/50" aria-label="Fil d’Ariane">
            <Link href="/tv">Bichridigital TV</Link>
            <span>/</span>
            <Link href="/tv/invites">Invités</Link>
            <span>/</span>
            <span className="text-white/75">{guest.fullName}</span>
          </nav>

          <header className="mt-12 grid items-center gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="relative aspect-square overflow-hidden rounded-[36px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(30,64,175,0.65),rgba(2,11,46,0.95))]">
              {guest.photoUrl ? (
                <Image
                  src={guest.photoUrl}
                  alt={`Photo de ${guest.fullName}`}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  className="object-cover"
                />
              ) : (
                <UserRound className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 text-white/20" />
              )}
            </div>

            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-[#FCCD12]">
                Invité Bichridigital TV
              </p>
              <h1 className="mt-5 text-5xl font-black leading-tight sm:text-7xl">
                {guest.fullName}
              </h1>
              {guest.title ? (
                <p className="mt-5 text-2xl font-bold text-white/75">{guest.title}</p>
              ) : null}
              {guest.specialty ? (
                <p className="mt-5 inline-flex rounded-full border border-[#FCCD12]/35 bg-[#FCCD12]/10 px-5 py-2 text-sm font-black uppercase tracking-[0.14em] text-[#FCCD12]">
                  {guest.specialty}
                </p>
              ) : null}
              {guest.shortBio ? (
                <p className="mt-8 whitespace-pre-line text-lg leading-8 text-white/65">
                  {guest.shortBio}
                </p>
              ) : null}

              {sameAs.length > 0 ? (
                <div className="mt-8 flex flex-wrap gap-3">
                  {[
                    ["Instagram", guest.instagramUrl],
                    ["Facebook", guest.facebookUrl],
                    ["YouTube", guest.youtubeUrl],
                    ["Site web", guest.websiteUrl],
                  ].map(([label, url]) =>
                    url ? (
                      <a
                        key={label}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 font-bold transition hover:border-[#FCCD12] hover:text-[#FCCD12]"
                      >
                        {label} <ExternalLink className="h-4 w-4" />
                      </a>
                    ) : null,
                  )}
                </div>
              ) : null}
            </div>
          </header>

          {appearances.length > 0 ? (
            <section
              className="mt-24 border-t border-white/10 pt-14"
              aria-labelledby="appearances-title"
            >
              <p className="text-sm font-black uppercase tracking-[0.2em] text-[#FCCD12]">
                Participations publiées
              </p>
              <h2 id="appearances-title" className="mt-4 text-4xl font-black">
                Émissions et rendez-vous
              </h2>
              <div className="mt-10 grid gap-6 md:grid-cols-2">
                {appearances.map((appearance) => (
                  <article key={appearance.eventId} className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.035]">
                    {appearance.thumbnailUrl ? (
                      <div className="relative aspect-video">
                        <Image
                          src={appearance.thumbnailUrl}
                          alt={`Miniature de ${appearance.title}`}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover"
                        />
                      </div>
                    ) : null}
                    <div className="p-7">
                      <h3 className="text-2xl font-black">{appearance.title}</h3>
                      {appearance.role ? (
                        <p className="mt-3 font-bold text-[#FCCD12]">{appearance.role}</p>
                      ) : null}
                      <p className="mt-5 flex items-center gap-2 text-sm text-white/60">
                        <CalendarDays className="h-4 w-4" />
                        <time dateTime={appearance.scheduledStartTime}>
                          {formatDate(appearance.scheduledStartTime)}
                        </time>
                      </p>
                      {appearance.location ? (
                        <p className="mt-3 flex items-center gap-2 text-sm text-white/50">
                          <MapPin className="h-4 w-4" /> {appearance.location}
                        </p>
                      ) : null}
                      {appearance.youtubeVideoId ? (
                        <a
                          href={`https://www.youtube.com/watch?v=${appearance.youtubeVideoId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-6 inline-flex items-center gap-2 font-black text-[#FCCD12]"
                        >
                          Voir sur YouTube <ExternalLink className="h-4 w-4" />
                        </a>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          <Link href="/tv/invites" className="mt-16 inline-flex items-center gap-2 font-black text-white/65 hover:text-[#FCCD12]">
            <ArrowLeft className="h-4 w-4" /> Tous les invités
          </Link>
        </article>
        <script type="application/ld+json">
          {JSON.stringify(personLd).replace(/</g, "\\u003c")}
        </script>
      </main>
      <Footer />
    </>
  );
}
