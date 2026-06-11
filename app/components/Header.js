'use client'
import Icon from './Icon'

const NODES = ['Goal', 'Discover', 'Plan', 'Delivery', 'Done']

function JourneyLine({ active, done }) {
    const fill = (active / (NODES.length - 1)) * 100
    return (
        <div style={{
            position: 'relative', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', width: 'min(400px,40vw)', minWidth: 220, height: 30
        }}>
            {/* Track */}
            <div style={{
                position: 'absolute', left: 7, right: 7, top: '50%', height: 2,
                background: 'rgba(255,255,255,0.22)', transform: 'translateY(-50%)', borderRadius: 2
            }} />
            {/* Fill */}
            <div style={{
                position: 'absolute', left: 7, top: '50%', height: 2,
                width: `calc((100% - 14px) * ${fill / 100})`,
                background: 'linear-gradient(90deg, rgba(255,255,255,0.95), #F5C800)',
                transform: 'translateY(-50%)', borderRadius: 2, transition: 'width .6s ease'
            }} />
            {/* Nodes */}
            {NODES.map((label, i) => {
                const isActive = i === active
                const isDone = done.includes(i) && !isActive
                return (
                    <div key={i} style={{
                        position: 'relative', zIndex: 2, display: 'flex',
                        alignItems: 'center', justifyContent: 'center', width: 16, height: 16
                    }}>
                        <div style={{
                            width: isActive ? 14 : 10, height: isActive ? 14 : 10,
                            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: isActive ? '#FFFFFF' : isDone ? '#F5C800' : 'rgba(255,255,255,0.30)',
                            animation: isActive ? 'haloLight 2s ease-in-out infinite' : 'none',
                            transition: 'all .4s'
                        }}>
                            {isDone && <Icon name="check" size={7} color="#3D2785" stroke={3.2} />}
                        </div>
                        {/* Label: always show for active, hover handled via CSS title */}
                        {isActive && (
                            <div style={{
                                position: 'absolute', top: 18, left: '50%', transform: 'translateX(-50%)',
                                fontSize: 10, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap',
                                fontFamily: 'Inter', animation: 'fadeIn .25s'
                            }}>
                                {label}
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}

export default function Header({ lang, setLang, journeyActive, journeyDone }) {
    const LANGS = [{ code: 'EN', label: 'EN' }, { code: 'SI', label: 'සිං' }, { code: 'TG', label: 'TG' }]
    return (
        <header style={{
            position: 'absolute', top: 0, left: 0, right: 0, zIndex: 30,
            display: 'flex', justifyContent: 'center', padding: '18px 18px 0'
        }}>
            <div style={{
                display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center',
                gap: 24, width: 'min(1180px,96%)', padding: '14px 24px',
                borderRadius: 20, background: 'linear-gradient(135deg, #3D2785, #2C1C66)',
                border: '1px solid rgba(255,255,255,0.10)',
                boxShadow: '0 14px 40px rgba(44,28,102,0.42), inset 0 1px 0 rgba(255,255,255,0.12)'
            }}>

                {/* Wordmark */}
                <div style={{ justifySelf: 'start', display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                    <div style={{
                        fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700,
                        fontSize: 21, letterSpacing: '-0.02em', lineHeight: 1
                    }}>
                        <span style={{ color: '#FFFFFF' }}>kapruka</span>{' '}
                        <span style={{ color: '#F5C800' }}>flow</span>
                    </div>
                    <svg width="22" height="11" viewBox="0 0 22 11" style={{ marginBottom: 2 }}>
                        <path d="M2 2 Q11 13 20 2" stroke="#F5C800" strokeWidth="3" fill="none" strokeLinecap="round" />
                    </svg>
                </div>

                {/* Journey */}
                <div style={{ justifySelf: 'center' }}>
                    <JourneyLine active={journeyActive} done={journeyDone} />
                </div>

                {/* Language toggle */}
                <div style={{
                    justifySelf: 'end', display: 'flex', gap: 4, padding: 3,
                    borderRadius: 999, background: 'rgba(255,255,255,0.10)',
                    border: '1px solid rgba(255,255,255,0.08)'
                }}>
                    {LANGS.map(l => {
                        const active = lang === l.code
                        return (
                            <button key={l.code} onClick={() => setLang(l.code)} style={{
                                border: 'none', cursor: 'pointer', padding: '6px 12px', borderRadius: 999,
                                fontFamily: "'Inter','Noto Sans Sinhala',sans-serif", fontSize: 13, fontWeight: 600,
                                color: active ? '#3D2785' : 'rgba(255,255,255,0.72)',
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