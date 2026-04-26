# Cardápio Digital — Documentação Completa

Sistema fullstack de cardápio digital com pedidos em tempo real, dashboard administrativo,
área do cliente, pagamento Pix, calendário de shows e analytics.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## ÍNDICE

  1. Visão Geral
  2. Estrutura do Projeto
  3. CLIENT — Frontend (React + Vite)
  4. SERVER — Backend (Node.js + Express)
  5. BANCO DE DADOS (PostgreSQL + Prisma)
  6. STORAGE DE IMAGENS (Supabase Storage)
  7. Variáveis de Ambiente
  8. Comandos de Desenvolvimento
  9. PASSO A PASSO — Publicação em Produção
 10. Arquitetura de Produção
 11. Credenciais e Acessos

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
  ├── client/                   → Frontend React
  │   ├── hooks/
  │   │   └── useShows.js       → hook useProximosShows()
  │   ├── src/
  │   │   ├── App.jsx           → definição de todas as rotas
  │   │   ├── config/
  │   │   │   └── index.js      → API_BASE e API_URL centralizados
  │   │   ├── components/       → componentes reutilizáveis
  │   │   ├── context/          → AuthContext, ThemeContext
  │   │   ├── layouts/          → DashboardLayout, ClienteLayout
  │   │   ├── pages/            → páginas organizadas por área
  │   │   │   ├── cliente/      → área do cliente (cardápio, checkout, shows)
  │   │   │   └── dashboard/    → painel admin
  │   │   ├── services/
  │   │   │   ├── api.js        → instância Axios com interceptor JWT
  │   │   │   └── socket.js     → instância Socket.io-client
  │   │   └── store/            → Zustand (carrinho e pedido)
  │   ├── .env                  → variáveis locais (não commitado)
  │   ├── .env.production       → VITE_API_BASE_URL de produção (commitado)
  │   ├── vercel.json           → rewrite SPA → index.html
  │   └── tailwind.config.js
  │
  ├── server/                   → Backend Node.js
  │   ├── src/
  │   │   ├── app.js            → Express, CORS dinâmico, middlewares, rotas
  │   │   ├── server.js         → HTTP server + Socket.io
  │   │   ├── controllers/      → lógica dos endpoints
  │   │   ├── middlewares/      → auth JWT, error handler, validação
  │   │   ├── routes/           → definição das rotas HTTP
  │   │   ├── services/         → regras de negócio e acesso ao banco
  │   │   │   └── storage.service.js  → uploadFile/deleteFile (Supabase Storage)
  │   │   └── validators/       → schemas Zod (auth, pedido)
  │   ├── prisma/
  │   │   ├── schema.prisma     → definição completa do banco
  │   │   ├── seed.js
  │   │   └── migrations/       → histórico de migrations
  │   └── uploads/              → imagens locais (apenas desenvolvimento)
  │
  ├── render.yaml               → configuração de deploy no Render
  └── DOCUMENTACAO.md           → este arquivo

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 3. CLIENT — FRONTEND

  Tecnologias:  React 19, Vite 8, Tailwind CSS 3, Axios, Socket.io-client 4,
                Zustand 5, GSAP, Recharts 3, @dnd-kit (drag-and-drop mesas),
                React Router DOM 7, jwt-decode

  Porta local:  http://localhost:5173

### Rotas da aplicação

  /                           → Landing Page (seção de próximos shows automática)
  /login                      → Login
  /register                   → Cadastro
  /selecionar-mesa            → Seleção de mesa (requer login)
  /menu-tv                    → Menu em tela cheia para TV (público)
  /pedido/:id                 → Status do pedido em tempo real

  /cliente/:mesa              → Área do cliente (requer login)
    /cliente/:mesa            → Home com calendário de shows e ações rápidas
    /cliente/:mesa/cardapio   → Cardápio com itens e carrinho flutuante
    /cliente/:mesa/carrinho   → Carrinho de compras
    /cliente/:mesa/checkout   → Checkout (escolha de pagamento)
    /cliente/:mesa/pedidos    → Histórico de pedidos do cliente
    /cliente/:mesa/perfil     → Perfil e preferências do cliente

  /dashboard                  → Área admin (requer login de ADMIN)
    /dashboard                → Visão geral com KPIs
    /dashboard/cozinha        → Tela da cozinha (tempo real, atualiza status)
    /dashboard/cardapio       → CRUD do cardápio (itens, categorias, imagens)
    /dashboard/mesas          → Mapa de mesas drag-and-drop
    /dashboard/menu-tv        → Preview do menu TV
    /dashboard/historico      → Histórico de pedidos com filtros e gráficos
    /dashboard/shows          → Calendário de shows (CRUD)
    /dashboard/artistas       → Cadastro e gerenciamento de artistas
    /dashboard/shows/:id/metricas → Relatório pós-show com notas e pedidos
    /dashboard/usuarios       → Gerenciar usuários
    /dashboard/newsletter     → Lista de e-mails cadastrados
    /dashboard/preferencias   → Perguntas de perfil do público
    /dashboard/preferencias/analytics → Analytics de respostas
    /dashboard/configuracoes  → Tema, glass effect, cores e imagem de fundo
    /dashboard/pagamentos     → Confirmar pagamentos pendentes

### Configuração de URL (importante)

  Todas as URLs do backend partem de uma única variável de ambiente:

    client/src/config/index.js:
      API_BASE = VITE_API_BASE_URL   (ex: https://cardapio-digital-api.onrender.com)
      API_URL  = API_BASE + "/api"   (usado pelo Axios como baseURL)

  Em desenvolvimento: valor padrão é http://localhost:3001
  Em produção: definido via VITE_API_BASE_URL na Vercel (ou em .env.production)

  Regra de exibição de imagens:
    imagemUrl no banco pode ser absoluta (Supabase) ou relativa (uploads locais).
    Sempre verificar antes de prefixar:
      src = url.startsWith('http') ? url : `${API_BASE}${url}`

### Estado global

  AuthContext      →  usuário logado, token JWT no localStorage, interceptor Axios
  ThemeContext     →  tema (light/dark), glass effect, imagem de fundo
  useCarrinhoStore →  itens, adicionarItem, removerItem, limparCarrinho, totais
  usePedidoStore   →  pedido atual em andamento

### Comunicação com o backend

  HTTP:      Axios com interceptor JWT automático (AuthContext injeta o token)
  Realtime:  Socket.io conectado ao mesmo servidor Express
             Salas: "cozinha" (admin) e "mesa_{numero}" (por mesa)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 4. SERVER — BACKEND

  Tecnologias:  Node.js ≥20, Express 5, Prisma 5, Socket.io 4,
                JWT, bcryptjs, Multer (memoryStorage), Supabase JS, Zod 4, QRCode

  Porta local:  http://localhost:3001

### Rotas da API

  Prefixo base: /api

  /api/auth
    POST  /login                → Autenticação (retorna JWT com expiração 7 dias)
    POST  /register             → Cadastro de usuário
    GET   /me                   → Dados do usuário logado

  /api/menu (público)
    GET   /                     → Cardápio completo com categorias e itens disponíveis

  /api/admin (requer ADMIN)
    GET   /menu                 → Listar itens (admin)
    GET   /menu/categorias      → Listar categorias
    POST  /menu                 → Criar item
    PUT   /menu/:id             → Atualizar item
    PATCH /menu/:id/toggle      → Ativar/desativar item
    DELETE /menu/:id            → Excluir item
    PUT   /menu/:id/imagem      → Upload de imagem (→ Supabase Storage)
    DELETE /menu/:id/imagem     → Remover imagem
    GET   /usuarios             → Listar usuários
    POST  /usuarios             → Criar usuário
    PUT   /usuarios/:id         → Atualizar usuário
    PATCH /usuarios/:id/senha   → Resetar senha
    DELETE /usuarios/:id        → Excluir usuário

  /api/pedidos (requer login)
    POST  /                     → Criar pedido
    GET   /historico            → Histórico com filtros (mesa, status, datas, página)
    PATCH /:id/status           → Atualizar status (admin)

  /api/pagamentos (requer login)
    POST  /                     → Criar pagamento (gera QR Pix EMV se método=PIX)
    GET   /pedido/:pedidoId     → Buscar pagamento do pedido
    GET   /pendentes            → Listar pendentes (admin)
    PATCH /:id/confirmar        → Confirmar pagamento manualmente (admin)

  /api/mesas
    GET   /ativas               → Mesas ativas (público)
    GET   /                     → Todas as mesas (admin)
    POST  /                     → Criar mesa (admin)
    PUT   /:id                  → Atualizar mesa (admin)
    DELETE /:id                 → Excluir mesa (admin)

  /api/configuracoes
    GET   /                     → Configurações de tema (público)
    POST  /                     → Salvar configurações de tema (admin)
    POST  /fundo                → Upload imagem de fundo (→ Supabase Storage)
    DELETE /fundo               → Remover imagem de fundo

  /api/upload (requer ADMIN)
    POST  /planta               → Upload da planta do restaurante (→ Supabase Storage)
    GET   /planta/info          → URL atual da planta (lida da tabela Configuracao)

  /api/shows
    GET   /proximos             → Shows futuros com artista (público)
    GET   /passados             → Shows passados com contagem de avaliações (admin)
    GET   /:id                  → Show completo com avaliações (admin)
    GET   /:id/metricas         → Relatório pós-show: notas + pedidos vs média 7d (admin)
    POST  /                     → Criar show (admin)
    PUT   /:id                  → Atualizar show (admin)
    DELETE /:id                 → Excluir show (admin)
    POST  /:id/avaliar          → Avaliar show — upsert (cliente logado)
    GET   /:id/minha-avaliacao  → Verificar se usuário já avaliou (cliente logado)

  /api/artistas
    GET   /ativos               → Artistas ativos (público)
    GET   /                     → Todos os artistas com contagem de shows (admin)
    GET   /:id                  → Artista com últimos 10 shows (admin)
    POST  /                     → Criar artista (admin)
    PUT   /:id                  → Atualizar dados do artista (admin)
    DELETE /:id                 → Excluir artista e imagem (admin)
    PUT   /:id/imagem           → Upload de imagem via Multer (→ Supabase Storage)
    PATCH /:id/imagem-url       → Salvar URL externa de imagem
    DELETE /:id/imagem          → Remover imagem

  /api/newsletter
    POST  /                     → Inscrever e-mail (público)
    GET   /                     → Listar inscritos (admin)
    DELETE /:id                 → Remover inscrito (admin)

  /api/preferencias (admin e cliente logado)
    GET/POST/PUT/DELETE         → Perguntas, opções e respostas de preferências

  /api/cliente (requer login)
    GET   /historico            → Pedidos do usuário logado

### Autenticação

  Todas as rotas protegidas exigem o header:
    Authorization: Bearer <token_jwt>

  O token é gerado no login (expiração 7 dias) e armazenado no localStorage.
  O AuthContext injeta o token automaticamente em toda requisição Axios.
  Roles: USER (cliente padrão), ADMIN (acesso total ao dashboard).

### Tempo real (Socket.io)

  Salas:
    cozinha          → admin/cozinheiro
    mesa_{numero}    → cliente daquela mesa específica

  Eventos emitidos pelo servidor:
    pedido_novo        → sala "cozinha"     (quando pedido é criado)
    pedido_atualizado  → sala "cozinha"     (quando status muda)
    status_atualizado  → sala "mesa_{num}"  (payload: { pedidoId, status })

  O cliente entra na sala emitindo:
    "entrar_mesa"    com o número da mesa
    "entrar_cozinha" (admin/cozinha)

### Pagamento Pix

  O sistema gera um payload QR Code real seguindo o padrão EMV
  do Banco Central do Brasil (com CRC16 validado).

  Configuração via variáveis de ambiente:
    PIX_CHAVE  → chave Pix (CPF, CNPJ, e-mail, telefone ou aleatória)
    PIX_NOME   → nome do recebedor (máx. 25 chars, sem acentos)
    PIX_CIDADE → cidade do recebedor (máx. 15 chars, sem acentos)

  Fluxo:
    1. Cliente escolhe Pix no checkout
    2. Backend gera payload EMV + QR Code base64 + string "copia e cola"
    3. Ambos são salvos no banco (Pagamento.qrCode e Pagamento.pixCopiaECola)
    4. Cliente escaneia o QR no app do banco
    5. Admin confirma manualmente em /dashboard/pagamentos

### CORS e Socket.io

  As origens permitidas são configuradas dinamicamente via variável FRONTEND_URL:
    - Sempre incluem http://localhost:5173 e http://localhost:4173
    - Em produção, inclui o valor de FRONTEND_URL (URL da Vercel)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 5. BANCO DE DADOS

  Provedor:   PostgreSQL (Supabase)
  ORM:        Prisma 5
  Conexão:    Connection Pooler do Supabase (porta 6543, PgBouncer)

### Modelos

  User              → Usuários (cliente e admin)
                      campos: nome, email, senha (bcrypt), role: USER|ADMIN

  MenuCategoria     → Categorias do cardápio (Entradas, Pratos, Bebidas...)
                      campos: nome, ordem

  MenuItem          → Itens do cardápio
                      campos: nome, descricao, preco, disponivel, categoriaId, imagemUrl
                      imagemUrl: URL absoluta do Supabase Storage (https://...)

  Pedido            → Pedido por mesa
                      campos: mesa, mesaId, status, total, userId

  PedidoItem        → Itens de um pedido
                      campos: pedidoId, menuItemId, quantidade, observacao, subtotal

  Pagamento         → Dados do pagamento
                      campos: pedidoId, tipo, metodo, status, qrCode, pixCopiaECola

  Mesa              → Mesas do restaurante
                      campos: numero, ativa, lugares, posX, posY, cor

  Configuracao      → Configurações em chave=valor
                      uso: tema (prefixos light_/dark_) e planta_url

  PerguntaPreferencia → Perguntas de perfil do público
  OpcaoPreferencia    → Opções de cada pergunta
  RespostaPreferencia → Respostas dos clientes (@@unique[userId, perguntaId])

  Newsletter        → E-mails inscritos

  Artista           → Artistas com bio, gênero, redes sociais e imagem
                      campos: nome, bio, genero, imagemUrl, instagram, spotify,
                              youtube, tiktok, site, ativo

  Show              → Shows com data, horário, artista e gênero
                      campos: titulo, descricao, data, horario, genero, imagemUrl,
                              ativo, artistaId

  AvaliacaoShow     → Avaliações por show e usuário (@@unique[showId, userId])
                      campos: nota (1-5), comentario

### Status de pedido

  NOVO → PREPARANDO → PRONTO → ENTREGUE
         (ou CANCELADO em qualquer etapa)

### Métodos de pagamento

  Tipo GARCOM (presencial): DINHEIRO | CARTAO
  Tipo ONLINE:              PIX (QR Code gerado automaticamente)

### Migrations

  Apenas 2 arquivos de migration presentes:
    20260425170240_init               → schema completo inicial
    20260425172934_add_artistas_avaliacoes → Artista, AvaliacaoShow, User.avaliacoes

  Nota: outros incrementos históricos foram aplicados via npx prisma db push
  ou SQL direto e não possuem arquivo de migration separado.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 6. STORAGE DE IMAGENS

  Provedor: Supabase Storage
  Bucket:   uploads (público)

  Todos os uploads de imagem são processados por:
    server/src/services/storage.service.js
      uploadFile(buffer, filename, mimetype)  → retorna URL pública absoluta
      deleteFile(urlOrPath)                   → remove do bucket

  O Multer é configurado com memoryStorage — arquivos ficam em RAM como Buffer
  e são enviados ao Supabase imediatamente, sem tocar o disco.

  Convenção de nomes de arquivo no bucket:
    item_{id}.{ext}      → Foto de prato do cardápio
    artista_{id}.{ext}   → Foto de artista
    fundo.{ext}          → Imagem de fundo do tema glass
    planta.{ext}         → Planta/mapa do restaurante
                           (URL salva em Configuracao com chave "planta_url")

  Em desenvolvimento local (sem Supabase configurado):
    Os uploads continuam funcionando via disco em server/uploads/.
    Para usar Supabase Storage, defina SUPABASE_URL e SUPABASE_SERVICE_KEY.

  Importante: as URLs retornadas pelo Supabase são absolutas (https://...).
    Ao exibir imagens no frontend, sempre verificar antes de prefixar API_BASE:
      src={url.startsWith('http') ? url : `${API_BASE}${url}`}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 7. VARIÁVEIS DE AMBIENTE

### server/.env

  DATABASE_URL         String de conexão PostgreSQL via Supabase Pooler (porta 6543)
                         Formato: postgresql://postgres.[REF]:[SENHA]@aws-...:6543/postgres
  JWT_SECRET           Chave secreta para assinar tokens JWT (mínimo 32 chars hex)
  PORT                 Porta do servidor (padrão: 3001)
  NODE_ENV             "development" ou "production"
  FRONTEND_URL         URL do frontend em produção (para CORS e Socket.io)
  SUPABASE_URL         URL do projeto Supabase (https://xxx.supabase.co)
  SUPABASE_SERVICE_KEY Chave service_role do Supabase (acesso ao Storage)
                         NUNCA expor no frontend — acesso total ao projeto
  PIX_CHAVE            Chave Pix do restaurante
  PIX_NOME             Nome do recebedor Pix (máx. 25 chars, sem acentos)
  PIX_CIDADE           Cidade do recebedor Pix (máx. 15 chars, sem acentos)

### client/.env (desenvolvimento)

  VITE_API_BASE_URL    URL base do backend SEM /api e SEM barra final
                         Desenvolvimento: http://localhost:3001

### client/.env.production (commitado no repositório)

  VITE_API_BASE_URL    https://cardapio-digital-api-my6t.onrender.com

  Este arquivo é commitado porque o Vercel executa o build a partir do repositório
  e precisa do valor em tempo de build (variável VITE_ é injetada pelo Vite no bundle).
  A variável também pode ser sobrescrita nas configurações da Vercel.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 8. COMANDOS DE DESENVOLVIMENTO

  # Instalar dependências
  cd client && npm install
  cd server && npm install

  # Iniciar em desenvolvimento
  cd client && npm run dev        → http://localhost:5173
  cd server && npm run dev        → http://localhost:3001 (nodemon)

  # Build do frontend (verificar erros antes de publicar)
  cd client && npm run build

  # Banco de dados
  cd server && npx prisma migrate dev --name nome_da_migration
  cd server && npx prisma generate
  cd server && npx prisma studio      → Interface visual do banco (porta 5555)
  cd server && npx prisma db push     → Sync direto sem migration (cuidado!)

  # Setup inicial
  cd server && node criar-admin.js    → Cria usuário admin padrão
  cd server && node criar-mesas.js    → Cria conjunto inicial de mesas

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 9. PASSO A PASSO — PUBLICAÇÃO EM PRODUÇÃO

  Plataformas utilizadas:
    Banco de dados + Storage  →  Supabase  (gratuito)
    Backend                   →  Render    (gratuito, dorme após 15min inativo)
    Frontend                  →  Vercel    (gratuito)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### ETAPA 1 — Configurar Supabase

  1.1  Acesse https://supabase.com e faça login no seu projeto.
       (O banco já está configurado via DATABASE_URL.)

  1.2  Criar o bucket de imagens:
       - No menu lateral, clique em "Storage"
       - Clique em "New bucket"
       - Nome: uploads
       - Marque "Public bucket"
       - Clique em "Save"

  1.3  Copiar as credenciais:
       - Vá em "Project Settings" → "API"
       - Copie o "Project URL" (formato: https://xxxx.supabase.co)
       - Copie a chave "service_role" (abaixo da anon key, é a mais longa)
       ATENÇÃO: service_role tem acesso total. Nunca exponha no frontend.

  1.4  Gerar JWT_SECRET:
       node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
       Guarde o valor gerado para usar no Render.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### ETAPA 2 — Preparar o repositório no GitHub

  2.1  Certifique-se de estar na pasta raiz:
         cd cardapio-digital

  2.2  Verifique se .env NÃO está sendo commitado:
         git status   (não deve aparecer nenhum .env ou .env.local)

  2.3  Faça commit de todas as alterações:
         git add .
         git commit -m "deploy: preparação para produção"
         git push origin main

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### ETAPA 3 — Publicar o backend no Render

  3.1  Acesse https://render.com e faça login.

  3.2  Clique em "New +" → "Web Service"

  3.3  Conecte ao repositório do GitHub.

  3.4  Configure o serviço:
         Name:           cardapio-digital-api
         Region:         South America (São Paulo) ou US East
         Branch:         main
         Root Directory: server
         Runtime:        Node
         Build Command:  npm ci && npx prisma generate
         Start Command:  npm start
         Plan:           Free

  3.5  Adicione as variáveis de ambiente:

         DATABASE_URL         → string do Supabase Pooler (porta 6543)
                                Formato: postgresql://postgres.[REF]:[SENHA]@aws-...:6543/postgres
         JWT_SECRET           → valor gerado no passo 1.4
         NODE_ENV             → production
         PORT                 → 3001
         FRONTEND_URL         → (deixar vazio por enquanto — preencher após deploy Vercel)
         SUPABASE_URL         → https://xxxx.supabase.co
         SUPABASE_SERVICE_KEY → service_role key
         PIX_CHAVE            → sua chave Pix
         PIX_NOME             → Nome Do Restaurante  (sem acentos, máx. 25 chars)
         PIX_CIDADE           → SAO PAULO  (sem acentos, máx. 15 chars)

  3.6  Clique em "Create Web Service" e aguarde o build (3–8 minutos).

  3.7  Anote a URL gerada. Exemplo:
         https://cardapio-digital-api-my6t.onrender.com

  3.8  Teste acessando no navegador:
         https://cardapio-digital-api-my6t.onrender.com/api/menu
       Deve retornar JSON (array vazio ou com itens).

  3.9  Criar o banco (se necessário):
       - No Render → seu serviço → "Shell"
       - npx prisma db push
       - node criar-admin.js
       - node criar-mesas.js   (opcional)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### ETAPA 4 — Publicar o frontend na Vercel

  4.1  Acesse https://vercel.com e faça login.

  4.2  Clique em "Add New..." → "Project"

  4.3  Importe o repositório do GitHub.

  4.4  Configure o projeto:
         Framework Preset:  Vite  (detectado automaticamente)
         Root Directory:    client
         Build Command:     npm run build
         Output Directory:  dist

  4.5  Adicione a variável de ambiente:
         VITE_API_BASE_URL  →  https://cardapio-digital-api-my6t.onrender.com
                               (URL do Render da etapa 3.7, SEM /api no final)

       Nota: o arquivo client/.env.production já está commitado com esse valor.
       A variável na Vercel sobrescreve o .env.production se necessário.

  4.6  Clique em "Deploy" e aguarde o build (1–3 minutos).

  4.7  Anote a URL gerada. Exemplo:
         https://cardapio-digital.vercel.app

  4.8  Acesse a URL — a landing page deve aparecer.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### ETAPA 5 — Conectar Vercel ↔ Render (CORS e Socket.io)

  5.1  Volte ao Render → seu serviço → "Environment"

  5.2  Adicione (ou atualize):
         FRONTEND_URL  →  https://cardapio-digital.vercel.app
                          (URL exata da Vercel, SEM barra no final)

  5.3  Clique em "Save Changes" — o Render fará redeploy automático.

  5.4  Teste o sistema completo:
       - Faça login como admin
       - Acesse o dashboard e verifique dados
       - Abra a cozinha em outra aba e faça um pedido de teste
       - Verifique se o pedido aparece em tempo real (Socket.io)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### ETAPA 6 — Verificações finais

  [ ] Landing page carrega sem erros de console
  [ ] Login de cliente e admin funcionam
  [ ] Dashboard carrega dados do banco
  [ ] Cardápio aparece na área do cliente
  [ ] É possível fazer um pedido de teste
  [ ] Cozinha recebe o pedido em tempo real (Socket.io)
  [ ] Upload de imagem de prato funciona (vai para Supabase Storage)
  [ ] Imagem aparece corretamente no CardapioAdmin e no MenuTV
  [ ] Menu TV (/menu-tv) exibe o cardápio
  [ ] Configurações de tema salvam e aplicam

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 10. ARQUITETURA DE PRODUÇÃO

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

    Vercel                             Render
    ─────────────────────              ──────────────────────────────────
    VITE_API_BASE_URL ────────────►   (URL do Render — onde chamar a API)
                                       FRONTEND_URL ◄──── (URL da Vercel — CORS)
                                       DATABASE_URL ─────► Supabase PostgreSQL
                                       SUPABASE_URL ─────► Supabase Storage
                                       SUPABASE_SERVICE_KEY ► Supabase Storage

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 11. CREDENCIAIS E ACESSOS

  DESENVOLVIMENTO LOCAL

    Admin padrão (criado por criar-admin.js):
      E-mail:  admin@restaurante.com
      Senha:   admin123

    Backend:         http://localhost:3001
    Frontend:        http://localhost:5173
    Prisma Studio:   http://localhost:5555
      (rode: cd server && npx prisma studio)

  PRODUÇÃO

    As credenciais do admin de produção são definidas em criar-admin.js.
    Recomendado trocar a senha após o primeiro acesso.

    Supabase:  https://supabase.com/dashboard
    Render:    https://dashboard.render.com
    Vercel:    https://vercel.com/dashboard
    GitHub:    https://github.com/singlefutureadm-agency/cardapio-digital

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## OBSERVAÇÕES IMPORTANTES

  1. O plano gratuito do Render desliga o servidor após 15 minutos sem uso.
     A primeira requisição após esse período pode demorar 30–60 segundos.
     Para evitar isso, use o plano Starter ($7/mês) ou configure um serviço
     de ping como UptimeRobot para manter o servidor ativo.

  2. O plano gratuito do Supabase tem limite de 500MB de banco e 1GB de Storage.
     Para um restaurante real em produção, monitore o uso regularmente.

  3. Nunca commite arquivos .env no repositório.
     O arquivo .env.production é commitado intencionalmente (apenas VITE_ vars,
     sem secrets). Todos os outros .env estão no .gitignore.

  4. A confirmação de pagamento Pix é manual — o admin precisa confirmar
     cada pagamento em /dashboard/pagamentos. Para confirmação automática,
     é necessário integrar um webhook de um provedor (Mercado Pago, Stripe etc.).

  5. Se a migration falhar no Render, acesse a Shell e rode:
       npx prisma db push
     Isso sincroniza o schema sem depender do histórico de migrations.

  6. O Supabase Storage retorna URLs absolutas (https://xxx.supabase.co/...).
     Sempre verifique url.startsWith('http') antes de prefixar API_BASE
     ao exibir imagens no frontend.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
