const { Router } = require('express')
const svc = require('../services/show.service')
const avaliacaoSvc = require('../services/avaliacao.service')
const { authMiddleware, isAdmin } = require('../middlewares/auth.middleware')

const router = Router()

// Públicos
router.get('/proximos', async (req, res, next) => {
  try { res.json(await svc.listarProximos()) } catch (e) { next(e) }
})

// Cliente logado — avaliar
router.post('/:id/avaliar', authMiddleware, async (req, res, next) => {
  try {
    const avaliacao = await avaliacaoSvc.avaliar({
      showId: req.params.id,
      userId: req.user.id,
      nota: req.body.nota,
      comentario: req.body.comentario,
    })
    res.status(201).json(avaliacao)
  } catch (e) { next(e) }
})

router.get('/:id/minha-avaliacao', authMiddleware, async (req, res, next) => {
  try { res.json(await avaliacaoSvc.minhaAvaliacao(req.params.id, req.user.id)) } catch (e) { next(e) }
})

// Admin
router.get('/passados', authMiddleware, isAdmin, async (req, res, next) => {
  try { res.json(await svc.listarPassados()) } catch (e) { next(e) }
})

router.get('/:id/metricas', authMiddleware, isAdmin, async (req, res, next) => {
  try { res.json(await svc.metricasShow(req.params.id)) } catch (e) { next(e) }
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

module.exports = router