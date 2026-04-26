const s = require('../services/newsletter.service')

const inscrever = async (req, res, next) => {
  try {
    const { email } = req.body
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Email inválido' })
    }
    const inscrito = await s.inscrever(email)
    res.status(201).json(inscrito)
  } catch (e) { next(e) }
}

const listar  = async (req, res, next) => { try { res.json(await s.listar()) } catch(e) { next(e) } }
const remover = async (req, res, next) => { try { res.json(await s.remover(req.params.id)) } catch(e) { next(e) } }

module.exports = { inscrever, listar, remover }