"use client";

import Image from "next/image";
import CountUp from "react-countup";
import { motion } from "framer-motion";

import {
  FaBullhorn,
  FaVideo,
  FaCamera,
  FaBroadcastTower,
  FaCode,
  FaRing,
  FaYoutube,
  FaTiktok,
  FaInstagram,
  FaEye,
  FaTrophy,
} from "react-icons/fa";

import Navbar from "../components/navbar";

export default function ServicesPage() {

  const services = [
    {
      icon: <FaBullhorn size={32} />,
      title: "Communication Digitale",
      desc: "Gestion réseaux sociaux, création de contenu et publicité."
    },
    {
      icon: <FaVideo size={32} />,
      title: "Production Audiovisuelle",
      desc: "Reportages, interviews, documentaires et clips."
    },
    {
      icon: <FaCamera size={32} />,
      title: "Photographie",
      desc: "Mariages, portraits, événements et produits."
    },
    {
      icon: <FaBroadcastTower size={32} />,
      title: "Streaming Live",
      desc: "YouTube, Facebook, TikTok et événements."
    },
    {
      icon: <FaCode size={32} />,
      title: "Développement Web",
      desc: "Sites vitrines et solutions digitales."
    },
    {
      icon: <FaRing size={32} />,
      title: "Mariages & Événementiel",
      desc: "Captation et couverture complète."
    },
  ];

  return (
    <>
      <Navbar />

      <main className="bg-[#020B2E] text-white min-h-screen">

        {/* HERO */}

        <section className="max-w-7xl mx-auto px-6 pt-36 pb-20">

          <div className="grid lg:grid-cols-2 gap-12 items-center">

            <div>

              <span className="text-sm bg-blue-900 px-4 py-2 rounded-full">
                Agence de Communication Digitale
              </span>

              <h1 className="text-5xl md:text-7xl font-black mt-6 leading-tight">

                Nous
                <span className="text-[#FCCD12]"> créons.</span>

                <br />

                Nous
                <span className="text-[#FCCD12]"> filmons.</span>

                <br />

                Nous
                <span className="text-[#FCCD12]"> diffusons.</span>

                <br />

                Nous
                <span className="text-[#FCCD12]"> développons.</span>

              </h1>

              <p className="text-gray-300 text-lg mt-8 max-w-xl">
                Depuis 2019, Bichridigital accompagne entreprises,
                associations et particuliers dans leur communication.
              </p>

            </div>

            <div>

              <Image
                src="/hero.jpg"
                alt="Bichridigital"
                width={700}
                height={700}
                className="rounded-3xl shadow-2xl"
              />

            </div>

          </div>

        </section>

        {/* SERVICES */}

        <section className="max-w-7xl mx-auto px-6 py-10">

          <h2 className="text-5xl font-bold text-center mb-16">

            Nos
            <span className="text-[#FCCD12]"> expertises</span>

          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

            {services.map((service, index) => (

              <motion.div
                key={index}
                whileHover={{ y: -10 }}
                className="border border-blue-900 rounded-3xl p-8 bg-[#07133D]"
              >

                <div className="text-[#FCCD12] mb-6">
                  {service.icon}
                </div>

                <h3 className="text-2xl font-bold mb-4">
                  {service.title}
                </h3>

                <p className="text-gray-300">
                  {service.desc}
                </p>

              </motion.div>

            ))}

          </div>

        </section>
        {/* STATISTIQUES */}

<section className="max-w-7xl mx-auto px-6 py-20">
  <div className="grid grid-cols-5 gap-6">

    {/* Carte 1 */}
    <div className="bg-[#07133D] border border-[#1E40AF] rounded-2xl p-8 text-center">
      ...
    </div>

    {/* Carte 2 */}
    <div className="bg-[#07133D] border border-[#1E40AF] rounded-2xl p-8 text-center">
      ...
    </div>

    {/* Carte 3 */}
    <div className="bg-[#07133D] border border-[#1E40AF] rounded-2xl p-8 text-center">
      ...
    </div>

    {/* Carte 4 */}
    <div className="bg-[#07133D] border border-[#1E40AF] rounded-2xl p-8 text-center">
      ...
    </div>

    {/* Carte 5 */}
    <div className="bg-[#07133D] border border-[#1E40AF] rounded-2xl p-8 text-center">
      ...
    </div>

  </div>
</section>
              </main>
    </>
  );
}