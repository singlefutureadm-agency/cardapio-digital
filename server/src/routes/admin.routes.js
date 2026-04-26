const { Router } = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { PrismaClient } = require('@prisma/client')
const menuCtrl = require('../controllers/menuAdmin.controller')
const userCtrl = require('../controllers/userAdmin.controller')
const { authMiddleware, isAdmin } = require('../middlewares/auth.middleware')

const router = Router()
const prisma = new PrismaClient()

const uploadDir = path.join(__dirname, '../../uploads')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

const storageItem = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, `item_tmp_${Date.now()}${ext}`)
  },
})

const uploadItem = multer({
  storage: storageItem,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.png', '.jpg', '.jpeg', '.webp']
    const ext = path.extname(file.originalname).toLowerCase()
    allowed.includes(ext) ? cb(null, true) : cb(new Error('Formato inválido.'))
  },
})

router.use(authMiddleware, isAdmin)

// Cardápio
router.get('/menu', menuCtrl.listarItens)
router.get('/menu/categorias', menuCtrl.listarCategorias)
router.post('/menu', menuCtrl.criarItem)
router.put('/menu/:id', menuCtrl.atualizarItem)
router.patch('/menu/:id/toggle', menuCtrl.toggleDisponivel)
router.delete('/menu/:id', menuCtrl.excluirItem)

// Imagem do item
router.put('/menu/:id/imagem', uploadItem.single('imagem'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhuma imagem enviada.' })

    const id = Number(req.params.id)
    const ext = path.extname(req.file.originalname).toLowerCase()
    const nomeArquivo = `item_${id}${ext}`
    const destino = path.join(uploadDir, nomeArquivo)

    // Remove imagem anterior (qualquer extensão)
    const item = await prisma.menuItem.findUnique({ where: { id } })
    if (item?.imagemUrl) {
      const anterior = path.join(uploadDir, path.basename(item.imagemUrl))
      if (fs.existsSync(anterior)) fs.unlinkSync(anterior)
    }

    fs.renameSync(req.file.path, destino)

    const updated = await prisma.menuItem.update({
      where: { id },
      data: { imagemUrl: `/uploads/${nomeArquivo}` },
    })

    res.json(updated)
  } catch (e) { next(e) }
})

router.delete('/menu/:id/imagem', async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    const item = await prisma.menuItem.findUnique({ where: { id } })

    if (item?.imagemUrl) {
      const filePath = path.join(uploadDir, path.basename(item.imagemUrl))
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
    }

    const updated = await prisma.menuItem.update({
      where: { id },
      data: { imagemUrl: null },
    })

    res.json(updated)
  } catch (e) { next(e) }
})

// Usuários
router.get('/usuarios', userCtrl.listar)
router.post('/usuarios', userCtrl.criar)
router.put('/usuarios/:id', userCtrl.atualizar)
router.patch('/usuarios/:id/senha', userCtrl.resetarSenha)
router.delete('/usuarios/:id', userCtrl.excluir)

module.exports = router