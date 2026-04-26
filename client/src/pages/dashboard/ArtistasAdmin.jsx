import { useEffect, useState, useRef } from 'react'
import api from '../../services/api'
import { API_BASE } from '../../config'

const REDES = [
  { key: 'instagram', label: 'Instagram', icon: '📸', placeholder: 'https://instagram.com/...' },
  { key: 'spotify',   label: 'Spotify',   icon: '🎧', placeholder: 'https://open.spotify.com/...' },
  { key: 'youtube',   label: 'YouTube',   icon: '▶️', placeholder: 'https://youtube.com/...' },
  { key: 'tiktok',    label: 'TikTok',    icon: '🎵', placeholder: 'https://tiktok.com/...' },
  { key: 'site',      label: 'Site',      icon: '🌐', placeholder: 'https://...' },
]
const GENEROS = ['Samba', 'MPB', 'Jazz', 'Rock', 'Sertanejo', 'Pagode', 'Forró', 'Eletrônico', 'Outro']
const vazio = { nome: '', bio: '', genero: '', instagram: '', spotify: '', youtube: '', tiktok: '', site: '', ativo: true }

export default function ArtistasAdmin() {
  const [artistas, setArtistas] = useState([])
  const [form, setForm]         = useState(vazio)
  const [editId, setEditId]     = useState(null)
  const [loading, setLoading]   = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro]         = useState('')
  const [imgUrlInput, setImgUrlInput] = useState('')
  const [imgMode, setImgMode]   = useState('upload') // 'upload' | 'url'
  const fileRef = useRef(null)

  const carregar = async () => {
    setLoading(true)
    const { data } = await api.get('/artistas')
    setArtistas(data)
    setLoading(false)
  }

  useEffect(() => { carregar() }, [])

  const salvar = async () => {
    if (!form.nome) { setErro('Nome é obrigatório'); return }
    setSalvando(true); setErro('')
    try {
      let artista
      if (editId) artista = (await api.put(`/artistas/${editId}`, { ...form, ativo: Boolean(form.ativo) })).data
      else        artista = (await api.post('/artistas', { ...form, ativo: Boolean(form.ativo) })).data

      // Upload imagem
      if (imgMode === 'upload' && fileRef.current?.files[0]) {
        const fd = new FormData()
        fd.append('imagem', fileRef.current.files[0])
        await api.put(`/artistas/${artista.id}/imagem`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      } else if (imgMode === 'url' && imgUrlInput) {
        await api.patch(`/artistas/${artista.id}/imagem-url`, { imagemUrl: imgUrlInput })
      }

      setForm(vazio); setEditId(null); setImgUrlInput(''); carregar()
    } catch { setErro('Erro ao salvar') }
    finally { setSalvando(false) }
  }

  const editar = (a) => {
    setForm({ nome: a.nome, bio: a.bio || '', genero: a.genero || '', instagram: a.instagram || '', spotify: a.spotify || '', youtube: a.youtube || '', tiktok: a.tiktok || '', site: a.site || '', ativo: a.ativo })
    setEditId(a.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const excluir = async (id) => {
    if (!confirm('Excluir artista?')) return
    await api.delete(`/artistas/${id}`)
    carregar()
  }

  const cancelar = () => { setForm(vazio); setEditId(null); setErro(''); setImgUrlInput('') }

  const inp = { width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 13, boxSizing: 'border-box', fontFamily: 'DM Sans' }
  const lbl = { fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--brand)', marginBottom: 4 }}>Dashboard</p>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Artistas & Bandas</h1>
      </div>

      {/* Formulário */}
      <div style={{ background: 'var(--card)', border: `1px solid ${editId ? 'var(--brand)' : 'var(--border)'}`, borderRadius: 14, padding: '1.5rem', marginBottom: 24 }}>
        <p style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, fontSize: 14 }}>
          {editId ? '✏️ Editando artista' : '➕ Novo artista'}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12, marginBottom: 16 }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={lbl}>Nome / Banda *</label>
            <input style={inp} placeholder="Nome do artista ou banda" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} />
          </div>
          <div>
            <label style={lbl}>Gênero musical</label>
            <select style={inp} value={form.genero} onChange={e => setForm(f => ({ ...f, genero: e.target.value }))}>
              <option value="">Selecione</option>
              {GENEROS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 20 }}>
            <input type="checkbox" id="ativoArtista" checked={form.ativo} onChange={e => setForm(f => ({ ...f, ativo: e.target.checked }))} />
            <label htmlFor="ativoArtista" style={{ ...lbl, margin: 0, cursor: 'pointer' }}>Artista ativo</label>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={lbl}>Bio / Descrição</label>
            <textarea style={{ ...inp, resize: 'none', height: 80 }} placeholder="Breve descrição do artista..." value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} />
          </div>
        </div>

        {/* Imagem */}
        <div style={{ marginBottom: 16 }}>
          <label style={lbl}>Foto / Capa</label>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            {['upload', 'url'].map(m => (
              <button key={m} onClick={() => setImgMode(m)} style={{ padding: '6px 14px', borderRadius: 8, border: `1px solid ${imgMode === m ? 'var(--brand)' : 'var(--border)'}`, background: imgMode === m ? 'var(--brand)' : 'transparent', color: imgMode === m ? '#fff' : 'var(--text-secondary)', fontSize: 12, cursor: 'pointer' }}>
                {m === 'upload' ? '📁 Upload' : '🔗 URL externa'}
              </button>
            ))}
          </div>
          {imgMode === 'upload'
            ? <input ref={fileRef} type="file" accept="image/*" style={{ ...inp, padding: '6px 12px' }} />
            : <input style={inp} placeholder="https://..." value={imgUrlInput} onChange={e => setImgUrlInput(e.target.value)} />
          }
        </div>

        {/* Redes sociais */}
        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Redes sociais</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10, marginBottom: 16 }}>
          {REDES.map(({ key, label, icon, placeholder }) => (
            <div key={key}>
              <label style={lbl}>{icon} {label}</label>
              <input style={inp} placeholder={placeholder} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
            </div>
          ))}
        </div>

        {erro && <p style={{ color: 'var(--danger)', fontSize: 12, marginBottom: 10 }}>{erro}</p>}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          {editId && <button onClick={cancelar} style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer' }}>Cancelar</button>}
          <button onClick={salvar} disabled={salvando} style={{ padding: '8px 24px', borderRadius: 8, border: 'none', background: 'var(--brand)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            {salvando ? 'Salvando...' : editId ? 'Salvar alterações' : 'Cadastrar artista'}
          </button>
        </div>
      </div>

      {/* Lista */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1,2,3].map(i => <div key={i} style={{ height: 90, borderRadius: 12, background: 'var(--card)' }} />)}
        </div>
      ) : artistas.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--card)', borderRadius: 14, border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🎤</div>
          <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Nenhum artista cadastrado</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {artistas.map(a => (
            <div key={a.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', opacity: a.ativo ? 1 : 0.6 }}>
              {/* Capa */}
              <div style={{ height: 120, background: 'var(--surface)', position: 'relative', overflow: 'hidden' }}>
                {a.imagemUrl
                  ? <img src={a.imagemUrl.startsWith('http') ? a.imagemUrl : `${API_BASE}${a.imagemUrl}`} alt={a.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>🎤</div>
                }
                {!a.ativo && <div style={{ position: 'absolute', top: 8, right: 8, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: 'var(--warning-bg)', color: 'var(--warning)' }}>Inativo</div>}
              </div>

              <div style={{ padding: '12px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', margin: 0 }}>{a.nome}</p>
                    {a.genero && <p style={{ fontSize: 11, color: 'var(--brand)', margin: '2px 0 0' }}>{a.genero}</p>}
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-hint)' }}>{a._count?.shows || 0} show{a._count?.shows !== 1 ? 's' : ''}</span>
                </div>
                {a.bio && <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '6px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{a.bio}</p>}

                {/* Redes */}
                <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
                  {REDES.filter(r => a[r.key]).map(r => (
                    <a key={r.key} href={a[r.key]} target="_blank" rel="noreferrer" style={{ fontSize: 16, textDecoration: 'none' }} title={r.label}>{r.icon}</a>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => editar(a)} style={{ flex: 1, padding: '6px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer' }}>✏️ Editar</button>
                  <button onClick={() => excluir(a.id)} style={{ padding: '6px 10px', borderRadius: 8, border: 'none', background: 'var(--danger-bg)', color: 'var(--danger)', fontSize: 12, cursor: 'pointer' }}>🗑️</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}