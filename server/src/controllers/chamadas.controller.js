const prisma = require('../lib/prisma')

async function criar(req, res, next) {
  try {
    const { mesa, metodo } = req.body
    if (!mesa || !metodo) {
      return res.status(400).json({ error: 'mesa e metodo são obrigatórios' })
    }

    const METODOS_VALIDOS = ['DINHEIRO', 'CARTAO', 'PIX']
    if (!METODOS_VALIDOS.includes(metodo)) {
      return res.status(400).json({ error: 'Método de pagamento inválido' })
    }

    const chamada = await prisma.chamadaGarcom.create({
      data: { mesa, metodo, status: 'PENDENTE' },
    })

    const io = req.app.get('io')
    io.to('cozinha').emit('garcom_chamado', chamada)

    res.status(201).json(chamada)
  } catch (err) {
    next(err)
  }
}

async function listar(req, res, next) {
  try {
    const chamadas = await prisma.chamadaGarcom.findMany({
      where: { status: 'PENDENTE' },
      orderBy: { createdAt: 'desc' },
    })
    res.json(chamadas)
  } catch (err) {
    next(err)
  }
}

async function atender(req, res, next) {
  try {
    const { id } = req.params
    const chamada = await prisma.chamadaGarcom.update({
      where: { id: Number(id) },
      data: { status: 'ATENDIDO' },
    })

    const io = req.app.get('io')
    io.to('cozinha').emit('chamada_atendida', { id: chamada.id })

    res.json(chamada)
  } catch (err) {
    next(err)
  }
}

module.exports = { criar, listar, atender }
