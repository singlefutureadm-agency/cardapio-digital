import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import socket from '../../services/socket'
import api from '../../services/api'
import usePedidoStore from '../../store/usePedidoStore'
import PedidoCard from '../../components/PedidoCard'

const COLUNAS = [
  { status: 'NOVO',       label: 'Novos pedidos',     icon: '📋', cor: 'var(--brand)',   corBg: 'var(--brand-light)'  },
  { status: 'PREPARANDO', label: 'Em preparo',         icon: '👨‍🍳', cor: 'var(--warning)', corBg: 'var(--warning-bg)'   },
  { status: 'PRONTO',     label: 'Pronto p/ entrega',  icon: '✅', cor: 'var(--success)', corBg: 'var(--success-bg)'   },
]

const METODO_LABEL = { PIX: '📱 Pix', CARTAO: '💳 Cartão', DINHEIRO: '💵 Dinheiro' }

// Beep simples via Web Audio API — sem arquivos externos
function beep(freq = 880, duration = 0.15, repeats = 1, gap = 0.25) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    for (let i = 0; i < repeats; i++) {
      const osc  = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.value = freq
      const t0 = ctx.currentTime + i * gap
      gain.gain.setValueAtTime(0.3, t0)
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration)
      osc.start(t0)
      osc.stop(t0 + duration)
    }
  } catch {}
}

function tempoRelativo(iso) {
  const s = Math.floor((Date.now() - new Date(iso)) / 1000)
  if (s < 60) return `${s}s`
  if (s < 3600) return `${Math.floor(s / 60)}min`
  return `${Math.floor(s / 3600)}h`
}

export default function CozinhaView() {
  const { pedidos, loading, carregar, adicionarPedido, removerSeEntregue } = usePedidoStore()
  const navigate                      = useNavigate()
  const [filtroMesa, setFiltroMesa]   = useState('')
  const [agora, setAgora]             = useState(Date.now())
  const [chamadas, setChamadas]       = useState([])
  const [toast, setToast]             = useState(null)
  const [abaAtiva, setAbaAtiva]       = useState('NOVO')
  const toastRef                      = useRef(null)

  // Timer 30s para atualizar os temporizadores dos cards
  useEffect(() => {
    const tick = setInterval(() => setAgora(Date.now()), 30000)
    return () => clearInterval(tick)
  }, [])

  const showToast = (tipo, msg) => {
    clearTimeout(toastRef.current)
    setToast({ tipo, msg, key: Date.now() })
    toastRef.current = setTimeout(() => setToast(null), 5000)
  }

  useEffect(() => {
    if (Notification.permission === 'default') Notification.requestPermission()

    carregar()
    api.get('/chamadas').then(({ data }) => setChamadas(data)).catch(() => {})

    socket.connect()
    socket.emit('entrar_cozinha')

    socket.on('pedido_novo', (pedido) => {
      adicionarPedido(pedido)
      beep(880, 0.18, 1)
      showToast('pedido', `Novo pedido — Mesa ${pedido.mesa}`)
      if (Notification.permission === 'granted')
        new Notification('🍽️ Novo pedido!', { body: `Mesa ${pedido.mesa}` })
    })

    socket.on('pedido_atualizado', removerSeEntregue)

    socket.on('garcom_chamado', (chamada) => {
      setChamadas(prev => [chamada, ...prev])
      beep(660, 0.2, 2, 0.3) // 2 beeps distintos para garçom
      showToast('garcom', `Mesa ${chamada.mesa} chamou o garçom — ${METODO_LABEL[chamada.metodo] ?? chamada.metodo}`)
      if (Notification.permission === 'granted')
        new Notification('🛎️ Garçom chamado!', { body: `Mesa ${chamada.mesa} · ${METODO_LABEL[chamada.metodo] ?? chamada.metodo}` })
    })

    socket.on('chamada_atendida', ({ id }) => {
      setChamadas(prev => prev.filter(c => c.id !== id))
    })

    return () => {
      socket.off('pedido_novo')
      socket.off('pedido_atualizado')
      socket.off('garcom_chamado')
      socket.off('chamada_atendida')
      socket.disconnect()
      clearTimeout(toastRef.current)
    }
  }, [])

  const filtrados  = pedidos.filter(p =>
    filtroMesa ? p.mesa.toLowerCase().includes(filtroMesa.toLowerCase()) : true
  )
  const porStatus = (s) => filtrados.filter(p => p.status === s)
  const totalAtivos = pedidos.length

  return (
    <div className="flex flex-col h-full" style={{ fontFamily: 'DM Sans', position: 'relative', overflow: 'hidden' }}>

      {/* ── Toast ── */}
      {toast && (
        <div key={toast.key}
             className="absolute top-4 right-4 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl cozinha-toast"
             style={{
               background: toast.tipo === 'garcom' ? 'var(--warning)' : 'var(--brand)',
               color: '#fff',
               boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
               maxWidth: 340,
             }}>
          <span style={{ fontSize: 22, flexShrink: 0 }}>
            {toast.tipo === 'garcom' ? '🛎️' : '🍽️'}
          </span>
          <span className="text-sm font-semibold leading-snug flex-1">{toast.msg}</span>
          <button onClick={() => setToast(null)}
                  style={{ opacity: 0.75, fontSize: 18, flexShrink: 0, lineHeight: 1 }}>
            ✕
          </button>
        </div>
      )}

      {/* ── Subheader ── */}
      <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 flex-shrink-0"
           style={{ borderBottom: '1px solid var(--border)' }}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-0.5"
             style={{ color: 'var(--brand)', letterSpacing: '0.12em' }}>
            Dashboard
          </p>
          <div className="flex items-center gap-3">
            <h2 className="font-display text-xl font-medium" style={{ color: 'var(--text-primary)' }}>
              Cozinha
            </h2>
            {totalAtivos > 0 && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                    style={{ background: 'var(--brand-light)', color: 'var(--brand)' }}>
                {totalAtivos} ativo{totalAtivos !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
               style={{ background: 'var(--success-bg)', border: '1px solid rgba(52,211,153,0.3)' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--success)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--success)' }}>Ao vivo</span>
          </div>

          <input
            type="text"
            placeholder="Filtrar mesa..."
            value={filtroMesa}
            onChange={(e) => setFiltroMesa(e.target.value)}
            className="text-sm rounded-xl px-3 py-2 outline-none w-36 transition-colors"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontFamily: 'DM Sans' }}
            onFocus={e  => e.target.style.borderColor = 'var(--brand)'}
            onBlur={e   => e.target.style.borderColor = 'var(--border)'}
          />
        </div>
      </div>

      {/* ── Chamadas de garçom ── */}
      {chamadas.length > 0 && (
        <div className="flex-shrink-0 mx-4 md:mx-6 mt-3 md:mt-4 rounded-2xl overflow-hidden"
             style={{ border: '2px solid var(--warning)' }}>

          <div className="flex items-center gap-2 px-4 py-2.5 flex-shrink-0"
               style={{ background: 'var(--warning-bg)', borderBottom: '1px solid rgba(245,158,11,0.25)' }}>
            <span style={{ fontSize: 16 }}>🛎️</span>
            <p className="font-bold text-sm" style={{ color: 'var(--warning)' }}>
              Chamadas de Garçom
            </p>
            <span className="ml-1 text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: 'var(--warning)', color: '#fff' }}>
              {chamadas.length}
            </span>
            <p className="ml-auto text-xs" style={{ color: 'var(--text-hint)' }}>
              Clique em Atender quando o garçom for à mesa
            </p>
          </div>

          <div style={{ background: 'var(--card)' }}>
            {chamadas.map((c, i) => (
              <div key={c.id}
                   className="flex items-center gap-4 px-4 py-3"
                   style={{ borderTop: i === 0 ? 'none' : '1px solid var(--border)' }}>

                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base flex-shrink-0"
                     style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}>
                  {c.mesa}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                    Mesa {c.mesa}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                    {METODO_LABEL[c.metodo] ?? c.metodo}
                    <span className="mx-1.5" style={{ color: 'var(--border)' }}>·</span>
                    há {tempoRelativo(c.createdAt)}
                  </p>
                </div>

                <button
                  onClick={() => navigate('/dashboard/pagamentos')}
                  className="rounded-xl px-5 py-2.5 text-sm font-bold transition-all active:scale-[0.96] flex-shrink-0"
                  style={{ background: 'var(--warning)', color: '#fff' }}
                >
                  🧾 Fechar conta
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Mobile column tabs ── */}
      <div className="flex md:hidden flex-shrink-0 px-4 pt-3 pb-2 gap-2"
           style={{ borderBottom: '1px solid var(--border)' }}>
        {COLUNAS.map(col => {
          const count = porStatus(col.status).length
          const ativa = abaAtiva === col.status
          return (
            <button key={col.status} onClick={() => setAbaAtiva(col.status)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all"
                    style={ativa
                      ? { background: col.cor, color: '#fff' }
                      : { background: 'var(--panel)', color: 'var(--text-secondary)' }}>
              <span>{col.icon}</span>
              <span>{col.label.split(' ')[0]}</span>
              {count > 0 && (
                <span className="px-1.5 py-0.5 rounded-full"
                      style={{ background: ativa ? 'rgba(255,255,255,0.25)' : col.corBg,
                               color: ativa ? '#fff' : col.cor, fontSize: 10 }}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* ── Kanban ── */}
      <div className="flex-1 flex flex-col md:grid md:grid-cols-3 gap-4 p-4 md:p-6 min-h-0">
        {COLUNAS.map(({ status, label, icon, cor, corBg }) => {
          const lista = porStatus(status)
          return (
            <div key={status}
                 className={`flex-col rounded-2xl overflow-hidden flex-1 ${abaAtiva === status ? 'flex' : 'hidden md:flex'}`}
                 style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>

              {/* Header da coluna */}
              <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
                   style={{ borderBottom: `2px solid ${cor}` }}>
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 16 }}>{icon}</span>
                  <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                    {label}
                  </span>
                </div>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                      style={{ background: corBg, color: cor }}>
                  {lista.length}
                </span>
              </div>

              {/* Cards com scroll */}
              <div className="overflow-y-auto flex-1 p-3 space-y-3">
                {loading ? (
                  [1, 2].map(i => (
                    <div key={i} className="h-28 rounded-xl animate-pulse"
                         style={{ background: 'var(--card)' }} />
                  ))
                ) : lista.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full py-16 gap-2"
                       style={{ opacity: 0.35 }}>
                    <span style={{ fontSize: 36 }}>{icon}</span>
                    <p className="text-xs font-medium" style={{ color: 'var(--text-hint)' }}>
                      Nenhum pedido
                    </p>
                  </div>
                ) : (
                  lista.map(pedido => (
                    <PedidoCard key={pedido.id} pedido={pedido} agora={agora} />
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>

      <style>{`
        .cozinha-toast {
          animation: cozinha-slide-in 0.3s cubic-bezier(0.34,1.56,0.64,1);
        }
        @keyframes cozinha-slide-in {
          from { opacity: 0; transform: translateX(24px) scale(0.95); }
          to   { opacity: 1; transform: translateX(0)  scale(1);    }
        }
      `}</style>
    </div>
  )
}
