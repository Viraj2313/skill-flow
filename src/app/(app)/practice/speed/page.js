'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { getTopics, getExercisesByTopic, saveSpeedScore, getSpeedLeaderboard } from '@/lib/db';

const TIME_PER_Q = 30;
const QUESTIONS_PER_ROUND = 10;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function fmt(ms) {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export default function SpeedRoundPage() {
  const [phase, setPhase]           = useState('pick');
  const [topics, setTopics]         = useState([]);
  const [topic, setTopic]           = useState(null);
  const [questions, setQuestions]   = useState([]);
  const [qIdx, setQIdx]             = useState(0);
  const [selected, setSelected]     = useState(null);
  const [confirmed, setConfirmed]   = useState(false);
  const [timeLeft, setTimeLeft]     = useState(TIME_PER_Q);
  const [results, setResults]       = useState([]);
  const [startMs, setStartMs]       = useState(null);
  const [totalMs, setTotalMs]       = useState(0);
  const [leaderboard, setLB]        = useState([]);
  const [userId, setUserId]         = useState(null);
  const [loadingQ, setLoadingQ]     = useState(false);
  const [noQ, setNoQ]               = useState(false);
  const roundStartTime              = useRef(null);

  useEffect(() => {
    getTopics().then(setTopics);
    supabase.auth.getUser().then(({ data: { user } }) => setUserId(user?.id));
  }, []);

  const advanceQuestion = useCallback((sel, wasTimeout) => {
    const q         = questions[qIdx];
    const isCorrect = sel === q.correct && !wasTimeout;

    setResults(prev => {
      const updated = [...prev, { question: q.question, options: q.options, correct: q.correct, selected: sel, isCorrect }];
      if (qIdx + 1 >= questions.length) {
        const newCorrect = updated.filter(r => r.isCorrect).length;
        const elapsed    = roundStartTime.current ? Date.now() - roundStartTime.current : 0;
        setTotalMs(elapsed);
        setPhase('results');
        saveSpeedScore(topic.id, newCorrect, questions.length, elapsed).catch(() => {});
        getSpeedLeaderboard(topic.id).then(setLB);
      }
      return updated;
    });

    if (qIdx + 1 < questions.length) {
      setQIdx(i => i + 1);
      setSelected(null);
      setConfirmed(false);
      setTimeLeft(TIME_PER_Q);
      setStartMs(Date.now());
    }
  }, [questions, qIdx, topic]);

  useEffect(() => {
    if (phase !== 'playing' || confirmed) return;
    if (timeLeft <= 0) {
      advanceQuestion(null, true);
      return;
    }
    const id = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [phase, timeLeft, confirmed, advanceQuestion]);

  async function handleTopicSelect(t) {
    setLoadingQ(true);
    setTopic(t);
    const exs = await getExercisesByTopic(t.id, 30);
    const mcqs = exs.filter(e => e.options?.length >= 2 && e.correct !== null && e.correct !== undefined);
    if (mcqs.length < 4) {
      setNoQ(true);
      setLoadingQ(false);
      return;
    }
    const picked = shuffle(mcqs).slice(0, Math.min(QUESTIONS_PER_ROUND, mcqs.length));
    setQuestions(picked);
    setQIdx(0);
    setSelected(null);
    setConfirmed(false);
    setResults([]);
    setTimeLeft(TIME_PER_Q);
    setStartMs(Date.now());
    roundStartTime.current = Date.now();
    setPhase('playing');
    setLoadingQ(false);
  }

  function handleConfirm() {
    if (selected === null || confirmed) return;
    setConfirmed(true);
    setTimeout(() => advanceQuestion(selected, false), 800);
  }

  const correctCount = results.filter(r => r.isCorrect).length;
  const q            = questions[qIdx];
  const timePct      = (timeLeft / TIME_PER_Q) * 100;
  const timerColor   = timeLeft > 15 ? '#059669' : timeLeft > 7 ? '#d97706' : '#dc2626';

  if (phase === 'pick') {
    return (
      <div className="max-w-2xl mx-auto pb-12 px-4">
        <div className="flex items-center gap-3 py-6">
          <Link href="/practice" className="text-slate-400 hover:text-slate-600 transition-colors">
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </Link>
          <div>
            <h1 className="font-sans font-bold text-[20px] text-slate-900">Speed Round</h1>
            <p className="font-sans text-[13px] text-slate-500 mt-0.5">10 questions · 30 seconds each · no hints</p>
          </div>
        </div>

        {noQ && (
          <div className="mb-4 p-4 rounded-xl bg-amber-50 border border-amber-200 font-sans text-[13px] text-amber-800">
            Not enough MCQ exercises in that topic yet. Pick another or complete more lessons first.
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {topics.map(t => (
            <button
              key={t.id}
              onClick={() => handleTopicSelect(t)}
              disabled={loadingQ}
              className="px-4 py-4 rounded-xl border-2 border-slate-200 bg-white text-left hover:border-amber-400 hover:bg-amber-50 transition-all group disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[22px] text-slate-400 group-hover:text-amber-600 mb-2 block">{t.icon || 'code'}</span>
              <p className="font-sans font-semibold text-[14px] text-slate-800 group-hover:text-amber-800">{t.name}</p>
              <p className="font-mono text-[10px] text-slate-400 mt-0.5 uppercase tracking-wide">{t.category_id}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (phase === 'playing' && q) {
    return (
      <div className="max-w-lg mx-auto px-4 flex flex-col" style={{ minHeight: '100vh' }}>
        <div className="py-5 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-[12px] font-bold text-slate-500">{qIdx + 1} / {questions.length}</span>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]" style={{ color: timerColor }}>timer</span>
              <span className="font-mono text-[20px] font-bold tabular-nums" style={{ color: timerColor }}>{timeLeft}s</span>
            </div>
            <span className="font-mono text-[12px] font-bold text-emerald-700">{correctCount} correct</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${timePct}%`, backgroundColor: timerColor }}
            />
          </div>
        </div>

        <div className="flex-1 space-y-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <p className="font-sans font-semibold text-[17px] text-slate-900 leading-snug">{q.question}</p>
          </div>

          <div className="flex flex-col gap-3">
            {q.options.map((opt, i) => {
              let cls = 'border-slate-200 bg-white text-slate-700 hover:border-amber-400 hover:bg-amber-50';
              if (confirmed) {
                if (i === q.correct)        cls = 'border-emerald-400 bg-emerald-50 text-emerald-800';
                else if (i === selected)    cls = 'border-red-400 bg-red-50 text-red-700';
                else                        cls = 'border-slate-100 bg-slate-50 text-slate-400';
              } else if (i === selected) {
                cls = 'border-amber-400 bg-amber-50 text-amber-800';
              }
              return (
                <button
                  key={i}
                  onClick={() => !confirmed && setSelected(i)}
                  disabled={confirmed}
                  className={`w-full px-5 py-4 rounded-xl border-2 text-left font-sans text-[15px] font-medium transition-all ${cls}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        <div className="py-5 shrink-0">
          <button
            onClick={handleConfirm}
            disabled={selected === null || confirmed}
            className="w-full py-4 rounded-xl font-mono text-[13px] font-bold tracking-widest uppercase text-white bg-amber-600 hover:bg-amber-700 transition-colors disabled:opacity-30"
          >
            Lock In
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'results') {
    const pct = Math.round((correctCount / questions.length) * 100);
    const userRank = leaderboard.findIndex(r => r.user_id === userId) + 1;

    return (
      <div className="max-w-2xl mx-auto pb-12 px-4">
        <div className="py-8 text-center space-y-3">
          <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-[40px] text-amber-700 filled">
              {pct === 100 ? 'military_tech' : pct >= 70 ? 'emoji_events' : 'timer'}
            </span>
          </div>
          <h1 className="font-sans font-bold text-[28px] text-slate-900">{correctCount}/{questions.length}</h1>
          <p className="font-sans text-[14px] text-slate-500">{fmt(totalMs)} total · {topic.name}</p>
          {userRank > 0 && (
            <p className="font-mono text-[12px] font-bold text-amber-700">#{userRank} on this topic's leaderboard</p>
          )}
        </div>

        <div className="space-y-3 mb-8">
          {results.map((r, i) => (
            <div key={i} className={`p-4 rounded-xl border ${r.isCorrect ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-start gap-2 mb-2">
                <span className={`material-symbols-outlined text-[16px] filled shrink-0 mt-0.5 ${r.isCorrect ? 'text-emerald-600' : 'text-red-500'}`}>
                  {r.isCorrect ? 'check_circle' : 'cancel'}
                </span>
                <p className="font-sans text-[13px] font-semibold text-slate-800">{r.question}</p>
              </div>
              {!r.isCorrect && (
                <p className="font-sans text-[12px] text-slate-600 ml-6">
                  Correct: <strong>{r.options?.[r.correct]}</strong>
                  {r.selected !== null ? ` · You said: ${r.options?.[r.selected]}` : ' · Time ran out'}
                </p>
              )}
            </div>
          ))}
        </div>

        {leaderboard.length > 0 && (
          <div className="mb-6 border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-5 py-3 bg-slate-50 border-b border-slate-200">
              <span className="font-mono text-[10px] font-bold tracking-widest uppercase text-slate-400">{topic.name} Leaderboard</span>
            </div>
            {leaderboard.slice(0, 5).map((row, i) => (
              <div key={i} className={`flex items-center gap-4 px-5 py-3 border-b border-slate-100 last:border-0 ${row.user_id === userId ? 'bg-amber-50' : ''}`}>
                <span className="font-mono text-[13px] font-bold text-slate-400 w-5">{i + 1}</span>
                <span className="font-sans text-[14px] font-semibold text-slate-800 flex-1 truncate">
                  {row.user_profiles?.display_name || 'Anonymous'}
                </span>
                <span className="font-mono text-[13px] font-bold text-emerald-700">{row.correct}/{row.total}</span>
                <span className="font-mono text-[11px] text-slate-400">{fmt(row.time_ms)}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => { setPhase('pick'); setNoQ(false); }}
            className="flex-1 py-3.5 rounded-xl font-mono text-[12px] font-bold tracking-widest uppercase border-2 border-amber-400 text-amber-700 hover:bg-amber-50 transition-colors"
          >
            New Topic
          </button>
          <button
            onClick={() => handleTopicSelect(topic)}
            className="flex-1 py-3.5 rounded-xl font-mono text-[12px] font-bold tracking-widest uppercase bg-amber-600 text-white hover:bg-amber-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <span className="material-symbols-outlined text-[32px] text-slate-400 animate-spin">progress_activity</span>
    </div>
  );
}
