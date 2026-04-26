import { useEffect, useState, useCallback, useMemo } from 'react'
import api from '../../services/api'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, LineChart, Line, Area, AreaChart,
} from 'recharts'

const STATUS_CONFIG = {
  NOVO:       { label: 'Novo',      cor: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
  PREPARANDO: { label: 'Preparo',   cor: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  PRONTO:     { label: 'Pronto',    cor: '#10B981', bg: 'rgba(16,185,129,0.12)' },
  ENTREGUE:   { label: 'Entregue', cor: '#6B7280', bg: 'rgba(107,114,128,0.12)' },
  CANCELADO:  { label: 'Cancelado', cor: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
}

const METODO_CONFIG = {
  PIX:      { label: '📱 Pix',      cor: '#10B981' },
  CARTAO:   { label: '💳 Cartão',   cor: '#3B82F6' },
  DINHEIRO: { label: '💵 Dinheiro', cor: '#F59E0B' },
}

const CORES_GRAFICOS = ['#6366f1', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6']

const defaultFiltros = { mesa: '', status: '', dataInicio: '', dataFim: '' }

// ── Tooltip customizado ──
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', boxShadow: 'var(--shadow-md)' }}>
      {label && <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4 }}>{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ fontSize: 13, fontWeight: 600, color: p.color || 'var(--brand)', margin: 0 }}>
          {p.name}: {typeof p.value === 'number' && p.name?.toLowerCase().includes('receita') ? `R$ ${p.value.toFixed(2)}` : p.value}
        </p>
      ))}
    </div>
  )
}

// ── Card de gráfico ──
const GraficoCard = ({ titulo, subtitulo, children, altura = 260 }) => (
  <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.25rem' }}>
    <div style={{ marginBottom: 16 }}>
      <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{titulo}</p>
      {subtitulo && <p style={{ fontSize: 11, color: 'var(--text-hint)', margin: '2px 0 0' }}>{subtitulo}</p>}
    </div>
    <div style={{ height: altura }}>
      {children}
    </div>
  </div>
)

export default function HistoricoPedidos() {
  const [pedidos, setPedidos]     = useState([])
  const [meta, setMeta]           = useState({ total: 0, paginas: 1, page: 1 })
  const [filtros, setFiltros]     = useState(defaultFiltros)
  const [aplicados, setAplicados] = useState(defaultFiltros)
  const [loading, setLoading]     = useState(true)
  const [aberto, setAberto]       = useState(null)
  const [page, setPage]           = useState(1)
  const [abaAtiva, setAbaAtiva]   = useState('lista') // 'lista' | 'relatorio'

  const carregar = useCallback(async (f = aplicados, p = page) => {
    setLoading(true)
    try {
      const params = { page: p, limit: 100, ...Object.fromEntries(Object.entries(f).filter(([, v]) => v)) }
      const { data } = await api.get('/pedidos/historico', { params })
      setPedidos(data.pedidos)
      setMeta({ total: data.total, paginas: data.paginas, page: data.page })
    } finally {
      setLoading(false)
    }
  }, [aplicados, page])

  useEffect(() => { carregar() }, [carregar])

  const aplicarFiltros = () => { setPage(1); setAplicados(filtros) }
  const limparFiltros  = () => { setFiltros(defaultFiltros); setAplicados(defaultFiltros); setPage(1) }
  const mudarPagina    = (p) => { setPage(p); carregar(aplicados, p) }
  const totalFiltrosAtivos = Object.values(aplicados).filter(Boolean).length

  // ── Dados calculados para os gráficos ──
  const dadosGraficos = useMemo(() => {
    if (!pedidos.length) return {}

    // 1. Itens mais pedidos
    const contagemItens = {}
    pedidos.forEach(p => {
      p.itens.forEach(i => {
        const nome = i.menuItem?.nome || 'Item'
        contagemItens[nome] = (contagemItens[nome] || 0) + i.quantidade
      })
    })
    const itensMaisPedidos = Object.entries(contagemItens)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([nome, qtd]) => ({ nome: nome.length > 18 ? nome.slice(0, 18) + '…' : nome, quantidade: qtd }))

    // 2. Status dos pedidos (pizza)
    const contagemStatus = {}
    pedidos.forEach(p => {
      contagemStatus[p.status] = (contagemStatus[p.status] || 0) + 1
    })
    const dadosStatus = Object.entries(contagemStatus).map(([status, count]) => ({
      name: STATUS_CONFIG[status]?.label || status,
      value: count,
      cor: STATUS_CONFIG[status]?.cor || '#999',
    }))

    // 3. Pedidos por dia
    const porDia = {}
    pedidos.forEach(p => {
      const dia = new Date(p.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      if (!porDia[dia]) porDia[dia] = { dia, pedidos: 0, receita: 0 }
      porDia[dia].pedidos++
      porDia[dia].receita += Number(p.total)
    })
    const dadosDia = Object.values(porDia).slice(-14)

    // 4. Pedidos por mês
    const porMes = {}
    pedidos.forEach(p => {
      const mes = new Date(p.createdAt).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
      if (!porMes[mes]) porMes[mes] = { mes, pedidos: 0, receita: 0 }
      porMes[mes].pedidos++
      porMes[mes].receita += Number(p.total)
    })
    const dadosMes = Object.values(porMes)

    // 5. Método de pagamento
    const contagemMetodo = {}
    pedidos.forEach(p => {
      if (p.pagamento?.metodo) {
        const m = p.pagamento.metodo
        contagemMetodo[m] = (contagemMetodo[m] || 0) + 1
      }
    })
    const dadosMetodo = Object.entries(contagemMetodo).map(([metodo, count]) => ({
      name: METODO_CONFIG[metodo]?.label || metodo,
      value: count,
      cor: METODO_CONFIG[metodo]?.cor || '#999',
    }))

    // 6. Radar — top 6 itens por receita gerada
    const receitaItem = {}
    pedidos.forEach(p => {
      p.itens.forEach(i => {
        const nome = i.menuItem?.nome || 'Item'
        receitaItem[nome] = (receitaItem[nome] || 0) + Number(i.subtotal)
      })
    })
    const dadosRadar = Object.entries(receitaItem)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([nome, receita]) => ({
        item: nome.length > 14 ? nome.slice(0, 14) + '…' : nome,
        receita: Math.round(receita),
      }))

    // 7. KPIs
    const receitaTotal   = pedidos.reduce((acc, p) => acc + Number(p.total), 0)
    const ticketMedio    = receitaTotal / pedidos.length
    const totalItens     = pedidos.reduce((acc, p) => acc + p.itens.reduce((a, i) => a + i.quantidade, 0), 0)
    const taxaCancelamento = ((contagemStatus.CANCELADO || 0) / pedidos.length * 100).toFixed(1)

    return { itensMaisPedidos, dadosStatus, dadosDia, dadosMes, dadosMetodo, dadosRadar, receitaTotal, ticketMedio, totalItens, taxaCancelamento }
  }, [pedidos])

  const temDados = pedidos.length > 0

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--brand)', marginBottom: 4 }}>Dashboard</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
          <h1 style={{ fontFamily: 'var(--font-display, serif)', fontSize: 26, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            Histórico de Pedidos
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              {meta.total} pedido{meta.total !== 1 ? 's' : ''}
            </span>
            <button onClick={() => carregar()} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 13 }}>
              ↻ Atualizar
            </button>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.25rem', marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 14 }}>
          {[
            { key: 'mesa', label: 'Mesa', type: 'text', placeholder: 'Ex: 5' },
            { key: 'dataInicio', label: 'Data início', type: 'date' },
            { key: 'dataFim', label: 'Data fim', type: 'date' },
          ].map(({ key, label, type, placeholder }) => (
            <div key={key}>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>{label}</label>
              <input
                type={type}
                placeholder={placeholder}
                value={filtros[key]}
                onChange={e => setFiltros(f => ({ ...f, [key]: e.target.value }))}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 13, boxSizing: 'border-box' }}
              />
            </div>
          ))}
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Status</label>
            <select
              value={filtros.status}
              onChange={e => setFiltros(f => ({ ...f, status: e.target.value }))}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 13, boxSizing: 'border-box' }}
            >
              <option value="">Todos</option>
              {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          {totalFiltrosAtivos > 0 && (
            <button onClick={limparFiltros} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer' }}>
              Limpar ({totalFiltrosAtivos})
            </button>
          )}
          <button onClick={aplicarFiltros} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: 'var(--brand)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Filtrar
          </button>
        </div>
      </div>

      {/* Abas */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: 4, width: 'fit-content' }}>
        {[{ id: 'lista', label: '📋 Lista' }, { id: 'relatorio', label: '📊 Relatório' }].map(aba => (
          <button
            key={aba.id}
            onClick={() => setAbaAtiva(aba.id)}
            style={{ padding: '7px 20px', borderRadius: 7, border: 'none', background: abaAtiva === aba.id ? 'var(--brand)' : 'transparent', color: abaAtiva === aba.id ? '#fff' : 'var(--text-secondary)', fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 0.15s' }}
          >
            {aba.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1,2,3,4].map(i => <div key={i} style={{ height: 72, borderRadius: 12, background: 'var(--card)', opacity: 0.6 }} />)}
        </div>
      ) : !temDados ? (
        <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--card)', borderRadius: 14, border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
          <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Nenhum pedido encontrado</p>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Tente ajustar os filtros</p>
        </div>
      ) : abaAtiva === 'lista' ? (

        /* ══════════════ ABA LISTA ══════════════ */
        <>
          {/* Resumo rápido */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10, marginBottom: 20 }}>
            {Object.entries(pedidos.reduce((acc, p) => { acc[p.status] = (acc[p.status] || 0) + 1; return acc }, {}))
              .map(([status, count]) => {
                const cfg = STATUS_CONFIG[status]
                return (
                  <div key={status} style={{ background: cfg.bg, border: `1px solid ${cfg.cor}33`, borderRadius: 10, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: cfg.cor }}>{cfg.label}</span>
                    <span style={{ fontSize: 20, fontWeight: 700, color: cfg.cor }}>{count}</span>
                  </div>
                )
              })}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>Receita</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--brand)' }}>R$ {pedidos.reduce((acc, p) => acc + Number(p.total), 0).toFixed(2)}</span>
            </div>
          </div>

          {/* Lista de pedidos */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {pedidos.map(pedido => {
              const cfg = STATUS_CONFIG[pedido.status]
              const expandido = aberto === pedido.id
              const metodo = pedido.pagamento?.metodo
              const metodoCfg = metodo ? METODO_CONFIG[metodo] : null
              return (
                <div key={pedido.id} style={{ background: 'var(--card)', border: `1px solid ${expandido ? 'var(--brand)' : 'var(--border)'}`, borderRadius: 12, overflow: 'hidden', transition: 'border-color 0.2s' }}>
                  <button onClick={() => setAberto(expandido ? null : pedido.id)} style={{ width: '100%', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: cfg.bg, color: cfg.cor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                      #{pedido.id}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>Mesa {pedido.mesa}</span>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: cfg.bg, color: cfg.cor }}>{cfg.label}</span>
                        {metodoCfg && <span style={{ fontSize: 11, color: metodoCfg.cor, fontWeight: 500 }}>{metodoCfg.label}</span>}
                        {pedido.pagamento?.status === 'PAGO' && (
                          <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: 'var(--success-bg)', color: 'var(--success)' }}>✓ Pago</span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-hint)', marginTop: 2 }}>
                        {new Date(pedido.createdAt).toLocaleString('pt-BR')}
                        {pedido.user && ` · ${pedido.user.nome}`}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                      <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--brand)' }}>R$ {Number(pedido.total).toFixed(2)}</span>
                      <span style={{ color: 'var(--text-hint)', fontSize: 12, transform: expandido ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▾</span>
                    </div>
                  </button>
                  {expandido && (
                    <div style={{ padding: '0 16px 16px', borderTop: '1px solid var(--border)' }}>
                      <div style={{ paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-hint)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Itens</p>
                        {pedido.itens.map(item => (
                          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                            <span style={{ color: 'var(--text-secondary)' }}>
                              {item.quantidade}× {item.menuItem.nome}
                              {item.observacao && <em style={{ color: 'var(--text-hint)', marginLeft: 6, fontSize: 11 }}>({item.observacao})</em>}
                            </span>
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>R$ {Number(item.subtotal).toFixed(2)}</span>
                          </div>
                        ))}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                          <div style={{ fontSize: 12, color: 'var(--text-hint)' }}>
                            {pedido.user ? `👤 ${pedido.user.nome} · ${pedido.user.email}` : '👤 Cliente sem conta'}
                          </div>
                          <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--brand)' }}>Total: R$ {Number(pedido.total).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Paginação */}
          {meta.paginas > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 24 }}>
              <button onClick={() => mudarPagina(page - 1)} disabled={page === 1} style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--card)', color: page === 1 ? 'var(--text-hint)' : 'var(--text-primary)', cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize: 13 }}>← Anterior</button>
              {Array.from({ length: meta.paginas }, (_, i) => i + 1)
                .filter(p => p === 1 || p === meta.paginas || Math.abs(p - page) <= 1)
                .reduce((acc, p, i, arr) => { if (i > 0 && p - arr[i-1] > 1) acc.push('...'); acc.push(p); return acc }, [])
                .map((p, i) => p === '...'
                  ? <span key={`e${i}`} style={{ color: 'var(--text-hint)', padding: '0 4px' }}>...</span>
                  : <button key={p} onClick={() => mudarPagina(p)} style={{ width: 36, height: 36, borderRadius: 8, border: `1px solid ${p === page ? 'var(--brand)' : 'var(--border)'}`, background: p === page ? 'var(--brand)' : 'var(--card)', color: p === page ? '#fff' : 'var(--text-primary)', cursor: 'pointer', fontSize: 13, fontWeight: p === page ? 700 : 400 }}>{p}</button>
                )}
              <button onClick={() => mudarPagina(page + 1)} disabled={page === meta.paginas} style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--card)', color: page === meta.paginas ? 'var(--text-hint)' : 'var(--text-primary)', cursor: page === meta.paginas ? 'not-allowed' : 'pointer', fontSize: 13 }}>Próxima →</button>
            </div>
          )}
        </>

      ) : (

        /* ══════════════ ABA RELATÓRIO ══════════════ */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {[
              { label: 'Receita Total', valor: `R$ ${dadosGraficos.receitaTotal?.toFixed(2)}`, icon: '💰', cor: 'var(--brand)' },
              { label: 'Ticket Médio',  valor: `R$ ${dadosGraficos.ticketMedio?.toFixed(2)}`,  icon: '🧾', cor: '#10B981' },
              { label: 'Total de Itens', valor: dadosGraficos.totalItens,                       icon: '🍽️', cor: '#F59E0B' },
              { label: 'Taxa Cancelamento', valor: `${dadosGraficos.taxaCancelamento}%`,        icon: '❌', cor: '#EF4444' },
            ].map(kpi => (
              <div key={kpi.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1rem 1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', margin: '0 0 6px' }}>{kpi.label}</p>
                    <p style={{ fontSize: 22, fontWeight: 700, color: kpi.cor, margin: 0 }}>{kpi.valor}</p>
                  </div>
                  <span style={{ fontSize: 24 }}>{kpi.icon}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Linha 1: Itens mais pedidos (bar) + Status (pie) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

            <GraficoCard titulo="Itens Mais Pedidos" subtitulo="Quantidade total por item">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dadosGraficos.itensMaisPedidos} layout="vertical" margin={{ left: 0, right: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--text-hint)' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="nome" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} width={110} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="quantidade" name="Qtd" radius={[0, 6, 6, 0]}>
                    {dadosGraficos.itensMaisPedidos?.map((_, i) => (
                      <Cell key={i} fill={CORES_GRAFICOS[i % CORES_GRAFICOS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </GraficoCard>

            <GraficoCard titulo="Status dos Pedidos" subtitulo="Distribuição por status">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={dadosGraficos.dadosStatus} cx="50%" cy="45%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                    {dadosGraficos.dadosStatus?.map((entry, i) => (
                      <Cell key={i} fill={entry.cor} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend formatter={(value) => <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </GraficoCard>
          </div>

          {/* Linha 2: Pedidos por dia (area) */}
          <GraficoCard titulo="Pedidos por Dia" subtitulo="Volume e receita nos últimos dias" altura={220}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dadosGraficos.dadosDia} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="gradPedidos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradReceita" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="dia" tick={{ fontSize: 11, fill: 'var(--text-hint)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-hint)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(v) => <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{v}</span>} />
                <Area type="monotone" dataKey="pedidos" name="Pedidos" stroke="#6366f1" fill="url(#gradPedidos)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="receita" name="Receita (R$)" stroke="#10B981" fill="url(#gradReceita)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </GraficoCard>

          {/* Linha 3: Radar (receita por item) + Método pagamento + Mês */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>

            <GraficoCard titulo="Receita por Item" subtitulo="Top 6 itens (teia)">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={dadosGraficos.dadosRadar}>
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis dataKey="item" tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} />
                  <PolarRadiusAxis tick={{ fontSize: 9, fill: 'var(--text-hint)' }} tickCount={4} />
                  <Radar name="Receita" dataKey="receita" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.25} strokeWidth={2} />
                  <Tooltip content={<CustomTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </GraficoCard>

            <GraficoCard titulo="Método de Pagamento" subtitulo="Distribuição dos métodos">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={dadosGraficos.dadosMetodo} cx="50%" cy="42%" outerRadius={80} paddingAngle={4} dataKey="value">
                    {dadosGraficos.dadosMetodo?.map((entry, i) => (
                      <Cell key={i} fill={entry.cor} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend formatter={(v) => <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </GraficoCard>

            <GraficoCard titulo="Pedidos por Mês" subtitulo="Evolução mensal">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dadosGraficos.dadosMes} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="mes" tick={{ fontSize: 11, fill: 'var(--text-hint)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text-hint)' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="pedidos" name="Pedidos" fill="#F59E0B" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </GraficoCard>

          </div>
        </div>
      )}
    </div>
  )
}