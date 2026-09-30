'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { getTopics, getExercisesByTopic, saveSpeedScore, getSpeedLeaderboard } from '@/lib/db';
import { playSuccessSound, playErrorSound } from '@/lib/audio';

const TIME_PER_Q = 20;

const BIG_O_QUESTIONS = [
  {
    question: 'What is the time complexity of searching in a balanced Binary Search Tree (BST) of size N?',
    options: ['O(1)', 'O(log N)', 'O(N)', 'O(N log N)'],
    correct: 1,
    explanation: 'A balanced BST cuts the search space in half with every comparison, yielding O(log N) time.',
  },
  {
    question: 'What is the worst-case time complexity of QuickSort?',
    options: ['O(log N)', 'O(N)', 'O(N log N)', 'O(N²)'],
    correct: 3,
    explanation: 'When the selected pivot is repeatedly the smallest or largest element, QuickSort degrades to O(N²).',
  },
  {
    question: 'What is the average time complexity of insertion into a Hash Map under uniform hashing?',
    options: ['O(1)', 'O(log N)', 'O(N)', 'O(N²)'],
    correct: 0,
    explanation: 'With a low load factor, hashing resolves in expected O(1) constant time.',
  },
  {
    question: 'What is the time complexity of generating all subsets (the power set) of an array of length N?',
    options: ['O(N²)', 'O(N³)', 'O(2ᴺ)', 'O(N!)'],
    correct: 2,
    explanation: 'An array of size N has 2ᴺ distinct subsets. Generating all takes O(2ᴺ) time.',
  },
  {
    question: 'What is the space complexity of Breadth-First Search (BFS) on a balanced binary tree of N nodes?',
    options: ['O(1)', 'O(log N)', 'O(N)', 'O(N log N)'],
    correct: 2,
    explanation: 'The bottom level of a binary tree contains N/2 nodes, meaning the BFS queue holds O(N) nodes.',
  },
  {
    question: 'What is the time complexity of building a Binary Heap (heapify) from an unsorted array of N elements?',
    options: ['O(1)', 'O(log N)', 'O(N)', 'O(N log N)'],
    correct: 2,
    explanation: 'Sifting down bottom-up aggregates to O(N) due to decreasing node heights.',
  },
  {
    question: 'What is the space complexity of Depth-First Search (DFS) on a balanced binary tree of N nodes?',
    options: ['O(1)', 'O(log N)', 'O(N)', 'O(N²)'],
    correct: 1,
    explanation: 'The maximum recursion call stack corresponds to the tree height O(log N).',
  },
  {
    question: 'What is the amortized time complexity of appending an element to a dynamic array (e.g. Python list)?',
    options: ['O(1)', 'O(log N)', 'O(N)', 'O(N²)'],
    correct: 0,
    explanation: 'Doubling capacity upon reaching limit yields an amortized O(1) constant cost per append.',
  },
  {
    question: 'What is the guaranteed worst-case time complexity of Merge Sort?',
    options: ['O(N)', 'O(N log N)', 'O(N²)', 'O(log N)'],
    correct: 1,
    explanation: 'Merge Sort always splits in halves (log N levels) with O(N) work per level, guaranteeing O(N log N).',
  },
  {
    question: 'What is the time complexity of checking if two strings of length N are anagrams using a frequency map?',
    options: ['O(1)', 'O(N)', 'O(N log N)', 'O(N²)'],
    correct: 1,
    explanation: 'Counting frequencies takes O(N) time, and comparing fixed alphabet counts is O(1).',
  },
];

const PATTERN_QUESTIONS = [
  {
    question: 'Problem: Find the maximum sum of any contiguous subarray of fixed size K. Optimal algorithmic pattern?',
    options: ['Sliding Window', 'Monotonic Stack', 'Depth-First Search', 'Binary Search'],
    correct: 0,
    explanation: 'A fixed-size sliding window updates sum in O(1) per step, traversing the array in O(N).',
  },
  {
    question: 'Problem: Find the next greater element for every index in an array in O(N) time. Optimal pattern?',
    options: ['Two Pointers', 'Monotonic Stack', 'Greedy Search', 'Dynamic Programming'],
    correct: 1,
    explanation: 'A monotonic decreasing stack resolves unfulfilled larger elements in O(N) linear time.',
  },
  {
    question: 'Problem: In a sorted array, determine if two numbers sum to target X in O(1) memory. Optimal pattern?',
    options: ['Sliding Window', 'Two Pointers (Opposite Ends)', 'Breadth-First Search', 'Prefix Sum'],
    correct: 1,
    explanation: 'Converging left and right pointers verify the target in O(N) time with zero extra memory.',
  },
  {
    question: 'Problem: Find the shortest path between two nodes in an unweighted graph. Optimal algorithmic pattern?',
    options: ['Breadth-First Search (BFS)', 'Depth-First Search (DFS)', 'Bellman-Ford', 'Topological Sort'],
    correct: 0,
    explanation: 'BFS explores layer by layer, guaranteeing the first arrival at the target is the shortest path.',
  },
  {
    question: 'Problem: Find the top K most frequent elements in a continuous stream of numbers. Optimal pattern?',
    options: ['Monotonic Queue', 'Min-Heap of size K', 'Matrix Exponentiation', 'Union Find'],
    correct: 1,
    explanation: 'Maintaining a min-heap bounded at size K processes elements in O(N log K) time.',
  },
  {
    question: 'Problem: Detect if a directed graph has a cycle. Optimal algorithmic pattern?',
    options: ['DFS 3-State / Topological Sort', 'Sliding Window', 'Kadane Algorithm', 'Binary Search on Answer'],
    correct: 0,
    explanation: 'DFS cycle detection using white/gray/black states detects back-edges in O(V + E).',
  },
  {
    question: 'Problem: Daily temperature forecasts: find days until a warmer day for each index. Optimal pattern?',
    options: ['Monotonic Stack', 'Two Pointers', 'Binary Search', 'Sliding Window'],
    correct: 0,
    explanation: 'A monotonic stack stores days waiting for a warmer temperature, processing each once.',
  },
  {
    question: 'Problem: Autocomplete search suggestions for a given prefix in a large dictionary. Optimal pattern?',
    options: ['Trie (Prefix Tree)', 'Monotonic Queue', 'Two Pointers', 'Kadane Algorithm'],
    correct: 0,
    explanation: 'A Trie retrieves prefix matches proportional to prefix length O(L) regardless of dictionary size.',
  },
];

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
  const [phase, setPhase] = useState('pick');
  const [drillMode, setDrillMode] = useState('big-o');
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);

  const [questions, setQuestions] = useState([]);
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_Q);

  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [score, setScore] = useState(0);

  const [results, setResults] = useState([]);
  const [totalMs, setTotalMs] = useState(0);
  const [leaderboard, setLB] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loadingQ, setLoadingQ] = useState(false);
  const [noQ, setNoQ] = useState(false);

  const roundStartTime = useRef(null);

  useEffect(() => {
    getTopics().then(setTopics);
    supabase.auth.getUser().then(({ data: { user } }) => setUserId(user?.id));
  }, []);

  const getMultiplier = (currentStreak) => {
    if (currentStreak >= 5) return 3.0;
    if (currentStreak >= 3) return 2.0;
    if (currentStreak >= 2) return 1.5;
    return 1.0;
  };

  const advanceQuestion = useCallback((sel, wasTimeout) => {
    const q = questions[qIdx];
    const isCorrect = sel === q.correct && !wasTimeout;

    if (isCorrect) {
      playSuccessSound();
      setStreak(s => {
        const nextS = s + 1;
        setMaxStreak(ms => Math.max(ms, nextS));
        const mult = getMultiplier(nextS);
        setScore(sc => Math.round(sc + 100 * mult));
        return nextS;
      });
    } else {
      playErrorSound();
      setStreak(0);
    }

    setResults(prev => {
      const updated = [
        ...prev,
        {
          question: q.question,
          options: q.options,
          correct: q.correct,
          selected: sel,
          isCorrect,
          explanation: q.explanation,
        },
      ];

      if (qIdx + 1 >= questions.length) {
        const newCorrect = updated.filter(r => r.isCorrect).length;
        const elapsed = roundStartTime.current ? Date.now() - roundStartTime.current : 0;
        setTotalMs(elapsed);
        setPhase('results');

        const topicIdToSave = selectedTopic?.id || (drillMode === 'big-o' ? 'big-o' : 'patterns');
        saveSpeedScore(topicIdToSave, newCorrect, questions.length, elapsed).catch(() => {});
        getSpeedLeaderboard(topicIdToSave).then(setLB);
      }
      return updated;
    });

    if (qIdx + 1 < questions.length) {
      setQIdx(i => i + 1);
      setSelected(null);
      setConfirmed(false);
      setTimeLeft(TIME_PER_Q);
    }
  }, [questions, qIdx, selectedTopic, drillMode]);

  useEffect(() => {
    if (phase !== 'playing' || confirmed) return;
    if (timeLeft <= 0) {
      advanceQuestion(null, true);
      return;
    }
    const id = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [phase, timeLeft, confirmed, advanceQuestion]);

  const handleStartBuiltin = (mode) => {
    setDrillMode(mode);
    setSelectedTopic({ id: mode, name: mode === 'big-o' ? 'Big-O Complexity' : 'Pattern Recognition' });
    const source = mode === 'big-o' ? BIG_O_QUESTIONS : PATTERN_QUESTIONS;
    const picked = shuffle(source).slice(0, 8);

    setQuestions(picked);
    setQIdx(0);
    setSelected(null);
    setConfirmed(false);
    setResults([]);
    setStreak(0);
    setMaxStreak(0);
    setScore(0);
    setTimeLeft(TIME_PER_Q);
    roundStartTime.current = Date.now();
    setPhase('playing');
  };

  const handleTopicSelect = async (t) => {
    setLoadingQ(true);
    setDrillMode('topic');
    setSelectedTopic(t);

    const exs = await getExercisesByTopic(t.id, 30);
    const mcqs = exs.filter(e => e.options?.length >= 2 && e.correct !== null && e.correct !== undefined);
    if (mcqs.length < 4) {
      setNoQ(true);
      setLoadingQ(false);
      return;
    }

    const picked = shuffle(mcqs).slice(0, 10);
    setQuestions(picked);
    setQIdx(0);
    setSelected(null);
    setConfirmed(false);
    setResults([]);
    setStreak(0);
    setMaxStreak(0);
    setScore(0);
    setTimeLeft(TIME_PER_Q);
    roundStartTime.current = Date.now();
    setPhase('playing');
    setLoadingQ(false);
  };

  const handleLockIn = useCallback((overrideSelection = selected) => {
    if (overrideSelection === null || confirmed) return;
    setConfirmed(true);
    setTimeout(() => advanceQuestion(overrideSelection, false), 600);
  }, [selected, confirmed, advanceQuestion]);

  useEffect(() => {
    if (phase !== 'playing' || confirmed) return;

    function handleKeyDown(e) {
      if (e.key >= '1' && e.key <= '4') {
        const idx = parseInt(e.key, 10) - 1;
        if (questions[qIdx]?.options && questions[qIdx].options[idx] !== undefined) {
          setSelected(idx);
          handleLockIn(idx);
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, confirmed, qIdx, questions, handleLockIn]);

  const correctCount = results.filter(r => r.isCorrect).length;
  const q = questions[qIdx];
  const timePct = (timeLeft / TIME_PER_Q) * 100;
  const timerColor = timeLeft > 10 ? '#059669' : timeLeft > 5 ? '#d97706' : '#dc2626';
  const multiplier = getMultiplier(streak);

  if (phase === 'pick') {
    return (
      <div className="max-w-3xl mx-auto pb-16 px-4 space-y-8">
        <div className="flex items-center justify-between border-b border-slate-200 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <Link href="/practice" className="font-mono text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1">
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              <span>Practice</span>
            </Link>
            <span className="text-slate-300">|</span>
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
              Speed & Complexity
            </span>
          </div>

          <Link
            href="/focus"
            className="btn-tactile btn-tactile-secondary px-3 py-1.5 rounded-xl font-mono text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">my_location</span>
            <span>Focus Hub</span>
          </Link>
        </div>

        <div className="text-center space-y-2">
          <h1 className="font-sans font-extrabold text-[32px] text-slate-900 tracking-tight">
            Rapid-Fire Speed Drill
          </h1>
          <p className="font-sans text-[14px] text-slate-500 max-w-lg mx-auto">
            Hone instant pattern recognition and Big-O instinct under time pressure. Use keys 1–4 to answer instantly.
          </p>
        </div>

        {noQ && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 font-sans text-xs text-amber-900 text-center">
            Not enough questions found in that topic yet. Pick another drill below.
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => handleStartBuiltin('big-o')}
            className="p-6 rounded-3xl border-2 border-amber-300 bg-gradient-to-br from-amber-50/70 to-white text-left hover:border-amber-500 transition-all shadow-sm hover:shadow-md group relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-mono font-bold text-sm shadow-sm">
                O(n)
              </span>
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                Recommended
              </span>
            </div>
            <h3 className="font-sans font-bold text-[18px] text-slate-900 group-hover:text-amber-800 transition-colors">
              Big-O Complexity Speed Run
            </h3>
            <p className="font-sans text-xs text-slate-500 mt-1 leading-relaxed">
              Identify time and space complexity of loops, recursion, trees, and heaps in seconds.
            </p>
            <div className="mt-4 flex items-center gap-2 font-mono text-[11px] font-bold text-amber-700">
              <span>Start Big-O Sprint</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleStartBuiltin('pattern')}
            className="p-6 rounded-3xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50/70 to-white text-left hover:border-indigo-400 transition-all shadow-sm hover:shadow-md group relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-mono font-bold text-sm shadow-sm">
                <span className="material-symbols-outlined text-[20px]">psychology</span>
              </span>
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                Pattern Drill
              </span>
            </div>
            <h3 className="font-sans font-bold text-[18px] text-slate-900 group-hover:text-indigo-800 transition-colors">
              Pattern Recognition Speed Run
            </h3>
            <p className="font-sans text-xs text-slate-500 mt-1 leading-relaxed">
              Match problem scenarios to Two Pointers, Sliding Window, Monotonic Stack, or Heaps.
            </p>
            <div className="mt-4 flex items-center gap-2 font-mono text-[11px] font-bold text-indigo-700">
              <span>Start Pattern Sprint</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </div>
          </button>
        </div>

        <div className="space-y-3 pt-4">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-400 block">
            Or Pick a Topic Sprint
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {topics.map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleTopicSelect(t)}
                disabled={loadingQ}
                className="p-4 rounded-2xl border border-slate-200 bg-white text-left hover:border-slate-400 hover:bg-slate-50 transition-all"
              >
                <span className="material-symbols-outlined text-[20px] text-slate-500 mb-1.5 block">
                  {t.icon || 'code'}
                </span>
                <p className="font-sans font-bold text-[13px] text-slate-900 truncate">{t.name}</p>
                <p className="font-mono text-[10px] text-slate-400 uppercase mt-0.5">{t.category_id}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'playing' && q) {
    return (
      <div className="max-w-xl mx-auto px-4 py-6 flex flex-col justify-between min-h-[90vh]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-500">
                {qIdx + 1} / {questions.length}
              </span>
              <span className="text-slate-300">•</span>
              <span className="font-mono text-xs font-bold text-emerald-700">
                Score: {score}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {streak >= 2 && (
                <span className="inline-flex items-center gap-1 font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500 text-white animate-pulse">
                  <span>🔥 {streak}x</span>
                  <span className="text-[10px]">({multiplier}x)</span>
                </span>
              )}

              <div className="flex items-center gap-1.5 font-mono text-sm font-bold" style={{ color: timerColor }}>
                <span className="material-symbols-outlined text-[16px]">timer</span>
                <span>{timeLeft}s</span>
              </div>
            </div>
          </div>

          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${timePct}%`, backgroundColor: timerColor }}
            />
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <p className="font-sans font-bold text-[18px] text-slate-900 leading-snug">
              {q.question}
            </p>
          </div>

          <div className="space-y-2.5">
            {q.options.map((opt, i) => {
              const hotkey = i + 1;
              let btnStyle = 'border-slate-200 bg-white text-slate-800 hover:border-slate-400';
              if (confirmed) {
                if (i === q.correct) {
                  btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold';
                } else if (i === selected) {
                  btnStyle = 'border-red-400 bg-red-50 text-red-950 font-bold';
                } else {
                  btnStyle = 'border-slate-100 bg-slate-50 text-slate-400 opacity-60';
                }
              } else if (i === selected) {
                btnStyle = 'border-slate-900 bg-slate-50 font-bold ring-2 ring-slate-900';
              }

              return (
                <button
                  key={i}
                  type="button"
                  disabled={confirmed}
                  onClick={() => {
                    setSelected(i);
                    handleLockIn(i);
                  }}
                  className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all ${btnStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl font-mono text-[11px] font-bold flex items-center justify-center bg-slate-100 text-slate-700 border border-slate-200">
                      {hotkey}
                    </span>
                    <span className="font-mono text-[13px]">{opt}</span>
                  </div>

                  {confirmed && i === q.correct && (
                    <span className="material-symbols-outlined text-[20px] text-emerald-600 filled">check_circle</span>
                  )}
                  {confirmed && i === selected && i !== q.correct && (
                    <span className="material-symbols-outlined text-[20px] text-red-500 filled">cancel</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-4 text-center font-mono text-[11px] text-slate-400">
          Press key 1, 2, 3, or 4 on your keyboard for instant selection
        </div>
      </div>
    );
  }

  if (phase === 'results') {
    const accuracy = Math.round((correctCount / questions.length) * 100);
    const avgMs = Math.round(totalMs / questions.length);

    return (
      <div className="max-w-2xl mx-auto pb-16 px-4 space-y-6">
        <div className="py-8 text-center space-y-3">
          <div className="w-20 h-20 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-[40px] filled">
              {accuracy >= 80 ? 'military_tech' : 'timer'}
            </span>
          </div>
          <h1 className="font-sans font-extrabold text-[32px] text-slate-900">
            Speed Round Finished!
          </h1>
          <p className="font-sans text-[14px] text-slate-500">
            {selectedTopic?.name} • Total time: {fmt(totalMs)}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm text-center">
            <span className="font-mono text-[10px] uppercase text-slate-400 block mb-1">Score</span>
            <p className="font-mono font-bold text-[22px] text-amber-600">{score}</p>
          </div>
          <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm text-center">
            <span className="font-mono text-[10px] uppercase text-slate-400 block mb-1">Correct</span>
            <p className="font-mono font-bold text-[22px] text-emerald-600">{correctCount}/{questions.length}</p>
          </div>
          <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm text-center">
            <span className="font-mono text-[10px] uppercase text-slate-400 block mb-1">Accuracy</span>
            <p className="font-mono font-bold text-[22px] text-slate-900">{accuracy}%</p>
          </div>
          <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm text-center">
            <span className="font-mono text-[10px] uppercase text-slate-400 block mb-1">Max Streak</span>
            <p className="font-mono font-bold text-[22px] text-purple-600">{maxStreak}x</p>
          </div>
        </div>

        <div className="space-y-3">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-400 block">
            Round Question Breakdown
          </span>
          {results.map((r, i) => (
            <div
              key={i}
              className={`p-4 rounded-2xl border ${
                r.isCorrect ? 'bg-emerald-50/50 border-emerald-200' : 'bg-red-50/50 border-red-200'
              }`}
            >
              <div className="flex items-start gap-2 mb-1.5">
                <span className={`material-symbols-outlined text-[18px] filled shrink-0 mt-0.5 ${r.isCorrect ? 'text-emerald-600' : 'text-red-500'}`}>
                  {r.isCorrect ? 'check_circle' : 'cancel'}
                </span>
                <p className="font-sans text-[13px] font-semibold text-slate-900">{r.question}</p>
              </div>

              {!r.isCorrect && (
                <div className="pl-6 space-y-1 font-sans text-xs">
                  <p className="text-emerald-800 font-medium">
                    Correct: <strong>{r.options?.[r.correct]}</strong>
                  </p>
                  {r.explanation && (
                    <p className="text-slate-500">{r.explanation}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {leaderboard.length > 0 && (
          <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-sm">
            <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {selectedTopic?.name} Leaderboard
            </div>
            {leaderboard.slice(0, 5).map((row, i) => (
              <div
                key={i}
                className={`flex items-center gap-4 px-5 py-3 border-b border-slate-100 last:border-0 ${
                  row.user_id === userId ? 'bg-amber-50/60 font-bold' : ''
                }`}
              >
                <span className="font-mono text-[12px] text-slate-400 w-4">{i + 1}</span>
                <span className="font-sans text-[13px] text-slate-800 flex-1 truncate">
                  {row.user_profiles?.display_name || 'Anonymous Coder'}
                </span>
                <span className="font-mono text-[12px] text-emerald-700 font-bold">
                  {row.correct}/{row.total}
                </span>
                <span className="font-mono text-[11px] text-slate-400">
                  {fmt(row.time_ms)}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => setPhase('pick')}
            className="btn-tactile btn-tactile-secondary w-full sm:flex-1 py-3 rounded-2xl font-mono text-[12px] font-bold uppercase tracking-wider"
          >
            Switch Drill
          </button>
          <button
            type="button"
            onClick={() => {
              if (drillMode === 'big-o' || drillMode === 'pattern') handleStartBuiltin(drillMode);
              else handleTopicSelect(selectedTopic);
            }}
            className="btn-tactile btn-tactile-primary w-full sm:flex-1 py-3 rounded-2xl font-mono text-[12px] font-bold uppercase tracking-wider text-white"
          >
            Play Again
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
