// Valida a lógica de filtro do ClientePedidos.jsx no lado do servidor
// (pura lógica JS, sem dependência de React)

function hoje() {
  return new Date().toDateString()
}

function filtrarPedidosDaSessaoAtual(pedidos, mesa) {
  return pedidos.filter(p =>
    p.mesa === mesa &&
    new Date(p.createdAt).toDateString() === hoje() &&
    p.pagamento?.status !== 'PAGO'
  )
}

describe('filtro de sessão atual — ClientePedidos', () => {
  const agora    = new Date().toISOString()
  const ontem    = new Date(Date.now() - 864e5).toISOString()

  const pedidos = [
    // Sessão atual — sem pagamento
    { id: 18, mesa: '3', createdAt: agora, pagamento: null },
    // Sessão anterior do mesmo dia — pagamento PAGO
    { id: 17, mesa: '3', createdAt: agora, pagamento: { status: 'PAGO' } },
    // Outra mesa hoje
    { id: 16, mesa: '5', createdAt: agora, pagamento: null },
    // Pedido de ontem da mesma mesa
    { id: 15, mesa: '3', createdAt: ontem, pagamento: null },
    // Pedido com pagamento PENDENTE (PIX em andamento) — deve aparecer
    { id: 14, mesa: '3', createdAt: agora, pagamento: { status: 'PENDENTE' } },
    // Pedido com pagamento CANCELADO — deve aparecer
    { id: 13, mesa: '3', createdAt: agora, pagamento: { status: 'CANCELADO' } },
  ]

  test('exibe apenas pedidos da mesa sem pagamento PAGO', () => {
    const resultado = filtrarPedidosDaSessaoAtual(pedidos, '3')

    const ids = resultado.map(p => p.id)
    expect(ids).toContain(18)    // sem pagamento → exibe
    expect(ids).toContain(14)    // PENDENTE → exibe (PIX em andamento)
    expect(ids).toContain(13)    // CANCELADO → exibe
    expect(ids).not.toContain(17) // PAGO → oculta (sessão encerrada)
  })

  test('não exibe pedidos de outras mesas', () => {
    const resultado = filtrarPedidosDaSessaoAtual(pedidos, '3')
    expect(resultado.every(p => p.mesa === '3')).toBe(true)
  })

  test('não exibe pedidos de dias anteriores', () => {
    const resultado = filtrarPedidosDaSessaoAtual(pedidos, '3')
    expect(resultado.find(p => p.id === 15)).toBeUndefined()
  })

  test('retorna lista vazia quando todos os pedidos da mesa estão PAGO', () => {
    const todos_pagos = [
      { id: 1, mesa: '3', createdAt: agora, pagamento: { status: 'PAGO' } },
      { id: 2, mesa: '3', createdAt: agora, pagamento: { status: 'PAGO' } },
    ]
    expect(filtrarPedidosDaSessaoAtual(todos_pagos, '3')).toHaveLength(0)
  })

  test('retorna lista vazia quando não há pedidos hoje', () => {
    const so_ontem = [
      { id: 1, mesa: '3', createdAt: ontem, pagamento: null },
    ]
    expect(filtrarPedidosDaSessaoAtual(so_ontem, '3')).toHaveLength(0)
  })
})
