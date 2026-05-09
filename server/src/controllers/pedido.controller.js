const pedidoService = require('../services/pedido.service')

const criar = async (req, res, next) => {
  try {
    const { pedido, isNovo } = await pedidoService.criarPedido({
      ...req.body,
      userId: req.user.id,
    })
    const io = req.app.get('io')
    if (isNovo) {
      io.to('cozinha').emit('pedido_novo', pedido)
    } else {
      io.to('cozinha').emit('pedido_atualizado', pedido)
    }
    res.status(201).json(pedido)
  } catch (error) {
    next(error)
  }
}

const buscar = async (req, res, next) => {
  try {
    const pedido = await pedidoService.buscarPedido(req.params.id)
    res.json(pedido)
  } catch (error) {
    next(error)
  }
}

const listar = async (req, res, next) => {
  try {
    const pedidos = await pedidoService.listarPedidos()
    res.json(pedidos)
  } catch (error) {
    next(error)
  }
}

const atualizarStatus = async (req, res, next) => {
  try {
    const pedido = await pedidoService.atualizarStatus(req.params.id, req.body.status)
    const io = req.app.get('io')
    io.to('cozinha').emit('pedido_atualizado', pedido)
    io.to(`mesa_${pedido.mesa}`).emit('status_atualizado', {
      pedidoId: pedido.id,
      status: pedido.status,
    })
    res.json(pedido)
  } catch (error) {
    next(error)
  }
}

const historico = async (req, res, next) => {
  try {
    const { mesa, status, dataInicio, dataFim, page, limit } = req.query
    const resultado = await pedidoService.listarHistorico({
      mesa,
      status,
      dataInicio,
      dataFim,
      page: Number(page) || 1,
      limit: Number(limit) || 20,
    })
    res.json(resultado)
  } catch (error) {
    next(error)
  }
}

module.exports = { criar, buscar, listar, atualizarStatus, historico }