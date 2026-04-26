import { useState, useEffect, useRef } from 'react'
import { useTheme } from '../../context/ThemeContext'
import api from '../../services/api'
import { API_BASE } from '../../config'

const GRUPOS = [
  {
    titulo: '🎨 Cores da marca',
    vars: [
      { key: 'brand',      label: 'Cor principal',  desc: 'Botões, links, destaques' },
      { key: 'brandLight', label: 'Brand claro',     desc: 'Fundo de badges e chips'  },
      { key: 'brandDark',  label: 'Brand escuro',    desc: 'Hover e estados ativos'   },
    ],
  },
  {
    titulo: '🖼 Superfícies',
    vars: [
      { key: 'surface', label: 'Fundo da página', desc: 'Background principal'   },
      { key: 'card',    label: 'Card',             desc: 'Painéis, modais, cards' },
      { key: 'border',  label: 'Borda',            desc: 'Divisores e contornos'  },
    ],
  },
  {
    titulo: '✍️ Tipografia',
    vars: [
      { key: 'textPrimary',   label: 'Texto primário',   desc: 'Títulos e corpo principal' },
      { key: 'textSecondary', label: 'Texto secundário', desc: 'Subtítulos e labels'       },
    ],
  },
  {
    titulo: '🚦 Semânticas',
    vars: [
      { key: 'success', label: 'Sucesso', desc: 'Confirmações e status OK' },
      { key: 'danger',  label: 'Perigo',  desc: 'Erros e exclusões'        },
      { key: 'warning', label: 'Aviso',   desc: 'Alertas e atenção'        },
    ],
  },
]

const PRESETS = [
  { key: 'laranja', label: 'Laranja', brand: '#C8520A', brandLight: '#FDF0E8', brandDark: '#9C3D06' },
  { key: 'azul',    label: 'Azul',    brand: '#1D6FA8', brandLight: '#E6F1FB', brandDark: '#0C447C' },
  { key: 'roxo',    label: 'Roxo',    brand: '#6D28D9', brandLight: '#EDE9FE', brandDark: '#4C1D95' },
  { key: 'verde',   label: 'Verde',   brand: '#059669', brandLight: '#ECFDF5', brandDark: '#065F46' },
  { key: 'rosa',    label: 'Rosa',    brand: '#DB2777', brandLight: '#FDF2F8', brandDark: '#9D174D' },
  { key: 'cinza',   label: 'Cinza',   brand: '#374151', brandLight: '#F9FAFB', brandDark: '#1F2937' },
]

function ColorPicker({ value, label, desc, onChange }) {
  const [hex, setHex] = useState(value || '')

  useEffect(() => setHex(value || ''), [value])

  const handleHex = (v) => {
    setHex(v)
    if (/^#[0-9A-Fa-f]{6}$/.test(v)) onChange(v)
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl"
         style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <label style={{ position: 'relative', cursor: 'pointer', flexShrink: 0 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: /^#[0-9A-Fa-f]{6}$/.test(hex) ? hex : 'var(--border)',
          border: '2px solid var(--border)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }} />
        <input type="color"
               value={/^#[0-9A-Fa-f]{6}$/.test(hex) ? hex : '#C8520A'}
               onChange={(e) => { setHex(e.target.value); onChange(e.target.value) }}
               style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
      </label>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{label}</p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-hint)' }}>{desc}</p>
      </div>

      <input value={hex} onChange={(e) => handleHex(e.target.value)}
             placeholder="#000000" maxLength={7}
             className="text-xs rounded-lg px-2 py-1.5 w-24 outline-none"
             style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontFamily: 'monospace' }}
             onFocus={(e) => e.target.style.borderColor = 'var(--brand)'}
             onBlur={(e)  => e.target.style.borderColor = 'var(--border)'} />
    </div>
  )
}

export default function ConfiguracoesAdmin() {
  const { config, salvarCores, resetarCores, previewCor, previewGlass, isDark, toggle, DEFAULTS } = useTheme()

  const [form, setForm]             = useState({ light: {}, dark: {} })
  const [modoEdicao, setModoEdicao] = useState('light')
  const [glass, setGlass]           = useState(false)
  const [glassColor, setGlassColor] = useState('#ffffff')
  const [glassOpacity, setGlassOpacity] = useState(12)
  const [glassBlur, setGlassBlur]   = useState(16)
  const [glassText, setGlassText]   = useState('')
  const [glassBgUrl, setGlassBgUrl] = useState('')
  const [uploadandoBg, setUploadandoBg] = useState(false)
  const [aba, setAba]               = useState('tema')
  const [salvando, setSalvando]     = useState(false)
  const [msg, setMsg]               = useState(null)
  const inputBgRef                  = useRef(null)

  useEffect(() => {
    const light = {}, dark = {}
    Object.keys(DEFAULTS.light).forEach(k => {
      light[k] = config[`light_${k}`] || DEFAULTS.light[k]
      dark[k]  = config[`dark_${k}`]  || DEFAULTS.dark[k]
    })
    setForm({ light, dark })
    setGlass(config.glass_enabled === 'true')
    setGlassColor(config.glass_color   || '#ffffff')
    setGlassOpacity(parseInt(config.glass_opacity ?? 12))
    setGlassBlur(parseInt(config.glass_blur ?? 16))
    setGlassText(config.glass_text     || '')
    setGlassBgUrl(config.glass_bg_url  || '')
  }, [config])

  // Preview em tempo real das configurações de glass
  const atualizarGlass = (campo, valor) => {
    const mapa = { glass, glassColor, glassOpacity, glassBlur, glassText }
    mapa[campo] = valor
    if (campo === 'glass')        setGlass(valor)
    if (campo === 'glassColor')   setGlassColor(valor)
    if (campo === 'glassOpacity') setGlassOpacity(valor)
    if (campo === 'glassBlur')    setGlassBlur(valor)
    if (campo === 'glassText')    setGlassText(valor)
    previewGlass(mapa.glass, {
      glass_color:   mapa.glassColor,
      glass_opacity: String(mapa.glassOpacity),
      glass_blur:    String(mapa.glassBlur),
      glass_text:    mapa.glassText,
    })
  }

  const handleUploadBg = async (file) => {
    if (!file) return
    setUploadandoBg(true)
    try {
      const fd = new FormData()
      fd.append('imagem', file)
      const { data } = await api.post('/configuracoes/fundo', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setGlassBgUrl(data.url)
    } catch {
      setMsg({ tipo: 'erro', texto: 'Erro ao enviar imagem.' })
      setTimeout(() => setMsg(null), 3000)
    } finally {
      setUploadandoBg(false)
    }
  }

  const removerBg = async () => {
    setUploadandoBg(true)
    try {
      await api.delete('/configuracoes/fundo')
      setGlassBgUrl('')
    } catch {
      setMsg({ tipo: 'erro', texto: 'Erro ao remover imagem.' })
      setTimeout(() => setMsg(null), 3000)
    } finally {
      setUploadandoBg(false)
    }
  }

  // Preview em tempo real ao editar
  const atualizar = (key, val) => {
    setForm(prev => ({
      ...prev,
      [modoEdicao]: { ...prev[modoEdicao], [key]: val },
    }))
    // Aplica preview apenas se o modo de edição for o modo atual
    if (modoEdicao === (isDark ? 'dark' : 'light')) {
      const cssVarMap = {
        brand: '--brand', brandLight: '--brand-light', brandDark: '--brand-dark',
        surface: '--surface', card: '--card', border: '--border',
        textPrimary: '--text-primary', textSecondary: '--text-secondary',
        success: '--success', danger: '--danger', warning: '--warning',
      }
      if (cssVarMap[key] && /^#[0-9A-Fa-f]{6}$/.test(val)) {
        previewCor(cssVarMap[key], val)
      }
    }
  }

  const aplicarPreset = (preset) => {
    const novo = {
      ...form[modoEdicao],
      brand: preset.brand,
      brandLight: preset.brandLight,
      brandDark: preset.brandDark,
    }
    setForm(prev => ({ ...prev, [modoEdicao]: novo }))
    // Preview se for o modo atual
    if (modoEdicao === (isDark ? 'dark' : 'light')) {
      previewCor('--brand',       preset.brand)
      previewCor('--brand-light', preset.brandLight)
      previewCor('--brand-dark',  preset.brandDark)
    }
  }

  const salvar = async () => {
    setSalvando(true)
    setMsg(null)
    try {
      const payload = {
        glass_enabled: String(glass),
        glass_color:   glassColor,
        glass_opacity: String(glassOpacity),
        glass_blur:    String(glassBlur),
        glass_text:    glassText,
        glass_bg_url:  glassBgUrl,
      }
      Object.entries(form.light).forEach(([k, v]) => { payload[`light_${k}`] = v })
      Object.entries(form.dark).forEach(([k, v])  => { payload[`dark_${k}`]  = v })
      await salvarCores(payload)
      setMsg({ tipo: 'ok', texto: '✓ Tema salvo em ambos os modos!' })
    } catch {
      setMsg({ tipo: 'erro', texto: 'Erro ao salvar. Tente novamente.' })
    } finally {
      setSalvando(false)
      setTimeout(() => setMsg(null), 4000)
    }
  }

  const resetar = async () => {
    if (!confirm('Resetar todas as cores para o padrão?')) return
    setSalvando(true)
    try {
      await resetarCores()
      setMsg({ tipo: 'ok', texto: 'Cores resetadas para o padrão.' })
    } finally {
      setSalvando(false)
      setTimeout(() => setMsg(null), 3000)
    }
  }

  const formAtual = form[modoEdicao] || {}
  const defaultsAtual = DEFAULTS[modoEdicao]

  return (
    <div className="p-6 pb-16" style={{ color: 'var(--text-primary)', fontFamily: 'DM Sans' }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1"
             style={{ color: 'var(--brand)', letterSpacing: '0.12em' }}>Dashboard</p>
          <h1 className="font-display text-2xl font-medium" style={{ color: 'var(--text-primary)' }}>
            Configurações
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-hint)' }}>
            Cores independentes por modo claro e escuro · Aplica-se globalmente
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={resetar} disabled={salvando}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
                  style={{ background: 'var(--surface)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
            ↺ Resetar
          </button>
          <button onClick={salvar} disabled={salvando}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                  style={{ background: 'var(--brand)', color: '#fff' }}>
            {salvando ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Salvando...
              </span>
            ) : '✓ Salvar tema'}
          </button>
        </div>
      </div>

      {/* Feedback */}
      {msg && (
        <div className="mb-5 px-4 py-3 rounded-xl text-sm font-medium"
             style={msg.tipo === 'ok'
               ? { background: 'var(--success-bg)', color: 'var(--success)', border: '1px solid var(--success)33' }
               : { background: 'var(--danger-bg)', color: 'var(--danger)' }}>
          {msg.texto}
        </div>
      )}

      {/* Abas principais */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl"
           style={{ background: 'var(--card)', width: 'fit-content', border: '1px solid var(--border)' }}>
        {[
          { key: 'tema',    label: '🎨 Cores'   },
          { key: 'efeitos', label: '✨ Efeitos'  },
          { key: 'modo',    label: '🌓 Modo'    },
          { key: 'preview', label: '👁 Preview' },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setAba(key)}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  style={aba === key
                    ? { background: 'var(--brand)', color: '#fff' }
                    : { color: 'var(--text-hint)', background: 'transparent' }}>
            {label}
          </button>
        ))}
      </div>

      {/* ── ABA CORES ── */}
      {aba === 'tema' && (
        <div className="space-y-5">

          {/* Selector de modo de edição */}
          <div className="rounded-2xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3"
               style={{ color: 'var(--text-hint)', letterSpacing: '0.1em' }}>
              Editando cores do modo
            </p>
            <div className="flex gap-3">
              {[
                { key: 'light', label: '☀️ Claro',  desc: 'Cores para o tema claro' },
                { key: 'dark',  label: '🌙 Escuro', desc: 'Cores para o tema escuro' },
              ].map(({ key, label, desc }) => (
                <button
                  key={key}
                  onClick={() => setModoEdicao(key)}
                  className="flex-1 p-4 rounded-xl text-left transition-all hover:scale-[1.02]"
                  style={modoEdicao === key
                    ? { background: 'var(--brand-light)', border: '2px solid var(--brand)' }
                    : { background: 'var(--surface)', border: '1px solid var(--border)' }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{label}</p>
                    {modoEdicao === key && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{ background: 'var(--brand)', color: '#fff' }}>
                        Editando
                      </span>
                    )}
                  </div>
                  <p className="text-xs" style={{ color: 'var(--text-hint)' }}>{desc}</p>
                  {/* Mini preview das cores */}
                  <div className="flex gap-1 mt-3">
                    {['brand', 'surface', 'card', 'textPrimary'].map(k => (
                      <div key={k} style={{
                        width: 16, height: 16, borderRadius: 4,
                        background: form[key]?.[k] || DEFAULTS[key][k],
                        border: '1px solid rgba(0,0,0,0.1)',
                      }} />
                    ))}
                  </div>
                </button>
              ))}
            </div>

            {/* Aviso se editando modo diferente do ativo */}
            {modoEdicao !== (isDark ? 'dark' : 'light') && (
              <div className="mt-3 px-3 py-2 rounded-lg flex items-center gap-2"
                   style={{ background: 'var(--warning-bg)', border: '1px solid var(--warning)33' }}>
                <span style={{ fontSize: '14px' }}>⚠️</span>
                <p className="text-xs" style={{ color: 'var(--warning)' }}>
                  Você está editando o modo {modoEdicao === 'dark' ? 'escuro' : 'claro'} mas visualizando o modo {isDark ? 'escuro' : 'claro'}.
                  O preview não refletirá as mudanças em tempo real.
                </p>
              </div>
            )}
          </div>

          {/* Presets */}
          <div className="rounded-2xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-4"
               style={{ color: 'var(--text-hint)', letterSpacing: '0.1em' }}>
              ⚡ Presets para o modo {modoEdicao === 'dark' ? 'escuro' : 'claro'}
            </p>
            <div className="flex gap-2 flex-wrap">
              {PRESETS.map((p) => (
                <button key={p.key} onClick={() => aplicarPreset(p)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:scale-[1.04] active:scale-[0.97]"
                        style={{ background: p.brand + '18', border: `1px solid ${p.brand}44`, color: p.brand }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: p.brand, flexShrink: 0 }} />
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grupos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {GRUPOS.map(({ titulo, vars }) => (
              <div key={titulo} className="rounded-2xl p-5 space-y-2"
                   style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <p className="text-xs font-semibold uppercase tracking-widest mb-3"
                   style={{ color: 'var(--text-hint)', letterSpacing: '0.1em' }}>
                  {titulo}
                </p>
                {vars.map(({ key, label, desc }) => (
                  <ColorPicker
                    key={`${modoEdicao}_${key}`}
                    value={formAtual[key] || defaultsAtual[key]}
                    label={label}
                    desc={desc}
                    onChange={(val) => atualizar(key, val)}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── ABA EFEITOS ── */}
      {aba === 'efeitos' && (
        <div className="space-y-4 max-w-2xl">

          {/* Toggle principal */}
          <div className="rounded-2xl p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                  Efeito Glass (Glassmorphism)
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                  Aplica vidro fosco no sidebar, header e cards do dashboard e área do cliente.
                </p>
              </div>
              <div onClick={() => atualizarGlass('glass', !glass)} className="cursor-pointer flex-shrink-0">
                <div className="w-12 h-7 rounded-full relative transition-all duration-200"
                     style={{ background: glass ? 'var(--brand)' : 'var(--border)' }}>
                  <span className="absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all duration-200"
                        style={{ left: glass ? '24px' : '4px' }} />
                </div>
              </div>
            </div>

            {/* Preview visual */}
            <div className="relative h-36 rounded-xl overflow-hidden"
                 style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)' }}>
              <div style={{ position: 'absolute', top: 10, left: 10, width: 70, height: 70, borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
              <div style={{ position: 'absolute', bottom: 10, right: 20, width: 50, height: 50, borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }} />
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
                            padding: '14px 24px', borderRadius: 14, minWidth: 180, textAlign: 'center',
                            background: glass ? `rgba(${parseInt(glassColor.slice(1,3),16)},${parseInt(glassColor.slice(3,5),16)},${parseInt(glassColor.slice(5,7),16)},${glassOpacity/100})` : 'rgba(255,255,255,0.95)',
                            backdropFilter: glass ? `blur(${glassBlur}px) saturate(180%)` : 'none',
                            WebkitBackdropFilter: glass ? `blur(${glassBlur}px) saturate(180%)` : 'none',
                            border: glass ? `1px solid rgba(255,255,255,${Math.min(glassOpacity/100*2.5,0.6)})` : 'none',
                            boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }}>
                <p style={{ fontSize: '13px', fontWeight: '700',
                            color: glassText || (glass ? '#ffffff' : 'var(--text-primary)'),
                            fontFamily: 'DM Sans' }}>
                  {glass ? 'Glass ativo' : 'Glass desativado'}
                </p>
                <p style={{ fontSize: '11px', color: glass ? 'rgba(255,255,255,0.75)' : 'var(--text-secondary)', marginTop: 2, fontFamily: 'DM Sans' }}>
                  {glass ? `blur(${glassBlur}px) · opacidade ${glassOpacity}%` : 'Fundo sólido'}
                </p>
              </div>
            </div>
          </div>

          {/* Configurações de glass (só visíveis quando ativo) */}
          {glass && (
            <div className="rounded-2xl p-6 space-y-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <p className="text-xs font-semibold uppercase tracking-widest"
                 style={{ color: 'var(--text-hint)', letterSpacing: '0.1em' }}>
                Configurações do Efeito
              </p>

              {/* Cor do glass */}
              <div>
                <label className="block text-xs font-semibold mb-2"
                       style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Cor do vidro
                </label>
                <div className="flex items-center gap-3 p-3 rounded-xl"
                     style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <label style={{ position: 'relative', cursor: 'pointer', flexShrink: 0 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: glassColor,
                                  border: '2px solid var(--border)', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }} />
                    <input type="color" value={glassColor}
                           onChange={(e) => atualizarGlass('glassColor', e.target.value)}
                           style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
                  </label>
                  <div className="flex-1">
                    <p className="text-xs" style={{ color: 'var(--text-hint)' }}>
                      Cor base da transparência. Branco = efeito claro, preto = escuro.
                    </p>
                  </div>
                  <input value={glassColor} maxLength={7} placeholder="#ffffff"
                         onChange={(e) => /^#[0-9A-Fa-f]{0,6}$/.test(e.target.value) && atualizarGlass('glassColor', e.target.value.padEnd(7,'0'))}
                         className="text-xs rounded-lg px-2 py-1.5 w-24 outline-none"
                         style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontFamily: 'monospace' }} />
                </div>
              </div>

              {/* Opacidade */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold uppercase tracking-widest"
                         style={{ color: 'var(--text-secondary)', letterSpacing: '0.08em' }}>
                    Opacidade
                  </label>
                  <span className="text-xs font-bold" style={{ color: 'var(--brand)' }}>{glassOpacity}%</span>
                </div>
                <input type="range" min="2" max="80" step="1" value={glassOpacity}
                       onChange={(e) => atualizarGlass('glassOpacity', parseInt(e.target.value))}
                       className="w-full" style={{ accentColor: 'var(--brand)' }} />
                <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-hint)' }}>
                  <span>2% (quase invisível)</span>
                  <span>80% (opaco)</span>
                </div>
              </div>

              {/* Intensidade do blur */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold uppercase tracking-widest"
                         style={{ color: 'var(--text-secondary)', letterSpacing: '0.08em' }}>
                    Intensidade do blur
                  </label>
                  <span className="text-xs font-bold" style={{ color: 'var(--brand)' }}>{glassBlur}px</span>
                </div>
                <input type="range" min="4" max="48" step="2" value={glassBlur}
                       onChange={(e) => atualizarGlass('glassBlur', parseInt(e.target.value))}
                       className="w-full" style={{ accentColor: 'var(--brand)' }} />
                <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-hint)' }}>
                  <span>4px (suave)</span>
                  <span>48px (intenso)</span>
                </div>
              </div>

              {/* Cor do texto */}
              <div>
                <label className="block text-xs font-semibold mb-2"
                       style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Cor do texto (opcional)
                </label>
                <div className="flex items-center gap-3 p-3 rounded-xl"
                     style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <label style={{ position: 'relative', cursor: 'pointer', flexShrink: 0 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8,
                                  background: /^#[0-9A-Fa-f]{6}$/.test(glassText) ? glassText : 'var(--border)',
                                  border: '2px solid var(--border)', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }} />
                    <input type="color" value={/^#[0-9A-Fa-f]{6}$/.test(glassText) ? glassText : '#ffffff'}
                           onChange={(e) => atualizarGlass('glassText', e.target.value)}
                           style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
                  </label>
                  <div className="flex-1">
                    <p className="text-xs" style={{ color: 'var(--text-hint)' }}>
                      Deixe vazio para usar a cor padrão do tema.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <input value={glassText} maxLength={7} placeholder="padrão"
                           onChange={(e) => atualizarGlass('glassText', e.target.value)}
                           className="text-xs rounded-lg px-2 py-1.5 w-24 outline-none"
                           style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontFamily: 'monospace' }} />
                    {glassText && (
                      <button onClick={() => atualizarGlass('glassText', '')}
                              className="text-xs px-2 rounded-lg"
                              style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Imagem de fundo */}
          <div className="rounded-2xl p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-1"
               style={{ color: 'var(--text-hint)', letterSpacing: '0.1em' }}>
              Imagem de fundo
            </p>
            <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
              Aparece atrás do glass. Combina melhor com o efeito ativo.
            </p>

            {/* Preview da imagem atual */}
            {glassBgUrl && (
              <div className="mb-4 relative rounded-xl overflow-hidden" style={{ height: 120 }}>
                <img src={glassBgUrl.startsWith('http') ? glassBgUrl : `${API_BASE}${glassBgUrl}`}
                     alt="Fundo atual" className="w-full h-full object-cover" />
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <button onClick={removerBg} disabled={uploadandoBg}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                          style={{ background: 'var(--danger)', color: '#fff' }}>
                    Remover imagem
                  </button>
                </div>
              </div>
            )}

            {/* URL externa */}
            <div className="flex gap-2 mb-3">
              <input value={glassBgUrl} placeholder="https://... ou deixe em branco"
                     onChange={(e) => setGlassBgUrl(e.target.value)}
                     className="flex-1 text-sm rounded-xl px-3 py-2.5 outline-none"
                     style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontFamily: 'DM Sans' }}
                     onFocus={(e) => e.target.style.borderColor = 'var(--brand)'}
                     onBlur={(e)  => e.target.style.borderColor = 'var(--border)'} />
            </div>

            {/* Upload de arquivo */}
            <div className="flex items-center gap-2">
              <input ref={inputBgRef} type="file" accept="image/*" className="hidden"
                     onChange={(e) => handleUploadBg(e.target.files[0])} />
              <button onClick={() => inputBgRef.current?.click()} disabled={uploadandoBg}
                      className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
                      style={{ background: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
                {uploadandoBg ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Enviando...
                  </span>
                ) : 'Enviar arquivo'}
              </button>
              <p className="text-xs" style={{ color: 'var(--text-hint)' }}>JPG, PNG, WEBP · máx 10 MB</p>
            </div>
          </div>

          {/* Nota de compatibilidade */}
          <div className="rounded-xl p-4" style={{ background: 'var(--warning-bg)', border: '1px solid rgba(0,0,0,0.05)' }}>
            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--warning)' }}>Compatibilidade</p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              O efeito glass usa <code>backdrop-filter</code>. Funciona em Chrome, Edge e Safari. Firefox requer flag experimental.
              Clique em "Salvar tema" para aplicar permanentemente.
            </p>
          </div>
        </div>
      )}

      {/* ── ABA MODO ── */}
      {aba === 'modo' && (
        <div className="space-y-4 max-w-lg">
          <div className="rounded-2xl p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
              Modo atual: {isDark ? '🌙 Escuro' : '☀️ Claro'}
            </p>
            <p className="text-xs mb-5" style={{ color: 'var(--text-hint)' }}>
              Salvo por usuário no navegador. Cada modo tem seu próprio conjunto de cores configurado na aba Cores.
            </p>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: '☀️ Modo claro',  dark: false },
                { label: '🌙 Modo escuro', dark: true  },
              ].map(({ label, dark }) => {
                const ativo = isDark === dark
                const cores = dark ? form.dark : form.light
                const bg    = cores?.surface || DEFAULTS[dark ? 'dark' : 'light'].surface
                const borda = cores?.border  || DEFAULTS[dark ? 'dark' : 'light'].border
                const brand = cores?.brand   || DEFAULTS[dark ? 'dark' : 'light'].brand

                return (
                  <button key={label} onClick={() => ativo ? null : toggle()}
                          className="p-5 rounded-2xl text-left transition-all hover:scale-[1.02]"
                          style={{
                            background: ativo ? 'var(--brand-light)' : 'var(--surface)',
                            border: ativo ? '2px solid var(--brand)' : '1px solid var(--border)',
                          }}>
                    {/* Mini mockup com as cores daquele modo */}
                    <div className="w-full h-24 rounded-xl mb-3 p-2 overflow-hidden"
                         style={{ background: bg, border: `1px solid ${borda}` }}>
                      {/* Header mini */}
                      <div className="h-5 rounded flex items-center px-1.5 gap-1 mb-1"
                           style={{ background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }}>
                        <div style={{ width: 12, height: 12, borderRadius: 3, background: brand }} />
                        <div style={{ flex: 1, height: 3, borderRadius: 2, background: dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)' }} />
                      </div>
                      {/* Cards mini */}
                      <div className="grid grid-cols-3 gap-1">
                        {[brand, brand + '80', brand + '40'].map((c, i) => (
                          <div key={i} style={{ height: 12, borderRadius: 3, background: c }} />
                        ))}
                      </div>
                      <div className="mt-1" style={{ height: 8, borderRadius: 3, background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }} />
                    </div>

                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{label}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-hint)' }}>
                      Brand: {cores?.brand || DEFAULTS[dark ? 'dark' : 'light'].brand}
                    </p>
                    {ativo
                      ? <p className="text-xs mt-1.5 font-semibold" style={{ color: 'var(--brand)' }}>● Ativo agora</p>
                      : <p className="text-xs mt-1.5" style={{ color: 'var(--text-hint)' }}>Clique para ativar</p>
                    }
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── ABA PREVIEW ── */}
      {aba === 'preview' && (
        <div className="space-y-4">
          <p className="text-xs" style={{ color: 'var(--text-hint)' }}>
            Preview com as cores do modo atual ({isDark ? 'escuro 🌙' : 'claro ☀️'}).
            Para ver o outro modo, troque na aba Modo.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div className="rounded-2xl p-5 space-y-3"
                 style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <p className="text-xs font-semibold uppercase tracking-widest mb-3"
                 style={{ color: 'var(--text-hint)', letterSpacing: '0.1em' }}>Botões</p>
              <button className="w-full py-3 rounded-xl font-semibold text-sm"
                      style={{ background: 'var(--brand)', color: '#fff' }}>Botão primário</button>
              <button className="w-full py-3 rounded-xl font-medium text-sm"
                      style={{ background: 'var(--brand-light)', color: 'var(--brand)', border: '1px solid var(--brand)' }}>
                Botão secundário
              </button>
              <div className="flex gap-2">
                <span className="flex-1 text-center py-2 rounded-xl text-xs font-semibold"
                      style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>Sucesso</span>
                <span className="flex-1 text-center py-2 rounded-xl text-xs font-semibold"
                      style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>Erro</span>
                <span className="flex-1 text-center py-2 rounded-xl text-xs font-semibold"
                      style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}>Aviso</span>
              </div>
            </div>

            <div className="rounded-2xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <p className="text-xs font-semibold uppercase tracking-widest mb-3"
                 style={{ color: 'var(--text-hint)', letterSpacing: '0.1em' }}>Card + Tipografia</p>
              <div className="rounded-xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <p className="font-display text-base font-medium" style={{ color: 'var(--text-primary)' }}>Título principal</p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Texto secundário de exemplo.</p>
                <div className="flex gap-2 mt-3">
                  <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                        style={{ background: 'var(--brand-light)', color: 'var(--brand)' }}>Badge</span>
                  <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                        style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>Ativo</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl p-5 space-y-3"
                 style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <p className="text-xs font-semibold uppercase tracking-widest mb-1"
                 style={{ color: 'var(--text-hint)', letterSpacing: '0.1em' }}>Formulário</p>
              {['Nome', 'Email'].map(f => (
                <div key={f}>
                  <label className="block text-xs font-semibold mb-1.5"
                         style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {f}
                  </label>
                  <input placeholder={f === 'Nome' ? 'Digite algo...' : 'seu@email.com'}
                         className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                         style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontFamily: 'DM Sans' }}
                         onFocus={(e) => e.target.style.borderColor = 'var(--brand)'}
                         onBlur={(e)  => e.target.style.borderColor = 'var(--border)'} />
                </div>
              ))}
            </div>

            <div className="rounded-2xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <p className="text-xs font-semibold uppercase tracking-widest mb-3"
                 style={{ color: 'var(--text-hint)', letterSpacing: '0.1em' }}>Métricas</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Pedidos', val: '24',     cor: 'var(--brand)'   },
                  { label: 'Receita', val: 'R$1.2k', cor: 'var(--success)' },
                  { label: 'Mesas',   val: '10',     cor: 'var(--warning)'  },
                  { label: 'Erros',   val: '0',      cor: 'var(--danger)'   },
                ].map(({ label, val, cor }) => (
                  <div key={label} className="p-3 rounded-xl"
                       style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{label}</p>
                    <p className="font-display text-xl font-medium" style={{ color: cor }}>{val}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}