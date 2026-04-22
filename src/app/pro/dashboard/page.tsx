import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import type { Prestataire } from "@/types";
import DashboardClient from "./dashboard-client";

export default async function ProDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?next=/pro/dashboard");

  const service = createServiceClient();

  const { data: prestataire } = await service
    .from("prestataires")
    .select("*")
    .eq("owner_id", user.id)
    .single();

  if (!prestataire) {
    redirect("/pro/onboarding");
  }

  const { count: msgCount } = await service
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("receiver_id", user.id);

  const { count: unreadCount } = await service
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("receiver_id", user.id)
    .eq("read", false);

  return (
    <DashboardClient
      prestataire={prestataire as Prestataire}
      userEmail={user.email ?? ""}
      msgCount={msgCount ?? 0}
      unreadCount={unreadCount ?? 0}
    />
  );
}
