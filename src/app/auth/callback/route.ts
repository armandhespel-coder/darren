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
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
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
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=confirmation_failed`);
}
