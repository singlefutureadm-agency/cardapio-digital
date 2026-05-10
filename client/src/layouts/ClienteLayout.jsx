import { useState, useEffect } from 'react'
import { NavLink, Outlet, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import ThemeToggle from '../components/ThemeToggle'
import SFFooter from '../components/SFFooter'

const NAV = [
  { to: (mesa) => `/cliente/${mesa}`,           label: 'Início',    icon: '🏠', end: true },
  { to: (mesa) => `/cliente/${mesa}/cardapio`,  label: 'Cardápio',  icon: '🍽️' },
  { to: (mesa) => `/cliente/${mesa}/pedidos`,   label: 'Pedidos',   icon: '📋' },
  { to: (mesa) => `/cliente/${mesa}/checkout`,  label: 'Garçom',    icon: '🛎️' },
  { to: (mesa) => `/cliente/${mesa}/perfil`,    label: 'Perfil',    icon: '👤' },
]

export default function ClienteLayout() {
  const { user, logout } = useAuth()
  const { isDark, glass, bgUrl } = useTheme()
  const navigate = useNavigate()
  const { mesa } = useParams()

  // Marca o início da sessão desta mesa (usado em ClientePedidos para isolar pedidos)
  useEffect(() => {
    const key = `sessao_${mesa}`
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, Date.now().toString())
    }
  }, [mesa])

  const handleLogout = () => { logout(); navigate('/login') }

  const headerStyle = glass ? {
    background: 'var(--glass-bg)',
    backdropFilter: 'var(--glass-blur)',
    WebkitBackdropFilter: 'var(--glass-blur)',
    borderBottom: '1px solid var(--glass-border)',
  } : {
    background: isDark ? 'rgba(26,26,23,0.95)' : 'rgba(250,250,248,0.95)',
    backdropFilter: 'blur(16px)',
    borderBottom: '1px solid var(--border)',
  }

  const navStyle = glass ? {
    background: 'var(--glass-bg)',
    backdropFilter: 'var(--glass-blur)',
    WebkitBackdropFilter: 'var(--glass-blur)',
    borderTop: '1px solid var(--glass-border)',
  } : {
    background: isDark ? 'rgba(26,26,23,0.97)' : 'rgba(255,255,255,0.97)',
    backdropFilter: 'blur(16px)',
    borderTop: '1px solid var(--border)',
  }

  return (
    <div className="app-cliente min-h-screen flex flex-col"
         style={{ background: bgUrl ? 'transparent' : 'var(--surface)', fontFamily: 'DM Sans' }}>

      {/* Imagem de fundo (quando configurada) */}
      {bgUrl && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 0,
          backgroundImage: `url(${bgUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.3) saturate(0.8)',
        }} />
      )}

      {/* ── Header fixo ── */}
      <header className="glass-panel sticky top-0 z-40" style={headerStyle}>
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">

          {/* Logo + mesa */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                 style={{ background: 'var(--brand)', color: '#fff' }}>
              🍽
            </div>
            <div>
              <p className="font-display text-sm font-medium leading-tight"
                 style={{ color: 'var(--glass-text, var(--text-primary))' }}>
                Restaurante
              </p>
              <p className="text-xs leading-tight" style={{ color: 'var(--text-hint)' }}>
                Mesa {mesa}
              </p>
            </div>
          </div>

          {/* Ações */}
          <div className="flex items-center gap-2">
            <span className="text-sm hidden sm:block"
                  style={{ color: 'var(--glass-text, var(--text-secondary))' }}>
              {user?.nome.split(' ')[0]}
            </span>
            <ThemeToggle size="sm" />
            <button onClick={handleLogout}
                    className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)',
                             color: 'var(--text-hint)' }}>
              Sair
            </button>
            <button
              onClick={() => navigate('/selecionar-mesa')}
              className="text-xs px-2 py-1 rounded-lg transition-colors"
              style={{ background: 'var(--brand-light)', color: 'var(--brand)' }}
            >
              Trocar
            </button>
          </div>
        </div>
      </header>

      {/* ── Conteúdo ── */}
      <main className="relative z-10 flex-1 flex flex-col max-w-2xl mx-auto w-full px-4 py-4">
        <div className="flex-1">
          <Outlet />
        </div>
        <SFFooter />
      </main>

      {/* ── Bottom nav mobile ── */}
      <nav aria-label="Navegação do cliente" className="glass-panel sticky bottom-0 z-40" style={navStyle}>
        <div className="max-w-2xl mx-auto flex">
          {NAV.map(({ to, label, icon, end }) => {
            const path = to(mesa)
            return (
              <NavLink key={label} to={path} end={end}
                       className="flex-1 relative flex flex-col items-center gap-1 py-2.5 transition-all"
                       style={({ isActive }) => ({
                         color: isActive ? 'var(--brand)' : 'var(--glass-text, var(--text-hint))',
                       })}>
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                            style={{ background: 'var(--brand)' }} />
                    )}
                    <span style={{ fontSize: '19px', lineHeight: 1 }}>{icon}</span>
                    <span style={{ fontSize: '10px', fontWeight: isActive ? '700' : '400',
                                   letterSpacing: '0.03em' }}>{label}</span>
                  </>
                )}
              </NavLink>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
