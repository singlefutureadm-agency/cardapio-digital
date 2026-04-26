# Cardápio Digital — Documentação Completa

Sistema fullstack de cardápio digital com pedidos em tempo real, dashboard administrativo,
área do cliente, pagamento Pix, calendário de shows, analytics e sistema de feature flags.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## ÍNDICE

  1. Visão Geral
  2. Estrutura do Projeto
  3. Sistema de Roles e Feature Flags
  4. CLIENT — Frontend (React + Vite)
  5. SERVER — Backend (Node.js + Express)
  6. BANCO DE DADOS (PostgreSQL + Prisma)
  7. STORAGE DE IMAGENS (Supabase Storage)
  8. Variáveis de Ambiente
  9. Comandos de Desenvolvimento
 10. PASSO A PASSO — Publicação em Produção
 11. Arquitetura de Produção
 12. Credenciais e Acessos

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 1. VISÃO GERAL

Infraestrutura:

  - Frontend  →  Vercel          (React 19 + Vite)
  - Backend   →  Render          (Node.js 20+ + Express)
  - Banco     →  Supabase        (PostgreSQL gerenciado)
  - Storage   →  Supabase        (imagens de pratos, artistas, fundo e planta)
  - Realtime  →  Socket.io       (pedidos em tempo real)

Fluxo principal:

  Cliente escaneia QR da mesa
    → Faz login / cadastro
    → Navega no cardápio
    → Adiciona itens ao carrinho
    → Realiza pedido (Pix, Cartão ou Dinheiro)
    → Acompanha status em tempo real
    → Cozinha recebe e atualiza o status
    → Garçom entrega

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 2. ESTRUTURA DO PROJETO

  cardapio-digital/
  ├── client/
  │   ├── index.html                → Fontes Google (DM Sans, Playfair Display, Orbitron)
  │   └── src/
  │       ├── App.jsx               → Todas as rotas + FeatureGate + ProtectedRoute
  │       ├── config/
  │       │   └── index.js          → API_BASE e API_URL centralizados
  │       ├── components/
  │       │   ├── GlobalCursor.jsx
  │       │   ├── ProtectedRoute.jsx → adminOnly, adminSFOnly props
  │       │   ├── SFFooter.jsx      → Rodapé Single Future (todas as páginas)
  │       │   ├── ThemeToggle.jsx
  │       │   ├── CarrinhoFlutuante.jsx
  │       │   ├── ItemCard.jsx
  │       │   ├── PedidoCard.jsx
  │       │   └── PreferenciasForm.jsx
  │       ├── context/
  │       │   ├── AuthContext.jsx   → usuário, token JWT, interceptor Axios
  │       │   └── ThemeContext.jsx  → tema, glass, bgUrl, features (feature flags)
  │       ├── layouts/
  │       │   ├── DashboardLayout.jsx → sidebar dinâmica por role+features, SFFooter
  │       │   └── ClienteLayout.jsx   → header, bottom nav, SFFooter
  │       ├── pages/
  │       │   ├── LandingPage.jsx
  │       │   ├── Login.jsx
  │       │   ├── Register.jsx
  │       │   ├── SelecionarMesa.jsx
  │       │   ├── PedidoStatus.jsx
  │       │   ├── Carrinho.jsx
  │       │   ├── cliente/
  │       │   │   ├── CalendarioShows.jsx
  │       │   │   ├── ClienteCardapio.jsx
  │       │   │   ├── ClienteCarrinho.jsx
  │       │   │   ├── ClienteCheckout.jsx
  │       │   │   ├── ClienteHome.jsx
  │       │   │   ├── ClientePedidos.jsx
  │       │   │   └── ClientePerfil.jsx
  │       │   └── dashboard/
  │       │       ├── ArtistasAdmin.jsx
  │       │       ├── CardapioAdmin.jsx
  │       │       ├── ConfiguracoesAdmin.jsx
  │       │       ├── CozinhaView.jsx
  │       │       ├── DashboardHome.jsx
  │       │       ├── FuncionalidadesAdmin.jsx  → ADMINSF only — toggles de features
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
  │       │   ├── api.js            → instância Axios com baseURL e interceptor JWT
  │       │   └── socket.js         → instância Socket.io-client
  │       ├── store/
  │       │   ├── useCarrinhoStore.js
  │       │   └── usePedidoStore.js
  │       └── index.css             → CSS Variables, temas light/dark, glass mode
  │
  ├── server/
  │   ├── src/
  │   │   ├── app.js                → Express, CORS dinâmico, middlewares, rotas
  │   │   ├── server.js             → HTTP server + Socket.io
  │   │   ├── lib/
  │   │   │   └── prisma.js         → PrismaClient singleton (compartilhado por todos)
  │   │   ├── controllers/          → lógica dos endpoints
  │   │   ├── middlewares/
  │   │   │   ├── auth.middleware.js → authMiddleware, isAdmin, isAdminSF
  │   │   │   ├── error.middleware.js
  │   │   │   └── validate.middleware.js
  │   │   ├── routes/               → definição das rotas HTTP
  │   │   ├── services/             → regras de negócio (todos importam lib/prisma)
  │   │   │   └── storage.service.js → uploadFile/deleteFile (Supabase Storage)
  │   │   └── validators/           → schemas Zod (auth, pedido)
  │   ├── prisma/
  │   │   ├── schema.prisma         → schema completo (relationMode="prisma")
  │   │   ├── seed.js
  │   │   └── migrations/
  │   └── uploads/                  → fallback local (apenas sem Supabase configurado)
  │
  ├── LICENSE                       → Propriedade de Miguel Cezar Ferreira / Single Future
  ├── render.yaml                   → config de deploy no Render
  ├── README.md                     → visão geral pública do projeto
  └── DOCUMENTACAO.md               → este arquivo

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 3. SISTEMA DE ROLES E FEATURE FLAGS

### Roles

  USER      → Cliente padrão. Acessa /cliente/:mesa e suas sub-rotas.
  ADMIN     → Acessa /dashboard completo. Vê apenas recursos que o ADMINSF ativou.
  ADMINSF   → Superadmin. Acesso irrestrito. Pode ativar/desativar funcionalidades
              para USER e ADMIN via página /dashboard/funcionalidades.

  No login (Login.jsx), a regra de redirecionamento é:
    role === 'ADMIN' || role === 'ADMINSF'  →  /dashboard
    role === 'USER'                          →  /selecionar-mesa

### Feature Flags

  As flags são salvas na tabela Configuracao com as chaves:
    feature_shows        → '0' (desativado) | '1' (ativado) | ausente (ativado por padrão)
    feature_menutv       → idem
    feature_preferencias → idem
    feature_mesas        → idem

  Derivadas no ThemeContext como objeto `features`:
    features.shows        → boolean
    features.menutv       → boolean
    features.preferencias → boolean
    features.mesas        → boolean

  Lógica de default: `config.feature_X !== '0'` — ausência da chave = ativado.

  Componente FeatureGate (App.jsx):
    - ADMINSF sempre passa, independente do valor
    - Se feature desativada: redireciona para /dashboard (logado) ou / (anônimo)

  Sidebar (DashboardLayout.jsx buildNav):
    - Itens condicionais aparecem apenas se feature ativada OU role === 'ADMINSF'
    - ADMINSF vê "Configurações" como grupo com filhos "Tema" e "Funcionalidades"
    - ADMIN vê "Configurações" como link direto (sem "Funcionalidades")

### Middlewares de Autenticação (server)

  authMiddleware  → verifica JWT, injeta req.user
  isAdmin         → aceita ADMIN ou ADMINSF
  isAdminSF       → aceita apenas ADMINSF (ex: rota de funcionalidades)

### ProtectedRoute (client)

  <ProtectedRoute>             → requer login (qualquer role)
  <ProtectedRoute adminOnly>   → requer ADMIN ou ADMINSF
  <ProtectedRoute adminSFOnly> → requer ADMINSF

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 4. CLIENT — FRONTEND

  Tecnologias:  React 19, Vite 8, Tailwind CSS 3, Axios, Socket.io-client 4,
                Zustand 5, GSAP + ScrollTrigger, Recharts 3, @dnd-kit (mesas),
                React Router DOM 7, jwt-decode

  Porta local:  http://localhost:5173

  Fontes (index.html):  DM Sans, Playfair Display, Orbitron (Single Future footer)

### Rotas da aplicação

  /                           → Landing Page (shows automáticos se feature ativa)
  /login                      → Login
  /register                   → Cadastro
  /selecionar-mesa            → Seleção de mesa (requer login)
  /menu-tv                    → Menu TV tela cheia (FeatureGate: menutv)
  /pedido/:id                 → Status do pedido em tempo real

  /cliente/:mesa              → ClienteLayout (ProtectedRoute)
    index                     → ClienteHome (CalendarioShows se feature.shows)
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
    historico                 → HistoricoPedidos
    pagamentos                → PagamentosPendentes
    configuracoes             → ConfiguracoesAdmin
    funcionalidades           → FuncionalidadesAdmin (ProtectedRoute adminSFOnly)
    mesas                     → MesasAdmin (FeatureGate: mesas)
    menu-tv                   → MenuTVPreview (FeatureGate: menutv)
    preferencias              → PreferenciasAdmin (FeatureGate: preferencias)
    preferencias/analytics    → PreferenciasAnalytics (FeatureGate: preferencias)
    shows                     → ShowsAdmin (FeatureGate: shows)
    shows/:id/metricas        → ShowMetricas (FeatureGate: shows)
    artistas                  → ArtistasAdmin (FeatureGate: shows)

### Configuração de URL (importante)

  client/src/config/index.js:
    API_BASE = VITE_API_BASE_URL (ex: https://cardapio-digital-api.onrender.com)
    API_URL  = API_BASE + "/api" (usado pelo Axios como baseURL)

  Regra de exibição de imagens — sempre verificar antes de prefixar:
    src={url.startsWith('http') ? url : `${API_BASE}${url}`}

### Estado global

  AuthContext       → usuário logado, token JWT, interceptor Axios
  ThemeContext      → tema (light/dark), glass, bgUrl, features (feature flags),
                      salvarCores() para salvar config/features no banco
  useCarrinhoStore  → itens, adicionarItem, removerItem, limparCarrinho, totais
  usePedidoStore    → pedido atual em andamento

### SFFooter — Rodapé Single Future

  Componente: client/src/components/SFFooter.jsx
  Presente em: todas as páginas (layouts e standalone)
  Posicionamento: normal no fluxo do documento (não fixo)
  Padrão sticky-footer: container pai = min-h-screen flex flex-col;
    conteúdo interno = flex-1; SFFooter ao final → sempre no bottom.
  Estilo: fundo #040404, cor #00e5a8, fonte Orbitron
  Link: https://www.singlefuture.com.br

### Comunicação com o backend

  HTTP:     Axios com interceptor JWT automático
  Realtime: Socket.io — salas "cozinha" e "mesa_{numero}"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 5. SERVER — BACKEND

  Tecnologias:  Node.js ≥20, Express 5, Prisma 5, Socket.io 4,
                JWT, bcryptjs, Multer (memoryStorage), Supabase JS, Zod 4, QRCode

  Porta local:  http://localhost:3001

### PrismaClient Singleton

  TODOS os arquivos (services e routes) importam de um único lugar:
    server/src/lib/prisma.js

  Configuração:
    const prisma = new PrismaClient({
      datasources: { db: { url: process.env.DATABASE_URL } },
      log: ['error'],
    })

  Nunca criar `new PrismaClient()` diretamente nos services/routes.
  Razão: PgBouncer em modo transaction não suporta múltiplas conexões com
  prepared statements. Um singleton com connection_limit=1 resolve isso.

### Rotas da API

  Prefixo base: /api

  /api/auth
    POST  /login     → Autenticação (retorna JWT 7 dias)
    POST  /register  → Cadastro de usuário (role USER por padrão)
    GET   /me        → Dados do usuário logado

  /api/menu (público)
    GET   /          → Cardápio completo com categorias e itens disponíveis

  /api/admin (requer isAdmin)
    CRUD completo de itens, categorias e imagens do cardápio
    CRUD de usuários

  /api/pedidos (requer login)
    POST  /           → Criar pedido
    GET   /historico  → Histórico com filtros
    PATCH /:id/status → Atualizar status (admin)

  /api/pagamentos (requer login)
    POST  /               → Criar pagamento (gera QR Pix EMV)
    GET   /pedido/:id     → Buscar pagamento do pedido
    GET   /pendentes      → Listar pendentes (admin)
    PATCH /:id/confirmar  → Confirmar manualmente (admin)

  /api/mesas
    GET   /ativas    → Mesas ativas (público)
    CRUD completo    → (admin)

  /api/configuracoes
    GET   /          → Configurações de tema (público)
    POST  /          → Salvar configurações e feature flags (admin)
    POST  /fundo     → Upload imagem de fundo
    DELETE /fundo    → Remover imagem de fundo

  /api/upload (requer isAdmin)
    POST  /planta      → Upload da planta do restaurante
    GET   /planta/info → URL atual da planta

  /api/shows, /api/artistas, /api/newsletter, /api/preferencias, /api/cliente
    (ver seção BANCO DE DADOS para detalhes de cada model)

### Autenticação e Autorização

  Header obrigatório em rotas protegidas:
    Authorization: Bearer <token_jwt>

  Middlewares em auth.middleware.js:
    authMiddleware → verifica e decodifica JWT, injeta req.user
    isAdmin        → permite ADMIN e ADMINSF
    isAdminSF      → permite apenas ADMINSF

### Tempo real (Socket.io)

  Salas:
    cozinha       → admin/cozinheiro
    mesa_{numero} → cliente daquela mesa

  Eventos servidor → cliente:
    pedido_novo        → sala "cozinha"    (pedido criado)
    pedido_atualizado  → sala "cozinha"    (status mudou)
    status_atualizado  → sala "mesa_X"    ({ pedidoId, status })

### Pagamento Pix

  Gera payload QR Code EMV real (padrão Banco Central) com CRC16.
  Config via: PIX_CHAVE, PIX_NOME, PIX_CIDADE
  Confirmação: manual pelo admin em /dashboard/pagamentos

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 6. BANCO DE DADOS

  Provedor:       PostgreSQL (Supabase)
  ORM:            Prisma 5
  Conexão:        PgBouncer via Supabase Pooler (porta 6543)
  relationMode:   "prisma" (FK simulada em memória — obrigatório com PgBouncer)

### Configuração PgBouncer (CRÍTICO)

  DATABASE_URL deve conter todos estes parâmetros:
    ?sslmode=require&pgbouncer=true&connection_limit=1&statement_cache_size=0

  statement_cache_size=0 → desativa prepared statements (incompatíveis com PgBouncer)
  connection_limit=1     → uma conexão por instância Node (singleton garante isso)
  relationMode="prisma"  → Prisma simula FKs em memória em vez de usar o banco

  Sem esses parâmetros ocorre o erro:
    "prepared statement s0 already exists"

### Modelos

  User              → nome, email, senha (bcrypt), role: USER|ADMIN|ADMINSF
                      relações: pedidos[], respostas[], avaliacoes[]

  MenuCategoria     → nome, ordem
                      relações: itens: MenuItem[]

  MenuItem          → nome, descricao, preco, disponivel, categoriaId, imagemUrl?
                      imagemUrl: URL absoluta do Supabase Storage (https://...)
                      @@map("menu_items")

  Pedido            → mesa, mesaId?, status, total, userId?
                      relações: itens[], pagamento?, mesaRel?, user?

  PedidoItem        → pedidoId, menuItemId, quantidade, observacao?, subtotal
                      @@map("pedido_items")

  Pagamento         → pedidoId @unique, tipo, metodo, status, qrCode?, pixCopiaECola?

  Mesa              → numero @unique, ativa, lugares, posX, posY, cor

  Configuracao      → chave @unique, valor
                      Uso: prefixos light_/dark_ para cores do tema,
                           planta_url para planta do restaurante,
                           feature_shows / feature_menutv / feature_preferencias /
                           feature_mesas para feature flags ('0'=off, '1'=on)

  PerguntaPreferencia, OpcaoPreferencia, RespostaPreferencia (@@unique[userId, perguntaId])

  Newsletter        → email @unique, ativo

  Artista           → nome, bio?, genero?, imagemUrl?, instagram?, spotify?,
                      youtube?, tiktok?, site?, ativo
                      relações: shows[]

  Show              → titulo, descricao?, data, horario, genero?, imagemUrl?,
                      ativo, artistaId?
                      relações: artista?, avaliacoes[]

  AvaliacaoShow     → showId, userId, nota (1-5), comentario?
                      @@unique([showId, userId])

### Enums

  StatusPedido:    NOVO | PREPARANDO | PRONTO | ENTREGUE | CANCELADO
  TipoPagamento:   GARCOM | ONLINE
  MetodoPagamento: DINHEIRO | CARTAO | PIX
  StatusPagamento: PENDENTE | PAGO | CANCELADO
  Role:            USER | ADMIN | ADMINSF

### Migrations

  2 arquivos de migration presentes:
    20260425170240_init               → schema completo inicial
    20260425172934_add_artistas_avaliacoes → Artista, AvaliacaoShow, User.avaliacoes

  O enum ADMINSF foi adicionado via SQL direto no Supabase:
    ALTER TYPE "Role" ADD VALUE 'ADMINSF';
  (npx prisma db push falha com PgBouncer — usar SQL Editor do Supabase para enums)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 7. STORAGE DE IMAGENS

  Provedor: Supabase Storage — bucket: uploads (público)

  Serviço central: server/src/services/storage.service.js
    uploadFile(buffer, filename, mimetype) → URL pública absoluta
    deleteFile(urlOrPath)                  → remove do bucket

  Convenção de nomes no bucket:
    item_{id}.{ext}    → foto de prato
    artista_{id}.{ext} → foto de artista
    fundo.{ext}        → imagem de fundo do tema glass
    planta.{ext}       → planta do restaurante (URL em Configuracao.planta_url)

  Regra obrigatória no frontend:
    src={url.startsWith('http') ? url : `${API_BASE}${url}`}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 8. VARIÁVEIS DE AMBIENTE

### server/.env (não commitado)

  DATABASE_URL         postgresql://...:6543/postgres?sslmode=require&pgbouncer=true
                         &connection_limit=1&statement_cache_size=0
  JWT_SECRET           Chave hex de 32+ chars
  PORT                 3001
  NODE_ENV             development | production
  FRONTEND_URL         URL do frontend em produção (CORS + Socket.io)
  SUPABASE_URL         https://xxx.supabase.co
  SUPABASE_SERVICE_KEY service_role key (NUNCA expor no frontend)
  PIX_CHAVE            Chave Pix do restaurante
  PIX_NOME             Nome recebedor (máx. 25 chars, sem acentos)
  PIX_CIDADE           Cidade recebedor (máx. 15 chars, sem acentos)

### client/.env (não commitado, desenvolvimento)

  VITE_API_BASE_URL    http://localhost:3001

### client/.env.production (commitado — apenas vars VITE_)

  VITE_API_BASE_URL    https://cardapio-digital-api-my6t.onrender.com

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 9. COMANDOS DE DESENVOLVIMENTO

  # Instalar dependências
  cd client && npm install
  cd server && npm install

  # Iniciar em desenvolvimento
  cd client && npm run dev        → http://localhost:5173
  cd server && npm run dev        → http://localhost:3001 (nodemon)

  # Build do frontend (verificar antes de publicar)
  cd client && npm run build

  # Banco de dados
  cd server && npx prisma generate
  cd server && npx prisma studio        → Interface visual (porta 5555)
  cd server && npx prisma migrate dev --name nome

  ATENÇÃO: npx prisma db push com PgBouncer (porta 6543) falha para operações
  que usam prepared statements (ex: ALTER TYPE). Para esses casos, use o
  SQL Editor do Supabase diretamente.

  # Setup inicial
  cd server && node criar-admin.js    → Cria usuário ADMIN padrão
  cd server && node criar-mesas.js    → Cria mesas iniciais

  # Criar ADMINSF manualmente (via Prisma Studio ou SQL)
  UPDATE "User" SET role = 'ADMINSF' WHERE email = 'email@exemplo.com';

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 10. PASSO A PASSO — PUBLICAÇÃO EM PRODUÇÃO

  Plataformas:
    Banco de dados + Storage  →  Supabase  (gratuito)
    Backend                   →  Render    (gratuito, dorme após 15min)
    Frontend                  →  Vercel    (gratuito)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### ETAPA 1 — Configurar Supabase

  1.1  Acesse https://supabase.com — seu projeto já está configurado via DATABASE_URL.

  1.2  Criar bucket de imagens:
       Storage → New bucket → Nome: uploads → Public bucket → Save

  1.3  Copiar credenciais:
       Project Settings → API → "Project URL" e chave "service_role"

  1.4  Gerar JWT_SECRET:
       node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### ETAPA 2 — Preparar repositório

  2.1  Verificar que .env NÃO está sendo commitado (git status)
  2.2  git add . && git commit -m "deploy" && git push origin main

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### ETAPA 3 — Publicar backend no Render

  3.1  render.com → New+ → Web Service → conectar repositório GitHub

  3.2  Configurar:
         Root Directory: server
         Build Command:  npm ci && npx prisma generate
         Start Command:  npm start
         Plan:           Free

  3.3  Variáveis de ambiente (Environment):
         DATABASE_URL         → postgresql://...:6543/postgres?sslmode=require
                                  &pgbouncer=true&connection_limit=1&statement_cache_size=0
         JWT_SECRET           → valor do passo 1.4
         NODE_ENV             → production
         PORT                 → 3001
         FRONTEND_URL         → (preencher após deploy Vercel)
         SUPABASE_URL         → https://xxxx.supabase.co
         SUPABASE_SERVICE_KEY → service_role key
         PIX_CHAVE / PIX_NOME / PIX_CIDADE → dados Pix do restaurante

  3.4  Aguardar build (3–8 min). Testar: /api/menu deve retornar JSON.

  3.5  Criar banco via Shell do Render:
         npx prisma db push
         node criar-admin.js
         node criar-mesas.js

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### ETAPA 4 — Publicar frontend na Vercel

  4.1  vercel.com → Add New → Project → importar repositório

  4.2  Configurar:
         Root Directory: client
         Framework:      Vite

  4.3  Variável de ambiente:
         VITE_API_BASE_URL → URL do Render (sem /api, sem barra final)

  4.4  Deploy → aguardar → anotar a URL gerada

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### ETAPA 5 — Conectar Vercel ↔ Render

  5.1  Render → Environment → FRONTEND_URL = URL da Vercel → Save Changes

  5.2  Testar sistema completo:
       [ ] Login como ADMIN → redireciona para /dashboard
       [ ] Login como ADMINSF → redireciona para /dashboard
       [ ] Login como USER → redireciona para /selecionar-mesa
       [ ] Dashboard carrega dados do banco
       [ ] Cozinha recebe pedido em tempo real
       [ ] Upload de imagem funciona (Supabase Storage)
       [ ] ADMINSF acessa Funcionalidades e toggle features
       [ ] Feature desativada → item some do sidebar e rota redireciona

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 11. ARQUITETURA DE PRODUÇÃO

  Browser / App
       │
       ├──► Vercel (Frontend React)
       │         │
       │         └──► Render (Backend Express + Socket.io)
       │                    │
       │                    ├──► Supabase PostgreSQL  (dados)
       │                    └──► Supabase Storage     (imagens)
       │
       └──► Socket.io WebSocket (mesmo servidor Render)

  Variáveis que conectam os serviços:

    Vercel                              Render
    ──────────────────────              ──────────────────────────────────
    VITE_API_BASE_URL ─────────────►   (URL do Render — onde chamar a API)
                                        FRONTEND_URL ◄──── (URL da Vercel — CORS)
                                        DATABASE_URL ──────► Supabase PostgreSQL
                                        SUPABASE_URL ──────► Supabase Storage
                                        SUPABASE_SERVICE_KEY ► Supabase Storage

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 12. CREDENCIAIS E ACESSOS

  DESENVOLVIMENTO LOCAL

    Admin padrão (criar-admin.js):
      E-mail: admin@restaurante.com
      Senha:  admin123
      Role:   ADMIN

    Para ADMINSF: alterar role via SQL ou Prisma Studio após criar o usuário.

    Backend:       http://localhost:3001
    Frontend:      http://localhost:5173
    Prisma Studio: http://localhost:5555

  PRODUÇÃO

    Supabase:  https://supabase.com/dashboard
    Render:    https://dashboard.render.com
    Vercel:    https://vercel.com/dashboard
    GitHub:    https://github.com/singlefutureadm-agency/cardapio-digital

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## OBSERVAÇÕES IMPORTANTES

  1. PgBouncer (Supabase Pooler porta 6543) exige:
       - statement_cache_size=0 na DATABASE_URL
       - connection_limit=1 na DATABASE_URL
       - relationMode="prisma" no schema.prisma
       - PrismaClient como singleton (lib/prisma.js)
     Sem isso: erro "prepared statement s0 already exists"

  2. Para adicionar valores a ENUMs do Prisma com PgBouncer, não use
     npx prisma db push — execute SQL direto no Supabase:
       ALTER TYPE "Role" ADD VALUE 'NOME_DO_VALOR';

  3. O plano gratuito do Render dorme após 15min sem uso.
     Primeira requisição pode demorar 30–60s.
     Use UptimeRobot para manter ativo ou upgrade para Starter ($7/mês).

  4. Nunca commitar .env com secrets. O .env.production é commitado
     intencionalmente (apenas vars VITE_ sem secrets).

  5. Confirmação de pagamento Pix é manual no /dashboard/pagamentos.
     Para automação, integrar webhook de provedor de pagamento.

  6. Supabase Storage retorna URLs absolutas. Sempre verificar antes de prefixar:
       url.startsWith('http') ? url : `${API_BASE}${url}`

  7. O SFFooter usa padrão sticky-footer sem position:fixed.
     O container pai deve ser min-h-screen flex flex-col e o conteúdo
     interno deve ter flex-1, para o footer ficar sempre no bottom.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
