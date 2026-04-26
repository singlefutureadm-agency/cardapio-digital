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
  - Backend   →  Render          (Node.js 20 + Express)
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
  ├── client/               → Frontend React
  │   ├── src/
  │   │   ├── config/       → Configuração centralizada de URLs
  │   │   ├── components/   → Componentes reutilizáveis
  │   │   ├── context/      → AuthContext, ThemeContext
  │   │   ├── layouts/      → DashboardLayout, ClienteLayout
  │   │   ├── pages/        → Páginas organizadas por área
  │   │   ├── services/     → api.js (Axios), socket.js (Socket.io)
  │   │   └── store/        → Zustand (carrinho e pedido)
  │   ├── .env              → Variáveis locais (não commitado)
  │   ├── .env.example      → Template das variáveis
  │   └── vercel.json       → Configuração de deploy na Vercel
  │
  ├── server/               → Backend Node.js
  │   ├── src/
  │   │   ├── controllers/  → Lógica dos endpoints
  │   │   ├── middlewares/  → Auth JWT, tratamento de erros
  │   │   ├── routes/       → Definição das rotas HTTP
  │   │   └── services/     → Regras de negócio e acesso ao banco
  │   ├── prisma/
  │   │   ├── schema.prisma → Definição completa do banco
  │   │   └── migrations/   → Histórico de alterações no banco
  │   ├── uploads/          → Imagens locais (apenas desenvolvimento)
  │   ├── .env              → Variáveis locais (não commitado)
  │   ├── .env.example      → Template das variáveis
  │   └── render.yaml       → Configuração de deploy no Render
  │
  ├── render.yaml           → Config alternativa de deploy (raiz)
  ├── .gitignore            → Arquivos ignorados pelo git
  └── DOCUMENTACAO.md       → Este arquivo

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 3. CLIENT — FRONTEND

  Tecnologias:  React 19, Vite, Tailwind CSS, Axios, Socket.io-client,
                Zustand, GSAP, Recharts, React Router DOM 7

  Porta local:  http://localhost:5173

### Rotas da aplicação

  /                           → Landing Page (pública)
  /login                      → Login
  /register                   → Cadastro
  /selecionar-mesa            → Seleção de mesa (requer login)
  /menu-tv                    → Menu em tela cheia para TV (público)
  /pedido/:id                 → Status do pedido

  /cliente/:mesa              → Área do cliente (requer login)
    /cliente/:mesa            → Home com shows e ações rápidas
    /cliente/:mesa/cardapio   → Cardápio com itens e carrinho
    /cliente/:mesa/pedidos    → Histórico de pedidos
    /cliente/:mesa/perfil     → Perfil e preferências

  /dashboard                  → Área admin (requer login de ADMIN)
    /dashboard                → Visão geral com KPIs
    /dashboard/cozinha        → Tela da cozinha (tempo real)
    /dashboard/cardapio       → CRUD do cardápio
    /dashboard/mesas          → Mapa de mesas drag-and-drop
    /dashboard/menu-tv        → Preview do menu TV
    /dashboard/historico      → Histórico de pedidos com filtros
    /dashboard/shows          → Calendário de shows
    /dashboard/artistas       → Cadastro de artistas
    /dashboard/shows/:id/metricas → Relatório pós-show
    /dashboard/usuarios       → Gerenciar usuários
    /dashboard/newsletter     → Lista de e-mails cadastrados
    /dashboard/preferencias   → Perguntas de perfil do público
    /dashboard/preferencias/analytics → Analytics de respostas
    /dashboard/configuracoes  → Tema, glass effect e cores
    /dashboard/pagamentos     → Confirmar pagamentos pendentes

### Configuração de URL (importante)

  Todas as URLs do backend são geradas a partir de uma única variável:

    client/src/config/index.js:
      API_BASE = VITE_API_BASE_URL   (ex: https://api.onrender.com)
      API_URL  = API_BASE + "/api"   (usado pelo Axios)

  Em desenvolvimento, o valor padrão é http://localhost:3001.
  Em produção, defina VITE_API_BASE_URL na Vercel.

### Estado global

  AuthContext   →  usuário logado, token JWT no localStorage
  ThemeContext  →  tema (light/dark), glass effect, imagem de fundo
  useCarrinhoStore (Zustand) →  itens do carrinho, total, quantidade
  usePedidoStore   (Zustand) →  pedido atual em andamento

### Comunicação com o backend

  HTTP:      Axios com interceptor JWT automático (AuthContext injeta o token)
  Realtime:  Socket.io conectado ao mesmo servidor Express
             Salas: "cozinha" (admin) e "mesa_{numero}" (por mesa)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 4. SERVER — BACKEND

  Tecnologias:  Node.js 20, Express 5, Prisma 5, Socket.io 4,
                JWT, bcryptjs, Multer, Supabase JS, Zod, QRCode

  Porta local:  http://localhost:3001

### Rotas da API

  Prefixo base: /api

  /api/auth
    POST  /login                → Autenticação (retorna JWT)
    POST  /register             → Cadastro de usuário
    GET   /me                   → Dados do usuário logado

  /api/menu (público)
    GET   /                     → Cardápio completo com categorias e itens

  /api/admin (requer ADMIN)
    GET   /menu                 → Listar itens
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
    GET   /historico            → Histórico com filtros (admin)
    PATCH /:id/status           → Atualizar status (admin)

  /api/pagamentos (requer login)
    POST  /                     → Criar pagamento (gera QR Pix se PIX)
    GET   /pedido/:pedidoId     → Buscar pagamento do pedido
    GET   /pendentes            → Listar pendentes (admin)
    PATCH /:id/confirmar        → Confirmar pagamento (admin)

  /api/mesas
    GET   /ativas               → Mesas ativas (público)
    GET   /                     → Todas as mesas (admin)
    POST  /                     → Criar mesa (admin)
    PUT   /:id                  → Atualizar mesa (admin)
    DELETE /:id                 → Excluir mesa (admin)

  /api/configuracoes
    GET   /                     → Configurações de tema (público)
    POST  /                     → Salvar configurações (admin)
    POST  /fundo                → Upload imagem de fundo (→ Supabase Storage)
    DELETE /fundo               → Remover imagem de fundo

  /api/upload (requer ADMIN)
    POST  /planta               → Upload da planta do restaurante (→ Supabase Storage)
    GET   /planta/info          → URL da planta atual

  /api/shows
    GET   /proximos             → Shows futuros com artista (público)
    GET   /passados             → Shows passados com avaliações (admin)
    GET   /:id                  → Show completo (admin)
    GET   /:id/metricas         → Relatório pós-show (admin)
    POST  /                     → Criar show (admin)
    PUT   /:id                  → Atualizar show (admin)
    DELETE /:id                 → Excluir show (admin)
    POST  /:id/avaliar          → Avaliar show (cliente)
    GET   /:id/minha-avaliacao  → Verificar avaliação do usuário (cliente)

  /api/artistas
    GET   /ativos               → Artistas ativos (público)
    GET   /                     → Todos os artistas (admin)
    GET   /:id                  → Artista com shows (admin)
    POST  /                     → Criar artista (admin)
    PUT   /:id                  → Atualizar artista (admin)
    DELETE /:id                 → Excluir artista (admin)
    PUT   /:id/imagem           → Upload imagem (→ Supabase Storage)
    PATCH /:id/imagem-url       → Salvar URL externa de imagem
    DELETE /:id/imagem          → Remover imagem

  /api/newsletter
    POST  /                     → Inscrever e-mail (público)
    GET   /                     → Listar inscritos (admin)
    DELETE /:id                 → Remover inscrito (admin)

  /api/preferencias (admin)
    GET, POST, PUT, DELETE para perguntas e opções

  /api/cliente (requer login)
    GET   /historico            → Pedidos do usuário logado

### Autenticação

  Todas as rotas protegidas exigem o header:
    Authorization: Bearer <token_jwt>

  O token é gerado no login e armazenado no localStorage do browser.
  Expiração: 7 dias.
  O AuthContext injeta o token automaticamente em toda requisição Axios.

### Tempo real (Socket.io)

  Eventos emitidos pelo servidor:
    pedido_novo        → sala "cozinha"     (quando pedido é criado)
    pedido_atualizado  → sala "cozinha"     (quando status muda)
    status_atualizado  → sala "mesa_{num}"  (quando admin muda status)

  O cliente entra na sala emitindo:
    "entrar_mesa"    com o número da mesa
    "entrar_cozinha" (admin/cozinha)

### Pagamento Pix

  O sistema gera um payload QR Code real seguindo o padrão EMV
  do Banco Central do Brasil (com CRC16 validado).

  Configuração via variáveis de ambiente:
    PIX_CHAVE  → sua chave Pix (CPF, CNPJ, e-mail, telefone ou aleatória)
    PIX_NOME   → nome do recebedor (máx. 25 chars)
    PIX_CIDADE → cidade do recebedor (máx. 15 chars)

  Fluxo:
    1. Cliente escolhe Pix no checkout
    2. Backend gera payload EMV + QR Code base64
    3. Cliente escaneia o QR no app do banco
    4. Admin confirma manualmente em /dashboard/pagamentos

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 5. BANCO DE DADOS

  Provedor:   PostgreSQL (Supabase)
  ORM:        Prisma 5
  Conexão:    Connection Pooler do Supabase (porta 6543, PgBouncer)

### Modelos

  User           → Usuários (cliente e admin). Campos: nome, email, senha, role
  MenuCategoria  → Categorias do cardápio (Entradas, Pratos, Bebidas...)
  MenuItem       → Itens do cardápio com preço, descrição e imagem
  Pedido         → Pedido por mesa com status e total
  PedidoItem     → Itens de um pedido (quantidade, observação, subtotal)
  Pagamento      → Dados do pagamento (método, status, QR Code Pix)
  Mesa           → Mesas do restaurante com posição no mapa e cor
  Configuracao   → Configurações de tema em chave=valor (banco de dados)
  PerguntaPreferencia → Perguntas de perfil do público
  OpcaoPreferencia    → Opções de cada pergunta
  RespostaPreferencia → Respostas dos clientes
  Newsletter     → E-mails inscritos
  Artista        → Artistas com bio, gênero, redes sociais e imagem
  Show           → Shows com data, horário, artista e gênero
  AvaliacaoShow  → Avaliações (nota 1-5 + comentário) por show e usuário

### Status de pedido

  NOVO → PREPARANDO → PRONTO → ENTREGUE
         (ou CANCELADO em qualquer etapa)

### Migrations aplicadas

  init
  add_users
  add_mesas
  add_mesa_posicao_lugares
  add_configuracao
  add_preferencias
  add_newsletter
  add_imagem_menu_item
  add_mesa_cor
  add_pix_pagamento
  add_shows
  add_artistas_avaliacoes

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 6. STORAGE DE IMAGENS

  Provedor: Supabase Storage
  Bucket:   uploads (público)

  Todos os uploads de imagem são salvos no Supabase Storage.
  As URLs geradas são absolutas (https://xxx.supabase.co/...) e ficam
  salvas diretamente no banco de dados.

  Tipos de imagem:
    item_{id}.{ext}      → Foto de prato do cardápio
    artista_{id}.{ext}   → Foto de artista
    planta.{ext}         → Planta/mapa do restaurante
    fundo.{ext}          → Imagem de fundo do tema glass

  Em desenvolvimento local (sem Supabase configurado), os uploads
  continuam funcionando via sistema de arquivos em server/uploads/.
  Para usar Supabase Storage, defina SUPABASE_URL e SUPABASE_SERVICE_KEY.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 7. VARIÁVEIS DE AMBIENTE

### server/.env

  DATABASE_URL        String de conexão PostgreSQL do Supabase (pooler porta 6543)
  JWT_SECRET          Chave secreta para assinar tokens JWT (mínimo 32 chars)
  PORT                Porta do servidor (padrão: 3001)
  NODE_ENV            "development" ou "production"
  FRONTEND_URL        URL do frontend em produção (para CORS e Socket.io)
  SUPABASE_URL        URL do projeto Supabase (https://xxx.supabase.co)
  SUPABASE_SERVICE_KEY Chave service_role do Supabase (para Storage)
  PIX_CHAVE           Chave Pix do restaurante
  PIX_NOME            Nome do recebedor Pix (máx. 25 chars)
  PIX_CIDADE          Cidade do recebedor Pix (máx. 15 chars)

### client/.env

  VITE_API_BASE_URL   URL base do backend SEM /api e SEM barra final
                      Desenvolvimento: http://localhost:3001
                      Produção:        https://seu-app.onrender.com

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 8. COMANDOS DE DESENVOLVIMENTO

  # Instalar dependências
  cd client && npm install
  cd server && npm install

  # Iniciar em desenvolvimento
  cd client && npm run dev        → http://localhost:5173
  cd server && npm run dev        → http://localhost:3001

  # Build do frontend (verificar erros antes de publicar)
  cd client && npm run build

  # Banco de dados
  cd server && npx prisma migrate dev --name nome_da_migration
  cd server && npx prisma generate
  cd server && npx prisma studio      → Interface visual do banco
  cd server && npx prisma db push     → Sync direto sem migration (cuidado!)

  # Criar admin inicial
  cd server && node criar-admin.js

  # Criar mesas iniciais
  cd server && node criar-mesas.js

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 9. PASSO A PASSO — PUBLICAÇÃO EM PRODUÇÃO

  Plataformas utilizadas:
    Banco de dados + Storage  →  Supabase  (gratuito)
    Backend                   →  Render    (gratuito, dorme após 15min inativo)
    Frontend                  →  Vercel    (gratuito)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### ETAPA 1 — Configurar Supabase

  1.1  Acesse https://supabase.com e faça login no seu projeto existente.
       (O banco de dados já está configurado via DATABASE_URL.)

  1.2  Criar o bucket de imagens:
       - No menu lateral, clique em "Storage"
       - Clique em "New bucket"
       - Nome: uploads
       - Marque a opção "Public bucket"
       - Clique em "Save"

  1.3  Copiar as credenciais necessárias:
       - Vá em "Project Settings" → "API"
       - Copie o "Project URL" (formato: https://xxxx.supabase.co)
       - Copie a chave "service_role" (fica abaixo da anon key, é a mais longa)
       IMPORTANTE: a service_role key tem acesso total ao projeto.
                   Nunca exponha ela no frontend.

  1.4  Gerar um novo JWT_SECRET:
       Abra um terminal e rode:
         node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
       Guarde o valor gerado — ele será usado no Render.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### ETAPA 2 — Preparar o repositório no GitHub

  2.1  Certifique-se de estar na pasta raiz do projeto:
         cd cardapio-digital

  2.2  Verifique se o .env NÃO está sendo commitado:
         cat .gitignore   (deve conter ".env" e ".env.*")

  2.3  Faça o commit de todos os arquivos:
         git add .
         git commit -m "deploy: preparação para produção"

  2.4  Crie um repositório no GitHub (https://github.com/new)
       e envie o código:
         git remote add origin https://github.com/SEU_USUARIO/cardapio-digital.git
         git branch -M main
         git push -u origin main

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### ETAPA 3 — Publicar o backend no Render

  3.1  Acesse https://render.com e faça login.

  3.2  Clique em "New +" → "Web Service"

  3.3  Conecte ao repositório do GitHub criado na etapa 2.

  3.4  Configure o serviço:
         Name:          cardapio-digital-api  (ou o nome que preferir)
         Region:        South America (São Paulo) se disponível, senão US East
         Branch:        main
         Root Directory: server
         Runtime:        Node
         Build Command:  npm ci && npx prisma generate && npx prisma migrate deploy
         Start Command:  npm start
         Plan:           Free

  3.5  Adicione as variáveis de ambiente (seção "Environment Variables"):

         DATABASE_URL        →  string do Supabase (pooler, porta 6543)
                                 Formato: postgresql://postgres.[REF]:[SENHA]@aws-...:6543/postgres?pgbouncer=true&connection_limit=1
         JWT_SECRET          →  valor gerado no passo 1.4
         NODE_ENV            →  production
         PORT                →  3001
         FRONTEND_URL        →  (deixar vazio por enquanto — preencher após deploy da Vercel)
         SUPABASE_URL        →  https://xxxx.supabase.co  (do passo 1.3)
         SUPABASE_SERVICE_KEY →  service_role key  (do passo 1.3)
         PIX_CHAVE           →  sua chave Pix
         PIX_NOME            →  Nome Do Restaurante  (máx. 25 chars, sem acentos)
         PIX_CIDADE          →  SAO PAULO  (máx. 15 chars, sem acentos)

  3.6  Clique em "Create Web Service" e aguarde o build terminar.
       O primeiro build demora de 3 a 8 minutos.

  3.7  Quando o deploy concluir, anote a URL gerada.
       Exemplo: https://cardapio-digital-api.onrender.com

  3.8  Teste se o backend está funcionando acessando no navegador:
         https://cardapio-digital-api.onrender.com/api/menu
       Deve retornar um JSON (array vazio ou com itens se o banco já tiver dados).

  3.9  Criar o primeiro usuário admin via Shell do Render:
       - Na dashboard do Render, clique no serviço → "Shell"
       - Digite: node criar-admin.js
       - Isso criará o admin padrão (credenciais em criar-admin.js)

  3.10 (Opcional) Criar mesas iniciais:
       - Na Shell do Render: node criar-mesas.js

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### ETAPA 4 — Publicar o frontend na Vercel

  4.1  Acesse https://vercel.com e faça login.

  4.2  Clique em "Add New..." → "Project"

  4.3  Importe o repositório do GitHub criado na etapa 2.

  4.4  Configure o projeto:
         Framework Preset:  Vite  (detectado automaticamente)
         Root Directory:    client
         Build Command:     npm run build  (já configurado)
         Output Directory:  dist  (já configurado)

  4.5  Adicione a variável de ambiente:
         VITE_API_BASE_URL  →  https://cardapio-digital-api.onrender.com
                               (URL do Render da etapa 3.7, SEM /api no final)

  4.6  Clique em "Deploy" e aguarde o build terminar (1 a 3 minutos).

  4.7  Quando concluir, anote a URL gerada.
       Exemplo: https://cardapio-digital.vercel.app

  4.8  Teste acessando a URL — a landing page deve aparecer.
       Tente fazer login com as credenciais do admin.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### ETAPA 5 — Conectar Vercel ↔ Render (CORS e Socket.io)

  5.1  Volte ao Render → seu serviço → "Environment"

  5.2  Adicione (ou atualize) a variável:
         FRONTEND_URL  →  https://cardapio-digital.vercel.app
                          (URL exata da Vercel, SEM barra no final)

  5.3  Clique em "Save Changes" — o Render fará um redeploy automático.

  5.4  Aguarde o redeploy terminar e teste o sistema completo:
       - Abra a URL da Vercel
       - Faça login como admin
       - Acesse o dashboard
       - Verifique se os dados carregam
       - Teste a tela da cozinha (tempo real)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### ETAPA 6 — Verificações finais

  [ ] Landing page carrega sem erros
  [ ] Login de cliente funciona
  [ ] Login de admin funciona
  [ ] Dashboard carrega dados do banco
  [ ] Cardápio aparece na área do cliente
  [ ] É possível fazer um pedido de teste
  [ ] Cozinha recebe o pedido em tempo real (Socket.io)
  [ ] Upload de imagem de prato funciona (vai para Supabase Storage)
  [ ] Menu TV (https://seu-app.vercel.app/menu-tv) exibe o cardápio
  [ ] Configurações de tema salvam e aplicam

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 10. ARQUITETURA DE PRODUÇÃO

  Browser / App
       │
       ├──► Vercel (Frontend React)
       │         │
       │         └──► Render (Backend Express)  ─── JWT Auth ───► Banco
       │                    │                                      Supabase
       │                    │                                      PostgreSQL
       │                    └──► Supabase Storage (imagens)
       │
       └──► Socket.io (WebSocket para tempo real)
                 │
                 └──► Render (mesmo servidor Express/Socket.io)

  Variáveis que conectam os serviços:

    Vercel                          Render
    ──────────────────              ──────────────────────────────────
    VITE_API_BASE_URL  ──────────►  (URL do Render — define onde chamar)
                                    FRONTEND_URL  ◄──────  (URL da Vercel — define o CORS)
                                    DATABASE_URL  ──────►  Supabase PostgreSQL
                                    SUPABASE_URL  ──────►  Supabase Storage
                                    SUPABASE_SERVICE_KEY ► Supabase Storage

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 11. CREDENCIAIS E ACESSOS

  DESENVOLVIMENTO LOCAL

    Admin padrão:
      E-mail:  admin@restaurante.com
      Senha:   admin123

    Backend:   http://localhost:3001
    Frontend:  http://localhost:5173
    Prisma Studio (interface do banco):  http://localhost:5555
      (rode: cd server && npx prisma studio)

  PRODUÇÃO

    As credenciais do admin de produção são definidas em criar-admin.js.
    Recomendado trocar a senha após o primeiro acesso.

    Supabase:  https://supabase.com/dashboard
    Render:    https://dashboard.render.com
    Vercel:    https://vercel.com/dashboard

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## OBSERVAÇÕES IMPORTANTES

  1. O plano gratuito do Render desliga o servidor após 15 minutos sem uso.
     A primeira requisição após esse período pode demorar 30-60 segundos.
     Para evitar isso, considere o plano Starter ($7/mês) ou use um serviço
     de ping (ex: UptimeRobot) para manter o servidor ativo.

  2. O plano gratuito do Supabase tem limite de 500MB de banco e 1GB de Storage.
     Para um restaurante real em produção, monitore o uso.

  3. Nunca commite os arquivos .env no repositório.
     Eles estão listados no .gitignore mas verifique antes de cada push:
       git status    (não deve aparecer nenhum .env)

  4. A confirmation de pagamento Pix é manual — o admin precisa confirmar
     cada pagamento em /dashboard/pagamentos. Para confirmação automática,
     será necessário integrar um webhook de um provedor (Mercado Pago, etc.).

  5. Se a migration falhar no Render, acesse a Shell e rode:
       npx prisma db push
     Isso sincroniza o schema sem depender do histórico de migrations.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
