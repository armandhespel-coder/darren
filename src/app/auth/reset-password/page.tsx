"use client";

import { useState, useEffect, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";

function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const supabase = createClient();
    const code = searchParams.get("code");

    if (code) {
      // PKCE flow — échange le code contre une session
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) setError("Lien invalide ou expiré. Demandez un nouveau lien.");
        else setReady(true);
      });
    } else {
      // Implicit flow — vérifie si une session existe déjà (hash fragment)
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) setReady(true);
        else setError("Lien invalide ou expiré. Demandez un nouveau lien.");
      });
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError("Les mots de passe ne correspondent pas."); return; }
    if (password.length < 6) { setError("Minimum 6 caractères."); return; }
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setDone(true);
      setTimeout(() => router.push("/auth/login"), 2500);
    }
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "radial-gradient(ellipse at 20% 0%, #1e0a3c 0%, #090b1a 45%, #080d28 100%)" }}
    >
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center mb-8">
          <img src="/logo.png" alt="Connect Event" className="h-10 w-auto object-contain" />
        </div>

        <div className="glass rounded-2xl p-8">
          {done ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-white text-xl font-bold mb-2" style={{ fontFamily: "var(--font-cormorant)" }}>
                Mot de passe modifié !
              </h2>
              <p className="text-white/50 text-sm">Redirection vers la connexion...</p>
            </div>
          ) : error && !ready ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-white text-xl font-bold mb-2" style={{ fontFamily: "var(--font-cormorant)" }}>
                Lien invalide
              </h2>
              <p className="text-white/50 text-sm mb-4">{error}</p>
              <a href="/auth/forgot-password"
                className="inline-block text-sm font-semibold px-5 py-2.5 rounded-xl text-white"
                style={{ background: "linear-gradient(135deg, #7c3aed, #6366f1)" }}>
                Demander un nouveau lien
              </a>
            </div>
          ) : !ready ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-white/50 text-sm">Vérification du lien...</p>
            </div>
          ) : (
            <>
              <h1 className="text-white text-2xl font-bold mb-1" style={{ fontFamily: "var(--font-cormorant)" }}>
                Nouveau mot de passe
              </h1>
              <p className="text-white/40 text-sm mb-6">Choisissez votre nouveau mot de passe.</p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="text-white/50 text-xs uppercase tracking-wider block mb-1.5">
                    Nouveau mot de passe
                  </label>
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

                <div>
                  <label className="text-white/50 text-xs uppercase tracking-wider block mb-1.5">Confirmer</label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
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
                  className="w-full text-white font-semibold py-3 rounded-xl transition-all hover:opacity-90 disabled:opacity-50 cursor-pointer mt-1"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #6366f1)" }}
                >
                  {loading ? "Enregistrement..." : "Enregistrer"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
