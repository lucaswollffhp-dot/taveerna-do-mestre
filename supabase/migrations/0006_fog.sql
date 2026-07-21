-- ════════════════════════════════════════════════════════════
--  Névoa de guerra (fog of war)
--
--  Cada cena guarda:
--   • fog_enabled  — se a névoa está ativa
--   • fog_revealed — lista de retângulos revelados (em %, {x,y,w,h})
--
--  O Mestre "pinta" áreas reveladas; os jogadores só enxergam o que
--  foi revelado. As mudanças propagam via Realtime (scenes já publicada).
--
--  Execute no SQL Editor DEPOIS das migrations 0001–0005.
-- ════════════════════════════════════════════════════════════

alter table scenes add column if not exists fog_enabled boolean default false;
alter table scenes add column if not exists fog_revealed jsonb default '[]';
