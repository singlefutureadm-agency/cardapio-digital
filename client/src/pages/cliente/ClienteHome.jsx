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

      {/* Saudação */}
      <div className="rounded-3xl p-6 no-glass"
           style={{ background: 'var(--brand)', position: 'relative', overflow: 'hidden' }}>
        <div className="absolute inset-0 pointer-events-none"
             style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)',
                      backgroundSize: '24px 24px' }} />
        <div className="relative">
          <p className="text-sm font-medium text-white" style={{ opacity: 0.8 }}>
            {saudacao}! 👋
          </p>
          <h1 className="font-display text-2xl font-medium text-white mt-1">
            {user?.nome.split(' ')[0]}
          </h1>
          <p className="text-sm text-white mt-1" style={{ opacity: 0.7 }}>
            Você está na mesa {mesa}. O que vai pedir hoje?
          </p>
        </div>
      </div>

      {/* Ações rápidas */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Ver cardápio', desc: 'Explore nossos pratos',  icon: '🍽️', path: 'cardapio', bg: 'var(--brand-light)', cor: 'var(--brand)' },
          { label: 'Meus pedidos', desc: 'Histórico e status',     icon: '📋', path: 'pedidos',  bg: 'var(--card)',       cor: 'var(--text-primary)' },
          { label: 'Meu perfil',   desc: 'Dados da conta',         icon: '👤', path: 'perfil',   bg: 'var(--card)',       cor: 'var(--text-primary)' },
          { label: 'Pedir agora',  desc: 'Ir direto ao cardápio',  icon: '⚡', path: 'cardapio', bg: 'var(--surface)',    cor: 'var(--text-primary)' },
        ].map(({ label, desc, icon, path, bg, cor }) => (
          <button key={label}
                  onClick={() => navigate(path)}
                  className="flex flex-col items-start p-4 rounded-2xl text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{ background: bg, border: '1px solid var(--border)' }}>
            <span style={{ fontSize: '24px', marginBottom: '8px' }}>{icon}</span>
            <p className="font-semibold text-sm" style={{ color: cor }}>{label}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-hint)' }}>{desc}</p>
          </button>
        ))}
      </div>

      {/* Status do restaurante */}
      <div className="rounded-2xl p-4 flex items-center gap-3"
           style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
             style={{ background: 'rgba(16,185,129,0.12)' }}>
          <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: '#10B981' }} />
        </div>
        <div>
          <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
            Restaurante aberto
          </p>
          <p className="text-xs" style={{ color: 'var(--text-hint)' }}>
            Segunda a Domingo · 11h00 às 23h00
          </p>
        </div>
      </div>

      {/* Calendário de Shows */}
      {features.shows && <CalendarioShows />}

    </div>
  )
}