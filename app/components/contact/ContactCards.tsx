"use client";

import { motion } from "framer-motion";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";

export default function ContactCards() {
  const cards = [
    {
      icon: <FaPhoneAlt />,
      title: "Téléphone",
      value: "+221 77 143 39 00",
      color: "text-[#FCCD12]",
    },
    {
      icon: <FaEnvelope />,
      title: "Email",
      value: "contact@bichridigital.com",
      color: "text-[#FCCD12]",
    },
    {
      icon: <FaMapMarkerAlt />,
      title: "Adresse",
      value: "Studio Iba Asta Niang, Ndiagne",
      color: "text-[#FCCD12]",
    },
  ];

  return (
    <section className="py-24 bg-[#020B2E]">
      <div className="max-w-7xl mx-auto px-6">

        <div className="grid md:grid-cols-3 gap-8">

          {cards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              viewport={{ once: true }}
              className="
                bg-white/5
                backdrop-blur-md
                border border-white/10
                rounded-3xl
                p-10
                text-center
                hover:border-[#FCCD12]
                hover:-translate-y-2
                transition-all
                duration-300
              "
            >
              <div className={`${card.color} text-5xl mb-6 flex justify-center`}>
                {card.icon}
              </div>

              <h3 className="text-2xl font-bold mb-3">
                {card.title}
              </h3>

              <p className="text-gray-300">
                {card.value}
              </p>
            </motion.div>
          ))}

        </div>
      </div>
    </section>
  );
}