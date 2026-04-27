import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  const { nom, company, categorie, continent, description, tags, prix, price_note, email } = await req.json();

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "RESEND_API_KEY non configurée." }, { status: 500 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: "Connect Event <onboarding@resend.dev>",
    to: process.env.CONTACT_EMAIL ?? "armand.hespel@hotmail.com",
    subject: `[Nouveau Prestataire] ${nom} — Connect Event`,
    html: `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:0;background:#F7F8FC;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F8FC;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(74,108,247,0.1);">
        <tr>
          <td style="background:linear-gradient(135deg,#4A6CF7,#D93FB5);padding:28px 36px;">
            <span style="color:white;font-weight:900;font-size:20px;">Nouvelle demande prestataire</span>
          </td>
        </tr>
        <tr>
          <td style="padding:36px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F8FC;border-radius:12px;padding:20px;margin-bottom:20px;">
              <tr><td style="font-size:12px;color:#6B6A87;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;padding-bottom:4px;">Nom</td></tr>
              <tr><td style="font-size:15px;color:#12112A;font-weight:700;">${nom}</td></tr>
              ${company ? `<tr><td style="font-size:12px;color:#6B6A87;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;padding-top:14px;padding-bottom:4px;">Société</td></tr>
              <tr><td style="font-size:15px;color:#12112A;font-weight:700;">${company}</td></tr>` : ""}
              ${email ? `<tr><td style="font-size:12px;color:#6B6A87;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;padding-top:14px;padding-bottom:4px;">Email</td></tr>
              <tr><td><a href="mailto:${email}" style="font-size:15px;color:#4A6CF7;font-weight:700;">${email}</a></td></tr>` : ""}
              <tr><td style="font-size:12px;color:#6B6A87;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;padding-top:14px;padding-bottom:4px;">Catégorie</td></tr>
              <tr><td style="font-size:15px;color:#12112A;font-weight:700;">${categorie}</td></tr>
              <tr><td style="font-size:12px;color:#6B6A87;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;padding-top:14px;padding-bottom:4px;">Zone</td></tr>
              <tr><td style="font-size:15px;color:#12112A;font-weight:700;">${continent}</td></tr>
              <tr><td style="font-size:12px;color:#6B6A87;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;padding-top:14px;padding-bottom:4px;">Prix indicatif</td></tr>
              <tr><td style="font-size:15px;color:#12112A;font-weight:700;">${prix ? `${prix}€ ${price_note || ""}` : "Non renseigné"}</td></tr>
            </table>
            ${description ? `<div style="font-size:12px;color:#6B6A87;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">Description</div>
            <div style="font-size:14px;color:#2C2B4B;line-height:1.7;white-space:pre-wrap;margin-bottom:20px;">${description}</div>` : ""}
            ${tags?.length ? `<div style="font-size:12px;color:#6B6A87;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">Tags</div>
            <div style="font-size:14px;color:#4A6CF7;font-weight:700;">${tags.join(", ")}</div>` : ""}
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
