import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import api from '../services/api'
import { API_BASE } from '../config'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import ThemeToggle from '../components/ThemeToggle'

gsap.registerPlugin(ScrollTrigger)

const ICONES = {
  'Entradas': '🥗',
  'Pratos Principais': '🍽️',
  'Bebidas': '🥤',
  'Sobremesas': '🍮',
}

const GENERO_EMOJI = {
  Samba: '🪘', MPB: '🎵', Jazz: '🎷', Rock: '🎸',
  Sertanejo: '🤠', Pagode: '🥁', Forró: '🪗', Eletrônico: '🎛️', Outro: '🎤',
}

const DIFERENCIAIS = [
  { icone: '⚡', titulo: 'Pedido na mesa', desc: 'Escaneie o QR, escolha e peça. Sem esperar o garçom.' },
  { icone: '🔴', titulo: 'Tempo real', desc: 'Acompanhe cada etapa do seu pedido ao vivo.' },
  { icone: '💳', titulo: 'Pague como quiser', desc: 'Pix, cartão ou com o garçom na mesa.' },
  { icone: '✨', titulo: 'Experiência premium', desc: 'Interface pensada para ser rápida e elegante.' },
]

const DEPOIMENTOS = [
  { nome: 'Ana Lima', texto: 'Pedi sem precisar chamar ninguém. O pedido chegou certinho e acompanhei tudo pelo celular.', estrelas: 5 },
  { nome: 'Carlos Mendes', texto: 'Sistema muito moderno. O cardápio é lindo e o processo de pagamento super simples.', estrelas: 5 },
  { nome: 'Fernanda Costa', texto: 'Adorei poder ver o status do pedido em tempo real. Restaurante nota 10!', estrelas: 5 },
]

/* ── CountUp animado ── */
function CountUp({ end, suffix = '', duration = 2 }) {
  const ref = useRef(null)
  const triggered = useRef(false)
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !triggered.current) {
        triggered.current = true
        const obj = { val: 0 }
        gsap.to(obj, {
          val: parseFloat(end), duration, ease: 'power2.out',
          onUpdate: () => {
            if (ref.current)
              ref.current.textContent = Number.isInteger(parseFloat(end))
                ? Math.floor(obj.val) + suffix
                : obj.val.toFixed(1) + suffix
          },
        })
      }
    }, { threshold: 0.5 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [end, suffix, duration])
  return <span ref={ref}>0{suffix}</span>
}

/* ── Estrelas ── */
const Estrelas = ({ n }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: n }).map((_, i) => (
      <span key={i} style={{ color: 'var(--brand)', fontSize: '14px' }}>★</span>
    ))}
  </div>
)

/* ── Linha decorativa animada ── */
function AnimLine({ className = '', style = {} }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!ref.current) return
    gsap.fromTo(ref.current,
      { scaleX: 0, transformOrigin: 'left center' },
      { scaleX: 1, duration: 1.2, ease: 'power3.inOut',
        scrollTrigger: { trigger: ref.current, start: 'top 90%' } })
  }, [])
  return <div ref={ref} className={className} style={style} />
}

/* ── Formulário de contato ── */
function ContatoForm() {
  const [form, setForm] = useState({ nome: '', email: '', mensagem: '' })
  const [enviado, setEnviado] = useState(false)
  const formRef = useRef(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    gsap.to(formRef.current, {
      opacity: 0, y: -10, duration: 0.3, ease: 'power2.in',
      onComplete: () => setEnviado(true),
    })
  }

  const inputBase = {
    width: '100%', background: 'var(--surface)', border: '1px solid var(--border)',
    color: 'var(--text-primary)', fontFamily: 'DM Sans', borderRadius: '12px',
    padding: '13px 16px', outline: 'none', fontSize: '14px', transition: 'border-color 0.2s',
  }
  const labelBase = {
    display: 'block', fontSize: '11px', fontWeight: '600',
    textTransform: 'uppercase', letterSpacing: '0.09em',
    color: 'var(--text-hint)', marginBottom: '6px',
  }

  if (enviado) return (
    <div className="flex flex-col items-center justify-center h-52 gap-4">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
           style={{ background: 'var(--brand-light)' }}>✅</div>
      <p className="font-display text-lg font-medium" style={{ color: 'var(--text-primary)' }}>Mensagem enviada!</p>
      <p className="text-sm text-center" style={{ color: 'var(--text-secondary)' }}>Retornaremos em breve.</p>
      <button onClick={() => setEnviado(false)} className="text-sm font-semibold mt-1"
              style={{ color: 'var(--brand)' }}>Enviar outra →</button>
    </div>
  )

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
      {[
        { key: 'nome', label: 'Nome', type: 'text', placeholder: 'Seu nome' },
        { key: 'email', label: 'Email', type: 'email', placeholder: 'seu@email.com' },
      ].map(({ key, label, type, placeholder }) => (
        <div key={key}>
          <label style={labelBase}>{label}</label>
          <input type={type} placeholder={placeholder} value={form[key]} required
                 onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                 style={inputBase}
                 onFocus={(e) => e.target.style.borderColor = 'var(--brand)'}
                 onBlur={(e) => e.target.style.borderColor = 'var(--border)'} />
        </div>
      ))}
      <div>
        <label style={labelBase}>Mensagem</label>
        <textarea placeholder="Como podemos ajudar?" value={form.mensagem} required rows={4}
                  onChange={(e) => setForm({ ...form, mensagem: e.target.value })}
                  style={{ ...inputBase, resize: 'none' }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--brand)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border)'} />
      </div>
      <button type="submit"
              className="w-full py-4 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] group"
              style={{ background: 'var(--brand)', color: '#fff', boxShadow: '0 4px 20px rgba(200,82,10,0.3)', position: 'relative', overflow: 'hidden' }}>
        <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.1), transparent)' }} />
        <span className="relative">Enviar mensagem</span>
      </button>
    </form>
  )
}

/* ════════════════════════════════════
   COMPONENTE PRINCIPAL
════════════════════════════════════ */
export default function LandingPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { isDark, features } = useTheme()

  const [menu, setMenu]             = useState([])
  const [categoriaAtiva, setCat]    = useState(null)
  const [loading, setLoading]       = useState(true)
  const [menuAberto, setMenuAberto] = useState(false)
  const [newsletter, setNewsletter] = useState({ email: '', status: null })
  const [scrolled, setScrolled]     = useState(false)
  const [shows, setShows]           = useState([])

  const heroRef       = useRef(null)
  const sobreRef      = useRef(null)
  const cardapioRef   = useRef(null)
  const contatoRef    = useRef(null)
  const newsletterRef = useRef(null)
  const difsRef       = useRef(null)
  const depRef        = useRef(null)
  const magnetRef     = useRef(null)
  const showsRef      = useRef(null)

  /* carrega menu */
  useEffect(() => {
    api.get('/menu').then(({ data }) => {
      setMenu(data); setCat(data[0]?.id ?? null); setLoading(false)
    })
  }, [])

  /* carrega shows */
  useEffect(() => {
    if (!features.shows) { setShows([]); return }
    api.get('/shows/proximos').then(({ data }) => setShows(data)).catch(() => {})
  }, [features.shows])

  /* scroll navbar */
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  /* GSAP — hero */
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.15 })
      tl.fromTo('.hero-badge',
          { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' })
        .fromTo('.hero-title span',
          { opacity: 0, y: 64, skewY: 5 },
          { opacity: 1, y: 0, skewY: 0, duration: 0.9, stagger: 0.18, ease: 'power4.out' }, '-=0.2')
        .fromTo('.hero-sub',
          { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.4')
        .fromTo('.hero-btns',
          { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.35')
        .fromTo('.hero-stat',
          { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out' }, '-=0.3')

      gsap.to('.hero-grid', {
        yPercent: -22, ease: 'none',
        scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: true },
      })
      gsap.to('.hero-orb1', {
        y: -90, ease: 'none',
        scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: 1.5 },
      })
      gsap.to('.hero-orb2', {
        y: -45, ease: 'none',
        scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: 1 },
      })
    }, heroRef)
    return () => ctx.revert()
  }, [])

  /* GSAP — diferenciais */
  useEffect(() => {
    if (!difsRef.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo('.dif-card',
        { opacity: 0, y: 50, scale: 0.94 },
        { opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.12, ease: 'power3.out',
          scrollTrigger: { trigger: difsRef.current, start: 'top 82%' } })
    }, difsRef)
    return () => ctx.revert()
  }, [])

  /* GSAP — sobre */
  useEffect(() => {
    if (!sobreRef.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo('.sobre-left > *',
        { opacity: 0, x: -50 },
        { opacity: 1, x: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out',
          scrollTrigger: { trigger: sobreRef.current, start: 'top 78%' } })
      gsap.fromTo('.sobre-right',
        { opacity: 0, x: 50, scale: 0.95 },
        { opacity: 1, x: 0, scale: 1, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: sobreRef.current, start: 'top 78%' } })
      gsap.fromTo('.sobre-stat',
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.5, stagger: 0.1, ease: 'back.out(1.7)',
          scrollTrigger: { trigger: '.sobre-stats', start: 'top 86%' } })
    }, sobreRef)
    return () => ctx.revert()
  }, [])

  /* GSAP — depoimentos */
  useEffect(() => {
    if (!depRef.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo('.dep-card',
        { opacity: 0, y: 40, rotateY: 8 },
        { opacity: 1, y: 0, rotateY: 0, duration: 0.7, stagger: 0.15, ease: 'power3.out',
          scrollTrigger: { trigger: depRef.current, start: 'top 82%' } })
    }, depRef)
    return () => ctx.revert()
  }, [])

  /* GSAP — newsletter */
  useEffect(() => {
    if (!newsletterRef.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo('.nl-content > *',
        { opacity: 0, y: 32 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out',
          scrollTrigger: { trigger: newsletterRef.current, start: 'top 82%' } })
    }, newsletterRef)
    return () => ctx.revert()
  }, [])

  /* GSAP — shows */
  useEffect(() => {
    if (!showsRef.current || shows.length === 0) return
    const ctx = gsap.context(() => {
      gsap.fromTo('.show-card',
        { opacity: 0, y: 40, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: showsRef.current, start: 'top 82%' } })
    }, showsRef)
    return () => ctx.revert()
  }, [shows])

  /* GSAP — menu cards (re-anima ao trocar categoria) */
  useEffect(() => {
    if (loading || !cardapioRef.current) return
    gsap.fromTo('.menu-card',
      { opacity: 0, y: 28, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, duration: 0.45, stagger: 0.06, ease: 'power3.out' })
  }, [loading, categoriaAtiva])

  const scrollTo = (ref) => {
    setMenuAberto(false)
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const itens = menu.find((c) => c.id === categoriaAtiva)?.itens ?? []

  const enviarNewsletter = async (e) => {
    e.preventDefault()
    if (!newsletter.email) return
    try {
      await api.post('/newsletter', { email: newsletter.email })
      setNewsletter({ email: '', status: 'ok' })
    } catch (err) {
      const msg = err.response?.data?.error || ''
      setNewsletter(s => ({ ...s, status: msg === 'Email já cadastrado' ? 'ja_cadastrado' : 'erro' }))
    }
  }

  /* Efeito magnético no CTA */
  const handleMagnet = (e) => {
    if (!magnetRef.current) return
    const rect = magnetRef.current.getBoundingClientRect()
    gsap.to(magnetRef.current, {
      x: (e.clientX - rect.left - rect.width / 2) * 0.25,
      y: (e.clientY - rect.top - rect.height / 2) * 0.25,
      duration: 0.3, ease: 'power2.out',
    })
  }
  const resetMagnet = () => gsap.to(magnetRef.current, {
    x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1,0.4)',
  })

  const navLinks = [
    { label: 'Sobre',    ref: sobreRef },
    { label: 'Cardápio', ref: cardapioRef },
    ...(shows.length > 0 ? [{ label: 'Shows', ref: showsRef }] : []),
    { label: 'Contato',  ref: contatoRef },
  ]

  /* Background scrolled adaptado ao tema */
  const navBg = scrolled
    ? isDark
      ? 'rgba(26,26,23,0.92)'
      : 'rgba(250,250,248,0.92)'
    : 'transparent'

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: 'var(--surface)', fontFamily: 'DM Sans' }}>

      {/* ═══════════════════════════════
          NAVBAR
      ═══════════════════════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
           style={{
             background: navBg,
             backdropFilter: scrolled ? 'blur(16px)' : 'none',
             borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
           }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer group"
               onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base transition-transform group-hover:rotate-12 duration-300"
                 style={{ background: 'var(--brand)', color: '#fff' }}>
              🍽
            </div>
            <span className="font-display text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
              Restaurante
            </span>
          </div>

          {/* Links desktop */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(({ label, ref }) => (
              <button key={label} onClick={() => scrollTo(ref)}
                      className="text-sm font-medium relative group transition-colors"
                      style={{ color: 'var(--text-secondary)' }}>
                {label}
                <span className="absolute -bottom-0.5 left-0 w-0 h-px group-hover:w-full transition-all duration-300"
                      style={{ background: 'var(--brand)' }} />
              </button>
            ))}
          </div>

          {/* Ações desktop */}
          <div className="hidden md:flex items-center gap-3">
            {/* Toggle de tema */}
            <ThemeToggle />

            {user ? (
              <>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Olá, {user.nome.split(' ')[0]}
                </span>
                {user.role === 'ADMIN' && (
                  <button onClick={() => navigate('/dashboard')}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:scale-[1.03]"
                          style={{ background: 'var(--brand-light)', color: 'var(--brand)' }}>
                    Dashboard ↗
                  </button>
                )}
                <button onClick={() => navigate(user?.role === 'ADMIN' ? '/dashboard' : '/cliente/1')}
                        className="text-sm font-semibold px-5 py-2.5 rounded-xl transition-all hover:scale-[1.03] active:scale-[0.97]"
                        style={{ background: 'var(--brand)', color: '#fff', boxShadow: '0 4px 16px rgba(200,82,10,0.3)' }}>
                  Fazer pedido
                </button>
                <button onClick={logout} className="text-sm px-3 py-2 rounded-xl"
                        style={{ color: 'var(--text-hint)', border: '1px solid var(--border)' }}>
                  Sair
                </button>
              </>
            ) : (
              <>
                <button onClick={() => navigate('/login')}
                        className="text-sm font-medium px-4 py-2 rounded-xl transition-all hover:scale-[1.02]"
                        style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                  Entrar
                </button>
                <button onClick={() => navigate('/register')}
                        className="text-sm font-semibold px-5 py-2.5 rounded-xl transition-all hover:scale-[1.03] active:scale-[0.97]"
                        style={{ background: 'var(--brand)', color: '#fff', boxShadow: '0 4px 16px rgba(200,82,10,0.3)' }}>
                  Criar conta
                </button>
              </>
            )}
          </div>

          {/* Hamburguer */}
          <button className="md:hidden flex flex-col gap-1.5 p-2"
                  onClick={() => setMenuAberto(!menuAberto)}>
            <span className="block w-5 h-px transition-all duration-300"
                  style={{ background: 'var(--text-primary)', transform: menuAberto ? 'rotate(45deg) translateY(6px)' : 'none' }} />
            <span className="block w-5 h-px transition-all duration-300"
                  style={{ background: 'var(--text-primary)', opacity: menuAberto ? 0 : 1 }} />
            <span className="block w-5 h-px transition-all duration-300"
                  style={{ background: 'var(--text-primary)', transform: menuAberto ? 'rotate(-45deg) translateY(-6px)' : 'none' }} />
          </button>
        </div>

        {/* Mobile menu */}
        <div className="md:hidden overflow-hidden transition-all duration-300"
             style={{ maxHeight: menuAberto ? '480px' : '0', opacity: menuAberto ? 1 : 0 }}>
          <div className="px-6 pb-6 pt-3 space-y-3"
               style={{ background: 'var(--card)', borderTop: '1px solid var(--border)' }}>
            {navLinks.map(({ label, ref }) => (
              <button key={label} onClick={() => scrollTo(ref)}
                      className="block w-full text-left text-sm font-medium py-2.5"
                      style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>
                {label}
              </button>
            ))}
            {/* Toggle de tema no mobile */}
            <div className="flex items-center justify-between py-2.5"
                 style={{ borderBottom: '1px solid var(--border)' }}>
              <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                {isDark ? 'Modo escuro' : 'Modo claro'}
              </span>
              <ThemeToggle size="sm" />
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => navigate('/login')}
                      className="flex-1 text-sm font-medium py-3 rounded-xl text-center"
                      style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                Entrar
              </button>
              <button onClick={() => navigate('/register')}
                      className="flex-1 text-sm font-semibold py-3 rounded-xl text-center"
                      style={{ background: 'var(--brand)', color: '#fff' }}>
                Criar conta
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════
          HERO
      ═══════════════════════════════ */}
      <section ref={heroRef}
               className="relative min-h-screen flex items-center justify-center overflow-hidden"
               style={{ paddingTop: '80px' }}>

        {/* Grid de pontos */}
        <div className="hero-grid absolute inset-0 pointer-events-none"
             style={{
               backgroundImage: `radial-gradient(circle, var(--brand) 1px, transparent 1px)`,
               backgroundSize: '40px 40px',
               opacity: isDark ? 0.08 : 0.06,
             }} />

        {/* Orbes */}
        <div className="hero-orb1 absolute pointer-events-none"
             style={{ top: '15%', left: '8%', width: 480, height: 480, borderRadius: '50%',
                      background: 'var(--brand)', filter: 'blur(100px)',
                      opacity: isDark ? 0.12 : 0.07 }} />
        <div className="hero-orb2 absolute pointer-events-none"
             style={{ bottom: '15%', right: '8%', width: 320, height: 320, borderRadius: '50%',
                      background: 'var(--brand)', filter: 'blur(80px)',
                      opacity: isDark ? 0.09 : 0.05 }} />

        {/* Linha horizontal */}
        <div className="absolute pointer-events-none"
             style={{ top: '50%', left: 0, right: 0, height: '1px',
                      background: 'linear-gradient(90deg, transparent, var(--brand), transparent)',
                      opacity: isDark ? 0.15 : 0.1 }} />

        <div className="relative max-w-5xl mx-auto px-6 text-center">

          {/* Badge */}
          <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
               style={{ background: 'var(--brand-light)', border: '1px solid rgba(200,82,10,0.25)' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--brand)' }} />
            <span className="text-xs font-semibold uppercase tracking-widest"
                  style={{ color: 'var(--brand)', letterSpacing: '0.14em' }}>
              Experiência gastronômica digital
            </span>
          </div>

          {/* Título linha a linha com overflow:hidden para o clip do GSAP */}
          <h1 className="hero-title font-display font-medium leading-[1.08] mb-8"
              style={{ fontSize: 'clamp(3rem, 7vw, 6rem)', color: 'var(--text-primary)' }}>
            <span className="block overflow-hidden">
              <span className="block">Uma experiência</span>
            </span>
            <span className="block overflow-hidden">
              <span className="block" style={{ color: 'var(--brand)' }}>gastronômica</span>
            </span>
            <span className="block overflow-hidden">
              <span className="block">inesquecível</span>
            </span>
          </h1>

          <p className="hero-sub text-base sm:text-xl max-w-2xl mx-auto mb-12 leading-relaxed"
             style={{ color: 'var(--text-secondary)' }}>
            Do cardápio ao prato, tudo na palma da sua mão.
            Peça diretamente da mesa e acompanhe em tempo real.
          </p>

          {/* Botões */}
          <div className="hero-btns flex flex-col sm:flex-row gap-4 justify-center mb-20">
            <button
              ref={magnetRef}
              onMouseMove={handleMagnet}
              onMouseLeave={resetMagnet}
              onClick={() => navigate(user ? (user.role === 'ADMIN' ? '/dashboard' : '/cliente/1') : '/register')}
              className="px-10 py-5 rounded-2xl font-semibold text-base inline-flex items-center justify-center gap-3 group"
              style={{ background: 'var(--brand)', color: '#fff',
                       boxShadow: '0 8px 40px rgba(200,82,10,0.4)', position: 'relative', overflow: 'hidden' }}>
              <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.12), transparent)' }} />
              <span className="relative">{user ? 'Fazer pedido agora' : 'Começar agora'}</span>
              <span className="relative transition-transform group-hover:translate-x-1 duration-200">→</span>
            </button>
            <button onClick={() => scrollTo(cardapioRef)}
                    className="px-10 py-5 rounded-2xl font-semibold text-base transition-all hover:scale-[1.02] active:scale-[0.98] group"
                    style={{ background: 'transparent', color: 'var(--text-primary)',
                             border: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
              <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: 'var(--card)' }} />
              <span className="relative">Ver cardápio</span>
            </button>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-12">
            {[
              { end: '200', suffix: '+', label: 'Pratos por dia' },
              { end: '4.9', suffix: '★', label: 'Avaliação média' },
              { end: '15', suffix: 'min', label: 'Tempo de preparo' },
            ].map(({ end, suffix, label }) => (
              <div key={label} className="hero-stat text-center">
                <p className="font-display text-3xl font-medium" style={{ color: 'var(--brand)' }}>
                  <CountUp end={end} suffix={suffix} />
                </p>
                <p className="text-xs mt-1 uppercase tracking-wider"
                   style={{ color: 'var(--text-hint)', letterSpacing: '0.1em' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span style={{ color: 'var(--text-hint)', letterSpacing: '0.12em', fontSize: '10px',
                         textTransform: 'uppercase' }}>scroll</span>
          <div className="w-px h-8"
               style={{ background: 'linear-gradient(to bottom, var(--brand), transparent)' }} />
        </div>
      </section>

      {/* ═══════════════════════════════
          DIFERENCIAIS
      ═══════════════════════════════ */}
      <section ref={difsRef} className="py-28 relative overflow-hidden"
               style={{ background: 'var(--card)', borderTop: '1px solid var(--border)' }}>
        <AnimLine className="absolute top-0 left-0 right-0 h-px"
                  style={{ background: 'linear-gradient(90deg, transparent, var(--brand), transparent)' }} />
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3"
               style={{ color: 'var(--brand)', letterSpacing: '0.14em' }}>
              Por que nos escolher
            </p>
            <h2 className="font-display font-medium"
                style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', color: 'var(--text-primary)' }}>
              Tecnologia a serviço<br />da sua experiência
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {DIFERENCIAIS.map(({ icone, titulo, desc }, i) => (
              <div key={titulo}
                   className="dif-card p-7 rounded-3xl group cursor-default transition-all duration-300 hover:-translate-y-2"
                   style={{ background: 'var(--surface)', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
                <span className="absolute top-4 right-5 font-display text-6xl font-medium select-none"
                      style={{ color: 'var(--border)', opacity: isDark ? 0.6 : 0.4, lineHeight: 1 }}>
                  0{i + 1}
                </span>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-5 transition-transform group-hover:scale-110 duration-300"
                     style={{ background: 'var(--brand-light)' }}>
                  {icone}
                </div>
                <h3 className="font-semibold text-base mb-2" style={{ color: 'var(--text-primary)' }}>{titulo}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
                <div className="absolute bottom-0 left-0 w-0 group-hover:w-full h-0.5 transition-all duration-500"
                     style={{ background: 'var(--brand)' }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════
          SOBRE
      ═══════════════════════════════ */}
      <section ref={sobreRef} className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
             style={{ backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
                      backgroundSize: '80px 80px', opacity: isDark ? 0.25 : 0.35 }} />
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="sobre-left space-y-6">
              <p className="text-xs font-semibold uppercase tracking-widest"
                 style={{ color: 'var(--brand)', letterSpacing: '0.14em' }}>Nossa história</p>
              <h2 className="font-display font-medium leading-tight"
                  style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', color: 'var(--text-primary)' }}>
                Paixão pela<br />gastronomia<br />
                <span style={{ color: 'var(--brand)' }}>desde 2010</span>
              </h2>
              <AnimLine style={{ height: '2px', width: '60px', background: 'var(--brand)', borderRadius: '2px' }} />
              <p className="text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Nascemos da vontade de criar um espaço onde cada detalhe importa — da escolha dos ingredientes frescos à experiência de pedir pelo celular.
              </p>
              <p className="text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Com mais de 14 anos de história, unimos a tradição da boa cozinha com a tecnologia moderna.
              </p>
              <div className="sobre-stats flex flex-wrap gap-4 pt-2">
                {[{ n: '14', label: 'anos' }, { n: '3', label: 'chefs' }, { n: '50+', label: 'pratos' }].map(({ n, label }) => (
                  <div key={label} className="sobre-stat px-6 py-4 rounded-2xl"
                       style={{ background: 'var(--brand-light)', border: '1px solid rgba(200,82,10,0.15)' }}>
                    <p className="font-display text-3xl font-medium" style={{ color: 'var(--brand)' }}>{n}</p>
                    <p className="text-xs mt-0.5 uppercase tracking-wider"
                       style={{ color: 'var(--text-secondary)', letterSpacing: '0.1em' }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="sobre-right relative">
              <div className="aspect-square max-w-md mx-auto rounded-3xl flex items-center justify-center relative overflow-hidden"
                   style={{ background: 'var(--brand-light)', border: '1px solid rgba(200,82,10,0.15)' }}>
                <div className="absolute inset-0"
                     style={{ backgroundImage: 'linear-gradient(rgba(200,82,10,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(200,82,10,0.06) 1px, transparent 1px)',
                               backgroundSize: '40px 40px' }} />
                <div className="relative text-center p-8">
                  <div className="text-8xl mb-4 transition-transform hover:scale-110 duration-300 cursor-default">👨‍🍳</div>
                  <p className="font-display text-2xl font-medium" style={{ color: 'var(--text-primary)' }}>Feito com amor</p>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>em cada detalhe</p>
                </div>
              </div>
              <div className="absolute -bottom-5 -right-2 sm:right-4 px-5 py-4 rounded-2xl"
                   style={{ background: 'var(--brand)', boxShadow: '0 12px 32px rgba(200,82,10,0.35)' }}>
                <p className="font-display text-2xl font-medium text-white">4.9 ★</p>
                <p className="text-xs text-white mt-0.5" style={{ opacity: 0.75 }}>+500 avaliações</p>
              </div>
              <div className="absolute -top-4 -left-4 sm:left-0 px-4 py-3 rounded-2xl"
                   style={{ background: 'var(--card)', border: '1px solid var(--border)',
                            boxShadow: 'var(--shadow-md)' }}>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#10B981' }} />
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>Sistema online</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════
          CARDÁPIO
      ═══════════════════════════════ */}
      <section ref={cardapioRef} className="py-28 relative overflow-hidden"
               style={{ background: 'var(--card)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <AnimLine className="absolute top-0 left-0 right-0 h-px"
                  style={{ background: 'linear-gradient(90deg, transparent, var(--brand), transparent)' }} />
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-2"
                 style={{ color: 'var(--brand)', letterSpacing: '0.14em' }}>Nosso cardápio</p>
              <h2 className="font-display font-medium"
                  style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', color: 'var(--text-primary)' }}>
                O que temos hoje
              </h2>
            </div>
            <button onClick={() => navigate(user ? (user.role === 'ADMIN' ? '/dashboard/cardapio' : '/cliente/1/cardapio') : '/login')}
                    className="text-sm font-semibold px-5 py-2.5 rounded-xl self-start sm:self-auto transition-all hover:scale-[1.03]"
                    style={{ background: 'var(--brand-light)', color: 'var(--brand)', border: '1px solid rgba(200,82,10,0.2)' }}>
              Ver cardápio completo →
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-10 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {menu.map((cat) => (
              <button key={cat.id} onClick={() => setCat(cat.id)}
                      className="flex-shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-all duration-200"
                      style={cat.id === categoriaAtiva
                        ? { background: 'var(--brand)', color: '#fff', boxShadow: '0 4px 12px rgba(200,82,10,0.3)' }
                        : { background: 'var(--surface)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                {cat.nome}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1,2,3].map(i => (
                <div key={i} className="rounded-3xl h-36 animate-pulse" style={{ background: 'var(--surface)' }} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {itens.map((item) => (
                <div key={item.id}
                     className="menu-card rounded-3xl p-5 flex gap-4 cursor-pointer group transition-all duration-300 hover:-translate-y-1"
                     style={{ background: 'var(--surface)', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}
                     onClick={() => navigate(user ? '/mesa/1' : '/login')}>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                       style={{ background: 'linear-gradient(135deg, var(--brand-light), transparent)', zIndex: 0 }} />
                  <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 transition-transform group-hover:scale-110 duration-300"
                       style={{ background: 'var(--brand-light)' }}>
                    {ICONES[item.categoria?.nome] ?? '🍽️'}
                  </div>
                  <div className="relative flex-1 min-w-0">
                    <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{item.nome}</h3>
                    <p className="text-xs mt-0.5 line-clamp-2 leading-relaxed" style={{ color: 'var(--text-hint)' }}>
                      {item.descricao}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-sm font-bold" style={{ color: 'var(--brand)' }}>
                        R$ {Number(item.preco).toFixed(2).replace('.', ',')}
                      </p>
                      <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            style={{ color: 'var(--brand)' }}>Pedir →</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════
          SHOWS
      ═══════════════════════════════ */}
      {shows.length > 0 && (
        <section ref={showsRef} className="py-28 relative overflow-hidden"
                 style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
          <AnimLine className="absolute top-0 left-0 right-0 h-px"
                    style={{ background: 'linear-gradient(90deg, transparent, var(--brand), transparent)' }} />
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <p className="text-xs font-semibold uppercase tracking-widest mb-3"
                 style={{ color: 'var(--brand)', letterSpacing: '0.14em' }}>Agenda Cultural</p>
              <h2 className="font-display font-medium"
                  style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', color: 'var(--text-primary)' }}>
                Próximos Shows
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {shows.map((show) => {
                const d = new Date(show.data)
                const dia = d.getUTCDate().toString().padStart(2, '0')
                const mes = d.toLocaleDateString('pt-BR', { month: 'short', timeZone: 'UTC' }).replace('.', '').toUpperCase()
                const semana = d.toLocaleDateString('pt-BR', { weekday: 'long', timeZone: 'UTC' })
                const emoji = GENERO_EMOJI[show.genero] ?? '🎤'
                const imgUrl = show.artista?.imagemUrl
                  ? show.artista.imagemUrl.startsWith('http')
                    ? show.artista.imagemUrl
                    : `${API_BASE}${show.artista.imagemUrl}`
                  : null
                return (
                  <div key={show.id}
                       className="show-card group rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-2"
                       style={{ background: 'var(--card)', border: '1px solid var(--border)', position: 'relative' }}>
                    {imgUrl ? (
                      <div className="relative w-full h-40 overflow-hidden">
                        <img src={imgUrl} alt={show.artista.nome}
                             className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" />
                        <div style={{ position: 'absolute', inset: 0,
                                      background: 'linear-gradient(to bottom, transparent 40%, var(--card) 100%)' }} />
                      </div>
                    ) : (
                      <div className="w-full h-40 flex items-center justify-center"
                           style={{ background: 'var(--brand-light)', fontSize: '4rem' }}>
                        {emoji}
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex flex-col items-center justify-center rounded-xl flex-shrink-0"
                             style={{ background: 'var(--brand)', minWidth: 52, padding: '0.5rem 0.75rem' }}>
                          <span className="font-display text-2xl font-bold text-white leading-none">{dia}</span>
                          <span className="text-xs font-semibold text-white uppercase tracking-wider leading-none mt-0.5"
                                style={{ opacity: 0.8 }}>{mes}</span>
                        </div>
                        <div>
                          <p className="text-xs capitalize" style={{ color: 'var(--text-hint)' }}>{semana}</p>
                          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{show.horario}</p>
                        </div>
                      </div>
                      <h3 className="font-display text-xl font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                        {show.titulo}
                      </h3>
                      {show.artista && (
                        <p className="text-sm font-medium" style={{ color: 'var(--brand)' }}>{show.artista.nome}</p>
                      )}
                      {show.genero && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium mt-3 px-3 py-1 rounded-full"
                              style={{ background: 'var(--brand-light)', color: 'var(--brand)' }}>
                          {emoji} {show.genero}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════
          DEPOIMENTOS
      ═══════════════════════════════ */}
      <section ref={depRef} className="py-28 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3"
               style={{ color: 'var(--brand)', letterSpacing: '0.14em' }}>Depoimentos</p>
            <h2 className="font-display font-medium"
                style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', color: 'var(--text-primary)' }}>
              O que nossos clientes dizem
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {DEPOIMENTOS.map(({ nome, texto, estrelas }) => (
              <div key={nome}
                   className="dep-card p-7 rounded-3xl group transition-all duration-300 hover:-translate-y-2"
                   style={{ background: 'var(--card)', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
                <div className="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                     style={{ background: 'linear-gradient(90deg, transparent, var(--brand), transparent)' }} />
                <Estrelas n={estrelas} />
                <p className="text-sm leading-relaxed my-5"
                   style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>"{texto}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                       style={{ background: 'var(--brand-light)', color: 'var(--brand)' }}>
                    {nome.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{nome}</p>
                    <p className="text-xs" style={{ color: 'var(--text-hint)' }}>Cliente verificado</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════
          NEWSLETTER
      ═══════════════════════════════ */}
      <section ref={newsletterRef} className="py-28 relative overflow-hidden"
               style={{ background: isDark ? '#0A0A08' : '#1A1A18' }}>
        {/* grade */}
        <div className="absolute inset-0 pointer-events-none"
             style={{ backgroundImage: 'linear-gradient(rgba(200,82,10,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(200,82,10,0.08) 1px, transparent 1px)',
                      backgroundSize: '60px 60px' }} />
        {/* orbe */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
             style={{ width: 600, height: 600, borderRadius: '50%', background: 'var(--brand)', filter: 'blur(120px)', opacity: 0.08 }} />

        <div className="nl-content relative max-w-2xl mx-auto px-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-8"
               style={{ background: 'rgba(200,82,10,0.2)', border: '1px solid rgba(200,82,10,0.3)' }}>
            <span style={{ fontSize: '28px' }}>✉️</span>
          </div>
          <h2 className="font-display font-medium mb-4 text-white"
              style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}>
            Receba ofertas<br />
            <span style={{ color: '#FFBA88' }}>exclusivas</span>
          </h2>
          <p className="text-base mb-10 leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Cadastre seu email e seja o primeiro a saber sobre promoções, novidades do cardápio e eventos especiais.
          </p>

          {newsletter.status === 'ok' ? (
            <div className="flex items-center justify-center gap-3 py-5 px-6 rounded-2xl"
                 style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}>
              <span style={{ fontSize: '20px' }}>🎉</span>
              <p className="text-white font-medium">Ótimo! Você está na lista.</p>
            </div>
          ) : (
            <form onSubmit={enviarNewsletter} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <input type="email" required placeholder="seu@email.com"
                     value={newsletter.email}
                     onChange={(e) => setNewsletter({ email: e.target.value, status: null })}
                     className="flex-1 px-5 py-4 rounded-xl text-sm outline-none"
                     style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
                              color: '#fff', fontFamily: 'DM Sans' }} />
              <button type="submit"
                      className="px-7 py-4 rounded-xl font-semibold text-sm whitespace-nowrap transition-all hover:scale-[1.03] active:scale-[0.97]"
                      style={{ background: 'var(--brand)', color: '#fff', boxShadow: '0 6px 24px rgba(200,82,10,0.5)' }}>
                Quero receber
              </button>
            </form>
          )}

          {newsletter.status === 'ja_cadastrado' && (
            <p className="text-sm mt-4" style={{ color: 'rgba(255,255,255,0.45)' }}>Este email já está cadastrado.</p>
          )}
          {newsletter.status === 'erro' && (
            <p className="text-sm mt-4" style={{ color: '#F87171' }}>Erro ao cadastrar. Tente novamente.</p>
          )}
          <p className="text-xs mt-6" style={{ color: 'rgba(255,255,255,0.25)' }}>Sem spam. Cancele quando quiser.</p>
        </div>
      </section>

      {/* ═══════════════════════════════
          CONTATO
      ═══════════════════════════════ */}
      <section ref={contatoRef} className="py-28 relative overflow-hidden"
               style={{ background: 'var(--card)', borderTop: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-4"
                 style={{ color: 'var(--brand)', letterSpacing: '0.14em' }}>Fale conosco</p>
              <h2 className="font-display font-medium mb-3 leading-tight"
                  style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', color: 'var(--text-primary)' }}>
                Estamos aqui<br />para você
              </h2>
              <AnimLine style={{ height: '2px', width: '50px', background: 'var(--brand)', borderRadius: '2px', marginBottom: '24px' }} />
              <div className="space-y-6">
                {[
                  { icone: '📍', titulo: 'Endereço', desc: 'Rua das Flores, 123 — Centro\nSão Paulo, SP' },
                  { icone: '📞', titulo: 'Telefone', desc: '(11) 9 9999-0000\nSeg–Dom, 11h às 23h' },
                  { icone: '✉️', titulo: 'Email', desc: 'contato@restaurante.com' },
                  { icone: '🕐', titulo: 'Horário', desc: 'Segunda a Domingo\n11h00 às 23h00' },
                ].map(({ icone, titulo, desc }) => (
                  <div key={titulo} className="flex gap-4 group">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-base flex-shrink-0 transition-transform group-hover:scale-110 duration-200"
                         style={{ background: 'var(--brand-light)' }}>
                      {icone}
                    </div>
                    <div>
                      <p className="font-semibold text-sm mb-0.5" style={{ color: 'var(--text-primary)' }}>{titulo}</p>
                      <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-3xl p-8 sm:p-10"
                 style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <h3 className="font-display text-xl font-medium mb-7" style={{ color: 'var(--text-primary)' }}>
                Envie uma mensagem
              </h3>
              <ContatoForm />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════
          FOOTER
      ═══════════════════════════════ */}
      <footer style={{ background: isDark ? '#050503' : '#0F0F0D', color: '#fff' }}>
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
                     style={{ background: 'var(--brand)' }}>🍽</div>
                <span className="font-display text-base font-medium">Restaurante</span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Gastronomia de qualidade com a praticidade do pedido digital.
              </p>
            </div>
            <div>
              <p className="font-semibold text-sm mb-5" style={{ color: 'rgba(255,255,255,0.55)' }}>Navegação</p>
              <div className="space-y-3">
                {[
                  { l: 'Sobre', r: sobreRef },
                  { l: 'Cardápio', r: cardapioRef },
                  ...(shows.length > 0 ? [{ l: 'Shows', r: showsRef }] : []),
                  { l: 'Newsletter', r: newsletterRef },
                  { l: 'Contato', r: contatoRef },
                ].map(({ l, r }) => (
                  <button key={l} onClick={() => scrollTo(r)}
                          className="block text-sm transition-all hover:translate-x-1 duration-200"
                          style={{ color: 'rgba(255,255,255,0.35)' }}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="font-semibold text-sm mb-5" style={{ color: 'rgba(255,255,255,0.55)' }}>Conta</p>
              <div className="space-y-3">
                {[
                  { l: 'Entrar', fn: () => navigate('/login') },
                  { l: 'Criar conta', fn: () => navigate('/register') },
                  ...(user?.role === 'ADMIN' ? [{ l: 'Dashboard', fn: () => navigate('/dashboard') }] : []),
                ].map(({ l, fn }) => (
                  <button key={l} onClick={fn}
                          className="block text-sm transition-all hover:translate-x-1 duration-200"
                          style={{ color: 'rgba(255,255,255,0.35)' }}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-3"
               style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
              © 2025 Restaurante. Todos os direitos reservados.
            </p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
              Feito com ♥ e tecnologia
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}