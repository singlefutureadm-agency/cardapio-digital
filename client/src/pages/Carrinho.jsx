import { useNavigate, useParams, useLocation } from 'react-router-dom'
import useCarrinhoStore from '../store/useCarrinhoStore'
import CarrinhoItem from '../components/CarrinhoItem'

export default function Carrinho() {
  const { mesa } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { itens, totalValor, limparCarrinho } = useCarrinhoStore()

  const isCliente = location.pathname.startsWith('/cliente')
  const base = isCliente ? `/cliente/${mesa}` : `/mesa/${mesa}`

  if (itens.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-5 p-8"
           style={{ minHeight: isCliente ? '60vh' : '100vh', background: 'var(--surface)' }}>
        <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
             style={{ background: 'var(--brand-light)' }}>
          🛒
        </div>
        <div className="text-center">
          <h2 className="font-display text-xl font-medium" style={{ color: 'var(--text-primary)' }}>
            Carrinho vazio
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Adicione itens do cardápio para continuar
          </p>
        </div>
        <button
          onClick={() => navigate(`${base}/cardapio`)}
          className="px-6 py-3 rounded-xl text-sm font-medium transition-colors"
          style={{ background: 'var(--brand)', color: '#fff' }}
        >
          Voltar ao cardápio
        </button>
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--surface)', minHeight: isCliente ? 'auto' : '100vh', paddingBottom: '144px' }}>

      {/* Header — só fora do ClienteLayout */}
      {!isCliente && (
        <header className="sticky top-0 z-10"
                style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)' }}>
          <div className="max-w-lg mx-auto px-5 py-4 flex items-center gap-3">
            <button
              onClick={() => navigate(base)}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)',
                       color: 'var(--text-secondary)' }}
            >
              ←
            </button>
            <div>
              <h1 className="font-display text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
                Seu pedido
              </h1>
              <p className="text-xs" style={{ color: 'var(--text-hint)' }}>Mesa {mesa}</p>
            </div>
          </div>
        </header>
      )}

      <div className={isCliente ? 'pt-2' : ''}>
        <main className="max-w-lg mx-auto px-5 pt-5 space-y-3">

          {/* Título dentro do dashboard */}
          {isCliente && (
            <div className="mb-2">
              <p className="text-xs font-semibold uppercase tracking-widest mb-1"
                 style={{ color: 'var(--brand)', letterSpacing: '0.12em' }}>
                Carrinho
              </p>
              <h2 className="font-display text-xl font-medium" style={{ color: 'var(--text-primary)' }}>
                Seu pedido
              </h2>
            </div>
          )}

          {itens.map((item) => (
            <CarrinhoItem key={item.id} item={item} />
          ))}

          {/* Resumo */}
          <div className="rounded-2xl p-4 mt-2"
               style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                R$ {totalValor().toFixed(2).replace('.', ',')}
              </span>
            </div>
            <div className="flex justify-between items-center mt-3 pt-3"
                 style={{ borderTop: '1px solid var(--border)' }}>
              <span className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>
                Total
              </span>
              <span className="font-display text-xl font-medium" style={{ color: 'var(--brand)' }}>
                R$ {totalValor().toFixed(2).replace('.', ',')}
              </span>
            </div>
          </div>
        </main>
      </div>

      {/* Ações fixas */}
      <div className="fixed bottom-0 left-0 right-0 px-5 py-4"
           style={{ background: 'var(--card)', borderTop: '1px solid var(--border)',
                    boxShadow: '0 -8px 24px rgba(0,0,0,0.06)' }}>
        <div className="max-w-lg mx-auto flex flex-col gap-2">
          <button
            onClick={() => navigate(`${base}/checkout`)}
            className="w-full rounded-2xl py-4 font-semibold text-base transition-all active:scale-[0.98]"
            style={{ background: 'var(--brand)', color: '#fff' }}
          >
            Confirmar pedido
          </button>
          <button
            onClick={() => { limparCarrinho(); navigate(`${base}/cardapio`) }}
            className="w-full rounded-xl py-2.5 text-sm font-medium transition-colors"
            style={{ color: 'var(--text-hint)' }}
          >
            Limpar carrinho
          </button>
        </div>
      </div>
    </div>
  )
}