const { Router } = require('express')
const multer = require('multer')
const path = require('path')
const svc = require('../services/artista.service')
const { authMiddleware, isAdmin } = require('../middlewares/auth.middleware')

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `artista_${req.params.id}${path.extname(file.originalname)}`),
})
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } })

const router = Router()

router.get('/ativos', async (req, res, next) => {
  try { res.json(await svc.listarAtivos()) } catch (e) { next(e) }
})

router.get('/', authMiddleware, isAdmin, async (req, res, next) => {
  try { res.json(await svc.listar()) } catch (e) { next(e) }
})

router.get('/:id', authMiddleware, isAdmin, async (req, res, next) => {
  try { res.json(await svc.buscar(req.params.id)) } catch (e) { next(e) }
})

router.post('/', authMiddleware, isAdmin, async (req, res, next) => {
  try { res.status(201).json(await svc.criar(req.body)) } catch (e) { next(e) }
})

router.put('/:id', authMiddleware, isAdmin, async (req, res, next) => {
  try { res.json(await svc.atualizar(req.params.id, req.body)) } catch (e) { next(e) }
})

router.delete('/:id', authMiddleware, isAdmin, async (req, res, next) => {
  try { await svc.excluir(req.params.id); res.json({ ok: true }) } catch (e) { next(e) }
})

router.put('/:id/imagem', authMiddleware, isAdmin, upload.single('imagem'), async (req, res, next) => {
  try {
    const imagemUrl = `/uploads/${req.file.filename}`
    res.json(await svc.salvarImagem(req.params.id, imagemUrl))
  } catch (e) { next(e) }
})

router.patch('/:id/imagem-url', authMiddleware, isAdmin, async (req, res, next) => {
  try {
    const { imagemUrl } = req.body
    res.json(await svc.atualizar(req.params.id, { imagemUrl }))
  } catch (e) { next(e) }
})

router.delete('/:id/imagem', authMiddleware, isAdmin, async (req, res, next) => {
  try { res.json(await svc.removerImagem(req.params.id)) } catch (e) { next(e) }
})

module.exports = router