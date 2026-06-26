"use client";

import { motion } from "framer-motion";

export default function ContactMap() {
  return (
    <section className="max-w-7xl mx-auto px-6 pb-24">

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >

        <div className="text-center mb-14">

          <span className="inline-block bg-[#FCCD12]/10 border border-[#FCCD12]/30 text-[#FCCD12] px-5 py-2 rounded-full font-semibold mb-5">
            📍 NOTRE LOCALISATION
          </span>

          <h2 className="text-4xl md:text-5xl font-black text-white">
            Venez nous rendre
            <span className="text-[#FCCD12]"> visite</span>
          </h2>

          <p className="text-gray-300 mt-6 max-w-2xl mx-auto leading-8">
            Notre studio est situé à Ndiagne, dans la région de Louga.
            Nous serons heureux de vous accueillir pour échanger sur
            votre projet.
          </p>

        </div>

        <div className="overflow-hidden rounded-[35px] border border-[#1E40AF] shadow-2xl">

          <iframe
            src="https://www.google.com/maps?q=Ndiagne,+Louga,+Senegal&output=embed"
            width="100%"
            height="500"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Carte Google Maps"
          />

        </div>

        {/* Informations supplémentaires */}

        <div className="grid md:grid-cols-3 gap-6 mt-10">

          <div className="bg-[#07133D] border border-[#1E40AF] rounded-3xl p-6 text-center">

            <h3 className="text-[#FCCD12] font-bold text-xl mb-3">
              📍 Adresse
            </h3>

            <p className="text-gray-300">
              Studio Bichridigital
              <br />
              Ndiagne - Louga
              <br />
              Sénégal
            </p>

          </div>

          <div className="bg-[#07133D] border border-[#1E40AF] rounded-3xl p-6 text-center">

            <h3 className="text-[#FCCD12] font-bold text-xl mb-3">
              🕒 Horaires
            </h3>

            <p className="text-gray-300">
              Lundi - Samedi
              <br />
              09h00 - 19h00
            </p>

          </div>

          <div className="bg-[#07133D] border border-[#1E40AF] rounded-3xl p-6 text-center">

            <h3 className="text-[#FCCD12] font-bold text-xl mb-3">
              🚗 Accès
            </h3>

            <p className="text-gray-300">
              Parking disponible
              <br />
              Accueil sur rendez-vous
            </p>

          </div>

        </div>

      </motion.div>

    </section>
  );
}