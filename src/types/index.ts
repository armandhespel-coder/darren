export type Role = "client" | "prestataire" | "admin";

export interface Profile {
  id: string;
  email: string;
  role: Role;
  created_at: string;
}

export interface Prestataire {
  id: string;
  owner_id: string | null;
  nom: string;
  categorie: string;
  continent?: string;
  prix: number;
  note: number;
  images: string[];
  tags: string[];
  specialites?: string[];
  description: string | null;
  telephone: string | null;
  is_premium: boolean;
  is_available: boolean;
  created_at: string;
  email?: string | null;
  company?: string;
  reviews?: number;
  price_note?: string;
  badge?: string | null;
  busy_dates?: string[];
  hide_company?: boolean;
  video_url?: string | null;
  is_visible?: boolean;
}

export interface Review {
  id: string;
  prestataire_id: string;
  user_id: string | null;
  note: number;
  commentaire: string | null;
  created_at: string;
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
