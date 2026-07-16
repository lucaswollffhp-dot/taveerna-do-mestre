-- ════════════════════════════════════════════════════════════
--  Seed — Campanha "Os Três Selos do Abismo"
--
--  Pré-requisito: já deve existir um usuário no Supabase Auth para
--  ser o Mestre. Ajuste o e-mail em `master_email` abaixo, ou deixe
--  em branco ('') para usar o primeiro usuário cadastrado.
--
--  Execute no SQL Editor do Supabase APÓS aplicar as migrations.
--  Idempotente: apaga e recria a campanha de exemplo a cada execução.
-- ════════════════════════════════════════════════════════════

do $$
declare
  master_email text := 'lucas.wollffhp@gmail.com';
  v_master uuid;
  v_campaign uuid;
  -- locais
  loc_pedra uuid; loc_bigorna uuid; loc_forja uuid; loc_agulha uuid;
  loc_templo uuid; loc_dono uuid; loc_torre uuid; loc_grimholt uuid;
  loc_posto uuid; loc_marren uuid; loc_luskan uuid; loc_kharak uuid;
  -- npcs
  npc_aldric uuid; npc_vroth uuid; npc_maren uuid; npc_valdris uuid;
begin
  -- Resolve o Mestre
  if master_email <> '' then
    select id into v_master from auth.users where email = master_email limit 1;
  end if;
  if v_master is null then
    select id into v_master from auth.users order by created_at limit 1;
  end if;
  if v_master is null then
    raise exception 'Nenhum usuário encontrado no auth.users. Crie uma conta antes de rodar o seed.';
  end if;

  -- Limpa execução anterior do seed (cascade cuida das entidades filhas)
  delete from campaigns where name = 'Os Três Selos do Abismo' and master_id = v_master;

  -- Campanha
  insert into campaigns (name, description, system, setting, tone, status, master_id)
  values (
    'Os Três Selos do Abismo',
    'Kazeth (Aldric Voss) coleta 3 Magias Supremas para um ritual de desvinculação planar.',
    'D&D 5e',
    'Forgotten Realms — Costa Norte',
    'Fantasia heroica com mistério e horror crescente',
    'active',
    v_master
  ) returning id into v_campaign;

  -- Mestre como membro
  insert into campaign_members (campaign_id, user_id, role)
  values (v_campaign, v_master, 'master');

  -- ── Locais ──
  insert into locations (campaign_id, name, type, region, discovery_status, public_description)
  values (v_campaign, 'Pedra Salgada', 'village', 'Costa Norte', 'visited', null)
  returning id into loc_pedra;

  insert into locations (campaign_id, name, type, discovery_status, public_description, parent_location_id)
  values (v_campaign, 'Bigorna Afogada', 'tavern', 'visited', 'Taverna sobre fundações de estaleiro antigo. Bigorna enferrujada na parede.', loc_pedra)
  returning id into loc_bigorna;

  insert into locations (campaign_id, name, type, discovery_status, parent_location_id)
  values (v_campaign, 'Forja Soldura', 'shop', 'visited', loc_pedra) returning id into loc_forja;

  insert into locations (campaign_id, name, type, discovery_status, parent_location_id)
  values (v_campaign, 'A Agulha e o Anzol', 'shop', 'visited', loc_pedra) returning id into loc_agulha;

  insert into locations (campaign_id, name, type, discovery_status, parent_location_id)
  values (v_campaign, 'Templo de Tempestus', 'temple', 'visited', loc_pedra) returning id into loc_templo;

  insert into locations (campaign_id, name, type, discovery_status, parent_location_id)
  values (v_campaign, 'O Último Dono', 'shop', 'visited', loc_pedra) returning id into loc_dono;

  insert into locations (campaign_id, name, type, discovery_status, public_description)
  values (v_campaign, 'Torre em Ruínas', 'dungeon', 'visited', 'Torre destruída de arquimago antigo. Biblioteca subterrânea. Scriptorium com esqueletos guardiões.')
  returning id into loc_torre;

  insert into locations (campaign_id, name, type, discovery_status, public_description)
  values (v_campaign, 'Floresta de Grimholt', 'wilderness', 'visited', 'Floresta densa. Fauna ausente. Névoa que não se move. Mortos-vivos errantes.')
  returning id into loc_grimholt;

  insert into locations (campaign_id, name, type, discovery_status)
  values (v_campaign, 'Posto Abandonado', 'point_of_interest', 'undiscovered') returning id into loc_posto;

  insert into locations (campaign_id, name, type, discovery_status)
  values (v_campaign, 'Aldeia de Marren', 'village', 'discovered') returning id into loc_marren;

  insert into locations (campaign_id, name, type, discovery_status)
  values (v_campaign, 'Luskan', 'city', 'discovered') returning id into loc_luskan;

  insert into locations (campaign_id, name, type, discovery_status, master_notes)
  values (v_campaign, 'Kharak-Dûm', 'dungeon', 'undiscovered', 'Fortaleza anã. Dracolitch habitante. Joia da Alma — 2º componente do ritual de Kazeth.')
  returning id into loc_kharak;

  -- ── NPCs ──
  insert into npcs (campaign_id, name, aliases, type, location_id, revelation_status,
    physical_description, history, motivations, secrets)
  values (v_campaign, 'Aldric Voss', array['Kazeth'], 'villain', loc_bigorna, 'known',
    'Homem de meia-idade, elegante, cabelos grisalhos, luvas de couro que nunca tira. Nunca é visto comendo.',
    'Rakshasa infiltrado no Conselho de Luskan há 7 anos. Nome verdadeiro: Kazeth.',
    'Coletar 3 Magias Supremas para ritual de desvinculação planar.',
    'Imune a magia direta nível 6 ou inferior. Toca os próprios dedos em sequência quando mente.')
  returning id into npc_aldric;

  insert into npcs (campaign_id, name, type, location_id, revelation_status,
    physical_description, history, secrets)
  values (v_campaign, 'Vroth Calden', 'antagonist', loc_grimholt, 'investigated',
    'Carniçal de pele roxa, olhos amarelos brilhantes, manchas permanentes de tinta nos dedos das mãos.',
    'Ex-estudioso da Ordem Arcana. Tinha Febre Cinzenta terminal. Tentou usar transformação em carniçal como cura temporária. Armadilha sem saída.',
    'Sabe que Aldric Voss é Rakshasa. Conhece parcialmente o plano dos 3 selos.')
  returning id into npc_vroth;

  insert into npcs (campaign_id, name, type, location_id, revelation_status, physical_description, motivations)
  values (v_campaign, 'Maren Ashford', 'ally', loc_bigorna, 'known',
    'Mulher de 50 anos, cabelos brancos curtos, avental permanentemente limpo. Expressão de atenção total disfarçada de cansaço.',
    'Proteger Pedra Salgada. Encontrar seu filho Cael em Luskan.')
  returning id into npc_maren;

  insert into npcs (campaign_id, name, type, location_id, revelation_status, physical_description)
  values
    (v_campaign, 'Bram Soldura', 'ally', loc_forja, 'known',
     'Ferreiro de 1,75m, ombros largos, falta a primeira falange do indicador direito. Sempre com fuligem nas têmporas.'),
    (v_campaign, 'Sira Anzol', 'neutral', loc_agulha, 'known',
     'Mulher de 1,62m, magra, cabelos negros com fios brancos, sempre dois palitos de madeira cruzados no cabelo.'),
    (v_campaign, 'Teodan Vex', 'ally', loc_templo, 'known',
     'Sacerdote de Tempestus, cabeça raspada, robes azul-marinho com bordado de ondas brancas.'),
    (v_campaign, 'Oswen Carpe', 'ally', loc_dono, 'known',
     '1,55m, cabelos ruivos irregulares, olhos castanho-dourado com reflexo incomum. Sempre com lupa no bolso.');

  insert into npcs (campaign_id, name, type, revelation_status, physical_description, secrets)
  values (v_campaign, 'Valdris Omechor', 'neutral', 'spotted',
    'Desconhecido (desaparecido). Arquimago de reputação regional. Símbolo pessoal: olho com sete raios.',
    'Pesquisou as 3 Magias Supremas (Carne, Alma, Vontade). Destino desconhecido. Grimório selado por ele exige intenção genuína para abrir.')
  returning id into npc_valdris;

  -- ── Facções ──
  insert into factions (campaign_id, name, type, player_relationship, objectives, secrets)
  values
    (v_campaign, 'Conselho de Luskan', 'política', 'neutral', 'Governar a Costa Norte.', 'Infiltrado por Kazeth.'),
    (v_campaign, 'Ordem Arcana de Luskan', 'arcana', 'neutral', 'Preservar e estudar magia.', 'Potencialmente antagonista.'),
    (v_campaign, 'Igreja de Tempestus', 'religiosa', 'ally', 'Proteger os que vivem do mar.', null),
    (v_campaign, 'Rede de Sira Anzol', 'criminal/mercantil', 'neutral', 'Comércio informal na costa.', null),
    (v_campaign, 'Operação de Kazeth', 'oculta', 'unknown', 'Reunir as 3 Magias Supremas.', 'Desconhecida pelos jogadores.');

  -- ── Missões ──
  insert into quests (campaign_id, title, type, status, is_visible_to_players, description)
  values (v_campaign, 'Os Três Selos do Abismo', 'main', 'active', false,
    'Kazeth (Aldric Voss) está coletando 3 Magias Supremas para ritual de desvinculação planar. Grimório (Carne) → Joia do Dracolitch (Alma) → Desafio de Vontade.');

  insert into quests (campaign_id, title, type, status, is_visible_to_players, description,
    contractor_id, location_id, objectives, reward_gold, reward_xp)
  values (v_campaign, 'Investigar a Torre em Ruínas', 'main', 'active', true,
    'Contrato de Aldric Voss: investigar torre antiga a leste de Pedra Salgada. 200 PO por pessoa.',
    npc_aldric, loc_torre,
    '[{"text":"Chegar à torre","completed":true},
      {"text":"Explorar os escombros externos","completed":true},
      {"text":"Entrar pela porta de carvalho","completed":false},
      {"text":"Explorar o interior completo","completed":false},
      {"text":"Reportar ao contratante","completed":false}]'::jsonb,
    200, 0);

  insert into quests (campaign_id, title, type, status, is_visible_to_players, description, location_id)
  values (v_campaign, 'Rastrear Vroth Calden', 'secondary', 'available', false,
    'Vroth fugiu com o grimório de Valdris. Rastrear até o Posto Abandonado.', loc_posto);

  insert into quests (campaign_id, title, type, status, is_visible_to_players, description, reward_gold)
  values (v_campaign, 'O Caderno de Bram', 'secondary', 'available', false,
    'Bram suspeita de cobrança irregular de impostos pelo Conselho de Luskan.', 15);

  insert into quests (campaign_id, title, type, status, is_visible_to_players, description, location_id)
  values (v_campaign, 'As Velas que Não Apagam', 'secondary', 'available', false,
    'Ritual não autorizado no Templo de Tempestus. Teodan precisa investigar.', loc_templo);

  -- ── Sessão jogada ──
  insert into sessions (campaign_id, number, title, status, public_summary, master_notes, xp_awarded)
  values (v_campaign, 1, 'A Torre em Ruínas', 'played',
    'O grupo chegou a Pedra Salgada, aceitou o contrato de Aldric Voss, viajou até a torre e enfrentou ratos gigantes nos escombros externos. Dois personagens contraíram Febre do Rato. Sessão encerrada com o grupo nos escombros.',
    'Grupo demorou nos escombros. Não chegaram ao corredor. Próxima sessão começa com a porta de carvalho. Não interagiram com Aldric além do briefing.',
    100);

  -- ── Loot ──
  insert into items (campaign_id, name, type, magical_properties, is_special, status)
  values
    (v_campaign, 'Adaga +1 "Presa de Valdris"', 'arma', '+1 de bônus mágico', true, 'active'),
    (v_campaign, 'Pergaminho de Mísseis Mágicos', 'pergaminho', 'Conjura Mísseis Mágicos', false, 'active'),
    (v_campaign, 'Poção de Cura', 'poção', 'Recupera 2d4+2 PV', false, 'active'),
    (v_campaign, 'Poção de Cura', 'poção', 'Recupera 2d4+2 PV', false, 'active'),
    (v_campaign, 'Grimório Selado de Valdris', 'item especial', 'Selado — exige intenção genuína para abrir', true, 'active');

  raise notice 'Seed concluído para a campanha % (Mestre %).', v_campaign, v_master;
end $$;
