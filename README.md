<h1 align="center">Cardápio Digital</h1>

<p align="center">
  Sistema fullstack de cardápio digital com pedidos em tempo real, dashboard administrativo,<br/>
  pagamento Pix, calendário de shows, analytics e controle de funcionalidades por role.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Node.js-20+-339933?style=flat-square&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white" />
  <img src="https://img.shields.io/badge/Deploy-Vercel%20%2B%20Render-black?style=flat-square&logo=vercel" />
  <img src="https://img.shields.io/badge/Realtime-Socket.io-010101?style=flat-square&logo=socket.io" />
</p>

---

## Índice

- [Visão Geral](#visão-geral)
- [Stack](#stack)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Funcionalidades](#funcionalidades)
- [Roles e Permissões](#roles-e-permissões)
- [Banco de Dados](#banco-de-dados)
- [Testes Automatizados](#testes-automatizados)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Rodando Localmente](#rodando-localmente)
- [Deploy em Produção](#deploy-em-produção)
- [Arquitetura](#arquitetura)

---

## Visão Geral

Plataforma completa para restaurantes: o cliente escaneia o QR code da mesa, navega no cardápio, faz o pedido e acompanha o status em tempo real. A cozinha recebe tudo instantaneamente via WebSocket. O admin gerencia cardápio, mesas, shows, artistas, pagamentos e analytics pelo dashboard.

O sistema possui **design responsivo mobile-first** — funciona tanto no celular do cliente quanto no tablet/computador do cozinheiro e administrador.

**Infraestrutura de produção:**

| Serviço | Plataforma |
|---|---|
| Frontend | Vercel (React 19 + Vite) |
| Backend | Render (Node.js + Express) |
| Banco de Dados | Supabase (PostgreSQL) |
| Storage de Imagens | Supabase Storage |
| Tempo Real | Socket.io |

---

## Stack

### Frontend — `client/`

| Item | Tecnologia |
|---|---|
| Framework | React 19 + Vite 8 |
| Estilo | Tailwind CSS 3 + CSS Variables customizadas (design tokens) |
| Estado global | Zustand 5 + AuthContext + ThemeContext |
| Roteamento | React Router DOM 7 |
| HTTP | Axios com interceptor JWT automático |
| Realtime | Socket.io-client 4 |
| Animações | GSAP 3 + ScrollTrigger |
| Gráficos | Recharts 3 |
| Drag-and-drop | @dnd-kit (mapa de mesas) |

### Backend — `server/`

| Item | Tecnologia |
|---|---|
| Runtime | Node.js ≥ 20 |
| Framework | Express 5 |
| ORM | Prisma 5 |
| Banco | PostgreSQL (Supabase, PgBouncer porta 6543) |
| Realtime | Socket.io 4 |
| Auth | JWT + bcryptjs |
| Validação | Zod 4 |
| Upload | Multer (memoryStorage → Supabase Storage) |
| QR Code | qrcode (padrão EMV Banco Central) |
| Testes | Jest + supertest |

---

## Estrutura do Projeto

```
cardapio-digital/
├── client/
│   └── src/
│       ├── App.jsx                → todas as rotas + FeatureGate + ProtectedRoute
│       ├── config/index.js        → API_BASE e API_URL centralizados
│       ├── components/
│       │   ├── GlobalCursor.jsx   → cursor animado com GSAP, cor via CSS var(--brand)
│       │   ├── ProtectedRoute.jsx → props: adminOnly, adminSFOnly
│       │   ├── SFFooter.jsx       → rodapé Single Future (todas as páginas)
│       │   ├── ThemeToggle.jsx
│       │   ├── CarrinhoFlutuante.jsx
│       │   ├── ItemCard.jsx
│       │   ├── PedidoCard.jsx
│       │   └── PreferenciasForm.jsx
│       ├── context/
│       │   ├── AuthContext.jsx    → usuário, login, logout, token JWT, interceptor
│       │   └── ThemeContext.jsx   → tema, glass effect, bgUrl, features, salvarCores()
│       ├── layouts/
│       │   ├── DashboardLayout.jsx → sidebar responsiva (overlay mobile, colapsável desktop)
│       │   └── ClienteLayout.jsx   → header + bottom nav com aba Garçom
│       ├── pages/
│       │   ├── LandingPage.jsx
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   ├── SelecionarMesa.jsx
│       │   ├── PedidoStatus.jsx
│       │   ├── Carrinho.jsx
│       │   ├── cliente/
│       │   │   ├── ClienteHome.jsx        → hero imersivo, acesso rápido
│       │   │   ├── ClienteCardapio.jsx    → cardápio com imagens, busca e filtros
│       │   │   ├── ClienteCarrinho.jsx
│       │   │   ├── ClienteCheckout.jsx    → PIX (gated), Cartão, Dinheiro
│       │   │   ├── ClientePedidos.jsx     → pedidos da sessão atual (sessionStorage)
│       │   │   ├── ClientePerfil.jsx
│       │   │   └── CalendarioShows.jsx
│       │   └── dashboard/
│       │       ├── DashboardHome.jsx
│       │       ├── CozinhaView.jsx        → kanban + abas mobile + alertas Web Audio
│       │       ├── CardapioAdmin.jsx
│       │       ├── ConfiguracoesAdmin.jsx → tema completo + glass effect + fundo
│       │       ├── FuncionalidadesAdmin.jsx → ADMINSF only
│       │       ├── HistoricoPedidos.jsx
│       │       ├── MesasAdmin.jsx
│       │       ├── MenuTV.jsx
│       │       ├── NewsletterAdmin.jsx
│       │       ├── PagamentosPendentes.jsx
│       │       ├── PreferenciasAdmin.jsx
│       │       ├── PreferenciasAnalytics.jsx
│       │       ├── ShowMetricas.jsx
│       │       ├── ShowsAdmin.jsx
│       │       ├── ArtistasAdmin.jsx
│       │       └── UsuariosAdmin.jsx
│       ├── services/
│       │   ├── api.js             → Axios com interceptor JWT
│       │   └── socket.js          → Socket.io-client
│       ├── store/
│       │   ├── useCarrinhoStore.js
│       │   └── usePedidoStore.js
│       └── index.css              → CSS vars, temas light/dark, glass, animações, skeleton
│
├── server/
│   ├── src/
│   │   ├── app.js                 → Express, CORS dinâmico, rotas
│   │   ├── server.js              → HTTP + Socket.io
│   │   ├── lib/
│   │   │   └── prisma.js          → PrismaClient singleton (único no projeto)
│   │   ├── controllers/           → lógica dos endpoints
│   │   ├── middlewares/           → auth JWT, isAdmin, isAdminSF
│   │   ├── routes/                → rotas HTTP por domínio
│   │   ├── services/              → regras de negócio
│   │   │   └── storage.service.js → uploadFile/deleteFile (Supabase Storage)
│   │   ├── validators/            → schemas Zod
│   │   └── __tests__/             → 60+ testes Jest + supertest
│   ├── prisma/
│   │   ├── schema.prisma          → relationMode="prisma" (obrigatório PgBouncer)
│   │   └── migrations/
│   └── uploads/                   → fallback local (sem Supabase)
│
├── render.yaml                    → config deploy Render
├── README.md
└── DOCUMENTACAO.md                → guia completo de deploy e arquitetura
```

---

## Funcionalidades

### Área do Cliente (mobile-first)
- Hero imersivo com nome do restaurante, mesa e CTA para o cardápio
- Cardápio com imagens dos pratos, busca e filtros por categoria
- Carrinho flutuante com observações por item
- Checkout com **PIX** (QR Code EMV real, gated por feature flag), **Cartão** ou **Dinheiro**
- **Botão Garçom** na navegação — chama o garçom sem sair da mesa
- Acompanhamento de pedidos **isolado por sessão** (sessionStorage) — a nova visita à mesa não mistura pedidos de sessões anteriores
- **Fechar conta** — encerra a sessão da mesa e redireciona para a tela inicial
- Calendário de shows mensal com avaliação inline (⭐ 1–5)
- Perfil com preferências personalizáveis

### Dashboard Administrativo (responsivo)
- **Cozinha** — kanban com abas mobile (NOVO / PREPARANDO / PRONTO), fila em tempo real, **alertas sonoros** (Web Audio API) e toasts para novos pedidos e chamadas de garçom
- **Cardápio** — CRUD de itens e categorias com upload de imagem
- **Mesas** — mapa drag-and-drop com posição, cor e lugares
- **Shows & Artistas** — CRUD com vínculo, métricas pós-show e avaliações
- **Histórico** — pedidos com filtros, paginação e gráficos (Recharts)
- **Pagamentos** — confirmação manual de pagamentos Pix pendentes
- **Preferências** — perguntas de perfil do público + analytics
- **Newsletter** — gestão de e-mails inscritos
- **Configurações** — tema completo (cores light/dark, glass effect, imagem de fundo)
- **Funcionalidades** *(ADMINSF only)* — liga/desliga recursos por feature flag

### Menu TV
Tela full-screen para exibição em monitores ou TVs (`/menu-tv`), com carrossel automático de categorias e slide de próximos shows.

### Tema Customizável
O admin configura as cores do tema (light/dark), ativa o **glass effect** com cor, opacidade e blur ajustáveis, e faz upload de imagem de fundo. As cores propagam para todo o site — incluindo o cursor animado — via CSS Custom Properties.

---

## Roles e Permissões

| Role | Descrição | Acesso |
|---|---|---|
| `USER` | Cliente | Área do cliente, cardápio, pedidos, shows |
| `ADMIN` | Administrador | Dashboard completo (limitado pelos feature flags) |
| `ADMINSF` | Super Admin SF | Dashboard completo + controle de funcionalidades (nunca bloqueado por flags) |

### Feature Flags

O **ADMINSF** controla em **Configurações → Funcionalidades** quais recursos ficam visíveis:

| Flag | O que afeta |
|---|---|
| `feature_shows` | Sidebar Shows, rotas /shows e /artistas, CalendarioShows, seção da landing page |
| `feature_menutv` | Item no sidebar, rota /menu-tv e preview no dashboard |
| `feature_preferencias` | Sidebar Preferências, gerenciamento e analytics |
| `feature_mesas` | Item no sidebar e rota /mesas no dashboard |
| `feature_pix` | Opção PIX no checkout do cliente |

> Desativar um recurso não exclui dados — apenas oculta a interface. Reativar restaura tudo.

---

## Banco de Dados

**Provedor:** PostgreSQL via Supabase · **ORM:** Prisma 5 · **Conexão:** PgBouncer porta 6543

### Modelos principais

| Model | Descrição |
|---|---|
| `User` | Usuários com roles: USER, ADMIN, ADMINSF |
| `MenuCategoria` / `MenuItem` | Cardápio com imagem via Supabase Storage |
| `Pedido` / `PedidoItem` | Pedidos por mesa com itens e status |
| `Pagamento` | Método, status, QR Code Pix (EMV + base64) |
| `Mesa` | Layout drag-and-drop com posição e cor |
| `Configuracao` | Tema, glass effect e feature flags em chave=valor |
| `Artista` / `Show` | Agenda de shows com redes sociais e imagem |
| `AvaliacaoShow` | Nota 1–5 + comentário por usuário (upsert) |
| `PerguntaPreferencia` / `OpcaoPreferencia` / `RespostaPreferencia` | Pesquisa de perfil do público |
| `Newsletter` | E-mails inscritos |

### Fluxo de pagamento Pix

```
Cliente escolhe Pix no checkout
  → Backend gera payload EMV (padrão Banco Central BR, CRC16 validado)
  → QR Code base64 + string "copia e cola" salvos no banco
  → Cliente escaneia no app do banco
  → Admin confirma manualmente em /dashboard/pagamentos
```

---

## Testes Automatizados

O projeto possui **60+ testes** em `server/src/__tests__/`:

| Arquivo | Cobertura |
|---|---|
| `auth.middleware.test.js` | authMiddleware, isAdmin, isAdminSF |
| `auth.service.test.js` | login, register, validações |
| `pedido.service.test.js` | criação de pedidos, listagem, status |
| `pedido.service.extra.test.js` | listarMesasAbertas, fechar conta, edge cases |
| `pagamento.service.test.js` | pagamentos, confirmação PIX, pendentes |
| `clientePedidos.filter.test.js` | isolamento de pedidos por sessão |
| `configuracao.route.test.js` | GET/POST configurações, auth, erros |
| `prisma.lib.test.js` | singleton PrismaClient, parâmetros PgBouncer |

```bash
cd server && npm test
```

---

## Variáveis de Ambiente

### `server/.env`

```env
DATABASE_URL=postgresql://postgres.[REF]:[SENHA]@aws-...:6543/postgres?sslmode=require&pgbouncer=true&connection_limit=1&statement_cache_size=0
JWT_SECRET=<hex 32+ chars>
PORT=3001
NODE_ENV=development
FRONTEND_URL=https://seu-app.vercel.app
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=<service_role key>
PIX_CHAVE=restaurante@pix.com
PIX_NOME=Nome Do Restaurante
PIX_CIDADE=SAO PAULO
```

### `client/.env`

```env
VITE_API_BASE_URL=http://localhost:3001
```

> O arquivo `client/.env.production` está commitado com a URL do Render para produção.

---

## Rodando Localmente

### Pré-requisitos
- Node.js ≥ 20
- PostgreSQL local **ou** banco Supabase

```bash
# 1. Clone o repositório
git clone https://github.com/singlefutureadm-agency/cardapio-digital.git
cd cardapio-digital

# 2. Instale as dependências
cd server && npm install
cd ../client && npm install

# 3. Configure as variáveis de ambiente
cp server/.env.example server/.env
# Edite server/.env com suas credenciais

# 4. Sincronize o banco e gere o Prisma Client
cd server
npx prisma db push
npx prisma generate

# 5. Crie o usuário admin inicial
node criar-admin.js
node criar-mesas.js   # opcional — cria conjunto inicial de mesas

# 6. Inicie os servidores em terminais separados
npm run dev           # backend → http://localhost:3001

cd ../client
npm run dev           # frontend → http://localhost:5173
```

### Credenciais padrão

| Usuário | E-mail | Senha |
|---|---|---|
| Admin | admin@restaurante.com | admin123 |

> Para criar um ADMINSF, promova o usuário via SQL ou Prisma Studio:
> ```sql
> UPDATE "User" SET role = 'ADMINSF' WHERE email = 'email@exemplo.com';
> ```

---

## Deploy em Produção

### 1 — Supabase

1. Crie o bucket `uploads` (público) em **Storage**
2. Copie `Project URL` e a chave `service_role` em **Project Settings → API**
3. Rode no SQL Editor:
   ```sql
   ALTER TYPE "Role" ADD VALUE 'ADMINSF';
   ```

### 2 — Render (backend)

| Campo | Valor |
|---|---|
| Root Directory | `server` |
| Build Command | `npm ci && npx prisma generate` |
| Start Command | `npm start` |

Variáveis obrigatórias: `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV=production`, `PORT=3001`, `FRONTEND_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `PIX_CHAVE`, `PIX_NOME`, `PIX_CIDADE`

### 3 — Vercel (frontend)

| Campo | Valor |
|---|---|
| Root Directory | `client` |
| Framework | Vite (automático) |

Variável: `VITE_API_BASE_URL=https://seu-app.onrender.com`

### 4 — Conectar os dois

No Render, adicione `FRONTEND_URL=https://seu-app.vercel.app` e salve — redeploy automático aplica o CORS.

### Checklist pós-deploy

- [ ] Landing page carrega sem erros
- [ ] Login de cliente e admin funcionam
- [ ] Dashboard carrega dados do banco
- [ ] Pedido de teste → cozinha recebe em tempo real (Socket.io)
- [ ] Alerta sonoro na cozinha ao receber novo pedido
- [ ] Upload de imagem vai para o Supabase Storage
- [ ] Menu TV (`/menu-tv`) exibe o cardápio
- [ ] ADMINSF consegue ligar/desligar features em Configurações → Funcionalidades
- [ ] Tema salvo propaga para todo o site (cursor, glass, imagem de fundo)

---

## Arquitetura

```
Browser / App
     │
     ├──► Vercel (React 19 + Vite)
     │         │  VITE_API_BASE_URL
     │         ▼
     │    Render (Express + Socket.io)
     │         │
     │         ├──► Supabase PostgreSQL  (dados)
     │         └──► Supabase Storage     (imagens)
     │
     └──► Socket.io WebSocket (mesmo servidor Render)
              Sala "cozinha"     → pedidos em tempo real para o admin
              Sala "mesa_{num}"  → status do pedido para o cliente
```

---

<p align="center">
  Desenvolvido por <strong>Single Future ADM Agency</strong>
</p>
