const s = require('../services/menuAdmin.service')

const listarItens     = async (req, res, next) => { try { res.json(await s.listarItens()) } catch(e) { next(e) } }
const listarCategorias = async (req, res, next) => { try { res.json(await s.listarCategorias()) } catch(e) { next(e) } }
const criarItem       = async (req, res, next) => { try { res.status(201).json(await s.criarItem(req.body)) } catch(e) { next(e) } }
const atualizarItem   = async (req, res, next) => { try { res.json(await s.atualizarItem(req.params.id, req.body)) } catch(e) { next(e) } }
const toggleDisponivel = async (req, res, next) => { try { res.json(await s.toggleDisponivel(req.params.id)) } catch(e) { next(e) } }
const excluirItem     = async (req, res, next) => { try { await s.excluirItem(req.params.id); res.status(204).send() } catch(e) { next(e) } }

module.exports = { listarItens, listarCategorias, criarItem, atualizarItem, toggleDisponivel, excluirItem }