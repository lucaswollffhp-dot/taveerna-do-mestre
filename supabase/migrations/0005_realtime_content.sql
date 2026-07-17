-- ════════════════════════════════════════════════════════════
--  Realtime nas tabelas de conteúdo — para o ambiente de jogo
--  atualizar os jogadores na hora quando o Mestre revela algo
--  (NPC revelado, missão liberada, local descoberto, loot, ficha…).
--
--  O RLS continua filtrando: cada jogador só recebe eventos das
--  linhas que já pode enxergar.
--
--  Execute no SQL Editor DEPOIS das migrations 0001–0004.
-- ════════════════════════════════════════════════════════════

do $$
declare
  t text;
begin
  foreach t in array array[
    'npcs', 'quests', 'locations', 'sessions', 'factions',
    'items', 'characters'
  ]
  loop
    -- replica identity full: garante campaign_id no payload de UPDATE/DELETE
    execute format('alter table %I replica identity full', t);
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table %I', t);
    end if;
  end loop;
end $$;
