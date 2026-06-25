'use client'
import { t } from '../i18n'
import { useState } from 'react'
import Icon from './Icon'

const DATE_LOCALE = { EN: 'en-LK', SI: 'si-LK', TA: 'ta-LK' }
function fmtDateTime(iso, lang = 'EN') {
    if (!iso) return ''
    const d = new Date(iso)
    if (isNaN(d.getTime())) return ''
    try {
        return d.toLocaleString(DATE_LOCALE[lang] || 'en-LK', {
            day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit'
        })
    } catch {
        return d.toLocaleString('en-LK', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })
    }
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

// Pick a step icon based on its position/label — falls back sensibly for any tool wording
function stepIcon(label = '', isLast) {
    const s = label.toLowerCase()
    if (s.includes('deliver') && !s.includes('out')) return 'check'
    if (s.includes('out') || s.includes('transit') || s.includes('way')) return 'truck'
    if (s.includes('process') || s.includes('confirm') || s.includes('pack')) return 'package'
    if (s.includes('place') || s.includes('receiv')) return 'package'
    return isLast ? 'compass' : 'check'
}

export default function TrackingCard({ data, lang = 'EN', onTrackAnother }) {
    const [copied, setCopied] = useState(false)
    if (!data) return null

    const { order_number, status, recipient, items, timeline } = data
    const steps = Array.isArray(timeline) ? timeline : []

    function copyNumber() {
        if (!order_number) return
        navigator.clipboard?.writeText(order_number).then(() => {
            setCopied(true); setTimeout(() => setCopied(false), 1800)
        }).catch(() => { })
    }

    return (
        <div style={{
            position: 'relative', maxWidth: 430, margin: '10px auto',
            borderRadius: 26, padding: 2,
            background: 'linear-gradient(135deg,#C8BFEF,#3D2785,#C8BFEF)',
            boxShadow: '0 16px 44px rgba(61,39,133,0.22)',
            animation: 'riseBlur .55s cubic-bezier(.2,.7,.2,1) both', overflow: 'hidden'
        }}>
            <div style={{ ...glass, borderRadius: 24, padding: 24, position: 'relative' }}>

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                    <div style={{
                        width: 34, height: 34, borderRadius: 10, display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(61,39,133,0.10)'
                    }}>
                        <Icon name="truck" size={18} color="#3D2785" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                            fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700,
                            fontSize: 16, color: '#3D2785'
                        }}>{t(lang, 'trackingTitle')}</div>
                        {order_number && (
                            <button onClick={copyNumber} title={t(lang, 'copyOrderNumber')} style={{
                                display: 'inline-flex', alignItems: 'center', gap: 5,
                                fontSize: 12.5, color: copied ? '#0E9F6E' : 'rgba(26,20,51,0.55)',
                                letterSpacing: '0.03em', marginTop: 1, cursor: 'pointer',
                                background: 'none', border: 'none', padding: 0, fontFamily: 'Inter'
                            }}>
                                {order_number}
                                <Icon name={copied ? 'check' : 'copy'} size={12}
                                    color={copied ? '#0E9F6E' : 'rgba(26,20,51,0.45)'} />
                                {copied && <span style={{ fontWeight: 600 }}>{t(lang, 'copied')}</span>}
                            </button>
                        )}
                    </div>
                    {/* Status badge */}
                    {status && (
                        <div style={{
                            flexShrink: 0, padding: '6px 12px', borderRadius: 999,
                            background: 'linear-gradient(135deg,#FFE08A,#F5C800)',
                            color: '#3D2785', fontWeight: 700, fontSize: 12,
                            fontFamily: 'Inter', whiteSpace: 'nowrap',
                            boxShadow: '0 4px 12px rgba(245,200,0,0.35)'
                        }}>
                            {status}
                        </div>
                    )}
                </div>

                {/* Recipient + items */}
                {(recipient?.name || items?.length > 0) && (
                    <div style={{
                        background: 'rgba(61,39,133,0.05)', borderRadius: 14,
                        padding: '12px 14px', marginBottom: 18
                    }}>
                        {recipient?.name && (
                            <div style={{
                                display: 'flex', alignItems: 'flex-start', gap: 6,
                                fontSize: 12.5, color: 'rgba(26,20,51,0.6)', fontFamily: 'Inter',
                                paddingBottom: items?.length > 0 ? 8 : 0,
                                borderBottom: items?.length > 0 ? '1px solid rgba(61,39,133,0.12)' : 'none',
                                marginBottom: items?.length > 0 ? 8 : 0
                            }}>
                                <Icon name="map-pin" size={13} color="rgba(61,39,133,0.55)" style={{ marginTop: 1, flexShrink: 0 }} />
                                <span style={{ minWidth: 0 }}>
                                    <strong style={{ fontWeight: 600, color: '#1A1433' }}>{recipient.name}</strong>
                                    {recipient.address ? ` · ${recipient.address}` : ''}
                                </span>
                            </div>
                        )}
                        {items?.length > 0 && (
                            <div>
                                <div style={{
                                    fontSize: 11, fontWeight: 700, color: 'rgba(61,39,133,0.5)',
                                    textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5
                                }}>{t(lang, 'trackingItems')}</div>
                                {items.map((it, i) => (
                                    <div key={i} style={{
                                        fontSize: 13.5, color: '#1A1433', fontFamily: 'Inter',
                                        padding: '2px 0'
                                    }}>
                                        {it.name}{it.quantity > 1 ? ` ×${it.quantity}` : ''}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Timeline */}
                {steps.length > 0 && (
                    <div style={{ margin: '4px 2px 20px' }}>
                        {steps.map((step, i) => {
                            const isLastStep = i === steps.length - 1
                            const done = !!step.done
                            const active = done && (i === steps.length - 1 || !steps[i + 1]?.done)
                            return (
                                <div key={i} style={{ display: 'flex', gap: 12, position: 'relative' }}>
                                    {/* Connector line */}
                                    {!isLastStep && (
                                        <div style={{
                                            position: 'absolute', left: 11, top: 26, bottom: -6, width: 2,
                                            background: done && steps[i + 1]?.done
                                                ? '#F5C800'
                                                : 'rgba(61,39,133,0.14)'
                                        }} />
                                    )}
                                    {/* Dot */}
                                    <div style={{
                                        position: 'relative', zIndex: 1, flexShrink: 0,
                                        width: 24, height: 24, borderRadius: '50%',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: done
                                            ? (active ? 'linear-gradient(135deg,#FFE08A,#F5C800)' : 'rgba(61,39,133,0.12)')
                                            : 'transparent',
                                        border: done ? 'none' : '1.5px dashed rgba(61,39,133,0.30)',
                                        boxShadow: active ? '0 0 0 4px rgba(245,200,0,0.18)' : 'none'
                                    }}>
                                        <Icon
                                            name={stepIcon(step.label, isLastStep)}
                                            size={12}
                                            color={done ? '#3D2785' : 'rgba(61,39,133,0.35)'}
                                            stroke={2.4}
                                        />
                                    </div>
                                    {/* Label + timestamp */}
                                    <div style={{ paddingBottom: isLastStep ? 0 : 18, minWidth: 0, flex: 1 }}>
                                        <div style={{
                                            fontSize: 14, fontWeight: active ? 700 : 600,
                                            color: done ? '#1A1433' : 'rgba(26,20,51,0.45)',
                                            fontFamily: 'Inter'
                                        }}>
                                            {step.label}
                                        </div>
                                        {step.timestamp && (
                                            <div style={{
                                                fontSize: 12, color: 'rgba(26,20,51,0.5)',
                                                marginTop: 1, fontVariantNumeric: 'tabular-nums'
                                            }}>
                                                {fmtDateTime(step.timestamp, lang)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {onTrackAnother && (
                    <button onClick={onTrackAnother} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                        width: '100%', padding: '12px', border: '1px solid rgba(61,39,133,0.2)',
                        borderRadius: 12, cursor: 'pointer', background: 'transparent',
                        color: '#3D2785', fontWeight: 600, fontSize: 14, fontFamily: 'Inter'
                    }}>
                        <Icon name="compass" size={15} color="#3D2785" />
                        {t(lang, 'trackAnother')}
                    </button>
                )}
            </div>
        </div>
    )
}
