import { useEffect, useState } from 'react'
import socket from '../services/socket'
import usePedidoStore from '../store/usePedidoStore'
import PedidoCard from '../components/PedidoCard'
import { useAuth } from '../context/AuthContext'


const COLUNAS = [
  {
    status: 'NOVO',
    label: 'Novos pedidos',
    acento: '#3B82F6',
    acentoBg: 'rgba(59,130,246,0.1)',
  },
  {
    status: 'PREPARANDO',
    label: 'Em preparo',
    acento: '#F59E0B',
    acentoBg: 'rgba(245,158,11,0.1)',
  },
  {
    status: 'PRONTO',
    label: 'Pronto p/ entrega',
    acento: '#10B981',
    acentoBg: 'rgba(16,185,129,0.1)',
  },
]

export default function Cozinha() {
  const { user, logout } = useAuth()
  const { pedidos, loading, carregar, adicionarPedido, removerSeEntregue } = usePedidoStore()
  const [filtroMesa, setFiltroMesa] = useState('')
  const [agora, setAgora] = useState(Date.now())

  // Atualiza timers a cada minuto
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: '#0F0F0D' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
          <p className="text-sm" style={{ color: '#6B6B60' }}>Carregando pedidos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0F0F0D', fontFamily: 'DM Sans' }}>
      {/* Header */}
      <header style={{ background: '#1A1A17', borderBottom: '1px solid #2A2A26' }}
              className="px-6 py-4 flex items-center justify-between gap-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span style={{ color: '#C8520A', fontSize: '16px' }}>🍽️</span>
              <h1 className="font-display text-lg font-medium" style={{ color: '#F5F4F0' }}>
                Cozinha
              </h1>
            </div>
            <p className="text-xs mt-0.5" style={{ color: '#6B6B60' }}>
              {pedidos.length} pedido{pedidos.length !== 1 ? 's' : ''} em aberto
            </p>
          </div>

          {/* Status conectado */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
               style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-medium" style={{ color: '#34D399' }}>Ao vivo</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Mesa..."
              value={filtroMesa}
              onChange={(e) => setFiltroMesa(e.target.value)}
              className="text-sm rounded-xl px-4 py-2 outline-none w-36"
              style={{
                background: '#2A2A26',
                border: '1px solid #3A3A36',
                color: '#F5F4F0',
                fontFamily: 'DM Sans',
              }}
            />
          </div>
          <button
            onClick={() => Notification.requestPermission()}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-base transition-colors"
            style={{ background: '#2A2A26', border: '1px solid #3A3A36', color: '#A8A8A0' }}
            title="Ativar notificações"
          >
            🔔
          </button>
            <span className="text-sm hidden sm:block" style={{ color: '#6B6B60' }}>
            {user?.nome}
            </span>
            <button
            onClick={logout}
            className="text-xs px-3 py-2 rounded-xl transition-colors"
            style={{ background: '#2A2A26', border: '1px solid #3A3A36', color: '#A8A8A0' }}
            >
            Sair
            </button>

        </div>
      </header>

      {/* Kanban */}
      <div className="flex-1 grid grid-cols-3 gap-4 p-5 overflow-hidden">
        {COLUNAS.map(({ status, label, acento, acentoBg }) => {
          const lista = porStatus(status)
          return (
            <div key={status} className="flex flex-col gap-3 overflow-hidden">
              {/* Cabeçalho da coluna */}
              <div className="flex items-center justify-between px-1 pb-3"
                   style={{ borderBottom: `2px solid ${acento}` }}>
                <span className="font-semibold text-sm" style={{ color: '#F5F4F0' }}>
                  {label}
                </span>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: acentoBg, color: acento }}
                >
                  {lista.length}
                </span>
              </div>

              {/* Lista */}
              <div className="overflow-y-auto space-y-3 pr-0.5">
                {lista.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-2">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                         style={{ background: '#1A1A17' }}>
                      —
                    </div>
                    <p className="text-xs text-center" style={{ color: '#4A4A46' }}>
                      Nenhum pedido aqui
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