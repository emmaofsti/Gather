-- Trip board: collaborative notes, links, and pinned "peak" photos

create table if not exists trip_boards (
  trip_id uuid primary key references trips(id) on delete cascade,
  notes text not null default '',
  updated_at timestamptz default now()
);
alter table trip_boards enable row level security;

drop policy if exists "boards read" on trip_boards;
create policy "boards read" on trip_boards for select using (is_trip_member(trip_id));
drop policy if exists "boards insert" on trip_boards;
create policy "boards insert" on trip_boards for insert with check (is_trip_member(trip_id));
drop policy if exists "boards update" on trip_boards;
create policy "boards update" on trip_boards for update using (is_trip_member(trip_id));

create table if not exists trip_links (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  title text,
  url text not null,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);
alter table trip_links enable row level security;

drop policy if exists "links read" on trip_links;
create policy "links read" on trip_links for select using (is_trip_member(trip_id));
drop policy if exists "links insert" on trip_links;
create policy "links insert" on trip_links for insert with check (is_trip_member(trip_id) and created_by = auth.uid());
drop policy if exists "links delete" on trip_links;
create policy "links delete" on trip_links for delete using (is_trip_member(trip_id));

alter table media add column if not exists is_peak boolean not null default false;

drop policy if exists "media update peak" on media;
create policy "media update peak" on media for update using (is_trip_member(trip_id));
