'use client'
import { useState, useRef, useEffect } from 'react'
import Header from './components/Header'
import OpeningCanvas, { InputBar } from './components/OpeningCanvas'
import FlowArea from './components/FlowArea'

// ── Checkout URL detector ──────────────────────────────────────────────────────
function detectCheckout(text) {
  const url = text.match(/https:\/\/www\.kapruka\.com\/tools\/continue_order\.jsp\?id=[\w]+/)
  const ref = text.match(/ORD-[\w-]+/)
  const exp = text.match(/(\d{4}-\d{2}-\d{2}T[\d:+.]+)/)
  if (!url) return null
  return { url: url[0], ref: ref?.[0] ?? null, expiresAt: exp?.[0] ?? null }
}

// ── Ambient depth scene ────────────────────────────────────────────────────────
function AmbientLayer() {
  return (
    <div aria-hidden="true" style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
      pointerEvents: 'none', zIndex: 0
    }}>
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
        transform: 'translate(-50%,-50%)', width: 900, height: 900, maxWidth: '95vw',
        borderRadius: '50%',
        background: 'radial-gradient(circle,rgba(255,255,255,0.75) 0%,rgba(255,255,255,0.2) 40%,rgba(255,255,255,0) 68%)',
        zIndex: 2, pointerEvents: 'none',
        animation: 'glowPulse 10s ease-in-out infinite'
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
        position: 'absolute', bottom: 28, left: 24, zIndex: 35,
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
        <svg width="18" height="12" viewBox="0 0 18 12" fill="none">
          <path d="M2 2 Q9 12 16 2" stroke="#F5C800" strokeWidth="2.2" strokeLinecap="round" fill="none"
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
function DockedInputBar({ input, setInput, onSubmit, loading, showTrackChip, onTrack }) {
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 30,
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
      padding: '16px 20px 28px',
      background: 'linear-gradient(to top, rgba(250,249,255,0.96) 50%, rgba(250,249,255,0))'
    }}>
      {showTrackChip && (
        <button onClick={onTrack} style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '9px 18px', borderRadius: 999, cursor: 'pointer', fontFamily: 'Inter',
          fontWeight: 600, fontSize: 14, color: '#3D2785',
          background: 'linear-gradient(135deg,rgba(255,255,255,0.82),rgba(255,255,255,0.66))',
          backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
          borderWidth: 1, borderStyle: 'solid',
          borderTopColor: 'rgba(255,255,255,0.9)', borderLeftColor: 'rgba(255,255,255,0.9)',
          borderRightColor: 'rgba(61,39,133,0.14)', borderBottomColor: 'rgba(61,39,133,0.14)',
          boxShadow: '0 6px 20px rgba(61,39,133,0.10)', animation: 'riseBlur .4s ease-out both'
        }}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#3D2785"
            strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 10c0 4.993-5.539 10.193-7.4 11.799a1 1 0 0 1-1.2 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          Track order
        </button>
      )}
      <InputBar value={input} onChange={setInput} onSubmit={onSubmit} docked={true}
        placeholder={loading ? 'Flow is working…' : 'Ask, refine, or tell me what changed…'} />
    </div>
  )
}

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
  const flowRef = useRef(null)

  // Auto-scroll flow area
  useEffect(() => {
    if (flowRef.current) {
      flowRef.current.scrollTo({ top: flowRef.current.scrollHeight, behavior: 'smooth' })
    }
  }, [messages, loading])

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

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: buildHistory(updatedMsgs),
          lang
        })
      })

      const data = await res.json()
      if (data.error) { addAgentMsg('Something went wrong. Please try again.', false); return }

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
          content: data.text, rawContent: data.rawText || data.text
        })
        return
      }

      // Plain agent message
      addAgentMsg(data.text || 'Let me know how I can help.', true)

    } catch (e) {
      addAgentMsg('Network error. Please try again.', false)
    } finally {
      setLoading(false)
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

  return (
    <div style={{
      position: 'relative', width: '100%', height: '100vh',
      overflow: 'hidden', background: '#FAF9FF', fontFamily: "'Inter',sans-serif",
      color: '#1A1433'
    }}>

      {/* Layer 0: Ambient depth scene */}
      <AmbientLayer />

      {/* Layer 3: Navigation */}
      <Header lang={lang} setLang={setLang}
        journeyActive={journeyActive} journeyDone={journeyDone} />

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
            onChoose={handleProductChosen}
            onAddRecipient={handleAddRecipient}
            onCreateOrder={handleCreateOrder}
            flowRef={flowRef} />

          {/* Layer 2: Docked input */}
          <DockedInputBar
            input={input} setInput={setInput}
            onSubmit={send} loading={loading}
            showTrackChip={showTrackChip}
            onTrack={handleTrack} />
        </>
      )}

      {/* Flow Presence widget — always visible */}
      <FlowPresence />
    </div>
  )
}