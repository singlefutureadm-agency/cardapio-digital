require('dotenv').config()

const http = require('http')
const { Server } = require('socket.io')
const app = require('./app')

const server = http.createServer(app)

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
]
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL.replace(/\/$/, ''))
}

const io = new Server(server, {
  cors: { origin: allowedOrigins, methods: ['GET', 'POST'] },
})

app.set('io', io)

io.on('connection', (socket) => {
  console.log(`🔌 Cliente conectado: ${socket.id}`)

  socket.on('entrar_mesa', (mesa) => {
    socket.join(`mesa_${mesa}`)
    console.log(`Mesa ${mesa} conectada`)
  })

  socket.on('entrar_cozinha', () => {
    socket.join('cozinha')
  })

  socket.on('disconnect', () => {
    console.log(`❌ Desconectado: ${socket.id}`)
  })
})

const PORT = process.env.PORT || 3001

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server rodando na porta ${PORT}`)
})
