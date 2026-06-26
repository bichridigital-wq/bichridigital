"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown } from "react-icons/fa";

const faqs = [
  {
    question: "Quels services propose Bichridigital ?",
    answer:
      "Nous proposons la communication digitale, la production audiovisuelle, la photographie, le streaming live, le développement web, le design graphique et le community management.",
  },
  {
    question: "Comment demander un devis ?",
    answer:
      "Vous pouvez remplir le formulaire de contact de cette page ou nous joindre directement par téléphone ou WhatsApp.",
  },
  {
    question: "Intervenez-vous partout au Sénégal ?",
    answer:
      "Oui. Nous réalisons des prestations dans tout le Sénégal et pouvons également collaborer avec des clients à l'international.",
  },
  {
    question: "Quels sont vos délais de réalisation ?",
    answer:
      "Les délais varient selon le projet. Une affiche peut être livrée en 24 à 48 heures tandis qu'un site web ou une production audiovisuelle demande davantage de temps.",
  },
  {
    question: "Proposez-vous des directs Facebook et YouTube ?",
    answer:
      "Oui. Nous assurons des prestations de streaming professionnel sur Facebook, YouTube et d'autres plateformes.",
  },
];

export default function ContactFAQ() {
  const [active, setActive] = useState<number | null>(0);

  return (
    <section className="max-w-5xl mx-auto px-6 py-24">

      <div className="text-center mb-16">

        <span className="inline-block bg-[#FCCD12]/10 border border-[#FCCD12]/30 text-[#FCCD12] px-5 py-2 rounded-full font-semibold mb-5">
          FAQ
        </span>

        <h2 className="text-5xl font-black text-white">
          Questions
          <span className="text-[#FCCD12]"> fréquentes</span>
        </h2>

        <p className="text-gray-300 mt-6">
          Retrouvez ici les réponses aux questions les plus posées.
        </p>

      </div>

      <div className="space-y-5">

        {faqs.map((faq, index) => (

          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.08 }}
            className="rounded-3xl border border-[#1E40AF] bg-[#07133D] overflow-hidden"
          >

            <button
              onClick={() =>
                setActive(active === index ? null : index)
              }
              className="w-full flex items-center justify-between p-7 text-left"
            >

              <h3 className="font-bold text-xl">

                {faq.question}

              </h3>

              <FaChevronDown
                className={`transition-transform duration-300 ${
                  active === index ? "rotate-180 text-[#FCCD12]" : ""
                }`}
              />

            </button>

            <AnimatePresence>

              {active === index && (

                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >

                  <div className="px-7 pb-7 text-gray-300 leading-8">

                    {faq.answer}

                  </div>

                </motion.div>

              )}

            </AnimatePresence>

          </motion.div>

        ))}

      </div>

    </section>
  );
}