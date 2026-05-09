import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../services/api'
import useCarrinhoStore from '../../store/useCarrinhoStore'

const ICONES = {
  'Entradas': '🥗', 'Pratos Principais': '🍽️', 'Bebidas': '🥤', 'Sobremesas': '🍮',
}

export default function ClienteCardapio() {
  const { mesa } = useParams()
  const navigate = useNavigate()
  const [menu, setMenu] = useState([])
  const [categoriaAtiva, setCat] = useState(null)
  const [loading, setLoading] = useState(true)
  const { itens, adicionarItem, removerItem, totalItens, totalValor } = useCarrinhoStore()

  useEffect(() => {
    api.get('/menu').then(({ data }) => {
      setMenu(data); setCat(data[0]?.id ?? null); setLoading(false)
    })
  }, [])

  const itensCat = menu.find((c) => c.id === categoriaAtiva)?.itens ?? []

  return (
    <div className="pb-4">
      {/* Header da seção */}
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-widest mb-1"
           style={{ color: 'var(--brand)', letterSpacing: '0.12em' }}>Cardápio</p>
        <h2 className="font-display text-xl font-medium" style={{ color: 'var(--text-primary)' }}>
          O que temos hoje
        </h2>
      </div>

      {/* Tabs de categoria */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {menu.map((cat) => (
          <button key={cat.id} onClick={() => setCat(cat.id)}
                  className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all"
                  style={cat.id === categoriaAtiva
                    ? { background: 'var(--brand)', color: '#fff', boxShadow: '0 4px 12px rgba(200,82,10,0.3)' }
                    : { background: 'var(--card)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
            {cat.nome}
          </button>
        ))}
      </div>

      {/* Itens */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: 'var(--card)' }} />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {itensCat.map((item) => {
            const noCarrinho = itens.find((i) => i.id === item.id)
            return (
              <div key={item.id}
                   className="rounded-2xl p-4 flex gap-3 transition-all"
                   style={{ background: 'var(--card)', border: noCarrinho
                     ? '1.5px solid var(--brand)' : '1px solid var(--border)',
                     boxShadow: noCarrinho ? '0 0 0 3px var(--brand-light)' : 'none' }}>
                {/* Ícone */}
                <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                     style={{ background: 'var(--brand-light)' }}>
                  {ICONES[item.categoria?.nome] ?? '🍽️'}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{item.nome}</h3>
                  {item.descricao && (
                    <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--text-hint)' }}>
                      {item.descricao}
                    </p>
                  )}
                  <p className="text-sm font-bold mt-1" style={{ color: 'var(--brand)' }}>
                    R$ {Number(item.preco).toFixed(2).replace('.', ',')}
                  </p>
                </div>
                {/* Controle */}
                <div className="flex flex-col items-center justify-center flex-shrink-0">
                  {noCarrinho ? (
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => removerItem(item.id)}
                              className="w-7 h-7 rounded-full flex items-center justify-center font-semibold"
                              style={{ background: 'var(--brand-light)', color: 'var(--brand)' }}>
                        −
                      </button>
                      <span className="w-4 text-center text-sm font-semibold"
                            style={{ color: 'var(--text-primary)' }}>
                        {noCarrinho.quantidade}
                      </span>
                      <button onClick={() => adicionarItem(item)}
                              className="w-7 h-7 rounded-full flex items-center justify-center font-semibold"
                              style={{ background: 'var(--brand)', color: '#fff' }}>
                        +
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => adicionarItem(item)}
                            className="w-7 h-7 rounded-full flex items-center justify-center font-semibold"
                            style={{ background: 'var(--brand)', color: '#fff' }}>
                      +
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Botão flutuante do carrinho */}
      {totalItens() > 0 && (
        <div className="fixed bottom-20 left-0 right-0 flex justify-center px-4 z-30">
          <button onClick={() => navigate(`/cliente/${mesa}/carrinho`)}
                  className="w-full max-w-lg rounded-2xl px-5 py-4 flex items-center justify-between transition-all active:scale-[0.98] no-glass"
                  style={{ background: 'var(--brand)', color: '#fff',
                           boxShadow: '0 8px 24px rgba(0,0,0,0.25)' }}>
            <span className="text-sm font-medium px-2.5 py-1 rounded-lg"
                  style={{ background: 'rgba(255,255,255,0.15)' }}>
              {totalItens()} {totalItens() === 1 ? 'item' : 'itens'}
            </span>
            <span className="font-semibold text-sm">Ver carrinho</span>
            <span className="font-bold text-sm" style={{ color: 'rgba(255,255,255,0.85)' }}>
              R$ {totalValor().toFixed(2).replace('.', ',')}
            </span>
          </button>
        </div>
      )}
    </div>
  )
}