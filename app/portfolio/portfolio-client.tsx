"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  Camera,
  Check,
  Clapperboard,
  Globe2,
  Layers3,
  Lightbulb,
  Palette,
  Play,
  Sparkles,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Footer from "../components/footer";
import Navbar from "../components/navbar";

type Category = "Tous" | "Design" | "Audiovisuel" | "Événementiel";
type ProjectCategory = Exclude<Category, "Tous">;

type Project = {
  title: string;
  category: ProjectCategory;
  service: string;
  image: string;
  gallery?: string[];
  description: string;
  deliverables: string[];
  imagePosition?: string;
};

const projects: Project[] = [
  {
    title: "AGRO KAYOR",
    category: "Design",
    service: "Création publicitaire",
    image: "/portfolio1.png",
    imagePosition: "object-top",
    description:
      "Une affiche commerciale conçue pour présenter clairement l’offre de produits frais et les informations de commande.",
    deliverables: [
      "Affiche commerciale",
      "Mise en page de l’offre",
      "Support de diffusion digitale",
    ],
  },
  {
    title: "PRODUCTION AUDIOVISUELLE BICHRIDIGITAL",
    category: "Audiovisuel",
    service: "Couverture événementielle",
    image: "/bounama.jpg",
    description:
      "Une captation réalisée sur le terrain par l’équipe Bichridigital pour documenter un événement au plus près de l’action.",
    deliverables: [
      "Captation événementielle",
      "Prises de vues",
      "Couverture audiovisuelle",
    ],
  },
  {
    title: "TOUBA BAKHDATE SERVICE",
    category: "Design",
    service: "Création publicitaire",
    image: "/portfolio5.png",
    imagePosition: "object-top",
    description:
      "Une affiche commerciale présentant les services, les destinations et les contacts de l’entreprise dans un format synthétique.",
    deliverables: [
      "Affiche commerciale",
      "Présentation des services",
      "Visuel de diffusion digitale",
    ],
  },
  {
    title: "Campagne Sarr Sunu GP",
    category: "Événementiel",
    service: "Campagne événementielle",
    image: "/portfolio2.png",
    gallery: ["/portfolio2.png", "/portfolio3.png", "/portfolio4.png"],
    imagePosition: "object-top",
    description:
      "Une série de trois affiches conçue pour annoncer les départs entre Dakar et Barcelone avec clarté et cohérence.",
    deliverables: [
      "Système de campagne",
      "Trois affiches événementielles",
      "Supports pour réseaux sociaux",
    ],
  },
];

const categories: Category[] = [
  "Tous",
  ...Array.from(new Set(projects.map((project) => project.category))),
];

const expertise = [
  {
    icon: Palette,
    title: "Design graphique",
    description:
      "Identités, campagnes et supports visuels cohérents avec votre positionnement.",
  },
  {
    icon: Clapperboard,
    title: "Production audiovisuelle",
    description:
      "De la préparation au montage, des contenus pensés pour raconter et convaincre.",
  },
  {
    icon: Camera,
    title: "Photographie",
    description:
      "Portraits, événements et produits mis en lumière avec un regard professionnel.",
  },
  {
    icon: Globe2,
    title: "Web & digital",
    description:
      "Des expériences digitales utiles, lisibles et adaptées à vos objectifs.",
  },
];

const processSteps = [
  {
    number: "01",
    icon: Lightbulb,
    title: "Comprendre",
    description:
      "Nous clarifions votre besoin, votre public et la valeur que le projet doit transmettre.",
  },
  {
    number: "02",
    icon: Layers3,
    title: "Créer",
    description:
      "Nous construisons une direction créative distinctive, cohérente et fidèle à votre identité.",
  },
  {
    number: "03",
    icon: Play,
    title: "Produire et livrer",
    description:
      "Nous exécutons avec précision, contrôlons chaque détail et livrons des formats prêts à performer.",
  },
];

const reveal = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

export default function PortfolioPage() {
  const [activeCategory, setActiveCategory] = useState<Category>("Tous");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const filteredProjects =
    activeCategory === "Tous"
      ? projects
      : projects.filter((project) => project.category === activeCategory);

  return (
    <>
      <Navbar />

      <main className="overflow-hidden bg-[#020B2E] text-white">
        <Hero shouldReduceMotion={Boolean(shouldReduceMotion)} />

        <section
          id="projets"
          className="relative scroll-mt-24 px-5 py-20 sm:px-6 lg:py-28"
        >
          <div className="pointer-events-none absolute left-0 top-32 h-96 w-96 rounded-full bg-[#0024FF]/10 blur-[120px]" />

          <div className="relative mx-auto max-w-7xl">
            <motion.div
              variants={reveal}
              initial={shouldReduceMotion ? "visible" : "hidden"}
              whileInView="visible"
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.55 }}
              className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end"
            >
              <SectionHeading
                eyebrow="Réalisations sélectionnées"
                title="Des projets conçus pour être vus, compris et retenus."
                description="Une sélection de réalisations conçues pour répondre à des publics, des objectifs et des contextes différents."
              />

              <div
                aria-label="Filtrer les réalisations"
                className="flex flex-wrap gap-2"
              >
                {categories.map((category) => {
                  const isActive = category === activeCategory;

                  return (
                    <button
                      key={category}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => setActiveCategory(category)}
                      className={`rounded-full border px-5 py-2.5 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FCCD12] focus-visible:ring-offset-2 focus-visible:ring-offset-[#020B2E] ${
                        isActive
                          ? "border-[#FCCD12] bg-[#FCCD12] text-[#020B2E]"
                          : "border-white/15 bg-white/[0.03] text-white/70 hover:border-white/35 hover:text-white"
                      }`}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
            </motion.div>

            <motion.div layout className="mt-12 grid gap-5 lg:grid-cols-12">
              <AnimatePresence mode="popLayout">
                {filteredProjects.map((project, index) => (
                  <ProjectCard
                    key={project.title}
                    project={project}
                    index={index}
                    shouldReduceMotion={Boolean(shouldReduceMotion)}
                    onOpen={() => setSelectedProject(project)}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
        </section>

        <ExpertiseSection shouldReduceMotion={Boolean(shouldReduceMotion)} />
        <ProcessSection shouldReduceMotion={Boolean(shouldReduceMotion)} />
        <FinalCallToAction />
      </main>

      <Footer />

      <ProjectDialog
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        shouldReduceMotion={Boolean(shouldReduceMotion)}
      />
    </>
  );
}

function Hero({ shouldReduceMotion }: { shouldReduceMotion: boolean }) {
  return (
    <section className="relative isolate min-h-[760px] overflow-hidden px-5 pb-20 pt-32 sm:px-6 lg:min-h-[820px] lg:pt-40">
      <video
        aria-hidden="true"
        autoPlay={!shouldReduceMotion}
        muted
        loop
        playsInline
        poster="/hero-poster.webp"
        className="absolute inset-0 -z-30 h-full w-full object-cover"
      >
        <source src="/hero-video2.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 -z-20 bg-[#020B2E]/85" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_75%_35%,rgba(0,36,255,0.3),transparent_38%),linear-gradient(to_bottom,rgba(2,11,46,0.25),#020B2E_94%)]" />

      <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.div
          variants={reveal}
          initial={shouldReduceMotion ? "visible" : "hidden"}
          animate="visible"
          transition={{ duration: 0.65 }}
          className="relative z-10 max-w-3xl"
        >
          <p className="mb-6 flex items-center gap-3 text-xs font-black uppercase tracking-[0.26em] text-[#FCCD12] sm:text-sm">
            <span className="h-px w-9 bg-[#FCCD12]" />
            Portfolio · Bichridigital
          </p>

          <h1 className="text-balance text-4xl font-black leading-[1.04] tracking-[-0.04em] sm:text-6xl lg:text-7xl xl:text-[5.2rem]">
            Des créations qui donnent de la{" "}
            <span className="text-[#FCCD12]">valeur à votre image.</span>
          </h1>

          <p className="mt-7 max-w-2xl text-base leading-7 text-white/70 sm:text-lg sm:leading-8">
            Design, audiovisuel et expériences digitales : nous transformons
            chaque idée en une réalisation claire, forte et prête à marquer son
            public.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="#projets"
              className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[#FCCD12] px-7 py-3.5 font-black text-[#020B2E] transition hover:-translate-y-0.5 hover:shadow-[0_14px_40px_rgba(252,205,18,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Explorer les réalisations
              <ArrowDown
                aria-hidden="true"
                className="transition-transform group-hover:translate-y-0.5"
                size={18}
              />
            </Link>
            <Link
              href="/contact"
              className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-full border border-white/20 bg-white/[0.06] px-7 py-3.5 font-bold text-white backdrop-blur-md transition hover:border-white/40 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FCCD12]"
            >
              Démarrer un projet
              <ArrowRight
                aria-hidden="true"
                className="transition-transform group-hover:translate-x-1"
                size={18}
              />
            </Link>
          </div>

          <div className="mt-12 flex items-center gap-8 border-t border-white/10 pt-6 text-sm text-white/55">
            <p>
              <strong className="block text-xl text-white">Depuis 2019</strong>
              Un regard ancré, une création actuelle
            </p>
            <p>
              <strong className="block text-xl text-white">
                Création sur mesure
              </strong>
              Des réponses adaptées à chaque projet
            </p>
          </div>
        </motion.div>

        <HeroGallery shouldReduceMotion={shouldReduceMotion} />
      </div>
    </section>
  );
}

function HeroGallery({ shouldReduceMotion }: { shouldReduceMotion: boolean }) {
  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, x: 36 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.75, delay: 0.15 }}
      className="relative mx-auto h-[390px] w-full max-w-[580px] sm:h-[500px] lg:h-[560px]"
      aria-label="Aperçu de réalisations Bichridigital"
    >
      <div className="absolute left-[8%] top-[4%] h-[67%] w-[58%] rotate-[-4deg] overflow-hidden rounded-[30px] border border-white/15 bg-[#071542] shadow-[0_28px_80px_rgba(0,0,0,0.45)]">
        <Image
          src="/portfolio1.png"
          alt="Affiche commerciale Agro Kayor"
          fill
          priority
          sizes="(min-width: 1024px) 29vw, (min-width: 640px) 50vw, 58vw"
          className="object-cover object-top"
        />
      </div>

      <div className="absolute right-[3%] top-[23%] h-[54%] w-[43%] rotate-[5deg] overflow-hidden rounded-[26px] border border-white/15 bg-[#071542] shadow-[0_25px_70px_rgba(0,0,0,0.48)]">
        <Image
          src="/portfolio5.png"
          alt="Affiche commerciale Touba Bakhdate Service"
          fill
          priority
          sizes="(min-width: 1024px) 22vw, (min-width: 640px) 37vw, 43vw"
          className="object-cover object-top"
        />
      </div>

      <div className="absolute bottom-[1%] left-[20%] h-[35%] w-[56%] rotate-[2deg] overflow-hidden rounded-[24px] border border-[#FCCD12]/45 bg-[#071542] shadow-[0_24px_65px_rgba(0,0,0,0.5)]">
        <Image
          src="/bounama.jpg"
          alt="Captation audiovisuelle réalisée par Bichridigital"
          fill
          sizes="(min-width: 1024px) 28vw, (min-width: 640px) 48vw, 56vw"
          className="object-cover"
        />
      </div>

      <div className="absolute right-[3%] top-[4%] flex items-center gap-2 rounded-full border border-white/15 bg-[#020B2E]/80 px-4 py-2 text-xs font-bold text-white backdrop-blur-xl">
        <Sparkles aria-hidden="true" className="text-[#FCCD12]" size={15} />
        Création sur mesure
      </div>
    </motion.div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="mb-4 flex items-center gap-3 text-xs font-black uppercase tracking-[0.24em] text-[#FCCD12]">
        <span className="h-px w-8 bg-[#FCCD12]" />
        {eyebrow}
      </p>
      <h2 className="text-balance text-3xl font-black leading-tight tracking-[-0.03em] sm:text-5xl">
        {title}
      </h2>
      <p className="mt-5 max-w-2xl leading-7 text-white/60">{description}</p>
    </div>
  );
}

function ProjectCard({
  project,
  index,
  shouldReduceMotion,
  onOpen,
}: {
  project: Project;
  index: number;
  shouldReduceMotion: boolean;
  onOpen: () => void;
}) {
  const columnClass =
    index === 0
      ? "lg:col-span-8"
      : index === 1
        ? "lg:col-span-4"
        : "lg:col-span-6";

  return (
    <motion.article
      layout
      variants={reveal}
      initial={shouldReduceMotion ? "visible" : "hidden"}
      animate="visible"
      exit={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.4, delay: shouldReduceMotion ? 0 : index * 0.04 }}
      className={`group ${columnClass}`}
    >
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Découvrir le projet ${project.title}`}
        className="relative flex min-h-[430px] w-full flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#071542] text-left shadow-[0_24px_80px_rgba(0,0,0,0.22)] transition duration-500 hover:-translate-y-1 hover:border-[#FCCD12]/50 hover:shadow-[0_28px_90px_rgba(0,36,255,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FCCD12] sm:min-h-[500px]"
      >
        <Image
          src={project.image}
          alt={project.title}
          fill
          sizes={
            index === 0
              ? "(min-width: 1024px) 66vw, 100vw"
              : "(min-width: 1024px) 50vw, 100vw"
          }
          className={`object-cover transition duration-700 group-hover:scale-[1.035] ${
            project.imagePosition ?? ""
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020B2E] via-[#020B2E]/25 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#FCCD12] px-3 py-1 text-xs font-black uppercase tracking-wider text-[#020B2E]">
              {project.category}
            </span>
            <span className="rounded-full border border-white/20 bg-[#020B2E]/65 px-3 py-1 text-xs font-bold text-white/80 backdrop-blur-md">
              {project.service}
            </span>
          </div>
          <div className="flex items-end justify-between gap-5">
            <div>
              <h3 className="text-2xl font-black tracking-[-0.02em] sm:text-3xl">
                {project.title}
              </h3>
              <p className="mt-2 max-w-xl text-sm leading-6 text-white/65 sm:text-base">
                {project.description}
              </p>
            </div>
            <span className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 transition group-hover:border-[#FCCD12] group-hover:bg-[#FCCD12] group-hover:text-[#020B2E] sm:flex">
              <ArrowRight aria-hidden="true" size={20} />
            </span>
          </div>
        </div>
      </button>
    </motion.article>
  );
}

function ExpertiseSection({
  shouldReduceMotion,
}: {
  shouldReduceMotion: boolean;
}) {
  return (
    <section className="border-y border-white/10 bg-[#070F33] px-5 py-20 sm:px-6 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <motion.div
          variants={reveal}
          initial={shouldReduceMotion ? "visible" : "hidden"}
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55 }}
        >
          <SectionHeading
            eyebrow="Expertise"
            title="Une vision créative, plusieurs savoir-faire."
            description="Nous réunissons les compétences nécessaires pour construire une image cohérente, du premier concept à sa diffusion."
          />
        </motion.div>

        <div className="mt-12 grid gap-px overflow-hidden rounded-[28px] border border-white/10 bg-white/10 md:grid-cols-2 lg:grid-cols-4">
          {expertise.map(({ icon: Icon, title, description }, index) => (
            <motion.article
              key={title}
              variants={reveal}
              initial={shouldReduceMotion ? "visible" : "hidden"}
              whileInView="visible"
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.45, delay: index * 0.06 }}
              className="group bg-[#070F33] p-7 transition-colors hover:bg-[#071542] sm:p-8"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#FCCD12]/25 bg-[#FCCD12]/10 text-[#FCCD12] transition group-hover:bg-[#FCCD12] group-hover:text-[#020B2E]">
                <Icon aria-hidden="true" size={25} strokeWidth={1.8} />
              </div>
              <h3 className="mt-8 text-xl font-black">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/55">
                {description}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProcessSection({
  shouldReduceMotion,
}: {
  shouldReduceMotion: boolean;
}) {
  return (
    <section className="px-5 py-20 sm:px-6 lg:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.6 }}
          className="relative min-h-[480px] overflow-hidden rounded-[32px] border border-white/10 bg-[#071542] sm:min-h-[620px]"
        >
          <Image
            src="/audiovisuel.jpg"
            alt="Travail de montage en production audiovisuelle"
            fill
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020B2E] via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 p-7 sm:p-9">
            <p className="max-w-sm text-xl font-black leading-snug sm:text-2xl">
              La qualité finale commence toujours par une méthode claire.
            </p>
          </div>
        </motion.div>

        <div>
          <SectionHeading
            eyebrow="Notre méthode"
            title="Un processus simple, exigeant et transparent."
            description="Chaque étape réduit l’incertitude, aligne les décisions et rapproche le projet de son objectif."
          />

          <div className="mt-10 space-y-3">
            {processSteps.map(({ number, icon: Icon, title, description }, index) => (
              <motion.article
                key={title}
                variants={reveal}
                initial={shouldReduceMotion ? "visible" : "hidden"}
                whileInView="visible"
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                className="grid grid-cols-[auto_1fr] gap-5 rounded-[22px] border border-white/10 bg-white/[0.035] p-5 sm:p-6"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1E40AF] text-[#FCCD12]">
                  <Icon aria-hidden="true" size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black tracking-[0.2em] text-[#FCCD12]">
                      {number}
                    </span>
                    <h3 className="text-lg font-black">{title}</h3>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-white/55">
                    {description}
                  </p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCallToAction() {
  return (
    <section className="px-5 pb-20 sm:px-6 lg:pb-28">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[32px] border border-white/15 bg-[#0024FF] px-6 py-14 text-center shadow-[0_30px_100px_rgba(0,36,255,0.22)] sm:px-12 sm:py-20">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full border-[60px] border-white/[0.06]" />
        <div className="absolute -bottom-32 -right-20 h-80 w-80 rounded-full bg-[#FCCD12]/15 blur-3xl" />

        <div className="relative mx-auto max-w-4xl">
          <p className="text-xs font-black uppercase tracking-[0.26em] text-[#FCCD12]">
            Votre prochain projet
          </p>
          <h2 className="mt-5 text-balance text-3xl font-black leading-tight tracking-[-0.03em] sm:text-5xl lg:text-6xl">
            Faisons de votre idée une réalisation qui marque les esprits.
          </h2>
          <Link
            href="/contact"
            className="group mt-9 inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[#FCCD12] px-8 py-3.5 font-black text-[#020B2E] transition hover:-translate-y-0.5 hover:shadow-[0_14px_40px_rgba(2,11,46,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Discuter de mon projet
            <ArrowRight
              aria-hidden="true"
              className="transition-transform group-hover:translate-x-1"
              size={18}
            />
          </Link>
        </div>
      </div>
    </section>
  );
}

function ProjectDialog({
  project,
  onClose,
  shouldReduceMotion,
}: {
  project: Project | null;
  onClose: () => void;
  shouldReduceMotion: boolean;
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<string | null>(
    null
  );
  const gallery = project
    ? (project.gallery ?? [project.image])
    : [];
  const displayedImage =
    selectedGalleryImage && gallery.includes(selectedGalleryImage)
      ? selectedGalleryImage
      : project?.image;
  const displayedImageIndex = displayedImage
    ? gallery.indexOf(displayedImage)
    : 0;

  useEffect(() => {
    if (!project) return;

    const previousOverflow = document.body.style.overflow;
    const previouslyFocusedElement = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();

      if (event.key === "Tab" && dialogRef.current) {
        const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      previouslyFocusedElement?.focus();
    };
  }, [project, onClose]);

  return (
    <AnimatePresence>
      {project ? (
        <motion.div
          key="project-dialog"
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
          className="fixed inset-0 z-[100] flex items-end justify-center overflow-y-auto bg-[#01071C]/85 p-3 backdrop-blur-xl sm:items-center sm:p-6"
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-dialog-title"
            initial={
              shouldReduceMotion
                ? { opacity: 1 }
                : { opacity: 0, y: 24, scale: 0.98 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              shouldReduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 16, scale: 0.98 }
            }
            transition={{ duration: 0.25 }}
            className="relative grid max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[28px] border border-white/15 bg-[#071542] shadow-[0_35px_120px_rgba(0,0,0,0.55)] lg:grid-cols-[1.05fr_0.95fr]"
          >
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label="Fermer la présentation du projet"
              className="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-[#020B2E]/80 text-white backdrop-blur-md transition hover:bg-[#FCCD12] hover:text-[#020B2E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FCCD12]"
            >
              <X aria-hidden="true" size={20} />
            </button>

            <div className="relative min-h-[390px] overflow-hidden rounded-t-[28px] bg-[#020B2E] lg:min-h-[620px] lg:rounded-l-[28px] lg:rounded-tr-none">
              {displayedImage ? (
                <Image
                  src={displayedImage}
                  alt={
                    gallery.length > 1
                      ? `${project.title} — création ${displayedImageIndex + 1} sur ${gallery.length}`
                      : project.title
                  }
                  fill
                  sizes="(min-width: 1024px) 52vw, 100vw"
                  className={
                    gallery.length > 1
                      ? "object-contain object-center"
                      : `object-cover ${project.imagePosition ?? ""}`
                  }
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-[#020B2E]/55 via-transparent to-transparent" />

              {gallery.length > 1 ? (
                <div
                  aria-label="Choisir une création de la campagne"
                  className="absolute inset-x-0 bottom-4 z-10 flex justify-center gap-2 px-4"
                >
                  {gallery.map((image, index) => {
                    const isSelected = image === displayedImage;

                    return (
                      <button
                        key={image}
                        type="button"
                        aria-label={`Afficher la création ${index + 1} sur ${gallery.length}`}
                        aria-pressed={isSelected}
                        onClick={() => setSelectedGalleryImage(image)}
                        className={`relative h-16 w-12 overflow-hidden rounded-lg border-2 bg-[#020B2E] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FCCD12] sm:h-20 sm:w-14 ${
                          isSelected
                            ? "border-[#FCCD12]"
                            : "border-white/40 hover:border-white"
                        }`}
                      >
                        <Image
                          src={image}
                          alt=""
                          fill
                          sizes="56px"
                          className="object-cover object-top"
                        />
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>

            <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-12">
              <span className="w-fit rounded-full bg-[#FCCD12] px-3 py-1 text-xs font-black uppercase tracking-wider text-[#020B2E]">
                {project.category}
              </span>
              <p className="mt-6 text-sm font-bold uppercase tracking-wider text-[#FCCD12]">
                {project.service}
              </p>
              <h2
                id="project-dialog-title"
                className="mt-2 text-3xl font-black tracking-[-0.03em] sm:text-4xl"
              >
                {project.title}
              </h2>
              <p className="mt-5 leading-7 text-white/65">
                {project.description}
              </p>

              <div className="mt-8 border-t border-white/10 pt-7">
                <p className="text-sm font-black uppercase tracking-wider text-white">
                  Livrables
                </p>
                <ul className="mt-4 space-y-3">
                  {project.deliverables.map((deliverable) => (
                    <li
                      key={deliverable}
                      className="flex items-center gap-3 text-sm text-white/65"
                    >
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FCCD12]/10 text-[#FCCD12]">
                        <Check aria-hidden="true" size={14} />
                      </span>
                      {deliverable}
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href="/contact"
                className="group mt-9 inline-flex min-h-12 w-fit items-center justify-center gap-3 rounded-full bg-[#FCCD12] px-7 py-3.5 font-black text-[#020B2E] transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Démarrer un projet
                <ArrowRight
                  aria-hidden="true"
                  className="transition-transform group-hover:translate-x-1"
                  size={18}
                />
              </Link>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
