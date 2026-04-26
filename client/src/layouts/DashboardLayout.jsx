import { useState } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import ThemeToggle from '../components/ThemeToggle'
import SFFooter from '../components/SFFooter'

function buildNav(role, features) {
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

  nav.push({ to: '/dashboard/pagamentos', label: 'Pagamentos', icon: '💳' })

  return nav
}

function GrupoNav({ item, collapsed, glass }) {
  const location = useLocation()
  const ativo = item.filhos.some(f => location.pathname.startsWith(f.to))
  const [aberto, setAberto] = useState(ativo)

  return (
    <div>
      {/* Header do grupo */}
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

      {/* Filhos */}
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

      {/* Collapsed: mostra filhos como ícones abaixo */}
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
  const [collapsed, setCollapsed] = useState(false)

  const NAV = buildNav(user?.role, features)

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

      <aside className="glass-panel relative z-10 flex flex-col flex-shrink-0 transition-all duration-300"
             style={{ width: collapsed ? 64 : 220, ...sidebarStyle }}>

        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0"
               style={{ background: 'var(--brand)', color: '#fff' }}>
            🍽
          </div>
          {!collapsed && (
            <span className="font-display text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
              Restaurante
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2" style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
          {NAV.map((item) => {
            if (item.grupo) {
              return <GrupoNav key={item.label} item={item} collapsed={collapsed} glass={glass} />
            }
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                title={collapsed ? item.label : undefined}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium"
                style={({ isActive }) => isActive ? {
                  background: 'var(--brand)',
                  color: '#fff',
                  boxShadow: glass ? '0 4px 16px rgba(0,0,0,0.3)' : 'none',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                } : {
                  color: 'var(--text-secondary)',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                }}
              >
                <span className="text-base flex-shrink-0">{item.icon}</span>
                {!collapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-2 py-3" style={{ borderTop: '1px solid var(--border)' }}>
          {!collapsed && (
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
              justifyContent: collapsed ? 'center' : 'flex-start',
            }}
          >
            <span>🚪</span>
            {!collapsed && 'Sair'}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="relative z-10 flex flex-col flex-1 min-w-0 overflow-hidden">
        <header className="glass-panel flex items-center justify-between px-6 py-3 flex-shrink-0" style={headerStyle}>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:opacity-80"
            style={{ color: 'var(--text-secondary)', background: 'var(--surface)' }}
          >
            {collapsed ? '→' : '←'}
          </button>
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