import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  Clock3,
  MapPin,
  Play,
  UserRound,
} from "lucide-react";
import type {
  PublicScheduleEvent,
  PublicScheduleGuest,
} from "../../../types/schedule";
import { getPublicGuestHref } from "../../../lib/guests/public-profiles";
import TvCountdown from "./tv-countdown";

const DAKAR_TIME_ZONE = "Africa/Dakar";
const PUBLIC_SHOW_SLUGS = new Set([
  "li-ci-biir-ndiagne",
  "jotaayu-bichri",
  "talaatay-cheikh-ibra",
  "firi-gent",
  "xamxamu-cosaan",
  "seen-wergu-yaram",
  "ettu-jigeen-ni",
  "ettu-sport",
  "demb-ak-tay",
  "na-nuko-waxtane",
  "entretien-special",
]);

function capitalize(value: string) {
  return value.charAt(0).toLocaleUpperCase("fr-FR") + value.slice(1);
}

function formatDate(value: string, includeYear = true) {
  return capitalize(
    new Intl.DateTimeFormat("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: includeYear ? "numeric" : undefined,
      timeZone: DAKAR_TIME_ZONE,
    }).format(new Date(value)),
  );
}

function formatTime(value: string) {
  const parts = new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: DAKAR_TIME_ZONE,
  }).formatToParts(new Date(value));
  const hour = parts.find((part) => part.type === "hour")?.value ?? "00";
  const minute = parts.find((part) => part.type === "minute")?.value ?? "00";
  return `${hour}h${minute}`;
}

function EventImage({ event, sizes }: { event: PublicScheduleEvent; sizes: string }) {
  return (
    <div className="relative aspect-video overflow-hidden bg-[radial-gradient(circle_at_top,rgba(30,64,175,0.65),rgba(2,11,46,0.95))]">
      {event.thumbnailUrl ? (
        <Image
          src={event.thumbnailUrl}
          alt={`Miniature de ${event.title}`}
          fill
          sizes={sizes}
          className="object-cover"
        />
      ) : (
        <div className="flex h-full items-center justify-center px-6 text-center text-sm font-black uppercase tracking-[0.2em] text-white/35">
          Bichridigital TV
        </div>
      )}
    </div>
  );
}

function EventGuests({
  guests = [],
  guestProfileSlugs,
}: {
  guests?: PublicScheduleGuest[];
  guestProfileSlugs: Record<string, string>;
}) {
  if (guests.length === 0) return null;

  const visibleGuests = guests.slice(0, 2);
  const remainingCount = guests.length - visibleGuests.length;

  return (
    <div
      className="mt-6 flex flex-wrap items-center gap-3"
      aria-label="Invités du programme"
    >
      {visibleGuests.map((guest) => {
        const detail = guest.role ?? guest.title;
        const href = getPublicGuestHref(guest.guestId, guestProfileSlugs);
        return (
          <div
            key={guest.id}
            className="flex min-w-0 max-w-full items-center gap-3 rounded-full border border-white/10 bg-white/5 py-2 pl-2 pr-4"
          >
            {guest.photoUrl ? (
              <Image
                src={guest.photoUrl}
                alt={`Photo de ${guest.name}`}
                width={40}
                height={40}
                sizes="40px"
                className="h-10 w-10 shrink-0 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1E40AF]/45 text-[#FCCD12]">
                <UserRound className="h-5 w-5" aria-hidden="true" />
              </span>
            )}
            <span className="min-w-0">
              {href ? (
                <Link
                  href={href}
                  className="block truncate text-sm font-black text-white underline-offset-4 hover:text-[#FCCD12] hover:underline"
                >
                  {guest.name}
                </Link>
              ) : (
                <span className="block truncate text-sm font-black text-white">
                  {guest.name}
                </span>
              )}
              {detail ? (
                <span className="block truncate text-xs text-white/55">
                  {detail}
                </span>
              ) : null}
            </span>
          </div>
        );
      })}
      {remainingCount > 0 ? (
        <span className="text-sm font-bold text-white/60">
          +{remainingCount} invité{remainingCount > 1 ? "s" : ""}
        </span>
      ) : null}
    </div>
  );
}

function MainEvent({
  event,
  guestProfileSlugs,
}: {
  event: PublicScheduleEvent;
  guestProfileSlugs: Record<string, string>;
}) {
  const hasShowDestination = Boolean(
    event.slug && PUBLIC_SHOW_SLUGS.has(event.slug),
  );

  return (
    <article className="mt-12 overflow-hidden rounded-[34px] border border-[#FCCD12]/25 bg-[#070F33] shadow-[0_30px_100px_rgba(0,0,0,0.3)] lg:grid lg:grid-cols-[1.08fr_0.92fr]">
      <EventImage event={event} sizes="(max-width: 1024px) 100vw, 54vw" />
      <div className="flex min-w-0 flex-col justify-center p-7 sm:p-10 lg:p-12">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-[#FCCD12] px-4 py-2 text-xs font-black tracking-[0.16em] text-[#020B2E]">
            À VENIR
          </span>
          {event.category ? (
            <span className="text-sm font-black uppercase tracking-[0.16em] text-[#FCCD12]">
              {event.category}
            </span>
          ) : null}
        </div>

        <h3 className="mt-6 break-words text-3xl font-black leading-tight sm:text-4xl">
          {event.title}
        </h3>
        {event.description ? (
          <p className="mt-5 whitespace-pre-line leading-8 text-white/65">
            {event.description}
          </p>
        ) : null}

        <EventGuests
          guests={event.guests}
          guestProfileSlugs={guestProfileSlugs}
        />

        <dl className="mt-7 grid gap-4 text-sm sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-[#FCCD12]" />
            <div>
              <dt className="sr-only">Date</dt>
              <dd className="font-bold">{formatDate(event.scheduledStartTime)}</dd>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-[#FCCD12]" />
            <div>
              <dt className="sr-only">Heure</dt>
              <dd className="font-bold">
                {formatTime(event.scheduledStartTime)}, heure de Dakar
              </dd>
            </div>
          </div>
          {event.location ? (
            <div className="flex items-start gap-3 sm:col-span-2">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#FCCD12]" />
              <div>
                <dt className="sr-only">Lieu</dt>
                <dd className="font-bold">{event.location}</dd>
              </div>
            </div>
          ) : null}
        </dl>

        <div className="mt-7 w-fit rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white/80">
          <span className="mr-2 text-[#FCCD12]">Début dans</span>
          <TvCountdown startsAt={event.scheduledStartTime} />
        </div>

        {event.youtubeVideoId || hasShowDestination ? (
          <div className="mt-8 flex flex-wrap gap-3">
            {event.youtubeVideoId ? (
              <a
                href={`https://www.youtube.com/watch?v=${event.youtubeVideoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#FCCD12] px-6 py-3 font-black text-[#020B2E] transition hover:scale-[1.03]"
              >
                <Play className="h-4 w-4 fill-current" /> Regarder sur YouTube
              </a>
            ) : null}
            {hasShowDestination ? (
              <Link
                href="#nos-emissions"
                className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 font-black transition hover:border-[#FCCD12] hover:text-[#FCCD12]"
              >
                Voir l’émission <ArrowUpRight className="h-4 w-4" />
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}

export default function TvAgenda({
  events,
  unavailable,
  guestProfileSlugs,
}: {
  events: PublicScheduleEvent[];
  unavailable: boolean;
  guestProfileSlugs: Record<string, string>;
}) {
  return (
    <section aria-labelledby="tv-agenda-title" className="border-y border-white/5 bg-[#041038] px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-[#FCCD12]">
          Programmation officielle
        </p>
        <h2 id="tv-agenda-title" className="mt-4 text-4xl font-black sm:text-5xl">
          À l’agenda
        </h2>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-white/60">
          Retrouvez les prochains directs, émissions et rendez-vous de Bichridigital TV.
        </p>

        {unavailable ? (
          <p className="mt-10 rounded-2xl border border-white/10 bg-white/5 px-6 py-5 text-white/65">
            La programmation est momentanément indisponible.
          </p>
        ) : events.length === 0 ? (
          <p className="mt-10 rounded-2xl border border-white/10 bg-white/5 px-6 py-5 text-white/65">
            Aucun rendez-vous programmé pour le moment.
          </p>
        ) : (
          <>
            <MainEvent
              event={events[0]}
              guestProfileSlugs={guestProfileSlugs}
            />
            {events.length > 1 ? (
              <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {events.slice(1).map((event) => (
                  <article key={event.id} className="min-w-0 overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.035]">
                    <EventImage event={event} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" />
                    <div className="p-5">
                      {event.category ? (
                        <p className="text-xs font-black uppercase tracking-[0.14em] text-[#FCCD12]">
                          {event.category}
                        </p>
                      ) : null}
                      <h3 className="mt-3 break-words text-xl font-black leading-tight">
                        {event.title}
                      </h3>
                      <p className="mt-4 text-sm font-bold text-white/70">
                        {formatDate(event.scheduledStartTime, false)} · {formatTime(event.scheduledStartTime)}
                      </p>
                      {event.location ? (
                        <p className="mt-2 flex items-start gap-2 text-sm text-white/50">
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                          <span>{event.location}</span>
                        </p>
                      ) : null}
                      <EventGuests
                        guests={event.guests}
                        guestProfileSlugs={guestProfileSlugs}
                      />
                    </div>
                  </article>
                ))}
              </div>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}
