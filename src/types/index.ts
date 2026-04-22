export type Role = "client" | "pro";

export interface Profile {
  id: string;
  email: string;
  role: Role;
  created_at: string;
}

export interface Prestataire {
  id: string;
  owner_id: string;
  nom: string;
  categorie: string;
  continent?: string;
  prix: number;
  note: number;
  images: string[];
  tags: string[];
  description: string | null;
  telephone: string | null;
  is_premium: boolean;
  is_available: boolean;
  created_at: string;
  email?: string | null;
  // Champs étendus (mock / admin uniquement, absents de la DB)
  company?: string;
  reviews?: number;
  price_note?: string;
  badge?: string | null;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  prestataire_id: string | null;
  content: string;
  read: boolean;
  created_at: string;
}
