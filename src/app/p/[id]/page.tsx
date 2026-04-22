import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/service";
import type { Prestataire } from "@/types";
import ProfileClient from "./profile-client";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("prestataires")
    .select("nom, categorie, description")
    .eq("id", id)
    .single();
  if (!data) return {};
  return {
    title: `${data.nom} — ${data.categorie} | Connect Event`,
    description:
      data.description ??
      `Découvrez le profil de ${data.nom}, prestataire ${data.categorie} sur Connect Event.`,
  };
}

export default async function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createServiceClient();
  const { data } = await supabase.from("prestataires").select("*").eq("id", id).single();
  if (!data) notFound();
  return <ProfileClient prestataire={data as Prestataire} />;
}
