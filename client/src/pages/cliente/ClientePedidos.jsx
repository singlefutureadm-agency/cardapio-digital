import { useEffect, useState, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../services/api'
import socket from '../../services/socket'

const STATUS = {
  NOVO:       { label: 'Recebido',   icon: '📋', cor: 'var(--brand)',    bg: 'var(--brand-light)', pulsa: true  },
  PREPARANDO: { label: 'Preparando', icon: '👨‍🍳', cor: 'var(--warning)', bg: 'var(--warning-bg)',  pulsa: true  },
  PRONTO:     { label: 'Pronto!',    icon: '✅',  cor: 'var(--success)', bg: 'var(--success-bg)',  pulsa: false },
  ENTREGUE:   { label: 'Entregue',   icon: '🎉',  cor: 'var(--text-hint)', bg: 'var(--surface)',   pulsa: false },
  CANCELADO:  { label: 'Cancelado',  icon: '❌',  cor: 'var(--danger)',   bg: 'var(--danger-bg)',  pulsa: false },
}

const ATIVOS    = ['NOVO', 'PREPARANDO', 'PRONTO']
const FINALIZADOS = ['ENTREGUE', 'CANCELADO']

function CardPedido({ pedido }) {
  const cfg = STATUS[pedido.status] ?? STATUS.NOVO
  return (
    <div className="rounded-2xl overflow-hidden"
         style={{ background: 'var(--card)', border: `1.5px solid ${cfg.cor}22` }}>

      {/* Cabeçalho status */}
      <div className="flex items-center justify-between px-4 py-3"
           style={{ background: cfg.bg, borderBottom: `1px solid ${cfg.cor}22` }}>
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 18 }}>{cfg.icon}</span>
          <span className="font-semibold text-sm" style={{ color: cfg.cor }}>
            {cfg.label}
          </span>
          {cfg.pulsa && (
            <span className="w-1.5 h-1.5 rounded-full animate-pulse flex-shrink-0"
                  style={{ background: cfg.cor }} />
          )}
        </div>
        <span className="text-xs font-medium" style={{ color: 'var(--text-hint)' }}>
          #{pedido.id} · {new Date(pedido.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {/* Itens */}
      <div className="px-4 py-3 space-y-2">
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

        <div className="flex justify-between items-center pt-2 mt-1"
             style={{ borderTop: '1px solid var(--border)' }}>
          <span className="text-xs" style={{ color: 'var(--text-hint)' }}>Subtotal</span>
          <span className="font-semibold text-sm" style={{ color: 'var(--brand)' }}>
            R$ {Number(pedido.total).toFixed(2).replace('.', ',')}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function ClientePedidos() {
  const { mesa } = useParams()
  const navigate = useNavigate()
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)

  // Busca todos os pedidos do usuário nesta mesa, sem filtro de sessão
  const carregarPedidos = useCallback(() => {
    api.get('/cliente/pedidos').then(({ data }) => {
      setPedidos(data.filter(p => p.mesa === mesa))
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [mesa])

  useEffect(() => { carregarPedidos() }, [carregarPedidos])

  // Socket — atualizações de status em tempo real
  useEffect(() => {
    socket.connect()
    socket.emit('entrar_mesa', mesa)

    socket.on('status_atualizado', ({ pedidoId, status }) => {
      setPedidos(prev =>
        prev.map(p => Number(p.id) === Number(pedidoId) ? { ...p, status } : p)
      )
    })

    // Quando o admin fecha a conta, recarrega da API para mostrar status atualizado
    socket.on('mesa_fechada', () => { carregarPedidos() })

    return () => {
      socket.off('status_atualizado')
      socket.off('mesa_fechada')
      socket.disconnect()
    }
  }, [mesa, carregarPedidos])

  const ativos     = pedidos.filter(p => ATIVOS.includes(p.status))
  const historico  = pedidos.filter(p => FINALIZADOS.includes(p.status))
  const totalAtivo = ativos.reduce((acc, p) => acc + Number(p.total), 0)

  if (loading) return (
    <div className="space-y-3 pt-2">
      {[1, 2].map(i => (
        <div key={i} className="h-32 rounded-2xl animate-pulse" style={{ background: 'var(--card)' }} />
      ))}
    </div>
  )

  return (
    <div className="pt-2 pb-6">

      {/* Header */}
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-widest mb-1"
           style={{ color: 'var(--brand)', letterSpacing: '0.12em' }}>
          Mesa {mesa}
        </p>
        <h2 className="font-display text-xl font-medium" style={{ color: 'var(--text-primary)' }}>
          Meus pedidos
        </h2>
        {ativos.length > 0 && (
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--brand)' }} />
            <span className="text-xs" style={{ color: 'var(--text-hint)' }}>
              Atualizando em tempo real
            </span>
          </div>
        )}
      </div>

      {/* Estado vazio */}
      {pedidos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <span style={{ fontSize: '48px' }}>🍽️</span>
          <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
            Nenhum pedido ainda
          </p>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Adicione itens ao carrinho e envie para a cozinha
          </p>
          <button
            onClick={() => navigate('../cardapio')}
            className="mt-2 px-6 py-3 rounded-xl text-sm font-semibold"
            style={{ background: 'var(--brand)', color: '#fff' }}
          >
            Ver cardápio
          </button>
        </div>
      ) : (
        <div className="space-y-5">

          {/* ── Pedidos em andamento ── */}
          {ativos.length > 0 && (
            <section>
              <p className="text-xs font-semibold uppercase tracking-widest mb-3"
                 style={{ color: 'var(--text-hint)', letterSpacing: '0.1em' }}>
                Em andamento
              </p>
              <div className="space-y-3">
                {ativos.map(pedido => (
                  <CardPedido key={pedido.id} pedido={pedido} />
                ))}
              </div>

              {/* Total do aberto */}
              <div className="rounded-2xl px-4 py-3.5 flex items-center justify-between mt-3"
                   style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                  Total em aberto
                </span>
                <span className="font-display text-xl font-medium" style={{ color: 'var(--brand)' }}>
                  R$ {totalAtivo.toFixed(2).replace('.', ',')}
                </span>
              </div>

              {/* Pedir mais */}
              <button
                onClick={() => navigate('../cardapio')}
                className="w-full rounded-2xl py-3.5 text-sm font-semibold transition-all active:scale-[0.98] mt-3"
                style={{ background: 'var(--surface)', border: '1.5px dashed var(--border)', color: 'var(--text-secondary)' }}
              >
                + Pedir mais itens
              </button>
            </section>
          )}

          {/* ── Histórico ── */}
          {historico.length > 0 && (
            <section>
              <p className="text-xs font-semibold uppercase tracking-widest mb-3"
                 style={{ color: 'var(--text-hint)', letterSpacing: '0.1em' }}>
                Histórico
              </p>
              <div className="space-y-3">
                {historico.map(pedido => (
                  <CardPedido key={pedido.id} pedido={pedido} />
                ))}
              </div>
            </section>
          )}

          {/* Se só tem histórico (sem ativos), botão para pedir de novo */}
          {ativos.length === 0 && historico.length > 0 && (
            <button
              onClick={() => navigate('../cardapio')}
              className="w-full rounded-2xl py-3.5 text-sm font-semibold transition-all active:scale-[0.98]"
              style={{ background: 'var(--surface)', border: '1.5px dashed var(--border)', color: 'var(--text-secondary)' }}
            >
              + Fazer novo pedido
            </button>
          )}
        </div>
      )}

      {/* Chamar Garçom — só aparece quando há pedidos em aberto */}
      {ativos.length > 0 && (
        <div className="mt-6 rounded-2xl overflow-hidden"
             style={{ border: '2px solid var(--warning)' }}>
          <div className="px-4 py-3" style={{ background: 'var(--warning-bg)' }}>
            <p className="text-xs font-semibold" style={{ color: 'var(--warning)' }}>
              Quando terminar de pedir
            </p>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              Chame o garçom para fechar a conta e escolher a forma de pagamento.
            </p>
          </div>
          <button
            onClick={() => navigate('../checkout')}
            className="w-full py-4 font-bold text-base transition-all active:scale-[0.98] no-glass"
            style={{ background: 'var(--warning)', color: '#fff' }}
          >
            🛎️ Chamar Garçom para finalizar
          </button>
        </div>
      )}

    </div>
  )
}
