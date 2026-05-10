import { useState, useEffect, useRef } from 'react'

const TAMANHOS = [
  { label: 'A',    escala: '100%', titulo: 'Tamanho normal'      },
  { label: 'A+',   escala: '112%', titulo: 'Tamanho médio'        },
  { label: 'A++',  escala: '125%', titulo: 'Tamanho grande'       },
  { label: 'A+++', escala: '140%', titulo: 'Tamanho extra grande' },
]

function aplicar({ tamanho = 0, contraste = false, espacamento = false, links = false }) {
  const html = document.documentElement
  html.style.fontSize = TAMANHOS[tamanho]?.escala ?? '100%'

  contraste   ? html.setAttribute('data-a11y-contrast',  '') : html.removeAttribute('data-a11y-contrast')
  espacamento ? html.setAttribute('data-a11y-spacing',   '') : html.removeAttribute('data-a11y-spacing')
  links       ? html.setAttribute('data-a11y-links',     '') : html.removeAttribute('data-a11y-links')
}

function ler(chave, padrao) {
  try {
    const v = localStorage.getItem(chave)
    if (v === null) return padrao
    if (padrao === false) return v === 'true'
    return Math.min(3, Math.max(0, Number(v)))
  } catch { return padrao }
}

function salvar(chave, val) {
  try { localStorage.setItem(chave, String(val)) } catch {}
}

export default function AcessibilidadeWidget() {
  const [aberto,      setAberto]      = useState(false)
  const [tamanho,     setTamanho]     = useState(0)
  const [contraste,   setContraste]   = useState(false)
  const [espacamento, setEspacamento] = useState(false)
  const [links,       setLinks]       = useState(false)
  const panelRef = useRef(null)

  // Restaura configurações salvas
  useEffect(() => {
    const t = ler('a11y_tamanho',     0)
    const c = ler('a11y_contraste',   false)
    const e = ler('a11y_espacamento', false)
    const l = ler('a11y_links',       false)
    setTamanho(t); setContraste(c); setEspacamento(e); setLinks(l)
    aplicar({ tamanho: t, contraste: c, espacamento: e, links: l })
  }, [])

  // Fecha ao clicar fora ou pressionar Escape
  useEffect(() => {
    if (!aberto) return
    const onKey   = (e) => { if (e.key === 'Escape') setAberto(false) }
    const onClick = (e) => { if (panelRef.current && !panelRef.current.contains(e.target)) setAberto(false) }
    document.addEventListener('keydown',   onKey)
    document.addEventListener('mousedown', onClick)
    return () => {
      document.removeEventListener('keydown',   onKey)
      document.removeEventListener('mousedown', onClick)
    }
  }, [aberto])

  const mudarTamanho = (val) => {
    setTamanho(val); salvar('a11y_tamanho', val)
    aplicar({ tamanho: val, contraste, espacamento, links })
  }
  const toggleContraste = () => {
    const next = !contraste; setContraste(next); salvar('a11y_contraste', next)
    aplicar({ tamanho, contraste: next, espacamento, links })
  }
  const toggleEspacamento = () => {
    const next = !espacamento; setEspacamento(next); salvar('a11y_espacamento', next)
    aplicar({ tamanho, contraste, espacamento: next, links })
  }
  const toggleLinks = () => {
    const next = !links; setLinks(next); salvar('a11y_links', next)
    aplicar({ tamanho, contraste, espacamento, links: next })
  }
  const resetar = () => {
    setTamanho(0); setContraste(false); setEspacamento(false); setLinks(false)
    ;['a11y_tamanho','a11y_contraste','a11y_espacamento','a11y_links'].forEach(k => {
      try { localStorage.removeItem(k) } catch {}
    })
    aplicar({ tamanho: 0, contraste: false, espacamento: false, links: false })
  }

  const algumAtivo = tamanho > 0 || contraste || espacamento || links

  const toggles = [
    { label: 'Alto contraste',  desc: 'Cores de alto contraste',     val: contraste,   fn: toggleContraste   },
    { label: 'Espaçamento',     desc: 'Mais espaço entre linhas',     val: espacamento, fn: toggleEspacamento },
    { label: 'Sublinhar links', desc: 'Torna links mais visíveis',    val: links,       fn: toggleLinks       },
  ]

  return (
    <div
      ref={panelRef}
      style={{ position: 'fixed', bottom: '55%', right: 9, zIndex: 9998, fontFamily: 'DM Sans' }}
    >
      {/* ── Painel ── */}
      {aberto && (
        <div
          role="dialog"
          aria-modal="false"
          aria-label="Opções de acessibilidade"
          style={{
            position: 'absolute', bottom: 40, right: 0, width: 272,
            background: 'var(--card)', border: '1px solid var(--border)',
            borderRadius: 16, padding: 16,
            boxShadow: '0 8px 40px rgba(0,0,0,0.28)',
          }}
        >
          {/* Cabeçalho */}
          <div style={{ marginBottom: 14 }}>
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                        letterSpacing: '0.12em', color: 'var(--brand)', marginBottom: 2 }}>
              Acessibilidade
            </p>
            <p style={{ fontSize: 11, color: 'var(--text-hint)', margin: 0 }}>
              Personalize a experiência de leitura
            </p>
          </div>

          {/* Tamanho do texto */}
          <div style={{ marginBottom: 14 }}>
            <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
                        letterSpacing: '0.08em', color: 'var(--text-secondary)', marginBottom: 6 }}>
              Tamanho do texto
            </p>
            <div style={{ display: 'flex', gap: 4 }} role="group" aria-label="Tamanho do texto">
              {TAMANHOS.map((item, i) => (
                <button
                  key={i}
                  onClick={() => mudarTamanho(i)}
                  aria-label={item.titulo}
                  aria-pressed={tamanho === i}
                  style={{
                    flex: 1, padding: '6px 0', borderRadius: 8,
                    border: `1px solid ${tamanho === i ? 'var(--brand)' : 'var(--border)'}`,
                    background: tamanho === i ? 'var(--brand-light)' : 'var(--surface)',
                    color: tamanho === i ? 'var(--brand)' : 'var(--text-secondary)',
                    fontWeight: 700, fontSize: 10 + i * 2, cursor: 'pointer',
                    lineHeight: 1,
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {toggles.map(({ label, desc, val, fn }) => (
              <button
                key={label}
                onClick={fn}
                aria-pressed={val}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  width: '100%', padding: '8px 10px', borderRadius: 10,
                  border: `1px solid ${val ? 'var(--brand)' : 'var(--border)'}`,
                  background: val ? 'var(--brand-light)' : 'var(--surface)',
                  cursor: 'pointer', textAlign: 'left',
                }}
              >
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, margin: 0,
                              color: val ? 'var(--brand)' : 'var(--text-primary)' }}>
                    {label}
                  </p>
                  <p style={{ fontSize: 10, color: 'var(--text-hint)', margin: 0 }}>{desc}</p>
                </div>
                {/* Toggle visual */}
                <div style={{
                  width: 32, height: 18, borderRadius: 9, flexShrink: 0,
                  background: val ? 'var(--brand)' : 'var(--border)', position: 'relative',
                }}>
                  <span style={{
                    position: 'absolute', top: 2, width: 14, height: 14,
                    borderRadius: '50%', background: '#fff',
                    left: val ? 16 : 2, transition: 'left 0.15s',
                  }} />
                </div>
              </button>
            ))}
          </div>

          {/* Resetar */}
          {algumAtivo && (
            <button
              onClick={resetar}
              style={{
                width: '100%', marginTop: 10, padding: '7px',
                borderRadius: 10, border: '1px solid var(--border)',
                background: 'transparent', color: 'var(--text-hint)',
                fontSize: 11, cursor: 'pointer',
              }}
            >
              ↺ Restaurar padrão
            </button>
          )}
        </div>
      )}

      {/* ── Botão flutuante ── */}
      <button
        onClick={() => setAberto(v => !v)}
        aria-label={aberto ? 'Fechar acessibilidade' : 'Abrir acessibilidade'}
        aria-expanded={aberto}
        aria-haspopup="dialog"
        title="Acessibilidade"
        style={{
          width: 44, height: 44, borderRadius: '50%',
          background: algumAtivo ? 'var(--brand)' : 'var(--card)',
          border: `2px solid ${algumAtivo ? 'var(--brand)' : 'var(--border)'}`,
          boxShadow: '0 4px 16px rgba(0,0,0,0.22)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', fontSize: 20, lineHeight: 1,
          transition: 'background 0.2s, border-color 0.2s',
        }}
      >
        <svg
          aria-hidden="true"
          width="22" height="22" viewBox="0 0 24 24" fill="none"
          stroke={algumAtivo ? '#fff' : 'var(--text-secondary)'}
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <circle cx="12" cy="4" r="1.5" />
          <path d="M12 6.5v5.5" />
          <path d="M9 9h6" />
          <path d="M9 12l-1.5 5.5" />
          <path d="M15 12l1.5 5.5" />
          <path d="M10 17.5l2 2.5 2-2.5" />
        </svg>
      </button>
    </div>
  )
}
