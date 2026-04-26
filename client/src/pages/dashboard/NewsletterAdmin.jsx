import { useEffect, useState } from 'react'
import api from '../../services/api'

const BADGE = {
  ADMIN:   { label: 'Admin',    bg: 'rgba(139,92,246,0.15)', color: '#A78BFA' },
  USER:    { label: 'Cliente',  bg: 'rgba(16,185,129,0.15)', color: '#34D399' },
  VISITOR: { label: 'Visitante',bg: 'rgba(107,107,96,0.15)', color: '#9CA3AF' },
}

export default function NewsletterAdmin() {
  const [inscritos, setInscritos]       = useState([])
  const [loading, setLoading]           = useState(true)
  const [selecionados, setSelecionados] = useState(new Set())
  const [filtro, setFiltro]             = useState('todos') // todos | usuario | visitante
  const [modalEnvio, setModalEnvio]     = useState(false)
  const [envioForm, setEnvioForm]       = useState({ assunto: '', mensagem: '' })
  const [enviando, setEnviando]         = useState(false)
  const [feedbackEnvio, setFeedbackEnvio] = useState(null)

  const carregar = () => {
    setLoading(true)
    api.get('/newsletter').then(({ data }) => {
      setInscritos(Array.isArray(data) ? data : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  useEffect(() => { carregar() }, [])

  const remover = async (id) => {
    if (!confirm('Remover este email da lista?')) return
    await api.patch(`/newsletter/${id}/remover`)
    setSelecionados(s => { const n = new Set(s); n.delete(id); return n })
    carregar()
  }

  const toggleSel = (id) => setSelecionados(s => {
    const n = new Set(s)
    n.has(id) ? n.delete(id) : n.add(id)
    return n
  })

  const toggleTodos = () => {
    if (selecionados.size === listagem.length) {
      setSelecionados(new Set())
    } else {
      setSelecionados(new Set(listagem.map(i => i.id)))
    }
  }

  const listagem = inscritos.filter(i => {
    if (filtro === 'usuario')  return !!i.usuario
    if (filtro === 'visitante') return !i.usuario
    return true
  })

  const totalUsuarios  = inscritos.filter(i => !!i.usuario).length
  const totalVisitantes = inscritos.filter(i => !i.usuario).length
  const totalAdmins    = inscritos.filter(i => i.usuario?.role === 'ADMIN').length

  const enviar = async () => {
    if (!envioForm.assunto.trim() || !envioForm.mensagem.trim()) return
    setEnviando(true)
    setFeedbackEnvio(null)
    try {
      const destinatarios = selecionados.size > 0
        ? [...selecionados]
        : 'todos'
      const { data } = await api.post('/newsletter/enviar', {
        ...envioForm,
        destinatarios,
      })
      setFeedbackEnvio({ tipo: 'ok', texto: `Enviado para ${data.enviados} destinatário(s)!` })
      setEnvioForm({ assunto: '', mensagem: '' })
    } catch {
      setFeedbackEnvio({ tipo: 'erro', texto: 'Erro ao enviar.' })
    } finally {
      setEnviando(false)
    }
  }

  const getRoleInfo = (inscrito) => {
    if (!inscrito.usuario) return BADGE.VISITOR
    return BADGE[inscrito.usuario.role] ?? BADGE.VISITOR
  }

  return (
    <div style={{ padding: '1.5rem',  margin: '0 auto', fontFamily: 'DM Sans' }}>

      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>Newsletter</h1>
        <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0', fontSize: '0.875rem' }}>
          {inscritos.length} inscrito{inscritos.length !== 1 ? 's' : ''} ativos
        </p>
      </div>

      {/* Métricas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total',      valor: inscritos.length, icon: '📋', cor: 'var(--brand)' },
          { label: 'Clientes',   valor: totalUsuarios,    icon: '👤', cor: 'var(--success)' },
          { label: 'Visitantes', valor: totalVisitantes,  icon: '🌐', cor: 'var(--text-hint)' },
          { label: 'Admins',     valor: totalAdmins,      icon: '🛡️', cor: '#A78BFA' },
        ].map(({ label, valor, icon, cor }) => (
          <div key={label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span>{icon}</span>
              <div style={{ width: 3, height: 28, borderRadius: 2, background: cor }} />
            </div>
            <div style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.4rem', lineHeight: 1 }}>{valor}</div>
            <div style={{ color: 'var(--text-hint)', fontSize: '0.75rem', marginTop: '0.2rem' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Ações */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Filtros */}
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {[
            { key: 'todos',      label: 'Todos' },
            { key: 'usuario',    label: 'Clientes' },
            { key: 'visitante',  label: 'Visitantes' },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setFiltro(key)} style={{
              padding: '0.375rem 0.875rem',
              borderRadius: 20,
              fontSize: '0.8rem',
              fontWeight: 500,
              cursor: 'pointer',
              border: filtro === key ? 'none' : '1px solid var(--border)',
              background: filtro === key ? 'var(--brand)' : 'var(--surface)',
              color: filtro === key ? '#fff' : 'var(--text-secondary)',
            }}>
              {label}
            </button>
          ))}
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
          {selecionados.size > 0 && (
            <span style={{ color: 'var(--text-hint)', fontSize: '0.8rem', alignSelf: 'center' }}>
              {selecionados.size} selecionado(s)
            </span>
          )}
          <button onClick={() => { setModalEnvio(true); setFeedbackEnvio(null) }} style={{
            background: 'var(--brand)', color: '#fff', border: 'none',
            borderRadius: 8, padding: '0.5rem 1.25rem', cursor: 'pointer',
            fontWeight: 600, fontSize: '0.875rem',
          }}>
            ✉️ {selecionados.size > 0 ? `Enviar para ${selecionados.size}` : 'Enviar para todos'}
          </button>
        </div>
      </div>

      {/* Tabela */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[1,2,3].map(i => <div key={i} style={{ height: 48, borderRadius: 8, background: 'var(--card)', animation: 'pulse 1.5s infinite' }} />)}
        </div>
      ) : listagem.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-hint)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📭</div>
          Nenhum inscrito encontrado.
        </div>
      ) : (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', width: 40 }}>
                  <input type="checkbox"
                         checked={selecionados.size === listagem.length && listagem.length > 0}
                         onChange={toggleTodos} />
                </th>
                {['Email', 'Tipo', 'Nome / Conta', 'Inscrito em', 'Ação'].map(h => (
                  <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', color: 'var(--text-hint)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {listagem.map((s, idx) => {
                const badge = getRoleInfo(s)
                const sel = selecionados.has(s.id)
                return (
                  <tr key={s.id} style={{
                    background: sel ? 'var(--brand-dark)' : idx % 2 === 0 ? 'var(--card)' : 'var(--surface)',
                    borderBottom: '1px solid var(--border)',
                    transition: 'background 0.15s',
                  }}>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <input type="checkbox" checked={sel} onChange={() => toggleSel(s.id)} />
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                      {s.email}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{ background: badge.bg, color: badge.color, borderRadius: 20, padding: '2px 10px', fontSize: '0.75rem', fontWeight: 600 }}>
                        {badge.label}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                      {s.usuario ? (
                        <div>
                          <div style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{s.usuario.nome}</div>
                          <div style={{ color: 'var(--text-hint)', fontSize: '0.75rem' }}>{s.usuario.email}</div>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-hint)', fontStyle: 'italic' }}>Visitante sem conta</span>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-hint)', fontSize: '0.8rem' }}>
                      {new Date(s.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <button onClick={() => remover(s.id)} style={{
                        background: 'var(--danger-bg)', color: 'var(--danger)',
                        border: '1px solid var(--danger)', borderRadius: 8,
                        padding: '0.3rem 0.75rem', cursor: 'pointer', fontSize: '0.8rem',
                      }}>
                        Remover
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de envio */}
      {modalEnvio && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
             onClick={() => setModalEnvio(false)}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.5rem', width: '100%', maxWidth: 480 }}
               onClick={e => e.stopPropagation()}>

            <h2 style={{ color: 'var(--text-primary)', margin: '0 0 0.25rem', fontSize: '1.125rem', fontWeight: 700 }}>
              Enviar campanha
            </h2>
            <p style={{ color: 'var(--text-hint)', fontSize: '0.8rem', margin: '0 0 1.25rem' }}>
              {selecionados.size > 0
                ? `Para ${selecionados.size} selecionado(s)`
                : `Para todos os ${inscritos.length} inscritos`}
            </p>

            <label style={labelStyle}>Assunto</label>
            <input
              style={inputStyle}
              value={envioForm.assunto}
              onChange={e => setEnvioForm(f => ({ ...f, assunto: e.target.value }))}
              placeholder="Ex: Novidades do cardápio esta semana!"
            />

            <label style={labelStyle}>Mensagem</label>
            <textarea
              style={{ ...inputStyle, minHeight: 120, resize: 'vertical' }}
              value={envioForm.mensagem}
              onChange={e => setEnvioForm(f => ({ ...f, mensagem: e.target.value }))}
              placeholder="Escreva o conteúdo do email..."
            />

            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.75rem', marginBottom: '1rem', fontSize: '0.8rem', color: 'var(--text-hint)' }}>
              ⚠️ Integração com serviço de email (Resend/SendGrid) necessária para envio real. Por enquanto o envio é registrado no log do servidor.
            </div>

            {feedbackEnvio && (
              <div style={{
                marginBottom: '0.75rem', padding: '0.6rem 0.875rem', borderRadius: 8, fontSize: '0.875rem',
                background: feedbackEnvio.tipo === 'ok' ? 'var(--success-bg)' : 'var(--danger-bg)',
                color: feedbackEnvio.tipo === 'ok' ? 'var(--success)' : 'var(--danger)',
              }}>
                {feedbackEnvio.texto}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setModalEnvio(false)} style={btnSecondary}>Cancelar</button>
              <button onClick={enviar} disabled={enviando || !envioForm.assunto.trim() || !envioForm.mensagem.trim()} style={{
                ...btnPrimary,
                opacity: enviando || !envioForm.assunto.trim() || !envioForm.mensagem.trim() ? 0.5 : 1,
              }}>
                {enviando ? 'Enviando...' : '✉️ Enviar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const labelStyle = { display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.25rem', fontWeight: 500 }
const inputStyle = { width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.5rem 0.75rem', color: 'var(--text-primary)', fontSize: '0.875rem', marginBottom: '0.75rem', boxSizing: 'border-box', fontFamily: 'DM Sans' }
const btnPrimary = { background: 'var(--brand)', color: '#fff', border: 'none', borderRadius: 8, padding: '0.5rem 1.25rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }
const btnSecondary = { background: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '0.875rem' }