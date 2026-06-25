'use client'
import { t, fmt } from '../i18n'
import { useState, useEffect, useRef } from 'react'
import Icon from './Icon'
import PlanBoard from './PlanBoard'
import LockedCard from './LockedCard'
import TrackingCard from './TrackingCard'

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

// ── Live status → localized label ─────────────────────────────────────────────
function localizeStatus(ev, lang) {
    if (!ev?.key) return ev?.label || ''
    const p = ev.params || {}
    switch (ev.key) {
        case 'search': {
            let s = fmt(t(lang, 'statusSearch'), p)
            if (p.category) s += fmt(t(lang, 'statusInCategory'), p)
            if (p.price) s += fmt(t(lang, 'statusUnderPrice'), p)
            return s
        }
        case 'getProduct': return t(lang, 'statusGetProduct')
        case 'categories': return t(lang, 'statusCategories')
        case 'cities': return fmt(t(lang, 'statusCities'), p)
        case 'checkDelivery': {
            let s = fmt(t(lang, 'statusCheckDelivery'), p)
            if (p.date) s += fmt(t(lang, 'statusOnDate'), p)
            return s
        }
        case 'createOrder': return t(lang, 'statusCreateOrder')
        case 'track': return fmt(t(lang, 'statusTrack'), p)
        case 'statusAssembling': return t(lang, 'statusAssembling')
        default: return ev.label || t(lang, 'statusWorking')
    }
}

// ── Flow Thinking Checklist ────────────────────────────────────────────────────
export function FlowThinking({ events = [], lang = 'EN' }) {
    const hasReal = events.length > 0
    const statusMessages = t(lang, 'thinkingMessages') || []
    const [statusIdx, setStatusIdx] = useState(0)

    useEffect(() => {
        // Cycle the status message while waiting (only matters before real events arrive)
        const statusInterval = setInterval(() => {
            setStatusIdx(s => (s + 1) % (statusMessages.length || 1))
        }, 1800)
        return () => clearInterval(statusInterval)
    }, [statusMessages.length])

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
                    {hasReal ? t(lang, 'flowOnIt') : (statusMessages[statusIdx] || '')}
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
                                        {localizeStatus(ev, lang)}
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
                {stream ? <StreamingText text={text} /> : <FormattedText text={text} />}
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

// ── Product detail / quick-view modal ─────────────────────────────────────────
// Opens when a customer wants a closer look before committing. Shows everything
// the trio payload carries (untruncated name + reason, big image, price, stock,
// optional blurb) plus a link out to the full Kapruka product page. Choosing here
// is the same commit as the card's Choose pill.
function ProductDetail({ product, lang = 'EN', onClose, onChoose }) {
    const [imgErr, setImgErr] = useState(false)

    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') onClose() }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [onClose])

    const stockLow = product.stock === 'low'
    const stockLabel = stockLow ? t(lang, 'lowStock') : (product.stock ? t(lang, 'inStock') : null)

    return (
        <div onClick={onClose} style={{
            position: 'fixed', inset: 0, zIndex: 95,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 20, background: 'rgba(26,20,51,0.46)',
            backdropFilter: 'blur(7px)', WebkitBackdropFilter: 'blur(7px)',
            animation: 'fadeIn .22s ease-out'
        }}>
            <div onClick={e => e.stopPropagation()} role="dialog" aria-modal="true"
                className="detail-modal" style={{
                    width: 'min(440px, 94vw)', maxHeight: '88vh', overflowY: 'auto',
                    borderRadius: 24,
                    background: 'linear-gradient(160deg,rgba(255,255,255,0.97),rgba(255,255,255,0.92))',
                    border: '1px solid rgba(255,255,255,0.9)',
                    boxShadow: '0 28px 70px rgba(26,20,51,0.34)',
                    animation: 'scaleIn .28s cubic-bezier(.2,.7,.2,1) both', color: '#1A1433'
                }}>

                {/* Image header */}
                <div style={{
                    position: 'relative', height: 'clamp(170px, 44vw, 224px)',
                    background: 'rgba(61,39,133,0.08)', overflow: 'hidden',
                    borderTopLeftRadius: 24, borderTopRightRadius: 24
                }}>
                    {(product.image_url && !imgErr)
                        ? <img src={product.image_url} alt={product.name} referrerPolicy="no-referrer"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={() => setImgErr(true)} />
                        : <div style={{
                            width: '100%', height: '100%', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', background: 'linear-gradient(135deg,#E9E4FF,#C8BFEF)'
                        }}><Icon name="gift" size={48} color="rgba(61,39,133,0.3)" /></div>}

                    {product.pick && (
                        <div style={{
                            position: 'absolute', top: 12, left: 12,
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            padding: '4px 11px', borderRadius: 999,
                            background: 'linear-gradient(135deg,#FFE08A,#F5C800)',
                            color: '#3D2785', fontSize: 12, fontWeight: 700,
                            boxShadow: '0 3px 10px rgba(245,200,0,0.45)'
                        }}>
                            <Icon name="compass" size={13} color="#3D2785" /> {t(lang, 'flowPick')}
                        </div>
                    )}

                    {/* Close */}
                    <button onClick={onClose} aria-label={t(lang, 'closeAria')} style={{
                        position: 'absolute', top: 10, right: 10, width: 34, height: 34, borderRadius: '50%',
                        border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(26,20,51,0.5)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)'
                    }}>
                        <Icon name="x" size={17} color="#fff" stroke={2.2} />
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: '18px 20px 20px' }}>
                    <div style={{
                        fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700,
                        fontSize: 19, lineHeight: 1.25
                    }}>
                        {product.name}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
                        <span style={{
                            fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700,
                            fontSize: 20, color: '#3D2785', fontVariantNumeric: 'tabular-nums'
                        }}>
                            LKR {Number(product.price).toLocaleString()}
                        </span>
                        {stockLabel && (
                            <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: 5,
                                padding: '4px 11px', borderRadius: 999, fontSize: 12.5, fontWeight: 600,
                                background: stockLow ? 'rgba(245,158,11,0.14)' : 'rgba(14,159,110,0.12)',
                                color: stockLow ? '#B45309' : '#0E9F6E'
                            }}>
                                <span style={{
                                    width: 7, height: 7, borderRadius: '50%',
                                    background: stockLow ? '#F59E0B' : '#0E9F6E'
                                }} />
                                {stockLabel}
                            </span>
                        )}
                    </div>

                    {/* Flow's take — the opinionated reasoning */}
                    {product.reason && (
                        <div style={{
                            marginTop: 16, padding: '13px 15px', borderRadius: 14,
                            background: 'rgba(107,82,200,0.07)', border: '1px solid rgba(107,82,200,0.16)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
                                <div style={{
                                    width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                                    background: 'radial-gradient(circle at 34% 30%, #8a72d0, #3D2785 72%)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <Icon name="sparkles" size={11} color="#F5C800" />
                                </div>
                                <span style={{
                                    fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700,
                                    fontSize: 13, color: '#3D2785'
                                }}>
                                    {t(lang, 'flowTake')}
                                </span>
                            </div>
                            <div style={{ fontSize: 14, lineHeight: 1.5, color: 'rgba(26,20,51,0.78)' }}>
                                {product.reason}
                            </div>
                        </div>
                    )}

                    {/* About this item — factual blurb (only if the agent had real data) */}
                    {product.blurb && (
                        <div style={{ marginTop: 14 }}>
                            <div style={{
                                fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700,
                                fontSize: 13, color: '#1A1433', marginBottom: 5
                            }}>
                                {t(lang, 'aboutItem')}
                            </div>
                            <div style={{ fontSize: 13.5, lineHeight: 1.55, color: 'rgba(26,20,51,0.62)' }}>
                                {product.blurb}
                            </div>
                        </div>
                    )}

                    {/* Out to the real Kapruka page for the exhaustive detail */}
                    {product.url && (
                        <a href={product.url} target="_blank" rel="noopener noreferrer" style={{
                            display: 'inline-flex', alignItems: 'center', gap: 7, marginTop: 14,
                            fontSize: 13.5, fontWeight: 600, color: '#3D2785'
                        }}>
                            {t(lang, 'viewOnKapruka')}
                            <Icon name="external-link" size={14} color="#3D2785" stroke={2} />
                        </a>
                    )}

                    {/* CTAs */}
                    <button onClick={() => onChoose(product)} style={{
                        marginTop: 18, width: '100%', padding: '13px 16px', borderRadius: 14,
                        border: 'none', cursor: 'pointer',
                        fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 15, color: '#3D2785',
                        background: 'linear-gradient(135deg,#FFE08A,#F5C800)',
                        boxShadow: '0 10px 26px rgba(245,200,0,0.4)'
                    }}>
                        {t(lang, 'chooseThis')}
                    </button>
                    <button onClick={onClose} style={{
                        marginTop: 10, width: '100%', padding: '11px 16px', borderRadius: 14, cursor: 'pointer',
                        background: 'transparent', border: '1px solid rgba(61,39,133,0.22)',
                        fontFamily: 'Inter', fontWeight: 600, fontSize: 14, color: '#3D2785'
                    }}>
                        {t(lang, 'backToOptions')}
                    </button>
                </div>
            </div>
        </div>
    )
}

// ── Product card (compact, uniform — lives on a horizontal rail) ───────────────
// Tapping the card opens the detail view (a closer look before committing).
// The Choose pill is the direct commit. The ⓘ badge makes "more details" obvious.
function ProductCard({ product, idx, onChoose, onDetails, lang = 'EN' }) {
    const [hovered, setHovered] = useState(false)
    const [imgErr, setImgErr] = useState(false)

    const inner = (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={() => onDetails(product)}
            className="rail-card"
            style={{
                background: hovered
                    ? 'linear-gradient(135deg,rgba(255,255,255,0.84),rgba(255,255,255,0.70))'
                    : 'linear-gradient(135deg,rgba(255,255,255,0.66),rgba(255,255,255,0.50))',
                backdropFilter: 'blur(22px) saturate(180%)', WebkitBackdropFilter: 'blur(22px) saturate(180%)',
                borderWidth: 1, borderStyle: 'solid',
                borderTopColor: hovered ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.8)',
                borderLeftColor: hovered ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.8)',
                borderRightColor: 'rgba(61,39,133,0.12)', borderBottomColor: 'rgba(61,39,133,0.12)',
                boxShadow: hovered ? '0 18px 40px rgba(61,39,133,0.20)' : '0 6px 22px rgba(61,39,133,0.09)',
                transform: hovered ? 'translateY(-5px)' : 'translateY(0)',
                transition: 'transform .25s ease, box-shadow .3s, background .3s, border-color .3s',
                animation: 'riseBlur .5s cubic-bezier(.2,.7,.2,1) both',
                animationDelay: `${idx * 0.07}s`
            }}>

            {/* Shimmer on hover */}
            <div style={{
                position: 'absolute', top: 0, bottom: 0, width: '45%', zIndex: 2,
                background: 'linear-gradient(100deg,rgba(255,255,255,0) 0%,rgba(255,255,255,0.5) 50%,rgba(255,255,255,0) 100%)',
                transform: hovered ? 'translateX(280%) skewX(-18deg)' : 'translateX(-170%) skewX(-18deg)',
                transition: hovered ? 'transform .75s ease' : 'none', pointerEvents: 'none'
            }} />

            {/* Image */}
            <div className="rail-img">
                {(product.image_url && !imgErr)
                    ? <img src={product.image_url} alt={product.name}
                        referrerPolicy="no-referrer"
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={() => setImgErr(true)} />
                    : <div style={{
                        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', background: 'linear-gradient(135deg,#E9E4FF,#C8BFEF)'
                    }}>
                        <Icon name="gift" size={34} color="rgba(61,39,133,0.3)" />
                    </div>
                }

                {/* Flow's pick ribbon — overlaid so every card keeps the same height */}
                {product.pick && (
                    <div style={{
                        position: 'absolute', top: 8, left: 8, zIndex: 3,
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        padding: '3px 9px', borderRadius: 999,
                        background: 'linear-gradient(135deg,#FFE08A,#F5C800)',
                        color: '#3D2785', fontSize: 11, fontWeight: 700,
                        boxShadow: '0 3px 10px rgba(245,200,0,0.45)'
                    }}>
                        <Icon name="compass" size={12} color="#3D2785" /> {t(lang, 'flowPick')}
                    </div>
                )}

                {/* Quick-view (details) badge */}
                <button
                    onClick={(e) => { e.stopPropagation(); onDetails(product) }}
                    aria-label={t(lang, 'detailsAria')} title={t(lang, 'detailsBtn')}
                    style={{
                        position: 'absolute', top: 8, right: 8, zIndex: 3,
                        width: 28, height: 28, borderRadius: '50%', border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(26,20,51,0.42)',
                        backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
                        boxShadow: '0 2px 8px rgba(26,20,51,0.22)'
                    }}>
                    <Icon name="info" size={15} color="#fff" stroke={2} />
                </button>
            </div>

            {/* Name + price + reason */}
            <div style={{ marginTop: 10, flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <div className="rail-name">{product.name}</div>
                <div className="rail-price">LKR {Number(product.price).toLocaleString()}</div>
                <div className="rail-reason">{product.reason}</div>
            </div>

            {/* Actions: Details (explicit, discoverable) + Choose (commit) */}
            <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <button
                    onClick={(e) => { e.stopPropagation(); onDetails(product) }}
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        background: 'none', border: 'none', cursor: 'pointer', padding: '4px 2px',
                        fontFamily: 'Inter', fontSize: 12.5, fontWeight: 600, color: '#6B52C8',
                        flexShrink: 0
                    }}>
                    <Icon name="info" size={13} color="#6B52C8" stroke={2} /> {t(lang, 'detailsBtn')}
                </button>

                <div className="choose-pill"
                    onClick={(e) => { e.stopPropagation(); onChoose(product) }}
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '7px 12px', borderRadius: 999, transition: 'all .25s', cursor: 'pointer',
                        background: hovered ? 'linear-gradient(135deg,#5A3FB0,#3D2785)' : 'rgba(61,39,133,0.10)',
                        boxShadow: hovered ? '0 6px 16px rgba(61,39,133,0.4)' : 'none'
                    }}>
                    <span className="choose-label" style={{
                        fontSize: 13, fontWeight: 600, color: '#fff',
                        display: hovered ? 'inline' : 'none'
                    }}>{t(lang, 'choose')}</span>
                    <Icon name="arrow-right" size={16} color={hovered ? '#fff' : '#3D2785'} stroke={2} />
                </div>
            </div>
        </div>
    )

    return (
        <div className={`rail-card-wrap${product.pick ? ' is-pick' : ''}`}>
            {inner}
        </div>
    )
}

// ── Product carousel — a horizontal, swipeable/scroll-snap rail ────────────────
// One row tall (no vertical stacking), so 3 or 10 products read the same way and
// the message never forces the page to scroll up and down. Desktop gets arrow
// nav; touch gets swipe + position dots; few-enough products just center.
function ProductCarousel({ trio, onChoose, lang = 'EN' }) {
    const railRef = useRef(null)
    const products = trio.products || []
    const [scrollable, setScrollable] = useState(products.length > 3) // best-guess until measured
    const [atStart, setAtStart] = useState(true)
    const [atEnd, setAtEnd] = useState(false)
    const [activeIdx, setActiveIdx] = useState(0)
    const [detail, setDetail] = useState(null) // product currently open in the detail view

    const cardStep = () => {
        const el = railRef.current
        const first = el?.querySelector('.rail-card-wrap')
        return first ? first.getBoundingClientRect().width + 16 : 220
    }

    const sync = () => {
        const el = railRef.current
        if (!el) return
        const max = el.scrollWidth - el.clientWidth
        setScrollable(max > 8)
        setAtStart(el.scrollLeft <= 8)
        setAtEnd(el.scrollLeft >= max - 8)
        setActiveIdx(Math.min(products.length - 1, Math.round(el.scrollLeft / cardStep())))
    }

    useEffect(() => {
        sync()
        const onResize = () => sync()
        window.addEventListener('resize', onResize)
        return () => window.removeEventListener('resize', onResize)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const nudge = (dir) => {
        const el = railRef.current
        if (!el) return
        el.scrollBy({ left: dir * cardStep(), behavior: 'smooth' })
    }

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

            <div className="rail-wrap">
                {/* Desktop nav arrows — hidden on touch (CSS), fade out at the ends */}
                <button className="rail-arrow rail-arrow-left" aria-label={t(lang, 'choose')}
                    onClick={() => nudge(-1)}
                    style={{
                        opacity: scrollable && !atStart ? 1 : 0,
                        pointerEvents: scrollable && !atStart ? 'auto' : 'none'
                    }}>
                    <Icon name="arrow-right" size={18} color="#3D2785" stroke={2.2} style={{ transform: 'rotate(180deg)' }} />
                </button>
                <button className="rail-arrow rail-arrow-right" aria-label={t(lang, 'choose')}
                    onClick={() => nudge(1)}
                    style={{
                        opacity: scrollable && !atEnd ? 1 : 0,
                        pointerEvents: scrollable && !atEnd ? 'auto' : 'none'
                    }}>
                    <Icon name="arrow-right" size={18} color="#3D2785" stroke={2.2} />
                </button>

                {/* The rail */}
                <div className={`rail${scrollable ? '' : ' rail--center'}`} ref={railRef} onScroll={sync}>
                    {products.map((p, i) => (
                        <ProductCard key={p.product_id || i} product={p} idx={i}
                            onChoose={onChoose} onDetails={setDetail} lang={lang} />
                    ))}
                </div>
            </div>

            {/* Position dots — only when there's more off-screen (mainly touch) */}
            {scrollable && products.length > 1 && (
                <div className="rail-dots">
                    {products.map((_, i) => (
                        <span key={i} className={`rail-dot${i === activeIdx ? ' active' : ''}`} />
                    ))}
                </div>
            )}

            {/* Detail / quick-view overlay */}
            {detail && (
                <ProductDetail
                    product={detail} lang={lang}
                    onClose={() => setDetail(null)}
                    onChoose={(p) => { setDetail(null); onChoose(p) }} />
            )}
        </div>
    )
}

// ── Flow area ──────────────────────────────────────────────────────────────────
export default function FlowArea({ messages = [], loading, liveStatus = [], lang = 'EN', onChoose, onAddRecipient, onCreateOrder, onAddItem, onEditGift, onChip, onComplete, onTrackAnother, flowRef }) {
    return (
        <div ref={flowRef} className="flow-area">
            <div className="flow-inner">
                {messages.map((m, i) => {
                    if (m.role === 'user') return <UserMessage key={i} text={m.content} />

                    switch (m.msgType) {
                        case 'agent':
                            return <AgentMessage key={i} text={m.content} stream={m.stream} chips={m.chips} onChip={onChip} />
                        case 'product_trio':
                            return <ProductCarousel key={i} trio={m.trio} onChoose={onChoose} lang={lang} />
                        case 'plan_board':
                            return (
                                <PlanBoard key={i} plan={m.plan} lang={lang}
                                    onAddRecipient={onAddRecipient}
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
                        case 'tracking':
                            return <TrackingCard key={i} data={m.trackingData} lang={lang} onTrackAnother={onTrackAnother} />
                        default:
                            return null
                    }
                })}
                {loading && <FlowThinking events={liveStatus} lang={lang} />}
            </div>
        </div>
    )
}