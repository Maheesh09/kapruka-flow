'use client';
import { useState, useRef, useEffect } from 'react';

// ─── Plan Board Card ──────────────────────────────────────────────────────────

function PlanBoardCard({ plan, onAction }) {
  const fmt = (n) => `LKR ${Number(n).toLocaleString()}`;
  const fmtDate = (d) => {
    if (!d) return '';
    const date = new Date(d + 'T00:00:00');
    return date.toLocaleDateString('en-LK', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  return (
    <div style={{
      background: '#fff',
      border: '1.5px solid #3d2785',
      borderRadius: 16,
      overflow: 'hidden',
      maxWidth: 480,
      alignSelf: 'flex-start',
      boxShadow: '0 2px 12px rgba(61,39,133,0.10)'
    }}>

      {/* Header */}
      <div style={{
        background: '#3d2785',
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: 10
      }}>
        <span style={{ fontSize: 20 }}>🎁</span>
        <div>
          <p style={{ color: '#fff', fontWeight: 600, fontSize: 15, margin: 0 }}>
            {plan.occasion}
          </p>
          {plan.message && (
            <p style={{ color: '#c4b8f0', fontSize: 12, margin: '2px 0 0' }}>
              {plan.message}
            </p>
          )}
        </div>
      </div>

      {/* Items */}
      <div style={{ padding: '14px 18px', borderBottom: '1px solid #f0ecff' }}>
        {plan.items.map((item, i) => (
          <div key={i} style={{
            display: 'flex',
            gap: 12,
            alignItems: 'center',
            marginBottom: i < plan.items.length - 1 ? 12 : 0
          }}>
            {/* Product image or placeholder */}
            <div style={{
              width: 60,
              height: 60,
              borderRadius: 10,
              background: '#f0ecff',
              flexShrink: 0,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={e => { e.target.style.display = 'none'; }}
                />
              ) : (
                <span style={{ fontSize: 24 }}>🛍️</span>
              )}
            </div>

            {/* Product info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontSize: 13,
                fontWeight: 600,
                margin: 0,
                color: '#1a1a2e',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {item.name}
              </p>
              {item.icing_text && (
                <p style={{ fontSize: 11, color: '#7c6cbf', margin: '2px 0 0' }}>
                  Icing: "{item.icing_text}"
                </p>
              )}
              <p style={{ fontSize: 12, color: '#3d2785', fontWeight: 600, margin: '4px 0 0' }}>
                {fmt(item.price)} × {item.quantity}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Delivery info */}
      <div style={{
        padding: '12px 18px',
        background: '#faf9ff',
        borderBottom: '1px solid #f0ecff',
        display: 'flex',
        flexDirection: 'column',
        gap: 6
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
          <span>🚚</span>
          <span style={{ color: '#444' }}>
            <strong>{plan.delivery.city}</strong>
            {plan.delivery.date && ` · ${fmtDate(plan.delivery.date)}`}
          </span>
          {plan.delivery.confirmed && (
            <span style={{
              fontSize: 11,
              background: '#e8f5e9',
              color: '#2e7d32',
              padding: '2px 8px',
              borderRadius: 999,
              marginLeft: 'auto'
            }}>
              ✓ Confirmed
            </span>
          )}
        </div>

        {plan.gift_message && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13 }}>
            <span>✉️</span>
            <span style={{ color: '#555', fontStyle: 'italic' }}>"{plan.gift_message}"</span>
          </div>
        )}

        {plan.recipient?.name && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <span>👤</span>
            <span style={{ color: '#444' }}>
              {plan.recipient.name}
              {plan.recipient.phone && ` · ${plan.recipient.phone}`}
            </span>
          </div>
        )}
      </div>

      {/* Total + Action */}
      <div style={{
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <p style={{ fontSize: 11, color: '#999', margin: 0 }}>
            Items {fmt(plan.subtotal)} + Delivery {fmt(plan.delivery_fee)}
          </p>
          <p style={{ fontSize: 17, fontWeight: 700, color: '#3d2785', margin: '2px 0 0' }}>
            {fmt(plan.total)}
          </p>
        </div>

        <button
          onClick={() => onAction(plan)}
          style={{
            background: plan.needs_recipient ? '#fff' : '#f5c800',
            color: plan.needs_recipient ? '#3d2785' : '#1a1a2e',
            border: plan.needs_recipient ? '1.5px solid #3d2785' : 'none',
            borderRadius: 10,
            padding: '10px 18px',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          {plan.needs_recipient ? 'Add Recipient →' : 'Create Order →'}
        </button>
      </div>
    </div>
  );
}

// ─── Checkout Card ────────────────────────────────────────────────────────────

function CheckoutCard({ url, orderRef, expiresAt }) {
  const [secondsLeft, setSecondsLeft] = useState(null);

  useEffect(() => {
    if (!expiresAt) return;
    const end = new Date(expiresAt).getTime();
    const tick = () => {
      const diff = Math.max(0, Math.floor((end - Date.now()) / 1000));
      setSecondsLeft(diff);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  const fmt = (s) => {
    if (s === null) return '';
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, '0')}`;
  };

  return (
    <div style={{
      background: '#fff',
      border: '1.5px solid #f5c800',
      borderRadius: 16,
      padding: '18px',
      maxWidth: 400,
      alignSelf: 'flex-start'
    }}>
      <p style={{ fontSize: 15, fontWeight: 600, margin: '0 0 4px', color: '#1a1a2e' }}>
        ✅ Order ready to pay
      </p>
      {orderRef && (
        <p style={{ fontSize: 12, color: '#888', margin: '0 0 14px' }}>Ref: {orderRef}</p>
      )}

      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'block',
          background: '#3d2785',
          color: '#fff',
          textAlign: 'center',
          padding: '12px',
          borderRadius: 10,
          fontWeight: 600,
          fontSize: 14,
          textDecoration: 'none',
          marginBottom: 10
        }}
      >
        Pay Now →
      </a>

      {secondsLeft !== null && secondsLeft > 0 && (
        <p style={{ fontSize: 12, color: '#e67e22', textAlign: 'center', margin: 0 }}>
          ⏱ Price locked for {fmt(secondsLeft)}
        </p>
      )}
      {secondsLeft === 0 && (
        <p style={{ fontSize: 12, color: '#e74c3c', textAlign: 'center', margin: 0 }}>
          ⚠️ Link expired — start a new order
        </p>
      )}
    </div>
  );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────

function MessageBubble({ msg, onPlanAction }) {
  if (msg.role === 'user') {
    return (
      <div style={{
        alignSelf: 'flex-end',
        maxWidth: '75%',
        background: '#3d2785',
        color: '#fff',
        padding: '10px 14px',
        borderRadius: '14px 14px 4px 14px',
        fontSize: 14,
        lineHeight: 1.6,
        whiteSpace: 'pre-wrap'
      }}>
        {msg.content}
      </div>
    );
  }

  if (msg.msgType === 'plan_board' && msg.plan) {
    return <PlanBoardCard plan={msg.plan} onAction={onPlanAction} />;
  }

  if (msg.msgType === 'checkout' && msg.checkoutData) {
    return (
      <CheckoutCard
        url={msg.checkoutData.url}
        orderRef={msg.checkoutData.ref}
        expiresAt={msg.checkoutData.expiresAt}
      />
    );
  }

  // Plain chat bubble
  return (
    <div style={{
      alignSelf: 'flex-start',
      maxWidth: '80%',
      background: '#fff',
      border: '1px solid #ece8ff',
      color: '#1a1a2e',
      padding: '10px 14px',
      borderRadius: '14px 14px 14px 4px',
      fontSize: 14,
      lineHeight: 1.7,
      whiteSpace: 'pre-wrap'
    }}>
      {msg.content}
    </div>
  );
}

// ─── Checkout URL Detector ────────────────────────────────────────────────────
// Parses checkout URLs from the Navigator's response text

function detectCheckout(text) {
  const urlMatch = text.match(/https:\/\/www\.kapruka\.com\/tools\/continue_order\.jsp\?id=[\w]+/);
  const refMatch = text.match(/ORD-[\w-]+/);
  const expiresMatch = text.match(/(\d{4}-\d{2}-\d{2}T[\d:+.]+)/);

  if (!urlMatch) return null;
  return {
    url: urlMatch[0],
    ref: refMatch ? refMatch[0] : null,
    expiresAt: expiresMatch ? expiresMatch[0] : null
  };
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function sendMessage(overrideText = null) {
    const text = (overrideText ?? input).trim();
    if (!text || loading) return;

    if (!overrideText) setInput('');

    // Add user message to display
    const userMsg = { role: 'user', content: text, msgType: 'chat' };

    // Build history for the API — use rawContent for assistant messages
    // so Gemini sees the original response including PLAN_BOARD JSON
    const historyMessages = [...messages, userMsg].map(m => ({
      role: m.role,
      content: m.rawContent || m.content
    }));

    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: historyMessages })
      });

      const data = await res.json();

      if (data.error) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `Something went wrong: ${data.error}`,
          msgType: 'chat',
          rawContent: `Error: ${data.error}`
        }]);
        return;
      }

      if (data.type === 'plan_board') {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.plan?.message || 'Here is your plan.',
          rawContent: data.rawText,
          msgType: 'plan_board',
          plan: data.plan
        }]);
        return;
      }

      // Check if the response contains a checkout URL
      const checkout = detectCheckout(data.text || '');
      if (checkout) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.text,
          rawContent: data.rawText || data.text,
          msgType: 'checkout',
          checkoutData: checkout
        }]);
        return;
      }

      // Plain chat message
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.text,
        rawContent: data.rawText || data.text,
        msgType: 'chat'
      }]);

    } catch (e) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Network error: ${e.message}`,
        msgType: 'chat'
      }]);
    } finally {
      setLoading(false);
    }
  }

  function handlePlanAction(plan) {
    if (plan.needs_recipient) {
      sendMessage("I'd like to complete this order. Please ask me for the recipient's name, phone number, and delivery address.");
    } else {
      const items = plan.items.map(i => i.name).join(', ');
      sendMessage(`Please create this order now: ${items} to ${plan.recipient?.name || 'the recipient'} at ${plan.recipient?.address || 'the address provided'}, ${plan.delivery.city} on ${plan.delivery.date}.`);
    }
  }

  return (
    <main style={{
      maxWidth: 680,
      margin: '0 auto',
      padding: '2rem 1rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#3d2785', margin: 0 }}>
          kapruka <span style={{ color: '#f5c800' }}>navigator</span>
        </h1>
        <p style={{ fontSize: 13, color: '#999', margin: '4px 0 0' }}>
          Phase 2 — Plan Board
        </p>
      </div>

      {/* Chat window */}
      <div style={{
        minHeight: 440,
        maxHeight: 'calc(100vh - 200px)',
        overflowY: 'auto',
        border: '1px solid #ece8ff',
        borderRadius: 16,
        padding: '1rem',
        marginBottom: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        background: '#faf9ff'
      }}>
        {messages.length === 0 && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            marginTop: 100
          }}>
            <p style={{ color: '#bbb', fontSize: 14, textAlign: 'center', margin: 0 }}>
              What are you trying to make happen today?
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
              {[
                'Birthday cake to Kandy on Saturday',
                'Chocolate gifts under LKR 5000',
                'Send flowers to Colombo tomorrow'
              ].map(q => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  style={{
                    background: '#fff',
                    border: '1px solid #ddd8f5',
                    borderRadius: 20,
                    padding: '7px 14px',
                    fontSize: 12,
                    color: '#3d2785',
                    cursor: 'pointer'
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <MessageBubble key={i} msg={m} onPlanAction={handlePlanAction} />
        ))}

        {loading && (
          <div style={{
            alignSelf: 'flex-start',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 13,
            color: '#999'
          }}>
            <div style={{
              width: 8, height: 8,
              background: '#3d2785',
              borderRadius: '50%',
              animation: 'pulse 1s infinite'
            }} />
            Navigator is thinking…
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input row */}
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="What are you trying to make happen today?"
          disabled={loading}
          style={{
            flex: 1,
            padding: '12px 16px',
            borderRadius: 12,
            border: '1px solid #ddd8f5',
            fontSize: 14,
            outline: 'none',
            background: '#fff',
            color: '#1a1a2e'
          }}
        />
        <button
          onClick={() => sendMessage()}
          disabled={loading}
          style={{
            background: loading ? '#9e8dd0' : '#3d2785',
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            padding: '12px 22px',
            fontSize: 14,
            fontWeight: 600,
            cursor: loading ? 'default' : 'pointer',
            transition: 'background 0.2s'
          }}
        >
          {loading ? '…' : 'Send'}
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }
      `}</style>
    </main>
  );
}