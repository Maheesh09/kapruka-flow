'use client'
import { useState, useRef, useEffect } from 'react'
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
    // Generate 20 random particles
    const p = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 20 + 15,
      delay: Math.random() * -20,
    }))
    setParticles(p)
  }, [])
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1, overflow: 'hidden' }}>
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
          animation: `floatUp ${p.duration}s linear infinite`,
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
      {/* Blurred Background Image */}
      <div style={{
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

      {/* Layer 1: Mid-depth floating accent glows */}
      <div style={{
        position: 'absolute', left: '22%', top: '18%', width: 320, height: 320,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(107,82,200,0.08) 0%, rgba(107,82,200,0) 70%)',
        animation: 'glowPulse 6s ease-in-out infinite',
        filter: 'blur(2px)'
      }} />
      <div style={{
        position: 'absolute', right: '18%', top: '35%', width: 260, height: 260,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(245,200,0,0.07) 0%, rgba(245,200,0,0) 70%)',
        animation: 'glowPulse 8s ease-in-out infinite',
        animationDelay: '2s',
        filter: 'blur(2px)'
      }} />
      <div style={{
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
function FlowPresence() {
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
          }}>Flow</span>
        </div>
        <div style={{
          fontFamily: 'Inter', fontSize: 11.5, color: 'rgba(26,20,51,0.55)',
          fontWeight: 400, lineHeight: 1
        }}>
          Your shopping companion
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
            Flow is online
          </span>
        </div>
      </div>
    </div>
  )
}

// ── Docked input bar (flow state) ─────────────────────────────────────────────
function DockedInputBar({ input, setInput, onSubmit, loading, showTrackChip, onTrack, onNewFlow, lang }) {
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
      background: 'linear-gradient(to top, rgba(250,249,255,0.96) 50%, rgba(250,249,255,0))'
    }}>
      {showTrackChip && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button onClick={onTrack} style={pillStyle}>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#3D2785"
              strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 10c0 4.993-5.539 10.193-7.4 11.799a1 1 0 0 1-1.2 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            Track order
          </button>
          <button onClick={onNewFlow} style={pillStyle}>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#3D2785"
              strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            Start a new flow
          </button>
        </div>
      )}
      <InputBar value={input} onChange={setInput} onSubmit={onSubmit} docked={true} loading={loading} lang={lang}
        placeholder={loading ? 'Flow is working…' : 'Ask, refine, or tell me what changed…'} />
    </div>
  )
}

// ── Splash screen — brand moment while fonts load ──────────────────────────────
function SplashScreen({ onDone }) {
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
        Flow your way to the perfect find
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
  const [lastPlan, setLastPlan] = useState(null)
  const flowRef = useRef(null)
  const [splash, setSplash] = useState(true)

  // ── Restore on mount (must be in useEffect — SSR has no sessionStorage) ──
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORE_KEY)
      if (!saved) return
      const s = JSON.parse(saved)
      if (!s.messages?.length) return
      // stream:false so restored bubbles render instantly instead of re-typing
      setMessages(s.messages.map(m => ({ ...m, stream: false })))
      setPhase(s.phase ?? 'flow')
      setJourneyActive(s.journeyActive ?? 0)
      setJourneyDone(s.journeyDone ?? [])
      setShowTrackChip(s.showTrackChip ?? false)
      setLastPlan(s.lastPlan ?? null)
      setLang(s.lang ?? ['EN', 'SI', 'TA'])
    } catch { /* corrupt state → start fresh, never crash */ }
  }, [])

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

  function addUserMsg(text) {
    addMsg({ role: 'user', content: text })
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
  async function send(text) {
    const t = (text ?? input).trim()
    if (!t || loading) return
    setInput('')
    setShowTrackChip(false)

    if (phase === 'opening') {
      setPhase('flow')
      setJourneyActive(1)
      setJourneyDone([0])
    }

    const userMsg = { role: 'user', content: t }
    const updatedMsgs = [...messages, userMsg]
    addUserMsg(t)
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
          if (ev.type === 'status') {
            setLiveStatus(prev => [...prev, { icon: ev.icon, label: ev.label }])
          } else if (ev.type === 'final') {
            data = ev.payload
          }
        }
      }

      if (!data) { addAgentMsg('Something went wrong. Please try again.', false); return }

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

      // Checkout URL in response?
      const checkout = detectCheckout(data.text || '')
      if (checkout) {
        setJourneyActive(3); setJourneyDone([0, 1, 2])
        setShowTrackChip(true)
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
      addAgentMsg('Network error. Please try again.', false)
    } finally {
      setLoading(false)
      setLiveStatus([])
    }
  }

  // ── Plan Board actions ────────────────────────────────────────────────────
  function handleAddRecipient(plan) {
    send("I'd like to add the recipient. Please ask me for their name, phone, and delivery address.")
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
        showJourney={phase !== 'opening'} />

      {/* Layer 1: Content */}
      {phase === 'opening' && (
        <OpeningCanvas
          input={input} setInput={setInput}
          onSubmit={send} lang={lang} />
      )}

      {phase === 'flow' && (
        <>
          <FlowArea
            messages={messages} loading={loading}
            liveStatus={liveStatus}
            onChoose={handleProductChosen}
            onAddRecipient={handleAddRecipient}
            onCreateOrder={handleCreateOrder}
            onAddItem={handleAddItem}
            onEditGift={handleEditGift}
            onChip={handleChip}
            flowRef={flowRef} />

          {/* Layer 2: Docked input */}
          <DockedInputBar
            input={input} setInput={setInput}
            onSubmit={send} loading={loading}
            showTrackChip={showTrackChip}
            onTrack={handleTrack}
            onNewFlow={handleNewFlow}
            lang={lang} />
        </>
      )}

      {/* Flow Presence widget — only visible on landing */}
      {phase === 'opening' && <FlowPresence />}
      {splash && <SplashScreen onDone={() => setSplash(false)} />}
    </div>
  )
}