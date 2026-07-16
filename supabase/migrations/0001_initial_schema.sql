-- ════════════════════════════════════════════════════════════
--  Taverna do Mestre — Schema inicial
--  Campanha de referência: "Os Três Selos do Abismo" (D&D 5e)
-- ════════════════════════════════════════════════════════════

-- 1. Extensão UUID
create extension if not exists "uuid-ossp";

-- 2. Campanhas
create table if not exists campaigns (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  system text default 'D&D 5e',
  setting text,
  tone text,
  status text default 'active' check (status in ('active', 'paused', 'completed')),
  master_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);

-- 3. Membros da campanha
create table if not exists campaign_members (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid references campaigns(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text not null check (role in ('master', 'player', 'spectator')),
  character_id uuid,
  created_at timestamptz default now(),
  unique(campaign_id, user_id)
);

-- 4. Sessões
create table if not exists sessions (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid references campaigns(id) on delete cascade,
  number integer not null,
  title text not null,
  session_date date,
  status text default 'planned' check (status in ('planned', 'played', 'cancelled')),
  master_notes text,
  public_summary text,
  xp_awarded integer default 0,
  decisions jsonb default '[]',
  created_at timestamptz default now()
);

-- 5. Facções
create table if not exists factions (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid references campaigns(id) on delete cascade,
  name text not null,
  type text,
  alignment text,
  objectives text,
  player_relationship text default 'unknown'
    check (player_relationship in ('ally', 'neutral', 'hostile', 'unknown')),
  secrets text,
  created_at timestamptz default now()
);

-- 6. Locais
create table if not exists locations (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid references campaigns(id) on delete cascade,
  name text not null,
  type text,
  region text,
  public_description text,
  master_notes text,
  discovery_status text default 'undiscovered'
    check (discovery_status in ('undiscovered', 'discovered', 'visited', 'explored')),
  parent_location_id uuid references locations(id) on delete set null,
  created_at timestamptz default now()
);

-- 7. NPCs
create table if not exists npcs (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid references campaigns(id) on delete cascade,
  name text not null,
  aliases text[],
  type text default 'neutral'
    check (type in ('ally', 'neutral', 'antagonist', 'villain', 'unknown')),
  faction_id uuid references factions(id) on delete set null,
  location_id uuid references locations(id) on delete set null,
  physical_description text,
  history text,
  motivations text,
  secrets text,
  master_notes text,
  revelation_status text default 'unknown'
    check (revelation_status in ('unknown', 'spotted', 'known', 'investigated')),
  created_at timestamptz default now()
);

-- 8. Personagens dos jogadores
create table if not exists characters (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid references campaigns(id) on delete cascade,
  player_id uuid references auth.users(id) on delete set null,
  name text not null,
  race text,
  class text,
  level integer default 1,
  hp_current integer default 10,
  hp_max integer default 10,
  ac integer default 10,
  xp_current integer default 0,
  attributes jsonb default '{"str":10,"dex":10,"con":10,"int":10,"wis":10,"cha":10}',
  conditions jsonb default '[]',
  inventory jsonb default '[]',
  gold integer default 0,
  background text,
  secrets text,
  created_at timestamptz default now()
);

-- Vínculo tardio: membro → personagem
alter table campaign_members
  drop constraint if exists campaign_members_character_id_fkey;
alter table campaign_members
  add constraint campaign_members_character_id_fkey
  foreign key (character_id) references characters(id) on delete set null;

-- 9. Missões
create table if not exists quests (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid references campaigns(id) on delete cascade,
  title text not null,
  description text,
  type text default 'secondary'
    check (type in ('main', 'secondary', 'personal', 'levelup')),
  status text default 'available'
    check (status in ('available', 'active', 'completed', 'failed', 'abandoned')),
  contractor_id uuid references npcs(id) on delete set null,
  location_id uuid references locations(id) on delete set null,
  objectives jsonb default '[]',
  reward_gold integer default 0,
  reward_xp integer default 0,
  reward_items text,
  reward_other text,
  is_visible_to_players boolean default false,
  created_at timestamptz default now()
);

-- 10. Itens e loot
create table if not exists items (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid references campaigns(id) on delete cascade,
  name text not null,
  type text,
  value_gp integer default 0,
  weight_kg numeric(5,2) default 0,
  magical_properties text,
  holder_id uuid references characters(id) on delete set null,
  origin_session_id uuid references sessions(id) on delete set null,
  status text default 'active'
    check (status in ('active', 'sold', 'destroyed', 'given', 'lost')),
  is_special boolean default false,
  created_at timestamptz default now()
);

-- 11. Relações entre entidades
create table if not exists entity_relations (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid references campaigns(id) on delete cascade,
  entity_a_type text not null,
  entity_a_id uuid not null,
  entity_b_type text not null,
  entity_b_id uuid not null,
  relation_type text not null,
  description text,
  created_at timestamptz default now()
);

-- 12. Aparições de NPCs em sessões
create table if not exists npc_appearances (
  id uuid primary key default uuid_generate_v4(),
  npc_id uuid references npcs(id) on delete cascade,
  session_id uuid references sessions(id) on delete cascade,
  notes text,
  created_at timestamptz default now()
);

-- Índices úteis para consultas por campanha
create index if not exists idx_sessions_campaign on sessions(campaign_id);
create index if not exists idx_factions_campaign on factions(campaign_id);
create index if not exists idx_locations_campaign on locations(campaign_id);
create index if not exists idx_npcs_campaign on npcs(campaign_id);
create index if not exists idx_characters_campaign on characters(campaign_id);
create index if not exists idx_quests_campaign on quests(campaign_id);
create index if not exists idx_items_campaign on items(campaign_id);
create index if not exists idx_members_campaign on campaign_members(campaign_id);
create index if not exists idx_members_user on campaign_members(user_id);
