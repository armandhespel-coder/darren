import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const { prestataire_id, receiver_id, content } = await req.json();

  if (!content?.trim()) {
    return NextResponse.json({ error: "Message vide." }, { status: 400 });
  }

  const service = createServiceClient();

  const { data: msg, error } = await service
    .from("messages")
    .insert({
      sender_id: user.id,
      receiver_id: receiver_id ?? null,
      prestataire_id: prestataire_id ?? null,
      content: content.trim(),
      read: false,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Email notification si le prestataire a un email
  if (prestataire_id && process.env.RESEND_API_KEY) {
    const { data: presta } = await service
      .from("prestataires")
      .select("email, nom")
      .eq("id", prestataire_id)
      .single();

    if (presta?.email) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "Connect Event <no-reply@connectevent.be>",
        to: presta.email,
        subject: `Nouveau message pour ${presta.nom} — Connect Event`,
        html: `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#F7F8FC;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(74,108,247,0.1);">
        <tr><td style="background:linear-gradient(135deg,#4A6CF7,#D93FB5);padding:28px 36px;">
          <span style="color:white;font-weight:900;font-size:20px;">Connect Event</span>
        </td></tr>
        <tr><td style="padding:36px;">
          <h1 style="color:#12112A;font-size:20px;margin:0 0 12px;">Nouveau message reçu</h1>
          <p style="color:#6B6A87;font-size:14px;line-height:1.6;margin:0 0 20px;">
            Un client souhaite vous contacter via votre fiche <strong style="color:#12112A;">${presta.nom}</strong>.
          </p>
          <div style="background:#F7F8FC;border-radius:12px;padding:16px 20px;margin:0 0 24px;border-left:3px solid #4A6CF7;">
            <p style="color:#2C2B4B;font-size:14px;margin:0;font-style:italic;">"${content}"</p>
          </div>
          <div style="text-align:center;margin:24px 0;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? "https://connectevent.be"}/pro/demandes"
              style="display:inline-block;background:linear-gradient(135deg,#4A6CF7,#D93FB5);color:white;text-decoration:none;font-weight:800;font-size:14px;padding:14px 32px;border-radius:12px;">
              Voir mes demandes
            </a>
          </div>
          <p style="color:#9594AE;font-size:12px;border-top:1px solid #E7E6EC;padding-top:16px;margin:0;">
            — L'équipe Connect Event
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
      });
    }
  }

  return NextResponse.json({ message: msg });
}
