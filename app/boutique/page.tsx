"use client";

import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { useEffect, useRef, type PointerEvent } from "react";

type Product = {
  name: string;
  image: string;
  desc: string;
  oldPrice: string;
  price: string;
  specs?: string;
};

type CarouselDirection = "right-to-left" | "left-to-right";

const navigationCategories = [
  { label: "Tous", href: "#produits" },
  { label: "Ordinateurs", href: "#ordinateurs" },
  { label: "T-shirts", href: "#tshirts" },
  { label: "Pulls", href: "#pulls" },
  { label: "Casquettes", href: "#casquettes" },
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

const latestComputers: Product[] = [
  {
    name: "HP EliteBook Core i5",
    image: "/boutique/pc1.jpg",
    desc: "Ordinateur portable professionnel, rapide et idéal pour bureautique, études et business.",
    oldPrice: "180 000 FCFA",
    price: "150 000 FCFA",
    specs: "Core i5 - 8GB RAM - 256GB SSD",
  },
  {
    name: "HP EliteBook Core i5",
    image: "/boutique/pc2.jpg",
    desc: "Ordinateur portable professionnel, rapide et idéal pour bureautique, études et business.",
    oldPrice: "200 000 FCFA",
    price: "180 000 FCFA",
    specs: "Core i5 - 8GB RAM - 256GB SSD",
  },
  {
    name: "Dell Latitude 7410 Core i7",
    image: "/boutique/pc3.jpg",
    desc: "PC puissant pour travail intensif, montage léger, gestion et multitâche.",
    oldPrice: "300 000 FCFA",
    price: "230 000 FCFA",
    specs: "Core i7 - 16GB RAM - 512GB SSD",
  },
  {
    name: "Lenovo ThinkPad",
    image: "/boutique/pc4.jpg",
    desc: "Machine solide, fiable et parfaite pour les professionnels et étudiants.",
    oldPrice: "240 000 FCFA",
    price: "225 000 FCFA",
    specs: "Core i5 - 16GB RAM - 256GB SSD",
  },
  {
    name: "HP ProBook 650 G8",
    image: "/boutique/pc5.jpg",
    desc: "Ordinateur élégant, performant et adapté aux besoins quotidiens.",
    oldPrice: "300 000 FCFA",
    price: "275 000 FCFA",
    specs: "Core i5 - 16GB RAM - 256GB SSD",
  },
  {
    name: "Dell Latitude 7480",
    image: "/boutique/pc6.jpg",
    desc: "PC polyvalent pour navigation, bureautique, formation et travail à distance.",
    oldPrice: "190 000 FCFA",
    price: "160 000 FCFA",
    specs: "Core i5 - 8GB RAM - 256GB SSD",
  },
  {
    name: "HP EliteBook 840 G8",
    image: "/boutique/pc7.jpg",
    desc: "Ordinateur professionnel puissant, léger et adapté au travail quotidien.",
    oldPrice: "290 000 FCFA",
    price: "260 000 FCFA",
    specs: "Core i5 - 8GB RAM - 512GB SSD",
  },
  {
    name: "MacBook Pro 2020",
    image: "/boutique/pc8.jpg",
    desc: "PC solide et performant pour bureautique, études, business et multitâche.",
    oldPrice: "400 000 FCFA",
    price: "380 000 FCFA",
    specs: "Core i5 - 16GB RAM - 256GB SSD",
  },
  {
    name: "Dell Precision 5540 Gamer",
    image: "/boutique/pc9.jpg",
    desc: "Machine fiable, résistante et idéale pour les professionnels.",
    oldPrice: "390 000 FCFA",
    price: "350 000 FCFA",
    specs: "Core i7 - 32GB RAM - 512GB SSD",
  },
  {
    name: "Dell Latitude 3190",
    image: "/boutique/pc10.jpg",
    desc: "Ordinateur élégant, rapide et pratique pour le bureau et les études.",
    oldPrice: "125 000 FCFA",
    price: "99 000 FCFA",
    specs: "8GB RAM - 128GB SSD",
  },
];

const tshirtProducts: Product[] = [
  {
    name: "T-shirt Mbégtémi",
    image: "/boutique/tshirt1.jpg",
    desc: "T-shirt confortable avec un style simple qui inspire le sourire.",
    oldPrice: "10 000 FCFA",
    price: "8 000 FCFA",
  },
];

const pullProducts: Product[] = [
  {
    name: "Pull Mbégtémi",
    image: "/boutique/pull1.jpg",
    desc: "Pull Mbégtémi sobre, élégant et confortable.",
    oldPrice: "18 000 FCFA",
    price: "15 000 FCFA",
  },
];

const casquetteProducts: Product[] = [
  {
    name: "Casquette Mbégtémi",
    image: "/boutique/casquette1.jpg",
    desc: "Casquette personnalisée Mbégtémi pour un style moderne.",
    oldPrice: "7 000 FCFA",
    price: "5 000 FCFA",
  },
];

function getWhatsappLink(productName: string) {
  const message = `Bonjour Bichridigital, je veux commander : ${productName}`;
  return `https://wa.me/221773211096?text=${encodeURIComponent(message)}`;
}

function ProductCarousel({
  id,
  eyebrow,
  title,
  description,
  products,
  direction,
  sectionClassName = "bg-[#020B2E]",
}: {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  products: Product[];
  direction: CarouselDirection;
  sectionClassName?: string;
}) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const pauseAutoScrollRef = useRef(false);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pauseAutoScroll = () => {
    pauseAutoScrollRef.current = true;

    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
    }
  };

  const resumeAutoScrollLater = () => {
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
    }

    resumeTimerRef.current = setTimeout(() => {
      pauseAutoScrollRef.current = false;
    }, 2500);
  };

  useEffect(() => {
    const slider = scrollRef.current;
    if (!slider) return;

    const oneSetWidth = slider.scrollWidth / 3;
    slider.scrollLeft = oneSetWidth;

    const interval = setInterval(() => {
      if (pauseAutoScrollRef.current) return;

      if (direction === "right-to-left") {
        slider.scrollLeft += 1;
      } else {
        slider.scrollLeft -= 1;
      }

      if (slider.scrollLeft >= oneSetWidth * 2) {
        slider.scrollLeft -= oneSetWidth;
      }

      if (slider.scrollLeft <= 0) {
        slider.scrollLeft += oneSetWidth;
      }
    }, 20);

    return () => {
      clearInterval(interval);

      if (resumeTimerRef.current) {
        clearTimeout(resumeTimerRef.current);
      }
    };
  }, [direction]);

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    const slider = scrollRef.current;
    if (!slider) return;

    pauseAutoScroll();
    isDraggingRef.current = true;
    startXRef.current = e.clientX;
    startScrollLeftRef.current = slider.scrollLeft;
    slider.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const slider = scrollRef.current;
    if (!slider || !isDraggingRef.current) return;

    const distance = e.clientX - startXRef.current;
    slider.scrollLeft = startScrollLeftRef.current - distance;
  };

  const handlePointerUp = (e: PointerEvent<HTMLDivElement>) => {
    const slider = scrollRef.current;
    isDraggingRef.current = false;
    resumeAutoScrollLater();

    if (slider && slider.hasPointerCapture(e.pointerId)) {
      slider.releasePointerCapture(e.pointerId);
    }
  };

  const scrollProducts = (buttonDirection: "left" | "right") => {
    const slider = scrollRef.current;
    if (!slider) return;

    pauseAutoScroll();

    slider.scrollBy({
      left: buttonDirection === "right" ? 420 : -420,
      behavior: "smooth",
    });

    resumeAutoScrollLater();
  };

  return (
    <section id={id} className={`scroll-mt-28 py-20 overflow-hidden ${sectionClassName}`}>
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <div className="text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="w-10 h-[2px] bg-[#FCCD12]"></span>
            <span className="text-[#FCCD12] text-sm font-black uppercase tracking-widest">
              {eyebrow}
            </span>
            <span className="w-10 h-[2px] bg-[#FCCD12]"></span>
          </div>

          <h2 className="text-4xl md:text-5xl font-black text-white">
            {title}
          </h2>

          <p className="mt-5 text-gray-400 max-w-2xl mx-auto leading-7">
            {description}
          </p>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        <p className="text-center text-gray-400 mb-6 text-sm">
          Faites glisser pour faire votre choix.
        </p>

        <button
          onClick={() => scrollProducts("left")}
          className="hidden md:flex absolute left-2 top-1/2 z-30 -translate-y-1/2 w-14 h-14 items-center justify-center rounded-full bg-[#020B2E]/90 border border-[#FCCD12]/60 text-[#FCCD12] text-2xl font-black backdrop-blur hover:bg-[#FCCD12] hover:text-[#020B2E] transition"
          aria-label="Défiler vers la gauche"
        >
          ←
        </button>

        <button
          onClick={() => scrollProducts("right")}
          className="hidden md:flex absolute right-2 top-1/2 z-30 -translate-y-1/2 w-14 h-14 items-center justify-center rounded-full bg-[#020B2E]/90 border border-[#FCCD12]/60 text-[#FCCD12] text-2xl font-black backdrop-blur hover:bg-[#FCCD12] hover:text-[#020B2E] transition"
          aria-label="Défiler vers la droite"
        >
          →
        </button>

        <div className="hidden md:block pointer-events-none absolute left-0 top-12 h-[calc(100%-48px)] w-24 bg-gradient-to-r from-[#020B2E] to-transparent z-20"></div>
        <div className="hidden md:block pointer-events-none absolute right-0 top-12 h-[calc(100%-48px)] w-24 bg-gradient-to-l from-[#020B2E] to-transparent z-20"></div>

        <div
          ref={scrollRef}
          onMouseEnter={pauseAutoScroll}
          onMouseLeave={resumeAutoScrollLater}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="flex gap-8 overflow-x-auto px-6 pb-8 cursor-grab active:cursor-grabbing select-none scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {[...products, ...products, ...products].map((product, index) => (
            <article
              key={`${product.name}-${index}`}
              className="w-[310px] sm:w-[350px] md:w-[380px] shrink-0 rounded-[28px] bg-[#071542] border border-blue-500/30 overflow-hidden hover:border-[#FCCD12] transition-all duration-300 shadow-[0_0_45px_rgba(0,87,255,0.18)]"
            >
              <div className="relative h-[230px] bg-[#0B1C54] overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  draggable={false}
                />

                <div className="absolute top-4 left-4 bg-[#FCCD12] text-[#020B2E] px-4 py-2 rounded-full text-sm font-black">
                  PROMO
                </div>
              </div>

              <div className="p-7">
                {product.specs && (
                  <span className="text-[#FCCD12] text-sm font-bold">
                    {product.specs}
                  </span>
                )}

                <h3 className="mt-3 text-2xl font-black text-white">
                  {product.name}
                </h3>

                <p className="mt-4 text-gray-400 leading-7">
                  {product.desc}
                </p>

                <div className="mt-6 flex items-end gap-4">
                  <span className="text-gray-500 line-through font-bold">
                    {product.oldPrice}
                  </span>

                  <span className="text-[#FCCD12] text-2xl font-black">
                    {product.price}
                  </span>
                </div>

                <a
                  href={getWhatsappLink(product.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-7 bg-[#FCCD12] text-[#020B2E] px-7 py-3 rounded-full font-black hover:scale-105 transition"
                >
                  Commander →
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function BoutiquePage() {
  return (
    <>
      <Navbar />

      <main id="produits" className="bg-[#020B2E] text-white overflow-hidden">
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
              signée <span className="text-[#FCCD12]">Bichridigital.</span>
            </h1>

            <p className="mt-7 text-gray-300 text-lg md:text-xl leading-8 max-w-3xl mx-auto">
              Ordinateurs, t-shirts, casquettes, pulls et articles personnalisés
              pour entreprises, événements, associations et particuliers.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-5">
              <a
                href="#ordinateurs"
                className="bg-[#FCCD12] text-[#020B2E] px-10 py-4 rounded-full font-black shadow-lg hover:scale-105 transition"
              >
                Voir les produits →
              </a>

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

        {/* NAVIGATION CATEGORIES */}
        <section className="sticky top-0 z-40 py-5 bg-[#020B2E]/95 backdrop-blur border-y border-white/10">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-wrap justify-center gap-4">
              {navigationCategories.map((category, index) => (
                <a
                  key={category.label}
                  href={category.href}
                  className={`px-7 py-3 rounded-full border font-bold transition ${
                    index === 0
                      ? "bg-[#FCCD12] text-[#020B2E] border-[#FCCD12]"
                      : "border-white/15 text-gray-300 hover:border-[#FCCD12] hover:text-[#FCCD12]"
                  }`}
                >
                  {category.label}
                </a>
              ))}
            </div>
          </div>
        </section>

        <ProductCarousel
          id="ordinateurs"
          eyebrow="Derniers arrivages"
          title="Nos derniers ordinateurs disponibles"
          description="Découvrez nos dernières machines avec des prix promo. Les stocks sont limités, contactez-nous rapidement pour réserver."
          products={latestComputers}
          direction="right-to-left"
          sectionClassName="bg-[#020B2E]"
        />

        <ProductCarousel
          id="tshirts"
          eyebrow="Textile"
          title="Nos T-shirts disponibles"
          description="Des T-shirts personnalisés pour votre marque, vos événements et votre style quotidien."
          products={tshirtProducts}
          direction="left-to-right"
          sectionClassName="bg-[#04113A]"
        />

        <ProductCarousel
          id="pulls"
          eyebrow="Style & confort"
          title="Nos pulls disponibles"
          description="Des pulls confortables, sobres et personnalisables selon votre identité."
          products={pullProducts}
          direction="right-to-left"
          sectionClassName="bg-[#020B2E]"
        />

        <ProductCarousel
          id="casquettes"
          eyebrow="Accessoires"
          title="Nos casquettes disponibles"
          description="Des casquettes personnalisées pour compléter votre style ou valoriser votre marque."
          products={casquetteProducts}
          direction="left-to-right"
          sectionClassName="bg-[#04113A]"
        />

        {/* ADVANTAGES */}
        <section className="py-20 bg-[#020B2E]">
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
                  key={item.title}
                  className="rounded-[26px] bg-white/[0.04] border border-white/10 p-8 hover:border-[#FCCD12] transition"
                >
                  <div className="w-14 h-14 rounded-full bg-[#FCCD12] text-[#020B2E] flex items-center justify-center font-black text-xl mb-6">
                    {index + 1}
                  </div>

                  <h3 className="text-2xl font-black">{item.title}</h3>

                  <p className="mt-4 text-gray-400 leading-7">{item.desc}</p>
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
                    Besoin d'un produit ?
                  </span>
                </div>

                <h2 className="text-4xl md:text-5xl font-black leading-tight">
                  Commandez vos articles directement avec{" "}
                  <span className="text-[#FCCD12]">BichriStore.</span>
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
