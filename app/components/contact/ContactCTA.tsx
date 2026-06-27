"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function ContactCTA() {
  return (
    <section className="py-24 bg-[#020B2E]">

      <div className="max-w-7xl mx-auto px-6">

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="
            relative
            overflow-hidden
            rounded-[45px]
            min-h-[450px]
            flex
            items-center
            justify-center
          "
        >
          {/* Vidéo */}

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

          <div className="absolute inset-0 bg-[#020B2E]/85"></div>

          {/* Contenu */}

          <div className="relative z-10 text-center px-6">

            <h2 className="text-5xl md:text-7xl font-black leading-tight">

              Donnons vie

              <br />

              <span className="text-[#FCCD12]">

                à vos idées.

              </span>

            </h2>

            <p className="text-gray-200 text-xl mt-8 max-w-3xl mx-auto">

              Communication digitale • Audiovisuel •
              Développement Web • Streaming Live

            </p>

            <div className="flex flex-wrap justify-center gap-5 mt-12">

              <Link
                href="tel:+221771433900"
                className="
                  bg-[#FCCD12]
                  text-[#020B2E]
                  font-bold
                  px-10
                  py-5
                  rounded-full
                  hover:scale-105
                  transition-all
                  duration-300
                "
              >
                📞 Nous appeler
              </Link>

              <Link
                href="/portfolio"
                className="
                  border
                  border-white/20
                  px-10
                  py-5
                  rounded-full
                  backdrop-blur-md
                  hover:border-[#FCCD12]
                  transition-all
                "
              >
                Voir nos réalisations
              </Link>

            </div>

          </div>

        </motion.div>

      </div>

    </section>
  );
}