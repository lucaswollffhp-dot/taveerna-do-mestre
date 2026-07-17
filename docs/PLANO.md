# Plano de Trabalho — Taverna do Mestre

Documento vivo de planejamento do desenvolvimento. Reúne o **roadmap por
sprints** e a **campanha piloto** que serve de referência para modelar,
testar e demonstrar cada funcionalidade.

---

## 1. Visão do produto

Plataforma web para planejar e conduzir campanhas de RPG de mesa (D&D 5e),
com acesso separado para **Mestre (DM)** e **Jogadores**. O diferencial é o
**modelo de visibilidade**: o Mestre mantém informação privada (segredos,
notas, história oculta) e libera progressivamente o que os jogadores enxergam
(NPCs revelados, locais descobertos, missões públicas, sessões jogadas).

| Camada       | Tecnologia                                    |
| ------------ | --------------------------------------------- |
| Frontend     | Next.js 14 (App Router) + TypeScript (strict) |
| Estilização  | Tailwind CSS + ícones lucide-react            |
| Banco / Auth | Supabase (PostgreSQL + Auth + Realtime)       |
| IA           | Anthropic API (`claude-sonnet-4-6`)           |
| Hospedagem   | Vercel                                         |

---

## 2. Roadmap por sprints

### Sprint 1 — Fundação ✅
- Setup Next.js + TypeScript strict + Tailwind + design system
- Clientes Supabase (browser, server, middleware) + tipos do banco
- Autenticação (login, registro, logout) + login com Google (OAuth)
- Middleware de proteção de rotas
- Layout base do Mestre + dashboard de campanhas
- Migrations SQL (schema + RLS) e seed da campanha piloto

### Sprint 2 — CRUD e visão do Jogador ✅
- NPCs, Locais, Missões, Sessões e Facções — CRUD completo
- Campos público/privado e revelação/descoberta progressiva
- Área do Jogador (`/play`) espelhando o RLS
- Alternância Mestre ↔ Jogador

### Polimento visual ✅
- Substituição de emojis por sistema de ícones profissional (lucide),
  centralizado em `components/ui/Icon.tsx`

### Sprint 3 — Condução ao vivo e IA 🔜
- **Painel ao Vivo**: rastreador de iniciativa e HP em tempo real
  (Supabase Realtime), controlado pelo Mestre
- **IA Assistente**: improviso de NPCs, cenas e consequências com o
  contexto da campanha (Anthropic API)
- **Loot**: módulo de itens/tesouro com atribuição a personagens

### Sprint 4 — Refino 🔮
- Views públicas no banco (reforço de privacidade por coluna)
- Convite de jogadores por link / gestão de membros
- Fichas de personagem editáveis pelo Jogador
- Exportação/impressão de material de sessão

---

## 3. Campanha piloto — "Os Três Selos do Abismo"

Usada como massa de dados de referência (ver `supabase/seed.sql`). Toda
funcionalidade nova deve ser validada contra esta campanha antes de ser
considerada pronta.

- **Sistema:** D&D 5e
- **Cenário:** Forgotten Realms — Costa Norte
- **Tom:** Fantasia heroica com mistério e horror crescente
- **Fio condutor:** Kazeth (disfarçado de **Aldric Voss**) coleta 3 Magias
  Supremas — **Carne**, **Alma** e **Vontade** — para um ritual de
  desvinculação planar.

### 3.1 Arco principal
1. **Grimório (Carne)** — pesquisado por Valdris Omechor; hoje com Vroth Calden.
2. **Joia da Alma** — guardada pelo dracolitch em Kharak-Dûm.
3. **Desafio de Vontade** — componente final (a detalhar).

### 3.2 NPCs-chave

| NPC | Tipo | Papel | Segredo |
| --- | --- | --- | --- |
| **Aldric Voss / Kazeth** | Vilão | Contratante afável em Pedra Salgada | Rakshasa infiltrado no Conselho de Luskan há 7 anos; imune a magia direta de nível ≤ 6 |
| **Vroth Calden** | Antagonista | Ex-estudioso virado carniçal | Sabe que Aldric é Rakshasa; tem o grimório de Valdris |
| **Maren Ashford** | Aliada | Dona da taverna Bigorna Afogada | Procura o filho Cael em Luskan |
| **Valdris Omechor** | Neutro | Arquimago desaparecido | Pesquisou as 3 Magias Supremas; grimório selado exige intenção genuína |
| Bram Soldura, Sira Anzol, Teodan Vex, Oswen Carpe | Aliados/Neutros | Elenco de apoio em Pedra Salgada | — |

### 3.3 Locais

- **Pedra Salgada** (vila, base inicial) — contém: Bigorna Afogada (taverna),
  Forja Soldura, A Agulha e o Anzol, Templo de Tempestus, O Último Dono.
- **Torre em Ruínas** — dungeon do arquimago; alvo da 1ª missão.
- **Floresta de Grimholt** — névoa parada, mortos-vivos, refúgio de Vroth.
- **Kharak-Dûm** — fortaleza anã; dracolitch e a Joia da Alma (2º componente).
- Posto Abandonado, Aldeia de Marren, Luskan (cidade do Conselho).

### 3.4 Facções

- **Conselho de Luskan** (política) — infiltrado por Kazeth.
- **Ordem Arcana de Luskan** (arcana) — potencial antagonista.
- **Igreja de Tempestus** (religiosa) — aliada.
- **Rede de Sira Anzol** (mercantil informal).
- **Operação de Kazeth** (oculta) — desconhecida pelos jogadores.

### 3.5 Estado de jogo (ponto de partida do piloto)

- **Sessão 1 — "A Torre em Ruínas"** (jogada): o grupo chegou a Pedra
  Salgada, aceitou o contrato de Aldric, viajou até a torre e enfrentou ratos
  gigantes nos escombros. Dois personagens contraíram Febre do Rato. Encerrou
  nos escombros, antes da porta de carvalho. 100 XP concedidos.
- **Missão ativa e visível:** "Investigar a Torre em Ruínas" (contrato de
  Aldric, 200 PO/pessoa) — 2 de 5 objetivos concluídos.
- **Loot inicial:** Adaga +1 "Presa de Valdris", Pergaminho de Mísseis
  Mágicos, 2× Poção de Cura, Grimório Selado de Valdris.

---

## 4. Como usar este documento

- Ao construir uma funcionalidade nova, escolha um recorte da campanha piloto
  para exercitá-la (ex.: o Painel ao Vivo deve conseguir rodar o combate dos
  ratos gigantes da Sessão 1).
- Se precisar de mais material de canon (mapas, estatísticas de monstros,
  falas de NPC), esse conteúdo pode ser adicionado aqui e refletido no
  `seed.sql`.
