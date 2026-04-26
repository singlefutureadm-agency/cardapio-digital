import { useState } from 'react'
import api from '../services/api'
import usePedidoStore from '../store/usePedidoStore'

const ACAO = {
  NOVO: { label: 'Iniciar preparo', status: 'PREPARANDO', cor: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  PREPARANDO: { label: 'Marcar como pronto', status: 'PRONTO', cor: '#10B981', bg: 'rgba(16,185,129,0.12)' },
  PRONTO: { label: 'Confirmar entrega', status: 'ENTREGUE', cor: '#6B7280', bg: 'rgba(107,114,128,0.12)' },
}

export default function PedidoCard({ pedido, agora }) {
  const { removerSeEntregue } = usePedidoStore()
  const [atualizando, setAtualizando] = useState(false)

  const acao = ACAO[pedido.status]
  const minutos = Math.floor((agora - new Date(pedido.createdAt).getTime()) / 60000)
  const urgente = minutos >= 20
  const atrasado = minutos >= 10 && minutos < 20

  const avancar = async () => {
    if (!acao) return
    setAtualizando(true)
    try {
      const { data } = await api.patch(`/pedidos/${pedido.id}/status`, { status: acao.status })
      removerSeEntregue(data)
    } finally {
      setAtualizando(false)
    }
  }

  const cancelar = async () => {
    if (!confirm(`Cancelar pedido #${pedido.id}?`)) return
    setAtualizando(true)
    try {
      const { data } = await api.patch(`/pedidos/${pedido.id}/status`, { status: 'CANCELADO' })
      removerSeEntregue(data)
    } finally {
      setAtualizando(false)
    }
  }

  return (
    <div
      className="rounded-2xl p-4 space-y-3"
      style={{
        background: '#1A1A17',
        border: urgente
          ? '1px solid rgba(239,68,68,0.4)'
          : '1px solid #2A2A26',
      }}
    >
      {/* Cabeçalho */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="font-display text-base font-medium" style={{ color: '#F5F4F0' }}>
            Mesa {pedido.mesa}
          </span>
          <span className="text-xs ml-2" style={{ color: '#6B6B60' }}>
            #{pedido.id}
          </span>
        </div>

        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
          style={
            urgente
              ? { background: 'rgba(239,68,68,0.15)', color: '#F87171' }
              : atrasado
              ? { background: 'rgba(245,158,11,0.15)', color: '#FCD34D' }
              : { background: 'rgba(16,185,129,0.1)', color: '#6EE7B7' }
          }
        >
          {minutos}min
        </span>
      </div>

      {/* Itens */}
      <ul className="space-y-1.5">
        {pedido.itens.map((item) => (
          <li key={item.id} className="text-sm flex items-start gap-2">
            <span className="font-semibold flex-shrink-0" style={{ color: '#C8520A' }}>
              {item.quantidade}×
            </span>
            <span style={{ color: '#D4D4CC' }}>
              {item.menuItem.nome}
              {item.observacao && (
                <span className="ml-1 text-xs" style={{ color: '#F59E0B' }}>
                  ⚠ {item.observacao}
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>

      {/* Info pagamento */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs" style={{ color: '#4A4A46' }}>
          {pedido.pagamento?.tipo === 'ONLINE' ? '💳 Pago online' : '🧾 Com garçom'}
        </span>
      </div>

      {/* Ações */}
      {acao && (
        <div className="flex gap-2 pt-1">
          <button
            onClick={avancar}
            disabled={atualizando}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.97] disabled:opacity-40"
            style={{ background: acao.bg, color: acao.cor, border: `1px solid ${acao.cor}33` }}
          >
            {atualizando ? '...' : acao.label}
          </button>

          {pedido.status === 'NOVO' && (
            <button
              onClick={cancelar}
              disabled={atualizando}
              className="w-10 flex items-center justify-center rounded-xl text-sm transition-all disabled:opacity-40"
              style={{ background: 'rgba(239,68,68,0.1)', color: '#F87171', border: '1px solid rgba(239,68,68,0.2)' }}
            >
              ✕
            </button>
          )}
        </div>
      )}
    </div>
  )
}