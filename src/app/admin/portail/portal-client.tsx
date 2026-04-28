'use client';

import { useState } from 'react';

export default function PortalClient() {
  const [link, setLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/generate-invite-link', { method: 'POST' });
    const json = await res.json();
    setLoading(false);
    if (json.token_id) {
      const l = `${window.location.origin}/claim/${json.token_id}`;
      setLink(l);
      navigator.clipboard.writeText(l);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const copy = () => {
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: 'white', borderRadius: 24, padding: '48px 40px', maxWidth: 500, width: '100%', boxShadow: '0 20px 60px rgba(74,108,247,0.15)', textAlign: 'center' }}>
        <img src="/logo.png" alt="Connect Event" style={{ height: 60, objectFit: 'contain', marginBottom: 28 }} />

        <h1 style={{ fontWeight: 900, fontSize: 24, color: 'var(--dark)', fontFamily: 'var(--font-raleway)', marginBottom: 8 }}>
          Inviter un prestataire
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.7, marginBottom: 36 }}>
          Génère un lien unique à envoyer au prestataire.<br />
          Il pourra créer son compte et remplir sa fiche directement.
        </p>

        <button
          onClick={generate}
          disabled={loading}
          style={{
            width: '100%', padding: '16px', borderRadius: 14, border: 'none',
            background: 'linear-gradient(135deg, #4A6CF7, #D93FB5)',
            color: 'white', fontSize: 16, fontWeight: 800,
            cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
            marginBottom: 16,
          }}
        >
          {loading ? 'Génération…' : '✉️ Générer un lien d\'invitation'}
        </button>

        {link && (
          <div style={{ marginTop: 8 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'var(--bg)', border: '1.5px solid var(--border)',
              borderRadius: 12, padding: '10px 14px', marginBottom: 10,
            }}>
              <code style={{ flex: 1, fontSize: 12, color: 'var(--dark)', wordBreak: 'break-all', textAlign: 'left' }}>
                {link}
              </code>
              <button
                onClick={copy}
                style={{
                  flexShrink: 0, padding: '6px 14px', borderRadius: 8, border: 'none',
                  background: copied ? 'rgba(22,163,74,0.1)' : 'rgba(74,108,247,0.1)',
                  color: copied ? '#16a34a' : 'var(--blue2)',
                  fontSize: 12, fontWeight: 700, cursor: 'pointer',
                }}
              >
                {copied ? '✓ Copié' : 'Copier'}
              </button>
            </div>
            <p style={{ fontSize: 12, color: 'var(--muted)' }}>
              Lien copié dans le presse-papiers. Valable 90 jours.
            </p>
            <button
              onClick={() => { setLink(null); setCopied(false); }}
              style={{ marginTop: 12, fontSize: 13, color: 'var(--blue2)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}
            >
              Générer un autre lien
            </button>
          </div>
        )}

        <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
          <a href="/admin" style={{ fontSize: 13, color: 'var(--muted)', textDecoration: 'none' }}>← Retour admin</a>
        </div>
      </div>
    </main>
  );
}
