"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import PrestaCard from "@/components/PrestaCard";
import PrestaModal from "@/components/PrestaModal";
import SearchBar from "@/components/SearchBar";
import { Prestataire } from "@/types";

// ─── Types & constantes ───────────────────────────────────────────────────────

const DEFAULT_FILTERS = { search: "", continent: "Tous", categorie: "Tous", budget: "Tous" };

const CATEGORY_PILLS = [
  { label: "Tous", icon: "✨" },
  { label: "DJ", icon: "🎧" },
  { label: "Décoratrice", icon: "🌸" },
  { label: "Matériel", icon: "🎪" },
  { label: "Voiture", icon: "🚗" },
  { label: "Traiteur", icon: "🍽️" },
  { label: "Photo & Caméra", icon: "📸" },
  { label: "Feux d'artifice", icon: "🎆" },
  { label: "Location de salle", icon: "🏛️" },
  { label: "Gâteau", icon: "🎂" },
];

function parseBudget(budget: string): [number, number] {
  if (budget === "< 500€") return [0, 500];
  if (budget === "500–1500€") return [500, 1500];
  if (budget === "> 1500€") return [1500, Infinity];
  return [0, Infinity];
}

// ─── Mock data (v1) ───────────────────────────────────────────────────────────

const MOCK_PRESTATAIRES: Prestataire[] = [
  // DJs
  { id:"dj1", owner_id:"mock", nom:"DJ Maxime", company:"SoundWave Events", categorie:"DJ", continent:"Europe", prix:600, note:4.9, reviews:187, tags:["Electro","House","R&B","Afro"], description:"Spécialiste mariages et soirées privées depuis 10 ans. Matériel haut de gamme, éclairage inclus.", images:["https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80"], badge:"Top DJ", price_note:"/ soirée", is_premium:true, is_available:true, telephone:"+33 6 12 34 56 78", created_at:"" },
  { id:"dj2", owner_id:"mock", nom:"DJ Kofi", company:"AfroBeats Studio", categorie:"DJ", continent:"Afrique", prix:450, note:4.8, reviews:143, tags:["Afrobeats","Coupé-décalé","Amapiano"], description:"Spécialiste Afrobeats et musiques africaines. Ambiance garantie pour vos soirées afro.", images:["https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?w=600&q=80"], badge:null, price_note:"/ soirée", is_premium:false, is_available:true, telephone:null, created_at:"" },
  { id:"dj3", owner_id:"mock", nom:"DJ Yuki", company:"Tokyo Vibes", categorie:"DJ", continent:"Asie", prix:520, note:4.7, reviews:98, tags:["J-Pop","EDM","Electro","Fusion"], description:"DJ japonais aux sets innovants. Fusion de J-Pop et EDM international pour une ambiance unique.", images:["https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80"], badge:null, price_note:"/ soirée", is_premium:false, is_available:false, telephone:null, created_at:"" },
  { id:"dj4", owner_id:"mock", nom:"DJ Vadim", company:"Eastern Sound", categorie:"DJ", continent:"Pays de l'Est", prix:480, note:4.8, reviews:76, tags:["Techno","House","Progressive"], description:"Techno et progressive house d'Europe de l'Est. Sets électroniques puissants et immersifs.", images:["https://images.unsplash.com/photo-1504509546545-e000b4a62425?w=600&q=80"], badge:"Nouveauté", price_note:"/ soirée", is_premium:false, is_available:true, telephone:null, created_at:"" },
  // Décorateurs
  { id:"dec1", owner_id:"mock", nom:"Sophie Laurent", company:"Atelier Blanc & Or", categorie:"Décoratrice", continent:"Europe", prix:1200, note:4.9, reviews:215, tags:["Mariage","Floral","Romantique","Luxe"], description:"Créatrice d'ambiances florales d'exception. Spécialiste des mariages haut de gamme.", images:["https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&q=80"], badge:"Top Déco", price_note:"/ événement", is_premium:true, is_available:true, telephone:"+33 6 11 22 33 44", created_at:"" },
  { id:"dec2", owner_id:"mock", nom:"Amara Diallo", company:"Couleurs d'Afrique", categorie:"Décoratrice", continent:"Afrique", prix:800, note:4.7, reviews:134, tags:["Wax","Coloré","Culturel","Tissu"], description:"Décoration événementielle aux couleurs et tissus africains. Ambiance chaleureuse et authentique.", images:["https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&q=80"], badge:null, price_note:"/ événement", is_premium:false, is_available:true, telephone:null, created_at:"" },
  { id:"dec3", owner_id:"mock", nom:"Mei Lin", company:"Blossom Deco", categorie:"Décoratrice", continent:"Asie", prix:900, note:4.8, reviews:89, tags:["Zen","Cerisiers","Origami"], description:"Décoration inspirée de l'art floral asiatique. Cerisiers en fleur, lanternes, ambiance zen et poétique.", images:["https://images.unsplash.com/photo-1510076857177-7470076d4098?w=600&q=80"], badge:null, price_note:"/ événement", is_premium:false, is_available:true, telephone:null, created_at:"" },
  { id:"dec4", owner_id:"mock", nom:"Irina Petrov", company:"Slavic Elegance", categorie:"Décoratrice", continent:"Pays de l'Est", prix:750, note:4.6, reviews:61, tags:["Baroque","Doré","Cristal","Luxe"], description:"Inspirations baroques d'Europe de l'Est. Cristaux, dorures, chandeliers pour un luxe intemporel.", images:["https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&q=80"], badge:null, price_note:"/ événement", is_premium:false, is_available:false, telephone:null, created_at:"" },
  // Matériel
  { id:"mat1", owner_id:"mock", nom:"EventTech Pro", company:"EventTech Solutions", categorie:"Matériel", continent:"Europe", prix:800, note:4.8, reviews:176, tags:["Son","Lumière","Scène","LED"], description:"Location de matériel audiovisuel complet. Sonorisation, jeux de lumières, écrans LED géants.", images:["https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80"], badge:"Top Matériel", price_note:"/ jour", is_premium:true, is_available:true, telephone:"+33 6 55 66 77 88", created_at:"" },
  { id:"mat2", owner_id:"mock", nom:"FestEquip", company:"FestEquip Location", categorie:"Matériel", continent:"Europe", prix:350, note:4.6, reviews:201, tags:["Tente","Chapiteau","Mobilier"], description:"Spécialiste structures événementielles. Chapiteaux, mobilier, bars en location.", images:["https://images.unsplash.com/photo-1478147427282-58a87a433a5f?w=600&q=80"], badge:null, price_note:"/ jour", is_premium:false, is_available:true, telephone:null, created_at:"" },
  // Voiture
  { id:"voi1", owner_id:"mock", nom:"LuxDrive", company:"LuxDrive Premium", categorie:"Voiture", continent:"Europe", prix:450, note:4.9, reviews:312, tags:["Limousine","Mercedes","Chauffeur"], description:"Flotte de véhicules de prestige avec chauffeurs privés. Mercedes Classe S, décoration florale.", images:["https://images.unsplash.com/photo-1563720223185-11003d516935?w=600&q=80"], badge:"Top", price_note:"/ prestation", is_premium:true, is_available:true, telephone:"+33 6 44 55 66 77", created_at:"" },
  { id:"voi2", owner_id:"mock", nom:"ClassicAuto", company:"ClassicAuto Events", categorie:"Voiture", continent:"Europe", prix:380, note:4.8, reviews:156, tags:["Vintage","Rolls-Royce","Retro"], description:"Collection de voitures anciennes et vintage. Rolls-Royce, Jaguar, Citroën DS.", images:["https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80"], badge:null, price_note:"/ prestation", is_premium:false, is_available:true, telephone:null, created_at:"" },
  // Traiteurs
  { id:"tra1", owner_id:"mock", nom:"Chef Marcel", company:"Gastronomie Marcel", categorie:"Traiteur", continent:"Europe", prix:75, note:5.0, reviews:203, tags:["Gastronomique","Étoilé","Sur mesure"], description:"Chef étoilé au service de vos événements privés. Menu dégustation, accord mets-vins inclus.", images:["https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80"], badge:"Chef Étoilé", price_note:"/ personne", is_premium:true, is_available:true, telephone:"+33 6 99 88 77 66", created_at:"" },
  { id:"tra2", owner_id:"mock", nom:"Mama Fatou", company:"Saveurs d'Afrique", categorie:"Traiteur", continent:"Afrique", prix:45, note:4.8, reviews:287, tags:["Africain","Attiéké","Yassa","Buffet"], description:"Cuisine africaine authentique et généreuse. Spécialités ivoiriennes, sénégalaises, camerounaises.", images:["https://images.unsplash.com/photo-1555244162-803834f70033?w=600&q=80"], badge:"Coup de ♥", price_note:"/ personne", is_premium:false, is_available:true, telephone:null, created_at:"" },
  { id:"tra3", owner_id:"mock", nom:"Sakura Cuisine", company:"Nihon Kitchen", categorie:"Traiteur", continent:"Asie", prix:65, note:4.7, reviews:112, tags:["Japonais","Sushi","Bento","Fusion"], description:"Traiteur japonais haut de gamme. Sushis, temakis, cuisine fusion nippo-française.", images:["https://images.unsplash.com/photo-1529543544282-ea669407fca3?w=600&q=80"], badge:null, price_note:"/ personne", is_premium:false, is_available:true, telephone:null, created_at:"" },
  { id:"tra4", owner_id:"mock", nom:"Babushka Catering", company:"Eastern Flavors", categorie:"Traiteur", continent:"Pays de l'Est", prix:50, note:4.6, reviews:88, tags:["Polonais","Piroguis","Bortsch","Festif"], description:"Cuisine d'Europe de l'Est festive et généreuse. Piroguis, bortsch, viandes fumées.", images:["https://images.unsplash.com/photo-1551218808-94e220e084d2?w=600&q=80"], badge:null, price_note:"/ personne", is_premium:false, is_available:false, telephone:null, created_at:"" },
  // Photo & Caméra
  { id:"ph1", owner_id:"mock", nom:"Lucas Martin", company:"Studio Lumière", categorie:"Photo & Caméra", continent:"Europe", prix:1500, note:4.9, reviews:198, tags:["Photo","Vidéo 4K","Drone","Mariage"], description:"Photographe-vidéaste professionnel. Reportage complet, drone, album premium inclus.", images:["https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=600&q=80"], badge:"Top Photo", price_note:"/ événement", is_premium:true, is_available:true, telephone:"+33 6 33 44 55 66", created_at:"" },
  { id:"ph2", owner_id:"mock", nom:"Kwame Asante", company:"AfroLens Studio", categorie:"Photo & Caméra", continent:"Afrique", prix:900, note:4.8, reviews:134, tags:["Photo","Reportage","Culturel"], description:"Photographe spécialisé dans les cérémonies africaines et les événements culturels colorés.", images:["https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80"], badge:null, price_note:"/ événement", is_premium:false, is_available:true, telephone:null, created_at:"" },
  { id:"ph3", owner_id:"mock", nom:"Hiro Tanaka", company:"Tokyo Frame", categorie:"Photo & Caméra", continent:"Asie", prix:1100, note:4.9, reviews:87, tags:["Artistique","Cinématique","Drone"], description:"Photographe-cinéaste au style japonais épuré. Résultats cinématiques et artistiques d'exception.", images:["https://images.unsplash.com/photo-1480365501497-199581be0e66?w=600&q=80"], badge:"Coup de ♥", price_note:"/ événement", is_premium:false, is_available:true, telephone:null, created_at:"" },
  // Feux d'artifice
  { id:"feu1", owner_id:"mock", nom:"PyroShow France", company:"Pyrotechnie Dupuis", categorie:"Feux d'artifice", continent:"Europe", prix:2500, note:5.0, reviews:89, tags:["Feux d'artifice","Show laser","Pyrotechnie"], description:"Spectacles pyrotechniques haut de gamme. Feux d'artifice musicaux, effets laser, nappes de fumée.", images:["https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=600&q=80"], badge:"Spectaculaire", price_note:"/ show", is_premium:true, is_available:true, telephone:"+33 6 77 88 99 00", created_at:"" },
  { id:"feu2", owner_id:"mock", nom:"AfroFire Events", company:"AfroFire", categorie:"Feux d'artifice", continent:"Afrique", prix:1800, note:4.8, reviews:54, tags:["Feux","Cracheurs","Torches"], description:"Spectacles de feu d'inspiration africaine. Danseurs de feu, cracheurs, jongleurs pyrotechniques.", images:["https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&q=80"], badge:null, price_note:"/ show", is_premium:false, is_available:true, telephone:null, created_at:"" },
  { id:"feu3", owner_id:"mock", nom:"Dragon Fire Asia", company:"Asian Pyro Arts", categorie:"Feux d'artifice", continent:"Asie", prix:2200, note:4.9, reviews:67, tags:["Dragons","Lanterne","Tradition"], description:"Art pyrotechnique chinois ancestral. Dragons lumineux, lanternes, tradition festive millénaire.", images:["https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=600&q=80"], badge:"Unique", price_note:"/ show", is_premium:false, is_available:false, telephone:null, created_at:"" },
  // Location de salle
  { id:"sal1", owner_id:"mock", nom:"Château de Lumière", company:"Événements Prestige", categorie:"Location de salle", continent:"Europe", prix:3500, note:4.9, reviews:134, tags:["Château","Jardins","500 pers.","Luxe"], description:"Château XVIIe siècle avec jardins à la française. Salle de réception de 500 personnes, hébergement disponible.", images:["https://images.unsplash.com/photo-1543333995-a78aea2eee50?w=600&q=80"], badge:"Exclusif", price_note:"/ journée", is_premium:true, is_available:true, telephone:"+33 4 56 78 90 12", created_at:"" },
  { id:"sal2", owner_id:"mock", nom:"Villa Afrique", company:"Heritage Events", categorie:"Location de salle", continent:"Afrique", prix:1500, note:4.7, reviews:98, tags:["Villa","Piscine","200 pers.","Plein air"], description:"Villa méditerranéenne avec terrasse et piscine. Cadre exceptionnel pour vos événements en plein air.", images:["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80"], badge:null, price_note:"/ journée", is_premium:false, is_available:true, telephone:null, created_at:"" },
  { id:"sal3", owner_id:"mock", nom:"Sakura Hall", company:"Asian Events Space", categorie:"Location de salle", continent:"Asie", prix:2000, note:4.8, reviews:72, tags:["Zen","Jardin japonais","150 pers."], description:"Salle d'événements inspirée de l'architecture japonaise. Jardin zen, intérieur bois et papier washi.", images:["https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&q=80"], badge:"Dépaysement", price_note:"/ journée", is_premium:false, is_available:true, telephone:null, created_at:"" },
  // Gâteau
  { id:"gat1", owner_id:"mock", nom:"Pâtisserie Artisan", company:"Délices & Création", categorie:"Gâteau", continent:"Europe", prix:800, note:5.0, reviews:287, tags:["Wedding cake","Pièce montée","Sur mesure"], description:"Pâtissier artisan créateur de wedding cakes spectaculaires. Personnalisation totale, dégustation incluse.", images:["https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=600&q=80"], badge:"Top Gâteau", price_note:"/ pièce montée", is_premium:true, is_available:true, telephone:"+33 6 22 33 44 55", created_at:"" },
  { id:"gat2", owner_id:"mock", nom:"Maman Bâ", company:"Saveurs d'Afrique Sucrée", categorie:"Gâteau", continent:"Afrique", prix:400, note:4.8, reviews:167, tags:["Baobab","Mangue","Naturel","Africain"], description:"Pâtissière africaine créative. Gâteaux aux saveurs d'Afrique : baobab, mangue, gingembre.", images:["https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=80"], badge:"Coup de ♥", price_note:"/ gâteau", is_premium:false, is_available:true, telephone:null, created_at:"" },
  { id:"gat3", owner_id:"mock", nom:"Wagashi Dreams", company:"Tokyo Pâtisserie", categorie:"Gâteau", continent:"Asie", prix:600, note:4.9, reviews:134, tags:["Wagashi","Mochi","Matcha","Sakura"], description:"Art pâtissier japonais : wagashi, mochis, entremets matcha. Œuvres d'art comestibles.", images:["https://images.unsplash.com/photo-1562440499-64c9a111f713?w=600&q=80"], badge:"Artistique", price_note:"/ création", is_premium:false, is_available:true, telephone:null, created_at:"" },
];

// ─── Composant "Devenir prestataire" modal ────────────────────────────────────

interface ProForm { nom: string; service: string; email: string; telephone: string; message: string; }
const SERVICES = ["DJ","Décoratrice","Matériel","Voiture","Traiteur","Photo & Caméra","Feux d'artifice","Location de salle","Gâteau","Autre"];

function DevenirPrestaireModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState<ProForm>({ nom: "", service: "", email: "", telephone: "", message: "" });
  const [success, setSuccess] = useState(false);

  const update = (k: keyof ProForm, v: string) => setForm(f => ({ ...f, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nom || !form.email || !form.service) return;
    const subject = encodeURIComponent(`Candidature prestataire — ${form.service} — ${form.nom}`);
    const body = encodeURIComponent(
      `Nom : ${form.nom}\nService : ${form.service}\nEmail : ${form.email}\nTéléphone : ${form.telephone}\n\nMessage :\n${form.message}`
    );
    window.location.href = `mailto:yagan_darren@hotmail.com?subject=${subject}&body=${body}`;
    setSuccess(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(18,17,42,0.7)", backdropFilter: "blur(12px)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full overflow-hidden anim-popin"
        style={{ maxHeight: "92vh", overflowY: "auto", boxShadow: "0 30px 80px rgba(74,108,247,0.25)" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg, var(--dark2), #2A1042)", padding: "28px 32px" }}
          className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-black text-white" style={{ fontFamily: "var(--font-raleway)" }}>
              Rejoindre Connect Event
            </h2>
            <p className="text-white/50 text-sm mt-1">Présentez votre offre et touchez des milliers de clients</p>
          </div>
          <button onClick={onClose}
            className="flex items-center justify-center rounded-full text-white/70 hover:text-white cursor-pointer transition-all"
            style={{ width: 34, height: 34, background: "rgba(255,255,255,0.1)", border: "none", flexShrink: 0 }}>
            ✕
          </button>
        </div>

        {success ? (
          <div className="p-10 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl mx-auto mb-4"
              style={{ background: "var(--grad)", boxShadow: "0 8px 28px rgba(217,63,181,0.4)" }}>
              ✓
            </div>
            <h3 className="text-xl font-black mb-3" style={{ color: "var(--dark)", fontFamily: "var(--font-raleway)" }}>
              Message envoyé !
            </h3>
            <p className="text-sm font-semibold leading-relaxed mb-6" style={{ color: "var(--muted)" }}>
              Notre équipe vous contactera sous 24 à 48h pour finaliser votre inscription.
            </p>
            <button onClick={onClose}
              className="text-white text-sm font-extrabold px-8 py-3 rounded-xl cursor-pointer"
              style={{ background: "var(--grad2)" }}>
              Fermer
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="p-8 flex flex-col gap-4">
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-widest mb-2" style={{ color: "var(--blue2)" }}>
                Nom / Prénom *
              </label>
              <input
                required value={form.nom} onChange={e => update("nom", e.target.value)}
                placeholder="Marie Dupont"
                className="w-full rounded-xl px-4 py-3 text-sm font-semibold outline-none transition-all"
                style={{ background: "var(--bg)", border: "1.5px solid var(--border)", color: "var(--text)" }}
                onFocus={e => (e.target.style.borderColor = "var(--blue2)")}
                onBlur={e => (e.target.style.borderColor = "var(--border)")}
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-widest mb-2" style={{ color: "var(--blue2)" }}>
                Service proposé *
              </label>
              <select
                required value={form.service} onChange={e => update("service", e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-sm font-semibold outline-none cursor-pointer"
                style={{ background: "var(--bg)", border: "1.5px solid var(--border)", color: form.service ? "var(--text)" : "var(--muted)", appearance: "none" }}
              >
                <option value="">Sélectionner une catégorie...</option>
                {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-widest mb-2" style={{ color: "var(--blue2)" }}>
                  Email *
                </label>
                <input
                  required type="email" value={form.email} onChange={e => update("email", e.target.value)}
                  placeholder="votre@email.com"
                  className="w-full rounded-xl px-4 py-3 text-sm font-semibold outline-none transition-all"
                  style={{ background: "var(--bg)", border: "1.5px solid var(--border)", color: "var(--text)" }}
                  onFocus={e => (e.target.style.borderColor = "var(--blue2)")}
                  onBlur={e => (e.target.style.borderColor = "var(--border)")}
                />
              </div>
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-widest mb-2" style={{ color: "var(--blue2)" }}>
                  Téléphone
                </label>
                <input
                  type="tel" value={form.telephone} onChange={e => update("telephone", e.target.value)}
                  placeholder="+33 6 ..."
                  className="w-full rounded-xl px-4 py-3 text-sm font-semibold outline-none transition-all"
                  style={{ background: "var(--bg)", border: "1.5px solid var(--border)", color: "var(--text)" }}
                  onFocus={e => (e.target.style.borderColor = "var(--blue2)")}
                  onBlur={e => (e.target.style.borderColor = "var(--border)")}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-widest mb-2" style={{ color: "var(--blue2)" }}>
                Décrivez votre offre
              </label>
              <textarea
                rows={3} value={form.message} onChange={e => update("message", e.target.value)}
                placeholder="Votre expérience, zone géographique, tarifs, style..."
                className="w-full rounded-xl px-4 py-3 text-sm font-semibold outline-none transition-all resize-none"
                style={{ background: "var(--bg)", border: "1.5px solid var(--border)", color: "var(--text)" }}
                onFocus={e => (e.target.style.borderColor = "var(--blue2)")}
                onBlur={e => (e.target.style.borderColor = "var(--border)")}
              />
            </div>

            <button
              type="submit"
              className="w-full text-white font-extrabold py-4 rounded-xl cursor-pointer transition-all text-sm mt-1"
              style={{ background: "var(--grad)", boxShadow: "0 6px 22px rgba(217,63,181,0.3)", letterSpacing: "0.06em" }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 12px 30px rgba(217,63,181,0.4)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.transform = "";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 22px rgba(217,63,181,0.3)";
              }}
            >
              ✓ Envoyer ma candidature
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function HomePage() {
  const [prestataires, setPrestataires] = useState<Prestataire[]>([]);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Tous");
  const [selectedPresta, setSelectedPresta] = useState<Prestataire | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showPrestaireModal, setShowPrestaireModal] = useState(false);

  // Chargement favoris depuis localStorage
  useEffect(() => {
    const saved = localStorage.getItem("ce_favorites");
    if (saved) setFavorites(new Set(JSON.parse(saved)));
  }, []);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem("ce_favorites", JSON.stringify([...next]));
      return next;
    });
  };

  // Chargement Supabase (fallback mock)
  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("prestataires")
      .select("*")
      .order("is_premium", { ascending: false })
      .then(({ data }) => {
        const result = (data as Prestataire[]) ?? [];
        setPrestataires(result.length > 0 ? result : MOCK_PRESTATAIRES);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    const [min, max] = parseBudget(filters.budget);
    return prestataires.filter((p) => {
      if (showFavoritesOnly && !favorites.has(p.id)) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const haystack = `${p.nom} ${p.company ?? ""} ${p.tags.join(" ")} ${p.description ?? ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (filters.continent !== "Tous" && p.continent !== filters.continent) return false;
      if (filters.categorie !== "Tous" && p.categorie !== filters.categorie) return false;
      if (activeCategory !== "Tous" && p.categorie !== activeCategory) return false;
      if (p.prix < min || p.prix > max) return false;
      return true;
    });
  }, [prestataires, filters, activeCategory, showFavoritesOnly, favorites]);

  const activeCat = CATEGORY_PILLS.find(c => c.label === activeCategory) ?? CATEGORY_PILLS[0];

  return (
    <>
      {/* Modals */}
      {selectedPresta && (
        <PrestaModal
          presta={selectedPresta}
          onClose={() => setSelectedPresta(null)}
          onContact={() => setSelectedPresta(null)}
        />
      )}
      {showPrestaireModal && (
        <DevenirPrestaireModal onClose={() => setShowPrestaireModal(false)} />
      )}

      {/* ── Navbar ── */}
      <nav
        className="sticky top-0 z-50 flex items-center justify-between"
        style={{
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--border)",
          boxShadow: "0 2px 20px rgba(74,108,247,0.08)",
          padding: "0 48px",
          height: 72,
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm"
            style={{ background: "var(--grad2)" }}
          >
            CE
          </div>
          <div style={{ fontFamily: "var(--font-raleway)", fontWeight: 900, fontSize: "1.15rem" }}>
            <span style={{ background: "var(--grad)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              CONNECT
            </span>
            <span className="block text-[10px] font-bold tracking-widest uppercase"
              style={{ background: "var(--grad2)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              EVENT
            </span>
          </div>
        </div>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-1">
          {[
            { label: "🏠 Accueil", href: "/" },
            { label: "🎉 Prestataires", href: "#prestataires" },
            { label: "📞 Contact", href: "#contact" },
          ].map((item, i) => (
            <a
              key={item.label}
              href={item.href}
              className="px-4 py-2 rounded-full text-xs font-bold transition-all duration-200"
              style={i === 0
                ? { background: "var(--grad2)", color: "white", boxShadow: "0 4px 14px rgba(74,108,247,0.35)" }
                : { color: "var(--muted)" }
              }
              onMouseEnter={i !== 0 ? e => {
                (e.currentTarget as HTMLAnchorElement).style.color = "var(--blue2)";
                (e.currentTarget as HTMLAnchorElement).style.background = "rgba(74,108,247,0.07)";
              } : undefined}
              onMouseLeave={i !== 0 ? e => {
                (e.currentTarget as HTMLAnchorElement).style.color = "var(--muted)";
                (e.currentTarget as HTMLAnchorElement).style.background = "none";
              } : undefined}
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Favoris */}
          <button
            onClick={() => setShowFavoritesOnly(f => !f)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer"
            style={{
              background: showFavoritesOnly ? "rgba(217,63,181,0.1)" : "var(--bg2)",
              color: showFavoritesOnly ? "var(--pink)" : "var(--muted)",
              border: showFavoritesOnly ? "1.5px solid rgba(217,63,181,0.3)" : "1.5px solid transparent",
            }}
          >
            <svg width={14} height={14} fill={showFavoritesOnly ? "var(--pink)" : "none"}
              stroke={showFavoritesOnly ? "none" : "var(--muted)"} strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {favorites.size > 0 && (
              <span className="font-extrabold">{favorites.size}</span>
            )}
          </button>

          {/* Connexion */}
          <a href="/auth/login"
            className="text-xs font-bold hidden md:block transition-colors duration-200"
            style={{ color: "var(--muted)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--blue2)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--muted)")}>
            Connexion
          </a>

          {/* Devenir prestataire CTA */}
          <button
            onClick={() => setShowPrestaireModal(true)}
            className="text-white text-xs font-extrabold px-4 py-2 rounded-full cursor-pointer transition-all duration-200 whitespace-nowrap"
            style={{
              background: "var(--grad)",
              boxShadow: "0 4px 14px rgba(217,63,181,0.3)",
              letterSpacing: "0.04em",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 22px rgba(217,63,181,0.4)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = "";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 14px rgba(217,63,181,0.3)";
            }}
          >
            ✨ Devenir prestataire
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden text-center" style={{ background: "var(--dark2)", padding: "80px 48px 90px" }}>
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #12112A 0%, #1E1C3A 50%, #2A1042 100%)" }} />
        {/* Orbs */}
        <div className="absolute rounded-full pointer-events-none" style={{ width:500, height:500, background:"#4A6CF7", top:-200, left:-100, filter:"blur(80px)", opacity:0.35 }} />
        <div className="absolute rounded-full pointer-events-none" style={{ width:400, height:400, background:"#D93FB5", bottom:-200, right:-100, filter:"blur(80px)", opacity:0.35 }} />
        <div className="absolute rounded-full pointer-events-none" style={{ width:300, height:300, background:"#F5842A", top:"50%", left:"50%", transform:"translate(-50%,-50%)", filter:"blur(80px)", opacity:0.35 }} />

        <div className="relative z-10">
          <h1
            className="font-black text-white leading-tight mb-4 anim-up"
            style={{ fontFamily: "var(--font-raleway)", fontSize: "clamp(2.2rem, 5vw, 4rem)" }}
          >
            Réservez les meilleurs<br />
            prestataires pour votre<br />
            <em style={{ fontStyle: "italic", background: "var(--grad)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              événement
            </em>
          </h1>
          <p className="mx-auto mb-10 anim-up" style={{ color: "rgba(255,255,255,0.6)", maxWidth: 500, lineHeight: 1.75, fontSize: "1rem", animationDelay: "0.1s" }}>
            DJ, décoratrices, traiteurs, photographes, feux d&apos;artifice et bien plus encore —<br />
            trouvez les meilleurs experts du monde entier.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-10 mb-12 anim-up" style={{ animationDelay: "0.2s" }}>
            {[
              [String(CATEGORY_PILLS.length - 1), "Catégories"],
              [String(MOCK_PRESTATAIRES.length) + "+", "Prestataires"],
              ["4", "Continents"],
              ["100%", "Certifiés"],
            ].map(([val, label]) => (
              <div key={label} className="text-center">
                <div className="font-black text-3xl" style={{ background: "var(--grad)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  {val}
                </div>
                <div className="text-[11px] uppercase tracking-widest mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Filter bar (floating) ── */}
      <div className="relative z-10 max-w-6xl mx-auto px-6" style={{ marginTop: -36 }}>
        <SearchBar filters={filters} onChange={setFilters} onSearch={() => {}} />
      </div>

      {/* ── Main content ── */}
      <main className="max-w-6xl mx-auto px-6 pt-14 pb-20" id="prestataires">
        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 mb-10">
          {CATEGORY_PILLS.map(({ label, icon }) => {
            const count = label === "Tous" ? prestataires.length : prestataires.filter(p => p.categorie === label).length;
            const isActive = activeCategory === label;
            return (
              <button
                key={label}
                onClick={() => { setActiveCategory(label); setShowFavoritesOnly(false); }}
                className="flex-shrink-0 flex items-center gap-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap"
                style={{
                  padding: "10px 22px",
                  background: isActive ? "var(--grad2)" : "white",
                  color: isActive ? "white" : "var(--muted)",
                  border: isActive ? "1.5px solid transparent" : "1.5px solid var(--border)",
                  boxShadow: isActive ? "0 6px 20px rgba(74,108,247,0.3)" : "none",
                }}
              >
                <span>{icon}</span>
                {label}
                <span
                  className="text-[10px] font-extrabold px-2 py-0.5 rounded-full"
                  style={isActive
                    ? { background: "rgba(255,255,255,0.25)" }
                    : { background: "var(--bg2)", color: "var(--muted)" }
                  }
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Section header */}
        <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
          <div>
            <h2
              className="font-black text-[1.7rem]"
              style={{ color: "var(--dark)", fontFamily: "var(--font-raleway)" }}
            >
              {showFavoritesOnly ? "❤️ Mes" : `${activeCat.icon} ${activeCat.label === "Tous" ? "Tous les" : ""}`}{" "}
              <span style={{ background: "var(--grad)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                {showFavoritesOnly ? "favoris" : activeCat.label === "Tous" ? "prestataires" : activeCat.label + "s"}
              </span>
            </h2>
            <p className="text-xs font-semibold mt-1" style={{ color: "var(--muted)" }}>Découvrez nos experts disponibles</p>
          </div>
          <span className="text-sm font-semibold px-4 py-1.5 rounded-full" style={{ background: "var(--bg2)", color: "var(--muted)" }}>
            {filtered.length} résultat{filtered.length > 1 ? "s" : ""}
          </span>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-80 animate-pulse" style={{ border: "1px solid var(--border)" }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl" style={{ border: "2px dashed var(--border)" }}>
            <div className="text-5xl mb-4">😔</div>
            <h3 className="font-extrabold text-lg mb-2" style={{ color: "var(--dark)", fontFamily: "var(--font-raleway)" }}>
              {showFavoritesOnly ? "Aucun favori" : "Aucun résultat"}
            </h3>
            <p className="text-sm font-semibold" style={{ color: "var(--muted)" }}>
              {showFavoritesOnly ? "Cliquez sur ♥ sur les cartes pour ajouter vos favoris." : "Essayez de modifier vos filtres."}
            </p>
            <button
              onClick={() => { setFilters(DEFAULT_FILTERS); setActiveCategory("Tous"); setShowFavoritesOnly(false); }}
              className="mt-4 text-xs font-bold px-5 py-2 rounded-full cursor-pointer transition-all"
              style={{ background: "var(--bg2)", color: "var(--muted)" }}
            >
              Réinitialiser
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(p => (
              <PrestaCard
                key={p.id}
                presta={p}
                onSelect={setSelectedPresta}
                onContact={setSelectedPresta}
                isFavorited={favorites.has(p.id)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        )}
      </main>

      {/* ── Contact band ── */}
      <section
        id="contact"
        className="flex flex-wrap gap-6 items-center justify-between"
        style={{ background: "var(--dark2)", padding: "40px 48px", marginTop: 40 }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black"
            style={{ background: "var(--grad2)" }}
          >
            CE
          </div>
          <span className="font-black text-white text-lg" style={{ fontFamily: "var(--font-raleway)" }}>
            Connect Event
          </span>
        </div>

        <div className="flex flex-wrap gap-6">
          {[
            { icon: "✉️", label: "Email", val: "yagan_darren@hotmail.com" },
            { icon: "📞", label: "Téléphone", val: "04 83 03 32 02" },
            { icon: "🌍", label: "Zones couvertes", val: "Afrique · Europe · Asie · Est" },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-3">
              <div
                className="flex items-center justify-center rounded-xl text-xl"
                style={{ width: 38, height: 38, background: "rgba(255,255,255,0.08)" }}
              >
                {item.icon}
              </div>
              <div>
                <div className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{item.label}</div>
                <div className="text-sm font-bold text-white">{item.val}</div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => setShowPrestaireModal(true)}
          className="text-white text-sm font-extrabold px-6 py-3 rounded-full cursor-pointer transition-all whitespace-nowrap"
          style={{ background: "var(--grad)", boxShadow: "0 4px 14px rgba(217,63,181,0.3)" }}
        >
          ✨ Devenir prestataire
        </button>
      </section>

      {/* ── Footer ── */}
      <footer className="text-center py-6 text-xs" style={{ background: "var(--dark)", color: "rgba(255,255,255,0.3)" }}>
        © 2025{" "}
        <span style={{ background: "var(--grad)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", fontWeight: 800 }}>
          Connect Event
        </span>{" "}
        — Tous droits réservés · Créez des souvenirs inoubliables ✦
      </footer>
    </>
  );
}
