# Cardápio Digital — Documentação Completa

Sistema fullstack de cardápio digital com pedidos em tempo real, dashboard administrativo,
área do cliente, pagamento Pix, calendário de shows, analytics e sistema de feature flags.

Última atualização: 2026-05-10 (sessão 2)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## ÍNDICE

  1. Visão Geral
  2. Estrutura do Projeto
  3. Sistema de Roles e Feature Flags
  4. CLIENT — Frontend (React + Vite)
  5. SERVER — Backend (Node.js + Express)
  6. BANCO DE DADOS (PostgreSQL + Prisma)
  7. STORAGE DE IMAGENS (Supabase Storage)
  8. SISTEMA DE TEMA (ThemeContext)
  9. ACESSIBILIDADE (a11y)
 10. ESCALABILIDADE E PERFORMANCE
 11. TESTES AUTOMATIZADOS
 12. Variáveis de Ambiente
 13. Comandos de Desenvolvimento
 14. PASSO A PASSO — Publicação em Produção
 15. Arquitetura de Produção
 16. Credenciais e Acessos
 17. Observações Importantes

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 1. VISÃO GERAL

Infraestrutura:

  - Frontend  →  Vercel          (React 19 + Vite 8)
  - Backend   →  Render          (Node.js 20+ + Express 5)
  - Banco     →  Supabase        (PostgreSQL gerenciado, PgBouncer porta 6543)
  - Storage   →  Supabase        (imagens de pratos, artistas, fundo e planta)
  - Realtime  →  Socket.io 4     (pedidos em tempo real)

Fluxo principal:

  Cliente escaneia QR da mesa
    → Faz login / cadastro
    → Navega no cardápio (com imagens dos pratos)
    → Adiciona itens ao carrinho
    → Realiza pedido (Pix, Cartão ou Dinheiro)
    → Acompanha status em tempo real (isolado por sessão)
    → Cozinha recebe alerta sonoro + atualiza o status no kanban
    → Garçom entrega
    → Cliente encerra a sessão ("fechar conta")

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 2. ESTRUTURA DO PROJETO

  cardapio-digital/
  ├── client/
  │   ├── index.html                  → Fontes Google (DM Sans, Playfair Display, Orbitron)
  │   └── src/
  │       ├── App.jsx                 → Todas as rotas + FeatureGate + ProtectedRoute
  │       ├── config/
  │       │   └── index.js            → API_BASE e API_URL centralizados
  │       ├── components/
  │       │   ├── GlobalCursor.jsx        → cursor animado GSAP, cor via var(--brand)
  │       │   ├── ProtectedRoute.jsx      → adminOnly, adminSFOnly props
  │       │   ├── SFFooter.jsx            → Rodapé Single Future (todas as páginas)
  │       │   ├── AcessibilidadeWidget.jsx → barra a11y flutuante (bottom:55% right:9px)
  │       │   ├── ThemeToggle.jsx
  │       │   ├── CarrinhoFlutuante.jsx
  │       │   ├── ItemCard.jsx
  │       │   ├── PedidoCard.jsx
  │       │   └── PreferenciasForm.jsx
  │       ├── context/
  │       │   ├── AuthContext.jsx     → usuário, token JWT, interceptor Axios
  │       │   └── ThemeContext.jsx    → tema, glass, bgUrl, features, salvarCores()
  │       ├── layouts/
  │       │   ├── DashboardLayout.jsx → overlay mobile + sidebar desktop colapsável
  │       │   └── ClienteLayout.jsx   → header + bottom nav (Cardápio, Pedidos, Garçom, Perfil)
  │       ├── pages/
  │       │   ├── LandingPage.jsx
  │       │   ├── Login.jsx
  │       │   ├── Register.jsx
  │       │   ├── SelecionarMesa.jsx
  │       │   ├── PedidoStatus.jsx
  │       │   ├── Carrinho.jsx
  │       │   ├── cliente/
  │       │   │   ├── CalendarioShows.jsx
  │       │   │   ├── ClienteCardapio.jsx    → imagens dos pratos, busca, filtros
  │       │   │   ├── ClienteCarrinho.jsx
  │       │   │   ├── ClienteCheckout.jsx    → PIX (gated), Cartão, Dinheiro
  │       │   │   ├── ClienteHome.jsx        → hero imersivo + ações rápidas
  │       │   │   ├── ClientePedidos.jsx     → pedidos da sessão atual
  │       │   │   └── ClientePerfil.jsx
  │       │   └── dashboard/
  │       │       ├── ArtistasAdmin.jsx
  │       │       ├── CardapioAdmin.jsx
  │       │       ├── ConfiguracoesAdmin.jsx → tema + glass + imagem de fundo
  │       │       ├── CozinhaView.jsx        → kanban + abas mobile + alertas sonoros
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
  │       │   ├── api.js              → instância Axios com baseURL e interceptor JWT
  │       │   └── socket.js           → instância Socket.io-client
  │       ├── store/
  │       │   ├── useCarrinhoStore.js
  │       │   └── usePedidoStore.js
  │       └── index.css               → CSS Variables, light/dark/glass, animações, skeleton
  │
  ├── server/
  │   ├── src/
  │   │   ├── app.js                  → Express, CORS dinâmico, middlewares, rotas
  │   │   ├── server.js               → HTTP server + Socket.io
  │   │   ├── lib/
  │   │   │   ├── prisma.js           → PrismaClient singleton (compartilhado por todos)
  │   │   │   └── configCache.js      → cache em memória TTL 30s para configurações
  │   │   ├── controllers/            → lógica dos endpoints
  │   │   ├── middlewares/
  │   │   │   ├── auth.middleware.js  → authMiddleware, isAdmin, isAdminSF
  │   │   │   ├── error.middleware.js
  │   │   │   ├── validate.middleware.js
  │   │   │   └── rateLimiter.js      → express-rate-limit: login/register/api
  │   │   ├── routes/                 → definição das rotas HTTP
  │   │   ├── services/               → regras de negócio (todos importam lib/prisma)
  │   │   │   └── storage.service.js  → uploadFile/deleteFile (Supabase Storage)
  │   │   ├── validators/             → schemas Zod
  │   │   └── __tests__/              → 80 testes Jest + supertest
  │   ├── prisma/
  │   │   ├── schema.prisma           → schema completo (relationMode="prisma")
  │   │   ├── seed.js
  │   │   └── migrations/
  │   └── uploads/                    → fallback local (apenas sem Supabase configurado)
  │
  ├── LICENSE                         → Propriedade de Miguel Cezar Ferreira / Single Future
  ├── render.yaml                     → config de deploy no Render
  ├── README.md                       → visão geral pública do projeto
  └── DOCUMENTACAO.md                 → este arquivo

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 3. SISTEMA DE ROLES E FEATURE FLAGS

### Roles

  USER      → Cliente padrão. Acessa /cliente/:mesa e suas sub-rotas.
  ADMIN     → Acessa /dashboard completo. Vê apenas recursos que o ADMINSF ativou.
  ADMINSF   → Superadmin. Acesso irrestrito. Pode ativar/desativar funcionalidades
              para USER e ADMIN via página /dashboard/funcionalidades.

  Regra de redirecionamento no login:
    role === 'ADMIN' || role === 'ADMINSF'  →  /dashboard
    role === 'USER'                          →  /selecionar-mesa

### Feature Flags

  As flags são salvas na tabela Configuracao com as chaves:
    feature_shows        → '0' (desativado) | '1' (ativado) | ausente (ativado por padrão)
    feature_menutv       → idem
    feature_preferencias → idem
    feature_mesas        → idem
    feature_pix          → idem — controla se a opção PIX aparece no checkout

  Derivadas no ThemeContext como objeto `features`:
    features.shows        → boolean
    features.menutv       → boolean
    features.preferencias → boolean
    features.mesas        → boolean
    features.pix          → boolean

  Lógica de default: `config.feature_X !== '0'` — ausência da chave = ativado.

  Componente FeatureGate (App.jsx):
    - ADMINSF sempre passa, independente do valor da flag
    - Se feature desativada: redireciona para /dashboard (logado) ou / (anônimo)

  Sidebar (DashboardLayout.jsx buildNav):
    - Itens condicionais aparecem apenas se feature ativada OU role === 'ADMINSF'
    - ADMINSF vê "Configurações" como grupo com filhos "Tema" e "Funcionalidades"
    - ADMIN vê "Configurações" como link direto (sem "Funcionalidades")

### Middlewares de Autenticação (server)

  authMiddleware  → verifica JWT, injeta req.user
  isAdmin         → aceita ADMIN ou ADMINSF
  isAdminSF       → aceita apenas ADMINSF

### ProtectedRoute (client)

  <ProtectedRoute>             → requer login (qualquer role)
  <ProtectedRoute adminOnly>   → requer ADMIN ou ADMINSF
  <ProtectedRoute adminSFOnly> → requer ADMINSF

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 4. CLIENT — FRONTEND

  Tecnologias:  React 19, Vite 8, Tailwind CSS 3, Axios, Socket.io-client 4,
                Zustand 5, GSAP 3 + ScrollTrigger, Recharts 3, @dnd-kit (mesas),
                React Router DOM 7, jwt-decode

  Porta local:  http://localhost:5173

  Fontes (index.html):  DM Sans, Playfair Display, Orbitron (Single Future footer)

### Design Responsivo

  O projeto usa abordagem mobile-first com Tailwind CSS:
    - ClienteLayout: navegação bottom nav com 4 abas (Cardápio, Pedidos, Garçom, Perfil)
    - DashboardLayout: sidebar como overlay full-screen em mobile, colapsável em desktop
    - CozinhaView: kanban com abas mobile (uma coluna por vez) e grade de 3 colunas em desktop
    - ClienteCardapio: imagens dos pratos (w-16 h-16), touch targets maiores (w-8 h-8)
    - Cursor personalizado só aparece em desktop (≥ 1024px)

### Cursor Personalizado (GlobalCursor.jsx)

  Três camadas animadas via GSAP:
    - Dot central (8px) com animação pulse
    - Ring externo (32px) que expande no hover e faz ripple no click
    - Trail suave via requestAnimationFrame

  Cores via CSS variables (acompanham o tema dinamicamente):
    --cursor-dot:   var(--brand)
    --cursor-glow:  color-mix(in srgb, var(--brand) 90%, transparent)
    --cursor-halo:  color-mix(in srgb, var(--brand) 50%, transparent)
    --cursor-ring:  color-mix(in srgb, var(--brand) 55%, transparent)
    --cursor-trail: color-mix(in srgb, var(--brand) 12%, transparent)

  Comportamento:
    - Hover em button/a/input: ring expande (scale 2.2)
    - Click: ripple elástico no ring + contração do dot
    - Sair da janela: fade out de todos os elementos
    - MutationObserver: re-registra hover em elementos dinamicamente adicionados

### Isolamento de Pedidos por Sessão (ClientePedidos.jsx)

  O cliente pode retornar à mesa em visitas diferentes. Para não misturar pedidos:
    - sessionTimestamp gravado em sessionStorage quando o cliente entra na mesa
    - ClientePedidos busca apenas pedidos criados após esse timestamp
    - "Fechar conta" limpa o sessionStorage e redireciona para /selecionar-mesa
    - O backend exclui pedidos já pagos da lista de mesas abertas (listarMesasAbertas)

### Rotas da aplicação

  /                           → Landing Page (shows automáticos se feature ativa)
  /login                      → Login
  /register                   → Cadastro
  /selecionar-mesa            → Seleção de mesa (requer login)
  /menu-tv                    → Menu TV tela cheia (FeatureGate: menutv)
  /pedido/:id                 → Status do pedido em tempo real

  /cliente/:mesa              → ClienteLayout (ProtectedRoute)
    index                     → ClienteHome (hero imersivo + ações rápidas)
    cardapio                  → ClienteCardapio (com imagens)
    carrinho                  → ClienteCarrinho
    checkout                  → ClienteCheckout (PIX gated por feature_pix)
    pedidos                   → ClientePedidos (sessão atual)
    perfil                    → ClientePerfil

  /dashboard                  → DashboardLayout (ProtectedRoute adminOnly)
    index                     → DashboardHome
    cozinha                   → CozinhaView (kanban + alertas sonoros)
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
                      salvarCores(), resetarCores(), previewCor(), previewGlass()
  useCarrinhoStore  → itens, adicionarItem, removerItem, limparCarrinho, totais
  usePedidoStore    → pedido atual em andamento

### SFFooter — Rodapé Single Future

  Componente: client/src/components/SFFooter.jsx
  Presente em: todas as páginas (layouts e standalone)
  Padrão sticky-footer: container pai = min-h-screen flex flex-col;
    conteúdo interno = flex-1; SFFooter ao final → sempre no bottom.
  Estilo: fundo #040404, cor #00e5a8, fonte Orbitron
  Link: https://www.singlefuture.com.br

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

  O singleton força os parâmetros PgBouncer na URL se não estiverem presentes.
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
    GET   /          → Configurações de tema e flags (público)
    POST  /          → Salvar configurações e feature flags (admin) — upsert sequencial
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
    chamar_garcom      → sala "cozinha"    (cliente chamou garçom)

### Pagamento Pix

  Gera payload QR Code EMV real (padrão Banco Central) com CRC16.
  Config via: PIX_CHAVE, PIX_NOME, PIX_CIDADE
  Confirmação: manual pelo admin em /dashboard/pagamentos

### Configurações — upsert sequencial

  O endpoint POST /api/configuracoes usa for...of com await (não Promise.all)
  para garantir que cada upsert termine antes do próximo começar.
  Razão: PgBouncer com connection_limit=1 não suporta queries paralelas.

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

  Pedido            → mesa, mesaId?, status, total, userId?, createdAt
                      relações: itens[], pagamento?, mesaRel?, user?

  PedidoItem        → pedidoId, menuItemId, quantidade, observacao?, subtotal
                      @@map("pedido_items")

  Pagamento         → pedidoId @unique, tipo, metodo, status, qrCode?, pixCopiaECola?

  Mesa              → numero @unique, ativa, lugares, posX, posY, cor

  Configuracao      → chave @unique, valor
                      Prefixos: light_/dark_ (cores do tema)
                      Especiais: planta_url, glass_enabled, glass_color, glass_opacity,
                                 glass_blur, glass_text, glass_bg_url
                      Flags:     feature_shows, feature_menutv, feature_preferencias,
                                 feature_mesas, feature_pix

  PerguntaPreferencia, OpcaoPreferencia, RespostaPreferencia
                      @@unique([userId, perguntaId])

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
    item_{id}.{ext}    → foto de prato (exibida em ClienteCardapio)
    artista_{id}.{ext} → foto de artista
    fundo.{ext}        → imagem de fundo do glass mode
    planta.{ext}       → planta do restaurante (URL em Configuracao.planta_url)

  Regra obrigatória no frontend — sempre verificar antes de prefixar:
    src={url.startsWith('http') ? url : `${API_BASE}${url}`}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 8. SISTEMA DE TEMA (ThemeContext)

  Arquivo: client/src/context/ThemeContext.jsx

  O ThemeContext gerencia:
    - Modo: light | dark (persistido em localStorage)
    - Cores customizadas: carregadas de GET /api/configuracoes
    - Glass effect: ativação, cor, opacidade, blur e imagem de fundo
    - Feature flags: derivadas do mesmo objeto de configuração

### Como as cores propagam

  1. ThemeContext carrega config do banco via GET /api/configuracoes
  2. buildTheme(modo, config) monta um mapa de CSS vars → valores
     - Usa resolveVar(saved, default): se o valor salvo é vazio/ausente, usa o default
  3. aplicarTheme(vars): itera e seta cada var em document.documentElement.style
  4. O CSS usa var(--brand), var(--surface), etc. — e reage imediatamente

  Funções expostas pelo contexto:
    toggle()          → alterna light/dark e re-aplica o tema
    salvarCores(obj)  → POST /api/configuracoes + re-aplica tema com dados novos
    resetarCores()    → zera todas as cores customizadas para os defaults
    previewCor(var, val) → aplica uma var temporariamente (para live preview)
    previewGlass(ativo, config) → preview do glass effect sem salvar

### Glass Mode

  Ativado quando glass_enabled = 'true' na Configuracao.
  Aplica data-glass="true" no <html> e as CSS vars:
    --glass-bg, --glass-blur, --glass-border, --glass-shadow, --glass-text

  O CSS em index.css usa seletor:
    html[data-glass="true"] .app-dashboard :is(div, button, ...).rounded-2xl

### CSS Variables de referência

  Marca:      --brand, --brand-light, --brand-dark
  Superfície: --surface, --card, --panel, --border, --border-strong
  Texto:      --text-primary, --text-secondary, --text-hint
  Semântica:  --success, --success-bg, --warning, --warning-bg, --danger, --danger-bg
  Sombras:    --shadow-sm, --shadow-md, --shadow-lg, --shadow-brand, --shadow-glow
  Raios:      --radius-sm (8px), --radius-md (12px), --radius-lg (16px), --radius-xl (20px)
  Cursor:     --cursor-dot, --cursor-glow, --cursor-halo, --cursor-ring, --cursor-trail

  Cursors são derivados via color-mix() de --brand e atualizam automaticamente
  quando o admin muda a cor da marca.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 9. ACESSIBILIDADE (a11y)

### AcessibilidadeWidget (client/src/components/AcessibilidadeWidget.jsx)

  Barra flutuante de acessibilidade — position: fixed; bottom: 55%; right: 9px; z-index: 9998

  Recursos:
    Tamanho de texto   → 4 níveis (100% / 112% / 125% / 140%) via html.style.fontSize
    Alto contraste     → data-a11y-contrast no <html> → CSS redefine todas as vars de cor
    Espaçamento        → data-a11y-spacing → WCAG 1.4.12 (letter/word/line spacing)
    Sublinhar links    → data-a11y-links → a, a > * { text-decoration: underline }
                         Selector a > * necessário pois NavLinks têm display:flex

  Persistência: localStorage (a11y_tamanho, a11y_contraste, a11y_espacamento, a11y_links)
  UX: fecha com Escape e com mousedown fora do painel
  ARIA: role="dialog", aria-modal="false", aria-pressed, aria-expanded, aria-haspopup

### VLibras (Gov.br) — client/index.html

  Widget oficial de Língua Brasileira de Sinais do governo federal.
  Carregado via CDN: https://vlibras.gov.br/app/vlibras-plugin.js

  Bug corrigido: o VLibras gera URLs com barra dupla (app//assets/) que o CDN não normaliza.
  Solução: MutationObserver no index.html que detecta e corrige a barra dupla antes da requisição.

  CSS de suporte (index.css):
    [vw-access-button] { overflow: hidden }
    [vw-access-button] img { font-size: 0; color: transparent } ← oculta alt text visual

### CSS de Acessibilidade (client/src/index.css)

  .skip-link
    → Link "Ir para o conteúdo principal" — position: fixed; top: -120px
    → Visível apenas no foco (:focus { top: 0 }) — WCAG 2.4.1
    → Declarado em App.jsx antes de qualquer conteúdo

  [data-a11y-contrast]
    → Modo alto contraste: fundo preto, texto branco, brand amarelo vivo
    → Reverte todas as CSS vars de superfície, texto e marca
    → backdrop-filter: none (performance + legibilidade)

  [data-a11y-spacing] *
    → letter-spacing: 0.12em, word-spacing: 0.16em, line-height: 1.8, margin-bottom: 0.5em

  [data-a11y-links] a, [data-a11y-links] a > *
    → text-decoration: underline !important
    → text-decoration-thickness: 1px; text-underline-offset: 3px
    → a > * necessário para NavLinks (display:flex) onde o underline só renderiza nos filhos

  :focus-visible
    → outline: 3px solid var(--brand); outline-offset: 3px — WCAG 2.4.7

  @media (prefers-reduced-motion: reduce)
    → animation: none; transition: none para todos os elementos — WCAG 2.3.3

### ARIA Landmarks

  DashboardLayout.jsx:
    - <aside id="mobile-sidebar" aria-label="Menu de navegação" aria-hidden={!mobileMenuOpen}>
    - <aside aria-label="Menu lateral"> (desktop)
    - <nav aria-label="Navegação principal">
    - GrupoNav button: aria-expanded={aberto}
    - Hamburger: aria-expanded, aria-controls="mobile-sidebar", aria-label dinâmico
    - Botão fechar drawer: aria-label="Fechar menu"

  ClienteLayout.jsx:
    - <nav aria-label="Navegação do cliente"> (bottom nav)
    - NavLink já gerencia aria-current="page" automaticamente (React Router DOM)

  CozinhaView.jsx:
    - <div aria-live="assertive" aria-atomic="true"> — anuncia novos pedidos e chamadas de garçom
    - Colunas kanban: role="region" + aria-label={label}
    - Input de filtro: aria-label="Filtrar por mesa"
    - Botão fechar toast: aria-label="Fechar notificação"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 10. ESCALABILIDADE E PERFORMANCE

### Cache de Configurações (server/src/lib/configCache.js)

  Singleton em memória com TTL de 30 segundos.

  Interface:
    get()         → retorna dados se válidos (< 30s), null caso contrário
    set(data)     → armazena dados e marca timestamp
    invalidate()  → limpa cache

  Estratégia de invalidação:
    - Reads (GET /api/configuracoes): cache hit → skip DB; cache miss → lê DB, seta cache
    - Writes (POST /, POST /fundo, DELETE /fundo): seta cache com dados frescos pós-upsert
      → próximo GET é sempre cache hit (não há "warm-up delay")

### Rate Limiting (server/src/middlewares/rateLimiter.js)

  Biblioteca: express-rate-limit v8
  Headers: standardHeaders 'draft-7' (RateLimit-Policy, RateLimit), legacyHeaders: false
  Resposta 429: JSON { error: 'Muitas tentativas...' }

  Limites:
    limiterLogin    → 10 requisições por 15 minutos (POST /api/auth/login)
    limiterRegister → 5 requisições por hora (POST /api/auth/register)
    limiterApi      → 200 requisições por minuto (app.use('/api', ...))

  /health está fora do prefixo /api — não é limitado (Render health check).

### Health Check (server/src/app.js)

  GET /health → { status: 'ok', uptime: process.uptime() }
  Registrado antes dos middlewares de rota.
  Usado pelo Render para verificar disponibilidade do serviço.

### Queries Sequenciais com PgBouncer

  Todos os Promise.all com Prisma foram convertidos para for...of await:

    fecharMesa (pagamento.service.js):
      - Lê pedidos e chamadas com awaits separados (não paralelos)
      - Upserts de Pagamento: for...of com await
      - Updates de ChamadaGarcom: for...of com await

    listarMesasAbertas (pagamento.service.js):
      - pedido.findMany e chamadaGarcom.findMany em awaits separados

    listarHistorico (pedido.service.js):
      - findMany e count em awaits separados

  Razão: PgBouncer com connection_limit=1 não suporta queries paralelas.
  Promise.all causa saturação da fila de conexões.

### Filtro Diário de Pedidos (pedido.service.js)

  listarPedidos() limita a pedidos criados hoje (createdAt >= meia-noite do dia atual).
  Evita que a listagem da cozinha cresça indefinidamente com pedidos históricos.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 11. TESTES AUTOMATIZADOS

  Framework: Jest + supertest
  Diretório: server/src/__tests__/
  Comando:   cd server && npm test

  Total de testes: 60+

  ┌─────────────────────────────────────────────────────┬─────────────┐
  │ Arquivo                                             │ O que cobre │
  ├─────────────────────────────────────────────────────┼─────────────┤
  │ auth.middleware.test.js       (123 linhas)          │ authMiddleware, isAdmin, isAdminSF
  │ auth.service.test.js          ( 90 linhas)          │ login, register, validações Zod
  │ pedido.service.test.js        (108 linhas)          │ criação de pedidos, listagem, status
  │ pedido.service.extra.test.js  (168 linhas)          │ listarMesasAbertas, fechar conta, edge cases
  │ pagamento.service.test.js     (285 linhas)          │ pagamentos Pix, confirmação, pendentes
  │ clientePedidos.filter.test.js ( 69 linhas)          │ filtro por sessionTimestamp
  │ configuracao.route.test.js    (172 linhas)          │ GET/POST configurações, auth, Prisma errors
  │ prisma.lib.test.js            ( 48 linhas)          │ singleton, parâmetros PgBouncer obrigatórios
  └─────────────────────────────────────────────────────┴─────────────┘

  Padrões usados nos testes:
    - jest.mock('../lib/prisma') → isola o banco (mocks por arquivo)
    - multer stub sem binários nativos:
        jest.mock('multer', () => {
          const multerFn = () => ({ single: () => (req, res, next) => next() })
          multerFn.memoryStorage = () => ({})
          return multerFn
        })
    - supertest para integração de rotas Express completas
    - JWT de teste: jwt.sign({ role: 'ADMIN' }, 'test-secret')
    - beforeEach(() => jest.clearAllMocks()) entre cada teste

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 10. VARIÁVEIS DE AMBIENTE

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

## 11. COMANDOS DE DESENVOLVIMENTO

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

  # Testes
  cd server && npm test                       → todos os testes
  cd server && npm test -- --testPathPatterns=configuracao   → arquivo específico

  # Setup inicial
  cd server && node criar-admin.js    → Cria usuário ADMIN padrão
  cd server && node criar-mesas.js    → Cria mesas iniciais

  # Criar ADMINSF manualmente (via Prisma Studio ou SQL)
  UPDATE "User" SET role = 'ADMINSF' WHERE email = 'email@exemplo.com';

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 12. PASSO A PASSO — PUBLICAÇÃO EM PRODUÇÃO

  Plataformas:
    Banco de dados + Storage  →  Supabase  (gratuito)
    Backend                   →  Render    (gratuito, dorme após 15min)
    Frontend                  →  Vercel    (gratuito)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### ETAPA 1 — Configurar Supabase

  1.1  Acesse https://supabase.com — seu projeto já está configurado via DATABASE_URL.

  1.2  Criar bucket de imagens:
       Storage → New bucket → Nome: uploads → Public bucket → Save

  1.3  Copiar credenciais:
       Project Settings → API → "Project URL" e chave "service_role"

  1.4  Gerar JWT_SECRET:
       node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### ETAPA 2 — Preparar repositório

  2.1  Verificar que .env NÃO está sendo commitado (git status)
  2.2  git add . && git commit -m "deploy" && git push origin main

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### ETAPA 4 — Publicar frontend na Vercel

  4.1  vercel.com → Add New → Project → importar repositório

  4.2  Configurar:
         Root Directory: client
         Framework:      Vite

  4.3  Variável de ambiente:
         VITE_API_BASE_URL → URL do Render (sem /api, sem barra final)

  4.4  Deploy → aguardar → anotar a URL gerada

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### ETAPA 5 — Conectar Vercel ↔ Render

  5.1  Render → Environment → FRONTEND_URL = URL da Vercel → Save Changes

  5.2  Testar sistema completo:
       [ ] Login como ADMIN → redireciona para /dashboard
       [ ] Login como ADMINSF → redireciona para /dashboard
       [ ] Login como USER → redireciona para /selecionar-mesa
       [ ] Dashboard carrega dados do banco
       [ ] Cozinha recebe pedido em tempo real + alerta sonoro
       [ ] Upload de imagem funciona (Supabase Storage)
       [ ] Imagem dos pratos aparece no cardápio do cliente
       [ ] ADMINSF acessa Funcionalidades e toggle features
       [ ] Feature desativada → item some do sidebar e rota redireciona
       [ ] Tema salvo propaga para todo o site (cursor, glass, fundo)
       [ ] Fechar conta redireciona para /selecionar-mesa

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 13. ARQUITETURA DE PRODUÇÃO

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

## 14. CREDENCIAIS E ACESSOS

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

## 15. OBSERVAÇÕES IMPORTANTES

  1. PgBouncer (Supabase Pooler porta 6543) exige:
       - statement_cache_size=0 na DATABASE_URL
       - connection_limit=1 na DATABASE_URL
       - relationMode="prisma" no schema.prisma
       - PrismaClient como singleton (lib/prisma.js)
     Sem isso: erro "prepared statement s0 already exists"

  2. Para adicionar valores a ENUMs do Prisma com PgBouncer, não use
     npx prisma db push — execute SQL direto no Supabase:
       ALTER TYPE "Role" ADD VALUE 'NOME_DO_VALOR';

  3. O endpoint POST /api/configuracoes usa for...of com await (não Promise.all).
     Com PgBouncer connection_limit=1, queries paralelas causam fila saturada.

  4. O plano gratuito do Render dorme após 15min sem uso.
     Primeira requisição pode demorar 30–60s.
     Use UptimeRobot para manter ativo ou upgrade para Starter ($7/mês).

  5. Nunca commitar .env com secrets. O .env.production é commitado
     intencionalmente (apenas vars VITE_ sem secrets).

  6. Confirmação de pagamento Pix é manual no /dashboard/pagamentos.
     Para automação, integrar webhook de provedor de pagamento.

  7. Supabase Storage retorna URLs absolutas. Sempre verificar antes de prefixar:
       url.startsWith('http') ? url : `${API_BASE}${url}`

  8. O SFFooter usa padrão sticky-footer sem position:fixed.
     O container pai deve ser min-h-screen flex flex-col e o conteúdo
     interno deve ter flex-1, para o footer ficar sempre no bottom.

  9. O isolamento de pedidos por sessão usa sessionStorage (não localStorage).
     Ao fechar o browser ou abrir nova aba, uma nova sessão começa.
     O backend exclui pedidos já pagos de listarMesasAbertas.

 10. A cor do cursor (dot, ring, trail) é derivada via color-mix() de --brand.
     Ao mudar a cor da marca no ConfiguracoesAdmin, o cursor atualiza sem reload.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
