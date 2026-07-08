"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const whatsappMessage = `
Bonjour Bichridigital Agency,

Je souhaite vous contacter depuis le site web.

Nom : ${form.name}
Email : ${form.email || "Non renseigné"}
Téléphone : ${form.phone}
Sujet : ${form.subject}

Message :
${form.message}
`;

    const whatsappUrl = `https://wa.me/221773211096?text=${encodeURIComponent(
      whatsappMessage
    )}`;

    window.open(whatsappUrl, "_blank");
  };

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

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              <input
                type="text"
                name="name"
                required
                value={form.name}
                onChange={handleChange}
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
                name="email"
                value={form.email}
                onChange={handleChange}
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
                type="tel"
                name="phone"
                required
                value={form.phone}
                onChange={handleChange}
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
                name="subject"
                required
                value={form.subject}
                onChange={handleChange}
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
              name="message"
              required
              rows={7}
              value={form.message}
              onChange={handleChange}
              placeholder="Votre message..."
              className="
                w-full
                bg-[#020B2E]/60
                border border-white/10
                rounded-2xl
                px-6 py-4
                outline-none
                focus:border-[#FCCD12]
                resize-none
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
                Envoyer sur WhatsApp →
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  );
}