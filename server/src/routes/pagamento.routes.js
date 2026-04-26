const express = require('express');
const router = express.Router();
const svc = require('../services/pagamento.service');
const { authMiddleware, isAdmin } = require('../middlewares/auth.middleware');

// Cliente cria pagamento
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { pedidoId, metodo } = req.body;
    if (!pedidoId || !metodo) {
      return res.status(400).json({ error: 'pedidoId e metodo são obrigatórios' });
    }
    const pagamento = await svc.criarPagamento({ pedidoId, metodo });
    res.status(201).json(pagamento);
  } catch (err) {
    next(err);
  }
});

// Cliente consulta pagamento do pedido
router.get('/pedido/:pedidoId', authMiddleware, async (req, res, next) => {
  try {
    const pagamento = await svc.buscarPorPedido(Number(req.params.pedidoId));
    res.json(pagamento);
  } catch (err) {
    next(err);
  }
});

// Admin lista pendentes
router.get('/pendentes', authMiddleware, isAdmin, async (req, res, next) => {
  try {
    const pagamentos = await svc.listarPendentes();
    res.json(pagamentos);
  } catch (err) {
    next(err);
  }
});

// Admin confirma pagamento
router.patch('/:id/confirmar', authMiddleware, isAdmin, async (req, res, next) => {
  try {
    const pagamento = await svc.confirmarPagamento(Number(req.params.id));
    res.json(pagamento);
  } catch (err) {
    next(err);
  }
});

module.exports = router;