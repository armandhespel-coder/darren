'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Props {
  token: string;
  prestataireId: string;
  prestaName: string;
  isInvite: boolean;
}

export default function ClaimClient({ token, prestaName, isInvite }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 16px', borderRadius: 12,
    border: '1.5px solid rgba(74,108,247,0.2)', background: 'white',
    fontSize: 14, outline: 'none', color: '#1E1C3A', fontFamily: 'inherit', boxSizing: 'border-box',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');

    const res = await fetch('/api/claim/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, token }),
    });
    const json = await res.json();
    if (!res.ok) { setError(json.error || 'Erreur lors de la création du compte.'); setLoading(false); return; }

    const supabase = createClient();
    const { error: loginErr } = await supabase.auth.signInWithPassword({ email, password });
    if (loginErr) { setError(loginErr.message); setLoading(false); return; }

    window.location.href = json.isInvite ? '/pro/onboarding' : '/pro/dashboard';
  };

  const title = isInvite ? 'Créez votre compte prestataire' : 'Votre espace prestataire';

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #12112A, #1E1C3A)', padding: 24 }}>
      <div style={{ background: 'white', borderRadius: 24, padding: '48px 40px', maxWidth: 440, width: '100%', boxShadow: '0 30px 80px rgba(74,108,247,0.25)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img src="/logo.png" alt="Connect Event" style={{ height: 72, objectFit: 'contain', marginBottom: 20 }} />
          <h1 style={{ fontWeight: 900, fontSize: 22, color: '#1E1C3A', marginBottom: 8 }}>{title}</h1>
          {!isInvite && prestaName && (
            <p style={{ color: '#6B6A87', fontSize: 14 }}>Fiche <strong>{prestaName}</strong></p>
          )}
          {isInvite && (
            <p style={{ color: '#6B6A87', fontSize: 14 }}>Créez votre compte pour remplir votre profil.</p>
          )}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            required placeholder="Votre email" style={inputStyle}
          />
          <input
            type="password" value={password} onChange={e => setPassword(e.target.value)}
            required minLength={6} placeholder="Choisissez un mot de passe (min. 6 carac.)" style={inputStyle}
          />
          {error && (
            <p style={{ fontSize: 12, color: '#e53e3e', margin: 0, padding: '8px 12px', background: 'rgba(229,62,62,0.06)', borderRadius: 8 }}>
              {error}
            </p>
          )}
          <button
            type="submit" disabled={loading}
            style={{
              width: '100%', padding: '15px', borderRadius: 14, border: 'none', marginTop: 4,
              background: 'linear-gradient(135deg, #4A6CF7, #D93FB5)',
              color: 'white', fontSize: 15, fontWeight: 800,
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? '…' : '✨ Créer mon compte'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: '#9999B3' }}>
          Accès immédiat — aucune vérification email requise.
        </p>
      </div>
    </main>
  );
}
