import { create } from 'zustand'
import api from '../services/api'

const usePedidoStore = create((set, get) => ({
  pedidos: [],
  loading: true,

  carregar: async () => {
    const { data } = await api.get('/pedidos')
    set({ pedidos: data, loading: false })
  },

  adicionarPedido: (pedido) => {
    set({ pedidos: [pedido, ...get().pedidos] })
  },

  atualizarPedido: (pedidoAtualizado) => {
    set({
      pedidos: get().pedidos.map((p) =>
        p.id === pedidoAtualizado.id ? pedidoAtualizado : p
      ),
    })
  },

  removerSeEntregue: (pedidoAtualizado) => {
    if (['ENTREGUE', 'CANCELADO'].includes(pedidoAtualizado.status)) {
      set({ pedidos: get().pedidos.filter((p) => p.id !== pedidoAtualizado.id) })
    } else {
      get().atualizarPedido(pedidoAtualizado)
    }
  },
}))

export default usePedidoStore