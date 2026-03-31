-- Enable extensions
create extension if not exists pgcrypto;

-- Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  event_code text not null,
  name text not null,
  age integer,
  bio text not null,
  tags text[] not null default '{}',
  photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_profile_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute procedure public.handle_profile_updated_at();

-- Swipes
create table if not exists public.swipes (
  id uuid primary key default gen_random_uuid(),
  swiper_id uuid not null references public.profiles(id) on delete cascade,
  swiped_id uuid not null references public.profiles(id) on delete cascade,
  action text not null check (action in ('pass', 'like', 'superlike')),
  created_at timestamptz not null default now(),
  unique (swiper_id, swiped_id)
);

-- Matches
create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references public.profiles(id) on delete cascade,
  user_b uuid not null references public.profiles(id) on delete cascade,
  pair_key text not null unique,
  created_at timestamptz not null default now(),
  check (user_a <> user_b)
);

-- Messages
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.swipes enable row level security;
alter table public.matches enable row level security;
alter table public.messages enable row level security;

-- Profiles: anyone authenticated can read profiles from the event;
-- each person can create/update/delete only the own profile.
create policy "read profiles" on public.profiles
for select to authenticated
using (true);

create policy "insert own profile" on public.profiles
for insert to authenticated
with check (auth.uid() = id);

create policy "update own profile" on public.profiles
for update to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "delete own profile" on public.profiles
for delete to authenticated
using (auth.uid() = id);

-- Swipes: user may read and write only the own swipes.
create policy "read own swipes" on public.swipes
for select to authenticated
using (auth.uid() = swiper_id);

create policy "insert own swipes" on public.swipes
for insert to authenticated
with check (auth.uid() = swiper_id);

create policy "update own swipes" on public.swipes
for update to authenticated
using (auth.uid() = swiper_id)
with check (auth.uid() = swiper_id);

-- Matches: participants may read matches that include them.
create policy "read own matches" on public.matches
for select to authenticated
using (auth.uid() = user_a or auth.uid() = user_b);

create policy "insert own matches" on public.matches
for insert to authenticated
with check (auth.uid() = user_a or auth.uid() = user_b);

-- Messages: only match participants can read; sender must be auth user.
create policy "read own messages" on public.messages
for select to authenticated
using (
  exists (
    select 1 from public.matches m
    where m.id = match_id
      and (m.user_a = auth.uid() or m.user_b = auth.uid())
  )
);

create policy "send own messages" on public.messages
for insert to authenticated
with check (
  sender_id = auth.uid()
  and exists (
    select 1 from public.matches m
    where m.id = match_id
      and (m.user_a = auth.uid() or m.user_b = auth.uid())
  )
);

-- Public bucket for avatars
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "public avatars read" on storage.objects
for select to public
using (bucket_id = 'avatars');

create policy "authenticated avatars upload" on storage.objects
for insert to authenticated
with check (bucket_id = 'avatars');

create policy "authenticated avatars update" on storage.objects
for update to authenticated
using (bucket_id = 'avatars')
with check (bucket_id = 'avatars');
