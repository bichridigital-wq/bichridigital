"use client";

import Link from "next/link";
import Image from "next/image";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  FaRocket,
  FaVideo,
  FaCode,
  FaCamera,
  FaBroadcastTower,
  FaPaintBrush,
  FaBullseye,
  FaClipboardCheck,
  FaPaperPlane,
} from "react-icons/fa";
const services = [
  {
    number: "01",
    title: "Communication Digitale",
    description:
      "Stratégie digitale, community management et campagnes publicitaires.",
    icon: <FaRocket />,
  },
  {
    number: "02",
    title: "Production Audiovisuelle",
    description:
      "Captation vidéo, montage et films institutionnels.",
    icon: <FaVideo />,
  },
  {
    number: "03",
    title: "Développement Web",
    description:
      "Sites vitrines, e-commerce et applications web.",
    icon: <FaCode />,
  },
  {
    number: "04",
    title: "Photographie",
    description:
      "Photos professionnelles et couverture d'événements.",
    icon: <FaCamera />,
  },
  {
    number: "05",
    title: "Streaming & Live",
    description:
      "Diffusions en direct sur toutes les plateformes.",
    icon: <FaBroadcastTower />,
  },
  {
    number: "06",
    title: "Design Graphique",
    description:
      "Création de logos, affiches et chartes graphiques.",
    icon: <FaPaintBrush />,
  },
];
export default function ServicesPage() {
  return (
    <>
      <Navbar />

      <main className="bg-[#020B2E] text-white overflow-hidden">

        {/* HERO */}
        <section className="pt-32 pb-24 bg-[radial-gradient(circle_at_top_right,#0B3B9E40,transparent_45%)]">
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
                  className="bg-[#FCCD12] text-[#020B2E] px-8 py-4 rounded-full font-bold"
                >
                  Découvrir nos services →
                </Link>

                <Link
                  href="/contact"
                  className="border border-white/20 px-8 py-4 rounded-full"
                >
                  Demander un devis
                </Link>
              </div>
            </div>

            <div>
              <video
                autoPlay
                muted
                loop
                playsInline
                className="w-full rounded-[35px] border border-blue-800 shadow-[0_0_80px_rgba(0,87,255,0.4)]"
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
                  {service.description}
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
        <section className="py-24">
          <h2 className="text-center text-5xl font-bold">
            Une méthode{" "}
            <span className="text-[#FCCD12]">
              simple et efficace
            </span>
          </h2>

          <div className="grid md:grid-cols-4 gap-8 max-w-7xl mx-auto px-6 mt-20">
            {[
              {
                icon: <FaBullseye />,
                title: "Écoute",
              },
              {
                icon: <FaRocket />,
                title: "Stratégie",
              },
              {
                icon: <FaClipboardCheck />,
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