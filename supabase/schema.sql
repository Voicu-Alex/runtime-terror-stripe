-- Schema pentru catalogul de acte și ghidul general (/legi).
-- Se rulează o singură dată, în Supabase: SQL Editor → New query → Run.
--
-- Fiecare rând păstrează intrarea exact în formatul din data/catalog.json și data/ghid.json (coloana `date`),
-- ca validarea din lib/catalog.ts și lib/ghid.ts să rămână aceeași. `ordine` păstrează ordinea din fișiere.
-- Profilurile NU stau aici: profilul rămâne pe telefon (CLAUDE.md).

begin;

create table if not exists public.schimbari (
  id text primary key,
  ordine integer not null,
  date jsonb not null,
  actualizat_la timestamptz not null default now(),
  constraint schimbari_id_in_date check (jsonb_typeof(date) = 'object' and date ? 'id' and date->>'id' = id)
);

create table if not exists public.ghid (
  id text primary key references public.schimbari (id) on delete cascade,
  ordine integer not null,
  date jsonb not null,
  actualizat_la timestamptz not null default now(),
  constraint ghid_id_in_date check (jsonb_typeof(date) = 'object' and date ? 'id' and date->>'id' = id)
);

-- Oricine poate citi (catalogul e public); scrie doar cheia secretă (scripturile) sau dashboard-ul.
alter table public.schimbari enable row level security;
alter table public.ghid enable row level security;

-- Funcționează și când proiectul nu expune automat tabelele noi.
grant usage on schema public to anon, authenticated, service_role;
revoke all on public.schimbari, public.ghid from anon, authenticated;
grant select on public.schimbari, public.ghid to anon, authenticated;
grant all on public.schimbari, public.ghid to service_role;

drop policy if exists "citire publica" on public.schimbari;
create policy "citire publica" on public.schimbari for select using (true);

drop policy if exists "citire publica" on public.ghid;
create policy "citire publica" on public.ghid for select using (true);

-- actualizat_la se schimbă singur la fiecare editare din dashboard
create or replace function public.marcheaza_actualizarea() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.actualizat_la = now();
  return new;
end;
$$;

drop trigger if exists schimbari_actualizat on public.schimbari;
create trigger schimbari_actualizat before update on public.schimbari
  for each row execute function public.marcheaza_actualizarea();

drop trigger if exists ghid_actualizat on public.ghid;
create trigger ghid_actualizat before update on public.ghid
  for each row execute function public.marcheaza_actualizarea();

commit;
