import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import DashboardClient from "./dashboard-client";

export default async function ProDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?next=/pro/dashboard");

  const service = createServiceClient();

  const { data: prestataire } = await service
    .from("prestataires")
    .select("*")
    .eq("owner_id", user!.id)
    .single();

  if (!prestataire) redirect("/pro/onboarding");

  const { count: msgCount } = await service
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("prestataire_id", prestataire.id);

  const { count: unreadCount } = await service
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("prestataire_id", prestataire.id)
    .eq("read", false);

  return (
    <DashboardClient
      prestataire={prestataire}
      userEmail={user.email ?? ""}
      msgCount={msgCount ?? 0}
      unreadCount={unreadCount ?? 0}
    />
  );
}
