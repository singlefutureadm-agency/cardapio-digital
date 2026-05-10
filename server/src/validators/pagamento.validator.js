const { z } = require('zod')

const METODOS_VALIDOS = ['DINHEIRO', 'CARTAO', 'PIX']

const criarPagamentoSchema = z.object({
  pedidoId: z.number().int().positive(),
  metodo: z.enum(METODOS_VALIDOS),
})

const fecharMesaSchema = z.object({
  mesa: z.string().min(1),
  metodo: z.enum(METODOS_VALIDOS),
})

module.exports = { criarPagamentoSchema, fecharMesaSchema }
