import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  const { prestataire_id, content, sender_name, sender_email, sender_phone } = await req.json();

  if (!content?.trim() || !sender_name?.trim() || !sender_email?.trim()) {
    return NextResponse.json({ error: "Champs requis manquants." }, { status: 400 });
  }

  const service = createServiceClient();

  const { error } = await service.from("demandes").insert({
    prestataire_id: prestataire_id ?? null,
    nom: sender_name.trim(),
    email: sender_email.trim(),
    telephone: sender_phone?.trim() ?? null,
    contenu: content.trim(),
    lu: false,
  });

  if (error) {
    console.error("Demande insert error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "Connect Event <contact@connect-event.be>",
      to: sender_email.trim(),
      subject: "Votre demande a bien été reçue — Connect Event",
      html: `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#F7F8FC;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F8FC;padding:40px 20px;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(74,108,247,0.1);">
<tr><td bgcolor="#4A6CF7" style="background-color:#4A6CF7;background:linear-gradient(135deg,#4A6CF7,#D93FB5);padding:28px 36px;">
<span style="color:white;font-weight:900;font-size:20px;font-family:Arial,sans-serif;">Connect Event — Demande reçue</span>
</td></tr>
<tr><td style="padding:36px;">
<p style="font-size:16px;color:#12112A;font-weight:800;margin:0 0 12px;">Bonjour ${sender_name.trim()},</p>
<p style="font-size:14px;color:#2C2B4B;font-weight:600;line-height:1.7;margin:0 0 20px;">
Nous avons bien reçu votre demande et nous vous confirmons qu'elle est prise en charge. Le prestataire va être informé et vous recevrez une réponse <strong>très rapidement</strong>.
</p>
<div style="background:#F7F8FC;border-radius:12px;padding:20px;margin-bottom:20px;">
<p style="font-size:12px;color:#6B6A87;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 6px;">Votre message</p>
<p style="font-size:14px;color:#2C2B4B;font-weight:600;line-height:1.7;margin:0;white-space:pre-wrap;">${content.trim()}</p>
</div>
<p style="font-size:13px;color:#6B6A87;font-weight:600;line-height:1.7;margin:0;">
À très bientôt,<br/><strong style="color:#12112A;">L'équipe Connect Event</strong>
</p>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`,
    }).catch(err => console.error("[send] Resend error:", err));
  }

  return NextResponse.json({ success: true });
}
