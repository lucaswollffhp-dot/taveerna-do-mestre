-- ════════════════════════════════════════════════════════════
--  Rotação de token
--
--  Permite girar o token (útil para artes direcionais / cones).
--  O tamanho (size) já existia; a posição continua em %.
--
--  Execute no SQL Editor DEPOIS das migrations 0001–0006.
-- ════════════════════════════════════════════════════════════

alter table tokens add column if not exists rotation integer default 0;
