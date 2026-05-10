import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import socket from '../../services/socket'

const METODO_LABEL = { PIX: 'Pix 📱', CARTAO: 'Cartão 💳', DINHEIRO: 'Dinheiro 💵' }

function tempoRelativo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000)
  if (diff < 60) return `${diff}s atrás`
  if (diff < 3600) return `${Math.floor(diff / 60)}min atrás`
  return `${Math.floor(diff / 3600)}h atrás`
}

export default function DashboardHome() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [chamadas, setChamadas] = useState([])
  const [atendendo, setAtendendo] = useState(null)

  useEffect(() => {
    Promise.all([
      api.get('/pedidos'),
      api.get('/admin/usuarios'),
      api.get('/admin/menu'),
    ]).then(([pedidos, usuarios, menu]) => {
      const total = pedidos.data.reduce((acc, p) => acc + Number(p.total), 0)
      setStats({
        pedidosAbertos: pedidos.data.length,
        faturamento: total,
        usuarios: usuarios.data.length,
        itensCadapio: menu.data.length,
      })
    })

    api.get('/chamadas').then(({ data }) => setChamadas(data)).catch(() => {})
  }, [])

  useEffect(() => {
    socket.connect()
    socket.emit('entrar_cozinha')

    socket.on('garcom_chamado', (chamada) => {
      setChamadas(prev => [chamada, ...prev])
      if (Notification.permission === 'granted') {
        new Notification('🛎️ Garçom chamado!', { body: `Mesa ${chamada.mesa} · ${METODO_LABEL[chamada.metodo] ?? chamada.metodo}` })
      }
    })

    socket.on('chamada_atendida', ({ id }) => {
      setChamadas(prev => prev.filter(c => c.id !== id))
    })

    return () => {
      socket.off('garcom_chamado')
      socket.off('chamada_atendida')
      socket.disconnect()
    }
  }, [])

  const atender = async (id) => {
    setAtendendo(id)
    try {
      await api.patch(`/chamadas/${id}`)
      setChamadas(prev => prev.filter(c => c.id !== id))
    } catch {
      // silencia — o socket também remove em sucesso
    } finally {
      setAtendendo(null)
    }
  }

  const CARDS = stats ? [
    { label: 'Pedidos em aberto', valor: stats.pedidosAbertos,                                     cor: 'var(--warning)', bg: 'var(--warning-bg)', icon: '📋' },
    { label: 'Faturamento ativo', valor: `R$ ${stats.faturamento.toFixed(2).replace('.', ',')}`,   cor: 'var(--success)', bg: 'var(--success-bg)', icon: '💰' },
    { label: 'Usuários',          valor: stats.usuarios,                                            cor: 'var(--brand)',   bg: 'var(--brand-light)', icon: '👥' },
    { label: 'Itens no cardápio', valor: stats.itensCadapio,                                        cor: 'var(--brand)',   bg: 'var(--brand-light)', icon: '🍽️' },
  ] : []

  const ATALHOS = [
    { label: 'Ir para a cozinha',  desc: 'Ver pedidos em tempo real', icon: '👨‍🍳', path: '/dashboard/cozinha',  cor: 'var(--warning)' },
    { label: 'Gerenciar cardápio', desc: 'Adicionar e editar itens',  icon: '🍽️', path: '/dashboard/cardapio', cor: 'var(--success)' },
    { label: 'Gerenciar usuários', desc: 'Criar e editar acessos',    icon: '👥', path: '/dashboard/usuarios', cor: 'var(--brand)'   },
  ]

  return (
    <div className="p-4 sm:p-6 md:p-8" style={{ color: 'var(--text-primary)', fontFamily: 'DM Sans' }}>

      {/* Header */}
      <div className="mb-6 md:mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest mb-1"
           style={{ color: 'var(--brand)', letterSpacing: '0.12em' }}>
          Dashboard
        </p>
        <h1 className="font-display text-xl md:text-2xl font-medium" style={{ color: 'var(--text-primary)' }}>
          Visão geral
        </h1>
      </div>

      {/* ── Chamadas pendentes ── */}
      {chamadas.length > 0 && (
        <div className="mb-8 rounded-2xl overflow-hidden"
             style={{ border: '2px solid var(--warning)', background: 'var(--warning-bg)' }}>
          <div className="flex items-center gap-3 px-5 py-3"
               style={{ borderBottom: '1px solid var(--warning)' }}>
            <span style={{ fontSize: 18 }}>🛎️</span>
            <p className="font-bold text-sm" style={{ color: 'var(--warning)' }}>
              Garçom chamado
            </p>
            <span className="ml-auto rounded-full px-2.5 py-0.5 text-xs font-bold"
                  style={{ background: 'var(--warning)', color: '#fff' }}>
              {chamadas.length}
            </span>
          </div>
          <div className="divide-y" style={{ '--divide-color': 'var(--warning)' }}>
            {chamadas.map(c => (
              <div key={c.id} className="flex items-center gap-4 px-5 py-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                    Mesa {c.mesa}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                    {METODO_LABEL[c.metodo] ?? c.metodo} · {tempoRelativo(c.createdAt)}
                  </p>
                </div>
                <button
                  onClick={() => atender(c.id)}
                  disabled={atendendo === c.id}
                  className="rounded-xl px-4 py-2 text-sm font-semibold transition-all active:scale-[0.97]"
                  style={{
                    background: atendendo === c.id ? 'var(--border)' : 'var(--warning)',
                    color: '#fff',
                    cursor: atendendo === c.id ? 'wait' : 'pointer',
                    flexShrink: 0,
                  }}
                >
                  {atendendo === c.id ? '...' : 'Atender'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        {!stats ? (
          [1, 2, 3, 4].map(i => (
            <div key={i} className="rounded-2xl h-24 animate-pulse"
                 style={{ background: 'var(--card)' }} />
          ))
        ) : CARDS.map((card) => (
          <div key={card.label} className="rounded-2xl p-4 md:p-5 transition-all hover:scale-[1.02] active:scale-[0.98]"
               style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs leading-tight" style={{ color: 'var(--text-secondary)', maxWidth: '70%' }}>
                {card.label}
              </p>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                   style={{ background: card.bg }}>
                {card.icon}
              </div>
            </div>
            <p className="font-display text-xl md:text-2xl font-medium" style={{ color: card.cor }}>
              {card.valor}
            </p>
          </div>
        ))}
      </div>

      {/* Atalhos */}
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-widest"
           style={{ color: 'var(--text-hint)', letterSpacing: '0.1em' }}>
          Acesso rápido
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        {ATALHOS.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="flex items-start gap-4 p-5 rounded-2xl text-left transition-all hover:scale-[1.02] active:scale-[0.98] group"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{
              position: 'absolute', left: 0, top: 0, bottom: 0,
              width: 3, background: item.cor, borderRadius: '3px 0 0 3px',
            }} />

            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 transition-transform group-hover:scale-110"
                 style={{ background: item.cor + '18' }}>
              {item.icon}
            </div>
            <div>
              <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                {item.label}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                {item.desc}
              </p>
              <p className="text-xs mt-2 font-semibold transition-opacity opacity-0 group-hover:opacity-100"
                 style={{ color: item.cor }}>
                Acessar →
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
