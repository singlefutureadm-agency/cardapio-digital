import { useState, useEffect } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import ThemeToggle from '../components/ThemeToggle'
import SFFooter from '../components/SFFooter'
import api from '../services/api'
import socket from '../services/socket'

function buildNav(role, features, pendingCount) {
  const isSF = role === 'ADMINSF'

  const restauranteFilhos = [
    { to: '/dashboard/cozinha',   label: 'Cozinha',   icon: '👨‍🍳' },
    { to: '/dashboard/cardapio',  label: 'Cardápio',  icon: '📋' },
    ...(isSF || features.mesas   ? [{ to: '/dashboard/mesas',   label: 'Mesas',   icon: '🪑' }] : []),
    ...(isSF || features.menutv  ? [{ to: '/dashboard/menu-tv', label: 'Menu TV', icon: '📺' }] : []),
    { to: '/dashboard/historico', label: 'Histórico', icon: '🗂️' },
  ]

  const nav = [
    { to: '/dashboard', label: 'Visão geral', icon: '📊', end: true },
    { label: 'Restaurante', icon: '🍽️', grupo: true, filhos: restauranteFilhos },
  ]

  if (isSF || features.shows) {
    nav.push({
      label: 'Shows', icon: '🎸', grupo: true,
      filhos: [
        { to: '/dashboard/shows',    label: 'Calendário', icon: '📅' },
        { to: '/dashboard/artistas', label: 'Artistas',   icon: '🎤' },
      ],
    })
  }

  nav.push({ to: '/dashboard/usuarios',   label: 'Usuários',   icon: '👥' })
  nav.push({ to: '/dashboard/newsletter', label: 'Newsletter', icon: '✉️' })

  if (isSF || features.preferencias) {
    nav.push({
      label: 'Preferências', icon: '🎯', grupo: true,
      filhos: [
        { to: '/dashboard/preferencias',           label: 'Gerenciar', icon: '⚙️' },
        { to: '/dashboard/preferencias/analytics', label: 'Analytics', icon: '📈' },
      ],
    })
  }

  if (isSF) {
    nav.push({
      label: 'Configurações', icon: '⚙️', grupo: true,
      filhos: [
        { to: '/dashboard/configuracoes',   label: 'Tema',            icon: '🎨' },
        { to: '/dashboard/funcionalidades', label: 'Funcionalidades', icon: '🔧' },
      ],
    })
  } else {
    nav.push({ to: '/dashboard/configuracoes', label: 'Configurações', icon: '⚙️' })
  }

  nav.push({ to: '/dashboard/pagamentos', label: 'Fechar Conta', icon: '🧾', badge: pendingCount })

  return nav
}

function GrupoNav({ item, collapsed, glass }) {
  const location = useLocation()
  const ativo = item.filhos.some(f => location.pathname.startsWith(f.to))
  const [aberto, setAberto] = useState(ativo)

  return (
    <div>
      <button
        onClick={() => !collapsed && setAberto(a => !a)}
        title={collapsed ? item.label : undefined}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.625rem 0.75rem',
          borderRadius: 12,
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'DM Sans',
          fontSize: '0.875rem',
          fontWeight: 600,
          transition: 'all 0.15s',
          background: ativo ? 'var(--brand-light)' : 'transparent',
          color: ativo ? 'var(--brand)' : 'var(--text-secondary)',
          justifyContent: collapsed ? 'center' : 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1rem', flexShrink: 0 }}>{item.icon}</span>
          {!collapsed && <span>{item.label}</span>}
        </div>
        {!collapsed && (
          <span style={{
            fontSize: '0.65rem',
            transition: 'transform 0.2s',
            transform: aberto ? 'rotate(180deg)' : 'rotate(0deg)',
            opacity: 0.6,
          }}>▼</span>
        )}
      </button>

      {!collapsed && aberto && (
        <div style={{
          marginLeft: '0.75rem',
          paddingLeft: '0.75rem',
          borderLeft: '1px solid var(--border)',
          marginTop: '0.2rem',
          marginBottom: '0.2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.1rem',
        }}>
          {item.filhos.map(filho => (
            <NavLink
              key={filho.to}
              to={filho.to}
              end
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-sm"
              style={({ isActive }) => isActive ? {
                background: 'var(--brand)',
                color: '#fff',
                fontWeight: 600,
                boxShadow: glass ? '0 4px 16px rgba(0,0,0,0.3)' : 'none',
              } : {
                color: 'var(--text-secondary)',
                fontWeight: 400,
              }}
            >
              <span style={{ fontSize: '0.875rem', flexShrink: 0 }}>{filho.icon}</span>
              <span>{filho.label}</span>
            </NavLink>
          ))}
        </div>
      )}

      {collapsed && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem', marginTop: '0.1rem' }}>
          {item.filhos.map(filho => (
            <NavLink
              key={filho.to}
              to={filho.to}
              end
              title={filho.label}
              className="flex items-center justify-center py-2 rounded-lg transition-all"
              style={({ isActive }) => isActive ? {
                background: 'var(--brand)',
                color: '#fff',
              } : {
                color: 'var(--text-hint)',
              }}
            >
              <span style={{ fontSize: '0.875rem' }}>{filho.icon}</span>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  )
}

export default function DashboardLayout() {
  const { user, logout } = useAuth()
  const { isDark, glass, bgUrl, features } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed]           = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [pendingCount, setPendingCount]     = useState(0)

  // Close mobile drawer on navigation
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  // Prevent body scroll when mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileMenuOpen])

  useEffect(() => {
    api.get('/chamadas').then(({ data }) => setPendingCount(data.length)).catch(() => {})
  }, [location.pathname])

  useEffect(() => {
    socket.on('garcom_chamado',   () => setPendingCount(n => n + 1))
    socket.on('chamada_atendida', () => setPendingCount(n => Math.max(0, n - 1)))
    return () => {
      socket.off('garcom_chamado')
      socket.off('chamada_atendida')
    }
  }, [])

  const NAV = buildNav(user?.role, features, pendingCount)

  const sidebarStyle = glass ? {
    background: 'var(--glass-bg)',
    backdropFilter: 'var(--glass-blur)',
    WebkitBackdropFilter: 'var(--glass-blur)',
    borderRight: '1px solid var(--glass-border)',
    boxShadow: 'var(--glass-shadow)',
  } : {
    background: isDark ? '#111110' : '#F5F5F3',
    borderRight: '1px solid var(--border)',
  }

  const headerStyle = glass ? {
    background: 'var(--glass-bg)',
    backdropFilter: 'var(--glass-blur)',
    WebkitBackdropFilter: 'var(--glass-blur)',
    borderBottom: '1px solid var(--glass-border)',
  } : {
    background: isDark ? '#111110' : '#F5F5F3',
    borderBottom: '1px solid var(--border)',
  }

  const SidebarContent = ({ isMobile = false }) => (
    <>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0"
             style={{ background: 'var(--brand)', color: '#fff' }}>
          🍽
        </div>
        {(!collapsed || isMobile) && (
          <span className="font-display text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
            Restaurante
          </span>
        )}
        {isMobile && (
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="ml-auto w-7 h-7 rounded-lg flex items-center justify-center text-xs"
            style={{ color: 'var(--text-secondary)', background: 'var(--panel)' }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2" style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
        {NAV.map((item) => {
          if (item.grupo) {
            return <GrupoNav key={item.label} item={item} collapsed={!isMobile && collapsed} glass={glass} />
          }
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              title={(!isMobile && collapsed) ? item.label : undefined}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium"
              style={({ isActive }) => isActive ? {
                background: 'var(--brand)',
                color: '#fff',
                boxShadow: glass ? '0 4px 16px rgba(0,0,0,0.3)' : 'none',
                justifyContent: (!isMobile && collapsed) ? 'center' : 'flex-start',
              } : {
                color: 'var(--text-secondary)',
                justifyContent: (!isMobile && collapsed) ? 'center' : 'flex-start',
              }}
            >
              <span className="text-base flex-shrink-0">{item.icon}</span>
              {(isMobile || !collapsed) && (
                <>
                  <span className="truncate flex-1">{item.label}</span>
                  {item.badge > 0 && (
                    <span className="flex-shrink-0 font-bold rounded-full"
                          style={{ background: 'var(--warning)', color: '#fff', fontSize: 10, padding: '1px 6px' }}>
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-2 py-3" style={{ borderTop: '1px solid var(--border)' }}>
        {(isMobile || !collapsed) && (
          <div className="px-3 py-2 mb-1 rounded-xl" style={{ background: 'var(--brand-light)' }}>
            <div className="flex items-center gap-1.5 mb-0.5">
              <p className="text-xs font-semibold truncate" style={{ color: 'var(--brand)' }}>{user?.nome}</p>
              {user?.role === 'ADMINSF' && (
                <span style={{ fontSize: '0.6rem', background: 'var(--brand)', color: '#fff', borderRadius: 4, padding: '1px 5px', flexShrink: 0, fontWeight: 700 }}>SF</span>
              )}
            </div>
            <p className="text-xs truncate" style={{ color: 'var(--text-hint)' }}>{user?.email}</p>
          </div>
        )}
        <button
          onClick={() => { logout(); navigate('/login') }}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors"
          style={{
            color: 'var(--danger)',
            background: 'var(--danger-bg)',
            justifyContent: (!isMobile && collapsed) ? 'center' : 'flex-start',
          }}
        >
          <span>🚪</span>
          {(isMobile || !collapsed) && 'Sair'}
        </button>
      </div>
    </>
  )

  return (
    <div className="app-dashboard flex h-screen overflow-hidden"
         style={{ fontFamily: 'DM Sans', background: bgUrl ? 'transparent' : 'var(--surface)', position: 'relative' }}>

      {bgUrl && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 0,
          backgroundImage: `url(${bgUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.3) saturate(0.8)',
        }} />
      )}

      {/* Mobile overlay backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className="glass-panel fixed inset-y-0 left-0 z-50 flex flex-col md:hidden transition-transform duration-300"
        style={{
          width: 260,
          transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
          ...sidebarStyle,
        }}
      >
        <SidebarContent isMobile />
      </aside>

      {/* Desktop sidebar */}
      <aside
        className="glass-panel relative z-10 flex-col flex-shrink-0 transition-all duration-300 hidden md:flex"
        style={{ width: collapsed ? 64 : 220, ...sidebarStyle }}
      >
        <SidebarContent />
      </aside>

      {/* Main */}
      <div className="relative z-10 flex flex-col flex-1 min-w-0 overflow-hidden">
        <header className="glass-panel flex items-center justify-between px-4 md:px-6 py-3 flex-shrink-0" style={headerStyle}>
          <div className="flex items-center gap-2">
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
              style={{ color: 'var(--text-secondary)', background: 'var(--surface)' }}
              aria-label="Abrir menu"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect y="2"  width="18" height="2" rx="1" fill="currentColor"/>
                <rect y="8"  width="18" height="2" rx="1" fill="currentColor"/>
                <rect y="14" width="18" height="2" rx="1" fill="currentColor"/>
              </svg>
            </button>
            {/* Desktop collapse */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden md:flex w-8 h-8 rounded-lg items-center justify-center transition-colors hover:opacity-80"
              style={{ color: 'var(--text-secondary)', background: 'var(--surface)' }}
              aria-label={collapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
            >
              {collapsed ? '→' : '←'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle size="sm" />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto flex flex-col" style={{ background: bgUrl ? 'transparent' : 'var(--surface)' }}>
          {bgUrl && glass && (
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'rgba(0,0,0,0.2)' }} />
          )}
          <div className="flex-1">
            <Outlet />
          </div>
          <SFFooter />
        </main>
      </div>
    </div>
  )
}
