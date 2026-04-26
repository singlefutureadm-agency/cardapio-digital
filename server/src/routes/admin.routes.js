const { Router } = require('express')
const multer = require('multer')
const path = require('path')
const { PrismaClient } = require('@prisma/client')
const menuCtrl = require('../controllers/menuAdmin.controller')
const userCtrl = require('../controllers/userAdmin.controller')
const { authMiddleware, isAdmin } = require('../middlewares/auth.middleware')
const storage = require('../services/storage.service')

const router = Router()
const prisma = new PrismaClient()

const uploadItem = multer({
  storage: multer.memoryStorage(),
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
    const imagemUrl = await storage.uploadFile(req.file.buffer, `item_${id}${ext}`, req.file.mimetype)
    const updated = await prisma.menuItem.update({ where: { id }, data: { imagemUrl } })
    res.json(updated)
  } catch (e) { next(e) }
})

router.delete('/menu/:id/imagem', async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    const item = await prisma.menuItem.findUnique({ where: { id } })
    await storage.deleteFile(item?.imagemUrl)
    const updated = await prisma.menuItem.update({ where: { id }, data: { imagemUrl: null } })
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
