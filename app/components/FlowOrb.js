'use client'
import Icon from './Icon'

// ── FlowOrb — Flow's one visual presence, everywhere ────────────────────────
// Same face (the Kapruka smile) in every state — only the aura around it
// changes. That's deliberate: idle, listening, thinking and done should all
// read as "this is Flow, doing a different thing" rather than four separate
// mascots. Drop-in replacement for the old inline KaprukaSmiley/voice-bubble
// markup — both now render through this.
//
// state: 'idle' | 'listening' | 'thinking' | 'done'
export default function FlowOrb({ state = 'idle', size = 44 }) {
    const thinking = state === 'thinking'
    const listening = state === 'listening'
    const done = state === 'done'

    const ringColor = listening ? 'rgba(245,200,0,0.45)' : 'rgba(61,39,133,0.35)'
    const ringColorSoft = listening ? 'rgba(245,200,0,0.26)' : 'rgba(61,39,133,0.20)'

    const glow = done
        ? '0 0 22px rgba(245,200,0,0.55), 0 0 42px rgba(245,200,0,0.22)'
        : listening
            ? '0 0 18px rgba(245,200,0,0.50), 0 0 34px rgba(245,200,0,0.18)'
            : thinking
                ? '0 0 20px rgba(61,39,133,0.65), 0 0 40px rgba(61,39,133,0.2)'
                : '0 0 14px rgba(61,39,133,0.4)'

    const box = size + 8 // room for ripple rings, matches original KaprukaSmiley footprint

    return (
        <div className="flow-orb" style={{
            position: 'relative', width: box, height: box, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            {/* Ripple rings — thinking (purple) or listening (gold) */}
            {(thinking || listening) && (
                <>
                    <span style={{
                        position: 'absolute', inset: 0, borderRadius: '50%',
                        border: `1.5px solid ${ringColor}`,
                        animation: 'ripple 2.4s ease-out infinite'
                    }} />
                    <span style={{
                        position: 'absolute', inset: 0, borderRadius: '50%',
                        border: `1.5px solid ${ringColorSoft}`,
                        animation: 'ripple 2.4s ease-out infinite', animationDelay: '0.8s'
                    }} />
                </>
            )}

            {/* The orb itself */}
            <div style={{
                width: size, height: size, borderRadius: '50%',
                background: 'radial-gradient(circle at 34% 30%, #8a72d0, #3D2785 72%)',
                boxShadow: glow,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: thinking ? 'orbPulse 2.4s ease-in-out infinite' : 'none',
                transition: 'box-shadow .5s'
            }}>
                {/* Kapruka smile arc — Flow's one constant face */}
                <svg width={size * 0.55} height={size * 0.34} viewBox="0 0 24 15" fill="none"
                    style={{ marginTop: size * 0.11 }}>
                    <path
                        d="M3.5 2.5 A 8.5 8.5 0 0 0 20.5 2.5"
                        stroke="#F5C800" strokeWidth="4.2" strokeLinecap="round" fill="none"
                        style={{
                            strokeDasharray: 28, strokeDashoffset: 0,
                            animation: thinking ? 'smileDraw 1.8s ease-in-out infinite' : 'none'
                        }}
                    />
                </svg>
            </div>

            {/* Done badge — one-shot pop, parent controls how long 'done' stays set */}
            {done && (
                <div style={{
                    position: 'absolute', right: -2, bottom: -2,
                    width: size * 0.42, height: size * 0.42, borderRadius: '50%',
                    background: 'linear-gradient(135deg,#FFE08A,#F5C800)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 3px 10px rgba(245,200,0,0.55)',
                    border: '2px solid #fff',
                    animation: 'tickPop .45s cubic-bezier(.2,.8,.2,1) both'
                }}>
                    <Icon name="check" size={size * 0.2} color="#3D2785" stroke={3} />
                </div>
            )}
        </div>
    )
}
