# Plano VTT — Taverna do Mestre

Plano para transformar a Taverna do Mestre num **Virtual Tabletop (VTT)**
completo, com mesa tática de mapa + tokens em tempo real, mantendo o que já
nos diferencia: a gestão de campanha e o modelo de visibilidade Mestre × Jogador.

---

## 1. Pesquisa de mercado — o que os concorrentes acertam e erram

| VTT | Acerta | Erra |
| --- | --- | --- |
| **Roll20** | Onboarding fácil, maior marketplace de mapas/tokens, fichas automatizadas, roda no navegador | Interface datada e "travada", lag, recursos bons atrás de paywall, macros de ficha sofríveis quando foge do padrão |
| **Foundry VTT** | Automação profunda, compra única (sem assinatura), enorme ecossistema de módulos, iluminação/fog dinâmicos | Setup de 1–2h, exige auto-hospedagem, módulos quebram/conflitam, curva de aprendizado alta, precisa de app |
| **Owlbear Rodeo** | Zero instalação, entra por link, rápido (mapa+tokens+fog em <15 min), grátis, foco no essencial | Quase nenhuma automação de regras, sem ficha/gestão de campanha integrada, alinhamento de mapa chato |
| **Alchemy RPG** | Imersão (cenas animadas, som ambiente, teatro-da-mente), storytelling | Menos foco em combate tático, mais caro, nicho |

**Padrões que se repetem:**
- **O que faz um VTT ser amado:** entrar por link (sem instalar), colocar um
  mapa e mover tokens em minutos, e o jogador não precisar de manual.
- **O que faz um VTT ser odiado:** setup pesado, curva de aprendizado, UI
  confusa, e ter que gerenciar módulos/ferramentas separadas.

Fontes: comparativos de VTT 2025–2026 (ScriptoriumGM, GM Craft Tavern, Black
Lantern Forge), reviews de Foundry (Advanced RPGs, Bozbat) e documentação do
Owlbear Rodeo.

---

## 2. Nosso posicionamento (onde ganhamos)

Já temos o que o Owlbear **não** tem (o "cérebro" da campanha: NPCs, locais,
missões, sessões, facções, loot, e o modelo público/privado) e o Painel ao
Vivo (iniciativa/HP em tempo real). Falta a **mesa tática visual** — que é
justamente a força do Owlbear.

> **Proposta:** ser tão fácil quanto o Owlbear (100% web, entra por link, sem
> instalar) **com o cérebro de campanha do Foundry** — em português, focado em
> D&D 5e, e opinativo na simplicidade. Os tokens do mapa são os **mesmos**
> NPCs e personagens que o Mestre já cadastrou.

Diferencial-chave: **token = registro real**. Mover o token do "Aldric Voss"
no mapa é o mesmo Aldric da ficha; o HP no Painel ao Vivo e no token são um só.

---

## 3. Arquitetura técnica

### 3.1 Armazenamento de imagens (Supabase Storage)
- Bucket `assets` (público para leitura, escrita só autenticada) para **mapas**
  e **arte de token** (PNG/JPG/WebP).
- Upload pelo navegador via cliente Supabase; guardamos a URL pública no banco.
- Caminhos: `campaigns/{campaign_id}/maps/…` e `.../tokens/…`.

### 3.2 Novas colunas e tabelas
- `characters.token_image_url` e `npcs.token_image_url` — arte do token.
  (Pedido do usuário: ao criar ficha de personagem/NPC, **exigir o PNG**.)
- `scenes` — cenas/mesas: `id, campaign_id, name, map_image_url, grid_size,
  grid_enabled, is_active, created_at`.
- `tokens` — tokens numa cena: `id, scene_id, campaign_id, name,
  image_url, x, y, size, ref_type ('character'|'npc'|'custom'),
  ref_id, controlled_by (user_id|null), color, created_at`.

### 3.3 Tempo real
- Mesma abordagem do Painel ao Vivo: canal Supabase Realtime por campanha,
  assinando `tokens` e `scenes`. Ao mover um token, o `x,y` é atualizado e
  transmitido a todos na hora.
- Otimização: durante o arraste, atualização local imediata + escrita
  "debounced" (a cada ~80ms) para não floodar o banco.

### 3.4 A mesa (canvas)
- Área de mapa com a imagem de fundo e **tokens circulares (moeda)** por cima.
- **Mestre** move qualquer token; **jogador** move só o token que controla.
- Grid opcional por cima; snap ao grid (fase posterior).
- Renderização em HTML/SVG absoluto (simples) evoluindo para `<canvas>` se
  precisar de performance com muitos tokens.

### 3.5 Permissões (RLS)
- `scenes`/`tokens`: Mestre com acesso total; membros leem; jogador pode
  **atualizar posição** apenas de tokens onde `controlled_by = auth.uid()`.

---

## 4. Roadmap por fases

### Fase A — Fundação de mídia + Fichas de personagem ✅
- [x] Upload de imagens para o Supabase Storage (`components/ui/ImageUpload`).
- [x] **CRUD de personagens** (Mestre cria; vínculo a um jogador que controla
      o token) — desbloqueia também o "Adicionar jogadores" do Painel ao Vivo.
- [x] **Arte de token (PNG) obrigatória** em personagens; opcional em NPCs
      (fallback: moeda com a inicial do nome).

### Fase B — Mesa Tática (o coração do VTT) ✅
- [x] CRUD de **cenas** (mapa por cena; marcar a cena ativa).
- [x] Colocar tokens na cena a partir de personagens/NPCs (ou token avulso).
- [x] **Arrastar tokens em tempo real**; Mestre move todos, jogador move o seu.
- [x] Visão do jogador espelha a cena ativa.

> Migration correspondente: `supabase/migrations/0004_vtt.sql` (tabelas
> `scenes`/`tokens`, colunas de token art, bucket de Storage `assets`, RLS e
> publicação Realtime).

### Fase C — Ferramentas de combate tático
- Grid + snap + medição de distância.
- Integração com o Painel ao Vivo: token destacado no turno; HP no token.

### Fase D — Névoa de guerra (fog of war)
- Máscara sobre o mapa; Mestre revela áreas; jogadores só veem o revelado.

### Fase E — Imersão (inspirado no Alchemy)
- Rolagem de dados na mesa, marcadores/efeitos, som ambiente por cena.

---

## 5. Decisões de escopo a confirmar

1. **Primeiro entregável:** ir direto para a Mesa Tática (Fase B) exige antes a
   Fase A (fichas + upload). Sugestão: entregar A e B juntas como a "v1 do VTT".
2. **PNG obrigatório:** exigir em personagens sempre; em NPCs, sugiro **opcional
   com fallback** (inicial do nome numa moeda colorida) para não travar o
   cadastro rápido de figurantes — confirmar.
3. **Onde fica a mesa:** uma nova área "Mesa/Cena" na sidebar, evoluindo o
   Painel ao Vivo para dentro dela mais adiante.
