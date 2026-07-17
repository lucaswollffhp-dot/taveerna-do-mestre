# Taverna do Mestre

Plataforma web para planejamento e condução de campanhas de RPG de mesa, com
acesso separado para **Mestre (DM)** e **Jogadores**. Construída sobre a
campanha de referência **"Os Três Selos do Abismo"** (D&D 5e, Forgotten Realms).

## Stack

| Camada        | Tecnologia                                      |
| ------------- | ----------------------------------------------- |
| Frontend      | Next.js 14 (App Router) + TypeScript (strict)   |
| Estilização   | Tailwind CSS + ícones lucide-react               |
| Banco / Auth  | Supabase (PostgreSQL + Auth + Realtime)          |
| IA            | Anthropic API (`claude-sonnet-4-6`)              |
| Hospedagem    | Vercel                                           |

## Status do desenvolvimento

**Sprint 1 — Fundação ✅ (implementado)**

- [x] Setup Next.js 14 + TypeScript strict + Tailwind com o design system
- [x] Clientes Supabase (browser, server, middleware) + tipos do banco
- [x] Autenticação (login, registro, logout) via Supabase Auth
- [x] Middleware de proteção de rotas
- [x] Layout base do Mestre com header e sidebar de campanha
- [x] Dashboard listando campanhas + criação rápida de campanha
- [x] Migrations SQL (schema + RLS) e seed da campanha de exemplo

**Sprint 2 — CRUD e visão do Jogador ✅ (implementado)**

- [x] NPCs: CRUD completo, campos público/privado e revelação progressiva
- [x] Locais: CRUD completo, descoberta progressiva e aninhamento (sublocais)
- [x] Missões: CRUD, checklist de objetivos, recompensas e visibilidade
- [x] Sessões: CRUD, resumo público × notas privadas do Mestre
- [x] Facções: CRUD, relação com jogadores e segredos
- [x] Área do Jogador (`/play`): vê apenas conteúdo liberado — NPCs revelados,
      locais descobertos, missões públicas, sessões jogadas e a própria ficha
- [x] Alternância Mestre ↔ Jogador no header
- [x] Login com Google (OAuth via Supabase)
- [x] Sistema de ícones profissional (lucide) centralizado em `components/ui/Icon.tsx`
- [x] Loot: CRUD de itens/tesouro, situação (em posse/vendido/…) e vínculo a personagens

Próximos sprints (3–4): painel ao vivo (iniciativa/HP em tempo real) e IA
integrada (improviso com contexto). O plano de trabalho detalhado e a campanha
piloto de referência ficam em [`docs/PLANO.md`](docs/PLANO.md). Veja a sidebar —
módulos ainda não implementados mostram um placeholder "em breve".

## Como rodar localmente

### 1. Instalar dependências

```bash
npm install
```

### 2. Criar um projeto Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Em **Project Settings → API**, copie a **Project URL** e a **anon key**.
3. Copie o arquivo de exemplo e preencha as variáveis:

```bash
cp .env.local.example .env.local
```

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
ANTHROPIC_API_KEY=...            # usado a partir do Sprint 3 (IA)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Aplicar as migrations

No **SQL Editor** do Supabase, execute em ordem:

1. `supabase/migrations/0001_initial_schema.sql` — tabelas e índices
2. `supabase/migrations/0002_rls.sql` — Row Level Security

### 4. (Opcional) Popular a campanha de exemplo

Crie sua conta no app primeiro (passo 5), depois rode `supabase/seed.sql` no
SQL Editor. Ajuste o `master_email` no topo do arquivo para o e-mail com que
você se cadastrou (ou deixe em branco para usar o primeiro usuário).

### 5. Subir o app

```bash
npm run dev
```

Acesse `http://localhost:3000`, crie uma conta em **/register** e você será
levado ao dashboard.

## Scripts

```bash
npm run dev        # servidor de desenvolvimento
npm run build      # build de produção
npm run start      # roda o build de produção
npm run lint       # ESLint (next lint)
npm run typecheck  # tsc --noEmit
```

## Estrutura

```
app/
  (auth)/            login, registro e actions de autenticação
  (master)/          área do Mestre (layout com header)
    dashboard/       lista de campanhas + criação
    campaign/[id]/   hub da campanha + sidebar + módulos
  auth/callback/     troca de código de confirmação de e-mail
components/
  ui/                Button, Card, Badge
  shared/            Header, Sidebar, PrivacyBadge, LogoutButton
lib/
  supabase/          client (browser), server, middleware
  types/             database.types.ts (tipos do schema)
supabase/
  migrations/        SQL do schema e RLS
  seed.sql           dados da campanha "Os Três Selos do Abismo"
legacy/              protótipo standalone anterior (referência)
```

## Modelo de visibilidade (Mestre × Jogador)

O RLS garante, no banco, que jogadores só enxergam registros liberados
(NPCs revelados, locais descobertos, missões públicas, o próprio personagem).
A separação de **campos** público/privado dentro de um mesmo registro
(ex.: `secrets`, `master_notes`) é reforçada na camada da aplicação e será
complementada por _views_ públicas nos próximos sprints — veja a nota no topo
de `supabase/migrations/0002_rls.sql`.
