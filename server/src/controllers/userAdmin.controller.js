const s = require('../services/userAdmin.service')

const listar   = async (req, res, next) => { try { res.json(await s.listarUsuarios()) } catch(e) { next(e) } }

const criar = async (req, res, next) => {
  try {
    if (req.body.role === 'ADMINSF' && req.user?.role !== 'ADMINSF') {
      return res.status(403).json({ error: 'Apenas AdminSF pode cadastrar usuários com perfil AdminSF' })
    }
    res.status(201).json(await s.criarUsuario(req.body))
  } catch(e) { next(e) }
}

const atualizar = async (req, res, next) => {
  try {
    if (req.body.role === 'ADMINSF' && req.user?.role !== 'ADMINSF') {
      return res.status(403).json({ error: 'Apenas AdminSF pode atribuir o perfil AdminSF' })
    }
    res.json(await s.atualizarUsuario(req.params.id, req.body))
  } catch(e) { next(e) }
}

const resetarSenha = async (req, res, next) => { try { res.json(await s.resetarSenha(req.params.id, req.body.senha)) } catch(e) { next(e) } }
const excluir  = async (req, res, next) => { try { await s.excluirUsuario(req.params.id); res.status(204).send() } catch(e) { next(e) } }

module.exports = { listar, criar, atualizar, resetarSenha, excluir }