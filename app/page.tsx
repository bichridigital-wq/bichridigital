"use client";

import Image from "next/image";
import Link from "next/link";
import CountUp from "react-countup";
import { motion } from "framer-motion";
import Navbar from "./components/navbar";
import Footer from "./components/footer";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaSnapchat,
  FaTiktok,
  FaWhatsapp,
  FaYoutube,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

const fadeUp = {
  hidden: { opacity: 0, y: 34 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const teamMembers = [
  {
    name: "Bounama Niang",
    role: "CEO & Fondateur",
    image: "/team/bounama.jpg",
  },
  {
    name: "Djibril Sy",
    role: "Présentateur & directeur des programmes",
    image: "/team/djibril.jpg",
  },
  {
    name: "Baye Dame Thioune",
    role: "Présentateur & collaborateur",
    image: "/team/baye-dame.jpg",
  },
  {
    name: "Baye Cheikh Thiam",
    role: "Animateur & Collaborateur",
    image: "/team/baye-cheikh.jpg",
  },
  {
    name: "Abdou Wade",
    role: "Présentateur & Collaborateur",
    image: "/team/abdou-wade.jpg",
  },
  {
    name: "Ameth Diao",
    role: "Chroniqueur",
    image: "/team/ameth-diao.jpg",
  },
  {
    name: "Mbaye Loum",
    role: "Production, design, montage & streaming",
    image: "/team/mbaye-loum.jpg",
  },
];

const services = [
  {
    icon: "WEB",
    title: "Développement Web",
    desc: "Sites vitrines, plateformes modernes et expériences digitales rapides.",
  },
  {
    icon: "ART",
    title: "Design Graphique",
    desc: "Affiches, logos, chartes graphiques, miniatures et supports visuels.",
  },
  {
    icon: "TV",
    title: "Audiovisuel",
    desc: "Captation, montage vidéo, reportages, interviews et productions.",
  },
  {
    icon: "LIVE",
    title: "Streaming Live",
    desc: "Diffusion en direct sur YouTube, Facebook, TikTok et autres plateformes.",
  },
  {
    icon: "PHOTO",
    title: "Photographie",
    desc: "Photos événementielles, commerciales, portraits et studio.",
  },
  {
    icon: "COM",
    title: "Community Management",
    desc: "Gestion de réseaux sociaux, planning éditorial et animation digitale.",
  },
  {
    icon: "ADS",
    title: "Marketing Digital",
    desc: "Campagnes publicitaires, visibilité et stratégie de croissance.",
  },
  {
    icon: "PRINT",
    title: "Impression",
    desc: "Flyers, cartes, banderoles, textile, goodies et supports personnalisés.",
  },
];

const stats = [
  {
    label: "Abonnés YouTube",
    value: 123,
    suffix: "K+",
  },
  {
    label: "Abonnés TikTok",
    value: 60.1,
    suffix: "K+",
    decimals: 1,
  },
  {
    label: "Abonnés Instagram",
    value: 19,
    suffix: "K+",
  },
  {
    label: "Abonnés Facebook",
    value: 12,
    suffix: "K+",
  },
  {
    label: "Projets réalisés",
    value: 100,
    suffix: "+",
  },
  {
    label: "Années d'expérience",
    value: 6,
    suffix: "+",
  },
];

const socialStats = [
  {
    label: "YouTube",
    value: 123,
    suffix: "K+",
    icon: FaYoutube,
    color: "text-red-500",
  },
  {
    label: "TikTok",
    value: 60.1,
    suffix: "K+",
    decimals: 1,
    icon: FaTiktok,
    color: "text-white",
  },
  {
    label: "Instagram",
    value: 19,
    suffix: "K+",
    icon: FaInstagram,
    color: "text-pink-400",
  },
  {
    label: "Facebook",
    value: 12,
    suffix: "K+",
    icon: FaFacebook,
    color: "text-blue-400",
  },
  {
    label: "X",
    value: 3988,
    suffix: "",
    separator: " ",
    icon: FaXTwitter,
    color: "text-white",
  },
  {
    label: "Snapchat",
    value: 11.8,
    suffix: "K+",
    decimals: 1,
    icon: FaSnapchat,
    color: "text-[#FCCD12]",
  },
  {
    label: "LinkedIn",
    value: 315,
    suffix: "",
    separator: " ",
    icon: FaLinkedin,
    color: "text-blue-300",
  },
];

const portfolio = [
  "/portfolio1.png",
  "/portfolio2.png",
  "/portfolio3.png",
  "/portfolio4.png",
];

const partners = [
  {
    src: "/agro-kayor.png",
    alt: "Agro Kayor",
  },
  {
    src: "/sonacos.png",
    alt: "Sonacos",
  },
  {
    src: "/kurel-tuuba.png",
    alt: "Kurel Tuuba",
  },
  {
    src: "/tbs.png",
    alt: "TBS",
  },
  {
    src: "/and-defar.png",
    alt: "And Defar",
  },
  {
    src: "/sarr-sunu-gp.png",
    alt: "Sarr Sunu GP",
  },
];

const storeItems = [
  {
    title: "Ordinateurs",
    desc: "PC portables, ordinateurs de bureau et accessoires informatiques.",
    tag: "Informatique",
    icon: "PC",
  },
  {
    title: "T-shirts",
    desc: "T-shirts personnalisés, modernes et adaptés à votre style.",
    tag: "Textile",
    icon: "TS",
  },
  {
    title: "Casquettes",
    desc: "Casquettes stylées pour entreprises, événements et particuliers.",
    tag: "Mode",
    icon: "CAP",
  },
  {
    title: "Pulls",
    desc: "Pulls personnalisés, confortables et professionnels.",
    tag: "Textile",
    icon: "PL",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#020B2E] text-white">
      <Navbar />

      {/* HERO */}
      <section
        id="accueil"
        className="relative flex min-h-screen items-center overflow-hidden px-6 pt-28"
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-[#020B2E]/80" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,87,255,0.5),transparent_35%),linear-gradient(to_bottom,rgba(2,11,46,0.45),#020B2E)]" />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]"
        >
          <div>
            <motion.div
              variants={fadeUp}
              className="mb-6 inline-flex rounded-full border border-[#FCCD12]/40 bg-white/10 px-5 py-2 text-sm font-black uppercase tracking-[0.2em] text-[#FCCD12] backdrop-blur"
            >
              Depuis 2019 au service de votre visibilité
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="max-w-5xl text-4xl font-black leading-tight md:text-6xl lg:text-7xl"
            >
              Bichridigital Agency
              <span className="mt-3 block text-[#FCCD12]">
                Votre histoire, image par image.
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-7 max-w-3xl text-lg leading-8 text-gray-200 md:text-xl"
            >
              Communication digitale, audiovisuel, streaming live, photographie,
              développement web, design graphique, impression et supports
              personnalisés.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="mt-10 flex flex-col gap-4 sm:flex-row"
            >
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full bg-[#FCCD12] px-8 py-4 font-black text-[#020B2E] transition hover:scale-105"
              >
                Demander un devis
              </Link>

              <Link
                href="/portfolio"
                className="inline-flex items-center justify-center rounded-full border border-white/25 bg-white/10 px-8 py-4 font-bold text-white backdrop-blur transition hover:border-[#FCCD12] hover:text-[#FCCD12]"
              >
                Voir nos réalisations
              </Link>

              <a
                href="https://wa.me/221773211096"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-green-500 px-8 py-4 font-black text-white transition hover:scale-105"
              >
                WhatsApp
              </a>
            </motion.div>
          </div>

          <motion.div
            variants={fadeUp}
            className="rounded-[2rem] border border-white/15 bg-white/10 p-6 shadow-[0_30px_120px_rgba(0,87,255,0.24)] backdrop-blur"
          >
            <Image
              src="/logo.png"
              alt="Bichridigital Agency"
              width={280}
              height={120}
              priority
              className="mx-auto h-auto w-56"
            />

            <div className="mt-8 grid grid-cols-2 gap-4">
              {stats.slice(0, 4).map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/10 bg-[#020B2E]/70 p-5 text-center"
                >
                  <h3 className="text-3xl font-black text-[#FCCD12] md:text-4xl">
                    <CountUp
                      start={0}
                      end={item.value}
                      decimals={item.decimals || 0}
                      suffix={item.suffix}
                      duration={2.2}
                      enableScrollSpy
                      scrollSpyOnce
                    />
                  </h3>
                  <p className="mt-2 text-sm text-gray-300">{item.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </section>

      

      {/* SERVICES */}
      <section id="services" className="relative py-24">
        <div className="absolute left-0 top-20 h-72 w-72 rounded-full bg-[#0057FF]/20 blur-3xl" />
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={stagger}
            className="mb-14 text-center"
          >
            <motion.p
              variants={fadeUp}
              className="text-sm font-black uppercase tracking-[0.3em] text-[#FCCD12]"
            >
              Nos services
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="mx-auto mt-4 max-w-4xl text-3xl font-black leading-tight md:text-5xl"
            >
              Une solution complète pour votre communication.
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="mx-auto mt-5 max-w-3xl leading-8 text-gray-400"
            >
              Depuis 2019, Bichridigital accompagne entreprises, associations,
              institutions et entrepreneurs dans leur visibilité digitale.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={stagger}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
          >
            {services.map((service) => (
              <motion.div
                key={service.title}
                variants={fadeUp}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group rounded-[1.5rem] border border-blue-500/20 bg-[#071542] p-7 transition hover:border-[#FCCD12]/70 hover:shadow-[0_25px_80px_rgba(0,87,255,0.22)]"
              >
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1738C8] text-sm font-black text-[#FCCD12] transition group-hover:scale-110 group-hover:bg-[#FCCD12] group-hover:text-[#020B2E]">
                  {service.icon}
                </div>
                <h3 className="text-xl font-black text-white">
                  {service.title}
                </h3>
                <p className="mt-4 leading-7 text-gray-400">{service.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* A PROPOS */}
      <section id="apropos" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={stagger}
            className="grid items-center gap-12 rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#0024FF] via-[#071B4D] to-[#020B2E] p-8 md:p-14 lg:grid-cols-[0.95fr_1.05fr]"
          >
            <motion.div variants={fadeUp}>
              <p className="text-sm font-black uppercase tracking-[0.3em] text-[#FCCD12]">
                À propos
              </p>
              <h2 className="mt-4 text-3xl font-black leading-tight md:text-5xl">
                Plus de 6 ans d&apos;expérience au service de l&apos;image.
              </h2>
            </motion.div>

            <motion.div variants={fadeUp}>
              <p className="text-lg leading-8 text-gray-200">
                Bichridigital Agency accompagne les entreprises, associations,
                collectivités, entrepreneurs et événements dans leur
                communication digitale, audiovisuelle et imprimée.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {stats.slice(0, 3).map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl bg-white/10 p-5 text-center backdrop-blur"
                  >
                    <h3 className="text-3xl font-black text-[#FCCD12]">
                      <CountUp
                        start={0}
                        end={item.value}
                        decimals={item.decimals || 0}
                        suffix={item.suffix}
                        duration={2.2}
                        enableScrollSpy
                        scrollSpyOnce
                      />
                    </h3>
                    <p className="mt-2 text-sm text-gray-300">{item.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* PORTFOLIO */}
      <section id="portfolio" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.3em] text-[#FCCD12]">
                Réalisations
              </p>
              <h2 className="mt-4 text-3xl font-black md:text-5xl">
                Quelques projets réalisés
              </h2>
              <p className="mt-4 max-w-3xl leading-8 text-gray-400">
                Design graphique, communication digitale, production
                audiovisuelle et contenus pour marques, événements et
                institutions.
              </p>
            </div>

            <Link
              href="/portfolio"
              className="inline-flex items-center justify-center rounded-full border border-[#FCCD12]/60 px-6 py-3 font-bold text-[#FCCD12] transition hover:bg-[#FCCD12] hover:text-[#020B2E]"
            >
              Voir le portfolio
            </Link>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={stagger}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
          >
            {portfolio.map((img, index) => (
              <motion.div
                key={img}
                variants={fadeUp}
                whileHover={{ scale: 1.04, y: -8 }}
                className="group overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#071542]"
              >
                <div className="relative h-80 overflow-hidden">
                  <Image
                    src={img}
                    alt={`Projet ${index + 1}`}
                    fill
                    className="object-cover transition duration-700 group-hover:scale-110"
                  />
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-black text-white">
                    Réalisation #{index + 1}
                  </h3>
                  <p className="mt-3 text-gray-400">
                    Projet réalisé par Bichridigital Agency.
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* BICHRIDIGITAL TV */}
      <section className="bg-gradient-to-r from-[#0024FF] to-[#071B4D] py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={stagger}
          >
            <motion.p
              variants={fadeUp}
              className="text-sm font-black uppercase tracking-[0.3em] text-[#FCCD12]"
            >
              Média digital
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="mt-4 text-3xl font-black md:text-5xl"
            >
              Bichridigital TV
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="mt-6 text-lg leading-8 text-gray-200"
            >
              Notre média digital dédié aux émissions, interviews, événements,
              reportages et diffusions en direct.
            </motion.p>

            <motion.div variants={stagger} className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                "Interviews exclusives",
                "Streaming Live",
                "Émissions culturelles",
                "Couverture événementielle",
                "Production audiovisuelle",
              ].map((item) => (
                <motion.div
                  key={item}
                  variants={fadeUp}
                  className="rounded-2xl bg-white/10 p-4 font-bold backdrop-blur"
                >
                  {item}
                </motion.div>
              ))}
            </motion.div>

            <motion.a
              variants={fadeUp}
              href="https://www.youtube.com/@bichridigital"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-10 inline-flex rounded-full bg-[#FCCD12] px-8 py-4 font-black text-[#020B2E] transition hover:scale-105"
            >
              Voir notre chaîne YouTube
            </motion.a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.7 }}
            className="rounded-[2rem] border border-white/10 bg-white/10 p-8 backdrop-blur"
          >
            <h3 className="text-3xl font-black">Nos forces</h3>
            <div className="mt-8 grid gap-4">
              {[
                "Production Audiovisuelle",
                "Streaming Live",
                "Réseaux Sociaux",
                "Design Graphique",
                "Développement Web",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-[#020B2E]/40 p-5 text-lg font-bold"
                >
                  {item}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* TEMOIGNAGES */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={stagger}
            className="mb-12 text-center"
          >
            <motion.p
              variants={fadeUp}
              className="text-sm font-black uppercase tracking-[0.3em] text-[#FCCD12]"
            >
              Témoignages
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="mt-4 text-3xl font-black md:text-5xl"
            >
              Ce que disent nos clients
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
            className="grid gap-6 md:grid-cols-3"
          >
            {[
              "Bichridigital a complètement transformé notre communication.",
              "Une équipe sérieuse, créative et professionnelle.",
              "Des affiches et productions de très haute qualité.",
            ].map((quote) => (
              <motion.div
                key={quote}
                variants={fadeUp}
                whileHover={{ y: -8, scale: 1.02 }}
                className="rounded-[1.5rem] border border-white/10 bg-[#071542] p-8"
              >
                <p className="text-lg italic leading-8 text-gray-300">
                  “{quote}”
                </p>
                <p className="mt-6 text-xl text-[#FCCD12]">★★★★★</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* PARTENAIRES */}
      <section className="overflow-hidden bg-[#071542] py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-10 text-center">
            <p className="text-sm font-black uppercase tracking-[0.3em] text-[#FCCD12]">
              Partenaires
            </p>
            <h2 className="mt-4 text-3xl font-black md:text-5xl">
              Ils nous font confiance
            </h2>
          </div>

          <div className="overflow-hidden">
            <div className="partners-track flex w-max items-center gap-16">
              {[...partners, ...partners].map((partner, index) => (
                <Image
                  key={`${partner.alt}-${index}`}
                  src={partner.src}
                  alt={partner.alt}
                  width={180}
                  height={110}
                  className="h-24 w-auto object-contain"
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={stagger}
            className="mb-14 text-center"
          >
            <motion.p
              variants={fadeUp}
              className="text-sm font-black uppercase tracking-[0.3em] text-[#FCCD12]"
            >
              Notre équipe
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="mt-4 text-3xl font-black md:text-5xl"
            >
              Les visages derrière Bichridigital
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="mx-auto mt-5 max-w-3xl leading-8 text-gray-400"
            >
              Une équipe passionnée par la communication digitale,
              l&apos;audiovisuel, la photographie, le streaming live et la création
              de contenus professionnels.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={stagger}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {teamMembers.map((member) => (
              <motion.div
                key={member.name}
                variants={fadeUp}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group overflow-hidden rounded-[1.5rem] border border-blue-500/20 bg-[#071542] transition hover:border-[#FCCD12]"
              >
                <div className="relative h-[280px] overflow-hidden bg-[#0B1C54]">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover transition duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#020B2E] via-[#020B2E]/15 to-transparent" />
                </div>

                <div className="p-6 text-center">
                  <h3 className="text-xl font-black text-white group-hover:text-[#FCCD12]">
                    {member.name}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-gray-400">
                    {member.role}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* BICHRISTORE */}
      <section className="bg-[#071542] py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 lg:grid-cols-2">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={stagger}
          >
            <motion.p
              variants={fadeUp}
              className="text-sm font-black uppercase tracking-[0.3em] text-[#FCCD12]"
            >
              BichriStore
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="mt-4 text-3xl font-black leading-tight md:text-5xl"
            >
              Votre boutique tech & lifestyle.
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="mt-6 text-lg leading-8 text-gray-300"
            >
              Ordinateurs, t-shirts, casquettes, pulls et articles adaptés aux
              entreprises, événements, associations et particuliers.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
              {["Ordinateurs", "T-shirts", "Casquettes", "Pulls"].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-gray-300"
                >
                  {item}
                </span>
              ))}
            </motion.div>

            <motion.div variants={fadeUp}>
              <Link
                href="/boutique"
                className="mt-10 inline-flex rounded-full bg-[#FCCD12] px-9 py-4 font-black text-[#020B2E] transition hover:scale-105"
              >
                Découvrir la boutique
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
            className="grid gap-6 sm:grid-cols-2"
          >
            {storeItems.map((item) => (
              <motion.div
                key={item.title}
                variants={fadeUp}
                whileHover={{ y: -8, scale: 1.02 }}
                className="rounded-[1.5rem] border border-blue-500/20 bg-[#020B2E] p-7 transition hover:border-[#FCCD12]"
              >
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1738C8] text-xl font-black text-[#FCCD12]">
                  {item.icon}
                </div>
                <span className="text-sm font-bold text-[#FCCD12]">
                  {item.tag}
                </span>
                <h3 className="mt-3 text-2xl font-black text-white">
                  {item.title}
                </h3>
                <p className="mt-4 leading-7 text-gray-400">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CONTACT */}
      <section
        id="contact"
        className="bg-gradient-to-r from-[#0024FF] via-[#071B4D] to-[#020B2E] py-24"
      >
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={stagger}
            className="mb-14 text-center"
          >
            <motion.h2
              variants={fadeUp}
              className="text-3xl font-black md:text-5xl"
            >
              Contactez-nous
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="mt-4 text-lg text-gray-200"
            >
              Discutons ensemble de votre prochain projet digital.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
            className="grid gap-6 md:grid-cols-3"
          >
            {[
              {
                title: "Adresse",
                value: "Studio Iba Asta Niang, Ndiagne - Louga - Sénégal",
              },
              {
                title: "Téléphone",
                value: "+221 77 321 10 96",
              },
              {
                title: "Email",
                value: "bichridigital@gmail.com",
              },
            ].map((item) => (
              <motion.div
                key={item.title}
                variants={fadeUp}
                className="rounded-[1.5rem] border border-white/10 bg-white/10 p-8 backdrop-blur"
              >
                <h3 className="text-2xl font-black">{item.title}</h3>
                <p className="mt-4 leading-7 text-gray-200">{item.value}</p>
              </motion.div>
            ))}
          </motion.div>

          <div className="mt-12 text-center">
            <a
              href="https://wa.me/221773211096"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 rounded-full bg-[#FCCD12] px-10 py-5 font-black text-[#020B2E] transition hover:scale-105"
            >
              <FaWhatsapp className="h-5 w-5" />
              Écrire sur WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
     <Footer />

      <a
        href="https://wa.me/221773211096"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-3 rounded-full bg-green-500 px-6 py-4 font-black text-white shadow-2xl transition hover:scale-110"
      >
        <FaWhatsapp className="h-5 w-5" />
        WhatsApp
      </a>

      <style>{`
        @keyframes partnersMarquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .partners-track {
          animation: partnersMarquee 28s linear infinite;
        }

        .partners-track:hover {
          animation-play-state: paused;
        }
      `}</style>
    </main>
  );
}
