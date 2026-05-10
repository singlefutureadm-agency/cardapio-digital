jest.mock('jsonwebtoken')

const jwt = require('jsonwebtoken')
const { authMiddleware, isAdmin, isAdminSF } = require('../middlewares/auth.middleware')

function mockRes() {
  const res = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

beforeEach(() => jest.clearAllMocks())

describe('authMiddleware', () => {
  test('retorna 401 sem header Authorization', () => {
    const req = { headers: {} }
    const res = mockRes()
    const next = jest.fn()

    authMiddleware(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ error: 'Token não fornecido' })
    expect(next).not.toHaveBeenCalled()
  })

  test('retorna 401 quando Authorization não começa com Bearer', () => {
    const req = { headers: { authorization: 'Basic abc123' } }
    const res = mockRes()
    const next = jest.fn()

    authMiddleware(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  test('retorna 401 com token inválido ou expirado', () => {
    const req = { headers: { authorization: 'Bearer token-invalido' } }
    const res = mockRes()
    const next = jest.fn()
    jwt.verify.mockImplementation(() => { throw new Error('invalid signature') })

    authMiddleware(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ error: 'Token inválido ou expirado' })
    expect(next).not.toHaveBeenCalled()
  })

  test('popula req.user e chama next() com token válido', () => {
    const payload = { id: 5, email: 'a@b.com', role: 'USER' }
    const req = { headers: { authorization: 'Bearer token-valido' } }
    const res = mockRes()
    const next = jest.fn()
    jwt.verify.mockReturnValue(payload)

    authMiddleware(req, res, next)

    expect(req.user).toEqual(payload)
    expect(next).toHaveBeenCalledTimes(1)
    expect(res.status).not.toHaveBeenCalled()
  })
})

describe('isAdmin', () => {
  test('retorna 403 para role USER', () => {
    const req = { user: { role: 'USER' } }
    const res = mockRes()
    const next = jest.fn()

    isAdmin(req, res, next)

    expect(res.status).toHaveBeenCalledWith(403)
    expect(next).not.toHaveBeenCalled()
  })

  test('chama next() para role ADMIN', () => {
    const req = { user: { role: 'ADMIN' } }
    const res = mockRes()
    const next = jest.fn()

    isAdmin(req, res, next)

    expect(next).toHaveBeenCalledTimes(1)
    expect(res.status).not.toHaveBeenCalled()
  })

  test('chama next() para role ADMINSF', () => {
    const req = { user: { role: 'ADMINSF' } }
    const res = mockRes()
    const next = jest.fn()

    isAdmin(req, res, next)

    expect(next).toHaveBeenCalledTimes(1)
  })
})

describe('isAdminSF', () => {
  test('retorna 403 para role ADMIN', () => {
    const req = { user: { role: 'ADMIN' } }
    const res = mockRes()
    const next = jest.fn()

    isAdminSF(req, res, next)

    expect(res.status).toHaveBeenCalledWith(403)
    expect(next).not.toHaveBeenCalled()
  })

  test('chama next() apenas para role ADMINSF', () => {
    const req = { user: { role: 'ADMINSF' } }
    const res = mockRes()
    const next = jest.fn()

    isAdminSF(req, res, next)

    expect(next).toHaveBeenCalledTimes(1)
    expect(res.status).not.toHaveBeenCalled()
  })
})
