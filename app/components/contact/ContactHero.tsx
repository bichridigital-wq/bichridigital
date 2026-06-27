"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function ContactHero() {
  return (
    <section className="relative min-h-[70vh] flex items-center overflow-hidden">

      <Image
        src="/hero.jpg"
        alt="Contact Bichridigital"
        fill
        priority
        className="object-cover"
      />

      <div className="absolute inset-0 bg-[#020B2E]/85" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">

        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .8 }}
        >
          <span className="bg-[#FCCD12]/20 text-[#FCCD12] px-5 py-2 rounded-full font-semibold">
            📞 CONTACT
          </span>

          <h1 className="text-5xl md:text-7xl font-black mt-8">
            Parlons de votre
            <span className="text-[#FCCD12]"> projet.</span>
          </h1>

          <p className="text-gray-300 text-xl mt-8 max-w-3xl">
            Notre équipe est à votre disposition pour tous vos projets
            de communication, audiovisuel, photographie,
            streaming et développement web.
          </p>
        </motion.div>

      </div>
    </section>
  );
}