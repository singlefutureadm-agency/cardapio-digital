const { Router } = require('express')
const { criar, buscar, listar, atualizarStatus, historico } = require('../controllers/pedido.controller')
const { validate } = require('../middlewares/validate.middleware')
const { criarPedidoSchema } = require('../validators/pedido.validator')
const { authMiddleware, isAdmin } = require('../middlewares/auth.middleware')

const router = Router()

// ATENÇÃO: rota específica ANTES da rota /:id para não colidir
router.get('/historico', authMiddleware, isAdmin, historico)

router.get('/', authMiddleware, isAdmin, listar)
router.get('/:id', authMiddleware, buscar)
router.post('/', authMiddleware, validate(criarPedidoSchema), criar)
router.patch('/:id/status', authMiddleware, isAdmin, atualizarStatus)

module.exports = router