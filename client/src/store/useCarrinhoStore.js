import { create } from 'zustand'

const useCarrinhoStore = create((set, get) => ({
  itens: [],

  adicionarItem: (item) => {
    const { itens } = get()
    const existente = itens.find((i) => i.id === item.id)

    if (existente) {
      set({
        itens: itens.map((i) =>
          i.id === item.id ? { ...i, quantidade: i.quantidade + 1 } : i
        ),
      })
    } else {
      set({ itens: [...itens, { ...item, quantidade: 1, observacao: '' }] })
    }
  },

  removerItem: (id) => {
    const { itens } = get()
    const existente = itens.find((i) => i.id === id)

    if (existente?.quantidade > 1) {
      set({
        itens: itens.map((i) =>
          i.id === id ? { ...i, quantidade: i.quantidade - 1 } : i
        ),
      })
    } else {
      set({ itens: itens.filter((i) => i.id !== id) })
    }
  },

  atualizarObservacao: (id, observacao) => {
    set({
      itens: get().itens.map((i) => (i.id === id ? { ...i, observacao } : i)),
    })
  },

  limparCarrinho: () => set({ itens: [] }),

  totalItens: () => get().itens.reduce((acc, i) => acc + i.quantidade, 0),

  totalValor: () =>
    get().itens.reduce((acc, i) => acc + Number(i.preco) * i.quantidade, 0),
}))

export default useCarrinhoStore