# CLAUDE.md — Cardápio Digital

> Contexto do projeto para novas sessões com Claude.
> Última atualização: 2026-04-26

---

## Visão Geral

Sistema fullstack de cardápio digital para restaurante com pedidos em tempo real, dashboard admin, área do cliente, pagamento Pix, calendário de shows com artistas, métricas pós-show, preferências de público, menu TV e analytics.

**Repositório:** `https://github.com/singlefutureadm-agency/cardapio-digital`  
**Infraestrutura:** Frontend → Vercel | Backend → Render | Banco + Storage → Supabase

---

## Stack

### Frontend — `client/`
| Item | Tecnologia |
|---|---|
| Framework | React 19 + Vite 8 |
| Estilo | Tailwind CSS 3 + CSS Variables customizadas |
| Fontes | DM Sans + Playfair Display (Google Fonts) |
| Estado global | Zustand 5 |
| Roteamento | React Router DOM 7 |
| HTTP | Axios — instância em `services/api.js` com interceptor JWT |
| Realtime | Socket.io-client 4 |
| Animações | GSAP 3 + ScrollTrigger |
| Gráficos | Recharts 3 |
| Drag-and-drop | @dnd-kit/core + @dnd-kit/utilities (mapa de mesas) |
| JWT decode | jwt-decode 4 |

### Backend — `server/`
| Item | Tecnologia |
|---|---|
| Runtime | Node.js ≥20 |
| Framework | Express 5 |
| ORM | Prisma 5 |
| Banco | PostgreSQL (Supabase) |
| Realtime | Socket.io 4 |
| Auth | JWT + bcryptjs |
| Validação | Zod 4 |
| Upload | Multer (memoryStorage) |
| Storage | Supabase Storage via `@supabase/supabase-js` |
| QR Code | qrcode (npm) |

---

## Estrutura de Arquivos

```
cardapio-digital/
├── client/
│   ├── hooks/
│   │   └── useShows.js              → hook useProximosShows()
│   ├── src/
│   │   ├── App.jsx                  → definição de rotas (React Router)
│   │   ├── config/
│   │   │   └── index.js             → API_BASE e API_URL centralizados
│   │   ├── components/
│   │   │   ├── CarrinhoFlutuante.jsx
│   │   │   ├── CarrinhoItem.jsx
│   │   │   ├── CategoriaTab.jsx
│   │   │   ├── GlobalCursor.jsx
│   │   │   ├── ItemCard.jsx
│   │   │   ├── PedidoCard.jsx
│   │   │   ├── PreferenciasForm.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── ThemeToggle.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx      → usuário, token JWT, interceptor Axios
│   │   │   └── ThemeContext.jsx     → tema, glass effect, imagem de fundo
│   │   ├── layouts/
│   │   │   ├── ClienteLayout.jsx
│   │   │   └── DashboardLayout.jsx → sidebar com grupos Restaurante/Shows/etc
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx     → seção Próximos Shows
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── SelecionarMesa.jsx
│   │   │   ├── PedidoStatus.jsx
│   │   │   ├── Carrinho.jsx        → importado por ClienteCarrinho
│   │   │   ├── cliente/
│   │   │   │   ├── CalendarioShows.jsx   → calendário mensal com avaliações
│   │   │   │   ├── ClienteCardapio.jsx
│   │   │   │   ├── ClienteCarrinho.jsx
│   │   │   │   ├── ClienteCheckout.jsx   → checkout com Pix/Cartão/Dinheiro
│   │   │   │   ├── ClienteHome.jsx       → home com CalendarioShows
│   │   │   │   ├── ClientePedidos.jsx
│   │   │   │   └── ClientePerfil.jsx
│   │   │   └── dashboard/
│   │   │       ├── ArtistasAdmin.jsx     → CRUD artistas + upload/URL imagem
│   │   │       ├── CardapioAdmin.jsx     → CRUD itens + categorias + imagem
│   │   │       ├── ConfiguracoesAdmin.jsx
│   │   │       ├── CozinhaView.jsx       → tempo real, atualiza status pedidos
│   │   │       ├── DashboardHome.jsx     → KPIs e resumo
│   │   │       ├── HistoricoPedidos.jsx  → filtros + gráficos Recharts
│   │   │       ├── MenuTV.jsx            → carrossel full-screen + slide shows
│   │   │       ├── MesasAdmin.jsx        → mapa drag-and-drop
│   │   │       ├── NewsletterAdmin.jsx
│   │   │       ├── PagamentosPendentes.jsx
│   │   │       ├── PreferenciasAdmin.jsx
│   │   │       ├── PreferenciasAnalytics.jsx
│   │   │       ├── ShowMetricas.jsx      → relatório pós-show
│   │   │       ├── ShowsAdmin.jsx        → CRUD shows + vínculo artista
│   │   │       └── UsuariosAdmin.jsx
│   │   ├── services/
│   │   │   ├── api.js              → instância Axios com baseURL e interceptor JWT
│   │   │   └── socket.js           → instância Socket.io-client
│   │   └── store/
│   │       ├── useCarrinhoStore.js
│   │       └── usePedidoStore.js
│   ├── .env                        → VITE_API_BASE_URL=http://localhost:3001
│   ├── .env.production             → VITE_API_BASE_URL=https://api.onrender.com (commitado)
│   └── vercel.json                 → rewrite SPA para index.html
│
├── server/
│   ├── src/
│   │   ├── app.js                  → Express, CORS, middlewares, rotas
│   │   ├── server.js               → HTTP server + Socket.io
│   │   ├── controllers/            → lógica dos endpoints
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js  → verifica JWT, injeta req.user
│   │   │   ├── error.middleware.js
│   │   │   └── validate.middleware.js
│   │   ├── routes/                 → definição de rotas HTTP
│   │   ├── services/               → regras de negócio e acesso ao Prisma
│   │   │   └── storage.service.js  → uploadFile / deleteFile para Supabase Storage
│   │   └── validators/
│   │       ├── auth.validator.js
│   │       └── pedido.validator.js
│   ├── prisma/
│   │   ├── schema.prisma           → schema completo do banco
│   │   ├── seed.js
│   │   └── migrations/             → 2 migrations (init + add_artistas_avaliacoes)
│   └── uploads/                    → imagens locais (apenas desenvolvimento)
│
├── render.yaml                     → config de deploy do backend no Render
└── DOCUMENTACAO.md                 → guia completo de deploy e arquitetura
```

---

## Banco de Dados — Models

**User** — `id, nome, email, senha (bcrypt), role: USER|ADMIN, createdAt`  
relações: `pedidos[], respostas[], avaliacoes[]`

**MenuCategoria** — `id, nome, ordem`  
relações: `itens: MenuItem[]`

**MenuItem** — `@@map("menu_items")` — `id, nome, descricao, preco: Decimal, disponivel, categoriaId, imagemUrl?`  
`imagemUrl` é URL absoluta do Supabase Storage (https://...)

**Pedido** — `id, mesa: String, mesaId?, status: StatusPedido, total: Decimal, userId?, createdAt, updatedAt`  
relações: `itens[], pagamento?, mesaRel?, user?`

**PedidoItem** — `@@map("pedido_items")` — `id, pedidoId, menuItemId, quantidade, observacao?, subtotal: Decimal`

**Pagamento** — `id, pedidoId @unique, tipo: TipoPagamento, metodo: MetodoPagamento, status: StatusPagamento, qrCode? @db.Text, pixCopiaECola? @db.Text`

**Mesa** — `id, numero @unique, ativa, lugares: Int, posX: Float, posY: Float, cor: String`

**Configuracao** — `id, chave @unique, valor` — tema com prefixos `light_`/`dark_`; também `planta_url`

**Newsletter** — `id, email @unique, ativo, createdAt`

**PerguntaPreferencia** — `id, texto, ativa, ordem, createdAt` — relações: `opcoes[], respostas[]`

**OpcaoPreferencia** — `id, perguntaId, texto` — `onDelete: Cascade`

**RespostaPreferencia** — `id, userId, perguntaId, opcaoId` — `@@unique([userId, perguntaId])`

**Artista** — `id, nome, bio?, genero?, imagemUrl?, instagram?, spotify?, youtube?, tiktok?, site?, ativo, createdAt, updatedAt`

**Show** — `id, titulo, descricao?, data: DateTime, horario: String, genero?, imagemUrl?, ativo, artistaId?`

**AvaliacaoShow** — `id, showId, userId, nota: Int (1-5), comentario?` — `@@unique([showId, userId])`

### Enums

```prisma
enum StatusPedido    { NOVO PREPARANDO PRONTO ENTREGUE CANCELADO }
enum TipoPagamento   { GARCOM ONLINE }
enum MetodoPagamento { DINHEIRO CARTAO PIX }
enum StatusPagamento { PENDENTE PAGO CANCELADO }
enum Role            { USER ADMIN }
```

### Migrations (Prisma)

Apenas 2 arquivos de migration presentes:
- `20260425170240_init` — schema completo inicial (todos os models exceto Artista/AvaliacaoShow)
- `20260425172934_add_artistas_avaliacoes` — adiciona Artista, AvaliacaoShow e User.avaliacoes

> Outros incrementos históricos (mesas, pix, shows etc.) foram aplicados via `db push` ou SQL direto e não têm migration file separado.

---

## Rotas React (App.jsx)

```
/                           → LandingPage (seção shows automática)
/login                      → Login
/register                   → Register
/selecionar-mesa            → SelecionarMesa (ProtectedRoute)
/pedido/:id                 → PedidoStatus (ProtectedRoute)
/menu-tv                    → MenuTV (público)

/cliente/:mesa              → ClienteLayout (ProtectedRoute)
  index                     → ClienteHome (calendário de shows)
  cardapio                  → ClienteCardapio
  carrinho                  → ClienteCarrinho
  checkout                  → ClienteCheckout
  pedidos                   → ClientePedidos
  perfil                    → ClientePerfil

/dashboard                  → DashboardLayout (ProtectedRoute adminOnly)
  index                     → DashboardHome
  cozinha                   → CozinhaView
  cardapio                  → CardapioAdmin
  usuarios                  → UsuariosAdmin
  newsletter                → NewsletterAdmin
  mesas                     → MesasAdmin
  preferencias              → PreferenciasAdmin
  preferencias/analytics    → PreferenciasAnalytics
  configuracoes             → ConfiguracoesAdmin
  menu-tv                   → MenuTV (preview)
  pagamentos                → PagamentosPendentes
  historico                 → HistoricoPedidos
  shows                     → ShowsAdmin
  shows/:id/metricas        → ShowMetricas
  artistas                  → ArtistasAdmin
```

---

## Configuração de URL (client/src/config/index.js)

```js
export const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001').replace(/\/$/, '')
export const API_URL  = `${API_BASE}/api`
```

- `API_URL` → baseURL do Axios (todas as chamadas de dados)
- `API_BASE` → base para Socket.io e para resolver `imagemUrl` relativa

**Regra de imagemUrl:** sempre checar `startsWith('http')` antes de prefixar com `API_BASE`.  
URLs do Supabase Storage já são absolutas. URLs legadas de `server/uploads/` são relativas.
```js
src={item.imagemUrl.startsWith('http') ? item.imagemUrl : `${API_BASE}${item.imagemUrl}`}
```

---

## Backend — Rotas da API

```
/api/auth           — login, register, /me
/api/menu           — cardápio público (categorias + itens)
/api/admin          — CRUD cardápio, imagens, usuários (admin)
/api/pedidos        — criar, listar historico, atualizar status
/api/pagamentos     — criar, buscar, pendentes, confirmar
/api/mesas          — CRUD + /ativas público
/api/upload         — POST /planta, GET /planta/info
/api/configuracoes  — tema e fundo (GET público, POST admin)
/api/shows          — CRUD + /proximos + /passados + /avaliar + /metricas
/api/artistas       — CRUD + /ativos + upload/remover imagem
/api/newsletter     — inscrição pública, admin gerencia
/api/preferencias   — perguntas, opções e respostas
/api/cliente        — historico do cliente logado
```

---

## Storage de Imagens (Supabase Storage)

Todos os uploads vão para o bucket `uploads` (público) no Supabase.  
O serviço central é `server/src/services/storage.service.js`:

```js
uploadFile(buffer, filename, mimetype)  → retorna URL pública absoluta
deleteFile(urlOrPath)                   → remove do bucket pelo nome do arquivo
```

Convenção de nomes de arquivo:
- `item_{id}.{ext}` → imagem de prato
- `artista_{id}.{ext}` → foto de artista
- `fundo.{ext}` → imagem de fundo do tema
- `planta.{ext}` → planta do restaurante (URL salva em `Configuracao.planta_url`)

Em desenvolvimento sem Supabase configurado, uploads são salvos em `server/uploads/` (disco local).

---

## Observações Críticas

| Regra | Detalhe |
|---|---|
| `services/api.js` | SEMPRE usar instância Axios com interceptor. `axios` direto não envia JWT → 401 |
| baseURL | `API_URL` já inclui `/api`. Não duplicar nas chamadas |
| `imagemUrl` | Campo é `imagemUrl` (camelCase). Supabase retorna URL absoluta |
| `prisma generate` | Rodar após qualquer alteração no schema |
| Boolean no Zod | Enviar `Boolean(form.ativo)` — Zod 4 rejeita string `"true"` |
| FK constraints | Deletar dependentes antes do pai (PedidoItem → MenuItem, etc.) |
| `toDateTime()` | Input `type="date"` retorna `"YYYY-MM-DD"` — converter para ISO antes de salvar |
| `/historico` | Rota específica deve vir antes de `/:id` em `pedido.routes.js` |
| Avaliação show | `@@unique([showId, userId])` — upsert com `createOrUpdate` |
| Confirmação Pix | Manual pelo admin em `/dashboard/pagamentos`. Sem webhook automático |

---

## Variáveis de Ambiente

### server/.env
```env
DATABASE_URL=postgresql://postgres.xxx:senha@aws-xxx.pooler.supabase.com:6543/postgres
JWT_SECRET=<32+ chars hex>
PORT=3001
NODE_ENV=development
FRONTEND_URL=https://seu-app.vercel.app
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=<service_role key>
PIX_CHAVE=restaurante@pix.com
PIX_NOME=Nome Do Restaurante
PIX_CIDADE=SAO PAULO
```

### client/.env
```env
VITE_API_BASE_URL=http://localhost:3001
```

---

## Comandos Úteis

```bash
# Desenvolvimento
cd client && npm run dev          # http://localhost:5173
cd server && npm run dev          # http://localhost:3001 (nodemon)

# Build (verificar antes de publicar)
cd client && npm run build

# Banco
cd server && npx prisma migrate dev --name nome
cd server && npx prisma generate
cd server && npx prisma studio
cd server && npx prisma db push   # sync direto sem migration (cuidado!)

# Utilitários de setup
cd server && node criar-admin.js
cd server && node criar-mesas.js
```

---

## Socket.io — Salas e Eventos

```
Salas:
  cozinha          — admin/cozinheiro
  mesa_{numero}    — cliente daquela mesa

Eventos emitidos pelo servidor:
  pedido_novo         → sala cozinha  (pedido criado)
  pedido_atualizado   → sala cozinha  (status mudou)
  status_atualizado   → sala mesa_X   (payload: { pedidoId, status })
```

---

## CSS Variables de Referência

```css
/* Marca */
--brand, --brand-light, --brand-dark

/* Superfícies */
--surface, --card, --border, --border-strong

/* Tipografia */
--text-primary, --text-secondary, --text-hint

/* Semânticas */
--success, --success-bg
--warning, --warning-bg
--danger,  --danger-bg

/* Sombras */
--shadow-sm, --shadow-md, --shadow-lg
```

Aplicadas via `data-theme="light"` ou `data-theme="dark"` no `<html>`.  
Customizadas via `ThemeContext` com valores salvos na tabela `Configuracao`.

---

## Fluxo de Pagamento

```
1. Cliente finaliza carrinho → /cliente/:mesa/checkout
2. Escolhe: PIX | CARTÃO | DINHEIRO
3. POST /pedidos → cria pedido
4. POST /pagamentos → cria pagamento
   - PIX: backend gera payload EMV CRC16 + QR base64
   - CARTÃO/DINHEIRO: tipo=GARCOM, instrução "chame o garçom"
5. PIX: exibe QR Code + "Copiar código" → "Já paguei"
   Admin confirma em /dashboard/pagamentos
6. CARTÃO/DINHEIRO: navega direto para /pedido/:id
```

---

## Fluxo de Shows e Avaliações

```
Admin cria show em ShowsAdmin → víncula artista → define data/horário
  ↓
Show aparece na LandingPage (grid) e no CalendarioShows (cliente)
Show futuro aparece no slide de Shows no MenuTV
  ↓
Show ocorre → passa a ser "passado"
  ↓
Cliente acessa CalendarioShows → botão "Avaliar" inline (nota 1-5 + comentário)
POST /shows/:id/avaliar (upsert)
  ↓
Admin acessa ShowsAdmin → botão "Métricas" → ShowMetricas
Exibe: nota média, distribuição, pedidos no dia vs média 7d, comentários
```

---

## Credenciais de Desenvolvimento

```
Admin:    admin@restaurante.com / admin123
Clientes: cadastrar via /register ou UsuariosAdmin
```
