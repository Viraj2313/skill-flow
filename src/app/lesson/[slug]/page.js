'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { completeLesson, getLessonBySlug, saveExerciseAttempt, saveAhaJournal } from '@/lib/db';
import { supabase } from '@/lib/supabase';
import { EVOLUTIONS } from '@/data/evolutions';
import { getChecklist } from '@/data/topicChecklists';
import Companion from '@/components/Companion';

const CAT_COLOR = {
  dsa: '#059669',
  python: '#2563eb',
  'cs-fundamentals': '#d97706',
};

function ProgressBar({ current, total, color }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="h-2 bg-aq-surface-raised rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  );
}

function CodeBlock({ text }) {
  return (
    <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #1e293b', marginBottom: 4 }}>
      {/* Mac title bar */}
      <div style={{
        background: '#1e293b', padding: '9px 14px',
        display: 'flex', alignItems: 'center', gap: 6,
        borderBottom: '1px solid #0f172a',
      }}>
        <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#ff5f57', display: 'inline-block' }} />
        <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#ffbd2e', display: 'inline-block' }} />
        <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#28c840', display: 'inline-block' }} />
      </div>
      {/* Code */}
      <div style={{
        background: '#0f172a', padding: '16px 20px',
        fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#94a3b8',
        whiteSpace: 'pre', lineHeight: 1.75, overflowX: 'auto',
      }}>
        {text}
      </div>
    </div>
  );
}

const ANGLES = [
  { id: 'analogy',   label: 'Analogy',   icon: 'compare',    color: '#7c3aed' },
  { id: 'visual',    label: 'Visualise', icon: 'draw',       color: '#0891b2' },
  { id: 'derive',    label: 'Derive It', icon: 'functions',  color: '#059669' },
  { id: 'interview', label: 'Interview', icon: 'psychology', color: '#d97706' },
];

function ConceptCard({ card, index, total, color, onNext, token }) {
  const [altText, setAltText]           = useState(null);
  const [explaining, setExplaining]     = useState(false);
  const [explainErr, setExplainErr]     = useState(null);
  const [angleText, setAngleText]       = useState(null);
  const [activeAngle, setActiveAngle]   = useState(null);
  const [angleLoading, setAngleLoading] = useState(false);

  const [socratic, setSocratic]             = useState(false);
  const [socraticQs, setSocraticQs]         = useState([]);
  const [socraticIdx, setSocraticIdx]       = useState(0);
  const [socraticInput, setSocraticInput]   = useState('');
  const [socraticHistory, setSocraticHistory] = useState([]);
  const [socraticLoading, setSocraticLoading] = useState(false);
  const [socraticDone, setSocraticDone]     = useState(false);
  const [socraticErr, setSocraticErr]       = useState('');

  async function startSocratic() {
    setSocratic(true);
    setSocraticLoading(true);
    setSocraticErr('');
    try {
      const res = await fetch('/api/ai/socratic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'generate', heading: card.heading, body: card.body }),
      });
      const data = await res.json();
      if (data.error || !data.questions) { setSocraticErr('Could not generate questions.'); setSocratic(false); return; }
      setSocraticQs(data.questions);
      setSocraticHistory([{ role: 'ai', text: data.questions[0] }]);
    } catch { setSocraticErr('AI unavailable.'); setSocratic(false); }
    finally { setSocraticLoading(false); }
  }

  async function submitSocraticAnswer() {
    if (!socraticInput.trim() || socraticLoading) return;
    const answer = socraticInput.trim();
    setSocraticInput('');
    setSocraticHistory(h => [...h, { role: 'user', text: answer }]);
    setSocraticLoading(true);
    try {
      const res = await fetch('/api/ai/socratic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'respond',
          heading: card.heading,
          body: card.body,
          questions: socraticQs,
          questionIndex: socraticIdx,
          userAnswer: answer,
        }),
      });
      const data = await res.json();
      const aiReply = data.response || 'Interesting — keep that thought in mind.';
      const isLast = socraticIdx === socraticQs.length - 1;
      if (isLast) {
        setSocraticHistory(h => [...h, { role: 'ai', text: aiReply }]);
        setSocraticDone(true);
      } else {
        const nextQ = socraticQs[socraticIdx + 1];
        setSocraticHistory(h => [...h, { role: 'ai', text: aiReply }, { role: 'ai', text: nextQ, isQuestion: true }]);
        setSocraticIdx(i => i + 1);
      }
    } catch { setSocraticHistory(h => [...h, { role: 'ai', text: 'Could not reach AI. Try again.' }]); }
    finally { setSocraticLoading(false); }
  }

  async function handleExplain() {
    setExplaining(true);
    setExplainErr(null);
    setAltText(null);
    setAngleText(null);
    setActiveAngle(null);
    try {
      const res = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ heading: card.heading, body: card.body }),
      });
      const data = await res.json();
      if (data.error) setExplainErr(data.error);
      else setAltText(data.alternative);
    } catch {
      setExplainErr('Could not reach AI. Please try again.');
    } finally {
      setExplaining(false);
    }
  }

  async function handleAngle(angleId) {
    if (activeAngle === angleId) { setAngleText(null); setActiveAngle(null); return; }
    setAngleLoading(true);
    setAltText(null);
    setActiveAngle(angleId);
    setAngleText(null);
    try {
      const res = await fetch('/api/ai/angles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ heading: card.heading, body: card.body, angle: angleId }),
      });
      const data = await res.json();
      if (data.error) setExplainErr(data.error);
      else setAngleText(data.text);
    } catch {
      setExplainErr('Could not reach AI.');
    } finally {
      setAngleLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff' }}>

      {/* ── Scrollable content ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '28px 24px 8px' }}>
        {card.heading && (
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', lineHeight: 1.35, marginBottom: 18, fontFamily: 'Inter, sans-serif' }}>
            {card.heading}
          </h2>
        )}

        {/* Content modes */}
        {socratic ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 15, color: '#7c3aed' }}>psychology</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7c3aed' }}>Discover Mode</span>
              </div>
              <button onClick={() => { setSocratic(false); setSocraticQs([]); setSocraticIdx(0); setSocraticHistory([]); setSocraticDone(false); }}
                style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, letterSpacing: '0.06em' }}>
                EXIT ×
              </button>
            </div>

            {socraticLoading && socraticHistory.length === 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '16px 0' }}>
                <span style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid #7c3aed', borderTopColor: 'transparent', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>Crafting questions…</span>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              {socraticHistory.map((msg, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '88%', borderRadius: 16, padding: '10px 16px',
                    background: msg.role === 'user' ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : msg.isQuestion ? '#f5f3ff' : '#f8fafc',
                    color: msg.role === 'user' ? 'white' : '#374151',
                    border: msg.role === 'user' ? 'none' : msg.isQuestion ? '1px solid #ddd6fe' : '1px solid #e2e8f0',
                  }}>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, lineHeight: 1.6, margin: 0 }}>{msg.text}</p>
                  </div>
                </div>
              ))}
              {socraticLoading && socraticHistory.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div style={{ background: '#f1f5f9', borderRadius: 16, padding: '10px 16px', display: 'flex', gap: 4, alignItems: 'center' }}>
                    {[0, 150, 300].map(d => <span key={d} style={{ width: 7, height: 7, borderRadius: '50%', background: '#94a3b8', display: 'inline-block', animation: `bounce 1.2s ${d}ms ease-in-out infinite` }} />)}
                  </div>
                </div>
              )}
            </div>

            {socraticDone && (
              <div style={{ padding: '14px 16px', borderRadius: 12, border: '1px solid #ddd6fe', background: '#faf5ff', marginBottom: 12 }}>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7c3aed', marginBottom: 8 }}>You worked it out — now read it fully</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#374151', lineHeight: 1.7, whiteSpace: 'pre-line', margin: 0 }}>{card.body}</p>
              </div>
            )}

            {!socraticDone && !socraticLoading && socraticQs.length > 0 && (
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  value={socraticInput}
                  onChange={e => setSocraticInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && submitSocraticAnswer()}
                  placeholder="Your answer…"
                  style={{ flex: 1, fontFamily: 'Inter, sans-serif', fontSize: 14, border: '1px solid #e2e8f0', borderRadius: 12, padding: '10px 14px', outline: 'none', color: '#0f172a', background: '#fff' }}
                />
                <button onClick={submitSocraticAnswer} disabled={!socraticInput.trim()}
                  style={{ padding: '10px 18px', borderRadius: 12, background: 'linear-gradient(135deg,#7c3aed,#6366f1)', border: 'none', cursor: 'pointer', color: 'white', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: 14, opacity: !socraticInput.trim() ? 0.4 : 1 }}>
                  →
                </button>
              </div>
            )}
            {socraticErr && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#ef4444', marginTop: 8 }}>{socraticErr}</p>}
          </div>
        ) : altText ? (
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <span className="material-symbols-outlined filled" style={{ fontSize: 15, color: '#9333ea' }}>auto_awesome</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9333ea' }}>AI Explanation</span>
            </div>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, color: '#374151', lineHeight: 1.75, whiteSpace: 'pre-line', background: '#fdf4ff', border: '1px solid #e9d5ff', borderRadius: 12, padding: '16px 18px', margin: 0 }}>
              {altText}
            </p>
            <button onClick={() => setAltText(null)}
              style={{ marginTop: 10, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', color: '#94a3b8', padding: 0 }}>
              ← Back to original
            </button>
          </div>
        ) : (
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 17, color: '#334155', lineHeight: 1.8, whiteSpace: 'pre-line', marginBottom: 20, margin: 0 }}>
            {card.body}
          </p>
        )}

        {!socratic && card.code && (
          <div style={{ marginTop: 20 }}>
            <CodeBlock text={card.code} />
          </div>
        )}

        {/* Angle result — shown inline in content */}
        {angleText && (
          <div style={{ marginTop: 20, padding: '14px 18px', borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: ANGLES.find(a => a.id === activeAngle)?.color, marginBottom: 10 }}>
              {ANGLES.find(a => a.id === activeAngle)?.label}
            </p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, color: '#374151', lineHeight: 1.75, whiteSpace: 'pre-line', margin: 0 }}>{angleText}</p>
          </div>
        )}

        {explainErr && (
          <p style={{ marginTop: 12, fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#ef4444' }}>{explainErr}</p>
        )}
      </div>

      {/* ── Bottom action bar ── */}
      <div style={{ flexShrink: 0, borderTop: '1px solid #f1f5f9', background: '#fff', padding: '14px 20px 22px' }}>

        {/* Tool pills row */}
        {!socratic && (
          <div style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 14, scrollbarWidth: 'none' }}>
            {/* Discover */}
            <button onClick={startSocratic} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '6px 14px', borderRadius: 100, flexShrink: 0, cursor: 'pointer',
              fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 700, letterSpacing: '0.07em',
              border: '1px solid #ddd6fe', color: '#7c3aed', background: '#faf5ff',
              transition: 'background 150ms',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 13 }}>psychology</span>
              DISCOVER
            </button>

            {/* Angle pills */}
            {ANGLES.map(a => (
              <button key={a.id} onClick={() => handleAngle(a.id)} disabled={angleLoading}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '6px 14px', borderRadius: 100, flexShrink: 0, cursor: angleLoading ? 'default' : 'pointer',
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 700, letterSpacing: '0.07em',
                  border: `1px solid ${activeAngle === a.id ? a.color : '#e2e8f0'}`,
                  color: activeAngle === a.id ? a.color : '#64748b',
                  background: activeAngle === a.id ? a.color + '18' : '#f8fafc',
                  opacity: angleLoading && activeAngle !== a.id ? 0.45 : 1,
                  transition: 'all 150ms',
                }}>
                <span className="material-symbols-outlined" style={{ fontSize: 12, color: activeAngle === a.id ? a.color : '#94a3b8' }}>{a.icon}</span>
                {a.label.toUpperCase()}
              </button>
            ))}

            {/* AI Explain */}
            {!altText && !angleText && (
              <button onClick={handleExplain} disabled={explaining}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '6px 14px', borderRadius: 100, flexShrink: 0,
                  cursor: explaining ? 'default' : 'pointer',
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 700, letterSpacing: '0.07em',
                  border: '1px solid #e9d5ff', color: '#9333ea', background: '#fdf4ff',
                  opacity: explaining ? 0.6 : 1, transition: 'opacity 150ms',
                }}>
                <span className="material-symbols-outlined" style={{ fontSize: 12 }}>auto_awesome</span>
                {explaining ? 'THINKING…' : 'EXPLAIN'}
              </button>
            )}
          </div>
        )}

        {/* Loading state for angle */}
        {angleLoading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ width: 13, height: 13, borderRadius: '50%', border: '2px solid #6366f1', borderTopColor: 'transparent', display: 'inline-block', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', color: '#94a3b8', textTransform: 'uppercase' }}>
              Generating {ANGLES.find(a => a.id === activeAngle)?.label}…
            </span>
          </div>
        )}

        {/* Primary CTA */}
        <button
          onClick={onNext}
          style={{
            width: '100%', padding: '16px', borderRadius: 16,
            background: color, border: 'none', cursor: 'pointer',
            fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 700,
            letterSpacing: '0.09em', textTransform: 'uppercase', color: 'white',
            transition: 'filter 150ms ease', display: 'block',
          }}
          onMouseEnter={e => e.currentTarget.style.filter = 'brightness(0.9)'}
          onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}
        >
          {index + 1 < total ? 'Got it →' : 'Start Exercises →'}
        </button>

        {/* Skip — demoted to a quiet text link */}
        <button
          onClick={onNext}
          style={{
            display: 'block', width: '100%', marginTop: 10,
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 600,
            letterSpacing: '0.07em', textTransform: 'uppercase',
            color: '#cbd5e1', textAlign: 'center', transition: 'color 150ms',
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#64748b'}
          onMouseLeave={e => e.currentTarget.style.color = '#cbd5e1'}
        >
          skip
        </button>
      </div>
    </div>
  );
}

function AIReviewPanel({ exercise, selected, lessonTitle, token }) {
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [shown, setShown] = useState(false);

  async function handleAskAI() {
    setShown(true);
    if (review) return;
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch('/api/ai/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          question: exercise.question,
          selectedAnswer: exercise.options[selected],
          correctAnswer: exercise.options[exercise.correct],
          isCorrect: selected === exercise.correct,
          lessonTitle,
        }),
      });
      const data = await res.json();
      if (data.error) setErr(data.error);
      else setReview(data.review);
    } catch {
      setErr('Could not reach AI. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (!shown) {
    return (
      <button
        onClick={handleAskAI}
        className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-input font-mono text-[11px] font-semibold tracking-widest uppercase border border-slate-300 text-slate-600 bg-slate-50 hover:bg-slate-100 transition-colors"
      >
        <span className="material-symbols-outlined text-[16px] text-slate-500">psychology</span>
        Ask the interviewer
      </button>
    );
  }

  if (loading) {
    return (
      <div className="mt-3 p-4 rounded-card border border-slate-200 bg-slate-50 flex items-center gap-3">
        <span className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin shrink-0" />
        <span className="font-sans text-[13px] text-slate-500">Interviewer is thinking...</span>
      </div>
    );
  }

  if (err) {
    return (
      <p className="mt-3 font-sans text-[12px] text-aq-error px-1">{err}</p>
    );
  }

  if (!review) return null;

  const verdictConfig = {
    correct:  { icon: 'check_circle',  color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', label: 'Good answer' },
    wrong:    { icon: 'cancel',        color: 'text-red-700',     bg: 'bg-red-50 border-red-200',         label: 'Not quite' },
    partial:  { icon: 'warning',       color: 'text-amber-700',   bg: 'bg-amber-50 border-amber-200',     label: 'Partially right' },
  };
  const vc = verdictConfig[review.verdict] || verdictConfig.partial;

  return (
    <div className={`mt-3 p-4 rounded-card border ${vc.bg}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="material-symbols-outlined text-[16px] filled" style={{ color: vc.color.replace('text-', '') }}>{vc.icon}</span>
        <span className={`font-mono text-[10px] font-bold tracking-widest uppercase ${vc.color}`}>
          Interviewer says: {vc.label}
        </span>
      </div>
      <p className="font-sans text-[14px] text-slate-800 leading-relaxed mb-3">{review.feedback}</p>
      {review.follow_up && (
        <div className="pt-2.5 border-t border-slate-200">
          <span className="font-mono text-[10px] font-semibold tracking-widest uppercase text-slate-400 block mb-1">Follow-up question</span>
          <p className="font-sans text-[13px] text-slate-700 italic">"{review.follow_up}"</p>
        </div>
      )}
    </div>
  );
}

const HINTS = [
  null,
  'Not quite. Re-read the question — focus on the key term.',
  'Still wrong. Think about what happens step by step. The correct answer relates to the core concept of this question.',
];

function MCQExercise({ exercise, onAnswer, lessonTitle, token, onReviewCards }) {
  const [selected, setSelected]     = useState(null);
  const [attempts, setAttempts]     = useState(0);
  const [wrongPicks, setWrongPicks] = useState(new Set());
  const [confirmed, setConfirmed]   = useState(false);
  const [checklistDismissed, setChecklistDismissed] = useState(false);

  const isCorrect     = selected === exercise.correct;
  const answered      = confirmed;
  const hint          = HINTS[Math.min(attempts, HINTS.length - 1)];
  const checklist     = getChecklist(lessonTitle);
  const showChecklist = selected !== null && !answered && attempts === 0 && !checklistDismissed;

  function handleSelect(i) {
    if (answered) return;
    setSelected(i);
    setChecklistDismissed(false);
  }

  function handleCheck() {
    if (selected === null || answered) return;
    setChecklistDismissed(true);
    if (selected === exercise.correct) {
      setConfirmed(true);
    } else {
      const next = attempts + 1;
      setAttempts(next);
      setWrongPicks(prev => new Set([...prev, selected]));
      if (next >= 3) setConfirmed(true);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-4">
        {exercise.explanation_context && (
          <p className="font-sans text-[13px] text-aq-text-muted mb-3 italic">{exercise.explanation_context}</p>
        )}
        <h2 className="font-sans font-bold text-[20px] text-aq-text-primary leading-snug mb-6">
          {exercise.question}
        </h2>
        <div className="flex flex-col gap-3">
          {exercise.options.map((opt, i) => {
            let border = 'border-aq-border';
            let bg = 'bg-aq-surface';
            let text = 'text-aq-text-primary';

            if (answered) {
              if (i === exercise.correct) {
                border = 'border-aq-success';
                bg = 'bg-aq-success-bg';
                text = 'text-aq-success';
              } else if (wrongPicks.has(i)) {
                border = 'border-aq-error';
                bg = 'bg-aq-error-bg';
                text = 'text-aq-error';
              } else {
                text = 'text-aq-text-muted';
              }
            } else if (wrongPicks.has(i)) {
              border = 'border-aq-error';
              bg = 'bg-aq-error-bg';
              text = 'text-aq-error opacity-60';
            } else if (selected === i) {
              border = 'border-aq-primary';
              bg = 'bg-aq-primary-dim';
            }

            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={wrongPicks.has(i) && !answered}
                className={`w-full text-left px-4 py-3.5 border rounded-card transition-colors ${border} ${bg} disabled:cursor-default`}
              >
                <span className={`font-sans text-[15px] font-medium ${text}`}>{opt}</span>
              </button>
            );
          })}
        </div>

        {!answered && attempts > 0 && hint && (
          <div className="mt-4 flex items-start gap-2 p-3 rounded-card bg-amber-50 border border-amber-200">
            <span className="material-symbols-outlined text-[16px] text-amber-600 shrink-0 mt-0.5">lightbulb</span>
            <p className="font-sans text-[13px] text-amber-800 leading-snug">{hint}</p>
          </div>
        )}

        {answered && (
          <div className="mt-5 p-4 rounded-card border border-aq-border bg-aq-surface">
            <div className="flex items-center gap-2 mb-2">
              <span className={`material-symbols-outlined filled text-[18px] ${isCorrect ? 'text-aq-success' : 'text-aq-error'}`}>
                {isCorrect ? 'check_circle' : 'cancel'}
              </span>
              <span className={`font-mono text-[11px] font-bold tracking-widest ${isCorrect ? 'text-aq-success' : 'text-aq-error'}`}>
                {isCorrect ? 'CORRECT' : 'ANSWER REVEALED'}
              </span>
              {attempts > 0 && (
                <span className="ml-auto font-mono text-[10px] text-aq-text-muted">{attempts} attempt{attempts > 1 ? 's' : ''}</span>
              )}
            </div>
            <p className="font-sans text-[14px] text-aq-text-secondary leading-relaxed">{exercise.explanation}</p>
            {token && (
              <AIReviewPanel
                exercise={exercise}
                selected={selected}
                lessonTitle={lessonTitle}
                token={token}
              />
            )}
          </div>
        )}
      </div>

      <div className="px-5 pb-6 pt-3 border-t border-aq-border">
        {showChecklist && (
          <div className="mb-3 p-3.5 rounded-xl border-2 border-amber-200 bg-amber-50">
            <div className="flex items-center justify-between mb-2">
              <p className="font-mono text-[9px] font-bold tracking-widest uppercase text-amber-700">Before you lock in…</p>
              <button onClick={() => setChecklistDismissed(true)} className="font-mono text-[9px] text-amber-500 hover:text-amber-700">dismiss</button>
            </div>
            <div className="space-y-1.5">
              {checklist.map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[13px] text-amber-600 shrink-0 mt-0.5">{item.icon}</span>
                  <p className="font-sans text-[12px] text-amber-900 leading-snug">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {!answered ? (
          <button
            onClick={handleCheck}
            disabled={selected === null || wrongPicks.has(selected)}
            className="w-full py-3.5 rounded-input font-mono text-[13px] font-semibold tracking-widest uppercase transition-colors disabled:opacity-30 disabled:cursor-default bg-aq-text-primary text-white"
          >
            CHECK
          </button>
        ) : (
          <div className="flex flex-col gap-2">
            {!isCorrect && onReviewCards && (
              <button
                onClick={onReviewCards}
                className="w-full py-2.5 rounded-input font-mono text-[11px] font-semibold tracking-widest uppercase border border-aq-border text-aq-text-muted bg-aq-surface hover:bg-aq-surface-raised transition-colors flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[15px]">arrow_back</span>
                Re-read concept cards
              </button>
            )}
            <button
              onClick={() => onAnswer(isCorrect)}
              className="w-full py-3.5 rounded-input font-mono text-[13px] font-semibold tracking-widest uppercase text-white transition-colors"
              style={{ backgroundColor: isCorrect ? '#059669' : '#dc2626' }}
            >
              CONTINUE →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function CodePickExercise({ exercise, onAnswer }) {
  const [selected, setSelected] = useState(null);
  const answered = selected !== null;

  function handleSelect(i) {
    if (answered) return;
    setSelected(i);
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-4">
        <h2 className="font-sans font-bold text-[20px] text-aq-text-primary leading-snug mb-4">
          {exercise.question}
        </h2>
        {exercise.context && (
          <div className="mb-6">
            <CodeBlock text={exercise.context} />
          </div>
        )}
        <div className="flex flex-col gap-3">
          {exercise.options.map((opt, i) => {
            let border = 'border-aq-border';
            let bg = 'bg-aq-surface';
            let text = 'text-aq-text-primary';

            if (answered) {
              if (i === exercise.correct) { border = 'border-aq-success'; bg = 'bg-aq-success-bg'; text = 'text-aq-success'; }
              else if (i === selected) { border = 'border-aq-error'; bg = 'bg-aq-error-bg'; text = 'text-aq-error'; }
              else { text = 'text-aq-text-muted'; }
            } else if (selected === i) {
              border = 'border-aq-primary'; bg = 'bg-aq-primary-dim';
            }

            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                className={`w-full text-left px-4 py-3 border rounded-card transition-colors ${border} ${bg}`}
              >
                <span className={`font-mono text-[14px] ${text}`}>{opt}</span>
              </button>
            );
          })}
        </div>

        {answered && (
          <div className="mt-5 p-4 rounded-card border border-aq-border bg-aq-surface">
            <div className="flex items-center gap-2 mb-2">
              <span className={`material-symbols-outlined filled text-[18px] ${selected === exercise.correct ? 'text-aq-success' : 'text-aq-error'}`}>
                {selected === exercise.correct ? 'check_circle' : 'cancel'}
              </span>
              <span className={`font-mono text-[11px] font-bold tracking-widest ${selected === exercise.correct ? 'text-aq-success' : 'text-aq-error'}`}>
                {selected === exercise.correct ? 'CORRECT' : 'NOT QUITE'}
              </span>
            </div>
            <p className="font-sans text-[14px] text-aq-text-secondary leading-relaxed">{exercise.explanation}</p>
          </div>
        )}
      </div>

      <div className="px-5 pb-6 pt-3 border-t border-aq-border">
        {!answered ? (
          <button
            disabled={selected === null}
            onClick={() => selected !== null && setSelected(selected)}
            className="w-full py-3.5 rounded-input font-mono text-[13px] font-semibold tracking-widest uppercase transition-colors disabled:opacity-30 disabled:cursor-default bg-aq-text-primary text-white"
          >
            CHECK
          </button>
        ) : (
          <button
            onClick={() => onAnswer(selected === exercise.correct)}
            className="w-full py-3.5 rounded-input font-mono text-[13px] font-semibold tracking-widest uppercase text-white transition-colors"
            style={{ backgroundColor: selected === exercise.correct ? '#5a7a3a' : '#9b3c3c' }}
          >
            CONTINUE →
          </button>
        )}
      </div>
    </div>
  );
}

function FillBlankExercise({ exercise, onAnswer }) {
  const [selected, setSelected] = useState(null);
  const answered = selected !== null;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-4">
        <h2 className="font-sans font-bold text-[20px] text-aq-text-primary leading-snug mb-4">
          {exercise.question}
        </h2>

        <div className="bg-aq-surface-raised rounded-card px-4 py-4 font-mono text-[14px] leading-loose mb-6">
          {exercise.code_lines.map((line, i) => {
            if (i === exercise.blank_index) {
              const filled = selected !== null ? exercise.options[selected] : null;
              return (
                <div key={i}>
                  {line.replace(exercise.blank_placeholder, '')}
                  <span
                    className={`inline-block px-2 py-0.5 rounded mx-1 border transition-colors ${
                      filled
                        ? answered
                          ? selected === exercise.correct
                            ? 'border-aq-success bg-aq-success-bg text-aq-success'
                            : 'border-aq-error bg-aq-error-bg text-aq-error'
                          : 'border-aq-primary bg-aq-primary-dim text-aq-primary'
                        : 'border-dashed border-aq-border text-aq-text-muted w-16 text-center'
                    }`}
                  >
                    {filled || '____'}
                  </span>
                </div>
              );
            }
            return <div key={i} className="text-aq-text-primary">{line}</div>;
          })}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {exercise.options.map((opt, i) => {
            const isSelected = selected === i;
            return (
              <button
                key={i}
                onClick={() => !answered && setSelected(isSelected ? null : i)}
                className={`px-4 py-2.5 rounded-input border font-mono text-[14px] font-medium transition-colors ${
                  isSelected
                    ? 'border-aq-primary bg-aq-primary-dim text-aq-primary'
                    : 'border-aq-border bg-aq-surface text-aq-text-primary hover:border-aq-border-strong'
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {answered && (
          <div className="p-4 rounded-card border border-aq-border bg-aq-surface mt-2">
            <div className="flex items-center gap-2 mb-2">
              <span className={`material-symbols-outlined filled text-[18px] ${selected === exercise.correct ? 'text-aq-success' : 'text-aq-error'}`}>
                {selected === exercise.correct ? 'check_circle' : 'cancel'}
              </span>
              <span className={`font-mono text-[11px] font-bold tracking-widest ${selected === exercise.correct ? 'text-aq-success' : 'text-aq-error'}`}>
                {selected === exercise.correct ? 'CORRECT' : 'NOT QUITE'}
              </span>
            </div>
            <p className="font-sans text-[14px] text-aq-text-secondary leading-relaxed">{exercise.explanation}</p>
          </div>
        )}
      </div>

      <div className="px-5 pb-6 pt-3 border-t border-aq-border">
        {!answered ? (
          <button
            disabled={selected === null}
            onClick={() => selected !== null && setSelected(selected)}
            className="w-full py-3.5 rounded-input font-mono text-[13px] font-semibold tracking-widest uppercase transition-colors disabled:opacity-30 disabled:cursor-default bg-aq-text-primary text-white"
          >
            CHECK
          </button>
        ) : (
          <button
            onClick={() => onAnswer(selected === exercise.correct)}
            className="w-full py-3.5 rounded-input font-mono text-[13px] font-semibold tracking-widest uppercase text-white"
            style={{ backgroundColor: selected === exercise.correct ? '#5a7a3a' : '#9b3c3c' }}
          >
            CONTINUE →
          </button>
        )}
      </div>
    </div>
  );
}

function ArrangeExercise({ exercise, onAnswer }) {
  const [order, setOrder] = useState(() =>
    exercise.blocks.map((_, i) => i).sort(() => Math.random() - 0.5)
  );
  const [submitted, setSubmitted] = useState(false);

  const isCorrect = submitted && JSON.stringify(order) === JSON.stringify(exercise.correct_order);

  function moveUp(idx) {
    if (idx === 0 || submitted) return;
    const next = [...order];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    setOrder(next);
  }

  function moveDown(idx) {
    if (idx === order.length - 1 || submitted) return;
    const next = [...order];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    setOrder(next);
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-4">
        <h2 className="font-sans font-bold text-[20px] text-aq-text-primary leading-snug mb-2">
          {exercise.question}
        </h2>
        <p className="font-sans text-[13px] text-aq-text-muted mb-5">Tap ↑ ↓ to reorder the lines.</p>

        <div className="flex flex-col gap-2">
          {order.map((blockIdx, pos) => {
            const isCorrectPos = submitted && exercise.correct_order[pos] === blockIdx;
            const isWrongPos = submitted && exercise.correct_order[pos] !== blockIdx;
            return (
              <div
                key={blockIdx}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-card border transition-colors ${
                  isCorrectPos ? 'border-aq-success bg-aq-success-bg' :
                  isWrongPos ? 'border-aq-error bg-aq-error-bg' :
                  'border-aq-border bg-aq-surface'
                }`}
              >
                <div className="flex flex-col gap-0.5 flex-shrink-0">
                  <button
                    onClick={() => moveUp(pos)}
                    disabled={pos === 0 || submitted}
                    className="text-aq-text-muted hover:text-aq-text-primary disabled:opacity-20 text-[14px] leading-none"
                  >↑</button>
                  <button
                    onClick={() => moveDown(pos)}
                    disabled={pos === order.length - 1 || submitted}
                    className="text-aq-text-muted hover:text-aq-text-primary disabled:opacity-20 text-[14px] leading-none"
                  >↓</button>
                </div>
                <span className={`font-mono text-[13px] flex-1 ${
                  isCorrectPos ? 'text-aq-success' : isWrongPos ? 'text-aq-error' : 'text-aq-text-primary'
                }`}>
                  {exercise.blocks[blockIdx]}
                </span>
              </div>
            );
          })}
        </div>

        {submitted && (
          <div className="mt-5 p-4 rounded-card border border-aq-border bg-aq-surface">
            <div className="flex items-center gap-2 mb-2">
              <span className={`material-symbols-outlined filled text-[18px] ${isCorrect ? 'text-aq-success' : 'text-aq-error'}`}>
                {isCorrect ? 'check_circle' : 'cancel'}
              </span>
              <span className={`font-mono text-[11px] font-bold tracking-widest ${isCorrect ? 'text-aq-success' : 'text-aq-error'}`}>
                {isCorrect ? 'CORRECT' : 'NOT QUITE'}
              </span>
            </div>
            <p className="font-sans text-[14px] text-aq-text-secondary leading-relaxed">{exercise.explanation}</p>
          </div>
        )}
      </div>

      <div className="px-5 pb-6 pt-3 border-t border-aq-border">
        {!submitted ? (
          <button
            onClick={() => setSubmitted(true)}
            className="w-full py-3.5 rounded-input font-mono text-[13px] font-semibold tracking-widest uppercase bg-aq-text-primary text-white"
          >
            CHECK
          </button>
        ) : (
          <button
            onClick={() => onAnswer(isCorrect)}
            className="w-full py-3.5 rounded-input font-mono text-[13px] font-semibold tracking-widest uppercase text-white"
            style={{ backgroundColor: isCorrect ? '#5a7a3a' : '#9b3c3c' }}
          >
            CONTINUE →
          </button>
        )}
      </div>
    </div>
  );
}

function CompletionScreen({ lesson, correct, total, color, onFinish, ahaNote, setAhaNote, onSaveAha, ahaSaved, ahaSaving }) {
  const xpEarned = Math.round((correct / total) * lesson.xp_reward);
  const perfect = correct === total;
  const hasEvolution = !!(lesson.slug && EVOLUTIONS[lesson.slug]);

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
        style={{ backgroundColor: color + '20' }}
      >
        <span className="material-symbols-outlined filled text-[44px]" style={{ color }}>
          {perfect ? 'workspace_premium' : 'check_circle'}
        </span>
      </div>
      <h2 className="font-sans font-bold text-[26px] text-aq-text-primary mb-2">
        {perfect ? 'Perfect score!' : 'Lesson complete!'}
      </h2>
      <p className="font-sans text-[15px] text-aq-text-secondary mb-8">
        {correct}/{total} correct
      </p>

      <div className="flex gap-6 mb-8">
        <div className="flex flex-col items-center gap-1">
          <span className="font-mono font-bold text-[28px]" style={{ color }}>+{xpEarned}</span>
          <span className="font-mono text-[10px] tracking-widest uppercase text-aq-text-muted">XP EARNED</span>
        </div>
        <div className="w-px bg-aq-border" />
        <div className="flex flex-col items-center gap-1">
          <span className="font-mono font-bold text-[28px] text-aq-gold">
            <span className="material-symbols-outlined filled text-[28px]">local_fire_department</span>
          </span>
          <span className="font-mono text-[10px] tracking-widest uppercase text-aq-text-muted">STREAK +1</span>
        </div>
      </div>

      <div className="w-full mb-6 text-left">
        <label className="font-mono text-[10px] font-bold tracking-widest uppercase text-slate-400 block mb-2">
          What was the ONE thing that clicked? (your aha moment)
        </label>
        <textarea
          value={ahaNote}
          onChange={e => setAhaNote(e.target.value)}
          disabled={ahaSaved}
          rows={2}
          placeholder="e.g. Binary search works because sorted arrays let you eliminate half the search space each step..."
          className="w-full font-sans text-[13px] text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:border-emerald-300 transition-colors placeholder:text-slate-300 disabled:opacity-60"
        />
        <button
          onClick={onSaveAha}
          disabled={!ahaNote.trim() || ahaSaved || ahaSaving}
          className="mt-2 w-full py-2 rounded-xl font-mono text-[10px] font-bold tracking-widest uppercase transition-colors disabled:opacity-40"
          style={{ background: ahaSaved ? '#dcfce7' : '#f1f5f9', color: ahaSaved ? '#15803d' : '#64748b' }}
        >
          {ahaSaved ? '✓ Saved to your journal' : ahaSaving ? 'Saving…' : 'Save to journal'}
        </button>
      </div>

      {hasEvolution && (
        <Link
          href="/evolutions"
          className="w-full mb-3 py-3 rounded-input font-mono text-[12px] font-semibold tracking-widest uppercase flex items-center justify-center gap-2 border-2 border-orange-400 text-orange-700 bg-orange-50 hover:bg-orange-100 transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">trending_up</span>
          See Brute Force → Optimal
        </Link>
      )}

      <button
        onClick={onFinish}
        className="w-full py-3.5 rounded-input font-mono text-[13px] font-semibold tracking-widest uppercase text-white"
        style={{ backgroundColor: color }}
      >
        BACK TO TOPICS
      </button>

      <div className="mt-5 pt-4 border-t border-aq-border w-full">
        <p className="font-mono text-[10px] text-aq-text-muted tracking-widest uppercase text-center mb-3">Go deeper when you have time</p>
        <div className="flex gap-2">
          <Link href="/practice/patterns" className="flex-1 py-2 rounded-lg border border-slate-200 text-center font-mono text-[10px] font-semibold text-slate-500 hover:border-violet-300 hover:text-violet-700 hover:bg-violet-50 transition-colors">
            Patterns
          </Link>
          <Link href="/practice/teach" className="flex-1 py-2 rounded-lg border border-slate-200 text-center font-mono text-[10px] font-semibold text-slate-500 hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50 transition-colors">
            Teach It
          </Link>
          <Link href="/practice/debug" className="flex-1 py-2 rounded-lg border border-slate-200 text-center font-mono text-[10px] font-semibold text-slate-500 hover:border-red-300 hover:text-red-700 hover:bg-red-50 transition-colors">
            Debug
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LessonPage() {
  const router = useRouter();
  const params = useParams();

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [correctCount, setCorrectCount]   = useState(0);
  const [done, setDone]                   = useState(false);
  const [saveError, setSaveError]         = useState(null);
  const [cardIndex, setCardIndex]         = useState(0);
  const [sessionToken, setSessionToken]   = useState(null);
  const [ahaNote, setAhaNote]             = useState('');
  const [ahaSaved, setAhaSaved]           = useState(false);
  const [ahaSaving, setAhaSaving]         = useState(false);
  const [unstuckOpen, setUnstuckOpen]     = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSessionToken(data?.session?.access_token || null);
    });
  }, []);

  useEffect(() => {
    if (!params.slug) return;
    setLoading(true);
    getLessonBySlug(params.slug)
      .then(setLesson)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [params.slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-aq-bg flex items-center justify-center">
        <span className="material-symbols-outlined text-[32px] text-aq-text-muted animate-spin">progress_activity</span>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="min-h-screen bg-aq-bg flex flex-col items-center justify-center gap-4 px-6">
        <span className="material-symbols-outlined text-[40px] text-aq-error">error</span>
        <p className="font-sans text-aq-text-muted text-center">{error || 'Lesson not found.'}</p>
        <button
          onClick={() => router.back()}
          className="px-6 py-2.5 rounded-input font-mono text-[13px] font-semibold tracking-widest uppercase bg-aq-text-primary text-white"
        >
          GO BACK
        </button>
      </div>
    );
  }

  const color     = CAT_COLOR[lesson.category] || CAT_COLOR.dsa;
  const cards     = lesson.cards || [];
  const exercises = lesson.exercises;
  const showingCards = cardIndex < cards.length;
  const currentCard  = cards[cardIndex];
  const currentExercise = exercises[exerciseIndex];
  const totalSteps = cards.length + exercises.length;

  async function handleAnswer(isCorrect, exercise) {
    if (exercise?.id) {
      saveExerciseAttempt({
        exerciseId:    String(exercise.id),
        lessonId:      String(lesson.id),
        isCorrect,
        attemptsTaken: 1,
      }).catch(() => {});
    }
    const nextCorrect = isCorrect ? correctCount + 1 : correctCount;
    if (exerciseIndex + 1 >= exercises.length) {
      setCorrectCount(nextCorrect);
      setDone(true);
      try {
        await completeLesson(
          lesson.id,
          nextCorrect,
          exercises.length,
          Math.round((nextCorrect / exercises.length) * lesson.xp_reward)
        );
      } catch (err) {
        setSaveError(err.message || 'Your lesson result could not be saved.');
      }
    } else {
      setCorrectCount(nextCorrect);
      setExerciseIndex(exerciseIndex + 1);
    }
  }

  async function handleSaveAha() {
    if (!ahaNote.trim() || ahaSaved) return;
    setAhaSaving(true);
    try {
      await saveAhaJournal({ lessonId: String(lesson.id), lessonTitle: lesson.title, note: ahaNote.trim() });
      setAhaSaved(true);
    } catch {
    } finally {
      setAhaSaving(false);
    }
  }

  function renderExercise(exercise) {
    const key = `${lesson.id}-${exercise.id}`;
    const onAns = (ok) => handleAnswer(ok, exercise);
    if (exercise.type === 'mcq')        return <MCQExercise key={key} exercise={exercise} onAnswer={onAns} lessonTitle={lesson.title} token={sessionToken} onReviewCards={cards.length > 0 ? () => setCardIndex(0) : null} />;
    if (exercise.type === 'code_pick') return <CodePickExercise key={key} exercise={exercise} onAnswer={onAns} />;
    if (exercise.type === 'fill_blank') return <FillBlankExercise key={key} exercise={exercise} onAnswer={onAns} />;
    if (exercise.type === 'arrange')   return <ArrangeExercise key={key} exercise={exercise} onAnswer={onAns} />;
    return null;
  }

  const UNSTUCK_STEPS = [
    { n: 1, label: 'Restate the problem in one sentence.' },
    { n: 2, label: 'Write a concrete example (3–4 elements).' },
    { n: 3, label: 'State the brute force — even if it\'s O(n²).' },
    { n: 4, label: 'What\'s the bottleneck? Can you eliminate it?' },
    { n: 5, label: 'Which pattern fits? (Two Pointer, BFS, DP, Hash Map…)' },
  ];

  return (
    <div className="min-h-screen bg-aq-surface flex flex-col" style={{ maxHeight: '100dvh', overflow: 'hidden' }}>
      {/* Alex — floats over lesson, auto-detects topic from slug */}
      <Companion />
      {unstuckOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={e => e.target === e.currentTarget && setUnstuckOpen(false)}>
          <div className="w-full max-w-sm mx-4 mb-4 sm:mb-0 bg-white rounded-2xl overflow-hidden shadow-2xl">
            <div className="px-5 py-4 border-b border-indigo-900 flex items-center justify-between" style={{ background: 'linear-gradient(135deg,#1e1b4b,#312e81)' }}>
              <div>
                <p className="font-mono text-[9px] font-bold tracking-widest uppercase text-indigo-300">Mind went blank?</p>
                <p className="font-sans font-bold text-[17px] text-white">The Unstuck Protocol</p>
              </div>
              <button onClick={() => setUnstuckOpen(false)} className="text-indigo-300 hover:text-white">
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>
            <div className="p-5 space-y-3">
              {UNSTUCK_STEPS.map(s => (
                <div key={s.n} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                    <span className="font-mono text-[11px] font-bold text-indigo-700">{s.n}</span>
                  </div>
                  <p className="font-sans text-[14px] text-slate-700 leading-snug pt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="px-5 pb-5">
              <p className="font-mono text-[10px] text-slate-400 text-center mb-3">Say each step out loud. Silence is the enemy.</p>
              <Link href="/unstuck" onClick={() => setUnstuckOpen(false)} className="block w-full py-3 rounded-xl font-mono text-[11px] font-bold tracking-widest uppercase text-center text-white" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                Practice the Protocol →
              </Link>
            </div>
          </div>
        </div>
      )}

      {!showingCards && !done && (
        <button onClick={() => setUnstuckOpen(true)} className="fixed bottom-6 left-4 z-40 flex items-center gap-1.5 px-3 py-2 rounded-xl shadow-lg border border-slate-200 bg-white hover:bg-slate-50 transition-all" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <span className="text-[16px]">🆘</span>
          <span className="font-mono text-[9px] font-bold tracking-widest uppercase text-slate-500">Stuck?</span>
        </button>
      )}

      {/* ── Top bar ── */}
      <div style={{ flexShrink: 0, padding: '14px 20px 12px', borderBottom: '1px solid #f1f5f9', background: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={() => router.back()}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: 8, display: 'flex', alignItems: 'center', color: '#94a3b8', flexShrink: 0, transition: 'color 150ms' }}
            onMouseEnter={e => e.currentTarget.style.color = '#475569'}
            onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 22 }}>close</span>
          </button>
          {/* Progress bar */}
          <div style={{ flex: 1, height: 8, borderRadius: 100, background: '#f1f5f9', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 100, background: color,
              width: `${Math.round(((done ? totalSteps : cardIndex + exerciseIndex) / totalSteps) * 100)}%`,
              transition: 'width 400ms ease',
            }} />
          </div>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 700, color: '#94a3b8', flexShrink: 0, letterSpacing: '0.06em' }}>
            {done ? totalSteps : cardIndex + exerciseIndex}/{totalSteps}
          </span>
        </div>
        <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color, marginTop: 10, margin: '10px 0 0' }}>
          {lesson.title}
        </p>
      </div>

      <div className="flex-1 overflow-hidden">
        {done ? (
          <div className="h-full overflow-y-auto px-5 py-6">
            <CompletionScreen
              lesson={lesson}
              correct={correctCount}
              total={exercises.length}
              color={color}
              onFinish={() => router.push('/skills')}
              ahaNote={ahaNote}
              setAhaNote={setAhaNote}
              onSaveAha={handleSaveAha}
              ahaSaved={ahaSaved}
              ahaSaving={ahaSaving}
            />
            {saveError && <p role="alert" className="px-5 pb-4 font-sans text-[13px] text-aq-error text-center">{saveError}</p>}
          </div>
        ) : showingCards ? (
          <ConceptCard
            key={cardIndex}
            card={currentCard}
            index={cardIndex}
            total={cards.length}
            color={color}
            onNext={() => setCardIndex(i => i + 1)}
            token={sessionToken}
          />
        ) : (
          renderExercise(currentExercise)
        )}
      </div>
    </div>
  );
}
