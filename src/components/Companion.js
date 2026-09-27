'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

/* ─── Topic detection ─── */
const PATH_MAP = [
  ['/practice/visualizer',   'Algorithm Visualization'],
  ['/practice/patterns',     'Pattern Recognition'],
  ['/practice/trace',        'Code Tracing'],
  ['/practice/debug',        'Debugging Skills'],
  ['/practice/complexity',   'Time & Space Complexity'],
  ['/practice/deconstruct',  'Problem Deconstruction'],
  ['/practice/speed',        'Speed Coding'],
  ['/practice/teach',        'Teaching Mode'],
  ['/practice',              'Practice Modes'],
  ['/interview',             'Technical Interviews'],
  ['/skills',                'DSA Skills'],
  ['/evolutions',            'Code Evolution'],
  ['/focus',                 'Study Focus'],
  ['/journal',               'Aha Journal'],
  ['/ranks',                 'Rankings'],
  ['/dashboard',             'Your Progress'],
];

function getTopic(pathname) {
  if (!pathname) return 'DSA & Algorithms';
  if (pathname.startsWith('/lesson/')) {
    const slug = pathname.split('/lesson/')[1] || '';
    return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }
  for (const [path, label] of PATH_MAP) {
    if (pathname.startsWith(path)) return label;
  }
  return 'DSA & Algorithms';
}

/* ─── Quick actions ─── */
const ACTIONS = [
  {
    icon:   'quiz',
    label:  'Quiz me',
    color:  '#818cf8',
    prompt: 'Give me one sharp, interview-style question about this topic. Just the question — wait for my answer before explaining anything.',
  },
  {
    icon:   'warning_amber',
    label:  'Common mistakes',
    color:  '#f59e0b',
    prompt: 'What are the 3 most common mistakes people make when learning or using this? Be specific and honest — not generic advice.',
  },
  {
    icon:   'lightbulb',
    label:  'Fresh analogy',
    color:  '#34d399',
    prompt: 'Explain the core concept using a completely fresh analogy or mental model. Not the standard textbook explanation — something that makes it click.',
  },
  {
    icon:   'tips_and_updates',
    label:  'Interview tips',
    color:  '#60a5fa',
    prompt: 'Give me 3 specific interview tips for this topic: what to say, what to avoid, and what impresses interviewers.',
  },
];

/* ─── Typing dots ─── */
function TypingDots() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '10px 14px',
      background: '#1e293b', borderRadius: '16px 16px 16px 4px', width: 52 }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: 5, height: 5, borderRadius: '50%', background: '#475569', display: 'inline-block',
          animation: `alex-dot 1.3s ease-in-out ${i * 0.22}s infinite`,
        }} />
      ))}
    </div>
  );
}

/* ─── Message bubble ─── */
function Bubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div style={{ display: 'flex', gap: 8, flexDirection: isUser ? 'row-reverse' : 'row' }}>
      {!isUser && (
        <div style={{
          width: 24, height: 24, borderRadius: 8, flexShrink: 0, marginTop: 2,
          background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span className="material-symbols-outlined filled text-white" style={{ fontSize: 13 }}>psychology</span>
        </div>
      )}
      <div style={{
        maxWidth: '82%',
        background:   isUser ? '#4338ca' : '#1e293b',
        borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
        padding:      '10px 14px',
        fontSize:     13,
        lineHeight:   1.55,
        color:        '#f1f5f9',
        whiteSpace:   'pre-wrap',
        wordBreak:    'break-word',
      }}>
        {msg.content}
      </div>
    </div>
  );
}

/* ─── Styles ─── */
const CSS = `
@keyframes alex-dot {
  0%,80%,100% { transform: scale(0.6); opacity: 0.4; }
  40%          { transform: scale(1);   opacity: 1;   }
}
@keyframes alex-in {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0);    }
}
.alex-action {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 12px; border-radius: 12px; text-align: left;
  background: #111827; border: 1px solid #1e293b; cursor: pointer;
  transition: border-color 150ms ease, background 150ms ease;
}
.alex-action:hover { background: #1a2540; border-color: #334155; }
.alex-action:disabled { opacity: 0.4; cursor: default; }
.alex-pill {
  display: flex; align-items: center; gap: 4px;
  padding: 3px 10px; border-radius: 8px; cursor: pointer;
  background: #111827; border: 1px solid #1e293b; flex-shrink: 0;
  transition: color 150ms ease, border-color 150ms ease;
  font-size: 11px; font-family: inherit; color: #64748b;
}
.alex-pill:hover { color: #cbd5e1; border-color: #334155; }
.alex-pill:disabled { opacity: 0.4; cursor: default; }
#alex-msgs { scrollbar-width: none; }
#alex-msgs::-webkit-scrollbar { display: none; }
#alex-input::placeholder { color: #4b5563; }
`;

/* ─── Main component ─── */
export default function Companion() {
  const pathname = usePathname();
  const topic    = getTopic(pathname);

  const [open,       setOpen]       = useState(false);
  const [messages,   setMessages]   = useState([]);
  const [input,      setInput]      = useState('');
  const [loading,    setLoading]    = useState(false);
  const [userId,     setUserId]     = useState(null);
  const [mounted,    setMounted]    = useState(false);

  const bottomRef    = useRef(null);
  const inputRef     = useRef(null);
  const prevTopicRef = useRef(topic);

  useEffect(() => {
    setMounted(true);
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  useEffect(() => {
    if (prevTopicRef.current !== topic) {
      prevTopicRef.current = topic;
      setMessages([]);
      setInput('');
    }
  }, [topic]);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 220);
  }, [open]);

  const send = useCallback(async (overrideText) => {
    const text = (overrideText ?? input).trim();
    if (!text || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setLoading(true);
    try {
      const res  = await fetch('/api/ai/companion', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ message: text, topic, history: messages.slice(-6), userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: err.message || 'Something went wrong.' }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, topic, userId]);

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  }

  if (!mounted) return null;

  const hasMessages = messages.length > 0;

  return (
    <>
      <style>{CSS}</style>
      <div style={{ position: 'fixed', zIndex: 200, bottom: 'calc(env(safe-area-inset-bottom) + 74px)', right: 16, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontFamily: 'Inter, sans-serif' }}>

        {/* Panel */}
        {open && (
          <div style={{
            width: 'min(360px, calc(100vw - 32px))',
            height: 'clamp(380px, 55vh, 500px)',
            background: '#0c1220',
            border: '1px solid #1e293b',
            borderRadius: 18,
            boxShadow: '0 24px 48px rgba(0,0,0,0.45), 0 8px 16px rgba(0,0,0,0.25)',
            display: 'flex', flexDirection: 'column',
            marginBottom: 10,
            animation: 'alex-in 200ms cubic-bezier(0.16, 1, 0.3, 1) both',
            overflow: 'hidden',
          }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#111827', borderBottom: '1px solid #1e293b', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: 10, background: 'linear-gradient(145deg,#4f46e5,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span className="material-symbols-outlined filled text-white" style={{ fontSize: 16 }}>psychology</span>
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', lineHeight: 1.2 }}>Alex</p>
                  <p style={{ fontSize: 9.5, color: '#6366f1', letterSpacing: '0.06em', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', lineHeight: 1.2 }}>Study Companion</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', background: '#1e293b', color: '#6366f1', border: '1px solid #312e81', padding: '2px 8px', borderRadius: 6, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {topic.length > 18 ? topic.slice(0, 18) + '…' : topic}
                </span>
                {hasMessages && (
                  <button onClick={() => { setMessages([]); setInput(''); setTimeout(() => inputRef.current?.focus(), 50); }}
                    style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer', color: '#475569', transition: 'color 150ms ease' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#94a3b8'}
                    onMouseLeave={e => e.currentTarget.style.color = '#475569'}
                    title="New chat">
                    <span className="material-symbols-outlined" style={{ fontSize: 15 }}>refresh</span>
                  </button>
                )}
                <button onClick={() => setOpen(false)}
                  style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer', color: '#475569', transition: 'color 150ms ease' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#94a3b8'}
                  onMouseLeave={e => e.currentTarget.style.color = '#475569'}>
                  <span className="material-symbols-outlined" style={{ fontSize: 17 }}>close</span>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div id="alex-msgs" style={{ flex: 1, overflowY: 'auto', padding: '14px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {!hasMessages && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ width: 24, height: 24, borderRadius: 8, flexShrink: 0, marginTop: 2, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="material-symbols-outlined filled text-white" style={{ fontSize: 13 }}>psychology</span>
                  </div>
                  <div style={{ background: '#1e293b', borderRadius: '16px 16px 16px 4px', padding: '10px 14px', fontSize: 13, lineHeight: 1.55, color: '#e2e8f0' }}>
                    Tracking your session on{' '}
                    <span style={{ color: '#a5b4fc', fontWeight: 600 }}>{topic}</span>
                    . Ask me anything or pick an action below.
                  </div>
                </div>
              )}
              {messages.map((msg, i) => <Bubble key={i} msg={msg} />)}
              {loading && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ width: 24, height: 24, borderRadius: 8, flexShrink: 0, marginTop: 2, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="material-symbols-outlined filled text-white" style={{ fontSize: 13 }}>psychology</span>
                  </div>
                  <TypingDots />
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick actions */}
            {!hasMessages && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, padding: '0 14px 12px', flexShrink: 0 }}>
                {ACTIONS.map(action => (
                  <button key={action.label} className="alex-action" onClick={() => send(action.prompt)} disabled={loading}>
                    <span className="material-symbols-outlined" style={{ fontSize: 14, color: action.color, flexShrink: 0 }}>{action.icon}</span>
                    <span style={{ fontSize: 12, color: '#cbd5e1', fontWeight: 500, lineHeight: 1.3 }}>{action.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Compact pills after conversation */}
            {hasMessages && !loading && (
              <div style={{ display: 'flex', gap: 6, overflowX: 'auto', padding: '0 14px 10px', flexShrink: 0, scrollbarWidth: 'none' }}>
                {ACTIONS.slice(0, 3).map(a => (
                  <button key={a.label} className="alex-pill" onClick={() => send(a.prompt)} disabled={loading}>
                    <span className="material-symbols-outlined" style={{ fontSize: 11, color: a.color }}>{a.icon}</span>
                    {a.label}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div style={{ padding: '0 14px 14px', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 14, background: '#111827', border: '1px solid #1e293b' }}>
                <input
                  ref={inputRef}
                  id="alex-input"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  disabled={loading}
                  placeholder={`Ask about ${topic.length > 22 ? 'this topic' : topic}…`}
                  style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: '#f1f5f9', caretColor: '#818cf8', fontFamily: 'inherit' }}
                />
                <button
                  onClick={() => send()}
                  disabled={!input.trim() || loading}
                  style={{ width: 28, height: 28, borderRadius: 10, background: '#4f46e5', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: (!input.trim() || loading) ? 0.35 : 1, transition: 'opacity 150ms ease' }}>
                  <span className="material-symbols-outlined filled text-white" style={{ fontSize: 14 }}>arrow_upward</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Trigger button — no scale, no text change, just bg change */}
        <button
          onClick={() => setOpen(o => !o)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '9px 16px 9px 11px',
            borderRadius: 100,
            background: open ? '#111827' : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            border: open ? '1px solid #334155' : '1px solid transparent',
            boxShadow: open ? '0 1px 4px rgba(0,0,0,0.2)' : '0 4px 20px rgba(79,70,229,0.4), 0 2px 8px rgba(0,0,0,0.2)',
            cursor: 'pointer',
            fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 13,
            color: 'white',
            transition: 'background 200ms ease, box-shadow 200ms ease, border-color 200ms ease',
          }}
        >
          <span className="material-symbols-outlined filled" style={{ fontSize: 19, color: open ? '#6366f1' : 'white' }}>
            psychology
          </span>
          <span style={{ color: open ? '#94a3b8' : 'white' }}>Alex</span>
        </button>
      </div>
    </>
  );
}
