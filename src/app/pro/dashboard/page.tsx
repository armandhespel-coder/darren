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

  return (
    <DashboardClient
      prestataire={prestataire}
      userEmail={user.email ?? ""}
    />
  );
}
