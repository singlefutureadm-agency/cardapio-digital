import { createContext, useContext, useEffect, useRef, useState } from 'react'
import api from '../services/api'

const ThemeContext = createContext(undefined)

const VARS_MAP = {
  brand:         '--brand',
  brandLight:    '--brand-light',
  brandDark:     '--brand-dark',
  surface:       '--surface',
  card:          '--card',
  border:        '--border',
  textPrimary:   '--text-primary',
  textSecondary: '--text-secondary',
  success:       '--success',
  danger:        '--danger',
  warning:       '--warning',
}

const DEFAULTS = {
  light: {
    brand:         '#C8520A',
    brandLight:    '#FDF0E8',
    brandDark:     '#9C3D06',
    surface:       '#FAFAF8',
    card:          '#FFFFFF',
    border:        '#ECECEA',
    textPrimary:   '#1A1A18',
    textSecondary: '#6B6B67',
    success:       '#1D7A4A',
    danger:        '#991B1B',
    warning:       '#A05C00',
  },
  dark: {
    brand:         '#E8702A',
    brandLight:    '#2A1A0E',
    brandDark:     '#C8520A',
    surface:       '#0F0F0D',
    card:          '#1A1A17',
    border:        '#2A2A26',
    textPrimary:   '#F0EFE9',
    textSecondary: '#9A9A94',
    success:       '#34D399',
    danger:        '#F87171',
    warning:       '#FCD34D',
  },
}

const EXTRAS_DARK = {
  '--text-hint':    '#5A5A56',
  '--success-bg':   'rgba(16,185,129,0.12)',
  '--warning-bg':   'rgba(245,158,11,0.12)',
  '--danger-bg':    'rgba(239,68,68,0.12)',
  '--shadow-sm':    '0 1px 3px rgba(0,0,0,0.3)',
  '--shadow-md':    '0 4px 12px rgba(0,0,0,0.4)',
  '--shadow-lg':    '0 8px 32px rgba(0,0,0,0.5)',
}
const EXTRAS_LIGHT = {
  '--text-hint':    '#A8A8A4',
  '--success-bg':   '#EAF5EF',
  '--warning-bg':   '#FEF3E2',
  '--danger-bg':    '#FEE2E2',
  '--shadow-sm':    '0 1px 3px rgba(0,0,0,0.08)',
  '--shadow-md':    '0 4px 12px rgba(0,0,0,0.10)',
  '--shadow-lg':    '0 8px 32px rgba(0,0,0,0.12)',
}

function hexToRgba(hex, alpha) {
  if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) hex = '#ffffff'
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha.toFixed(3)})`
}

function aplicarGlass(ativo, config = {}) {
  const root = document.documentElement

  if (!ativo) {
    root.removeAttribute('data-glass')
    ;['--glass-bg', '--glass-blur', '--glass-border', '--glass-shadow', '--glass-text'].forEach(v =>
      root.style.removeProperty(v)
    )
    const s = document.getElementById('glass-style')
    if (s) s.textContent = ''
    return
  }

  const color   = /^#[0-9A-Fa-f]{6}$/.test(config.glass_color) ? config.glass_color : '#ffffff'
  const opacity = Math.max(0.02, Math.min(0.92, parseFloat(config.glass_opacity ?? 12) / 100))
  const blur    = Math.max(4,  Math.min(48, parseInt(config.glass_blur ?? 16)))

  root.style.setProperty('--glass-bg',     hexToRgba(color, opacity))
  root.style.setProperty('--glass-blur',   `blur(${blur}px) saturate(180%)`)
  root.style.setProperty('--glass-border', hexToRgba(color, Math.min(opacity * 2.5, 0.6)))
  root.style.setProperty('--glass-shadow', '0 8px 32px rgba(0,0,0,0.25)')

  if (/^#[0-9A-Fa-f]{6}$/.test(config.glass_text)) {
    root.style.setProperty('--glass-text', config.glass_text)
  } else {
    root.style.removeProperty('--glass-text')
  }

  root.setAttribute('data-glass', 'true')
}

// Usa ?? em vez de || para não ignorar strings vazias (campo limpo deve usar default)
function resolveVar(saved, defaultVal) {
  return (saved && saved.trim() !== '') ? saved : defaultVal
}

function buildTheme(modo, config) {
  const prefix = modo === 'dark' ? 'dark_' : 'light_'
  const defs   = DEFAULTS[modo]
  const extras = modo === 'dark' ? EXTRAS_DARK : EXTRAS_LIGHT
  const vars   = {}

  Object.entries(extras).forEach(([k, v]) => { vars[k] = v })
  Object.entries(VARS_MAP).forEach(([key, cssVar]) => {
    vars[cssVar] = resolveVar(config[prefix + key], defs[key])
  })

  return vars
}

function aplicarTheme(vars) {
  Object.entries(vars).forEach(([k, v]) => {
    document.documentElement.style.setProperty(k, v)
  })
}

function resolveBgUrl(raw) {
  if (!raw) return ''
  if (raw.startsWith('http')) return raw
  const base = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001').replace(/\/$/, '')
  return `${base}${raw}`
}

function aplicarSiteIdentity(config) {
  if (config.site_title) document.title = config.site_title

  let meta = document.querySelector('meta[name="description"]')
  if (config.site_description) {
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'description')
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', config.site_description)
  }

  if (config.site_favicon) {
    let link = document.querySelector('link[rel~="icon"]')
    if (!link) {
      link = document.createElement('link')
      link.setAttribute('rel', 'icon')
      document.head.appendChild(link)
    }
    link.setAttribute('href', config.site_favicon)
  }
}

export function ThemeProvider({ children }) {
  const [theme, setTheme]           = useState(() =>
    localStorage.getItem('theme') ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  )
  const [config, setConfig]         = useState({})
  const [carregando, setCarregando] = useState(true)

  // Ref sempre com o config mais recente, evita closure stale no toggle()
  const configRef = useRef({})
  useEffect(() => { configRef.current = config }, [config])

  useEffect(() => {
    const modo = localStorage.getItem('theme') ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')

    document.documentElement.setAttribute('data-theme', modo)
    aplicarTheme(buildTheme(modo, {}))

    api.get('/configuracoes')
      .then(({ data }) => {
        setConfig(data)
        configRef.current = data
        document.documentElement.setAttribute('data-theme', modo)
        aplicarTheme(buildTheme(modo, data))
        aplicarGlass(data.glass_enabled === 'true', data)
        aplicarSiteIdentity(data)
      })
      .catch(() => {})
      .finally(() => setCarregando(false))
  }, [])

  const toggle = () => {
    const novo = theme === 'light' ? 'dark' : 'light'
    setTheme(novo)
    localStorage.setItem('theme', novo)
    document.documentElement.setAttribute('data-theme', novo)
    // Usa configRef para ter sempre o config mais recente, mesmo sem re-render
    aplicarTheme(buildTheme(novo, configRef.current))
  }

  const salvarCores = async (novasConfigs) => {
    const { data } = await api.post('/configuracoes', novasConfigs)
    setConfig(data)
    configRef.current = data
    // Re-aplica tema, glass e identidade do site com os dados recém-salvos
    document.documentElement.setAttribute('data-theme', theme)
    aplicarTheme(buildTheme(theme, data))
    aplicarGlass(data.glass_enabled === 'true', data)
    aplicarSiteIdentity(data)
    return data
  }

  const resetarCores = async () => {
    const reset = {}
    Object.keys(VARS_MAP).forEach(k => {
      reset[`light_${k}`] = ''
      reset[`dark_${k}`]  = ''
    })
    reset.glass_enabled = 'false'
    reset.glass_color   = ''
    reset.glass_opacity = ''
    reset.glass_blur    = ''
    reset.glass_text    = ''
    reset.glass_bg_url  = ''
    await api.post('/configuracoes', reset)
    const emptyConfig = {}
    setConfig(emptyConfig)
    configRef.current = emptyConfig
    document.documentElement.setAttribute('data-theme', theme)
    aplicarTheme(buildTheme(theme, emptyConfig))
    aplicarGlass(false, {})
  }

  const previewCor = (cssVar, valor) => {
    document.documentElement.style.setProperty(cssVar, valor)
  }

  const previewGlass = (ativo, glassConfig) => {
    aplicarGlass(ativo, { ...configRef.current, ...glassConfig })
  }

  const features = {
    shows:        config.feature_shows        !== '0',
    menutv:       config.feature_menutv       !== '0',
    preferencias: config.feature_preferencias !== '0',
    mesas:        config.feature_mesas        !== '0',
    pix:          config.feature_pix          !== '0',
  }

  return (
    <ThemeContext.Provider value={{
      theme,
      isDark: theme === 'dark',
      toggle,
      config,
      salvarCores,
      resetarCores,
      previewCor,
      previewGlass,
      carregando,
      glass:    config.glass_enabled === 'true',
      bgUrl:    resolveBgUrl(config.glass_bg_url),
      features,
      DEFAULTS,
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme deve ser usado dentro de ThemeProvider')
  return ctx
}
