require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')

const { errorHandler } = require('./middlewares/error.middleware')
const { limiterApi }   = require('./middlewares/rateLimiter')

const authRoutes        = require('./routes/auth.routes')
const menuRoutes        = require('./routes/menu.routes')
const pedidoRoutes      = require('./routes/pedido.routes')
const pagamentoRoutes   = require('./routes/pagamento.routes')
const adminRoutes       = require('./routes/admin.routes')
const clienteRoutes     = require('./routes/cliente.routes')
const newsletterRoutes  = require('./routes/newsletter.routes')
const mesaRoutes        = require('./routes/mesa.routes')
const uploadRoutes      = require('./routes/upload.routes')
const configuracaoRoutes = require('./routes/configuracao.routes')
const preferenciaRoutes = require('./routes/preferencia.routes')
const showRoutes        = require('./routes/show.routes')
const artistaRoutes     = require('./routes/artista.routes')
const chamadasRoutes    = require('./routes/chamadas.routes')

const app = express()

// CORS: localhost em dev + FRONTEND_URL em produção
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
]
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL.replace(/\/$/, ''))
}

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) return callback(null, true)
    return callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
}))

app.use(express.json())
app.use('/api', limiterApi)

// Health check — usado pelo Render para verificar se o processo está vivo
app.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }))

// Rotas
app.use('/api/auth',          authRoutes)
app.use('/api/menu',          menuRoutes)
app.use('/api/pedidos',       pedidoRoutes)
app.use('/api/pagamentos',    pagamentoRoutes)
app.use('/api/admin',         adminRoutes)
app.use('/api/cliente',       clienteRoutes)
app.use('/api/newsletter',    newsletterRoutes)
app.use('/api/mesas',         mesaRoutes)
app.use('/api/upload',        uploadRoutes)
app.use('/api/configuracoes', configuracaoRoutes)
app.use('/api/preferencias',  preferenciaRoutes)
app.use('/api/shows',         showRoutes)
app.use('/api/artistas',      artistaRoutes)
app.use('/api/chamadas',      chamadasRoutes)

// Uploads locais (apenas em desenvolvimento)
if (process.env.NODE_ENV !== 'production') {
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')))
}

// Erro global
app.use(errorHandler)

module.exports = app
