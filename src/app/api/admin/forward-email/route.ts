import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const DARREN = "yagan_darren@hotmail.com";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { to, subject, body } = await req.json();
  if (!to || !body) return NextResponse.json({ error: "Champs manquants" }, { status: 400 });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://connect-event.be";

  const html = `<!DOCTYPE html>
<html lang="fr">
<body style="margin:0;padding:0;background:#F7F8FC;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:white;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.10);">

    <!-- Header -->
    <div style="background:#1E1C3A;padding:28px 36px;text-align:center;">
      <span style="font-size:26px;font-weight:900;color:white;font-family:Arial,Helvetica,sans-serif;letter-spacing:-0.5px;">
        Connect<span style="color:#D93FB5;">Event</span>
      </span>
    </div>

    <!-- Body -->
    <div style="padding:36px 36px 28px;">
      <p style="font-size:15px;color:#374151;line-height:1.8;white-space:pre-line;margin:0 0 28px;">${body.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>

      <div style="border-top:1px solid #E5E7EB;padding-top:20px;margin-top:4px;">
        <p style="font-size:12px;color:#9CA3AF;margin:0;">
          Pour répondre à ce message, écrivez directement à
          <a href="mailto:${DARREN}" style="color:#4A6CF7;font-weight:700;">${DARREN}</a>
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#F9FAFB;padding:18px 36px;border-top:1px solid #E5E7EB;text-align:center;">
      <p style="font-size:11px;color:#9CA3AF;margin:0;">
        © 2026 Connect Event · Belgique ·
        <a href="${siteUrl}" style="color:#9CA3AF;">connect-event.be</a>
      </p>
    </div>

  </div>
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
      reply_to: DARREN,
      to: [to],
      subject: subject || "Votre demande — Connect Event",
      html,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    return NextResponse.json({ error: err }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
