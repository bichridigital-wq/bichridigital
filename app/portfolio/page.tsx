"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "../components/Navbar";
import ContactFooter from "../components/contact/ContactFooter";
const projects = [
  {
    id: 1,
    title: "Affiche Mariage",
    category: "Graphisme",
    image: "/mariage-1.jpg",
  },
  {
    id: 2,
    title: "Affiche Mariage 2",
    category: "Graphisme",
    image: "/mariage-2.jpg",
  },
  {
    id: 3,
    title: "Site Web Bichridigital",
    category: "Sites Web",
    image: "/portfolio1.png",
  },
  {
    id: 4,
    title: "Projet Web",
    category: "Sites Web",
    image: "/portfolio2.png",
  },
  {
    id: 5,
    title: "Studio Photo",
    category: "Photographie",
    image: "/studio.jpg",
  },
  {
    id: 6,
    title: "Streaming Live",
    category: "Vidéo",
    image: "/streaming.jpg",
  },
];
const categories = [
  "Tous",
  "Graphisme",
  "Sites Web",
  "Photographie",
  "Vidéo",
];
export default function PortfolioPage() {
  const [activeCategory, setActiveCategory] =
    useState("Tous");

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

      <main className="bg-[#020B2E] text-white pt-28">
        <div className="flex flex-wrap justify-center gap-4 mb-16 px-6">
  {categories.map((category) => (
    <button
      key={category}
      onClick={() =>
        setActiveCategory(category)
      }
      className={`px-6 py-3 rounded-full transition-all duration-300 ${
        activeCategory === category
          ? "bg-[#FCCD12] text-[#020B2E]"
          : "bg-white/10 text-white"
      }`}
    >
      {category}
    </button>
  ))}
</div>
<section className="max-w-7xl mx-auto px-6 pb-24">
  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
    {filteredProjects.map((project) => (
      <div
        key={project.id}
        className="bg-white/5 rounded-3xl overflow-hidden border border-white/10 hover:border-[#FCCD12] transition-all group"
      >
        <div className="relative h-72 overflow-hidden">
          <Image
            src={project.image}
            alt={project.title}
            fill
            className="object-cover group-hover:scale-110 transition duration-500"
          />
        </div>

        <div className="p-6">
          <p className="text-[#FCCD12] text-sm mb-2">
            {project.category}
          </p>

          <h3 className="text-2xl font-bold">
            {project.title}
          </h3>
        </div>
      </div>
    ))}
  </div>
</section>
<section className="bg-gradient-to-r from-[#001B5E] to-[#0057FF] py-20">
  <div className="max-w-4xl mx-auto text-center px-6">
    <h2 className="text-4xl font-bold">
      Vous avez un projet ?
    </h2>

    <p className="text-gray-200 mt-4">
      Confiez votre communication
      digitale à Bichridigital Agency.
    </p>

    <Link
      href="/contact"
      className="inline-block mt-8 bg-[#FCCD12] text-[#020B2E] font-bold px-8 py-4 rounded-full"
    >
      Demander un devis →
    </Link>
  </div>
</section>
      </main>

      <ContactFooter />
    </>
  );
}