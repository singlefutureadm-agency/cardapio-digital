const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const listar = () =>
  prisma.mesa.findMany({ orderBy: { numero: 'asc' } })

const listarAtivas = () =>
  prisma.mesa.findMany({ where: { ativa: true }, orderBy: { numero: 'asc' } })

const criar = ({ numero, lugares, posX, posY, cor }) =>
  prisma.mesa.create({
    data: {
      numero,
      lugares: Number(lugares) || 4,
      posX:    Number(posX)    || 0,
      posY:    Number(posY)    || 0,
      cor:     cor             || '#10B981',
    },
  })

const atualizar = (id, dados) =>
  prisma.mesa.update({
    where: { id: Number(id) },
    data: {
      ...(dados.numero    !== undefined && { numero:  dados.numero }),
      ...(dados.ativa     !== undefined && { ativa:   dados.ativa }),
      ...(dados.lugares   !== undefined && { lugares: Number(dados.lugares) }),
      ...(dados.posX      !== undefined && { posX:    Number(dados.posX) }),
      ...(dados.posY      !== undefined && { posY:    Number(dados.posY) }),
      ...(dados.cor       !== undefined && { cor:     dados.cor }),
    },
  })

const excluir = (id) =>
  prisma.mesa.delete({ where: { id: Number(id) } })

module.exports = { listar, listarAtivas, criar, atualizar, excluir }