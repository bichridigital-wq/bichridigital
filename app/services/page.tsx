"use client";

import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  FaBullhorn,
  FaVideo,
  FaCode,
  FaCamera,
  FaBroadcastTower,
  FaPaintBrush,
  FaHeadphones,
  FaBullseye,
  FaRocket,
  FaPaperPlane,
  FaGem,
  FaBolt,
  FaShieldAlt,
} from "react-icons/fa";

const services = [
  {
    number: "01",
    title: "Communication Digitale",
    desc: "Gestion des réseaux sociaux, publicité et stratégie digitale.",
    icon: <FaBullhorn />,
  },
  {
    number: "02",
    title: "Production Audiovisuelle",
    desc: "Captation vidéo, montage et films institutionnels.",
    icon: <FaVideo />,
  },
  {
    number: "03",
    title: "Développement Web",
    desc: "Sites vitrines, e-commerce et applications web.",
    icon: <FaCode />,
  },
  {
    number: "04",
    title: "Photographie",
    desc: "Photos professionnelles et couverture d'événements.",
    icon: <FaCamera />,
  },
  {
    number: "05",
    title: "Streaming & Live",
    desc: "Diffusion en direct sur toutes les plateformes.",
    icon: <FaBroadcastTower />,
  },
  {
    number: "06",
    title: "Design Graphique",
    desc: "Logos, affiches et identités visuelles.",
    icon: <FaPaintBrush />,
  },
];

export default function ServicesPage() {
  return (
    <>
      <Navbar />

      <main className="bg-[#020B2E] text-white overflow-hidden">

        {/* HERO */}
        <section className="pt-32 pb-24">
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">

            <div>
              <span className="bg-[#FCCD12]/10 text-[#FCCD12] px-5 py-2 rounded-full font-semibold">
                ● NOS SERVICES
              </span>

              <h1 className="text-5xl lg:text-7xl font-bold mt-8 leading-tight">
                Des solutions digitales qui propulsent votre{" "}
                <span className="text-[#FCCD12]">
                  marque.
                </span>
              </h1>

              <p className="text-gray-300 text-xl mt-8 leading-9">
                Bichridigital Agency accompagne les entreprises,
                institutions et particuliers dans leur
                communication numérique et audiovisuelle.
              </p>

              <div className="flex flex-wrap gap-5 mt-10">
                <Link
                  href="#services"
                  className="bg-[#FCCD12] text-[#020B2E] px-8 py-4 rounded-full font-bold hover:scale-105 transition"
                >
                  Découvrir nos services →
                </Link>

                <Link
                  href="/contact"
                  className="border border-white/20 px-8 py-4 rounded-full hover:border-[#FCCD12] transition"
                >
                  Demander un devis
                </Link>
              </div>

              <p className="text-gray-400 mt-10">
                Plus de{" "}
                <span className="font-bold text-white">
                  200+
                </span>{" "}
                clients nous font confiance.
              </p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/20 blur-[120px] rounded-full"></div>

              <video
                autoPlay
                muted
                loop
                playsInline
                className="relative w-full rounded-[35px] border border-blue-800 shadow-[0_0_80px_rgba(0,87,255,0.4)]"
              >
                <source
                  src="/hero-video2.mp4"
                  type="video/mp4"
                />
              </video>
            </div>

          </div>
        </section>

        {/* SERVICES */}
        <section
          id="services"
          className="max-w-7xl mx-auto px-6 py-24"
        >
          <h2 className="text-center text-5xl font-bold">
            Ce que nous faisons{" "}
            <span className="text-[#FCCD12]">
              pour vous
            </span>
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-20">
            {services.map((service) => (
              <div
                key={service.number}
                className="relative bg-white/5 border border-white/10 rounded-[30px] p-8 hover:border-[#FCCD12] hover:-translate-y-2 transition-all"
              >
                <span className="absolute top-6 right-6 text-5xl font-bold text-white/10">
                  {service.number}
                </span>

                <div className="text-4xl text-[#FCCD12] mb-8">
                  {service.icon}
                </div>

                <h3 className="text-2xl font-bold">
                  {service.title}
                </h3>

                <p className="text-gray-400 mt-5 leading-8">
                  {service.desc}
                </p>

                <Link
                  href="/contact"
                  className="text-[#FCCD12] mt-8 inline-block"
                >
                  En savoir plus →
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* PROCESSUS */}
        <section className="py-24 bg-white/[0.02]">
          <h2 className="text-center text-5xl font-bold">
            Comment nous{" "}
            <span className="text-[#FCCD12]">
              travaillons
            </span>
            ?
          </h2>

          <div className="grid md:grid-cols-4 gap-10 max-w-7xl mx-auto px-6 mt-20">
            {[
              {
                icon: <FaHeadphones />,
                title: "Écoute",
              },
              {
                icon: <FaBullseye />,
                title: "Stratégie",
              },
              {
                icon: <FaRocket />,
                title: "Réalisation",
              },
              {
                icon: <FaPaperPlane />,
                title: "Livraison",
              },
            ].map((step, i) => (
              <div
                key={i}
                className="text-center"
              >
                <div className="w-24 h-24 mx-auto rounded-full border border-[#FCCD12] flex items-center justify-center text-3xl text-[#FCCD12]">
                  {step.icon}
                </div>

                <h3 className="text-2xl font-bold mt-8">
                  {step.title}
                </h3>
              </div>
            ))}
          </div>
        </section>

        {/* POURQUOI NOUS */}
        <section className="max-w-7xl mx-auto px-6 py-24">
          <h2 className="text-center text-5xl font-bold">
            Pourquoi choisir{" "}
            <span className="text-[#FCCD12]">
              Bichridigital ?
            </span>
          </h2>

          <div className="grid md:grid-cols-3 gap-8 mt-20">
            {[
              {
                icon: <FaGem />,
                title: "Qualité Premium",
              },
              {
                icon: <FaBolt />,
                title: "Réactivité",
              },
              {
                icon: <FaShieldAlt />,
                title: "Résultats Concrets",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white/5 border border-white/10 rounded-[30px] p-10 text-center"
              >
                <div className="text-[#FCCD12] text-5xl">
                  {item.icon}
                </div>

                <h3 className="text-2xl font-bold mt-8">
                  {item.title}
                </h3>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-7xl mx-auto px-6 pb-24">
          <div className="bg-gradient-to-r from-[#001B5E] to-[#0057FF] rounded-[40px] p-16 grid lg:grid-cols-2 gap-16 items-center">

            <div>
              <h2 className="text-5xl font-bold">
                Discutons de votre projet.
              </h2>

              <p className="text-gray-200 mt-6 text-xl">
                Notre équipe est disponible pour donner vie
                à vos idées.
              </p>

              <Link
                href="/contact"
                className="inline-block mt-10 bg-[#FCCD12] text-[#020B2E] px-8 py-4 rounded-full font-bold"
              >
                Demander un devis →
              </Link>
            </div>

            <video
              autoPlay
              muted
              loop
              playsInline
              className="rounded-[30px]"
            >
              <source
                src="/hero-video2.mp4"
                type="video/mp4"
              />
            </video>

          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}