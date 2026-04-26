const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

const listarUsuarios = () =>
  prisma.user.findMany({
    select: { id: true, nome: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })

const criarUsuario = async ({ nome, email, senha, role }) => {
  const existe = await prisma.user.findUnique({ where: { email } })
  if (existe) throw Object.assign(new Error('Email já cadastrado'), { status: 409 })

  const senhaHash = await bcrypt.hash(senha, 10)
  return prisma.user.create({
    data: { nome, email, senha: senhaHash, role: role || 'USER' },
    select: { id: true, nome: true, email: true, role: true, createdAt: true },
  })
}

const atualizarUsuario = async (id, { nome, email, role }) =>
  prisma.user.update({
    where: { id: Number(id) },
    data: { nome, email, role },
    select: { id: true, nome: true, email: true, role: true, createdAt: true },
  })

const resetarSenha = async (id, novaSenha) => {
  const hash = await bcrypt.hash(novaSenha, 10)
  return prisma.user.update({
    where: { id: Number(id) },
    data: { senha: hash },
    select: { id: true, nome: true, email: true },
  })
}

const excluirUsuario = (id) =>
  prisma.user.delete({ where: { id: Number(id) } })

module.exports = { listarUsuarios, criarUsuario, atualizarUsuario, resetarSenha, excluirUsuario }