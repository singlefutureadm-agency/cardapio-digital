jest.mock('../lib/prisma', () => ({
  pedido:        { findMany: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
  pagamento:     { upsert: jest.fn(), update: jest.fn(), findMany: jest.fn(), findUnique: jest.fn() },
  chamadaGarcom: { findMany: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
}))
jest.mock('qrcode', () => ({
  toDataURL: jest.fn().mockResolvedValue('data:image/png;base64,mockqr'),
}))

const prisma = require('../lib/prisma')
const { criarPagamento, confirmarPagamento, buscarPorPedido, listarPendentes, fecharMesa, listarMesasAbertas } = require('../services/pagamento.service')

beforeEach(() => jest.clearAllMocks())

describe('fecharMesa', () => {
  const pedidosMock = [
    { id: 10, mesa: '3', total: '42.90', status: 'ENTREGUE', pagamento: null },
    { id: 11, mesa: '3', total: '18.90', status: 'ENTREGUE', pagamento: null },
  ]
  const chamadaMock = [{ id: 7, mesa: '3', status: 'PENDENTE' }]

  beforeEach(() => {
    prisma.chamadaGarcom.findFirst.mockResolvedValue(null) // sem sessão anterior
    prisma.pedido.findMany.mockResolvedValue(pedidosMock)
    prisma.pedido.update.mockResolvedValue({})
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

  test('não reprocessa pedidos já pagos de sessões anteriores', async () => {
    const pedidoComPagoPago = { id: 12, mesa: '3', total: '50.00', status: 'ENTREGUE', pagamento: { status: 'PAGO' } }
    const pedidoAberto     = { id: 13, mesa: '3', total: '30.00', status: 'ENTREGUE', pagamento: null }
    prisma.pedido.findMany.mockResolvedValue([pedidoComPagoPago, pedidoAberto])

    const resultado = await fecharMesa('3', 'CARTAO', null)

    expect(prisma.pagamento.upsert).toHaveBeenCalledTimes(1)
    expect(prisma.pagamento.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { pedidoId: 13 } })
    )
    expect(resultado.pedidosFechados).toBe(1)
    expect(resultado.total).toBeCloseTo(30.00, 2)
  })

  test('marca pedidos como ENTREGUE ao fechar mesa', async () => {
    const pedidosAbertos = [
      { id: 10, mesa: '3', total: '42.90', status: 'NOVO',      pagamento: null },
      { id: 11, mesa: '3', total: '18.90', status: 'PREPARANDO', pagamento: null },
    ]
    prisma.pedido.findMany.mockResolvedValue(pedidosAbertos)

    await fecharMesa('3', 'CARTAO', null)

    expect(prisma.pedido.update).toHaveBeenCalledTimes(2)
    expect(prisma.pedido.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 10 },
        data:  { status: 'ENTREGUE' },
      })
    )
    expect(prisma.pedido.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 11 },
        data:  { status: 'ENTREGUE' },
      })
    )
  })

  test('não chama pedido.update quando pedido já está ENTREGUE', async () => {
    // pedidosMock já tem status ENTREGUE — não deve chamar update
    await fecharMesa('3', 'CARTAO', null)

    expect(prisma.pedido.update).not.toHaveBeenCalled()
  })

  test('usa fronteira de sessão baseada na última chamada ATENDIDO', async () => {
    const ultimaAtendida = { createdAt: new Date(Date.now() - 60_000) } // 1 min atrás
    prisma.chamadaGarcom.findFirst.mockResolvedValue(ultimaAtendida)

    await fecharMesa('3', 'DINHEIRO', null)

    expect(prisma.pedido.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          createdAt: expect.objectContaining({ gte: expect.any(Date) }),
        }),
      })
    )
  })
})

describe('listarMesasAbertas', () => {
  function mockChamadas(pendentes, atendidas = []) {
    prisma.chamadaGarcom.findMany.mockImplementation(({ where }) =>
      where.status === 'ATENDIDO'
        ? Promise.resolve(atendidas)
        : Promise.resolve(pendentes)
    )
  }

  test('retorna mesas com chamadas PENDENTE e seus pedidos do dia', async () => {
    const agora    = new Date()
    const chamadas = [{ id: 5, mesa: '2', status: 'PENDENTE', createdAt: agora }]
    const pedidos  = [
      {
        id: 20, mesa: '2', total: '68.90', status: 'ENTREGUE', createdAt: agora,
        itens: [{ id: 1, menuItem: { nome: 'Picanha' } }],
        pagamento: null,
      },
    ]

    mockChamadas(chamadas)
    prisma.pedido.findMany.mockResolvedValue(pedidos)

    const resultado = await listarMesasAbertas()

    expect(resultado).toHaveLength(1)
    expect(resultado[0].mesa).toBe('2')
    expect(resultado[0].chamada.id).toBe(5)
    expect(resultado[0].pedidos).toHaveLength(1)
    expect(resultado[0].totalMesa).toBeCloseTo(68.90, 2)
  })

  test('exclui pedidos de sessões anteriores (pagamento PAGO)', async () => {
    const agora    = new Date()
    const chamadas = [{ id: 6, mesa: '3', status: 'PENDENTE', createdAt: agora }]
    const pedidos  = [
      { id: 9,  mesa: '3', total: '37.80', status: 'ENTREGUE', createdAt: agora, itens: [], pagamento: { status: 'PAGO' } },
      { id: 13, mesa: '3', total: '18.90', status: 'ENTREGUE', createdAt: agora, itens: [], pagamento: { status: 'PAGO' } },
      { id: 18, mesa: '3', total: '42.90', status: 'NOVO',     createdAt: agora, itens: [], pagamento: null },
    ]

    mockChamadas(chamadas)
    prisma.pedido.findMany.mockResolvedValue(pedidos)

    const resultado = await listarMesasAbertas()

    expect(resultado[0].pedidos).toHaveLength(1)
    expect(resultado[0].pedidos[0].id).toBe(18)
    expect(resultado[0].totalMesa).toBeCloseTo(42.90, 2)
  })

  test('exclui pedidos de sessão anterior sem pagamento usando fronteira de chamada ATENDIDO', async () => {
    const agora    = new Date()
    const haCincoMin = new Date(agora.getTime() - 5 * 60_000) // 5 min atrás = último fechamento

    const chamadas = [{ id: 8, mesa: '1', status: 'PENDENTE', createdAt: agora }]
    // Pedido antigo criado 10min atrás (antes do último fechamento) e sem pagamento
    const pedidoAntigo  = { id: 5, mesa: '1', total: '80.00', status: 'ENTREGUE', itens: [], pagamento: null,
                            createdAt: new Date(agora.getTime() - 10 * 60_000) }
    // Pedido atual criado 2min atrás (depois do último fechamento)
    const pedidoAtual   = { id: 6, mesa: '1', total: '30.00', status: 'ENTREGUE', itens: [], pagamento: null,
                            createdAt: new Date(agora.getTime() - 2 * 60_000) }

    mockChamadas(chamadas, [{ mesa: '1', createdAt: haCincoMin }])
    prisma.pedido.findMany.mockResolvedValue([pedidoAntigo, pedidoAtual])

    const resultado = await listarMesasAbertas()

    expect(resultado[0].pedidos).toHaveLength(1)
    expect(resultado[0].pedidos[0].id).toBe(6)
    expect(resultado[0].totalMesa).toBeCloseTo(30.00, 2)
  })

  test('retorna lista vazia quando não há chamadas pendentes', async () => {
    mockChamadas([])

    const resultado = await listarMesasAbertas()

    expect(resultado).toEqual([])
    expect(prisma.pedido.findMany).not.toHaveBeenCalled()
  })
})

describe('criarPagamento', () => {
  const pedidoMock = { id: 1, mesa: '3', total: '50.00' }

  beforeEach(() => {
    prisma.pedido.findUnique.mockResolvedValue(pedidoMock)
    prisma.pagamento.upsert.mockResolvedValue({ id: 1, pedidoId: 1, status: 'PENDENTE' })
  })

  test('cria pagamento PIX com qrCode e pixCopiaECola', async () => {
    const pagamento = await criarPagamento({ pedidoId: 1, metodo: 'PIX' })

    expect(prisma.pagamento.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { pedidoId: 1 },
        create: expect.objectContaining({ metodo: 'PIX', tipo: 'ONLINE', status: 'PENDENTE' }),
      })
    )
    const createArgs = prisma.pagamento.upsert.mock.calls[0][0]
    expect(createArgs.create.qrCode).toBe('data:image/png;base64,mockqr')
    expect(createArgs.create.pixCopiaECola).toBeTruthy()
  })

  test('cria pagamento CARTAO sem qrCode', async () => {
    await criarPagamento({ pedidoId: 1, metodo: 'CARTAO' })

    const createArgs = prisma.pagamento.upsert.mock.calls[0][0]
    expect(createArgs.create.qrCode).toBeNull()
    expect(createArgs.create.pixCopiaECola).toBeNull()
    expect(createArgs.create.tipo).toBe('GARCOM')
  })

  test('cria pagamento DINHEIRO sem qrCode', async () => {
    await criarPagamento({ pedidoId: 1, metodo: 'DINHEIRO' })

    const createArgs = prisma.pagamento.upsert.mock.calls[0][0]
    expect(createArgs.create.qrCode).toBeNull()
    expect(createArgs.create.tipo).toBe('GARCOM')
  })

  test('lança erro quando pedido não existe', async () => {
    prisma.pedido.findUnique.mockResolvedValue(null)

    await expect(criarPagamento({ pedidoId: 999, metodo: 'PIX' }))
      .rejects.toThrow('Pedido não encontrado')
  })

  test('payload PIX segue formato EMV (termina com 6304 + 4 hex)', async () => {
    await criarPagamento({ pedidoId: 1, metodo: 'PIX' })

    const createArgs = prisma.pagamento.upsert.mock.calls[0][0]
    const payload = createArgs.create.pixCopiaECola
    expect(payload).toMatch(/6304[0-9A-F]{4}$/)
  })
})

describe('confirmarPagamento', () => {
  test('atualiza status do pagamento para PAGO', async () => {
    prisma.pagamento.update.mockResolvedValue({ id: 3, status: 'PAGO' })

    const resultado = await confirmarPagamento(3)

    expect(prisma.pagamento.update).toHaveBeenCalledWith({
      where: { id: 3 },
      data: { status: 'PAGO' },
    })
    expect(resultado.status).toBe('PAGO')
  })
})

describe('buscarPorPedido', () => {
  test('retorna pagamento do pedido pelo pedidoId', async () => {
    const pagamentoMock = { id: 7, pedidoId: 5, status: 'PENDENTE', metodo: 'PIX' }
    prisma.pagamento.findUnique.mockResolvedValue(pagamentoMock)

    const resultado = await buscarPorPedido(5)

    expect(resultado).toEqual(pagamentoMock)
    expect(prisma.pagamento.findUnique).toHaveBeenCalledWith({ where: { pedidoId: 5 } })
  })
})

describe('listarPendentes', () => {
  test('retorna pagamentos com status PENDENTE incluindo dados do pedido', async () => {
    const pendentes = [
      { id: 1, status: 'PENDENTE', metodo: 'PIX', pedido: { id: 10, mesa: '2', total: '80.00', createdAt: new Date() } },
    ]
    prisma.pagamento.findMany.mockResolvedValue(pendentes)

    const resultado = await listarPendentes()

    expect(resultado).toHaveLength(1)
    expect(resultado[0].status).toBe('PENDENTE')
    expect(prisma.pagamento.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { status: 'PENDENTE' } })
    )
  })
})
