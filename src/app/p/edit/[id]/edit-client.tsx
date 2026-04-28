'use client';

import { useState, useRef, useEffect } from 'react';
import { Prestataire } from '@/types';
import Navbar from '@/components/Navbar';
import './portal.css';

const DEFAULT_TAGS = ['Mariage', 'Anniversaire', 'Corporate', 'Vinyl', 'House', 'Techno', 'Latino', 'Hip-Hop', 'Soirée étudiante', 'Cocktail', 'Brunch', 'Retro', 'Club'];


const Ico = {
  Check: ({ s = 16 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden><polyline points="20 6 9 17 4 12"/></svg>,
  X: ({ s = 14 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden><path d="M18 6L6 18M6 6l12 12"/></svg>,
  Image: ({ s = 16 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>,
  Calendar: ({ s = 16 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  User: ({ s = 16 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Video: ({ s = 16 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>,
  Upload: ({ s = 24 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  Trash: ({ s = 14 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>,
  Drag: ({ s = 14 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" aria-hidden><circle cx="9" cy="5" r="1.5"/><circle cx="15" cy="5" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="19" r="1.5"/><circle cx="15" cy="19" r="1.5"/></svg>,
  Sparkle: ({ s = 14 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5z"/></svg>,
  Euro: ({ s = 14 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M18 7a6 6 0 100 10M3 10h9M3 14h9"/></svg>,
  Chev: ({ s = 14, dir = 'down' }: { s?: number; dir?: string }) => {
    const rot: Record<string, number> = { down: 0, up: 180, left: 90, right: -90 };
    return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{ transform: `rotate(${rot[dir]}deg)` }} aria-hidden><polyline points="6 9 12 15 18 9"/></svg>;
  },
  Home: ({ s = 14 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
};

interface PrestaState {
  nom: string; company: string; description: string; tags: string[];
  prix: number; price_note: string; telephone: string;
  is_available: boolean; images: string[]; busy_dates: string[];
  video_url: string;
}

function fromDB(p: Prestataire): PrestaState {
  return {
    nom: p.nom,
    company: p.company ?? '',
    description: p.description ?? '',
    tags: p.tags ?? [],
    prix: p.prix,
    price_note: p.price_note ?? '',
    telephone: p.telephone ?? '',
    is_available: p.is_available,
    images: p.images ?? [],
    busy_dates: p.busy_dates ?? [],
    video_url: p.video_url ?? '',
  };
}

function CompletionBar({ s }: { s: PrestaState }) {
  const checks = [
    { lbl: 'Photos (min. 3)', done: s.images.length >= 3 },
    { lbl: 'Description', done: s.description.length > 30 },
    { lbl: 'Prix', done: s.prix > 0 },
    { lbl: 'Tags (min. 2)', done: s.tags.length >= 2 },
  ];
  const done = checks.filter(c => c.done).length;
  const pct = Math.round((done / checks.length) * 100);
  return (
    <div className="ce-completion">
      <div className="ce-completion-hd">
        <div>
          <div className="ce-completion-lbl">Profil complété à {pct}%</div>
          <div className="ce-completion-sub">{done === checks.length ? 'Parfait — prêt à être publié ✨' : `Encore ${checks.length - done} étape${checks.length - done > 1 ? 's' : ''}`}</div>
        </div>
        <div className="ce-completion-pct">{pct}%</div>
      </div>
      <div className="ce-completion-bar"><div className="ce-completion-fill" style={{ width: `${pct}%` }} /></div>
      <div className="ce-completion-list">
        {checks.map(c => (
          <span key={c.lbl} className={c.done ? 'is-done' : ''}>
            <span className="ce-check-dot">{c.done ? <Ico.Check s={10} /> : ''}</span>{c.lbl}
          </span>
        ))}
      </div>
    </div>
  );
}

function PhotosTab({ s, patch, prestataireId }: { s: PrestaState; patch: (k: keyof PrestaState, v: unknown) => void; prestataireId: string }) {
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || s.images.length >= 8) return;
    setUploading(true);
    setUploadError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("prestataire_id", prestataireId);
      const res = await fetch("/api/upload-photo", { method: "POST", body: fd });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? "Upload échoué."); }
      const { url } = await res.json();
      patch('images', [...s.images, url]);
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : "Erreur lors de l'upload.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const remove = (i: number) => patch('images', s.images.filter((_, idx) => idx !== i));
  const move = (from: number, to: number) => {
    if (from === to) return;
    const next = [...s.images];
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
        <div className="ce-tab-hd-meta"><span className="ce-chip"><Ico.Image s={12} /> {s.images.length}/8 photos</span></div>
      </header>
      <input type="file" accept="image/jpeg,image/png,image/webp" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileSelect} />
      <div className="ce-photo-grid">
        {s.images.map((src, i) => (
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
        {s.images.length < 8 && (
          <button className={`ce-photo-add${uploading ? ' is-uploading' : ''}`} onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            {uploading ? (<><div className="ce-upload-spin" /><span>Upload…</span></>) : (
              <><div className="ce-photo-add-ico"><Ico.Upload s={22} /></div>
              <span className="ce-photo-add-lbl">Ajouter une photo</span>
              <span className="ce-photo-add-sub">JPG, PNG, WEBP · 10 MB max</span></>
            )}
          </button>
        )}
      </div>
      {uploadError && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 10, fontWeight: 600 }}>{uploadError}</p>}
      {s.images.length === 0 && (
        <div className="ce-empty">
          <div className="ce-empty-ico"><Ico.Image s={28} /></div>
          <h3>Aucune photo pour l&apos;instant</h3>
          <p>Ajoutez au moins 3 photos pour un profil optimal.</p>
        </div>
      )}
    </section>
  );
}

function DispoTab({ s, patch }: { s: PrestaState; patch: (k: keyof PrestaState, v: unknown) => void }) {
  const [monthOffset, setMonthOffset] = useState(0);
  const today = new Date();
  const base = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const monthName = base.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  const firstDay = (base.getDay() + 6) % 7;
  const daysInMonth = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();

  const busySet = new Set(s.busy_dates);

  const toggle = (dateStr: string) => {
    const next = new Set(busySet);
    next.has(dateStr) ? next.delete(dateStr) : next.add(dateStr);
    patch('busy_dates', [...next]);
  };

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <section className="ce-tab">
      <header className="ce-tab-hd">
        <div>
          <h2 className="ce-h2">Vos disponibilités</h2>
          <p className="ce-tab-sub">Cliquez une date pour la marquer Pris. Les clients verront ce calendrier.</p>
        </div>
      </header>
      <div className="ce-dispo-status">
        <div className="ce-dispo-sw">
          <strong>Je prends des réservations en ce moment</strong>
          <p>Si vous désactivez ce statut, votre profil affichera « Indisponible ».</p>
        </div>
        <button className={`ce-switch${s.is_available ? ' is-on' : ''}`}
          onClick={() => patch('is_available', !s.is_available)} aria-pressed={s.is_available}>
          <span className="ce-switch-thumb" />
        </button>
      </div>
      <div className="ce-cal">
        <div className="ce-cal-hd">
          <button className="ce-cal-nav" onClick={() => setMonthOffset(o => o - 1)}><Ico.Chev dir="left" s={14} /></button>
          <div className="ce-cal-title">{monthName}</div>
          <button className="ce-cal-nav" onClick={() => setMonthOffset(o => o + 1)}><Ico.Chev dir="right" s={14} /></button>
        </div>
        <div className="ce-cal-grid">
          {['L','M','M','J','V','S','D'].map((d, i) => <div key={i} className="ce-cal-dow">{d}</div>)}
          {cells.map((d, i) => {
            if (d === null) return <div key={i} />;
            const dateStr = `${base.getFullYear()}-${String(base.getMonth()+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
            const isBusy = busySet.has(dateStr);
            const isToday = base.getFullYear() === today.getFullYear() && base.getMonth() === today.getMonth() && d === today.getDate();
            return (
              <button key={i} onClick={() => toggle(dateStr)}
                className={`ce-cal-day${isBusy ? ' is-busy' : ''}${isToday ? ' is-today' : ''}`}>
                <span className="ce-cal-num">{d}</span>
                <span className="ce-cal-lbl">{isBusy ? 'Pris' : isToday ? "Auj." : ''}</span>
              </button>
            );
          })}
        </div>
        <div className="ce-cal-summary">
          <span className="ce-cal-sum-pill ce-cal-sum-ok"><i /> {daysInMonth - busySet.size} libre{daysInMonth - busySet.size > 1 ? 's' : ''}</span>
          <span className="ce-cal-sum-pill ce-cal-sum-busy"><i /> {busySet.size} pris</span>
        </div>
      </div>
    </section>
  );
}

function ProfilTab({ s, patch, categorie, availableTags }: { s: PrestaState; patch: (k: keyof PrestaState, v: unknown) => void; categorie: string; availableTags: string[] }) {
  const toggleTag = (t: string) => {
    const has = s.tags.includes(t);
    patch('tags', has ? s.tags.filter(x => x !== t) : [...s.tags, t]);
  };
  return (
    <section className="ce-tab">
      <header className="ce-tab-hd">
        <div>
          <h2 className="ce-h2">Votre profil public</h2>
          <p className="ce-tab-sub">Ces informations seront affichées sur votre fiche.</p>
        </div>
      </header>
      <div className="ce-profil-grid">
        <div className="ce-card ce-profil-main">
          <label className="ce-lbl">Nom affiché</label>
          <input className="ce-input" value={s.nom} onChange={e => patch('nom', e.target.value)} />
          <label className="ce-lbl">Société / alias</label>
          <input className="ce-input" value={s.company} onChange={e => patch('company', e.target.value)} />
          <label className="ce-lbl">Description <span className="ce-lbl-opt">({s.description.length}/400)</span></label>
          <textarea className="ce-textarea" rows={5} maxLength={400} value={s.description}
            onChange={e => patch('description', e.target.value)}
            placeholder="Parlez de votre style, vos références, votre zone d'intervention…" />
          <div className="ce-form-grid">
            <div>
              <label className="ce-lbl">Prix indicatif <span className="ce-lbl-opt">(€)</span></label>
              <div className="ce-input-prefix">
                <Ico.Euro s={14} />
                <input type="number" className="ce-input" value={s.prix || ''} onChange={e => patch('prix', Number(e.target.value) || 0)} placeholder="850" />
              </div>
            </div>
            <div>
              <label className="ce-lbl">Unité</label>
              <input className="ce-input" value={s.price_note} onChange={e => patch('price_note', e.target.value)} placeholder="/ soirée" />
            </div>
          </div>
          <label className="ce-lbl" style={{ marginTop: 18 }}>Téléphone <span className="ce-lbl-opt">(visible en premium)</span></label>
          <input className="ce-input" value={s.telephone} onChange={e => patch('telephone', e.target.value)} />
          <label className="ce-lbl" style={{ marginTop: 18 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Ico.Video s={13} /> Vidéo <span className="ce-lbl-opt">(URL YouTube ou lien direct)</span>
            </span>
          </label>
          <input
            className="ce-input"
            value={s.video_url}
            onChange={e => patch('video_url', e.target.value)}
            placeholder="https://youtube.com/watch?v=… ou https://…/video.mp4"
          />
          <label className="ce-lbl" style={{ marginTop: 18 }}>Tags</label>
          <div className="ce-tag-cloud">
            {availableTags.map(t => (
              <button key={t} onClick={() => toggleTag(t)} className={`ce-tag${s.tags.includes(t) ? ' is-on' : ''}`}>
                {s.tags.includes(t) && <Ico.Check s={11} />}{t}
              </button>
            ))}
          </div>
        </div>
        <aside className="ce-card ce-profil-preview">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontFamily: 'var(--font-raleway)', fontWeight: 900, fontSize: '1rem', color: 'var(--dark)' }}>Aperçu carte</span>
            <span className="ce-chip">Temps réel</span>
          </div>
          <div className="ce-mini-card">
            <div className="ce-mc-img" style={{ backgroundImage: s.images[0] ? `url(${s.images[0]})` : 'none' }}>
              {!s.images[0] && <div className="ce-mc-placeholder"><Ico.Image s={32} /></div>}
              <div className="ce-mc-overlay" />
              <div className="ce-mc-badge">{categorie}</div>
            </div>
            <div className="ce-mc-body">
              <div className="ce-mc-row">
                <div>
                  <div className="ce-mc-nom">{s.nom || '—'}</div>
                  {s.company && <div className="ce-mc-comp">{s.company}</div>}
                </div>
                <div className="ce-mc-prix">{s.prix || '—'}€</div>
              </div>
              {s.tags.length > 0 && (
                <div className="ce-mc-tags">
                  {s.tags.slice(0, 3).map((t, i) => <span key={t} className={i === 0 ? 'is-primary' : ''}>{t}</span>)}
                  {s.tags.length > 3 && <span className="ce-mc-more">+{s.tags.length - 3}</span>}
                </div>
              )}
              <p className="ce-mc-desc">{s.description || "Votre description s'affichera ici…"}</p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function ProAuthCard({ tokenId, prestataireId }: { tokenId: string; prestataireId: string }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const cardStyle: React.CSSProperties = {
    padding: "14px",
    borderRadius: 14,
    background: "linear-gradient(135deg, rgba(74,108,247,0.06), rgba(217,63,181,0.06))",
    border: "1px solid rgba(74,108,247,0.15)",
  };
  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '8px 10px', borderRadius: 8,
    border: '1.5px solid rgba(74,108,247,0.2)', background: 'white',
    fontSize: 12, outline: 'none', boxSizing: 'border-box', color: 'var(--dark)',
    fontFamily: 'inherit',
  };

  if (done) return (
    <div style={cardStyle}>
      <div style={{ fontSize: 12, fontWeight: 800, color: "var(--dark)", marginBottom: 4 }}>📧 Vérifiez votre email</div>
      <p style={{ margin: '0 0 8px', fontSize: 11, color: "var(--muted)", fontWeight: 600, lineHeight: 1.5 }}>
        Confirmez votre adresse pour activer votre accès prestataire. Pensez à vérifier vos spams.
      </p>
      <button type="button" onClick={async () => {
        const { createClient: cc } = await import('@/lib/supabase/client');
        await cc().auth.resend({ type: 'signup', email, options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/p/edit/${prestataireId}&ptoken=${tokenId}` } });
      }} style={{ fontSize: 10, color: 'var(--blue2)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 700 }}>
        Renvoyer l&apos;email
      </button>
    </div>
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    const { createClient } = await import('@/lib/supabase/client');
    const { error: err } = await createClient().auth.signInWithPassword({ email, password });
    if (err) { setError(err.message); setLoading(false); return; }
    await fetch('/api/link-prestataire', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: tokenId }),
    });
    window.location.href = '/pro/dashboard';
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    const { createClient } = await import('@/lib/supabase/client');
    const { error: err } = await createClient().auth.signUp({
      email, password,
      options: {
        data: { role: 'client' },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/p/edit/${prestataireId}&ptoken=${tokenId}`,
      },
    });
    if (err) { setError(err.message); setLoading(false); return; }
    setDone(true); setLoading(false);
  };

  return (
    <div style={cardStyle}>
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: "var(--dark)", marginBottom: 2 }}>🔐 Accès permanent</div>
        <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, lineHeight: 1.5 }}>
          Connectez-vous ou créez un compte pour gérer votre profil à tout moment.
        </div>
      </div>
      <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
        {(['login', 'register'] as const).map(m => (
          <button key={m} type="button" onClick={() => { setMode(m); setError(''); }} style={{
            flex: 1, padding: '6px 4px', borderRadius: 7,
            border: mode === m ? 'none' : '1px solid rgba(74,108,247,0.2)',
            background: mode === m ? 'linear-gradient(135deg, #4A6CF7, #D93FB5)' : 'white',
            color: mode === m ? 'white' : 'var(--muted)',
            fontSize: 11, fontWeight: 700, cursor: 'pointer',
          }}>
            {m === 'login' ? 'Se connecter' : "S'inscrire"}
          </button>
        ))}
      </div>
      <form onSubmit={mode === 'login' ? handleLogin : handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="Email" style={inputStyle} />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} placeholder="Mot de passe (min. 6 carac.)" style={inputStyle} />
        {mode === 'login' && (
          <a href="/auth/forgot-password" style={{ fontSize: 10, color: 'var(--muted)', textAlign: 'right', textDecoration: 'none' }}>
            Mot de passe oublié ?
          </a>
        )}
        {error && <p style={{ fontSize: 11, color: '#e53e3e', margin: 0 }}>{error}</p>}
        <button type="submit" disabled={loading} style={{
          width: '100%', padding: '9px', borderRadius: 9, border: 'none',
          background: 'linear-gradient(135deg, #4A6CF7, #D93FB5)',
          color: 'white', fontSize: 12, fontWeight: 700,
          cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
        }}>
          {loading ? '…' : mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
        </button>
      </form>
    </div>
  );
}

export default function EditClient({ prestataire, tokenId, claimable }: { prestataire: Prestataire; tokenId?: string; claimable?: boolean }) {
  const [tab, setTab] = useState('photos');
  const [state, setState] = useState<PrestaState>(() => fromDB(prestataire));
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [siteTags, setSiteTags] = useState<string[]>(DEFAULT_TAGS);
  const [claimStatus, setClaimStatus] = useState<'loading' | 'needsAuth' | 'claiming' | 'done'>('done');

  useEffect(() => {
    if (!claimable) return;
    setClaimStatus('loading');
    import('@/lib/supabase/client').then(({ createClient }) => {
      createClient().auth.getUser().then(async ({ data }) => {
        if (!data.user) { setClaimStatus('needsAuth'); return; }
        setClaimStatus('claiming');
        await fetch('/api/claim-prestataire', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prestataire_id: prestataire.id }),
        });
        setClaimStatus('done');
      });
    });
  }, [claimable, prestataire.id]);

  useEffect(() => {
    import('@/lib/supabase/client').then(({ createClient }) => {
      createClient().from('site_subcategories').select('name').order('name').then(({ data }) => {
        if (data?.length) setSiteTags(data.map((t: { name: string }) => t.name));
      });
    });
  }, []);

  if (claimable && claimStatus === 'loading') return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F7F8FC' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #4A6CF7', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: '#6B6A87', fontWeight: 600, fontSize: 14 }}>Vérification…</p>
      </div>
    </div>
  );

  if (claimable && claimStatus === 'needsAuth') {
    const next = encodeURIComponent(`/p/edit/${prestataire.id}`);
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #12112A, #1E1C3A)', padding: '24px' }}>
        <div style={{ background: 'white', borderRadius: 24, padding: '48px 40px', maxWidth: 440, width: '100%', textAlign: 'center', boxShadow: '0 30px 80px rgba(74,108,247,0.25)' }}>
          <img src="/logo.png" alt="Connect Event" style={{ height: 80, objectFit: 'contain', marginBottom: 24 }} />
          <h1 style={{ fontWeight: 900, fontSize: 24, color: '#1E1C3A', marginBottom: 8 }}>
            Votre espace prestataire
          </h1>
          <p style={{ color: '#6B6A87', fontSize: 14, lineHeight: 1.6, marginBottom: 32 }}>
            Créez un compte ou connectez-vous pour accéder à votre profil{prestataire.nom ? ` <strong>${prestataire.nom}</strong>` : ''} et commencer à recevoir des clients.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <a href={`/auth/register?next=${next}`}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 52, borderRadius: 14, background: 'linear-gradient(135deg,#4A6CF7,#D93FB5)', color: 'white', fontWeight: 800, fontSize: 15, textDecoration: 'none', letterSpacing: '0.02em' }}>
              ✨ Créer mon compte
            </a>
            <a href={`/auth/login?next=${next}`}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 52, borderRadius: 14, background: '#F7F8FC', color: '#1E1C3A', fontWeight: 700, fontSize: 15, textDecoration: 'none', border: '1.5px solid #E0E0EF' }}>
              🔑 J&apos;ai déjà un compte
            </a>
          </div>
          <p style={{ marginTop: 20, fontSize: 12, color: '#9999B3' }}>
            En vous inscrivant via ce lien, vous devenez automatiquement prestataire sur Connect Event.
          </p>
        </div>
      </div>
    );
  }

  if (claimable && claimStatus === 'claiming') return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F7F8FC' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
        <h2 style={{ fontWeight: 900, fontSize: 22, color: '#1E1C3A', marginBottom: 8 }}>Bienvenue !</h2>
        <p style={{ color: '#6B6A87', fontSize: 14 }}>Activation de votre profil pro en cours…</p>
      </div>
    </div>
  );

  const patch = (k: keyof PrestaState, v: unknown) => {
    setState(p => ({ ...p, [k]: v }));
    setDirty(true);
  };

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2600); };

  const save = async () => {
    setSaving(true);
    const res = await fetch(`/api/prestataires/${prestataire.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nom: state.nom,
        company: state.company || null,
        description: state.description || null,
        tags: state.tags,
        prix: state.prix,
        price_note: state.price_note || null,
        telephone: state.telephone || null,
        is_available: state.is_available,
        images: state.images,
        busy_dates: state.busy_dates,
        video_url: state.video_url || null,
      }),
    });
    setSaving(false);
    if (!res.ok) showToast('Erreur lors de la sauvegarde.');
    else { setDirty(false); showToast('Profil enregistré ✓'); }
  };

  return (
    <div className="ce-root">
      <Navbar />
      <div className="ce-portal-layout" style={{ paddingTop: 96 }}>
        <nav className="ce-portal-rail">
          <div className="ce-portal-heading">
            <div className="ce-portal-heading-sub">Bienvenue</div>
            <div className="ce-portal-heading-name">{state.nom.split(' ')[0]} 👋</div>
          </div>
          <ul className="ce-portal-nav">
            {[
              { k: 'photos', lbl: 'Photos', ico: <Ico.Image s={14} />, badge: `${state.images.length}/8` },
              { k: 'dispo', lbl: 'Disponibilités', ico: <Ico.Calendar s={14} /> },
              { k: 'profil', lbl: 'Profil & Vidéo', ico: <Ico.User s={14} /> },
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
          <div style={{ padding: '12px 0' }}>
            {dirty && <p style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, marginBottom: 8, textAlign: 'center' }}>Modifications non enregistrées</p>}
            <button className="ce-grad-btn" style={{ width: '100%', height: 40 }} onClick={save} disabled={saving || !dirty}>
              <Ico.Check s={14} /><span>{saving ? 'Enregistrement…' : 'Enregistrer'}</span>
            </button>
          </div>
          <div className="ce-portal-tip">
            <div className="ce-portal-tip-ico"><Ico.Sparkle s={13} /></div>
            <div>
              <strong>Astuce</strong>
              <p>Les profils avec 4+ photos reçoivent 3× plus de demandes.</p>
            </div>
          </div>
          {tokenId && <ProAuthCard tokenId={tokenId} prestataireId={prestataire.id} />}
        </nav>

        <main className="ce-portal-main">
          <CompletionBar s={state} />
          {tab === 'photos' && <PhotosTab s={state} patch={patch} prestataireId={prestataire.id} />}
          {tab === 'dispo' && <DispoTab s={state} patch={patch} />}
          {tab === 'profil' && <ProfilTab s={state} patch={patch} categorie={prestataire.categorie} availableTags={siteTags} />}
        </main>
      </div>

      {toast && <div className="ce-toast"><Ico.Check s={14} /> {toast}</div>}
    </div>
  );
}
