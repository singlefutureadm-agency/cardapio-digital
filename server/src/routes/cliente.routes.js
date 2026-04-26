const { Router } = require('express')
const prisma = require('../lib/prisma')
const { authMiddleware } = require('../middlewares/auth.middleware')

const router = Router()

router.use(authMiddleware)

// Histórico de pedidos do cliente
router.get('/pedidos', async (req, res, next) => {
  try {
    const pedidos = await prisma.pedido.findMany({
      where: { userId: req.user.id },
      include: {
        itens: { include: { menuItem: true } },
        pagamento: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    res.json(pedidos)
  } catch (e) { next(e) }
})

// Atualizar perfil
router.put('/perfil', async (req, res, next) => {
  try {
    const { nome, email } = req.body
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { nome, email },
      select: { id: true, nome: true, email: true, role: true },
    })
    res.json(user)
  } catch (e) { next(e) }
})

// Alterar senha
router.patch('/senha', async (req, res, next) => {
  try {
    const bcrypt = require('bcryptjs')
    const { senhaAtual, novaSenha } = req.body
    const user = await prisma.user.findUnique({ where: { id: req.user.id } })
    const ok = await bcrypt.compare(senhaAtual, user.senha)
    if (!ok) return res.status(400).json({ error: 'Senha atual incorreta' })
    const hash = await bcrypt.hash(novaSenha, 10)
    await prisma.user.update({ where: { id: req.user.id }, data: { senha: hash } })
    res.json({ ok: true })
  } catch (e) { next(e) }
})

module.exports = router