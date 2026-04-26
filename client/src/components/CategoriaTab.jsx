export default function CategoriaTab({ nome, ativo, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
      style={
        ativo
          ? { background: 'var(--brand)', color: '#fff' }
          : { background: 'var(--surface)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }
      }
    >
      {nome}
    </button>
  )
}