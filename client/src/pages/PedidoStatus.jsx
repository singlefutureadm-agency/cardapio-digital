import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import socket from '../services/socket'

const ETAPAS = [
  { status: 'NOVO',       label: 'Recebido', icone: '📋' },
  { status: 'PREPARANDO', label: 'Preparo',  icone: '👨‍🍳' },
  { status: 'PRONTO',     label: 'Pronto',   icone: '✅' },
  { status: 'ENTREGUE',   label: 'Entregue', icone: '🎉' },
]

const MENSAGENS = {
  NOVO:      { titulo: 'Pedido recebido!',     subtitulo: 'Sua mesa foi notificada, a cozinha logo começa o preparo.' },
  PREPARANDO:{ titulo: 'Em preparo 👨‍🍳',        subtitulo: 'O chef está preparando seu pedido com cuidado.' },
  PRONTO:    { titulo: 'Saindo da cozinha!',   subtitulo: 'Seu pedido está pronto e a caminho da sua mesa.' },
  ENTREGUE:  { titulo: 'Bom apetite! 🎉',      subtitulo: 'Esperamos que aproveite cada garfada.' },
  CANCELADO: { titulo: 'Pedido cancelado',     subtitulo: 'Entre em contato com o garçom se precisar de ajuda.' },
}

export default function PedidoStatus() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const mesa = searchParams.get('mesa')
  const [pedido, setPedido] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/pedidos/${id}`).then(({ data }) => {
      setPedido(data)
      setLoading(false)
    })

    socket.connect()
    socket.emit('entrar_mesa', mesa)
    socket.on('status_atualizado', ({ pedidoId, status }) => {
      if (Number(pedidoId) === Number(id)) {
        setPedido((prev) => prev ? { ...prev, status } : prev)
      }
    })

    return () => {
      socket.off('status_atualizado')
      socket.disconnect()
    }
  }, [id, mesa])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: 'var(--surface)' }}>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
             style={{ borderColor: 'var(--brand)', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  if (!pedido) return null

  const etapaAtual = ETAPAS.findIndex((e) => e.status === pedido.status)
  const cancelado  = pedido.status === 'CANCELADO'
  const msg        = MENSAGENS[pedido.status]

  return (
    <div className="min-h-screen" style={{ background: 'var(--surface)' }}>

      {/* ── Header com navegação ── */}
      <header style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-lg mx-auto px-5 py-3 flex items-center justify-between">

          {/* Voltar + título */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/cliente/${mesa}`)}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)',
                       color: 'var(--text-secondary)' }}
            >
              ←
            </button>
            <div>
              <p className="text-xs font-medium uppercase tracking-widest"
                 style={{ color: 'var(--brand)', letterSpacing: '0.1em' }}>
                Mesa {mesa}
              </p>
              <h1 className="font-display text-base font-medium" style={{ color: 'var(--text-primary)' }}>
                Pedido #{pedido.id}
              </h1>
            </div>
          </div>

          {/* Atalhos */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/cliente/${mesa}/cardapio`)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:scale-[1.03]"
              style={{ background: 'var(--brand-light)', color: 'var(--brand)' }}
            >
              Cardápio
            </button>
            <button
              onClick={() => navigate(`/cliente/${mesa}/pedidos`)}
              className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)',
                       color: 'var(--text-secondary)' }}
            >
              Pedidos
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-5 pt-5 pb-10 space-y-4">

        {/* Status principal */}
        <div className="rounded-3xl p-6 text-center"
             style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4"
               style={{ background: cancelado ? 'var(--danger-bg)' : 'var(--brand-light)' }}>
            {cancelado ? '❌' : ETAPAS[Math.max(etapaAtual, 0)]?.icone}
          </div>
          <h2 className="font-display text-xl font-medium" style={{ color: 'var(--text-primary)' }}>
            {msg.titulo}
          </h2>
          <p className="text-sm mt-1.5" style={{ color: 'var(--text-secondary)' }}>
            {msg.subtitulo}
          </p>
          {!cancelado && pedido.status !== 'ENTREGUE' && (
            <div className="flex items-center justify-center gap-1.5 mt-3">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--brand)' }} />
              <span className="text-xs" style={{ color: 'var(--text-hint)' }}>Atualizando em tempo real</span>
            </div>
          )}
        </div>

        {/* Linha do tempo */}
        {!cancelado && (
          <div className="rounded-2xl p-4"
               style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <p className="text-xs font-medium uppercase tracking-widest mb-4"
               style={{ color: 'var(--text-hint)', letterSpacing: '0.1em' }}>
              Acompanhamento
            </p>
            <div className="flex items-start justify-between relative">
              <div className="absolute top-4 left-0 right-0 h-px"
                   style={{ background: 'var(--border)', zIndex: 0 }} />
              <div className="absolute top-4 left-0 h-px transition-all duration-700"
                   style={{
                     background: 'var(--brand)',
                     width: etapaAtual >= 0 ? `${(etapaAtual / (ETAPAS.length - 1)) * 100}%` : '0%',
                     zIndex: 1,
                   }} />
              {ETAPAS.map((etapa, idx) => {
                const ativa = idx <= etapaAtual
                const atual = idx === etapaAtual
                return (
                  <div key={etapa.status}
                       className="flex flex-col items-center gap-2 relative z-10"
                       style={{ flex: 1 }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-500"
                         style={ativa
                           ? { background: 'var(--brand)', color: '#fff',
                               boxShadow: atual ? '0 0 0 4px var(--brand-light)' : 'none' }
                           : { background: 'var(--border)', color: 'var(--text-hint)' }}>
                      {ativa ? (idx < etapaAtual ? '✓' : idx + 1) : idx + 1}
                    </div>
                    <span className="text-[11px] text-center font-medium"
                          style={{ color: ativa ? 'var(--brand)' : 'var(--text-hint)' }}>
                      {etapa.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Itens */}
        <div className="rounded-2xl p-4"
             style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <p className="text-xs font-medium uppercase tracking-widest mb-3"
             style={{ color: 'var(--text-hint)', letterSpacing: '0.1em' }}>
            Itens pedidos
          </p>
          <ul className="space-y-2.5">
            {pedido.itens.map((item) => (
              <li key={item.id} className="flex justify-between text-sm">
                <span style={{ color: 'var(--text-secondary)' }}>
                  {item.quantidade}× {item.menuItem.nome}
                  {item.observacao && (
                    <span className="ml-1 italic text-xs" style={{ color: 'var(--text-hint)' }}>
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
          <div className="flex justify-between items-center mt-3 pt-3"
               style={{ borderTop: '1px solid var(--border)' }}>
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Total</span>
            <span className="font-display text-lg font-medium" style={{ color: 'var(--brand)' }}>
              R$ {Number(pedido.total).toFixed(2).replace('.', ',')}
            </span>
          </div>
        </div>

        {/* Pagamento */}
        {pedido.pagamento && (
          <div className="rounded-2xl px-4 py-3.5 flex items-center justify-between"
               style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2.5">
              <span style={{ fontSize: '18px' }}>
                {pedido.pagamento.tipo === 'ONLINE' ? '💳' : '🧾'}
              </span>
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {pedido.pagamento.tipo === 'ONLINE' ? 'Pago online' : 'Com o garçom'}
              </span>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={pedido.pagamento.status === 'PAGO'
                    ? { background: 'var(--success-bg)', color: 'var(--success)' }
                    : { background: 'var(--warning-bg)', color: 'var(--warning)' }}>
              {pedido.pagamento.status === 'PAGO' ? 'Pago' : 'Pendente'}
            </span>
          </div>
        )}

        {/* CTA — fazer novo pedido */}
        {(pedido.status === 'ENTREGUE' || pedido.status === 'CANCELADO') && (
          <button
            onClick={() => navigate(`/cliente/${mesa}/cardapio`)}
            className="w-full py-4 rounded-2xl font-semibold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: 'var(--brand)', color: '#fff',
                     boxShadow: '0 4px 20px rgba(200,82,10,0.3)' }}
          >
            Fazer novo pedido →
          </button>
        )}
      </main>
    </div>
  )
}