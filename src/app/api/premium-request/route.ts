import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(req: NextRequest) {
  const { nom, email, prestataire_id } = await req.json();
  if (!email || !nom) return NextResponse.json({ error: "Champs manquants." }, { status: 400 });

  const service = createServiceClient();
  const { error } = await service.from("demandes").insert({
    prestataire_id: prestataire_id ?? null,
    nom,
    email,
    contenu: `⭐ DEMANDE PREMIUM — ${nom} souhaite passer en Premium. Activer via l'espace admin sur la fiche prestataire.`,
    lu: false,
  });

  if (error) {
    console.error("[premium-request] DB error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "Connect Event <contact@connect-event.be>",
      to: email,
      subject: "Votre demande Premium a bien été reçue — Connect Event",
      html: `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#F7F8FC;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F8FC;padding:40px 20px;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(74,108,247,0.1);">
<tr><td bgcolor="#7c3aed" style="background-color:#7c3aed;background:linear-gradient(135deg,#7c3aed,#4A6CF7);padding:28px 36px;">
<span style="color:white;font-weight:900;font-size:20px;">Connect Event — Demande Premium reçue ⭐</span>
</td></tr>
<tr><td style="padding:36px;">
<p style="font-size:16px;color:#12112A;font-weight:800;margin:0 0 12px;">Bonjour ${nom},</p>
<p style="font-size:14px;color:#2C2B4B;font-weight:600;line-height:1.7;margin:0 0 20px;">
Nous avons bien reçu votre demande de passage en <strong>Premium</strong>. Notre équipe va l'étudier et vous reviendra <strong>très rapidement</strong> pour finaliser l'activation de votre badge Top.
</p>
<div style="background:#F7F8FC;border-radius:12px;padding:20px;margin-bottom:20px;">
<p style="font-size:13px;color:#6B6A87;font-weight:700;margin:0 0 8px;">Ce que vous obtenez avec Premium :</p>
<p style="font-size:13px;color:#2C2B4B;font-weight:600;line-height:1.9;margin:0;">
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
    }).catch(err => console.error("[premium-request] Resend error:", err));
  }

  return NextResponse.json({ success: true });
}
