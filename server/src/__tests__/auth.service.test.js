jest.mock('../lib/prisma', () => ({
  user: { findUnique: jest.fn(), create: jest.fn() },
}))
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}))
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mocked-token'),
}))

const prisma = require('../lib/prisma')
const bcrypt = require('bcryptjs')
const { register, login, me } = require('../services/auth.service')

const userMock = { id: 1, nome: 'Maria', email: 'maria@ex.com', role: 'USER', createdAt: new Date() }

beforeEach(() => jest.clearAllMocks())

describe('register', () => {
  test('cria usuário e retorna token quando email é novo', async () => {
    prisma.user.findUnique.mockResolvedValue(null)
    bcrypt.hash.mockResolvedValue('hash_gerado')
    prisma.user.create.mockResolvedValue({ id: 1, nome: 'Maria', email: 'maria@ex.com', role: 'USER' })

    const result = await register({ nome: 'Maria', email: 'maria@ex.com', senha: 'senha123' })

    expect(bcrypt.hash).toHaveBeenCalledWith('senha123', 10)
    expect(result.token).toBe('mocked-token')
    expect(result.user.email).toBe('maria@ex.com')
    expect(result.user).not.toHaveProperty('senha')
  })

  test('lança erro 409 quando email já está cadastrado', async () => {
    prisma.user.findUnique.mockResolvedValue(userMock)

    await expect(register({ nome: 'Maria', email: 'maria@ex.com', senha: '123456' }))
      .rejects.toMatchObject({ message: 'Email já cadastrado', status: 409 })

    expect(prisma.user.create).not.toHaveBeenCalled()
  })
})

describe('login', () => {
  test('retorna user sem senha e token com credenciais corretas', async () => {
    prisma.user.findUnique.mockResolvedValue({ ...userMock, senha: 'hash' })
    bcrypt.compare.mockResolvedValue(true)

    const result = await login({ email: 'maria@ex.com', senha: 'correta' })

    expect(result.token).toBe('mocked-token')
    expect(result.user).not.toHaveProperty('senha')
    expect(result.user.email).toBe('maria@ex.com')
  })

  test('lança erro 401 quando email não existe', async () => {
    prisma.user.findUnique.mockResolvedValue(null)

    await expect(login({ email: 'nao@existe.com', senha: '123' }))
      .rejects.toMatchObject({ status: 401 })
  })

  test('lança erro 401 quando senha está incorreta', async () => {
    prisma.user.findUnique.mockResolvedValue({ ...userMock, senha: 'hash' })
    bcrypt.compare.mockResolvedValue(false)

    await expect(login({ email: 'maria@ex.com', senha: 'errada' }))
      .rejects.toMatchObject({ status: 401 })
  })
})

describe('me', () => {
  test('retorna dados do usuário quando id existe', async () => {
    prisma.user.findUnique.mockResolvedValue(userMock)

    const user = await me(1)

    expect(user.id).toBe(1)
    expect(user.email).toBe('maria@ex.com')
    expect(prisma.user.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 1 } })
    )
  })

  test('lança erro 404 quando usuário não existe', async () => {
    prisma.user.findUnique.mockResolvedValue(null)

    await expect(me(999)).rejects.toMatchObject({ status: 404 })
  })
})
