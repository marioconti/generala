-- The shared table behind the scoresheet.
--
-- One row per finished game. Games in progress never come here: they belong to
-- the phone that is keeping score.
--
-- HOW TO APPLY: supabase.com -> project `el-anotador` -> SQL Editor -> New
-- query -> paste -> Run. Safe to run twice; every statement is guarded.
--
-- ON THE POLICIES BELOW: they deliberately let anyone read and write. That is
-- the price of a scoresheet nobody has to log in to — the app is opened by
-- tapping an NFC tag on a table, and asking a guest to create an account to
-- write down a score would defeat the point. The key that reaches this table
-- ships inside the page and is public by design. The worst case is somebody
-- finding it and inserting junk games; the fix is deleting rows.

create table if not exists public.games (
  id          text primary key,
  game        text not null,
  finished_at timestamptz not null,
  players     jsonb not null,
  winners     jsonb not null,
  feats       jsonb,
  updated_at  timestamptz not null default now()
);

alter table public.games enable row level security;

drop policy if exists "la mesa lee"     on public.games;
drop policy if exists "la mesa escribe" on public.games;
drop policy if exists "la mesa corrige" on public.games;
drop policy if exists "la mesa borra"   on public.games;

create policy "la mesa lee"     on public.games for select using (true);
create policy "la mesa escribe" on public.games for insert with check (true);
create policy "la mesa corrige" on public.games for update using (true);
create policy "la mesa borra"   on public.games for delete using (true);
