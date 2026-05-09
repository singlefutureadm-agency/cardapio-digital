jest.mock('../lib/prisma', () => ({
  pedido:         { findMany: jest.fn(), findUnique: jest.fn() },
  pagamento:      { upsert: jest.fn(), update: jest.fn(), findMany: jest.fn(), findUnique: jest.fn() },
  chamadaGarcom:  { findMany: jest.fn(), update: jest.fn() },
}))

const prisma = require('../lib/prisma')
const { fecharMesa, listarMesasAbertas } = require('../services/pagamento.service')

beforeEach(() => jest.clearAllMocks())

describe('fecharMesa', () => {
  const pedidosMock = [
    { id: 10, mesa: '3', total: '42.90', status: 'ENTREGUE' },
    { id: 11, mesa: '3', total: '18.90', status: 'ENTREGUE' },
  ]
  const chamadaMock = [{ id: 7, mesa: '3', status: 'PENDENTE' }]

  beforeEach(() => {
    prisma.pedido.findMany.mockResolvedValue(pedidosMock)
    prisma.pagamento.upsert.mockResolvedValue({})
    prisma.chamadaGarcom.findMany.mockResolvedValue(chamadaMock)
    prisma.chamadaGarcom.update.mockResolvedValue({})
  })

  test('cria/atualiza pagamento PAGO para cada pedido da mesa', async () => {
    await fecharMesa('3', 'CARTAO', null)

    expect(prisma.pagamento.upsert).toHaveBeenCalledTimes(2)
    expect(prisma.pagamento.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where:  { pedidoId: 10 },
        update: expect.objectContaining({ status: 'PAGO', metodo: 'CARTAO' }),
        create: expect.objectContaining({ status: 'PAGO', metodo: 'CARTAO', pedidoId: 10 }),
      })
    )
  })

  test('marca chamadas como ATENDIDO ao fechar mesa', async () => {
    await fecharMesa('3', 'DINHEIRO', null)

    expect(prisma.chamadaGarcom.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 7 },
        data:  { status: 'ATENDIDO' },
      })
    )
  })

  test('emite chamada_atendida via socket ao fechar', async () => {
    const io = { to: jest.fn().mockReturnThis(), emit: jest.fn() }

    await fecharMesa('3', 'PIX', io)

    expect(io.to).toHaveBeenCalledWith('cozinha')
    expect(io.emit).toHaveBeenCalledWith('chamada_atendida', { id: 7 })
  })

  test('retorna resumo correto da mesa fechada', async () => {
    const resultado = await fecharMesa('3', 'CARTAO', null)

    expect(resultado.mesa).toBe('3')
    expect(resultado.pedidosFechados).toBe(2)
    expect(resultado.total).toBeCloseTo(61.80, 2) // 42.90 + 18.90
  })

  test('não chama socket quando io não é fornecido', async () => {
    await expect(fecharMesa('3', 'DINHEIRO', null)).resolves.not.toThrow()
  })
})

describe('listarMesasAbertas', () => {
  test('retorna mesas com chamadas PENDENTE e seus pedidos do dia', async () => {
    const chamadas = [{ id: 5, mesa: '2', status: 'PENDENTE', createdAt: new Date() }]
    const pedidos  = [
      {
        id: 20, mesa: '2', total: '68.90', status: 'ENTREGUE',
        itens:    [{ id: 1, menuItem: { nome: 'Picanha' } }],
        pagamento: null,
      },
    ]

    prisma.chamadaGarcom.findMany.mockResolvedValue(chamadas)
    prisma.pedido.findMany.mockResolvedValue(pedidos)

    const resultado = await listarMesasAbertas()

    expect(resultado).toHaveLength(1)
    expect(resultado[0].mesa).toBe('2')
    expect(resultado[0].chamada.id).toBe(5)
    expect(resultado[0].pedidos).toHaveLength(1)
    expect(resultado[0].totalMesa).toBeCloseTo(68.90, 2)
  })

  test('exclui pedidos de sessões anteriores (pagamento PAGO)', async () => {
    const chamadas = [{ id: 6, mesa: '3', status: 'PENDENTE', createdAt: new Date() }]
    const pedidos  = [
      // sessão anterior — pago
      { id: 9,  mesa: '3', total: '37.80', status: 'ENTREGUE', itens: [], pagamento: { status: 'PAGO' } },
      { id: 13, mesa: '3', total: '18.90', status: 'ENTREGUE', itens: [], pagamento: { status: 'PAGO' } },
      // sessão atual — sem pagamento
      { id: 18, mesa: '3', total: '42.90', status: 'NOVO',     itens: [], pagamento: null },
    ]

    prisma.chamadaGarcom.findMany.mockResolvedValue(chamadas)
    prisma.pedido.findMany.mockResolvedValue(pedidos)

    const resultado = await listarMesasAbertas()

    expect(resultado[0].pedidos).toHaveLength(1)
    expect(resultado[0].pedidos[0].id).toBe(18)
    expect(resultado[0].totalMesa).toBeCloseTo(42.90, 2)
  })

  test('retorna lista vazia quando não há chamadas pendentes', async () => {
    prisma.chamadaGarcom.findMany.mockResolvedValue([])

    const resultado = await listarMesasAbertas()

    expect(resultado).toEqual([])
    expect(prisma.pedido.findMany).not.toHaveBeenCalled()
  })
})
