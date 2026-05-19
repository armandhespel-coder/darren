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
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width" /></head>
<body style="margin:0;padding:0;background:#F7F8FC;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F8FC;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(74,108,247,0.1);">

        <!-- Header -->
        <tr>
          <td style="background:#4A6CF7;background:linear-gradient(135deg,#4A6CF7,#D93FB5);padding:36px;text-align:center;">
            <p style="color:#ffffff;font-weight:900;font-size:22px;letter-spacing:-0.02em;margin:0 0 8px;">Connect Event</p>
            <p style="color:rgba(255,255,255,0.85);font-size:16px;font-weight:700;margin:0 0 6px;">Rejoignez la plateforme événementielle de référence</p>
            <p style="color:rgba(255,255,255,0.65);font-size:13px;margin:0;">Inscription gratuite · Lancement imminent</p>
          </td>
        </tr>

        <!-- Intro -->
        <tr>
          <td style="padding:36px 36px 0;">
            <p style="color:#6B6A87;font-size:15px;line-height:1.7;margin:0 0 16px;">Bonjour,</p>
            <p style="color:#6B6A87;font-size:15px;line-height:1.7;margin:0 0 16px;">
              Nous avons le plaisir de vous inviter à rejoindre gratuitement notre nouvelle plateforme dédiée aux professionnels de l'événementiel : <strong style="color:#12112A;">Connect-Event.be</strong>.
            </p>
            <p style="color:#6B6A87;font-size:15px;line-height:1.7;margin:0 0 20px;">
              Notre mission est simple : vous apporter des demandes sérieuses et qualifiées, tout en mettant en avant des prestataires de confiance auprès de futurs clients.
            </p>
            <div style="border-left:3px solid #D93FB5;background:rgba(217,63,181,0.05);padding:14px 16px;border-radius:0 10px 10px 0;margin:0 0 20px;">
              <p style="color:#12112A;font-size:14px;font-weight:700;margin:0 0 4px;">⚠️ Places limitées.</p>
              <p style="color:#6B6A87;font-size:14px;line-height:1.6;margin:0;">Les places seront volontairement limitées afin de garantir une vraie qualité de visibilité et des leads pertinents pour chaque prestataire présent sur la plateforme.</p>
            </div>
            <p style="color:#6B6A87;font-size:15px;line-height:1.7;margin:0 0 8px;">
              Le lancement officiel arrive très prochainement — soyez parmi les premiers à rejoindre <strong style="color:#12112A;">Connect-Event.be</strong> et profitez d'une visibilité privilégiée dès le départ.
            </p>
          </td>
        </tr>

        <!-- Section title -->
        <tr>
          <td style="padding:32px 36px 16px;text-align:center;">
            <p style="color:#D93FB5;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;margin:0 0 8px;">Ce que notre plateforme vous permet</p>
            <p style="color:#12112A;font-size:20px;font-weight:900;margin:0;">Quatre avantages clés<br/>pour développer votre activité</p>
          </td>
        </tr>

        <!-- Features -->
        <tr>
          <td style="padding:0 36px 8px;">

            <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #E7E6EC;padding-top:20px;margin-bottom:20px;">
              <tr><td style="padding-top:20px;">
                <p style="color:#4A6CF7;font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;margin:0 0 6px;">1 · Profil professionnel</p>
                <p style="color:#12112A;font-size:16px;font-weight:800;margin:0 0 8px;">Gérez votre propre profil professionnel</p>
                <p style="color:#6B6A87;font-size:14px;line-height:1.7;margin:0;">Ajoutez vos photos, votre présentation, vos services et mettez en avant votre savoir-faire afin d'attirer les bons clients. Votre vitrine, entièrement personnalisable.</p>
              </td></tr>
            </table>

            <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #E7E6EC;margin-bottom:20px;">
              <tr><td style="padding-top:20px;">
                <p style="color:#4A6CF7;font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;margin:0 0 6px;">2 · Demandes qualifiées</p>
                <p style="color:#12112A;font-size:16px;font-weight:800;margin:0 0 8px;">Recevez des demandes de clients sérieux</p>
                <p style="color:#6B6A87;font-size:14px;line-height:1.7;margin:0;">Notre plateforme filtre et qualifie les demandes pour vous mettre en relation avec des clients réels, prêts à organiser leur événement. Fini les contacts sans suite.</p>
              </td></tr>
            </table>

            <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #E7E6EC;margin-bottom:20px;">
              <tr><td style="padding-top:20px;">
                <p style="color:#4A6CF7;font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;margin:0 0 6px;">3 · Messagerie directe</p>
                <p style="color:#12112A;font-size:16px;font-weight:800;margin:0 0 8px;">Échangez directement avec vos clients</p>
                <p style="color:#6B6A87;font-size:14px;line-height:1.7;margin:0;">Une messagerie intégrée vous permet de discuter, clarifier les besoins et conclure sans passer par des intermédiaires. Simple, rapide, efficace.</p>
              </td></tr>
            </table>

            <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #E7E6EC;margin-bottom:8px;">
              <tr><td style="padding-top:20px;">
                <p style="color:#4A6CF7;font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;margin:0 0 6px;">4 · Visibilité premium</p>
                <p style="color:#12112A;font-size:16px;font-weight:800;margin:0 0 8px;">Mettez en avant votre expertise</p>
                <p style="color:#6B6A87;font-size:14px;line-height:1.7;margin:0;">Votre profil est visible par tous les organisateurs d'événements en Belgique. Les prestataires premium bénéficient d'une mise en avant renforcée et d'un accès au contact direct.</p>
              </td></tr>
            </table>

          </td>
        </tr>

        <!-- Why section -->
        <tr>
          <td style="background:#F7F8FC;padding:32px 36px;margin-top:16px;">
            <p style="color:#D93FB5;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;margin:0 0 8px;">Pourquoi nous rejoindre</p>
            <p style="color:#12112A;font-size:18px;font-weight:900;margin:0 0 20px;">Une plateforme pensée<br/>pour les professionnels</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="48%" style="background:#ffffff;border-radius:12px;padding:16px;border:1px solid #E7E6EC;">
                  <p style="font-size:20px;margin:0 0 6px;">🆓</p>
                  <p style="color:#6B6A87;font-size:13px;line-height:1.5;margin:0;">Inscription 100% gratuite, sans engagement</p>
                </td>
                <td width="4%"></td>
                <td width="48%" style="background:#ffffff;border-radius:12px;padding:16px;border:1px solid #E7E6EC;">
                  <p style="font-size:20px;margin:0 0 6px;">📩</p>
                  <p style="color:#6B6A87;font-size:13px;line-height:1.5;margin:0;">Demandes qualifiées et clients vérifiés</p>
                </td>
              </tr>
              <tr><td colspan="3" style="height:8px;"></td></tr>
              <tr>
                <td width="48%" style="background:#ffffff;border-radius:12px;padding:16px;border:1px solid #E7E6EC;">
                  <p style="font-size:20px;margin:0 0 6px;">🇧🇪</p>
                  <p style="color:#6B6A87;font-size:13px;line-height:1.5;margin:0;">Plateforme dédiée au marché belge</p>
                </td>
                <td width="4%"></td>
                <td width="48%" style="background:#ffffff;border-radius:12px;padding:16px;border:1px solid #E7E6EC;">
                  <p style="font-size:20px;margin:0 0 6px;">🚀</p>
                  <p style="color:#6B6A87;font-size:13px;line-height:1.5;margin:0;">Soyez parmi les premiers — visibilité maximale</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="padding:36px;text-align:center;">
            <p style="color:#12112A;font-size:20px;font-weight:900;margin:0 0 8px;">Prêt à rejoindre la communauté ?</p>
            <p style="color:#6B6A87;font-size:14px;margin:0 0 28px;">Créez votre profil gratuitement en quelques minutes et commencez à recevoir des demandes.</p>
            <a href="${claimLink}" style="display:inline-block;background:#7B3FDB;background:linear-gradient(135deg,#2D9FE8,#7B3FDB,#D93FB5);color:#ffffff;text-decoration:none;font-weight:800;font-size:15px;padding:16px 36px;border-radius:12px;">
              Créer mon profil prestataire
            </a>
            <p style="color:#9594AE;font-size:12px;margin:16px 0 0;word-break:break-all;">${claimLink}</p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#F7F8FC;padding:20px 36px;border-top:1px solid #E7E6EC;text-align:center;">
            <p style="color:#9594AE;font-size:12px;margin:0 0 4px;font-weight:700;">Connect-Event.be</p>
            <p style="color:#9594AE;font-size:12px;margin:0;">Ce lien d'invitation est personnel et valable 90 jours.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
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
