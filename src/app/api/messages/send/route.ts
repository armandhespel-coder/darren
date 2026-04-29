import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

const ADMIN_EMAILS = ["armand.hespel@hotmail.com", "yagan_darren@hotmail.com"];

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const { prestataire_id, content } = await req.json();

  if (!content?.trim()) {
    return NextResponse.json({ error: "Message vide." }, { status: 400 });
  }

  const service = createServiceClient();

  const [{ data: adminProfiles }, { data: presta }] = await Promise.all([
    service.from("profiles").select("id").in("email", ADMIN_EMAILS).limit(1),
    prestataire_id
      ? service.from("prestataires").select("nom, email").eq("id", prestataire_id).single()
      : Promise.resolve({ data: null }),
  ]);

  const adminId = adminProfiles?.[0]?.id ?? null;

  const { data: msg, error } = await service
    .from("messages")
    .insert({
      sender_id: user.id,
      receiver_id: adminId,
      prestataire_id: prestataire_id ?? null,
      content: content.trim(),
      read: false,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const prestaNom = (presta as { nom?: string } | null)?.nom ?? "";
  const prestaEmail = (presta as { email?: string | null } | null)?.email ?? "";
  const clientEmail = user.email ?? "client inconnu";

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://connect-event.be";
  const adminMessagesUrl = `${siteUrl}/admin/messages`;

  const html = `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#F7F8FC;font-family:sans-serif;">
  <div style="max-width:520px;margin:40px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <div style="background:#1E1C3A;padding:24px 32px;">
      <div style="color:white;font-size:20px;font-weight:900;letter-spacing:-0.5px;">Connect Event</div>
      <div style="color:rgba(255,255,255,0.6);font-size:12px;margin-top:4px;">Nouvelle demande client</div>
    </div>
    <div style="padding:28px 32px;">
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
        <tr>
          <td style="padding:8px 0;font-size:12px;font-weight:700;color:#9CA3AF;width:110px;">Client</td>
          <td style="padding:8px 0;font-size:13px;font-weight:700;color:#1E1C3A;">${clientEmail}</td>
        </tr>
        ${prestaNom ? `<tr>
          <td style="padding:8px 0;font-size:12px;font-weight:700;color:#9CA3AF;">Prestataire</td>
          <td style="padding:8px 0;font-size:13px;font-weight:700;color:#4A6CF7;">${prestaNom}</td>
        </tr>` : ""}
      </table>
      <div style="background:#F7F8FC;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
        <div style="font-size:11px;font-weight:800;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px;">Message</div>
        <div style="font-size:13px;color:#374151;white-space:pre-line;line-height:1.6;">${content.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
      </div>
      <a href="${adminMessagesUrl}" style="display:inline-block;background:linear-gradient(135deg,#4A6CF7,#D93FB5);color:white;font-size:13px;font-weight:800;padding:12px 24px;border-radius:50px;text-decoration:none;">📧 Voir et transmettre au prestataire</a>
    </div>
  </div>
</body>
</html>`;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Connect Event <contact@connect-event.be>",
      reply_to: "yagan_darren@hotmail.com",
      to: ADMIN_EMAILS,
      subject: prestaNom
        ? `Nouvelle demande de ${clientEmail} pour ${prestaNom}`
        : `Nouveau message de ${clientEmail}`,
      html,
    }),
  }).catch(() => null);

  return NextResponse.json({ message: msg });
}
