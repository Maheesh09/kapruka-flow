'use client'
import { useState, useEffect } from 'react'
import Icon from './Icon'
import PlanBoard from './PlanBoard'
import LockedCard from './LockedCard'

// ── Streaming text ─────────────────────────────────────────────────────────────
function StreamingText({ text }) {
    const words = text.split(' ')
    const [shown, setShown] = useState(0)
    useEffect(() => {
        if (shown >= words.length) return
        const t = setTimeout(() => setShown(s => s + 1), 52)
        return () => clearTimeout(t)
    }, [shown, words.length])
    const streaming = shown < words.length
    return (
        <span>
            {words.slice(0, shown).join(' ')}
            {streaming && (
                <span style={{
                    display: 'inline-block', width: 7, height: 18, background: '#3D2785',
                    marginLeft: 4, borderRadius: 2, transform: 'translateY(3px)',
                    animation: 'blink 1s step-end infinite'
                }} />
            )}
        </span>
    )
}

// ── Violet orb ─────────────────────────────────────────────────────────────────
function Orb({ big }) {
    const s = big ? 50 : 13
    return (
        <div style={{ position: 'relative', width: s, height: s, flexShrink: 0 }}>
            {big && (
                <div style={{
                    position: 'absolute', inset: 0, borderRadius: '50%',
                    border: '1.5px solid rgba(61,39,133,0.45)',
                    animation: 'ripple 2.6s ease-out infinite'
                }} />
            )}
            <div style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                background: 'radial-gradient(circle at 34% 30%, #a48fd9, #3D2785 72%)',
                boxShadow: '0 0 18px rgba(61,39,133,0.55)',
                animation: big ? 'orbPulse 2.6s ease-in-out infinite' : 'none'
            }} />
        </div>
    )
}

// ── User message ───────────────────────────────────────────────────────────────
function UserMessage({ text }) {
    return (
        <div style={{
            display: 'flex', justifyContent: 'flex-end', margin: '16px 0',
            animation: 'riseBlur .42s cubic-bezier(.2,.7,.2,1) both'
        }}>
            <div style={{
                maxWidth: '72%', textAlign: 'right', paddingRight: 16,
                borderRight: '2px solid rgba(61,39,133,0.5)', color: '#3D2785',
                fontSize: 17, lineHeight: 1.5, fontWeight: 500
            }}>
                {text}
            </div>
        </div>
    )
}

// ── Agent message ──────────────────────────────────────────────────────────────
function AgentMessage({ text, stream }) {
    return (
        <div style={{
            display: 'flex', gap: 13, alignItems: 'flex-start', margin: '16px 0',
            maxWidth: '94%', animation: 'riseBlur .42s cubic-bezier(.2,.7,.2,1) both'
        }}>
            <div style={{ paddingTop: 7 }}><Orb big={false} /></div>
            <div style={{
                flex: 1, background: 'linear-gradient(135deg,rgba(255,255,255,0.5),rgba(255,255,255,0.34))',
                backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
                borderRadius: 16, padding: '12px 18px',
                border: '1px solid rgba(255,255,255,0.6)', color: '#1A1433',
                fontSize: 17, lineHeight: 1.6, fontFamily: 'Inter'
            }}>
                {stream ? <StreamingText text={text} /> : text}
            </div>
        </div>
    )
}

// ── Thinking orb ──────────────────────────────────────────────────────────────
const THINKING_STATUSES = [
    'Searching the catalog…',
    'Checking delivery availability…',
    'Comparing options…',
    'Narrowing to three…',
    'Almost there…',
]

export function ThinkingOrb() {
    const [idx, setIdx] = useState(0)
    useEffect(() => {
        const id = setInterval(() => setIdx(i => (i + 1) % THINKING_STATUSES.length), 1100)
        return () => clearInterval(id)
    }, [])
    return (
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', margin: '18px 0' }}>
            <Orb big={true} />
            <div key={idx} style={{
                color: 'rgba(26,20,51,0.55)', fontSize: 17, fontWeight: 500,
                animation: 'fadeIn .35s ease-out'
            }}>
                {THINKING_STATUSES[idx]}
            </div>
        </div>
    )
}

// ── Product trio ───────────────────────────────────────────────────────────────
function ProductCard({ product, idx, onChoose }) {
    const [hovered, setHovered] = useState(false)
    const [tilt, setTilt] = useState({ x: 0, y: 0 })

    const onMove = e => {
        const r = e.currentTarget.getBoundingClientRect()
        setTilt({
            x: ((e.clientY - r.top) / r.height - 0.5) * -5,
            y: ((e.clientX - r.left) / r.width - 0.5) * 6
        })
    }
    const onLeave = () => { setHovered(false); setTilt({ x: 0, y: 0 }) }

    const inner = (
        <div onMouseMove={onMove} onMouseEnter={() => setHovered(true)} onMouseLeave={onLeave}
            onClick={() => onChoose(product)}
            className="trio-card"
            style={{
                background: 'linear-gradient(135deg,rgba(255,255,255,0.70),rgba(255,255,255,0.55))',
                backdropFilter: 'blur(20px) saturate(160%)', WebkitBackdropFilter: 'blur(20px) saturate(160%)',
                border: '1px solid rgba(255,255,255,0.9)',
                borderRightColor: 'rgba(61,39,133,0.12)', borderBottomColor: 'rgba(61,39,133,0.12)',
                borderRadius: 22, padding: 12, cursor: 'pointer',
                boxShadow: hovered ? '0 18px 44px rgba(61,39,133,0.18)' : '0 8px 30px rgba(61,39,133,0.10)',
                transform: hovered ? `perspective(820px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(-5px)` : 'none',
                transformStyle: 'preserve-3d', transition: 'box-shadow .3s, transform .15s ease-out',
                display: 'flex', flexDirection: 'column',
                animation: 'riseBlur .5s cubic-bezier(.2,.7,.2,1) both',
                animationDelay: `${idx * 0.09}s`
            }}>

            {/* Image */}
            <div style={{
                position: 'relative', height: product.pick ? 168 : 150,
                borderRadius: 15, overflow: 'hidden', background: 'rgba(61,39,133,0.08)',
                flexShrink: 0
            }}>
                {product.image_url
                    ? <img src={product.image_url} alt={product.name}
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={e => { e.currentTarget.style.display = 'none' }} />
                    : <div style={{
                        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', background: 'linear-gradient(135deg,#E9E4FF,#C8BFEF)'
                    }}>
                        <Icon name="gift" size={40} color="rgba(61,39,133,0.3)" />
                    </div>
                }
                {/* Shimmer */}
                <div style={{
                    position: 'absolute', top: 0, bottom: 0, width: '45%',
                    background: 'linear-gradient(100deg,rgba(255,255,255,0) 0%,rgba(255,255,255,0.55) 50%,rgba(255,255,255,0) 100%)',
                    transform: hovered ? 'translateX(260%) skewX(-18deg)' : 'translateX(-160%) skewX(-18deg)',
                    transition: hovered ? 'transform .75s ease' : 'none', pointerEvents: 'none'
                }} />
            </div>

            {/* Flow's pick tag */}
            {product.pick && (
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5, alignSelf: 'flex-start',
                    marginTop: 10, padding: '4px 10px', borderRadius: 999,
                    background: 'linear-gradient(135deg,rgba(245,200,0,0.16),rgba(245,200,0,0.08))',
                    border: '1px solid rgba(245,200,0,0.4)', color: '#8a6d00', fontSize: 11.5, fontWeight: 700
                }}>
                    <Icon name="compass" size={13} color="#b08900" /> Flow's pick
                </div>
            )}

            {/* Name + price */}
            <div style={{ marginTop: product.pick ? 8 : 12, flex: 1 }}>
                <div style={{
                    fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600,
                    fontSize: 15, color: '#1A1433', lineHeight: 1.25
                }}>
                    {product.name}
                </div>
                <div style={{
                    marginTop: 4, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600,
                    fontSize: 14, color: '#3D2785', fontVariantNumeric: 'tabular-nums'
                }}>
                    LKR {Number(product.price).toLocaleString()}
                </div>
                <div style={{ marginTop: 6, fontSize: 13, lineHeight: 1.45, color: 'rgba(26,20,51,0.55)' }}>
                    {product.reason}
                </div>
            </div>

            {/* Choose button */}
            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '8px 12px', borderRadius: 999, transition: 'all .25s',
                    background: hovered ? 'linear-gradient(135deg,#5A3FB0,#3D2785)' : 'rgba(61,39,133,0.10)',
                    boxShadow: hovered ? '0 6px 16px rgba(61,39,133,0.4)' : 'none'
                }}>
                    {hovered && <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>Choose</span>}
                    <Icon name="arrow-right" size={17} color={hovered ? '#fff' : '#3D2785'} stroke={2} />
                </div>
            </div>
        </div>
    )

    return product.pick
        ? <div key={product.product_id} style={{
            borderRadius: 24, padding: 1.5,
            background: 'linear-gradient(135deg,#FFE08A,#F5C800,#FFE08A)'
        }}>{inner}</div>
        : inner
}

function ProductTrio({ trio, onChoose }) {
    return (
        <div style={{ margin: '8px 0 6px' }}>
            {trio.context && (
                <div style={{ display: 'flex', gap: 13, alignItems: 'flex-start', marginBottom: 14 }}>
                    <div style={{ paddingTop: 4 }}><Orb big={false} /></div>
                    <div style={{
                        fontSize: 16, color: '#1A1433', lineHeight: 1.55,
                        background: 'linear-gradient(135deg,rgba(255,255,255,0.5),rgba(255,255,255,0.34))',
                        backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
                        borderRadius: 16, padding: '10px 16px', border: '1px solid rgba(255,255,255,0.6)'
                    }}>
                        {trio.context}
                    </div>
                </div>
            )}
            <div className="trio-grid" style={{
                display: 'grid', gridTemplateColumns: '1fr 1.1fr 1fr',
                gap: 16, alignItems: 'center'
            }}>
                {trio.products.map((p, i) => (
                    <ProductCard key={p.product_id || i} product={p} idx={i} onChoose={onChoose} />
                ))}
            </div>
        </div>
    )
}

// ── Flow area ──────────────────────────────────────────────────────────────────
export default function FlowArea({ messages, loading, onChoose, onAddRecipient, onCreateOrder, flowRef }) {
    return (
        <div ref={flowRef} className="flow-area">
            <div className="flow-inner">
                {messages.map((m, i) => {
                    if (m.role === 'user') return <UserMessage key={i} text={m.content} />

                    switch (m.msgType) {
                        case 'agent':
                            return <AgentMessage key={i} text={m.content} stream={m.stream} />
                        case 'product_trio':
                            return <ProductTrio key={i} trio={m.trio} onChoose={onChoose} />
                        case 'plan_board':
                            return (
                                <PlanBoard key={i} plan={m.plan}
                                    onAddRecipient={() => onAddRecipient(m.plan)}
                                    onCreateOrder={() => onCreateOrder(m.plan)} />
                            )
                        case 'checkout':
                            return <LockedCard key={i}
                                url={m.checkoutData?.url}
                                orderRef={m.checkoutData?.ref}
                                expiresAt={m.checkoutData?.expiresAt} />
                        default:
                            return null
                    }
                })}
                {loading && <ThinkingOrb />}
            </div>
        </div>
    )
}