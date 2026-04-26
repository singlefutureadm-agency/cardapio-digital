import { useEffect, useState } from 'react'
import api from '../../services/api'

const STATUS_CONFIG = {
  NOVO:       { label: 'Recebido',  cor: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
  PREPARANDO: { label: 'Preparo',   cor: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  PRONTO:     { label: 'Pronto',    cor: '#10B981', bg: 'rgba(16,185,129,0.1)' },
  ENTREGUE:   { label: 'Entregue', cor: '#6B7280', bg: 'rgba(107,114,128,0.1)' },
  CANCELADO:  { label: 'Cancelado', cor: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
}

export default function ClientePedidos() {
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [aberto, setAberto] = useState(null)

  useEffect(() => {
    api.get('/cliente/pedidos').then(({ data }) => {
      setPedidos(data); setLoading(false)
    })
  }, [])

  if (loading) return (
    <div className="space-y-3 pt-2">
      {[1,2,3].map(i => (
        <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: 'var(--card)' }} />
      ))}
    </div>
  )

  return (
    <div className="pt-2 pb-4">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-widest mb-1"
           style={{ color: 'var(--brand)', letterSpacing: '0.12em' }}>Histórico</p>
        <h2 className="font-display text-xl font-medium" style={{ color: 'var(--text-primary)' }}>
          Meus pedidos
        </h2>
      </div>

      {pedidos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <span style={{ fontSize: '48px' }}>📋</span>
          <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Nenhum pedido ainda</p>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Seus pedidos aparecerão aqui
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {pedidos.map((pedido) => {
            const cfg = STATUS_CONFIG[pedido.status]
            const expandido = aberto === pedido.id
            return (
              <div key={pedido.id}
                   className="rounded-2xl overflow-hidden transition-all"
                   style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                {/* Cabeçalho */}
                <button className="w-full flex items-center justify-between p-4 text-left"
                        onClick={() => setAberto(expandido ? null : pedido.id)}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
                         style={{ background: cfg.bg, color: cfg.cor }}>
                      #{pedido.id}
                    </div>
                    <div>
                      <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                        Mesa {pedido.mesa}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-hint)' }}>
                        {new Date(pedido.createdAt).toLocaleDateString('pt-BR', {
                          day: '2-digit', month: '2-digit', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                          style={{ background: cfg.bg, color: cfg.cor }}>
                      {cfg.label}
                    </span>
                    <span style={{ color: 'var(--text-hint)', fontSize: '12px',
                                   transform: expandido ? 'rotate(180deg)' : 'none',
                                   transition: 'transform 0.2s' }}>▾</span>
                  </div>
                </button>

                {/* Detalhes expandidos */}
                {expandido && (
                  <div className="px-4 pb-4 space-y-3"
                       style={{ borderTop: '1px solid var(--border)' }}>
                    <ul className="space-y-2 pt-3">
                      {pedido.itens.map((item) => (
                        <li key={item.id} className="flex justify-between text-sm">
                          <span style={{ color: 'var(--text-secondary)' }}>
                            {item.quantidade}× {item.menuItem.nome}
                            {item.observacao && (
                              <span className="text-xs ml-1 italic" style={{ color: 'var(--text-hint)' }}>
                                ({item.observacao})
                              </span>
                            )}
                          </span>
                          <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                            R$ {Number(item.subtotal).toFixed(2).replace('.', ',')}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <div className="flex justify-between items-center pt-2"
                         style={{ borderTop: '1px solid var(--border)' }}>
                      <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        Total
                      </span>
                      <span className="font-display text-base font-medium" style={{ color: 'var(--brand)' }}>
                        R$ {Number(pedido.total).toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                    {pedido.pagamento && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs" style={{ color: 'var(--text-hint)' }}>
                          {pedido.pagamento.tipo === 'ONLINE' ? '💳 Pago online' : '🧾 Com garçom'}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                              style={pedido.pagamento.status === 'PAGO'
                                ? { background: 'var(--success-bg)', color: 'var(--success)' }
                                : { background: 'var(--warning-bg)', color: 'var(--warning)' }}>
                          {pedido.pagamento.status === 'PAGO' ? 'Pago' : 'Pendente'}
                        </span>
                      </div>
                    )}
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