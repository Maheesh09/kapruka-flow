'use client'
import Icon from './Icon'

const CHIPS = [
    { label: 'Send a gift', icon: 'gift', goal: 'I want to send a gift' },
    { label: 'Celebrate', icon: 'party-popper', goal: 'Help me celebrate someone special' },
    { label: 'Say something', icon: 'heart', goal: 'I want to say thank you or sorry with a gift' },
    { label: 'Stock up', icon: 'shopping-basket', goal: 'I need to order some essentials' },
    { label: 'Treat yourself', icon: 'sparkles', goal: 'I want to treat myself to something nice' },
    { label: 'Plan an occasion', icon: 'calendar-heart', goal: 'Help me plan for an upcoming occasion' },
]

const HEADLINES = {
    EN: 'What are you trying to make happen today?',
    SI: 'අද ඔයාට කරන්න ඕන මොකක්ද?',
    TG: 'Ada mokak da karanna one?',
}
const PLACEHOLDERS = {
    EN: 'Tell me… a birthday in Kandy, chocolates under 5,000, flowers for amma',
    SI: 'කියන්න… Kandy birthday cake ekak, 5,000 yata chocolate gift',
    TG: 'Kiyanna… Kandy cake ekak, flowers for amma, chocolate box',
}

export default function OpeningCanvas({ onSubmit, input, setInput, lang }) {
    const words = (HEADLINES[lang] || HEADLINES.EN).split(' ')

    return (
        <div style={{
            position: 'absolute', inset: 0, zIndex: 5, display: 'flex',
            flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 34, padding: '120px 24px 60px', textAlign: 'center'
        }}>

            {/* Animated headline */}
            <div style={{ maxWidth: 820 }}>
                <h1 style={{
                    margin: 0, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600,
                    fontSize: 'clamp(32px,5.6vw,54px)', lineHeight: 1.08, letterSpacing: '-0.02em',
                    color: '#3D2785', textWrap: 'balance'
                }}>
                    {words.map((w, i) => (
                        <span key={`${lang}-${i}`} style={{
                            display: 'inline-block', marginRight: '0.26em',
                            animation: 'riseBlur .6s cubic-bezier(.2,.7,.2,1) both',
                            animationDelay: `${0.1 + i * 0.065}s`
                        }}>
                            {w}
                        </span>
                    ))}
                </h1>
            </div>

            {/* Input */}
            <div style={{ animation: 'riseBlur .7s .5s ease-out both' }}>
                <InputBar
                    value={input} onChange={setInput}
                    placeholder={PLACEHOLDERS[lang] || PLACEHOLDERS.EN}
                    onSubmit={onSubmit} docked={false}
                />
            </div>

            {/* Intent chips */}
            <div style={{
                display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
                gap: 12, maxWidth: 760, animation: 'riseBlur .7s .7s ease-out both'
            }}>
                {CHIPS.map(chip => (
                    <IntentChip key={chip.label} chip={chip} onSubmit={onSubmit} />
                ))}
            </div>
        </div>
    )
}

function IntentChip({ chip, onSubmit }) {
    const [hovered, setHovered] = useState(false)
    return (
        <button
            onClick={() => onSubmit(chip.goal)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: 'flex', alignItems: 'center', gap: 9, padding: '12px 18px',
                borderRadius: 999, cursor: 'pointer', fontFamily: 'Inter', fontWeight: 600,
                fontSize: 14.5, color: '#3D2785', border: 'none',
                background: 'linear-gradient(135deg,rgba(255,255,255,0.66),rgba(255,255,255,0.5))',
                backdropFilter: 'blur(18px) saturate(160%)',
                WebkitBackdropFilter: 'blur(18px) saturate(160%)',
                boxShadow: hovered ? '0 12px 28px rgba(61,39,133,0.22)' : '0 6px 18px rgba(61,39,133,0.07)',
                transform: hovered ? 'translateY(-3px)' : 'none',
                transition: 'transform .25s ease, box-shadow .25s ease'
            }}>
            <Icon name={chip.icon} size={18} color="#3D2785" />
            {chip.label}
        </button>
    )
}

export function InputBar({ value, onChange, placeholder, onSubmit, docked }) {
    const [focused, setFocused] = useState(false)
    return (
        <div style={{
            position: 'relative', width: docked ? 'min(700px,94vw)' : 'min(640px,94vw)',
            borderRadius: 999
        }}>
            {/* Spinning conic border on focus */}
            <div style={{
                position: 'absolute', inset: -2, borderRadius: 999,
                overflow: 'hidden', opacity: focused ? 1 : 0, transition: 'opacity .3s'
            }}>
                <div style={{
                    position: 'absolute', inset: '-60%',
                    background: 'conic-gradient(from 0deg, #3D2785, #F5C800, #FF9ECF, #3D2785)',
                    animation: focused ? 'spin 4.5s linear infinite' : 'none'
                }} />
            </div>
            <div style={{
                position: 'relative', display: 'flex', alignItems: 'center', gap: 10,
                padding: docked ? '8px 8px 8px 22px' : '9px 9px 9px 24px', borderRadius: 999,
                background: 'linear-gradient(135deg,rgba(255,255,255,0.82),rgba(255,255,255,0.68))',
                backdropFilter: 'blur(20px) saturate(160%)', WebkitBackdropFilter: 'blur(20px) saturate(160%)',
                border: '1px solid rgba(255,255,255,0.9)',
                boxShadow: '0 10px 32px rgba(61,39,133,0.12)'
            }}>
                <input
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && onSubmit(value)}
                    placeholder={placeholder}
                    style={{
                        flex: 1, minWidth: 0, border: 'none', outline: 'none',
                        background: 'transparent', fontSize: 16, fontFamily: 'Inter', color: '#1A1433'
                    }}
                />
                <button onClick={() => onSubmit(value)} aria-label="Send"
                    style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: 46, height: 46, borderRadius: 13, border: 'none', cursor: 'pointer',
                        background: 'linear-gradient(135deg,#FFE08A,#F5C800)',
                        boxShadow: '0 6px 16px rgba(245,200,0,0.5)'
                    }}>
                    <Icon name="arrow-up" size={21} color="#3D2785" stroke={2.4} />
                </button>
            </div>
        </div>
    )
}

// useState needs to be imported in components that use it
import { useState } from 'react'