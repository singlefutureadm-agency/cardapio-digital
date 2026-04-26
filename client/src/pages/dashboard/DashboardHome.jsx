import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

export default function DashboardHome() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)

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
  }, [])

  const CARDS = stats ? [
    { label: 'Pedidos em aberto', valor: stats.pedidosAbertos,                                     cor: 'var(--warning)', bg: 'var(--warning-bg)' },
    { label: 'Faturamento ativo', valor: `R$ ${stats.faturamento.toFixed(2).replace('.', ',')}`,   cor: 'var(--success)', bg: 'var(--success-bg)' },
    { label: 'Usuários',          valor: stats.usuarios,                                            cor: 'var(--brand)',   bg: 'var(--brand-light)' },
    { label: 'Itens no cardápio', valor: stats.itensCadapio,                                        cor: 'var(--brand)',   bg: 'var(--brand-light)' },
  ] : []

  const ATALHOS = [
    { label: 'Ir para a cozinha',  desc: 'Ver pedidos em tempo real', icon: '👨‍🍳', path: '/dashboard/cozinha',  cor: 'var(--warning)' },
    { label: 'Gerenciar cardápio', desc: 'Adicionar e editar itens',  icon: '🍽️', path: '/dashboard/cardapio', cor: 'var(--success)' },
    { label: 'Gerenciar usuários', desc: 'Criar e editar acessos',    icon: '👥', path: '/dashboard/usuarios', cor: 'var(--brand)'   },
  ]

  return (
    <div className="p-8" style={{ color: 'var(--text-primary)', fontFamily: 'DM Sans' }}>

      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest mb-1"
           style={{ color: 'var(--brand)', letterSpacing: '0.12em' }}>
          Dashboard
        </p>
        <h1 className="font-display text-2xl font-medium" style={{ color: 'var(--text-primary)' }}>
          Visão geral
        </h1>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {!stats ? (
          [1, 2, 3, 4].map(i => (
            <div key={i} className="rounded-2xl h-24 animate-pulse"
                 style={{ background: 'var(--card)' }} />
          ))
        ) : CARDS.map((card) => (
          <div key={card.label} className="rounded-2xl p-5 transition-all hover:scale-[1.02]"
               style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full" style={{ background: card.cor }} />
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{card.label}</p>
            </div>
            <p className="font-display text-2xl font-medium" style={{ color: card.cor }}>
              {card.valor}
            </p>
          </div>
        ))}
      </div>

      {/* Atalhos */}
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-widest"
           style={{ color: 'var(--text-hint)', letterSpacing: '0.1em' }}>
          Acesso rápido
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
            {/* Linha de acento na borda esquerda */}
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