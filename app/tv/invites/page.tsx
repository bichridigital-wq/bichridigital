import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, UserRound } from "lucide-react";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import { getActivePublicGuests } from "../../../lib/guests/public-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Invités de Bichridigital TV",
  description:
    "Découvrez les profils publics des invités des émissions de Bichridigital TV.",
  alternates: { canonical: "/tv/invites" },
  openGraph: {
    title: "Invités de Bichridigital TV",
    description:
      "Découvrez les profils publics des invités des émissions de Bichridigital TV.",
    url: "/tv/invites",
    siteName: "Bichridigital Agency",
    locale: "fr_SN",
    type: "website",
  },
};

async function loadGuests() {
  try {
    return { guests: await getActivePublicGuests(), unavailable: false };
  } catch (error) {
    console.error("[tv-guests] Chargement des profils interrompu.", {
      message: error instanceof Error ? error.message : "Erreur inconnue",
    });
    return { guests: [], unavailable: true };
  }
}

export default async function TvGuestsPage() {
  const { guests, unavailable } = await loadGuests();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#020B2E] px-6 pb-24 pt-36 text-white">
        <section className="mx-auto max-w-7xl">
          <nav className="text-sm text-white/50" aria-label="Fil d’Ariane">
            <Link href="/tv" className="transition hover:text-white">
              Bichridigital TV
            </Link>
            <span className="mx-2">/</span>
            <span className="text-white/75">Invités</span>
          </nav>

          <div className="mt-12 max-w-4xl">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-[#FCCD12]">
              Visages et voix
            </p>
            <h1 className="mt-5 text-5xl font-black tracking-tight sm:text-7xl">
              Les invités de Bichridigital TV
            </h1>
            <p className="mt-7 max-w-3xl text-lg leading-8 text-white/60">
              Retrouvez les profils publics des intervenants associés aux
              émissions de Bichridigital TV.
            </p>
          </div>

          {unavailable ? (
            <p className="mt-14 rounded-[28px] border border-white/10 bg-white/5 px-7 py-6 text-white/65">
              Les profils invités sont momentanément indisponibles.
            </p>
          ) : guests.length === 0 ? (
            <div className="mt-14 rounded-[32px] border border-white/10 bg-white/[0.035] p-10 text-center">
              <UserRound className="mx-auto h-12 w-12 text-[#FCCD12]" />
              <h2 className="mt-6 text-2xl font-black">
                Aucun profil public pour le moment
              </h2>
              <p className="mx-auto mt-4 max-w-xl leading-7 text-white/55">
                Les profils apparaîtront ici après leur activation et leur
                association à une émission depuis l’administration.
              </p>
              <Link
                href="/tv"
                className="mt-7 inline-flex items-center gap-2 rounded-full border border-[#FCCD12]/50 px-6 py-3 font-black text-[#FCCD12]"
              >
                Retour à Bichridigital TV <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {guests.map((guest) => (
                <Link
                  key={guest.id}
                  href={`/tv/invites/${guest.slug}`}
                  className="group overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.035] transition hover:-translate-y-1 hover:border-[#FCCD12]/40"
                >
                  <div className="relative aspect-[4/3] bg-[radial-gradient(circle_at_top,rgba(30,64,175,0.6),rgba(2,11,46,0.95))]">
                    {guest.photoUrl ? (
                      <Image
                        src={guest.photoUrl}
                        alt={`Photo de ${guest.fullName}`}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover"
                      />
                    ) : (
                      <UserRound className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 text-white/20" />
                    )}
                  </div>
                  <div className="p-7">
                    <h2 className="text-2xl font-black group-hover:text-[#FCCD12]">
                      {guest.fullName}
                    </h2>
                    {guest.title ? (
                      <p className="mt-2 text-white/65">{guest.title}</p>
                    ) : null}
                    {guest.specialty ? (
                      <p className="mt-4 text-sm font-black uppercase tracking-[0.14em] text-[#FCCD12]">
                        {guest.specialty}
                      </p>
                    ) : null}
                    <span className="mt-6 inline-flex items-center gap-2 font-black text-white/75">
                      Voir la fiche <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
