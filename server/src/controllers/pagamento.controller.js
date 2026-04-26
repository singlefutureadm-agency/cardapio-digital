const pagamentoService = require('../services/pagamento.service')

const registrar = async (req, res, next) => {
  try {
    const pagamento = await pagamentoService.registrarPagamento(req.body)
    res.status(201).json(pagamento)
  } catch (error) {
    next(error)
  }
}

module.exports = { registrar }