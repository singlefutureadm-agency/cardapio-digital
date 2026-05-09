import { useNavigate } from 'react-router-dom'
import useCarrinhoStore from '../store/useCarrinhoStore'

export default function CarrinhoFlutuante({ mesa }) {
  const navigate = useNavigate()
  const totalItens = useCarrinhoStore((s) => s.totalItens())
  const totalValor = useCarrinhoStore((s) => s.totalValor())

  if (totalItens === 0) return null

  return (
    <div className="fixed bottom-6 left-0 right-0 flex justify-center px-5 z-20">
      <button
        onClick={() => navigate(`/mesa/${mesa}/carrinho`)}
        className="w-full max-w-lg rounded-2xl px-5 py-4 flex items-center justify-between transition-all active:scale-[0.98]"
        style={{ background: 'var(--brand)', color: '#fff', boxShadow: '0 8px 24px rgba(0,0,0,0.25)' }}
      >
        <span
          className="text-sm font-medium px-2.5 py-1 rounded-lg"
          style={{ background: 'rgba(255,255,255,0.15)' }}
        >
          {totalItens} {totalItens === 1 ? 'item' : 'itens'}
        </span>
        <span className="font-semibold tracking-wide">Ver carrinho</span>
        <span className="font-semibold" style={{ color: 'rgba(255,255,255,0.85)' }}>
          R$ {totalValor.toFixed(2).replace('.', ',')}
        </span>
      </button>
    </div>
  )
}