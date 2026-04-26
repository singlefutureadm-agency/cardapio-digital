import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import ThemeToggle from '../components/ThemeToggle'

export default function Login() {
  const { login } = useAuth()
  const { isDark } = useTheme()
  const navigate = useNavigate()

  const [form, setForm] = useState({ email: '', senha: '' })
  const [erro, setErro] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErro(null)
    setLoading(true)
    try {
      const loggedUser = await login(form.email, form.senha)
      if (loggedUser.role === 'ADMIN') {
        navigate('/dashboard', { replace: true })
      } else {
        navigate('/selecionar-mesa', { replace: true })
      }
    } catch (err) {
      setErro(err.response?.data?.error || 'Erro ao entrar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)',
    fontFamily: 'DM Sans',
    borderRadius: '12px',
    padding: '13px 16px',
    outline: 'none',
    fontSize: '14px',
    transition: 'border-color 0.2s',
  }

  const labelStyle = {
    display: 'block',
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.09em',
    color: 'var(--text-hint)',
    marginBottom: '6px',
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5 relative"
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
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle, var(--brand) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          opacity: isDark ? 0.06 : 0.04,
        }} />
      </div>

      {/* Toggle de tema */}
      <div className="absolute top-5 right-5">
        <ThemeToggle />
      </div>

      <div className="relative w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5"
               style={{ background: 'var(--brand)', boxShadow: '0 8px 32px rgba(200,82,10,0.35)' }}>
            🍽️
          </div>
          <h1 className="font-display text-3xl font-medium" style={{ color: 'var(--text-primary)' }}>
            Bem-vindo de volta
          </h1>
          <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
            Entre para fazer seu pedido
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl p-7 space-y-5"
             style={{
               background: 'var(--card)',
               border: '1px solid var(--border)',
               boxShadow: isDark
                 ? '0 24px 48px rgba(0,0,0,0.4)'
                 : '0 24px 48px rgba(0,0,0,0.08)',
             }}>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="seu@email.com"
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = 'var(--brand)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            {/* Senha */}
            <div>
              <label style={labelStyle}>Senha</label>
              <input
                type="password"
                required
                value={form.senha}
                onChange={(e) => setForm({ ...form, senha: e.target.value })}
                placeholder="••••••••"
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = 'var(--brand)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            {/* Erro */}
            {erro && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
                   style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>
                <span style={{ fontSize: '14px' }}>⚠️</span>
                {erro}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl py-4 font-semibold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group"
              style={{
                background: 'var(--brand)',
                color: '#fff',
                fontFamily: 'DM Sans',
                boxShadow: '0 4px 20px rgba(200,82,10,0.3)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.1), transparent)' }} />
              <span className="relative">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Entrando...
                  </span>
                ) : 'Entrar'}
              </span>
            </button>
          </form>

          {/* Divisor */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            <span className="text-xs" style={{ color: 'var(--text-hint)' }}>ou</span>
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          </div>

          {/* Link cadastro */}
          <div className="text-center">
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Não tem conta?{' '}
            </span>
            <Link to="/register"
                  className="text-sm font-semibold transition-opacity hover:opacity-80"
                  style={{ color: 'var(--brand)' }}>
              Cadastre-se grátis
            </Link>
          </div>
        </div>

        {/* Voltar para home */}
        <div className="text-center mt-6">
          <Link to="/"
                className="text-sm transition-opacity hover:opacity-80"
                style={{ color: 'var(--text-hint)' }}>
            ← Voltar para o início
          </Link>
        </div>
      </div>
    </div>
  )
}