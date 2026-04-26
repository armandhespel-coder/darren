'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Prestataire } from '@/types';
import './portal.css';

// ─── Icons ──────────────────────────────────────────────────────────
const Ico = {
  Mail: ({ s = 16 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></svg>,
  Copy: ({ s = 14 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>,
  Link: ({ s = 14 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>,
  Check: ({ s = 16 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden><polyline points="20 6 9 17 4 12"/></svg>,
  ArrowLeft: ({ s = 14 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M19 12H5M12 19l-7-7 7-7"/></svg>,
  Shield: ({ s = 14 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Clock: ({ s = 14 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Eye: ({ s = 14 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>,
  Sparkle: ({ s = 14 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5z"/><path d="M19 14l.9 2.6 2.6.9-2.6.9L19 21l-.9-2.6-2.6-.9 2.6-.9z" opacity="0.6"/></svg>,
  Lock: ({ s = 14 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
  Send: ({ s = 14 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  Info: ({ s = 14 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
};

// ─── Logo ────────────────────────────────────────────────────────────
function Logo() {
  return (
    <a href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
      <img src="/logo.png" alt="Connect Event" style={{ height: 52, width: 'auto', objectFit: 'contain' }} />
    </a>
  );
}

function GradButton({ children, onClick, size = 'md', full = false, icon, disabled }: {
  children: React.ReactNode; onClick?: () => void; size?: string;
  full?: boolean; icon?: React.ReactNode; disabled?: boolean;
}) {
  const h = size === 'lg' ? 56 : size === 'sm' ? 40 : 48;
  return (
    <button type="button" disabled={disabled} onClick={onClick} className="ce-grad-btn"
      style={{ height: h, width: full ? '100%' : undefined }}>
      {icon}<span>{children}</span>
    </button>
  );
}

function GhostButton({ children, onClick, icon, full, disabled }: {
  children: React.ReactNode; onClick?: () => void; icon?: React.ReactNode;
  full?: boolean; disabled?: boolean;
}) {
  return (
    <button onClick={onClick} disabled={disabled} className="ce-ghost-btn"
      style={{ height: 48, width: full ? '100%' : undefined }}>
      {icon}<span>{children}</span>
    </button>
  );
}

// ─── Types ───────────────────────────────────────────────────────────
interface PrestaRow {
  id: string; nom: string; company: string; categorie: string;
  email: string; last_login: string; status: 'active' | 'stale';
}

function toRow(p: Prestataire): PrestaRow {
  const days = Math.floor((Date.now() - new Date(p.created_at).getTime()) / 86400000);
  return {
    id: p.id,
    nom: p.nom,
    company: p.company ?? '',
    categorie: p.categorie,
    email: p.email ?? '',
    last_login: days === 0 ? "Aujourd'hui" : `il y a ${days}j`,
    status: days < 14 ? 'active' : 'stale',
  };
}

// ─── AdminPanel ───────────────────────────────────────────────────────
function AdminPanel({ prestaList }: { prestaList: PrestaRow[] }) {
  const [rows, setRows] = useState(prestaList);
  const [selected, setSelected] = useState<PrestaRow | null>(prestaList[0] ?? null);
  const [showMenu, setShowMenu] = useState(false);
  const [expiry, setExpiry] = useState('7');
  const [reusable, setReusable] = useState(false);
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);
  const [copying, setCopying] = useState(false);
  const [sent, setSent] = useState(false);
  const [sentLink, setSentLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const emailSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (prestaList.length && !selected) setSelected(prestaList[0]);
  }, [prestaList, selected]);

  const updateEmail = (email: string) => {
    if (!selected) return;
    const updated = { ...selected, email };
    setSelected(updated);
    setRows(r => r.map(row => row.id === selected.id ? updated : row));

    if (emailSaveTimer.current) clearTimeout(emailSaveTimer.current);
    emailSaveTimer.current = setTimeout(async () => {
      await supabase.from('prestataires').update({ email }).eq('id', selected.id);
    }, 800);
  };

  const handleSend = async () => {
    if (!selected?.email) { setErr("Renseignez d'abord l'adresse email du prestataire."); return; }
    setErr(null);
    setSending(true);
    const res = await fetch('/api/send-edit-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prestataire_id: selected.id,
        email: selected.email,
        nom: selected.nom,
        expiry, note, reusable, sendEmail: true,
      }),
    });
    const data = await res.json();
    setSending(false);
    if (!res.ok) { setErr(data.error ?? 'Erreur lors de l\'envoi.'); return; }
    setSentLink(data.link);
    setSent(true);
  };

  const handleCopyLink = async () => {
    if (!selected) return;
    setErr(null);
    setCopying(true);
    const res = await fetch('/api/send-edit-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prestataire_id: selected.id,
        email: selected.email ?? '',
        nom: selected.nom,
        expiry, note, reusable, sendEmail: false,
      }),
    });
    const data = await res.json();
    setCopying(false);
    if (!res.ok) { setErr(data.error ?? 'Erreur.'); return; }
    navigator.clipboard?.writeText(data.link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copy = () => {
    navigator.clipboard?.writeText(sentLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  if (!rows.length) {
    return (
      <div className="ce-admin-wrap">
        <header className="ce-admin-top"><Logo /><span className="ce-pill-tag"><Ico.Shield s={12} /> Admin · Portail</span></header>
        <main className="ce-admin-main" style={{ textAlign: 'center', paddingTop: 80 }}>
          <p style={{ color: 'var(--muted)', fontWeight: 600 }}>Aucun prestataire dans la base de données.</p>
          <a href="/admin" className="ce-ghost-btn" style={{ height: 44, display: 'inline-flex', marginTop: 16 }}>← Retour admin</a>
        </main>
      </div>
    );
  }

  if (sent && selected) {
    return (
      <div className="ce-admin-wrap">
        <header className="ce-admin-top"><Logo /><span className="ce-pill-tag"><Ico.Shield s={12} /> Admin · Portail</span></header>
        <main className="ce-admin-main">
          <div className="ce-success-card" style={{ animation: 'cePopIn .4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
            <div className="ce-success-icon"><Ico.Check s={32} /></div>
            <h1 className="ce-success-h">Email envoyé à {selected.nom.split(' ')[0]}</h1>
            <p className="ce-success-p">L&apos;email vient de partir. Vous pouvez aussi partager ce lien directement :</p>
            <div className="ce-link-box">
              <Ico.Link s={14} /><code>{sentLink}</code>
              <button className="ce-link-copy" onClick={copy}>
                {copied ? <><Ico.Check s={13} /> Copié</> : <><Ico.Copy s={13} /> Copier</>}
              </button>
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <GhostButton icon={<Ico.ArrowLeft s={13} />} onClick={() => { setSent(false); setNote(''); }}>
                Nouveau lien
              </GhostButton>
              <a href="/admin" className="ce-ghost-btn" style={{ height: 48 }}>← Retour admin</a>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="ce-admin-wrap">
      <header className="ce-admin-top">
        <Logo />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <a href="/admin" className="ce-ghost-btn" style={{ height: 40 }}>← Admin</a>
          <span className="ce-pill-tag" style={{ display: 'none' }} id="portal-tag-desktop"><Ico.Shield s={12} /> Admin · Portail</span>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowMenu(m => !m)}
              aria-label="Menu"
              style={{
                width: 40, height: 40, display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', gap: 5, cursor: 'pointer', borderRadius: 12,
                background: showMenu ? 'rgba(74,108,247,0.08)' : 'var(--bg2)',
                border: showMenu ? '1.5px solid rgba(74,108,247,0.35)' : '1.5px solid var(--border)',
              }}
            >
              {[0,1,2].map(i => <span key={i} style={{ width:16, height:2, background: showMenu ? 'var(--blue2)' : 'var(--muted)', borderRadius:2, display:'block' }} />)}
            </button>
            {showMenu && (
              <div style={{
                position: 'absolute', right: 0, top: 'calc(100% + 8px)', background: 'white',
                border: '1px solid var(--border)', boxShadow: '0 12px 40px rgba(74,108,247,0.18)',
                borderRadius: 16, overflow: 'hidden', minWidth: 180, zIndex: 50,
              }}>
                <a href="/admin" style={{ display:'flex',alignItems:'center',gap:8,padding:'12px 16px',fontSize:13,fontWeight:700,color:'var(--text)',textDecoration:'none',borderBottom:'1px solid var(--border)' }}>← Admin</a>
                <a href="/admin/categories" style={{ display:'flex',alignItems:'center',gap:8,padding:'12px 16px',fontSize:13,fontWeight:700,color:'var(--text)',textDecoration:'none',borderBottom:'1px solid var(--border)' }}>📂 Catégories</a>
                <a href="/admin/tags" style={{ display:'flex',alignItems:'center',gap:8,padding:'12px 16px',fontSize:13,fontWeight:700,color:'var(--text)',textDecoration:'none',borderBottom:'1px solid var(--border)' }}>🏷️ Tags</a>
                <a href="/" style={{ display:'flex',alignItems:'center',gap:8,padding:'12px 16px',fontSize:13,fontWeight:700,color:'var(--muted)',textDecoration:'none' }}>← Site</a>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="ce-admin-main">
        <div className="ce-admin-hd">
          <div>
            <div className="ce-breadcrumb">Admin · Prestataires · <strong>Envoyer un lien d&apos;édition</strong></div>
            <h1 className="ce-h1">Lien d&apos;auto-édition</h1>
            <p className="ce-sub">Générez un lien sécurisé que le prestataire utilisera pour mettre à jour son profil — sans compte à créer.</p>
          </div>
        </div>

        {err && (
          <div style={{ marginBottom: 16, padding: '10px 16px', background: 'rgba(239,68,68,0.08)', border: '1.5px solid rgba(239,68,68,0.3)', borderRadius: 12, color: '#dc2626', fontSize: 13, fontWeight: 700 }}>
            ✕ {err}
          </div>
        )}

        <div className="ce-admin-grid">
          {/* ── Left card ── */}
          <section className="ce-card">
            <h2 className="ce-card-title">1. Destinataire</h2>
            <label className="ce-lbl">Prestataire</label>
            <div className="ce-presta-list" role="listbox">
              {rows.map(p => (
                <button key={p.id} role="option" aria-selected={p.id === selected?.id}
                  onClick={() => setSelected(p)}
                  className={`ce-presta-row${p.id === selected?.id ? ' is-active' : ''}`}>
                  <div className="ce-avatar" aria-hidden>{p.nom.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
                  <div className="ce-presta-meta">
                    <div className="ce-presta-nom">{p.nom}{p.company && <span className="ce-presta-cat"> · {p.company}</span>}</div>
                    <div className="ce-presta-email">{p.categorie}</div>
                  </div>
                  <div className="ce-presta-status" data-status={p.status}>
                    <span>● {p.last_login}</span>
                  </div>
                </button>
              ))}
            </div>

            {selected && (
              <div style={{ marginTop: 16 }}>
                <label className="ce-lbl">Email du prestataire <span className="ce-lbl-opt">(enregistré automatiquement)</span></label>
                <input
                  className="ce-input"
                  type="email"
                  value={selected.email}
                  onChange={e => updateEmail(e.target.value)}
                  placeholder="prenom.nom@email.com"
                />
              </div>
            )}

            <h2 className="ce-card-title" style={{ marginTop: 32 }}>2. Expiration & message</h2>
            <div className="ce-form-grid">
              <div>
                <label className="ce-lbl">Durée de validité</label>
                <div className="ce-segment" role="radiogroup">
                  {(['1', '7', '30', 'inf'] as const).map(d => (
                    <button key={d} role="radio" aria-checked={expiry === d} onClick={() => setExpiry(d)}
                      className={expiry === d ? 'is-active' : ''}>
                      {d === '1' ? '24 h' : d === '7' ? '7 j' : d === '30' ? '30 j' : '∞ illimité'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="ce-lbl">Canal d&apos;envoi</label>
                <div className="ce-channel">
                  <span className="ce-chan is-on"><Ico.Mail s={14} /> Email</span>
                </div>
              </div>
            </div>

            <div className="ce-reuse-row">
              <div>
                <div className="ce-reuse-lbl">Lien réutilisable</div>
                <div className="ce-reuse-sub">
                  {reusable ? 'Le prestataire pourra revenir éditer à volonté.' : 'Usage unique — désactivé après la première utilisation.'}
                </div>
              </div>
              <button className={`ce-switch${reusable ? ' is-on' : ''}`} onClick={() => setReusable(r => !r)} aria-pressed={reusable}>
                <span className="ce-switch-thumb" />
              </button>
            </div>

            <label className="ce-lbl" style={{ marginTop: 18 }}>Note personnelle <span className="ce-lbl-opt">(optionnel)</span></label>
            <textarea className="ce-textarea" rows={3} value={note} onChange={e => setNote(e.target.value)}
              placeholder="Bonjour, pourrais-tu rafraîchir tes photos et confirmer tes dispos pour juin ? Merci !" />
          </section>

          {/* ── Right card — email preview ── */}
          <aside className="ce-card ce-preview">
            <div className="ce-preview-hd">
              <h2 className="ce-card-title" style={{ margin: 0 }}>Aperçu de l&apos;email</h2>
              <span className="ce-chip"><Ico.Eye s={11} /> Temps réel</span>
            </div>
            <div className="ce-email">
              <div className="ce-email-top">
                <div className="ce-email-field"><span>De</span><strong>Connect Event &lt;no-reply@connectevent.be&gt;</strong></div>
                <div className="ce-email-field"><span>À</span><strong>{selected?.email || <em style={{ color: 'var(--warn)', fontStyle: 'normal' }}>email non renseigné</em>}</strong></div>
                <div className="ce-email-field"><span>Objet</span><strong>Mettez à jour votre profil Connect Event</strong></div>
              </div>
              <div className="ce-email-body">
                <div className="ce-email-logo"><Logo /></div>
                <h3 className="ce-email-h">Bonjour {selected?.nom.split(' ')[0] ?? ''},</h3>
                <p className="ce-email-p">Nous avons créé un lien sécurisé pour que vous puissiez mettre à jour votre profil prestataire — photos, disponibilités et informations.</p>
                {note && <div className="ce-email-note">« {note} »<span>— Connect Event</span></div>}
                <div className="ce-email-cta">
                  <span className="ce-grad-btn" style={{ pointerEvents: 'none', height: 48, padding: '0 26px' }}>
                    <Ico.Sparkle s={14} /><span>Mettre à jour mon profil</span>
                  </span>
                </div>
                <div className="ce-email-meta">
                  <div><Ico.Clock s={12} /> {expiry === 'inf' ? 'Lien sans expiration' : `Lien valable ${expiry === '1' ? '24 heures' : `${expiry} jours`}`}</div>
                  <div><Ico.Lock s={12} /> {reusable ? 'Réutilisable' : 'Usage unique'}</div>
                </div>
                <p className="ce-email-fp">Si vous n&apos;êtes pas à l&apos;origine de cette demande, ignorez simplement ce message.</p>
              </div>
            </div>
            <GradButton full size="lg" icon={<Ico.Send s={14} />} onClick={handleSend}
              disabled={sending || !selected || !selected.email}>
              {sending ? 'Envoi en cours…' : `Envoyer à ${selected?.nom.split(' ')[0] ?? '—'}`}
            </GradButton>
            <GhostButton full icon={copied ? <Ico.Check s={14} /> : <Ico.Copy s={14} />} onClick={handleCopyLink}
              disabled={copying || !selected}>
              {copying ? 'Génération…' : copied ? 'Lien copié !' : 'Copier le lien (sans email)'}
            </GhostButton>
            <p className="ce-help"><Ico.Info s={12} /> {selected?.email ? 'Email prêt à être envoyé.' : 'Renseignez l\'email du prestataire pour envoyer.'}</p>
          </aside>
        </div>
      </main>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────
export default function PortalClient() {
  const [prestaList, setPrestaList] = useState<PrestaRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('prestataires')
      .select('id, nom, company, categorie, email, created_at')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setPrestaList(((data ?? []) as Prestataire[]).map(toRow));
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="ce-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="ce-spin" />
      </div>
    );
  }

  return (
    <div className="ce-root">
      <AdminPanel prestaList={prestaList} />
    </div>
  );
}
