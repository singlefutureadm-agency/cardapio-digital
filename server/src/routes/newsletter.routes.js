const { Router } = require('express')
const { inscrever, listar, remover } = require('../controllers/newsletter.controller')
const { authMiddleware, isAdmin } = require('../middlewares/auth.middleware')

const router = Router()

router.post('/', inscrever)
router.get('/', authMiddleware, isAdmin, listar)
router.patch('/:id/remover', authMiddleware, isAdmin, remover)
// POST /newsletter/enviar — simulação de envio (log no console)
router.post('/enviar', authMiddleware, isAdmin, async (req, res, next) => {
  try {
    const { assunto, mensagem, destinatarios } = req.body;
    // destinatarios: 'todos' | array de ids
    let emails = [];

    if (destinatarios === 'todos') {
      const lista = await prisma.newsletter.findMany({ where: { ativo: true }, select: { email: true } });
      emails = lista.map(l => l.email);
    } else {
      const lista = await prisma.newsletter.findMany({
        where: { id: { in: destinatarios.map(Number) }, ativo: true },
        select: { email: true },
      });
      emails = lista.map(l => l.email);
    }

    // Aqui integraria Resend/SendGrid — por ora loga
    console.log(`📧 Enviando para ${emails.length} destinatários:`, { assunto, emails });

    res.json({ ok: true, enviados: emails.length });
  } catch (e) { next(e); }
});



module.exports = router