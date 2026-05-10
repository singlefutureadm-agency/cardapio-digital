const prisma = require('../lib/prisma')

const STATUS_PEDIDO = ['NOVO', 'PREPARANDO', 'PRONTO', 'ENTREGUE', 'CANCELADO']

const criarPedido = async ({ mesa, itens, userId }) => {
  const menuItems = await prisma.menuItem.findMany({
    where: { id: { in: itens.map((i) => i.menuItemId) }, disponivel: true },
  })

  if (menuItems.length !== itens.length) {
    throw Object.assign(new Error('Item do menu não encontrado ou indisponível'), { status: 404 })
  }

  const itensComPreco = itens.map((item) => {
    const menuItem = menuItems.find((m) => m.id === item.menuItemId)
    return {
      ...item,
      subtotal: Number(menuItem.preco) * item.quantidade,
    }
  })

  const totalNovos = itensComPreco.reduce((acc, i) => acc + i.subtotal, 0)

  // Se já existe um pedido NOVO para esta mesa hoje, adiciona os itens nele
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const pedidoAberto = await prisma.pedido.findFirst({
    where: { mesa, status: 'NOVO', createdAt: { gte: hoje } },
  })

  if (pedidoAberto) {
    const pedido = await prisma.pedido.update({
      where: { id: pedidoAberto.id },
      data: {
        total: Number(pedidoAberto.total) + totalNovos,
        itens: {
          create: itensComPreco.map((i) => ({
            menuItemId: i.menuItemId,
            quantidade: i.quantidade,
            observacao: i.observacao,
            subtotal: i.subtotal,
          })),
        },
      },
      include: { itens: { include: { menuItem: true } } },
    })
    return { pedido, isNovo: false }
  }

  const pedido = await prisma.pedido.create({
    data: {
      mesa,
      total: totalNovos,
      userId: userId ?? null,
      itens: {
        create: itensComPreco.map((i) => ({
          menuItemId: i.menuItemId,
          quantidade: i.quantidade,
          observacao: i.observacao,
          subtotal: i.subtotal,
        })),
      },
    },
    include: { itens: { include: { menuItem: true } } },
  })

  return { pedido, isNovo: true }
}

const buscarPedido = async (id) => {
  const pedido = await prisma.pedido.findUnique({
    where: { id: Number(id) },
    include: {
      itens: { include: { menuItem: true } },
      pagamento: true,
    },
  })

  if (!pedido) {
    throw Object.assign(new Error('Pedido não encontrado'), { status: 404 })
  }

  return pedido
}

const listarPedidos = async () => {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  return prisma.pedido.findMany({
    where: {
      status:    { notIn: ['ENTREGUE', 'CANCELADO'] },
      createdAt: { gte: hoje },
    },
    include: {
      itens: { include: { menuItem: true } },
      pagamento: true,
    },
    orderBy: { createdAt: 'asc' },
  })
}

const atualizarStatus = async (id, status) => {
  if (!STATUS_PEDIDO.includes(status)) {
    throw Object.assign(new Error('Status inválido'), { status: 400 })
  }

  return prisma.pedido.update({
    where: { id: Number(id) },
    data: { status },
    include: {
      itens: { include: { menuItem: true } },
      pagamento: true,
    },
  })
}

const listarHistorico = async ({ mesa, status, dataInicio, dataFim, page = 1, limit = 20 }) => {
  const where = {}

  if (mesa) where.mesa = { contains: mesa, mode: 'insensitive' }
  if (status) where.status = status
  if (dataInicio || dataFim) {
    where.createdAt = {}
    if (dataInicio) where.createdAt.gte = new Date(dataInicio)
    if (dataFim) {
      const fim = new Date(dataFim)
      fim.setHours(23, 59, 59, 999)
      where.createdAt.lte = fim
    }
  }

  const [pedidos, total] = await Promise.all([
    prisma.pedido.findMany({
      where,
      include: {
        itens: { include: { menuItem: { select: { id: true, nome: true } } } },
        pagamento: true,
        user: { select: { id: true, nome: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.pedido.count({ where }),
  ])

  return { pedidos, total, paginas: Math.ceil(total / limit), page }
}

module.exports = { criarPedido, buscarPedido, listarPedidos, atualizarStatus, listarHistorico, STATUS_PEDIDO }