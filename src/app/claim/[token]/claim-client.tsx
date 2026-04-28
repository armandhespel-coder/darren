'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Props {
  token: string;
  prestataireId: string;
  prestaName: string;
}

export default function ClaimClient({ token, prestataireId, prestaName }: Props) {
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const claim = async () => {
    await fetch('/api/link-prestataire', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) { setError(err.message); setLoading(false); return; }
    await claim();
    window.location.href = '/';
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(`/claim/${token}`)}`;
    const { error: err } = await supabase.auth.signUp({
      email, password,
      options: { data: { role: 'client' }, emailRedirectTo: redirectTo },
    });
    if (err) { setError(err.message); setLoading(false); return; }
    setEmailSent(true); setLoading(false);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 16px', borderRadius: 12,
    border: '1.5px solid rgba(74,108,247,0.2)', background: 'white',
    fontSize: 14, outline: 'none', color: '#1E1C3A', fontFamily: 'inherit', boxSizing: 'border-box',
  };

  if (emailSent) return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #12112A, #1E1C3A)', padding: 24 }}>
      <div style={{ background: 'white', borderRadius: 24, padding: '48px 40px', maxWidth: 440, width: '100%', textAlign: 'center', boxShadow: '0 30px 80px rgba(74,108,247,0.25)' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>
        <h2 style={{ fontWeight: 900, fontSize: 22, color: '#1E1C3A', marginBottom: 8 }}>Vérifiez vos emails</h2>
        <p style={{ color: '#6B6A87', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
          Un email de confirmation vous a été envoyé à <strong>{email}</strong>.<br />
          Cliquez sur le lien pour activer votre accès prestataire. Pensez à vérifier vos spams.
        </p>
        <button type="button" onClick={async () => {
          const supabase = createClient();
          await supabase.auth.resend({ type: 'signup', email, options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(`/claim/${token}`)}` } });
        }} style={{ fontSize: 13, color: '#4A6CF7', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
          Renvoyer l&apos;email
        </button>
      </div>
    </main>
  );

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #12112A, #1E1C3A)', padding: 24 }}>
      <div style={{ background: 'white', borderRadius: 24, padding: '48px 40px', maxWidth: 440, width: '100%', boxShadow: '0 30px 80px rgba(74,108,247,0.25)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img src="/logo.png" alt="Connect Event" style={{ height: 72, objectFit: 'contain', marginBottom: 20 }} />
          <h1 style={{ fontWeight: 900, fontSize: 22, color: '#1E1C3A', marginBottom: 8 }}>
            Votre espace prestataire
          </h1>
          {prestaName && (
            <p style={{ color: '#6B6A87', fontSize: 14, lineHeight: 1.6 }}>
              Fiche <strong>{prestaName}</strong> — créez votre compte ou connectez-vous pour y accéder.
            </p>
          )}
        </div>

        {/* Toggle */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 24, background: '#F7F8FC', borderRadius: 12, padding: 4 }}>
          {(['register', 'login'] as const).map(m => (
            <button key={m} type="button" onClick={() => { setMode(m); setError(''); }} style={{
              flex: 1, padding: '10px', borderRadius: 9, border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
              background: mode === m ? 'white' : 'transparent',
              color: mode === m ? '#1E1C3A' : '#9594AE',
              boxShadow: mode === m ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
            }}>
              {m === 'register' ? "Créer un compte" : "Se connecter"}
            </button>
          ))}
        </div>

        <form onSubmit={mode === 'login' ? handleLogin : handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="Votre email" style={inputStyle} />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} placeholder="Mot de passe (min. 6 caractères)" style={inputStyle} />

          {mode === 'login' && (
            <a href="/auth/forgot-password" style={{ fontSize: 12, color: '#6B6A87', textAlign: 'right', textDecoration: 'none' }}>
              Mot de passe oublié ?
            </a>
          )}

          {error && <p style={{ fontSize: 12, color: '#e53e3e', margin: 0, padding: '8px 12px', background: 'rgba(229,62,62,0.06)', borderRadius: 8 }}>{error}</p>}

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '14px', borderRadius: 14, border: 'none', marginTop: 4,
            background: 'linear-gradient(135deg, #4A6CF7, #D93FB5)',
            color: 'white', fontSize: 15, fontWeight: 800,
            cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
            letterSpacing: '0.02em',
          }}>
            {loading ? '…' : mode === 'register' ? '✨ Créer mon compte' : '🔑 Me connecter'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: '#9999B3' }}>
          En vous inscrivant via ce lien, vous devenez automatiquement prestataire sur Connect Event.
        </p>
      </div>
    </main>
  );
}
