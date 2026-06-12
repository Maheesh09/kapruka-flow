'use client'
import Icon from './Icon'

const NODES = ['Goal', 'Discover', 'Plan', 'Delivery', 'Done']

function JourneyLine({ active, done }) {
    const fill = (active / (NODES.length - 1)) * 100
    return (
        <div className="mobile-journey-line" style={{
            position: 'relative', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', width: 'min(480px, 44vw)', minWidth: 260, height: 44
        }}>
            {/* Track */}
            <div style={{
                position: 'absolute', left: 8, right: 8, top: 14, height: 2,
                background: 'rgba(255,255,255,0.18)', borderRadius: 2
            }} />
            {/* Fill */}
            <div style={{
                position: 'absolute', left: 8, top: 14, height: 2,
                width: `calc((100% - 16px) * ${fill / 100})`,
                background: 'linear-gradient(90deg, rgba(255,255,255,0.95), #F5C800)',
                borderRadius: 2, transition: 'width .6s cubic-bezier(.4,0,.2,1)',
                boxShadow: '0 0 8px rgba(245,200,0,0.5)'
            }} />
            {/* Nodes */}
            {NODES.map((label, i) => {
                const isActive = i === active
                const isDone = done.includes(i) && !isActive
                const isFuture = !isActive && !isDone
                return (
                    <div key={i} className="mobile-journey-node" style={{
                        position: 'relative', zIndex: 2, display: 'flex',
                        flexDirection: 'column', alignItems: 'center', gap: 5, width: 14
                    }}>
                        {/* Dot */}
                        <div style={{
                            width: isActive ? 16 : isDone ? 12 : 9,
                            height: isActive ? 16 : isDone ? 12 : 9,
                            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: isActive ? '#FFFFFF' : isDone ? '#F5C800' : 'rgba(255,255,255,0.22)',
                            border: isFuture ? '1.5px dashed rgba(255,255,255,0.30)' : 'none',
                            boxShadow: isActive ? '0 0 0 4px rgba(255,255,255,0.18), 0 0 12px rgba(255,255,255,0.4)' : 'none',
                            animation: isActive ? 'haloLight 2s ease-in-out infinite' : 'none',
                            transition: 'all .4s cubic-bezier(.4,0,.2,1)'
                        }}>
                            {isDone && <Icon name="check" size={7} color="#3D2785" stroke={3.2} />}
                        </div>
                        {/* Label — always visible */}
                        <div className="mobile-journey-label" style={{
                            fontSize: 9.5, fontWeight: isActive ? 700 : 500,
                            color: isActive ? '#FFFFFF' : isDone ? '#FFD54F' : 'rgba(255,255,255,0.72)',
                            whiteSpace: 'nowrap', fontFamily: 'Inter',
                            letterSpacing: '0.04em', textTransform: 'uppercase',
                            transition: 'color .4s', marginTop: 2
                        }}>
                            {label}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default function Header({ lang, setLang, journeyActive, journeyDone, showJourney = true }) {
    const LANGS = [{ code: 'EN', label: 'EN' }, { code: 'SI', label: 'සිං' }, { code: 'TG', label: 'TG' }]
    return (
        <header style={{
            position: 'absolute', top: 0, left: 0, right: 0, zIndex: 30,
            display: 'flex', justifyContent: 'center', padding: '18px 24px 0'
        }}>
            <div className="mobile-header-grid" style={{
                display: 'grid',
                gridTemplateColumns: showJourney ? '1fr auto 1fr' : '1fr auto',
                alignItems: 'center',
                gap: 24, width: 'min(1180px,92%)', padding: '14px 26px',
                borderRadius: 22,
                background: 'linear-gradient(135deg, rgba(44,28,102,0.96), rgba(26,20,51,0.98))',
                border: '1px solid rgba(255,255,255,0.12)',
                backdropFilter: 'blur(28px) saturate(180%)',
                WebkitBackdropFilter: 'blur(28px) saturate(180%)',
                boxShadow: '0 16px 48px rgba(26,20,51,0.50), 0 1px 0 rgba(255,255,255,0.10) inset, 0 -1px 0 rgba(0,0,0,0.20) inset'
            }}>

                {/* Wordmark */}
                <div className="header-brand" style={{ justifySelf: 'start', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="mobile-header-wordmark" style={{
                        fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700,
                        fontSize: 20, letterSpacing: '-0.02em', lineHeight: 1
                    }}>
                        <span style={{ color: '#FFFFFF' }}>kapruka</span>{' '}
                        <span style={{ color: '#F5C800' }}>flow</span>
                    </div>
                    {/* Smile arc */}
                    <svg width="22" height="14" viewBox="0 0 24 15" style={{ marginTop: 5 }}>
                        <path
                            d="M3.5 2.5 A 8.5 8.5 0 0 0 20.5 2.5"
                            stroke="#F5C800" strokeWidth="4.5" fill="none"
                            strokeLinecap="round"
                            style={{ animation: 'cuteWiggle 4s ease-in-out infinite', transformOrigin: 'center' }}
                        />
                    </svg>
                </div>

                {/* Journey — hidden on landing screen to reduce cognitive load */}
                {showJourney && (
                    <div className="mobile-journey-wrapper" style={{ justifySelf: 'center' }}>
                        <JourneyLine active={journeyActive} done={journeyDone} />
                    </div>
                )}

                {/* Language toggle */}
                <div className="header-lang" style={{
                    justifySelf: 'end', display: 'flex', gap: 4, padding: 3,
                    borderRadius: 999, background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.07)'
                }}>
                    {LANGS.map(l => {
                        const active = lang === l.code
                        return (
                            <button key={l.code} onClick={() => setLang(l.code)} style={{
                                border: 'none', cursor: 'pointer', padding: '6px 12px', borderRadius: 999,
                                fontFamily: "'Inter','Noto Sans Sinhala',sans-serif", fontSize: 12, fontWeight: 600,
                                color: active ? '#3D2785' : 'rgba(255,255,255,0.65)',
                                background: active ? 'linear-gradient(135deg,#FFE08A,#F5C800)' : 'transparent',
                                boxShadow: active ? '0 4px 12px rgba(245,200,0,0.45)' : 'none',
                                transition: 'all .25s'
                            }}>
                                {l.label}
                            </button>
                        )
                    })}
                </div>
            </div>
        </header>
    )
}