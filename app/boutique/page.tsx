"use client";

import Link from "next/link";
import Navbar from "../components/navbar";
import Footer from "../components/footer";

const categories = [
  "Tous",
  "Ordinateurs",
  "Textile",
  "Accessoires",
  "Personnalisation",
];

const products = [
  {
    title: "Ordinateurs portables",
    category: "Ordinateurs",
    desc: "PC portables performants pour étudiants, professionnels et créateurs de contenu.",
    price: "À partir de 150 000 FCFA",
    tag: "Informatique",
    icon: "PC",
  },
  {
    title: "Ordinateurs de bureau",
    category: "Ordinateurs",
    desc: "Postes fixes pour bureaux, studios, entreprises et espaces de travail.",
    price: "Sur commande",
    tag: "Informatique",
    icon: "DESK",
  },
  {
    title: "T-shirts personnalisés",
    category: "Textile",
    desc: "T-shirts modernes pour marques, événements, associations et entreprises.",
    price: "À partir de 5 000 FCFA",
    tag: "Textile",
    icon: "TS",
  },
  {
    title: "Casquettes",
    category: "Accessoires",
    desc: "Casquettes stylées et personnalisables pour votre image ou votre événement.",
    price: "À partir de 4 000 FCFA",
    tag: "Mode",
    icon: "CAP",
  },
  {
    title: "Pulls personnalisés",
    category: "Textile",
    desc: "Pulls confortables, professionnels et personnalisés selon votre besoin.",
    price: "À partir de 12 000 FCFA",
    tag: "Textile",
    icon: "PL",
  },
  {
    title: "Accessoires & divers",
    category: "Accessoires",
    desc: "Articles divers, goodies, supports de marque et produits sur demande.",
    price: "Sur devis",
    tag: "Divers",
    icon: "B+",
  },
];

const advantages = [
  {
    title: "Produits sélectionnés",
    desc: "Nous proposons des articles utiles, modernes et adaptés aux besoins de nos clients.",
  },
  {
    title: "Personnalisation",
    desc: "T-shirts, casquettes et pulls peuvent être adaptés à votre image.",
  },
  {
    title: "Commande simple",
    desc: "Vous choisissez le produit, puis vous nous contactez directement par WhatsApp.",
  },
];
const latestComputers = [
  {
    name: "HP EliteBook Core i5",
    image: "/boutique/pc1.jpg",
    desc: "Ordinateur portable professionnel, rapide et idéal pour bureautique, études et business.",
    oldPrice: "180 000 FCFA",
    price: "150 000 FCFA",
    specs: "Core i5 • 8GB RAM • 256GB SSD",
  },
  {
    name: "HP EliteBook Core i5",
    image: "/boutique/pc2.jpg",
    desc: "Ordinateur portable professionnel, rapide et idéal pour bureautique, études et business.",
    oldPrice: "200 000 FCFA",
    price: "180 000 FCFA",
    specs: "Core i5 • 8GB RAM • 256GB SSD",
  },
  {
    name: "Dell Latitude 7410 Core i7",
    image: "/boutique/pc3.jpg",
    desc: "PC puissant pour travail intensif, montage léger, gestion et multitâche.",
    oldPrice: "300 000 FCFA",
    price: "230 000 FCFA",
    specs: "Core i7 • 16GB RAM • 512GB SSD",
  },
  {
    name: "Lenovo ThinkPad",
    image: "/boutique/pc4.jpg",
    desc: "Machine solide, fiable et parfaite pour les professionnels et étudiants.",
    oldPrice: "240 000 FCFA",
    price: "225 000 FCFA",
    specs: "Core i5 • 16GB RAM • 256GB SSD",
  },
  {
    name: "HP ProBook 650 G8",
    image: "/boutique/pc5.jpg",
    desc: "Ordinateur élégant, performant et adapté aux besoins quotidiens.",
    oldPrice: "300 000 FCFA",
    price: "275 000 FCFA",
    specs: "Core i5 • 16GB RAM • 256GB SSD",
  },
  {
    name: "Dell Latitude 7480",
    image: "/boutique/pc6.jpg",
    desc: "PC polyvalent pour navigation, bureautique, formation et travail à distance.",
    oldPrice: "190 000 FCFA",
    price: "160 000 FCFA",
    specs: "Core i5 • 8GB RAM • 256GB SSD",
  },
];

export default function BoutiquePage() {
  return (
    <>
      <Navbar />

      <main className="bg-[#020B2E] text-white overflow-hidden">
        {/* HERO */}
        <section className="relative min-h-[620px] flex items-center justify-center px-6 text-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,87,255,0.35),transparent_45%)]"></div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#0057FF]/25 blur-[140px] rounded-full"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#FCCD12]/10 blur-[140px] rounded-full"></div>

          <div className="relative z-10 max-w-5xl mx-auto pt-20">
            <div className="flex items-center justify-center gap-4 mb-5">
              <span className="w-12 h-[2px] bg-[#FCCD12]"></span>
              <span className="text-[#FCCD12] text-sm font-black uppercase tracking-widest">
                BichriStore
              </span>
              <span className="w-12 h-[2px] bg-[#FCCD12]"></span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight">
              Boutique tech & lifestyle <br />
              signée{" "}
              <span className="text-[#FCCD12]">
                Bichridigital.
              </span>
            </h1>

            <p className="mt-7 text-gray-300 text-lg md:text-xl leading-8 max-w-3xl mx-auto">
              Ordinateurs, t-shirts, casquettes, pulls et articles personnalisés
              pour entreprises, événements, associations et particuliers.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-5">
              <Link
                href="#produits"
                className="bg-[#FCCD12] text-[#020B2E] px-10 py-4 rounded-full font-black shadow-lg hover:scale-105 transition"
              >
                Voir les produits →
              </Link>

              <a
                href="https://wa.me/221773211096"
                target="_blank"
                rel="noopener noreferrer"
                className="border border-[#FCCD12] text-white px-10 py-4 rounded-full font-bold hover:bg-[#FCCD12] hover:text-[#020B2E] transition"
              >
                Commander sur WhatsApp
              </a>
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
{/* DERNIERS ORDINATEURS */}
<section className="py-20 bg-[#020B2E] overflow-hidden">
  <div className="max-w-7xl mx-auto px-6 mb-12">
    <div className="text-center">
      <div className="flex items-center justify-center gap-4 mb-4">
        <span className="w-10 h-[2px] bg-[#FCCD12]"></span>
        <span className="text-[#FCCD12] text-sm font-black uppercase tracking-widest">
          Derniers arrivages
        </span>
        <span className="w-10 h-[2px] bg-[#FCCD12]"></span>
      </div>

      <h2 className="text-4xl md:text-5xl font-black text-white">
        Nos derniers ordinateurs disponibles
      </h2>

      <p className="mt-5 text-gray-400 max-w-2xl mx-auto leading-7">
        Découvrez nos dernières machines avec des prix cassés.
        Les stocks sont limités, contactez-nous rapidement pour réserver.
      </p>
    </div>
  </div>

  <div className="relative w-full overflow-hidden">
    <div className="computer-marquee flex gap-8 w-max">
      {[...latestComputers, ...latestComputers].map((pc, index) => (
        <div
          key={index}
          className="w-[330px] md:w-[380px] shrink-0 rounded-[28px] bg-[#071542] border border-blue-500/30 overflow-hidden hover:border-[#FCCD12] transition-all duration-300 shadow-[0_0_45px_rgba(0,87,255,0.18)]"
        >
          <div className="relative h-[230px] bg-[#0B1C54] overflow-hidden">
            <img
              src={pc.image}
              alt={pc.name}
              className="w-full h-full object-cover"
            />

            <div className="absolute top-4 left-4 bg-[#FCCD12] text-[#020B2E] px-4 py-2 rounded-full text-sm font-black">
              Prix cassé
            </div>
          </div>

          <div className="p-7">
            <span className="text-[#FCCD12] text-sm font-bold">
              {pc.specs}
            </span>

            <h3 className="mt-3 text-2xl font-black text-white">
              {pc.name}
            </h3>

            <p className="mt-4 text-gray-400 leading-7">
              {pc.desc}
            </p>

            <div className="mt-6 flex items-end gap-4">
              <span className="text-gray-500 line-through font-bold">
                {pc.oldPrice}
              </span>

              <span className="text-[#FCCD12] text-2xl font-black">
                {pc.price}
              </span>
            </div>

            <a
              href="https://wa.me/221773211096"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-7 bg-[#FCCD12] text-[#020B2E] px-7 py-3 rounded-full font-black hover:scale-105 transition"
            >
              Commander →
            </a>
          </div>
        </div>
      ))}
    </div>
  </div>

  <style>{`
    @keyframes computerMarquee {
      0% {
        transform: translateX(-50%);
      }
      100% {
        transform: translateX(0);
      }
    }

    .computer-marquee {
      animation: computerMarquee 35s linear infinite;
    }

    .computer-marquee:hover {
      animation-play-state: paused;
    }
  `}</style>
</section>
        {/* PRODUCTS */}
        <section id="produits" className="py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-14">
              <div className="flex items-center justify-center gap-4 mb-4">
                <span className="w-10 h-[2px] bg-[#FCCD12]"></span>
                <span className="text-[#FCCD12] text-sm font-black uppercase tracking-widest">
                  Nos produits
                </span>
                <span className="w-10 h-[2px] bg-[#FCCD12]"></span>
              </div>

              <h2 className="text-4xl md:text-5xl font-black">
                Ce que vous pouvez commander
              </h2>

              <p className="mt-5 text-gray-400 max-w-2xl mx-auto leading-7">
                Une sélection de produits utiles pour le travail, la
                communication, les événements et la personnalisation de marque.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <div
                  key={product.title}
                  className="group rounded-[26px] bg-[#071542] border border-blue-500/30 p-8 hover:border-[#FCCD12] hover:-translate-y-2 transition-all duration-300 shadow-[0_0_40px_rgba(0,87,255,0.15)]"
                >
                  <div className="w-20 h-20 rounded-2xl bg-[#1738C8] text-[#FCCD12] flex items-center justify-center font-black text-xl mb-7 shadow-[0_0_35px_rgba(0,87,255,0.35)]">
                    {product.icon}
                  </div>

                  <span className="inline-block px-4 py-1 rounded-full border border-[#FCCD12]/40 text-[#FCCD12] text-sm font-bold mb-4">
                    {product.tag}
                  </span>

                  <h3 className="text-2xl font-black group-hover:text-[#FCCD12] transition">
                    {product.title}
                  </h3>

                  <p className="mt-4 text-gray-400 leading-7">
                    {product.desc}
                  </p>

                  <p className="mt-5 text-white font-black">
                    {product.price}
                  </p>

                  <a
                    href="https://wa.me/221773211096"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-7 bg-[#FCCD12] text-[#020B2E] px-6 py-3 rounded-full font-black hover:scale-105 transition"
                  >
                    Commander →
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ADVANTAGES */}
        <section className="py-20 bg-[#04113A]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-14">
              <div className="flex items-center justify-center gap-4 mb-4">
                <span className="w-10 h-[2px] bg-[#FCCD12]"></span>
                <span className="text-[#FCCD12] text-sm font-black uppercase tracking-widest">
                  Pourquoi BichriStore ?
                </span>
                <span className="w-10 h-[2px] bg-[#FCCD12]"></span>
              </div>

              <h2 className="text-4xl md:text-5xl font-black">
                Une boutique simple, pratique et proche de vous
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {advantages.map((item, index) => (
                <div
                  key={index}
                  className="rounded-[26px] bg-white/[0.04] border border-white/10 p-8 hover:border-[#FCCD12] transition"
                >
                  <div className="w-14 h-14 rounded-full bg-[#FCCD12] text-[#020B2E] flex items-center justify-center font-black text-xl mb-6">
                    {index + 1}
                  </div>

                  <h3 className="text-2xl font-black">
                    {item.title}
                  </h3>

                  <p className="mt-4 text-gray-400 leading-7">
                    {item.desc}
                  </p>
                </div>
              ))}
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
                    Besoin d’un produit ?
                  </span>
                </div>

                <h2 className="text-4xl md:text-5xl font-black leading-tight">
                  Commandez vos articles directement avec{" "}
                  <span className="text-[#FCCD12]">
                    BichriStore.
                  </span>
                </h2>
              </div>

              <div className="lg:text-right">
                <a
                  href="https://wa.me/221773211096"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-[#FCCD12] text-[#020B2E] px-10 py-4 rounded-xl font-black hover:scale-105 transition"
                >
                  Commander sur WhatsApp →
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}