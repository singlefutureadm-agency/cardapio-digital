import { useState } from 'react'
import api from '../services/api'
import usePedidoStore from '../store/usePedidoStore'

const ACAO = {
  NOVO:       { label: 'Iniciar preparo',    proxStatus: 'PREPARANDO', cor: 'var(--warning)', bg: 'var(--warning-bg)'   },
  PREPARANDO: { label: 'Marcar como pronto', proxStatus: 'PRONTO',     cor: 'var(--success)', bg: 'var(--success-bg)'   },
  PRONTO:     { label: 'Confirmar entrega',  proxStatus: 'ENTREGUE',   cor: 'var(--text-hint)', bg: 'var(--surface)'    },
}

export default function PedidoCard({ pedido, agora }) {
  const { removerSeEntregue } = usePedidoStore()
  const [atualizando, setAtualizando] = useState(false)

  const acao    = ACAO[pedido.status]
  const min     = Math.floor((agora - new Date(pedido.createdAt).getTime()) / 60000)
  const urgente  = min >= 20
  const atrasado = min >= 10 && min < 20

  const timerStyle = urgente
    ? { background: 'var(--danger-bg)',  color: 'var(--danger)'  }
    : atrasado
    ? { background: 'var(--warning-bg)', color: 'var(--warning)' }
    : { background: 'var(--success-bg)', color: 'var(--success)' }

  const borderStyle = urgente
    ? { border: '2px solid var(--danger)',  boxShadow: '0 0 0 3px var(--danger-bg)'  }
    : atrasado
    ? { border: '2px solid var(--warning)', boxShadow: '0 0 0 3px var(--warning-bg)' }
    : { border: '1px solid var(--border)',  boxShadow: 'none' }

  const avancar = async () => {
    if (!acao || atualizando) return
    setAtualizando(true)
    try {
      const { data } = await api.patch(`/pedidos/${pedido.id}/status`, { status: acao.proxStatus })
      removerSeEntregue(data)
    } finally { setAtualizando(false) }
  }

  const cancelar = async () => {
    if (!confirm(`Cancelar pedido #${pedido.id} — Mesa ${pedido.mesa}?`)) return
    setAtualizando(true)
    try {
      const { data } = await api.patch(`/pedidos/${pedido.id}/status`, { status: 'CANCELADO' })
      removerSeEntregue(data)
    } finally { setAtualizando(false) }
  }

  return (
    <div className="rounded-xl overflow-hidden transition-all"
         style={{ background: 'var(--card)', ...borderStyle }}>

      {/* ── Header do card ── */}
      <div className="flex items-center justify-between px-3.5 py-2.5"
           style={{
             background: urgente ? 'var(--danger-bg)' : atrasado ? 'var(--warning-bg)' : 'var(--surface)',
             borderBottom: '1px solid var(--border)',
           }}>
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-bold text-base leading-tight" style={{ color: 'var(--text-primary)' }}>
            Mesa {pedido.mesa}
          </span>
          <span className="text-xs font-medium" style={{ color: 'var(--text-hint)' }}>
            #{pedido.id}
          </span>
          {urgente && (
            <span className="text-xs font-bold px-1.5 py-0.5 rounded-md"
                  style={{ background: 'var(--danger)', color: '#fff', fontSize: 10 }}>
              URGENTE
            </span>
          )}
        </div>

        {/* Timer */}
        <span className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={timerStyle}>
          {min}min
        </span>
      </div>

      {/* ── Itens ── */}
      <div className="px-3.5 py-3 space-y-2">
        {pedido.itens.map((item) => (
          <div key={item.id} className="flex items-start gap-2">
            {/* Quantidade badge */}
            <span className="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold mt-0.5"
                  style={{ background: 'var(--brand-light)', color: 'var(--brand)' }}>
              {item.quantidade}
            </span>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium leading-snug" style={{ color: 'var(--text-primary)' }}>
                {item.menuItem.nome}
              </p>
              {item.observacao && (
                <p className="text-xs mt-0.5 font-medium" style={{ color: 'var(--warning)' }}>
                  ⚠ {item.observacao}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── Rodapé: hora + ações ── */}
      <div className="px-3.5 pb-3 flex items-center gap-2"
           style={{ borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
        <span className="text-xs flex-1" style={{ color: 'var(--text-hint)' }}>
          {new Date(pedido.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </span>

        {acao && (
          <>
            <button
              onClick={avancar}
              disabled={atualizando}
              className="flex-1 py-2 rounded-xl text-xs font-bold transition-all active:scale-[0.97] disabled:opacity-40"
              style={{ background: acao.bg, color: acao.cor, border: `1px solid ${acao.cor}55` }}
            >
              {atualizando ? '...' : acao.label}
            </button>

            {pedido.status === 'NOVO' && (
              <button
                onClick={cancelar}
                disabled={atualizando}
                className="w-9 h-9 flex items-center justify-center rounded-xl text-sm transition-all disabled:opacity-40 flex-shrink-0"
                style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger)44' }}
              >
                ✕
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
