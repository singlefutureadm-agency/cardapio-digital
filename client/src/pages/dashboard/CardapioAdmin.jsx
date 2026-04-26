import { useEffect, useState, useRef } from 'react'
import api from '../../services/api'

const VAZIO = { nome: '', descricao: '', preco: '', categoriaId: '', disponivel: true }
const API_BASE = 'http://localhost:3001'

export default function CardapioAdmin() {
  const [itens, setItens]               = useState([])
  const [categorias, setCategorias]     = useState([])
  const [modal, setModal]               = useState(false)
  const [form, setForm]                 = useState(VAZIO)
  const [editandoId, setEditandoId]     = useState(null)
  const [loading, setLoading]           = useState(true)
  const [salvando, setSalvando]         = useState(false)
  const [uploadandoId, setUploadandoId] = useState(null)
  const inputImagemRef                  = useRef(null)
  const [imagemPreview, setImagemPreview] = useState(null)
  const [imagemFile, setImagemFile]     = useState(null)

  const carregar = () =>
    Promise.all([api.get('/admin/menu'), api.get('/admin/menu/categorias')]).then(
      ([itensRes, catRes]) => {
        setItens(itensRes.data)
        setCategorias(catRes.data)
        setLoading(false)
      }
    )

  useEffect(() => { carregar() }, [])

  const abrirCriar = () => {
    setForm(VAZIO)
    setEditandoId(null)
    setImagemPreview(null)
    setImagemFile(null)
    setModal(true)
  }

  const abrirEditar = (item) => {
    setForm({
      nome: item.nome,
      descricao: item.descricao || '',
      preco: item.preco,
      categoriaId: item.categoriaId,
      disponivel: item.disponivel,
    })
    setEditandoId(item.id)
    setImagemPreview(item.imagemUrl ? `${API_BASE}${item.imagemUrl}` : null) // ← corrigido
    setImagemFile(null)
    setModal(true)
  }

  const salvar = async () => {
    setSalvando(true)
    try {
      const payload = { ...form, preco: Number(form.preco), categoriaId: Number(form.categoriaId) }
      let itemId = editandoId

      if (editandoId) {
        await api.put(`/admin/menu/${editandoId}`, payload)
      } else {
        const { data } = await api.post('/admin/menu', payload)
        itemId = data.id
      }

      if (imagemFile && itemId) {
        const fd = new FormData()
        fd.append('imagem', imagemFile)
        await api.put(`/admin/menu/${itemId}/imagem`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      }

      setModal(false)
      carregar()
    } finally {
      setSalvando(false)
    }
  }

  const removerImagem = async (id) => {
    if (!confirm('Remover imagem deste item?')) return
    setUploadandoId(id)
    try {
      await api.delete(`/admin/menu/${id}/imagem`)
      carregar()
      if (editandoId === id) {
        setImagemPreview(null)
        setImagemFile(null)
      }
    } finally {
      setUploadandoId(null)
    }
  }

  const onSelecionarImagem = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImagemFile(file)
    setImagemPreview(URL.createObjectURL(file))
  }

  const toggle  = async (id) => { await api.patch(`/admin/menu/${id}/toggle`); carregar() }
  const excluir = async (id) => {
    if (!confirm('Excluir este item?')) return
    await api.delete(`/admin/menu/${id}`)
    carregar()
  }

  const inputStyle = {
    background: 'var(--surface)', border: '1px solid var(--border)',
    color: 'var(--text-primary)', fontFamily: 'DM Sans',
    borderRadius: '12px', padding: '10px 14px',
    width: '100%', outline: 'none', fontSize: '14px',
  }
  const labelStyle = {
    display: 'block', fontSize: '11px', fontWeight: '600',
    textTransform: 'uppercase', letterSpacing: '0.08em',
    color: 'var(--text-secondary)', marginBottom: '6px',
  }

  return (
    <div className="p-8" style={{ color: 'var(--text-primary)', fontFamily: 'DM Sans' }}>

      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1"
             style={{ color: 'var(--brand)', letterSpacing: '0.12em' }}>Dashboard</p>
          <h1 className="font-display text-2xl font-medium" style={{ color: 'var(--text-primary)' }}>Cardápio</h1>
        </div>
        <button onClick={abrirCriar}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] hover:scale-[1.02]"
                style={{ background: 'var(--brand)', color: '#fff', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
          + Novo item
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: 'var(--card)' }} />)}
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)' }}>
                {['Imagem', 'Item', 'Categoria', 'Preço', 'Disponível', 'Ações'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-medium" style={{ color: 'var(--text-secondary)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {itens.map((item, idx) => (
                <tr key={item.id} style={{
                  background: idx % 2 === 0 ? 'var(--surface)' : 'var(--card)',
                  borderBottom: '1px solid var(--border)',
                }}>
                  <td className="px-4 py-3">
                    <div style={{ width: 52, height: 52, borderRadius: 10, background: 'var(--brand-light)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {uploadandoId === item.id ? (
                        <div style={{ width: 16, height: 16, border: '2px solid var(--brand)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                      ) : item.imagemUrl ? ( // ← corrigido
                        <img src={`${API_BASE}${item.imagemUrl}`} alt={item.nome} // ← corrigido
                             style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontSize: '1.5rem' }}>🍴</span>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{item.nome}</p>
                    {item.descricao && (
                      <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--text-hint)' }}>{item.descricao}</p>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                          style={{ background: 'var(--brand-light)', color: 'var(--brand)' }}>
                      {item.categoria?.nome}
                    </span>
                  </td>

                  <td className="px-4 py-3 font-semibold" style={{ color: 'var(--brand)' }}>
                    R$ {Number(item.preco).toFixed(2).replace('.', ',')}
                  </td>

                  <td className="px-4 py-3">
                    <button onClick={() => toggle(item.id)}
                            className="w-10 h-6 rounded-full transition-all relative flex-shrink-0"
                            style={{ background: item.disponivel ? 'var(--brand)' : 'var(--border)' }}>
                      <span className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all"
                            style={{ left: item.disponivel ? '20px' : '4px' }} />
                    </button>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex gap-2 flex-wrap">
                      <button onClick={() => abrirEditar(item)}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:opacity-80"
                              style={{ background: 'var(--card)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                        Editar
                      </button>
                      {item.imagemUrl && ( // ← corrigido
                        <button onClick={() => removerImagem(item.id)}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium"
                                style={{ background: 'var(--warning-bg)', color: 'var(--warning)', border: '1px solid var(--warning)' }}>
                          Sem foto
                        </button>
                      )}
                      <button onClick={() => excluir(item.id)}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium"
                              style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {itens.length === 0 && (
            <div className="py-16 text-center">
              <p style={{ fontSize: '40px', marginBottom: '12px' }}>🍽️</p>
              <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Nenhum item cadastrado</p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Clique em "+ Novo item" para começar</p>
            </div>
          )}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-4"
             style={{ background: 'rgba(0,0,0,0.7)' }}
             onClick={() => setModal(false)}>
          <div className="w-full max-w-md rounded-2xl p-6"
               style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 24px 48px rgba(0,0,0,0.3)', maxHeight: '90vh', overflowY: 'auto' }}
               onClick={e => e.stopPropagation()}>

            <h2 className="font-display text-lg font-medium mb-5" style={{ color: 'var(--text-primary)' }}>
              {editandoId ? 'Editar item' : 'Novo item'}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>

              {/* Upload */}
              <div>
                <label style={labelStyle}>
                  Imagem <span style={{ textTransform: 'none', fontWeight: 400, color: 'var(--text-hint)' }}>(opcional)</span>
                </label>
                <input ref={inputImagemRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onSelecionarImagem} />

                {imagemPreview ? (
                  <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', aspectRatio: '16/9', background: 'var(--surface)', border: '1px solid var(--border)' }}>
                    <img src={imagemPreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: '0.4rem' }}>
                      <button type="button" onClick={() => inputImagemRef.current?.click()}
                              style={{ background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: 8, padding: '0.3rem 0.6rem', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>
                        Trocar
                      </button>
                      <button type="button" onClick={() => { setImagemPreview(null); setImagemFile(null) }}
                              style={{ background: 'rgba(239,68,68,0.8)', color: '#fff', border: 'none', borderRadius: 8, padding: '0.3rem 0.6rem', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>
                        Remover
                      </button>
                    </div>
                  </div>
                ) : (
                  <button type="button" onClick={() => inputImagemRef.current?.click()}
                          style={{ width: '100%', aspectRatio: '16/9', background: 'var(--surface)', border: '2px dashed var(--border)', borderRadius: 12, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-hint)', transition: 'border-color 0.2s' }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--brand)'}
                          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                    <span style={{ fontSize: '2rem' }}>📷</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>Clique para adicionar foto</span>
                    <span style={{ fontSize: '0.7rem' }}>JPG, PNG, WEBP — recomendado 800x450px</span>
                  </button>
                )}
              </div>

              {/* Nome */}
              <div>
                <label style={labelStyle}>Nome</label>
                <input placeholder="Ex: Picanha na Brasa" value={form.nome}
                       onChange={e => setForm({ ...form, nome: e.target.value })}
                       style={inputStyle} autoFocus
                       onFocus={e => e.target.style.borderColor = 'var(--brand)'}
                       onBlur={e => e.target.style.borderColor = 'var(--border)'} />
              </div>

              {/* Descrição */}
              <div>
                <label style={labelStyle}>Descrição <span style={{ textTransform: 'none', fontWeight: 400, color: 'var(--text-hint)' }}>(opcional)</span></label>
                <input placeholder="Breve descrição do prato..." value={form.descricao}
                       onChange={e => setForm({ ...form, descricao: e.target.value })}
                       style={inputStyle}
                       onFocus={e => e.target.style.borderColor = 'var(--brand)'}
                       onBlur={e => e.target.style.borderColor = 'var(--border)'} />
              </div>

              {/* Preço + Categoria */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={labelStyle}>Preço</label>
                  <input placeholder="0,00" type="number" step="0.01" min="0" value={form.preco}
                         onChange={e => setForm({ ...form, preco: e.target.value })}
                         style={inputStyle}
                         onFocus={e => e.target.style.borderColor = 'var(--brand)'}
                         onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                </div>
                <div>
                  <label style={labelStyle}>Categoria</label>
                  <select value={form.categoriaId} onChange={e => setForm({ ...form, categoriaId: e.target.value })}
                          style={inputStyle}
                          onFocus={e => e.target.style.borderColor = 'var(--brand)'}
                          onBlur={e => e.target.style.borderColor = 'var(--border)'}>
                    <option value="">Selecione</option>
                    {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </div>
              </div>

              {/* Toggle disponível */}
              <div onClick={() => setForm({ ...form, disponivel: !form.disponivel })}
                   style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '0.75rem', borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div style={{ width: 40, height: 24, borderRadius: 99, position: 'relative', background: form.disponivel ? 'var(--brand)' : 'var(--border)', transition: 'background 0.2s', flexShrink: 0 }}>
                  <span style={{ position: 'absolute', top: 4, left: form.disponivel ? 20 : 4, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
                </div>
                <div>
                  <p style={{ color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 500, margin: 0 }}>
                    {form.disponivel ? 'Disponível no cardápio' : 'Indisponível'}
                  </p>
                  <p style={{ color: 'var(--text-hint)', fontSize: '0.75rem', margin: 0 }}>
                    {form.disponivel ? 'Clientes podem pedir este item' : 'Item oculto para os clientes'}
                  </p>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button onClick={() => setModal(false)}
                      style={{ flex: 1, padding: '0.625rem', borderRadius: 12, background: 'var(--surface)', color: 'var(--text-secondary)', border: '1px solid var(--border)', cursor: 'pointer', fontFamily: 'DM Sans', fontSize: '0.875rem' }}>
                Cancelar
              </button>
              <button onClick={salvar}
                      disabled={salvando || !form.nome || !form.preco || !form.categoriaId}
                      style={{ flex: 1, padding: '0.625rem', borderRadius: 12, background: 'var(--brand)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans', fontWeight: 600, fontSize: '0.875rem', opacity: salvando || !form.nome || !form.preco || !form.categoriaId ? 0.4 : 1 }}>
                {salvando ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}