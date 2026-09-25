'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

/* ─────────────────────── Topic detection ────────────────────────── */
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

/* ─────────────────────── Quick actions ──────────────────────────── */
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

/* ─────────────────────── Typing indicator ───────────────────────── */
function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-3.5 py-3 rounded-2xl rounded-bl-sm" style={{ background: '#1e293b', width: 56 }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: 6, height: 6, borderRadius: '50%', background: '#475569', display: 'inline-block',
          animation: `alex-dot 1.3s ease-in-out ${i * 0.22}s infinite`,
        }} />
      ))}
    </div>
  );
}

/* ─────────────────────── Message bubble ─────────────────────────── */
function Bubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isUser && (
        <div className="w-6 h-6 rounded-lg shrink-0 flex items-center justify-center mt-0.5"
          style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
          <span className="material-symbols-outlined filled text-white" style={{ fontSize: 13 }}>psychology</span>
        </div>
      )}
      <div
        className="rounded-2xl px-3.5 py-2.5"
        style={{
          maxWidth: '82%',
          background:    isUser ? '#4338ca' : '#1e293b',
          borderRadius:  isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          fontSize:      13,
          lineHeight:    1.55,
          color:         '#f1f5f9',
          whiteSpace:    'pre-wrap',
          wordBreak:     'break-word',
        }}
      >
        {msg.content}
      </div>
    </div>
  );
}

/* ─────────────────────── Main component ─────────────────────────── */
const ANIM_CSS = `
@keyframes alex-dot {
  0%,80%,100% { transform: scale(0.6); opacity: 0.4; }
  40%          { transform: scale(1);   opacity: 1;   }
}
@keyframes alex-panel-in {
  from { opacity: 0; transform: translateY(12px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0)    scale(1);    }
}
@keyframes alex-btn-in {
  from { opacity: 0; transform: scale(0.85); }
  to   { opacity: 1; transform: scale(1);    }
}
`;

export default function Companion() {
  const pathname = usePathname();
  const topic    = getTopic(pathname);

  const [open,         setOpen]         = useState(false);
  const [messages,     setMessages]     = useState([]);
  const [input,        setInput]        = useState('');
  const [loading,      setLoading]      = useState(false);
  const [userId,       setUserId]       = useState(null);
  const [panelVisible, setPanelVisible] = useState(false);

  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);
  const prevTopicRef = useRef(topic);

  // Get user id for rate-limiting
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  // Reset conversation on topic change
  useEffect(() => {
    if (prevTopicRef.current !== topic) {
      prevTopicRef.current = topic;
      setMessages([]);
      setInput('');
    }
  }, [topic]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, open]);

  // Focus input when panel opens
  useEffect(() => {
    if (open) {
      setPanelVisible(true);
      setTimeout(() => inputRef.current?.focus(), 250);
    } else {
      setTimeout(() => setPanelVisible(false), 200);
    }
  }, [open]);

  const send = useCallback(async (overrideText) => {
    const text = (overrideText ?? input).trim();
    if (!text || loading) return;

    setInput('');
    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch('/api/ai/companion', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          topic,
          history: messages.slice(-6),
          userId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: err.message === 'Failed' ? 'Something went wrong. Try again.' : err.message,
      }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, topic, userId]);

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  }

  function clearChat() {
    setMessages([]);
    setInput('');
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  const hasMessages = messages.length > 0;

  return (
    <>
      <style>{ANIM_CSS}</style>

      {/* Positioned wrapper — above bottom tab on mobile, corner on desktop */}
      <div
        className="fixed z-[200] flex flex-col items-end"
        style={{ bottom: 'calc(env(safe-area-inset-bottom) + 74px)', right: 16 }}
      >
        {/* Panel */}
        {panelVisible && (
          <div
            className="flex flex-col mb-3 overflow-hidden"
            style={{
              width:         'min(360px, calc(100vw - 32px))',
              height:        'clamp(380px, 55vh, 500px)',
              background:    '#0c1220',
              border:        '1px solid #1e293b',
              borderRadius:  20,
              boxShadow:     '0 32px 64px rgba(0,0,0,0.5), 0 8px 24px rgba(0,0,0,0.3)',
              animation:     open ? 'alex-panel-in 220ms cubic-bezier(0.34,1.56,0.64,1) both' : undefined,
              opacity:       open ? 1 : 0,
              transform:     open ? 'none' : 'translateY(8px) scale(0.97)',
              transition:    open ? 'none' : 'opacity 180ms ease, transform 180ms ease',
              pointerEvents: open ? 'auto' : 'none',
            }}
          >
            {/* ── Header ── */}
            <div
              className="flex items-center justify-between shrink-0 px-4 py-3"
              style={{ background: '#111827', borderBottom: '1px solid #1e293b' }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'linear-gradient(145deg,#4f46e5,#7c3aed)' }}
                >
                  <span className="material-symbols-outlined filled text-white" style={{ fontSize: 17 }}>psychology</span>
                </div>
                <div className="leading-tight">
                  <p className="font-sans font-bold text-white" style={{ fontSize: 13.5 }}>Alex</p>
                  <p className="font-mono" style={{ fontSize: 9.5, color: '#6366f1', letterSpacing: '0.05em' }}>
                    STUDY COMPANION
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Topic chip */}
                <span
                  className="font-mono hidden sm:inline-block px-2 py-0.5 rounded-md"
                  style={{ fontSize: 10, background: '#1e293b', color: '#6366f1', border: '1px solid #312e81', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                  {topic.length > 18 ? topic.slice(0, 18) + '…' : topic}
                </span>

                {hasMessages && (
                  <button
                    onClick={clearChat}
                    className="flex items-center justify-center w-7 h-7 rounded-lg transition-colors hover:bg-white/5"
                    title="New chat"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 15, color: '#475569' }}>refresh</span>
                  </button>
                )}

                <button
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center w-7 h-7 rounded-lg transition-colors hover:bg-white/5"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 17, color: '#475569' }}>close</span>
                </button>
              </div>
            </div>

            {/* ── Messages ── */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-hide">
              {!hasMessages && (
                <div className="space-y-2">
                  {/* Welcome message */}
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-lg shrink-0 flex items-center justify-center mt-0.5"
                      style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
                      <span className="material-symbols-outlined filled text-white" style={{ fontSize: 13 }}>psychology</span>
                    </div>
                    <div className="rounded-2xl rounded-bl-sm px-3.5 py-2.5"
                      style={{ background: '#1e293b', fontSize: 13, lineHeight: 1.55, color: '#e2e8f0' }}>
                      <span>I'm tracking your session on </span>
                      <span style={{ color: '#a5b4fc', fontWeight: 600 }}>{topic}</span>
                      <span>. Ask me anything or pick a quick action.</span>
                    </div>
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <Bubble key={i} msg={msg} />
              ))}

              {loading && (
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-lg shrink-0 flex items-center justify-center mt-0.5"
                    style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
                    <span className="material-symbols-outlined filled text-white" style={{ fontSize: 13 }}>psychology</span>
                  </div>
                  <TypingDots />
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* ── Quick Actions (when no messages) ── */}
            {!hasMessages && (
              <div className="px-4 pb-3 grid grid-cols-2 gap-1.5 shrink-0">
                {ACTIONS.map(action => (
                  <button
                    key={action.label}
                    onClick={() => send(action.prompt)}
                    disabled={loading}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all duration-100 active:scale-95 disabled:opacity-40"
                    style={{ background: '#111827', border: '1px solid #1e293b' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = action.color + '55'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#1e293b'}
                  >
                    <span className="material-symbols-outlined shrink-0" style={{ fontSize: 15, color: action.color }}>{action.icon}</span>
                    <span className="font-sans font-medium" style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.3 }}>{action.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* ── Compact action pills (after conversation started) ── */}
            {hasMessages && !loading && (
              <div className="px-4 pt-2 flex gap-1.5 overflow-x-auto scrollbar-hide shrink-0">
                {ACTIONS.slice(0, 3).map(a => (
                  <button
                    key={a.label}
                    onClick={() => send(a.prompt)}
                    className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors duration-100"
                    style={{ background: '#111827', border: '1px solid #1e293b', fontSize: 11, color: '#64748b', fontFamily: 'Inter, sans-serif' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#cbd5e1'; e.currentTarget.style.borderColor = '#334155'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = '#1e293b'; }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 12, color: a.color }}>{a.icon}</span>
                    {a.label}
                  </button>
                ))}
              </div>
            )}

            {/* ── Input ── */}
            <div className="px-4 pt-2 pb-4 shrink-0">
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-2xl"
                style={{ background: '#111827', border: '1px solid #1e293b' }}
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder={`Ask about ${topic.length > 24 ? 'this topic' : topic}…`}
                  disabled={loading}
                  className="flex-1 bg-transparent font-sans outline-none placeholder-slate-600"
                  style={{ fontSize: 13, color: '#f1f5f9', caretColor: '#818cf8' }}
                />
                <button
                  onClick={() => send()}
                  disabled={!input.trim() || loading}
                  className="flex items-center justify-center rounded-xl transition-all duration-150 active:scale-90 disabled:opacity-30"
                  style={{ width: 30, height: 30, background: '#4f46e5', flexShrink: 0 }}
                >
                  <span className="material-symbols-outlined filled text-white" style={{ fontSize: 15 }}>arrow_upward</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Trigger button ── */}
        <button
          onClick={() => setOpen(o => !o)}
          className="flex items-center gap-2 font-sans font-semibold text-white transition-all duration-200 hover:scale-105 active:scale-95 select-none"
          style={{
            padding:      '9px 16px 9px 12px',
            borderRadius: 100,
            background:   open
              ? '#111827'
              : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            border:       open ? '1px solid #1e293b' : '1px solid transparent',
            boxShadow:    open
              ? 'none'
              : '0 4px 20px rgba(79,70,229,0.5), 0 2px 8px rgba(0,0,0,0.25)',
            fontSize:     13,
            animation:    'alex-btn-in 400ms cubic-bezier(0.34,1.56,0.64,1) both',
          }}
        >
          <span
            className="material-symbols-outlined filled"
            style={{ fontSize: 20, color: open ? '#475569' : 'white' }}
          >
            {open ? 'keyboard_arrow_down' : 'psychology'}
          </span>
          {!open && <span>Alex</span>}
          {open && <span style={{ color: '#475569', fontSize: 13 }}>Close</span>}
        </button>
      </div>
    </>
  );
}
