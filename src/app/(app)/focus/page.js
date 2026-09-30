'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { getUserMistakesAndPerformance, getTopics, getAllLessons, getUserLessonProgress } from '@/lib/db';

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

function MistakeCard({ item }) {
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
          <Link
            href={`/lesson/${item.lessonSlug}`}
            className="btn-tactile btn-tactile-secondary px-4 py-2 rounded-xl font-mono text-[11px] font-bold tracking-wider uppercase flex items-center gap-1.5"
          >
            <span>Practice in Lesson</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </Link>

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

export default function FocusPage() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('mistakes');
  const [mistakeFilter, setMistakeFilter] = useState('all');

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.push('/login');
        return;
      }
      try {
        const perf = await getUserMistakesAndPerformance();
        setData(perf);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    });
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <span className="material-symbols-outlined text-[32px] text-slate-400 animate-spin">progress_activity</span>
      </div>
    );
  }

  const mistakes = data?.mistakes || [];
  const topicPerf = data?.topicPerformance || [];
  const unresolvedMistakes = mistakes.filter(m => !m.isResolved);
  const filteredMistakes = mistakeFilter === 'unresolved' ? unresolvedMistakes : mistakes;

  return (
    <div className="max-w-4xl mx-auto pb-16 px-4 space-y-8">
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
            Review every question you missed, spot conceptual blindspots, and diagnose traps with AI.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="btn-tactile btn-tactile-secondary self-start md:self-auto px-3.5 py-2 rounded-xl font-mono text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Dashboard</span>
        </Link>
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
            Questions Tackled
          </span>
          <p className="font-mono font-bold text-[24px] text-slate-900">
            {data?.totalQuestionsTackled ?? 0}
          </p>
          <span className="font-sans text-[11px] text-slate-500">Total logged attempts</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Needs Review
          </span>
          <p className="font-mono font-bold text-[24px] text-amber-600">
            {unresolvedMistakes.length}
          </p>
          <span className="font-sans text-[11px] text-slate-500">Unresolved questions</span>
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

      <div className="flex border-b border-slate-200 gap-4">
        <button
          type="button"
          onClick={() => setTab('mistakes')}
          className={`pb-3 font-mono text-[12px] font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 ${
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
          className={`pb-3 font-mono text-[12px] font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 ${
            tab === 'topics'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">analytics</span>
          <span>Topic Mastery ({topicPerf.length})</span>
        </button>
      </div>

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
                <MistakeCard key={item.exerciseId} item={item} />
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
