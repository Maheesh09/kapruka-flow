'use client'
import { t } from '../i18n'
import { useState, useEffect, useRef } from 'react'
import Icon from './Icon'
import PlanBoard from './PlanBoard'
import LockedCard from './LockedCard'

// ── Kapruka Smile Animation ────────────────────────────────────────────────────
function KaprukaSmiley({ thinking }) {
    return (
        <div className="mobile-bot-avatar-wrapper" style={{
            position: 'relative', width: 52, height: 52, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            {/* Outer ripple rings */}
            {thinking && (
                <>
                    <div style={{
                        position: 'absolute', inset: 0, borderRadius: '50%',
                        border: '1.5px solid rgba(61,39,133,0.35)',
                        animation: 'ripple 2.4s ease-out infinite'
                    }} />
                    <div style={{
                        position: 'absolute', inset: 0, borderRadius: '50%',
                        border: '1.5px solid rgba(61,39,133,0.20)',
                        animation: 'ripple 2.4s ease-out infinite',
                        animationDelay: '0.8s'
                    }} />
                </>
            )}
            {/* Orb background */}
            <div className="mobile-bot-avatar-orb" style={{
                width: 44, height: 44, borderRadius: '50%',
                background: 'radial-gradient(circle at 34% 30%, #8a72d0, #3D2785 72%)',
                boxShadow: thinking
                    ? '0 0 20px rgba(61,39,133,0.65), 0 0 40px rgba(61,39,133,0.2)'
                    : '0 0 14px rgba(61,39,133,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: thinking ? 'orbPulse 2.4s ease-in-out infinite' : 'none',
                transition: 'box-shadow .5s'
            }}>
                {/* Kapruka smile arc — draw-in animation */}
                <svg width="24" height="15" viewBox="0 0 24 15" fill="none" style={{ marginTop: 5 }}>
                    <path
                        d="M3.5 2.5 A 8.5 8.5 0 0 0 20.5 2.5"
                        stroke="#F5C800"
                        strokeWidth="4.2"
                        strokeLinecap="round"
                        fill="none"
                        style={{
                            strokeDasharray: 28,
                            strokeDashoffset: 0,
                            animation: thinking ? 'smileDraw 1.8s ease-in-out infinite' : 'none'
                        }}
                    />
                </svg>
            </div>
        </div>
    )
}

// ── Flow Thinking Checklist ────────────────────────────────────────────────────
export function FlowThinking({ events = [] }) {
    const hasReal = events.length > 0
    const [phase, setPhase] = useState(0) // cycling through status messages
    const statusMessages = [
        'Flow is figuring things out…',
        'Searching the catalog…',
        'Checking delivery options…',
        'Comparing choices for you…',
    ]
    const [statusIdx, setStatusIdx] = useState(0)

    useEffect(() => {
        // Cycle the status message while waiting (only matters before real events arrive)
        const statusInterval = setInterval(() => {
            setStatusIdx(s => (s + 1) % statusMessages.length)
        }, 1800)
        return () => clearInterval(statusInterval)
    }, [])

    return (
        <div style={{
            display: 'flex', gap: 16, alignItems: 'flex-start', margin: '18px 0',
            animation: 'riseBlur .42s cubic-bezier(.2,.7,.2,1) both'
        }}>
            <KaprukaSmiley thinking={true} />

            <div className="thinking-card" style={{
                background: 'linear-gradient(135deg,rgba(255,255,255,0.62),rgba(255,255,255,0.44))',
                backdropFilter: 'blur(22px) saturate(180%)',
                WebkitBackdropFilter: 'blur(22px) saturate(180%)',
                borderRadius: 20, padding: '16px 20px',
                border: '1px solid rgba(255,255,255,0.8)',
                boxShadow: '0 8px 28px rgba(61,39,133,0.12)',
                minWidth: 240, maxWidth: '100%'
            }}>
                {/* Status line */}
                <div key={hasReal ? 'real' : statusIdx} className="status-line" style={{
                    fontSize: 15, fontWeight: 600, color: '#3D2785',
                    fontFamily: "'Space Grotesk',sans-serif",
                    marginBottom: 14, animation: 'fadeIn .35s ease-out'
                }}>
                    {hasReal ? 'Flow is on it…' : statusMessages[statusIdx]}
                </div>

                {/* Real tool activity — streamed live from the agent */}
                {hasReal && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                        {events.map((ev, i) => {
                            const isLast = i === events.length - 1
                            return (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'center', gap: 10,
                                    animation: 'lineSlide .35s ease-out both'
                                }}>
                                    <div style={{
                                        width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: isLast
                                            ? 'rgba(61,39,133,0.10)'
                                            : 'linear-gradient(135deg,#FFE08A,#F5C800)',
                                        border: isLast ? '1.5px dashed rgba(61,39,133,0.35)' : 'none',
                                        boxShadow: isLast ? 'none' : '0 2px 8px rgba(245,200,0,0.4)',
                                        animation: isLast ? 'agentPulse 1.6s ease-in-out infinite' : 'tickPop .4s cubic-bezier(.2,.7,.2,1) both'
                                    }}>
                                        {!isLast && (
                                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                                <path d="M1 4L3.5 6.5L9 1" stroke="#3D2785" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        )}
                                        {isLast && <Icon name={ev.icon || 'sparkles'} size={11} color="#3D2785" />}
                                    </div>
                                    <div style={{
                                        fontSize: 14, fontWeight: isLast ? 600 : 500,
                                        color: isLast ? '#1A1433' : 'rgba(26,20,51,0.6)',
                                        fontFamily: 'Inter'
                                    }}>
                                        {ev.label}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* Before any tool runs: a simple, honest 'thinking' indicator —
                    no fabricated checklist of things Flow hasn't actually checked */}
                {!hasReal && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 2 }}>
                        {[0, 1, 2].map(i => (
                            <span key={i} style={{
                                width: 7, height: 7, borderRadius: '50%',
                                background: 'linear-gradient(135deg,#8a72d0,#3D2785)',
                                animation: `thinkingDot 1.2s ease-in-out ${i * 0.18}s infinite`
                            }} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

// ── Lightweight formatter: **bold** + bullet lines, nothing else ──────────────
function renderInline(text, keyPrefix) {
    const parts = text.split(/(\*\*[^*]+\*\*)/g)
    return parts.map((p, i) =>
        p.startsWith('**') && p.endsWith('**')
            ? <strong key={`${keyPrefix}-${i}`} style={{ fontWeight: 600, color: '#3D2785' }}>
                {p.slice(2, -2)}
            </strong>
            : p
    )
}

function FormattedText({ text }) {
    // Rescue inline bullets the model sometimes emits ("... provide: * **Name** * **Phone**")
    const norm = text
        .replace(/:\s*\*\s+/g, ':\n* ')          // bullet glued after a colon
        .replace(/\*\*\s+\*\s+(?=\*\*)/g, '**\n* ') // bullet glued between bold items
    const lines = norm.split('\n')
    return (
        <div>
            {lines.map((line, i) => {
                const t = line.trim()
                const isBullet = t.startsWith('* ') || t.startsWith('- ') || t.startsWith('• ')
                if (isBullet) {
                    return (
                        <div key={i} style={{ display: 'flex', gap: 9, padding: '3px 0 3px 4px', alignItems: 'baseline' }}>
                            <span style={{ color: '#F5C800', fontWeight: 700, flexShrink: 0 }}>•</span>
                            <span>{renderInline(t.slice(2), i)}</span>
                        </div>
                    )
                }
                if (!t) return <div key={i} style={{ height: 8 }} />
                return <div key={i}>{renderInline(line, i)}</div>
            })}
        </div>
    )
}

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
            <FormattedText text={words.slice(0, shown).join(' ')} />
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

// ── User message ───────────────────────────────────────────────────────────────
function UserMessage({ text }) {
    return (
        <div style={{
            display: 'flex', justifyContent: 'flex-end', margin: '16px 0',
            animation: 'riseBlur .42s cubic-bezier(.2,.7,.2,1) both'
        }}>
            <div className="user-msg" style={{
                maxWidth: '72%', textAlign: 'right', paddingRight: 16,
                borderRight: '2px solid rgba(61,39,133,0.45)', color: '#3D2785',
                fontSize: 17, lineHeight: 1.55, fontWeight: 500
            }}>
                {text}
            </div>
        </div>
    )
}

// ── Agent message ──────────────────────────────────────────────────────────────
function AgentMessage({ text, stream, chips, onChip }) {
    return (
        <div className="agent-row" style={{
            display: 'flex', gap: 14, alignItems: 'flex-start', margin: '16px 0',
            maxWidth: '94%', animation: 'riseBlur .42s cubic-bezier(.2,.7,.2,1) both'
        }}>
            {/* Small orb */}
            <div style={{ paddingTop: 8, flexShrink: 0 }}>
                <KaprukaSmiley thinking={false} />
            </div>
            <div className="mobile-chat-bubble" style={{
                flex: 1,
                background: 'linear-gradient(135deg,rgba(255,255,255,0.62),rgba(255,255,255,0.44))',
                backdropFilter: 'blur(22px) saturate(180%)',
                WebkitBackdropFilter: 'blur(22px) saturate(180%)',
                borderRadius: 20, padding: '14px 20px',
                borderWidth: 1, borderStyle: 'solid',
                borderTopColor: 'rgba(255,255,255,0.85)', borderLeftColor: 'rgba(255,255,255,0.85)',
                borderRightColor: 'rgba(61,39,133,0.12)', borderBottomColor: 'rgba(61,39,133,0.12)',
                boxShadow: '0 8px 28px rgba(61,39,133,0.09)',
                color: '#1A1433', fontSize: 17, lineHeight: 1.65, fontFamily: 'Inter'
            }}>
                {stream ? <StreamingText text={text} /> : text}
                {chips?.length > 0 && (
                    <div style={{
                        display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12,
                        animation: 'fadeIn .4s .3s ease-out both'
                    }}>
                        {chips.map((c, i) => (
                            <button key={i} onClick={() => onChip?.(c)} style={{
                                padding: '8px 15px', borderRadius: 999, cursor: 'pointer',
                                fontFamily: "'Inter','Noto Sans Sinhala',sans-serif",
                                fontSize: 13.5, fontWeight: 600, color: '#3D2785',
                                background: 'rgba(61,39,133,0.07)',
                                border: '1px solid rgba(61,39,133,0.22)',
                                transition: 'all .2s',
                                animation: `riseBlur .4s ${0.35 + i * 0.06}s ease-out both`
                            }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg,#FFE08A,#F5C800)'; e.currentTarget.style.borderColor = 'transparent' }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(61,39,133,0.07)'; e.currentTarget.style.borderColor = 'rgba(61,39,133,0.22)' }}
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

// ── Product trio ───────────────────────────────────────────────────────────────
function ProductCard({ product, idx, onChoose }) {
    const [hovered, setHovered] = useState(false)
    const [imgErr, setImgErr] = useState(false)
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
                background: hovered
                    ? 'linear-gradient(135deg,rgba(255,255,255,0.82),rgba(255,255,255,0.68))'
                    : 'linear-gradient(135deg,rgba(255,255,255,0.65),rgba(255,255,255,0.50))',
                backdropFilter: 'blur(22px) saturate(180%)', WebkitBackdropFilter: 'blur(22px) saturate(180%)',
                borderWidth: 1, borderStyle: 'solid',
                borderTopColor: hovered ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.8)',
                borderLeftColor: hovered ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.8)',
                borderRightColor: 'rgba(61,39,133,0.12)', borderBottomColor: 'rgba(61,39,133,0.12)',
                borderRadius: 22, padding: 12, cursor: 'pointer',
                boxShadow: hovered ? '0 20px 48px rgba(61,39,133,0.20)' : '0 8px 30px rgba(61,39,133,0.09)',
                transform: hovered ? `perspective(820px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(-6px)` : 'none',
                transformStyle: 'preserve-3d', transition: 'box-shadow .3s, border-color .3s, background .3s',
                transitionProperty: 'box-shadow, border-color, background',
                display: 'flex', flexDirection: 'column',
                animation: 'riseBlur .5s cubic-bezier(.2,.7,.2,1) both',
                animationDelay: `${idx * 0.09}s`,
                overflow: 'hidden', position: 'relative'
            }}>

            {/* Shimmer */}
            <div style={{
                position: 'absolute', top: 0, bottom: 0, width: '45%',
                background: 'linear-gradient(100deg,rgba(255,255,255,0) 0%,rgba(255,255,255,0.55) 50%,rgba(255,255,255,0) 100%)',
                transform: hovered ? 'translateX(260%) skewX(-18deg)' : 'translateX(-160%) skewX(-18deg)',
                transition: hovered ? 'transform .75s ease' : 'none', pointerEvents: 'none'
            }} />

            {/* Image */}
            <div className="trio-img" style={{
                position: 'relative', height: product.pick ? 168 : 150,
                borderRadius: 15, overflow: 'hidden', background: 'rgba(61,39,133,0.08)', flexShrink: 0
            }}>
                {(product.image_url && !imgErr)
                    ? <img src={product.image_url} alt={product.name}
                        referrerPolicy="no-referrer"
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={() => setImgErr(true)} />
                    : <div style={{
                        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', background: 'linear-gradient(135deg,#E9E4FF,#C8BFEF)'
                    }}>
                        <Icon name="gift" size={40} color="rgba(61,39,133,0.3)" />
                    </div>
                }
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
                <div className="choose-pill" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '8px 12px', borderRadius: 999, transition: 'all .25s',
                    background: hovered ? 'linear-gradient(135deg,#5A3FB0,#3D2785)' : 'rgba(61,39,133,0.10)',
                    boxShadow: hovered ? '0 6px 16px rgba(61,39,133,0.4)' : 'none'
                }}>
                    <span className="choose-label" style={{
                        fontSize: 13, fontWeight: 600, color: '#fff',
                        display: hovered ? 'inline' : 'none'
                    }}>Choose</span>
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
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 14 }}>
                    <div style={{ paddingTop: 4, flexShrink: 0 }}>
                        <KaprukaSmiley thinking={false} />
                    </div>
                    <div style={{
                        fontSize: 16, color: '#1A1433', lineHeight: 1.55,
                        background: 'linear-gradient(135deg,rgba(255,255,255,0.62),rgba(255,255,255,0.44))',
                        backdropFilter: 'blur(22px)', WebkitBackdropFilter: 'blur(22px)',
                        borderRadius: 20, padding: '12px 18px', border: '1px solid rgba(255,255,255,0.85)'
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
export default function FlowArea({ messages = [], loading, liveStatus = [], lang = 'EN', onChoose, onAddRecipient, onCreateOrder, onAddItem, onEditGift, onChip, flowRef }) {
    return (
        <div ref={flowRef} className="flow-area">
            <div className="flow-inner">
                {messages.map((m, i) => {
                    if (m.role === 'user') return <UserMessage key={i} text={m.content} />

                    switch (m.msgType) {
                        case 'agent':
                            return <AgentMessage key={i} text={m.content} stream={m.stream} chips={m.chips} onChip={onChip} />
                        case 'product_trio':
                            return <ProductTrio key={i} trio={m.trio} onChoose={onChoose} />
                        case 'plan_board':
                            return (
                                <PlanBoard key={i} plan={m.plan} lang={lang}
                                    onAddRecipient={() => onAddRecipient(m.plan)}
                                    onCreateOrder={() => onCreateOrder(m.plan)}
                                    onAddItem={onAddItem}
                                    onEditGift={onEditGift} />
                            )
                        case 'checkout':
                            return <LockedCard key={i}
                                url={m.checkoutData?.url}
                                orderRef={m.checkoutData?.ref}
                                expiresAt={m.checkoutData?.expiresAt}
                                plan={m.plan} lang={lang}
                                onComplete={onComplete} />
                        default:
                            return null
                    }
                })}
                {loading && <FlowThinking events={liveStatus} />}
            </div>
        </div>
    )
}