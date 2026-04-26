import { useEffect, useState, useRef, useCallback } from 'react'
import api from '../../services/api'
import { API_BASE } from '../../config'

const PLANTA_W = 1200
const PLANTA_H = 600

const CORES_DISPONIVEIS = [
  '#10B981', '#3B82F6', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#C8520A', '#6B7280',
]

function getCor(mesa) {
  const cor = mesa.cor || '#10B981'
  return {
    fundo: cor + '22',
    borda: cor,
    texto: cor,
    badge: cor + '33',
    label: mesa.ativa ? 'DISPONÍVEL' : 'INATIVA',
  }
}

function cadeiras(total, raioMesa = 40, raioCadeira = 9) {
  const raio = raioMesa + raioCadeira + 6
  return Array.from({ length: total }, (_, i) => {
    const angulo = (i / total) * 2 * Math.PI - Math.PI / 2
    return { x: Math.cos(angulo) * raio, y: Math.sin(angulo) * raio }
  })
}

// ─── Mesa premium com glassmorphism ───────────────────────────────────────────
function MesaToken({ mesa, escala, selecionada, onClick, onMouseDown }) {
  const sel = selecionada?.id === mesa.id
  const cor = getCor(mesa)

  // Raio base escalado, mínimo garantido para não colapsar em telas pequenas
  const r = Math.max(24, 32 * Math.min(escala.x, escala.y))
  const raioCadeira = Math.max(7, 8 * Math.min(escala.x, escala.y))
  const posicaoCadeiras = cadeiras(mesa.lugares || 4, r, raioCadeira)
  const containerSize = (r + raioCadeira + 18) * 2

  return (
    <div
      onMouseDown={(e) => { e.preventDefault(); onMouseDown(e, mesa.id) }}
      onClick={(e) => { e.stopPropagation(); onClick(mesa) }}
      style={{
        position: 'absolute',
        left: mesa.posX * escala.x,
        top: mesa.posY * escala.y,
        transform: 'translate(-50%, -50%)',
        width: containerSize,
        height: containerSize,
        cursor: 'grab',
        userSelect: 'none',
        zIndex: sel ? 30 : 5,
        transition: 'filter 0.25s ease, z-index 0s',
        filter: sel
          ? `drop-shadow(0 0 20px ${cor.borda}cc) drop-shadow(0 0 8px ${cor.borda}66)`
          : `drop-shadow(0 4px 16px rgba(0,0,0,0.6)) drop-shadow(0 0 6px ${cor.borda}22)`,
      }}
    >
      {/* Cadeiras */}
      {posicaoCadeiras.map((pos, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`,
            width: raioCadeira * 2,
            height: raioCadeira * 2,
            borderRadius: '50%',
            background: 'rgba(15, 10, 5, 0.72)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: `1.5px solid ${cor.borda}55`,
            boxShadow: `inset 0 1px 2px rgba(255,255,255,0.10), 0 3px 8px rgba(0,0,0,0.55)`,
          }}
        />
      ))}

      {/* Corpo da mesa — glass premium */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: r * 2,
          height: r * 2,
          borderRadius: '50%',
          background: `
            radial-gradient(ellipse at 38% 28%, ${cor.borda}20 0%, transparent 58%),
            radial-gradient(ellipse at 65% 72%, ${cor.borda}0C 0%, transparent 52%),
            rgba(14, 10, 6, 0.62)
          `,
          backdropFilter: 'blur(18px) saturate(180%)',
          WebkitBackdropFilter: 'blur(18px) saturate(180%)',
          border: sel
            ? `1.5px solid rgba(255,255,255,0.45)`
            : `1.5px solid ${cor.borda}70`,
          boxShadow: sel
            ? `
                inset 0 2px 0 rgba(255,255,255,0.32),
                inset 0 -1px 0 rgba(0,0,0,0.5),
                0 0 0 2.5px ${cor.borda}99,
                0 0 32px ${cor.borda}88,
                0 10px 40px rgba(0,0,0,0.8)
              `
            : `
                inset 0 1.5px 0 rgba(255,255,255,0.20),
                inset 0 -1px 0 rgba(0,0,0,0.4),
                0 0 16px ${cor.borda}25,
                0 8px 24px rgba(0,0,0,0.65)
              `,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden',
        }}
      >
        {/* Reflexo superior */}
        <div style={{
          position: 'absolute',
          top: '7%', left: '16%',
          width: '68%', height: '35%',
          borderRadius: '50%',
          background: `radial-gradient(ellipse at 50% 0%, rgba(255,255,255,${sel ? '0.24' : '0.12'}) 0%, transparent 80%)`,
          pointerEvents: 'none',
        }} />

        {/* Reflexo cromático na cor da mesa */}
        <div style={{
          position: 'absolute',
          bottom: '12%', right: '14%',
          width: '28%', height: '18%',
          borderRadius: '50%',
          background: `radial-gradient(ellipse, ${cor.borda}30 0%, transparent 80%)`,
          pointerEvents: 'none',
        }} />

        {/* Texto Mesa */}
        <span style={{
          fontSize: Math.max(8, 9 * Math.min(escala.x, escala.y)),
          color: sel ? 'rgba(255,255,255,0.55)' : '#9A8A70',
          fontFamily: 'DM Sans, sans-serif',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          lineHeight: 1,
          textShadow: '0 1px 4px rgba(0,0,0,0.9)',
          position: 'relative', zIndex: 1,
        }}>Mesa</span>

        {/* Número */}
        <span style={{
          fontSize: Math.max(13, 18 * Math.min(escala.x, escala.y)),
          fontWeight: '700',
          color: sel ? '#fff' : cor.texto,
          fontFamily: 'Playfair Display, serif',
          lineHeight: 1.1,
          textShadow: sel
            ? `0 0 14px ${cor.borda}, 0 2px 8px rgba(0,0,0,0.95)`
            : `0 0 10px ${cor.borda}66, 0 2px 6px rgba(0,0,0,0.85)`,
          position: 'relative', zIndex: 1,
        }}>{mesa.numero}</span>

        {/* Lugares */}
        <span style={{
          fontSize: Math.max(7, 8 * Math.min(escala.x, escala.y)),
          color: sel ? `${cor.borda}dd` : '#6B5A40',
          fontFamily: 'DM Sans, sans-serif',
          lineHeight: 1,
          textShadow: '0 1px 3px rgba(0,0,0,0.8)',
          position: 'relative', zIndex: 1,
          marginTop: 1,
        }}>{mesa.lugares} lug.</span>
      </div>

      {/* Badge de status */}
      <div style={{
        position: 'absolute',
        bottom: -6,
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(14, 10, 6, 0.75)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        color: cor.texto,
        fontSize: Math.max(6, 7 * Math.min(escala.x, escala.y)),
        fontWeight: '800',
        letterSpacing: '0.10em',
        padding: `2px ${Math.max(5, 7 * escala.x)}px`,
        borderRadius: 4,
        whiteSpace: 'nowrap',
        fontFamily: 'DM Sans, sans-serif',
        border: `1px solid ${cor.borda}50`,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.10), 0 2px 8px rgba(0,0,0,0.55)`,
      }}>
        {cor.label}
      </div>
    </div>
  )
}

// ─── Componente principal ──────────────────────────────────────────────────────
export default function MesasAdmin() {
  const [mesas, setMesas]             = useState([])
  const [loading, setLoading]         = useState(true)
  const [selecionada, setSelecionada] = useState(null)
  const [modal, setModal]             = useState(false)
  const [modalPlanta, setModalPlanta] = useState(false)
  const [form, setForm]               = useState({ numero: '', lugares: 4, ativa: true, cor: '#10B981' })
  const [editandoId, setEditandoId]   = useState(null)
  const [salvando, setSalvando]       = useState(false)
  const [salvandoPos, setSalvandoPos] = useState(false)
  const [vista, setVista]             = useState('planta')
  const [plantaUrl, setPlantaUrl]     = useState(null)
  const [uploadando, setUploadando]   = useState(false)
  const [uploadErro, setUploadErro]   = useState(null)
  const [dragOver, setDragOver]       = useState(false)
  const [escala, setEscala]           = useState({ x: 1, y: 1 })

  const plantaRef    = useRef(null)
  const draggingId   = useRef(null)
  const dragOffset   = useRef({ x: 0, y: 0 })
  const mesasRef     = useRef([])
  const fileInputRef = useRef(null)

  // Recalcula escala com ResizeObserver
  useEffect(() => {
    if (vista !== 'planta') return
    const el = plantaRef.current
    if (!el) return
    const update = () => {
      const rect = el.getBoundingClientRect()
      if (rect.width > 0 && rect.height > 0) {
        setEscala({ x: rect.width / PLANTA_W, y: rect.height / PLANTA_H })
      }
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [vista, loading])

  const carregar = async () => {
    const [{ data: mesasData }, { data: plantaData }] = await Promise.all([
      api.get('/mesas'),
      api.get('/upload/planta/info').catch(() => ({ data: { url: null } })),
    ])
    if (plantaData.url) {
      setPlantaUrl(`${plantaData.url.startsWith('http') ? plantaData.url : `${API_BASE}${plantaData.url}`}?t=${Date.now()}`)
    }
    const semPosicao = mesasData.filter(m => m.posX === 0 && m.posY === 0)
    if (semPosicao.length > 0) {
      await Promise.all(semPosicao.map((m, i) => {
        const cols = 4
        return api.put(`/mesas/${m.id}`, { posX: 160 + (i % cols) * 260, posY: 160 + Math.floor(i / cols) * 220 })
      }))
      const { data: atualizado } = await api.get('/mesas')
      mesasRef.current = atualizado
      setMesas(atualizado)
    } else {
      mesasRef.current = mesasData
      setMesas(mesasData)
    }
    setLoading(false)
  }

  useEffect(() => { carregar() }, [])

  // Drag & Drop de mesas
  const onMouseDown = useCallback((e, mesaId) => {
    e.preventDefault(); e.stopPropagation()
    if (!plantaRef.current) return
    const rect = plantaRef.current.getBoundingClientRect()
    const escX = PLANTA_W / rect.width
    const escY = PLANTA_H / rect.height
    const mesa = mesasRef.current.find(m => m.id === mesaId)
    if (!mesa) return
    draggingId.current = mesaId
    dragOffset.current = {
      x: (e.clientX - rect.left) * escX - mesa.posX,
      y: (e.clientY - rect.top)  * escY - mesa.posY,
    }
    const onMove = (ev) => {
      if (!draggingId.current || !plantaRef.current) return
      const r = plantaRef.current.getBoundingClientRect()
      const newX = Math.min(Math.max((ev.clientX - r.left) * escX - dragOffset.current.x, 60), PLANTA_W - 60)
      const newY = Math.min(Math.max((ev.clientY - r.top)  * escY - dragOffset.current.y, 60), PLANTA_H - 60)
      setMesas(prev => {
        const upd = prev.map(m => m.id === draggingId.current ? { ...m, posX: newX, posY: newY } : m)
        mesasRef.current = upd
        return upd
      })
    }
    const onUp = async () => {
      if (!draggingId.current) return
      const id = draggingId.current
      const mesa = mesasRef.current.find(m => m.id === id)
      draggingId.current = null
      if (mesa) {
        setSalvandoPos(true)
        try { await api.put(`/mesas/${id}`, { posX: mesa.posX, posY: mesa.posY }) }
        finally { setSalvandoPos(false) }
      }
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [])

  const onClickMesa = (mesa) => setSelecionada(prev => prev?.id === mesa.id ? null : mesa)

  useEffect(() => {
    if (selecionada) {
      const atualizada = mesas.find(m => m.id === selecionada.id)
      if (atualizada) setSelecionada(atualizada)
    }
  }, [mesas])

  const handleUpload = async (file) => {
    if (!file) return
    const allowed = ['image/png', 'image/jpeg', 'image/webp']
    if (!allowed.includes(file.type)) { setUploadErro('Formato inválido. Use PNG, JPG ou WEBP.'); return }
    if (file.size > 5 * 1024 * 1024) { setUploadErro('Arquivo muito grande. Máximo 5MB.'); return }
    setUploadando(true); setUploadErro(null)
    try {
      const fd = new FormData()
      fd.append('planta', file)
      const { data } = await api.post('/upload/planta', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setPlantaUrl(`${data.url.startsWith('http') ? data.url : `${API_BASE}${data.url}`}?t=${Date.now()}`)
      setModalPlanta(false)
    } catch (err) {
      setUploadErro(err.response?.data?.error || 'Erro ao fazer upload.')
    } finally { setUploadando(false) }
  }

  const abrirCriar  = () => { setForm({ numero: '', lugares: 4, ativa: true, cor: '#10B981' }); setEditandoId(null); setModal(true) }
  const abrirEditar = (m) => { setForm({ numero: m.numero, lugares: m.lugares || 4, ativa: m.ativa, cor: m.cor || '#10B981' }); setEditandoId(m.id); setSelecionada(null); setModal(true) }

  const salvar = async () => {
    if (!form.numero.trim()) return
    setSalvando(true)
    try {
      editandoId
        ? await api.put(`/mesas/${editandoId}`, form)
        : await api.post('/mesas', { ...form, posX: PLANTA_W / 2, posY: PLANTA_H / 2 })
      setModal(false)
      await carregar()
    } finally { setSalvando(false) }
  }

  const toggleAtiva = async (m) => { await api.put(`/mesas/${m.id}`, { ativa: !m.ativa }); await carregar(); setSelecionada(null) }
  const excluir     = async (id) => { if (!confirm('Excluir esta mesa?')) return; await api.delete(`/mesas/${id}`); await carregar(); setSelecionada(null) }

  const ativas   = mesas.filter(m => m.ativa).length
  const inativas = mesas.filter(m => !m.ativa).length

  const inputStyle = {
    background: 'var(--surface)', border: '1px solid var(--border)',
    color: 'var(--text-primary)', fontFamily: 'DM Sans',
    borderRadius: '12px', padding: '10px 14px', width: '100%', outline: 'none', fontSize: '14px',
  }
  const labelStyle = {
    display: 'block', fontSize: '11px', fontWeight: '600',
    textTransform: 'uppercase', letterSpacing: '0.08em',
    color: 'var(--text-secondary)', marginBottom: '6px',
  }

  return (
    <div className="p-4 md:p-6" style={{ color: 'var(--text-primary)', fontFamily: 'DM Sans' }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1"
             style={{ color: 'var(--brand)', letterSpacing: '0.12em' }}>Dashboard</p>
          <h1 className="font-display text-2xl font-medium" style={{ color: 'var(--text-primary)' }}>
            Mesas
            {salvandoPos && (
              <span className="ml-3 text-xs font-normal animate-pulse" style={{ color: 'var(--text-hint)' }}>
                Salvando posição...
              </span>
            )}
          </h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            {[{ key: 'planta', label: '🏠 Planta' }, { key: 'lista', label: '☰ Lista' }].map(({ key, label }) => (
              <button key={key} onClick={() => setVista(key)}
                      className="px-4 py-2 text-xs font-semibold transition-colors"
                      style={{ background: vista === key ? 'var(--brand)' : 'var(--card)', color: vista === key ? '#fff' : 'var(--text-hint)' }}>
                {label}
              </button>
            ))}
          </div>
          <button onClick={() => setModalPlanta(true)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{ background: 'var(--card)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
            🖼 {plantaUrl ? 'Alterar planta' : 'Carregar planta'}
          </button>
          <button onClick={abrirCriar}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: 'var(--brand)', color: '#fff' }}>
            + Nova mesa
          </button>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Total',    valor: mesas.length, cor: 'var(--text-primary)' },
          { label: 'Ativas',   valor: ativas,       cor: 'var(--success)'      },
          { label: 'Inativas', valor: inativas,     cor: 'var(--danger)'       },
        ].map(({ label, valor, cor }) => (
          <div key={label} className="rounded-2xl p-4"
               style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>{label}</p>
            <p className="font-display text-3xl font-medium" style={{ color: cor }}>{valor}</p>
          </div>
        ))}
      </div>

      {/* ── PLANTA ── */}
      {vista === 'planta' && (
        <div className="space-y-3">

          {/* Painel de ação da mesa selecionada */}
          {selecionada && (
            <div
              className="rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3"
              style={{
                background: 'var(--card)',
                border: `1px solid ${selecionada.cor || 'var(--brand)'}44`,
                boxShadow: `0 0 0 1px ${selecionada.cor || 'var(--brand)'}18`,
              }}
            >
              <div className="flex items-center gap-3">
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: (selecionada.cor || '#10B981') + '22',
                  border: `2px solid ${selecionada.cor || '#10B981'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: selecionada.cor || '#10B981', fontFamily: 'Playfair Display' }}>
                    {selecionada.numero}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Mesa {selecionada.numero}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                    {selecionada.lugares} lugares ·{' '}
                    <span style={{ color: selecionada.ativa ? 'var(--success)' : 'var(--danger)' }}>
                      {selecionada.ativa ? '● Ativa' : '● Inativa'}
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => abrirEditar(selecionada)} className="px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:scale-[1.03]"
                        style={{ background: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>✏ Editar</button>
                <button onClick={() => toggleAtiva(selecionada)} className="px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:scale-[1.03]"
                        style={selecionada.ativa
                          ? { background: 'var(--danger-bg)', color: 'var(--danger)' }
                          : { background: 'var(--success-bg)', color: 'var(--success)' }}>
                  {selecionada.ativa ? '⏸ Desativar' : '▶ Ativar'}
                </button>
                <button onClick={() => excluir(selecionada.id)} className="px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:scale-[1.03]"
                        style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>🗑 Excluir</button>
                <button onClick={() => setSelecionada(null)} className="px-3 py-2 rounded-xl text-xs"
                        style={{ color: 'var(--text-hint)' }}>✕</button>
              </div>
            </div>
          )}

          <p className="text-xs" style={{ color: 'var(--text-hint)' }}>
            🖱 Arraste para reposicionar · Clique para selecionar · Posições salvas automaticamente
          </p>

          {/* ── Container da planta — largura máxima responsiva ── */}
          <div style={{
            width: '100%',
            maxWidth: '100%',
            borderRadius: '16px',
            overflow: 'hidden',
            border: '1px solid var(--border)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.35)',
            // Mantém aspect ratio 2:1 sem quebrar a proporção das mesas
            position: 'relative',
          }}>
            {/* Wrapper que mantém a proporção PLANTA_W:PLANTA_H */}
            <div style={{
              position: 'relative',
              width: '100%',
              paddingTop: `${(PLANTA_H / PLANTA_W) * 100}%`, // 50% = 2:1
            }}>

              {/* Fundo — imagem ou SVG padrão, ocupa todo o espaço */}
              <div style={{ position: 'absolute', inset: 0 }}>
                {plantaUrl ? (
                  <img
                    src={plantaUrl}
                    alt="Planta do restaurante"
                    draggable={false}
                    style={{
                      display: 'block',
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      userSelect: 'none',
                      pointerEvents: 'none',
                    }}
                  />
                ) : (
                  <svg
                    viewBox={`0 0 ${PLANTA_W} ${PLANTA_H}`}
                    preserveAspectRatio="xMidYMid slice"
                    style={{ display: 'block', width: '100%', height: '100%' }}
                  >
                    {/* Fundo base */}
                    <rect width={PLANTA_W} height={PLANTA_H} fill="#14100A" />

                    {/* Grid de piso */}
                    {Array.from({ length: 32 }).map((_, i) => (
                      <rect key={`row${i}`} x={0} y={i * 19} width={PLANTA_W} height={18}
                            fill={i % 2 === 0 ? '#191210' : '#171009'} />
                    ))}
                    {Array.from({ length: 16 }).map((_, i) => (
                      <line key={`ln${i}`} x1={0} y1={i * 38 + 10} x2={PLANTA_W} y2={i * 38 + 10}
                            stroke="#201610" strokeWidth="0.7" />
                    ))}

                    {/* Borda interna dupla — ambiente premium */}
                    <rect width={PLANTA_W} height={PLANTA_H} fill="none" stroke="#3D2E1C" strokeWidth="14" />
                    <rect x={8} y={8} width={PLANTA_W - 16} height={PLANTA_H - 16} fill="none" stroke="#251C10" strokeWidth="2" />

                    {/* Cozinha */}
                    <rect x={0} y={0} width={240} height={210} fill="#100D07" />
                    <rect x={10} y={10} width={220} height={190} fill="none" stroke="#302414" strokeWidth="1" strokeDasharray="7 5" />
                    <text x={120} y={110} textAnchor="middle" fill="#30240F" fontSize="15" fontFamily="DM Sans" fontWeight="700" letterSpacing="4">COZINHA</text>

                    {/* Balcão */}
                    <rect x={240} y={20} width={160} height={44} rx="5" fill="#221A0E" />
                    <rect x={244} y={24} width={152} height={36} rx="4" fill="#2C2210" stroke="#352A15" strokeWidth="1" />
                    <text x={320} y={47} textAnchor="middle" fill="#50401E" fontSize="11" fontFamily="DM Sans" letterSpacing="2">BALCÃO</text>

                    {/* Banquetas */}
                    {[268, 295, 322, 349].map(x => (
                      <ellipse key={x} cx={x} cy={78} rx={11} ry={8} fill="#201810" stroke="#2E2410" strokeWidth="1" />
                    ))}

                    {/* Janelas topo */}
                    {[420, 580, 740, 900, 1060].map(x => (
                      <g key={`wt${x}`}>
                        <rect x={x} y={4} width={90} height={12} rx="2" fill="#1A232E" />
                        <line x1={x + 45} y1={4} x2={x + 45} y2={16} stroke="#22303E" strokeWidth="1" />
                      </g>
                    ))}
                    {/* Janelas base */}
                    {[420, 580, 740, 900, 1060].map(x => (
                      <g key={`wb${x}`}>
                        <rect x={x} y={PLANTA_H - 18} width={90} height={14} rx="2" fill="#1A232E" />
                        <line x1={x + 45} y1={PLANTA_H - 18} x2={x + 45} y2={PLANTA_H - 4} stroke="#22303E" strokeWidth="1" />
                      </g>
                    ))}

                    {/* Entrada */}
                    <rect x={470} y={PLANTA_H - 14} width={160} height={14} fill="#221A0E" />
                    <text x={550} y={PLANTA_H - 22} textAnchor="middle" fill="#50401E" fontSize="11" fontFamily="DM Sans" letterSpacing="3">ENTRADA</text>

                    {/* Luminárias pendentes */}
                    {[360, 600, 840, 1080].map(x => (
                      <g key={`lp${x}`}>
                        <line x1={x} y1={0} x2={x} y2={60} stroke="#201810" strokeWidth="1" />
                        <ellipse cx={x} cy={65} rx={28} ry={14} fill="#1A1408" stroke="#2A2010" strokeWidth="1" />
                        <ellipse cx={x} cy={65} rx={12} ry={6} fill="#201A0A" />
                        <ellipse cx={x} cy={530} rx={28} ry={14} fill="#1A1408" stroke="#2A2010" strokeWidth="1" />
                        <ellipse cx={x} cy={530} rx={12} ry={6} fill="#201A0A" />
                      </g>
                    ))}

                    {/* Hint de ação */}
                    <rect x={PLANTA_W / 2 - 260} y={PLANTA_H - 52} width={520} height={30} rx="8" fill="rgba(200,82,10,0.10)" />
                    <text x={PLANTA_W / 2} y={PLANTA_H - 31} textAnchor="middle"
                          fill="#C8520A" fontSize="12" fontFamily="DM Sans" letterSpacing="0.5">
                      Clique em "Carregar planta" para personalizar o fundo
                    </text>
                  </svg>
                )}
              </div>

              {/* Overlay de mesas — referência de escala via ref */}
              <div
                ref={plantaRef}
                style={{ position: 'absolute', inset: 0 }}
                onClick={() => setSelecionada(null)}
              >
                {!loading && mesas.filter(m => m.ativa).map(mesa => (
                  <MesaToken
                    key={mesa.id}
                    mesa={mesa}
                    escala={escala}
                    selecionada={selecionada}
                    onClick={onClickMesa}
                    onMouseDown={onMouseDown}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Legenda */}
          <div className="flex items-center gap-4 flex-wrap pt-1">
            <span className="text-xs" style={{ color: 'var(--text-hint)' }}>Mesas ativas:</span>
            {mesas.filter(m => m.ativa).map(m => (
              <div key={m.id} className="flex items-center gap-1.5">
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: m.cor || '#10B981' }} />
                <span className="text-xs" style={{ color: 'var(--text-hint)' }}>Mesa {m.numero}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── LISTA ── */}
      {vista === 'lista' && (
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)' }}>
                {['Mesa', 'Lugares', 'Cor', 'Status', 'Posição', 'Ações'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-medium" style={{ color: 'var(--text-secondary)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mesas.map((mesa, idx) => (
                <tr key={mesa.id} style={{ background: idx % 2 === 0 ? 'var(--surface)' : 'var(--card)', borderBottom: '1px solid var(--border)' }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                           style={{ background: (mesa.cor || '#10B981') + '22', color: mesa.cor || '#10B981', border: `1.5px solid ${mesa.cor || '#10B981'}` }}>
                        {mesa.numero}
                      </div>
                      <span style={{ color: 'var(--text-primary)' }}>Mesa {mesa.numero}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(mesa.lugares, 8) }).map((_, i) => (
                        <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: mesa.cor || '#10B981', opacity: 0.7 }} />
                      ))}
                      <span className="ml-1 text-xs" style={{ color: 'var(--text-hint)' }}>{mesa.lugares}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: mesa.cor || '#10B981', border: '2px solid var(--border)' }} />
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                          style={mesa.ativa
                            ? { background: 'var(--success-bg)', color: 'var(--success)' }
                            : { background: 'var(--danger-bg)', color: 'var(--danger)' }}>
                      {mesa.ativa ? 'Ativa' : 'Inativa'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-hint)' }}>
                    x:{Math.round(mesa.posX)} y:{Math.round(mesa.posY)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => abrirEditar(mesa)} className="px-3 py-1.5 rounded-lg text-xs font-medium"
                              style={{ background: 'var(--surface)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>Editar</button>
                      <button onClick={() => toggleAtiva(mesa)} className="px-3 py-1.5 rounded-lg text-xs font-medium"
                              style={mesa.ativa
                                ? { background: 'var(--danger-bg)', color: 'var(--danger)' }
                                : { background: 'var(--success-bg)', color: 'var(--success)' }}>
                        {mesa.ativa ? 'Desativar' : 'Ativar'}
                      </button>
                      <button onClick={() => excluir(mesa.id)} className="px-3 py-1.5 rounded-lg text-xs font-medium"
                              style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>Excluir</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ═══ MODAL PLANTA ═══ */}
      {modalPlanta && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
          <div className="w-full max-w-lg rounded-2xl p-6 space-y-5"
               style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-display text-lg font-medium" style={{ color: 'var(--text-primary)' }}>Planta do restaurante</h2>
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Faça upload da planta baixa do seu espaço</p>
              </div>
              <button onClick={() => setModalPlanta(false)} style={{ color: 'var(--text-hint)', fontSize: '20px', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
            </div>
            <div className="rounded-xl p-4 space-y-2" style={{ background: 'var(--brand-light)', border: '1px solid ' + 'var(--brand)' + '33' }}>
              <p className="text-xs font-semibold" style={{ color: 'var(--brand)' }}>📐 Especificações recomendadas</p>
              <div className="grid grid-cols-2 gap-y-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                <span>• Dimensões: <strong style={{ color: 'var(--text-primary)' }}>1200 × 600 px</strong></span>
                <span>• Proporção: <strong style={{ color: 'var(--text-primary)' }}>2:1 (landscape)</strong></span>
                <span>• Formatos: <strong style={{ color: 'var(--text-primary)' }}>PNG, JPG, WEBP</strong></span>
                <span>• Tamanho máx: <strong style={{ color: 'var(--text-primary)' }}>5 MB</strong></span>
              </div>
            </div>
            <div onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                 onDragLeave={() => setDragOver(false)}
                 onDrop={(e) => { e.preventDefault(); setDragOver(false); handleUpload(e.dataTransfer.files[0]) }}
                 onClick={() => fileInputRef.current?.click()}
                 className="rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all"
                 style={{
                   border: `2px dashed ${dragOver ? 'var(--brand)' : 'var(--border)'}`,
                   background: dragOver ? 'var(--brand-light)' : 'var(--surface)',
                   padding: '40px 20px', minHeight: '140px',
                 }}>
              <input ref={fileInputRef} type="file" accept=".png,.jpg,.jpeg,.webp"
                     onChange={(e) => handleUpload(e.target.files[0])} style={{ display: 'none' }} />
              {uploadando ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
                       style={{ borderColor: 'var(--brand)', borderTopColor: 'transparent' }} />
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Enviando...</p>
                </div>
              ) : (
                <>
                  <span style={{ fontSize: '32px' }}>🖼️</span>
                  <div className="text-center">
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Arraste a imagem ou clique para selecionar</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-hint)' }}>PNG, JPG, WEBP · Máx. 5MB · 1200×600px recomendado</p>
                  </div>
                </>
              )}
            </div>
            {uploadErro && (
              <p className="text-sm px-4 py-2 rounded-xl" style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>⚠ {uploadErro}</p>
            )}
            {plantaUrl && (
              <div>
                <p className="text-xs font-semibold uppercase mb-2" style={{ color: 'var(--text-secondary)', letterSpacing: '0.08em' }}>Planta atual</p>
                <img src={plantaUrl} alt="Planta atual" className="w-full rounded-xl"
                     style={{ border: '1px solid var(--border)', maxHeight: '120px', objectFit: 'cover' }} />
              </div>
            )}
            <button onClick={() => setModalPlanta(false)} className="w-full py-2.5 rounded-xl text-sm font-medium"
                    style={{ background: 'var(--surface)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* ═══ MODAL MESA ═══ */}
      {modal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-4" style={{ background: 'rgba(0,0,0,0.75)' }}>
          <div className="w-full max-w-sm rounded-2xl p-6 space-y-4"
               style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <h2 className="font-display text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
              {editandoId ? 'Editar mesa' : 'Nova mesa'}
            </h2>
            <div>
              <label style={labelStyle}>Número / nome da mesa</label>
              <input placeholder="Ex: 1, VIP, Varanda..." value={form.numero}
                     onChange={e => setForm({ ...form, numero: e.target.value })}
                     style={inputStyle} autoFocus onKeyDown={e => e.key === 'Enter' && salvar()}
                     onFocus={(e) => e.target.style.borderColor = 'var(--brand)'}
                     onBlur={(e)  => e.target.style.borderColor = 'var(--border)'} />
            </div>
            <div>
              <label style={labelStyle}>Lugares — {form.lugares} assentos</label>
              <div className="flex items-center gap-3">
                <input type="range" min="1" max="12" step="1" value={form.lugares}
                       onChange={e => setForm({ ...form, lugares: Number(e.target.value) })}
                       style={{ flex: 1, accentColor: form.cor || 'var(--brand)' }} />
                <span className="font-display text-lg font-medium w-8 text-center" style={{ color: form.cor || 'var(--brand)' }}>
                  {form.lugares}
                </span>
              </div>
              <div style={{ marginTop: 12 }}>
                <svg width="100%" height="90" viewBox="-65 -45 130 90">
                  {cadeiras(form.lugares, 24, 6).map((pos, i) => (
                    <circle key={i} cx={pos.x} cy={pos.y} r={6} fill="#2A2A26" stroke={form.cor || '#10B981'} strokeWidth="1.5" />
                  ))}
                  <circle cx={0} cy={0} r={24} fill={(form.cor || '#10B981') + '22'} stroke={form.cor || '#10B981'} strokeWidth="2" />
                  <text x={0} y={-4} textAnchor="middle" fill={form.cor || '#10B981'} fontSize="9" fontFamily="DM Sans" fontWeight="600">Mesa</text>
                  <text x={0} y={9} textAnchor="middle" fill={form.cor || '#10B981'} fontSize="12" fontFamily="Playfair Display" fontWeight="700">{form.numero || '?'}</text>
                </svg>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Cor da mesa</label>
              <div className="flex items-center gap-2 flex-wrap">
                {CORES_DISPONIVEIS.map(cor => (
                  <button key={cor} onClick={() => setForm({ ...form, cor })}
                          style={{
                            width: 30, height: 30, borderRadius: '50%', background: cor,
                            cursor: 'pointer', border: 'none',
                            boxShadow: form.cor === cor ? `0 0 0 2px var(--card), 0 0 0 4px ${cor}` : '0 2px 4px rgba(0,0,0,0.3)',
                            transform: form.cor === cor ? 'scale(1.15)' : 'scale(1)',
                            transition: 'all 0.15s',
                          }} />
                ))}
                <label style={{ position: 'relative', cursor: 'pointer' }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: '50%',
                    background: CORES_DISPONIVEIS.includes(form.cor) ? 'var(--surface)' : form.cor,
                    border: '2px dashed var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, color: 'var(--text-hint)',
                  }}>
                    {CORES_DISPONIVEIS.includes(form.cor) ? '+' : '✓'}
                  </div>
                  <input type="color" value={form.cor || '#10B981'} onChange={e => setForm({ ...form, cor: e.target.value })}
                         style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
                </label>
              </div>
            </div>
            <div onClick={() => setForm({ ...form, ativa: !form.ativa })} className="flex items-center gap-3 cursor-pointer select-none">
              <div className="w-10 h-6 rounded-full relative transition-colors" style={{ background: form.ativa ? (form.cor || 'var(--brand)') : 'var(--border)' }}>
                <span className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all" style={{ left: form.ativa ? '20px' : '4px' }} />
              </div>
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{form.ativa ? 'Mesa ativa' : 'Mesa inativa'}</span>
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setModal(false)} className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                      style={{ background: 'var(--surface)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>Cancelar</button>
              <button onClick={salvar} disabled={salvando || !form.numero.trim()}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-40"
                      style={{ background: form.cor || 'var(--brand)', color: '#fff' }}>
                {salvando ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}