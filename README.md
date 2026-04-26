<h1 align="center">🍽️ Cardápio Digital</h1>

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
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Rodando Localmente](#rodando-localmente)
- [Deploy em Produção](#deploy-em-produção)
- [Arquitetura](#arquitetura)

---

## Visão Geral

Plataforma completa para restaurantes: o cliente escaneia o QR code da mesa, navega no cardápio, faz o pedido e acompanha o status em tempo real. A cozinha recebe tudo instantaneamente via WebSocket. O admin gerencia cardápio, mesas, shows, artistas, pagamentos e analytics pelo dashboard.

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
| Estilo | Tailwind CSS + CSS Variables customizadas |
| Estado global | Zustand 5 |
| Roteamento | React Router DOM 7 |
| HTTP | Axios com interceptor JWT automático |
| Realtime | Socket.io-client 4 |
| Animações | GSAP + ScrollTrigger |
| Gráficos | Recharts 3 |
| Drag-and-drop | @dnd-kit (mapa de mesas) |

### Backend — `server/`

| Item | Tecnologia |
|---|---|
| Runtime | Node.js ≥ 20 |
| Framework | Express 5 |
| ORM | Prisma 5 |
| Banco | PostgreSQL (Supabase) |
| Realtime | Socket.io 4 |
| Auth | JWT + bcryptjs |
| Validação | Zod 4 |
| Upload | Multer (memoryStorage → Supabase Storage) |
| QR Code | qrcode (padrão EMV Banco Central) |

---

## Estrutura do Projeto

```
cardapio-digital/
├── client/                        → Frontend React
│   ├── hooks/
│   │   └── useShows.js            → hook useProximosShows()
│   ├── src/
│   │   ├── App.jsx                → todas as rotas + FeatureGate
│   │   ├── config/index.js        → API_BASE e API_URL centralizados
│   │   ├── components/            → ProtectedRoute, ThemeToggle, etc.
│   │   ├── context/
│   │   │   ├── AuthContext.jsx    → usuário, token JWT, interceptor
│   │   │   └── ThemeContext.jsx   → tema, glass effect, feature flags
│   │   ├── layouts/
│   │   │   ├── DashboardLayout.jsx → sidebar dinâmico por role/features
│   │   │   └── ClienteLayout.jsx
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── cliente/           → área do cliente (cardápio, shows, checkout)
│   │   │   └── dashboard/         → painel admin (CRUD, analytics, config)
│   │   ├── services/
│   │   │   ├── api.js             → Axios com baseURL e interceptor JWT
│   │   │   └── socket.js          → Socket.io-client
│   │   └── store/                 → Zustand (carrinho, pedido)
│   ├── .env.production            → VITE_API_BASE_URL (commitado)
│   └── vercel.json                → rewrite SPA → index.html
│
├── server/                        → Backend Node.js
│   ├── src/
│   │   ├── app.js                 → Express, CORS dinâmico, rotas
│   │   ├── server.js              → HTTP + Socket.io
│   │   ├── controllers/           → lógica dos endpoints
│   │   ├── middlewares/           → auth JWT, isAdmin, isAdminSF
│   │   ├── routes/                → rotas HTTP organizadas por domínio
│   │   ├── services/
│   │   │   └── storage.service.js → uploadFile/deleteFile (Supabase Storage)
│   │   └── validators/            → schemas Zod
│   ├── prisma/
│   │   ├── schema.prisma          → schema completo
│   │   └── migrations/
│   └── uploads/                   → imagens locais (só desenvolvimento)
│
├── render.yaml                    → config de deploy no Render
└── DOCUMENTACAO.md                → guia completo de deploy e arquitetura
```

---

## Funcionalidades

### Área do Cliente
- Navegação no cardápio por categoria com busca e filtros
- Carrinho flutuante com observações por item
- Checkout com **PIX** (QR Code EMV real), **Cartão** ou **Dinheiro**
- Acompanhamento do status do pedido em tempo real
- Calendário de shows mensal com avaliação inline (⭐ 1–5)
- Perfil com preferências personalizáveis

### Dashboard Administrativo
- **Cozinha** — fila de pedidos em tempo real, atualização de status
- **Cardápio** — CRUD de itens e categorias com upload de imagem
- **Mesas** — mapa drag-and-drop com posição, cor e lugares
- **Shows & Artistas** — CRUD com vínculo, métricas pós-show e avaliações
- **Histórico** — pedidos com filtros, paginação e gráficos (Recharts)
- **Pagamentos** — confirmação manual de pagamentos Pix pendentes
- **Preferências** — perguntas de perfil do público + analytics
- **Newsletter** — gestão de e-mails inscritos
- **Configurações** — tema completo (cores, glass effect, imagem de fundo)
- **Funcionalidades** *(ADMINSF only)* — liga/desliga recursos por feature flag

### Menu TV
Tela full-screen para exibição em monitores ou TVs (`/menu-tv`), com carrossel automático de categorias e slide de próximos shows.

---

## Roles e Permissões

O sistema possui **3 roles** com níveis de acesso distintos:

| Role | Descrição | Acesso |
|---|---|---|
| `USER` | Cliente | Área do cliente, cardápio, pedidos, shows |
| `ADMIN` | Administrador | Dashboard completo (limitado pelos feature flags) |
| `ADMINSF` | Super Admin SF | Dashboard completo + controle de funcionalidades (nunca bloqueado por flags) |

### Feature Flags

O **ADMINSF** controla em **Configurações → Funcionalidades** quais recursos ficam visíveis para `USER` e `ADMIN`:

| Feature | O que afeta |
|---|---|
| **Shows** | Sidebar Shows, rotas /shows e /artistas, CalendarioShows no cliente, seção da landing page |
| **Menu TV** | Item no sidebar, rota /menu-tv pública e preview no dashboard |
| **Preferências** | Sidebar Preferências, rotas de gerenciamento e analytics, seção no perfil do cliente |
| **Mesas** | Item no sidebar, rota /mesas no dashboard |

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
Cliente escolhe Pix
  → Backend gera payload EMV (padrão Banco Central BR, CRC16 validado)
  → QR Code base64 + string "copia e cola" salvos no banco
  → Cliente escaneia no app do banco
  → Admin confirma manualmente em /dashboard/pagamentos
```

---

## Variáveis de Ambiente

### `server/.env`

```env
DATABASE_URL=postgresql://postgres.[REF]:[SENHA]@aws-...:6543/postgres
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

> Para criar um ADMINSF, use o script abaixo no diretório `server/`:
> ```bash
> node -e "
> const { PrismaClient } = require('@prisma/client');
> const bcrypt = require('bcryptjs');
> const p = new PrismaClient();
> bcrypt.hash('senha123', 10).then(h =>
>   p.user.create({ data: { nome: 'Admin SF', email: 'adminsf@restaurante.com', senha: h, role: 'ADMINSF' } })
> ).then(() => { console.log('ADMINSF criado'); p.\$disconnect(); });
> "
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

Variáveis de ambiente obrigatórias: `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV=production`, `PORT=3001`, `FRONTEND_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `PIX_CHAVE`, `PIX_NOME`, `PIX_CIDADE`

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
- [ ] Pedido de teste + cozinha recebe em tempo real (Socket.io)
- [ ] Upload de imagem vai para o Supabase Storage
- [ ] Menu TV (`/menu-tv`) exibe o cardápio
- [ ] ADMINSF consegue ligar/desligar features em Configurações → Funcionalidades

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
