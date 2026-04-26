import { useTheme } from '../context/ThemeContext'

export default function ThemeToggle({ className = '', size = 'md' }) {
  const { isDark, toggle } = useTheme()

  const sizes = {
    sm: { btn: 'w-8 h-8 rounded-lg text-sm', icon: '14px' },
    md: { btn: 'w-9 h-9 rounded-xl text-base', icon: '16px' },
    lg: { btn: 'w-10 h-10 rounded-xl text-lg', icon: '18px' },
  }

  const s = sizes[size]

  return (
    <button
      onClick={toggle}
      title={isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
      className={`${s.btn} ${className} flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95`}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        color: 'var(--text-secondary)',
      }}
    >
      <span style={{ fontSize: s.icon, lineHeight: 1 }}>
        {isDark ? '☀️' : '🌙'}
      </span>
    </button>
  )
}