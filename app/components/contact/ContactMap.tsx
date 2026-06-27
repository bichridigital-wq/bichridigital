"use client";

import { motion } from "framer-motion";

export default function ContactMap() {
  return (
    <section className="py-24 bg-[#020B2E]">
      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center mb-16">
          <h2 className="text-5xl font-black">
            Notre
            <span className="text-[#FCCD12]"> localisation</span>
          </h2>

          <p className="text-gray-300 mt-6">
            Retrouvez-nous au Studio Bichridigital à Ndiagne.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="
            overflow-hidden
            rounded-[40px]
            border border-white/10
            shadow-2xl
          "
        >
          <iframe
            src="https://www.google.com/maps?q=Ndiagne,+Louga,+Senegal&output=embed"
            width="100%"
            height="500"
            loading="lazy"
            style={{ border: 0 }}
            title="Bichridigital"
          />
        </motion.div>

      </div>
    </section>
  );
}