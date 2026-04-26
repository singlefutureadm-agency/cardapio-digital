const prisma = require('../lib/prisma')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const gerarToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )

const register = async ({ nome, email, senha }) => {
  const existe = await prisma.user.findUnique({ where: { email } })
  if (existe) {
    throw Object.assign(new Error('Email já cadastrado'), { status: 409 })
  }

  const senhaHash = await bcrypt.hash(senha, 10)
  const user = await prisma.user.create({
    data: { nome, email, senha: senhaHash },
    select: { id: true, nome: true, email: true, role: true },
  })

  return { user, token: gerarToken(user) }
}

const login = async ({ email, senha }) => {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    throw Object.assign(new Error('Credenciais inválidas'), { status: 401 })
  }

  const senhaOk = await bcrypt.compare(senha, user.senha)
  if (!senhaOk) {
    throw Object.assign(new Error('Credenciais inválidas'), { status: 401 })
  }

  const { senha: _, ...userSemSenha } = user
  return { user: userSemSenha, token: gerarToken(user) }
}

const me = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, nome: true, email: true, role: true, createdAt: true },
  })
  if (!user) throw Object.assign(new Error('Usuário não encontrado'), { status: 404 })
  return user
}

module.exports = { register, login, me }