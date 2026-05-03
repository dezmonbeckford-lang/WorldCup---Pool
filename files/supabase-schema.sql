-- ============================================================
-- WorldPool 2026 — Supabase Database Schema
-- Run this entire file in the Supabase SQL Editor
-- ============================================================

-- 1. PROFILES (auto-created on signup)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  email text,
  created_at timestamptz default now()
);
alter table profiles enable row level security;
create policy "Users can read all profiles" on profiles for select using (true);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

-- 2. SETTINGS (admin controlled)
create table if not exists settings (
  id int primary key default 1,
  group_picks_open boolean default true,
  bracket_open boolean default false,
  updated_at timestamptz default now()
);
insert into settings (id, group_picks_open, bracket_open) values (1, true, false)
  on conflict (id) do nothing;
alter table settings enable row level security;
create policy "Anyone can read settings" on settings for select using (true);
create policy "Authenticated users can update settings" on settings for update using (auth.role() = 'authenticated');

-- 3. GROUP PICKS (user selections)
create table if not exists group_picks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  group_id text not null,           -- 'A', 'B', etc.
  first_place text,                 -- team id they picked 1st
  second_place text,                -- team id they picked 2nd
  created_at timestamptz default now(),
  unique(user_id, group_id)
);
alter table group_picks enable row level security;
create policy "Users can manage own group picks" on group_picks for all using (auth.uid() = user_id);

-- 4. GROUP RESULTS (admin entered)
create table if not exists group_results (
  group_id text primary key,
  first_place text,
  second_place text,
  updated_at timestamptz default now()
);
alter table group_results enable row level security;
create policy "Anyone can read results" on group_results for select using (true);
create policy "Authenticated can write results" on group_results for all using (auth.role() = 'authenticated');

-- 5. BRACKET ADVANCERS (teams in knockout stage, seeded by admin)
create table if not exists bracket_advancers (
  id uuid default gen_random_uuid() primary key,
  team_id text not null,
  team_name text not null,
  flag text,
  group_id text,
  seed_order int default 0
);
alter table bracket_advancers enable row level security;
create policy "Anyone can read advancers" on bracket_advancers for select using (true);
create policy "Authenticated can write advancers" on bracket_advancers for all using (auth.role() = 'authenticated');

-- 6. BRACKET PICKS (user bracket selections)
create table if not exists bracket_picks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  matchup_key text not null,        -- e.g. 'r0_m3' (round 0, match 3)
  team_id text not null,
  created_at timestamptz default now(),
  unique(user_id, matchup_key)
);
alter table bracket_picks enable row level security;
create policy "Users can manage own bracket picks" on bracket_picks for all using (auth.uid() = user_id);

-- 7. SCORES (running totals)
create table if not exists scores (
  user_id uuid references auth.users on delete cascade primary key,
  group_points int default 0,
  bracket_points int default 0,
  total_points int default 0,
  updated_at timestamptz default now()
);
alter table scores enable row level security;
create policy "Anyone can read scores" on scores for select using (true);
create policy "Authenticated can write scores" on scores for all using (auth.role() = 'authenticated');

-- ============================================================
-- Done! Your database is ready.
-- ============================================================
