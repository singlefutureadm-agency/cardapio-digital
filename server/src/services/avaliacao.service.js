const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const avaliar = async ({ showId, userId, nota, comentario }) => {
  if (nota < 1 || nota > 5) throw Object.assign(new Error('Nota deve ser entre 1 e 5'), { status: 400 })

  const show = await prisma.show.findUnique({ where: { id: Number(showId) } })
  if (!show) throw Object.assign(new Error('Show não encontrado'), { status: 404 })
  if (new Date(show.data) > new Date()) throw Object.assign(new Error('Show ainda não ocorreu'), { status: 400 })

  return prisma.avaliacaoShow.upsert({
    where: { showId_userId: { showId: Number(showId), userId: Number(userId) } },
    update: { nota: Number(nota), comentario },
    create: { showId: Number(showId), userId: Number(userId), nota: Number(nota), comentario },
  })
}

const minhaAvaliacao = (showId, userId) => prisma.avaliacaoShow.findUnique({
  where: { showId_userId: { showId: Number(showId), userId: Number(userId) } },
})

module.exports = { avaliar, minhaAvaliacao }