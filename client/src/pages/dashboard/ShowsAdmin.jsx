import { useEffect, useState } from 'react'
import api from '../../services/api'
import { useNavigate } from 'react-router-dom'

const GENEROS = ['Samba', 'MPB', 'Jazz', 'Rock', 'Sertanejo', 'Pagode', 'Forró', 'Eletrônico', 'Outro']
const vazio = { titulo: '', artistaId: '', genero: '', descricao: '', data: '', horario: '', ativo: true }
const API_BASE = 'http://localhost:3001'

export default function ShowsAdmin() {
  const navigate = useNavigate()
  const [shows, setShows]       = useState([])
  const [artistas, setArtistas] = useState([])
  const [form, setForm]         = useState(vazio)
  const [editId, setEditId]     = useState(null)
  const [loading, setLoading]   = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro]         = useState('')

  const carregar = async () => {
    setLoading(true)
    const [{ data: s }, { data: a }] = await Promise.all([api.get('/shows'), api.get('/artistas')])
    setShows(s); setArtistas(a); setLoading(false)
  }

  useEffect(() => { carregar() }, [])

  const salvar = async () => {
    if (!form.titulo || !form.data || !form.horario) { setErro('Título, data e horário são obrigatórios'); return }
    setSalvando(true); setErro('')
    try {
      const payload = { ...form, ativo: Boolean(form.ativo), artistaId: form.artistaId || null }
      if (editId) await api.put(`/shows/${editId}`, payload)
      else        await api.post('/shows', payload)
      setForm(vazio); setEditId(null); carregar()
    } catch { setErro('Erro ao salvar') }
    finally { setSalvando(false) }
  }

  const editar = (s) => {
    setForm({ titulo: s.titulo, artistaId: s.artistaId || '', genero: s.genero || '', descricao: s.descricao || '', data: s.data?.slice(0, 10), horario: s.horario, ativo: s.ativo })
    setEditId(s.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const excluir = async (id) => {
    if (!confirm('Excluir show?')) return
    await api.delete(`/shows/${id}`); carregar()
  }

  const inp = { width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 13, boxSizing: 'border-box', fontFamily: 'DM Sans' }
  const lbl = { fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }
  const formatarData = (d) => new Date(d).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--brand)', marginBottom: 4 }}>Dashboard</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Calendário de Shows</h1>
          <button onClick={() => navigate('/dashboard/artistas')} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer' }}>
            🎤 Gerenciar Artistas
          </button>
        </div>
      </div>

      {/* Formulário */}
      <div style={{ background: 'var(--card)', border: `1px solid ${editId ? 'var(--brand)' : 'var(--border)'}`, borderRadius: 14, padding: '1.5rem', marginBottom: 24 }}>
        <p style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, fontSize: 14 }}>{editId ? '✏️ Editando show' : '➕ Novo show'}</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 12 }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={lbl}>Título *</label>
            <input style={inp} placeholder="Nome do show ou evento" value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} />
          </div>
          <div>
            <label style={lbl}>Artista / Banda</label>
            <select style={inp} value={form.artistaId} onChange={e => setForm(f => ({ ...f, artistaId: e.target.value }))}>
              <option value="">Sem artista vinculado</option>
              {artistas.filter(a => a.ativo).map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Gênero</label>
            <select style={inp} value={form.genero} onChange={e => setForm(f => ({ ...f, genero: e.target.value }))}>
              <option value="">Selecione</option>
              {GENEROS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Data *</label>
            <input style={inp} type="date" value={form.data} onChange={e => setForm(f => ({ ...f, data: e.target.value }))} />
          </div>
          <div>
            <label style={lbl}>Horário *</label>
            <input style={inp} type="time" value={form.horario} onChange={e => setForm(f => ({ ...f, horario: e.target.value }))} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={lbl}>Descrição</label>
            <textarea style={{ ...inp, resize: 'none', height: 72 }} placeholder="Detalhes do evento..." value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" id="showAtivo" checked={form.ativo} onChange={e => setForm(f => ({ ...f, ativo: e.target.checked }))} />
            <label htmlFor="showAtivo" style={{ ...lbl, margin: 0, cursor: 'pointer' }}>Show ativo (visível)</label>
          </div>
        </div>
        {erro && <p style={{ color: 'var(--danger)', fontSize: 12, marginBottom: 10 }}>{erro}</p>}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          {editId && <button onClick={() => { setForm(vazio); setEditId(null) }} style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer' }}>Cancelar</button>}
          <button onClick={salvar} disabled={salvando} style={{ padding: '8px 24px', borderRadius: 8, border: 'none', background: 'var(--brand)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            {salvando ? 'Salvando...' : editId ? 'Salvar' : 'Criar show'}
          </button>
        </div>
      </div>

      {/* Lista */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1,2,3].map(i => <div key={i} style={{ height: 80, borderRadius: 12, background: 'var(--card)' }} />)}
        </div>
      ) : shows.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--card)', borderRadius: 14, border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🎸</div>
          <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Nenhum show cadastrado</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {shows.map(s => {
            const passado = new Date(s.data) < new Date()
            return (
              <div key={s.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, opacity: passado ? 0.7 : 1 }}>
                {/* Foto artista ou data box */}
                {s.artista?.imagemUrl ? (
                  <img src={s.artista.imagemUrl.startsWith('http') ? s.artista.imagemUrl : `${API_BASE}${s.artista.imagemUrl}`} alt={s.artista.nome} style={{ width: 52, height: 52, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 52, flexShrink: 0, textAlign: 'center', background: s.ativo && !passado ? 'var(--brand)' : 'var(--surface)', borderRadius: 10, padding: '8px 4px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: s.ativo && !passado ? '#fff' : 'var(--text-secondary)', lineHeight: 1 }}>{new Date(s.data).getUTCDate()}</div>
                    <div style={{ fontSize: 10, fontWeight: 600, color: s.ativo && !passado ? 'rgba(255,255,255,0.75)' : 'var(--text-hint)', textTransform: 'uppercase' }}>{new Date(s.data).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</div>
                  </div>
                )}

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{s.titulo}</span>
                    {s.artista && <span style={{ fontSize: 12, color: 'var(--brand)' }}>🎤 {s.artista.nome}</span>}
                    {s.genero && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>{s.genero}</span>}
                    {!s.ativo && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: 'var(--warning-bg)', color: 'var(--warning)' }}>Inativo</span>}
                    {passado && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: 'var(--surface)', color: 'var(--text-hint)' }}>Encerrado</span>}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>
                    🕐 {s.horario} · 📅 {formatarData(s.data)}
                    {s._count?.avaliacoes > 0 && ` · ⭐ ${s._count.avaliacoes} avaliação${s._count.avaliacoes !== 1 ? 'ões' : ''}`}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  {passado && (
                    <button onClick={() => navigate(`/dashboard/shows/${s.id}/metricas`)} style={{ padding: '6px 12px', borderRadius: 8, border: 'none', background: 'var(--brand)', color: '#fff', fontSize: 12, cursor: 'pointer' }}>
                      📊 Métricas
                    </button>
                  )}
                  <button onClick={() => editar(s)} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer' }}>✏️</button>
                  <button onClick={() => excluir(s.id)} style={{ padding: '6px 10px', borderRadius: 8, border: 'none', background: 'var(--danger-bg)', color: 'var(--danger)', fontSize: 12, cursor: 'pointer' }}>🗑️</button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}