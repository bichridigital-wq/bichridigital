"use client";

import { motion } from "framer-motion";

export default function ContactForm() {
  return (
    <section
      id="formulaire"
      className="max-w-7xl mx-auto px-6 py-24"
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="bg-[#07133D] border border-[#1E40AF] rounded-[35px] p-8 md:p-12"
      >
        <div className="text-center mb-12">

          <span className="inline-block bg-[#FCCD12]/10 border border-[#FCCD12]/30 text-[#FCCD12] px-5 py-2 rounded-full font-semibold mb-5">
            FORMULAIRE DE CONTACT
          </span>

          <h2 className="text-4xl md:text-5xl font-black text-white">
            Parlez-nous de
            <span className="text-[#FCCD12]"> votre projet</span>
          </h2>

          <p className="text-gray-300 mt-6 max-w-2xl mx-auto">
            Remplissez le formulaire ci-dessous et notre équipe
            vous répondra dans les meilleurs délais.
          </p>

        </div>

        <form className="space-y-6">

          <div className="grid md:grid-cols-2 gap-6">

            <input
              type="text"
              placeholder="Nom complet"
              className="w-full bg-[#020B2E] border border-[#1E40AF] rounded-2xl px-6 py-4 text-white placeholder-gray-400 focus:border-[#FCCD12] outline-none transition"
            />

            <input
              type="email"
              placeholder="Adresse Email"
              className="w-full bg-[#020B2E] border border-[#1E40AF] rounded-2xl px-6 py-4 text-white placeholder-gray-400 focus:border-[#FCCD12] outline-none transition"
            />

          </div>

          <div className="grid md:grid-cols-2 gap-6">

            <input
              type="tel"
              placeholder="Téléphone"
              className="w-full bg-[#020B2E] border border-[#1E40AF] rounded-2xl px-6 py-4 text-white placeholder-gray-400 focus:border-[#FCCD12] outline-none transition"
            />

            <input
              type="text"
              placeholder="Sujet"
              className="w-full bg-[#020B2E] border border-[#1E40AF] rounded-2xl px-6 py-4 text-white placeholder-gray-400 focus:border-[#FCCD12] outline-none transition"
            />

          </div>

          <textarea
            rows={7}
            placeholder="Décrivez votre projet..."
            className="w-full bg-[#020B2E] border border-[#1E40AF] rounded-2xl px-6 py-4 text-white placeholder-gray-400 resize-none focus:border-[#FCCD12] outline-none transition"
          />

          <div className="text-center pt-4">

            <button
              type="submit"
              className="bg-[#FCCD12] text-[#020B2E] px-10 py-4 rounded-full font-bold text-lg hover:bg-yellow-400 hover:scale-105 transition-all duration-300 shadow-[0_0_30px_rgba(252,205,18,.35)]"
            >
              Envoyer le message →
            </button>

          </div>

        </form>

      </motion.div>
    </section>
  );
}