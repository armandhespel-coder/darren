import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(req: NextRequest) {
  const { prestataire_id, email, nom, expiry, note, reusable, sendEmail = true } = await req.json();

  if (!prestataire_id || !nom) {
    return NextResponse.json({ error: "Paramètres manquants." }, { status: 400 });
  }
  if (sendEmail && !email) {
    return NextResponse.json({ error: "Email requis pour l'envoi." }, { status: 400 });
  }
  if (sendEmail && !process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "RESEND_API_KEY non configurée." }, { status: 500 });
  }

  const supabase = createServiceClient();

  // Save email to DB
  if (email) {
    await supabase.from("prestataires").update({ email }).eq("id", prestataire_id);
  }

  // Compute expires_at
  let expires_at: string | null = null;
  if (expiry !== "inf") {
    const d = new Date();
    d.setDate(d.getDate() + Number(expiry));
    expires_at = d.toISOString();
  }

  // Create secure token in edit_tokens table
  const { data: tokenData, error: tokenError } = await supabase
    .from("edit_tokens")
    .insert({ prestataire_id, expires_at, reusable: !!reusable })
    .select("id")
    .single();

  if (tokenError || !tokenData) {
    return NextResponse.json({ error: "Erreur création token : " + (tokenError?.message ?? "inconnu") }, { status: 500 });
  }

  const origin = new URL(req.url).origin;
  const link = `${origin}/p/edit/${tokenData.id}`;
  const expiryLabel =
    expiry === "inf" ? "sans expiration" : expiry === "1" ? "24 heures" : `${expiry} jours`;

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width" /></head>
<body style="margin:0;padding:0;background:#F7F8FC;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F8FC;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(74,108,247,0.1);">
        <tr>
          <td style="background:linear-gradient(135deg,#4A6CF7,#D93FB5);padding:28px 36px;">
            <span style="color:white;font-weight:900;font-size:20px;letter-spacing:-0.02em;">Connect Event</span>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 36px 28px;">
            <h1 style="color:#12112A;font-size:22px;font-weight:900;margin:0 0 12px;">Bonjour ${nom.split(" ")[0]},</h1>
            <p style="color:#6B6A87;font-size:15px;line-height:1.6;margin:0 0 20px;">
              Nous avons créé un lien sécurisé pour que vous puissiez mettre à jour votre profil prestataire — photos, disponibilités et informations.<br/>
              <strong style="color:#12112A;">Aucun compte à créer, aucun mot de passe à retenir.</strong>
            </p>
            ${note ? `<div style="border-left:3px solid #D93FB5;background:rgba(217,63,181,0.05);padding:14px 16px;border-radius:0 10px 10px 0;font-size:14px;color:#2C2B4B;font-style:italic;margin:0 0 24px;">« ${note} »</div>` : ""}
            <div style="text-align:center;margin:28px 0;">
              <a href="${link}" style="display:inline-block;background:linear-gradient(135deg,#2D9FE8,#7B3FDB,#D93FB5);color:white;text-decoration:none;font-weight:800;font-size:15px;padding:16px 36px;border-radius:12px;box-shadow:0 6px 22px rgba(217,63,181,0.35);">
                ✨ Mettre à jour mon profil
              </a>
            </div>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F8FC;border-radius:12px;padding:16px 20px;margin:0 0 24px;">
              <tr>
                <td style="color:#6B6A87;font-size:12px;font-weight:700;">🕐 Lien valable ${expiryLabel}</td>
              </tr>
              <tr>
                <td style="color:#6B6A87;font-size:12px;font-weight:700;padding-top:6px;">🔒 ${reusable ? "Réutilisable — lié à votre profil" : "Usage unique, lié à votre profil"}</td>
              </tr>
            </table>
            <p style="color:#9594AE;font-size:12px;border-top:1px solid #E7E6EC;padding-top:16px;margin:0;">
              Si vous n'êtes pas à l'origine de cette demande, ignorez simplement ce message.<br/>
              — L'équipe Connect Event
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  if (!sendEmail) {
    return NextResponse.json({ link });
  }

  const resend = new Resend(process.env.RESEND_API_KEY!);
  const { error } = await resend.emails.send({
    from: "Connect Event <contact@connect-event.be>",
    to: email,
    bcc: process.env.CONTACT_EMAIL ?? "armand.hespel@hotmail.com",
    subject: "Mettez à jour votre profil Connect Event",
    html,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ link });
}
