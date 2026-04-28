'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Props {
  token: string;
  prestataireId: string;
  prestaName: string;
}

export default function ClaimClient({ token, prestaName }: Props) {
  const [mode, setMode] = useState<'magic' | 'password'>('magic');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [magicSent, setMagicSent] = useState(false);

  const redirectTo = typeof window !== 'undefined'
    ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(`/claim/${token}`)}`
    : '';

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });
    if (err) { setError(err.message); setLoading(false); return; }
    setMagicSent(true); setLoading(false);
  };

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) { setError(err.message); setLoading(false); return; }
    // Claim via API puis redirection
    await fetch('/api/link-prestataire', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    window.location.href = '/';
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 16px', borderRadius: 12,
    border: '1.5px solid rgba(74,108,247,0.2)', background: 'white',
    fontSize: 14, outline: 'none', color: '#1E1C3A', fontFamily: 'inherit', boxSizing: 'border-box',
  };

  if (magicSent) return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #12112A, #1E1C3A)', padding: 24 }}>
      <div style={{ background: 'white', borderRadius: 24, padding: '48px 40px', maxWidth: 440, width: '100%', textAlign: 'center', boxShadow: '0 30px 80px rgba(74,108,247,0.25)' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>
        <h2 style={{ fontWeight: 900, fontSize: 22, color: '#1E1C3A', marginBottom: 8 }}>Vérifiez vos emails</h2>
        <p style={{ color: '#6B6A87', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
          Un lien de connexion a été envoyé à <strong>{email}</strong>.<br />
          Cliquez dessus pour accéder à votre espace prestataire. Vérifiez vos spams si nécessaire.
        </p>
        <button type="button" onClick={handleMagicLink as never} style={{ fontSize: 13, color: '#4A6CF7', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
          Renvoyer le lien
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
              Fiche <strong>{prestaName}</strong>
            </p>
          )}
        </div>

        {/* Toggle */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 24, background: '#F7F8FC', borderRadius: 12, padding: 4 }}>
          {([['magic', 'Lien par email'], ['password', 'Mot de passe']] as const).map(([m, lbl]) => (
            <button key={m} type="button" onClick={() => { setMode(m); setError(''); }} style={{
              flex: 1, padding: '10px', borderRadius: 9, border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
              background: mode === m ? 'white' : 'transparent',
              color: mode === m ? '#1E1C3A' : '#9594AE',
              boxShadow: mode === m ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
            }}>
              {lbl}
            </button>
          ))}
        </div>

        {mode === 'magic' ? (
          <form onSubmit={handleMagicLink} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ fontSize: 13, color: '#6B6A87', margin: 0 }}>
              Entrez votre email — vous recevrez un lien de connexion instantané, sans mot de passe.
            </p>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="Votre email" style={inputStyle} />
            {error && <p style={{ fontSize: 12, color: '#e53e3e', margin: 0, padding: '8px 12px', background: 'rgba(229,62,62,0.06)', borderRadius: 8 }}>{error}</p>}
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '14px', borderRadius: 14, border: 'none', marginTop: 4,
              background: 'linear-gradient(135deg, #4A6CF7, #D93FB5)',
              color: 'white', fontSize: 15, fontWeight: 800,
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
            }}>
              {loading ? '…' : '✉️ Recevoir mon lien'}
            </button>
          </form>
        ) : (
          <form onSubmit={handlePassword} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="Votre email" style={inputStyle} />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} placeholder="Mot de passe" style={inputStyle} />
            <a href="/auth/forgot-password" style={{ fontSize: 12, color: '#6B6A87', textAlign: 'right', textDecoration: 'none' }}>
              Mot de passe oublié ?
            </a>
            {error && <p style={{ fontSize: 12, color: '#e53e3e', margin: 0, padding: '8px 12px', background: 'rgba(229,62,62,0.06)', borderRadius: 8 }}>{error}</p>}
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '14px', borderRadius: 14, border: 'none', marginTop: 4,
              background: 'linear-gradient(135deg, #4A6CF7, #D93FB5)',
              color: 'white', fontSize: 15, fontWeight: 800,
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
            }}>
              {loading ? '…' : '🔑 Me connecter'}
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: '#9999B3' }}>
          En accédant via ce lien, vous devenez prestataire sur Connect Event.
        </p>
      </div>
    </main>
  );
}
