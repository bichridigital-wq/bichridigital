

"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import { useState } from "react";
import {
  FaYoutube,
  FaFacebook,
  FaTiktok,
  FaInstagram,
  FaLinkedin,
  FaSnapchat,
} from "react-icons/fa";

import { FaXTwitter } from "react-icons/fa6";
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
    role: "Présentateur &collaborateur",
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
    role: "chroniqueur",
    image: "/team/ameth-diao.jpg",
  },
  {
    name: "Mbaye Loum",
    role: "Production,designer Montage & Streaming",
    image: "/team/mbaye-loum.jpg",
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
  const [menuOpen, setMenuOpen] = useState(false);

  const portfolio = [
    "/portfolio1.png",
    "/portfolio2.png",
    "/portfolio3.png",
    "/portfolio4.png",
  
  ];

  return (
    <main className="bg-[#020B2E] text-white">
{/* ================= NAVBAR ================= */}

<nav className="fixed top-0 left-0 w-full z-50 bg-[#020B2E]/95 backdrop-blur-md border-b border-blue-900">
  <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

    {/* Logo */}
    <a href="#" className="flex items-center">
      <Image
        src="/logo.png"
        alt="Bichridigital"
        width={180}
        height={60}
        priority
      />
    </a>

    {/* Menu Desktop */}
    <div className="hidden md:flex items-center gap-8 text-white font-medium">
      <a
        href="/accueil"
        className="hover:text-[#FCCD12] transition"
      >
        Accueil
      </a>

      <a
        href="/services"
        className="hover:text-[#FCCD12] transition"
      >
        Services
      </a>

      <a
        href="/portfolio"
        className="hover:text-[#FCCD12] transition"
      >
        Portfolio
      </a>

      <a
        href="/apropos"
        className="hover:text-[#FCCD12] transition"
      >
        À propos
      </a>

      <a
  href="/contact"
  className="hover:text-[#FCCD12] transition"
>
  Contact
</a>

     <a
  href="/contact"
  className="bg-[#0057FF] hover:bg-blue-700 text-white px-6 py-3 rounded-full font-semibold"
>
  Demander un devis →
</a>
    </div>

    {/* Bouton Hamburger Mobile */}
    <button
      onClick={() => setMenuOpen(!menuOpen)}
      className="md:hidden text-white text-3xl"
    >
      ☰
    </button>

  </div>

  {/* Menu Mobile */}
  {menuOpen && (
    <div className="md:hidden bg-gradient-to-b from-[#020B2E] to-[#00154A] border-t border-blue-900 shadow-2xl">
      <div className="flex flex-col items-center justify-center gap-8 py-10 text-white text-lg font-medium">

        <a
          href="/accueil"
          onClick={() => setMenuOpen(false)}
          className="hover:text-[#FCCD12]"
        >
          Accueil
        </a>

        <a
         href="/services"
          onClick={() => setMenuOpen(false)}
          className="hover:text-[#FCCD12]"
        >
          Services
        </a>

        <a
          href="/portfolio"
          onClick={() => setMenuOpen(false)}
          className="hover:text-[#FCCD12]"
        >
          Portfolio
        </a>

        <a
          href="/apropos"
          onClick={() => setMenuOpen(false)}
          className="hover:text-[#FCCD12]"
        >
          À propos
        </a>

        <a
          href="/contact"
          onClick={() => setMenuOpen(false)}
          className="hover:text-[#FCCD12]"
        >
          Contact
        </a>

        <a
          href="/contact"
          onClick={() => setMenuOpen(false)}
          className="bg-[#0057FF] text-white px-6 py-3 rounded-full font-semibold"
        >
          Demander un devis →
        </a>

      </div>
    </div>
  )}
</nav>

{/* ================= HERO ================= */}

<section
  id="accueil"
  className="relative min-h-screen flex items-center justify-center overflow-hidden"
>

  <video
    autoPlay
    muted
    loop
    playsInline
    className="absolute inset-0 w-full h-full object-cover"
  >
    <source src="/hero-video.mp4" type="video/mp4" />
  </video>

  <div className="absolute inset-0 bg-[#020B2E]/80"></div>

  <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-[#020B2E]/60 to-[#020B2E]"></div>

  <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">

    <Image
      src="/logo.png"
      alt="Bichridigital"
      width={240}
      height={120}
      className="mx-auto mb-8"
    />

    <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
      Bichridigital Agency
    </h1>

    <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto">
      Votre partenaire digital pour une communication impactante
      et des résultats exceptionnels.
    </p>

    <p className="mt-6 text-[#ffcd12] text-lg">
      Communication Digitale • Audiovisuel • Développement Web
    </p>

    <div className="flex flex-wrap justify-center gap-4 mt-10">

      <a
        href="/portfolio"
        className="
        bg-[#ffcd12]
        text-black
        px-8
        py-4
        rounded-full
        font-bold
        hover:scale-105
        transition
        "
      >
        Nos Réalisations
      </a>

      <a
        href="https://wa.me/221773211096"
        className="
        bg-green-500
        px-8
        py-4
        rounded-full
        font-bold
        hover:scale-105
        transition
        "
      >
        WhatsApp
      </a>

    </div>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20">

      <div className="bg-[#071B4D]/70 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/20">
        <h3 className="text-5xl font-bold text-[#ffcd12]">123K+</h3>
        <p className="text-gray-300 mt-2">Abonnés YouTube</p>
      </div>

      <div className="bg-[#071B4D]/70 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/20">
        <h3 className="text-5xl font-bold text-[#ffcd12]">60K+</h3>
        <p className="text-gray-300 mt-2">Abonnés TikTok</p>
      </div>

      <div className="bg-[#071B4D]/70 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/20">
        <h3 className="text-5xl font-bold text-[#ffcd12]">19K+</h3>
        <p className="text-gray-300 mt-2">Abonnés Instagram</p>
      </div>

      <div className="bg-[#071B4D]/70 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/20">
        <h3 className="text-5xl font-bold text-[#ffcd12]">100+</h3>
        <p className="text-gray-300 mt-2">Projets réalisés</p>
      </div>

    </div>

  </div>

</section>

     {/* ================= SERVICES ================= */}

<section
  id="services"
  className="py-24 bg-[#020B2E]"
>

  <div className="max-w-7xl mx-auto px-6">

    <h2 className="text-5xl font-bold text-center text-white mb-4">
      Nos <span className="text-[#ffcd12]">Services</span>
    </h2>

    <p className="text-center text-gray-300 mb-16 max-w-3xl mx-auto">
      Depuis 2019, Bichridigital accompagne entreprises,
      associations et institutions dans leur visibilité digitale.
    </p>

    <div className="grid md:grid-cols-4 gap-8">

      {[
        {
          icon:"🌐",
          title:"Développement Web",
          desc:"Sites vitrines, e-commerce et applications web modernes."
        },

        {
          icon:"🎨",
          title:"Design Graphique",
          desc:"Affiches, logos, chartes graphiques et branding."
        },

        {
          icon:"🎥",
          title:"Audiovisuel",
          desc:"Captation, montage vidéo et production professionnelle."
        },

        {
          icon:"📡",
          title:"Streaming Live",
          desc:"Diffusion Facebook, YouTube, TikTok et événements."
        },

        {
          icon:"📷",
          title:"Photographie",
          desc:"Photos événementielles et commerciales."
        },

        {
          icon:"📱",
          title:"Community Management",
          desc:"Gestion et animation des réseaux sociaux."
        },

        {
          icon:"📈",
          title:"Marketing Digital",
          desc:"Campagnes publicitaires et visibilité."
        },

        {
          icon:"💡",
          title:"Communication",
          desc:"Conseil stratégique et accompagnement."
        }

      ].map((service) => (

        <motion.div
          key={service.title}
          whileHover={{
            scale:1.05,
            y:-10
          }}
          className="
          bg-[#071B4D]
          rounded-3xl
          border
          border-blue-500/20
          p-8
          shadow-xl
          "
        >

          <div className="text-5xl mb-4">
            {service.icon}
          </div>

          <h3 className="text-xl font-bold text-white mb-4">
            {service.title}
          </h3>

          <p className="text-gray-300">
            {service.desc}
          </p>

        </motion.div>

      ))}

    </div>

  </div>

</section>


      {/* ================= A PROPOS ================= */}

<section
  id="apropos"
  className="py-24 bg-[#020B2E]"
>

  <div className="max-w-7xl mx-auto px-6">

    <div
      className="
      bg-gradient-to-r
      from-[#0024FF]
      to-[#071B4D]
      rounded-3xl
      p-14
      text-center
      "
    >

      <h2 className="text-5xl font-bold text-white mb-6">
        Plus de 6 ans d'expérience
      </h2>

      <p className="text-xl text-gray-200 max-w-4xl mx-auto">
        Bichridigital Agency accompagne les entreprises,
        associations, collectivités et entrepreneurs
        dans leur communication digitale depuis 2019.
      </p>

      <div className="grid md:grid-cols-3 gap-8 mt-12">

        <div>
          <h3 className="text-5xl font-bold text-[#ffcd12]">
            123K+
          </h3>
          <p>YouTube</p>
        </div>

        <div>
          <h3 className="text-5xl font-bold text-[#ffcd12]">
            60K+
          </h3>
          <p>TikTok</p>
        </div>

        <div>
          <h3 className="text-5xl font-bold text-[#ffcd12]">
            19K+
          </h3>
          <p>Instagram</p>
        </div>

      </div>

    </div>

  </div>

</section>

    {/* ================= PORTFOLIO ================= */}

<section
  id="portfolio"
  className="py-24 bg-[#020B2E]"
>

  <div className="max-w-7xl mx-auto px-6">

    <h2 className="text-5xl font-bold text-center text-white mb-4">
      Nos <span className="text-[#ffcd12]">Réalisations</span>
    </h2>

    <p className="text-center text-gray-300 mb-16 max-w-3xl mx-auto">
      Découvrez quelques projets réalisés par Bichridigital Agency
      dans le domaine du design graphique, de la communication
      digitale et de la production audiovisuelle.
    </p>

    <div className="grid md:grid-cols-3 gap-8">

      {portfolio.map((img, index) => (

        <motion.div
          key={index}
          whileHover={{
            scale:1.05,
            y:-10
          }}
          className="
          overflow-hidden
          rounded-3xl
          bg-[#071B4D]
          border
          border-blue-500/20
          shadow-2xl
          "
        >

          <Image
            src={img}
            alt={`Projet ${index + 1}`}
            width={600}
            height={800}
            className="
            w-full
            h-80
            object-cover
            transition-all
            duration-700
            hover:scale-110
            "
          />

          <div className="p-6">

            <h3 className="text-white font-bold text-xl">
              Réalisation #{index + 1}
            </h3>

            <p className="text-gray-300 mt-3">
              Projet réalisé par Bichridigital Agency.
            </p>

          </div>

        </motion.div>

      ))}

    </div>

  </div>

</section>

{/* ================= BICHRIDIGITAL TV ================= */}

<section
  className="
  py-24
  bg-gradient-to-r
  from-[#0024FF]
  to-[#071B4D]
  "
>

  <div className="max-w-7xl mx-auto px-6">

    <div className="grid md:grid-cols-2 gap-16 items-center">

      <div>

        <h2 className="text-5xl font-bold text-white mb-6">
          Bichridigital TV
        </h2>

        <p className="text-xl text-gray-200 leading-8">
          Notre média digital dédié aux émissions,
          interviews, événements, reportages et
          diffusions en direct.
        </p>

        <ul className="space-y-4 mt-8 text-white">

          <li>✅ Interviews exclusives</li>
          <li>✅ Streaming Live</li>
          <li>✅ Émissions culturelles</li>
          <li>✅ Couverture événementielle</li>
          <li>✅ Production audiovisuelle</li>

        </ul>

        <a
          href="https://www.youtube.com/@bichridigital"
          target="_blank"
          className="
          inline-block
          mt-10
          bg-[#ffcd12]
          text-black
          px-8
          py-4
          rounded-full
          font-bold
          "
        >
          Voir notre chaîne YouTube
        </a>

      </div>

      <div
        className="
        bg-white/10
        backdrop-blur-md
        rounded-3xl
        p-10
        border
        border-white/10
        "
      >

        <h3 className="text-4xl font-bold text-white mb-8 text-center">
          Nos Forces
        </h3>

        <div className="space-y-5 text-white">

          <p>🎥 Production Audiovisuelle</p>
          <p>📺 Streaming Live</p>
          <p>📱 Réseaux Sociaux</p>
          <p>🎨 Design Graphique</p>
          <p>🌐 Développement Web</p>

        </div>

      </div>

    </div>

  </div>

</section>

{/* ================= TEMOIGNAGES ================= */}

<section
  className="py-24 bg-[#020B2E]"
>

  <div className="max-w-7xl mx-auto px-6">

    <h2 className="text-5xl font-bold text-center text-white mb-16">
      Témoignages Clients
    </h2>

    <div className="grid md:grid-cols-3 gap-8">

      <motion.div
        whileHover={{
          scale:1.03,
          y:-10
        }}
        className="
        bg-[#071B4D]
        p-8
        rounded-3xl
        border
        border-blue-500/20
        "
      >

        <p className="italic text-gray-300">
          "Bichridigital a complètement transformé notre communication."
        </p>

        <h3 className="mt-6 text-[#ffcd12] text-xl">
          ★★★★★
        </h3>

      </motion.div>

      <motion.div
        whileHover={{
          scale:1.03,
          y:-10
        }}
        className="
        bg-[#071B4D]
        p-8
        rounded-3xl
        border
        border-blue-500/20
        "
      >

        <p className="italic text-gray-300">
          "Une équipe sérieuse, créative et professionnelle."
        </p>

        <h3 className="mt-6 text-[#ffcd12] text-xl">
          ★★★★★
        </h3>

      </motion.div>

      <motion.div
        whileHover={{
          scale:1.03,
          y:-10
        }}
        className="
        bg-[#071B4D]
        p-8
        rounded-3xl
        border
        border-blue-500/20
        "
      >

        <p className="italic text-gray-300">
          "Des affiches et productions de très haute qualité."
        </p>

        <h3 className="mt-6 text-[#ffcd12] text-xl">
          ★★★★★
        </h3>

      </motion.div>

    </div>

  </div>

</section>

      
{/* ================= PARTENAIRES ================= */}

<section className="py-24 bg-[#020B2E] overflow-hidden">

  <div className="max-w-7xl mx-auto px-6">

    <h2 className="text-5xl font-bold text-center text-white mb-4">
      Nos <span className="text-[#ffcd12]">Partenaires</span>
    </h2>

    <p className="text-center text-gray-300 mb-16">
      Ils nous font confiance
    </p>

    <div className="overflow-hidden">

      <div className="partners-track flex items-center gap-16">

        <img src="/agro-kayor.png" alt="Agro Kayor" className="h-28 object-contain" />
        <img src="/sonacos.png" alt="Sonacos" className="h-28 object-contain" />
        <img src="/kurel-tuuba.png" alt="Kurel Tuuba" className="h-28 object-contain" />
        <img src="/tbs.png" alt="TBS" className="h-28 object-contain" />
        <img src="/and-defar.png" alt="And Defar" className="h-28 object-contain" />
        <img src="/sarr-sunu-gp.png" alt="Sarr Sunu GP" className="h-28 object-contain" />

        {/* Duplication pour boucle infinie */}
        <img src="/agro-kayor.png" alt="Agro Kayor" className="h-28 object-contain" />
        <img src="/sonacos.png" alt="Sonacos" className="h-28 object-contain" />
        <img src="/kurel-tuuba.png" alt="Kurel Tuuba" className="h-28 object-contain" />
        <img src="/tbs.png" alt="TBS" className="h-28 object-contain" />
        <img src="/and-defar.png" alt="And Defar" className="h-28 object-contain" />
        <img src="/sarr-sunu-gp.png" alt="Sarr Sunu GP" className="h-28 object-contain" />

      </div>

    </div>

  </div>

</section>
{/* TEAM */}
<section className="py-24 bg-[#020B2E]">
  <div className="max-w-7xl mx-auto px-6">
    <div className="text-center mb-16">
      <div className="flex items-center justify-center gap-4 mb-4">
        <span className="w-10 h-[2px] bg-[#FCCD12]"></span>
        <span className="text-[#FCCD12] text-sm font-black uppercase tracking-widest">
          Notre Équipe
        </span>
        <span className="w-10 h-[2px] bg-[#FCCD12]"></span>
      </div>

      <h2 className="text-4xl md:text-5xl font-black text-white">
        Les visages derrière{" "}
        <span className="text-[#FCCD12]">
          Bichridigital
        </span>
      </h2>

      <p className="mt-5 text-gray-400 max-w-3xl mx-auto leading-8">
        Une équipe passionnée par la communication digitale,
        l’audiovisuel, la photographie, le streaming live et la création
        de contenus professionnels.
      </p>
    </div>

    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {teamMembers.map((member, index) => (
        <div
          key={index}
          className="group rounded-[28px] bg-[#071542] border border-blue-500/30 overflow-hidden hover:border-[#FCCD12] hover:-translate-y-2 transition-all duration-300 shadow-[0_0_40px_rgba(0,87,255,0.12)]"
        >
          <div className="relative h-[280px] overflow-hidden bg-[#0B1C54]">
            <img
              src={member.image}
              alt={member.name}
              className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#020B2E] via-[#020B2E]/20 to-transparent"></div>
          </div>

          <div className="p-6 text-center">
            <h3 className="text-xl font-black text-white group-hover:text-[#FCCD12] transition">
              {member.name}
            </h3>

            <p className="mt-2 text-gray-400 text-sm">
              {member.role}
            </p>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>
{/* BICHRISTORE */}
<section className="py-24 bg-[#020B2E]">
  <div className="max-w-7xl mx-auto px-6">
    <div className="grid lg:grid-cols-2 gap-14 items-center">
      
      {/* Texte */}
      <div>
        <div className="flex items-center gap-4 mb-5">
          <span className="w-10 h-[2px] bg-[#FCCD12]"></span>
          <span className="text-[#FCCD12] text-sm font-black uppercase tracking-widest">
            BichriStore
          </span>
        </div>

        <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
          Votre boutique pour vos besoins{" "}
          <span className="text-[#FCCD12]">
            tech & lifestyle.
          </span>
        </h2>

        <p className="mt-6 text-gray-300 text-lg leading-8">
          BichriStore vous propose la vente d’ordinateurs, de t-shirts,
          casquettes, pulls et divers articles adaptés aux entreprises,
          événements, associations et particuliers.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-300">
            Ordinateurs
          </span>
          <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-300">
            T-shirts
          </span>
          <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-300">
            Casquettes
          </span>
          <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-300">
            Pulls
          </span>
        </div>

        <Link
          href="/boutique"
          className="inline-block mt-10 bg-[#FCCD12] text-[#020B2E] px-9 py-4 rounded-full font-black hover:scale-105 transition"
        >
          Découvrir la boutique →
        </Link>
      </div>

      {/* Cartes produits */}
      <div className="grid sm:grid-cols-2 gap-6">
        {storeItems.map((item) => (
          <div
            key={item.title}
            className="rounded-[26px] bg-[#071542] border border-blue-500/30 p-7 hover:border-[#FCCD12] hover:-translate-y-2 transition-all duration-300 shadow-[0_0_40px_rgba(0,87,255,0.12)]"
          >
            <div className="w-16 h-16 rounded-2xl bg-[#1738C8] text-[#FCCD12] flex items-center justify-center font-black text-xl mb-6">
              {item.icon}
            </div>

            <span className="text-[#FCCD12] text-sm font-bold">
              {item.tag}
            </span>

            <h3 className="mt-3 text-2xl font-black text-white">
              {item.title}
            </h3>

            <p className="mt-4 text-gray-400 leading-7">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  </div>
</section>
{/* ================= CONTACT ================= */}

<section
  id="contact"
  className="
  py-24
  bg-gradient-to-r
  from-[#0024FF]
  via-[#071B4D]
  to-[#020B2E]
  "
>

  <div className="max-w-7xl mx-auto px-6">

    <div className="text-center mb-16">

      <h2 className="text-5xl font-bold text-white mb-4">
        Contactez-nous
      </h2>

      <p className="text-xl text-gray-200">
        Discutons ensemble de votre prochain projet digital.
      </p>

    </div>

    <div className="grid md:grid-cols-3 gap-8">

      <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/10">

        <h3 className="text-2xl font-bold mb-4">
          📍 Adresse
        </h3>

        <p>
          Studio Iba Asta Niang
          <br />
          Ndiagne - Louga - Sénégal
        </p>

      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/10">

        <h3 className="text-2xl font-bold mb-4">
          📞 Téléphone
        </h3>

        <p>
          +221 77 321 10 96
        </p>

      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/10">

        <h3 className="text-2xl font-bold mb-4">
          ✉️ Email
        </h3>

        <p>
          bichridigital@gmail.com
        </p>

      </div>

    </div>

    <div className="text-center mt-12">

      <a
        href="https://wa.me/221773211096"
        target="_blank"
        className="
        inline-block
        bg-[#ffcd12]
        text-black
        px-10
        py-5
        rounded-full
        font-bold
        hover:scale-105
        transition
        "
      >
        Écrire sur WhatsApp
      </a>

    </div>

  </div>

</section>

{/* ================= FOOTER PREMIUM ================= */}

<footer className="bg-[#01071F] text-white pt-20">

  <div className="max-w-7xl mx-auto px-6">

    <div className="grid md:grid-cols-4 gap-12">

      {/* Colonne 1 */}
      <div>

        <Image
          src="/logo.png"
          alt="Bichridigital"
          width={220}
          height={80}
        />

        <p className="mt-6 text-gray-400">
          Votre partenaire digital pour une communication
          impactante et des résultats exceptionnels.
        </p>

        <div className="flex gap-5 mt-8 text-3xl">

          <a href="https://www.youtube.com/@bichridigital" target="_blank">
            <FaYoutube className="hover:text-red-500 transition" />
          </a>

          <a href="https://www.facebook.com/bichriartprod18Safar" target="_blank">
            <FaFacebook className="hover:text-blue-500 transition" />
          </a>

          <a href="https://www.tiktok.com/@bichridigitalagency" target="_blank">
            <FaTiktok />
          </a>

          <a href="https://www.instagram.com/bichridigitalagency" target="_blank">
            <FaInstagram className="hover:text-pink-500 transition" />
          </a>

        </div>

      </div>

      {/* Colonne 2 */}
      <div>

        <h3 className="font-bold text-xl mb-6">
          Services
        </h3>

        <ul className="space-y-3 text-gray-400">

          <li>Communication Digitale</li>
          <li>Marketing Digital</li>
          <li>Développement Web</li>
          <li>Production Audiovisuelle</li>
          <li>Streaming Live</li>
          <li>Design Graphique</li>

        </ul>

      </div>

      {/* Colonne 3 */}
      <div>

        <h3 className="font-bold text-xl mb-6">
          Réseaux
        </h3>

        <ul className="space-y-3 text-gray-400">

          <li>YouTube</li>
          <li>Facebook</li>
          <li>TikTok</li>
          <li>Instagram</li>
          <li>X (Twitter)</li>
          <li>LinkedIn</li>

        </ul>

      </div>

      {/* Colonne 4 */}
      <div>

        <h3 className="font-bold text-xl mb-6">
          Contact
        </h3>

        <ul className="space-y-4 text-gray-400">

          <li>📍 Ndiagne - Louga</li>
          <li>📞 +221 77 321 10 96</li>
          <li>✉️ bichridigital@gmail.com</li>
          <li>🕒 Lun - Ven : 08h - 18h</li>

        </ul>

      </div>

    </div>

    <div className="border-t border-blue-900 mt-16 pt-8 flex flex-col md:flex-row justify-between text-gray-500">

      <p>
        © 2026 Bichridigital Agency - Tous droits réservés.
      </p>

      <div className="flex gap-6 mt-4 md:mt-0">
        <a href="#">Mentions légales</a>
        <a href="#">Confidentialité</a>
      </div>

    </div>

  </div>

</footer>
<a
  href="https://wa.me/221773211096"
  target="_blank"
  className="
  fixed
  bottom-6
  right-6
  bg-green-500
  text-white
  px-6
  py-4
  rounded-full
  shadow-2xl
  z-50
  hover:scale-110
  transition
  "
>
  WhatsApp
</a>
    </main>
  );
}
