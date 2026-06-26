"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "../components/navbar";

export default function ContactPage() {
  return (
    <>
      <Navbar />

      <main className="bg-[#020B2E] text-white overflow-x-hidden">

        {/* ================= HERO ================= */}

        <section className="relative min-h-screen flex items-center overflow-hidden">

          {/* Background */}

          <Image
            src="/hero.jpg"
            alt="Contact Bichridigital"
            fill
            priority
            className="object-cover"
          />

          {/* Overlay */}

          <div className="absolute inset-0 bg-[#020B2E]/88" />

          <div className="absolute inset-0 bg-gradient-to-r from-[#020B2E] via-[#020B2E]/70 to-[#020B2E]" />

          {/* Glow */}

          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[650px] h-[650px] rounded-full bg-[#FCCD12]/10 blur-[170px]" />

          {/* Content */}

          <div className="relative z-20 max-w-7xl mx-auto px-6 w-full">

            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: .8 }}
              className="max-w-4xl"
            >

              <span className="inline-flex items-center gap-2 rounded-full border border-[#FCCD12]/30 bg-[#FCCD12]/10 px-6 py-2 text-[#FCCD12] font-semibold mb-8">

                CONTACTEZ BICHRIDIGITAL

              </span>

              <h1 className="text-6xl md:text-8xl font-black leading-none">

                Parlons de

                <br />

                <span className="text-[#FCCD12]">

                  votre prochain projet.

                </span>

              </h1>

              <p className="text-xl md:text-2xl text-gray-200 leading-10 max-w-3xl mt-10">

                Une idée.
                Une entreprise.
                Une marque.

                <br /><br />

                Nous créons des expériences digitales,
                des productions audiovisuelles
                et des contenus qui donnent de la valeur
                à votre image.

              </p>

              <div className="flex flex-wrap gap-5 mt-14">

                <Link
                  href="#contact"
                  className="bg-[#FCCD12] text-[#020B2E] font-bold px-10 py-5 rounded-full hover:bg-yellow-400 transition-all duration-300 hover:scale-105 shadow-[0_0_35px_rgba(252,205,18,.40)]"
                >
                  Demander un devis →
                </Link>

                <Link
                  href="/portfolio"
                  className="border border-white/20 bg-white/5 backdrop-blur-md px-10 py-5 rounded-full hover:border-[#FCCD12] hover:text-[#FCCD12] transition-all duration-300"
                >
                  Voir nos réalisations
                </Link>

              </div>

            </motion.div>

          </div>

          {/* Scroll */}

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2">

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{
                repeat: Infinity,
                duration: 1.6,
              }}
              className="w-8 h-14 rounded-full border-2 border-white/30 flex justify-center"
            >

              <div className="w-2 h-2 rounded-full bg-[#FCCD12] mt-3"></div>

            </motion.div>

          </div>

        </section>

        {/* ================= CONTACT ================= */}
                <section
          id="contact"
          className="py-28 bg-gradient-to-b from-[#020B2E] to-[#031542]"
        >
          <div className="max-w-7xl mx-auto px-6">

            <div className="grid lg:grid-cols-12 gap-14 items-start">

              {/* ================= INFOS ================= */}

              <motion.div
                initial={{ opacity: 0, x: -60 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: .7 }}
                className="lg:col-span-4"
              >

                <span className="text-[#FCCD12] font-semibold tracking-[3px] uppercase">

                  Restons en contact

                </span>

                <h2 className="text-5xl font-black mt-6 leading-tight">

                  Parlons de votre

                  <span className="text-[#FCCD12]">

                    {" "}projet.

                  </span>

                </h2>

                <p className="text-gray-300 leading-9 mt-8">

                  Que vous soyez une entreprise,
                  une association ou un particulier,
                  notre équipe est à votre disposition
                  pour transformer vos idées
                  en réalisations concrètes.

                </p>

                <div className="space-y-8 mt-12">

                  <div className="flex gap-5">

                    <div className="w-16 h-16 rounded-full bg-[#FCCD12] flex items-center justify-center text-[#020B2E] text-2xl">

                      📞

                    </div>

                    <div>

                      <h3 className="font-bold text-xl">

                        Téléphone

                      </h3>

                      <p className="text-gray-300 mt-2">

                        +221 77 143 39 00

                      </p>

                    </div>

                  </div>

                  <div className="flex gap-5">

                    <div className="w-16 h-16 rounded-full bg-[#FCCD12] flex items-center justify-center text-[#020B2E] text-2xl">

                      ✉️

                    </div>

                    <div>

                      <h3 className="font-bold text-xl">

                        Email

                      </h3>

                      <p className="text-gray-300 mt-2">

                        contact@bichridigital.com

                      </p>

                    </div>

                  </div>

                  <div className="flex gap-5">

                    <div className="w-16 h-16 rounded-full bg-[#FCCD12] flex items-center justify-center text-[#020B2E] text-2xl">

                      📍

                    </div>

                    <div>

                      <h3 className="font-bold text-xl">

                        Adresse

                      </h3>

                      <p className="text-gray-300 mt-2">

                        Studio Bichridigital

                        <br />

                        Ndiagne • Louga • Sénégal

                      </p>

                    </div>

                  </div>

                  <div className="flex gap-5">

                    <div className="w-16 h-16 rounded-full bg-[#FCCD12] flex items-center justify-center text-[#020B2E] text-2xl">

                      💬

                    </div>

                    <div>

                      <h3 className="font-bold text-xl">

                        WhatsApp

                      </h3>

                      <p className="text-gray-300 mt-2">

                        Disponible 7j / 7

                      </p>

                    </div>

                  </div>

                </div>

              </motion.div>

              {/* ================= FORMULAIRE ================= */}

              <motion.div
                initial={{ opacity: 0, x: 60 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: .7 }}
                className="lg:col-span-8"
              >

                <div className="rounded-[40px] border border-white/10 bg-white/5 backdrop-blur-2xl p-10 md:p-14 shadow-[0_20px_80px_rgba(0,0,0,.35)]">

                  <h3 className="text-4xl font-black">

                    Envoyez-nous votre projet

                  </h3>

                  <p className="text-gray-300 mt-4 mb-10">

                    Remplissez le formulaire ci-dessous.
                    Nous vous répondrons dans les meilleurs délais.

                  </p>

                  <form className="space-y-7">

                    <div className="grid md:grid-cols-2 gap-6">

                      <input
                        type="text"
                        placeholder="Nom complet"
                        className="w-full rounded-2xl border border-white/10 bg-[#081B4D]/70 px-6 py-5 outline-none focus:border-[#FCCD12] transition"
                      />

                      <input
                        type="email"
                        placeholder="Adresse email"
                        className="w-full rounded-2xl border border-white/10 bg-[#081B4D]/70 px-6 py-5 outline-none focus:border-[#FCCD12] transition"
                      />

                    </div>

                    <div className="grid md:grid-cols-2 gap-6">

                      <input
                        type="tel"
                        placeholder="Téléphone"
                        className="w-full rounded-2xl border border-white/10 bg-[#081B4D]/70 px-6 py-5 outline-none focus:border-[#FCCD12] transition"
                      />

                      <select
                        className="w-full rounded-2xl border border-white/10 bg-[#081B4D]/70 px-6 py-5 outline-none focus:border-[#FCCD12] transition"
                      >
                        <option>Choisir un service</option>
                        <option>Communication Digitale</option>
                        <option>Production Audiovisuelle</option>
                        <option>Développement Web</option>
                        <option>Photographie</option>
                        <option>Streaming Live</option>
                        <option>Design Graphique</option>
                      </select>

                    </div>

                    <textarea
                      rows={7}
                      placeholder="Décrivez votre projet..."
                      className="w-full rounded-2xl border border-white/10 bg-[#081B4D]/70 px-6 py-5 resize-none outline-none focus:border-[#FCCD12] transition"
                    />

                    <button
                      type="submit"
                      className="w-full rounded-2xl bg-[#FCCD12] py-5 text-lg font-bold text-[#020B2E] hover:bg-yellow-400 transition-all duration-300 hover:scale-[1.02]"
                    >
                      Envoyer le projet →
                    </button>

                  </form>

                </div>

              </motion.div>

            </div>

          </div>

        </section>

        {/* ================= NOS RÉALISATIONS ================= */}
                {/* ================= NOS RÉALISATIONS ================= */}

        <section className="py-28">

          <div className="max-w-7xl mx-auto px-6">

            <div className="text-center mb-16">

              <span className="inline-block rounded-full border border-[#FCCD12]/30 bg-[#FCCD12]/10 px-5 py-2 text-[#FCCD12] font-semibold">

                NOS DERNIERS PROJETS

              </span>

              <h2 className="text-5xl font-black mt-6">

                Quelques

                <span className="text-[#FCCD12]">

                  {" "}réalisations

                </span>

              </h2>

              <p className="text-gray-300 mt-6 max-w-3xl mx-auto leading-8">

                Découvrez quelques projets réalisés par
                Bichridigital Agency dans les domaines
                de la communication digitale,
                de la production audiovisuelle
                et du design graphique.

              </p>

            </div>

            <div className="grid md:grid-cols-3 gap-8">

              {[
                "/portfolio1.png",
                "/portfolio2.png",
                "/portfolio3.png",
              ].map((image, index) => (

                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: .5,
                    delay: index * .15,
                  }}
                  whileHover={{
                    y: -10,
                  }}
                  className="group overflow-hidden rounded-[30px] border border-white/10 bg-[#07133D]"
                >

                  <div className="relative overflow-hidden">

                    <Image
                      src={image}
                      alt={`Projet ${index + 1}`}
                      width={700}
                      height={900}
                      className="w-full h-[420px] object-cover transition-all duration-700 group-hover:scale-110"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-[#020B2E] via-transparent to-transparent opacity-80"></div>

                  </div>

                  <div className="p-7">

                    <span className="text-[#FCCD12] text-sm font-semibold">

                      Bichridigital Agency

                    </span>

                    <h3 className="text-2xl font-bold mt-3">

                      Projet {index + 1}

                    </h3>

                    <p className="text-gray-300 mt-4">

                      Communication digitale,
                      production audiovisuelle
                      et création graphique.

                    </p>

                  </div>

                </motion.div>

              ))}

            </div>

            <div className="text-center mt-16">

              <Link
                href="/portfolio"
                className="inline-flex items-center rounded-full border border-[#FCCD12] px-8 py-4 text-[#FCCD12] font-semibold hover:bg-[#FCCD12] hover:text-[#020B2E] transition-all duration-300"
              >
                Voir tout le portfolio →
              </Link>

            </div>

          </div>

        </section>

        {/* ================= GOOGLE MAP ================= */}

        <section className="pb-28">

          <div className="max-w-7xl mx-auto px-6">

            <div className="text-center mb-14">

              <span className="inline-block rounded-full border border-[#FCCD12]/30 bg-[#FCCD12]/10 px-5 py-2 text-[#FCCD12] font-semibold">

                NOTRE LOCALISATION

              </span>

              <h2 className="text-5xl font-black mt-6">

                Venez nous

                <span className="text-[#FCCD12]">

                  {" "}rencontrer

                </span>

              </h2>

              <p className="text-gray-300 mt-6 max-w-2xl mx-auto">

                Notre studio est situé à Ndiagne,
                dans la région de Louga.
                Nous serons heureux de vous accueillir.

              </p>

            </div>

            <div className="overflow-hidden rounded-[40px] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,.35)]">

              <iframe
                src="https://www.google.com/maps?q=Ndiagne,+Louga,+Senegal&output=embed"
                width="100%"
                height="550"
                loading="lazy"
                style={{ border: 0 }}
                title="Carte Bichridigital"
              />

            </div>

          </div>

        </section>

        {/* ================= CTA ================= */}
                {/* ================= CTA ================= */}

        <section className="max-w-7xl mx-auto px-6 pb-28">

          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative overflow-hidden rounded-[45px] border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,.45)]"
          >

            {/* Vidéo */}

            <video
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source src="/hero-video.mp4" type="video/mp4" />
            </video>

            {/* Overlay */}

            <div className="absolute inset-0 bg-[#020B2E]/88"></div>

            <div className="absolute inset-0 bg-gradient-to-r from-[#020B2E] via-[#020B2E]/70 to-[#020B2E]" />

            {/* Glow */}

            <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-[#FCCD12]/10 blur-[140px]" />

            {/* Contenu */}

            <div className="relative z-20 py-28 px-8 text-center">

              <span className="inline-flex items-center gap-2 rounded-full border border-[#FCCD12]/30 bg-[#FCCD12]/10 px-6 py-2 text-[#FCCD12] font-semibold">

                🚀 Bichridigital Agency

              </span>

              <h2 className="mt-8 text-5xl md:text-7xl font-black leading-tight">

                Votre projet

                <br />

                <span className="text-[#FCCD12]">

                  commence ici.

                </span>

              </h2>

              <p className="mt-8 max-w-3xl mx-auto text-lg leading-9 text-gray-200">

                Communication digitale • Production audiovisuelle •
                Développement Web • Streaming Live • Photographie

                <br /><br />

                Nous sommes prêts à donner vie à vos idées.

              </p>

              <div className="flex flex-wrap justify-center gap-5 mt-12">

                <Link
                  href="#contact"
                  className="rounded-full bg-[#FCCD12] px-10 py-5 text-lg font-bold text-[#020B2E] transition-all duration-300 hover:bg-yellow-400 hover:scale-105 shadow-[0_0_35px_rgba(252,205,18,.45)]"
                >
                  Demander un devis →
                </Link>

                <Link
                  href="/portfolio"
                  className="rounded-full border border-white/20 bg-white/5 px-10 py-5 text-lg backdrop-blur-md transition-all duration-300 hover:border-[#FCCD12] hover:text-[#FCCD12]"
                >
                  Voir nos réalisations
                </Link>

              </div>

            </div>

          </motion.div>

        </section>

      </main>

    </>
  );
}