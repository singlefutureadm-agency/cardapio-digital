jest.mock('../lib/prisma', () => ({
  pedido: {
    findUnique: jest.fn(),
    findMany:   jest.fn(),
    update:     jest.fn(),
    count:      jest.fn(),
  },
}))

const prisma = require('../lib/prisma')
const {
  buscarPedido,
  listarPedidos,
  atualizarStatus,
  listarHistorico,
  STATUS_PEDIDO,
} = require('../services/pedido.service')

const pedidoBase = {
  id: 1, mesa: '3', total: '42.90', status: 'NOVO',
  itens: [], pagamento: null,
}

beforeEach(() => jest.clearAllMocks())

describe('STATUS_PEDIDO', () => {
  test('exporta todos os status válidos', () => {
    expect(STATUS_PEDIDO).toEqual(['NOVO', 'PREPARANDO', 'PRONTO', 'ENTREGUE', 'CANCELADO'])
  })
})

describe('buscarPedido', () => {
  test('retorna pedido com itens e pagamento quando encontrado', async () => {
    prisma.pedido.findUnique.mockResolvedValue(pedidoBase)

    const pedido = await buscarPedido(1)

    expect(pedido.id).toBe(1)
    expect(prisma.pedido.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 1 } })
    )
  })

  test('lança erro 404 quando pedido não existe', async () => {
    prisma.pedido.findUnique.mockResolvedValue(null)

    await expect(buscarPedido(999)).rejects.toMatchObject({ status: 404 })
  })

  test('converte string de id para número', async () => {
    prisma.pedido.findUnique.mockResolvedValue(pedidoBase)

    await buscarPedido('5')

    expect(prisma.pedido.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 5 } })
    )
  })
})

describe('listarPedidos', () => {
  test('retorna apenas pedidos não ENTREGUE nem CANCELADO', async () => {
    const pedidos = [
      { ...pedidoBase, status: 'NOVO' },
      { ...pedidoBase, id: 2, status: 'PREPARANDO' },
    ]
    prisma.pedido.findMany.mockResolvedValue(pedidos)

    const resultado = await listarPedidos()

    expect(resultado).toHaveLength(2)
    expect(prisma.pedido.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: { notIn: ['ENTREGUE', 'CANCELADO'] },
        }),
        orderBy: { createdAt: 'asc' },
      })
    )
  })

  test('limita pedidos ao dia atual (createdAt >= meia-noite de hoje)', async () => {
    prisma.pedido.findMany.mockResolvedValue([])

    await listarPedidos()

    const call = prisma.pedido.findMany.mock.calls[0][0]
    const { gte } = call.where.createdAt

    // gte deve ser um Date com hora 00:00:00
    expect(gte).toBeInstanceOf(Date)
    expect(gte.getHours()).toBe(0)
    expect(gte.getMinutes()).toBe(0)
    expect(gte.getSeconds()).toBe(0)

    // e deve ser hoje (mesma data)
    const hoje = new Date()
    expect(gte.toDateString()).toBe(hoje.toDateString())
  })

  test('retorna apenas id/nome/preco do menuItem (select otimizado)', async () => {
    prisma.pedido.findMany.mockResolvedValue([])

    await listarPedidos()

    const call = prisma.pedido.findMany.mock.calls[0][0]
    const menuItemSelect = call.include?.itens?.include?.menuItem?.select

    expect(menuItemSelect).toEqual({ id: true, nome: true, preco: true })
  })
})

describe('atualizarStatus', () => {
  test('atualiza status do pedido e retorna pedido atualizado', async () => {
    const pedidoAtualizado = { ...pedidoBase, status: 'PREPARANDO' }
    prisma.pedido.update.mockResolvedValue(pedidoAtualizado)

    const resultado = await atualizarStatus(1, 'PREPARANDO')

    expect(resultado.status).toBe('PREPARANDO')
    expect(prisma.pedido.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 1 },
        data: { status: 'PREPARANDO' },
      })
    )
  })

  test('lança erro 400 para status inválido', async () => {
    await expect(atualizarStatus(1, 'INVALIDO'))
      .rejects.toMatchObject({ status: 400, message: 'Status inválido' })

    expect(prisma.pedido.update).not.toHaveBeenCalled()
  })

  test('aceita todos os status válidos sem lançar erro', async () => {
    prisma.pedido.update.mockResolvedValue(pedidoBase)

    for (const status of STATUS_PEDIDO) {
      await expect(atualizarStatus(1, status)).resolves.not.toThrow()
    }

    expect(prisma.pedido.update).toHaveBeenCalledTimes(STATUS_PEDIDO.length)
  })
})

describe('listarHistorico', () => {
  const pedidos = [pedidoBase]
  const total = 1

  beforeEach(() => {
    prisma.pedido.findMany.mockResolvedValue(pedidos)
    prisma.pedido.count.mockResolvedValue(total)
  })

  test('retorna pedidos paginados e total sem filtros', async () => {
    const resultado = await listarHistorico({ page: 1, limit: 20 })

    expect(resultado.pedidos).toHaveLength(1)
    expect(resultado.total).toBe(1)
    expect(resultado.paginas).toBe(1)
    expect(resultado.page).toBe(1)
  })

  test('aplica paginação corretamente', async () => {
    await listarHistorico({ page: 3, limit: 10 })

    expect(prisma.pedido.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 20, take: 10 })
    )
  })

  test('filtra por mesa quando fornecida', async () => {
    await listarHistorico({ mesa: '5', page: 1, limit: 20 })

    expect(prisma.pedido.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ mesa: expect.objectContaining({ contains: '5' }) }),
      })
    )
  })

  test('filtra por status quando fornecido', async () => {
    await listarHistorico({ status: 'ENTREGUE', page: 1, limit: 20 })

    expect(prisma.pedido.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'ENTREGUE' }),
      })
    )
  })

  test('calcula número de páginas corretamente', async () => {
    prisma.pedido.count.mockResolvedValue(45)

    const resultado = await listarHistorico({ page: 1, limit: 20 })

    expect(resultado.paginas).toBe(3) // ceil(45/20)
  })
})
