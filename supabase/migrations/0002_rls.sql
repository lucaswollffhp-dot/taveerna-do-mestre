-- ════════════════════════════════════════════════════════════
--  Row Level Security (RLS)
--
--  Modelo:
--   • Mestre (dono da campanha) tem acesso total às entidades da
--     própria campanha.
--   • Jogadores/membros veem apenas registros liberados.
--
--  NOTA sobre privacidade de COLUNAS: o RLS controla acesso por
--  LINHA, não por coluna. Campos privados (history, secrets,
--  master_notes...) ainda existem nas linhas visíveis aos jogadores.
--  A separação público/privado é reforçada na camada da aplicação
--  (o cliente do jogador nunca seleciona colunas privadas). Para
--  reforço no banco, criar VIEWS públicas é o próximo passo (Sprint 3).
-- ════════════════════════════════════════════════════════════

-- ── Funções auxiliares (security definer evita recursão de RLS) ──

create or replace function public.is_campaign_master(cid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from campaigns
    where id = cid and master_id = auth.uid()
  );
$$;

create or replace function public.is_campaign_member(cid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from campaign_members
    where campaign_id = cid and user_id = auth.uid()
  );
$$;

-- ── Habilitar RLS ──
alter table campaigns          enable row level security;
alter table campaign_members   enable row level security;
alter table sessions           enable row level security;
alter table factions           enable row level security;
alter table locations          enable row level security;
alter table npcs               enable row level security;
alter table characters         enable row level security;
alter table quests             enable row level security;
alter table items              enable row level security;
alter table entity_relations   enable row level security;
alter table npc_appearances    enable row level security;

-- ══════════════ CAMPANHAS ══════════════
drop policy if exists master_full_access on campaigns;
create policy master_full_access on campaigns
  for all to authenticated
  using (master_id = auth.uid())
  with check (master_id = auth.uid());

drop policy if exists member_view_campaigns on campaigns;
create policy member_view_campaigns on campaigns
  for select to authenticated
  using (public.is_campaign_member(id));

-- ══════════════ MEMBROS ══════════════
drop policy if exists master_manage_members on campaign_members;
create policy master_manage_members on campaign_members
  for all to authenticated
  using (public.is_campaign_master(campaign_id))
  with check (public.is_campaign_master(campaign_id));

drop policy if exists member_view_own_membership on campaign_members;
create policy member_view_own_membership on campaign_members
  for select to authenticated
  using (user_id = auth.uid());

-- ══════════════ SESSÕES ══════════════
drop policy if exists master_sessions on sessions;
create policy master_sessions on sessions
  for all to authenticated
  using (public.is_campaign_master(campaign_id))
  with check (public.is_campaign_master(campaign_id));

drop policy if exists player_view_played_sessions on sessions;
create policy player_view_played_sessions on sessions
  for select to authenticated
  using (status = 'played' and public.is_campaign_member(campaign_id));

-- ══════════════ FACÇÕES ══════════════
drop policy if exists master_factions on factions;
create policy master_factions on factions
  for all to authenticated
  using (public.is_campaign_master(campaign_id))
  with check (public.is_campaign_master(campaign_id));

drop policy if exists player_view_known_factions on factions;
create policy player_view_known_factions on factions
  for select to authenticated
  using (
    player_relationship <> 'unknown'
    and public.is_campaign_member(campaign_id)
  );

-- ══════════════ LOCAIS ══════════════
drop policy if exists master_locations on locations;
create policy master_locations on locations
  for all to authenticated
  using (public.is_campaign_master(campaign_id))
  with check (public.is_campaign_master(campaign_id));

drop policy if exists player_view_discovered_locations on locations;
create policy player_view_discovered_locations on locations
  for select to authenticated
  using (
    discovery_status <> 'undiscovered'
    and public.is_campaign_member(campaign_id)
  );

-- ══════════════ NPCs ══════════════
drop policy if exists master_npcs on npcs;
create policy master_npcs on npcs
  for all to authenticated
  using (public.is_campaign_master(campaign_id))
  with check (public.is_campaign_master(campaign_id));

drop policy if exists player_view_known_npcs on npcs;
create policy player_view_known_npcs on npcs
  for select to authenticated
  using (
    revelation_status <> 'unknown'
    and public.is_campaign_member(campaign_id)
  );

-- ══════════════ PERSONAGENS ══════════════
drop policy if exists master_characters on characters;
create policy master_characters on characters
  for all to authenticated
  using (public.is_campaign_master(campaign_id))
  with check (public.is_campaign_master(campaign_id));

drop policy if exists player_own_character on characters;
create policy player_own_character on characters
  for all to authenticated
  using (player_id = auth.uid())
  with check (player_id = auth.uid());

-- ══════════════ MISSÕES ══════════════
drop policy if exists master_quests on quests;
create policy master_quests on quests
  for all to authenticated
  using (public.is_campaign_master(campaign_id))
  with check (public.is_campaign_master(campaign_id));

drop policy if exists player_view_public_quests on quests;
create policy player_view_public_quests on quests
  for select to authenticated
  using (
    is_visible_to_players = true
    and public.is_campaign_member(campaign_id)
  );

-- ══════════════ ITENS / LOOT ══════════════
drop policy if exists master_items on items;
create policy master_items on items
  for all to authenticated
  using (public.is_campaign_master(campaign_id))
  with check (public.is_campaign_master(campaign_id));

drop policy if exists player_view_held_items on items;
create policy player_view_held_items on items
  for select to authenticated
  using (
    holder_id in (
      select id from characters where player_id = auth.uid()
    )
  );

-- ══════════════ RELAÇÕES (privado do Mestre) ══════════════
drop policy if exists master_entity_relations on entity_relations;
create policy master_entity_relations on entity_relations
  for all to authenticated
  using (public.is_campaign_master(campaign_id))
  with check (public.is_campaign_master(campaign_id));

-- ══════════════ APARIÇÕES DE NPC (privado do Mestre) ══════════════
drop policy if exists master_npc_appearances on npc_appearances;
create policy master_npc_appearances on npc_appearances
  for all to authenticated
  using (
    exists (
      select 1 from npcs
      where npcs.id = npc_appearances.npc_id
        and public.is_campaign_master(npcs.campaign_id)
    )
  )
  with check (
    exists (
      select 1 from npcs
      where npcs.id = npc_appearances.npc_id
        and public.is_campaign_master(npcs.campaign_id)
    )
  );
