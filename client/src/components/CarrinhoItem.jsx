import useCarrinhoStore from '../store/useCarrinhoStore'

export default function CarrinhoItem({ item }) {
  const { adicionarItem, removerItem, atualizarObservacao } = useCarrinhoStore()

  return (
    <div className="bg-card rounded-2xl p-4 space-y-3" style={{ border: '1px solid var(--border)' }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h3 className="font-medium text-[15px]" style={{ color: 'var(--text-primary)' }}>
            {item.nome}
          </h3>
          <p className="text-sm mt-0.5 font-medium" style={{ color: 'var(--brand)' }}>
            R$ {(Number(item.preco) * item.quantidade).toFixed(2).replace('.', ',')}
            <span className="font-normal ml-1" style={{ color: 'var(--text-hint)' }}>
              (R$ {Number(item.preco).toFixed(2).replace('.', ',')} × {item.quantidade})
            </span>
          </p>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => removerItem(item.id)}
            className="w-7 h-7 rounded-full flex items-center justify-center text-base font-semibold"
            style={{ background: 'var(--brand-light)', color: 'var(--brand)' }}
          >
            −
          </button>
          <span className="w-5 text-center text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            {item.quantidade}
          </span>
          <button
            onClick={() => adicionarItem(item)}
            className="w-7 h-7 rounded-full flex items-center justify-center text-base font-semibold"
            style={{ background: 'var(--brand)', color: '#fff' }}
          >
            +
          </button>
        </div>
      </div>

      <input
        type="text"
        placeholder="Alguma observação? (ex: sem cebola)"
        value={item.observacao}
        onChange={(e) => atualizarObservacao(item.id, e.target.value)}
        className="w-full text-sm rounded-xl px-3.5 py-2.5 outline-none transition-all"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          color: 'var(--text-primary)',
          fontFamily: 'DM Sans',
        }}
      />
    </div>
  )
}