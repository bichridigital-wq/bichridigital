"use client";

import { motion } from "framer-motion";
import {
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
} from "react-icons/fa";

const cards = [
  {
    icon: FaPhoneAlt,
    title: "Téléphone",
    value: "+221 77 143 39 00",
  },
  {
    icon: FaEnvelope,
    title: "Email",
    value: "contact@bichridigital.com",
  },
  {
    icon: FaMapMarkerAlt,
    title: "Adresse",
    value: "Studio Bichridigital\nNdiagne - Louga",
  },
  {
    icon: FaClock,
    title: "Horaires",
    value: "Lun - Sam : 09h00 - 19h00",
  },
];

export default function ContactCards() {
  return (
    <section className="max-w-7xl mx-auto px-6 -mt-20 relative z-30">

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

        {cards.map((card, index) => {
          const Icon = card.icon;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
              }}
              whileHover={{
                y: -8,
                scale: 1.02,
              }}
              className="bg-[#07133D]/95 backdrop-blur-xl rounded-[28px] border border-[#1E40AF] p-8 text-center hover:border-[#FCCD12] transition-all duration-300"
            >
              <div className="w-16 h-16 rounded-full bg-[#FCCD12] text-[#020B2E] flex items-center justify-center mx-auto mb-6 text-2xl">

                <Icon />

              </div>

              <h3 className="text-white font-bold text-xl mb-3">

                {card.title}

              </h3>

              <p className="text-gray-300 whitespace-pre-line leading-7">

                {card.value}

              </p>

            </motion.div>
          );
        })}

      </div>

    </section>
  );
}