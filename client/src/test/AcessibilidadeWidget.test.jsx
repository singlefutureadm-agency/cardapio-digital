import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AcessibilidadeWidget from '../components/AcessibilidadeWidget'

// ── Helpers ────────────────────────────────────────────────────────────────

const html = () => document.documentElement

function renderWidget() {
  return render(<AcessibilidadeWidget />)
}

// ── Setup / Teardown ───────────────────────────────────────────────────────

beforeEach(() => {
  localStorage.clear()
  // Reseta atributos e fontSize que possam ter vazado de testes anteriores
  html().style.fontSize = ''
  ;['data-a11y-contrast', 'data-a11y-spacing', 'data-a11y-links'].forEach(a =>
    html().removeAttribute(a)
  )
})

afterEach(() => {
  localStorage.clear()
})

// ── Renderização ───────────────────────────────────────────────────────────

describe('Renderização inicial', () => {
  it('exibe o botão de acessibilidade', () => {
    renderWidget()
    expect(screen.getByRole('button', { name: /abrir acessibilidade/i })).toBeInTheDocument()
  })

  it('painel está fechado por padrão', () => {
    renderWidget()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('abre o painel ao clicar no botão', async () => {
    const user = userEvent.setup()
    renderWidget()
    await user.click(screen.getByRole('button', { name: /abrir acessibilidade/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('fecha o painel ao clicar novamente', async () => {
    const user = userEvent.setup()
    renderWidget()
    const btn = screen.getByRole('button', { name: /abrir acessibilidade/i })
    await user.click(btn)
    await user.click(screen.getByRole('button', { name: /fechar acessibilidade/i }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('fecha o painel ao pressionar Escape', async () => {
    const user = userEvent.setup()
    renderWidget()
    await user.click(screen.getByRole('button', { name: /abrir acessibilidade/i }))
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

// ── Tamanho do texto ───────────────────────────────────────────────────────

describe('Tamanho do texto', () => {
  it('começa no tamanho normal (100%)', () => {
    renderWidget()
    // html.style.fontSize pode ser '' (valor padrão) ou '100%' após mount
    const fs = html().style.fontSize
    expect(['', '100%']).toContain(fs)
  })

  it('aplica 112% ao selecionar A+', async () => {
    const user = userEvent.setup()
    renderWidget()
    await user.click(screen.getByRole('button', { name: /abrir acessibilidade/i }))
    await user.click(screen.getByRole('button', { name: /tamanho médio/i }))
    expect(html().style.fontSize).toBe('112%')
  })

  it('aplica 125% ao selecionar A++', async () => {
    const user = userEvent.setup()
    renderWidget()
    await user.click(screen.getByRole('button', { name: /abrir acessibilidade/i }))
    await user.click(screen.getByRole('button', { name: /tamanho grande/i }))
    expect(html().style.fontSize).toBe('125%')
  })

  it('aplica 140% ao selecionar A+++', async () => {
    const user = userEvent.setup()
    renderWidget()
    await user.click(screen.getByRole('button', { name: /abrir acessibilidade/i }))
    await user.click(screen.getByRole('button', { name: /tamanho extra grande/i }))
    expect(html().style.fontSize).toBe('140%')
  })

  it('persiste tamanho no localStorage', async () => {
    const user = userEvent.setup()
    renderWidget()
    await user.click(screen.getByRole('button', { name: /abrir acessibilidade/i }))
    await user.click(screen.getByRole('button', { name: /tamanho grande/i }))
    expect(localStorage.getItem('a11y_tamanho')).toBe('2')
  })

  it('restaura tamanho do localStorage no mount', () => {
    localStorage.setItem('a11y_tamanho', '3')
    renderWidget()
    expect(html().style.fontSize).toBe('140%')
  })
})

// ── Alto contraste ─────────────────────────────────────────────────────────

describe('Alto contraste', () => {
  it('ativa data-a11y-contrast ao ligar', async () => {
    const user = userEvent.setup()
    renderWidget()
    await user.click(screen.getByRole('button', { name: /abrir acessibilidade/i }))
    await user.click(screen.getByRole('button', { name: /alto contraste/i }))
    expect(html()).toHaveAttribute('data-a11y-contrast')
  })

  it('remove data-a11y-contrast ao desligar', async () => {
    const user = userEvent.setup()
    renderWidget()
    await user.click(screen.getByRole('button', { name: /abrir acessibilidade/i }))
    const btn = screen.getByRole('button', { name: /alto contraste/i })
    await user.click(btn) // liga
    await user.click(btn) // desliga
    expect(html()).not.toHaveAttribute('data-a11y-contrast')
  })

  it('persiste contraste no localStorage', async () => {
    const user = userEvent.setup()
    renderWidget()
    await user.click(screen.getByRole('button', { name: /abrir acessibilidade/i }))
    await user.click(screen.getByRole('button', { name: /alto contraste/i }))
    expect(localStorage.getItem('a11y_contraste')).toBe('true')
  })

  it('restaura contraste do localStorage no mount', () => {
    localStorage.setItem('a11y_contraste', 'true')
    renderWidget()
    expect(html()).toHaveAttribute('data-a11y-contrast')
  })
})

// ── Espaçamento ────────────────────────────────────────────────────────────

describe('Espaçamento de texto', () => {
  it('ativa data-a11y-spacing ao ligar', async () => {
    const user = userEvent.setup()
    renderWidget()
    await user.click(screen.getByRole('button', { name: /abrir acessibilidade/i }))
    await user.click(screen.getByRole('button', { name: /espaçamento/i }))
    expect(html()).toHaveAttribute('data-a11y-spacing')
  })

  it('persiste espaçamento no localStorage', async () => {
    const user = userEvent.setup()
    renderWidget()
    await user.click(screen.getByRole('button', { name: /abrir acessibilidade/i }))
    await user.click(screen.getByRole('button', { name: /espaçamento/i }))
    expect(localStorage.getItem('a11y_espacamento')).toBe('true')
  })

  it('restaura espaçamento do localStorage no mount', () => {
    localStorage.setItem('a11y_espacamento', 'true')
    renderWidget()
    expect(html()).toHaveAttribute('data-a11y-spacing')
  })
})

// ── Sublinhar links ────────────────────────────────────────────────────────

describe('Sublinhar links', () => {
  it('ativa data-a11y-links ao ligar', async () => {
    const user = userEvent.setup()
    renderWidget()
    await user.click(screen.getByRole('button', { name: /abrir acessibilidade/i }))
    await user.click(screen.getByRole('button', { name: /sublinhar links/i }))
    expect(html()).toHaveAttribute('data-a11y-links')
  })

  it('persiste links no localStorage', async () => {
    const user = userEvent.setup()
    renderWidget()
    await user.click(screen.getByRole('button', { name: /abrir acessibilidade/i }))
    await user.click(screen.getByRole('button', { name: /sublinhar links/i }))
    expect(localStorage.getItem('a11y_links')).toBe('true')
  })
})

// ── Resetar ────────────────────────────────────────────────────────────────

describe('Resetar', () => {
  it('botão resetar não aparece quando nada está ativo', async () => {
    const user = userEvent.setup()
    renderWidget()
    await user.click(screen.getByRole('button', { name: /abrir acessibilidade/i }))
    expect(screen.queryByText(/restaurar padrão/i)).not.toBeInTheDocument()
  })

  it('botão resetar aparece após ativar qualquer recurso', async () => {
    const user = userEvent.setup()
    renderWidget()
    await user.click(screen.getByRole('button', { name: /abrir acessibilidade/i }))
    await user.click(screen.getByRole('button', { name: /alto contraste/i }))
    expect(screen.getByText(/restaurar padrão/i)).toBeInTheDocument()
  })

  it('resetar remove todos os atributos e limpa localStorage', async () => {
    const user = userEvent.setup()
    renderWidget()
    await user.click(screen.getByRole('button', { name: /abrir acessibilidade/i }))
    await user.click(screen.getByRole('button', { name: /alto contraste/i }))
    await user.click(screen.getByRole('button', { name: /espaçamento/i }))
    await user.click(screen.getByRole('button', { name: /tamanho grande/i }))
    await user.click(screen.getByText(/restaurar padrão/i))

    expect(html()).not.toHaveAttribute('data-a11y-contrast')
    expect(html()).not.toHaveAttribute('data-a11y-spacing')
    expect(html()).not.toHaveAttribute('data-a11y-links')
    expect(['', '100%']).toContain(html().style.fontSize)
    expect(localStorage.getItem('a11y_contraste')).toBeNull()
    expect(localStorage.getItem('a11y_tamanho')).toBeNull()
  })
})

// ── ARIA ───────────────────────────────────────────────────────────────────

describe('ARIA e acessibilidade do próprio widget', () => {
  it('botão tem aria-expanded=false quando fechado', () => {
    renderWidget()
    const btn = screen.getByRole('button', { name: /abrir acessibilidade/i })
    expect(btn).toHaveAttribute('aria-expanded', 'false')
  })

  it('botão tem aria-expanded=true quando aberto', async () => {
    const user = userEvent.setup()
    renderWidget()
    await user.click(screen.getByRole('button', { name: /abrir acessibilidade/i }))
    const btn = screen.getByRole('button', { name: /fechar acessibilidade/i })
    expect(btn).toHaveAttribute('aria-expanded', 'true')
  })

  it('toggles têm aria-pressed correto', async () => {
    const user = userEvent.setup()
    renderWidget()
    await user.click(screen.getByRole('button', { name: /abrir acessibilidade/i }))
    const contrastte = screen.getByRole('button', { name: /alto contraste/i })
    expect(contrastte).toHaveAttribute('aria-pressed', 'false')
    await user.click(contrastte)
    expect(screen.getByRole('button', { name: /alto contraste/i })).toHaveAttribute('aria-pressed', 'true')
  })

  it('botões de tamanho têm aria-pressed correto', async () => {
    const user = userEvent.setup()
    renderWidget()
    await user.click(screen.getByRole('button', { name: /abrir acessibilidade/i }))
    const aMedio = screen.getByRole('button', { name: /tamanho médio/i })
    await user.click(aMedio)
    expect(aMedio).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: /tamanho normal/i })).toHaveAttribute('aria-pressed', 'false')
  })
})
