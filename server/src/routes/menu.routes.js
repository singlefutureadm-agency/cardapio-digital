const { Router } = require('express')
const { getMenu } = require('../controllers/menu.controller')

const router = Router()

router.get('/', getMenu) // público — sem authMiddleware

module.exports = router