'use client';
import { useState, useRef, useEffect } from 'react';

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function send() {
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user', content: input };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updated })
      });

      const data = await res.json();

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: data.text || ('Error: ' + (data.error || 'Unknown error'))
        }
      ]);
    } catch (e) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Network error: ' + e.message }
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{
      maxWidth: 680,
      margin: '0 auto',
      padding: '2rem 1rem',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h1 style={{
        fontSize: 18,
        fontWeight: 600,
        color: '#3d2785',
        marginBottom: '0.25rem'
      }}>
        Kapruka Navigator
      </h1>
      <p style={{ fontSize: 13, color: '#999', marginBottom: '1.5rem' }}>
        Phase 1 — plumbing test
      </p>

      {/* Chat window */}
      <div style={{
        minHeight: 420,
        maxHeight: 520,
        overflowY: 'auto',
        border: '1px solid #e5e5e5',
        borderRadius: 14,
        padding: '1rem',
        marginBottom: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        background: '#fafafa'
      }}>
        {messages.length === 0 && (
          <p style={{
            color: '#bbb',
            fontSize: 14,
            textAlign: 'center',
            marginTop: 160
          }}>
            Try: "birthday cake to Kandy on Saturday"
          </p>
        )}

        {messages.map((m, i) => (
          <div key={i} style={{
            alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '80%',
            background: m.role === 'user' ? '#3d2785' : '#fff',
            color: m.role === 'user' ? '#fff' : '#111',
            border: m.role === 'assistant' ? '1px solid #e5e5e5' : 'none',
            padding: '10px 14px',
            borderRadius: 12,
            fontSize: 14,
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap'
          }}>
            {m.content}
          </div>
        ))}

        {loading && (
          <div style={{
            alignSelf: 'flex-start',
            fontSize: 13,
            color: '#999',
            padding: '6px 0'
          }}>
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
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="What are you trying to make happen today?"
          disabled={loading}
          style={{
            flex: 1,
            padding: '11px 14px',
            borderRadius: 10,
            border: '1px solid #ddd',
            fontSize: 14,
            outline: 'none',
            background: '#fff',
            color: '#000'
          }}
        />
        <button
          onClick={send}
          disabled={loading}
          style={{
            background: loading ? '#9e8dd0' : '#3d2785',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            padding: '11px 22px',
            fontSize: 14,
            fontWeight: 500,
            cursor: loading ? 'default' : 'pointer',
            transition: 'background 0.2s'
          }}
        >
          {loading ? '…' : 'Send'}
        </button>
      </div>
    </main>
  );
}