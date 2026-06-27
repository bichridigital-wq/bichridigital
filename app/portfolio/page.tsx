"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const categories = [
  "Tous",
  "Graphisme",
  "Sites Web",
  "Photographie",
  "Vidéo",
];

const projects = [
  {
    id: 1,
    title: "Projet Graphique",
    category: "Graphisme",
    image: "/portfolio/portfolio1.png",
  },
  {
    id: 2,
    title: "Site Web",
    category: "Sites Web",
    image: "/portfolio/portfolio2.png",
  },
  {
    id: 3,
    title: "Photographie",
    category: "Photographie",
    image: "/portfolio/portfolio3.png",
  },
  {
    id: 4,
    title: "Production Vidéo",
    category: "Vidéo",
    image: "/portfolio/portfolio4.png",
  },
  {
    id: 5,
    title: "Projet Bichridigital",
    category: "Graphisme",
    image: "/portfolio/portfolio5.png",
  },
];
export default function PortfolioPage() {
  const [activeCategory, setActiveCategory] =
    useState("Tous");

  const [selectedImage, setSelectedImage] =
    useState<string | null>(null);

  const filteredProjects =
    activeCategory === "Tous"
      ? projects
      : projects.filter(
          (project) =>
            project.category === activeCategory
        );
          return (
    <>
      <Navbar />

      <main className="bg-[#020B2E] text-white pt-24 min-h-screen">
      <section className="text-center py-24 px-6">
  <h1 className="text-5xl md:text-7xl font-black">
    Nos
    <span className="text-[#FCCD12]">
      {" "}Réalisations
    </span>
  </h1>

  <p className="text-gray-300 mt-8 max-w-3xl mx-auto text-lg">
    Découvrez quelques projets réalisés par
    Bichridigital Agency dans le domaine du
    graphisme, du web et de l'audiovisuel.
  </p>
</section>
<div className="flex flex-wrap justify-center gap-4 px-6 mb-16">
  {categories.map((category) => (
    <button
      key={category}
      onClick={() =>
        setActiveCategory(category)
      }
      className={`px-6 py-3 rounded-full transition ${
        activeCategory === category
          ? "bg-[#FCCD12] text-[#020B2E]"
          : "bg-white/10"
      }`}
    >
      {category}
    </button>
  ))}
</div>
<section className="max-w-7xl mx-auto px-6 pb-24">

  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">

    {filteredProjects.map((project) => (
      <div
        key={project.id}
        onClick={() =>
          setSelectedImage(project.image)
        }
        className="
          group
          cursor-pointer
          overflow-hidden
          rounded-3xl
          bg-white/5
          border
          border-white/10
        "
      >
        <div className="relative h-80 overflow-hidden">

          <Image
            src={project.image}
            alt={project.title}
            fill
            className="
              object-cover
              group-hover:scale-110
              transition
              duration-700
            "
          />

          <div className="
            absolute
            inset-0
            bg-black/50
            opacity-0
            group-hover:opacity-100
            transition
            flex
            items-end
            p-6
          ">
            <div>
              <p className="text-[#FCCD12]">
                {project.category}
              </p>

              <h3 className="text-2xl font-bold">
                {project.title}
              </h3>
            </div>
          </div>

        </div>
      </div>
    ))}

  </div>

</section>
{selectedImage && (
  <div
    onClick={() => setSelectedImage(null)}
    className="
      fixed
      inset-0
      bg-black/90
      z-[999]
      flex
      items-center
      justify-center
      p-6
    "
  >
    <div className="relative w-full max-w-5xl h-[80vh]">
      <Image
        src={selectedImage}
        alt=""
        fill
        className="object-contain"
      />
    </div>
  </div>
)}
<section className="py-24 text-center px-6">
  <h2 className="text-4xl md:text-6xl font-black">
    Votre projet mérite
    <span className="text-[#FCCD12]">
      {" "}l'excellence.
    </span>
  </h2>

  <p className="text-gray-300 mt-8">
    Parlons ensemble de votre prochain projet.
  </p>

  <Link
    href="/contact"
    className="
      inline-block
      mt-10
      bg-[#FCCD12]
      text-[#020B2E]
      font-bold
      px-8
      py-4
      rounded-full
    "
  >
    Demander un devis →
  </Link>
</section>
      </main>

      <Footer />
    </>
  );
}