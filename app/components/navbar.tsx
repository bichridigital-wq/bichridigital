"use client";

import Image from "next/image";
import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#020B2E]/95 backdrop-blur-md border-b border-blue-900">

      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <a href="/">
          <Image
            src="/logo.png"
            alt="Bichridigital"
            width={180}
            height={60}
            priority
          />
        </a>

        {/* Menu Desktop */}
        <div className="hidden md:flex items-center gap-8 text-white font-medium">

          <Link
  href="/"
  className="hover:text-[#FCCD12] transition"
>
  Accueil
</Link>

          <Link
  href="/services"
  className="hover:text-[#FCCD12] transition"
>
  Services
</Link>

          <Link
  href="/apropos"
  className="hover:text-[#FCCD12] transition"
>
  À propos
</Link>

          
<Link
  href="/contact"
  className="hover:text-[#FCCD12] transition"
>
  Contact
</Link>

          

          <Link
  href="/contact"
  className="bg-[#0057FF] hover:bg-blue-700 px-6 py-3 rounded-full font-semibold transition"
>
  Demander un devis →
</Link>

        </div>

        {/* Hamburger Mobile */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-white text-3xl"
        >
          ☰
        </button>

      </div>

      {/* Menu Mobile */}
      {menuOpen && (
        <div className="md:hidden bg-gradient-to-b from-[#020B2E] to-[#00154A] border-t border-blue-900 shadow-lg">

          <div className="flex flex-col items-center justify-center gap-8 py-10 text-white text-lg font-medium">

            <a
              href="/"
              onClick={() => setMenuOpen(false)}
              className="hover:text-[#FCCD12]"
            >
              Accueil
            </a>

            <a
              href="/services"
              onClick={() => setMenuOpen(false)}
              className="hover:text-[#FCCD12]"
            >
              Services
            </a>

            <a
              href="/portfolio"
              onClick={() => setMenuOpen(false)}
              className="hover:text-[#FCCD12]"
            >
              Portfolio
            </a>

            <a
              href="/apropos"
              onClick={() => setMenuOpen(false)}
              className="hover:text-[#FCCD12]"
            >
              À propos
            </a>

            <a
              href="/contact"
              onClick={() => setMenuOpen(false)}
              className="hover:text-[#FCCD12]"
            >
              Contact
            </a>

            <a
              href="/contact"
              className="bg-[#0057FF] text-white px-6 py-3 rounded-full font-semibold"
            >
              Demander un devis →
            </a>

          </div>

        </div>
      )}

    </nav>
  );
}