"use client";

import Link from "next/link";
import Navbar from "../components/navbar";
import Footer from "../components/footer";

const categories = [
  "Tous",
  "Design",
  "Audiovisuel",
  "Photo",
  "Web",
  "Événementiel",
];

const projects = [
  {
    title: "AGRO KAYOR",
    category: "Design",
    image: "/agro-kayor.png",
    desc: "Création visuelle pour une marque agricole locale.",
  },
  {
    title: "AND DEFAR NDIAGNE",
    category: "Événementiel",
    image: "/and-defar.png",
    desc: "Communication associative et visuels événementiels.",
  },
  {
    title: "SARR SUNU GP",
    category: "Design",
    image: "/sarr-sunu-gp.png",
    desc: "Identité visuelle et supports de communication.",
  },
  {
    title: "TOUBA BAKHDATE SERVICE",
    category: "Design",
    image: "/tbs.png",
    desc: "Affiche commerciale et communication digitale.",
  },
  {
    title: "BICHRIDIGITAL STUDIO",
    category: "Audiovisuel",
    image: "/studio.jpg",
    desc: "Production audiovisuelle, tournage et montage.",
  },
  {
    title: "GRANDES JOURNÉES CULTURELLES",
    category: "Web",
    image: "/portfolio1.png",
    desc: "Conception visuelle et communication événementielle.",
  },
];

const domains = [
  {
    abbr: "DG",
    title: "Design Graphique",
    desc: "Création d’identités visuelles, affiches, flyers et supports de communication.",
  },
  {
    abbr: "AV",
    title: "Production Audiovisuelle",
    desc: "Réalisation de vidéos, spots, films institutionnels et contenus publicitaires.",
  },
  {
    abbr: "PH",
    title: "Photographie",
    desc: "Shooting professionnel pour événements, portraits, produits et reportages.",
  },
  {
    abbr: "WD",
    title: "Web & Digital",
    desc: "Création de sites web, applications et stratégies digitales sur mesure.",
  },
];

export default function PortfolioPage() {
  return (
    <>
      <Navbar />

      <main className="bg-[#020B2E] text-white overflow-hidden">
        {/* HERO */}
        <section className="relative min-h-[640px] flex items-center justify-center px-6 text-center overflow-hidden">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: "center center" }}
          >
            <source src="/hero-video2.mp4" type="video/mp4" />
          </video>

          <div className="absolute inset-0 bg-[#020B2E]/82"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#020B2E]/30 via-[#020B2E]/70 to-[#020B2E]"></div>

          <div className="relative z-10 max-w-5xl mx-auto pt-20">
            <div className="flex items-center justify-center gap-4 mb-5">
              <span className="w-12 h-[2px] bg-[#FCCD12]"></span>
              <span className="text-[#FCCD12] text-sm font-black uppercase tracking-widest">
                Notre Portfolio
              </span>
              <span className="w-12 h-[2px] bg-[#FCCD12]"></span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight">
              Nos réalisations parlent <br />
              pour notre{" "}
              <span className="text-[#FCCD12]">savoir-faire.</span>
            </h1>

            <p className="mt-7 text-gray-200 text-lg md:text-xl leading-8 max-w-3xl mx-auto">
              De la communication digitale à l’audiovisuel, en passant par la
              photographie, le streaming et le web, découvrez une sélection de
              projets réalisés avec passion par Bichridigital.
            </p>

            <div className="mt-10 flex justify-center">
              <Link
                href="#projets"
                className="bg-[#FCCD12] text-[#020B2E] px-10 py-4 rounded-full font-black shadow-lg hover:scale-105 transition"
              >
                Voir les projets →
              </Link>
            </div>
          </div>
        </section>

        {/* CATEGORIES */}
        <section className="pt-16 pb-8">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-wrap justify-center gap-4">
              {categories.map((category, index) => (
                <button
                  key={category}
                  className={`px-7 py-3 rounded-full border font-bold transition ${
                    index === 0
                      ? "bg-[#FCCD12] text-[#020B2E] border-[#FCCD12]"
                      : "border-white/15 text-gray-300 hover:border-[#FCCD12] hover:text-[#FCCD12]"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* PROJECTS GRID */}
        <section id="projets" className="py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-14">
              <div className="flex items-center justify-center gap-4 mb-4">
                <span className="w-10 h-[2px] bg-[#FCCD12]"></span>
                <span className="text-[#FCCD12] text-sm font-black uppercase tracking-widest">
                  Nos réalisations
                </span>
                <span className="w-10 h-[2px] bg-[#FCCD12]"></span>
              </div>

              <h2 className="text-4xl md:text-5xl font-black">
                Quelques projets réalisés
              </h2>

              <p className="mt-5 text-gray-400 max-w-2xl mx-auto leading-7">
                Une sélection de créations visuelles, digitales et
                audiovisuelles réalisées pour nos clients et partenaires.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project) => (
                <div
                  key={project.title}
                  className="group rounded-[24px] overflow-hidden bg-[#071542] border border-blue-500/30 hover:border-[#FCCD12] transition-all duration-300 hover:-translate-y-2 shadow-[0_0_40px_rgba(0,87,255,0.15)]"
                >
                  <div className="relative h-[240px] overflow-hidden">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-[#020B2E] via-[#020B2E]/30 to-transparent opacity-80"></div>
                  </div>

                  <div className="p-7">
                    <span className="inline-block px-4 py-1 rounded-full border border-[#FCCD12]/40 text-[#FCCD12] text-sm font-bold mb-4">
                      {project.category}
                    </span>

                    <h3 className="text-2xl font-black">
                      {project.title}
                    </h3>

                    <p className="mt-4 text-gray-400 leading-7">
                      {project.desc}
                    </p>

                    <Link
                      href="/contact"
                      className="inline-block mt-6 text-[#FCCD12] font-bold"
                    >
                      Voir projet →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* DOMAINS */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-14">
              <div className="flex items-center justify-center gap-4 mb-4">
                <span className="w-10 h-[2px] bg-[#FCCD12]"></span>
                <span className="text-[#FCCD12] text-sm font-black uppercase tracking-widest">
                  Nos domaines de réalisation
                </span>
                <span className="w-10 h-[2px] bg-[#FCCD12]"></span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {domains.map((domain) => (
                <div
                  key={domain.title}
                  className="rounded-[22px] bg-[#071542]/95 border border-blue-500/30 p-7 hover:border-[#FCCD12] transition"
                >
                  <div className="w-16 h-16 rounded-2xl bg-[#1738C8] text-[#FCCD12] flex items-center justify-center font-black text-xl mb-6">
                    {domain.abbr}
                  </div>

                  <h3 className="text-xl font-black">
                    {domain.title}
                  </h3>

                  <p className="mt-4 text-gray-400 leading-7 text-sm">
                    {domain.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURED PROJECT */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="rounded-[32px] bg-[#071542] border border-blue-500/30 overflow-hidden grid lg:grid-cols-2 gap-0 shadow-[0_0_80px_rgba(0,87,255,0.18)]">
              <div className="relative min-h-[360px]">
                <img
                  src="/portfolio2.png"
                  alt="Projet à la une"
                  className="w-full h-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#071542]/40"></div>
              </div>

              <div className="p-10 md:p-14 flex flex-col justify-center">
                <div className="flex items-center gap-4 mb-5">
                  <span className="w-10 h-[2px] bg-[#FCCD12]"></span>
                  <span className="text-[#FCCD12] text-sm font-black uppercase tracking-widest">
                    Projet à la une
                  </span>
                </div>

                <h2 className="text-4xl md:text-5xl font-black leading-tight">
                  Bichridigital donne vie{" "}
                  <span className="text-[#FCCD12]">aux projets.</span>
                </h2>

                <p className="mt-6 text-gray-300 leading-8">
                  Chaque projet que nous réalisons est le fruit d’une écoute
                  attentive, d’une idée forte et d’une exécution rigoureuse.
                  Du concept à la diffusion, nous accompagnons nos clients à
                  chaque étape pour garantir des résultats qui marquent.
                </p>

                <Link
                  href="/services"
                  className="inline-block mt-8 bg-[#FCCD12] text-[#020B2E] px-8 py-4 rounded-full font-black w-fit hover:scale-105 transition"
                >
                  Découvrir notre expertise →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="rounded-[32px] bg-gradient-to-r from-[#003CFF] to-[#0057FF] p-10 md:p-14 grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <span className="w-10 h-[2px] bg-[#FCCD12]"></span>
                  <span className="text-[#FCCD12] text-sm font-black uppercase tracking-widest">
                    Prêt à passer à l’action ?
                  </span>
                </div>

                <h2 className="text-4xl md:text-5xl font-black leading-tight">
                  Vous avez un projet à réaliser ? <br />
                  Confiez votre image à{" "}
                  <span className="text-[#FCCD12]">
                    Bichridigital Agency.
                  </span>
                </h2>
              </div>

              <div className="lg:text-right">
                <Link
                  href="/contact"
                  className="inline-block bg-[#FCCD12] text-[#020B2E] px-10 py-4 rounded-xl font-black hover:scale-105 transition"
                >
                  Nous contacter →
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}