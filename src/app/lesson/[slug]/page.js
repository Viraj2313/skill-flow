'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { completeLesson, getLessonBySlug } from '@/lib/db';
import { supabase } from '@/lib/supabase';
import { EVOLUTIONS } from '@/data/evolutions';

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
    <div className="bg-aq-surface-raised rounded-input px-4 py-3 font-mono text-[13px] text-aq-text-primary whitespace-pre leading-relaxed overflow-x-auto">
      {text}
    </div>
  );
}

function ConceptCard({ card, index, total, color, onNext, token }) {
  const [altText, setAltText] = useState(null);
  const [explaining, setExplaining] = useState(false);
  const [explainErr, setExplainErr] = useState(null);

  async function handleExplain() {
    setExplaining(true);
    setExplainErr(null);
    setAltText(null);
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

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-4">
        {card.heading && (
          <h2 className="font-sans font-bold text-[22px] text-aq-text-primary leading-snug mb-4">
            {card.heading}
          </h2>
        )}
        {altText ? (
          <div className="mb-5">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="material-symbols-outlined text-[15px] text-purple-600 filled">auto_awesome</span>
              <span className="font-mono text-[10px] font-bold tracking-widest uppercase text-purple-600">AI Explanation</span>
            </div>
            <p className="font-sans text-[16px] text-aq-text-secondary leading-relaxed whitespace-pre-line bg-purple-50 border border-purple-200 rounded-card p-4">
              {altText}
            </p>
            <button
              onClick={() => setAltText(null)}
              className="mt-2 font-mono text-[10px] text-aq-text-muted tracking-wide hover:text-aq-text-primary"
            >
              ← Back to original
            </button>
          </div>
        ) : (
          <p className="font-sans text-[16px] text-aq-text-secondary leading-relaxed whitespace-pre-line mb-5">
            {card.body}
          </p>
        )}
        {card.code && <CodeBlock text={card.code} />}
        {explainErr && (
          <p className="mt-3 font-sans text-[12px] text-aq-error">{explainErr}</p>
        )}
      </div>
      <div className="px-5 pb-6 pt-3 border-t border-aq-border space-y-2.5">
        <button
          onClick={onNext}
          className="w-full py-2 rounded-input font-mono text-[11px] font-semibold tracking-widest uppercase border border-slate-200 text-slate-500 bg-white hover:bg-slate-50 transition-colors"
        >
          I already know this — skip
        </button>
        {!altText && (
          <button
            onClick={handleExplain}
            disabled={explaining}
            className="w-full py-2.5 rounded-input font-mono text-[12px] font-semibold tracking-widest uppercase border border-purple-300 text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {explaining ? (
              <><span className="w-3.5 h-3.5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" /> Thinking...</>
            ) : (
              <><span className="material-symbols-outlined text-[16px]">auto_awesome</span> Explain it differently</>
            )}
          </button>
        )}
        <button
          onClick={onNext}
          className="w-full py-3.5 rounded-input font-mono text-[13px] font-semibold tracking-widest uppercase text-white transition-colors"
          style={{ backgroundColor: color }}
        >
          {index + 1 < total ? 'GOT IT →' : 'START EXERCISES →'}
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

  const isCorrect = selected === exercise.correct;
  const answered  = confirmed;
  const hint      = HINTS[Math.min(attempts, HINTS.length - 1)];

  function handleSelect(i) {
    if (answered) return;
    setSelected(i);
  }

  function handleCheck() {
    if (selected === null || answered) return;
    if (selected === exercise.correct) {
      setConfirmed(true);
    } else {
      const next = attempts + 1;
      setAttempts(next);
      setWrongPicks(prev => new Set([...prev, selected]));
      if (next >= 3) {
        setConfirmed(true);
      }
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

function CompletionScreen({ lesson, correct, total, color, onFinish }) {
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

      <div className="flex gap-6 mb-10">
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

  async function handleAnswer(isCorrect) {
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

  function renderExercise(exercise) {
    const key = `${lesson.id}-${exercise.id}`;
    if (exercise.type === 'mcq') return <MCQExercise key={key} exercise={exercise} onAnswer={handleAnswer} lessonTitle={lesson.title} token={sessionToken} onReviewCards={cards.length > 0 ? () => setCardIndex(0) : null} />;
    if (exercise.type === 'code_pick') return <CodePickExercise key={key} exercise={exercise} onAnswer={handleAnswer} />;
    if (exercise.type === 'fill_blank') return <FillBlankExercise key={key} exercise={exercise} onAnswer={handleAnswer} />;
    if (exercise.type === 'arrange') return <ArrangeExercise key={key} exercise={exercise} onAnswer={handleAnswer} />;
    return null;
  }

  return (
    <div className="min-h-screen bg-aq-surface flex flex-col" style={{ maxHeight: '100dvh', overflow: 'hidden' }}>
      <div className="flex-shrink-0 px-4 pt-4 pb-3 border-b border-aq-border bg-aq-surface">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => router.back()}
            className="p-1 text-aq-text-muted hover:text-aq-text-primary flex-shrink-0"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
          <div className="flex-1">
            <ProgressBar
              current={done ? totalSteps : cardIndex + exerciseIndex}
              total={totalSteps}
              color={color}
            />
          </div>
          <span className="font-mono text-[11px] text-aq-text-muted flex-shrink-0">
            {done ? totalSteps : cardIndex + exerciseIndex}/{totalSteps}
          </span>
        </div>
        <h1 className="font-mono text-[12px] font-semibold tracking-widest uppercase" style={{ color }}>
          {lesson.title}
        </h1>
      </div>

      <div className="flex-1 overflow-hidden">
        {done ? (
          <div className="h-full px-5 py-6">
            <CompletionScreen
              lesson={lesson}
              correct={correctCount}
              total={exercises.length}
              color={color}
              onFinish={() => router.push('/skills')}
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
