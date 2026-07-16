import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mentions légales",
  description:
    "Mentions légales du site officiel de Bichridigital Agency.",
  alternates: {
    canonical: "/mentions-legales",
  },
};

export default function MentionsLegalesPage() {
  return (
    <main className="min-h-screen bg-[#020B2E] text-white">
      {/* En-tête */}
      <section className="border-b border-white/10 bg-[#01071C]">
        <div className="mx-auto max-w-5xl px-6 pb-16 pt-36">
          <span className="text-sm font-semibold uppercase tracking-[0.25em] text-[#FCCD12]">
            Informations légales
          </span>

          <h1 className="mt-4 text-4xl font-bold md:text-6xl">
            Mentions légales
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-gray-300">
            Les présentes mentions légales précisent les informations
            relatives à l’édition, à l’hébergement et à l’utilisation du site
            Bichridigital.
          </p>

          <p className="mt-4 text-sm text-gray-500">
            Dernière mise à jour : 16 juillet 2026
          </p>
        </div>
      </section>

      {/* Contenu */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="space-y-12 rounded-3xl border border-white/10 bg-white/[0.03] p-7 md:p-12">
          <LegalSection title="1. Éditeur du site">
            <div className="space-y-3">
              <p>
                Le site{" "}
                <strong className="text-white">
                  www.bichridigital.com
                </strong>{" "}
                est édité par :
              </p>

              <div className="mt-5 space-y-2 rounded-2xl border border-white/10 bg-[#01071C] p-5">
                <p>
                  <strong className="text-white">
                    Bichridigital Agency
                  </strong>
                </p>

                <p>Responsable : Bounama Niang</p>
                <p>Adresse : Ndiagne, Louga, Sénégal</p>

                <p>
                  Téléphone :{" "}
                  <a
                    href="tel:+221773211096"
                    className="text-[#FCCD12] hover:underline"
                  >
                    +221 77 321 10 96
                  </a>
                </p>

                <p>
                  E-mail :{" "}
                  <a
                    href="mailto:bichridigital@gmail.com"
                    className="text-[#FCCD12] hover:underline"
                  >
                    bichridigital@gmail.com
                  </a>
                </p>

                <p>
                  Site internet :{" "}
                  <a
                    href="https://www.bichridigital.com"
                    className="text-[#FCCD12] hover:underline"
                  >
                    www.bichridigital.com
                  </a>
                </p>
              </div>
            </div>
          </LegalSection>

          <LegalSection title="2. Directeur de la publication">
            <p>
              Le directeur de la publication du site est{" "}
              <strong className="text-white">Bounama Niang</strong>.
            </p>
          </LegalSection>

          <LegalSection title="3. Hébergement">
            <p>Le site est hébergé par :</p>

            <div className="mt-5 space-y-2 rounded-2xl border border-white/10 bg-[#01071C] p-5">
              <p>
                <strong className="text-white">Vercel Inc.</strong>
              </p>

              <p>440 N Barranca Ave #4133</p>
              <p>Covina, CA 91723, États-Unis</p>

              <p>
                Site internet :{" "}
                <a
                  href="https://vercel.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#FCCD12] hover:underline"
                >
                  vercel.com
                </a>
              </p>
            </div>
          </LegalSection>

          <LegalSection title="4. Conception et développement">
            <p>
              La conception graphique, le développement et la maintenance du
              site sont assurés par{" "}
              <strong className="text-white">
                Bichridigital Agency
              </strong>
              .
            </p>
          </LegalSection>

          <LegalSection title="5. Propriété intellectuelle">
            <p>
              Les textes, photographies, vidéos, logos, illustrations,
              éléments graphiques, interfaces et autres contenus présents sur
              ce site sont protégés par les règles applicables à la propriété
              intellectuelle.
            </p>

            <p className="mt-4">
              Sauf autorisation écrite préalable, toute reproduction,
              modification, distribution, republication ou exploitation totale
              ou partielle d’un contenu appartenant à Bichridigital Agency est
              interdite.
            </p>

            <p className="mt-4">
              Les marques, logos, photographies ou contenus appartenant à des
              clients et partenaires restent la propriété de leurs titulaires
              respectifs.
            </p>
          </LegalSection>

          <LegalSection title="6. Utilisation du site">
            <p>
              L’utilisateur s’engage à utiliser le site de manière licite et à
              ne pas tenter d’en perturber le fonctionnement, d’accéder
              frauduleusement à ses systèmes ou d’utiliser ses contenus à des
              fins interdites.
            </p>
          </LegalSection>

          <LegalSection title="7. Responsabilité">
            <p>
              Bichridigital Agency s’efforce de publier des informations
              exactes et régulièrement mises à jour. Toutefois, des erreurs,
              omissions ou indisponibilités temporaires peuvent survenir.
            </p>

            <p className="mt-4">
              Les informations présentées sur le site ont une vocation
              générale. Les caractéristiques, disponibilités et tarifs des
              prestations ou produits doivent être confirmés avant toute
              commande ou signature de devis.
            </p>
          </LegalSection>

          <LegalSection title="8. Liens externes">
            <p>
              Le site peut contenir des liens vers des sites ou plateformes
              appartenant à des tiers. Bichridigital Agency ne contrôle pas
              systématiquement leur contenu, leur disponibilité ou leurs
              politiques de confidentialité.
            </p>
          </LegalSection>

          <LegalSection title="9. Données personnelles et cookies">
            <p>
              Les informations relatives à la collecte des données, aux
              cookies, à Google Analytics, à Google AdSense et aux droits des
              utilisateurs sont présentées dans notre politique de
              confidentialité.
            </p>

            <Link
              href="/politique-confidentialite"
              className="mt-4 inline-flex font-semibold text-[#FCCD12] hover:underline"
            >
              Consulter la politique de confidentialité
            </Link>
          </LegalSection>

          <LegalSection title="10. Droit applicable">
            <p>
              Le présent site et ses conditions d’utilisation sont soumis aux
              lois et règlements applicables en République du Sénégal.
            </p>

            <p className="mt-4">
              En cas de différend, les parties chercheront d’abord une solution
              amiable avant toute procédure devant les juridictions
              compétentes.
            </p>
          </LegalSection>

          <LegalSection title="11. Contact">
            <p>
              Pour toute question concernant le site ou les présentes mentions
              légales, vous pouvez contacter Bichridigital Agency :
            </p>

            <div className="mt-5 flex flex-col gap-3">
              <a
                href="mailto:bichridigital@gmail.com"
                className="font-semibold text-[#FCCD12] hover:underline"
              >
                bichridigital@gmail.com
              </a>

              <a
                href="tel:+221773211096"
                className="font-semibold text-[#FCCD12] hover:underline"
              >
                +221 77 321 10 96
              </a>
            </div>
          </LegalSection>

          <div className="flex flex-col gap-4 border-t border-white/10 pt-8 sm:flex-row">
            <Link
              href="/"
              className="inline-flex justify-center rounded-full bg-[#FCCD12] px-7 py-3 font-bold text-[#020B2E] transition hover:scale-105"
            >
              Retour à l’accueil
            </Link>

            <Link
              href="/politique-confidentialite"
              className="inline-flex justify-center rounded-full border border-white/20 px-7 py-3 font-bold text-white transition hover:border-[#FCCD12] hover:text-[#FCCD12]"
            >
              Politique de confidentialité
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <article>
      <h2 className="mb-4 text-2xl font-bold text-white md:text-3xl">
        {title}
      </h2>

      <div className="leading-8 text-gray-300">
        {children}
      </div>
    </article>
  );
}