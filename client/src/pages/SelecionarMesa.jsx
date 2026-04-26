import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import ThemeToggle from '../components/ThemeToggle'
import api from '../services/api'
import SFFooter from '../components/SFFooter'

export default function SelecionarMesa() {
  const { user, logout } = useAuth()
  const { isDark } = useTheme()
  const navigate = useNavigate()
  const [mesas, setMesas] = useState([])
  const [loading, setLoading] = useState(true)
  const [selecionada, setSelecionada] = useState(null)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    // Limpa mesa anterior para forçar nova seleção
    localStorage.removeItem('mesa')

    api.get('/mesas/ativas')
      .then(({ data }) => {
        setMesas(data)
        setLoading(false)
      })
      .catch(() => {
        setErro('Não foi possível carregar as mesas.')
        setLoading(false)
      })
  }, [])

  const confirmar = () => {
    if (!selecionada) return
    localStorage.setItem('mesa', selecionada)
    navigate(`/cliente/${selecionada}`, { replace: true })
  }

  return (
    <div className="min-h-screen flex flex-col relative"
         style={{ background: 'var(--surface)', fontFamily: 'DM Sans' }}>

      {/* Fundo decorativo */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div style={{
          position: 'absolute', top: '10%', left: '5%',
          width: 400, height: 400, borderRadius: '50%',
          background: 'var(--brand)', filter: 'blur(100px)',
          opacity: isDark ? 0.07 : 0.05,
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', right: '5%',
          width: 300, height: 300, borderRadius: '50%',
          background: 'var(--brand)', filter: 'blur(80px)',
          opacity: isDark ? 0.05 : 0.04,
        }} />
        {/* Grid de pontos */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle, var(--brand) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          opacity: isDark ? 0.06 : 0.04,
        }} />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base"
               style={{ background: 'var(--brand)', color: '#fff' }}>
            🍽
          </div>
          <span className="font-display text-lg font-medium"
                style={{ color: 'var(--text-primary)' }}>
            Restaurante
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle size="sm" />
          <button
            onClick={logout}
            className="text-xs px-3 py-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--text-hint)', border: '1px solid var(--border)' }}
          >
            Sair
          </button>
        </div>
      </header>

      {/* Conteúdo central */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 py-8">
        <div className="w-full max-w-sm">

          {/* Título */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5"
                 style={{ background: 'var(--brand)', color: '#fff',
                          boxShadow: '0 8px 32px rgba(200,82,10,0.35)' }}>
              🪑
            </div>
            <h1 className="font-display text-2xl font-medium"
                style={{ color: 'var(--text-primary)' }}>
              Olá, {user?.nome.split(' ')[0]}!
            </h1>
            <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
              Em qual mesa você está sentado?
            </p>
          </div>

          {/* Card container */}
          <div className="rounded-3xl p-6"
               style={{
                 background: 'var(--card)',
                 border: '1px solid var(--border)',
                 boxShadow: isDark
                   ? '0 24px 48px rgba(0,0,0,0.4)'
                   : '0 24px 48px rgba(0,0,0,0.08)',
               }}>

            {erro ? (
              <div className="text-center py-6">
                <p className="text-sm" style={{ color: 'var(--danger)' }}>{erro}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="text-sm font-medium mt-3"
                  style={{ color: 'var(--brand)' }}
                >
                  Tentar novamente
                </button>
              </div>
            ) : loading ? (
              <div className="grid grid-cols-4 gap-3">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-14 rounded-xl animate-pulse"
                       style={{ background: 'var(--surface)' }} />
                ))}
              </div>
            ) : mesas.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-2xl mb-2">🪑</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Nenhuma mesa disponível no momento.
                </p>
              </div>
            ) : (
              <>
                <p className="text-xs font-semibold uppercase tracking-widest mb-4"
                   style={{ color: 'var(--text-hint)', letterSpacing: '0.1em' }}>
                  Mesas disponíveis
                </p>
                <div className="grid grid-cols-4 gap-2.5 mb-2">
                  {mesas.map((mesa) => {
                    const ativa = selecionada === mesa.numero
                    return (
                      <button
                        key={mesa.id}
                        onClick={() => setSelecionada(mesa.numero)}
                        className="h-14 rounded-xl font-display text-lg font-medium transition-all duration-150 hover:scale-[1.06] active:scale-[0.96]"
                        style={ativa
                          ? { background: 'var(--brand)', color: '#fff',
                              boxShadow: '0 4px 16px rgba(200,82,10,0.4)' }
                          : { background: 'var(--surface)', color: 'var(--text-primary)',
                              border: '1px solid var(--border)' }}
                      >
                        {mesa.numero}
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </div>

          {/* Botão confirmar */}
          <button
            onClick={confirmar}
            disabled={!selecionada}
            className="w-full py-4 rounded-2xl font-semibold text-sm mt-4 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{
              background: 'var(--brand)',
              color: '#fff',
              boxShadow: selecionada ? '0 4px 20px rgba(200,82,10,0.35)' : 'none',
            }}
          >
            {selecionada
              ? `Entrar na mesa ${selecionada} →`
              : 'Selecione sua mesa para continuar'}
          </button>

          <p className="text-xs text-center mt-3" style={{ color: 'var(--text-hint)' }}>
            Certifique-se de escolher a mesa correta
          </p>
        </div>
      </main>
      <SFFooter />
    </div>
  )
}