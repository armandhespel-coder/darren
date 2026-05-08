import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  const { nom, email, prestataire_id } = await req.json();
  if (!email || !nom) return NextResponse.json({ error: "Champs manquants." }, { status: 400 });
  if (!process.env.RESEND_API_KEY) return NextResponse.json({ error: "RESEND_API_KEY non configurée." }, { status: 500 });

  const resend = new Resend(process.env.RESEND_API_KEY);

  await Promise.all([
    resend.emails.send({
      from: "Connect Event <contact@connect-event.be>",
      to: process.env.CONTACT_EMAIL ?? "armand.hespel@hotmail.com",
      subject: `[Demande Premium] ${nom} — Connect Event`,
      html: `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#F7F8FC;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F8FC;padding:40px 20px;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(74,108,247,0.1);">
<tr><td style="background:linear-gradient(135deg,#7c3aed,#4A6CF7);padding:28px 36px;">
<span style="color:white;font-weight:900;font-size:20px;">⭐ Nouvelle demande Premium</span>
</td></tr>
<tr><td style="padding:36px;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F8FC;border-radius:12px;padding:20px;margin-bottom:20px;">
<tr><td style="font-size:12px;color:#6B6A87;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;padding-bottom:4px;">Prestataire</td></tr>
<tr><td style="font-size:16px;color:#12112A;font-weight:800;">${nom}</td></tr>
<tr><td style="font-size:12px;color:#6B6A87;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;padding-top:14px;padding-bottom:4px;">Email</td></tr>
<tr><td><a href="mailto:${email}" style="font-size:15px;color:#4A6CF7;font-weight:700;">${email}</a></td></tr>
${prestataire_id ? `<tr><td style="font-size:12px;color:#6B6A87;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;padding-top:14px;padding-bottom:4px;">ID Fiche</td></tr>
<tr><td style="font-size:13px;color:#12112A;font-weight:600;">${prestataire_id}</td></tr>` : ""}
</table>
<p style="font-size:14px;color:#2C2B4B;font-weight:600;">Activer le compte Premium depuis l'espace admin.</p>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`,
    }),
    resend.emails.send({
      from: "Connect Event <contact@connect-event.be>",
      to: email,
      subject: "Votre demande Premium a bien été reçue — Connect Event",
      html: `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#F7F8FC;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F8FC;padding:40px 20px;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(74,108,247,0.1);">
<tr><td style="background:linear-gradient(135deg,#7c3aed,#4A6CF7);padding:28px 36px;">
<span style="color:white;font-weight:900;font-size:20px;">Connect Event — Demande Premium reçue ⭐</span>
</td></tr>
<tr><td style="padding:36px;">
<p style="font-size:16px;color:#12112A;font-weight:800;margin:0 0 12px;">Bonjour ${nom},</p>
<p style="font-size:14px;color:#2C2B4B;font-weight:600;line-height:1.7;margin:0 0 20px;">
Nous avons bien reçu votre demande de passage en <strong>Premium</strong>. Notre équipe va l'étudier et vous reviendra <strong>très rapidement</strong> pour finaliser l'activation de votre badge Top.
</p>
<div style="background:#F7F8FC;border-radius:12px;padding:20px;margin-bottom:20px;">
<p style="font-size:13px;color:#6B6A87;font-weight:700;margin:0 0 6px;">Ce que vous obtenez avec Premium :</p>
<p style="font-size:13px;color:#2C2B4B;font-weight:600;line-height:1.8;margin:0;">
⭐ Badge <strong>TOP</strong> visible sur votre fiche<br/>
📈 Mise en avant dans les résultats de recherche<br/>
📞 Affichage de votre numéro de téléphone<br/>
✅ Accès prioritaire aux nouvelles fonctionnalités
</p>
</div>
<p style="font-size:13px;color:#6B6A87;font-weight:600;line-height:1.7;margin:0;">
À très bientôt,<br/><strong style="color:#12112A;">L'équipe Connect Event</strong>
</p>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`,
    }),
  ]);

  return NextResponse.json({ success: true });
}
