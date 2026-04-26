const prisma = require('../lib/prisma')

const listarItens = () =>
  prisma.menuItem.findMany({
    include: { categoria: true },
    orderBy: [{ categoriaId: 'asc' }, { nome: 'asc' }],
  })

const listarCategorias = () =>
  prisma.menuCategoria.findMany({ orderBy: { ordem: 'asc' } })

const criarItem = (data) =>
  prisma.menuItem.create({
    data: {
      nome: data.nome,
      descricao: data.descricao || null,
      preco: data.preco,
      categoriaId: data.categoriaId,
      disponivel: data.disponivel ?? true,
    },
    include: { categoria: true },
  })

const atualizarItem = (id, data) =>
  prisma.menuItem.update({
    where: { id: Number(id) },
    data: {
      nome: data.nome,
      descricao: data.descricao,
      preco: data.preco,
      categoriaId: data.categoriaId,
      disponivel: data.disponivel,
    },
    include: { categoria: true },
  })

const toggleDisponivel = async (id) => {
  const item = await prisma.menuItem.findUnique({ where: { id: Number(id) } })
  return prisma.menuItem.update({
    where: { id: Number(id) },
    data: { disponivel: !item.disponivel },
    include: { categoria: true },
  })
}

const excluirItem = async (id) => {
  const numId = Number(id)
  await prisma.pedidoItem.deleteMany({ where: { menuItemId: numId } })
  return prisma.menuItem.delete({ where: { id: numId } })
}

module.exports = { listarItens, listarCategorias, criarItem, atualizarItem, toggleDisponivel, excluirItem }