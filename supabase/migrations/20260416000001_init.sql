-- Enable UUID extension
-- =====================
-- TABLE: profiles
-- =====================
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  role text not null check (role in ('client', 'pro')),
  created_at timestamp with time zone default now()
);

alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'role', 'client'));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- =====================
-- TABLE: prestataires
-- =====================
create table prestataires (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references profiles(id) on delete cascade not null,
  nom text not null,
  categorie text not null,
  continent text not null,
  prix integer not null,
  note numeric(2,1) default 0,
  images text[] default '{}',
  tags text[] default '{}',
  description text,
  telephone text,
  is_premium boolean default false,
  is_available boolean default true,
  created_at timestamp with time zone default now()
);

alter table prestataires enable row level security;

create policy "Anyone can view prestataires"
  on prestataires for select using (true);

create policy "Pros can insert own prestataire"
  on prestataires for insert with check (auth.uid() = owner_id);

create policy "Pros can update own prestataire"
  on prestataires for update using (auth.uid() = owner_id);

create policy "Pros can delete own prestataire"
  on prestataires for delete using (auth.uid() = owner_id);

-- =====================
-- TABLE: messages
-- =====================
create table messages (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references profiles(id) on delete cascade not null,
  receiver_id uuid references profiles(id) on delete cascade not null,
  prestataire_id uuid references prestataires(id) on delete set null,
  content text not null,
  read boolean default false,
  created_at timestamp with time zone default now()
);

alter table messages enable row level security;

create policy "Users can view own messages"
  on messages for select using (
    auth.uid() = sender_id or auth.uid() = receiver_id
  );

create policy "Users can send messages"
  on messages for insert with check (auth.uid() = sender_id);
