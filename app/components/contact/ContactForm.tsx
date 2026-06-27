"use client";

import { motion } from "framer-motion";

export default function ContactForm() {
  return (
    <section
      id="formulaire"
      className="py-24 bg-gradient-to-b from-[#020B2E] to-[#07184d]"
    >
      <div className="max-w-5xl mx-auto px-6">

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="
            bg-white/5
            backdrop-blur-lg
            border border-white/10
            rounded-[40px]
            p-10 md:p-16
          "
        >
          <h2 className="text-4xl md:text-5xl font-black text-center mb-4">
            Envoyez-nous un
            <span className="text-[#FCCD12]"> message</span>
          </h2>

          <p className="text-center text-gray-300 mb-12">
            Nous vous répondrons dans les plus brefs délais.
          </p>

          <form className="space-y-8">

            <div className="grid md:grid-cols-2 gap-6">
              <input
                type="text"
                placeholder="Votre nom"
                className="
                  w-full
                  bg-[#020B2E]/60
                  border border-white/10
                  rounded-2xl
                  px-6 py-4
                  outline-none
                  focus:border-[#FCCD12]
                "
              />

              <input
                type="email"
                placeholder="Votre email"
                className="
                  w-full
                  bg-[#020B2E]/60
                  border border-white/10
                  rounded-2xl
                  px-6 py-4
                  outline-none
                  focus:border-[#FCCD12]
                "
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <input
                type="text"
                placeholder="Téléphone"
                className="
                  w-full
                  bg-[#020B2E]/60
                  border border-white/10
                  rounded-2xl
                  px-6 py-4
                  outline-none
                  focus:border-[#FCCD12]
                "
              />

              <input
                type="text"
                placeholder="Sujet"
                className="
                  w-full
                  bg-[#020B2E]/60
                  border border-white/10
                  rounded-2xl
                  px-6 py-4
                  outline-none
                  focus:border-[#FCCD12]
                "
              />
            </div>

            <textarea
              rows={7}
              placeholder="Votre message..."
              className="
                w-full
                bg-[#020B2E]/60
                border border-white/10
                rounded-2xl
                px-6 py-4
                outline-none
                focus:border-[#FCCD12]
              "
            />

            <div className="text-center">
              <button
                type="submit"
                className="
                  bg-[#FCCD12]
                  text-[#020B2E]
                  font-bold
                  px-10 py-4
                  rounded-full
                  hover:scale-105
                  transition-all
                  duration-300
                  shadow-[0_0_35px_rgba(252,205,18,.45)]
                "
              >
                Envoyer le message →
              </button>
            </div>

          </form>
        </motion.div>
      </div>
    </section>
  );
}