'use client'
import { useEffect, useRef, useState } from 'react'
import { t } from '../i18n'
import LockedCard from './LockedCard'
import TrackingCard from './TrackingCard'
import FlowOrb from './FlowOrb'

// ── OrderStageCard — the "wrap-morph" ────────────────────────────────────────
// Renders LockedCard. The moment trackingData lands on this same message
// (merged in place by page.js — see handleOrderComplete's silent auto-track),
// it plays a gold ribbon sweep and crossfades into TrackingCard, in the exact
// same card position. Checkout and "where's my order" stop being two cards
// that pop in and out — they read as one object that gets wrapped and ships.
//
// If trackingData is never merged in (auto-track failed, or the user tracks a
// totally different/older order later via the manual chip), this renders
// exactly like the plain LockedCard always did — the morph is pure upside,
// never a dependency.
const WRAP_MS = 900

export default function OrderStageCard({ checkoutData, plan, trackingData, lang = 'EN', onComplete, onTrackAnother }) {
    // If trackingData is already present on first paint (edge case), skip
    // straight to 'tracking' — no animation to play for a state the user
    // never saw "locked" in.
    const [phase, setPhase] = useState(trackingData ? 'tracking' : 'locked')
    const wrapTimer = useRef(null)

    useEffect(() => {
        if (trackingData && phase === 'locked') {
            setPhase('wrapping')
            wrapTimer.current = setTimeout(() => setPhase('tracking'), WRAP_MS)
        }
        return () => clearTimeout(wrapTimer.current)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [trackingData])

    const showBoth = phase !== 'locked' // grid-overlap only kicks in once tracking data exists
    const lockedVisible = phase !== 'tracking'
    const trackingVisible = phase !== 'locked'

    return (
        <div style={{ position: 'relative', display: showBoth ? 'grid' : 'block' }}>
            {/* Locked face — fades out once the wrap completes */}
            <div style={{
                gridArea: showBoth ? '1 / 1' : undefined,
                opacity: lockedVisible ? 1 : 0,
                transition: 'opacity .55s ease',
                pointerEvents: lockedVisible ? 'auto' : 'none'
            }}>
                <LockedCard url={checkoutData?.url} orderRef={checkoutData?.ref}
                    expiresAt={checkoutData?.expiresAt} plan={plan} lang={lang}
                    onComplete={onComplete} />
            </div>

            {/* Tracking face — crossfades in underneath the ribbon */}
            {trackingData && (
                <div style={{
                    gridArea: '1 / 1',
                    opacity: trackingVisible ? 1 : 0,
                    transition: 'opacity .55s ease .35s',
                    pointerEvents: trackingVisible ? 'auto' : 'none'
                }}>
                    <TrackingCard data={trackingData} lang={lang} onTrackAnother={onTrackAnother} />
                </div>
            )}

            {/* Ribbon wrap — plays once, on top of both faces, while they swap underneath */}
            {phase === 'wrapping' && (
                <div aria-hidden="true" style={{
                    gridArea: showBoth ? '1 / 1' : undefined,
                    position: 'absolute', inset: 0, overflow: 'hidden',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    pointerEvents: 'none', borderRadius: 26
                }}>
                    <span className="wrap-ribbon wrap-ribbon-a" />
                    <span className="wrap-ribbon wrap-ribbon-b" />
                    <div style={{
                        position: 'absolute', display: 'flex', flexDirection: 'column',
                        alignItems: 'center', gap: 8,
                        animation: 'fadeIn .3s ease-out .15s both'
                    }}>
                        <FlowOrb state="done" size={40} />
                        <span style={{
                            fontFamily: 'Inter', fontWeight: 600, fontSize: 12.5,
                            color: '#3D2785', background: 'rgba(255,255,255,0.92)',
                            padding: '4px 11px', borderRadius: 999,
                            boxShadow: '0 4px 14px rgba(61,39,133,0.18)', whiteSpace: 'nowrap'
                        }}>
                            {t(lang, 'wrappingGift')}
                        </span>
                    </div>
                </div>
            )}
        </div>
    )
}
