"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { name: "Accueil", href: "/" },
  { name: "Services", href: "/services" },
  { name: "Portfolio", href: "/portfolio" },
  { name: "Boutique", href: "/boutique" },
  { name: "À propos", href: "/apropos" },
  { name: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="fixed left-0 top-0 z-50 w-full px-4 pt-4">
      <nav className="relative mx-auto grid h-[66px] max-w-7xl grid-cols-[auto_1fr_auto] items-center rounded-full border border-white/10 bg-[#020B2E]/85 px-4 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl md:px-5">
        {/* LOGO */}
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="Bichridigital Agency"
            width={140}
            height={48}
            priority
            className="h-9 w-auto object-contain md:h-10"
          />
        </Link>

        {/* MENU CENTER */}
        <div className="hidden justify-center lg:flex">
          <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1">
            {navLinks.map((link) => {
              const active = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                    active
                      ? "bg-[#FCCD12] text-[#020B2E]"
                      : "text-white/80 hover:bg-white/10 hover:text-[#FCCD12]"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* CTA RIGHT */}
        <div className="hidden justify-end lg:flex">
          <Link
            href="/tv"
            aria-current={pathname === "/tv" ? "page" : undefined}
            className="rounded-full bg-[#FCCD12] px-5 py-2.5 text-sm font-black text-[#020B2E] shadow-[0_0_30px_rgba(252,205,18,0.25)] transition hover:scale-105"
          >
            Bichridigital TV
          </Link>
        </div>

        {/* MOBILE BUTTON */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="ml-auto flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white lg:hidden"
          aria-label="Menu"
        >
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </nav>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="mx-auto mt-3 max-w-7xl rounded-[24px] border border-white/10 bg-[#020B2E]/95 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl lg:hidden">
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => {
              const active = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`rounded-xl px-4 py-3 text-sm font-bold transition ${
                    active
                      ? "bg-[#FCCD12] text-[#020B2E]"
                      : "bg-white/5 text-white hover:bg-white/10"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}

            <Link
              href="/tv"
              onClick={() => setMenuOpen(false)}
              aria-current={pathname === "/tv" ? "page" : undefined}
              className="rounded-xl bg-[#FCCD12] px-4 py-3 text-center text-sm font-black text-[#020B2E]"
            >
              Bichridigital TV
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
