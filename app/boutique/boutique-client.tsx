"use client";

import Navbar from "../components/navbar";
import Footer from "../components/footer";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
} from "react";
import { createClient } from "../../lib/supabase/client";
import OrderModal from "./order-modal";

type Product = {
  id: string;
  name: string;
  image: string;
  desc: string;
  oldPrice?: string;
  price: string;
  specs?: string;
  isPromo?: boolean;
};

type DatabaseProduct = {
  id: string;
  created_at: string;
  name: string;
  category: string;
  description: string | null;
  price: string | null;
  old_price: string | null;
  specs: string | null;
  image_url: string | null;
  is_promo: boolean;
  is_active: boolean;
};

type CarouselDirection = "right-to-left" | "left-to-right";

const navigationCategories = [
  { label: "Services", href: "#services-bichridigital" },
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


function normalizeImageUrl(imageUrl: string | null) {
  if (!imageUrl) return "/logo.png";

  if (
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://") ||
    imageUrl.startsWith("/")
  ) {
    return imageUrl;
  }

  return `/${imageUrl}`;
}

function mapDatabaseProduct(product: DatabaseProduct): Product {
  return {
    id: product.id,
    name: product.name,
    image: normalizeImageUrl(product.image_url),
    desc:
      product.description?.trim() ||
      "Produit disponible chez Bichridigital.",
    oldPrice: product.old_price?.trim() || undefined,
    price: product.price?.trim() || "Prix sur demande",
    specs: product.specs?.trim() || undefined,
    isPromo: product.is_promo,
  };
}

function ProductCarousel({
  id,
  eyebrow,
  title,
  description,
  products,
  direction,
  onOrder,
  sectionClassName = "bg-[#020B2E]",
}: {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  products: Product[];
  direction: CarouselDirection;
  onOrder: (product: Product) => void;
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
    if (!slider || products.length === 0) return;

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
  }, [direction, products.length]);

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

  if (products.length === 0) {
    return (
      <section
        id={id}
        className={`scroll-mt-28 py-20 overflow-hidden ${sectionClassName}`}
      >
        <div className="max-w-7xl mx-auto px-6">
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

          <div className="mt-10 rounded-[28px] border border-dashed border-white/15 bg-white/[0.04] p-10 text-center">
            <div className="text-5xl">📦</div>
            <h3 className="mt-5 text-2xl font-black text-white">
              Aucun produit actif dans cette catégorie
            </h3>
            <p className="mt-3 text-gray-400">
              Les prochains produits ajoutés depuis l’administration apparaîtront ici automatiquement.
            </p>
          </div>
        </div>
      </section>
    );
  }

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
          className="flex gap-8 overflow-x-auto px-6 py-8 cursor-grab active:cursor-grabbing select-none scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {[...products, ...products, ...products].map((product, index) => (
            <article
              key={`${product.id ?? product.name}-${index}`}
             className="group w-[310px] sm:w-[350px] md:w-[380px] shrink-0 rounded-[28px]
              bg-[#071542] border border-blue-500/30 overflow-hidden hover:border-[#FCCD12] 
              hover:scale-[1.04] active:scale-[1.03] focus-within:scale-[1.04] hover:z-30 
              focus-within:z-30 transition-all duration-300 shadow-[0_0_45px_rgba(0,87,255,0.18)] 
             hover:shadow-[0_0_70px_rgba(252,205,18,0.25)]"
            >
              <div className="relative h-[230px] bg-[#0B1C54] overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500
                   group-hover:scale-110 group-focus-within:scale-110"
                  draggable={false}
                />

                {product.isPromo && (
                  <div className="absolute top-4 left-4 bg-[#FCCD12] text-[#020B2E] px-4 py-2 rounded-full text-sm font-black">
                    PROMO
                  </div>
                )}
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
                  {product.oldPrice && (
                    <span className="text-gray-500 line-through font-bold">
                      {product.oldPrice}
                    </span>
                  )}

                  <span className="text-[#FCCD12] text-2xl font-black">
                    {product.price}
                  </span>
                </div>

                <button
                  type="button"
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={() => onOrder(product)}
                  className="inline-block mt-7 bg-[#FCCD12] text-[#020B2E] px-7 py-3 rounded-full font-black hover:scale-105 transition"
                >
                  Commander →
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function BoutiquePage() {
  const supabase = useMemo(() => createClient(), []);
  const [databaseProducts, setDatabaseProducts] = useState<DatabaseProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      setLoadingProducts(true);
      setProductsError("");

      const { data, error } = await supabase
        .from("products")
        .select(
          "id, created_at, name, category, description, price, old_price, specs, image_url, is_promo, is_active"
        )
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (!isMounted) return;

      if (error) {
        console.error("Erreur Supabase boutique :", error);
        setProductsError(
          "Les nouveaux produits ne peuvent pas être chargés pour le moment."
        );
        setDatabaseProducts([]);
      } else {
        setDatabaseProducts((data ?? []) as DatabaseProduct[]);
      }

      setLoadingProducts(false);
    }

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  const computerProducts = databaseProducts
    .filter((product) => product.category === "ordinateur")
    .map(mapDatabaseProduct);

  const tshirtProducts = databaseProducts
    .filter((product) => product.category === "tshirt")
    .map(mapDatabaseProduct);

  const pullProducts = databaseProducts
    .filter((product) => product.category === "pull")
    .map(mapDatabaseProduct);

  const capProducts = databaseProducts
    .filter((product) => product.category === "casquette")
    .map(mapDatabaseProduct);

  const otherProducts = databaseProducts
    .filter((product) =>
      ["tableau", "autre"].includes(product.category)
    )
    .map(mapDatabaseProduct);

  const visibleNavigationCategories =
    otherProducts.length > 0
      ? [
          ...navigationCategories,
          { label: "Autres", href: "#autres" },
        ]
      : navigationCategories;

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
              
              {visibleNavigationCategories.map((category, index) => (
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

        {loadingProducts && (
          <div className="mx-auto max-w-7xl px-6 pt-8 text-center text-sm font-bold text-gray-400">
            Chargement des produits...
          </div>
        )}

        {productsError && (
          <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-red-500/30 bg-red-500/10 px-6 py-4 text-center text-sm font-bold text-red-300">
            {productsError}
          </div>
        )}

        {!loadingProducts && !productsError && databaseProducts.length === 0 && (
          <div className="mx-auto mt-10 max-w-4xl rounded-[28px] border border-dashed border-white/15 bg-white/[0.04] px-8 py-12 text-center">
            <div className="text-6xl">🛍️</div>
            <h2 className="mt-5 text-3xl font-black">
              La boutique sera bientôt remplie
            </h2>
            <p className="mt-4 text-gray-400 leading-7">
              Ajoutez les produits depuis le tableau de bord administrateur. Ils apparaîtront ici automatiquement.
            </p>
          </div>
        )}

        <ProductCarousel
          id="ordinateurs"
          eyebrow="Derniers arrivages"
          title="Nos derniers ordinateurs disponibles"
          description="Découvrez nos dernières machines avec des prix promo. Les stocks sont limités, contactez-nous rapidement pour réserver."
          products={computerProducts}
          direction="right-to-left"
          onOrder={setSelectedProduct}
          sectionClassName="bg-[#020B2E]"
        />

        <ProductCarousel
          id="tshirts"
          eyebrow="Textile"
          title="Nos T-shirts disponibles"
          description="Des T-shirts personnalisés pour votre marque, vos événements et votre style quotidien."
          products={tshirtProducts}
          direction="left-to-right"
          onOrder={setSelectedProduct}
          sectionClassName="bg-[#04113A]"
        />

        <ProductCarousel
          id="pulls"
          eyebrow="Style & confort"
          title="Nos pulls disponibles"
          description="Des pulls confortables, sobres et personnalisables selon votre identité."
          products={pullProducts}
          direction="right-to-left"
          onOrder={setSelectedProduct}
          sectionClassName="bg-[#020B2E]"
        />

        <ProductCarousel
          id="casquettes"
          eyebrow="Accessoires"
          title="Nos casquettes disponibles"
          description="Des casquettes personnalisées pour compléter votre style ou valoriser votre marque."
          products={capProducts}
          direction="left-to-right"
          onOrder={setSelectedProduct}
          sectionClassName="bg-[#04113A]"
        />

        {otherProducts.length > 0 && (
          <ProductCarousel
            id="autres"
            eyebrow="Nouveautés"
            title="Nos autres produits disponibles"
            description="Découvrez les autres articles ajoutés depuis l’administration Bichridigital."
            products={otherProducts}
            direction="right-to-left"
            onOrder={setSelectedProduct}
            sectionClassName="bg-[#020B2E]"
          />
        )}
{/* SERVICES BICHRIDIGITAL */}
<section id="services-bichridigital" className="boutique-reveal scroll-mt-28 py-20 bg-[#020B2E]">
  <div className="max-w-7xl mx-auto px-6">
    <div className="text-center mb-14">
      <div className="flex items-center justify-center gap-4 mb-4">
        <span className="w-10 h-[2px] bg-[#FCCD12]"></span>
        <span className="text-[#FCCD12] text-sm font-black uppercase tracking-widest">
          Services disponibles
        </span>
        <span className="w-10 h-[2px] bg-[#FCCD12]"></span>
      </div>

      <h2 className="text-4xl md:text-5xl font-black">
        Votre partenaire en communication et impression digitale
      </h2>

      <p className="mt-5 text-gray-400 max-w-3xl mx-auto leading-7">
        Chez Bichridigital Agency, nous transformons vos idées en supports de
        communication innovants et de haute qualité. Nous vous accompagnons dans
        la création, la personnalisation et l’impression de tous vos produits de
        communication.
      </p>
    </div>

    <div className="grid lg:grid-cols-2 gap-10 items-start">
      <div className="group rounded-[28px] bg-[#071542] border border-blue-500/30 overflow-hidden shadow-[0_0_45px_rgba(0,87,255,0.18)] hover:border-[#FCCD12] hover:scale-[1.03] hover:shadow-[0_0_80px_rgba(252,205,18,0.22)] transition-all duration-500">
        <img
          src="/boutique/services-disponibles.jpg"
          alt="Bichridigital services disponibles"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        {[
          ["Impression et personnalisation", "Impression numérique grand format, affiches publicitaires, flyers, dépliants, cartes de visite, papier en-tête, enveloppes, brochures et catalogues."],
          ["Décoration et tableaux muraux", "Tableaux muraux personnalisés, cadres photo, tableaux d’entreprise, décoration intérieure et événementielle, impressions sur toile canvas."],
          ["Objets publicitaires", "Mugs personnalisés, porte-clés, stylos, goodies, agendas et cadeaux d’entreprise."],
          ["Packaging personnalisé", "Sachets personnalisés, sacs en papier, sacs promotionnels, emballages de produits, étiquettes et autocollants."],
          ["Textile personnalisé", "T-shirts, polos, pulls, sweats, casquettes, bonnets, uniformes et vêtements d’entreprise."],
          ["Signalétique et événementiel", "Banderoles, kakémonos, roll-up, bâches publicitaires, panneaux et enseignes."],
          ["Communication digitale", "Création de sites web, gestion des réseaux sociaux, conception graphique, logos, identités visuelles, production audiovisuelle et streaming en direct."],
        ].map(([title, desc]) => (
          <div
            key={title}
            className="group rounded-[22px] bg-white/[0.04] border border-white/10 p-6 hover:border-[#FCCD12]/80 hover:bg-white/[0.06] hover:scale-[1.04] hover:-translate-y-1 hover:shadow-[0_0_45px_rgba(252,205,18,0.12)] transition-all duration-300"
          >
            <h3 className="text-xl font-black text-[#FCCD12] group-hover:text-white transition">
              {title}
            </h3>
            <p className="mt-4 text-gray-300 leading-7 text-sm">{desc}</p>
          </div>
        ))}
      </div>
    </div>

    <div className="mt-12 rounded-[28px] bg-gradient-to-r from-[#003CFF] to-[#0057FF] p-8 md:p-10 grid lg:grid-cols-[1fr_auto] gap-8 items-center hover:scale-[1.01] transition-transform duration-300">
      <div>
        <h3 className="text-3xl font-black">Pourquoi choisir Bichridigital ?</h3>

        <div className="mt-6 flex flex-wrap gap-3">
          {[
            "Qualité premium",
            "Créativité et innovation",
            "Personnalisation sur mesure",
            "Service rapide et fiable",
            "Accompagnement professionnel",
          ].map((item) => (
            <span
              key={item}
              className="rounded-full bg-white/10 border border-white/15 px-5 py-2 text-sm font-bold text-white hover:bg-[#FCCD12] hover:text-[#020B2E] hover:scale-105 transition"
            >
              {item}
            </span>
          ))}
        </div>

        <p className="mt-6 text-white/85 leading-7">
          Votre histoire, image par image. Votre communication, notre priorité.
        </p>
      </div>

      <a
        href="https://wa.me/221773211096"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block bg-[#FCCD12] text-[#020B2E] px-8 py-4 rounded-xl font-black hover:scale-105 hover:-translate-y-1 active:scale-95 transition text-center"
      >
        Demander un devis →
      </a>
    </div>
  </div>

  <style>{`
    @keyframes boutiqueFadeUp {
      from {
        opacity: 0;
        transform: translateY(28px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .boutique-reveal {
      animation: boutiqueFadeUp 0.85s ease both;
    }
  `}
  </style>
</section>
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

      <OrderModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </>
  );
}
