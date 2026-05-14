// Valida a lógica de separação de pedidos do ClientePedidos.jsx
// (pura lógica JS, sem dependência de React)

const ATIVOS     = ['NOVO', 'PREPARANDO', 'PRONTO']
const FINALIZADOS = ['ENTREGUE', 'CANCELADO']

function separarPedidos(pedidos, mesa) {
  const daMesa  = pedidos.filter(p => p.mesa === mesa)
  const ativos  = daMesa.filter(p => ATIVOS.includes(p.status))
  const historico = daMesa.filter(p => FINALIZADOS.includes(p.status))
  return { ativos, historico }
}

describe('separação de pedidos — ClientePedidos', () => {
  const pedidos = [
    { id: 1, mesa: '3', status: 'NOVO'       },
    { id: 2, mesa: '3', status: 'PREPARANDO' },
    { id: 3, mesa: '3', status: 'PRONTO'     },
    { id: 4, mesa: '3', status: 'ENTREGUE'   },
    { id: 5, mesa: '3', status: 'CANCELADO'  },
    { id: 6, mesa: '5', status: 'NOVO'       }, // outra mesa
  ]

  test('ativos contém apenas NOVO, PREPARANDO e PRONTO da mesa', () => {
    const { ativos } = separarPedidos(pedidos, '3')
    expect(ativos.map(p => p.id)).toEqual([1, 2, 3])
  })

  test('historico contém apenas ENTREGUE e CANCELADO da mesa', () => {
    const { historico } = separarPedidos(pedidos, '3')
    expect(historico.map(p => p.id)).toEqual([4, 5])
  })

  test('não inclui pedidos de outras mesas', () => {
    const { ativos, historico } = separarPedidos(pedidos, '3')
    const todos = [...ativos, ...historico]
    expect(todos.every(p => p.mesa === '3')).toBe(true)
    expect(todos.find(p => p.id === 6)).toBeUndefined()
  })

  test('ativos vazio quando todos os pedidos foram finalizados', () => {
    const finalizados = [
      { id: 10, mesa: '3', status: 'ENTREGUE'  },
      { id: 11, mesa: '3', status: 'CANCELADO' },
    ]
    const { ativos, historico } = separarPedidos(finalizados, '3')
    expect(ativos).toHaveLength(0)
    expect(historico).toHaveLength(2)
  })

  test('historico vazio quando todos os pedidos ainda estão em andamento', () => {
    const emAndamento = [
      { id: 20, mesa: '3', status: 'NOVO'       },
      { id: 21, mesa: '3', status: 'PREPARANDO' },
    ]
    const { ativos, historico } = separarPedidos(emAndamento, '3')
    expect(ativos).toHaveLength(2)
    expect(historico).toHaveLength(0)
  })

  test('pedidos de ontem aparecem no historico normalmente (sem filtro de data)', () => {
    const ontem = new Date(Date.now() - 864e5).toISOString()
    const comOntem = [
      { id: 30, mesa: '3', status: 'ENTREGUE', createdAt: ontem },
      { id: 31, mesa: '3', status: 'NOVO',     createdAt: new Date().toISOString() },
    ]
    const { ativos, historico } = separarPedidos(comOntem, '3')
    expect(ativos.map(p => p.id)).toContain(31)
    expect(historico.map(p => p.id)).toContain(30)
  })

  test('retorna tudo vazio quando não há pedidos da mesa', () => {
    const { ativos, historico } = separarPedidos(pedidos, '9')
    expect(ativos).toHaveLength(0)
    expect(historico).toHaveLength(0)
  })
})
