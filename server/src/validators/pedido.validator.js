const { z } = require('zod')

const criarPedidoSchema = z.object({
  mesa: z.string().min(1),
  itens: z
    .array(
      z.object({
        menuItemId: z.number().int().positive(),
        quantidade: z.number().int().positive(),
        observacao: z.string().optional().default(''),
      })
    )
    .min(1, 'Pedido deve ter ao menos 1 item'),
})

module.exports = { criarPedidoSchema }