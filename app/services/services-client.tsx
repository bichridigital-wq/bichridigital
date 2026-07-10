"use client";

import Link from "next/link";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { motion } from "framer-motion";

type IconName =
  | "chat"
  | "video"
  | "web"
  | "camera"
  | "broadcast"
  | "design"
  | "idea"
  | "edit"
  | "send"
  | "star"
  | "bolt"
  | "chart";

const services: {
  title: string;
  desc: string;
  icon: IconName;
}[] = [
  {
    title: "Communication Digitale",
    desc: "Stratégie digitale, gestion des réseaux sociaux, campagnes publicitaires et création de contenu.",
    icon: "chat",
  },
  {
    title: "Production Audiovisuelle",
    desc: "Réalisation de vidéos, spots publicitaires, films institutionnels, montage et post-production.",
    icon: "video",
  },
  {
    title: "Développement Web",
    desc: "Création de sites vitrines, sites e-commerce et applications web modernes et performantes.",
    icon: "web",
  },
  {
    title: "Photographie",
    desc: "Shooting studio, événements, mariages, anniversaires, produits et retouche photo professionnelle.",
    icon: "camera",
  },
  {
    title: "Streaming Live",
    desc: "Diffusion en direct sur YouTube, Facebook, TikTok et autres plateformes avec une qualité professionnelle.",
    icon: "broadcast",
  },
  {
    title: "Design Graphique",
    desc: "Création d’identités visuelles, logos, affiches, flyers, brochures et supports de communication.",
    icon: "design",
  },
];

const process: {
  number: string;
  title: string;
  desc: string;
  icon: IconName;
}[] = [
  {
    number: "01",
    title: "Stratégie",
    desc: "Analyse, conseil et stratégie adaptée à vos objectifs.",
    icon: "idea",
  },
  {
    number: "02",
    title: "Création",
    desc: "Conception graphique, tournage, montage et développement.",
    icon: "edit",
  },
  {
    number: "03",
    title: "Diffusion",
    desc: "Publication et diffusion sur les meilleures plateformes.",
    icon: "send",
  },
];

const reasons: {
  title: string;
  desc: string;
  icon: IconName;
}[] = [
  {
    title: "Créativité",
    desc: "Nous créons des contenus uniques et modernes qui valorisent votre image.",
    icon: "star",
  },
  {
    title: "Réactivité",
    desc: "Une équipe disponible, à l’écoute et rapide pour répondre à vos besoins.",
    icon: "bolt",
  },
  {
    title: "Expérience",
    desc: "Une forte présence digitale, des projets réalisés et des clients satisfaits.",
    icon: "chart",
  },
];

function MiniTitle({
  label,
  center = false,
}: {
  label: string;
  center?: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 ${center ? "justify-center" : "justify-start"}`}>
      <span className="text-sm uppercase tracking-[0.3em] text-[#FCCD12] font-black">
        {label}
      </span>
    </div>
  );
}

function Dot() {
  return <span className="text-[#FCCD12]">•</span>;
}
const fadeUp = {
  hidden: {
    opacity: 0,
    y: 40,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
    },
  },
};

const staggerContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};
export default function ServicesPage() {
  return (
    <>
      <Navbar />

      <main className="bg-[#020B2E] text-white overflow-hidden">
        {/* HERO */}
       <section className="relative min-h-[650px] flex items-center justify-center px-6 text-center overflow-hidden">
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

  <div className="absolute inset-0 bg-[#020B2E]/75" />
  <div className="absolute inset-0 bg-gradient-to-b from-[#020B2E]/30 via-[#020B2E]/60 to-[#020B2E]" />

  <motion.div
  initial={{ opacity: 0, y: 40 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8 }}
  className="relative z-10 max-w-5xl mx-auto pt-20"
>
    <MiniTitle label="Nos Services" center />

    <h1 className="mt-5 text-4xl md:text-6xl lg:text-7xl font-black leading-tight">
      Des solutions créatives <br />
      pour développer <span className="text-[#FCCD12]">votre image.</span>
    </h1>

    <p className="mt-7 text-gray-200 text-lg md:text-xl leading-8 max-w-3xl mx-auto">
      Bichridigital Agency accompagne les entreprises, institutions et
      particuliers dans leur communication digitale et audiovisuelle.
    </p>

    <div className="mt-8 flex flex-wrap justify-center items-center gap-x-4 gap-y-2 text-base md:text-lg text-white">
      <span>Communication digitale</span>
      <Dot />
      <span>Audiovisuel</span>
      <Dot />
      <span>Web</span>
      <Dot />
      <span>Photographie</span>
      <Dot />
      <span>Streaming Live</span>
      <Dot />
      <span>Design</span>
    </div>

    <div className="mt-10 flex flex-wrap justify-center gap-5">
      <Link
        href="/contact"
        className="bg-[#FCCD12] text-[#020B2E] px-9 py-4 rounded-full font-black hover:scale-105 transition"
      >
        Demander un devis →
      </Link>

      <Link
        href="/portfolio"
        className="border border-[#FCCD12] text-white px-9 py-4 rounded-full font-bold hover:bg-[#FCCD12] hover:text-[#020B2E] transition"
      >
        Voir nos réalisations
      </Link>
    </div>
  </motion.div>
</section>
<div className="h-20 md:h-28 bg-[#020B2E]"></div>
        {/* SERVICES */}
       <motion.div
  variants={staggerContainer}
  initial="hidden"
  whileInView="show"
  viewport={{ once: true, amount: 0.2 }}
  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7"
>
  {services.map((service) => (
    <motion.div
  key={service.title}
  variants={fadeUp}
      className="rounded-[22px] bg-[#071542]/95 border border-[#244EA8]/60 p-7 min-h-[260px] shadow-[0_0_30px_rgba(0,87,255,0.12)] hover:border-[#FCCD12] hover:-translate-y-1 transition-all duration-300"
    >
      <div className="w-16 h-16 rounded-2xl bg-[#1738C8] text-[#FCCD12] flex items-center justify-center mb-6 shadow-[0_0_25px_rgba(0,87,255,0.35)] overflow-hidden">
        <SvgIcon name={service.icon} />
      </div>

      <h3 className="text-[26px] leading-tight font-extrabold text-white">
        {service.title}
      </h3>

      <p className="mt-4 text-gray-300 leading-7 text-[16px]">
        {service.desc}
      </p>

      <span className="inline-block mt-5 text-[#FCCD12] text-2xl">
        →
      </span>
    </motion.div>
  ))}
</motion.div>

        {/* PROCESS */}
        <section className="py-24 bg-[#04113A] relative overflow-hidden">
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_bottom,rgba(0,87,255,0.45),transparent_45%)]" />

          <div className="relative z-10 max-w-7xl mx-auto px-6 grid lg:grid-cols-[0.8fr_1.2fr] gap-16 items-center">
            <div>
              <MiniTitle label="De l’idée à la diffusion" />

              <h2 className="mt-5 text-4xl md:text-5xl font-black leading-tight">
                Nous vous accompagnons <br />
                à chaque étape de{" "}
                <span className="text-[#FCCD12]">votre projet.</span>
              </h2>

              <p className="mt-6 text-gray-300 leading-8 max-w-xl">
                De la conception à la diffusion, nous mettons notre expertise à
                votre service pour garantir des résultats concrets.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {process.map((item) => (
                <div key={item.number} className="text-center">
                  <div className="relative mx-auto w-32 h-32 rounded-full border border-white/35 bg-[#061947]/70 flex items-center justify-center text-[#FCCD12]">
                    <span className="absolute -top-3 right-3 bg-[#FCCD12] text-[#020B2E] text-sm font-black rounded-full w-9 h-9 flex items-center justify-center">
                      {item.number}
                    </span>
                    <SvgIcon name={item.icon} large />
                  </div>

                  <h3 className="mt-6 text-xl font-black">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-gray-300 text-sm leading-6">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WHY CHOOSE US */}
        <section className="py-24 bg-[#020B2E]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <MiniTitle label="Pourquoi nous choisir ?" center />

              <h2 className="mt-4 text-4xl md:text-5xl font-black">
                Bichridigital, votre partenaire de confiance
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-10">
              {reasons.map((reason) => (
                <div
                  key={reason.title}
                  className="flex gap-6 items-start md:border-r md:border-white/10 last:border-r-0 md:pr-8"
                >
                  <div className="w-20 h-20 rounded-full bg-[#102B8A] text-[#FCCD12] flex items-center justify-center shrink-0 shadow-[0_0_35px_rgba(0,87,255,0.25)]">
                    <SvgIcon name={reason.icon} />
                  </div>

                  <div>
                    <h3 className="text-2xl font-black">
                      {reason.title}
                    </h3>

                    <p className="mt-3 text-gray-300 leading-7">
                      {reason.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

       {/* CTA */}
<section className="py-24">
  <div className="max-w-7xl mx-auto px-6">
    <div className="rounded-[32px] bg-gradient-to-r from-[#003CFF] to-[#0057FF] p-10 md:p-14 grid lg:grid-cols-2 gap-8 items-center">
      <div>
        <div className="flex items-center gap-4 mb-4">
          <span className="w-10 h-[2px] bg-[#FCCD12]"></span>
          <span className="text-[#FCCD12] text-sm font-bold uppercase tracking-widest">
            Vous avez un projet ?
          </span>
        </div>

        <h2 className="text-4xl md:text-5xl font-black leading-tight">
          Confiez votre communication <br />
          à Bichridigital Agency.
        </h2>
      </div>

      <div className="lg:text-right">
        <Link
          href="/contact"
          className="inline-block bg-[#FCCD12] text-[#020B2E] px-10 py-4 rounded-xl font-black hover:scale-105 transition"
        >
          Nous contacter maintenant →
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

function SvgIcon({
  name,
  large = false,
}: {
  name: IconName;
  large?: boolean;
}) {
  const size = large ? 42 : 28;

  const commonProps = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    style: {
      width: `${size}px`,
      height: `${size}px`,
      minWidth: `${size}px`,
      minHeight: `${size}px`,
      flexShrink: 0,
      display: "block",
    },
  };

  if (name === "chat") {
    return (
      <svg {...commonProps}>
        <path d="M4 5h16v10H8l-4 4V5Z" />
        <path d="M8 9h8" />
        <path d="M8 12h5" />
      </svg>
    );
  }

  if (name === "video") {
    return (
      <svg {...commonProps}>
        <rect x="3" y="6" width="12" height="12" rx="2" />
        <path d="m15 10 6-3v10l-6-3" />
      </svg>
    );
  }

  if (name === "web") {
    return (
      <svg {...commonProps}>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18" />
        <path d="M12 3c3 3.5 3 14 0 18" />
        <path d="M12 3c-3 3.5-3 14 0 18" />
      </svg>
    );
  }

  if (name === "camera") {
    return (
      <svg {...commonProps}>
        <path d="M5 8h3l2-3h4l2 3h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z" />
        <circle cx="12" cy="13" r="3" />
      </svg>
    );
  }

  if (name === "broadcast") {
    return (
      <svg {...commonProps}>
        <path d="M12 18v3" />
        <path d="M8 21h8" />
        <circle cx="12" cy="12" r="2" />
        <path d="M6.5 16.5a7 7 0 0 1 0-9" />
        <path d="M17.5 7.5a7 7 0 0 1 0 9" />
        <path d="M3.5 19.5a11 11 0 0 1 0-15" />
        <path d="M20.5 4.5a11 11 0 0 1 0 15" />
      </svg>
    );
  }

  if (name === "design") {
    return (
      <svg {...commonProps}>
        <path d="M12 3 3 21h18L12 3Z" />
        <path d="M12 9v5" />
        <path d="M9.5 16h5" />
      </svg>
    );
  }

  if (name === "idea") {
    return (
      <svg {...commonProps}>
        <path d="M9 18h6" />
        <path d="M10 22h4" />
        <path d="M8 14a6 6 0 1 1 8 0c-1 1-1 2-1 3H9c0-1 0-2-1-3Z" />
      </svg>
    );
  }

  if (name === "edit") {
    return (
      <svg {...commonProps}>
        <path d="m4 20 4-1 11-11-3-3L5 16l-1 4Z" />
        <path d="m14 6 3 3" />
      </svg>
    );
  }

  if (name === "send") {
    return (
      <svg {...commonProps}>
        <path d="M22 3 10 14" />
        <path d="m22 3-7 18-5-7-7-5 19-6Z" />
      </svg>
    );
  }

  if (name === "star") {
    return (
      <svg {...commonProps}>
        <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6-5.4-2.8-5.4 2.8 1-6-4.4-4.3 6.1-.9L12 3Z" />
      </svg>
    );
  }

  if (name === "bolt") {
    return (
      <svg {...commonProps}>
        <path d="M13 2 4 14h7l-1 8 10-13h-7V2Z" />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <path d="M4 19V5" />
      <path d="M20 19H4" />
      <rect x="7" y="11" width="3" height="5" />
      <rect x="12" y="8" width="3" height="8" />
      <rect x="17" y="5" width="3" height="11" />
    </svg>
  );
}