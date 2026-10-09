'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { getUserMistakesAndPerformance, saveExerciseAttempt } from '@/lib/db';
import { playSuccessSound, playErrorSound } from '@/lib/audio';

const CAT_THEME = {
  dsa: { label: 'DSA', color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
  python: { label: 'Python', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
  'cs-fundamentals': { label: 'CS Core', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
};

function AccuracyGauge({ pct }) {
  const color = pct >= 75 ? '#059669' : pct >= 50 ? '#d97706' : '#dc2626';
  return (
    <div className="flex items-center gap-3">
      <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.max(5, pct)}%`, backgroundColor: color }}
        />
      </div>
      <span className="font-mono text-[12px] font-bold" style={{ color }}>{pct}%</span>
    </div>
  );
}

function MistakeDrillModal({ items, onClose, onRefresh }) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [resolvedCount, setResolvedCount] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const current = items[idx];
  const total = items.length;

  const handleDiagnose = async () => {
    if (aiAnalysis) return;
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/mistake-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: current.question,
          correctAnswer: current.correctAnswer,
          explanation: current.explanation,
          topic: current.topicName,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to analyze');
      setAiAnalysis(data);
    } catch {
      setAiAnalysis({ whyMistakeHappens: 'Unable to load diagnosis at this moment.', howToAvoid: 'Review the underlying lesson rules.', mentalAnchor: 'Verify base constraints before concluding.' });
    } finally {
      setAiLoading(false);
    }
  };

  const handleConfirm = useCallback(async () => {
    if (!selected || submitted || saving) return;
    setSaving(true);
    setSubmitted(true);

    const isCorrect = selected === current.correctAnswer;
    if (isCorrect) {
      playSuccessSound();
      setResolvedCount(c => c + 1);
    } else {
      playErrorSound();
    }

    try {
      await saveExerciseAttempt({
        exerciseId: current.exerciseId,
        lessonId: current.lessonId,
        isCorrect,
        attemptsTaken: isCorrect ? 1 : (current.totalAttempts || 1) + 1,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }, [selected, submitted, saving, current]);

  const handleNext = () => {
    if (idx + 1 >= total) {
      setCompleted(true);
      return;
    }
    setIdx(i => i + 1);
    setSelected(null);
    setSubmitted(false);
    setAiAnalysis(null);
  };

  useEffect(() => {
    function onKeyDown(e) {
      if (completed) return;
      if (!submitted) {
        if (e.key >= '1' && e.key <= '4') {
          const optIdx = parseInt(e.key, 10) - 1;
          if (current?.options && current.options[optIdx]) {
            setSelected(current.options[optIdx]);
          }
        } else if (e.key === 'Enter' && selected) {
          handleConfirm();
        }
      } else {
        if (e.key === 'Enter') {
          handleNext();
        }
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [completed, submitted, selected, current, handleConfirm]);

  const handleFinish = () => {
    onRefresh();
    onClose();
  };

  if (completed) {
    const accuracy = Math.round((resolvedCount / total) * 100);
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-slate-200 text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-[36px] filled">military_tech</span>
          </div>

          <div>
            <h2 className="font-sans font-bold text-[24px] text-slate-900">Drill Completed!</h2>
            <p className="font-sans text-[14px] text-slate-500 mt-1">
              You tackled {total} target questions in this retest session.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div>
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Mistakes Resolved
              </span>
              <p className="font-mono font-bold text-[24px] text-emerald-600">
                {resolvedCount} / {total}
              </p>
            </div>
            <div>
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Drill Accuracy
              </span>
              <p className="font-mono font-bold text-[24px] text-slate-900">
                {accuracy}%
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleFinish}
            className="btn-tactile btn-tactile-primary w-full py-3 rounded-2xl font-mono text-[12px] font-bold uppercase tracking-wider text-white"
          >
            Update Focus Hub & Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-[11px] font-bold px-2.5 py-1 rounded-full uppercase bg-amber-100 text-amber-800 border border-amber-300">
              Retest Drill
            </span>
            <span className="font-mono text-[12px] text-slate-400">
              Question {idx + 1} of {total}
            </span>
          </div>

          <button
            type="button"
            onClick={handleFinish}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg font-mono text-sm"
          >
            ✕
          </button>
        </div>

        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className="bg-emerald-600 h-full transition-all duration-300"
            style={{ width: `${((idx + 1) / total) * 100}%` }}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-bold text-slate-500 uppercase">
              {current?.topicName} • {current?.lessonTitle}
            </span>
          </div>
          <h3 className="font-sans font-bold text-[18px] text-slate-900 leading-snug">
            {current?.question}
          </h3>
        </div>

        <div className="space-y-2.5">
          {(current?.options || []).map((opt, oIdx) => {
            const hotkey = oIdx + 1;
            const isSelected = selected === opt;
            const isTargetCorrect = opt === current.correctAnswer;

            let cardStyle = 'border-slate-200 hover:border-slate-400 bg-white';
            if (submitted) {
              if (isTargetCorrect) {
                cardStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold';
              } else if (isSelected && !isTargetCorrect) {
                cardStyle = 'border-red-400 bg-red-50 text-red-950';
              } else {
                cardStyle = 'border-slate-200 bg-slate-50/60 opacity-60';
              }
            } else if (isSelected) {
              cardStyle = 'border-slate-900 bg-slate-50 ring-2 ring-slate-900 font-semibold';
            }

            return (
              <button
                key={opt}
                type="button"
                disabled={submitted}
                onClick={() => setSelected(opt)}
                className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all ${cardStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-xl font-mono text-[11px] font-bold flex items-center justify-center border ${
                    isSelected ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    {hotkey}
                  </span>
                  <span className="font-mono text-[13px]">{opt}</span>
                </div>

                {submitted && isTargetCorrect && (
                  <span className="material-symbols-outlined text-[20px] text-emerald-600 filled">check_circle</span>
                )}
                {submitted && isSelected && !isTargetCorrect && (
                  <span className="material-symbols-outlined text-[20px] text-red-500 filled">cancel</span>
                )}
              </button>
            );
          })}
        </div>

        {submitted && (
          <div className="space-y-4 pt-2">
            {selected === current.correctAnswer ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-600 filled">check_circle</span>
                  <span className="font-sans font-bold text-[14px] text-emerald-900">
                    Correct! Marked as Resolved.
                  </span>
                </div>
                <span className="font-mono text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  +1 Cleared
                </span>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-700 filled">error</span>
                    <span className="font-sans font-bold text-[14px] text-amber-950">
                      Not quite. The correct answer is: {current.correctAnswer}
                    </span>
                  </div>
                </div>

                {current.explanation && (
                  <p className="font-sans text-[13px] text-amber-900/80 pl-6">
                    {current.explanation}
                  </p>
                )}

                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleDiagnose}
                    className="btn-tactile px-3.5 py-1.5 rounded-xl font-mono text-[11px] font-bold uppercase tracking-wider bg-indigo-600 hover:bg-indigo-500 border-b-[3px] border-indigo-800 text-white flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                    <span>{aiLoading ? 'Diagnosing with Alex...' : aiAnalysis ? 'Hide AI Diagnosis' : 'Diagnose Mistake with Alex'}</span>
                  </button>
                </div>

                {aiAnalysis && (
                  <div className="mt-3 p-3 bg-white rounded-xl border border-indigo-100 text-[12px] space-y-2 text-slate-700">
                    <p><strong>Trap:</strong> {aiAnalysis.whyMistakeHappens}</p>
                    <p><strong>Fix:</strong> {aiAnalysis.howToAvoid}</p>
                    <p className="font-mono text-[11px] text-indigo-900 bg-indigo-50 p-2 rounded">
                      Anchor: {aiAnalysis.mentalAnchor}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <span className="font-mono text-[11px] text-slate-400">
            Keys: 1-4 to pick, Enter to submit
          </span>

          {!submitted ? (
            <button
              type="button"
              disabled={!selected || saving}
              onClick={handleConfirm}
              className="btn-tactile btn-tactile-primary px-6 py-2.5 rounded-xl font-mono text-[11px] font-bold uppercase tracking-wider text-white disabled:opacity-50"
            >
              Check Answer
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="btn-tactile btn-tactile-primary px-6 py-2.5 rounded-xl font-mono text-[11px] font-bold uppercase tracking-wider text-white flex items-center gap-1.5"
            >
              <span>{idx + 1 < total ? 'Next Question' : 'View Summary'}</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function MistakeCard({ item, onRetest }) {
  const [analysis, setAnalysis] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [errorAi, setErrorAi] = useState(null);
  const [expanded, setExpanded] = useState(false);

  const theme = CAT_THEME[item.category] || CAT_THEME.dsa;

  async function handleDiagnose() {
    if (analysis) {
      setExpanded(prev => !prev);
      return;
    }
    setLoadingAi(true);
    setErrorAi(null);
    setExpanded(true);
    try {
      const res = await fetch('/api/ai/mistake-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: item.question,
          correctAnswer: item.correctAnswer,
          explanation: item.explanation,
          topic: item.topicName,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to analyze');
      setAnalysis(data);
    } catch (err) {
      setErrorAi(err.message || 'Could not generate analysis.');
    } finally {
      setLoadingAi(false);
    }
  }

  return (
    <div className={`bg-white border rounded-2xl overflow-hidden transition-all shadow-sm ${item.isResolved ? 'border-slate-200' : 'border-amber-200 hover:border-amber-300'}`}>
      <div className="px-5 py-3.5 border-b flex flex-wrap items-center justify-between gap-2 bg-slate-50/70">
        <div className="flex items-center gap-2">
          <span
            className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full uppercase"
            style={{ backgroundColor: theme.color + '15', color: theme.color }}
          >
            {item.topicName}
          </span>
          <span className="font-mono text-[11px] text-slate-400">•</span>
          <span className="font-sans text-[12px] font-medium text-slate-600 truncate max-w-[200px]">
            {item.lessonTitle}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {item.isResolved ? (
            <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              <span className="material-symbols-outlined text-[13px] filled">check_circle</span>
              Resolved
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
              <span className="material-symbols-outlined text-[13px] filled">warning</span>
              Needs Review
            </span>
          )}
          <span className="font-mono text-[10px] text-slate-400">
            {item.totalAttempts} {item.totalAttempts === 1 ? 'attempt' : 'attempts'}
          </span>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div>
          <span className="font-mono text-[10px] font-bold tracking-widest uppercase text-slate-400 block mb-1">
            Question
          </span>
          <p className="font-sans font-semibold text-[15px] text-slate-900 leading-snug">
            {item.question}
          </p>
        </div>

        {item.correctAnswer && (
          <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[16px] text-emerald-600 shrink-0 mt-0.5 filled">check_circle</span>
            <div className="flex-1 min-w-0">
              <span className="font-mono text-[10px] font-bold tracking-widest uppercase text-emerald-800 block mb-0.5">
                Correct Answer
              </span>
              <p className="font-mono text-[13px] text-emerald-900 break-words font-medium">
                {item.correctAnswer}
              </p>
            </div>
          </div>
        )}

        {item.explanation && (
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="font-mono text-[10px] font-bold tracking-widest uppercase text-slate-400 block mb-0.5">
              Concept Note
            </span>
            <p className="font-sans text-[13px] text-slate-600 leading-relaxed">
              {item.explanation}
            </p>
          </div>
        )}

        {expanded && (
          <div className="mt-3 p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-indigo-600">psychology</span>
                <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-indigo-900">
                  Alex AI Mistake Diagnosis
                </span>
              </div>
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-mono"
              >
                ✕
              </button>
            </div>

            {loadingAi ? (
              <div className="flex items-center gap-2.5 py-3 text-indigo-700">
                <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                <span className="font-sans text-[13px]">Analyzing why this error happens...</span>
              </div>
            ) : errorAi ? (
              <p className="font-sans text-[13px] text-red-600">{errorAi}</p>
            ) : analysis ? (
              <div className="space-y-2.5 text-[13px] text-slate-700 font-sans leading-relaxed">
                <div>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-indigo-700 block mb-0.5">
                    Why Candidates Trip Up
                  </span>
                  <p>{analysis.whyMistakeHappens}</p>
                </div>
                <div>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-indigo-700 block mb-0.5">
                    How To Avoid In Interviews
                  </span>
                  <p>{analysis.howToAvoid}</p>
                </div>
                <div>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-indigo-700 block mb-0.5">
                    Mental Anchor
                  </span>
                  <p className="font-mono text-[12px] bg-white/80 p-2 rounded border border-indigo-100 text-indigo-950 font-medium">
                    {analysis.mentalAnchor}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        )}

        <div className="pt-2 flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => onRetest(item)}
            className="btn-tactile btn-tactile-secondary px-4 py-2 rounded-xl font-mono text-[11px] font-bold tracking-wider uppercase flex items-center gap-1.5 text-amber-800 border-amber-300 bg-amber-50/50 hover:bg-amber-100/50"
          >
            <span className="material-symbols-outlined text-[14px]">replay</span>
            <span>Retest Question</span>
          </button>

          {item.lessonSlug ? (
            <Link
              href={`/lesson/${item.lessonSlug}`}
              className="btn-tactile btn-tactile-secondary px-4 py-2 rounded-xl font-mono text-[11px] font-bold tracking-wider uppercase flex items-center gap-1.5"
            >
              <span>Practice in Lesson</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          ) : (
            <Link
              href="/skills"
              className="btn-tactile btn-tactile-secondary px-4 py-2 rounded-xl font-mono text-[11px] font-bold tracking-wider uppercase flex items-center gap-1.5"
            >
              <span>Explore Lessons</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          )}

          <button
            type="button"
            onClick={handleDiagnose}
            className="btn-tactile px-4 py-2 rounded-xl font-mono text-[11px] font-bold tracking-wider uppercase bg-indigo-600 hover:bg-indigo-500 border-b-[3.5px] border-indigo-800 text-white flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
            <span>{expanded && analysis ? 'Hide Diagnosis' : 'AI Mistake Diagnosis'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function WeakSpotTopicCard({ topic, onStartDrill }) {
  const [showQuestions, setShowQuestions] = useState(false);
  const theme = CAT_THEME[topic.category] || CAT_THEME.dsa;
  const isCritical = topic.accuracy < 50 || topic.unresolvedMistakes.length >= 2;

  return (
    <div className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-all ${
      isCritical ? 'border-red-200 hover:border-red-300' : 'border-amber-200 hover:border-amber-300'
    }`}>
      {/* Header */}
      <div className={`px-5 py-3.5 border-b flex flex-wrap items-center justify-between gap-3 ${
        isCritical ? 'bg-red-50/50 border-red-100' : 'bg-amber-50/40 border-amber-100'
      }`}>
        <div className="flex items-center gap-2.5">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: isCritical ? '#dc2626' : '#d97706' }}
          />
          <span className="font-sans font-bold text-[16px] text-slate-900">
            {topic.name}
          </span>
          <span
            className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full uppercase"
            style={{ backgroundColor: theme.color + '15', color: theme.color }}
          >
            {theme.label}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className={`font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
            isCritical
              ? 'bg-red-100/80 text-red-700 border-red-200'
              : 'bg-amber-100/80 text-amber-700 border-amber-200'
          }`}>
            {isCritical ? 'Critical Gap' : 'Needs Focus'}
          </span>
          <span className="font-mono text-[12px] font-bold text-slate-700">
            {topic.accuracy}% accuracy
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 space-y-4">
        {/* Progress & stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
          <div className="flex items-center gap-4">
            <div>
              <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Missed Questions
              </span>
              <span className="font-mono font-bold text-[15px] text-red-600">
                {topic.topicMistakes.length} missed
                {topic.unresolvedMistakes.length > 0 && ` (${topic.unresolvedMistakes.length} unresolved)`}
              </span>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Attempts
              </span>
              <span className="font-mono font-bold text-[15px] text-slate-700">
                {topic.totalAnswered} questions
              </span>
            </div>
          </div>

          <AccuracyGauge pct={topic.accuracy} />
        </div>

        {/* Missed questions toggle */}
        {topic.topicMistakes.length > 0 && (
          <div>
            <button
              type="button"
              onClick={() => setShowQuestions(prev => !prev)}
              className="text-left font-mono text-[11px] font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-[15px]">
                {showQuestions ? 'expand_less' : 'expand_more'}
              </span>
              <span>
                {showQuestions ? 'Hide questions you got wrong' : `See ${topic.topicMistakes.length} questions you got wrong in this topic`}
              </span>
            </button>

            {showQuestions && (
              <div className="mt-2.5 space-y-2 border-l-2 border-amber-200 pl-3">
                {topic.topicMistakes.map((m, idx) => (
                  <div key={m.exerciseId || idx} className="bg-slate-50/80 p-3 rounded-xl border border-slate-100 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-sans text-[13px] font-medium text-slate-800">
                        {m.question}
                      </p>
                      {m.isResolved ? (
                        <span className="font-mono text-[9px] font-bold uppercase text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded shrink-0">
                          Resolved
                        </span>
                      ) : (
                        <span className="font-mono text-[9px] font-bold uppercase text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded shrink-0">
                          Unresolved
                        </span>
                      )}
                    </div>
                    {m.correctAnswer && (
                      <p className="font-mono text-[11px] text-emerald-700">
                        ✓ Correct: {m.correctAnswer}
                      </p>
                    )}
                    {m.explanation && (
                      <p className="font-sans text-[11px] text-slate-500 leading-relaxed">
                        {m.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons: LEARN & PRACTICE */}
        <div className="pt-2 flex flex-wrap items-center gap-3 border-t border-slate-100">
          {topic.lessonSlug ? (
            <Link
              href={`/lesson/${topic.lessonSlug}`}
              className="btn-tactile btn-tactile-secondary flex-1 min-w-[160px] py-2.5 px-4 rounded-xl font-mono text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 text-slate-800 border-slate-300 hover:bg-slate-100"
            >
              <span className="material-symbols-outlined text-[16px] text-emerald-600">menu_book</span>
              <span>1-Click Learn ({topic.name})</span>
            </Link>
          ) : (
            <Link
              href="/skills"
              className="btn-tactile btn-tactile-secondary flex-1 min-w-[160px] py-2.5 px-4 rounded-xl font-mono text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 text-slate-800 border-slate-300 hover:bg-slate-100"
            >
              <span className="material-symbols-outlined text-[16px] text-emerald-600">menu_book</span>
              <span>Explore Lessons</span>
            </Link>
          )}

          {topic.topicMistakes.length > 0 && (
            <button
              type="button"
              onClick={() => onStartDrill(topic.topicMistakes)}
              className="btn-tactile btn-tactile-primary flex-1 min-w-[160px] py-2.5 px-4 rounded-xl font-mono text-[11px] font-bold uppercase tracking-wider text-white flex items-center justify-center gap-2 shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">bolt</span>
              <span>1-Click Practice Again ({topic.topicMistakes.length} Qs)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FocusPage() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('weak-spots');
  const [mistakeFilter, setMistakeFilter] = useState('all');
  const [drillQueue, setDrillQueue] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const perf = await getUserMistakesAndPerformance();
      setData(perf);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search);
      const qTab = sp.get('tab');
      if (qTab && ['weak-spots', 'mistakes', 'topics'].includes(qTab)) {
        setTab(qTab);
      }
    }
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.push('/login');
        return;
      }
      loadData();
    });
  }, [router, loadData]);

  const mistakes = data?.mistakes || [];
  const topicPerf = data?.topicPerformance || [];
  const unresolvedMistakes = mistakes.filter(m => !m.isResolved);
  const filteredMistakes = mistakeFilter === 'unresolved' ? unresolvedMistakes : mistakes;

  // Group mistakes into weak topics (topics with < 75% accuracy or having mistakes)
  const weakTopics = topicPerf
    .map((t) => {
      const topicMistakes = mistakes.filter(
        (m) => String(m.topicId) === String(t.topicId) || m.topicName === t.name
      );
      const unresolved = topicMistakes.filter((m) => !m.isResolved);
      const isWeak = t.accuracy < 75 || unresolved.length > 0;
      return {
        ...t,
        topicMistakes,
        unresolvedMistakes: unresolved,
        isWeak,
      };
    })
    .filter((t) => t.isWeak || t.topicMistakes.length > 0);

  // Fallback: If any mistakes exist whose topics weren't in topicPerf, add them as weak topics
  const coveredTopics = new Set(weakTopics.map(w => String(w.topicId || w.name)));
  for (const m of mistakes) {
    const key = String(m.topicId || m.topicName || 'DSA');
    if (!coveredTopics.has(key)) {
      coveredTopics.add(key);
      const tMistakes = mistakes.filter(item => String(item.topicId || item.topicName || 'DSA') === key);
      const unresolved = tMistakes.filter(item => !item.isResolved);
      weakTopics.push({
        topicId: m.topicId || key,
        name: m.topicName || 'DSA',
        category: m.category || 'dsa',
        accuracy: 0,
        totalAnswered: tMistakes.reduce((acc, curr) => acc + (curr.totalAttempts || 1), 0),
        lessonSlug: m.lessonSlug || '',
        status: 'struggling',
        topicMistakes: tMistakes,
        unresolvedMistakes: unresolved,
        isWeak: true,
      });
    }
  }

  weakTopics.sort((a, b) => {
    if (b.unresolvedMistakes.length !== a.unresolvedMistakes.length) {
      return b.unresolvedMistakes.length - a.unresolvedMistakes.length;
    }
    return a.accuracy - b.accuracy;
  });

  const startDrill = useCallback((items) => {
    if (!items || !items.length) return;
    setDrillQueue(items.slice(0, 5));
  }, []);

  useEffect(() => {
    if (!loading && data && typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search);
      const retestTopic = sp.get('retestTopic');
      if (retestTopic) {
        const matches = (data?.mistakes || []).filter(
          m => String(m.topicId) === String(retestTopic) || m.topicName === retestTopic || m.lessonSlug === retestTopic
        );
        if (matches.length > 0) {
          startDrill(matches);
        }
      }
    }
  }, [loading, data, startDrill]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <span className="material-symbols-outlined text-[32px] text-slate-400 animate-spin">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-16 px-4 space-y-8">
      {drillQueue && (
        <MistakeDrillModal
          items={drillQueue}
          onClose={() => setDrillQueue(null)}
          onRefresh={loadData}
        />
      )}

      <div className="pt-4 pb-2 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="material-symbols-outlined text-[20px] text-emerald-600">my_location</span>
            <span className="font-mono text-[11px] font-bold tracking-widest uppercase text-emerald-700">
              SkillFlow Diagnostics
            </span>
          </div>
          <h1 className="font-sans font-bold text-[28px] text-slate-900 tracking-tight">
            Performance & Focus Hub
          </h1>
          <p className="font-sans text-[14px] text-slate-500 mt-1">
            Instantly see where you lack, review topics you got wrong, and learn or practice again in 1 click.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          {unresolvedMistakes.length > 0 && (
            <button
              type="button"
              onClick={() => startDrill(unresolvedMistakes)}
              className="btn-tactile btn-tactile-primary px-4 py-2 rounded-xl font-mono text-[11px] font-bold uppercase tracking-wider text-white flex items-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">bolt</span>
              <span>Retest Drill ({unresolvedMistakes.length})</span>
            </button>
          )}

          <Link
            href="/dashboard"
            className="btn-tactile btn-tactile-secondary px-3.5 py-2 rounded-xl font-mono text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Dashboard</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Overall Accuracy
          </span>
          <p className="font-mono font-bold text-[24px] text-slate-900">
            {data?.overallAccuracy ?? 0}%
          </p>
          <span className="font-sans text-[11px] text-slate-500">Across all exercises</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Weak Spots
          </span>
          <p className={`font-mono font-bold text-[24px] ${weakTopics.length > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
            {weakTopics.length}
          </p>
          <span className="font-sans text-[11px] text-slate-500">Topics needing focus</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Unresolved Misses
          </span>
          <p className={`font-mono font-bold text-[24px] ${unresolvedMistakes.length > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
            {unresolvedMistakes.length}
          </p>
          <span className="font-sans text-[11px] text-slate-500">Questions to retest</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Recent Momentum
          </span>
          <p className="font-mono font-bold text-[24px] text-emerald-600">
            {data?.recentAccuracy ?? 0}%
          </p>
          <span className="font-sans text-[11px] text-slate-500">Last 10 attempts</span>
        </div>
      </div>

      <div className="flex border-b border-slate-200 gap-2 sm:gap-4 overflow-x-auto">
        <button
          type="button"
          onClick={() => setTab('weak-spots')}
          className={`pb-3 font-mono text-[12px] font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 shrink-0 ${
            tab === 'weak-spots'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <span className="material-symbols-outlined text-[16px] text-red-600 filled">my_location</span>
          <span>Where I Lack ({weakTopics.length})</span>
          {weakTopics.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-red-100 text-red-700 text-[10px] font-mono font-bold">
              Action
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setTab('mistakes')}
          className={`pb-3 font-mono text-[12px] font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 shrink-0 ${
            tab === 'mistakes'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">troubleshoot</span>
          <span>Mistakes Review ({mistakes.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setTab('topics')}
          className={`pb-3 font-mono text-[12px] font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 shrink-0 ${
            tab === 'topics'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">analytics</span>
          <span>Topic Mastery ({topicPerf.length})</span>
        </button>
      </div>

      {tab === 'weak-spots' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-amber-50/60 border border-amber-200/80 p-4 rounded-2xl">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[24px] text-amber-600 shrink-0 filled">flag_circle</span>
              <div>
                <h2 className="font-sans font-bold text-[15px] text-slate-900">
                  Priority Weak Spots & Knowledge Gaps
                </h2>
                <p className="font-sans text-[12.5px] text-slate-600">
                  Topics where accuracy is below 75% or mistakes exist. Click <span className="font-semibold text-slate-900">Learn</span> to study the theory or <span className="font-semibold text-slate-900">Practice</span> to retest.
                </p>
              </div>
            </div>

            {unresolvedMistakes.length > 0 && (
              <button
                type="button"
                onClick={() => startDrill(unresolvedMistakes)}
                className="btn-tactile btn-tactile-primary px-3.5 py-2 rounded-xl font-mono text-[11px] font-bold uppercase tracking-wider text-white shrink-0 flex items-center gap-1.5 shadow-sm"
              >
                <span className="material-symbols-outlined text-[15px]">bolt</span>
                <span>Drill All Misses</span>
              </button>
            )}
          </div>

          {weakTopics.length === 0 ? (
            <div className="p-10 bg-white border border-slate-200 rounded-3xl text-center space-y-3 shadow-xs">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-[32px] filled">verified</span>
              </div>
              <h3 className="font-sans font-bold text-[19px] text-slate-900">
                No Weak Spots Detected!
              </h3>
              <p className="font-sans text-[14px] text-slate-500 max-w-md mx-auto leading-relaxed">
                Great job! You don&apos;t have any topics with low accuracy or unresolved mistakes. Keep solving new lessons to maintain your streak.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <Link
                  href="/skills"
                  className="btn-tactile btn-tactile-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-[11px] font-bold tracking-wider uppercase text-white shadow-sm"
                >
                  <span>Explore New Topics</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
                <Link
                  href="/practice/speed"
                  className="btn-tactile btn-tactile-secondary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-[11px] font-bold tracking-wider uppercase text-slate-800"
                >
                  <span>Speed Drill</span>
                  <span className="material-symbols-outlined text-[16px]">timer</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {weakTopics.map((topic) => (
                <WeakSpotTopicCard
                  key={topic.topicId || topic.name}
                  topic={topic}
                  onStartDrill={(items) => startDrill(items)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'mistakes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Showing {filteredMistakes.length} {filteredMistakes.length === 1 ? 'question' : 'questions'}
            </span>
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setMistakeFilter('all')}
                className={`px-3 py-1 rounded-lg font-mono text-[10px] font-bold uppercase transition-all ${
                  mistakeFilter === 'all'
                    ? 'bg-white shadow-sm text-slate-900'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                All Missed ({mistakes.length})
              </button>
              <button
                type="button"
                onClick={() => setMistakeFilter('unresolved')}
                className={`px-3 py-1 rounded-lg font-mono text-[10px] font-bold uppercase transition-all ${
                  mistakeFilter === 'unresolved'
                    ? 'bg-white shadow-sm text-amber-700'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Unresolved ({unresolvedMistakes.length})
              </button>
            </div>
          </div>

          {filteredMistakes.length === 0 ? (
            <div className="p-8 bg-white border border-slate-200 rounded-2xl text-center space-y-3">
              <span className="material-symbols-outlined text-[36px] text-emerald-600 filled">task_alt</span>
              <h3 className="font-sans font-bold text-[18px] text-slate-900">
                {mistakeFilter === 'unresolved' ? 'All mistakes resolved!' : 'No missed questions recorded yet!'}
              </h3>
              <p className="font-sans text-[14px] text-slate-500 max-w-md mx-auto">
                {mistakeFilter === 'unresolved'
                  ? 'You have successfully corrected all previous errors on recent lessons.'
                  : 'Start solving lessons and exercises. Any mistakes will be cataloged here with one-click AI explanations and retry buttons.'}
              </p>
              <Link
                href="/skills"
                className="btn-tactile btn-tactile-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-[11px] font-bold tracking-wider uppercase text-white"
              >
                <span>Explore Lessons</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMistakes.map((item) => (
                <MistakeCard key={item.exerciseId} item={item} onRetest={(it) => startDrill([it])} />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'topics' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {topicPerf.length === 0 ? (
              <div className="col-span-2 p-8 bg-white border border-slate-200 rounded-2xl text-center">
                <p className="font-sans text-[14px] text-slate-500">
                  Complete exercises to see topic-level mastery rates and weak spots.
                </p>
              </div>
            ) : (
              topicPerf.map((t) => {
                const statusColor = t.status === 'struggling' ? '#dc2626' : t.status === 'strong' ? '#059669' : '#d97706';
                const statusLabel = t.status === 'struggling' ? 'Needs Focus' : t.status === 'strong' ? 'Mastered' : 'Progressing';
                return (
                  <div key={t.topicId} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-sans font-bold text-[15px] text-slate-900">{t.name}</span>
                      <span
                        className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border"
                        style={{ color: statusColor, borderColor: statusColor + '40', backgroundColor: statusColor + '10' }}
                      >
                        {statusLabel}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] text-slate-500">
                        {t.totalAnswered} questions attempted
                      </span>
                      <AccuracyGauge pct={t.accuracy} />
                    </div>

                    {t.lessonSlug && (
                      <div className="pt-1">
                        <Link
                          href={`/lesson/${t.lessonSlug}`}
                          className="font-mono text-[11px] font-bold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1"
                        >
                          <span>Review topic lessons</span>
                          <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
