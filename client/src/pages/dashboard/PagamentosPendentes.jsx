import { useEffect, useState } from 'react'
import api from '../../services/api'
import socket from '../../services/socket'

const METODO_LABEL = { PIX: '📱 Pix', CARTAO: '💳 Cartão', DINHEIRO: '💵 Dinheiro' }
const METODO_OPTIONS = ['DINHEIRO', 'CARTAO', 'PIX']

const STATUS_LABEL = {
  NOVO:       { label: 'Recebido',   cor: 'var(--brand)'   },
  PREPARANDO: { label: 'Preparando', cor: 'var(--warning)'  },
  PRONTO:     { label: 'Pronto',     cor: 'var(--success)'  },
  ENTREGUE:   { label: 'Entregue',   cor: 'var(--text-hint)' },
  CANCELADO:  { label: 'Cancelado',  cor: 'var(--danger)'   },
}

function tempoRelativo(iso) {
  const s = Math.floor((Date.now() - new Date(iso)) / 1000)
  if (s < 60) return `${s}s`
  if (s < 3600) return `${Math.floor(s / 60)}min`
  return `${Math.floor(s / 3600)}h`
}

export default function PagamentosPendentes() {
  const [mesas, setMesas]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [fechando, setFechando]   = useState(null)
  const [metodos, setMetodos]     = useState({})
  const [expandido, setExpandido] = useState({})

  const carregar = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/pagamentos/fechar-conta')
      setMesas(data)
      const initMetodos = {}
      const initExpand  = {}
      data.forEach(m => {
        initMetodos[m.mesa] = m.chamada?.metodo || 'DINHEIRO'
        initExpand[m.mesa]  = true
      })
      setMetodos(prev => ({ ...initMetodos, ...prev }))
      setExpandido(prev => ({ ...initExpand, ...prev }))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregar()

    socket.connect()
    socket.emit('entrar_cozinha')

    socket.on('garcom_chamado', () => carregar())
    socket.on('chamada_atendida', () => carregar())

    return () => {
      socket.off('garcom_chamado')
      socket.off('chamada_atendida')
      socket.disconnect()
    }
  }, [])

  const fechar = async (mesa) => {
    const metodo = metodos[mesa] || 'DINHEIRO'
    if (!confirm(`Fechar conta da Mesa ${mesa} com pagamento ${METODO_LABEL[metodo]}?`)) return
    setFechando(mesa)
    try {
      await api.post('/pagamentos/fechar-mesa', { mesa, metodo })
      setMesas(prev => prev.filter(m => m.mesa !== mesa))
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao fechar mesa')
    } finally {
      setFechando(null) }
  }

  const toggle = (mesa) => setExpandido(prev => ({ ...prev, [mesa]: !prev[mesa] }))

  if (loading) return (
    <div className="space-y-3 p-4 sm:p-6 md:p-8">
      {[1, 2].map(i => (
        <div key={i} className="h-36 rounded-2xl animate-pulse" style={{ background: 'var(--card)' }} />
      ))}
    </div>
  )

  return (
    <div className="p-4 sm:p-6 md:p-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-0.5"
             style={{ color: 'var(--brand)', letterSpacing: '0.12em' }}>
            Dashboard
          </p>
          <div className="flex items-center gap-3">
            <h2 className="font-display text-xl font-medium" style={{ color: 'var(--text-primary)' }}>
              Fechar Contas
            </h2>
            {mesas.length > 0 && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                    style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}>
                {mesas.length} mesa{mesas.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={carregar}
          className="text-sm px-4 py-2 rounded-xl transition-colors"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
        >
          ↻ Atualizar
        </button>
      </div>

      {/* Estado vazio */}
      {mesas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 rounded-2xl"
             style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <span style={{ fontSize: 40 }}>✅</span>
          <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Nenhuma mesa aguardando fechamento</p>
          <p className="text-sm" style={{ color: 'var(--text-hint)' }}>
            Quando um cliente chamar o garçom, a mesa aparecerá aqui.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {mesas.map(({ mesa, chamada, pedidos, totalMesa }) => {
            const isExp    = expandido[mesa] !== false
            const metodo   = metodos[mesa] || 'DINHEIRO'
            const isFech   = fechando === mesa

            return (
              <div key={mesa}
                   className="rounded-2xl overflow-hidden"
                   style={{ background: 'var(--card)', border: '2px solid var(--warning)' }}>

                {/* ── Cabeçalho da mesa ── */}
                <div
                  className="flex items-center justify-between px-5 py-4 cursor-pointer select-none"
                  style={{ background: 'var(--warning-bg)', borderBottom: '1px solid rgba(245,158,11,0.25)' }}
                  onClick={() => toggle(mesa)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg"
                         style={{ background: 'var(--warning)', color: '#fff' }}>
                      {mesa}
                    </div>
                    <div>
                      <p className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>
                        Mesa {mesa}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                        🛎️ Chamou há {tempoRelativo(chamada.createdAt)}
                        {chamada.metodo && (
                          <> · prefere {METODO_LABEL[chamada.metodo]}</>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs" style={{ color: 'var(--text-hint)' }}>Total</p>
                      <p className="font-display font-medium text-lg" style={{ color: 'var(--warning)' }}>
                        R$ {totalMesa.toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                    <span style={{ color: 'var(--text-hint)', fontSize: 18 }}>
                      {isExp ? '▲' : '▼'}
                    </span>
                  </div>
                </div>

                {/* ── Histórico de pedidos ── */}
                {isExp && (
                  <div className="px-5 py-4">
                    {pedidos.length === 0 ? (
                      <p className="text-sm text-center py-4" style={{ color: 'var(--text-hint)' }}>
                        Nenhum pedido hoje para esta mesa.
                      </p>
                    ) : (
                      <div className="space-y-3 mb-4">
                        {pedidos.map((pedido) => {
                          const stCfg = STATUS_LABEL[pedido.status] ?? STATUS_LABEL.NOVO
                          const pago  = pedido.pagamento?.status === 'PAGO'
                          return (
                            <div key={pedido.id}
                                 className="rounded-xl overflow-hidden"
                                 style={{ border: '1px solid var(--border)' }}>

                              {/* mini-header do pedido */}
                              <div className="flex items-center justify-between px-3.5 py-2"
                                   style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-semibold" style={{ color: 'var(--text-hint)' }}>
                                    #{pedido.id}
                                  </span>
                                  <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                                        style={{ background: `${stCfg.cor}22`, color: stCfg.cor }}>
                                    {stCfg.label}
                                  </span>
                                  {pago && (
                                    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                                          style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
                                      Pago
                                    </span>
                                  )}
                                </div>
                                <span className="text-xs" style={{ color: 'var(--text-hint)' }}>
                                  {new Date(pedido.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>

                              {/* itens */}
                              <div className="px-3.5 py-2.5 space-y-1.5"
                                   style={{ background: 'var(--card)' }}>
                                {pedido.itens.map(item => (
                                  <div key={item.id} className="flex items-start justify-between gap-2">
                                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                      <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                                        {item.quantidade}×
                                      </span>{' '}
                                      {item.menuItem.nome}
                                      {item.observacao && (
                                        <span className="text-xs italic ml-1" style={{ color: 'var(--text-hint)' }}>
                                          ({item.observacao})
                                        </span>
                                      )}
                                    </span>
                                    <span className="text-sm font-medium flex-shrink-0"
                                          style={{ color: 'var(--text-primary)' }}>
                                      R$ {Number(item.subtotal).toFixed(2).replace('.', ',')}
                                    </span>
                                  </div>
                                ))}

                                <div className="flex justify-between pt-1.5 mt-1"
                                     style={{ borderTop: '1px dashed var(--border)' }}>
                                  <span className="text-xs" style={{ color: 'var(--text-hint)' }}>Subtotal</span>
                                  <span className="text-sm font-semibold" style={{ color: 'var(--brand)' }}>
                                    R$ {Number(pedido.total).toFixed(2).replace('.', ',')}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* ── Rodapé: forma de pagamento + botão fechar ── */}
                    <div className="rounded-xl overflow-hidden"
                         style={{ border: '1px solid var(--border)' }}>

                      {/* Resumo total */}
                      <div className="flex justify-between items-center px-4 py-3"
                           style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                        <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                          Total da mesa
                        </span>
                        <span className="font-display text-xl font-medium" style={{ color: 'var(--warning)' }}>
                          R$ {totalMesa.toFixed(2).replace('.', ',')}
                        </span>
                      </div>

                      {/* Seletor de método */}
                      <div className="px-4 py-3" style={{ background: 'var(--card)' }}>
                        <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-hint)' }}>
                          Confirmar forma de pagamento
                        </p>
                        <div className="flex gap-2">
                          {METODO_OPTIONS.map(m => (
                            <button
                              key={m}
                              onClick={() => setMetodos(prev => ({ ...prev, [mesa]: m }))}
                              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                              style={{
                                background: metodo === m ? 'var(--brand)' : 'var(--surface)',
                                color:      metodo === m ? '#fff'         : 'var(--text-secondary)',
                                border:     metodo === m ? '2px solid var(--brand)' : '1px solid var(--border)',
                              }}
                            >
                              {METODO_LABEL[m]}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Botão fechar */}
                      <div className="px-4 pb-4 pt-2" style={{ background: 'var(--card)' }}>
                        <button
                          onClick={() => fechar(mesa)}
                          disabled={isFech}
                          className="w-full py-3.5 rounded-xl font-bold text-base transition-all active:scale-[0.98]"
                          style={{
                            background: isFech ? 'var(--border)' : 'var(--success)',
                            color: '#fff',
                            cursor: isFech ? 'wait' : 'pointer',
                          }}
                        >
                          {isFech ? 'Fechando...' : `✓ Confirmar pagamento e fechar conta`}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
