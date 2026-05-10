jest.mock('../lib/prisma', () => ({
  configuracao: {
    upsert:   jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
}))
jest.mock('../services/storage.service', () => ({
  uploadFile: jest.fn(),
  deleteFile: jest.fn(),
}))
// multer stub — não carrega módulos binários
jest.mock('multer', () => {
  const multerFn = () => ({ single: () => (req, res, next) => next() })
  multerFn.memoryStorage = () => ({})
  return multerFn
})

const prisma  = require('../lib/prisma')
const express = require('express')
const request = require('supertest')
const jwt     = require('jsonwebtoken')

// JWT de teste
process.env.JWT_SECRET = 'test-secret'
const tokenAdmin = jwt.sign({ id: 1, email: 'a@b.com', role: 'ADMIN' }, 'test-secret')

function criarApp() {
  const app = express()
  app.use(express.json())
  app.use('/api/configuracoes', require('../routes/configuracao.routes'))
  return app
}

beforeEach(() => jest.clearAllMocks())

// ─────────────────────────────────────────────────────────────────────────────
describe('GET /api/configuracoes', () => {
  test('retorna configs como objeto chave→valor', async () => {
    prisma.configuracao.findMany.mockResolvedValue([
      { chave: 'light_brand', valor: '#C8520A' },
      { chave: 'dark_brand',  valor: '#E8702A' },
    ])

    const res = await request(criarApp()).get('/api/configuracoes')

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ light_brand: '#C8520A', dark_brand: '#E8702A' })
  })

  test('retorna objeto vazio quando não há configs', async () => {
    prisma.configuracao.findMany.mockResolvedValue([])

    const res = await request(criarApp()).get('/api/configuracoes')

    expect(res.status).toBe(200)
    expect(res.body).toEqual({})
  })
})

// ─────────────────────────────────────────────────────────────────────────────
describe('POST /api/configuracoes', () => {
  const configSalva = [
    { chave: 'light_brand', valor: '#C8520A' },
    { chave: 'glass_enabled', valor: 'false' },
  ]

  beforeEach(() => {
    prisma.configuracao.upsert.mockResolvedValue({})
    prisma.configuracao.findMany.mockResolvedValue(configSalva)
  })

  test('salva cada chave com upsert sequencial', async () => {
    const payload = { light_brand: '#C8520A', glass_enabled: 'false' }

    const res = await request(criarApp())
      .post('/api/configuracoes')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send(payload)

    expect(res.status).toBe(200)
    // Dois upserts — um por chave
    expect(prisma.configuracao.upsert).toHaveBeenCalledTimes(2)
    expect(prisma.configuracao.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where:  { chave: 'light_brand' },
        update: { valor: '#C8520A' },
        create: { chave: 'light_brand', valor: '#C8520A' },
      })
    )
  })

  test('retorna objeto completo de configs após salvar', async () => {
    const res = await request(criarApp())
      .post('/api/configuracoes')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ light_brand: '#C8520A' })

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ light_brand: '#C8520A', glass_enabled: 'false' })
  })

  test('retorna 400 quando body está vazio', async () => {
    const res = await request(criarApp())
      .post('/api/configuracoes')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({})

    expect(res.status).toBe(400)
    expect(res.body.error).toBeTruthy()
  })

  test('retorna 401 sem token', async () => {
    const res = await request(criarApp())
      .post('/api/configuracoes')
      .send({ light_brand: '#C8520A' })

    expect(res.status).toBe(401)
  })

  test('retorna 403 para role USER', async () => {
    const tokenUser = jwt.sign({ id: 2, email: 'u@b.com', role: 'USER' }, 'test-secret')

    const res = await request(criarApp())
      .post('/api/configuracoes')
      .set('Authorization', `Bearer ${tokenUser}`)
      .send({ light_brand: '#C8520A' })

    expect(res.status).toBe(403)
  })

  test('converte valores não-string para string', async () => {
    await request(criarApp())
      .post('/api/configuracoes')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ glass_opacity: 12, glass_enabled: true })

    expect(prisma.configuracao.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where:  { chave: 'glass_opacity' },
        update: { valor: '12' },
        create: { chave: 'glass_opacity', valor: '12' },
      })
    )
  })

  test('aceita ADMINSF além de ADMIN', async () => {
    const tokenSF = jwt.sign({ id: 3, email: 'sf@b.com', role: 'ADMINSF' }, 'test-secret')

    const res = await request(criarApp())
      .post('/api/configuracoes')
      .set('Authorization', `Bearer ${tokenSF}`)
      .send({ light_brand: '#123456' })

    expect(res.status).toBe(200)
  })

  test('retorna 500 quando Prisma lança erro', async () => {
    prisma.configuracao.upsert.mockRejectedValue(new Error('DB error'))
    // error middleware precisa estar registrado
    const app = criarApp()
    app.use((err, req, res, next) => res.status(500).json({ error: err.message }))

    const res = await request(app)
      .post('/api/configuracoes')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ light_brand: '#C8520A' })

    expect(res.status).toBe(500)
    expect(res.body.error).toBe('DB error')
  })
})
