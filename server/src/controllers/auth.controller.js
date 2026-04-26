const authService = require('../services/auth.service')

const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body)
    res.status(201).json(result)
  } catch (err) {
    next(err)
  }
}

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body)
    res.json(result)
  } catch (err) {
    next(err)
  }
}

const me = async (req, res, next) => {
  try {
    const user = await authService.me(req.user.id)
    res.json(user)
  } catch (err) {
    next(err)
  }
}

module.exports = { register, login, me }