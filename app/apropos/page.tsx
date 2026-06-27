"use client";

import Image from "next/image";
import Link from "next/link";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
import CountUp from "react-countup";
const portfolio = [
  "/portfolio1.png",
  "/portfolio2.png",
  "/portfolio3.png",
  "/portfolio4.png",
  "/portfolio5.png",
];

import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaTiktok,
} from "react-icons/fa";

export default function AproposPage() {

  const timeline = [
    {
      year: "2019",
      icon: "🚀",
      title: "Création",
      description:
        "Naissance de Bichridigital avec une vision claire : offrir des services digitaux de qualité."
    },
    {
      year: "2020",
      icon: "📸",
      title: "Premiers projets",
      description:
        "Réalisation des premiers projets audiovisuels et lancement de la chaîne YouTube."
    },
    {
      year: "2021",
      icon: "📈",
      title: "Croissance",
      description:
        "Développement de nouveaux services et augmentation du portefeuille clients."
    },
    {
      year: "2022",
      icon: "💻",
      title: "Développement Web",
      description:
        "Lancement du service de création de sites web professionnels."
    },
    {
      year: "2023",
      icon: "📡",
      title: "Streaming Live",
      description:
        "Déploiement des solutions de streaming live pour événements."
    },
    {
      year: "2024",
      icon: "🏆",
      title: "Référence",
      description:
        "Plus de 250 projets réalisés et une forte présence sur les réseaux sociaux."
    },
    {
      year: "2025",
      icon: "⭐",
      title: "Innovation",
      description:
        "Toujours plus haut, toujours plus loin avec des solutions innovantes."
    }
  ];

  return (
    <>
      <Navbar />

      <main className="bg-[#020B2E] text-white min-h-screen">

        {/* HERO */}

        <section className="relative overflow-hidden">

          <div className="absolute inset-0">

            <Image
              src="/hero.jpg"
              alt="Bichridigital"
              fill
              priority
              className="object-cover"
            />

            <div className="absolute inset-0 bg-[#020B2E]/80"></div>

          </div>

          <div className="relative max-w-7xl mx-auto px-6 py-28">

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: .8 }}
              className="max-w-3xl"
            >

              <p className="uppercase tracking-[4px] text-[#FCCD12] font-semibold mb-5">

                À propos de Bichridigital

              </p>

              <h1 className="text-5xl md:text-7xl font-black leading-tight">

                Une histoire de passion,

                <br />

                <span className="text-[#FCCD12]">

                  de créativité et d'impact.

                </span>

              </h1>

              <p className="text-gray-300 text-xl leading-9 mt-8">

                Depuis 2019, Bichridigital accompagne
                les entreprises, associations,
                institutions et particuliers dans la
                réalisation de leurs projets
                audiovisuels et digitaux en Afrique
                et dans le monde.

              </p>

              <Link
                href="/contact"
                className="inline-flex items-center gap-3 mt-10 bg-[#FCCD12] text-[#020B2E] px-8 py-4 rounded-full font-bold hover:scale-105 transition"
              >

                Découvrir notre histoire →

              </Link>

            </motion.div>

          </div>

        </section>

        {/* QUI SOMMES-NOUS */}
        <section className="max-w-7xl mx-auto px-6 py-24">

  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: .8 }}
    viewport={{ once: true }}
    className="text-center mb-16"
  >

    <p className="uppercase tracking-[4px] text-[#FCCD12] font-semibold mb-4">
      Qui sommes-nous ?
    </p>

    <h2 className="text-4xl md:text-6xl font-black mb-6">
      Nos valeurs,
      <span className="text-[#FCCD12]"> notre moteur</span>
    </h2>

    <p className="text-gray-300 text-lg max-w-4xl mx-auto leading-9">
      Bichridigital est une agence de communication digitale,
      production audiovisuelle, photographie,
      streaming live et développement web basée à Ndiagne.
      Nous accompagnons nos clients avec des solutions modernes,
      créatives et professionnelles.
    </p>

  </motion.div>

  <div className="grid md:grid-cols-3 gap-8">

    {/* Mission */}

    <motion.div
      whileHover={{ y: -10 }}
      className="rounded-3xl border border-[#1E40AF] bg-[#07133D] p-10"
    >

      <div className="text-6xl mb-6">
        🎯
      </div>

      <h3 className="text-3xl font-bold mb-5">
        Notre Mission
      </h3>

      <p className="text-gray-300 leading-8">
        Offrir des services digitaux et audiovisuels
        de qualité supérieure afin d'aider nos clients
        à communiquer, développer leur image
        et atteindre leurs objectifs.
      </p>

    </motion.div>

    {/* Vision */}

    <motion.div
      whileHover={{ y: -10 }}
      className="rounded-3xl border border-[#1E40AF] bg-[#07133D] p-10"
    >

      <div className="text-6xl mb-6">
        👁️
      </div>

      <h3 className="text-3xl font-bold mb-5">
        Notre Vision
      </h3>

      <p className="text-gray-300 leading-8">
        Devenir une référence incontournable
        en communication digitale,
        audiovisuelle et technologies numériques
        en Afrique de l'Ouest.
      </p>

    </motion.div>

    {/* Valeurs */}

    <motion.div
      whileHover={{ y: -10 }}
      className="rounded-3xl border border-[#1E40AF] bg-[#07133D] p-10"
    >

      <div className="text-6xl mb-6">
        💎
      </div>

      <h3 className="text-3xl font-bold mb-5">
        Nos Valeurs
      </h3>

      <ul className="space-y-4 text-gray-300">

        <li>✔ Créativité & Innovation</li>

        <li>✔ Qualité & Excellence</li>

        <li>✔ Passion du métier</li>

        <li>✔ Respect & Professionnalisme</li>

      </ul>

    </motion.div>

  </div>

</section>

{/* TIMELINE */}

<section className="max-w-7xl mx-auto px-6 py-24">

  <motion.div
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    transition={{ duration: .8 }}
    viewport={{ once: true }}
  >

    <div className="text-center mb-16">

      <p className="uppercase tracking-[4px] text-[#FCCD12] font-semibold mb-4">
        Notre histoire
      </p>

      <h2 className="text-4xl md:text-6xl font-black">

        Notre parcours
        <span className="text-[#FCCD12]"> depuis 2019</span>

      </h2>

    </div>

    <div className="grid md:grid-cols-4 lg:grid-cols-7 gap-8">

      {timeline.map((item, index) => (

        <motion.div
          key={index}
          whileHover={{ scale: 1.05 }}
          className="text-center"
        >

          <div className="w-20 h-20 rounded-full border-2 border-[#FCCD12] flex items-center justify-center mx-auto text-4xl bg-[#07133D]">

            {item.icon}

          </div>

          <h3 className="text-[#FCCD12] text-2xl font-bold mt-6">
            {item.year}
          </h3>

          <h4 className="font-bold mt-3 text-lg">
            {item.title}
          </h4>

          <p className="text-gray-400 text-sm leading-7 mt-3">
            {item.description}
          </p>

        </motion.div>

      ))}

    </div>

  </motion.div>

</section>

{/* STATISTIQUES */}
<section className="max-w-7xl mx-auto px-6 py-24">

  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: .8 }}
    viewport={{ once: true }}
  >

    <div className="text-center mb-16">

      <p className="uppercase tracking-[4px] text-[#FCCD12] font-semibold mb-4">
        Nos chiffres
      </p>

      <h2 className="text-4xl md:text-6xl font-black">
        Quelques
        <span className="text-[#FCCD12]"> statistiques</span>
      </h2>

    </div>

    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

      <motion.div
        whileHover={{ y: -8 }}
        className="rounded-3xl border border-[#1E40AF] bg-[#07133D] p-10 text-center"
      >

        <h3 className="text-5xl font-black text-[#FCCD12] mb-3">
          <CountUp end={250} duration={3} />+
        </h3>

        <p className="text-gray-300">
          Projets réalisés
        </p>

      </motion.div>

      <motion.div
        whileHover={{ y: -8 }}
        className="rounded-3xl border border-[#1E40AF] bg-[#07133D] p-10 text-center"
      >

        <h3 className="text-5xl font-black text-[#FCCD12] mb-3">
          <CountUp end={123} duration={3} />K+
        </h3>

        <p className="text-gray-300">
          Abonnés YouTube
        </p>

      </motion.div>

      <motion.div
        whileHover={{ y: -8 }}
        className="rounded-3xl border border-[#1E40AF] bg-[#07133D] p-10 text-center"
      >

        <h3 className="text-5xl font-black text-[#FCCD12] mb-3">
          <CountUp end={220} duration={3} />K+
        </h3>

        <p className="text-gray-300">
          Vues mensuelles
        </p>

      </motion.div>

      <motion.div
        whileHover={{ y: -8 }}
        className="rounded-3xl border border-[#1E40AF] bg-[#07133D] p-10 text-center"
      >

        <h3 className="text-5xl font-black text-[#FCCD12] mb-3">
          <CountUp end={6} duration={3} />+
        </h3>

        <p className="text-gray-300">
          Années d'expérience
        </p>

      </motion.div>

    </div>

  </motion.div>

</section>
{/* ================= RÉALISATIONS ================= */}

<section className="py-24 bg-[#020B2E]">

  <div className="max-w-7xl mx-auto px-6">

    <div className="text-center mb-16">

      <span className="inline-block bg-[#FCCD12]/10 text-[#FCCD12] border border-[#FCCD12]/30 px-5 py-2 rounded-full text-sm font-semibold mb-5">
        NOS RÉALISATIONS
      </span>

      <h2 className="text-5xl md:text-6xl font-black text-white">
        Quelques projets
        <span className="text-[#FCCD12]"> réalisés</span>
      </h2>

      <p className="text-gray-300 mt-6 text-lg max-w-3xl mx-auto leading-8">
        Depuis 2019, Bichridigital accompagne entreprises,
        associations et particuliers dans leurs projets
        audiovisuels, digitaux et événementiels.
      </p>

    </div>

    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

      {portfolio.map((img, index) => (

        <motion.div
          key={index}
          whileHover={{ y: -10 }}
          transition={{ duration: .4 }}
          className="group relative overflow-hidden rounded-[30px] border border-[#1E40AF] bg-[#07133D]"
        >

          {/* IMAGE */}

          <div className="relative h-80 overflow-hidden">

            <Image
              src={img}
              alt={`Projet ${index + 1}`}
              fill
              className="object-cover transition duration-700 group-hover:scale-110"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#020B2E] via-black/10 to-transparent opacity-90"></div>

          </div>

          {/* CONTENU */}

          <div className="absolute bottom-0 left-0 w-full p-6">

            <span className="inline-block bg-[#FCCD12] text-[#020B2E] text-xs font-bold px-3 py-1 rounded-full mb-3">
              Bichridigital
            </span>

            <h3 className="text-white text-2xl font-bold">
              Projet {index + 1}
            </h3>

            <p className="text-gray-300 mt-2">
              Communication digitale & Production audiovisuelle
            </p>

          </div>

        </motion.div>

      ))}

    </div>

    {/* Bouton */}

    <div className="text-center mt-16">

      <Link
        href="/portfolio"
        className="inline-flex items-center gap-3 bg-[#FCCD12] text-[#020B2E] px-8 py-4 rounded-full font-bold hover:bg-yellow-400 transition-all duration-300 hover:scale-105 shadow-xl"
      >
        Voir tout le Portfolio
        <span>→</span>
      </Link>

    </div>

  </div>

</section>

{/* CTA VIDEO */}

{/* ==================== CTA ==================== */}

<section className="max-w-7xl mx-auto px-6 py-24">

  <div className="relative overflow-hidden rounded-[32px] border border-[#1E40AF]">

    {/* VIDEO */}

    <video
      autoPlay
      muted
      loop
      playsInline
      className="absolute inset-0 w-full h-full object-cover"
    >
      <source src="/hero-video.mp4" type="video/mp4" />
    </video>

    {/* Overlay */}

    <div className="absolute inset-0 bg-[#020B2E]/80 backdrop-blur-sm"></div>

    {/* CONTENU */}

    <div className="relative z-10 py-24 px-8 text-center">

      <span className="inline-flex items-center gap-2 border border-[#FCCD12] rounded-full px-5 py-2 text-[#FCCD12] text-sm font-semibold mb-8">
        🚀 Lançons votre projet
      </span>

      <h2 className="text-5xl md:text-7xl font-black leading-tight">

        Donnez vie
        <br />

        <span className="text-[#FCCD12]">
          à vos idées.
        </span>

      </h2>

      <p className="text-gray-300 max-w-3xl mx-auto text-lg leading-8 mt-8">

        Production audiovisuelle, photographie,
        streaming live, communication digitale
        et développement web.

      </p>

      <Link
        href="/contact"
        className="inline-flex items-center gap-3 mt-10
        bg-[#FCCD12]
        text-[#020B2E]
        font-bold
        text-lg
        px-10
        py-5
        rounded-full
        hover:bg-yellow-400
        transition-all
        duration-300
        hover:scale-105
        shadow-[0_0_40px_rgba(252,205,18,.45)]"
      >

        Demander un devis

        <span className="text-xl">
          →
        </span>

      </Link>

    </div>

  </div>

</section>
{/* FOOTER */}
<footer className="bg-[#01081F] border-t border-[#1E40AF]">

  <div className="max-w-7xl mx-auto px-6 py-20">

    <div className="grid md:grid-cols-4 gap-12">

      {/* Logo */}

      <div>

        <Image
          src="/logo.png"
          alt="Bichridigital"
          width={180}
          height={60}
        />

        <p className="text-gray-400 mt-6 leading-8">

          Depuis 2019, Bichridigital accompagne les entreprises,
          associations, institutions et particuliers dans leurs
          projets digitaux et audiovisuels.

        </p>

      </div>

      {/* Navigation */}

      <div>

        <h3 className="text-white font-bold text-xl mb-6">
          Navigation
        </h3>

        <ul className="space-y-4 text-gray-400">

          <li>
            <Link href="/">Accueil</Link>
          </li>

          <li>
            <Link href="/services">Services</Link>
          </li>

          <li>
            <Link href="/portfolio">Portfolio</Link>
          </li>

          <li>
            <Link href="/apropos">À propos</Link>
          </li>

          <li>
            <Link href="/contact">Contact</Link>
          </li>

        </ul>

      </div>

      {/* Services */}

      <div>

        <h3 className="text-white font-bold text-xl mb-6">
          Nos Services
        </h3>

        <ul className="space-y-4 text-gray-400">

          <li>Communication Digitale</li>

          <li>Production Audiovisuelle</li>

          <li>Photographie</li>

          <li>Streaming Live</li>

          <li>Développement Web</li>

          <li>Community Management</li>

        </ul>

      </div>

      {/* Contact */}

      <div>

        <h3 className="text-white font-bold text-xl mb-6">
          Contact
        </h3>

        <ul className="space-y-4 text-gray-400">

          <li>📍 Ndiagne, Louga - Sénégal</li>

          <li>📞 +221 77 143 39 00</li>

          <li>✉️ contact@bichridigital.com</li>

          <li>🌐 www.bichridigital.com</li>

        </ul>

      </div>

    </div>

    {/* Bas du footer */}

    <div className="border-t border-[#1E40AF] mt-16 pt-8 flex flex-col md:flex-row items-center justify-between">

      <p className="text-gray-500 text-sm">
        © 2019 - 2026 Bichridigital Agency. Tous droits réservés.
      </p>

      <div className="flex items-center gap-4 mt-6 md:mt-0">

        <a
          href="#"
          className="w-11 h-11 rounded-full bg-[#07133D] border border-[#1E40AF] flex items-center justify-center hover:bg-[#FCCD12] hover:text-[#020B2E] transition"
        >
          <FaFacebookF />
          
        </a>

        <a
          href="#"
          className="w-11 h-11 rounded-full bg-[#07133D] border border-[#1E40AF] flex items-center justify-center hover:bg-[#FCCD12] hover:text-[#020B2E] transition"
        >
          <FaInstagram />
          
        </a>

        <a
          href="#"
          className="w-11 h-11 rounded-full bg-[#07133D] border border-[#1E40AF] flex items-center justify-center hover:bg-[#FCCD12] hover:text-[#020B2E] transition"
        >
          <FaYoutube />
        </a>

        <a
          href="#"
          className="w-11 h-11 rounded-full bg-[#07133D] border border-[#1E40AF] flex items-center justify-center hover:bg-[#FCCD12] hover:text-[#020B2E] transition"
        >
          <FaTiktok />
        </a>

      </div>

    </div>

  </div>

</footer>

      </main>

    </>

  );

}