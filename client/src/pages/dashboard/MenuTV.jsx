import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import gsap from 'gsap'

import { API_BASE } from '../../config'

const TRANSITION_MS = 700
const SLIDE_DURATION_MS = 7000

const GENERO_EMOJI = {
    Samba: '🪘', MPB: '🎵', Jazz: '🎷', Rock: '🎸',
    Sertanejo: '🤠', Pagode: '🥁', Forró: '🪗', Eletrônico: '🎛️', Outro: '🎤',
}
const resolveUrl = (url) => !url ? null : url.startsWith('http') ? url : `${API_BASE}${url}`

export default function MenuTV() {
    const navigate = useNavigate()
    const [menuCats, setMenuCats] = useState([])
    const [shows, setShows] = useState([])
    const [slides, setSlides] = useState([])
    const [atual, setAtual] = useState(0)
    const [animando, setAnimando] = useState(false)
    const timerRef = useRef(null)
    const slideRef = useRef(null)

    useEffect(() => {
        api.get('/menu').then(({ data }) => {
            const cats = (Array.isArray(data) ? data : [])
                .map(c => ({ ...c, itens: (c.itens ?? []).filter(i => i.disponivel) }))
                .filter(c => c.itens.length > 0)
            setMenuCats(cats)
        })
    }, [])

    useEffect(() => {
        api.get('/shows/proximos').then(({ data }) => setShows(data)).catch(() => {})
    }, [])

    useEffect(() => {
        if (menuCats.length === 0) return
        const result = montarSlides(menuCats)
        if (shows.length > 0) result.push({ tipo: 'shows', shows })
        setSlides(result)
    }, [menuCats, shows])

    function montarSlides(cats) {
        const result = []
        cats.forEach(cat => {
            result.push({ tipo: 'capa', categoria: cat })
            chunkArray(cat.itens, 4).forEach((chunk, i, arr) => {
                result.push({ tipo: 'itens', categoria: cat, itens: chunk, pagina: i + 1, total: arr.length })
            })
        })
        return result
    }

    function chunkArray(arr, size) {
        const result = []
        for (let i = 0; i < arr.length; i += size) result.push(arr.slice(i, i + size))
        return result
    }

    // Animação de entrada após troca de slide
    useEffect(() => {
        if (!slideRef.current || slides.length === 0) return
        const el = slideRef.current
        gsap.fromTo(el,
            { opacity: 0, y: 32, scale: 0.97 },
            { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'power3.out' }
        )
    }, [atual, slides])

    // Autoplay
    useEffect(() => {
        if (slides.length === 0) return
        clearInterval(timerRef.current)
        timerRef.current = setInterval(() => trocarSlide(1), SLIDE_DURATION_MS)
        return () => clearInterval(timerRef.current)
    }, [slides, atual])

    function trocarSlide(dir) {
        if (animando || slides.length === 0) return
        clearInterval(timerRef.current)
        setAnimando(true)

        // Saída
        gsap.to(slideRef.current, {
            opacity: 0, y: dir > 0 ? -24 : 24, scale: 0.97,
            duration: TRANSITION_MS / 1000, ease: 'power2.in',
            onComplete: () => {
                setAtual(a => (a + dir + slides.length) % slides.length)
                setAnimando(false)
            }
        })
    }

    function irPara(i) {
        if (animando || i === atual) return
        trocarSlide(i > atual ? 1 : -1)
        setTimeout(() => setAtual(i), 10)
    }

    const slide = slides[atual]

    if (slides.length === 0) return (
        <div style={estilos.tela}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🍽️</div>
                <p style={{ color: 'var(--text-hint)', fontSize: '1rem', fontFamily: 'DM Sans' }}>Carregando cardápio...</p>
            </div>
        </div>
    )

    return (
        <div style={estilos.tela}>
            {/* Grain overlay */}
            <div style={{
                position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
                opacity: 0.4,
            }} />

            {/* Orbes decorativos de fundo */}
            <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: 600, height: 600, borderRadius: '50%', background: 'var(--brand)', filter: 'blur(140px)', opacity: 0.06, pointerEvents: 'none', zIndex: 0 }} />
            <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'var(--brand)', filter: 'blur(120px)', opacity: 0.05, pointerEvents: 'none', zIndex: 0 }} />

            {/* Header flutuante */}
            <header style={estilos.header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', boxShadow: '0 4px 16px rgba(200,82,10,0.4)' }}>🍽</div>
                    <div>
                        <p style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1rem', fontFamily: 'DM Sans', margin: 0, lineHeight: 1 }}>Cardápio Digital</p>
                        <p style={{ color: 'var(--text-hint)', fontSize: '0.7rem', fontFamily: 'DM Sans', margin: 0, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                            {slides.filter(s => s.tipo === 'capa').length} categorias disponíveis
                        </p>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Relogio />
                    <div style={{ width: 1, height: 20, background: 'var(--border)' }} />
                    <button onClick={() => navigate('/dashboard')} style={estilos.btnHeader}>
                        ✕ Fechar
                    </button>
                </div>
            </header>

            {/* Indicador de categoria atual */}
            <CategoriaIndicador slides={slides} atual={atual} />

            {/* Slide */}
            <div ref={slideRef} style={{ ...estilos.slideWrap, zIndex: 2 }}>
                {slide?.tipo === 'capa' && <SlideCapa categoria={slide.categoria} />}
                {slide?.tipo === 'itens' && <SlideItens slide={slide} />}
                {slide?.tipo === 'shows' && <SlideShows shows={slide.shows} />}
            </div>

            {/* Setas */}
            <button onClick={() => trocarSlide(-1)} style={{ ...estilos.seta, left: 20 }}>‹</button>
            <button onClick={() => trocarSlide(1)} style={{ ...estilos.seta, right: 20 }}>›</button>

            {/* Dots */}
            <div style={estilos.dots}>
                {slides.map((s, i) => (
                    <button key={i} onClick={() => irPara(i)} style={{
                        width: i === atual ? 28 : (s.tipo === 'capa' || s.tipo === 'shows') ? 10 : 6,
                        height: (s.tipo === 'capa' || s.tipo === 'shows') ? 10 : 6,
                        borderRadius: 99,
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        background: i === atual ? 'var(--brand)' : (s.tipo === 'capa' || s.tipo === 'shows') ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.2)',
                        padding: 0,
                    }} />
                ))}
            </div>

            {/* Progresso */}
            <ProgressBar duration={SLIDE_DURATION_MS} key={atual} />
        </div>
    )
}

/* ── Preview (dashboard) ── */
export function MenuTVPreview() {
    const navigate = useNavigate()
    return (
        <div style={{ padding: '1.5rem',  margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <h1 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>Menu TV</h1>
                    <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0', fontSize: '0.875rem' }}>Exibe o cardápio em tela cheia para monitores externos</p>
                </div>
                <button onClick={() => window.open('/menu-tv', '_blank')}
                    style={{ background: 'var(--brand)', color: '#fff', border: 'none', borderRadius: 8, padding: '0.6rem 1.5rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem' }}>
                    ▶ Abrir em tela cheia
                </button>
            </div>

            <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)', position: 'relative', aspectRatio: '16/9', background: 'var(--surface)' }}>
                <iframe src="/menu-tv" style={{ width: '100%', height: '100%', border: 'none', pointerEvents: 'none' }} title="Preview Menu TV" />
                <div onClick={() => window.open('/menu-tv', '_blank')}
                    style={{ position: 'absolute', inset: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)', opacity: 0, transition: 'opacity 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.opacity = 1}
                    onMouseLeave={e => e.currentTarget.style.opacity = 0}>
                    <div style={{ background: 'var(--brand)', color: '#fff', padding: '0.75rem 2rem', borderRadius: 12, fontWeight: 700, fontSize: '1rem' }}>▶ Abrir</div>
                </div>
            </div>

            <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                {[
                    { icon: '🔄', titulo: 'Loop automático', desc: 'Slides avançam a cada 7 segundos' },
                    { icon: '✅', titulo: 'Somente ativos', desc: 'Apenas itens com disponível = true' },
                    { icon: '🎨', titulo: 'Segue o tema', desc: 'Usa as cores e CSS variables globais' },
                    { icon: '📺', titulo: 'Tela cheia', desc: 'Ideal para TVs e monitores externos' },
                ].map(({ icon, titulo, desc }) => (
                    <div key={titulo} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1rem' }}>
                        <div style={{ fontSize: '1.25rem', marginBottom: '0.4rem' }}>{icon}</div>
                        <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.2rem' }}>{titulo}</div>
                        <div style={{ color: 'var(--text-hint)', fontSize: '0.8rem' }}>{desc}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/* ── Indicador de categoria no topo ── */
function CategoriaIndicador({ slides, atual }) {
    const categorias = [...new Map(
        slides.filter(s => s.categoria).map(s => [s.categoria.id, s.categoria])
    ).values()]
    const catAtual = slides[atual]?.categoria?.id
    const isShows = slides[atual]?.tipo === 'shows'

    const pillStyle = (ativo) => ({
        padding: '0.25rem 0.75rem',
        borderRadius: 99,
        fontSize: '0.7rem',
        fontWeight: 600,
        fontFamily: 'DM Sans',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        transition: 'all 0.3s',
        background: ativo ? 'var(--brand)' : 'rgba(255,255,255,0.08)',
        color: ativo ? '#fff' : 'rgba(255,255,255,0.4)',
        border: ativo ? 'none' : '1px solid rgba(255,255,255,0.1)',
    })

    return (
        <div style={{ position: 'absolute', top: 72, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '0.5rem', zIndex: 5, alignItems: 'center' }}>
            {!isShows && categorias.map(cat => (
                <div key={cat.id} style={pillStyle(cat.id === catAtual)}>
                    {cat.nome}
                </div>
            ))}
            {isShows && (
                <div style={pillStyle(true)}>Shows</div>
            )}
        </div>
    )
}

/* ── Slide: Capa ── */
function SlideCapa({ categoria }) {
    const ref = useRef(null)
    const ICONES = { 'Entradas': '🥗', 'Pratos Principais': '🍽️', 'Bebidas': '🥤', 'Sobremesas': '🍮' }
    const icone = ICONES[categoria.nome] ?? '🍴'

    useEffect(() => {
        if (!ref.current) return
        const ctx = gsap.context(() => {
            gsap.fromTo('.capa-icon', { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.7)', delay: 0.1 })
            gsap.fromTo('.capa-label', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', delay: 0.3 })
            gsap.fromTo('.capa-titulo', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', delay: 0.45 })
            gsap.fromTo('.capa-sub', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', delay: 0.6 })
            gsap.fromTo('.capa-linha', { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: 'power3.inOut', delay: 0.7 })
        }, ref)
        return () => ctx.revert()
    }, [categoria.id])

    return (
        <div ref={ref} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1.5rem', textAlign: 'center', padding: '2rem' }}>
            <div className="capa-icon" style={{ width: 140, height: 140, borderRadius: 36, background: 'var(--brand-light)', border: '2px solid var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem', boxShadow: '0 20px 60px rgba(200,82,10,0.2)' }}>
                {icone}
            </div>
            <div>
                <p className="capa-label" style={{ color: 'var(--brand)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.25em', marginBottom: '0.75rem', fontFamily: 'DM Sans' }}>
                    Categoria
                </p>
                <h2 className="capa-titulo" style={{ color: 'var(--text-primary)', fontFamily: 'Playfair Display, serif', fontSize: 'clamp(3rem, 7vw, 6rem)', fontWeight: 700, margin: 0, lineHeight: 1.05 }}>
                    {categoria.nome}
                </h2>
                <p className="capa-sub" style={{ color: 'var(--text-secondary)', marginTop: '1rem', fontSize: '1.1rem', fontFamily: 'DM Sans' }}>
                    {categoria.itens.length} {categoria.itens.length === 1 ? 'opção disponível' : 'opções disponíveis'}
                </p>
            </div>
            <div className="capa-linha" style={{ width: 80, height: 3, background: 'var(--brand)', borderRadius: 99, transformOrigin: 'center' }} />
        </div>
    )
}

/* ── Slide: Shows ── */
function SlideShows({ shows }) {
    const ref = useRef(null)
    const proximos = shows.slice(0, 4)

    useEffect(() => {
        if (!ref.current) return
        const ctx = gsap.context(() => {
            gsap.fromTo('.shows-header',
                { opacity: 0, y: -24 },
                { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', delay: 0.1 }
            )
            gsap.fromTo('.show-row',
                { opacity: 0, x: -40 },
                { opacity: 1, x: 0, duration: 0.5, stagger: 0.12, ease: 'power3.out', delay: 0.3 }
            )
        }, ref)
        return () => ctx.revert()
    }, [shows])

    return (
        <div ref={ref} style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '5.5rem 3.5rem 2.5rem' }}>
            <div className="shows-header" style={{ marginBottom: '2rem' }}>
                <p style={{ color: 'var(--brand)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', margin: '0 0 0.3rem', fontFamily: 'DM Sans' }}>
                    Agenda Cultural
                </p>
                <h2 style={{ color: 'var(--text-primary)', fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2rem, 3.5vw, 3rem)', margin: 0, fontWeight: 700 }}>
                    Próximos Shows
                </h2>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center' }}>
                {proximos.map((show) => {
                    const d = new Date(show.data)
                    const dia = d.getUTCDate().toString().padStart(2, '0')
                    const mes = d.toLocaleDateString('pt-BR', { month: 'short', timeZone: 'UTC' }).replace('.', '').toUpperCase()
                    const emoji = GENERO_EMOJI[show.genero] ?? '🎤'
                    const imgUrl = resolveUrl(show.artista?.imagemUrl)
                    return (
                        <div key={show.id} className="show-row" style={{
                            display: 'flex', alignItems: 'center', gap: '1.5rem',
                            background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20,
                            padding: '1.25rem 1.5rem',
                        }}>
                            <div style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                background: 'var(--brand)', borderRadius: 14, padding: '0.75rem 1.25rem', minWidth: 72, flexShrink: 0,
                            }}>
                                <span style={{ color: '#fff', fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)', fontWeight: 700, lineHeight: 1 }}>{dia}</span>
                                <span style={{ color: 'rgba(255,255,255,0.75)', fontFamily: 'DM Sans', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.15rem' }}>{mes}</span>
                            </div>
                            {imgUrl && (
                                <div style={{ width: 64, height: 64, borderRadius: 12, overflow: 'hidden', flexShrink: 0 }}>
                                    <img src={imgUrl} alt={show.artista?.nome}
                                         style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                         onError={e => { e.currentTarget.parentElement.style.display = 'none' }} />
                                </div>
                            )}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <h3 style={{
                                    color: 'var(--text-primary)', fontFamily: 'DM Sans', fontWeight: 700,
                                    fontSize: 'clamp(1.1rem, 1.8vw, 1.6rem)', margin: '0 0 0.3rem',
                                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                }}>
                                    {show.titulo}
                                </h3>
                                <p style={{ color: 'var(--text-secondary)', fontFamily: 'DM Sans', fontSize: 'clamp(0.8rem, 1.1vw, 1rem)', margin: 0 }}>
                                    {[show.artista?.nome, show.genero ? `${emoji} ${show.genero}` : null, show.horario].filter(Boolean).join(' · ')}
                                </p>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

/* ── Slide: Itens ── */
function SlideItens({ slide }) {
    const { categoria, itens, pagina, total } = slide
    const ref = useRef(null)

    useEffect(() => {
        if (!ref.current) return
        const ctx = gsap.context(() => {
            gsap.fromTo('.slide-header-el',
                { opacity: 0, x: -30 },
                { opacity: 1, x: 0, duration: 0.5, ease: 'power3.out', delay: 0.1 }
            )
            gsap.fromTo('.item-card',
                { opacity: 0, y: 40, scale: 0.95 },
                { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.1, ease: 'power3.out', delay: 0.25 }
            )
        }, ref)
        return () => ctx.revert()
    }, [slide])

    return (
        <div ref={ref} style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '5.5rem 3.5rem 2.5rem' }}>
            {/* Header */}
            <div className="slide-header-el" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
                <div>
                    <p style={{ color: 'var(--brand)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', margin: '0 0 0.3rem', fontFamily: 'DM Sans' }}>
                        {categoria.nome}
                    </p>
                    <h2 style={{ color: 'var(--text-primary)', fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', margin: 0, fontWeight: 700 }}>
                        Nosso Cardápio
                    </h2>
                </div>
                {total > 1 && (
                    <span style={{ color: 'var(--text-hint)', fontSize: '0.875rem', fontFamily: 'DM Sans', background: 'var(--card)', border: '1px solid var(--border)', padding: '0.25rem 0.75rem', borderRadius: 99 }}>
                        {pagina} / {total}
                    </span>
                )}
            </div>

            {/* Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gridTemplateRows: itens.length <= 2 ? '1fr' : 'repeat(2, 1fr)',
                gap: '1rem',
                flex: 1,
                minHeight: 0, // ← importante para o flex não estourar
            }}>
                {itens.map(item => (
                    <ItemCard key={item.id} item={item} />
                ))}
            </div>
        </div>
    )
}

/* ── Card de item ── */
function ItemCard({ item }) {
    const temImagem = !!item.imagemUrl

    return (
        <div className="item-card" style={{
            borderRadius: 20,
            overflow: 'hidden',
            position: 'relative',
            background: 'var(--card)',
            border: '1px solid var(--border)',
        }}>
            {/* Imagem de fundo ocupando todo o card */}
            {temImagem ? (
                <img
                    src={`${API_BASE}${item.imagemUrl}`}
                    alt={item.nome}
                    style={{
                        position: 'absolute', inset: 0,
                        width: '100%', height: '100%',
                        objectFit: 'cover',
                    }}
                    onError={e => { e.currentTarget.style.display = 'none' }}
                />
            ) : (
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'var(--brand-light)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '4rem',
                }}>
                    🍴
                </div>
            )}

            {/* Gradiente de baixo para cima para legibilidade */}
            <div style={{
                position: 'absolute', inset: 0,
                background: temImagem
                    ? 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.1) 100%)'
                    : 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)',
                zIndex: 1,
            }} />

            {/* Acento superior */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                background: 'var(--brand)', zIndex: 2,
            }} />

            {/* Conteúdo sobre a imagem */}
            <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                padding: '1.25rem 1.5rem',
                zIndex: 2,
            }}>
                <h3 style={{
                    color: '#fff',
                    fontFamily: 'DM Sans',
                    fontWeight: 700,
                    fontSize: 'clamp(1rem, 1.6vw, 1.3rem)',
                    margin: '0 0 0.3rem',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    textShadow: '0 2px 8px rgba(0,0,0,0.5)',
                }}>
                    {item.nome}
                </h3>

                {item.descricao && (
                    <p style={{
                        color: 'rgba(255,255,255,0.65)',
                        fontSize: 'clamp(0.7rem, 0.9vw, 0.82rem)',
                        margin: '0 0 0.625rem',
                        fontFamily: 'DM Sans',
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: 1.4,
                    }}>
                        {item.descricao}
                    </p>
                )}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <p style={{
                        color: 'var(--brand)',
                        fontFamily: 'DM Sans',
                        fontWeight: 800,
                        fontSize: 'clamp(1.2rem, 1.8vw, 1.6rem)',
                        margin: 0,
                        textShadow: '0 2px 12px rgba(200,82,10,0.4)',
                    }}>
                        R$ {Number(item.preco).toFixed(2).replace('.', ',')}
                    </p>
                    <span style={{
                        background: 'rgba(16,185,129,0.2)',
                        color: '#34D399',
                        border: '1px solid rgba(16,185,129,0.35)',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        padding: '3px 10px',
                        borderRadius: 99,
                        fontFamily: 'DM Sans',
                        backdropFilter: 'blur(4px)',
                        letterSpacing: '0.05em',
                    }}>
                        DISPONÍVEL
                    </span>
                </div>
            </div>
        </div>
    )
}
/* ── Relógio ── */
function Relogio() {
    const [hora, setHora] = useState(
        new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    )
    useEffect(() => {
        const t = setInterval(() => setHora(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })), 10000)
        return () => clearInterval(t)
    }, [])
    return (
        <span style={{ color: 'var(--text-secondary)', fontFamily: 'DM Sans', fontSize: '0.9rem', fontWeight: 600, letterSpacing: '0.05em' }}>
            {hora}
        </span>
    )
}

/* ── Barra de progresso ── */
function ProgressBar({ duration }) {
    return (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: 'rgba(255,255,255,0.06)', zIndex: 10 }}>
            <div style={{ height: '100%', background: 'var(--brand)', borderRadius: 99, animation: `tv-progress ${duration}ms linear forwards` }} />
            <style>{`@keyframes tv-progress { from { width: 0% } to { width: 100% } }`}</style>
        </div>
    )
}

/* ── Estilos ── */
const estilos = {
    tela: {
        position: 'fixed', inset: 0,
        background: 'var(--surface)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', zIndex: 9999,
        fontFamily: 'DM Sans',
    },
    header: {
        position: 'absolute', top: 0, left: 0, right: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.875rem 1.5rem',
        background: 'rgba(0,0,0,0.2)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        zIndex: 10,
    },
    btnHeader: {
        background: 'rgba(255,255,255,0.08)', color: 'var(--text-secondary)',
        border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
        padding: '0.4rem 0.875rem', cursor: 'pointer',
        fontFamily: 'DM Sans', fontSize: '0.8rem', fontWeight: 500,
    },
    slideWrap: { position: 'absolute', inset: 0 },
    seta: {
        position: 'absolute', top: '50%', transform: 'translateY(-50%)',
        background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
        color: 'var(--text-primary)', borderRadius: 14,
        width: 52, height: 52, fontSize: '1.75rem',
        cursor: 'pointer', zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(8px)',
        transition: 'background 0.2s',
    },
    dots: {
        position: 'absolute', bottom: 18, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', gap: '0.35rem', alignItems: 'center', zIndex: 10,
    },
}