import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  const ptoken = searchParams.get("ptoken");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      if (ptoken) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const service = createServiceClient();
          const { data: tokenData } = await service
            .from("edit_tokens")
            .select("prestataire_id")
            .eq("id", ptoken)
            .single();
          if (tokenData) {
            await Promise.all([
              service.from("prestataires").update({ owner_id: user.id }).eq("id", tokenData.prestataire_id),
              service.from("profiles").update({ role: "prestataire" }).eq("id", user.id),
            ]);
          }
        }
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=confirmation_failed`);
}
