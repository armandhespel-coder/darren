import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ProLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/pro/dashboard");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "prestataire") {
    redirect("/");
  }

  return <>{children}</>;
}
