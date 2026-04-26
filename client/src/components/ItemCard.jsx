import useCarrinhoStore from '../store/useCarrinhoStore'

const EMOJI_MAP = {
  'Entradas': '🥗',
  'Pratos Principais': '🍽️',
  'Bebidas': '🥤',
  'Sobremesas': '🍮',
}

export default function ItemCard({ item }) {
  const { itens, adicionarItem, removerItem } = useCarrinhoStore()
  const noCarrinho = itens.find((i) => i.id === item.id)

  return (
    <div
      className="bg-card rounded-2xl p-4 flex gap-4 transition-all duration-200"
      style={{
        border: noCarrinho ? '1.5px solid var(--brand)' : '1px solid var(--border)',
        boxShadow: noCarrinho ? '0 0 0 3px var(--brand-light)' : 'none',
      }}
    >
      {/* Ícone */}
      <div
        className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl"
        style={{ background: 'var(--brand-light)' }}
      >
        {EMOJI_MAP[item.categoria?.nome] ?? '🍽️'}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-[15px] leading-tight" style={{ color: 'var(--text-primary)' }}>
          {item.nome}
        </h3>
        {item.descricao && (
          <p className="text-sm mt-0.5 line-clamp-2" style={{ color: 'var(--text-hint)' }}>
            {item.descricao}
          </p>
        )}
        <p className="text-[15px] font-semibold mt-1.5" style={{ color: 'var(--brand)' }}>
          R$ {Number(item.preco).toFixed(2).replace('.', ',')}
        </p>
      </div>

      {/* Controle */}
      <div className="flex flex-col items-center justify-center gap-1 flex-shrink-0">
        {noCarrinho ? (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => removerItem(item.id)}
              className="w-7 h-7 rounded-full flex items-center justify-center text-base font-semibold transition-colors"
              style={{ background: 'var(--brand-light)', color: 'var(--brand)' }}
            >
              −
            </button>
            <span className="w-5 text-center text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              {noCarrinho.quantidade}
            </span>
            <button
              onClick={() => adicionarItem(item)}
              className="w-7 h-7 rounded-full flex items-center justify-center text-base font-semibold transition-colors"
              style={{ background: 'var(--brand)', color: '#fff' }}
            >
              +
            </button>
          </div>
        ) : (
          <button
            onClick={() => adicionarItem(item)}
            className="w-7 h-7 rounded-full flex items-center justify-center text-base font-semibold transition-colors"
            style={{ background: 'var(--brand)', color: '#fff' }}
          >
            +
          </button>
        )}
      </div>
    </div>
  )
}