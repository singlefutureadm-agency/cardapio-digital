require('dotenv').config() 

const http = require('http')
const { Server } = require('socket.io')
const app = require('./app')

const server = http.createServer(app)

const io = new Server(server, {
  cors: { origin: 'http://localhost:5173' }
})

// Disponibiliza io para os controllers via app
app.set('io', io)

io.on('connection', (socket) => {
  console.log(`🔌 Cliente conectado: ${socket.id}`)

  // Cliente entra na sala da mesa (ex: "mesa_5")
  socket.on('entrar_mesa', (mesa) => {
    socket.join(`mesa_${mesa}`)
    console.log(`Mesa ${mesa} conectada`)
  })

  // Cozinha entra em uma sala global
  socket.on('entrar_cozinha', () => {
    socket.join('cozinha')
  })

  socket.on('disconnect', () => {
    console.log(`❌ Desconectado: ${socket.id}`)
  })
})

const PORT = process.env.PORT || 3001;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server rodando na porta ${PORT}`);
});