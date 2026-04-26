const jwt = require('jsonwebtoken')

const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido' })
  }

  const token = header.split(' ')[1]
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Token inválido ou expirado' })
  }
}

const isAdmin = (req, res, next) => {
  if (req.user?.role !== 'ADMIN' && req.user?.role !== 'ADMINSF') {
    return res.status(403).json({ error: 'Acesso restrito a administradores' })
  }
  next()
}

const isAdminSF = (req, res, next) => {
  if (req.user?.role !== 'ADMINSF') {
    return res.status(403).json({ error: 'Acesso restrito ao administrador SF' })
  }
  next()
}

module.exports = { authMiddleware, isAdmin, isAdminSF }