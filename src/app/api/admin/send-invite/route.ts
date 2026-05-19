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
          <td style="background:#4A6CF7;background:linear-gradient(135deg,#4A6CF7,#D93FB5);padding:28px 36px;">
            <span style="color:#ffffff;font-weight:900;font-size:20px;letter-spacing:-0.02em;">Connect Event</span>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 36px 28px;">
            <h1 style="color:#12112A;font-size:22px;font-weight:900;margin:0 0 12px;">Vous êtes invité à rejoindre Connect Event</h1>
            <p style="color:#6B6A87;font-size:15px;line-height:1.6;margin:0 0 20px;">
              Bonjour,<br/><br/>
              Nous avons le plaisir de vous inviter à créer votre profil prestataire sur <strong style="color:#12112A;">Connect-Event.be</strong> — la plateforme événementielle belge de référence.<br/><br/>
              Mettez en avant votre activité, recevez des demandes qualifiées et échangez directement avec vos futurs clients.
            </p>

            <div style="background:#F7F8FC;border-radius:12px;padding:16px 20px;margin:0 0 24px;">
              <p style="color:#12112A;font-size:14px;font-weight:700;margin:0 0 8px;">Ce que vous obtenez :</p>
              <p style="color:#6B6A87;font-size:13px;line-height:1.7;margin:0;">
                ✅ Un profil professionnel personnalisable<br/>
                ✅ Des demandes clients sérieuses et qualifiées<br/>
                ✅ Une messagerie directe intégrée<br/>
                ✅ Inscription 100% gratuite, sans engagement
              </p>
            </div>

            <div style="text-align:center;margin:28px 0;">
              <a href="${claimLink}" style="display:inline-block;background:#7B3FDB;background:linear-gradient(135deg,#2D9FE8,#7B3FDB,#D93FB5);color:#ffffff;text-decoration:none;font-weight:800;font-size:15px;padding:16px 36px;border-radius:12px;">
                Créer mon profil prestataire
              </a>
            </div>

            <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F8FC;border-radius:12px;padding:16px 20px;margin:0 0 24px;">
              <tr>
                <td style="color:#6B6A87;font-size:12px;font-weight:700;">🕐 Ce lien d'invitation est valable 90 jours</td>
              </tr>
              <tr>
                <td style="color:#6B6A87;font-size:12px;font-weight:700;padding-top:6px;">🔒 Lien personnel — ne pas partager</td>
              </tr>
            </table>

            <p style="color:#9594AE;font-size:12px;border-top:1px solid #E7E6EC;padding-top:16px;margin:0;">
              Si vous n'êtes pas concerné par cette invitation, ignorez simplement ce message.<br/>
              — L'équipe Connect Event
            </p>
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
