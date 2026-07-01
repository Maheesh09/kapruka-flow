'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import Icon from './Icon'
import { t } from '../i18n'

const SPEECH_LANG = { EN: 'en-IN', SI: 'si-LK', TA: 'ta-IN' }

// Speech-to-text. `transcript` is the live, possibly-interim guess — it's
// shown in the ListeningDock while listening, and only handed to the caller
// (via onFinal) once the browser commits to a final result. This keeps the
// real input field stable instead of rewriting it on every interim event.
function useSpeech(lang, onFinal) {
    const [listening, setListening] = useState(false)
    const [supported, setSupported] = useState(false)
    const [transcript, setTranscript] = useState('')
    const recRef = useRef(null)
    const onFinalRef = useRef(onFinal)
    onFinalRef.current = onFinal

    useEffect(() => {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition
        if (!SR) { console.log('[voice] SpeechRecognition not available in this browser'); return }
        setSupported(true)
        const rec = new SR()
        rec.continuous = false
        rec.interimResults = true
        rec.maxAlternatives = 1

        rec.onstart = () => console.log('[voice] started, lang =', rec.lang)
        rec.onaudiostart = () => console.log('[voice] mic is capturing audio')
        rec.onspeechstart = () => console.log('[voice] speech detected')
        rec.onresult = (e) => {
            const text = Array.from(e.results).map(r => r[0].transcript).join('')
            const isFinal = e.results[e.results.length - 1].isFinal
            console.log('[voice] result:', text, isFinal)
            setTranscript(text)
            if (isFinal) onFinalRef.current(text)
        }
        rec.onerror = (e) => {
            console.log('[voice] ERROR:', e.error, e.message || '')
            setListening(false)
        }
        rec.onend = () => { console.log('[voice] ended'); setListening(false) }

        recRef.current = rec
        return () => rec.abort()
    }, [])

    const toggle = () => {
        const rec = recRef.current
        if (!rec) return
        if (listening) { rec.stop(); return }
        setTranscript('')
        rec.lang = SPEECH_LANG[lang] || 'en-IN'
        try { rec.start(); setListening(true) }
        catch (err) { console.log('[voice] start threw:', err.message); setListening(false) }
    }

    return { listening, supported, toggle, transcript }
}

function getChips(lang) {
    return [
        { label: t(lang, 'chipGiftLabel'), icon: 'gift', goal: t(lang, 'chipGiftGoal'), grad: 'linear-gradient(135deg,#E9E4FF,#C8BFEF)', iconColor: '#3D2785' },
        { label: t(lang, 'chipCelebrateLabel'), icon: 'party-popper', goal: t(lang, 'chipCelebrateGoal'), grad: 'linear-gradient(135deg,#FFF7E0,#FFE08A)', iconColor: '#8a6d00' },
        { label: t(lang, 'chipSayLabel'), icon: 'heart', goal: t(lang, 'chipSayGoal'), grad: 'linear-gradient(135deg,#FFE9F3,#FF9ECF)', iconColor: '#c0336a' },
        { label: t(lang, 'chipStockLabel'), icon: 'shopping-basket', goal: t(lang, 'chipStockGoal'), grad: 'linear-gradient(135deg,#E0F5E9,#A8DFBA)', iconColor: '#1a7a3a' },
    ]
}

function getCategories(lang) {
    return [
        { label: t(lang, 'catCakes'), value: 'cakes', icon: 'cake', grad: 'linear-gradient(135deg,#FFE9F3,#FFB8D9)', iconColor: '#c0336a' },
        { label: t(lang, 'catFlowers'), value: 'flowers', icon: 'flower', grad: 'linear-gradient(135deg,#F3FFE9,#C8F0A8)', iconColor: '#3a7a1a' },
        { label: t(lang, 'catGrocery'), value: 'Grocery', icon: 'shopping-basket', grad: 'linear-gradient(135deg,#E0F5E9,#A8DFBA)', iconColor: '#1a7a3a' },
        { label: t(lang, 'catFashion'), value: 'Clothing', icon: 'shirt', grad: 'linear-gradient(135deg,#E9E4FF,#C8BFEF)', iconColor: '#3D2785' },
        { label: t(lang, 'catBooks'), value: 'Books', icon: 'book', grad: 'linear-gradient(135deg,#FFF7E0,#FFE08A)', iconColor: '#8a6d00' },
        { label: t(lang, 'catGifts'), value: 'Giftset', icon: 'gift', grad: 'linear-gradient(135deg,#FFE9F3,#FF9ECF)', iconColor: '#c0336a' },
    ]
}

// Grid layout (column count + gap) lives in globals.css (.category-grid), so it
// can be tuned per breakpoint in CSS. Only per-item, non-responsive styling stays
// inline here. Label deliberately does NOT use whiteSpace:'nowrap' — Sinhala/Tamil
// labels run longer than English and must be free to wrap onto a second line
// instead of overflowing their column on narrow screens.
function CategoryPill({ cat, onSubmit, idx }) {
    const [hovered, setHovered] = useState(false)
    return (
        <button
            className="category-pill"
            onClick={() => onSubmit(`I want to browse the ${cat.value} category.`)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7,
                padding: '12px 4px', borderRadius: 18, cursor: 'pointer', border: 'none',
                background: hovered
                    ? 'linear-gradient(135deg,rgba(255,255,255,0.84),rgba(255,255,255,0.68))'
                    : 'linear-gradient(135deg,rgba(255,255,255,0.56),rgba(255,255,255,0.38))',
                backdropFilter: 'blur(16px) saturate(180%)',
                WebkitBackdropFilter: 'blur(16px) saturate(180%)',
                boxShadow: hovered ? '0 12px 26px rgba(61,39,133,0.18)' : '0 4px 12px rgba(61,39,133,0.06)',
                transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
                transition: 'all .25s ease',
                animation: `riseBlur .6s ${0.9 + idx * 0.06}s cubic-bezier(.2,.7,.2,1) both`,
                minWidth: 0
            }}
        >
            <div style={{
                width: 40, height: 40, borderRadius: '50%', background: cat.grad, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                transform: hovered ? 'scale(1.1) rotate(-4deg)' : 'scale(1)',
                transition: 'transform .25s'
            }}>
                <Icon name={cat.icon} size={19} color={cat.iconColor} />
            </div>
            <span style={{
                fontFamily: 'Inter', fontWeight: 600, fontSize: 12, color: '#1A1433',
                lineHeight: 1.2, textAlign: 'center', wordBreak: 'break-word'
            }}>{cat.label}</span>
        </button>
    )
}

export default function OpeningCanvas({ onSubmit, input, setInput, lang, leaving = false, anchorRef }) {
    const CHIPS = getChips(lang)
    const words = t(lang, 'openingHeadline').split(' ')

    // The headline/slogan and the chips fade+scale away together (same treatment
    // as SplashScreen's exit) while the input bar's real instance disappears
    // instantly — at that exact moment LaunchGhost (in page.js) takes over the
    // identical pixels, so the handoff is invisible. No fade on the input wrapper
    // itself, or the ghost and the real bar would briefly show through each other.
    const fadeAway = {
        opacity: leaving ? 0 : 1,
        transform: leaving ? 'scale(1.04)' : 'scale(1)',
        transition: 'opacity .45s ease, transform .45s ease',
        pointerEvents: leaving ? 'none' : 'auto'
    }

    return (
        <div className="opening-canvas" style={{
            position: 'absolute', inset: 0, zIndex: 5, display: 'flex',
            flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 20, padding: '80px 20px 60px', textAlign: 'center',
            overflowY: 'auto', WebkitOverflowScrolling: 'touch',
            pointerEvents: leaving ? 'none' : 'auto'
        }}>

            {/* Headline + slogan */}
            <div style={{ maxWidth: 860, ...fadeAway }}>
                <h1 className="opening-headline" style={{
                    margin: 0, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700,
                    fontSize: 'clamp(24px,5vw,52px)', lineHeight: 1.08, letterSpacing: '-0.025em',
                    color: '#1A1433', textWrap: 'balance'
                }}>
                    {words.map((w, i) => (
                        <span key={`${lang}-${i}`} style={{
                            display: 'inline-block', marginRight: '0.26em',
                            animation: 'riseBlur .6s cubic-bezier(.2,.7,.2,1) both',
                            animationDelay: `${0.08 + i * 0.055}s`
                        }}>
                            {w}
                        </span>
                    ))}
                </h1>

                {/* Slogan — hidden on very small phones to save vertical space */}
                <div className="opening-slogan" style={{
                    marginTop: 10,
                    animation: 'riseBlur .6s 0.055s cubic-bezier(.2,.7,.2,1) both'
                }}>
                    <span style={{
                        fontFamily: "'Space Grotesk',sans-serif",
                        fontWeight: 500,
                        fontSize: 'clamp(12px,1.6vw,16px)',
                        letterSpacing: '0.01em',
                        backgroundImage: 'linear-gradient(90deg, #3D2785 0%, #3D2785 35%, #6B52C8 45%, #F5C800 50%, #6B52C8 55%, #3D2785 65%, #3D2785 100%)',
                        backgroundSize: '400% auto',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        animation: 'sloganShimmer 15s linear infinite',
                        display: 'inline-block'
                    }}>
                        {t(lang, 'openingSub')}
                    </span>
                </div>
            </div>

            {/* Input — hidden the instant we leave, no transition. LaunchGhost
                takes over the exact same pixels at the exact same moment. */}
            <div ref={anchorRef} style={{
                animation: 'riseBlur .7s 0.5s ease-out both', width: '100%', maxWidth: 680,
                opacity: leaving ? 0 : 1
            }}>
                <InputBar
                    value={input} onChange={setInput}
                    placeholder={t(lang, 'openingPlaceholderRich')}
                    onSubmit={onSubmit} docked={false} lang={lang}
                />
            </div>

            {/* Intent chips — 2×2 grid on mobile, 1×4 row on wider screens.
                On mobile the category rail below replaces the mental model of
                "what modes are available" — so 4 chips is already plenty. */}
            <div className="opening-chips-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                gap: 10, maxWidth: 620, width: '100%',
                animation: 'riseBlur .7s 0.7s ease-out both',
                ...fadeAway
            }}>
                {CHIPS.map((chip, idx) => (
                    <LuxuryChip key={chip.label} chip={chip} onSubmit={onSubmit} idx={idx} />
                ))}
            </div>

            {/* Category rail — horizontal scroll on all sizes.
                On mobile this renders as a single swipeable strip (CSS handles it)
                so it doesn't add a second row of options creating two competing grids. */}
            <div style={{ ...fadeAway, animation: 'riseBlur .7s 0.85s ease-out both', width: '100%', maxWidth: 520 }}>
                <div className="opening-cat-label" style={{
                    fontFamily: 'Inter', fontSize: 12, fontWeight: 500,
                    color: 'rgba(26,20,51,0.45)', marginBottom: 8
                }}>
                    {t(lang, 'categoryRailLabel')}
                </div>
                <div className="category-grid">
                    {getCategories(lang).map((cat, idx) => (
                        <CategoryPill key={cat.value} cat={cat} onSubmit={onSubmit} idx={idx} />
                    ))}
                </div>
            </div>
        </div>
    )
}

function LuxuryChip({ chip, onSubmit, idx }) {
    const [hovered, setHovered] = useState(false)

    return (
        <button
            className="luxury-chip"
            onClick={() => onSubmit(chip.goal)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: 'flex', alignItems: 'center', gap: 9,
                padding: '9px 16px 9px 10px',
                borderRadius: 999, cursor: 'pointer', border: 'none',
                background: hovered
                    ? 'linear-gradient(135deg,rgba(255,255,255,0.88),rgba(255,255,255,0.74))'
                    : 'linear-gradient(135deg,rgba(255,255,255,0.66),rgba(255,255,255,0.50))',
                backdropFilter: 'blur(18px) saturate(180%)',
                WebkitBackdropFilter: 'blur(18px) saturate(180%)',
                boxShadow: hovered
                    ? '0 12px 28px rgba(61,39,133,0.22), 0 1px 0 rgba(255,255,255,0.9) inset'
                    : '0 4px 14px rgba(61,39,133,0.08), 0 1px 0 rgba(255,255,255,0.8) inset',
                border: hovered ? '1px solid rgba(255,255,255,0.92)' : '1px solid rgba(255,255,255,0.68)',
                transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
                transition: 'transform .25s ease, box-shadow .25s ease, background .25s ease, border .25s ease',
                animation: `riseBlur .6s ${0.75 + idx * 0.07}s cubic-bezier(.2,.7,.2,1) both`,
                position: 'relative', overflow: 'hidden'
            }}
        >
            {/* Shimmer on hover */}
            <div style={{
                position: 'absolute', top: 0, bottom: 0, width: '50%',
                background: 'linear-gradient(100deg,rgba(255,255,255,0) 0%,rgba(255,255,255,0.55) 50%,rgba(255,255,255,0) 100%)',
                transform: hovered ? 'translateX(260%) skewX(-15deg)' : 'translateX(-140%) skewX(-15deg)',
                transition: hovered ? 'transform .6s ease' : 'none',
                pointerEvents: 'none'
            }} />

            {/* Icon bubble — small */}
            <div className="luxury-chip-icon" style={{
                width: 28, height: 28, borderRadius: 9, flexShrink: 0,
                background: chip.grad,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(0,0,0,0.10)',
                transition: 'transform .25s',
                transform: hovered ? 'scale(1.12) rotate(-5deg)' : 'scale(1)'
            }}>
                <Icon name={chip.icon} size={15} color={chip.iconColor} />
            </div>

            {/* Label */}
            <span className="luxury-chip-label" style={{
                fontFamily: "'Space Grotesk',sans-serif",
                fontWeight: 600, fontSize: 14, color: '#1A1433',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
            }}>
                {chip.label}
            </span>
        </button>
    )
}

// Speech-bubble-style dock that appears above the input while Flow is
// listening. Shows the live transcript settling word by word, with the last
// couple of words dimmed to read as "still being heard" rather than final,
// plus a small idle waveform for visual liveliness. (Deliberately not wired
// to real mic amplitude — a second audio stream for that purpose competes
// with the browser's speech engine for the mic and degrades recognition.)
function ListeningDock({ lang, transcript }) {
    const words = transcript.trim().length ? transcript.trim().split(/\s+/) : []
    const dockBg = 'linear-gradient(135deg,rgba(61,39,133,0.97),rgba(43,26,99,0.97))'

    return (
        <div role="status" aria-live="polite" style={{
            position: 'absolute', left: 0, right: 0, bottom: 'calc(100% + 14px)',
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 16px 12px 12px', borderRadius: 22,
            background: dockBg,
            boxShadow: '0 16px 40px rgba(61,39,133,0.32), 0 1px 0 rgba(255,255,255,0.08) inset',
            animation: 'voiceDockIn .32s cubic-bezier(.2,.8,.2,1) both',
            zIndex: 20
        }}>
            {/* Flow mascot bubble — glows while listening */}
            <div style={{
                width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg,#FFE08A,#F5C800)',
                animation: 'voiceGlow 1.6s ease-in-out infinite'
            }}>
                <Icon name="sparkles" size={16} color="#3D2785" />
            </div>

            {/* Live transcript, or a friendly "listening" placeholder */}
            <div style={{
                flex: 1, minWidth: 0, fontFamily: 'Inter', fontSize: 15,
                color: '#fff', lineHeight: 1.3, overflow: 'hidden',
                whiteSpace: 'nowrap', textOverflow: 'ellipsis'
            }}>
                {words.length ? (
                    words.map((w, i) => (
                        <span key={i} style={{
                            opacity: i >= words.length - 2 ? 0.55 : 1,
                            marginRight: 5, transition: 'opacity .2s'
                        }}>{w}</span>
                    ))
                ) : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, opacity: 0.85 }}>
                        {t(lang, 'voiceListening')}
                        <span style={{ display: 'inline-flex', gap: 3 }}>
                            {[0, 1, 2].map(i => (
                                <span key={i} style={{
                                    width: 5, height: 5, borderRadius: '50%', background: '#fff',
                                    animation: `thinkingDot 1.2s ease-in-out ${i * 0.18}s infinite`
                                }} />
                            ))}
                        </span>
                    </span>
                )}
            </div>

            {/* Idle waveform — decorative only, not tied to real mic amplitude */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 20, flexShrink: 0 }}>
                {Array.from({ length: 9 }).map((_, i) => (
                    <span key={i} style={{
                        width: 3, height: 18, borderRadius: 2,
                        background: 'rgba(255,255,255,0.85)',
                        transformOrigin: 'bottom',
                        animation: `voiceBarIdle 1.1s ease-in-out ${i * 0.09}s infinite`
                    }} />
                ))}
            </div>

            {/* Speech-bubble tail pointing down at the mic button */}
            <div style={{
                position: 'absolute', bottom: -6, right: 28, width: 14, height: 14,
                background: dockBg, transform: 'rotate(45deg)', borderRadius: '0 0 4px 0'
            }} />
        </div>
    )
}

export function InputBar({ value, onChange, placeholder, onSubmit, docked, loading, lang = 'EN' }) {
    const [focused, setFocused] = useState(false)
    const handleFinal = useCallback((text) => { onChange(text) }, [onChange])
    const { listening, supported, toggle, transcript } = useSpeech(lang, handleFinal)
    return (
        <div style={{
            position: 'relative',
            width: docked ? 'min(700px,94vw)' : '100%',
            borderRadius: 999
        }}>
            {listening && (
                <ListeningDock lang={lang} transcript={transcript} />
            )}
            {/* Spinning conic border outline */}
            <div style={{
                position: 'absolute', inset: -2, borderRadius: 999,
                padding: 2,
                WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                WebkitMaskComposite: 'xor',
                maskComposite: 'exclude',
                overflow: 'hidden',
                opacity: focused ? 1 : 0, transition: 'opacity .3s',
                pointerEvents: 'none',
                zIndex: 0
            }}>
                <div style={{
                    position: 'absolute', top: '50%', left: '50%',
                    width: '300%', paddingBottom: '300%', margin: '-150% 0 0 -150%',
                    background: 'conic-gradient(from 0deg, #3D2785, #F5C800, #FF9ECF, #3D2785)',
                    animation: focused ? 'spin 4s linear infinite' : 'none'
                }} />
            </div>
            <div className="chat-input-inner" style={{
                position: 'relative', display: 'flex', alignItems: 'center', gap: 10,
                padding: docked ? '8px 8px 8px 22px' : '10px 10px 10px 24px',
                borderRadius: 999,
                background: focused
                    ? 'linear-gradient(135deg,rgba(255,255,255,0.94),rgba(255,255,255,0.86))'
                    : 'linear-gradient(135deg,rgba(255,255,255,0.82),rgba(255,255,255,0.68))',
                backdropFilter: 'blur(28px) saturate(200%)',
                WebkitBackdropFilter: 'blur(28px) saturate(200%)',
                border: '1px solid rgba(255,255,255,0.9)',
                boxShadow: focused
                    ? '0 12px 36px rgba(61,39,133,0.18), 0 1px 0 rgba(255,255,255,1) inset'
                    : '0 8px 28px rgba(61,39,133,0.10)',
                transition: 'box-shadow .3s, background .3s'
            }}>
                <input
                    className="chat-input-field"
                    autoFocus
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && onSubmit(value)}
                    placeholder={placeholder}
                    disabled={loading}
                    style={{
                        flex: 1, minWidth: 0, border: 'none', outline: 'none',
                        background: 'transparent', fontSize: 16, fontFamily: 'Inter',
                        color: '#1A1433', fontWeight: 400
                    }}
                />
                {supported && (
                    <button onClick={toggle} aria-label={t(lang, 'ariaVoice')} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: 42, height: 42, borderRadius: 12, border: 'none', cursor: 'pointer',
                        flexShrink: 0,
                        background: listening ? 'linear-gradient(135deg,#5A3FB0,#3D2785)' : 'rgba(61,39,133,0.08)',
                        boxShadow: listening ? '0 0 0 4px rgba(61,39,133,0.15)' : 'none',
                        animation: listening ? 'agentPulse 1.4s ease-in-out infinite' : 'none',
                        transition: 'all .25s'
                    }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                            stroke={listening ? '#fff' : '#3D2785'} strokeWidth="1.8"
                            strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                            <line x1="12" x2="12" y1="19" y2="22" />
                        </svg>
                    </button>
                )}
                <button
                    className="chat-input-btn"
                    onClick={() => !loading && onSubmit(value)}
                    disabled={loading}
                    aria-label={t(lang, 'ariaSend')}
                    style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: 46, height: 46, borderRadius: 13, border: 'none', cursor: loading ? 'default' : 'pointer',
                        background: 'linear-gradient(135deg,#FFE08A,#F5C800)',
                        boxShadow: '0 3px 10px rgba(245,200,0,0.50), 0 0 0 1px rgba(245,200,0,0.15)',
                        transition: 'transform .2s, box-shadow .2s, opacity .3s',
                        flexShrink: 0, opacity: loading ? 0.5 : 1
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(245,200,0,0.60), 0 0 0 1px rgba(245,200,0,0.2)' }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 3px 10px rgba(245,200,0,0.50), 0 0 0 1px rgba(245,200,0,0.15)' }}
                >
                    <Icon name="arrow-up" size={21} color="#3D2785" stroke={2.4} />
                </button>
            </div>
        </div>
    )
}