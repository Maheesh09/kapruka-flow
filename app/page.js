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

// ── Ambient blobs ──────────────────────────────────────────────────────────────
function AmbientLayer() {
  return (
    <div aria-hidden="true" style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
      pointerEvents: 'none', zIndex: 0
    }}>
      <div className="kf-blob drift-a" style={{
        width: '52vw', height: '52vw',
        left: '-12vw', top: '-14vh',
        background: 'radial-gradient(circle at 40% 40%, #E9E4FF, rgba(233,228,255,0))'
      }} />
      <div className="kf-blob drift-b" style={{
        width: '46vw', height: '46vw',
        right: '-10vw', top: '-8vh',
        background: 'radial-gradient(circle at 50% 50%, #FFF7E0, rgba(255,247,224,0))'
      }} />
      <div className="kf-blob drift-c" style={{
        width: '48vw', height: '48vw',
        right: '2vw', bottom: '-18vh',
        background: 'radial-gradient(circle at 50% 50%, #FFE9F3, rgba(255,233,243,0))'
      }} />
      <div className="kf-blob drift-a" style={{
        width: '40vw', height: '40vw',
        left: '6vw', bottom: '-16vh', animationDuration: '48s',
        background: 'radial-gradient(circle at 50% 50%, #E9E4FF, rgba(233,228,255,0))'
      }} />
      {/* Grain */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1, opacity: 0.04,
        mixBlendMode: 'soft-light', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`
      }} />
      {/* Center glow */}
      <div style={{
        position: 'absolute', left: '50%', top: '42%',
        transform: 'translate(-50%,-50%)', width: 760, height: 760, maxWidth: '90vw',
        borderRadius: '50%', background: 'radial-gradient(circle,rgba(255,255,255,0.7) 0%,rgba(255,255,255,0) 68%)',
        zIndex: 2, pointerEvents: 'none'
      }} />
    </div>
  )
}

// ── Docked input bar (flow state) ─────────────────────────────────────────────
function DockedInputBar({ input, setInput, onSubmit, loading, showTrackChip, onTrack }) {
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 30,
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
      padding: '14px 20px 24px',
      background: 'linear-gradient(to top, rgba(250,249,255,0.9) 40%, rgba(250,249,255,0))'
    }}>
      {showTrackChip && (
        <button onClick={onTrack} style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '9px 18px', borderRadius: 999, cursor: 'pointer', fontFamily: 'Inter',
          fontWeight: 600, fontSize: 14, color: '#3D2785',
          background: 'linear-gradient(135deg,rgba(255,255,255,0.78),rgba(255,255,255,0.6))',
          backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
          border: '1px solid rgba(255,255,255,0.9)', borderRightColor: 'rgba(61,39,133,0.14)',
          borderBottomColor: 'rgba(61,39,133,0.14)',
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
        placeholder={loading ? 'Navigator is working…' : 'Ask, refine, or tell me what changed…'} />
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

      <AmbientLayer />

      <Header lang={lang} setLang={setLang}
        journeyActive={journeyActive} journeyDone={journeyDone} />

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
          <DockedInputBar
            input={input} setInput={setInput}
            onSubmit={send} loading={loading}
            showTrackChip={showTrackChip}
            onTrack={handleTrack} />
        </>
      )}
    </div>
  )
}