import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ThemeToggle from '../components/ThemeToggle'
import PreferenciasForm from '../components/PreferenciasForm'
import SFFooter from '../components/SFFooter'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ nome: '', email: '', senha: '', confirmar: '' })
  const [erro, setErro] = useState(null)
  const [loading, setLoading] = useState(false)
  const [etapa, setEtapa] = useState('form') // 'form' | 'preferencias'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErro(null)

    if (form.senha !== form.confirmar) {
      return setErro('As senhas não coincidem.')
    }

    setLoading(true)
    try {
      await register(form.nome, form.email, form.senha)
      setEtapa('preferencias')
    } catch (err) {
      setErro(err.response?.data?.error || 'Erro ao criar conta.')
    } finally {
      setLoading(false)
    }
  }

  const campos = [
    { key: 'nome',      label: 'Nome completo',   type: 'text',     placeholder: 'João Silva' },
    { key: 'email',     label: 'Email',            type: 'email',    placeholder: 'seu@email.com' },
    { key: 'senha',     label: 'Senha',            type: 'password', placeholder: '••••••••' },
    { key: 'confirmar', label: 'Confirmar senha',  type: 'password', placeholder: '••••••••' },
  ]

  const inputStyle = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)',
    fontFamily: 'DM Sans',
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--surface)' }}>
      <div className="flex-1 flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm">

        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4"
            style={{ background: 'var(--brand-light)' }}
          >
            🍽️
          </div>
          <h1 className="font-display text-2xl font-medium" style={{ color: 'var(--text-primary)' }}>
            {etapa === 'form' ? 'Criar conta' : 'Suas preferências'}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {etapa === 'form'
              ? 'Rápido e gratuito'
              : 'Nos conte um pouco sobre você'}
          </p>
        </div>

        <div className="bg-card rounded-3xl p-6 space-y-4" style={{ border: '1px solid var(--border)' }}>

          {/* Etapa 1 — Dados */}
          {etapa === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-3">
              {campos.map(({ key, label, type, placeholder }) => (
                <div key={key}>
                  <label
                    className="text-xs font-medium uppercase tracking-wider block mb-1.5"
                    style={{ color: 'var(--text-hint)', letterSpacing: '0.08em' }}
                  >
                    {label}
                  </label>
                  <input
                    type={type}
                    required
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    placeholder={placeholder}
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                    style={inputStyle}
                  />
                </div>
              ))}

              {erro && (
                <p className="text-xs text-center py-2 rounded-lg"
                   style={{ background: '#FEE2E2', color: '#991B1B' }}>
                  {erro}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl py-3.5 font-semibold text-sm transition-all active:scale-[0.98] disabled:opacity-50 mt-1"
                style={{ background: 'var(--brand)', color: '#fff', fontFamily: 'DM Sans' }}
              >
                {loading ? 'Criando conta...' : 'Criar conta'}
              </button>

              <div className="text-center pt-1">
                <span className="text-sm" style={{ color: 'var(--text-hint)' }}>Já tem conta? </span>
                <Link to="/login" className="text-sm font-semibold" style={{ color: 'var(--brand)' }}>
                  Entrar
                </Link>
              </div>
            </form>
          )}

          {/* Etapa 2 — Preferências */}
          {etapa === 'preferencias' && (
            <div className="space-y-4">
              <PreferenciasForm onSalvo={() => navigate('/selecionar-mesa')} />

              <button
                type="button"
                onClick={() => navigate('/selecionar-mesa')}
                className="w-full text-sm py-2"
                style={{ color: 'var(--text-hint)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Pular por agora →
              </button>
            </div>
          )}

        </div>
      </div>
      </div>
      <SFFooter />
    </div>
  )
}