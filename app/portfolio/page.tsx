"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

import Navbar from "../components/navbar";

/* ================= IMAGES ================= */

const portfolio = [
  "/portfolio1.png",
  "/portfolio2.png",
  "/portfolio3.png",
  "/portfolio4.png",
  "/portfolio5.png",
];

/* ================= CATÉGORIES ================= */

const categories = [
  "Tous",
  "Mariages",
  "Photographie",
  "Audiovisuel",
  "Streaming Live",
  "Web",
  "Graphisme",
];

export default function PortfolioPage() {

  const [active, setActive] = useState("Tous");

  return (
    <>

      <Navbar />

      <main className="bg-[#020B2E] text-white overflow-x-hidden">

        {/* ================= HERO ================= */}

        <section className="relative min-h-[85vh] flex items-center overflow-hidden">

          {/* Image */}

          <Image
            src="/hero.jpg"
            alt="Portfolio Bichridigital"
            fill
            priority
            className="object-cover"
          />

          {/* Overlay */}

          <div className="absolute inset-0 bg-[#020B2E]/85"></div>

          <div className="absolute inset-0 bg-gradient-to-r from-[#020B2E] via-[#020B2E]/70 to-[#020B2E]"></div>

          {/* Contenu */}

          <div className="relative z-20 max-w-7xl mx-auto px-6 w-full">

            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl"
            >

              <span className="inline-flex items-center gap-2 rounded-full border border-[#FCCD12]/40 bg-[#FCCD12]/10 px-5 py-2 text-[#FCCD12] font-semibold mb-8">

                🎬 NOS RÉALISATIONS

              </span>

              <h1 className="text-5xl md:text-7xl font-black leading-tight">

                Notre

                <br />

                <span className="text-[#FCCD12]">

                  Portfolio

                </span>

              </h1>

              <p className="text-gray-200 text-xl leading-9 mt-8 max-w-2xl">

                Découvrez une sélection de nos réalisations
                en audiovisuel, photographie,
                streaming live, développement web
                et graphisme.

              </p>

              <div className="flex gap-5 mt-12">

                <Link
                  href="/contact"
                  className="bg-[#FCCD12] text-[#020B2E] font-bold px-8 py-4 rounded-full hover:bg-yellow-400 transition hover:scale-105"
                >
                  Demander un devis →
                </Link>

                <Link
                  href="/apropos"
                  className="border border-white/20 px-8 py-4 rounded-full backdrop-blur-md hover:border-[#FCCD12]"
                >
                  En savoir plus
                </Link>

              </div>

            </motion.div>

          </div>

        </section>
                {/* ================= FILTRES ================= */}

        <section className="py-24">

          <div className="max-w-7xl mx-auto px-6">

            <div className="text-center mb-14">

              <span className="inline-block bg-[#FCCD12]/10 border border-[#FCCD12]/30 text-[#FCCD12] px-5 py-2 rounded-full text-sm font-semibold mb-5">

                NOS RÉALISATIONS

              </span>

              <h2 className="text-5xl font-black">

                Explorez notre

                <span className="text-[#FCCD12]">

                  {" "}Portfolio

                </span>

              </h2>

              <p className="text-gray-300 mt-6 max-w-3xl mx-auto leading-8">

                Découvrez nos réalisations en audiovisuel,
                photographie, communication digitale,
                streaming live, graphisme et développement web.

              </p>

            </div>

            {/* Boutons */}

            <div className="flex justify-center">

              <div className="flex flex-wrap justify-center gap-4 bg-[#07133D] border border-[#1E40AF] rounded-full p-3">

                {categories.map((item) => (

                  <button
                    key={item}
                    onClick={() => setActive(item)}
                    className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                      active === item
                        ? "bg-[#FCCD12] text-[#020B2E] shadow-lg"
                        : "text-white hover:text-[#FCCD12]"
                    }`}
                  >
                    {item}
                  </button>

                ))}

              </div>

            </div>

          </div>

        </section>

        {/* ================= GALERIE ================= */}
        <section className="pb-24">

  <div className="max-w-7xl mx-auto px-6">

    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

      {portfolio.map((img, index) => (

        <motion.div
          key={index}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.5,
            delay: index * 0.08,
          }}
          whileHover={{
            y: -10,
            scale: 1.02,
          }}
          className="
          group
          relative
          overflow-hidden
          rounded-[30px]
          border
          border-[#1E40AF]
          bg-[#07133D]
          shadow-2xl
          "
        >

          {/* IMAGE */}

          <Image
            src={img}
            alt={`Portfolio ${index + 1}`}
            width={700}
            height={900}
            className="
            w-full
            h-[420px]
            object-cover
            transition-all
            duration-700
            group-hover:scale-110
            "
          />

          {/* OVERLAY */}

          <div
            className="
            absolute
            inset-0
            bg-gradient-to-t
            from-[#020B2E]
            via-[#020B2E]/40
            to-transparent
            opacity-0
            group-hover:opacity-100
            transition-all
            duration-500
            "
          />

          {/* CONTENU */}

          <div
            className="
            absolute
            bottom-0
            left-0
            w-full
            p-6
            translate-y-8
            opacity-0
            group-hover:translate-y-0
            group-hover:opacity-100
            transition-all
            duration-500
            "
          >

            <span
              className="
              inline-block
              bg-[#FCCD12]
              text-[#020B2E]
              text-xs
              font-bold
              px-3
              py-1
              rounded-full
              mb-3
              "
            >
              Bichridigital
            </span>

            <h3 className="text-2xl font-bold">

              Projet {index + 1}

            </h3>

            <p className="text-gray-200 mt-2">

              Communication digitale,
              Production audiovisuelle
              & Design graphique.

            </p>

          </div>

        </motion.div>

      ))}

    </div>

  </div>

</section>

{/* ================= CTA ================= */}
        {/* ================= CTA ================= */}

        <section className="max-w-7xl mx-auto px-6 pb-24">

          <div className="relative overflow-hidden rounded-[40px] border border-[#1E40AF] shadow-[0_20px_80px_rgba(0,0,0,.45)]">

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

            <div className="absolute inset-0 bg-[#020B2E]/90"></div>

            <div className="absolute inset-0 bg-gradient-to-r from-[#020B2E] via-[#020B2E]/75 to-[#020B2E]"></div>

            {/* Contenu */}

            <div className="relative z-20 text-center px-8 py-28">

              <span className="inline-flex items-center gap-2 rounded-full border border-[#FCCD12]/40 bg-[#FCCD12]/10 px-6 py-2 text-sm font-semibold text-[#FCCD12]">

                🚀 Créons votre prochain projet

              </span>

              <h2 className="mt-8 text-5xl md:text-7xl font-black leading-tight">

                Votre projet

                <br />

                <span className="text-[#FCCD12]">

                  mérite l'excellence.

                </span>

              </h2>

              <p className="max-w-3xl mx-auto mt-8 text-lg leading-9 text-gray-200">

                Confiez-nous votre communication digitale,
                votre production audiovisuelle,
                votre photographie,
                votre streaming live
                ou votre développement web.

              </p>

              <div className="flex flex-wrap justify-center gap-5 mt-12">

                <Link
                  href="/contact"
                  className="bg-[#FCCD12] text-[#020B2E] px-10 py-5 rounded-full font-bold text-lg hover:bg-yellow-400 transition-all duration-300 hover:scale-105 shadow-[0_0_35px_rgba(252,205,18,.45)]"
                >
                  Demander un devis →
                </Link>

                <Link
                  href="/services"
                  className="border border-white/20 bg-white/5 px-10 py-5 rounded-full text-lg backdrop-blur-md hover:border-[#FCCD12] hover:text-[#FCCD12] transition-all duration-300"
                >
                  Découvrir nos services
                </Link>

              </div>

            </div>

          </div>

        </section>

      </main>

    </>

  );

}