const { Router } = require('express')
const { PrismaClient } = require('@prisma/client')
const { authMiddleware, isAdmin } = require('../middlewares/auth.middleware')
const multer = require('multer')
const path   = require('path')
const fs     = require('fs')

const prisma = new PrismaClient()
const router = Router()

// ── Upload de imagem de fundo ──────────────────────────────────────────────────
const storageFundo = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads')
    fs.mkdirSync(dir, { recursive: true })
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    const mimeToExt = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif' }
    const ext = mimeToExt[file.mimetype] || path.extname(file.originalname).toLowerCase() || '.jpg'
    cb(null, `fundo${ext}`)
  },
})
const uploadFundo = multer({
  storage: storageFundo,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Apenas imagens são permitidas'))
    cb(null, true)
  },
})

// ── Leitura pública do tema ─────────────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const configs = await prisma.configuracao.findMany()
    res.json(Object.fromEntries(configs.map(c => [c.chave, c.valor])))
  } catch (e) { next(e) }
})

// ── Salvar múltiplas configs (admin) ────────────────────────────────────────
router.post('/', authMiddleware, isAdmin, async (req, res, next) => {
  try {
    const entries = Object.entries(req.body)
    await Promise.all(entries.map(([chave, valor]) =>
      prisma.configuracao.upsert({
        where: { chave },
        update: { valor: String(valor) },
        create: { chave, valor: String(valor) },
      })
    ))
    const configs = await prisma.configuracao.findMany()
    res.json(Object.fromEntries(configs.map(c => [c.chave, c.valor])))
  } catch (e) { next(e) }
})

// ── Upload de imagem de fundo (admin) ───────────────────────────────────────
router.post('/fundo', authMiddleware, isAdmin, uploadFundo.single('imagem'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhuma imagem enviada' })

    // Remove arquivo anterior se existir
    const anterior = await prisma.configuracao.findUnique({ where: { chave: 'glass_bg_url' } })
    if (anterior?.valor?.startsWith('/uploads/fundo')) {
      const oldPath = path.join(__dirname, '../..', anterior.valor)
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath)
    }

    const url = `/uploads/${req.file.filename}`
    await prisma.configuracao.upsert({
      where: { chave: 'glass_bg_url' },
      update: { valor: url },
      create: { chave: 'glass_bg_url', valor: url },
    })
    const configs = await prisma.configuracao.findMany()
    res.json({ url, configs: Object.fromEntries(configs.map(c => [c.chave, c.valor])) })
  } catch (e) { next(e) }
})

// ── Remover imagem de fundo (admin) ─────────────────────────────────────────
router.delete('/fundo', authMiddleware, isAdmin, async (req, res, next) => {
  try {
    const atual = await prisma.configuracao.findUnique({ where: { chave: 'glass_bg_url' } })
    if (atual?.valor?.startsWith('/uploads/fundo')) {
      const filePath = path.join(__dirname, '../..', atual.valor)
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
    }
    await prisma.configuracao.upsert({
      where: { chave: 'glass_bg_url' },
      update: { valor: '' },
      create: { chave: 'glass_bg_url', valor: '' },
    })
    const configs = await prisma.configuracao.findMany()
    res.json({ configs: Object.fromEntries(configs.map(c => [c.chave, c.valor])) })
  } catch (e) { next(e) }
})

module.exports = router
