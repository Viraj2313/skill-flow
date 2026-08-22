'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getAllLessons } from '@/lib/db';

const INTERVIEW_DURATION = 45 * 60;

const TOPIC_OPTIONS = [
  { id: 'dsa',             label: 'Data Structures & Algorithms', icon: 'schema',   color: '#059669' },
  { id: 'python',          label: 'Python',                       icon: 'code',     color: '#2563eb' },
  { id: 'cs-fundamentals', label: 'CS Fundamentals',              icon: 'memory',   color: '#d97706' },
  { id: 'mixed',           label: 'Mixed (Surprise me)',          icon: 'shuffle',  color: '#7c3aed' },
];

function Timer({ seconds, total }) {
  const pct = (seconds / total) * 100;
  const mins = Math.floor(seconds / 60);
  const secs = String(seconds % 60).padStart(2, '0');
  const isLow = seconds < 300;

  return (
    <div className="flex items-center gap-3">
      <div className="relative w-10 h-10 flex-shrink-0">
        <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3" />
          <circle
            cx="18" cy="18" r="15.9" fill="none"
            stroke={isLow ? '#ef4444' : '#059669'}
            strokeWidth="3"
            strokeDasharray={`${pct} 100`}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <span className={`absolute inset-0 flex items-center justify-center font-mono text-[9px] font-bold ${isLow ? 'text-red-600' : 'text-slate-700'}`}>
          {mins}:{secs}
        </span>
      </div>
      <div>
        <p className="font-mono text-[10px] tracking-widest uppercase text-slate-400">Time left</p>
        <p className={`font-mono text-[14px] font-bold ${isLow ? 'text-red-600' : 'text-slate-700'}`}>{mins}:{secs}</p>
      </div>
    </div>
  );
}

function VerdictBadge({ verdict }) {
  const config = {
    strong_yes: { label: 'Strong Hire',  bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300' },
    yes:        { label: 'Hire',         bg: 'bg-green-100',   text: 'text-green-800',   border: 'border-green-300' },
    lean_yes:   { label: 'Lean Hire',    bg: 'bg-teal-100',    text: 'text-teal-800',    border: 'border-teal-300' },
    lean_no:    { label: 'Lean No Hire', bg: 'bg-amber-100',   text: 'text-amber-800',   border: 'border-amber-300' },
    no:         { label: 'No Hire',      bg: 'bg-red-100',     text: 'text-red-800',     border: 'border-red-300' },
  };
  const c = config[verdict] || config.lean_no;
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[12px] font-mono font-bold border ${c.bg} ${c.text} ${c.border}`}>
      {c.label}
    </span>
  );
}

export default function InterviewPage() {
  const router = useRouter();

  const [phase, setPhase] = useState('setup');
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [questionCount, setQuestionCount] = useState(8);

  const [questions, setQuestions] = useState([]);
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const [timeLeft, setTimeLeft] = useState(INTERVIEW_DURATION);
  const [startTime, setStartTime] = useState(null);
  const [totalTimeTaken, setTotalTimeTaken] = useState(0);

  const [debrief, setDebrief] = useState(null);
  const [debriefLoading, setDebriefLoading] = useState(false);
  const [debriefErr, setDebriefErr] = useState(null);

  const [sessionToken, setSessionToken] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSessionToken(data?.session?.access_token || null);
    });
  }, []);

  const finishInterview = useCallback(async (finalAnswers, timeTaken, token) => {
    setPhase('debrief-loading');
    setDebriefLoading(true);
    const topic = TOPIC_OPTIONS.find(t => t.id === selectedTopic)?.label || selectedTopic;
    try {
      const res = await fetch('/api/ai/debrief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ answers: finalAnswers, topic, totalTime: timeTaken }),
      });
      const data = await res.json();
      if (data.error) setDebriefErr(data.error);
      else setDebrief(data.debrief);
    } catch {
      setDebriefErr('Could not generate debrief. Please try again.');
    } finally {
      setDebriefLoading(false);
      setPhase('debrief');
    }
  }, [selectedTopic]);

  useEffect(() => {
    if (phase !== 'interview') return;
    if (timeLeft <= 0) {
      const timeTaken = INTERVIEW_DURATION - timeLeft;
      finishInterview(answers, timeTaken, sessionToken);
      return;
    }
    const id = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [phase, timeLeft, answers, sessionToken, finishInterview]);

  async function startInterview() {
    if (!selectedTopic) return;
    const allLessons = await getAllLessons();
    const { supabase: sb } = await import('@/lib/supabase');

    const topicFilter = selectedTopic === 'mixed' ? null : selectedTopic;
    const filtered = topicFilter
      ? allLessons.filter(l => l.category === topicFilter)
      : allLessons;

    const lessonIds = filtered.map(l => l.id);
    if (!lessonIds.length) return;

    const { data: exData } = await sb
      .from('exercises')
      .select('*')
      .in('lesson_id', lessonIds)
      .eq('type', 'mcq')
      .limit(100);

    const shuffled = (exData || []).sort(() => Math.random() - 0.5).slice(0, questionCount);
    if (!shuffled.length) return;

    setQuestions(shuffled);
    setQIndex(0);
    setAnswers([]);
    setSelectedOption(null);
    setSubmitted(false);
    setTimeLeft(INTERVIEW_DURATION);
    setStartTime(Date.now());
    setPhase('interview');
  }

  function handleSubmit() {
    if (selectedOption === null || submitted) return;
    setSubmitted(true);
  }

  async function handleNext() {
    const q = questions[qIndex];
    const normalised = {
      question: q.question,
      selectedAnswer: q.options[selectedOption],
      correctAnswer: q.options[q.correct_option ?? q.correct],
      isCorrect: selectedOption === (q.correct_option ?? q.correct),
    };
    const newAnswers = [...answers, normalised];

    if (qIndex + 1 >= questions.length) {
      const timeTaken = Math.round((Date.now() - startTime) / 1000);
      setTotalTimeTaken(timeTaken);
      await finishInterview(newAnswers, timeTaken, sessionToken);
    } else {
      setAnswers(newAnswers);
      setQIndex(i => i + 1);
      setSelectedOption(null);
      setSubmitted(false);
    }
  }

  if (phase === 'setup') {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8 flex flex-col items-center">
        <div className="w-full max-w-lg">
          <button onClick={() => router.back()} className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 mb-8">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span className="font-mono text-[12px] tracking-wide">Back</span>
          </button>

          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-100 border border-violet-200 rounded-full mb-4">
              <span className="material-symbols-outlined text-[14px] text-violet-700">psychology</span>
              <span className="font-mono text-[10px] font-bold tracking-widest text-violet-700 uppercase">Interview Mode</span>
            </div>
            <h1 className="font-sans font-bold text-[28px] text-slate-900 leading-tight mb-2">Mock Technical Interview</h1>
            <p className="font-sans text-[15px] text-slate-500 leading-relaxed">
              A timed session that works like a real phone screen. At the end you get a structured debrief — verdict, strengths, weaknesses, and what to study next.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 shadow-sm">
            <h2 className="font-mono text-[11px] font-bold tracking-widest uppercase text-slate-400 mb-4">Choose topic</h2>
            <div className="grid grid-cols-2 gap-3">
              {TOPIC_OPTIONS.map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTopic(t.id)}
                  className={`flex flex-col items-start p-4 rounded-xl border-2 text-left transition-all ${
                    selectedTopic === t.id
                      ? 'border-violet-500 bg-violet-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <span className="material-symbols-outlined text-[22px] mb-2" style={{ color: t.color }}>{t.icon}</span>
                  <span className={`font-sans text-[13px] font-semibold leading-snug ${selectedTopic === t.id ? 'text-violet-800' : 'text-slate-700'}`}>
                    {t.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-8 shadow-sm">
            <h2 className="font-mono text-[11px] font-bold tracking-widest uppercase text-slate-400 mb-4">
              Questions — <span className="text-slate-700">{questionCount}</span>
            </h2>
            <div className="flex gap-2">
              {[5, 8, 12].map(n => (
                <button
                  key={n}
                  onClick={() => setQuestionCount(n)}
                  className={`flex-1 py-2.5 rounded-lg font-mono text-[13px] font-bold border transition-all ${
                    questionCount === n
                      ? 'bg-violet-600 text-white border-violet-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <p className="mt-3 font-sans text-[12px] text-slate-400">
              45 min total · Unused time doesn't count against you
            </p>
          </div>

          <button
            onClick={startInterview}
            disabled={!selectedTopic}
            className="w-full py-4 rounded-xl font-mono text-[13px] font-bold tracking-widest uppercase bg-violet-600 hover:bg-violet-700 text-white transition-colors disabled:opacity-40 disabled:cursor-default flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">play_arrow</span>
            Begin Interview
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'interview') {
    const q = questions[qIndex];
    const correctIdx = q.correct_option ?? q.correct;
    const progress = ((qIndex) / questions.length) * 100;

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col" style={{ maxHeight: '100dvh', overflow: 'hidden' }}>
        <div className="flex-shrink-0 bg-white border-b border-slate-200 px-4 py-3">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-3">
              <Timer seconds={timeLeft} total={INTERVIEW_DURATION} />
              <div className="text-right">
                <p className="font-mono text-[10px] tracking-widest uppercase text-slate-400">Question</p>
                <p className="font-mono text-[16px] font-bold text-slate-700">{qIndex + 1} / {questions.length}</p>
              </div>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-violet-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-[14px] text-violet-500">psychology</span>
                <span className="font-mono text-[10px] font-bold tracking-widest uppercase text-violet-500">Interviewer</span>
              </div>
              <h2 className="font-sans font-semibold text-[18px] text-slate-900 leading-snug">{q.question}</h2>
            </div>

            <div className="flex flex-col gap-3">
              {q.options.map((opt, i) => {
                let cls = 'border-slate-200 bg-white text-slate-800 hover:border-slate-300';
                if (submitted) {
                  if (i === correctIdx) cls = 'border-emerald-400 bg-emerald-50 text-emerald-800';
                  else if (i === selectedOption) cls = 'border-red-400 bg-red-50 text-red-800';
                  else cls = 'border-slate-200 bg-white text-slate-400';
                } else if (selectedOption === i) {
                  cls = 'border-violet-500 bg-violet-50 text-violet-800';
                }

                return (
                  <button
                    key={i}
                    onClick={() => !submitted && setSelectedOption(i)}
                    className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all font-sans text-[15px] font-medium ${cls}`}
                  >
                    <span className="font-mono text-[11px] font-bold text-slate-400 mr-3">{String.fromCharCode(65 + i)}.</span>
                    {opt}
                  </button>
                );
              })}
            </div>

            {submitted && (
              <div className="mt-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`material-symbols-outlined filled text-[18px] ${selectedOption === correctIdx ? 'text-emerald-600' : 'text-red-500'}`}>
                    {selectedOption === correctIdx ? 'check_circle' : 'cancel'}
                  </span>
                  <span className={`font-mono text-[11px] font-bold tracking-widest uppercase ${selectedOption === correctIdx ? 'text-emerald-600' : 'text-red-500'}`}>
                    {selectedOption === correctIdx ? 'Correct' : 'Not quite'}
                  </span>
                </div>
                <p className="font-sans text-[14px] text-slate-600 leading-relaxed">{q.explanation}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex-shrink-0 bg-white border-t border-slate-200 px-4 py-4">
          <div className="max-w-2xl mx-auto">
            {!submitted ? (
              <button
                onClick={handleSubmit}
                disabled={selectedOption === null}
                className="w-full py-4 rounded-xl font-mono text-[13px] font-bold tracking-widest uppercase bg-slate-900 text-white transition-colors disabled:opacity-30 disabled:cursor-default"
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="w-full py-4 rounded-xl font-mono text-[13px] font-bold tracking-widest uppercase bg-violet-600 hover:bg-violet-700 text-white transition-colors"
              >
                {qIndex + 1 >= questions.length ? 'Finish & Get Debrief →' : 'Next Question →'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'debrief-loading') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-6 px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center">
          <span className="material-symbols-outlined text-[30px] text-violet-600 animate-pulse">psychology</span>
        </div>
        <div>
          <h2 className="font-sans font-bold text-[22px] text-slate-900 mb-2">Interviewer is writing your debrief...</h2>
          <p className="font-sans text-[14px] text-slate-400">Analysing your answers. This takes about 10 seconds.</p>
        </div>
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
          ))}
        </div>
      </div>
    );
  }

  if (phase === 'debrief') {
    const score = debrief?.score ?? 0;
    const scoreColor = score >= 8 ? '#059669' : score >= 6 ? '#d97706' : '#dc2626';
    const correctAnswers = answers.filter(a => a.isCorrect).length;

    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-violet-100 border border-violet-200 rounded-full mb-2">
                <span className="material-symbols-outlined text-[13px] text-violet-700">psychology</span>
                <span className="font-mono text-[10px] font-bold tracking-widest text-violet-700 uppercase">Interview Debrief</span>
              </div>
              <h1 className="font-sans font-bold text-[26px] text-slate-900">Interview Complete</h1>
            </div>
            <div className="text-right">
              <div className="font-mono font-bold text-[36px]" style={{ color: scoreColor }}>{score}<span className="text-[18px] text-slate-400">/10</span></div>
              <p className="font-mono text-[10px] tracking-widest uppercase text-slate-400">Score</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-white rounded-xl border border-slate-200 p-4 text-center shadow-sm">
              <div className="font-mono font-bold text-[22px] text-slate-800">{correctAnswers}/{answers.length}</div>
              <div className="font-mono text-[9px] tracking-widest uppercase text-slate-400 mt-0.5">Correct</div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 text-center shadow-sm">
              <div className="font-mono font-bold text-[22px] text-slate-800">
                {Math.floor(totalTimeTaken / 60)}:{String(totalTimeTaken % 60).padStart(2, '0')}
              </div>
              <div className="font-mono text-[9px] tracking-widest uppercase text-slate-400 mt-0.5">Time taken</div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col items-center justify-center shadow-sm">
              {debrief?.verdict && <VerdictBadge verdict={debrief.verdict} />}
            </div>
          </div>

          {debriefErr && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <p className="font-sans text-[14px] text-red-700">{debriefErr}</p>
            </div>
          )}

          {debrief && (
            <>
              <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-4 shadow-sm">
                <h2 className="font-mono text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-3">Overall Feedback</h2>
                <p className="font-sans text-[15px] text-slate-800 leading-relaxed">{debrief.overall_feedback}</p>
              </div>

              <div className="grid grid-cols-1 gap-4 mb-4">
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 shadow-sm">
                  <h2 className="font-mono text-[10px] font-bold tracking-widest uppercase text-emerald-600 mb-3">Strengths</h2>
                  <ul className="space-y-2">
                    {(debrief.strengths || []).map((s, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-[16px] text-emerald-500 filled mt-0.5 flex-shrink-0">check_circle</span>
                        <span className="font-sans text-[14px] text-emerald-900 leading-snug">{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-2xl p-5 shadow-sm">
                  <h2 className="font-mono text-[10px] font-bold tracking-widest uppercase text-red-600 mb-3">Areas to Improve</h2>
                  <ul className="space-y-2">
                    {(debrief.weaknesses || []).map((w, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-[16px] text-red-400 filled mt-0.5 flex-shrink-0">cancel</span>
                        <span className="font-sans text-[14px] text-red-900 leading-snug">{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {debrief.study_focus && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-[16px] text-amber-600">school</span>
                    <h2 className="font-mono text-[10px] font-bold tracking-widest uppercase text-amber-600">Study Next</h2>
                  </div>
                  <p className="font-sans text-[14px] text-amber-900 font-medium">{debrief.study_focus}</p>
                </div>
              )}

              <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6 shadow-sm">
                <h2 className="font-mono text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-4">Question Review</h2>
                <div className="space-y-3">
                  {answers.map((a, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className={`material-symbols-outlined text-[16px] filled flex-shrink-0 mt-0.5 ${a.isCorrect ? 'text-emerald-500' : 'text-red-400'}`}>
                        {a.isCorrect ? 'check_circle' : 'cancel'}
                      </span>
                      <div>
                        <p className="font-sans text-[13px] text-slate-700 leading-snug mb-0.5">{a.question}</p>
                        {!a.isCorrect && (
                          <p className="font-sans text-[12px] text-slate-400">
                            You: <span className="text-red-600">{a.selectedAnswer}</span>
                            {' · '}Correct: <span className="text-emerald-600">{a.correctAnswer}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setPhase('setup')}
              className="flex-1 py-3.5 rounded-xl font-mono text-[12px] font-bold tracking-widest uppercase border-2 border-slate-300 text-slate-700 hover:border-slate-400 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push('/skills')}
              className="flex-1 py-3.5 rounded-xl font-mono text-[12px] font-bold tracking-widest uppercase bg-violet-600 hover:bg-violet-700 text-white transition-colors"
            >
              Back to Skills
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
