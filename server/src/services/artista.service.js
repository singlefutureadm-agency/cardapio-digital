const prisma = require('../lib/prisma')
const storage = require('./storage.service')

const listar = () => prisma.artista.findMany({
  orderBy: { nome: 'asc' },
  include: { _count: { select: { shows: true } } },
})

const listarAtivos = () => prisma.artista.findMany({ where: { ativo: true }, orderBy: { nome: 'asc' } })

const buscar = (id) => prisma.artista.findUnique({
  where: { id: Number(id) },
  include: { shows: { orderBy: { data: 'desc' }, take: 10 } },
})

const criar = (data) => prisma.artista.create({ data })

const atualizar = (id, data) => prisma.artista.update({ where: { id: Number(id) }, data })

const excluir = async (id) => {
  const artista = await prisma.artista.findUnique({ where: { id: Number(id) } })
  await storage.deleteFile(artista?.imagemUrl)
  return prisma.artista.delete({ where: { id: Number(id) } })
}

const salvarImagem = async (id, imagemUrl) => {
  const artista = await prisma.artista.findUnique({ where: { id: Number(id) } })
  await storage.deleteFile(artista?.imagemUrl)
  return prisma.artista.update({ where: { id: Number(id) }, data: { imagemUrl } })
}

const removerImagem = async (id) => {
  const artista = await prisma.artista.findUnique({ where: { id: Number(id) } })
  await storage.deleteFile(artista?.imagemUrl)
  return prisma.artista.update({ where: { id: Number(id) }, data: { imagemUrl: null } })
}

module.exports = { listar, listarAtivos, buscar, criar, atualizar, excluir, salvarImagem, removerImagem }
