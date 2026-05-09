import { useState } from 'react'
import { useTheme } from '../../context/ThemeContext'

const FEATURES = [
  {
    key: 'shows',
    icon: '🎸',
    titulo: 'Shows & Artistas',
    descricao: 'Calendário de shows, gestão de artistas, avaliações pós-show e métricas. Aparece no dashboard, na área do cliente e na landing page.',
  },
  {
    key: 'menutv',
    icon: '📺',
    titulo: 'Menu TV',
    descricao: 'Tela full-screen para exibição do cardápio em monitores ou TVs. Acessível via /menu-tv e como preview no dashboard.',
  },
  {
    key: 'preferencias',
    icon: '🎯',
    titulo: 'Preferências',
    descricao: 'Questionário de perfil do público com perguntas personalizáveis e analytics de respostas. Aparece no dashboard e no perfil do cliente.',
  },
  {
    key: 'mesas',
    icon: '🪑',
    titulo: 'Mesas',
    descricao: 'Mapa de mesas drag-and-drop e gestão de layout do restaurante. Aparece no dashboard e na seleção de mesa do cliente.',
  },
  {
    key: 'pix',
    icon: '📱',
    titulo: 'Pagamento Pix',
    descricao: 'Exibe a opção de pagamento via Pix no checkout do cliente. Quando desativado, apenas Cartão e Dinheiro ficam disponíveis como formas de pagamento.',
  },
]

function Toggle({ ativo, onChange, salvando }) {
  return (
    <button
      onClick={onChange}
      disabled={salvando}
      style={{
        width: 52,
        height: 28,
        borderRadius: 14,
        border: 'none',
        cursor: salvando ? 'wait' : 'pointer',
        background: ativo ? 'var(--brand)' : 'var(--border)',
        position: 'relative',
        transition: 'background 0.2s',
        flexShrink: 0,
        opacity: salvando ? 0.7 : 1,
      }}
    >
      <span style={{
        position: 'absolute',
        top: 3,
        left: ativo ? 27 : 3,
        width: 22,
        height: 22,
        borderRadius: '50%',
        background: '#fff',
        transition: 'left 0.2s',
        boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
      }} />
    </button>
  )
}

export default function FuncionalidadesAdmin() {
  const { features, salvarCores } = useTheme()
  const [salvando, setSalvando] = useState(null)
  const [feedback, setFeedback] = useState(null)

  const toggle = async (key) => {
    if (salvando) return
    setSalvando(key)
    try {
      const novoValor = features[key] ? '0' : '1'
      await salvarCores({ [`feature_${key}`]: novoValor })
      setFeedback({ key, ok: true })
      setTimeout(() => setFeedback(null), 2000)
    } catch {
      setFeedback({ key, ok: false })
      setTimeout(() => setFeedback(null), 3000)
    } finally {
      setSalvando(null)
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: 800 }}>

      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>
          Funcionalidades
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Ative ou desative recursos do sistema. Apenas o administrador SF pode alterar estas configurações.
          As alterações têm efeito imediato para todos os usuários.
        </p>
      </div>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {FEATURES.map((f) => {
          const ativo = features[f.key]
          const estaSalvando = salvando === f.key
          const fb = feedback?.key === f.key

          return (
            <div
              key={f.key}
              style={{
                background: 'var(--card)',
                border: `1px solid ${ativo ? 'var(--brand)' : 'var(--border)'}`,
                borderRadius: 16,
                padding: '1.25rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                transition: 'border-color 0.2s',
              }}
            >
              {/* Ícone */}
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: ativo ? 'var(--brand-light)' : 'var(--surface)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem',
                flexShrink: 0,
                transition: 'background 0.2s',
              }}>
                {f.icon}
              </div>

              {/* Texto */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                    {f.titulo}
                  </span>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 20,
                    background: ativo ? 'var(--success-bg)' : 'var(--danger-bg)',
                    color: ativo ? 'var(--success)' : 'var(--danger)',
                    transition: 'all 0.2s',
                  }}>
                    {estaSalvando ? '...' : ativo ? 'Ativo' : 'Inativo'}
                  </span>
                  {fb && (
                    <span style={{ fontSize: '0.75rem', color: feedback.ok ? 'var(--success)' : 'var(--danger)' }}>
                      {feedback.ok ? '✓ Salvo' : '✗ Erro'}
                    </span>
                  )}
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.5, margin: 0 }}>
                  {f.descricao}
                </p>
              </div>

              {/* Toggle */}
              <Toggle
                ativo={ativo}
                onChange={() => toggle(f.key)}
                salvando={estaSalvando}
              />
            </div>
          )
        })}
      </div>

      {/* Nota informativa */}
      <div style={{
        marginTop: '1.5rem',
        padding: '1rem 1.25rem',
        background: 'var(--warning-bg)',
        borderRadius: 12,
        border: '1px solid var(--warning)',
        borderLeft: '4px solid var(--warning)',
        fontSize: '0.825rem',
        color: 'var(--text-secondary)',
        lineHeight: 1.6,
      }}>
        <strong style={{ color: 'var(--warning)' }}>Atenção:</strong>{' '}
        Desativar um recurso não exclui os dados — apenas os oculta da interface.
        Ao reativar, tudo volta ao estado anterior.
      </div>
    </div>
  )
}
