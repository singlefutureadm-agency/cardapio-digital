import { useEffect, useState } from 'react'
import socket from '../../services/socket'
import usePedidoStore from '../../store/usePedidoStore'
import PedidoCard from '../../components/PedidoCard'

const COLUNAS = [
  { status: 'NOVO',       label: 'Novos pedidos',    cor: 'var(--brand)',   corBg: 'var(--brand-light)'   },
  { status: 'PREPARANDO', label: 'Em preparo',        cor: 'var(--warning)', corBg: 'var(--warning-bg)'    },
  { status: 'PRONTO',     label: 'Pronto p/ entrega', cor: 'var(--success)', corBg: 'var(--success-bg)'    },
]

export default function CozinhaView() {
  const { pedidos, loading, carregar, adicionarPedido, removerSeEntregue } = usePedidoStore()
  const [filtroMesa, setFiltroMesa] = useState('')
  const [agora, setAgora] = useState(Date.now())

  useEffect(() => {
    const tick = setInterval(() => setAgora(Date.now()), 60000)
    return () => clearInterval(tick)
  }, [])

  useEffect(() => {
    carregar()
    socket.connect()
    socket.emit('entrar_cozinha')

    socket.on('pedido_novo', (pedido) => {
      adicionarPedido(pedido)
      if (Notification.permission === 'granted') {
        new Notification('Novo pedido!', { body: `Mesa ${pedido.mesa}` })
      }
    })
    socket.on('pedido_atualizado', removerSeEntregue)

    return () => {
      socket.off('pedido_novo')
      socket.off('pedido_atualizado')
      socket.disconnect()
    }
  }, [])

  const filtrados = pedidos.filter((p) =>
    filtroMesa ? p.mesa.toLowerCase().includes(filtroMesa.toLowerCase()) : true
  )
  const porStatus = (status) => filtrados.filter((p) => p.status === status)

  return (
    <div className="flex flex-col h-full" style={{ fontFamily: 'DM Sans' }}>

      {/* Subheader */}
      <div className="flex items-center justify-between px-8 py-5 flex-shrink-0"
           style={{ borderBottom: '1px solid var(--border)' }}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-0.5"
             style={{ color: 'var(--brand)', letterSpacing: '0.12em' }}>
            Dashboard
          </p>
          <h2 className="font-display text-xl font-medium" style={{ color: 'var(--text-primary)' }}>
            Cozinha
          </h2>
        </div>
        <div className="flex items-center gap-3">
          {/* Indicador ao vivo */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
               style={{ background: 'var(--success-bg)', border: '1px solid var(--success)' + '33' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ background: 'var(--success)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--success)' }}>
              Ao vivo
            </span>
          </div>

          {/* Filtro mesa */}
          <input
            type="text"
            placeholder="Mesa..."
            value={filtroMesa}
            onChange={(e) => setFiltroMesa(e.target.value)}
            className="text-sm rounded-xl px-4 py-2 outline-none w-32"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              fontFamily: 'DM Sans',
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--brand)'}
            onBlur={(e)  => e.target.style.borderColor = 'var(--border)'}
          />

          {/* Notificação */}
          <button
            onClick={() => Notification.requestPermission()}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:opacity-80"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
            }}
          >
            🔔
          </button>
        </div>
      </div>

      {/* Kanban */}
      <div className="flex-1 grid grid-cols-3 gap-4 p-6 overflow-hidden">
        {COLUNAS.map(({ status, label, cor, corBg }) => {
          const lista = porStatus(status)
          return (
            <div key={status} className="flex flex-col gap-3 overflow-hidden">

              {/* Header da coluna */}
              <div className="flex items-center justify-between px-1 pb-3"
                   style={{ borderBottom: `2px solid ${cor}` }}>
                <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                  {label}
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                      style={{ background: corBg, color: cor }}>
                  {lista.length}
                </span>
              </div>

              {/* Cards */}
              <div className="overflow-y-auto space-y-3 pr-0.5">
                {lista.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-2">
                    <span style={{ fontSize: '28px', opacity: 0.3 }}>
                      {status === 'NOVO' ? '📋' : status === 'PREPARANDO' ? '👨‍🍳' : '✅'}
                    </span>
                    <p className="text-xs text-center" style={{ color: 'var(--text-hint)' }}>
                      Nenhum pedido
                    </p>
                  </div>
                ) : (
                  lista.map((pedido) => (
                    <PedidoCard key={pedido.id} pedido={pedido} agora={agora} />
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}