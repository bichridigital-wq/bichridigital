"use client";

import Link from "next/link";
import {
  FaFacebook,
  FaYoutube,
  FaInstagram,
  FaTiktok,
  FaLinkedin,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

export default function Footer() {
  return (
    <footer className="bg-[#01071C] border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-16">

        <div className="grid md:grid-cols-4 gap-12">

          {/* Agence */}
          <div>
            <h3 className="text-3xl font-bold text-white">
              Bichridigital
            </h3>

            <p className="text-gray-400 mt-4 leading-7">
              Agence de communication digitale,
              audiovisuelle et développement web
              basée à Ndiagne, Sénégal.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-white font-bold mb-5">
              Navigation
            </h4>

            <div className="flex flex-col gap-3 text-gray-400">
              <Link href="/">Accueil</Link>
              <Link href="/services">Services</Link>
              <Link href="/portfolio">Portfolio</Link>
              <Link href="/apropos">À propos</Link>
              <Link href="/contact">Contact</Link>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-bold mb-5">
              Services
            </h4>

            <div className="flex flex-col gap-3 text-gray-400">
              <p>Communication Digitale</p>
              <p>Production Audiovisuelle</p>
              <p>Développement Web</p>
              <p>Streaming Live</p>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold mb-5">
              Contact
            </h4>

            <div className="space-y-3 text-gray-400">
              <p>📍 Ndiagne, Louga, Sénégal</p>
              <p>📞 +221 77 321 10 96</p>
              <p>✉️ bichridigital@gmail.com</p>
            </div>

            <div className="flex gap-4 mt-6 text-2xl text-[#FCCD12]">
              <a href="#"><FaFacebook /></a>
              <a href="#"><FaYoutube /></a>
              <a href="#"><FaInstagram /></a>
              <a href="#"><FaTiktok /></a>
              <a href="#"><FaLinkedin /></a>
              <a href="#"><FaXTwitter /></a>
            </div>
          </div>

        </div>

        <div className="border-t border-white/10 mt-12 pt-8 text-center text-gray-500">
          © 2026 Bichridigital Agency — Tous droits réservés.
        </div>

      </div>
    </footer>
  );
}