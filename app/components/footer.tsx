"use client";

import Link from "next/link";
import {
  FaFacebook,
  FaYoutube,
  FaInstagram,
  FaTiktok,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

const socialLinks = [
  {
    name: "Facebook",
    href: "https://www.facebook.com/bichriartprod18Safar",
    icon: FaFacebook,
  },
  {
    name: "YouTube",
    href: "https://www.youtube.com/@bichridigital",
    icon: FaYoutube,
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/bichridigitalagency",
    icon: FaInstagram,
  },
  {
    name: "TikTok",
    href: "https://www.tiktok.com/@bichridigitalagency",
    icon: FaTiktok,
  },
  {
    name: "X",
    href: "https://x.com/bichriartprod",
    icon: FaXTwitter,
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#01071C]">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Agence */}
          <div>
            <h3 className="text-3xl font-bold text-white">
              Bichridigital
            </h3>

            <p className="mt-4 leading-7 text-gray-400">
              Agence de communication digitale, audiovisuelle et développement
              web basée à Ndiagne, Sénégal.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="mb-5 font-bold text-white">
              Navigation
            </h4>

            <nav className="flex flex-col gap-3 text-gray-400">
              <Link className="transition hover:text-[#FCCD12]" href="/">
                Accueil
              </Link>

              <Link
                className="transition hover:text-[#FCCD12]"
                href="/services"
              >
                Services
              </Link>

              <Link
                className="transition hover:text-[#FCCD12]"
                href="/portfolio"
              >
                Portfolio
              </Link>

              <Link
                className="transition hover:text-[#FCCD12]"
                href="/conseils"
              >
                Conseils
              </Link>

              <Link
                className="transition hover:text-[#FCCD12]"
                href="/apropos"
              >
                À propos
              </Link>

              <Link
                className="transition hover:text-[#FCCD12]"
                href="/contact"
              >
                Contact
              </Link>
            </nav>
          </div>

          {/* Services */}
          <div>
            <h4 className="mb-5 font-bold text-white">
              Services
            </h4>

            <div className="flex flex-col gap-3 text-gray-400">
              <p>Communication digitale</p>
              <p>Production audiovisuelle</p>
              <p>Développement web</p>
              <p>Streaming live</p>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-5 font-bold text-white">
              Contact
            </h4>

            <div className="space-y-3 text-gray-400">
              <p>📍 Ndiagne, Louga, Sénégal</p>

              <p>
                <a
                  href="tel:+221773211096"
                  className="transition hover:text-[#FCCD12]"
                >
                  📞 +221 77 321 10 96
                </a>
              </p>

              <p>
                <a
                  href="mailto:bichridigital@gmail.com"
                  className="break-all transition hover:text-[#FCCD12]"
                >
                  ✉️ bichridigital@gmail.com
                </a>
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-4 text-2xl text-[#FCCD12]">
              {socialLinks.map(({ name, href, icon: Icon }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Bichridigital sur ${name}`}
                  title={name}
                  className="transition hover:-translate-y-1 hover:text-white"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>
        </div>

       <div className="flex flex-wrap justify-center gap-5 md:justify-end">
          <p>
            © 2026 Bichridigital Agency — Tous droits réservés.
          </p>

          <Link
    href="/mentions-legales"
    className="transition hover:text-[#FCCD12]"
  >
    Mentions légales
  </Link>

  <Link
    href="/politique-confidentialite"
    className="transition hover:text-[#FCCD12]"
  >
    Politique de confidentialité
  </Link>
</div>
      </div>
    </footer>
  );
}
