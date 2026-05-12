import { createClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const prestataire_id = url.searchParams.get('prestataire_id');
  if (!prestataire_id) return Response.json({ reviews: [] });

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('prestataire_id', prestataire_id)
    .order('created_at', { ascending: false });

  if (error) return Response.json({ reviews: [] });
  return Response.json({ reviews: data ?? [] });
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Non authentifié' }, { status: 401 });

  const body = await req.json();
  const { prestataire_id, note, commentaire } = body;

  if (!prestataire_id || !note || note < 1 || note > 5) {
    return Response.json({ error: 'Données invalides' }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from('reviews')
    .select('id')
    .eq('prestataire_id', prestataire_id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (existing) {
    return Response.json({ error: 'Vous avez déjà laissé un avis pour ce prestataire.' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('reviews')
    .insert({ prestataire_id, user_id: user.id, note, commentaire: commentaire || null })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });

  // Mettre à jour la note moyenne du prestataire
  const { data: allAvis } = await supabase.from('reviews').select('note').eq('prestataire_id', prestataire_id);
  if (allAvis && allAvis.length > 0) {
    const avg = allAvis.reduce((s: number, r: { note: number }) => s + r.note, 0) / allAvis.length;
    await supabase.from('prestataires').update({ note: Math.round(avg * 10) / 10 }).eq('id', prestataire_id);
  }

  return Response.json({ review: data }, { status: 201 });
}
