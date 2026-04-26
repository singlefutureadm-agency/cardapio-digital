const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({
      error: 'Dados inválidos',
      detalhes: result.error.flatten().fieldErrors,
    })
  }
  req.body = result.data
  next()
}

module.exports = { validate }