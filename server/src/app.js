require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { errorHandler } = require('./middlewares/error.middleware')

const authRoutes       = require('./routes/auth.routes')
const menuRoutes       = require('./routes/menu.routes')
const pedidoRoutes     = require('./routes/pedido.routes')
const pagamentoRoutes  = require('./routes/pagamento.routes')
const adminRoutes      = require('./routes/admin.routes')
const clienteRoutes    = require('./routes/cliente.routes')
const newsletterRoutes = require('./routes/newsletter.routes')
const mesaRoutes       = require('./routes/mesa.routes')
const uploadRoutes = require('./routes/upload.routes')
const path = require('path')
const configuracaoRoutes = require('./routes/configuracao.routes')
const preferenciaRoutes = require('./routes/preferencia.routes');
const showRoutes = require('./routes/show.routes')
const artistaRoutes = require('./routes/artista.routes')

const app = express()

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

app.use('/api/auth',       authRoutes)
app.use('/api/menu',       menuRoutes)
app.use('/api/pedidos',    pedidoRoutes)
app.use('/api/pagamentos', pagamentoRoutes)
app.use('/api/admin',      adminRoutes)
app.use('/api/cliente',    clienteRoutes)
app.use('/api/newsletter', newsletterRoutes)
app.use('/api/mesas',      mesaRoutes)
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  next()
}, express.static(path.join(__dirname, '../uploads')))
app.use('/api/upload', uploadRoutes)
app.use('/api/configuracoes', configuracaoRoutes)
app.use('/api/preferencias', preferenciaRoutes);
app.use('/api/shows', showRoutes)
app.use('/api/artistas', artistaRoutes)

app.use(errorHandler)

module.exports = app