-- ════════════════════════════════════════════════════════════
--  VTT — Mesa tática (cenas + tokens) e arte de token
--
--  • token_image_url em characters e npcs (arte da "moeda")
--  • scenes  — uma cena/mesa com um mapa de fundo
--  • tokens  — peças posicionadas numa cena (x, y), movíveis
--  • Bucket de Storage 'assets' para mapas e arte de token
--
--  Execute no SQL Editor DEPOIS das migrations 0001–0003.
-- ════════════════════════════════════════════════════════════

-- ── Arte de token nas fichas ──
alter table characters add column if not exists token_image_url text;
alter table npcs        add column if not exists token_image_url text;

-- ── Cenas (mesas com mapa) ──
create table if not exists scenes (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid references campaigns(id) on delete cascade,
  name text not null default 'Cena',
  map_image_url text,
  grid_size integer default 70,
  grid_enabled boolean default false,
  is_active boolean default false,
  created_at timestamptz default now()
);

-- ── Tokens numa cena ──
create table if not exists tokens (
  id uuid primary key default uuid_generate_v4(),
  scene_id uuid references scenes(id) on delete cascade,
  campaign_id uuid references campaigns(id) on delete cascade,
  name text not null default '',
  image_url text,
  color text default '#8b1a1a',
  x double precision default 50,
  y double precision default 50,
  size integer default 70,
  ref_type text default 'custom' check (ref_type in ('character', 'npc', 'custom')),
  ref_id uuid,
  controlled_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

create index if not exists idx_scenes_campaign on scenes(campaign_id);
create index if not exists idx_tokens_scene on tokens(scene_id);

-- Necessário para o Realtime enviar campaign_id em UPDATE/DELETE.
alter table scenes replica identity full;
alter table tokens replica identity full;

-- ── RLS ──
alter table scenes enable row level security;
alter table tokens enable row level security;

-- Cenas: Mestre total; membros leem.
drop policy if exists master_scenes on scenes;
create policy master_scenes on scenes
  for all to authenticated
  using (public.is_campaign_master(campaign_id))
  with check (public.is_campaign_master(campaign_id));

drop policy if exists view_scenes on scenes;
create policy view_scenes on scenes
  for select to authenticated
  using (
    public.is_campaign_master(campaign_id)
    or public.is_campaign_member(campaign_id)
  );

-- Tokens: Mestre total; membros leem; jogador atualiza o token que controla.
drop policy if exists master_tokens on tokens;
create policy master_tokens on tokens
  for all to authenticated
  using (public.is_campaign_master(campaign_id))
  with check (public.is_campaign_master(campaign_id));

drop policy if exists view_tokens on tokens;
create policy view_tokens on tokens
  for select to authenticated
  using (
    public.is_campaign_master(campaign_id)
    or public.is_campaign_member(campaign_id)
  );

drop policy if exists move_own_token on tokens;
create policy move_own_token on tokens
  for update to authenticated
  using (controlled_by = auth.uid())
  with check (controlled_by = auth.uid());

-- ── Publicação Realtime (idempotente) ──
do $$
begin
  if not exists (select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'scenes') then
    alter publication supabase_realtime add table scenes;
  end if;
  if not exists (select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'tokens') then
    alter publication supabase_realtime add table tokens;
  end if;
end $$;

-- ── Storage: bucket público 'assets' para mapas e tokens ──
insert into storage.buckets (id, name, public)
values ('assets', 'assets', true)
on conflict (id) do nothing;

-- Leitura pública; escrita/edição/remoção apenas por usuários autenticados.
drop policy if exists assets_public_read on storage.objects;
create policy assets_public_read on storage.objects
  for select to public
  using (bucket_id = 'assets');

drop policy if exists assets_auth_insert on storage.objects;
create policy assets_auth_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'assets');

drop policy if exists assets_auth_update on storage.objects;
create policy assets_auth_update on storage.objects
  for update to authenticated
  using (bucket_id = 'assets');

drop policy if exists assets_auth_delete on storage.objects;
create policy assets_auth_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'assets');
