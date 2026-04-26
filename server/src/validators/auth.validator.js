const { z } = require('zod')

const registerSchema = z.object({
  nome: z.string().min(2, 'Nome muito curto'),
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'Mínimo 6 caracteres'),
})

const loginSchema = z.object({
  email: z.string().email(),
  senha: z.string().min(1),
})

module.exports = { registerSchema, loginSchema }