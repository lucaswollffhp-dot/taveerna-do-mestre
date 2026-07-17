-- ════════════════════════════════════════════════════════════
--  Painel ao Vivo — combate em tempo real (iniciativa + HP)
--
--  Duas tabelas:
--   • encounters  — um combate de uma campanha (rodada, turno ativo)
--   • combatants  — participantes do combate (iniciativa, HP, CA…)
--
--  As mutações são feitas pelo Mestre no navegador; o Supabase Realtime
--  transmite as mudanças para o painel do Mestre e a visão dos jogadores.
--
--  Execute no SQL Editor DEPOIS das migrations 0001 e 0002.
-- ════════════════════════════════════════════════════════════

-- ── Tabelas ──
create table if not exists encounters (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid references campaigns(id) on delete cascade,
  name text default 'Combate',
  status text default 'active' check (status in ('active', 'ended')),
  round integer default 1,
  turn_index integer default 0,
  created_at timestamptz default now()
);

create table if not exists combatants (
  id uuid primary key default uuid_generate_v4(),
  encounter_id uuid references encounters(id) on delete cascade,
  campaign_id uuid references campaigns(id) on delete cascade,
  character_id uuid references characters(id) on delete set null,
  name text not null,
  initiative integer default 0,
  hp_current integer default 0,
  hp_max integer default 0,
  ac integer default 10,
  is_pc boolean default false,
  conditions text,
  created_at timestamptz default now()
);

create index if not exists idx_encounters_campaign on encounters(campaign_id);
create index if not exists idx_combatants_encounter on combatants(encounter_id);

-- Necessário para o Realtime enviar campaign_id também em UPDATE/DELETE
-- (usado como filtro no cliente).
alter table combatants replica identity full;
alter table encounters replica identity full;

-- ── RLS ──
alter table encounters enable row level security;
alter table combatants enable row level security;

-- Mestre: acesso total às entidades da própria campanha.
drop policy if exists master_encounters on encounters;
create policy master_encounters on encounters
  for all to authenticated
  using (public.is_campaign_master(campaign_id))
  with check (public.is_campaign_master(campaign_id));

-- Membros (e Mestre): leitura do combate ao vivo.
drop policy if exists view_encounters on encounters;
create policy view_encounters on encounters
  for select to authenticated
  using (
    public.is_campaign_master(campaign_id)
    or public.is_campaign_member(campaign_id)
  );

drop policy if exists master_combatants on combatants;
create policy master_combatants on combatants
  for all to authenticated
  using (public.is_campaign_master(campaign_id))
  with check (public.is_campaign_master(campaign_id));

drop policy if exists view_combatants on combatants;
create policy view_combatants on combatants
  for select to authenticated
  using (
    public.is_campaign_master(campaign_id)
    or public.is_campaign_member(campaign_id)
  );

-- ── Publicação Realtime (idempotente) ──
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'encounters'
  ) then
    alter publication supabase_realtime add table encounters;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'combatants'
  ) then
    alter publication supabase_realtime add table combatants;
  end if;
end $$;
