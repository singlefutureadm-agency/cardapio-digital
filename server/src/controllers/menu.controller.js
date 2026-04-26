const menuService = require('../services/menu.service')

const getMenu = async (req, res, next) => {
  try {
    const menu = await menuService.getMenuCompleto()
    res.json(menu)
  } catch (error) {
    next(error)
  }
}

module.exports = { getMenu }