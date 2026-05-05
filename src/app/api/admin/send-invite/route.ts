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

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.connect-event.be";

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
    <div style="padding:40px 36px 32px;">
      <p style="font-size:16px;font-weight:700;color:#1E1C3A;margin:0 0 12px;">Bonjour 👋</p>
      <p style="font-size:14px;color:#555;line-height:1.8;margin:0 0 28px;">
        Vous avez été sélectionné(e) pour rejoindre <strong>Connect Event</strong> en tant que prestataire événementiel.<br/>
        Cliquez sur le bouton ci-dessous pour créer votre profil et commencer à recevoir des demandes.
      </p>

      <!-- CTA -->
      <div style="text-align:center;margin:32px 0;">
        <a href="${claimLink}"
          style="display:inline-block;background:#4A6CF7;color:#ffffff;font-size:15px;font-weight:800;padding:16px 36px;border-radius:50px;text-decoration:none;letter-spacing:-0.2px;">
          Créer mon profil prestataire →
        </a>
      </div>

      <p style="font-size:12px;color:#9CA3AF;text-align:center;margin:0 0 8px;">
        Ce lien est valable <strong>90 jours</strong>.
      </p>
      <p style="font-size:11px;color:#C4C4C4;text-align:center;margin:0;word-break:break-all;">
        Lien : <a href="${claimLink}" style="color:#4A6CF7;">${claimLink}</a>
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#F9FAFB;padding:20px 36px;border-top:1px solid #E5E7EB;text-align:center;">
      <p style="font-size:12px;color:#9CA3AF;margin:0 0 4px;">À très bientôt,</p>
      <p style="font-size:12px;font-weight:700;color:#6B7280;margin:0;">L&apos;équipe Connect Event</p>
      <p style="font-size:11px;color:#C4C4C4;margin:8px 0 0;">
        <a href="${siteUrl}" style="color:#C4C4C4;text-decoration:none;">${siteUrl.replace("https://", "")}</a>
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
      to: [to],
      subject: "Votre invitation prestataire — Connect Event",
      html,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    return NextResponse.json({ error: err }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
