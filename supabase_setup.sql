-- OptionsBT Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New query → paste → Run

-- ── TABLES ────────────────────────────────────────────────────────────────────

-- Auto-profile for every new auth user
create table if not exists public.profiles (
  id         uuid references auth.users on delete cascade primary key,
  email      text unique not null,
  created_at timestamptz default now()
);

-- Saved sessions (one row per saved session)
create table if not exists public.sessions (
  id         bigint primary key,          -- matches session.id (Date.now())
  user_id    uuid references public.profiles on delete cascade not null,
  ticker     text not null,
  strategy   text,
  saved_at   timestamptz default now(),
  data       jsonb not null               -- full session object
);

-- Journal entries
create table if not exists public.journal_entries (
  id         text not null,              -- matches entry.id (pos.id)
  user_id    uuid references public.profiles on delete cascade not null,
  ticker     text,
  strategy   text,
  status     text default 'open',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  data       jsonb not null,             -- full journal entry object
  primary key (id, user_id)
);

-- ── ROW LEVEL SECURITY ────────────────────────────────────────────────────────

alter table public.profiles        enable row level security;
alter table public.sessions        enable row level security;
alter table public.journal_entries enable row level security;

-- Profiles
create policy "own profile select" on public.profiles for select using (auth.uid() = id);
create policy "own profile update" on public.profiles for update using (auth.uid() = id);

-- Sessions
create policy "own sessions select" on public.sessions for select using (auth.uid() = user_id);
create policy "own sessions insert" on public.sessions for insert with check (auth.uid() = user_id);
create policy "own sessions update" on public.sessions for update using (auth.uid() = user_id);
create policy "own sessions delete" on public.sessions for delete using (auth.uid() = user_id);

-- Journal
create policy "own journal select" on public.journal_entries for select using (auth.uid() = user_id);
create policy "own journal insert" on public.journal_entries for insert with check (auth.uid() = user_id);
create policy "own journal update" on public.journal_entries for update using (auth.uid() = user_id);
create policy "own journal delete" on public.journal_entries for delete using (auth.uid() = user_id);

-- ── AUTO-CREATE PROFILE ON SIGNUP ────────────────────────────────────────────

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
