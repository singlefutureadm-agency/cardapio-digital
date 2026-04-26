import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, Cell } from 'recharts'
import api from '../../services/api'
import { API_BASE } from '../../config'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px' }}>
      {label && <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4 }}>{label}</p>}
      {payload.map((p, i) => <p key={i} style={{ fontSize: 13, fontWeight: 600, color: p.color, margin: 0 }}>{p.name}: {p.value}</p>)}
    </div>
  )
}

export default function ShowMetricas() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [dados, setDados] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/shows/${id}/metricas`)
      .then(({ data }) => setDados(data))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[1,2,3].map(i => <div key={i} style={{ height: 120, borderRadius: 14, background: 'var(--card)' }} />)}
      </div>
    </div>
  )

  if (!dados) return <p style={{ color: 'var(--text-secondary)' }}>Show não encontrado</p>

  const { show, totalAvaliacoes, notaMedia, distribuicaoNotas, pedidosDia, receitaDia, mediaDiaria7d, crescimentoPedidos, comentarios } = dados

  const estrelas = (n) => Array.from({ length: 5 }).map((_, i) => (
    <span key={i} style={{ color: i < n ? '#F59E0B' : 'var(--border)', fontSize: 16 }}>★</span>
  ))

  const corCrescimento = crescimentoPedidos > 0 ? 'var(--success)' : crescimentoPedidos < 0 ? 'var(--danger)' : 'var(--text-secondary)'

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>

      {/* Header */}
      <button onClick={() => navigate('/dashboard/shows')} style={{ background: 'none', border: 'none', color: 'var(--brand)', cursor: 'pointer', fontSize: 13, fontWeight: 600, marginBottom: 16, padding: 0 }}>
        ← Voltar aos shows
      </button>

      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap' }}>
        {show.artista?.imagemUrl && (
          <img src={show.artista.imagemUrl.startsWith('http') ? show.artista.imagemUrl : `${API_BASE}${show.artista.imagemUrl}`} alt={show.artista.nome} style={{ width: 80, height: 80, borderRadius: 14, objectFit: 'cover', flexShrink: 0 }} />
        )}
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--brand)', marginBottom: 4 }}>Relatório pós-show</p>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px' }}>{show.titulo}</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
            {show.artista && `🎤 ${show.artista.nome} · `}
            📅 {new Date(show.data).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
            {` · 🕐 ${show.horario}`}
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Nota média', valor: notaMedia ? `${notaMedia.toFixed(1)} ⭐` : 'Sem avaliações', cor: '#F59E0B', icon: '⭐' },
          { label: 'Avaliações', valor: totalAvaliacoes, cor: 'var(--brand)', icon: '📝' },
          { label: 'Pedidos no dia', valor: pedidosDia, cor: '#10B981', icon: '🍽️' },
          { label: 'Receita no dia', valor: `R$ ${receitaDia.toFixed(2)}`, cor: '#6366f1', icon: '💰' },
          { label: 'Média 7 dias antes', valor: mediaDiaria7d, cor: 'var(--text-secondary)', icon: '📊' },
          {
            label: 'Impacto nos pedidos',
            valor: crescimentoPedidos !== null ? `${crescimentoPedidos > 0 ? '+' : ''}${crescimentoPedidos}%` : 'N/A',
            cor: corCrescimento,
            icon: crescimentoPedidos > 0 ? '📈' : crescimentoPedidos < 0 ? '📉' : '➡️',
          },
        ].map(kpi => (
          <div key={kpi.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', margin: '0 0 6px' }}>{kpi.label}</p>
                <p style={{ fontSize: 20, fontWeight: 700, color: kpi.cor, margin: 0 }}>{kpi.valor}</p>
              </div>
              <span style={{ fontSize: 22 }}>{kpi.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>

        {/* Distribuição de notas */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.25rem' }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 16px' }}>Distribuição das notas</p>
          {totalAvaliacoes === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-hint)' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📝</div>
              <p style={{ fontSize: 13 }}>Nenhuma avaliação ainda</p>
            </div>
          ) : (
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distribuicaoNotas} margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="nota" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} tickFormatter={v => `${v}★`} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text-hint)' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Avaliações" radius={[6,6,0,0]}>
                    {distribuicaoNotas.map((_, i) => <Cell key={i} fill={['#EF4444','#F97316','#F59E0B','#84CC16','#10B981'][i]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Comparativo pedidos */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.25rem' }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 16px' }}>Pedidos: show vs média</p>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[{ name: 'Média 7d', pedidos: mediaDiaria7d }, { name: 'Dia do show', pedidos: pedidosDia }]} margin={{ left: 0, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-hint)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="pedidos" name="Pedidos" radius={[6,6,0,0]}>
                  <Cell fill="var(--border)" />
                  <Cell fill="var(--brand)" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Comentários */}
      {comentarios.length > 0 && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.25rem' }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 16px' }}>
            💬 Comentários ({comentarios.length})
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {comentarios.map(a => (
              <div key={a.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff' }}>
                      {a.user.nome.charAt(0)}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{a.user.nome}</span>
                  </div>
                  <div>{estrelas(a.nota)}</div>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>{a.comentario}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}