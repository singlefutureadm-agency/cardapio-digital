# CLAUDE.md — Cardápio Digital

> Contexto do projeto para novas sessões com Claude.
> Última atualização: 2026-05-10

---

## Visão Geral

Sistema fullstack de cardápio digital para restaurante com pedidos em tempo real,
dashboard admin, área do cliente, pagamento Pix, calendário de shows com artistas,
métricas pós-show, preferências de público, menu TV, analytics e sistema de feature flags
controlados por um superadmin (ADMINSF).

**Repositório:** `https://github.com/singlefutureadm-agency/cardapio-digital`
**Frontend:** Vercel | **Backend:** Render | **Banco + Storage:** Supabase
**Licença:** Proprietária — Autor: Miguel Cezar Ferreira / Licenciado: Single Future

---

## Stack

### Frontend — `client/`
| Item | Tecnologia |
|---|---|
| Framework | React 19 + Vite 8 |
| Estilo | Tailwind CSS 3 + CSS Variables customizadas (design tokens) |
| Fontes | DM Sans + Playfair Display + Orbitron (footer SF) |
| Estado global | Zustand 5 + AuthContext + ThemeContext |
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
| Banco | PostgreSQL (Supabase, PgBouncer porta 6543) |
| Realtime | Socket.io 4 |
| Auth | JWT + bcryptjs |
| Validação | Zod 4 |
| Upload | Multer (memoryStorage) |
| Storage | Supabase Storage via `@supabase/supabase-js` |
| QR Code | qrcode (npm) |
| Testes | Jest + supertest (60+ testes em `__tests__/`) |

---

## Estrutura de Arquivos

```
cardapio-digital/
├── client/
│   ├── index.html                  → fontes Google (DM Sans, Playfair, Orbitron)
│   └── src/
│       ├── App.jsx                 → rotas + FeatureGate + ProtectedRoute
│       ├── config/index.js         → API_BASE e API_URL
│       ├── components/
│       │   ├── GlobalCursor.jsx    → cursor GSAP, cor via var(--brand) + color-mix()
│       │   ├── ProtectedRoute.jsx  → props: adminOnly, adminSFOnly
│       │   ├── SFFooter.jsx        → rodapé Single Future (todas as páginas)
│       │   ├── ThemeToggle.jsx
│       │   ├── CarrinhoFlutuante.jsx
│       │   ├── ItemCard.jsx
│       │   ├── PedidoCard.jsx
│       │   └── PreferenciasForm.jsx
│       ├── context/
│       │   ├── AuthContext.jsx     → user, login, logout, register, token JWT
│       │   └── ThemeContext.jsx    → isDark, glass, bgUrl, features, salvarCores()
│       ├── layouts/
│       │   ├── DashboardLayout.jsx → overlay mobile + sidebar colapsável desktop
│       │   └── ClienteLayout.jsx   → header + bottom nav (4 abas + Garçom)
│       ├── pages/
│       │   ├── LandingPage.jsx     → shows gated por features.shows
│       │   ├── Login.jsx           → redireciona ADMIN+ADMINSF→/dashboard, USER→/selecionar-mesa
│       │   ├── Register.jsx
│       │   ├── SelecionarMesa.jsx
│       │   ├── PedidoStatus.jsx
│       │   ├── Carrinho.jsx
│       │   ├── cliente/
│       │   │   ├── CalendarioShows.jsx
│       │   │   ├── ClienteCardapio.jsx    → imagens dos pratos (Supabase Storage)
│       │   │   ├── ClienteCarrinho.jsx
│       │   │   ├── ClienteCheckout.jsx    → PIX gated por features.pix
│       │   │   ├── ClienteHome.jsx        → hero imersivo + ações rápidas
│       │   │   ├── ClientePedidos.jsx     → pedidos da sessão atual (sessionStorage)
│       │   │   └── ClientePerfil.jsx
│       │   └── dashboard/
│       │       ├── ArtistasAdmin.jsx
│       │       ├── CardapioAdmin.jsx
│       │       ├── ConfiguracoesAdmin.jsx → tema + glass + imagem de fundo
│       │       ├── CozinhaView.jsx        → kanban + abas mobile + alertas sonoros
│       │       ├── DashboardHome.jsx
│       │       ├── FuncionalidadesAdmin.jsx  ← ADMINSF only — toggles features
│       │       ├── HistoricoPedidos.jsx
│       │       ├── MenuTV.jsx
│       │       ├── MesasAdmin.jsx
│       │       ├── NewsletterAdmin.jsx
│       │       ├── PagamentosPendentes.jsx
│       │       ├── PreferenciasAdmin.jsx
│       │       ├── PreferenciasAnalytics.jsx
│       │       ├── ShowMetricas.jsx
│       │       ├── ShowsAdmin.jsx
│       │       └── UsuariosAdmin.jsx
│       ├── services/
│       │   ├── api.js              → Axios com baseURL=API_URL e interceptor JWT
│       │   └── socket.js           → Socket.io-client
│       ├── store/
│       │   ├── useCarrinhoStore.js
│       │   └── usePedidoStore.js
│       └── index.css               → CSS vars, light/dark/glass, scrollbar, inputs, animações
│
├── server/
│   ├── src/
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── lib/
│   │   │   └── prisma.js           ← SINGLETON — único PrismaClient do projeto
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js  → authMiddleware / isAdmin / isAdminSF
│   │   │   ├── error.middleware.js
│   │   │   └── validate.middleware.js
│   │   ├── routes/
│   │   ├── services/               → todos importam `../lib/prisma`
│   │   │   └── storage.service.js
│   │   ├── validators/
│   │   └── __tests__/              → 60+ testes Jest + supertest
│   ├── prisma/
│   │   ├── schema.prisma           → relationMode="prisma" (obrigatório PgBouncer)
│   │   ├── seed.js
│   │   └── migrations/
│   └── uploads/                    → fallback local sem Supabase
│
├── LICENSE                         → proprietária, autor: Miguel Cezar Ferreira
├── render.yaml
├── README.md
└── DOCUMENTACAO.md
```

---

## Sistema de Roles e Feature Flags

### Roles

| Role | Acesso |
|---|---|
| `USER` | `/cliente/:mesa` e sub-rotas |
| `ADMIN` | `/dashboard` completo, limitado pelas feature flags |
| `ADMINSF` | Acesso total + página `/dashboard/funcionalidades` para toggle de features |

**Regra de redirecionamento no login:**
```js
if (role === 'ADMIN' || role === 'ADMINSF') navigate('/dashboard')
else navigate('/selecionar-mesa')
```

### Feature Flags

Salvas na tabela `Configuracao` como `'0'` / `'1'` (ausência = ativado por padrão):

| Chave | Feature controlada |
|---|---|
| `feature_shows` | Shows, Artistas, CalendarioShows, seção Shows na LandingPage |
| `feature_menutv` | MenuTV (rota pública + preview no dashboard) |
| `feature_preferencias` | PreferenciasAdmin + Analytics |
| `feature_mesas` | MesasAdmin |
| `feature_pix` | Opção PIX no checkout do cliente |

Derivação no `ThemeContext`:
```js
const features = {
  shows:        config.feature_shows        !== '0',
  menutv:       config.feature_menutv       !== '0',
  preferencias: config.feature_preferencias !== '0',
  mesas:        config.feature_mesas        !== '0',
  pix:          config.feature_pix          !== '0',
}
```

`FuncionalidadesAdmin` usa `salvarCores({ feature_shows: '0' })` do ThemeContext
para persistir as flags — reutiliza o mesmo endpoint `POST /api/configuracoes`.

`ADMINSF` nunca é bloqueado pelo `FeatureGate`, independente do valor da flag.

---

## Banco de Dados — Models

**User** — `id, nome, email, senha (bcrypt), role: USER|ADMIN|ADMINSF, createdAt`

**MenuCategoria** — `id, nome, ordem`

**MenuItem** — `@@map("menu_items")` — `id, nome, descricao, preco, disponivel, categoriaId, imagemUrl?`
`imagemUrl` é URL absoluta do Supabase Storage (https://...)

**Pedido** — `id, mesa, mesaId?, status: StatusPedido, total, userId?, createdAt`

**PedidoItem** — `@@map("pedido_items")` — `id, pedidoId, menuItemId, quantidade, observacao?, subtotal`

**Pagamento** — `id, pedidoId @unique, tipo, metodo, status, qrCode?, pixCopiaECola?`

**Mesa** — `id, numero @unique, ativa, lugares, posX, posY, cor`

**Configuracao** — `id, chave @unique, valor`

Chaves de tema: `light_*/dark_*` (cores), `glass_enabled`, `glass_color`, `glass_opacity`,
`glass_blur`, `glass_text`, `glass_bg_url`, `planta_url`

Chaves de feature flag: `feature_shows`, `feature_menutv`, `feature_preferencias`,
`feature_mesas`, `feature_pix`

**Newsletter** — `id, email @unique, ativo`

**PerguntaPreferencia / OpcaoPreferencia / RespostaPreferencia** — `@@unique([userId, perguntaId])`

**Artista** — `id, nome, bio?, genero?, imagemUrl?, instagram?, spotify?, youtube?, tiktok?, site?, ativo`

**Show** — `id, titulo, descricao?, data, horario, genero?, imagemUrl?, ativo, artistaId?`

**AvaliacaoShow** — `id, showId, userId, nota (1-5), comentario?` — `@@unique([showId, userId])`

### Enums
```
StatusPedido:    NOVO | PREPARANDO | PRONTO | ENTREGUE | CANCELADO
TipoPagamento:   GARCOM | ONLINE
MetodoPagamento: DINHEIRO | CARTAO | PIX
StatusPagamento: PENDENTE | PAGO | CANCELADO
Role:            USER | ADMIN | ADMINSF
```

---

## PrismaClient e PgBouncer — Regras Críticas

O banco usa Supabase Pooler (PgBouncer, porta 6543). Para funcionar:

1. **Singleton obrigatório** — `server/src/lib/prisma.js`:
```js
const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
  log: ['error'],
})
module.exports = prisma
```
Todos os services e routes importam: `const prisma = require('../lib/prisma')`
**NUNCA** criar `new PrismaClient()` em outros arquivos.

2. **DATABASE_URL** deve conter:
```
?sslmode=require&pgbouncer=true&connection_limit=1&statement_cache_size=0
```

3. **schema.prisma** deve ter:
```prisma
datasource db {
  provider     = "postgresql"
  url          = env("DATABASE_URL")
  relationMode = "prisma"
}
```

4. **Adicionar valores a ENUMs**: usar SQL direto no Supabase SQL Editor:
```sql
ALTER TYPE "Role" ADD VALUE 'ADMINSF';
```
`npx prisma db push` falha para ENUMs com PgBouncer.

5. **POST /api/configuracoes** usa `for...of` com `await` (nunca `Promise.all`)
para garantir queries sequenciais com connection_limit=1.

---

## Sistema de Tema (ThemeContext)

O ThemeContext carrega configurações de `GET /api/configuracoes` e aplica
CSS Custom Properties em `document.documentElement.style`:

```js
function buildTheme(modo, config) {
  // Usa resolveVar(saved, default) — usa default se campo vazio ou ausente
}
function aplicarTheme(vars) {
  Object.entries(vars).forEach(([k, v]) => {
    document.documentElement.style.setProperty(k, v)
  })
}
```

Padrão `configRef` para evitar closure stale:
```js
const configRef = useRef({})
useEffect(() => { configRef.current = config }, [config])
// toggle(), previewGlass() usam configRef.current em vez de config
```

Cursor acompanha `--brand` via `color-mix()` — atualiza automaticamente ao
mudar a cor da marca sem nenhum código extra no GlobalCursor.jsx.

---

## Rotas React (App.jsx)

```
/                             → LandingPage
/login                        → Login
/register                     → Register
/selecionar-mesa              → SelecionarMesa (ProtectedRoute)
/pedido/:id                   → PedidoStatus (ProtectedRoute)
/menu-tv                      → MenuTV (FeatureGate: menutv)

/cliente/:mesa                → ClienteLayout (ProtectedRoute)
  index                       → ClienteHome
  cardapio / carrinho / checkout / pedidos / perfil

/dashboard                    → DashboardLayout (ProtectedRoute adminOnly)
  index / cozinha / cardapio / usuarios / newsletter / historico / pagamentos
  configuracoes               → ConfiguracoesAdmin
  funcionalidades             → FuncionalidadesAdmin (ProtectedRoute adminSFOnly)
  mesas                       → FeatureGate: mesas
  menu-tv                     → FeatureGate: menutv
  preferencias                → FeatureGate: preferencias
  preferencias/analytics      → FeatureGate: preferencias
  shows                       → FeatureGate: shows
  shows/:id/metricas          → FeatureGate: shows
  artistas                    → FeatureGate: shows
```

---

## Rotas da API Backend

```
/api/auth           → login, register, /me
/api/menu           → cardápio público
/api/admin          → CRUD cardápio + usuários (isAdmin)
/api/pedidos        → criar, historico, atualizar status
/api/pagamentos     → criar, buscar, pendentes, confirmar
/api/mesas          → CRUD + /ativas público
/api/upload         → POST/GET planta (isAdmin)
/api/configuracoes  → tema + feature flags (GET público, POST isAdmin)
/api/shows          → CRUD + proximos + passados + avaliar + metricas
/api/artistas       → CRUD + ativos + upload/remover imagem
/api/newsletter     → inscrição pública, admin gerencia
/api/preferencias   → perguntas, opções e respostas
/api/cliente        → historico do cliente logado
```

---

## Socket.io — Salas e Eventos

```
Salas:
  cozinha       → admin/cozinheiro
  mesa_{numero} → cliente daquela mesa

Eventos servidor → cliente:
  pedido_novo        → sala cozinha  (pedido criado — aciona alerta sonoro Web Audio)
  pedido_atualizado  → sala cozinha  (status mudou)
  status_atualizado  → sala mesa_X   ({ pedidoId, status })
  chamar_garcom      → sala cozinha  (cliente chamou garçom)
```

---

## Design Responsivo

O projeto é mobile-first. Padrões principais:

**DashboardLayout.jsx** — sidebar:
- Mobile: `fixed inset-y-0 left-0 z-50 flex md:hidden` com overlay backdrop
- `mobileMenuOpen` state, fecha ao navegar (`useEffect` em `location.pathname`)
- Scroll do body bloqueado quando drawer aberto
- Desktop: `hidden md:flex`, colapsável via `expanded` state

**CozinhaView.jsx** — kanban:
- `abaAtiva` state — em mobile mostra uma coluna por vez
- Tab bar `flex md:hidden` com cores por status
- Grade `md:grid md:grid-cols-3`

**ClienteLayout.jsx** — bottom nav com 4 abas:
- Cardápio, Pedidos, Garçom (chama garçom via socket), Perfil
- `relative` no NavLink garante que o indicador `absolute` fique posicionado corretamente

**ClienteCardapio.jsx** — imagens dos pratos:
- Componente `ItemImagem`: exibe imagem do Supabase se `imagemUrl` existe, fallback emoji
- `src={url.startsWith('http') ? url : \`${API_BASE}${url}\`}`

---

## Isolamento de Pedidos por Sessão

```js
// sessionStorage — salvo ao entrar na mesa
sessionStorage.setItem('sessionTimestamp', Date.now().toString())

// ClientePedidos — filtra pelo timestamp
const ts = Number(sessionStorage.getItem('sessionTimestamp') ?? 0)
const pedidosDaSessao = pedidos.filter(p => new Date(p.createdAt).getTime() >= ts)
```

"Fechar conta" limpa o sessionStorage e redireciona para `/selecionar-mesa`.
O backend exclui pedidos já pagos de `listarMesasAbertas`.

---

## Testes Automatizados

```
server/src/__tests__/
  auth.middleware.test.js       → authMiddleware, isAdmin, isAdminSF
  auth.service.test.js          → login, register
  pedido.service.test.js        → criação, listagem, status
  pedido.service.extra.test.js  → listarMesasAbertas, fechar conta, edge cases
  pagamento.service.test.js     → Pix, confirmação, pendentes
  clientePedidos.filter.test.js → isolamento por sessionTimestamp
  configuracao.route.test.js    → GET/POST rotas, auth, erros Prisma
  prisma.lib.test.js            → singleton, PgBouncer params
```

Rodar: `cd server && npm test`

Padrão de mock para multer (sem binários nativos):
```js
jest.mock('multer', () => {
  const multerFn = () => ({ single: () => (req, res, next) => next() })
  multerFn.memoryStorage = () => ({})
  return multerFn
})
```

---

## SFFooter — Rodapé Single Future

**Arquivo:** `client/src/components/SFFooter.jsx`
**Presente em:** todas as páginas (DashboardLayout, ClienteLayout, Login, Register,
SelecionarMesa, PedidoStatus, LandingPage)
**Estilo:** fundo `#040404`, cor `#00e5a8`, fonte `Orbitron`, link para `www.singlefuture.com.br`

**Padrão sticky-footer (sem position:fixed):**
```jsx
<div className="min-h-screen flex flex-col">
  <div className="flex-1">...</div>
  <SFFooter />
</div>
```

---

## Configuração de URL e Imagens

```js
// client/src/config/index.js
export const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001').replace(/\/$/, '')
export const API_URL  = `${API_BASE}/api`
```

- `API_URL` → baseURL do Axios
- `API_BASE` → base para Socket.io e para imagens relativas

**Regra de imagemUrl — SEMPRE verificar:**
```js
src={url.startsWith('http') ? url : `${API_BASE}${url}`}
```

---

## CSS Variables de Referência

```css
/* Marca */
--brand, --brand-light, --brand-dark

/* Superfícies */
--surface, --card, --panel, --border, --border-strong

/* Tipografia */
--text-primary, --text-secondary, --text-hint

/* Semânticas */
--success, --success-bg, --warning, --warning-bg, --danger, --danger-bg

/* Sombras */
--shadow-sm, --shadow-md, --shadow-lg, --shadow-brand, --shadow-glow

/* Raios */
--radius-sm (8px), --radius-md (12px), --radius-lg (16px), --radius-xl (20px)

/* Cursor (derivadas de --brand via color-mix, atualizam com o tema) */
--cursor-dot, --cursor-glow, --cursor-halo, --cursor-ring, --cursor-trail
```

Aplicadas via `data-theme="light"` / `data-theme="dark"` no `<html>`.
Glass mode via `data-glass="true"` no `<html>`.

---

## Variáveis de Ambiente

### server/.env
```env
DATABASE_URL=postgresql://postgres.xxx:senha@aws-xxx.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true&connection_limit=1&statement_cache_size=0
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

# Build
cd client && npm run build

# Testes
cd server && npm test
cd server && npm test -- --testPathPatterns=configuracao   # arquivo específico

# Banco
cd server && npx prisma generate
cd server && npx prisma studio
cd server && npx prisma migrate dev --name nome
# NÃO usar db push para ENUMs com PgBouncer — usar SQL direto no Supabase

# Setup
cd server && node criar-admin.js
cd server && node criar-mesas.js

# Promover para ADMINSF (SQL Editor Supabase ou Prisma Studio)
UPDATE "User" SET role = 'ADMINSF' WHERE email = 'email@exemplo.com';
```

---

## Credenciais de Desenvolvimento

```
Admin:   admin@restaurante.com / admin123  (role: ADMIN)
Cliente: cadastrar via /register ou UsuariosAdmin
ADMINSF: promover via SQL após criar o usuário
```

---

## Observações Críticas

| Regra | Detalhe |
|---|---|
| `services/api.js` | SEMPRE usar instância Axios com interceptor. `axios` direto → 401 |
| `API_URL` | Já inclui `/api`. Não duplicar nas chamadas |
| `imagemUrl` | Sempre `startsWith('http')` antes de prefixar |
| `lib/prisma.js` | Único ponto de instância do PrismaClient. Nunca criar outro |
| `statement_cache_size=0` | Obrigatório na DATABASE_URL com PgBouncer |
| `relationMode = "prisma"` | Obrigatório no schema.prisma com PgBouncer |
| `POST /api/configuracoes` | Usar `for...of await` (nunca `Promise.all`) com PgBouncer |
| `Boolean no Zod` | Enviar `Boolean(form.ativo)` — Zod 4 rejeita string `"true"` |
| FK constraints | Deletar dependentes antes do pai |
| `toDateTime()` | Input `type="date"` retorna `"YYYY-MM-DD"` — converter para ISO |
| `/historico` | Rota específica deve vir antes de `/:id` em `pedido.routes.js` |
| Avaliação show | `@@unique([showId, userId])` — upsert com createOrUpdate |
| Confirmação Pix | Manual pelo admin. Sem webhook automático |
| Enum no banco | Adicionar valor via SQL: `ALTER TYPE "Role" ADD VALUE '...'` |
| Cursor | Cor via `color-mix(in srgb, var(--brand) X%, transparent)` — sem hardcode |
| sessionTimestamp | Gravar em `sessionStorage` ao entrar na mesa para isolar pedidos |
