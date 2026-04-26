const { Router } = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { PrismaClient } = require('@prisma/client')
const { authMiddleware, isAdmin } = require('../middlewares/auth.middleware')

const router = Router()
const prisma = new PrismaClient()

// Pasta uploads
const uploadDir = path.join(__dirname, '../../uploads')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

// Storage da planta (nome fixo)
const storagePlanta = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, `planta${ext}`)
  },
})

// Storage dos itens (temporário — renomeado depois com o id)
const storageItem = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, `item_tmp_${Date.now()}${ext}`)
  },
})

const fileFilter = (req, file, cb) => {
  const allowed = ['.png', '.jpg', '.jpeg', '.webp']
  const ext = path.extname(file.originalname).toLowerCase()
  if (allowed.includes(ext)) cb(null, true)
  else cb(new Error('Formato inválido. Use PNG, JPG ou WEBP.'))
}

const uploadPlanta = multer({ storage: storagePlanta, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter })
const uploadItem   = multer({ storage: storageItem,   limits: { fileSize: 5 * 1024 * 1024 }, fileFilter })

// ── Planta ──────────────────────────────────────
router.post('/planta', authMiddleware, isAdmin, uploadPlanta.single('planta'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado' })
  res.json({ url: `/uploads/${req.file.filename}` })
})

router.get('/planta/info', (req, res) => {
  const exts = ['.png', '.jpg', '.jpeg', '.webp']
  for (const ext of exts) {
    const f = path.join(uploadDir, `planta${ext}`)
    if (fs.existsSync(f)) return res.json({ url: `/uploads/planta${ext}` })
  }
  res.json({ url: null })
})

// ── Imagem do item ───────────────────────────────
router.put('/menu/:id/imagem', authMiddleware, isAdmin, uploadItem.single('imagem'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhuma imagem enviada.' })

    const id = Number(req.params.id)
    const ext = path.extname(req.file.originalname).toLowerCase()
    const nomeArquivo = `item_${id}${ext}`
    const destino = path.join(uploadDir, nomeArquivo)

    // Remove imagem anterior se existir (qualquer extensão)
    const item = await prisma.menuItem.findUnique({ where: { id } })
    if (item?.imagem) {
      const anterior = path.join(uploadDir, path.basename(item.imagem))
      if (fs.existsSync(anterior)) fs.unlinkSync(anterior)
    }

    fs.renameSync(req.file.path, destino)

    const updated = await prisma.menuItem.update({
      where: { id },
      data: { imagem: `/uploads/${nomeArquivo}` },
    })

    res.json(updated)
  } catch (e) { next(e) }
})

router.delete('/menu/:id/imagem', authMiddleware, isAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    const item = await prisma.menuItem.findUnique({ where: { id } })

    if (item?.imagem) {
      const filePath = path.join(uploadDir, path.basename(item.imagem))
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
    }

    const updated = await prisma.menuItem.update({
      where: { id },
      data: { imagem: null },
    })

    res.json(updated)
  } catch (e) { next(e) }
})

module.exports = router