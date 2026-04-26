const FOOTER_H = 38

export { FOOTER_H }

export default function SFFooter() {
  const year = new Date().getFullYear()

  return (
    <footer style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 9999,
      height: FOOTER_H,
      background: 'rgba(4, 4, 4, 0.97)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(0, 229, 168, 0.18)',
      boxShadow: '0 -6px 30px rgba(0, 229, 168, 0.05)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      userSelect: 'none',
    }}>
      {/* Copyright — hidden on very small screens */}
      <span className="hidden xs:inline sm:inline" style={{
        color: 'rgba(255,255,255,0.3)',
        fontSize: '0.67rem',
        letterSpacing: '0.025em',
        fontFamily: 'DM Sans, sans-serif',
        whiteSpace: 'nowrap',
      }}>
        © {year} Todos os direitos reservados · Desenvolvido por
      </span>

      {/* Short version for mobile */}
      <span className="inline sm:hidden" style={{
        color: 'rgba(255,255,255,0.3)',
        fontSize: '0.67rem',
        letterSpacing: '0.025em',
        fontFamily: 'DM Sans, sans-serif',
        whiteSpace: 'nowrap',
      }}>
        © {year} ·
      </span>

      {/* Divisor vertical */}
      <span style={{ width: 1, height: 14, background: 'rgba(0,229,168,0.2)', flexShrink: 0 }} />

      {/* Link Single Future */}
      <a
        href="https://www.singlefuture.com.br"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          fontFamily: "'Orbitron', monospace",
          fontSize: '0.62rem',
          fontWeight: 700,
          color: '#00e5a8',
          textDecoration: 'none',
          letterSpacing: '0.15em',
          textShadow: '0 0 14px rgba(0, 229, 168, 0.55)',
          whiteSpace: 'nowrap',
          transition: 'text-shadow 0.25s, color 0.25s',
          display: 'flex',
          alignItems: 'center',
          gap: '0.3rem',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.textShadow = '0 0 22px rgba(0, 229, 168, 1), 0 0 40px rgba(0, 229, 168, 0.4)'
          e.currentTarget.style.color = '#4dffd4'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.textShadow = '0 0 14px rgba(0, 229, 168, 0.55)'
          e.currentTarget.style.color = '#00e5a8'
        }}
      >
        SINGLE FUTURE
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none" style={{ opacity: 0.7 }}>
          <path d="M1 7L7 1M7 1H2M7 1V6" stroke="#00e5a8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </a>
    </footer>
  )
}
