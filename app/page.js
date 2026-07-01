'use client'
import { t } from './i18n'
import { useState, useRef, useEffect, useLayoutEffect } from 'react'
import Header from './components/Header'
import OpeningCanvas, { InputBar } from './components/OpeningCanvas'
import FlowArea from './components/FlowArea'

// ── Checkout URL detector ──────────────────────────────────────────────────────
function detectCheckout(text) {
  const url = text.match(/https:\/\/www\.kapruka\.com\/tools\/continue_order\.jsp\?id=[\w]+/)
  const ref = text.match(/ORD-[\w-]+/)
  const exp = text.match(/(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?)/)
  if (!url) return null
  return { url: url[0], ref: ref?.[0] ?? null, expiresAt: exp?.[0] ?? null }
}

// ── Magic Dust Particles ────────────────────────────────────────────────────────
function ParticlesLayer() {
  const [particles, setParticles] = useState([])
  useEffect(() => {
    // Generate 20 random particles — drift is always positive (rightward),
    // so every particle leans the same direction. That's the whole point:
    // a current, not scattered floating dust.
    const p = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 20 + 15,
      delay: Math.random() * -20,
      drift: 6 + Math.random() * 8, // vw — how far right it leans over its full rise
    }))
    setParticles(p)
  }, [])
  return (
    <div className="ambient-particles" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1, overflow: 'hidden' }}>
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'absolute',
          left: `${p.left}%`,
          top: `${p.top}%`,
          width: p.size,
          height: p.size,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.8)',
          boxShadow: '0 0 8px rgba(255,255,255,0.8)',
          // CSS custom prop consumed by the flowCurrent keyframe
          '--drift': `${p.drift}vw`,
          animation: `flowCurrent ${p.duration}s linear infinite`,
          animationDelay: `${p.delay}s`,
          opacity: 0
        }} />
      ))}
    </div>
  )
}

// ── Ambient depth scene ────────────────────────────────────────────────────────
function AmbientLayer({ loading }) {
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 })

  useEffect(() => {
    if (!window.matchMedia('(hover: hover)').matches) return // no parallax on touch
    let raf = null
    const onMove = (e) => {
      if (raf) return                       // throttle to one update per frame
      raf = requestAnimationFrame(() => {
        setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight })
        raf = null
      })
    }
    window.addEventListener('mousemove', onMove)
    return () => { window.removeEventListener('mousemove', onMove); if (raf) cancelAnimationFrame(raf) }
  }, [])

  const tiltX = (mousePos.y - 0.5) * 15;
  const tiltY = (mousePos.x - 0.5) * -15;

  return (
    <div aria-hidden="true" style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
      pointerEvents: 'none', zIndex: 0,
      perspective: '1200px'
    }}>
      {/* Blurred Background Image — hidden on mobile (ambient-bg-photo) */}
      <div className="ambient-bg-photo" style={{
        position: 'absolute', inset: -50,
        backgroundImage: 'url("/back.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: loading ? 'blur(24px) brightness(0.85)' : 'blur(10px)',
        zIndex: -1,
        opacity: 0.95,
        transform: `translateZ(-50px) rotateX(${tiltX * 0.4}deg) rotateY(${tiltY * 0.4}deg) scale(1.1)`,
        transition: 'transform 0.4s ease-out, filter 1.5s ease',
        transformStyle: 'preserve-3d'
      }} />

      {/* Plain CSS gradient fallback for mobile — no GPU compositing cost */}
      <div className="ambient-mobile-gradient" />

      {/* Layer 0: Deep ambient color blobs */}
      <div className="kf-blob drift-a" style={{
        width: '58vw', height: '58vw',
        left: '-14vw', top: '-16vh',
        background: 'radial-gradient(circle at 40% 40%, rgba(233,228,255,0.85), rgba(233,228,255,0))'
      }} />
      <div className="kf-blob drift-b" style={{
        width: '50vw', height: '50vw',
        right: '-12vw', top: '-10vh',
        background: 'radial-gradient(circle at 50% 50%, rgba(255,247,224,0.80), rgba(255,247,224,0))'
      }} />
      <div className="kf-blob drift-c" style={{
        width: '52vw', height: '52vw',
        right: '0vw', bottom: '-20vh',
        background: 'radial-gradient(circle at 50% 50%, rgba(255,233,243,0.75), rgba(255,233,243,0))'
      }} />
      <div className="kf-blob drift-a" style={{
        width: '44vw', height: '44vw',
        left: '4vw', bottom: '-18vh', animationDuration: '52s',
        background: 'radial-gradient(circle at 50% 50%, rgba(233,228,255,0.70), rgba(233,228,255,0))'
      }} />

      {/* Layer 1: Mid-depth floating accent glows — hidden on mobile (ambient-glow-layer)
          filter:blur() on animated elements forces repaint every frame on mobile GPUs */}
      <div className="ambient-glow-layer" style={{
        position: 'absolute', left: '22%', top: '18%', width: 320, height: 320,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(107,82,200,0.08) 0%, rgba(107,82,200,0) 70%)',
        animation: 'glowPulse 6s ease-in-out infinite',
        filter: 'blur(2px)'
      }} />
      <div className="ambient-glow-layer" style={{
        position: 'absolute', right: '18%', top: '35%', width: 260, height: 260,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(245,200,0,0.07) 0%, rgba(245,200,0,0) 70%)',
        animation: 'glowPulse 8s ease-in-out infinite',
        animationDelay: '2s',
        filter: 'blur(2px)'
      }} />
      <div className="ambient-glow-layer" style={{
        position: 'absolute', left: '55%', bottom: '22%', width: 200, height: 200,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,158,207,0.06) 0%, rgba(255,158,207,0) 70%)',
        animation: 'glowPulse 7s ease-in-out infinite',
        animationDelay: '1s',
        filter: 'blur(2px)'
      }} />

      {/* Layer 2: Film grain texture */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1, opacity: 0.035,
        mixBlendMode: 'soft-light',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`
      }} />

      {/* Layer 3: Center directional spotlight */}
      <div style={{
        position: 'absolute', left: '50%', top: '38%',
        transform: `translate(-50%,-50%) translate(${tiltY * -4}px, ${tiltX * 4}px)`,
        width: 900, height: 900, maxWidth: '95vw',
        borderRadius: '50%',
        background: loading
          ? 'radial-gradient(circle,rgba(107,82,200,0.4) 0%,rgba(107,82,200,0.1) 40%,rgba(255,255,255,0) 68%)'
          : 'radial-gradient(circle,rgba(255,255,255,0.75) 0%,rgba(255,255,255,0.2) 40%,rgba(255,255,255,0) 68%)',
        zIndex: 2, pointerEvents: 'none',
        animation: loading ? 'glowPulse 3s ease-in-out infinite' : 'glowPulse 10s ease-in-out infinite',
        transition: 'transform 0.3s ease-out, background 1.5s ease'
      }} />
    </div>
  )
}

// ── Flow Presence Widget ────────────────────────────────────────────────────────
// ── Confetti burst — fires once on order completion ──────────────────────────
function Confetti() {
  const COLORS = ['#F5C800', '#FFE08A', '#3D2785', '#8a72d0', '#FF9ECF', '#34D399']
  const pieces = useRef(
    Array.from({ length: 70 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 1.8 + Math.random() * 1.4,
      color: COLORS[i % COLORS.length],
      size: 7 + Math.random() * 7,
      rotate: Math.random() * 360,
      drift: (Math.random() - 0.5) * 220,
    }))
  ).current

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 90, pointerEvents: 'none', overflow: 'hidden'
    }}>
      {pieces.map(p => (
        <span key={p.id} style={{
          position: 'absolute', top: '-6%', left: `${p.left}%`,
          width: p.size, height: p.size * 0.45,
          background: p.color, borderRadius: 1,
          opacity: 0.95,
          // CSS custom props consumed by the confettiFall keyframe
          '--drift': `${p.drift}px`,
          '--rot': `${p.rotate}deg`,
          animation: `confettiFall ${p.duration}s cubic-bezier(.25,.6,.5,1) ${p.delay}s forwards`
        }} />
      ))}
    </div>
  )
}

// ── Launch ghost — the input bar's journey from landing to docked ──────────────
// A purely decorative stand-in: an empty glassy pill, styled to match
// InputBar's own unfocused look exactly. By the moment this plays, the real
// input text has already been cleared and sent, so there's nothing to lose by
// using a plain div instead of the real component — which means the real
// InputBar (voice, focus, autocomplete) is never touched by this at all.
// It starts at `from` (the real opening bar's measured position), then on the
// next animation frame eases to `to` (the docked target) — a classic FLIP.
// At both ends, a pixel-identical real element is swapped in/out underneath
// it, so the handoff is invisible.
function LaunchGhost({ from, to }) {
  const rect = to || from
  return (
    <div aria-hidden="true" style={{
      position: 'fixed', zIndex: 60, pointerEvents: 'none',
      top: rect.top, left: rect.left, width: rect.width, height: rect.height,
      borderRadius: 999,
      background: 'linear-gradient(135deg,rgba(255,255,255,0.82),rgba(255,255,255,0.68))',
      backdropFilter: 'blur(28px) saturate(200%)',
      WebkitBackdropFilter: 'blur(28px) saturate(200%)',
      border: '1px solid rgba(255,255,255,0.9)',
      boxShadow: '0 8px 28px rgba(61,39,133,0.10)',
      transition: 'top .52s cubic-bezier(.2,.7,.2,1), left .52s cubic-bezier(.2,.7,.2,1), width .52s cubic-bezier(.2,.7,.2,1), height .52s cubic-bezier(.2,.7,.2,1)'
    }} />
  )
}

function FlowPresence({ lang = 'EN' }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div className="mobile-presence-widget"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'absolute', bottom: 28, right: 24, zIndex: 35,
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 18px 12px 14px',
        borderRadius: 18,
        background: hovered
          ? 'linear-gradient(135deg,rgba(255,255,255,0.82),rgba(255,255,255,0.68))'
          : 'linear-gradient(135deg,rgba(255,255,255,0.62),rgba(255,255,255,0.44))',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.80)',
        boxShadow: hovered
          ? '0 16px 40px rgba(61,39,133,0.18), 0 1px 0 rgba(255,255,255,0.9) inset'
          : '0 8px 24px rgba(61,39,133,0.10)',
        transform: hovered ? 'translateY(-3px) scale(1.02)' : 'translateY(0) scale(1)',
        transition: 'all .3s cubic-bezier(.2,.7,.2,1)',
        cursor: 'default',
        animation: 'riseBlur .6s 1.2s cubic-bezier(.2,.7,.2,1) both'
      }}
    >
      {/* Orb icon */}
      <div style={{
        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
        background: 'radial-gradient(circle at 34% 30%, #8a72d0, #3D2785 72%)',
        boxShadow: '0 4px 12px rgba(61,39,133,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        {/* Mini smile */}
        <svg width="16" height="10" viewBox="0 0 24 15" fill="none" style={{ marginTop: 4 }}>
          <path d="M3.5 2.5 A 8.5 8.5 0 0 0 20.5 2.5"
            stroke="#F5C800" strokeWidth="4.5" strokeLinecap="round" fill="none"
            style={{ animation: 'cuteWiggle 4s ease-in-out infinite', transformOrigin: 'center' }}
          />
        </svg>
      </div>

      {/* Text */}
      <div className="mobile-presence-text" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6
        }}>
          <span style={{
            fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700,
            fontSize: 14, color: '#1A1433', letterSpacing: '-0.01em'
          }}>{t(lang, 'presenceName')}</span>
        </div>
        <div style={{
          fontFamily: 'Inter', fontSize: 11.5, color: 'rgba(26,20,51,0.55)',
          fontWeight: 400, lineHeight: 1
        }}>
          {t(lang, 'presenceRole')}
        </div>
        {/* Online status */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 5, marginTop: 4
        }}>
          {/* Pulse dot */}
          <div style={{
            width: 7, height: 7, borderRadius: '50%',
            background: '#34D399',
            boxShadow: '0 0 0 0 rgba(52,211,153,0.7)',
            animation: 'agentPulse 2s ease-in-out infinite'
          }} />
          <span style={{
            fontFamily: 'Inter', fontSize: 11, fontWeight: 500,
            color: 'rgba(26,20,51,0.50)'
          }}>
            {t(lang, 'presenceOnline')}
          </span>
        </div>
      </div>
    </div>
  )
}

// ── Docked input bar (flow state) ─────────────────────────────────────────────
function DockedInputBar({ input, setInput, onSubmit, loading, showTrackChip, onTrack, onNewFlow, lang, hidden, anchorRef }) {
  const pillStyle = {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: '9px 18px', borderRadius: 999, cursor: 'pointer', fontFamily: 'Inter',
    fontWeight: 600, fontSize: 14, color: '#3D2785',
    background: 'linear-gradient(135deg,rgba(255,255,255,0.82),rgba(255,255,255,0.66))',
    backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
    borderWidth: 1, borderStyle: 'solid',
    borderTopColor: 'rgba(255,255,255,0.9)', borderLeftColor: 'rgba(255,255,255,0.9)',
    borderRightColor: 'rgba(61,39,133,0.14)', borderBottomColor: 'rgba(61,39,133,0.14)',
    boxShadow: '0 6px 20px rgba(61,39,133,0.10)', animation: 'riseBlur .4s ease-out both'
  }
  return (
    <div className="docked-bar" style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 30,
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
      padding: '16px 20px calc(28px + env(safe-area-inset-bottom))',
      background: 'linear-gradient(to top, rgba(250,249,255,0.96) 50%, rgba(250,249,255,0))',
      opacity: hidden ? 0 : 1, pointerEvents: hidden ? 'none' : 'auto'
    }}>
      {showTrackChip && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button onClick={onTrack} style={pillStyle}>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#3D2785"
              strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 10c0 4.993-5.539 10.193-7.4 11.799a1 1 0 0 1-1.2 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {t(lang, 'trackOrder')}
          </button>
          <button onClick={onNewFlow} style={pillStyle}>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#3D2785"
              strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            {t(lang, 'newFlow')}
          </button>
        </div>
      )}
      <div ref={anchorRef} style={{ width: 'min(700px,94vw)' }}>
        <InputBar value={input} onChange={setInput} onSubmit={onSubmit} docked={true} loading={loading} lang={lang}
          placeholder={loading ? t(lang, 'inputPlaceholderLoading') : t(lang, 'inputPlaceholderDocked')} />
      </div>
    </div>
  )
}

// ── Splash screen — brand moment while fonts load ──────────────────────────────
function SplashScreen({ onDone, lang = 'EN' }) {
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const minTime = new Promise(r => setTimeout(r, 1800))        // enough to enjoy, short enough to not annoy
    const fonts = document.fonts?.ready ?? Promise.resolve()     // real work: wait for webfonts
    Promise.all([minTime, fonts]).then(() => {
      setLeaving(true)                                           // start fade-out
      setTimeout(onDone, 650)                                    // unmount after the fade
    })
  }, [onDone])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 18, background: 'linear-gradient(160deg, #2C1C66 0%, #1A1433 100%)',
      opacity: leaving ? 0 : 1,
      transform: leaving ? 'scale(1.04)' : 'scale(1)',
      transition: 'opacity .65s ease, transform .65s ease',
      pointerEvents: leaving ? 'none' : 'auto'
    }}>
      {/* Wordmark */}
      <div style={{
        fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700,
        fontSize: 'clamp(38px, 8vw, 64px)', letterSpacing: '-0.02em',
        display: 'flex', alignItems: 'center', gap: 14
      }}>
        <span style={{ color: '#FFFFFF', animation: 'riseBlur .7s .15s cubic-bezier(.2,.7,.2,1) both' }}>
          kapruka
        </span>
        <span style={{ color: '#F5C800', animation: 'riseBlur .7s .35s cubic-bezier(.2,.7,.2,1) both' }}>
          flow
        </span>
      </div>

      {/* Smile — draws itself in */}
      <svg width="64" height="40" viewBox="0 0 24 15" fill="none"
        style={{ animation: 'fadeIn .4s .55s ease-out both' }}>
        <path d="M3.5 2.5 A 8.5 8.5 0 0 0 20.5 2.5"
          stroke="#F5C800" strokeWidth="4.2" strokeLinecap="round" fill="none"
          style={{
            strokeDasharray: 28, strokeDashoffset: 28,
            animation: 'splashSmileDraw 1s .6s cubic-bezier(.4,0,.2,1) forwards'
          }} />
      </svg>

      {/* Tagline */}
      <div style={{
        fontFamily: 'Inter', fontSize: 17, fontWeight: 500,
        color: 'rgba(255,255,255,0.55)', letterSpacing: '0.06em',
        animation: 'fadeIn .6s 1s ease-out both'
      }}>
        {t(lang, 'openingSub')}
      </div>
    </div>
  )
}

const STORE_KEY = 'kapruka-flow-session'

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Home() {
  const [phase, setPhase] = useState('opening')
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [lang, setLang] = useState('EN')
  const [journeyActive, setJourneyActive] = useState(0)
  const [journeyDone, setJourneyDone] = useState([])
  const [showTrackChip, setShowTrackChip] = useState(false)
  const [liveStatus, setLiveStatus] = useState([])   // real-time tool status feed
  const [celebrate, setCelebrate] = useState(false)  // confetti burst on order complete
  const [lastPlan, setLastPlan] = useState(null)
  const flowRef = useRef(null)
  const [splash, setSplash] = useState(true)
  const autoTrackedRef = useRef(false) // guards the silent post-payment auto-track from double-firing

  // ── Opening → flow launch transition ──────────────────────────────────────
  // The input bar visually travels from its centered landing position to its
  // docked home instead of teleporting. See LaunchGhost below for the why.
  const [launching, setLaunching] = useState(false)
  const [ghostFrom, setGhostFrom] = useState(null)
  const [ghostTo, setGhostTo] = useState(null)
  const openingAnchorRef = useRef(null) // measures the real opening input bar at submit time
  const dockedAnchorRef = useRef(null)  // measures the docked target (hidden measurer, then the real bar)
  const LAUNCH_MS = 600

  // ── Restore on mount (must be in useEffect — SSR has no sessionStorage) ──
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORE_KEY)
      if (!saved) return
      const s = JSON.parse(saved)
      if (!s.messages?.length) return
      // Returning user mid-conversation — skip the splash so it doesn't flash over their chat
      setSplash(false)
      // stream:false so restored bubbles render instantly instead of re-typing
      setMessages(s.messages.map(m => ({ ...m, stream: false })))
      setPhase(s.phase ?? 'flow')
      setJourneyActive(s.journeyActive ?? 0)
      setJourneyDone(s.journeyDone ?? [])
      setShowTrackChip(s.showTrackChip ?? false)
      setLastPlan(s.lastPlan ?? null)
      setLang(['EN', 'SI', 'TA'].includes(s.lang) ? s.lang : 'EN')
    } catch { /* corrupt state → start fresh, never crash */ }
  }, [])

  // ── Launch transition: measure the docked target, then animate to it ─────
  // ghostFrom is set synchronously in send() (see below). Once that render
  // commits, this measures where the input bar is actually headed — a hidden
  // measurer div while still 'opening', the real docked bar's own position
  // once 'flow' is reached for any reason. Double-rAF guarantees the browser
  // paints the "from" position at least once before we apply "to", or the
  // CSS transition has nothing to animate from and the bar would just teleport.
  useLayoutEffect(() => {
    if (!launching) return
    const toEl = dockedAnchorRef.current
    if (!toEl) return
    const r = toEl.getBoundingClientRect()
    const target = { top: r.top, left: r.left, width: r.width, height: r.height }
    let raf2
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setGhostTo(target))
    })
    const timer = setTimeout(() => {
      setPhase('flow')
      setLaunching(false)
      setGhostFrom(null)
      setGhostTo(null)
    }, LAUNCH_MS)
    return () => { cancelAnimationFrame(raf1); cancelAnimationFrame(raf2); clearTimeout(timer) }
  }, [launching])

  // ── Save on every meaningful change ──
  useEffect(() => {
    if (phase === 'opening' && messages.length === 0) return
    try {
      sessionStorage.setItem(STORE_KEY, JSON.stringify({
        messages: messages.slice(-30),   // cap size — sessionStorage has a ~5MB limit
        phase, journeyActive, journeyDone, showTrackChip, lastPlan, lang
      }))
    } catch { /* quota exceeded → just skip saving */ }
  }, [messages, phase, journeyActive, journeyDone, showTrackChip, lastPlan, lang])

  // Keep the document language in sync with the selected UI language (a11y/SEO)
  useEffect(() => {
    const map = { EN: 'en', SI: 'si', TA: 'ta' }
    document.documentElement.lang = map[lang] || 'en'
  }, [lang])

  // Auto-scroll flow area
  useEffect(() => {
    if (flowRef.current) {
      flowRef.current.scrollTo({ top: flowRef.current.scrollHeight, behavior: 'smooth' })
    }
  }, [messages, loading, liveStatus])

  useEffect(() => {                              // follow streaming growth
    if (!loading && messages[messages.length - 1]?.stream !== true) return
    const id = setInterval(() => {
      const el = flowRef.current
      if (el && el.scrollHeight - el.scrollTop - el.clientHeight < 80)
        el.scrollTo({ top: el.scrollHeight })
    }, 400)
    return () => clearInterval(id)
  }, [loading, messages])

  // ── Message helpers ───────────────────────────────────────────────────────
  function addMsg(msg) {
    setMessages(prev => [...prev, msg])
  }

  function addUserMsg(text, opts = {}) {
    addMsg({ role: 'user', content: text, ...opts })
  }

  function addAgentMsg(text, stream = true) {
    addMsg({
      role: 'assistant', msgType: 'agent', content: text, stream,
      rawContent: text
    })
  }

  // ── Build Gemini-history from messages ────────────────────────────────────
  function buildHistory(msgs) {
    return msgs.map(m => ({
      role: m.role,
      content: m.rawContent ?? m.content
    }))
  }

  // ── Core send ─────────────────────────────────────────────────────────────
  async function send(text, { silent = false } = {}) {
    const t = (text ?? input).trim()
    if (!t || loading) return
    setInput('')
    setShowTrackChip(false)

    if (phase === 'opening') {
      // Stay on "Goal" until a real result (trio/plan/checkout) advances the journey,
      // so a clarifying question doesn't falsely show "Discover" as reached.
      const fromEl = openingAnchorRef.current
      const r = fromEl?.getBoundingClientRect()
      if (r) {
        setGhostFrom({ top: r.top, left: r.left, width: r.width, height: r.height })
        setLaunching(true) // useLayoutEffect above measures the docked target and flips phase after LAUNCH_MS
      } else {
        setPhase('flow') // couldn't measure (e.g. ref not ready) — never block sending, just skip the animation
      }
    }

    const userMsg = { role: 'user', content: t }
    const updatedMsgs = [...messages, userMsg]
    addUserMsg(t, silent ? { hidden: true } : {})
    setLoading(true)

    setLiveStatus([])
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: buildHistory(updatedMsgs),
          lang
        })
      })

      if (!res.ok || !res.body) {
        if (!silent) addAgentMsg('The server is busy right now — please try that once more.', false)
        return
      }

      // ── NDJSON stream: status lines arrive live, then one final payload ──
      let data = null
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buf = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += decoder.decode(value, { stream: true })
        let nl
        while ((nl = buf.indexOf('\n')) >= 0) {
          const line = buf.slice(0, nl).trim()
          buf = buf.slice(nl + 1)
          if (!line) continue
          let ev
          try { ev = JSON.parse(line) } catch { continue }
          if (ev.type === 'heartbeat') { /* keep-alive — ignore */ }
          else if (ev.type === 'status') {
            setLiveStatus(prev => [...prev, { icon: ev.icon, label: ev.label }])
          } else if (ev.type === 'final') {
            data = ev.payload
          }
        }
      }

      if (!data) { if (!silent) addAgentMsg('Something went wrong. Please try again.', false); return }

      if (data.type === 'product_trio') {
        setJourneyActive(1); setJourneyDone([0])
        addMsg({
          role: 'assistant', msgType: 'product_trio', trio: data.trio,
          rawContent: data.rawText
        })
        return
      }

      if (data.type === 'plan_board') {
        setJourneyActive(2); setJourneyDone([0, 1])
        setLastPlan(data.plan)
        addMsg({
          role: 'assistant', msgType: 'plan_board', plan: data.plan,
          rawContent: data.rawText, content: data.plan?.message || ''
        })
        return
      }

      if (data.type === 'tracking') {
        if (silent) {
          // Merge into the most recent un-tracked checkout message so
          // OrderStageCard plays the wrap-morph in the same card position,
          // instead of a new TrackingCard appearing further down the log.
          setMessages(prev => {
            const revIdx = [...prev].reverse()
              .findIndex(m => m.msgType === 'checkout' && !m.trackingData)
            if (revIdx === -1) {
              // No matching checkout card to wrap (edge case) — fall back to
              // showing it as a normal standalone tracking card.
              return [...prev, {
                role: 'assistant', msgType: 'tracking', trackingData: data.trackingData,
                rawContent: data.rawText
              }]
            }
            const idx = prev.length - 1 - revIdx
            const next = [...prev]
            // The MCP's tracking tool only resolves a sandbox test order number,
            // so its recipient/items belong to that test order, not this one.
            // Status and timeline ARE real and meaningful — keep those. Overlay
            // this order's own plan data on top so the card reads as one
            // coherent order instead of showing someone else's delivery.
            const plan = next[idx].plan
            const merged = {
              ...data.trackingData,
              recipient: plan?.recipient?.name
                ? {
                  name: plan.recipient.name,
                  address: [plan.recipient.address, plan.delivery?.city]
                    .filter(Boolean).join(', ') || null
                }
                : data.trackingData.recipient,
              items: plan?.items?.length
                ? plan.items.map(i => ({ name: i.name, quantity: i.quantity || 1 }))
                : data.trackingData.items
            }

            next[idx] = {
              ...next[idx],
              trackingData: merged
            }
            return next
          })
        } else {
          addMsg({
            role: 'assistant', msgType: 'tracking', trackingData: data.trackingData,
            rawContent: data.rawText
          })
        }
        return
      }

      // Checkout? Prefer the structured order result from the MCP (reliable expiry/url/ref);
      // fall back to parsing the model's prose only if it's missing.
      const checkout = data.orderResult ?? detectCheckout(data.text || '')
      if (checkout && checkout.url) {
        setJourneyActive(3); setJourneyDone([0, 1, 2])
        setShowTrackChip(true)
        autoTrackedRef.current = false // a fresh order — let the next "I've paid" auto-track once
        addMsg({
          role: 'assistant', msgType: 'checkout', checkoutData: checkout,
          plan: lastPlan,
          content: data.text, rawContent: data.rawText || data.text
        })
        return
      }

      // Plain agent message (with optional quick-reply chips)
      addMsg({
        role: 'assistant', msgType: 'agent', content: data.text || 'Let me know how I can help.',
        stream: true, chips: data.chips || null, rawContent: data.rawText || data.text
      })

    } catch (e) {
      console.error('send error:', e)
      if (!silent) addAgentMsg('That didn\'t go through — your details are saved, just try once more.', false)
    } finally {
      setLoading(false)
      setLiveStatus([])
    }
  }

  // ── Plan Board actions ────────────────────────────────────────────────────
  function handleAddRecipient(recipientText) {
    // The inline form passes a clean structured string; fall back to a prompt only if called bare
    if (typeof recipientText === 'string' && recipientText.length) {
      send(recipientText)
    } else {
      send("I'd like to add the recipient. Please ask me for their name, phone, and delivery address.")
    }
  }

  function handleCreateOrder(plan) {
    const items = plan.items?.map(i => i.name).join(', ') || 'the items'
    send(`Please create this order now: ${items} to ${plan.recipient?.name || 'the recipient'}, ${plan.delivery?.city}, ${plan.delivery?.date}.`)
  }

  function handleProductChosen(product) {
    send(`I'll take the ${product.name}.`)
  }

  function handleTrack() {
    send('Track my order.')
  }

  function handleTrackAnother() {
    send('I want to track a different order.')
  }

  function handleNewFlow() {
    sessionStorage.removeItem(STORE_KEY)
    setMessages([])
    setPhase('opening')
    setJourneyActive(0)
    setJourneyDone([])
    setShowTrackChip(false)
    setLastPlan(null)
    setInput('')
    setLiveStatus([])
    setCelebrate(false)
    autoTrackedRef.current = false
  }

  function handleAddItem() {
    send("I'd like to add another item to this order. What would go well with it?")
  }

  function handleEditGift(text) {
    send(`Please update the gift message to: "${text}"`)
  }

  function handleChip(label) {
    send(label)
  }

  // Demo completion: clicking "pay" opens Kapruka's checkout (payment happens there,
  // off-platform and unobservable via MCP) — so we treat the click as the completion
  // signal to light the Done node and celebrate.
  function handleOrderComplete(orderRef) {
    setJourneyActive(4)
    setJourneyDone([0, 1, 2, 3])
    setCelebrate(true)
    setTimeout(() => setCelebrate(false), 2600)

    if (!autoTrackedRef.current) {
      autoTrackedRef.current = true
      const trackMsg = orderRef
        ? `[AUTO-TRACK] Please check delivery status now for order number ${orderRef}.`
        : 'Track my order.'
      setTimeout(() => send(trackMsg, { silent: true }), 700)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, width: '100%', height: '100dvh',
      overflow: 'hidden', background: '#FAF9FF', fontFamily: "'Inter',sans-serif",
      color: '#1A1433'
    }}>

      {/* Layer 0: Ambient depth scene */}
      <AmbientLayer loading={loading} />
      <ParticlesLayer />

      {/* Layer 3: Navigation */}
      <Header lang={lang} setLang={setLang}
        journeyActive={journeyActive} journeyDone={journeyDone}
        showJourney={phase !== 'opening' || launching} onNewFlow={handleNewFlow} />

      {/* Layer 1: Content */}
      {phase === 'opening' && (
        <OpeningCanvas
          input={input} setInput={setInput}
          onSubmit={send} lang={lang}
          leaving={launching} anchorRef={openingAnchorRef} />
      )}

      {/* Hidden measurer — exists only while launching, gives the ghost an accurate
          landing target without ever mounting the real (autofocusing) input early. */}
      {launching && (
        <div aria-hidden="true" style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: '16px 20px calc(28px + env(safe-area-inset-bottom))',
          display: 'flex', justifyContent: 'center',
          opacity: 0, pointerEvents: 'none'
        }}>
          <div ref={dockedAnchorRef} style={{ width: 'min(700px,94vw)', height: 62 }} />
        </div>
      )}

      {/* The traveling input bar — purely visual, see LaunchGhost above */}
      {launching && ghostFrom && <LaunchGhost from={ghostFrom} to={ghostTo} />}

      {phase === 'flow' && (
        <>
          <FlowArea
            messages={messages} loading={loading}
            liveStatus={liveStatus}
            lang={lang}
            onChoose={handleProductChosen}
            onAddRecipient={handleAddRecipient}
            onCreateOrder={handleCreateOrder}
            onAddItem={handleAddItem}
            onEditGift={handleEditGift}
            onChip={handleChip}
            onComplete={handleOrderComplete}
            onTrackAnother={handleTrackAnother}
            flowRef={flowRef} />

          {/* Layer 2: Docked input */}
          <DockedInputBar
            input={input} setInput={setInput}
            onSubmit={send} loading={loading}
            showTrackChip={showTrackChip}
            onTrack={handleTrack}
            onNewFlow={handleNewFlow}
            lang={lang} anchorRef={dockedAnchorRef} />
        </>
      )}

      {/* Flow Presence widget — only visible on landing */}
      {celebrate && <Confetti />}
      {phase === 'opening' && !launching && <FlowPresence lang={lang} />}
      {splash && <SplashScreen onDone={() => setSplash(false)} lang={lang} />}
    </div>
  )
}