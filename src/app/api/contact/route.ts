import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  const { name, email, message } = await req.json();

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Champs manquants." }, { status: 400 });
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "RESEND_API_KEY non configurée." }, { status: 500 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: "Connect Event <onboarding@resend.dev>",
    to: process.env.CONTACT_EMAIL ?? "armand.hespel@hotmail.com",
    replyTo: email,
    subject: `[Contact] Message de ${name} — Connect Event`,
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
            <span style="color:white;font-weight:900;font-size:20px;">Connect Event — Nouveau contact</span>
          </td>
        </tr>
        <tr>
          <td style="padding:36px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F8FC;border-radius:12px;padding:20px;margin-bottom:20px;">
              <tr><td style="font-size:12px;color:#6B6A87;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;padding-bottom:4px;">Nom</td></tr>
              <tr><td style="font-size:15px;color:#12112A;font-weight:700;">${name}</td></tr>
              <tr><td style="font-size:12px;color:#6B6A87;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;padding-top:14px;padding-bottom:4px;">Email</td></tr>
              <tr><td><a href="mailto:${email}" style="font-size:15px;color:#4A6CF7;font-weight:700;">${email}</a></td></tr>
            </table>
            <div style="font-size:12px;color:#6B6A87;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">Message</div>
            <div style="font-size:14px;color:#2C2B4B;line-height:1.7;white-space:pre-wrap;">${message}</div>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });

  if (error) {
    console.error("[contact] Resend error:", JSON.stringify(error));
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
