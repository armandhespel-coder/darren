import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/service";
import { Prestataire } from "@/types";
import EditClient from "./edit-client";

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createServiceClient();

  const { data } = await supabase
    .from("prestataires")
    .select("*")
    .eq("id", id)
    .single();

  if (!data) notFound();

  return <EditClient prestataire={data as Prestataire} />;
}
