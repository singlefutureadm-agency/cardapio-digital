import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import PreferenciasForm from '../../components/PreferenciasForm'

export default function ClientePerfil() {
  const { user, logout } = useAuth()
  const [aba, setAba] = useState('dados')
  const [form, setForm] = useState({ nome: '', email: '' })
  const [senhaForm, setSenhaForm] = useState({ senhaAtual: '', novaSenha: '', confirmar: '' })
  const [salvando, setSalvando] = useState(false)
  const [msg, setMsg] = useState(null)

  useEffect(() => {
    if (user) setForm({ nome: user.nome, email: user.email })
  }, [user])

  const salvarPerfil = async (e) => {
    e.preventDefault()
    setSalvando(true); setMsg(null)
    try {
      await api.put('/cliente/perfil', form)
      setMsg({ tipo: 'ok', texto: 'Perfil atualizado com sucesso!' })
    } catch (err) {
      setMsg({ tipo: 'erro', texto: err.response?.data?.error || 'Erro ao salvar.' })
    } finally { setSalvando(false) }
  }

  const salvarSenha = async (e) => {
    e.preventDefault()
    if (senhaForm.novaSenha !== senhaForm.confirmar)
      return setMsg({ tipo: 'erro', texto: 'As senhas não coincidem.' })
    if (senhaForm.novaSenha.length < 6)
      return setMsg({ tipo: 'erro', texto: 'Mínimo 6 caracteres.' })
    setSalvando(true); setMsg(null)
    try {
      await api.patch('/cliente/senha', {
        senhaAtual: senhaForm.senhaAtual,
        novaSenha: senhaForm.novaSenha,
      })
      setMsg({ tipo: 'ok', texto: 'Senha alterada com sucesso!' })
      setSenhaForm({ senhaAtual: '', novaSenha: '', confirmar: '' })
    } catch (err) {
      setMsg({ tipo: 'erro', texto: err.response?.data?.error || 'Erro ao alterar senha.' })
    } finally { setSalvando(false) }
  }

  const inputStyle = {
    width: '100%', background: 'var(--surface)', border: '1px solid var(--border)',
    color: 'var(--text-primary)', fontFamily: 'DM Sans', borderRadius: '12px',
    padding: '11px 14px', outline: 'none', fontSize: '14px',
  }
  const labelStyle = {
    display: 'block', fontSize: '11px', fontWeight: '600',
    textTransform: 'uppercase', letterSpacing: '0.08em',
    color: 'var(--text-hint)', marginBottom: '6px',
  }

  const abas = [
    { key: 'dados',        label: 'Dados pessoais' },
    { key: 'senha',        label: 'Segurança' },
    { key: 'preferencias', label: 'Preferências' },
  ]

  return (
    <div className="pt-2 pb-6">
      {/* Avatar + nome */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold"
             style={{ background: 'var(--brand-light)', color: 'var(--brand)' }}>
          {user?.nome?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="font-display text-xl font-medium" style={{ color: 'var(--text-primary)' }}>
            {user?.nome}
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{user?.email}</p>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block"
                style={{ background: 'var(--brand-light)', color: 'var(--brand)' }}>
            {user?.role === 'ADMIN' ? 'Administrador' : 'Cliente'}
          </span>
        </div>
      </div>

      {/* Abas */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {abas.map(({ key, label }) => (
          <button key={key} onClick={() => { setAba(key); setMsg(null) }}
                  className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                  style={aba === key
                    ? { background: 'var(--brand)', color: '#fff' }
                    : { background: 'var(--card)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
            {label}
          </button>
        ))}
      </div>

      {/* Feedback */}
      {msg && (
        <div className="mb-4 px-4 py-3 rounded-xl text-sm font-medium"
             style={msg.tipo === 'ok'
               ? { background: 'var(--success-bg)', color: 'var(--success)' }
               : { background: 'var(--danger-bg)', color: 'var(--danger)' }}>
          {msg.texto}
        </div>
      )}

      {/* Aba: Dados pessoais */}
      {aba === 'dados' && (
        <form onSubmit={salvarPerfil}
              className="rounded-2xl p-5 space-y-4"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div>
            <label style={labelStyle}>Nome completo</label>
            <input value={form.nome} required
                   onChange={(e) => setForm({ ...form, nome: e.target.value })}
                   style={inputStyle}
                   onFocus={(e) => e.target.style.borderColor = 'var(--brand)'}
                   onBlur={(e) => e.target.style.borderColor = 'var(--border)'} />
          </div>
          <div>
            <label style={labelStyle}>Email</label>
            <input type="email" value={form.email} required
                   onChange={(e) => setForm({ ...form, email: e.target.value })}
                   style={inputStyle}
                   onFocus={(e) => e.target.style.borderColor = 'var(--brand)'}
                   onBlur={(e) => e.target.style.borderColor = 'var(--border)'} />
          </div>
          <button type="submit" disabled={salvando}
                  className="w-full py-3 rounded-xl font-semibold text-sm transition-all active:scale-[0.98] disabled:opacity-50"
                  style={{ background: 'var(--brand)', color: '#fff' }}>
            {salvando ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </form>
      )}

      {/* Aba: Segurança */}
      {aba === 'senha' && (
        <form onSubmit={salvarSenha}
              className="rounded-2xl p-5 space-y-4"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          {[
            { key: 'senhaAtual',  label: 'Senha atual',     placeholder: '••••••••' },
            { key: 'novaSenha',   label: 'Nova senha',      placeholder: 'Mínimo 6 caracteres' },
            { key: 'confirmar',   label: 'Confirmar senha', placeholder: 'Repita a nova senha' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label style={labelStyle}>{label}</label>
              <input type="password" placeholder={placeholder}
                     value={senhaForm[key]} required
                     onChange={(e) => setSenhaForm({ ...senhaForm, [key]: e.target.value })}
                     style={inputStyle}
                     onFocus={(e) => e.target.style.borderColor = 'var(--brand)'}
                     onBlur={(e) => e.target.style.borderColor = 'var(--border)'} />
            </div>
          ))}
          <button type="submit" disabled={salvando}
                  className="w-full py-3 rounded-xl font-semibold text-sm transition-all active:scale-[0.98] disabled:opacity-50"
                  style={{ background: 'var(--brand)', color: '#fff' }}>
            {salvando ? 'Alterando...' : 'Alterar senha'}
          </button>
        </form>
      )}

      {/* Aba: Preferências */}
      {aba === 'preferencias' && (
        <div className="rounded-2xl p-5"
             style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <PreferenciasForm
            onSalvo={() => setMsg({ tipo: 'ok', texto: 'Preferências atualizadas!' })}
          />
        </div>
      )}

      {/* Sair */}
      <button onClick={logout}
              className="w-full mt-4 py-3 rounded-xl text-sm font-medium transition-colors"
              style={{ background: 'var(--danger-bg)', color: 'var(--danger)',
                       border: '1px solid rgba(239,68,68,0.2)' }}>
        Sair da conta
      </button>
    </div>
  )
}