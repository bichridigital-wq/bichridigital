"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function ContactCTA() {
  return (
    <section className="max-w-7xl mx-auto px-6 pb-24">

      <motion.div
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative overflow-hidden rounded-[40px] border border-[#1E40AF] shadow-[0_20px_80px_rgba(0,0,0,.45)]"
      >

        {/* VIDEO */}

        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover scale-110"
        >
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>

        {/* Overlay */}

        <div className="absolute inset-0 bg-[#020B2E]/88"></div>

        {/* Dégradé */}

        <div className="absolute inset-0 bg-gradient-to-r from-[#020B2E] via-[#020B2E]/75 to-[#020B2E]"></div>

        {/* Lumière */}

        <div className="absolute -top-32 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-[#FCCD12]/20 blur-[120px]"></div>

        {/* Contenu */}

        <div className="relative z-20 px-8 py-28 text-center">

          <span className="inline-flex items-center gap-2 rounded-full border border-[#FCCD12]/40 bg-[#FCCD12]/10 px-6 py-2 text-sm font-semibold text-[#FCCD12]">

            🚀 Construisons ensemble votre projet

          </span>

          <h2 className="mt-8 text-5xl md:text-7xl font-black leading-tight text-white">

            Une idée.

            <br />

            <span className="text-[#FCCD12]">

              Un projet.

            </span>

            <br />

            Une réussite.

          </h2>

          <p className="mx-auto mt-8 max-w-3xl text-lg leading-9 text-gray-200">

            Communication digitale • Production audiovisuelle •
            Développement web • Streaming Live • Photographie

          </p>

          <div className="mt-12 flex flex-wrap justify-center gap-5">

            <Link
              href="#formulaire"
              className="rounded-full bg-[#FCCD12] px-10 py-5 text-lg font-bold text-[#020B2E] transition-all duration-300 hover:scale-105 hover:bg-yellow-400 shadow-[0_0_35px_rgba(252,205,18,.45)]"
            >
              Demander un devis →
            </Link>

            <Link
              href="tel:+221771433900"
              className="rounded-full border border-white/20 bg-white/5 px-10 py-5 text-lg font-semibold text-white backdrop-blur-md transition-all duration-300 hover:border-[#FCCD12] hover:text-[#FCCD12]"
            >
              📞 Nous appeler
            </Link>

          </div>

        </div>

      </motion.div>

    </section>
  );
}