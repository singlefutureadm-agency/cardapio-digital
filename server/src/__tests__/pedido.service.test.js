jest.mock('../lib/prisma', () => ({
  menuItem: { findMany: jest.fn() },
  pedido:   { findFirst: jest.fn(), create: jest.fn(), update: jest.fn() },
}))

const prisma = require('../lib/prisma')
const { criarPedido } = require('../services/pedido.service')

const mockMenuItems = [
  { id: 1, nome: 'Bruschetta',      preco: 18.90 },
  { id: 2, nome: 'Frango Grelhado', preco: 42.90 },
]

const itensInput = [
  { menuItemId: 1, quantidade: 2, observacao: '' },
]

beforeEach(() => jest.clearAllMocks())

describe('criarPedido — acumulação de itens', () => {
  test('cria novo pedido quando não existe pedido NOVO para a mesa hoje', async () => {
    prisma.menuItem.findMany.mockResolvedValue(mockMenuItems.slice(0, 1))
    prisma.pedido.findFirst.mockResolvedValue(null)
    prisma.pedido.create.mockResolvedValue({
      id: 1, mesa: '3', total: 37.80, status: 'NOVO',
      itens: [{ id: 1, menuItemId: 1, quantidade: 2, subtotal: 37.80, menuItem: mockMenuItems[0] }],
    })

    const { pedido, isNovo } = await criarPedido({ mesa: '3', itens: itensInput, userId: 10 })

    expect(prisma.pedido.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ mesa: '3', status: 'NOVO' }) })
    )
    expect(prisma.pedido.create).toHaveBeenCalledTimes(1)
    expect(prisma.pedido.update).not.toHaveBeenCalled()
    expect(isNovo).toBe(true)
    expect(pedido.mesa).toBe('3')
  })

  test('adiciona itens ao pedido NOVO existente da mesa', async () => {
    const pedidoExistente = { id: 5, mesa: '3', total: 18.90, status: 'NOVO' }
    prisma.menuItem.findMany.mockResolvedValue(mockMenuItems.slice(1, 2))
    prisma.pedido.findFirst.mockResolvedValue(pedidoExistente)
    prisma.pedido.update.mockResolvedValue({
      id: 5, mesa: '3', total: 61.80, status: 'NOVO',
      itens: [],
    })

    const itensNovos = [{ menuItemId: 2, quantidade: 1, observacao: '' }]
    const { pedido, isNovo } = await criarPedido({ mesa: '3', itens: itensNovos, userId: 10 })

    expect(prisma.pedido.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 5 },
        data: expect.objectContaining({
          total: 18.90 + 42.90, // total existente + novo item
        }),
      })
    )
    expect(prisma.pedido.create).not.toHaveBeenCalled()
    expect(isNovo).toBe(false)
    expect(pedido.id).toBe(5)
  })

  test('cria novo pedido quando pedido existente já não está em NOVO', async () => {
    // findFirst retorna null (nenhum pedido NOVO), mesmo que exista em PREPARANDO
    prisma.menuItem.findMany.mockResolvedValue(mockMenuItems.slice(0, 1))
    prisma.pedido.findFirst.mockResolvedValue(null)
    prisma.pedido.create.mockResolvedValue({
      id: 8, mesa: '3', total: 37.80, status: 'NOVO', itens: [],
    })

    const { isNovo } = await criarPedido({ mesa: '3', itens: itensInput, userId: 10 })

    expect(prisma.pedido.create).toHaveBeenCalledTimes(1)
    expect(isNovo).toBe(true)
  })

  test('lança erro quando item do menu não existe', async () => {
    // Retorna menos itens do que o solicitado
    prisma.menuItem.findMany.mockResolvedValue([])

    await expect(
      criarPedido({ mesa: '3', itens: itensInput, userId: 10 })
    ).rejects.toThrow('Item do menu não encontrado')
  })

  test('calcula subtotal e total corretamente ao criar pedido', async () => {
    const itens = [
      { menuItemId: 1, quantidade: 2, observacao: '' },
      { menuItemId: 2, quantidade: 1, observacao: '' },
    ]
    prisma.menuItem.findMany.mockResolvedValue(mockMenuItems)
    prisma.pedido.findFirst.mockResolvedValue(null)
    prisma.pedido.create.mockImplementation(({ data }) => Promise.resolve({
      id: 9, mesa: '3', total: data.total, status: 'NOVO', itens: [],
    }))

    const { pedido } = await criarPedido({ mesa: '3', itens, userId: 10 })

    // 2×18.90 + 1×42.90 = 37.80 + 42.90 = 80.70
    expect(pedido.total).toBeCloseTo(80.70, 2)
    const createCall = prisma.pedido.create.mock.calls[0][0]
    expect(createCall.data.itens.create).toHaveLength(2)
    expect(createCall.data.itens.create[0].subtotal).toBeCloseTo(37.80, 2)
    expect(createCall.data.itens.create[1].subtotal).toBeCloseTo(42.90, 2)
  })
})
