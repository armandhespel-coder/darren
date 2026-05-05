import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ADMIN_EMAILS = ["yagan_darren@hotmail.com"];

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { to, subject, body } = await req.json();
  if (!to || !body) return NextResponse.json({ error: "Champs manquants" }, { status: 400 });

  const fullBody = `${body}\n\n---\nPour répondre, écrivez directement à : ${ADMIN_EMAILS.join(" ou ")}`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Connect Event <contact@connect-event.be>",
      reply_to: ADMIN_EMAILS,
      to: [to],
      subject: subject || "Votre demande — Connect Event",
      text: fullBody,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    return NextResponse.json({ error: err }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
