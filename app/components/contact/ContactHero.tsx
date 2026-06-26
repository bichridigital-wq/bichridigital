"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ContactHero() {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">

      {/* Image de fond */}

      <Image
        src="/hero.jpg"
        alt="Bichridigital Contact"
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

          <span className="inline-flex items-center gap-2 bg-[#FCCD12]/10 border border-[#FCCD12]/30 text-[#FCCD12] px-5 py-2 rounded-full font-semibold mb-8">
            📞 CONTACTEZ-NOUS
          </span>

          <h1 className="text-5xl md:text-7xl font-black leading-tight text-white">

            Donnons vie

            <br />

            <span className="text-[#FCCD12]">

              à vos idées.

            </span>

          </h1>

          <p className="text-gray-300 text-xl leading-9 mt-8">

            Vous avez un projet de communication,
            audiovisuel, photographie,
            streaming live ou développement web ?

            <br />
            <br />

            Notre équipe est prête à vous accompagner.

          </p>

          <div className="flex flex-wrap gap-5 mt-12">

            <Link
              href="#formulaire"
              className="bg-[#FCCD12] text-[#020B2E] px-8 py-4 rounded-full font-bold hover:bg-yellow-400 transition-all duration-300 hover:scale-105"
            >
              Demander un devis →
            </Link>

            <Link
              href="tel:+221771433900"
              className="border border-white/20 text-white px-8 py-4 rounded-full backdrop-blur-md hover:border-[#FCCD12] transition-all"
            >
              📞 Nous appeler
            </Link>

          </div>

          {/* Statistiques */}

          <div className="grid grid-cols-3 gap-8 mt-20">

            <div>

              <h3 className="text-4xl font-black text-[#FCCD12]">

                250+

              </h3>

              <p className="text-gray-300 mt-2">

                Projets réalisés

              </p>

            </div>

            <div>

              <h3 className="text-4xl font-black text-[#FCCD12]">

                123K

              </h3>

              <p className="text-gray-300 mt-2">

                Abonnés YouTube

              </p>

            </div>

            <div>

              <h3 className="text-4xl font-black text-[#FCCD12]">

                Depuis 2019

              </h3>

              <p className="text-gray-300 mt-2">

                À votre service

              </p>

            </div>

          </div>

        </motion.div>

      </div>

    </section>
  );
}