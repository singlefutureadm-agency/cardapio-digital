const { Router } = require('express')
const s = require('../services/mesa.service')
const { authMiddleware, isAdmin } = require('../middlewares/auth.middleware')

const router = Router()

// Pública — cliente precisa ver as mesas disponíveis
router.get('/ativas', async (req, res, next) => {
  try { res.json(await s.listarAtivas()) } catch (e) { next(e) }
})

// Admin
router.get('/',          authMiddleware, isAdmin, async (req, res, next) => {
  try { res.json(await s.listar()) } catch (e) { next(e) }
})
router.post('/',         authMiddleware, isAdmin, async (req, res, next) => {
  try { res.status(201).json(await s.criar(req.body)) } catch (e) { next(e) }
})
router.put('/:id',       authMiddleware, isAdmin, async (req, res, next) => {
  try { res.json(await s.atualizar(req.params.id, req.body)) } catch (e) { next(e) }
})
router.delete('/:id',    authMiddleware, isAdmin, async (req, res, next) => {
  try { await s.excluir(req.params.id); res.status(204).send() } catch (e) { next(e) }
})
router.put('/:id', authMiddleware, isAdmin, async (req, res, next) => {
  try {
    res.json(await s.atualizar(req.params.id, req.body))
  } catch (e) { next(e) }
})

module.exports = router