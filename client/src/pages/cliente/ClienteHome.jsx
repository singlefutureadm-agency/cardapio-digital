import { useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import gsap from 'gsap'
import CalendarioShows from './CalendarioShows'

export default function ClienteHome() {
  const { user } = useAuth()
  const { features } = useTheme()
  const { mesa } = useParams()
  const navigate = useNavigate()
  const ref = useRef(null)

  useEffect(() => {
    gsap.fromTo(ref.current.children,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out' })
  }, [])

  const hora = new Date().getHours()
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'

  return (
    <div ref={ref} className="space-y-4 pt-2">

      {/* Hero — saudação imersiva */}
      <div className="rounded-3xl overflow-hidden no-glass"
           style={{ background: 'var(--brand)', position: 'relative', minHeight: 148 }}>
        {/* Padrão de pontos */}
        <div className="absolute inset-0 pointer-events-none"
             style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.09) 1px, transparent 1px)',
                      backgroundSize: '20px 20px' }} />
        {/* Gradiente sobre o padrão */}
        <div className="absolute inset-0 pointer-events-none"
             style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.2) 100%)' }} />
        <div className="relative p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-white" style={{ opacity: 0.85 }}>
                {saudacao}! 👋
              </p>
              <h1 className="font-display text-3xl font-semibold text-white mt-0.5 leading-tight">
                {user?.nome.split(' ')[0]}
              </h1>
              <p className="text-sm text-white mt-2" style={{ opacity: 0.75 }}>
                Mesa {mesa} · Bem-vindo ao restaurante
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                 style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}>
              🍽
            </div>
          </div>
          {/* CTA direto */}
          <button
            onClick={() => navigate('cardapio')}
            className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95"
            style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)' }}
          >
            <span>Ver cardápio</span>
            <span style={{ fontSize: 12 }}>→</span>
          </button>
        </div>
      </div>

      {/* Chamar Garçom — destaque */}
      <button
        onClick={() => navigate('checkout')}
        className="w-full rounded-2xl p-4 flex items-center gap-4 text-left transition-all hover:scale-[1.01] active:scale-[0.98] no-glass"
        style={{ background: 'var(--warning-bg)', border: '2px solid var(--warning)' }}
      >
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
             style={{ background: 'var(--warning)', color: '#fff' }}>
          🛎️
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm" style={{ color: 'var(--warning)' }}>Chamar Garçom</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Quando terminar de pedir, chame para finalizar e pagar
          </p>
        </div>
        <span style={{ color: 'var(--warning)', fontSize: 18 }}>→</span>
      </button>

      {/* Ações rápidas */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Ver cardápio', desc: 'Explore nossos pratos', icon: '🍽️', path: 'cardapio', bg: 'var(--brand-light)',  cor: 'var(--brand)',        borderCor: 'var(--brand)' },
          { label: 'Meus pedidos', desc: 'Histórico e status',    icon: '📋', path: 'pedidos',  bg: 'var(--card)',         cor: 'var(--text-primary)', borderCor: 'var(--border)' },
          { label: 'Meu perfil',   desc: 'Dados da conta',        icon: '👤', path: 'perfil',   bg: 'var(--card)',         cor: 'var(--text-primary)', borderCor: 'var(--border)' },
          { label: 'Pedir agora',  desc: 'Pedido rápido',         icon: '⚡', path: 'cardapio', bg: 'var(--surface)',      cor: 'var(--text-primary)', borderCor: 'var(--border)' },
        ].map(({ label, desc, icon, path, bg, cor, borderCor }) => (
          <button key={label}
                  onClick={() => navigate(path)}
                  className="flex flex-col items-start p-4 rounded-2xl text-left transition-all hover:scale-[1.02] active:scale-[0.97]"
                  style={{ background: bg, border: `1px solid ${borderCor}` }}>
            <span style={{ fontSize: '22px', marginBottom: '8px' }}>{icon}</span>
            <p className="font-bold text-sm" style={{ color: cor }}>{label}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-hint)' }}>{desc}</p>
          </button>
        ))}
      </div>

      {/* Status do restaurante */}
      <div className="rounded-2xl p-4 flex items-center gap-3"
           style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="relative w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
             style={{ background: 'var(--success-bg)' }}>
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--success)' }} />
          <span className="absolute inset-0 rounded-xl"
                style={{ boxShadow: '0 0 0 3px var(--success-bg)', animation: 'pulse 2s infinite' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
            Restaurante aberto
          </p>
          <p className="text-xs" style={{ color: 'var(--text-hint)' }}>
            Segunda a Domingo · 11h às 23h
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
          Ao vivo
        </span>
      </div>

      {/* Calendário de Shows */}
      {features.shows && <CalendarioShows />}

    </div>
  )
}
