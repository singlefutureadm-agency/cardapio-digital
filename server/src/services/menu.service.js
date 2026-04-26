const prisma = require('../lib/prisma')

const getMenuCompleto = async () => {
  return prisma.menuCategoria.findMany({
    orderBy: { ordem: 'asc' },
    include: {
      itens: {
        where: { disponivel: true },
        orderBy: { nome: 'asc' },
        select: {
          id: true,
          nome: true,
          descricao: true,
          preco: true,
          disponivel: true,
          imagemUrl: true,   // ← explícito
          categoriaId: true,
        },
      },
    },
  })
}
module.exports = { getMenuCompleto }