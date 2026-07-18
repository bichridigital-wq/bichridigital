"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setLoading(true);
    setErrorMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setErrorMessage("Email ou mot de passe incorrect.");
      setLoading(false);
      return;
    }

    router.replace("/admin");
    router.refresh();
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020B2E] px-6 py-20 text-white">
      <div className="absolute left-[-180px] top-[-150px] h-[420px] w-[420px] rounded-full bg-[#0057FF]/30 blur-[140px]" />

      <div className="absolute bottom-[-160px] right-[-140px] h-[380px] w-[380px] rounded-full bg-[#FCCD12]/10 blur-[130px]" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-160px)] max-w-lg items-center justify-center">
        <div className="w-full rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-[0_0_70px_rgba(0,87,255,0.18)] backdrop-blur-xl md:p-12">
          <div className="text-center">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-[#FCCD12]">
              Bichridigital Admin
            </p>

            <h1 className="mt-4 text-4xl font-black">
              Connexion
            </h1>

            <p className="mt-4 text-gray-400">
              Connectez-vous pour gérer la boutique Bichridigital.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-10 space-y-6">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-bold text-gray-300"
              >
                Adresse email
              </label>

              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="bichridigital@gmail.com"
                className="w-full rounded-2xl border border-white/10 bg-[#020B2E]/80 px-5 py-4 text-white outline-none transition placeholder:text-gray-600 focus:border-[#FCCD12]"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-bold text-gray-300"
              >
                Mot de passe
              </label>

              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Votre mot de passe"
                className="w-full rounded-2xl border border-white/10 bg-[#020B2E]/80 px-5 py-4 text-white outline-none transition placeholder:text-gray-600 focus:border-[#FCCD12]"
              />
            </div>

            {errorMessage && (
              <div
                role="alert"
                className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm font-bold text-red-300"
              >
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#FCCD12] px-8 py-4 font-black text-[#020B2E] transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Connexion..." : "Se connecter →"}
            </button>
          </form>

          <Link
            href="/"
            className="mt-7 block text-center text-sm font-bold text-gray-400 transition hover:text-[#FCCD12]"
          >
            ← Retour au site
          </Link>
        </div>
      </div>
    </main>
  );
}
