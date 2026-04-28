import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { NextRequest, NextResponse } from "next/server";

async function handleClaim(supabase: Awaited<ReturnType<typeof createClient>>, next: string, ptoken: string | null) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const service = createServiceClient();

  if (ptoken) {
    const { data: tokenData } = await service
      .from("edit_tokens")
      .select("prestataire_id")
      .eq("id", ptoken)
      .single();
    if (tokenData) {
      await Promise.all([
        service.from("prestataires").update({ owner_id: user.id }).eq("id", tokenData.prestataire_id),
        service.from("profiles").update({ role: "pro" }).eq("id", user.id),
      ]);
    }
  } else if (next.startsWith("/p/edit/")) {
    const prestataireId = next.split("/p/edit/")[1]?.split("?")[0];
    if (prestataireId) {
      const { data: presta } = await service.from("prestataires").select("id, owner_id").eq("id", prestataireId).single();
      if (presta && !presta.owner_id) {
        await Promise.all([
          service.from("prestataires").update({ owner_id: user.id }).eq("id", prestataireId),
          service.from("profiles").update({ role: "pro" }).eq("id", user.id),
        ]);
      }
    }
  }
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/";
  const ptoken = searchParams.get("ptoken");

  const supabase = await createClient();

  // PKCE flow (code)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      await handleClaim(supabase, next, ptoken);
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Token hash flow (email confirmation via Supabase magic link)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type: type as "signup" | "recovery" | "email" | "invite" | "magiclink" | "email_change" });
    if (!error) {
      await handleClaim(supabase, next, ptoken);
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=confirmation_failed`);
}
