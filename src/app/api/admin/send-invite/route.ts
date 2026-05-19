import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ADMIN_EMAILS = ["armand.hespel@hotmail.com", "yagan_darren@hotmail.com"];

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email || !ADMIN_EMAILS.includes(user.email)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { to, claimLink } = await req.json();
  if (!to || !claimLink) return NextResponse.json({ error: "Champs manquants" }, { status: 400 });

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Connect-Event.be — Rejoignez la plateforme</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: #FAF7F0;
    font-family: 'Jost', Arial, sans-serif;
    color: #2A2A2A;
    line-height: 1.7;
  }

  .email-wrapper {
    max-width: 680px;
    margin: 40px auto;
    background: #FFFFFF;
    border: 1px solid #E8E0D0;
    box-shadow: 0 20px 80px rgba(0,0,0,0.08);
  }

  .header {
    background: #0D0D0D;
    padding: 52px 40px 44px;
    text-align: center;
    position: relative;
    overflow: hidden;
  }

  .header::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background:
      radial-gradient(ellipse at 20% 50%, rgba(201,168,76,0.12) 0%, transparent 60%),
      radial-gradient(ellipse at 80% 50%, rgba(201,168,76,0.08) 0%, transparent 60%);
  }

  .header-logo {
    position: relative;
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 13px;
    font-weight: 400;
    letter-spacing: 5px;
    text-transform: uppercase;
    color: #C9A84C;
    margin-bottom: 18px;
  }

  .header-title {
    position: relative;
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 42px;
    font-weight: 300;
    color: #FFFFFF;
    line-height: 1.15;
    margin-bottom: 8px;
  }

  .header-title em {
    font-style: italic;
    color: #E8C97A;
  }

  .header-sub {
    position: relative;
    font-size: 13px;
    font-weight: 300;
    letter-spacing: 2px;
    color: rgba(255,255,255,0.45);
    text-transform: uppercase;
  }

  .gold-line {
    width: 50px;
    height: 1px;
    background: #C9A84C;
    margin: 20px auto;
  }

  .intro {
    padding: 48px 48px 36px;
    border-bottom: 1px solid #F0E8D8;
  }

  .greeting {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 22px;
    font-weight: 400;
    color: #0D0D0D;
    margin-bottom: 18px;
  }

  .intro p {
    font-size: 15px;
    color: #6B6B6B;
    font-weight: 300;
    line-height: 1.8;
    margin-bottom: 14px;
  }

  .alert-box {
    background: linear-gradient(135deg, #FFF8E8, #FEF3D0);
    border-left: 3px solid #C9A84C;
    padding: 16px 20px;
    margin-top: 24px;
    font-size: 14px;
    color: #6B5420;
    font-weight: 400;
    border-radius: 0 4px 4px 0;
  }

  .alert-box strong { color: #8B6A10; font-weight: 600; }

  .section-intro {
    padding: 36px 48px 12px;
    text-align: center;
  }

  .section-label {
    font-size: 11px;
    letter-spacing: 4px;
    text-transform: uppercase;
    color: #C9A84C;
    font-weight: 500;
    margin-bottom: 10px;
  }

  .section-intro h2 {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 30px;
    font-weight: 300;
    color: #0D0D0D;
  }

  .feature {
    padding: 0 48px 48px;
  }

  .feature-card {
    margin-bottom: 36px;
    border-bottom: 1px solid #F0E8D8;
    padding-bottom: 36px;
  }

  .feature-card:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }

  .feature-num {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 14px;
  }

  .feature-num .num {
    width: 32px;
    height: 32px;
    background: #0D0D0D;
    color: #C9A84C;
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 16px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .feature-num .label {
    font-size: 11px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: #C9A84C;
    font-weight: 500;
  }

  .feature-card h3 {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 26px;
    font-weight: 400;
    color: #0D0D0D;
    margin-bottom: 10px;
    line-height: 1.3;
  }

  .feature-card p {
    font-size: 14.5px;
    color: #6B6B6B;
    font-weight: 300;
    line-height: 1.8;
  }

  .why-section {
    background: #0D0D0D;
    padding: 52px 48px;
    position: relative;
    overflow: hidden;
  }

  .why-section::before {
    content: '';
    position: absolute;
    top: -40px; right: -40px;
    width: 200px; height: 200px;
    border: 1px solid rgba(201,168,76,0.15);
    border-radius: 50%;
  }

  .why-section::after {
    content: '';
    position: absolute;
    bottom: -60px; left: -60px;
    width: 280px; height: 280px;
    border: 1px solid rgba(201,168,76,0.08);
    border-radius: 50%;
  }

  .why-section .section-label { color: #C9A84C; margin-bottom: 10px; }

  .why-section h2 {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 32px;
    font-weight: 300;
    color: #FFFFFF;
    margin-bottom: 32px;
    line-height: 1.25;
  }

  .why-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    position: relative;
    z-index: 1;
  }

  .why-item {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(201,168,76,0.2);
    padding: 20px 22px;
    border-radius: 2px;
  }

  .why-item .icon {
    font-size: 20px;
    margin-bottom: 8px;
    display: block;
  }

  .why-item .text {
    font-size: 13.5px;
    color: rgba(255,255,255,0.75);
    font-weight: 300;
    line-height: 1.5;
    display: block;
  }

  .cta-section {
    padding: 56px 48px;
    text-align: center;
    background: #FAF7F0;
    border-top: 1px solid #EDE5D5;
  }

  .cta-section h2 {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 34px;
    font-weight: 300;
    color: #0D0D0D;
    margin-bottom: 10px;
    line-height: 1.2;
  }

  .cta-section p {
    font-size: 14px;
    color: #6B6B6B;
    font-weight: 300;
    margin-bottom: 32px;
  }

  .cta-btn {
    display: inline-block;
    background: #0D0D0D;
    color: #E8C97A !important;
    font-family: 'Jost', Arial, sans-serif;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 3px;
    text-transform: uppercase;
    padding: 18px 48px;
    text-decoration: none;
    border: 1px solid #0D0D0D;
  }

  .cta-url {
    display: block;
    margin-top: 18px;
    font-size: 13px;
    color: #C9A84C;
    font-weight: 400;
    letter-spacing: 1px;
    text-decoration: none;
    word-break: break-all;
  }

  .footer {
    background: #181818;
    padding: 28px 48px;
    text-align: center;
    border-top: 1px solid rgba(201,168,76,0.2);
  }

  .footer p {
    font-size: 12px;
    color: rgba(255,255,255,0.3);
    font-weight: 300;
    letter-spacing: 0.5px;
    line-height: 1.7;
  }

  .footer .brand {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 14px;
    color: #C9A84C;
    display: block;
    margin-bottom: 6px;
    letter-spacing: 2px;
  }
</style>
</head>
<body>

<div class="email-wrapper">

  <!-- HEADER -->
  <div class="header">
    <div class="header-logo">Connect-Event.be</div>
    <div class="gold-line"></div>
    <h1 class="header-title">Rejoignez la<br><em>plateforme événementielle</em><br>de référence</h1>
    <div class="gold-line"></div>
    <p class="header-sub">Inscription gratuite · Lancement imminent</p>
  </div>

  <!-- INTRO -->
  <div class="intro">
    <div class="greeting">Bonjour,</div>
    <p>
      Nous avons le plaisir de vous inviter à rejoindre gratuitement notre nouvelle plateforme dédiée aux professionnels de l'événementiel : <strong>Connect-Event.be</strong>.
    </p>
    <p>
      Notre mission est simple : vous apporter des demandes sérieuses et qualifiées, tout en mettant en avant des prestataires de confiance auprès de futurs clients.
    </p>
    <div class="alert-box">
      <strong>⚠️ Places limitées.</strong> Les places seront volontairement limitées afin de garantir une vraie qualité de visibilité et des leads pertinents pour chaque prestataire présent sur la plateforme.
    </div>
    <p style="margin-top: 18px;">
      Le lancement officiel arrive très prochainement — soyez parmi les premiers à rejoindre <strong>Connect-Event.be</strong> et profitez d'une visibilité privilégiée dès le départ.
    </p>
  </div>

  <!-- SECTION TITLE -->
  <div class="section-intro">
    <div class="section-label">Ce que notre plateforme vous permet</div>
    <h2>Quatre avantages clés<br>pour développer votre activité</h2>
    <div class="gold-line"></div>
  </div>

  <!-- FEATURES -->
  <div class="feature">

    <div class="feature-card">
      <div class="feature-num">
        <div class="num">1</div>
        <div class="label">Profil professionnel</div>
      </div>
      <h3>Gérez votre propre profil professionnel</h3>
      <p>Ajoutez vos photos, votre présentation, vos services et mettez en avant votre savoir-faire afin d'attirer les bons clients. Votre vitrine, entièrement personnalisable.</p>
    </div>

    <div class="feature-card">
      <div class="feature-num">
        <div class="num">2</div>
        <div class="label">Demandes qualifiées</div>
      </div>
      <h3>Recevez des demandes de clients sérieux</h3>
      <p>Notre plateforme filtre et qualifie les demandes pour vous mettre en relation avec des clients réels, prêts à organiser leur événement. Fini les contacts sans suite.</p>
    </div>

    <div class="feature-card">
      <div class="feature-num">
        <div class="num">3</div>
        <div class="label">Messagerie directe</div>
      </div>
      <h3>Échangez directement avec vos clients</h3>
      <p>Une messagerie intégrée vous permet de discuter, clarifier les besoins et conclure sans passer par des intermédiaires. Simple, rapide, efficace.</p>
    </div>

    <div class="feature-card">
      <div class="feature-num">
        <div class="num">4</div>
        <div class="label">Visibilité premium</div>
      </div>
      <h3>Mettez en avant votre expertise</h3>
      <p>Votre profil est visible par tous les organisateurs d'événements en Belgique. Les prestataires premium bénéficient d'une mise en avant renforcée et d'un accès au contact direct.</p>
    </div>

  </div>

  <!-- WHY JOIN -->
  <div class="why-section">
    <div class="section-label">Pourquoi nous rejoindre</div>
    <h2>Une plateforme pensée<br>pour les professionnels</h2>
    <div class="why-grid">
      <div class="why-item">
        <span class="icon">🆓</span>
        <span class="text">Inscription 100% gratuite, sans engagement</span>
      </div>
      <div class="why-item">
        <span class="icon">📩</span>
        <span class="text">Demandes qualifiées et clients vérifiés</span>
      </div>
      <div class="why-item">
        <span class="icon">🇧🇪</span>
        <span class="text">Plateforme dédiée au marché belge</span>
      </div>
      <div class="why-item">
        <span class="icon">🚀</span>
        <span class="text">Soyez parmi les premiers — visibilité maximale</span>
      </div>
    </div>
  </div>

  <!-- CTA -->
  <div class="cta-section">
    <h2>Prêt à rejoindre<br><em style="font-style:italic;color:#C9A84C;">la communauté ?</em></h2>
    <p>Créez votre profil gratuitement en quelques minutes et commencez à recevoir des demandes.</p>
    <a href="${claimLink}" class="cta-btn">Créer mon profil prestataire</a>
    <a href="${claimLink}" class="cta-url">${claimLink}</a>
  </div>

  <!-- FOOTER -->
  <div class="footer">
    <span class="brand">Connect-Event.be</span>
    <p>La plateforme événementielle belge de référence</p>
    <p style="margin-top: 8px; font-size: 11px;">
      Ce lien d'invitation est personnel et valable 90 jours.
    </p>
  </div>

</div>

</body>
</html>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Connect Event <contact@connect-event.be>",
      to: [to],
      subject: "Votre invitation prestataire — Connect-Event.be",
      html,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    return NextResponse.json({ error: err }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
