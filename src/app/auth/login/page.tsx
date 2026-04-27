"use client";

import { Suspense, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import DevenirPrestaireModal from "@/components/DevenirPrestaireModal";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isPro = searchParams.get("next") === "/pro/dashboard";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push(isPro ? "/pro/dashboard" : "/");
    }
  };

  return (
    <>
      {showModal && <DevenirPrestaireModal onClose={() => setShowModal(false)} />}
      <div className="glass rounded-2xl p-8">
      <h1 className="text-white text-2xl font-bold mb-1" style={{ fontFamily: "var(--font-cormorant)" }}>
        {isPro ? "Espace Prestataire" : "Connexion"}
      </h1>
      <p className="text-white/40 text-sm mb-6">
        {isPro ? "Connectez-vous avec votre compte prestataire" : "Accédez à votre espace"}
      </p>
      {isPro && (
        <div className="mb-4 px-4 py-3 rounded-xl text-xs font-semibold" style={{ background: "rgba(74,108,247,0.12)", border: "1px solid rgba(74,108,247,0.25)", color: "rgba(180,190,255,0.9)" }}>
          Pas encore de compte prestataire ?{" "}
          <button onClick={() => setShowModal(true)} className="underline text-purple-300 cursor-pointer bg-transparent border-none p-0 font-semibold">Envoyer une demande</button>
        </div>
      )}

      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <div>
          <label className="text-white/50 text-xs uppercase tracking-wider block mb-1.5">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="vous@exemple.com"
            className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/25 outline-none focus:border-purple-500/60 transition-colors text-sm"
          />
        </div>

        <div>
          <label className="text-white/50 text-xs uppercase tracking-wider block mb-1.5">Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/25 outline-none focus:border-purple-500/60 transition-colors text-sm"
          />
        </div>

        {error && (
          <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full text-white font-semibold py-3 rounded-xl transition-all duration-200 hover:opacity-90 disabled:opacity-50 cursor-pointer mt-1"
          style={{ background: "linear-gradient(135deg, #7c3aed, #6366f1)" }}
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>

      <p className="text-center mt-3">
        <a href="/auth/forgot-password" className="text-white/35 hover:text-white/60 text-xs transition-colors">
          Mot de passe oublié ?
        </a>
      </p>

      <p className="text-center text-white/35 text-sm mt-4">
        Pas de compte ?{" "}
        <a href="/auth/register" className="text-purple-400 hover:text-purple-300 transition-colors">
          S&apos;inscrire
        </a>
      </p>
    </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "radial-gradient(ellipse at 20% 0%, #1e0a3c 0%, #090b1a 45%, #080d28 100%)" }}
    >
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center mb-8">
          <img src="/logo.png" alt="Connect Event" className="h-40 md:h-64 w-auto object-contain" />
        </div>

        <Suspense fallback={<div className="glass rounded-2xl p-8 text-white/40 text-sm text-center">Chargement…</div>}>
          <LoginForm />
        </Suspense>

        <p className="text-center mt-4">
          <a href="/" className="text-white/30 hover:text-white/60 text-sm transition-colors">
            ← Retour à l&apos;accueil
          </a>
        </p>
      </div>
    </main>
  );
}
