-- Gather: initial schema + RLS

-- ============ TABLES ============

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz default now()
);

create table if not exists trips (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  start_date date,
  end_date date,
  cover_url text,
  created_by uuid not null references auth.users(id) on delete cascade,
  invite_code text not null unique,
  created_at timestamptz default now()
);

create table if not exists trip_members (
  trip_id uuid not null references trips(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz default now(),
  primary key (trip_id, user_id)
);

create table if not exists media (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null,
  kind text not null check (kind in ('photo','video')),
  is_moment boolean not null default false,
  moment_round_id uuid,
  was_late boolean not null default false,
  taken_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists moment_rounds (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  triggered_at timestamptz not null default now(),
  closes_at timestamptz not null
);

create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz default now()
);

create index if not exists media_trip_idx on media(trip_id, created_at desc);
create index if not exists trip_members_user_idx on trip_members(user_id);

-- ============ HELPER ============

create or replace function is_trip_member(t uuid)
returns boolean language sql security definer stable as $$
  select exists(select 1 from trip_members where trip_id = t and user_id = auth.uid());
$$;

-- ============ RLS ============

alter table profiles enable row level security;
alter table trips enable row level security;
alter table trip_members enable row level security;
alter table media enable row level security;
alter table moment_rounds enable row level security;
alter table push_subscriptions enable row level security;

-- profiles: everyone authed can read; user can upsert own
drop policy if exists "profiles read" on profiles;
create policy "profiles read" on profiles for select using (auth.role() = 'authenticated');
drop policy if exists "profiles upsert own" on profiles;
create policy "profiles upsert own" on profiles for insert with check (auth.uid() = id);
drop policy if exists "profiles update own" on profiles;
create policy "profiles update own" on profiles for update using (auth.uid() = id);

-- trips: members can read; anyone authed can read by invite_code via separate query (we use service or rpc); creator can insert
drop policy if exists "trips read for members" on trips;
create policy "trips read for members" on trips for select using (is_trip_member(id) or created_by = auth.uid());
drop policy if exists "trips insert self" on trips;
create policy "trips insert self" on trips for insert with check (created_by = auth.uid());
drop policy if exists "trips update creator" on trips;
create policy "trips update creator" on trips for update using (created_by = auth.uid());

-- trip_members: a user can see rows for trips they're in; can insert self
drop policy if exists "members read" on trip_members;
create policy "members read" on trip_members for select using (is_trip_member(trip_id) or user_id = auth.uid());
drop policy if exists "members insert self" on trip_members;
create policy "members insert self" on trip_members for insert with check (user_id = auth.uid());

-- media: only members can read/insert
drop policy if exists "media read" on media;
create policy "media read" on media for select using (is_trip_member(trip_id));
drop policy if exists "media insert" on media;
create policy "media insert" on media for insert with check (is_trip_member(trip_id) and user_id = auth.uid());

-- moment_rounds: members can read; only service role inserts (cron)
drop policy if exists "rounds read" on moment_rounds;
create policy "rounds read" on moment_rounds for select using (is_trip_member(trip_id));

-- push subs: own
drop policy if exists "push read own" on push_subscriptions;
create policy "push read own" on push_subscriptions for select using (user_id = auth.uid());
drop policy if exists "push insert own" on push_subscriptions;
create policy "push insert own" on push_subscriptions for insert with check (user_id = auth.uid());
drop policy if exists "push delete own" on push_subscriptions;
create policy "push delete own" on push_subscriptions for delete using (user_id = auth.uid());

-- ============ STORAGE ============
-- Run this in the SQL editor AFTER creating bucket "trip-media" (private)

insert into storage.buckets (id, name, public)
values ('trip-media', 'trip-media', false)
on conflict (id) do nothing;

drop policy if exists "trip-media read members" on storage.objects;
create policy "trip-media read members" on storage.objects for select
  using (
    bucket_id = 'trip-media'
    and is_trip_member((storage.foldername(name))[1]::uuid)
  );

drop policy if exists "trip-media insert members" on storage.objects;
create policy "trip-media insert members" on storage.objects for insert
  with check (
    bucket_id = 'trip-media'
    and auth.uid() is not null
    and is_trip_member((storage.foldername(name))[1]::uuid)
    and (storage.foldername(name))[2] = auth.uid()::text
  );
