const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const toDateTime = (data) => {
  if (!data) return null
  if (data instanceof Date) return data
  return data.includes('T') ? new Date(data) : new Date(`${data}T00:00:00.000Z`)
}

const includeCompleto = {
  artista: true,
  _count: { select: { avaliacoes: true } },
}

const listar = () => prisma.show.findMany({ orderBy: { data: 'asc' }, include: includeCompleto })

const listarProximos = () => prisma.show.findMany({
  where: { ativo: true, data: { gte: new Date() } },
  orderBy: { data: 'asc' },
  take: 10,
  include: { artista: true },
})

const listarPassados = () => prisma.show.findMany({
  where: { data: { lt: new Date() } },
  orderBy: { data: 'desc' },
  include: { artista: true, _count: { select: { avaliacoes: true } } },
})

const buscar = (id) => prisma.show.findUnique({
  where: { id: Number(id) },
  include: {
    artista: true,
    avaliacoes: { include: { user: { select: { id: true, nome: true } } }, orderBy: { createdAt: 'desc' } },
  },
})

const criar = ({ data, artistaId, ...resto }) => prisma.show.create({
  data: { ...resto, data: toDateTime(data), artistaId: artistaId ? Number(artistaId) : null },
  include: includeCompleto,
})

const atualizar = (id, { data, artistaId, ...resto }) => prisma.show.update({
  where: { id: Number(id) },
  data: { ...resto, data: toDateTime(data), artistaId: artistaId ? Number(artistaId) : null },
  include: includeCompleto,
})

const excluir = (id) => prisma.show.delete({ where: { id: Number(id) } })

// ── Métricas pós-show ──
const metricasShow = async (showId) => {
  const show = await prisma.show.findUnique({
    where: { id: Number(showId) },
    include: {
      artista: true,
      avaliacoes: { include: { user: { select: { id: true, nome: true } } } },
    },
  })
  if (!show) throw Object.assign(new Error('Show não encontrado'), { status: 404 })

  const dataShow = new Date(show.data)
  const inicioDia = new Date(dataShow); inicioDia.setHours(0, 0, 0, 0)
  const fimDia    = new Date(dataShow); fimDia.setHours(23, 59, 59, 999)

  // Pedidos no dia do show
  const pedidosDia = await prisma.pedido.findMany({
    where: { createdAt: { gte: inicioDia, lte: fimDia } },
    include: { itens: true },
  })

  // Média dos 7 dias anteriores
  const inicio7d = new Date(inicioDia); inicio7d.setDate(inicio7d.getDate() - 7)
  const pedidos7d = await prisma.pedido.findMany({
    where: { createdAt: { gte: inicio7d, lt: inicioDia } },
  })
  const mediaDiaria7d = pedidos7d.length / 7

  // Notas
  const totalAvaliacoes = show.avaliacoes.length
  const notaMedia = totalAvaliacoes > 0
    ? show.avaliacoes.reduce((acc, a) => acc + a.nota, 0) / totalAvaliacoes
    : null

  const distribuicaoNotas = [1, 2, 3, 4, 5].map(n => ({
    nota: n,
    count: show.avaliacoes.filter(a => a.nota === n).length,
  }))

  const receitaDia = pedidosDia.reduce((acc, p) => acc + Number(p.total), 0)

  return {
    show,
    totalAvaliacoes,
    notaMedia,
    distribuicaoNotas,
    pedidosDia: pedidosDia.length,
    receitaDia,
    mediaDiaria7d: Math.round(mediaDiaria7d * 10) / 10,
    crescimentoPedidos: mediaDiaria7d > 0
      ? (((pedidosDia.length - mediaDiaria7d) / mediaDiaria7d) * 100).toFixed(1)
      : null,
    comentarios: show.avaliacoes.filter(a => a.comentario),
  }
}

module.exports = { listar, listarProximos, listarPassados, buscar, criar, atualizar, excluir, metricasShow }