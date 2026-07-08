"use client";

import { useState } from "react";

export default function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    service: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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

Je souhaite vous contacter pour un projet.

Nom : ${form.name}
Téléphone : ${form.phone}
Email : ${form.email || "Non renseigné"}
Service souhaité : ${form.service}

Message :
${form.message}
`;

    const whatsappUrl = `https://wa.me/221773211096?text=${encodeURIComponent(
      whatsappMessage
    )}`;

    window.open(whatsappUrl, "_blank");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <input
        type="text"
        name="name"
        required
        value={form.name}
        onChange={handleChange}
        placeholder="Nom complet"
        className="w-full rounded-2xl bg-[#020B2E] border border-blue-500/30 px-5 py-4 text-white outline-none focus:border-[#FCCD12]"
      />

      <input
        type="tel"
        name="phone"
        required
        value={form.phone}
        onChange={handleChange}
        placeholder="Téléphone"
        className="w-full rounded-2xl bg-[#020B2E] border border-blue-500/30 px-5 py-4 text-white outline-none focus:border-[#FCCD12]"
      />

      <input
        type="email"
        name="email"
        value={form.email}
        onChange={handleChange}
        placeholder="Email"
        className="w-full rounded-2xl bg-[#020B2E] border border-blue-500/30 px-5 py-4 text-white outline-none focus:border-[#FCCD12]"
      />

      <select
        name="service"
        required
        value={form.service}
        onChange={handleChange}
        className="w-full rounded-2xl bg-[#020B2E] border border-blue-500/30 px-5 py-4 text-white outline-none focus:border-[#FCCD12]"
      >
        <option value="">Choisir un service</option>
        <option value="Communication digitale">Communication digitale</option>
        <option value="Création graphique">Création graphique</option>
        <option value="Streaming live">Streaming live</option>
        <option value="Production audiovisuelle">Production audiovisuelle</option>
        <option value="Développement web">Développement web</option>
        <option value="Impression & personnalisation">
          Impression & personnalisation
        </option>
        <option value="Autre">Autre</option>
      </select>

      <textarea
        name="message"
        required
        rows={5}
        value={form.message}
        onChange={handleChange}
        placeholder="Expliquez votre besoin..."
        className="w-full rounded-2xl bg-[#020B2E] border border-blue-500/30 px-5 py-4 text-white outline-none focus:border-[#FCCD12] resize-none"
      />

      <button
        type="submit"
        className="w-full bg-[#FCCD12] text-[#020B2E] py-4 rounded-full font-black hover:scale-105 transition"
      >
        Envoyer sur WhatsApp →
      </button>
    </form>
  );
}