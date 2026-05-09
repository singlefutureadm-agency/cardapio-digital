const { Router } = require('express')
const { criar, listar, atender } = require('../controllers/chamadas.controller')
const { authMiddleware, isAdmin } = require('../middlewares/auth.middleware')

const router = Router()

router.post('/',     authMiddleware, criar)
router.get('/',      authMiddleware, isAdmin, listar)
router.patch('/:id', authMiddleware, isAdmin, atender)

module.exports = router
