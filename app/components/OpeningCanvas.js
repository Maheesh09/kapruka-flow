'use client'
import { useState } from 'react'
import Icon from './Icon'

const CHIPS = [
    {
        label: 'Send a gift',
        sub: 'Surprise someone you love',
        icon: 'gift',
        goal: 'I want to send a gift',
        grad: 'linear-gradient(135deg,#E9E4FF,#C8BFEF)',
        iconColor: '#3D2785'
    },
    {
        label: 'Celebrate',
        sub: 'Make moments unforgettable',
        icon: 'party-popper',
        goal: 'I need a birthday cake delivered to Kandy this Saturday, budget under LKR 6,000',
        grad: 'linear-gradient(135deg,#FFF7E0,#FFE08A)',
        iconColor: '#8a6d00'
    },
    {
        label: 'Say something',
        sub: 'Gifts that speak for you',
        icon: 'heart',
        goal: 'I want to send flowers and chocolates to say thank you, delivery to Colombo tomorrow',
        grad: 'linear-gradient(135deg,#FFE9F3,#FF9ECF)',
        iconColor: '#c0336a'
    },
    {
        label: 'Stock up',
        sub: 'Everyday essentials, delivered',
        icon: 'shopping-basket',
        goal: 'I need to order some essentials',
        grad: 'linear-gradient(135deg,#E0F5E9,#A8DFBA)',
        iconColor: '#1a7a3a'
    }
]

const HEADLINES = {
    EN: 'What would you like Flow to handle today?',
    SI: 'අද Flow එකෙන් කරගන්න ඕනේ මොකක්ද?',
    TG: 'Ada Flow eken karaganna ona mokakda?',
}
const PLACEHOLDERS = {
    EN: 'A gaming laptop, flowers for tomorrow, delivery to Galle…',
    SI: 'Gaming laptop එකක්, හෙටට මල්, Galle delivery',
    TG: 'Gaming laptop ekak, heta mal, Galle delivery',
}
const SLOGAN = 'Flow your way to the perfect find'

export default function OpeningCanvas({ onSubmit, input, setInput, lang }) {
    const words = (HEADLINES[lang] || HEADLINES.EN).split(' ')

    return (
        <div className="opening-canvas" style={{
            position: 'absolute', inset: 0, zIndex: 5, display: 'flex',
            flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 28, padding: '108px 24px 60px', textAlign: 'center',
            overflowY: 'auto', WebkitOverflowScrolling: 'touch'
        }}>

            {/* Headline + slogan */}
            <div style={{ maxWidth: 860 }}>
                <h1 style={{
                    margin: 0, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700,
                    fontSize: 'clamp(28px,5vw,52px)', lineHeight: 1.08, letterSpacing: '-0.025em',
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

                {/* Slogan */}
                <div style={{
                    marginTop: 12,
                    animation: 'riseBlur .6s 0.055s cubic-bezier(.2,.7,.2,1) both'
                }}>
                    <span style={{
                        fontFamily: "'Space Grotesk',sans-serif",
                        fontWeight: 500,
                        fontSize: 'clamp(13px,1.6vw,16px)',
                        letterSpacing: '0.01em',
                        backgroundImage: 'linear-gradient(90deg, #3D2785 0%, #3D2785 35%, #6B52C8 45%, #F5C800 50%, #6B52C8 55%, #3D2785 65%, #3D2785 100%)',
                        backgroundSize: '400% auto',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        animation: 'sloganShimmer 15s linear infinite',
                        display: 'inline-block'
                    }}>
                        {SLOGAN}
                    </span>
                </div>
            </div>

            {/* Input */}
            <div style={{ animation: 'riseBlur .7s 0.5s ease-out both', width: '100%', maxWidth: 680 }}>
                <InputBar
                    value={input} onChange={setInput}
                    placeholder={PLACEHOLDERS[lang] || PLACEHOLDERS.EN}
                    onSubmit={onSubmit} docked={false}
                />
            </div>

            {/* Intent chips — even 2×3 grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                gap: 12, maxWidth: 620, width: '100%',
                animation: 'riseBlur .7s 0.7s ease-out both'
            }}>
                {CHIPS.map((chip, idx) => (
                    <LuxuryChip key={chip.label} chip={chip} onSubmit={onSubmit} idx={idx} />
                ))}
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

export function InputBar({ value, onChange, placeholder, onSubmit, docked }) {
    const [focused, setFocused] = useState(false)
    return (
        <div style={{
            position: 'relative',
            width: docked ? 'min(700px,94vw)' : '100%',
            borderRadius: 999
        }}>
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
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && onSubmit(value)}
                    placeholder={placeholder}
                    style={{
                        flex: 1, minWidth: 0, border: 'none', outline: 'none',
                        background: 'transparent', fontSize: 16, fontFamily: 'Inter',
                        color: '#1A1433', fontWeight: 400
                    }}
                />
                <button
                    className="chat-input-btn"
                    onClick={() => onSubmit(value)}
                    aria-label="Send"
                    style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: 46, height: 46, borderRadius: 13, border: 'none', cursor: 'pointer',
                        background: 'linear-gradient(135deg,#FFE08A,#F5C800)',
                        boxShadow: '0 3px 10px rgba(245,200,0,0.50), 0 0 0 1px rgba(245,200,0,0.15)',
                        transition: 'transform .2s, box-shadow .2s',
                        flexShrink: 0
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