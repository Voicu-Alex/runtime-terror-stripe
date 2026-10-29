-- Actele brute, interpretările propuse de model, rulările de descoperire și cursorul surselor.
-- Se rulează cu `npm run legi:migreaza` (scripts/legi/migreaza.mjs, prin SUPABASE_DB_URL) sau se lipește
-- în Supabase: SQL Editor → New query → Run. E idempotent: se poate rula de mai multe ori.
--
-- Nu depinde de tabelele `schimbari` și `ghid` (PR #30): intrările aprobate ajung acolo prin cod,
-- iar `interpretari.schimbare_ids` ține doar id-urile, fără cheie străină.

begin;

-- Un act descoperit pe o sursă oficială. `id` = '<sursa>:<id în sursă>', de ex. 'portal:315641'.
create table if not exists public.acte (
  id text primary key,
  sursa text not null check (sursa in ('portal', 'sgg', 'cdep')),
  sursa_id text not null,
  tip_act text,                      -- LEGE, ORDONANȚĂ DE URGENȚĂ, HOTĂRÂRE, ORDIN... așa cum scrie pe Portal
  numar text,
  an integer,
  titlu text not null,
  emitent text,
  mo_ref text,                       -- „MO 886 / 22 oct 2026”, formatul din data/catalog.json
  publicat_la date,
  data_vigoare date,
  stare_legislativa text not null default 'adoptat'
    check (stare_legislativa in ('proiect', 'adoptat', 'in_vigoare', 'abrogat')),
  url text not null,                 -- linkul stabil (DetaliiDocument/<id> sau anunțul SGG)
  url_pdf text,
  text text,                         -- textul curățat de HTML; la formele consolidate poate avea câțiva MB
  text_hash text,                    -- sha256 pe text, ca să vedem când se schimbă forma consolidată
  lungime integer,
  articole jsonb,                    -- [{ "nr": "art. 170", "inceput": 1234, "sfarsit": 2345 }], offseturi în `text`
  termen_consultare date,            -- doar la proiecte
  triaj jsonb,                       -- { "reguli": {...}, "model": { "atinge_banii": true, "motiv": "...", "model": "...", "la": "..." } }
  stare_procesare text not null default 'nou'
    check (stare_procesare in ('nou', 'respins_reguli', 'candidat', 'triat_nu', 'triat_da', 'interpretat', 'aprobat', 'respins')),
  descoperit_la timestamptz not null default now(),
  actualizat_la timestamptz not null default now()
);
create index if not exists acte_stare_procesare on public.acte (stare_procesare);
create index if not exists acte_tip_act on public.acte (tip_act);
create index if not exists acte_publicat_la on public.acte (publicat_la desc);

-- O propunere a modelului pentru un act, în formatul din eval/interpretare/instructiuni.md.
create table if not exists public.interpretari (
  id bigserial primary key,
  act_id text not null references public.acte (id) on delete cascade,
  model text not null,               -- claude-sonnet-5-5, claude-haiku-5-5...
  driver text not null check (driver in ('subagent', 'api')),
  instructiuni_versiune text not null,
  rezultat jsonb not null,           -- obiectul JSON întors de model
  verificari jsonb,                  -- rezultatul verificărilor automate (lib/verificari-interpretare.ts)
  stare text not null default 'propus' check (stare in ('propus', 'aprobat', 'respins')),
  nota_revizor text,
  schimbare_ids text[],              -- id-urile intrărilor scrise în catalog la aprobare
  creat_la timestamptz not null default now(),
  decis_la timestamptz
);
create index if not exists interpretari_act_id on public.interpretari (act_id);
create index if not exists interpretari_stare on public.interpretari (stare);

-- Jurnalul rulărilor de descoperire: dovada că am stat sub limită.
create table if not exists public.rulari (
  id bigserial primary key,
  sursa text not null,
  mod text not null,                 -- 'ids' sau 'interval'
  parametri jsonb,
  inceput timestamptz not null default now(),
  sfarsit timestamptz,
  cereri integer not null default 0,
  status_200 integer not null default 0,
  status_404 integer not null default 0,
  status_alte integer not null default 0,
  acte_noi integer not null default 0,
  acte_actualizate integer not null default 0,
  erori jsonb
);

-- Ultimul id vizitat pe fiecare sursă, ca rulările să se poată relua.
create table if not exists public.cursor_surse (
  sursa text primary key,
  ultimul_id bigint not null,
  actualizat_la timestamptz not null default now()
);

-- Actele sunt publice (textele oficiale nu sunt protejate de drept de autor). Restul doar cu cheia secretă:
-- propunerile neaprobate nu trebuie să fie vizibile.
alter table public.acte enable row level security;
alter table public.interpretari enable row level security;
alter table public.rulari enable row level security;
alter table public.cursor_surse enable row level security;

grant usage on schema public to anon, authenticated, service_role;
revoke all on public.acte, public.interpretari, public.rulari, public.cursor_surse from anon, authenticated;
grant select on public.acte to anon, authenticated;
grant all on public.acte, public.interpretari, public.rulari, public.cursor_surse to service_role;
grant usage, select on all sequences in schema public to service_role;

drop policy if exists "citire publica" on public.acte;
create policy "citire publica" on public.acte for select using (true);

-- actualizat_la se schimbă singur (aceeași funcție ca în supabase/schema.sql, redefinită ca să nu depindem de el)
create or replace function public.marcheaza_actualizarea() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.actualizat_la = now();
  return new;
end;
$$;

drop trigger if exists acte_actualizat on public.acte;
create trigger acte_actualizat before update on public.acte
  for each row execute function public.marcheaza_actualizarea();

drop trigger if exists cursor_surse_actualizat on public.cursor_surse;
create trigger cursor_surse_actualizat before update on public.cursor_surse
  for each row execute function public.marcheaza_actualizarea();

commit;
