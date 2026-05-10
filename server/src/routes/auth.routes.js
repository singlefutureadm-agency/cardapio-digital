const { Router } = require('express')
const { register, login, me } = require('../controllers/auth.controller')
const { validate } = require('../middlewares/validate.middleware')
const { registerSchema, loginSchema } = require('../validators/auth.validator')
const { authMiddleware } = require('../middlewares/auth.middleware')
const { limiterLogin, limiterRegister } = require('../middlewares/rateLimiter')

const router = Router()

router.post('/register', limiterRegister, validate(registerSchema), register)
router.post('/login',    limiterLogin,    validate(loginSchema),    login)
router.get('/me', authMiddleware, me)

module.exports = router