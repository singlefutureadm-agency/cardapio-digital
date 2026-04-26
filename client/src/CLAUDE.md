# CLAUDE.md — Cardápio Digital

> Documento de contexto do projeto para uso em novas sessões com Claude.
> Última atualização: 2026-04-26

---

## Visão Geral do Projeto

Sistema fullstack de cardápio digital para restaurante com pedidos em tempo real, dashboard admin, área do cliente, pagamento Pix, calendário de shows com artistas, métricas pós-show, preferências de público, menu TV e analytics.

**Status:** Em desenvolvimento ativo  
**Repositório:** `cardapio-digital/`

---

## Stack

### Frontend — `cardapio-digital/client/`
| Item | Tecnologia |
|---|---|
| Framework | React 19 + Vite |
| Estilo | Tailwind CSS + CSS Variables customizadas |
| Fontes | DM Sans + Playfair Display (Google Fonts) |
| Estado global | Zustand |
| Roteamento | React Router DOM 7 |
| HTTP | Axios — instância em `services/api.js` com interceptor JWT |
| Realtime | Socket.io-client |
| Animações | GSAP + ScrollTrigger |
| Gráficos | Recharts |

### Backend — `cardapio-digital/server/`
| Item | Tecnologia |
|---|---|
| Runtime | Node.js 24 |
| Framework | Express |
| ORM | Prisma 5 |
| Banco | PostgreSQL |
| Realtime | Socket.io |
| Auth | JWT + bcryptjs |
| Validação | Zod |
| Upload | Multer |
| QR Code | qrcode (npm) |

---

## Banco de Dados — Models

### Models existentes (context original)

**User**
- campos: `id, nome, email, senha (hash), role: USER|ADMIN, createdAt`
- relações: `pedidos: Pedido[], respostas: RespostaPreferencia[], avaliacoes: AvaliacaoShow[]`

**MenuCategoria**
- campos: `id, nome, ordem: Int`
- relações: `itens: MenuItem[]`

**MenuItem** — `@@map("menu_items")`
- campos: `id, nome, descricao, preco: Decimal, disponivel: Boolean, imagemUrl: String?, categoriaId`
- nota: imagens salvas em `server/uploads/` como `item_{id}.{ext}`

**Pedido**
- campos: `id, mesa: String, mesaId: Int?, status: StatusPedido, total: Decimal, userId?, createdAt, updatedAt`
- relações: `user?, mesaRel?: Mesa, itens: PedidoItem[], pagamento?: Pagamento`

**PedidoItem** — `@@map("pedido_items")`
- campos: `id, pedidoId, menuItemId, quantidade, observacao, subtotal: Decimal`

**Pagamento** ← atualizado nesta sessão
- campos: `id, pedidoId @unique, tipo: TipoPagamento, metodo: MetodoPagamento, status: StatusPagamento, qrCode: String? @db.Text, pixCopiaECola: String? @db.Text, createdAt, updatedAt`
- enums: `TipoPagamento: GARCOM|ONLINE`, `MetodoPagamento: DINHEIRO|CARTAO|PIX`, `StatusPagamento: PENDENTE|PAGO|CANCELADO`

**Mesa**
- campos: `id, numero: String @unique, ativa: Boolean, lugares: Int @default(4), posX: Float, posY: Float, cor: String @default('#10B981')`

**Configuracao**
- campos: `id, chave: String @unique, valor: String`
- descrição: armazena configurações de tema com prefixos `light_` e `dark_`

**Newsletter**
- campos: `id, email: String @unique, ativo: Boolean, createdAt`

**PerguntaPreferencia**
- campos: `id, texto, ativa: Boolean, ordem: Int, createdAt`
- relações: `opcoes: OpcaoPreferencia[], respostas: RespostaPreferencia[]`

**OpcaoPreferencia**
- campos: `id, perguntaId, texto`
- `onDelete: Cascade` da pergunta

**RespostaPreferencia**
- campos: `id, userId, perguntaId, opcaoId, createdAt`
- constraint: `@@unique([userId, perguntaId])`

### Models adicionados nesta sessão

**Artista** ← novo
```prisma
model Artista {
  id          Int      @id @default(autoincrement())
  nome        String
  bio         String?
  genero      String?
  imagemUrl   String?
  instagram   String?
  spotify     String?
  youtube     String?
  tiktok      String?
  site        String?
  ativo       Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  shows       Show[]
}
```

**Show** ← atualizado (era só título/data, agora tem relação com Artista e AvaliacaoShow)
```prisma
model Show {
  id          Int             @id @default(autoincrement())
  titulo      String
  descricao   String?
  data        DateTime
  horario     String
  genero      String?
  imagemUrl   String?
  ativo       Boolean         @default(true)
  artistaId   Int?
  artista     Artista?        @relation(fields: [artistaId], references: [id])
  avaliacoes  AvaliacaoShow[]
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt
}
```

**AvaliacaoShow** ← novo
```prisma
model AvaliacaoShow {
  id         Int      @id @default(autoincrement())
  showId     Int
  userId     Int
  nota       Int      // 1-5
  comentario String?
  createdAt  DateTime @default(now())
  show       Show     @relation(fields: [showId], references: [id], onDelete: Cascade)
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([showId, userId])
}
```

### Enums (todos no schema)
```prisma
enum StatusPedido    { NOVO PREPARANDO PRONTO ENTREGUE CANCELADO }
enum TipoPagamento   { GARCOM ONLINE }
enum MetodoPagamento { DINHEIRO CARTAO PIX }
enum StatusPagamento { PENDENTE PAGO CANCELADO }
enum Role            { USER ADMIN }
```

### Migrations (ordem cronológica)
```
init
add_users
add_mesas
add_mesa_posicao_lugares
add_configuracao
add_preferencias
add_newsletter
add_imagem_menu_item
add_mesa_cor
add_pix_pagamento          ← adicionado via SQL direto (shadow DB corrompido)
add_shows                  ← model Show
add_artistas_avaliacoes    ← models Artista + AvaliacaoShow + User.avaliacoes
```

> ⚠️ A migration `add_pix_pagamento` foi aplicada via SQL direto com `prisma.$executeRawUnsafe` por causa de shadow database corrompido. O histórico de migrations pode estar inconsistente — usar `npx prisma db push` se necessário.

---

## Backend — Estrutura

### Rotas registradas em `app.js`
```
/api/auth           auth.routes.js         — login, register, me
/api/menu           menu.routes.js         — público, lista categorias+itens
/api/pedidos        pedido.routes.js       — auth required
/api/pagamentos     pagamento.routes.js    — auth required
/api/admin          admin.routes.js        — admin only, CRUD menu+imagem+usuários
/api/cliente        cliente.routes.js      — auth, perfil, histórico pedidos
/api/newsletter     newsletter.routes.js   — inscrição pública, admin gerencia
/api/mesas          mesa.routes.js         — GET /ativas público, resto admin
/api/upload         upload.routes.js       — POST /planta, GET /planta/info
/api/configuracoes  configuracao.routes.js — GET público, POST admin
/api/preferencias   preferencia.routes.js  — CRUD perguntas+respostas
/api/shows          show.routes.js         — público+auth+admin ← novo
/api/artistas       artista.routes.js      — admin + GET /ativos público ← novo
```

### Endpoints de Shows (`/api/shows`)
```
GET  /proximos              — público, shows futuros com artista
GET  /passados              — admin, shows passados com contagem de avaliações
GET  /:id                   — admin, show completo com avaliações
GET  /:id/metricas          — admin, relatório pós-show com comparativo de pedidos
POST /                      — admin, criar show
PUT  /:id                   — admin, atualizar show
DELETE /:id                 — admin, excluir show
POST /:id/avaliar           — cliente logado, upsert avaliação (nota 1-5 + comentário)
GET  /:id/minha-avaliacao   — cliente logado, verifica se já avaliou
```

### Endpoints de Artistas (`/api/artistas`)
```
GET  /ativos                — público, artistas ativos
GET  /                      — admin, todos com contagem de shows
GET  /:id                   — admin, artista com últimos 10 shows
POST /                      — admin, criar artista
PUT  /:id                   — admin, atualizar dados
DELETE /:id                 — admin, excluir (deleta imagem física se houver)
PUT  /:id/imagem            — admin, upload Multer (multipart/form-data)
PATCH /:id/imagem-url       — admin, salvar URL externa
DELETE /:id/imagem          — admin, remover imagem
```

### Endpoints de Pedidos — adicionados
```
GET  /historico             — admin, histórico completo com filtros e paginação
                              query params: mesa, status, dataInicio, dataFim, page, limit
```

### Endpoints de Pagamentos
```
POST /                      — cliente, criar pagamento (gera QR Pix se metodo=PIX)
GET  /pedido/:pedidoId      — cliente, buscar pagamento do pedido
GET  /pendentes             — admin, listar pagamentos pendentes
PATCH /:id/confirmar        — admin, confirmar pagamento manualmente
```

### Services adicionados/modificados

**`pagamento.service.js`** ← novo
- `criarPagamento({ pedidoId, metodo })` — se PIX, gera payload EMV QR Code (padrão Banco Central BR) e base64 via lib `qrcode`
- `confirmarPagamento(id)`
- `buscarPorPedido(pedidoId)`
- `listarPendentes()`
- Configuração via `.env`: `PIX_CHAVE`, `PIX_NOME`, `PIX_CIDADE`

**`pedido.service.js`** ← modificado
- `listarHistorico({ mesa, status, dataInicio, dataFim, page, limit })` — filtros + paginação, retorna `{ pedidos, total, paginas, page }`

**`show.service.js`** ← novo
- `listar()`, `listarProximos()`, `listarPassados()`, `buscar(id)`, `criar()`, `atualizar()`, `excluir()`
- `metricasShow(showId)` — retorna: nota média, distribuição de notas, pedidos no dia do show, receita no dia, média 7 dias anteriores, % crescimento de pedidos, comentários
- `toDateTime(data)` — converte `"YYYY-MM-DD"` (input date HTML) para ISO-8601 completo

**`artista.service.js`** ← novo
- `listar()`, `listarAtivos()`, `buscar(id)`, `criar()`, `atualizar()`, `excluir()`
- `salvarImagem(id, imagemUrl)` — deleta arquivo físico anterior antes de salvar novo
- `removerImagem(id)` — deleta arquivo físico

**`avaliacao.service.js`** ← novo
- `avaliar({ showId, userId, nota, comentario })` — valida nota 1-5, verifica se show já ocorreu, upsert
- `minhaAvaliacao(showId, userId)`

---

## Frontend — Estrutura de Arquivos

```
client/src/
├── components/
│   ├── CarrinhoFlutuante.jsx
│   ├── CarrinhoItem.jsx
│   ├── CategoriaTab.jsx
│   ├── GlobalCursor.jsx
│   ├── ItemCard.jsx
│   ├── PedidoCard.jsx
│   ├── PreferenciasForm.jsx
│   ├── ProtectedRoute.jsx
│   ├── ThemeToggle.jsx
│   └── CalendarioShows.jsx        ← novo
├── context/
│   ├── AuthContext.jsx
│   └── ThemeContext.jsx
├── hooks/
│   └── useShows.js                ← novo
├── layouts/
│   ├── ClienteLayout.jsx
│   └── DashboardLayout.jsx        ← atualizado (grupo Shows no sidebar)
├── pages/
│   ├── Carrinho.jsx               — mantido (usado por ClienteCarrinho via import)
│   ├── LandingPage.jsx            ← atualizado (seção Shows + hook useShows)
│   ├── Login.jsx
│   ├── PedidoStatus.jsx
│   ├── Register.jsx
│   ├── SelecionarMesa.jsx
│   ├── cliente/
│   │   ├── ClienteCardapio.jsx
│   │   ├── ClienteCheckout.jsx    ← novo (substitui Checkout.jsx antigo)
│   │   ├── ClienteHome.jsx        ← atualizado (CalendarioShows integrado)
│   │   ├── ClientePedidos.jsx
│   │   └── ClientePerfil.jsx
│   └── dashboard/
│       ├── ArtistasAdmin.jsx      ← novo
│       ├── CardapioAdmin.jsx
│       ├── ConfiguracoesAdmin.jsx
│       ├── CozinhaView.jsx
│       ├── DashboardHome.jsx
│       ├── HistoricoPedidos.jsx   ← novo (filtros + gráficos Recharts)
│       ├── MenuTv.jsx
│       ├── MesasAdmin.jsx
│       ├── NewsletterAdmin.jsx
│       ├── PagamentosPendentes.jsx ← novo
│       ├── PreferenciasAdmin.jsx
│       ├── PreferenciasAnalytics.jsx
│       ├── ShowMetricas.jsx        ← novo
│       ├── ShowsAdmin.jsx          ← novo
│       └── UsuariosAdmin.jsx
├── services/
│   └── api.js                     — baseURL http://localhost:3001/api
└── store/
    ├── useCarrinhoStore.js        — itens, adicionarItem, removerItem, atualizarObservacao, limparCarrinho, totalItens(), totalValor()
    └── usePedidoStore.js
```

---

## Rotas React (`App.jsx`)

```jsx
/                           → LandingPage
/login                      → Login
/register                   → Register
/selecionar-mesa            → SelecionarMesa (ProtectedRoute)
/pedido/:id                 → PedidoStatus (ProtectedRoute)
/menu-tv                    → MenuTV (público)

/cliente/:mesa              → ClienteLayout (ProtectedRoute)
  index                     → ClienteHome
  cardapio                  → ClienteCardapio
  carrinho                  → Carrinho
  checkout                  → ClienteCheckout   ← aponta para novo componente
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
  menu-tv                   → MenuTVPreview
  pagamentos                → PagamentosPendentes
  historico                 → HistoricoPedidos
  shows                     → ShowsAdmin
  shows/:id/metricas        → ShowMetricas
  artistas                  → ArtistasAdmin
```

---

## Sidebar do Dashboard

```
📊 Visão geral
🍽️ Restaurante (grupo)
   👨‍🍳 Cozinha
   📋 Cardápio
   🪑 Mesas
   📺 Menu TV
   🗂️ Histórico
🎸 Shows (grupo)           ← novo
   📅 Calendário           → /dashboard/shows
   🎤 Artistas             → /dashboard/artistas
👥 Usuários
✉️ Newsletter
🎯 Preferências (grupo)
   ⚙️ Gerenciar
   📈 Analytics
⚙️ Configurações
💳 Pagamentos
```

---

## Funcionalidades Desenvolvidas nesta Sessão

### 1. Pagamento Pix
- Payload EMV QR Code seguindo padrão Banco Central do Brasil (CRC16)
- QR Code gerado em base64 e salvo no banco (`Pagamento.qrCode`)
- String "copia e cola" salva em `Pagamento.pixCopiaECola`
- Configuração via `.env`: `PIX_CHAVE`, `PIX_NOME`, `PIX_CIDADE`
- Fluxo: cliente escolhe Pix → backend gera QR → cliente escaneia → admin confirma manualmente
- Cartão/Dinheiro: mensagem "chame o garçom" → pedido criado normalmente
- `ClienteCheckout.jsx` substitui o `Checkout.jsx` antigo (estava causando conflito de rotas)

### 2. Histórico de Pedidos (Dashboard)
- `HistoricoPedidos.jsx` com filtros por mesa, status, data início/fim
- Paginação com 20 pedidos por página
- Aba "Relatório" com gráficos Recharts:
  - KPIs: receita total, ticket médio, total de itens, taxa de cancelamento
  - Barra horizontal: itens mais pedidos
  - Pizza (donut): distribuição de status
  - Área: pedidos por dia (volume + receita)
  - Radar/Teia: receita por item (top 6)
  - Pizza: método de pagamento
  - Barra: pedidos por mês

### 3. Calendário de Shows (completo)

**Admin:**
- `ShowsAdmin.jsx` — CRUD de shows com vínculo de artista, campo data/horário/gênero/descrição
- Botão "Gerenciar Artistas" navega para `/dashboard/artistas`
- Shows passados exibem botão "📊 Métricas"
- `ArtistasAdmin.jsx` — CRUD completo de artistas com:
  - Upload de imagem (Multer) OU URL externa
  - Redes sociais: Instagram, Spotify, YouTube, TikTok, Site
  - Card visual com capa, gênero, contagem de shows
- `ShowMetricas.jsx` — dashboard pós-show com:
  - KPIs: nota média, total de avaliações, pedidos no dia, receita, média 7 dias antes, % impacto
  - Gráfico de distribuição de notas (1-5 com cores)
  - Comparativo pedidos: dia do show vs média 7 dias anteriores
  - Lista de comentários com nota e usuário

**Cliente:**
- `CalendarioShows.jsx` — componente com calendário visual mensal
  - Navegação entre meses (não permite voltar antes do mês atual)
  - Dias com shows marcados com ponto colorido
  - Clique no dia abre detalhes do show
  - Shows passados com botão de avaliação inline (estrelas 1-5 + comentário)
  - Integrado em `ClienteHome.jsx` após as ações rápidas
- Hook `useShows.js` — `useProximosShows()` para reutilização

**Landing Page:**
- Seção "Próximos Shows" com grid de cards
- Aparece automaticamente apenas se houver shows cadastrados
- Adicionada no nav e no footer como âncora

**Menu TV:**
- Slide especial de shows ao final do carrossel do cardápio
- Lista compacta com data, artista e horário em estilo TV

---

## Fluxo de Pagamento Atualizado

```
1. Cliente finaliza carrinho → /cliente/:mesa/checkout
2. Escolhe método: PIX | CARTÃO | DINHEIRO
3. POST /pedidos → cria pedido
4. POST /pagamentos → cria pagamento
   - Se PIX: backend gera payload EMV + QR base64
   - Se CARTÃO/DINHEIRO: tipo=GARCOM, instrução "chame o garçom"
5. PIX: exibe QR Code + botão "Copiar código"
   - Botão "Já paguei → ver status do pedido"
   - Admin confirma manualmente em /dashboard/pagamentos
6. CARTÃO/DINHEIRO: navega para /pedido/:id
   - Admin vê em "Pagamentos Pendentes" com badge do método
```

---

## Fluxo de Avaliação de Shows

```
1. Show ocorre (data < now())
2. Cliente acessa ClienteHome
3. CalendarioShows exibe shows passados com botão "⭐ Avaliar"
4. Cliente dá nota 1-5 + comentário opcional
5. POST /shows/:id/avaliar (upsert — pode mudar avaliação)
6. Admin acessa /dashboard/shows → botão "📊 Métricas" no show passado
7. ShowMetricas exibe: notas, comparativo de pedidos, comentários
```

---

## Métricas Pós-Show — Lógica

O `metricasShow(showId)` no service calcula:
- **Pedidos no dia do show**: `createdAt` entre `00:00` e `23:59` do dia do show
- **Média 7 dias anteriores**: total de pedidos nos 7 dias antes dividido por 7
- **% crescimento**: `((pedidosDia - media7d) / media7d) * 100`
- **Receita do dia**: soma de `pedido.total` no dia
- **Nota média**: média aritmética das avaliações
- **Distribuição de notas**: count por nota (1 a 5)

---

## Observações Importantes

### Críticas (sempre respeitar)

| Regra | Detalhe |
|---|---|
| `services/api.js` | SEMPRE usar instância com interceptor. `axios` direto não envia JWT → 401 |
| baseURL | `http://localhost:3001/api`. Não duplicar `/api` nas chamadas |
| `imagemUrl` | Campo no banco é `imagemUrl`, não `imagem` |
| `prisma generate` | Rodar após qualquer migrate para o client reconhecer novos campos |
| Boolean no Zod | Enviar `Boolean(form.ativo)` explícito — Zod rejeita string `"true"` |
| FK constraints | Excluir dependentes antes do pai (PedidoItem antes de MenuItem, etc.) |
| CORS uploads | `express.static('/uploads')` não herda `cors()` — middleware inline obrigatório |

### Shows e Artistas

| Regra | Detalhe |
|---|---|
| `toDateTime()` | Input `type="date"` retorna `"YYYY-MM-DD"`. Converter para `new Date("YYYY-MM-DDT00:00:00.000Z")` antes de salvar no Prisma |
| Imagem artista | Upload via Multer salva em `uploads/artista_{id}.{ext}`. URL externa salva diretamente no campo |
| Avaliação | `@@unique([showId, userId])` — upsert permite atualizar nota |
| Confirmação Pix | Manual pelo admin em `/dashboard/pagamentos`. Não há webhook automático |

### Roteamento

| Regra | Detalhe |
|---|---|
| `/historico` antes de `/:id` | Rota específica deve vir antes da dinâmica em `pedido.routes.js` |
| `ClienteCheckout` vs `Checkout` | `Checkout.jsx` (antigo, raiz de pages) pode ser deletado. Usar só `ClienteCheckout.jsx` |
| `Carrinho.jsx` | Mantido na raiz — `ClienteCarrinho` importa ele diretamente |
| `GrupoNav` | Usa `location.pathname.startsWith(filho.to)` para detectar filho ativo (sem `end` prop) |

### Shadow Database (histórico de problema)

A migration `add_pix_pagamento` falhou por shadow DB corrompido. Foi resolvida via script Node.js com `prisma.$executeRawUnsafe`. Se houver problemas futuros de migration, usar:
```bash
npx prisma migrate resolve --applied MIGRATION_NAME
# ou aplicar SQL diretamente via script Node
```

---

## Variáveis de Ambiente (`.env` do server)

```env
DATABASE_URL=postgresql://postgres:senha@localhost:5432/cardapio_db
JWT_SECRET=seu_secret
PORT=3001

# Pix
PIX_CHAVE=restaurante@pix.com
PIX_NOME=Nome Do Restaurante
PIX_CIDADE=SAO PAULO
```

---

## Comandos Úteis

```bash
# Dev
cd client && npm run dev          # porta 5173
cd server && npm run dev          # porta 3001 (nodemon)

# Banco
cd server && npx prisma migrate dev --name nome_migration
cd server && npx prisma generate
cd server && npx prisma studio
cd server && npx prisma db seed

# Utilitários
cd server && node criar-admin.js
cd server && node criar-mesas.js
cd server && node fix-pagamento.js   # script de fix do Pix (pode ser deletado)

# Instalar dependência nova
cd server && npm install qrcode
cd client && npm install recharts
```

---

## Credenciais de Desenvolvimento

```
Admin:    admin@restaurante.com / admin123
Clientes: cadastrar via /register ou UsuariosAdmin
```

---

## Pendências e Próximos Passos

### Em andamento
- [ ] `CalendarioShows.jsx` — componente de calendário visual para o cliente (iniciado, código cortado)
- [ ] Integração completa da avaliação de shows no `ClienteHome`

### Planejado
- [ ] Webhook de confirmação Pix automática (Mercado Pago, PagSeguro ou Stripe)
- [ ] Exportar métricas de shows em PDF/CSV
- [ ] Tela de QR code por mesa para o admin imprimir/compartilhar
- [ ] Notificação push quando pedido muda de status
- [ ] Reconexão automática Socket.io com sincronização ao reconectar
- [ ] Indicador visual de status de conexão Socket.io
- [ ] Integração real de email para newsletter (Resend ou SendGrid)
- [ ] Soft delete em `MenuItem` para preservar histórico de pedidos
- [ ] Campo `obrigatoria` em `PerguntaPreferencia` para forçar resposta no cadastro
- [ ] Reordenação drag-and-drop das perguntas de preferência
- [ ] Exportar analytics de preferências em CSV
- [ ] Mover `PIX_CHAVE`, `PIX_NOME`, `PIX_CIDADE` para tabela `Configuracao` (editável via dashboard)
- [ ] Armazenar `qrCode` base64 on-the-fly sem persistir no banco (reduz tamanho do banco)

### Resolvido nesta sessão (estava em pendente)
- [x] Pagamento online — Pix com QR Code (payload EMV real)
- [x] Imagens nos itens do `ClienteCardapio`

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

Aplicadas via `data-theme="light"` ou `data-theme="dark"` no `<html>`. Customizadas via `ThemeContext` com valores do banco (`Configuracao`).

---

## Socket.io — Salas e Eventos

```
Salas:
  cozinha          — admin/cozinheiro
  mesa_{numero}    — cliente daquela mesa

Eventos emitidos pelo servidor:
  pedido_novo         → sala cozinha (quando pedido criado)
  pedido_atualizado   → sala cozinha (quando status muda)
  status_atualizado   → sala mesa_{X} (quando admin muda status)
    payload: { pedidoId, status }
```
