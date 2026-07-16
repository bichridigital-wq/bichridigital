import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description:
    "Politique de confidentialité et de protection des données personnelles du site Bichridigital Agency.",
  alternates: {
    canonical: "/politique-confidentialite",
  },
};

export default function PolitiqueConfidentialitePage() {
  return (
    <main className="min-h-screen bg-[#020B2E] text-white">
      <section className="border-b border-white/10 bg-[#01071C]">
        <div className="mx-auto max-w-5xl px-6 pb-16 pt-36">
          <span className="text-sm font-semibold uppercase tracking-[0.25em] text-[#FCCD12]">
            Informations légales
          </span>

          <h1 className="mt-4 text-4xl font-bold md:text-6xl">
            Politique de confidentialité
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-gray-300">
            Cette politique explique comment Bichridigital Agency collecte,
            utilise et protège les informations des visiteurs et clients de son
            site internet.
          </p>

          <p className="mt-4 text-sm text-gray-500">
            Dernière mise à jour : 16 juillet 2026
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="space-y-12 rounded-3xl border border-white/10 bg-white/[0.03] p-7 md:p-12">
          <LegalSection title="1. Responsable du traitement">
            <p>
              Le responsable du traitement des données collectées sur le site
              est :
            </p>

            <div className="mt-5 space-y-2 rounded-2xl border border-white/10 bg-[#01071C] p-5 text-gray-300">
              <p>
                <strong className="text-white">Bichridigital Agency</strong>
              </p>
              <p>Ndiagne, Louga, Sénégal</p>
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
            </div>
          </LegalSection>

          <LegalSection title="2. Données susceptibles d’être collectées">
            <p>
              Selon les fonctionnalités utilisées, nous pouvons collecter les
              catégories d’informations suivantes :
            </p>

            <ul className="mt-4 list-disc space-y-3 pl-6">
              <li>nom et prénom ;</li>
              <li>adresse e-mail et numéro de téléphone ;</li>
              <li>contenu des messages envoyés par le formulaire de contact ;</li>
              <li>
                informations nécessaires au traitement d’une demande de devis
                ou d’une commande ;
              </li>
              <li>
                données techniques comme l’adresse IP, le navigateur, le type
                d’appareil et les pages consultées ;
              </li>
              <li>
                choix de consentement concernant les cookies et les services
                publicitaires.
              </li>
            </ul>
          </LegalSection>

          <LegalSection title="3. Finalités de l’utilisation des données">
            <p>Les informations collectées peuvent être utilisées pour :</p>

            <ul className="mt-4 list-disc space-y-3 pl-6">
              <li>répondre aux demandes envoyées depuis le site ;</li>
              <li>préparer un devis ou traiter une commande ;</li>
              <li>assurer la sécurité et le bon fonctionnement du site ;</li>
              <li>améliorer les contenus, les services et l’expérience utilisateur ;</li>
              <li>mesurer la fréquentation et les performances du site ;</li>
              <li>
                afficher et mesurer des annonces publicitaires lorsque cela est
                autorisé.
              </li>
            </ul>
          </LegalSection>

          <LegalSection title="4. Google Analytics">
            <p>
              Le site utilise Google Analytics afin de mesurer sa fréquentation
              et de mieux comprendre la manière dont les visiteurs utilisent
              ses différentes pages.
            </p>

            <p className="mt-4">
              Google Analytics peut traiter certaines informations techniques
              relatives au navigateur, à l’appareil et à la navigation, selon
              les réglages de consentement applicables.
            </p>
          </LegalSection>

          <LegalSection title="5. Google AdSense et publicité">
            <p>
              Le site utilise ou prévoit d’utiliser Google AdSense pour diffuser
              des annonces. Google et ses partenaires peuvent utiliser des
              cookies ou des technologies similaires afin de diffuser, mesurer
              et personnaliser certaines annonces lorsque l’utilisateur y
              consent.
            </p>

            <p className="mt-4">
              Vous pouvez consulter les informations de Google concernant
              l’utilisation des données à des fins publicitaires :
            </p>

            <a
              href="https://policies.google.com/technologies/ads"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex font-semibold text-[#FCCD12] hover:underline"
            >
              Politique publicitaire de Google
            </a>
          </LegalSection>

          <LegalSection title="6. Cookies et consentement">
            <p>
              Certains services du site peuvent déposer des cookies ou utiliser
              le stockage local du navigateur. Un message de consentement géré
              par la plateforme de gestion du consentement de Google peut être
              présenté aux visiteurs concernés.
            </p>

            <p className="mt-4">
              Ce message permet notamment d’autoriser, de refuser ou de
              personnaliser l’utilisation des cookies publicitaires.
            </p>
          </LegalSection>

          <LegalSection title="7. Prestataires techniques">
            <p>
              Certaines données peuvent être traitées par les prestataires
              techniques nécessaires au fonctionnement du site, notamment :
            </p>

            <ul className="mt-4 list-disc space-y-3 pl-6">
              <li>Vercel pour l’hébergement et la diffusion du site ;</li>
              <li>Supabase pour certaines données liées aux fonctionnalités du site ;</li>
              <li>Google pour Analytics, AdSense et la gestion du consentement.</li>
            </ul>

            <p className="mt-4">
              Ces prestataires disposent de leurs propres politiques de
              confidentialité et mesures de sécurité.
            </p>
          </LegalSection>

          <LegalSection title="8. Durée de conservation">
            <p>
              Les informations sont conservées uniquement pendant la durée
              nécessaire à la réalisation des finalités pour lesquelles elles
              ont été collectées, au traitement des demandes et au respect des
              obligations applicables.
            </p>
          </LegalSection>

          <LegalSection title="9. Sécurité">
            <p>
              Bichridigital Agency met en œuvre des mesures raisonnables pour
              protéger les données contre l’accès non autorisé, la perte,
              l’altération ou la divulgation.
            </p>

            <p className="mt-4">
              Aucun système informatique ne pouvant garantir une sécurité
              absolue, les utilisateurs sont également invités à ne pas
              transmettre d’informations sensibles inutilement.
            </p>
          </LegalSection>

          <LegalSection title="10. Vos droits">
            <p>
              Vous pouvez demander l’accès, la rectification, la mise à jour ou
              la suppression des informations personnelles vous concernant,
              dans les limites prévues par la réglementation applicable.
            </p>

            <p className="mt-4">
              Pour exercer vos droits, contactez-nous à :
            </p>

            <a
              href="mailto:bichridigital@gmail.com"
              className="mt-3 inline-flex font-semibold text-[#FCCD12] hover:underline"
            >
              bichridigital@gmail.com
            </a>
          </LegalSection>

          <LegalSection title="11. Modification de cette politique">
            <p>
              Cette politique peut être modifiée afin de tenir compte des
              évolutions du site, de nos services, de nos prestataires ou des
              règles applicables. La date de mise à jour sera indiquée en haut
              de cette page.
            </p>
          </LegalSection>

          <div className="border-t border-white/10 pt-8">
            <Link
              href="/"
              className="inline-flex rounded-full bg-[#FCCD12] px-7 py-3 font-bold text-[#020B2E] transition hover:scale-105"
            >
              Retour à l’accueil
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

      <div className="leading-8 text-gray-300">{children}</div>
    </article>
  );
}