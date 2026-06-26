"use client";

import Image from "next/image";
import Link from "next/link";
import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaTiktok,
  FaLinkedin,
} from "react-icons/fa";

export default function ContactFooter() {
  return (
    <footer className="bg-[#01081F] border-t border-[#1E40AF]">

      <div className="max-w-7xl mx-auto px-6 py-20">

        <div className="grid md:grid-cols-4 gap-12">

          {/* Logo */}

          <div>

            <Image
              src="/logo.png"
              alt="Bichridigital"
              width={180}
              height={60}
            />

            <p className="text-gray-400 mt-6 leading-8">

              Bichridigital est une agence spécialisée
              en communication digitale,
              production audiovisuelle,
              photographie,
              streaming live
              et développement web.

            </p>

          </div>

          {/* Navigation */}

          <div>

            <h3 className="text-xl font-bold mb-6">

              Navigation

            </h3>

            <ul className="space-y-3 text-gray-400">

              <li><Link href="/">Accueil</Link></li>

              <li><Link href="/services">Services</Link></li>

              <li><Link href="/portfolio">Portfolio</Link></li>

              <li><Link href="/apropos">À propos</Link></li>

              <li><Link href="/contact">Contact</Link></li>

            </ul>

          </div>

          {/* Services */}

          <div>

            <h3 className="text-xl font-bold mb-6">

              Nos Services

            </h3>

            <ul className="space-y-3 text-gray-400">

              <li>Communication Digitale</li>
              <li>Production Audiovisuelle</li>
              <li>Photographie</li>
              <li>Streaming Live</li>
              <li>Développement Web</li>

            </ul>

          </div>

          {/* Coordonnées */}

          <div>

            <h3 className="text-xl font-bold mb-6">

              Coordonnées

            </h3>

            <ul className="space-y-3 text-gray-400">

              <li>📍 Ndiagne - Louga</li>

              <li>📞 +221 77 143 39 00</li>

              <li>✉️ contact@bichridigital.com</li>

            </ul>

            <div className="flex gap-4 mt-8">

              {[FaFacebookF, FaInstagram, FaYoutube, FaTiktok, FaLinkedin].map((Icon, index) => (

                <a
                  key={index}
                  href="#"
                  className="w-11 h-11 rounded-full bg-[#07133D] border border-[#1E40AF] flex items-center justify-center hover:bg-[#FCCD12] hover:text-[#020B2E] transition-all"
                >
                  <Icon />
                </a>

              ))}

            </div>

          </div>

        </div>

        <div className="border-t border-[#1E40AF] mt-16 pt-8 text-center text-gray-500">

          © 2019 - 2026 Bichridigital Agency.
          Tous droits réservés.

        </div>

      </div>

    </footer>
  );
}