import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map(e => e.trim());

  if (!user || !adminEmails.includes(user.email ?? "")) {
    redirect("/");
  }

  return <>{children}</>;
}
