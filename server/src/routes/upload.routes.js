const { Router } = require('express')
const multer = require('multer')
const path = require('path')
const prisma = require('../lib/prisma')
const { authMiddleware, isAdmin } = require('../middlewares/auth.middleware')
const storage = require('../services/storage.service')

const router = Router()

const fileFilter = (req, file, cb) => {
  const allowed = ['.png', '.jpg', '.jpeg', '.webp']
  const ext = path.extname(file.originalname).toLowerCase()
  allowed.includes(ext) ? cb(null, true) : cb(new Error('Formato inválido. Use PNG, JPG ou WEBP.'))
}

const uploadPlanta = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 }, fileFilter })
const uploadItem   = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 }, fileFilter })

// ── Planta ──────────────────────────────────────────────────────────────────
router.post('/planta', authMiddleware, isAdmin, uploadPlanta.single('planta'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado' })
    const ext = path.extname(req.file.originalname).toLowerCase()
    const url = await storage.uploadFile(req.file.buffer, `planta${ext}`, req.file.mimetype)
    await prisma.configuracao.upsert({
      where:  { chave: 'planta_url' },
      update: { valor: url },
      create: { chave: 'planta_url', valor: url },
    })
    res.json({ url })
  } catch (e) { next(e) }
})

router.get('/planta/info', async (req, res, next) => {
  try {
    const config = await prisma.configuracao.findUnique({ where: { chave: 'planta_url' } })
    res.json({ url: config?.valor || null })
  } catch (e) { next(e) }
})

// ── Imagem do item de menu ───────────────────────────────────────────────────
router.put('/menu/:id/imagem', authMiddleware, isAdmin, uploadItem.single('imagem'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhuma imagem enviada.' })
    const id = Number(req.params.id)
    const ext = path.extname(req.file.originalname).toLowerCase()
    const imagemUrl = await storage.uploadFile(req.file.buffer, `item_${id}${ext}`, req.file.mimetype)
    const updated = await prisma.menuItem.update({ where: { id }, data: { imagemUrl } })
    res.json(updated)
  } catch (e) { next(e) }
})

router.delete('/menu/:id/imagem', authMiddleware, isAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    const item = await prisma.menuItem.findUnique({ where: { id } })
    await storage.deleteFile(item?.imagemUrl)
    const updated = await prisma.menuItem.update({ where: { id }, data: { imagemUrl: null } })
    res.json(updated)
  } catch (e) { next(e) }
})

module.exports = router
