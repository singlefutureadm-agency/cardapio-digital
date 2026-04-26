const { Router } = require('express')
const prisma = require('../lib/prisma')
const { authMiddleware, isAdmin } = require('../middlewares/auth.middleware')
const multer = require('multer')
const path   = require('path')
const storage = require('../services/storage.service')

const router = Router()

const uploadFundo = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Apenas imagens são permitidas'))
    cb(null, true)
  },
})

// ── Leitura pública do tema ──────────────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const configs = await prisma.configuracao.findMany()
    res.json(Object.fromEntries(configs.map(c => [c.chave, c.valor])))
  } catch (e) { next(e) }
})

// ── Salvar múltiplas configs (admin) ─────────────────────────────────────────
router.post('/', authMiddleware, isAdmin, async (req, res, next) => {
  try {
    const entries = Object.entries(req.body)
    await Promise.all(entries.map(([chave, valor]) =>
      prisma.configuracao.upsert({
        where:  { chave },
        update: { valor: String(valor) },
        create: { chave, valor: String(valor) },
      })
    ))
    const configs = await prisma.configuracao.findMany()
    res.json(Object.fromEntries(configs.map(c => [c.chave, c.valor])))
  } catch (e) { next(e) }
})

// ── Upload de imagem de fundo (admin) ────────────────────────────────────────
router.post('/fundo', authMiddleware, isAdmin, uploadFundo.single('imagem'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhuma imagem enviada' })

    const mimeToExt = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif' }
    const ext = mimeToExt[req.file.mimetype] || path.extname(req.file.originalname).toLowerCase() || '.jpg'
    const filename = `fundo${ext}`

    const url = await storage.uploadFile(req.file.buffer, filename, req.file.mimetype)

    await prisma.configuracao.upsert({
      where:  { chave: 'glass_bg_url' },
      update: { valor: url },
      create: { chave: 'glass_bg_url', valor: url },
    })
    const configs = await prisma.configuracao.findMany()
    res.json({ url, configs: Object.fromEntries(configs.map(c => [c.chave, c.valor])) })
  } catch (e) { next(e) }
})

// ── Remover imagem de fundo (admin) ──────────────────────────────────────────
router.delete('/fundo', authMiddleware, isAdmin, async (req, res, next) => {
  try {
    const atual = await prisma.configuracao.findUnique({ where: { chave: 'glass_bg_url' } })
    await storage.deleteFile(atual?.valor)

    await prisma.configuracao.upsert({
      where:  { chave: 'glass_bg_url' },
      update: { valor: '' },
      create: { chave: 'glass_bg_url', valor: '' },
    })
    const configs = await prisma.configuracao.findMany()
    res.json({ configs: Object.fromEntries(configs.map(c => [c.chave, c.valor])) })
  } catch (e) { next(e) }
})

module.exports = router
