"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "../components/navbar";
import Footer from "../components/footer";

const values = [
  {
    title: "Créativité",
    desc: "Chaque projet est pensé avec une direction artistique forte pour donner une image professionnelle et mémorable.",
    icon: "🎨",
  },
  {
    title: "Qualité",
    desc: "Nous travaillons avec soin sur le design, la vidéo, le son, la photographie, le web et les supports imprimés.",
    icon: "⭐",
  },
  {
    title: "Rapidité",
    desc: "Nous accompagnons nos clients avec réactivité, sérieux et respect des délais.",
    icon: "⚡",
  },
  {
    title: "Proximité",
    desc: "Bichridigital reste proche des entreprises, associations, collectivités et particuliers.",
    icon: "🤝",
  },
];

const services = [
  "Communication digitale",
  "Production audiovisuelle",
  "Streaming live",
  "Création graphique",
  "Photographie professionnelle",
  "Développement web",
  "Impression & personnalisation",
  "Gestion des réseaux sociaux",
];

const stats = [
  {
    value: "2019",
    label: "Année de création",
  },
  {
    value: "123K+",
    label: "Abonnés YouTube",
  },
  {
    value: "60K+",
    label: "Abonnés TikTok",
  },
  {
    value: "100+",
    label: "Projets réalisés",
  },
];

export default function AproposPage() {
  return (
    <>
      <Navbar />

      <main className="bg-[#020B2E] text-white overflow-hidden">
        {/* HERO */}
        <section className="relative min-h-[720px] flex items-center justify-center pt-32 pb-20 px-6 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,87,255,0.35),transparent_38%)]"></div>
          <div className="absolute right-[-160px] top-20 w-[420px] h-[420px] rounded-full bg-[#0057FF]/25 blur-[140px]"></div>
          <div className="absolute left-[-120px] bottom-10 w-[360px] h-[360px] rounded-full bg-[#FCCD12]/10 blur-[130px]"></div>

          <div className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-2 gap-14 items-center">
            <motion.div
              initial={{ opacity: 0, y: 35 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <div className="flex items-center gap-4 mb-6">
                <span className="w-12 h-[2px] bg-[#FCCD12]"></span>
                <span className="text-[#FCCD12] text-sm font-black uppercase tracking-widest">
                  À propos de nous
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight">
                Une agence digitale au service de votre{" "}
                <span className="text-[#FCCD12]">image.</span>
              </h1>

              <p className="mt-7 text-gray-300 text-lg md:text-xl leading-9 max-w-2xl">
                Bichridigital Agency accompagne les entreprises,
                associations, institutions, événements et particuliers dans
                leur communication digitale, audiovisuelle et visuelle depuis
                2019.
              </p>

              <div className="mt-10 flex flex-wrap gap-5">
                <Link
                  href="/services"
                  className="bg-[#FCCD12] text-[#020B2E] px-9 py-4 rounded-full font-black hover:scale-105 transition"
                >
                  Voir nos services →
                </Link>

                <a
                  href="https://wa.me/221773211096"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-[#FCCD12] text-white px-9 py-4 rounded-full font-bold hover:bg-[#FCCD12] hover:text-[#020B2E] transition"
                >
                  Nous contacter
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-[#0057FF]/30 blur-[90px] rounded-full"></div>

              <div className="relative rounded-[36px] bg-white/10 border border-white/10 p-8 backdrop-blur-xl shadow-[0_0_80px_rgba(0,87,255,0.2)]">
                <div className="rounded-[28px] bg-[#071542] border border-blue-500/30 p-10 text-center">
                  <Image
                    src="/logo.png"
                    alt="Bichridigital Agency"
                    width={260}
                    height={120}
                    className="mx-auto"
                    priority
                  />

                  <h2 className="mt-8 text-3xl font-black text-white">
                    Bichridigital Agency
                  </h2>

                  <p className="mt-4 text-gray-300 leading-8">
                    Communication digitale • Audiovisuel • Streaming live •
                    Design graphique • Développement web • Impression
                  </p>

                  <div className="mt-8 grid grid-cols-2 gap-4">
                    {stats.map((item) => (
                      <div
                        key={item.label}
                        className="rounded-2xl bg-[#020B2E] border border-white/10 p-5"
                      >
                        <h3 className="text-3xl font-black text-[#FCCD12]">
                          {item.value}
                        </h3>
                        <p className="mt-2 text-sm text-gray-400">
                          {item.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* HISTOIRE */}
        <section className="py-24 bg-[#020B2E]">
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-14 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="rounded-[34px] bg-[#071542] border border-blue-500/30 p-8 md:p-12 shadow-[0_0_50px_rgba(0,87,255,0.15)]"
            >
              <span className="text-[#FCCD12] text-sm font-black uppercase tracking-widest">
                Notre histoire
              </span>

              <h2 className="mt-5 text-4xl md:text-5xl font-black text-white leading-tight">
                Une vision née de la passion pour la communication.
              </h2>

              <p className="mt-7 text-gray-300 leading-8">
                Depuis sa création, Bichridigital Agency s&apos;est donnée pour
                mission d&apos;aider les marques, événements et porteurs de
                projets à mieux raconter leur histoire à travers l&apos;image,
                la vidéo, le digital et les supports de communication.
              </p>

              <p className="mt-5 text-gray-300 leading-8">
                Basée à Ndiagne, dans la région de Louga, l&apos;agence
                développe une approche moderne, créative et accessible, tout en
                restant proche des réalités locales.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="grid sm:grid-cols-2 gap-6"
            >
              {values.map((value) => (
                <div
                  key={value.title}
                  className="group rounded-[28px] bg-[#071542] border border-blue-500/30 p-7 hover:border-[#FCCD12] hover:-translate-y-2 transition-all duration-300"
                >
                  <div className="text-5xl mb-5 group-hover:scale-110 transition">
                    {value.icon}
                  </div>

                  <h3 className="text-2xl font-black text-white group-hover:text-[#FCCD12] transition">
                    {value.title}
                  </h3>

                  <p className="mt-4 text-gray-400 leading-7">
                    {value.desc}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* MISSION */}
        <section className="py-24 bg-[#071542]">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="text-center max-w-4xl mx-auto"
            >
              <span className="text-[#FCCD12] text-sm font-black uppercase tracking-widest">
                Notre mission
              </span>

              <h2 className="mt-5 text-4xl md:text-6xl font-black text-white leading-tight">
                Donner plus de force, de beauté et de visibilité à votre projet.
              </h2>

              <p className="mt-7 text-gray-300 text-lg leading-9">
                Notre rôle est de transformer vos idées en contenus
                professionnels : affiches, vidéos, lives, photos, sites web,
                identités visuelles, supports imprimés et stratégies digitales.
              </p>
            </motion.div>

            <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {services.map((service, index) => (
                <motion.div
                  key={service}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="rounded-2xl bg-[#020B2E] border border-white/10 px-6 py-5 text-center font-bold text-gray-200 hover:text-[#FCCD12] hover:border-[#FCCD12] transition"
                >
                  {service}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* POURQUOI NOUS */}
        <section className="py-24 bg-[#020B2E]">
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-14 items-center">
            <motion.div
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <span className="text-[#FCCD12] text-sm font-black uppercase tracking-widest">
                Pourquoi choisir Bichridigital ?
              </span>

              <h2 className="mt-5 text-4xl md:text-5xl font-black text-white leading-tight">
                Une seule équipe pour gérer votre image de A à Z.
              </h2>

              <p className="mt-7 text-gray-300 leading-8">
                Avec Bichridigital, vous pouvez confier votre communication à
                une équipe qui comprend les besoins du terrain : création
                graphique, couverture événementielle, diffusion en direct,
                gestion digitale, développement web et impression.
              </p>

              <div className="mt-10 space-y-5">
                {[
                  "Une identité visuelle cohérente et professionnelle",
                  "Une expérience solide dans l’événementiel et le digital",
                  "Une forte présence sur les réseaux sociaux",
                  "Un accompagnement adapté aux réalités locales",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-4 rounded-2xl bg-[#071542] border border-blue-500/20 p-5"
                  >
                    <span className="mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#FCCD12] text-[#020B2E] font-black">
                      ✓
                    </span>
                    <p className="text-gray-300 leading-7">{item}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="rounded-[34px] bg-gradient-to-br from-[#0024FF] to-[#071542] p-8 md:p-12 border border-white/10 shadow-[0_0_80px_rgba(0,87,255,0.22)]"
            >
              <h3 className="text-3xl md:text-4xl font-black text-white">
                Votre histoire, image par image.
              </h3>

              <p className="mt-6 text-gray-200 leading-8">
                Nous aidons les marques et organisations à construire une image
                forte, crédible et reconnaissable sur le terrain comme sur le
                digital.
              </p>

              <div className="mt-10 grid grid-cols-2 gap-5">
                <div className="rounded-2xl bg-white/10 p-5">
                  <p className="text-4xl font-black text-[#FCCD12]">360°</p>
                  <p className="mt-2 text-gray-200">Communication complète</p>
                </div>

                <div className="rounded-2xl bg-white/10 p-5">
                  <p className="text-4xl font-black text-[#FCCD12]">Live</p>
                  <p className="mt-2 text-gray-200">Diffusion événementielle</p>
                </div>

                <div className="rounded-2xl bg-white/10 p-5">
                  <p className="text-4xl font-black text-[#FCCD12]">Web</p>
                  <p className="mt-2 text-gray-200">Sites modernes</p>
                </div>

                <div className="rounded-2xl bg-white/10 p-5">
                  <p className="text-4xl font-black text-[#FCCD12]">Print</p>
                  <p className="mt-2 text-gray-200">Supports personnalisés</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 bg-gradient-to-r from-[#0024FF] via-[#071B4D] to-[#020B2E]">
          <div className="max-w-5xl mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <h2 className="text-4xl md:text-6xl font-black text-white leading-tight">
                Vous avez un projet ? Parlons-en dès maintenant.
              </h2>

              <p className="mt-6 text-gray-200 text-lg leading-8">
                Que ce soit pour une affiche, une vidéo, un live, un site web,
                une identité visuelle ou une campagne digitale, notre équipe est
                prête à vous accompagner.
              </p>

              <div className="mt-10 flex flex-wrap justify-center gap-5">
                <a
                  href="https://wa.me/221773211096"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#FCCD12] text-[#020B2E] px-10 py-4 rounded-full font-black hover:scale-105 transition"
                >
                  Écrire sur WhatsApp
                </a>

                <Link
                  href="/portfolio"
                  className="border border-white/30 text-white px-10 py-4 rounded-full font-bold hover:bg-white hover:text-[#020B2E] transition"
                >
                  Voir nos réalisations
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}