const rateLimit = require('express-rate-limit')

// Bloqueia força bruta no login: 10 tentativas por IP a cada 15 minutos
const limiterLogin = rateLimit({
  windowMs:       15 * 60 * 1000,
  limit:          10,
  standardHeaders: 'draft-7',
  legacyHeaders:  false,
  message:        { error: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
})

// Limita criação de contas: 5 por IP por hora
const limiterRegister = rateLimit({
  windowMs:       60 * 60 * 1000,
  limit:          5,
  standardHeaders: 'draft-7',
  legacyHeaders:  false,
  message:        { error: 'Muitos cadastros deste IP. Tente novamente em 1 hora.' },
})

// Proteção geral da API: 200 requisições por IP por minuto
const limiterApi = rateLimit({
  windowMs:       60 * 1000,
  limit:          200,
  standardHeaders: 'draft-7',
  legacyHeaders:  false,
  message:        { error: 'Muitas requisições. Tente novamente em instantes.' },
})

module.exports = { limiterLogin, limiterRegister, limiterApi }
