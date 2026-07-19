"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  BookOpen,
  Clock3,
  HeartPulse,
  MessageCircle,
  Mic2,
  Newspaper,
  Radio,
  Trophy,
  Tv,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import { FaYoutube } from "react-icons/fa6";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import TvNewsRealtime from "./components/tv-news-realtime";
import type { TvNewsListItem } from "../../types/tv-news";

type Show = {
  name: string;
  category: string;
  icon: LucideIcon;
};

const shows: Show[] = [
  { name: "Li Ci Biir Ndiagne", category: "Actualité locale", icon: Newspaper },
  { name: "Jotaayu Bichri", category: "Magazine", icon: Tv },
  { name: "Talaatay Cheikh Ibra", category: "Société", icon: Mic2 },
  { name: "Firi Gent", category: "Culture", icon: BookOpen },
  { name: "Xamxamu Cosaan", category: "Patrimoine", icon: Users },
  { name: "Seen Wergu-yaram", category: "Santé et bien-être", icon: HeartPulse },
  { name: "Ëttu Jigeen Ñi", category: "Voix de femmes", icon: UserRound },
  { name: "Ëttu Sport", category: "Sport", icon: Trophy },
  { name: "Demb ak Tay", category: "Mémoire et société", icon: Clock3 },
  { name: "Na Ñuko Waxtaané", category: "Débat", icon: MessageCircle },
  { name: "Entretien Spécial", category: "Interview", icon: Mic2 },
];

const youtubeUrl = "https://www.youtube.com/@bichridigital";
const youtubeUploadsEmbedUrl =
  "https://www.youtube.com/embed/videoseries?list=UUrm-wKWYVhHX5S7usD6jMKQ&playsinline=1";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

export default function TvClient({ initialNews }: { initialNews: TvNewsListItem[] }) {
  return (
    <>
      <Navbar />

      <main className="overflow-hidden bg-[#020B2E] text-white">
        <section className="relative flex min-h-[760px] items-center px-6 pb-24 pt-36">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(30,64,175,0.55),transparent_34%),radial-gradient(circle_at_85%_70%,rgba(252,205,18,0.12),transparent_28%)]" />
          <div className="absolute left-1/2 top-28 h-[520px] w-[520px] -translate-x-1/2 rounded-full border border-white/5" />
          <div className="absolute left-1/2 top-40 h-[400px] w-[400px] -translate-x-1/2 rounded-full border border-white/5" />

          <motion.div
            initial="hidden"
            animate="visible"
            transition={{ staggerChildren: 0.12 }}
            className="relative z-10 mx-auto max-w-5xl text-center"
          >
            <motion.div
              variants={fadeUp}
              className="mx-auto mb-7 flex w-fit items-center gap-3 rounded-full border border-[#FCCD12]/30 bg-[#FCCD12]/10 px-5 py-2 text-sm font-black uppercase tracking-[0.22em] text-[#FCCD12]"
            >
              <Radio className="h-4 w-4" />
              La chaîne de votre communauté
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-5xl font-black tracking-tight sm:text-6xl lg:text-8xl"
            >
              Bichridigital <span className="text-[#FCCD12]">TV</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mx-auto mt-7 max-w-3xl text-xl font-bold leading-relaxed text-white sm:text-2xl"
            >
              Votre télévision digitale au cœur de l’actualité, de la culture et de la communauté.
            </motion.p>

            <motion.p
              variants={fadeUp}
              className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/65 sm:text-lg"
            >
              Suivez nos directs, émissions, interviews, reportages et événements depuis Ndiagne et partout ailleurs.
            </motion.p>

            <motion.a
              variants={fadeUp}
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-10 inline-flex items-center gap-3 rounded-full bg-[#FCCD12] px-8 py-4 font-black text-[#020B2E] shadow-[0_0_40px_rgba(252,205,18,0.22)] transition hover:scale-105"
            >
              <FaYoutube className="h-5 w-5" />
              Regarder sur YouTube
              <ArrowUpRight className="h-4 w-4" />
            </motion.a>
          </motion.div>
        </section>

        <section className="px-6 py-24">
          <div className="mx-auto grid max-w-[1536px] items-start gap-8 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[340px_minmax(0,1fr)]">
            <TvNewsRealtime initialNews={initialNews} />

            <div
              className="grid w-full min-w-0 overflow-hidden rounded-[36px] border border-white/10 bg-[#070F33] shadow-[0_30px_100px_rgba(0,0,0,0.28)] lg:grid-cols-[1.25fr_0.75fr]"
            >
            <div className="w-full min-w-0 border-b border-white/10 bg-[radial-gradient(circle_at_center,rgba(30,64,175,0.42),transparent_65%)] p-5 sm:p-8 lg:border-b-0 lg:border-r lg:p-10">
              <div className="relative aspect-video w-full overflow-hidden rounded-[24px] border border-white/10 bg-black shadow-[0_24px_70px_rgba(0,0,0,0.35)]">
                <iframe
                  src={youtubeUploadsEmbedUrl}
                  title="Vidéos de la chaîne YouTube Bichridigital"
                  className="absolute inset-0 h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
              <p className="mt-4 text-sm leading-6 text-white/50">
                Parcourez et regardez les dernières vidéos publiées sur la chaîne Bichridigital.
              </p>
              <a
                href="https://www.youtube.com/@bichridigital/videos"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-sm font-bold text-white/45 transition hover:text-[#FCCD12]"
              >
                Voir les vidéos directement sur YouTube
              </a>
            </div>

            <div className="flex flex-col justify-center p-8 sm:p-12">
              <span className="mb-5 flex items-center gap-3 text-sm font-black uppercase tracking-[0.18em] text-[#FCCD12]">
                <Radio className="h-4 w-4" /> Espace direct
              </span>
              <h2 className="text-3xl font-black leading-tight sm:text-4xl">
                En direct sur Bichridigital TV
              </h2>
              <p className="mt-5 leading-8 text-white/65">
                Consultez notre chaîne YouTube pour voir si une émission est actuellement en direct.
              </p>
              <a
                href={`${youtubeUrl}/live`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-[#FCCD12] px-7 py-3.5 font-black text-[#020B2E] transition hover:scale-105"
              >
                Accéder au direct <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
            </div>
          </div>
        </section>

        <section className="bg-[#070F33] px-6 py-24">
          <div className="mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-3xl"
            >
              <p className="text-sm font-black uppercase tracking-[0.2em] text-[#FCCD12]">Notre programmation</p>
              <h2 className="mt-4 text-4xl font-black sm:text-5xl">Nos émissions</h2>
              <p className="mt-5 text-lg leading-8 text-white/60">
                Des formats pensés pour informer, transmettre, dialoguer et mettre en lumière notre territoire.
              </p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.08 }}
              transition={{ staggerChildren: 0.06 }}
              className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
            >
              {shows.map(({ name, category, icon: Icon }) => (
                <motion.article
                  key={name}
                  variants={fadeUp}
                  className="group rounded-[26px] border border-white/10 bg-white/[0.035] p-7 transition hover:-translate-y-1 hover:border-[#FCCD12]/35 hover:bg-white/[0.06]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1E40AF]/35 text-[#FCCD12] transition group-hover:bg-[#FCCD12] group-hover:text-[#020B2E]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-6 text-xl font-black">{name}</h3>
                  <p className="mt-2 text-sm font-bold uppercase tracking-wider text-white/45">{category}</p>
                </motion.article>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="px-6 py-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="relative mx-auto max-w-7xl overflow-hidden rounded-[36px] border border-[#1E40AF]/45 bg-[#070F33] px-8 py-16 sm:px-14 lg:px-20"
          >
            <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#1E40AF]/30 blur-3xl" />
            <div className="relative max-w-3xl">
              <FaYoutube className="h-12 w-12 text-[#FCCD12]" />
              <h2 className="mt-7 text-3xl font-black sm:text-5xl">Retrouvez nos émissions et reportages</h2>
              <p className="mt-6 text-lg leading-8 text-white/65">
                Nos émissions, interviews et reportages sont disponibles sur la chaîne YouTube de Bichridigital. Retrouvez-les quand vous voulez, où que vous soyez.
              </p>
              <a
                href={`${youtubeUrl}/videos`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-9 inline-flex items-center gap-2 rounded-full border border-[#FCCD12] px-7 py-3.5 font-black text-white transition hover:bg-[#FCCD12] hover:text-[#020B2E]"
              >
                Voir toutes les vidéos <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </motion.div>
        </section>

        <section className="relative bg-[#1E40AF] px-6 py-24 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_50%)]" />
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative mx-auto max-w-4xl"
          >
            <h2 className="text-4xl font-black sm:text-5xl">Une télévision proche de vous</h2>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-white/75">
              Bichridigital TV valorise les événements, les initiatives, la culture, les talents et les voix de notre communauté.
            </p>
            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FCCD12] px-8 py-4 font-black text-[#020B2E] transition hover:scale-105"
              >
                <FaYoutube className="h-5 w-5" /> Suivre Bichridigital TV
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full border border-white/35 px-8 py-4 font-black text-white transition hover:bg-white hover:text-[#020B2E]"
              >
                Nous contacter
              </Link>
            </div>
          </motion.div>
        </section>
      </main>

      <Footer />
    </>
  );
}
