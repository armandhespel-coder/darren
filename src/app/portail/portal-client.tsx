'use client';

import { useState, useEffect } from 'react';
import './portal.css';

// ─── Stock images (Unsplash placeholders) ───────────────────────────
const STOCK_IMAGES = [
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80',
  'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800&q=80',
  'https://images.unsplash.com/photo-1483000805330-4eaf0a0d82da?w=800&q=80',
];

// ─── Icons ──────────────────────────────────────────────────────────
const Ico = {
  Star: ({ s = 14 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 2l2.09 6.26L20 9.27l-5 4.87L16.18 22 12 18.77 7.82 22 9 14.14 4 9.27l5.91-.91L12 2z"/></svg>,
  Mail: ({ s = 16 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></svg>,
  Copy: ({ s = 14 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>,
  Link: ({ s = 14 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>,
  Check: ({ s = 16 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden><polyline points="20 6 9 17 4 12"/></svg>,
  X: ({ s = 14 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden><path d="M18 6L6 18M6 6l12 12"/></svg>,
  Plus: ({ s = 16 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden><path d="M12 5v14M5 12h14"/></svg>,
  ArrowRight: ({ s = 14 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14M12 5l7 7-7 7"/></svg>,
  ArrowLeft: ({ s = 14 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M19 12H5M12 19l-7-7 7-7"/></svg>,
  Image: ({ s = 16 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>,
  Calendar: ({ s = 16 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  User: ({ s = 16 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Upload: ({ s = 24 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  Trash: ({ s = 14 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>,
  Drag: ({ s = 14 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" aria-hidden><circle cx="9" cy="5" r="1.5"/><circle cx="15" cy="5" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="19" r="1.5"/><circle cx="15" cy="19" r="1.5"/></svg>,
  Shield: ({ s = 14 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Clock: ({ s = 14 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Eye: ({ s = 14 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>,
  Sparkle: ({ s = 14 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5z"/><path d="M19 14l.9 2.6 2.6.9-2.6.9L19 21l-.9-2.6-2.6-.9 2.6-.9z" opacity="0.6"/></svg>,
  Lock: ({ s = 14 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
  Send: ({ s = 14 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  Chev: ({ s = 14, dir = 'down' }: { s?: number; dir?: string }) => {
    const rot: Record<string, number> = { down: 0, up: 180, left: 90, right: -90 };
    return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{ transform: `rotate(${rot[dir]}deg)` }} aria-hidden><polyline points="6 9 12 15 18 9"/></svg>;
  },
  Info: ({ s = 14 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
  Logout: ({ s = 14 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Euro: ({ s = 14 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M18 7a6 6 0 100 10M3 10h9M3 14h9"/></svg>,
};

// ─── Mock data ───────────────────────────────────────────────────────
interface Presta {
  id: string; nom: string; company: string; categorie: string; email: string;
  telephone: string; prix: number; price_note: string; tags: string[];
  description: string; is_available: boolean; is_published: boolean; images: string[];
}

const MOCK_PRESTA: Presta = {
  id: 'p_marie_dj',
  nom: 'Marie Dupont',
  company: 'Marie Sound — DJ Événementielle',
  categorie: 'DJ',
  email: 'marie.dupont@gmail.com',
  telephone: '+32 487 12 34 56',
  prix: 850,
  price_note: '/ soirée',
  tags: ['Mariage', 'Vinyl', 'House', 'Latino'],
  description: "DJ depuis 12 ans, spécialisée dans les mariages et événements privés en Belgique. Grande collection vinyle et sets personnalisés selon votre ambiance.",
  is_available: true,
  is_published: true,
  images: STOCK_IMAGES.slice(0, 4),
};

interface PrestaRow {
  id: string; nom: string; company: string; categorie: string; email: string;
  last_login: string; status: 'active' | 'stale' | 'pending';
}

const PRESTA_LIST: PrestaRow[] = [
  { id: 'p_marie_dj', nom: 'Marie Dupont', company: 'Marie Sound', categorie: 'DJ', email: 'marie.dupont@gmail.com', last_login: 'il y a 3 jours', status: 'active' },
  { id: 'p_antoine_photo', nom: 'Antoine Leclerc', company: 'Studio Leclerc', categorie: 'Photo & Caméra', email: 'a.leclerc@studio.be', last_login: 'il y a 2 semaines', status: 'stale' },
  { id: 'p_sofia_deco', nom: 'Sofia Martens', company: 'Atelier Fleur & Vent', categorie: 'Décoratrice', email: 'sofia@atelier-fv.be', last_login: 'il y a 1 mois', status: 'stale' },
  { id: 'p_laurent_feux', nom: 'Laurent Verbeek', company: 'Pyro Belgique', categorie: "Feux d'artifice", email: 'laurent@pyrobe.com', last_login: 'Jamais connecté', status: 'pending' },
  { id: 'p_karima_traiteur', nom: 'Karima Belkacem', company: 'Saveurs du Sud', categorie: 'Traiteur', email: 'contact@saveurs-sud.be', last_login: 'il y a 5 jours', status: 'active' },
];

const DEFAULT_TAGS = ['Mariage', 'Anniversaire', 'Corporate', 'Vinyl', 'House', 'Techno', 'Latino', 'Hip-Hop', 'Soirée étudiante', 'Cocktail', 'Brunch', 'Retro', 'Club'];

const FLOW = [
  { id: 'admin', lbl: 'Admin' },
  { id: 'sent', lbl: 'Envoi' },
  { id: 'inbox', lbl: 'Email' },
  { id: 'welcome', lbl: 'Accueil' },
  { id: 'portal', lbl: 'Portail' },
  { id: 'done', lbl: 'Publié' },
];

// ─── Shared components ───────────────────────────────────────────────
function Logo({ white = false, compact = false }: { white?: boolean; compact?: boolean }) {
  return (
    <div className={`ce-logo${white ? ' white' : ''}`}>
      <div className="ce-logo-mark" aria-hidden><span>CE</span></div>
      {!compact && <span className="ce-logo-text">Connect Event</span>}
    </div>
  );
}

function GradButton({ children, onClick, size = 'md', full = false, icon, style, type = 'button', disabled }: {
  children: React.ReactNode; onClick?: () => void; size?: string; full?: boolean;
  icon?: React.ReactNode; style?: React.CSSProperties; type?: 'button' | 'submit'; disabled?: boolean;
}) {
  const h = size === 'lg' ? 56 : size === 'sm' ? 40 : 48;
  return (
    <button type={type} disabled={disabled} onClick={onClick} className="ce-grad-btn"
      style={{ height: h, width: full ? '100%' : undefined, ...style }}>
      {icon}<span>{children}</span>
    </button>
  );
}

function GhostButton({ children, onClick, size = 'md', icon, style, full }: {
  children: React.ReactNode; onClick?: () => void; size?: string;
  icon?: React.ReactNode; style?: React.CSSProperties; full?: boolean;
}) {
  const h = size === 'lg' ? 56 : size === 'sm' ? 40 : 48;
  return (
    <button onClick={onClick} className="ce-ghost-btn" style={{ height: h, width: full ? '100%' : undefined, ...style }}>
      {icon}<span>{children}</span>
    </button>
  );
}

// ─── Flow bar ────────────────────────────────────────────────────────
function FlowBar({ current, goTo }: { current: string; goTo: (id: string) => void }) {
  const idx = FLOW.findIndex(f => f.id === current);
  return (
    <div className="ce-flowbar">
      <div className="ce-flowbar-label">Flux</div>
      {FLOW.map((f, i) => (
        <span key={f.id} style={{ display: 'contents' }}>
          <button className={`ce-flowbar-step${i === idx ? ' is-current' : ''}${i < idx ? ' is-done' : ''}`}
            onClick={() => goTo(f.id)}>
            <span className="ce-flowbar-num">{i + 1}</span>
            <span>{f.lbl}</span>
          </button>
          {i < FLOW.length - 1 && <span className="ce-flowbar-sep" />}
        </span>
      ))}
    </div>
  );
}

// ─── Step 1: Admin ───────────────────────────────────────────────────
function TagManager({ tags, setTags }: { tags: string[]; setTags: (t: string[]) => void }) {
  const [draft, setDraft] = useState('');
  const add = () => {
    const v = draft.trim();
    if (!v) return;
    if (tags.some(t => t.toLowerCase() === v.toLowerCase())) { setDraft(''); return; }
    setTags([...tags, v]);
    setDraft('');
  };
  const remove = (t: string) => setTags(tags.filter(x => x !== t));
  return (
    <div className="ce-tag-mgr">
      <div className="ce-tag-mgr-cloud">
        {tags.map(t => (
          <span key={t} className="ce-tag-mgr-chip">
            {t}
            <button onClick={() => remove(t)} aria-label={`Supprimer ${t}`}><Ico.X s={11} /></button>
          </span>
        ))}
        {tags.length === 0 && <span className="ce-tag-mgr-empty">Aucun tag — ajoutez-en ci-dessous.</span>}
      </div>
      <div className="ce-tag-mgr-input">
        <input value={draft} onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          placeholder="Ajouter un tag (ex. Karaoké, Jazz, Wedding planner…)" />
        <button className="ce-tag-mgr-add" onClick={add} disabled={!draft.trim()}>
          <Ico.Plus s={13} /> Ajouter
        </button>
      </div>
      <div className="ce-tag-mgr-foot">
        <Ico.Info s={11} /> {tags.length} tag{tags.length > 1 ? 's' : ''} disponibles · appuyez sur Entrée pour ajouter
      </div>
    </div>
  );
}

interface AdminPayload { presta: PrestaRow; expiry: string; scope: Record<string, boolean>; note: string; reusable: boolean; }

function AdminPanel({ onSent, goTo }: {
  onSent: (p: AdminPayload) => void; goTo: (id: string) => void;
}) {
  const [selected, setSelected] = useState<PrestaRow>(PRESTA_LIST[2]);
  const [expiry, setExpiry] = useState('7');
  const [reusable, setReusable] = useState(false);
  const [scope, setScope] = useState<Record<string, boolean>>({ photos: true, availability: true, profile: true });
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = () => {
    setSending(true);
    setTimeout(() => { setSending(false); onSent({ presta: selected, expiry, scope, note, reusable }); }, 700);
  };

  return (
    <div className="ce-admin-wrap">
      <header className="ce-admin-top">
        <Logo />
        <div className="ce-admin-top-right">
          <span className="ce-pill-tag"><Ico.Shield s={12} /> Admin</span>
          <div className="ce-avatar-sm" aria-hidden>D</div>
        </div>
      </header>
      <main className="ce-admin-main">
        <div className="ce-admin-hd">
          <div>
            <div className="ce-breadcrumb">Admin · Prestataires · <strong>Envoyer un lien d&apos;édition</strong></div>
            <h1 className="ce-h1">Lien d&apos;auto-édition</h1>
            <p className="ce-sub">Générez un lien sécurisé que le prestataire utilisera pour mettre à jour ses photos, disponibilités et informations — sans compte à créer.</p>
          </div>
          <button className="ce-ghost-btn" style={{ height: 40 }} onClick={() => goTo('flow_intro')}>
            <Ico.Eye s={14} /><span>Aperçu du flux complet</span>
          </button>
        </div>
        <div className="ce-admin-grid">
          <section className="ce-card">
            <h2 className="ce-card-title">1. Destinataire</h2>
            <label className="ce-lbl">Prestataire</label>
            <div className="ce-presta-list" role="listbox">
              {PRESTA_LIST.map(p => (
                <button key={p.id} role="option" aria-selected={p.id === selected.id} onClick={() => setSelected(p)}
                  className={`ce-presta-row${p.id === selected.id ? ' is-active' : ''}`}>
                  <div className="ce-avatar" aria-hidden>{p.nom.split(' ').map(n => n[0]).join('')}</div>
                  <div className="ce-presta-meta">
                    <div className="ce-presta-nom">{p.nom}<span className="ce-presta-cat"> · {p.categorie}</span></div>
                    <div className="ce-presta-email">{p.email}</div>
                  </div>
                  <div className="ce-presta-status" data-status={p.status}>
                    {p.status === 'active' && <span>● Actif</span>}
                    {p.status === 'stale' && <span>● Inactif · {p.last_login}</span>}
                    {p.status === 'pending' && <span>● En attente</span>}
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
                  {['1', '7', '30', 'inf'].map(d => (
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
              placeholder="Bonjour Sofia, pourrais-tu rafraîchir tes photos et confirmer tes dispos pour juin ? Merci !" />
          </section>

          <aside className="ce-card ce-preview">
            <div className="ce-preview-hd">
              <h2 className="ce-card-title" style={{ margin: 0 }}>Aperçu de l&apos;email</h2>
              <span className="ce-chip"><Ico.Eye s={11} /> Temps réel</span>
            </div>
            <div className="ce-email">
              <div className="ce-email-top">
                <div className="ce-email-field"><span>De</span><strong>Connect Event &lt;no-reply@connectevent.be&gt;</strong></div>
                <div className="ce-email-field"><span>À</span><strong>{selected.email}</strong></div>
                <div className="ce-email-field"><span>Objet</span><strong>Mettez à jour votre profil Connect Event</strong></div>
              </div>
              <div className="ce-email-body">
                <div className="ce-email-logo"><Logo /></div>
                <h3 className="ce-email-h">Bonjour {selected.nom.split(' ')[0]},</h3>
                <p className="ce-email-p">Nous avons créé un lien sécurisé pour que vous puissiez mettre à jour votre profil prestataire — photos, disponibilités et informations. Aucun compte à créer, aucun mot de passe à retenir.</p>
                {note && <div className="ce-email-note">« {note} »<span>— Darren, Connect Event</span></div>}
                <div className="ce-email-cta">
                  <span className="ce-grad-btn" style={{ pointerEvents: 'none', height: 48, padding: '0 26px' }}>
                    <Ico.Sparkle s={14} /><span>Mettre à jour mon profil</span>
                  </span>
                </div>
                <div className="ce-email-meta">
                  <div><Ico.Clock s={12} /> {expiry === 'inf' ? 'Lien sans expiration' : `Lien valable ${expiry === '1' ? '24 heures' : `${expiry} jours`}`}</div>
                  <div><Ico.Lock s={12} /> {reusable ? 'Réutilisable — lié à votre email' : 'Usage unique, lié à votre email'}</div>
                </div>
                <p className="ce-email-fp">Si vous n&apos;êtes pas à l&apos;origine de cette demande, ignorez simplement ce message.</p>
              </div>
            </div>
            <GradButton full size="lg" icon={<Ico.Send s={14} />} onClick={handleSend} disabled={sending}>
              {sending ? 'Envoi en cours…' : `Envoyer à ${selected.nom.split(' ')[0]}`}
            </GradButton>
            <p className="ce-help"><Ico.Info s={12} /> Vous pourrez révoquer ou renvoyer ce lien à tout moment.</p>
          </aside>
        </div>
      </main>
    </div>
  );
}

// ─── Step 2: Link Sent ───────────────────────────────────────────────
function LinkSentView({ payload, goTo }: { payload: AdminPayload | null; goTo: (id: string) => void }) {
  const link = `https://connectevent.be/p/edit/mZQ8kX3Lp2tR-${payload?.presta.id.slice(-4) || 'v9fB'}`;
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };
  return (
    <div className="ce-sent-wrap">
      <div className="ce-sent-bg" aria-hidden>
        <div className="ce-blob ce-blob-1" /><div className="ce-blob ce-blob-2" /><div className="ce-blob ce-blob-3" />
      </div>
      <div className="ce-sent-card">
        <div className="ce-sent-icon"><Ico.Check s={36} /></div>
        <h1 className="ce-sent-h">Lien envoyé à {payload?.presta.nom.split(' ')[0] || 'Marie'}</h1>
        <p className="ce-sent-p">L&apos;email vient de partir. Vous pouvez aussi partager ce lien directement par WhatsApp ou autre :</p>
        <div className="ce-link-box">
          <Ico.Link s={14} /><code>{link}</code>
          <button className="ce-link-copy" onClick={copy}>
            {copied ? <><Ico.Check s={13} /> Copié</> : <><Ico.Copy s={13} /> Copier</>}
          </button>
        </div>
        <div className="ce-sent-actions">
          <GhostButton icon={<Ico.ArrowLeft s={13} />} onClick={() => goTo('admin')}>Retour admin</GhostButton>
          <GradButton icon={<Ico.Mail s={14} />} onClick={() => goTo('inbox')}>Voir l&apos;email reçu →</GradButton>
        </div>
      </div>
    </div>
  );
}

// ─── Step 3: Inbox ───────────────────────────────────────────────────
function InboxView({ payload, goTo }: { payload: AdminPayload | null; goTo: (id: string) => void }) {
  const name = payload?.presta.nom.split(' ')[0] || 'Marie';
  const expiry = payload?.expiry || '7';
  return (
    <div className="ce-inbox-wrap">
      <div className="ce-inbox-chrome">
        <div className="ce-inbox-dots"><span/><span/><span/></div>
        <div className="ce-inbox-addr">boîte de réception · {payload?.presta.email || 'marie.dupont@gmail.com'}</div>
      </div>
      <div className="ce-inbox-stage">
        <div className="ce-email-card">
          <div className="ce-ec-head">
            <div className="ce-ec-avatar"><span>CE</span></div>
            <div>
              <div className="ce-ec-from">Connect Event</div>
              <div className="ce-ec-to">à {payload?.presta.email || 'marie.dupont@gmail.com'}</div>
            </div>
            <div className="ce-ec-time">maintenant</div>
          </div>
          <h2 className="ce-ec-subject">Mettez à jour votre profil Connect Event</h2>
          <div className="ce-ec-body">
            <p>Bonjour {name},</p>
            <p>Nous avons créé un lien sécurisé pour que vous puissiez mettre à jour votre profil prestataire — photos, disponibilités et informations. Aucun compte à créer, aucun mot de passe à retenir.</p>
            {payload?.note && <div className="ce-email-note">« {payload.note} »<span>— Darren, Connect Event</span></div>}
            <div className="ce-ec-cta-wrap">
              <button className="ce-grad-btn" style={{ height: 52, padding: '0 32px' }} onClick={() => goTo('welcome')}>
                <Ico.Sparkle s={14} /><span>Mettre à jour mon profil</span>
              </button>
              <div className="ce-ec-meta">
                <span><Ico.Clock s={11} /> {expiry === 'inf' ? 'Sans expiration' : `Valable ${expiry === '1' ? '24 h' : `${expiry} j`}`}</span>
                <span><Ico.Lock s={11} /> {payload?.reusable ? 'Réutilisable' : 'Usage unique'}</span>
              </div>
            </div>
            <p className="ce-ec-fp">Si vous n&apos;êtes pas à l&apos;origine de cette demande, ignorez simplement ce message.<br/>— L&apos;équipe Connect Event</p>
          </div>
        </div>
        <button className="ce-inbox-back" onClick={() => goTo('admin')}><Ico.ArrowLeft s={13} /><span>Retour admin</span></button>
      </div>
    </div>
  );
}

// ─── Step 4: Welcome ─────────────────────────────────────────────────
function WelcomeView({ payload, goTo }: { payload: AdminPayload | null; goTo: (id: string) => void }) {
  const name = payload?.presta.nom.split(' ')[0] || 'Marie';
  const expiry = payload?.expiry || '7';
  const [step, setStep] = useState<'verifying' | 'ready'>('verifying');
  useEffect(() => { const t = setTimeout(() => setStep('ready'), 1400); return () => clearTimeout(t); }, []);
  return (
    <div className="ce-welcome-wrap">
      <div className="ce-welcome-bg" aria-hidden><div className="ce-blob ce-blob-1" /><div className="ce-blob ce-blob-2" /></div>
      <div className="ce-welcome-card">
        <Logo white />
        {step === 'verifying' ? (
          <>
            <div className="ce-verify-spin" />
            <h1 className="ce-welcome-h">Vérification du lien…</h1>
            <p className="ce-welcome-p">Nous validons la signature sécurisée de votre invitation.</p>
          </>
        ) : (
          <>
            <div className="ce-welcome-icon"><Ico.Sparkle s={32} /></div>
            <h1 className="ce-welcome-h">Bienvenue, {name}.</h1>
            <p className="ce-welcome-p">Vous êtes connectée à votre espace prestataire. Ce qui vous attend :</p>
            <ul className="ce-welcome-list">
              <li><span><Ico.Image s={14} /></span> Gérer vos photos — glisser / réordonner / remplacer</li>
              <li><span><Ico.Calendar s={14} /></span> Marquer vos disponibilités pour les mois à venir</li>
              <li><span><Ico.User s={14} /></span> Mettre à jour description, tags et prix</li>
            </ul>
            <div className="ce-welcome-meta">
              <span><Ico.Lock s={12} /> Lien privé, signé · {expiry === 'inf' ? 'sans expiration' : `expire dans ${expiry} j`}</span>
              {payload?.reusable && <span><Ico.Sparkle s={12} /> réutilisable</span>}
            </div>
            <GradButton size="lg" icon={<Ico.ArrowRight s={14} />} onClick={() => goTo('portal')} style={{ marginTop: 20 }}>
              Entrer dans mon espace
            </GradButton>
            <button className="ce-welcome-link" onClick={() => goTo('inbox')}>Ce n&apos;est pas moi — revenir à l&apos;email</button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Step 5: Portal ──────────────────────────────────────────────────
function CompletionBar({ presta }: { presta: Presta }) {
  const checks = [
    { lbl: 'Photos (min. 3)', done: presta.images.length >= 3 },
    { lbl: 'Description', done: !!presta.description && presta.description.length > 30 },
    { lbl: 'Prix', done: presta.prix > 0 },
    { lbl: 'Tags (min. 2)', done: presta.tags.length >= 2 },
    { lbl: 'Disponibilités', done: presta.is_available !== undefined },
  ];
  const done = checks.filter(c => c.done).length;
  const pct = Math.round((done / checks.length) * 100);
  return (
    <div className="ce-completion">
      <div className="ce-completion-hd">
        <div>
          <div className="ce-completion-lbl">Profil complété à {pct}%</div>
          <div className="ce-completion-sub">{done === checks.length ? 'Parfait — prêt à être publié ✨' : `Encore ${checks.length - done} étape${checks.length - done > 1 ? 's' : ''} pour un profil optimal`}</div>
        </div>
        <div className="ce-completion-pct">{pct}%</div>
      </div>
      <div className="ce-completion-bar"><div className="ce-completion-fill" style={{ width: `${pct}%` }} /></div>
      <div className="ce-completion-list">
        {checks.map(c => (
          <span key={c.lbl} className={c.done ? 'is-done' : ''}>
            <span className="ce-check-dot">{c.done ? <Ico.Check s={10} /> : ''}</span>
            {c.lbl}
          </span>
        ))}
      </div>
    </div>
  );
}

function PhotosTab({ presta, patch }: { presta: Presta; patch: (k: string, v: unknown) => void }) {
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);

  const addPhoto = () => {
    setUploading(true);
    setTimeout(() => {
      const remaining = STOCK_IMAGES.filter(s => !presta.images.includes(s));
      if (remaining.length) patch('images', [...presta.images, remaining[0]]);
      setUploading(false);
    }, 900);
  };
  const remove = (i: number) => patch('images', presta.images.filter((_, idx) => idx !== i));
  const move = (from: number, to: number) => {
    if (from === to) return;
    const next = [...presta.images];
    const [m] = next.splice(from, 1);
    next.splice(to, 0, m);
    patch('images', next);
  };
  return (
    <section className="ce-tab">
      <header className="ce-tab-hd">
        <div>
          <h2 className="ce-h2">Galerie de votre profil</h2>
          <p className="ce-tab-sub">La première photo sera votre photo de couverture. Glissez pour réordonner.</p>
        </div>
        <div className="ce-tab-hd-meta"><span className="ce-chip"><Ico.Image s={12} /> {presta.images.length}/8 photos</span></div>
      </header>
      <div className="ce-photo-grid">
        {presta.images.map((src, i) => (
          <div key={src + i}
            className={`ce-photo${dragIdx === i ? ' is-drag' : ''}${overIdx === i && dragIdx !== null && dragIdx !== i ? ' is-over' : ''}`}
            draggable
            onDragStart={() => setDragIdx(i)}
            onDragOver={e => { e.preventDefault(); setOverIdx(i); }}
            onDragLeave={() => setOverIdx(null)}
            onDrop={() => { move(dragIdx!, i); setDragIdx(null); setOverIdx(null); }}
            onDragEnd={() => { setDragIdx(null); setOverIdx(null); }}>
            <img src={src} alt="" />
            {i === 0 && <span className="ce-photo-cover">Couverture</span>}
            <span className="ce-photo-num">{i + 1}</span>
            <button className="ce-photo-trash" aria-label="Supprimer" onClick={() => remove(i)}><Ico.Trash s={13} /></button>
            <span className="ce-photo-grip" aria-hidden><Ico.Drag s={14} /></span>
          </div>
        ))}
        {presta.images.length < 8 && (
          <button className={`ce-photo-add${uploading ? ' is-uploading' : ''}`} onClick={addPhoto} disabled={uploading}>
            {uploading ? (<><div className="ce-upload-spin" /><span>Upload…</span></>) : (
              <><div className="ce-photo-add-ico"><Ico.Upload s={22} /></div>
              <span className="ce-photo-add-lbl">Ajouter une photo</span>
              <span className="ce-photo-add-sub">JPG, PNG · 10 MB max</span></>
            )}
          </button>
        )}
      </div>
      {presta.images.length === 0 && (
        <div className="ce-empty">
          <div className="ce-empty-ico"><Ico.Image s={28} /></div>
          <h3>Aucune photo pour l&apos;instant</h3>
          <p>Ajoutez au moins 3 photos pour que votre profil soit publié. Préférez la lumière naturelle, des plans larges et quelques gros plans.</p>
        </div>
      )}
    </section>
  );
}

function DispoTab({ presta, patch }: { presta: Presta; patch: (k: string, v: unknown) => void }) {
  const [monthOffset, setMonthOffset] = useState(0);
  const [busy, setBusy] = useState(new Set(['2026-05-03','2026-05-04','2026-05-17','2026-05-18','2026-05-31','2026-06-14']));
  const [tentative, setTentative] = useState(new Set(['2026-05-22']));
  const today = new Date(2026, 3, 22);
  const base = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const monthName = base.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  const firstDay = (base.getDay() + 6) % 7;
  const daysInMonth = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();

  const toggle = (dateStr: string) => {
    setBusy(prev => {
      const next = new Set(prev);
      if (next.has(dateStr)) {
        next.delete(dateStr);
        setTentative(t => { const n = new Set(t); n.add(dateStr); return n; });
      } else if (tentative.has(dateStr)) {
        setTentative(t => { const n = new Set(t); n.delete(dateStr); return n; });
      } else { next.add(dateStr); }
      return next;
    });
  };

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <section className="ce-tab">
      <header className="ce-tab-hd">
        <div>
          <h2 className="ce-h2">Vos disponibilités</h2>
          <p className="ce-tab-sub">Cliquez une date pour basculer son statut : <strong>Libre</strong> → <strong>Pris</strong> → <strong>À confirmer</strong> → Libre.</p>
        </div>
      </header>
      <div className="ce-dispo-legend-v2" role="list">
        <div className="ce-leg-card ce-leg-ok" role="listitem">
          <div className="ce-leg-swatch"><span>15</span></div>
          <div className="ce-leg-txt"><strong>Libre</strong><span>Visible pour les clients — ils peuvent vous réserver</span></div>
        </div>
        <div className="ce-leg-card ce-leg-busy" role="listitem">
          <div className="ce-leg-swatch"><span>15</span></div>
          <div className="ce-leg-txt"><strong>Pris</strong><span>Affiché « indisponible » — personne ne peut réserver</span></div>
        </div>
        <div className="ce-leg-card ce-leg-tent" role="listitem">
          <div className="ce-leg-swatch"><span>15</span></div>
          <div className="ce-leg-txt"><strong>À confirmer</strong><span>Option en attente — le client est prévenu du délai</span></div>
        </div>
      </div>
      <div className="ce-dispo-status">
        <div className="ce-dispo-sw">
          <strong>Je prends des réservations en ce moment</strong>
          <p>Si vous désactivez ce statut, votre profil affichera « Indisponible » à tous les visiteurs.</p>
        </div>
        <button className={`ce-switch${presta.is_available ? ' is-on' : ''}`}
          onClick={() => patch('is_available', !presta.is_available)} aria-pressed={presta.is_available}>
          <span className="ce-switch-thumb" />
        </button>
      </div>
      <div className="ce-cal">
        <div className="ce-cal-hd">
          <button className="ce-cal-nav" onClick={() => setMonthOffset(o => o - 1)} aria-label="Mois précédent"><Ico.Chev dir="left" s={14} /></button>
          <div className="ce-cal-title">{monthName}</div>
          <button className="ce-cal-nav" onClick={() => setMonthOffset(o => o + 1)} aria-label="Mois suivant"><Ico.Chev dir="right" s={14} /></button>
        </div>
        <div className="ce-cal-grid">
          {['L','M','M','J','V','S','D'].map((d, i) => <div key={i} className="ce-cal-dow">{d}</div>)}
          {cells.map((d, i) => {
            if (d === null) return <div key={i} />;
            const dateStr = `${base.getFullYear()}-${String(base.getMonth()+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
            const isBusy = busy.has(dateStr);
            const isTentative = tentative.has(dateStr);
            const isToday = base.getFullYear() === today.getFullYear() && base.getMonth() === today.getMonth() && d === today.getDate();
            const stateLabel = isBusy ? 'Pris' : isTentative ? 'À confirmer' : 'Libre';
            return (
              <button key={i} onClick={() => toggle(dateStr)}
                title={`${d} ${monthName} — ${stateLabel}`} aria-label={`${d} ${monthName}, ${stateLabel}`}
                className={`ce-cal-day${isBusy ? ' is-busy' : ''}${isTentative ? ' is-tent' : ''}${isToday ? ' is-today' : ''}`}>
                <span className="ce-cal-num">{d}</span>
                <span className="ce-cal-lbl">{isBusy ? 'Pris' : isTentative ? 'À confirmer' : isToday ? "Aujourd'hui" : ''}</span>
              </button>
            );
          })}
        </div>
        <div className="ce-cal-summary">
          <span className="ce-cal-sum-pill ce-cal-sum-ok"><i /> {daysInMonth - busy.size - tentative.size} libre{daysInMonth - busy.size - tentative.size > 1 ? 's' : ''}</span>
          <span className="ce-cal-sum-pill ce-cal-sum-busy"><i /> {busy.size} pris{busy.size > 1 ? 'es' : 'e'}</span>
          <span className="ce-cal-sum-pill ce-cal-sum-tent"><i /> {tentative.size} à confirmer</span>
        </div>
      </div>
    </section>
  );
}

function ProfilTab({ presta, patch, availableTags }: { presta: Presta; patch: (k: string, v: unknown) => void; availableTags: string[] }) {
  const tags = availableTags || DEFAULT_TAGS;
  const toggleTag = (t: string) => {
    const has = presta.tags.includes(t);
    patch('tags', has ? presta.tags.filter(x => x !== t) : [...presta.tags, t]);
  };
  return (
    <section className="ce-tab">
      <header className="ce-tab-hd">
        <div>
          <h2 className="ce-h2">Votre profil public</h2>
          <p className="ce-tab-sub">Ces informations seront affichées sur votre fiche. Soyez précise — les clients décident en 20 secondes.</p>
        </div>
      </header>
      <div className="ce-profil-grid">
        <div className="ce-card ce-profil-main">
          <label className="ce-lbl">Nom affiché</label>
          <input className="ce-input" value={presta.nom} onChange={e => patch('nom', e.target.value)} />
          <label className="ce-lbl">Société / alias</label>
          <input className="ce-input" value={presta.company || ''} onChange={e => patch('company', e.target.value)} />
          <label className="ce-lbl">Description <span className="ce-lbl-opt">({(presta.description || '').length}/400)</span></label>
          <textarea className="ce-textarea" rows={5} maxLength={400} value={presta.description || ''}
            onChange={e => patch('description', e.target.value)}
            placeholder="Parlez de votre style, vos références, votre zone d'intervention…" />
          <div className="ce-form-grid">
            <div>
              <label className="ce-lbl">Prix indicatif <span className="ce-lbl-opt">(€)</span></label>
              <div className="ce-input-prefix">
                <Ico.Euro s={14} />
                <input type="number" className="ce-input" value={presta.prix || ''} onChange={e => patch('prix', Number(e.target.value) || 0)} placeholder="850" />
              </div>
            </div>
            <div>
              <label className="ce-lbl">Unité</label>
              <input className="ce-input" value={presta.price_note || ''} onChange={e => patch('price_note', e.target.value)} placeholder="/ soirée" />
            </div>
          </div>
          <label className="ce-lbl" style={{ marginTop: 18 }}>Téléphone <span className="ce-lbl-opt">(visible en premium)</span></label>
          <input className="ce-input" value={presta.telephone || ''} onChange={e => patch('telephone', e.target.value)} />
          <label className="ce-lbl" style={{ marginTop: 18 }}>Tags</label>
          <div className="ce-tag-cloud">
            {tags.map(t => (
              <button key={t} onClick={() => toggleTag(t)} className={`ce-tag${presta.tags.includes(t) ? ' is-on' : ''}`}>
                {presta.tags.includes(t) && <Ico.Check s={11} />}{t}
              </button>
            ))}
          </div>
        </div>
        <aside className="ce-card ce-profil-preview">
          <div className="ce-preview-hd">
            <h3 className="ce-card-title" style={{ margin: 0 }}>Aperçu carte publique</h3>
            <span className="ce-chip"><Ico.Eye s={11} /> Temps réel</span>
          </div>
          <div className="ce-mini-card">
            <div className="ce-mc-img" style={{ backgroundImage: presta.images[0] ? `url(${presta.images[0]})` : 'none' }}>
              {!presta.images[0] && <div className="ce-mc-placeholder"><Ico.Image s={32} /></div>}
              <div className="ce-mc-overlay" />
              <div className="ce-mc-badge">{presta.categorie}</div>
            </div>
            <div className="ce-mc-body">
              <div className="ce-mc-row">
                <div>
                  <div className="ce-mc-nom">{presta.nom || '—'}</div>
                  {presta.company && <div className="ce-mc-comp">{presta.company}</div>}
                </div>
                <div className="ce-mc-prix">{presta.prix || '—'}€</div>
              </div>
              {presta.tags.length > 0 && (
                <div className="ce-mc-tags">
                  {presta.tags.slice(0, 3).map((t, i) => <span key={t} className={i === 0 ? 'is-primary' : ''}>{t}</span>)}
                  {presta.tags.length > 3 && <span className="ce-mc-more">+{presta.tags.length - 3}</span>}
                </div>
              )}
              <p className="ce-mc-desc">{presta.description || 'Votre description s&apos;affichera ici…'}</p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function PublierTab({ presta, patch, save, goTo }: { presta: Presta; patch: (k: string, v: unknown) => void; save: () => void; goTo: (id: string) => void }) {
  const canPublish = presta.images.length >= 3 && (presta.description?.length || 0) > 30 && presta.prix > 0 && presta.tags.length >= 2;
  return (
    <section className="ce-tab">
      <header className="ce-tab-hd">
        <div>
          <h2 className="ce-h2">Publication</h2>
          <p className="ce-tab-sub">Décidez quand votre profil est visible sur Connect Event.</p>
        </div>
      </header>
      <div className="ce-pub-grid">
        <div className="ce-card">
          <div className="ce-dispo-status" style={{ marginTop: 0 }}>
            <div className="ce-dispo-sw">
              <strong>Profil visible publiquement</strong>
              <p>Votre fiche apparaîtra dans la liste des prestataires et les recherches.</p>
            </div>
            <button className={`ce-switch${presta.is_published ? ' is-on' : ''}`}
              onClick={() => patch('is_published', !presta.is_published)} aria-pressed={presta.is_published}>
              <span className="ce-switch-thumb" />
            </button>
          </div>
          <div className="ce-pub-check">
            <h3>Vérifications avant publication</h3>
            {[
              { lbl: 'Au moins 3 photos', ok: presta.images.length >= 3 },
              { lbl: 'Description de 30 caractères ou plus', ok: (presta.description || '').length > 30 },
              { lbl: 'Prix indicatif renseigné', ok: presta.prix > 0 },
              { lbl: 'Au moins 2 tags', ok: presta.tags.length >= 2 },
            ].map(c => (
              <div key={c.lbl} className={`ce-pub-row${c.ok ? ' is-ok' : ''}`}>
                <span className="ce-pub-dot">{c.ok ? <Ico.Check s={11} /> : ''}</span>
                {c.lbl}
              </div>
            ))}
          </div>
          <GradButton full size="lg" icon={<Ico.Check s={14} />} disabled={!canPublish} onClick={() => { save(); goTo('done'); }}>
            {canPublish ? 'Valider et publier les changements' : 'Complétez les étapes pour publier'}
          </GradButton>
        </div>
        <aside className="ce-card ce-pub-aside">
          <div className="ce-pub-ico"><Ico.Shield s={18} /></div>
          <h3>Aucun compte à retenir</h3>
          <p>Vous pouvez revenir sur cette page depuis l&apos;email original. L&apos;administration pourra vous renvoyer un nouveau lien à tout moment — simple et sans mot de passe.</p>
          <div className="ce-pub-mini">
            <div><Ico.Clock s={12} /> Lien expire dans 7 jours</div>
            <div><Ico.Lock s={12} /> Signature HMAC liée à votre email</div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function PortalView({ payload, goTo, initialState, availableTags }: {
  payload: AdminPayload | null; goTo: (id: string) => void;
  initialState: string; availableTags: string[];
}) {
  const [tab, setTab] = useState('photos');
  const [presta, setPresta] = useState<Presta>({ ...MOCK_PRESTA });
  const [toast, setToast] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (initialState === 'empty') setPresta(p => ({ ...p, images: [], description: '', tags: [], prix: 0 }));
  }, [initialState]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2600); };
  const save = () => { setSaving(true); setTimeout(() => { setSaving(false); setDirty(false); showToast('Profil enregistré ✓'); }, 700); };
  const patch = (k: string, v: unknown) => { setPresta(p => ({ ...p, [k]: v })); setDirty(true); };

  return (
    <div className="ce-portal-wrap">
      <header className="ce-portal-top">
        <Logo />
        <div className="ce-portal-top-center">
          <span className="ce-portal-pill"><Ico.User s={12} /> Espace de {presta.nom}</span>
        </div>
        <div className="ce-portal-top-right">
          {dirty && <span className="ce-unsaved">Modifications non enregistrées</span>}
          <button className="ce-ghost-btn" style={{ height: 40 }} onClick={() => goTo('done')}>
            <Ico.Logout s={13} /><span>Quitter</span>
          </button>
          <GradButton size="sm" icon={<Ico.Check s={14} />} onClick={save} disabled={saving || !dirty}>
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </GradButton>
        </div>
      </header>
      <div className="ce-portal-layout">
        <nav className="ce-portal-rail">
          <div className="ce-portal-heading">
            <div className="ce-portal-heading-sub">Bienvenue</div>
            <div className="ce-portal-heading-name">{presta.nom.split(' ')[0]} 👋</div>
          </div>
          <ul className="ce-portal-nav">
            {[
              { k: 'photos', lbl: 'Photos', ico: <Ico.Image s={14} />, badge: `${presta.images.length}/8` },
              { k: 'dispo', lbl: 'Disponibilités', ico: <Ico.Calendar s={14} /> },
              { k: 'profil', lbl: 'Profil', ico: <Ico.User s={14} /> },
              { k: 'publier', lbl: 'Publication', ico: <Ico.Eye s={14} /> },
            ].map(i => (
              <li key={i.k}>
                <button className={tab === i.k ? 'is-active' : ''} onClick={() => setTab(i.k)}>
                  <span className="ce-ico-box">{i.ico}</span>
                  <span>{i.lbl}</span>
                  {i.badge && <span className="ce-nav-badge">{i.badge}</span>}
                </button>
              </li>
            ))}
          </ul>
          <div className="ce-portal-tip">
            <div className="ce-portal-tip-ico"><Ico.Sparkle s={13} /></div>
            <div>
              <strong>Astuce</strong>
              <p>Les profils avec 4+ photos reçoivent 3× plus de demandes.</p>
            </div>
          </div>
        </nav>
        <main className="ce-portal-main">
          <CompletionBar presta={presta} />
          {tab === 'photos' && <PhotosTab presta={presta} patch={patch} />}
          {tab === 'dispo' && <DispoTab presta={presta} patch={patch} />}
          {tab === 'profil' && <ProfilTab presta={presta} patch={patch} availableTags={availableTags} />}
          {tab === 'publier' && <PublierTab presta={presta} patch={patch} save={save} goTo={goTo} />}
        </main>
      </div>
      {toast && <div className="ce-toast"><Ico.Check s={14} /> {toast}</div>}
    </div>
  );
}

// ─── Step 6: Done ────────────────────────────────────────────────────
function DoneView({ goTo }: { goTo: (id: string) => void }) {
  return (
    <div className="ce-sent-wrap">
      <div className="ce-sent-bg" aria-hidden><div className="ce-blob ce-blob-1" /><div className="ce-blob ce-blob-2" /></div>
      <div className="ce-sent-card">
        <div className="ce-sent-icon"><Ico.Check s={36} /></div>
        <h1 className="ce-sent-h">Tout est à jour ✨</h1>
        <p className="ce-sent-p">Vos changements sont en ligne. L&apos;équipe Connect Event vous recontactera si besoin — aucun compte à retenir.</p>
        <div className="ce-sent-actions">
          <GhostButton icon={<Ico.ArrowLeft s={13} />} onClick={() => goTo('admin')}>Voir l&apos;admin</GhostButton>
          <GradButton icon={<Ico.ArrowRight s={14} />} onClick={() => goTo('portal')}>Revenir au portail</GradButton>
        </div>
      </div>
    </div>
  );
}

// ─── FlowIntro ───────────────────────────────────────────────────────
function FlowIntro({ goTo }: { goTo: (id: string) => void }) {
  return (
    <div className="ce-intro-wrap">
      <div className="ce-intro-card">
        <Logo />
        <h1 className="ce-intro-h">Le flux complet — en 6 étapes</h1>
        <p className="ce-intro-p">Démonstration d&apos;un lien d&apos;auto-édition : l&apos;admin l&apos;envoie, le prestataire met à jour son profil, tout le monde est content.</p>
        <ol className="ce-intro-list">
          {FLOW.map((f, i) => (
            <li key={f.id}><span>{i + 1}</span><strong>{f.lbl}</strong></li>
          ))}
        </ol>
        <GradButton size="lg" icon={<Ico.ArrowRight s={14} />} onClick={() => goTo('admin')}>Démarrer par l&apos;admin</GradButton>
      </div>
    </div>
  );
}

// ─── Root ────────────────────────────────────────────────────────────
export default function PortalClient() {
  const [step, setStep] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('ce_step') || 'admin';
    return 'admin';
  });
  const [payload, setPayload] = useState<AdminPayload | null>(null);
  const [profileState] = useState('filled');
  const [availableTags] = useState(DEFAULT_TAGS);

  useEffect(() => { localStorage.setItem('ce_step', step); }, [step]);

  const goTo = (id: string) => setStep(id);
  const onSent = (p: AdminPayload) => { setPayload(p); setStep('sent'); };

  return (
    <div className="ce-root">
      <FlowBar current={step} goTo={goTo} />
      <div className="ce-stage">
        {step === 'admin' && <AdminPanel onSent={onSent} goTo={goTo} />}
        {step === 'sent' && <LinkSentView payload={payload} goTo={goTo} />}
        {step === 'inbox' && <InboxView payload={payload} goTo={goTo} />}
        {step === 'welcome' && <WelcomeView payload={payload} goTo={goTo} />}
        {step === 'portal' && <PortalView payload={payload} goTo={goTo} initialState={profileState} availableTags={availableTags} />}
        {step === 'done' && <DoneView goTo={goTo} />}
        {step === 'flow_intro' && <FlowIntro goTo={goTo} />}
      </div>
    </div>
  );
}
