import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

const VAZIO = { nome: '', email: '', senha: '', role: 'USER' }

export default function UsuariosAdmin() {
  const { user: meuUser } = useAuth()
  const [usuarios, setUsuarios]   = useState([])
  const [modal, setModal]         = useState(null)
  const [form, setForm]           = useState(VAZIO)
  const [editandoId, setEditandoId] = useState(null)
  const [novaSenha, setNovaSenha] = useState('')
  const [loading, setLoading]     = useState(true)
  const [salvando, setSalvando]   = useState(false)

  const carregar = () =>
    api.get('/admin/usuarios').then(({ data }) => {
      setUsuarios(data)
      setLoading(false)
    })

  useEffect(() => { carregar() }, [])

  const abrirCriar  = () => { setForm(VAZIO); setEditandoId(null); setModal('criar') }
  const abrirEditar = (u) => {
    setForm({ nome: u.nome, email: u.email, senha: '', role: u.role })
    setEditandoId(u.id)
    setModal('editar')
  }
  const abrirSenha = (u) => { setEditandoId(u.id); setNovaSenha(''); setModal('senha') }

  const salvarUsuario = async () => {
    setSalvando(true)
    try {
      if (modal === 'criar') {
        await api.post('/admin/usuarios', form)
      } else {
        await api.put(`/admin/usuarios/${editandoId}`, { nome: form.nome, email: form.email, role: form.role })
      }
      setModal(null)
      carregar()
    } finally { setSalvando(false) }
  }

  const salvarSenha = async () => {
    if (!novaSenha || novaSenha.length < 6) return
    setSalvando(true)
    try {
      await api.patch(`/admin/usuarios/${editandoId}/senha`, { senha: novaSenha })
      setModal(null)
    } finally { setSalvando(false) }
  }

  const excluir = async (id) => {
    if (id === meuUser.id) return alert('Você não pode excluir sua própria conta.')
    if (!confirm('Excluir este usuário?')) return
    await api.delete(`/admin/usuarios/${id}`)
    carregar()
  }

  const inputStyle = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)',
    fontFamily: 'DM Sans',
    borderRadius: '12px',
    padding: '10px 14px',
    width: '100%',
    outline: 'none',
    fontSize: '14px',
  }

  const labelStyle = {
    display: 'block',
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: 'var(--text-secondary)',
    marginBottom: '6px',
  }

  return (
    <div className="p-8" style={{ color: 'var(--text-primary)', fontFamily: 'DM Sans' }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1"
             style={{ color: 'var(--brand)', letterSpacing: '0.12em' }}>
            Dashboard
          </p>
          <h1 className="font-display text-2xl font-medium" style={{ color: 'var(--text-primary)' }}>
            Usuários
          </h1>
        </div>
        <button
          onClick={abrirCriar}
          className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] hover:scale-[1.02]"
          style={{ background: 'var(--brand)', color: '#fff', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}
        >
          + Novo usuário
        </button>
      </div>

      {/* Tabela */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-14 rounded-xl animate-pulse"
                 style={{ background: 'var(--card)' }} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)' }}>
                {['Usuário', 'Email', 'Role', 'Cadastro', 'Ações'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-medium"
                      style={{ color: 'var(--text-secondary)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u, idx) => (
                <tr key={u.id}
                    style={{
                      background: idx % 2 === 0 ? 'var(--surface)' : 'var(--card)',
                      borderBottom: '1px solid var(--border)',
                    }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{
                          background: u.role === 'ADMINSF' ? 'rgba(251,191,36,0.15)' : u.role === 'ADMIN' ? 'var(--brand-light)' : 'rgba(129,140,248,0.15)',
                          color:      u.role === 'ADMINSF' ? '#F59E0B'               : u.role === 'ADMIN' ? 'var(--brand)'       : '#818CF8',
                          border:     `1.5px solid ${u.role === 'ADMINSF' ? '#F59E0B' : u.role === 'ADMIN' ? 'var(--brand)' : '#818CF8'}33`,
                        }}
                      >
                        {u.nome.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        {u.nome}
                      </span>
                      {u.id === meuUser.id && (
                        <span className="text-xs px-1.5 py-0.5 rounded"
                              style={{ background: 'var(--border)', color: 'var(--text-hint)' }}>
                          você
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                    {u.email}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-xs px-2.5 py-1 rounded-full font-semibold"
                      style={u.role === 'ADMINSF'
                        ? { background: 'rgba(251,191,36,0.15)', color: '#F59E0B' }
                        : u.role === 'ADMIN'
                        ? { background: 'var(--brand-light)', color: 'var(--brand)' }
                        : { background: 'rgba(129,140,248,0.15)', color: '#818CF8' }}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-hint)' }}>
                    {new Date(u.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => abrirEditar(u)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:opacity-80"
                        style={{ background: 'var(--surface)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => abrirSenha(u)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:opacity-80"
                        style={{ background: 'var(--surface)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
                      >
                        Senha
                      </button>
                      {u.id !== meuUser.id && (
                        <button
                          onClick={() => excluir(u.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:opacity-80"
                          style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}
                        >
                          Excluir
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {usuarios.length === 0 && (
            <div className="py-16 text-center">
              <p style={{ fontSize: '40px', marginBottom: '12px' }}>👥</p>
              <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                Nenhum usuário cadastrado
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modal criar/editar */}
      {(modal === 'criar' || modal === 'editar') && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-4"
             style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-sm rounded-2xl p-6 space-y-4"
               style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 24px 48px rgba(0,0,0,0.3)' }}>
            <h2 className="font-display text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
              {modal === 'criar' ? 'Novo usuário' : 'Editar usuário'}
            </h2>

            <div className="space-y-3">
              <div>
                <label style={labelStyle}>Nome completo</label>
                <input placeholder="João da Silva" value={form.nome}
                       onChange={e => setForm({ ...form, nome: e.target.value })}
                       style={inputStyle} autoFocus
                       onFocus={(e) => e.target.style.borderColor = 'var(--brand)'}
                       onBlur={(e)  => e.target.style.borderColor = 'var(--border)'} />
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input placeholder="email@exemplo.com" type="email" value={form.email}
                       onChange={e => setForm({ ...form, email: e.target.value })}
                       style={inputStyle}
                       onFocus={(e) => e.target.style.borderColor = 'var(--brand)'}
                       onBlur={(e)  => e.target.style.borderColor = 'var(--border)'} />
              </div>
              {modal === 'criar' && (
                <div>
                  <label style={labelStyle}>Senha</label>
                  <input placeholder="Mínimo 6 caracteres" type="password" value={form.senha}
                         onChange={e => setForm({ ...form, senha: e.target.value })}
                         style={inputStyle}
                         onFocus={(e) => e.target.style.borderColor = 'var(--brand)'}
                         onBlur={(e)  => e.target.style.borderColor = 'var(--border)'} />
                </div>
              )}
              <div>
                <label style={labelStyle}>Perfil de acesso</label>
                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                        style={inputStyle}
                        onFocus={(e) => e.target.style.borderColor = 'var(--brand)'}
                        onBlur={(e)  => e.target.style.borderColor = 'var(--border)'}>
                  <option value="USER">USER — Cliente</option>
                  <option value="ADMIN">ADMIN — Administrador</option>
                  {meuUser.role === 'ADMINSF' && (
                    <option value="ADMINSF">ADMINSF — Super Administrador SF</option>
                  )}
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button onClick={() => setModal(null)}
                      className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                      style={{ background: 'var(--surface)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                Cancelar
              </button>
              <button onClick={salvarUsuario} disabled={salvando}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-40"
                      style={{ background: 'var(--brand)', color: '#fff' }}>
                {salvando ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Salvando...
                  </span>
                ) : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal reset senha */}
      {modal === 'senha' && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-4"
             style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-sm rounded-2xl p-6 space-y-4"
               style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 24px 48px rgba(0,0,0,0.3)' }}>
            <div>
              <h2 className="font-display text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
                Redefinir senha
              </h2>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                A nova senha será aplicada imediatamente.
              </p>
            </div>
            <div>
              <label style={labelStyle}>Nova senha</label>
              <input
                placeholder="Mínimo 6 caracteres"
                type="password"
                value={novaSenha}
                onChange={e => setNovaSenha(e.target.value)}
                style={inputStyle}
                autoFocus
                onFocus={(e) => e.target.style.borderColor = 'var(--brand)'}
                onBlur={(e)  => e.target.style.borderColor = 'var(--border)'}
              />
              {novaSenha.length > 0 && novaSenha.length < 6 && (
                <p className="text-xs mt-1.5" style={{ color: 'var(--danger)' }}>
                  Mínimo de 6 caracteres
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setModal(null)}
                      className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                      style={{ background: 'var(--surface)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                Cancelar
              </button>
              <button onClick={salvarSenha} disabled={salvando || novaSenha.length < 6}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-40"
                      style={{ background: 'var(--brand)', color: '#fff' }}>
                {salvando ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Salvando...
                  </span>
                ) : 'Redefinir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}