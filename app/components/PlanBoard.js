'use client'
import { t } from '../i18n'
import { useState } from 'react'
import Icon from './Icon'

function fmtLKR(n) { return 'LKR ' + Number(n).toLocaleString() }
function fmtDate(d) {
    if (!d) return ''
    const date = new Date(d + 'T00:00:00')
    return date.toLocaleDateString('en-LK', { weekday: 'long', month: 'long', day: 'numeric' })
}

const glass = {
    background: 'linear-gradient(135deg,rgba(255,255,255,0.70),rgba(255,255,255,0.55))',
    backdropFilter: 'blur(20px) saturate(160%)',
    WebkitBackdropFilter: 'blur(20px) saturate(160%)',
    borderWidth: 1,
    borderStyle: 'solid',
    borderTopColor: 'rgba(255,255,255,0.9)',
    borderLeftColor: 'rgba(255,255,255,0.9)',
    borderRightColor: 'rgba(61,39,133,0.12)',
    borderBottomColor: 'rgba(61,39,133,0.12)',
    boxShadow: '0 8px 32px rgba(61,39,133,0.08)',
}

function Divider() {
    return <div style={{ height: 1, background: 'rgba(61,39,133,0.10)', margin: '2px 0' }} />
}

function ItemRow({ item, idx }) {
    const [imgErr, setImgErr] = useState(false)
    return (
        <div className="rise" style={{
            display: 'flex', gap: 14, alignItems: 'center',
            animationDelay: `${0.1 + idx * 0.08}s`
        }}>
            <div style={{
                width: 58, height: 58, borderRadius: 14, overflow: 'hidden',
                flexShrink: 0, background: 'rgba(61,39,133,0.08)'
            }}>
                {(item.image_url && !imgErr)
                    ? <img src={item.image_url} alt={item.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        referrerPolicy="no-referrer"
                        onError={() => setImgErr(true)} />
                    : <div style={{
                        width: '100%', height: '100%', display: 'flex',
                        alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Icon name="gift" size={22} color="rgba(61,39,133,0.4)" />
                    </div>
                }
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                    fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600,
                    fontSize: 15, color: '#1A1433'
                }}>{item.name}</div>
                {item.icing_text && (
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 5,
                        padding: '3px 9px', borderRadius: 999, background: 'rgba(245,200,0,0.12)',
                        color: '#8a6d00', fontSize: 12, fontWeight: 600
                    }}>
                        <Icon name="pencil" size={11} color="#b08900" />
                        "{item.icing_text}"
                    </div>
                )}
            </div>
            <div style={{
                fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600,
                fontSize: 15, color: '#3D2785', fontVariantNumeric: 'tabular-nums', flexShrink: 0
            }}>
                {fmtLKR(item.price)}
                {item.quantity > 1 && <span style={{ fontSize: 12, opacity: .6 }}> ×{item.quantity}</span>}
            </div>
        </div>
    )
}

export default function PlanBoard({ plan, lang = 'EN', onAddRecipient, onCreateOrder, onAddItem, onEditGift }) {
    const [editingGift, setEditingGift] = useState(false)
    const [giftDraft, setGiftDraft] = useState(plan.gift_message || '')
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState({ name: '', phone: '', address: '' })
    const [errors, setErrors] = useState({})
    const [confirming, setConfirming] = useState(false)

    function submitRecipient() {
        const e = {}
        if (!form.name.trim()) e.name = true
        const digits = form.phone.replace(/[^\d]/g, '')
        if (digits.length < 9 || digits.length > 12) e.phone = true
        if (!form.address.trim()) e.address = true
        setErrors(e)
        if (Object.keys(e).length) return
        // One clean, unambiguous structured message — no free-text parsing guesswork
        onAddRecipient(`Recipient details — Name: ${form.name.trim()}; Phone: ${form.phone.trim()}; Address: ${form.address.trim()}`)
        setShowForm(false)
    }
    const delivery = plan.delivery || {}
    const recipient = plan.recipient || {}
    const hasRecipient = recipient.name
    const locked = !plan.needs_recipient && recipient.name
    const rowDelay = (() => { let i = 0; return () => ({ animationDelay: `${i++ * 0.1}s` }) })()

    const board = (
        <div className="plan-board" style={{
            ...glass, maxWidth: 560, width: '100%', margin: '8px auto',
            padding: 22, borderRadius: 26, animation: 'scaleIn .45s cubic-bezier(.2,.7,.2,1) both'
        }}>

            {/* Occasion title */}
            <div className="rise" style={rowDelay()}>
                <div style={{
                    fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700,
                    fontSize: 23, color: '#3D2785', letterSpacing: '-0.01em'
                }}>
                    {plan.occasion}
                </div>
                <div style={{ marginTop: 4, fontSize: 14, color: 'rgba(26,20,51,0.55)', lineHeight: 1.45 }}>
                    {plan.message}
                </div>
            </div>

            <div className="rise" style={{ margin: '14px 0', ...rowDelay() }}><Divider /></div>

            {/* Items */}
            {(plan.items || []).map((item, idx) => <ItemRow key={idx} item={item} idx={idx} />)}

            {/* Multi-item cart: invite the user to add more */}
            {onAddItem && (
                <button onClick={onAddItem} className="rise" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 12,
                    padding: '7px 14px', borderRadius: 999, cursor: 'pointer',
                    fontFamily: 'Inter', fontSize: 13, fontWeight: 600, color: '#3D2785',
                    background: 'rgba(61,39,133,0.06)',
                    border: '1.5px dashed rgba(61,39,133,0.30)', ...rowDelay()
                }}>
                    <Icon name="plus" size={14} color="#3D2785" stroke={2.4} /> {t(lang, 'planAddItem')}
                </button>
            )}

            <div className="rise" style={{ margin: '14px 0', ...rowDelay() }}><Divider /></div>

            {/* Delivery */}
            <div className="rise" style={{ display: 'flex', alignItems: 'center', gap: 12, ...rowDelay() }}>
                <div style={{
                    width: 34, height: 34, borderRadius: 10, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(61,39,133,0.09)', flexShrink: 0
                }}>
                    <Icon name="truck" size={18} color="#3D2785" />
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#1A1433' }}>
                        {plan.delivery.city}{plan.delivery.date && ` · ${fmtDate(plan.delivery.date)}`}
                    </div>
                    <div style={{ fontSize: 12.5, color: 'rgba(26,20,51,0.55)', marginTop: 1 }}>
                        {t(lang, 'planDeliveryTo')}: {fmtLKR(plan.delivery.fee)}
                    </div>
                </div>
                {plan.delivery.confirmed && (
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        background: 'rgba(14,159,110,0.12)', color: '#0E9F6E',
                        fontSize: 13, fontWeight: 600, padding: '5px 11px', borderRadius: 999, flexShrink: 0
                    }}>
                        <Icon name="check" size={14} color="#0E9F6E" stroke={2.4} /> {t(lang, 'planConfirmed')}
                    </span>
                )}
            </div>

            {/* Gift message — the paper card signature */}
            {plan.gift_message && (
                <div className="rise" style={{
                    position: 'relative', background: '#FFFDF6',
                    borderRadius: 11, padding: '18px 22px', margin: '18px 8px 14px',
                    transform: 'rotate(-1deg)', boxShadow: '0 12px 28px rgba(61,39,133,0.14), 0 2px 6px rgba(61,39,133,0.08)',
                    border: '1px solid rgba(0,0,0,0.04)', ...rowDelay()
                }}>
                    <div style={{
                        position: 'absolute', top: 10, left: 14, width: 8, height: 8,
                        borderRadius: '50%', background: 'rgba(245,200,0,0.55)',
                        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.15)'
                    }} />

                    {/* Edit pencil — gift messaging bonus, made tangible */}
                    {onEditGift && !editingGift && (
                        <button onClick={() => { setGiftDraft(plan.gift_message); setEditingGift(true) }}
                            aria-label={t(lang, 'planEditGift')}
                            style={{
                                position: 'absolute', top: 8, right: 10, width: 26, height: 26,
                                borderRadius: 8, border: 'none', cursor: 'pointer',
                                background: 'rgba(61,39,133,0.07)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                            <Icon name="pencil" size={13} color="#3D2785" />
                        </button>
                    )}

                    {editingGift ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <textarea value={giftDraft} onChange={e => setGiftDraft(e.target.value)}
                                rows={2}
                                style={{
                                    width: '100%', border: '1px solid rgba(61,39,133,0.2)',
                                    borderRadius: 8, padding: '10px 12px', resize: 'none',
                                    fontFamily: "'Noto Serif Sinhala','Noto Sans Sinhala',serif",
                                    fontStyle: 'italic', fontSize: 17, color: '#3D2785',
                                    textAlign: 'center', background: 'rgba(255,255,255,0.7)', outline: 'none'
                                }} />
                            <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                                <button onClick={() => setEditingGift(false)} style={{
                                    padding: '7px 14px', borderRadius: 999, border: '1px solid rgba(61,39,133,0.25)',
                                    background: 'transparent', color: '#3D2785', fontSize: 13, fontWeight: 600,
                                    cursor: 'pointer', fontFamily: 'Inter'
                                }}>{t(lang, 'planCancel')}</button>
                                <button onClick={() => { setEditingGift(false); onEditGift(giftDraft) }} style={{
                                    padding: '7px 16px', borderRadius: 999, border: 'none',
                                    background: 'linear-gradient(135deg,#FFE08A,#F5C800)', color: '#3D2785',
                                    fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter',
                                    boxShadow: '0 4px 12px rgba(245,200,0,0.4)'
                                }}>{t(lang, 'planSaveGift')}</button>
                            </div>
                        </div>
                    ) : (
                        <div style={{
                            fontFamily: "'Noto Serif Sinhala',serif", fontStyle: 'italic',
                            fontSize: 20, color: '#3D2785', textAlign: 'center', lineHeight: 1.5
                        }}>
                            {plan.gift_message}
                        </div>
                    )}
                </div>
            )}

            <div className="rise" style={{ margin: '4px 0 14px', ...rowDelay() }}><Divider /></div>

            {/* Recipient */}
            <div className="rise" style={{ display: 'flex', alignItems: 'center', gap: 12, ...rowDelay() }}>
                <div style={{
                    width: 34, height: 34, borderRadius: 10, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    background: hasRecipient ? 'rgba(14,159,110,0.12)' : 'rgba(61,39,133,0.08)', flexShrink: 0
                }}>
                    <Icon name="user" size={18} color={hasRecipient ? '#0E9F6E' : 'rgba(61,39,133,0.7)'} />
                </div>
                {hasRecipient ? (
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 600, color: '#1A1433' }}>{plan.recipient.name}</div>
                        {plan.recipient.phone && (
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 5, fontSize: 13,
                                color: 'rgba(26,20,51,0.55)', marginTop: 2
                            }}>
                                <Icon name="phone" size={13} color="rgba(26,20,51,0.45)" /> {plan.recipient.phone}
                            </div>
                        )}
                    </div>
                ) : (
                    <div style={{ flex: 1, fontSize: 14.5, color: 'rgba(26,20,51,0.5)' }}>
                        No recipient yet
                    </div>
                )}
            </div>

            {/* Inline recipient form — structured fields beat free-text parsing */}
            {showForm && !hasRecipient && (
                <div style={{
                    marginTop: 14, padding: 16, borderRadius: 16,
                    background: 'rgba(61,39,133,0.04)',
                    border: '1px solid rgba(61,39,133,0.12)',
                    animation: 'scaleIn .3s cubic-bezier(.2,.7,.2,1) both'
                }}>
                    <div style={{
                        fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600,
                        fontSize: 15, color: '#3D2785', marginBottom: 12
                    }}>{t(lang, 'recipFormTitle')}</div>

                    {[
                        { key: 'name', label: t(lang, 'recipName'), ph: t(lang, 'recipNamePh'), err: t(lang, 'recipNameErr'), type: 'text', mode: undefined },
                        { key: 'phone', label: t(lang, 'recipPhone'), ph: t(lang, 'recipPhonePh'), err: t(lang, 'recipPhoneErr'), type: 'tel', mode: 'tel' },
                        { key: 'address', label: t(lang, 'recipAddress'), ph: t(lang, 'recipAddressPh'), err: t(lang, 'recipAddressErr'), type: 'text', mode: undefined },
                    ].map(f => (
                        <div key={f.key} style={{ marginBottom: 12 }}>
                            <label style={{
                                display: 'block', fontSize: 12.5, fontWeight: 600,
                                color: 'rgba(26,20,51,0.6)', marginBottom: 5, fontFamily: 'Inter'
                            }}>{f.label}</label>
                            <input
                                type={f.type}
                                inputMode={f.mode}
                                value={form[f.key]}
                                placeholder={f.ph}
                                onChange={e => { setForm(p => ({ ...p, [f.key]: e.target.value })); if (errors[f.key]) setErrors(p => ({ ...p, [f.key]: false })) }}
                                style={{
                                    width: '100%', boxSizing: 'border-box', padding: '11px 13px',
                                    borderRadius: 10, fontSize: 15, fontFamily: 'Inter',
                                    background: '#fff', outline: 'none', color: '#1A1433',
                                    border: errors[f.key] ? '1.5px solid #E05252' : '1px solid rgba(61,39,133,0.2)',
                                    transition: 'border-color .2s'
                                }}
                                onFocus={e => { if (!errors[f.key]) e.target.style.borderColor = '#5A3FB0' }}
                                onBlur={e => { if (!errors[f.key]) e.target.style.borderColor = 'rgba(61,39,133,0.2)' }}
                            />
                            {errors[f.key] && (
                                <div style={{ fontSize: 12, color: '#E05252', marginTop: 4, fontFamily: 'Inter' }}>{f.err}</div>
                            )}
                        </div>
                    ))}

                    <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                        <button onClick={() => setShowForm(false)} style={{
                            padding: '10px 16px', borderRadius: 10, cursor: 'pointer',
                            background: 'transparent', border: '1px solid rgba(61,39,133,0.25)',
                            color: '#3D2785', fontSize: 14, fontWeight: 600, fontFamily: 'Inter'
                        }}>{t(lang, 'recipCancel')}</button>
                        <button onClick={submitRecipient} style={{
                            flex: 1, padding: '10px 16px', borderRadius: 10, cursor: 'pointer',
                            background: 'linear-gradient(135deg,#FFE08A,#F5C800)', border: 'none',
                            color: '#3D2785', fontSize: 14.5, fontWeight: 700, fontFamily: 'Inter',
                            boxShadow: '0 4px 14px rgba(245,200,0,0.4)'
                        }}>{t(lang, 'recipConfirm')}</button>
                    </div>
                </div>
            )}

            <div className="rise" style={{ margin: '16px 0 4px', ...rowDelay() }}><Divider /></div>

            {/* Footer */}
            <div className="rise" style={{
                display: 'flex', alignItems: 'center', flexWrap: 'wrap',
                justifyContent: 'space-between', gap: 14, marginTop: 6, ...rowDelay()
            }}>
                <div>
                    <div style={{
                        fontSize: 12, color: 'rgba(26,20,51,0.55)', textTransform: 'uppercase',
                        letterSpacing: '0.06em', fontWeight: 600
                    }}>Total</div>
                    <div className="plan-total" style={{
                        fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700,
                        fontSize: 26, color: '#3D2785', fontVariantNumeric: 'tabular-nums'
                    }}>
                        {fmtLKR(plan.total)}
                    </div>
                </div>

                {hasRecipient ? (
                    confirming ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                            <div style={{
                                fontSize: 12.5, color: 'rgba(26,20,51,0.6)', fontFamily: 'Inter',
                                fontWeight: 600, textAlign: 'right'
                            }}>{t(lang, 'reviewTitle')}</div>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                <button onClick={() => setConfirming(false)} style={{
                                    padding: '11px 16px', borderRadius: 12, cursor: 'pointer',
                                    background: 'transparent', border: '1px solid rgba(61,39,133,0.3)',
                                    color: '#3D2785', fontSize: 13.5, fontWeight: 600, fontFamily: 'Inter'
                                }}>{t(lang, 'reviewEdit')}</button>
                                <button onClick={onCreateOrder} className="plan-cta" style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 7,
                                    background: 'linear-gradient(135deg,#FFE08A,#F5C800)', color: '#3D2785',
                                    fontWeight: 700, fontSize: 14.5, padding: '11px 18px', border: 'none',
                                    borderRadius: 12, cursor: 'pointer', boxShadow: '0 8px 24px rgba(245,200,0,0.45)',
                                    fontFamily: 'Inter'
                                }}>
                                    <Icon name="check" size={16} color="#3D2785" stroke={2.4} /> {t(lang, 'reviewConfirm')}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button onClick={() => setConfirming(true)} className="plan-cta" style={{
                            display: 'inline-flex', alignItems: 'center',
                            gap: 8, background: 'linear-gradient(135deg,#FFE08A,#F5C800)', color: '#3D2785',
                            fontWeight: 700, fontSize: 16, padding: '13px 22px', border: 'none',
                            borderRadius: 14, cursor: 'pointer', boxShadow: '0 8px 24px rgba(245,200,0,0.45)',
                            fontFamily: 'Inter'
                        }}>
                            {t(lang, 'planCreateOrder')} <Icon name="arrow-right" size={18} color="#3D2785" stroke={2} />
                        </button>
                    )
                ) : (
                    <button onClick={() => setShowForm(s => !s)} className="plan-cta" style={{
                        display: 'inline-flex', alignItems: 'center',
                        gap: 8, background: 'rgba(255,255,255,0.5)', color: '#3D2785', fontWeight: 600,
                        fontSize: 15, padding: '12px 20px', border: '1px solid rgba(61,39,133,0.3)',
                        borderRadius: 14, cursor: 'pointer', fontFamily: 'Inter'
                    }}>
                        <Icon name="user" size={17} color="#3D2785" /> {t(lang, 'planAddRecipient')}
                    </button>
                )}
            </div>
        </div>
    )

    // Yellow frame when complete
    if (hasRecipient) {
        return (
            <div style={{
                borderRadius: 28, padding: 2, margin: '8px auto', maxWidth: 564,
                background: 'linear-gradient(135deg,#FFE08A,#F5C800,#FFE08A)',
                boxShadow: '0 14px 40px rgba(245,200,0,0.22)'
            }}>
                {board}
            </div>
        )
    }
    return board
}