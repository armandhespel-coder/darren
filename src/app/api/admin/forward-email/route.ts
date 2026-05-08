import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";

const DARREN = "yagan_darren@hotmail.com";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { to, subject, body, clientNom, clientEmail, clientTel, prestataireName } = await req.json();
  if (!to || !body) return NextResponse.json({ error: "Champs manquants" }, { status: 400 });

  if (!process.env.RESEND_API_KEY) {
    console.error("[forward-email] RESEND_API_KEY manquante");
    return NextResponse.json({ error: "Configuration email manquante" }, { status: 500 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://connect-event.be";
  const safeBody = body.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#F7F8FC;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F8FC;padding:40px 20px;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(74,108,247,0.1);">

  <tr><td bgcolor="#1E1C3A" style="background-color:#1E1C3A;padding:24px 36px;">
    <span style="font-size:22px;font-weight:900;color:white;font-family:Arial,sans-serif;">
      Connect<span style="color:#D93FB5;">Event</span>
    </span>
    <span style="display:block;font-size:13px;color:rgba(255,255,255,0.6);font-weight:600;margin-top:4px;">Nouvelle demande client</span>
  </td></tr>

  <tr><td style="padding:32px 36px 24px;">
    <p style="font-size:16px;color:#12112A;font-weight:800;margin:0 0 12px;">
      Bonjour${prestataireName ? ` <strong>${prestataireName}</strong>` : ""},
    </p>
    <p style="font-size:14px;color:#2C2B4B;font-weight:600;line-height:1.8;margin:0 0 24px;">
      Un contact a vu votre profil sur <strong>Connect Event</strong> et souhaite faire appel à vos services. Pour donner suite, répondez simplement à cet email et nous ferons le lien.
    </p>

    <!-- Infos client -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F8FC;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
      <tr><td style="padding-bottom:6px;">
        <span style="font-size:10px;font-weight:800;color:#9999B3;text-transform:uppercase;letter-spacing:0.06em;">Contact client</span>
      </td></tr>
      <tr><td>
        <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#12112A;">👤 ${clientNom ?? "—"}</p>
        <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#4A6CF7;">
          <a href="mailto:${clientEmail ?? ""}" style="color:#4A6CF7;text-decoration:none;">${clientEmail ?? "—"}</a>
        </p>
        ${clientTel ? `<p style="margin:0;font-size:13px;font-weight:600;color:#12112A;">📞 <a href="tel:${clientTel}" style="color:#12112A;text-decoration:none;">${clientTel}</a></p>` : ""}
      </td></tr>
    </table>

    <!-- Message -->
    <p style="font-size:10px;font-weight:800;color:#9999B3;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 8px;">Message</p>
    <div style="background:#F7F8FC;border-radius:12px;padding:16px 20px;margin-bottom:28px;">
      <p style="font-size:14px;color:#2C2B4B;font-weight:600;line-height:1.8;margin:0;white-space:pre-wrap;">${safeBody}</p>
    </div>

    <div style="border-top:1px solid #E5E7EB;padding-top:20px;">
      <p style="font-size:12px;color:#9CA3AF;margin:0;font-weight:600;">
        Pour répondre à ce client, répondez directement à cet email ou contactez
        <a href="mailto:${DARREN}" style="color:#4A6CF7;font-weight:700;">${DARREN}</a>
      </p>
    </div>
  </td></tr>

  <tr><td style="background:#F9FAFB;padding:16px 36px;border-top:1px solid #E5E7EB;text-align:center;">
    <p style="font-size:11px;color:#9CA3AF;margin:0;">
      © 2026 Connect Event · Belgique ·
      <a href="${siteUrl}" style="color:#9CA3AF;">connect-event.be</a>
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body></html>`;

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: "Connect Event <contact@connect-event.be>",
    replyTo: DARREN,
    to: [to],
    subject: subject || "Nouvelle demande client — Connect Event",
    html,
  });

  if (error) {
    console.error("[forward-email] Resend error:", error);
    return NextResponse.json({ error: error.message }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
