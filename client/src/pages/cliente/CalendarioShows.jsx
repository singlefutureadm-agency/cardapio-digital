import { useEffect, useState } from 'react'
import api from '../../services/api'
import { API_BASE } from '../../config'

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const GENERO_EMOJI = { Samba:'🪘', MPB:'🎵', Jazz:'🎷', Rock:'🎸', Sertanejo:'🤠', Pagode:'🥁', Forró:'🪗', Eletrônico:'🎛️', Outro:'🎤' }

function AvaliarShow({ show, onAvaliado }) {
  const [nota, setNota]           = useState(0)
  const [hover, setHover]         = useState(0)
  const [comentario, setComentario] = useState('')
  const [salvando, setSalvando]   = useState(false)
  const [avaliado, setAvaliado]   = useState(false)
  const [checando, setChecando]   = useState(true)

  useEffect(() => {
    api.get(`/shows/${show.id}/minha-avaliacao`)
      .then(({ data }) => { if (data) setAvaliado(true) })
      .catch(() => {})
      .finally(() => setChecando(false))
  }, [show.id])

  const enviar = async () => {
    if (!nota) return
    setSalvando(true)
    try {
      await api.post(`/shows/${show.id}/avaliar`, { nota, comentario })
      setAvaliado(true)
      onAvaliado?.()
    } finally { setSalvando(false) }
  }

  if (checando) return null

  if (avaliado) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderTop: '1px solid var(--border)', marginTop: 8 }}>
      <span style={{ fontSize: 16 }}>✅</span>
      <p style={{ fontSize: 12, color: 'var(--success)', margin: 0, fontWeight: 600 }}>Você avaliou este show!</p>
    </div>
  )

  return (
    <div style={{ borderTop: '1px solid var(--border)', marginTop: 10, paddingTop: 10 }}>
      <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-hint)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        Como foi o show?
      </p>
      <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
        {[1,2,3,4,5].map(n => (
          <button key={n}
            onClick={() => setNota(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, padding: 0, color: n <= (hover || nota) ? '#F59E0B' : 'var(--border)', transition: 'color 0.1s' }}>
            ★
          </button>
        ))}
        {nota > 0 && (
          <span style={{ fontSize: 11, color: 'var(--text-secondary)', alignSelf: 'center', marginLeft: 4 }}>
            {['','Ruim','Regular','Bom','Ótimo','Excelente!'][nota]}
          </span>
        )}
      </div>
      <textarea
        placeholder="Comentário opcional..."
        value={comentario}
        onChange={e => setComentario(e.target.value)}
        rows={2}
        style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 12, resize: 'none', boxSizing: 'border-box', fontFamily: 'DM Sans', marginBottom: 8 }}
      />
      <button
        onClick={enviar}
        disabled={!nota || salvando}
        style={{ width: '100%', padding: '8px', borderRadius: 8, border: 'none', background: nota ? 'var(--brand)' : 'var(--border)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: nota ? 'pointer' : 'not-allowed', transition: 'background 0.2s' }}>
        {salvando ? 'Enviando...' : 'Enviar avaliação'}
      </button>
    </div>
  )
}

export default function CalendarioShows() {
  const [shows, setShows]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [mesAtual, setMesAtual]   = useState(new Date())
  const [showSelecionado, setShowSelecionado] = useState(null)

  useEffect(() => {
    api.get('/shows/proximos')
      .then(({ data }) => setShows(data))
      .finally(() => setLoading(false))
  }, [])

  // ── Calendário ──
  const ano  = mesAtual.getFullYear()
  const mes  = mesAtual.getMonth()

  const primeiroDia    = new Date(ano, mes, 1).getDay()
  const diasNoMes      = new Date(ano, mes + 1, 0).getDate()
  const diasAnterior   = new Date(ano, mes, 0).getDate()

  const cells = []
  // Dias do mês anterior
  for (let i = primeiroDia - 1; i >= 0; i--) {
    cells.push({ dia: diasAnterior - i, mesAtual: false, data: new Date(ano, mes - 1, diasAnterior - i) })
  }
  // Dias do mês atual
  for (let i = 1; i <= diasNoMes; i++) {
    cells.push({ dia: i, mesAtual: true, data: new Date(ano, mes, i) })
  }
  // Completar até 42 células (6 semanas)
  const restante = 42 - cells.length
  for (let i = 1; i <= restante; i++) {
    cells.push({ dia: i, mesAtual: false, data: new Date(ano, mes + 1, i) })
  }

  const hoje = new Date()
  hoje.setHours(0,0,0,0)

  // Mapeia shows por data (chave: YYYY-MM-DD)
  const showsPorData = {}
  shows.forEach(s => {
    const d = new Date(s.data)
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}`
    if (!showsPorData[key]) showsPorData[key] = []
    showsPorData[key].push(s)
  })

  const getKey = (data) => {
    const d = new Date(data)
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
  }

  const showsDoMes = shows.filter(s => {
    const d = new Date(s.data)
    return d.getUTCFullYear() === ano && d.getUTCMonth() === mes
  })

  const proximosShows = shows.filter(s => new Date(s.data) >= hoje).slice(0, 3)
  const showsPassados = shows.filter(s => new Date(s.data) < hoje)

  const navMes = (dir) => setMesAtual(m => new Date(m.getFullYear(), m.getMonth() + dir, 1))

  if (loading) return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, padding: '1.25rem' }}>
      <div style={{ height: 280, borderRadius: 12, background: 'var(--surface)', animation: 'pulse 1.5s infinite' }} />
    </div>
  )

  if (shows.length === 0) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* ── Card do Calendário ── */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, padding: '1.25rem' }}>

        {/* Header do mês */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--brand)', margin: 0 }}>
              Agenda
            </p>
            <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: '2px 0 0', fontFamily: 'Playfair Display, serif' }}>
              {MESES[mes]} {ano}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => navMes(-1)} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
            <button onClick={() => navMes(1)}  style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
          </div>
        </div>

        {/* Dias da semana */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
          {DIAS_SEMANA.map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: 'var(--text-hint)', textTransform: 'uppercase', letterSpacing: '0.04em', padding: '4px 0' }}>
              {d}
            </div>
          ))}
        </div>

        {/* Células do calendário */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
          {cells.map((cell, i) => {
            const key       = getKey(cell.data)
            const temShow   = !!showsPorData[key]
            const showsCell = showsPorData[key] || []
            const isHoje    = cell.data.getTime() === hoje.getTime()
            const isSelecionado = showSelecionado && showsCell.some(s => s.id === showSelecionado?.id)
            const passado   = cell.data < hoje

            return (
              <button
                key={i}
                onClick={() => temShow ? setShowSelecionado(isSelecionado ? null : showsCell[0]) : null}
                style={{
                  aspectRatio: '1',
                  borderRadius: 8,
                  border: isSelecionado ? '2px solid var(--brand)' : isHoje ? '1px solid var(--brand)' : '1px solid transparent',
                  background: isSelecionado ? 'var(--brand)' : temShow && !passado ? 'var(--brand-light)' : 'transparent',
                  cursor: temShow ? 'pointer' : 'default',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2,
                  padding: '2px',
                  transition: 'all 0.15s',
                  position: 'relative',
                }}>
                <span style={{
                  fontSize: 12,
                  fontWeight: isHoje || temShow ? 700 : 400,
                  color: isSelecionado ? '#fff' : !cell.mesAtual ? 'var(--text-hint)' : isHoje ? 'var(--brand)' : temShow ? 'var(--brand)' : 'var(--text-primary)',
                  opacity: !cell.mesAtual ? 0.35 : 1,
                }}>
                  {cell.dia}
                </span>
                {temShow && cell.mesAtual && (
                  <div style={{ display: 'flex', gap: 1 }}>
                    {showsCell.slice(0,3).map((_, si) => (
                      <div key={si} style={{ width: 4, height: 4, borderRadius: '50%', background: isSelecionado ? '#fff' : 'var(--brand)' }} />
                    ))}
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Shows do mês */}
        {showsDoMes.length > 0 && (
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-hint)', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {showsDoMes.length} show{showsDoMes.length !== 1 ? 's' : ''} este mês
            </p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {showsDoMes.map(s => (
                <button
                  key={s.id}
                  onClick={() => setShowSelecionado(showSelecionado?.id === s.id ? null : s)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 20,
                    border: `1px solid ${showSelecionado?.id === s.id ? 'var(--brand)' : 'var(--border)'}`,
                    background: showSelecionado?.id === s.id ? 'var(--brand)' : 'var(--surface)',
                    color: showSelecionado?.id === s.id ? '#fff' : 'var(--text-secondary)',
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}>
                  {new Date(s.data).getUTCDate()} — {s.titulo}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Detalhe do show selecionado ── */}
      {showSelecionado && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--brand)', borderRadius: 16, padding: '1.25rem', position: 'relative' }}>
          <button
            onClick={() => setShowSelecionado(null)}
            style={{ position: 'absolute', top: 12, right: 12, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, width: 28, height: 28, cursor: 'pointer', fontSize: 14, color: 'var(--text-hint)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            ✕
          </button>

          {/* Foto artista */}
          {showSelecionado.artista?.imagemUrl && (
            <div style={{ width: '100%', height: 140, borderRadius: 12, overflow: 'hidden', marginBottom: 12, position: 'relative' }}>
              <img
                src={showSelecionado.artista.imagemUrl.startsWith('http') ? showSelecionado.artista.imagemUrl : `${API_BASE}${showSelecionado.artista.imagemUrl}`}
                alt={showSelecionado.artista.nome}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)' }} />
              <div style={{ position: 'absolute', bottom: 10, left: 12 }}>
                <p style={{ color: '#fff', fontWeight: 700, fontSize: 16, margin: 0, fontFamily: 'Playfair Display, serif' }}>
                  {showSelecionado.artista.nome}
                </p>
                {showSelecionado.artista.genero && (
                  <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11, margin: '2px 0 0' }}>{showSelecionado.artista.genero}</p>
                )}
              </div>
            </div>
          )}

          {/* Info do show */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--brand)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: '#fff', lineHeight: 1 }}>
                {new Date(showSelecionado.data).getUTCDate()}
              </span>
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase' }}>
                {new Date(showSelecionado.data).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}
              </span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <span style={{ fontSize: 14 }}>{GENERO_EMOJI[showSelecionado.genero] || '🎤'}</span>
                {showSelecionado.genero && (
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--brand)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {showSelecionado.genero}
                  </span>
                )}
              </div>
              <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', margin: '0 0 4px', fontFamily: 'Playfair Display, serif' }}>
                {showSelecionado.titulo}
              </p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>🕐 {showSelecionado.horario}</span>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  📅 {new Date(showSelecionado.data).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
                </span>
              </div>
              {showSelecionado.descricao && (
                <p style={{ fontSize: 12, color: 'var(--text-hint)', margin: '8px 0 0', lineHeight: 1.5 }}>
                  {showSelecionado.descricao}
                </p>
              )}
            </div>
          </div>

          {/* Redes sociais do artista */}
          {showSelecionado.artista && (
            <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
              {[
                { key: 'instagram', icon: '📸', label: 'Instagram' },
                { key: 'spotify',   icon: '🎧', label: 'Spotify' },
                { key: 'youtube',   icon: '▶️', label: 'YouTube' },
                { key: 'tiktok',    icon: '🎵', label: 'TikTok' },
                { key: 'site',      icon: '🌐', label: 'Site' },
              ].filter(r => showSelecionado.artista[r.key]).map(r => (
                <a key={r.key}
                   href={showSelecionado.artista[r.key]}
                   target="_blank"
                   rel="noreferrer"
                   style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 20, border: '1px solid var(--border)', background: 'var(--surface)', fontSize: 12, color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500 }}>
                  <span>{r.icon}</span>
                  <span>{r.label}</span>
                </a>
              ))}
            </div>
          )}

          {/* Avaliação se show passou */}
          {new Date(showSelecionado.data) < new Date() && (
            <AvaliarShow show={showSelecionado} onAvaliado={() => setShowSelecionado(null)} />
          )}
        </div>
      )}

      {/* ── Próximos shows (lista rápida) ── */}
      {proximosShows.length > 0 && !showSelecionado && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: '1rem 1.25rem' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-hint)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>
            Próximos shows
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {proximosShows.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setShowSelecionado(s)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: '8px', borderRadius: 10, transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: i === 0 ? 'var(--brand)' : 'var(--surface)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: i === 0 ? '#fff' : 'var(--text-primary)', lineHeight: 1 }}>
                    {new Date(s.data).getUTCDate()}
                  </span>
                  <span style={{ fontSize: 8, color: i === 0 ? 'rgba(255,255,255,0.75)' : 'var(--text-hint)', textTransform: 'uppercase' }}>
                    {new Date(s.data).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}
                  </span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {s.titulo}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                    {s.artista?.nome ? `🎤 ${s.artista.nome} · ` : ''}{s.horario}
                  </p>
                </div>
                <span style={{ fontSize: 12, color: 'var(--text-hint)' }}>›</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Shows para avaliar ── */}
      {showsPassados.length > 0 && !showSelecionado && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: '1rem 1.25rem' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-hint)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>
            Avalie os shows
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {showsPassados.slice(0,3).map(s => (
              <div key={s.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  {s.artista?.imagemUrl ? (
                    <img src={s.artista.imagemUrl.startsWith('http') ? s.artista.imagemUrl : `${API_BASE}${s.artista.imagemUrl}`} alt={s.artista.nome} style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: 32, height: 32, borderRadius: 6, background: 'var(--card)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🎤</div>
                  )}
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', margin: 0 }}>{s.titulo}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-hint)', margin: 0 }}>
                      {s.artista?.nome && `${s.artista.nome} · `}
                      {new Date(s.data).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <AvaliarShow show={s} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}