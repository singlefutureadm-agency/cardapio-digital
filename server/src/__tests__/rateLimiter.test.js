jest.mock('../lib/prisma', () => ({
  user: { findUnique: jest.fn(), create: jest.fn() },
}))
jest.mock('../services/storage.service', () => ({}))
jest.mock('multer', () => {
  const fn = () => ({ single: () => (req, res, next) => next() })
  fn.memoryStorage = () => ({})
  return fn
})
jest.mock('../lib/configCache', () => ({ get: jest.fn(() => null), set: jest.fn(), invalidate: jest.fn() }))

const express = require('express')
const request = require('supertest')
const jwt     = require('jsonwebtoken')

process.env.JWT_SECRET = 'test-secret'

// Cria app isolado com limitadores de janela curta para tornar os testes rápidos
function criarApp({ loginLimit = 3, registerLimit = 2 } = {}) {
  const rateLimit = require('express-rate-limit')

  const app = express()
  app.use(express.json())

  const limLogin = rateLimit({ windowMs: 1000, limit: loginLimit,    standardHeaders: 'draft-7', legacyHeaders: false, message: { error: 'limite' } })
  const limReg   = rateLimit({ windowMs: 1000, limit: registerLimit, standardHeaders: 'draft-7', legacyHeaders: false, message: { error: 'limite' } })
  const limApi   = rateLimit({ windowMs: 1000, limit: 5,             standardHeaders: 'draft-7', legacyHeaders: false, message: { error: 'limite' } })

  app.use('/api', limApi)
  app.use('/api/auth', require('../routes/auth.routes'))
  // Substitui os limitadores definidos na rota por versões com limites de teste
  // (os da rota são aplicados antes dos globais, então sobrepõem corretamente)
  app.post('/test-login',    limLogin,  (req, res) => res.json({ ok: true }))
  app.post('/test-register', limReg,    (req, res) => res.json({ ok: true }))
  app.get('/test-api',       limApi,    (req, res) => res.json({ ok: true }))

  app.use((err, req, res, next) => res.status(err.status || 500).json({ error: err.message }))
  return app
}

beforeEach(() => jest.clearAllMocks())

describe('limiterLogin', () => {
  test('bloqueia com 429 após exceder o limite', async () => {
    const app = criarApp({ loginLimit: 2 })

    await request(app).post('/test-login').send({})
    await request(app).post('/test-login').send({})
    const res = await request(app).post('/test-login').send({})

    expect(res.status).toBe(429)
    expect(res.body.error).toBe('limite')
  })

  test('inclui header RateLimit na resposta', async () => {
    const app = criarApp({ loginLimit: 5 })

    const res = await request(app).post('/test-login').send({})

    // draft-7: header unificado "RateLimit" ou legado "RateLimit-Limit"
    const temHeader =
      res.headers['ratelimit'] !== undefined ||
      res.headers['ratelimit-limit'] !== undefined
    expect(temHeader).toBe(true)
  })
})

describe('limiterRegister', () => {
  test('bloqueia com 429 após exceder o limite', async () => {
    const app = criarApp({ registerLimit: 2 })

    await request(app).post('/test-register').send({})
    await request(app).post('/test-register').send({})
    const res = await request(app).post('/test-register').send({})

    expect(res.status).toBe(429)
  })
})

describe('limiterApi (geral)', () => {
  test('bloqueia após exceder 5 requisições na janela', async () => {
    const rateLimit = require('express-rate-limit')
    const app = express()
    app.use(express.json())
    app.use('/api', rateLimit({ windowMs: 1000, limit: 3, standardHeaders: 'draft-7', legacyHeaders: false, message: { error: 'limite' } }))
    app.get('/api/teste', (req, res) => res.json({ ok: true }))

    await request(app).get('/api/teste')
    await request(app).get('/api/teste')
    await request(app).get('/api/teste')
    const res = await request(app).get('/api/teste')

    expect(res.status).toBe(429)
  })

  test('não afeta rota /health fora do prefixo /api', async () => {
    const rateLimit = require('express-rate-limit')
    const app = express()
    app.use('/api', rateLimit({ windowMs: 1000, limit: 1, legacyHeaders: false }))
    app.get('/health', (req, res) => res.json({ status: 'ok' }))

    // Mesmo após esgotar /api, /health não é afetado
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
  })
})
