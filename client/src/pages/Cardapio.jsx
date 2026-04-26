import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../services/api'
import ItemCard from '../components/ItemCard'
import CarrinhoFlutuante from '../components/CarrinhoFlutuante'

export default function Cardapio() {
  const { mesa } = useParams()
  const [menu, setMenu] = useState([])
  const [categoriaAtiva, setCategoriaAtiva] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/menu').then(({ data }) => {
      setMenu(data)
      setCategoriaAtiva(data[0]?.id ?? null)
      setLoading(false)
    })
  }, [])

  const itens = menu.find((c) => c.id === categoriaAtiva)?.itens ?? []

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-surface">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          <p style={{ color: 'var(--text-hint)', fontFamily: 'DM Sans' }} className="text-sm">
            Preparando o cardápio...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface pb-32">
      {/* Hero header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-lg mx-auto px-5 pt-8 pb-5">
          <p className="text-xs font-medium tracking-widest uppercase mb-1"
             style={{ color: 'var(--brand)', letterSpacing: '0.12em' }}>
            Bem-vindo
          </p>
          <h1 className="font-display text-3xl font-medium" style={{ color: 'var(--text-primary)' }}>
            Mesa {mesa}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Escolha com calma — estamos aqui
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-5 pb-4 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {menu.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoriaAtiva(cat.id)}
              className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
              style={
                cat.id === categoriaAtiva
                  ? { background: 'var(--brand)', color: '#fff', fontFamily: 'DM Sans' }
                  : { background: 'var(--surface)', color: 'var(--text-secondary)', border: '1px solid var(--border)', fontFamily: 'DM Sans' }
              }
            >
              {cat.nome}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-lg mx-auto px-5 pt-5 space-y-3">
        <p className="text-xs font-medium uppercase tracking-widest" style={{ color: 'var(--text-hint)', letterSpacing: '0.1em' }}>
          {menu.find((c) => c.id === categoriaAtiva)?.nome} · {itens.length} opções
        </p>
        {itens.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </main>

      <CarrinhoFlutuante mesa={mesa} />
    </div>
  )
}