'use client';

import { useState, useEffect } from 'react';
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
    <div className="ce-logo">
      <div className="ce-logo-mark" aria-hidden><span>CE</span></div>
      <span className="ce-logo-text">Connect Event</span>
    </div>
  );
}

// ─── Buttons ─────────────────────────────────────────────────────────
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

function GhostButton({ children, onClick, icon }: {
  children: React.ReactNode; onClick?: () => void; icon?: React.ReactNode;
}) {
  return (
    <button onClick={onClick} className="ce-ghost-btn" style={{ height: 48 }}>
      {icon}<span>{children}</span>
    </button>
  );
}

// ─── Types ───────────────────────────────────────────────────────────
interface PrestaRow {
  id: string; nom: string; company: string; categorie: string;
  last_login: string; status: 'active' | 'stale' | 'pending';
}

function toRow(p: Prestataire): PrestaRow {
  const days = Math.floor((Date.now() - new Date(p.created_at).getTime()) / 86400000);
  return {
    id: p.id,
    nom: p.nom,
    company: p.company ?? '',
    categorie: p.categorie,
    last_login: days === 0 ? "Aujourd'hui" : `il y a ${days}j`,
    status: days < 14 ? 'active' : 'stale',
  };
}

// ─── AdminPanel ───────────────────────────────────────────────────────
function AdminPanel({ prestaList }: { prestaList: PrestaRow[] }) {
  const [selected, setSelected] = useState<PrestaRow | null>(prestaList[0] ?? null);
  const [expiry, setExpiry] = useState('7');
  const [reusable, setReusable] = useState(false);
  const [scope, setScope] = useState<Record<string, boolean>>({ photos: true, availability: true, profile: true });
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (prestaList.length && !selected) setSelected(prestaList[0]);
  }, [prestaList, selected]);

  const link = selected
    ? `https://connectevent.be/p/edit/mZQ8kX3Lp2tR-${selected.id.slice(-8)}`
    : '';

  const handleSend = () => {
    setSending(true);
    setTimeout(() => { setSending(false); setSent(true); }, 700);
  };

  const copy = () => {
    navigator.clipboard?.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  if (!prestaList.length) {
    return (
      <div className="ce-admin-wrap">
        <header className="ce-admin-top">
          <Logo />
          <span className="ce-pill-tag"><Ico.Shield s={12} /> Admin · Portail</span>
        </header>
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
        <header className="ce-admin-top">
          <Logo />
          <span className="ce-pill-tag"><Ico.Shield s={12} /> Admin · Portail</span>
        </header>
        <main className="ce-admin-main">
          <div className="ce-success-card" style={{ animation: 'cePopIn .4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
            <div className="ce-success-icon"><Ico.Check s={32} /></div>
            <h1 className="ce-success-h">Lien envoyé à {selected.nom.split(' ')[0]}</h1>
            <p className="ce-success-p">Vous pouvez aussi partager ce lien directement par WhatsApp ou autre :</p>
            <div className="ce-link-box">
              <Ico.Link s={14} /><code>{link}</code>
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
        <div className="ce-admin-top-right">
          <a href="/admin" className="ce-ghost-btn" style={{ height: 40 }}>← Admin</a>
          <span className="ce-pill-tag"><Ico.Shield s={12} /> Admin · Portail</span>
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
        <div className="ce-admin-grid">
          {/* ── Left card ── */}
          <section className="ce-card">
            <h2 className="ce-card-title">1. Destinataire</h2>
            <label className="ce-lbl">Prestataire</label>
            <div className="ce-presta-list" role="listbox">
              {prestaList.map(p => (
                <button key={p.id} role="option" aria-selected={p.id === selected?.id}
                  onClick={() => setSelected(p)}
                  className={`ce-presta-row${p.id === selected?.id ? ' is-active' : ''}`}>
                  <div className="ce-avatar" aria-hidden>{p.nom.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
                  <div className="ce-presta-meta">
                    <div className="ce-presta-nom">{p.nom}{p.company && <span className="ce-presta-cat"> · {p.company}</span>}</div>
                    <div className="ce-presta-email">{p.categorie}</div>
                  </div>
                  <div className="ce-presta-status" data-status={p.status}>
                    {p.status === 'active' && <span>● {p.last_login}</span>}
                    {p.status === 'stale' && <span>● {p.last_login}</span>}
                  </div>
                </button>
              ))}
            </div>

            <h2 className="ce-card-title" style={{ marginTop: 32 }}>2. Permissions du lien</h2>
            <div className="ce-scope">
              {[
                { k: 'photos', lbl: 'Photos du profil', sub: 'Upload, réordonner, supprimer' },
                { k: 'availability', lbl: 'Calendrier de disponibilités', sub: 'Marquer dates prises / libres' },
                { k: 'profile', lbl: 'Description & informations', sub: 'Bio, tags, prix indicatif' },
              ].map(o => (
                <label key={o.k} className={`ce-scope-row${scope[o.k] ? ' is-on' : ''}`}>
                  <input type="checkbox" checked={scope[o.k]} onChange={e => setScope(s => ({ ...s, [o.k]: e.target.checked }))} />
                  <div className="ce-scope-check" aria-hidden>{scope[o.k] && <Ico.Check s={14} />}</div>
                  <div>
                    <div className="ce-scope-lbl">{o.lbl}</div>
                    <div className="ce-scope-sub">{o.sub}</div>
                  </div>
                </label>
              ))}
            </div>

            <h2 className="ce-card-title" style={{ marginTop: 32 }}>3. Expiration & message</h2>
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
                  {reusable
                    ? 'Le prestataire pourra revenir éditer son profil à volonté avec ce même lien.'
                    : 'Usage unique — le lien se désactive après la première utilisation (plus sécurisé).'}
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
                <div className="ce-email-field"><span>À</span><strong>{selected?.nom ?? '—'}</strong></div>
                <div className="ce-email-field"><span>Objet</span><strong>Mettez à jour votre profil Connect Event</strong></div>
              </div>
              <div className="ce-email-body">
                <div className="ce-email-logo"><Logo /></div>
                <h3 className="ce-email-h">Bonjour {selected?.nom.split(' ')[0] ?? ''},</h3>
                <p className="ce-email-p">Nous avons créé un lien sécurisé pour que vous puissiez mettre à jour votre profil prestataire — photos, disponibilités et informations. Aucun compte à créer, aucun mot de passe à retenir.</p>
                {note && <div className="ce-email-note">« {note} »<span>— Connect Event</span></div>}
                <div className="ce-email-cta">
                  <span className="ce-grad-btn" style={{ pointerEvents: 'none', height: 48, padding: '0 26px' }}>
                    <Ico.Sparkle s={14} /><span>Mettre à jour mon profil</span>
                  </span>
                </div>
                <div className="ce-email-meta">
                  <div><Ico.Clock s={12} /> {expiry === 'inf' ? 'Lien sans expiration' : `Lien valable ${expiry === '1' ? '24 heures' : `${expiry} jours`}`}</div>
                  <div><Ico.Lock s={12} /> {reusable ? 'Réutilisable — lié à votre profil' : 'Usage unique, lié à votre profil'}</div>
                </div>
                <p className="ce-email-fp">Si vous n&apos;êtes pas à l&apos;origine de cette demande, ignorez simplement ce message.</p>
              </div>
            </div>
            <GradButton full size="lg" icon={<Ico.Send s={14} />} onClick={handleSend} disabled={sending || !selected}>
              {sending ? 'Envoi en cours…' : `Envoyer à ${selected?.nom.split(' ')[0] ?? '—'}`}
            </GradButton>
            <p className="ce-help"><Ico.Info s={12} /> Vous pourrez révoquer ou renvoyer ce lien à tout moment.</p>
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
      .select('id, nom, company, categorie, created_at')
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
