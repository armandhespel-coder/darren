"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"client" | "pro">("client");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role },
        emailRedirectTo: `${window.location.origin}/auth/login`,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setTimeout(() => {
        if (role === "pro") {
          router.push("/pro/onboarding");
        } else {
          router.push("/auth/login");
        }
      }, 2500);
    }
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "radial-gradient(ellipse at 20% 0%, #1e0a3c 0%, #090b1a 45%, #080d28 100%)" }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <img src="/logo.png" alt="Connect Event" className="h-10 w-auto object-contain" />
        </div>

        <div className="glass rounded-2xl p-8">
          {success ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-white text-xl font-bold mb-2" style={{ fontFamily: "var(--font-cormorant)" }}>Compte créé !</h2>
              <p className="text-white/50 text-sm">
                {role === "pro"
                  ? "Compte créé ! Redirection vers votre espace pro..."
                  : "Vérifiez votre email pour confirmer votre compte."}
              </p>
            </div>
          ) : (
            <>
              <h1 className="text-white text-2xl font-bold mb-1" style={{ fontFamily: "var(--font-cormorant)" }}>
                Créer un compte
              </h1>
              <p className="text-white/40 text-sm mb-6">Rejoignez Connect Event</p>

              <form onSubmit={handleRegister} className="flex flex-col gap-4">
                {/* Role toggle */}
                <div className="flex rounded-xl overflow-hidden border border-white/10">
                  {(["client", "pro"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`flex-1 py-2.5 text-sm font-medium transition-all duration-200 cursor-pointer capitalize ${
                        role === r ? "text-white" : "text-white/40 hover:text-white/60"
                      }`}
                      style={role === r ? { background: "linear-gradient(135deg, #7c3aed, #6366f1)" } : {}}
                    >
                      {r === "client" ? "Je cherche" : "Je propose"}
                    </button>
                  ))}
                </div>

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
                    minLength={6}
                    placeholder="Min. 6 caractères"
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
                  {loading ? "Création..." : "Créer mon compte"}
                </button>
              </form>

              <p className="text-center text-white/35 text-sm mt-6">
                Déjà un compte ?{" "}
                <a href="/auth/login" className="text-purple-400 hover:text-purple-300 transition-colors">
                  Se connecter
                </a>
              </p>
            </>
          )}
        </div>

        <p className="text-center mt-4">
          <a href="/" className="text-white/30 hover:text-white/60 text-sm transition-colors">
            ← Retour à l&apos;accueil
          </a>
        </p>
      </div>
    </main>
  );
}
