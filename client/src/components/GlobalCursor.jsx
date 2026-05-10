import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export default function GlobalCursor() {
  const dot   = useRef(null)
  const ring  = useRef(null)
  const trail = useRef(null)

  useEffect(() => {
    const isMobile = window.matchMedia('(max-width: 1024px)').matches
    if (isMobile) return

    let mx = -100, my = -100
    let rx = -100, ry = -100
    let rafId

    // Movimento principal — dot e ring via GSAP
    const move = (e) => {
      mx = e.clientX
      my = e.clientY
      gsap.to(dot.current,  { x: mx, y: my, duration: 0.08 })
      gsap.to(ring.current, { x: mx, y: my, duration: 0.3, ease: 'power2.out' })
    }

    // Trail com requestAnimationFrame para suavidade
    const trailLoop = () => {
      rx += (mx - rx) * 0.12
      ry += (my - ry) * 0.12
      if (trail.current) {
        trail.current.style.left = rx + 'px'
        trail.current.style.top  = ry + 'px'
      }
      rafId = requestAnimationFrame(trailLoop)
    }
    rafId = requestAnimationFrame(trailLoop)

    // Hover — expande o ring
    const grow = () => gsap.to(ring.current, {
      scale: 2.2, opacity: 0.35, duration: 0.25, ease: 'power2.out',
    })
    const shrink = () => gsap.to(ring.current, {
      scale: 1, opacity: 1, duration: 0.25, ease: 'power2.out',
    })

    // Click — contrai e expande (ripple)
    const onClick = () => {
      gsap.timeline()
        .to(ring.current, { scale: 0.6, duration: 0.12, ease: 'power3.in' })
        .to(ring.current, { scale: 1,   duration: 0.4,  ease: 'elastic.out(1,0.4)' })
      gsap.fromTo(dot.current,
        { scale: 0.4 },
        { scale: 1, duration: 0.35, ease: 'elastic.out(1,0.5)' }
      )
    }

    // Sai da janela
    const onLeave = () => {
      gsap.to([dot.current, ring.current, trail.current], { opacity: 0, duration: 0.2 })
    }
    const onEnter = () => {
      gsap.to([dot.current, ring.current, trail.current], { opacity: 1, duration: 0.2 })
    }

    // Anexa hover nos elementos interativos
    const hoverTargets = 'button, a, [data-cursor], input, textarea, select, label'
    const attach = () => {
      document.querySelectorAll(hoverTargets).forEach(el => {
        el.removeEventListener('mouseenter', grow)
        el.removeEventListener('mouseleave', shrink)
        el.addEventListener('mouseenter', grow)
        el.addEventListener('mouseleave', shrink)
      })
    }

    attach()

    const observer = new MutationObserver(attach)
    observer.observe(document.body, { childList: true, subtree: true })

    window.addEventListener('mousemove',   move)
    window.addEventListener('mousedown',   onClick)
    document.addEventListener('mouseleave', onLeave)
    document.addEventListener('mouseenter', onEnter)

    return () => {
      window.removeEventListener('mousemove',   move)
      window.removeEventListener('mousedown',   onClick)
      document.removeEventListener('mouseleave', onLeave)
      document.removeEventListener('mouseenter', onEnter)
      cancelAnimationFrame(rafId)
      observer.disconnect()
    }
  }, [])

  return (
    <>
      {/* Dot central */}
      <div
        ref={dot}
        className="fixed pointer-events-none hidden lg:block"
        style={{
          zIndex: 999999,
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: 'var(--cursor-dot)',
          transform: 'translate(-50%,-50%)',
          top: 0,
          left: 0,
          boxShadow: '0 0 6px var(--cursor-glow), 0 0 14px var(--cursor-halo)',
          animation: 'cursorPulse 2s ease-in-out infinite',
        }}
      />

      {/* Ring externo */}
      <div
        ref={ring}
        className="fixed pointer-events-none hidden lg:block"
        style={{
          zIndex: 999998,
          width: 32,
          height: 32,
          borderRadius: '50%',
          border: '1.5px solid var(--cursor-ring)',
          transform: 'translate(-50%,-50%)',
          top: 0,
          left: 0,
          transition: 'border-color 0.25s ease',
        }}
      />

      {/* Trail suave */}
      <div
        ref={trail}
        className="fixed pointer-events-none hidden lg:block"
        style={{
          zIndex: 999997,
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: 'radial-gradient(circle, var(--cursor-trail) 0%, transparent 70%)',
          transform: 'translate(-50%,-50%)',
          top: 0,
          left: 0,
        }}
      />

      {/* Animação de pulse — usa as mesmas vars do tema */}
      <style>{`
        @keyframes cursorPulse {
          0%, 100% {
            box-shadow: 0 0 6px var(--cursor-glow), 0 0 14px var(--cursor-halo);
          }
          50% {
            box-shadow: 0 0 10px var(--cursor-glow), 0 0 24px var(--cursor-halo), 0 0 40px var(--cursor-trail);
          }
        }
      `}</style>
    </>
  )
}