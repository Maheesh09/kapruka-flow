'use client'
import { useState, useEffect } from 'react'
import Icon from './Icon'

function fmtTime(secs) {
    const m = Math.floor(secs / 60), s = secs % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const glass = {
    background: 'linear-gradient(135deg,rgba(255,255,255,0.84),rgba(255,255,255,0.72))',
    backdropFilter: 'blur(20px) saturate(160%)',
    WebkitBackdropFilter: 'blur(20px) saturate(160%)',
    borderWidth: 1,
    borderStyle: 'solid',
    borderTopColor: 'rgba(255,255,255,0.9)',
    borderLeftColor: 'rgba(255,255,255,0.9)',
    borderRightColor: 'rgba(61,39,133,0.12)',
    borderBottomColor: 'rgba(61,39,133,0.12)',
}

export default function LockedCard({ url, orderRef, expiresAt }) {
    const [secs, setSecs] = useState(null)
    const [paid, setPaid] = useState(false)
    const TOTAL = 3600

    useEffect(() => {
        if (!expiresAt) { setSecs(3582); return }
        const end = new Date(expiresAt).getTime()
        const tick = () => {
            const diff = Math.floor((end - Date.now()) / 1000)
            setSecs(isNaN(diff) ? 0 : Math.max(0, diff))
        }
        tick()
        const id = setInterval(tick, 1000)
        return () => clearInterval(id)
    }, [expiresAt])

    const rem = (secs !== null && !isNaN(secs)) ? secs : 3582
    const R = 50, C = 2 * Math.PI * R
    const offset = C * (1 - rem / TOTAL)
    const expired = rem === 0

    return (
        <div style={{
            position: 'relative', maxWidth: 430, margin: '10px auto',
            borderRadius: 26, padding: 2,
            background: expired ? 'rgba(200,200,200,0.3)' : 'linear-gradient(135deg,#FFE08A,#F5C800,#FFE08A)',
            boxShadow: expired ? 'none' : '0 16px 44px rgba(245,200,0,0.30)',
            animation: 'riseBlur .55s cubic-bezier(.2,.7,.2,1) both', overflow: 'hidden'
        }}>

            {/* Shimmer on entry */}
            <div style={{
                position: 'absolute', inset: 0, overflow: 'hidden',
                borderRadius: 26, pointerEvents: 'none'
            }}>
                <div style={{
                    position: 'absolute', top: 0, bottom: 0, width: '40%',
                    background: 'linear-gradient(100deg,rgba(255,255,255,0) 0%,rgba(255,255,255,0.7) 50%,rgba(255,255,255,0) 100%)',
                    animation: 'shimmerOnce 1.1s ease-out .3s both'
                }} />
            </div>

            <div className="locked-card-inner" style={{ ...glass, borderRadius: 24, padding: 24, position: 'relative' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                    <div style={{
                        width: 34, height: 34, borderRadius: 10, display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(245,200,0,0.16)'
                    }}>
                        <Icon name="lock" size={18} color="#b08900" />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{
                            fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700,
                            fontSize: 16, color: '#3D2785'
                        }}>Order locked</div>
                        {orderRef && (
                            <div style={{
                                fontSize: 12.5, color: 'rgba(26,20,51,0.55)',
                                letterSpacing: '0.03em', marginTop: 1
                            }}>{orderRef}</div>
                        )}
                    </div>
                </div>

                {/* Countdown ring */}
                <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    gap: 6, margin: '6px 0 20px'
                }}>
                    <div style={{ position: 'relative', width: 124, height: 124 }}>
                        <svg width={124} height={124} viewBox="0 0 124 124"
                            style={{ transform: 'rotate(-90deg)' }}>
                            <circle cx={62} cy={62} r={R} fill="none"
                                stroke="rgba(61,39,133,0.12)" strokeWidth={7} />
                            <circle cx={62} cy={62} r={R} fill="none"
                                stroke={expired ? 'rgba(200,200,200,0.5)' : '#F5C800'} strokeWidth={7}
                                strokeLinecap="round" strokeDasharray={C} strokeDashoffset={offset}
                                style={{ transition: 'stroke-dashoffset 1s linear' }} />
                        </svg>
                        <div style={{
                            position: 'absolute', inset: 0, display: 'flex',
                            flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <div style={{
                                fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700,
                                fontSize: 30, color: expired ? '#999' : '#3D2785',
                                fontVariantNumeric: 'tabular-nums', letterSpacing: '0.01em'
                            }}>
                                {fmtTime(rem)}
                            </div>
                            <div style={{
                                fontSize: 10.5, color: 'rgba(26,20,51,0.5)',
                                textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2, fontWeight: 600
                            }}>
                                {expired ? 'expired' : 'remaining'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pay button */}
                <a href={expired ? undefined : url} target="_blank" rel="noopener noreferrer"
                    onClick={() => !expired && setPaid(true)}
                    style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        width: '100%', padding: '14px', border: 'none', borderRadius: 14, cursor: expired ? 'default' : 'pointer',
                        background: paid ? 'rgba(14,159,110,0.14)' : expired ? 'rgba(200,200,200,0.3)' : 'linear-gradient(135deg,#FFE08A,#F5C800)',
                        color: paid ? '#0E9F6E' : expired ? '#999' : '#3D2785',
                        fontWeight: 700, fontSize: 16, fontFamily: 'Inter', textDecoration: 'none',
                        boxShadow: (paid || expired) ? 'none' : '0 8px 24px rgba(245,200,0,0.5)',
                        transition: 'all .3s', pointerEvents: expired ? 'none' : 'auto'
                    }}>
                    {paid && <Icon name="check" size={18} color="#0E9F6E" stroke={2.4} />}
                    {paid ? 'Opening checkout…' : expired ? 'Link expired' : 'Pay now'}
                    {!paid && !expired && <Icon name="arrow-right" size={18} color="#3D2785" stroke={2} />}
                </a>

                <div style={{
                    textAlign: 'center', fontSize: 12, color: 'rgba(26,20,51,0.5)',
                    marginTop: 11, lineHeight: 1.4
                }}>
                    Secure payment on Kapruka.com — no account needed
                </div>
            </div>
        </div>
    )
}