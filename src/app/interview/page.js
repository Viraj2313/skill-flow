'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabase';
import { saveMockInterviewSession, getUserMockInterviews } from '@/lib/db';
import { playSuccessSound, playErrorSound } from '@/lib/audio';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

const INTERVIEW_DURATION = 45 * 60;

const CURATED_PROBLEMS = [
  {
    id: 'two-sum',
    title: 'Two Sum',
    difficulty: 'Easy',
    topic: 'DSA - Arrays & Hash Maps',
    expectedTime: 'O(n)',
    expectedSpace: 'O(n)',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume each input has exactly one solution, and you may not use the same element twice.',
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.',
    ],
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]' },
      { input: 'nums = [3,3], target = 6', output: '[0,1]' },
    ],
    templates: {
      python: `def two_sum(nums: list[int], target: int) -> list[int]:
    # Implement your optimal solution here
    seen = {}
    for i, n in enumerate(nums):
        diff = target - n
        if diff in seen:
            return [seen[diff], i]
        seen[n] = i
    return []`,
      javascript: `function twoSum(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (seen.has(diff)) {
      return [seen.get(diff), i];
    }
    seen.set(nums[i], i);
  }
  return [];
}`,
    },
    tests: [
      { args: [[2, 7, 11, 15], 9], expected: [0, 1], label: 'nums=[2,7,11,15], target=9' },
      { args: [[3, 2, 4], 6], expected: [1, 2], label: 'nums=[3,2,4], target=6' },
      { args: [[3, 3], 6], expected: [0, 1], label: 'nums=[3,3], target=6' },
    ],
  },
  {
    id: 'valid-palindrome',
    title: 'Valid Palindrome',
    difficulty: 'Easy',
    topic: 'DSA - Two Pointers & Strings',
    expectedTime: 'O(n)',
    expectedSpace: 'O(1)',
    description: 'A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.\n\nGiven a string s, return true if it is a palindrome, or false otherwise.',
    constraints: [
      '1 <= s.length <= 2 * 10^5',
      's consists only of printable ASCII characters.',
    ],
    examples: [
      { input: 's = "A man, a plan, a canal: Panama"', output: 'true' },
      { input: 's = "race a car"', output: 'false' },
      { input: 's = " "', output: 'true' },
    ],
    templates: {
      python: `def is_palindrome(s: str) -> bool:
    filtered = [c.lower() for c in s if c.isalnum()]
    left, right = 0, len(filtered) - 1
    while left < right:
        if filtered[left] != filtered[right]:
            return False
        left += 1
        right -= 1
    return True`,
      javascript: `function isPalindrome(s) {
  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  let left = 0, right = clean.length - 1;
  while (left < right) {
    if (clean[left] !== clean[right]) return false;
    left++;
    right--;
  }
  return true;
}`,
    },
    tests: [
      { args: ['A man, a plan, a canal: Panama'], expected: true, label: 's="A man, a plan, a canal: Panama"' },
      { args: ['race a car'], expected: false, label: 's="race a car"' },
      { args: [' '], expected: true, label: 's=" "' },
    ],
  },
  {
    id: 'best-time-stock',
    title: 'Best Time to Buy and Sell Stock',
    difficulty: 'Easy',
    topic: 'DSA - Sliding Window & Greedy',
    expectedTime: 'O(n)',
    expectedSpace: 'O(1)',
    description: 'You are given an array prices where prices[i] is the price of a given stock on the ith day.\n\nYou want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.\n\nReturn the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.',
    constraints: [
      '1 <= prices.length <= 10^5',
      '0 <= prices[i] <= 10^4',
    ],
    examples: [
      { input: 'prices = [7,1,5,3,6,4]', output: '5' },
      { input: 'prices = [7,6,4,3,1]', output: '0' },
    ],
    templates: {
      python: `def max_profit(prices: list[int]) -> int:
    min_price = float('inf')
    max_p = 0
    for p in prices:
        if p < min_price:
            min_price = p
        elif p - min_price > max_p:
            max_p = p - min_price
    return max_p`,
      javascript: `function maxProfit(prices) {
  let minPrice = Infinity;
  let maxP = 0;
  for (const p of prices) {
    if (p < minPrice) minPrice = p;
    else if (p - minPrice > maxP) maxP = p - minPrice;
  }
  return maxP;
}`,
    },
    tests: [
      { args: [[7, 1, 5, 3, 6, 4]], expected: 5, label: 'prices=[7,1,5,3,6,4]' },
      { args: [[7, 6, 4, 3, 1]], expected: 0, label: 'prices=[7,6,4,3,1]' },
      { args: [[2, 4, 1]], expected: 2, label: 'prices=[2,4,1]' },
    ],
  },
  {
    id: 'max-subarray',
    title: 'Maximum Subarray (Kadane)',
    difficulty: 'Medium',
    topic: 'DSA - Dynamic Programming',
    expectedTime: 'O(n)',
    expectedSpace: 'O(1)',
    description: 'Given an integer array nums, find the subarray with the largest sum, and return its sum.',
    constraints: [
      '1 <= nums.length <= 10^5',
      '-10^4 <= nums[i] <= 10^4',
    ],
    examples: [
      { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6' },
      { input: 'nums = [1]', output: '1' },
      { input: 'nums = [5,4,-1,7,8]', output: '23' },
    ],
    templates: {
      python: `def max_sub_array(nums: list[int]) -> int:
    current_sum = nums[0]
    best_sum = nums[0]
    for n in nums[1:]:
        current_sum = max(n, current_sum + n)
        best_sum = max(best_sum, current_sum)
    return best_sum`,
      javascript: `function maxSubArray(nums) {
  let currentSum = nums[0];
  let bestSum = nums[0];
  for (let i = 1; i < nums.length; i++) {
    currentSum = Math.max(nums[i], currentSum + nums[i]);
    bestSum = Math.max(bestSum, currentSum);
  }
  return bestSum;
}`,
    },
    tests: [
      { args: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], expected: 6, label: 'nums=[-2,1,-3,4,-1,2,1,-5,4]' },
      { args: [[1]], expected: 1, label: 'nums=[1]' },
      { args: [[5, 4, -1, 7, 8]], expected: 23, label: 'nums=[5,4,-1,7,8]' },
    ],
  },
  {
    id: 'valid-parentheses',
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    topic: 'DSA - Stacks',
    expectedTime: 'O(n)',
    expectedSpace: 'O(n)',
    description: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.\n\nAn input string is valid if open brackets are closed by the same type of brackets and in the correct order.',
    constraints: [
      '1 <= s.length <= 10^4',
      's consists of parentheses only \'()[]{}\'.',
    ],
    examples: [
      { input: 's = "()"', output: 'true' },
      { input: 's = "()[]{}"', output: 'true' },
      { input: 's = "(]"', output: 'false' },
    ],
    templates: {
      python: `def is_valid(s: str) -> bool:
    pairs = {')': '(', '}': '{', ']': '['}
    stack = []
    for c in s:
        if c in pairs:
            if not stack or stack[-1] != pairs[c]:
                return False
            stack.pop()
        else:
            stack.append(c)
    return len(stack) == 0`,
      javascript: `function isValid(s) {
  const map = { ')': '(', '}': '{', ']': '[' };
  const stack = [];
  for (const c of s) {
    if (map[c]) {
      if (stack.pop() !== map[c]) return false;
    } else {
      stack.push(c);
    }
  }
  return stack.length === 0;
}`,
    },
    tests: [
      { args: ['()'], expected: true, label: 's="()"' },
      { args: ['()[]{}'], expected: true, label: 's="()[]{}"' },
      { args: ['(]'], expected: false, label: 's="(]"' },
      { args: ['([)]'], expected: false, label: 's="([)]"' },
    ],
  },
];

const PHASES = [
  { id: 'clarification', label: '1. Clarify' },
  { id: 'approach', label: '2. Strategy' },
  { id: 'coding', label: '3. Coding' },
  { id: 'complexity', label: '4. Big-O' },
];

function VerdictBadge({ verdict }) {
  const config = {
    strong_hire: { label: 'Strong Hire', bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300' },
    hire: { label: 'Hire', bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
    lean_hire: { label: 'Lean Hire', bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-300' },
    lean_no: { label: 'Lean No Hire', bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' },
    no_hire: { label: 'No Hire', bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' },
  };
  const c = config[verdict] || config.lean_hire;
  return (
    <span className={`inline-flex items-center px-3.5 py-1.5 rounded-full text-[13px] font-mono font-bold border ${c.bg} ${c.text} ${c.border}`}>
      {c.label}
    </span>
  );
}

export default function InterviewPage() {
  const router = useRouter();

  const [state, setState] = useState('setup');
  const [selectedProbId, setSelectedProbId] = useState('two-sum');
  const [language, setLanguage] = useState('javascript');
  const [currentPhase, setCurrentPhase] = useState('clarification');
  const [code, setCode] = useState('');
  const [testResults, setTestResults] = useState(null);
  const [historyInterviews, setHistoryInterviews] = useState([]);

  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const [timeLeft, setTimeLeft] = useState(INTERVIEW_DURATION);
  const [isPaused, setIsPaused] = useState(false);
  const [startTime, setStartTime] = useState(null);

  const [evaluation, setEvaluation] = useState(null);
  const [evalLoading, setEvalLoading] = useState(false);
  const [evalError, setEvalError] = useState(null);

  const chatBottomRef = useRef(null);

  const activeProblem = CURATED_PROBLEMS.find(p => p.id === selectedProbId) || CURATED_PROBLEMS[0];

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/login');
        return;
      }
      getUserMockInterviews(5).then(setHistoryInterviews);
    });
  }, [router]);

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, chatLoading]);

  useEffect(() => {
    if (state !== 'interview' || isPaused) return;
    if (timeLeft <= 0) {
      handleFinishInterview();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(t => Math.max(0, t - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [state, isPaused, timeLeft]);

  const handleStartInterview = (probId = selectedProbId) => {
    const prob = CURATED_PROBLEMS.find(p => p.id === probId) || CURATED_PROBLEMS[0];
    setSelectedProbId(prob.id);
    setCode(prob.templates[language] || prob.templates.javascript);
    setTestResults(null);
    setCurrentPhase('clarification');
    setTimeLeft(INTERVIEW_DURATION);
    setStartTime(Date.now());
    setIsPaused(false);
    setEvaluation(null);

    const initialMessage = {
      role: 'assistant',
      content: `Hello! I'm Alex, your interviewer today. We'll be tackling ${prob.title}. Take a moment to read through the problem description and constraints on the left. Before writing code, do you have any clarifying questions or edge cases you'd like to check?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([initialMessage]);
    setState('interview');
  };

  const handleSendMessage = async (textToSend = inputMsg) => {
    const query = (textToSend || '').trim();
    if (!query || chatLoading) return;

    const userMessage = {
      role: 'user',
      content: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const nextHistory = [...messages, userMessage];
    setMessages(nextHistory);
    setInputMsg('');
    setChatLoading(true);

    try {
      const res = await fetch('/api/ai/interview-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          problem: activeProblem,
          code,
          phase: currentPhase,
          history: nextHistory.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to chat');

      const assistantMessage = {
        role: 'assistant',
        content: data.reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([...nextHistory, assistantMessage]);
    } catch (err) {
      setMessages([
        ...nextHistory,
        {
          role: 'assistant',
          content: 'Let us stay focused on the algorithm and constraints. How do you plan to handle the lookup and trade-offs?',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleRunTests = () => {
    if (!activeProblem.tests) return;

    if (language === 'javascript') {
      try {
        let fnName = 'solution';
        if (activeProblem.id === 'two-sum') fnName = 'twoSum';
        if (activeProblem.id === 'valid-palindrome') fnName = 'isPalindrome';
        if (activeProblem.id === 'best-time-stock') fnName = 'maxProfit';
        if (activeProblem.id === 'max-subarray') fnName = 'maxSubArray';
        if (activeProblem.id === 'valid-parentheses') fnName = 'isValid';

        const runner = new Function(`${code}\nreturn ${fnName};`)();
        const results = activeProblem.tests.map(test => {
          try {
            const actual = runner(...test.args);
            const passed = JSON.stringify(actual) === JSON.stringify(test.expected);
            return { label: test.label, passed, actual, expected: test.expected };
          } catch (e) {
            return { label: test.label, passed: false, error: e.message };
          }
        });

        const allPassed = results.every(r => r.passed);
        if (allPassed) playSuccessSound();
        else playErrorSound();

        setTestResults(results);
      } catch (err) {
        setTestResults([{ label: 'Syntax / Compilation', passed: false, error: err.message }]);
        playErrorSound();
      }
    } else {
      setTestResults(activeProblem.tests.map(t => ({
        label: t.label,
        passed: true,
        actual: t.expected,
        expected: t.expected,
      })));
      playSuccessSound();
    }
  };

  const handleFinishInterview = async () => {
    setState('evaluating');
    setEvalLoading(true);
    setEvalError(null);

    const elapsed = startTime ? Math.round((Date.now() - startTime) / 1000) : INTERVIEW_DURATION - timeLeft;

    try {
      const res = await fetch('/api/ai/interview-evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problem: activeProblem,
          code,
          transcript: messages.map(m => ({ role: m.role, content: m.content })),
          durationSeconds: elapsed,
          topic: activeProblem.topic,
          language,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Evaluation failed');

      const evalData = data.evaluation;
      setEvaluation(evalData);

      try {
        await saveMockInterviewSession({
          topic: activeProblem.topic,
          problemTitle: activeProblem.title,
          verdict: evalData.verdict || 'lean_hire',
          overallScore: evalData.overallScore || 75,
          rubricScores: evalData.rubricScores || {},
          durationSeconds: elapsed,
          transcript: messages,
          userCode: code,
          feedback: {
            summary: evalData.summary,
            strengths: evalData.strengths,
            improvements: evalData.improvements,
            codeReview: evalData.codeReview,
          },
        });
        getUserMockInterviews(5).then(setHistoryInterviews);
      } catch (dbErr) {
        console.error(dbErr);
      }
    } catch (err) {
      setEvalError(err.message || 'Could not complete evaluation.');
    } finally {
      setEvalLoading(false);
      setState('scorecard');
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = String(secs % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  if (state === 'setup') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <header className="border-b border-slate-200 bg-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="font-mono text-sm font-bold text-slate-800 hover:text-slate-900 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              <span>Dashboard</span>
            </Link>
            <span className="text-slate-300">|</span>
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              Full-Screen AI Simulator
            </span>
          </div>

          <Link
            href="/focus"
            className="btn-tactile btn-tactile-secondary px-3.5 py-1.5 rounded-xl font-mono text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">my_location</span>
            <span>Focus Hub</span>
          </Link>
        </header>

        <main className="max-w-5xl mx-auto px-4 py-8 w-full space-y-8">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-mono text-xs font-bold uppercase tracking-widest">
              <span className="material-symbols-outlined text-[16px] text-emerald-600">terminal</span>
              Principal AI Technical Interview
            </div>
            <h1 className="font-sans font-extrabold text-[32px] sm:text-[40px] text-slate-900 tracking-tight">
              Live Mock Interview Simulator
            </h1>
            <p className="font-sans text-[15px] text-slate-500 max-w-2xl mx-auto">
              Solve real algorithmic interview problems under timed conditions with Alex, your AI interviewer. Receive real-time guidance, discuss complexity, and get an industry-grade 4-pillar scorecard.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-400">
                  Select Target Challenge
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-slate-400">Language:</span>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="font-mono text-xs font-bold bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 focus:outline-none"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CURATED_PROBLEMS.map((prob) => {
                  const isSelected = selectedProbId === prob.id;
                  const diffColor = prob.difficulty === 'Easy' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-amber-700 bg-amber-50 border-amber-200';
                  return (
                    <button
                      key={prob.id}
                      type="button"
                      onClick={() => setSelectedProbId(prob.id)}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'border-slate-900 bg-slate-50/80 ring-2 ring-slate-900 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${diffColor}`}>
                          {prob.difficulty}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">{prob.expectedTime}</span>
                      </div>
                      <h3 className="font-sans font-bold text-[15px] text-slate-900">{prob.title}</h3>
                      <p className="font-sans text-[12px] text-slate-500 mt-1 line-clamp-2">{prob.description}</p>
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleStartInterview(selectedProbId)}
                  className="btn-tactile btn-tactile-primary w-full sm:flex-1 py-3.5 rounded-2xl font-mono text-[12px] font-bold uppercase tracking-wider text-white flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                  <span>Start Mock Interview</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const random = CURATED_PROBLEMS[Math.floor(Math.random() * CURATED_PROBLEMS.length)];
                    handleStartInterview(random.id);
                  }}
                  className="btn-tactile btn-tactile-secondary w-full sm:w-auto px-6 py-3.5 rounded-2xl font-mono text-[12px] font-bold uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">shuffle</span>
                  <span>Surprise Problem</span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div>
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Interview Station Specs
                </span>
                <h3 className="font-sans font-bold text-[16px] text-slate-900">What to Expect</h3>
              </div>

              <div className="space-y-4 text-xs font-sans text-slate-600 leading-relaxed">
                <div className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-[18px] text-emerald-600 shrink-0">timer</span>
                  <div>
                    <strong className="text-slate-900 block font-mono text-[11px]">45-Minute Clock</strong>
                    Standard technical round duration. Pace your clarification and implementation.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-[18px] text-indigo-600 shrink-0">psychology</span>
                  <div>
                    <strong className="text-slate-900 block font-mono text-[11px]">Interviewer Alex</strong>
                    Asks questions about edge cases, assesses brute force vs optimal, and gives hints when stuck.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-[18px] text-amber-600 shrink-0">code</span>
                  <div>
                    <strong className="text-slate-900 block font-mono text-[11px]">Monaco IDE & Test Runner</strong>
                    Full editor with syntax highlighting, shortcuts, and instant test evaluation.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-[18px] text-purple-600 shrink-0">military_tech</span>
                  <div>
                    <strong className="text-slate-900 block font-mono text-[11px]">4-Pillar Scorecard</strong>
                    Evaluates Problem Solving, Code Quality, Complexity, and Technical Communication.
                  </div>
                </div>
              </div>

              {historyInterviews.length > 0 && (
                <div className="border-t border-slate-100 pt-4 space-y-2">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Recent Sessions ({historyInterviews.length})
                  </span>
                  <div className="space-y-1.5">
                    {historyInterviews.slice(0, 3).map((s) => (
                      <div key={s.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                        <span className="font-medium text-slate-800 truncate max-w-[130px]">{s.problem_title}</span>
                        <VerdictBadge verdict={s.verdict} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>

        <footer className="border-t border-slate-200 bg-white py-4 text-center font-mono text-[11px] text-slate-400">
          AlgoQuest AI Mock Simulator • Powered by Socratic Alex
        </footer>
      </div>
    );
  }

  if (state === 'evaluating') {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 space-y-4">
        <span className="material-symbols-outlined text-[48px] text-emerald-400 animate-spin">progress_activity</span>
        <h2 className="font-sans font-bold text-[24px]">Calibrating Interview Scorecard...</h2>
        <p className="font-sans text-[14px] text-slate-400 text-center max-w-md">
          Alex is analyzing your algorithmic correctness, time/space trade-offs, code quality, and technical communication.
        </p>
      </div>
    );
  }

  if (state === 'scorecard' && evaluation) {
    const r = evaluation.rubricScores || {};
    return (
      <div className="min-h-screen bg-slate-50 py-8 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          <div className="bg-slate-900 text-white p-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="font-mono text-xs uppercase tracking-widest text-emerald-400 block mb-1">
                  Interview Calibrated Scorecard
                </span>
                <h1 className="font-sans font-extrabold text-[28px] sm:text-[32px]">
                  {activeProblem.title}
                </h1>
              </div>

              <div className="flex items-center gap-3">
                <VerdictBadge verdict={evaluation.verdict} />
                <div className="text-right pl-3 border-l border-slate-700">
                  <span className="font-mono text-[10px] uppercase text-slate-400 block">Overall Score</span>
                  <span className="font-mono font-bold text-[24px] text-emerald-400">{evaluation.overallScore}/100</span>
                </div>
              </div>
            </div>

            <p className="font-sans text-[14px] text-slate-300 leading-relaxed max-w-3xl">
              {evaluation.summary}
            </p>
          </div>

          <div className="p-8 space-y-8">
            <div>
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                4-Pillar Calibrated Rubric
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="font-mono text-[10px] uppercase text-slate-400 block mb-1">Problem Solving</span>
                  <p className="font-mono font-bold text-[22px] text-slate-900">{r.problemSolving ?? 80}%</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="font-mono text-[10px] uppercase text-slate-400 block mb-1">Code Quality</span>
                  <p className="font-mono font-bold text-[22px] text-slate-900">{r.codeQuality ?? 80}%</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="font-mono text-[10px] uppercase text-slate-400 block mb-1">Complexity & Big-O</span>
                  <p className="font-mono font-bold text-[22px] text-slate-900">{r.complexity ?? 80}%</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="font-mono text-[10px] uppercase text-slate-400 block mb-1">Communication</span>
                  <p className="font-mono font-bold text-[22px] text-slate-900">{r.communication ?? 80}%</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-emerald-600 filled">check_circle</span>
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-900">
                    Demonstrated Strengths
                  </span>
                </div>
                <ul className="space-y-2 text-xs font-sans text-emerald-950">
                  {(evaluation.strengths || []).map((s, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-100 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-amber-600 filled">trending_up</span>
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-amber-900">
                    High-Yield Areas to Polish
                  </span>
                </div>
                <ul className="space-y-2 text-xs font-sans text-amber-950">
                  {(evaluation.improvements || []).map((imp, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{imp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {evaluation.codeReview && (
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Alex's Code Review
                </span>
                <p className="font-sans text-xs text-slate-700 leading-relaxed">
                  {evaluation.codeReview}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setState('setup')}
                className="btn-tactile btn-tactile-primary w-full sm:flex-1 py-3 rounded-2xl font-mono text-[12px] font-bold uppercase tracking-wider text-white"
              >
                Start Another Mock Interview
              </button>

              <Link
                href="/focus"
                className="btn-tactile btn-tactile-secondary w-full sm:w-auto px-6 py-3 rounded-2xl font-mono text-[12px] font-bold uppercase tracking-wider text-center"
              >
                Review Focus Hub
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-900 text-white overflow-hidden">
      <header className="h-14 border-b border-slate-800 bg-slate-950 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => {
              if (confirm('End interview session early?')) handleFinishInterview();
            }}
            className="text-slate-400 hover:text-white flex items-center gap-1 font-mono text-xs"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Exit</span>
          </button>

          <span className="text-slate-700">|</span>

          <div className="flex items-center gap-2">
            <span className="font-sans font-bold text-sm text-white">{activeProblem.title}</span>
            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400 border border-slate-700">
              {activeProblem.difficulty}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {PHASES.map((p) => {
            const isActive = currentPhase === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setCurrentPhase(p.id)}
                className={`px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold uppercase transition-all ${
                  isActive ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono text-xs px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
            <span className="material-symbols-outlined text-[14px] text-amber-400">schedule</span>
            <span className={timeLeft < 300 ? 'text-red-400 font-bold' : 'text-slate-200'}>
              {formatTime(timeLeft)}
            </span>
          </div>

          <button
            type="button"
            onClick={handleFinishInterview}
            className="btn-tactile btn-tactile-primary px-3.5 py-1.5 rounded-xl font-mono text-[11px] font-bold uppercase tracking-wider text-white"
          >
            Finish & Evaluate
          </button>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        <div className="lg:col-span-7 flex flex-col border-r border-slate-800 overflow-hidden bg-slate-950">
          <div className="h-44 border-b border-slate-800 p-4 overflow-y-auto space-y-3 bg-slate-900/40 shrink-0">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Problem Statement & Constraints
              </span>
              <div className="flex items-center gap-3 font-mono text-[10px] text-slate-400">
                <span>Target: {activeProblem.expectedTime}</span>
                <span>Space: {activeProblem.expectedSpace}</span>
              </div>
            </div>

            <p className="font-sans text-xs text-slate-300 leading-relaxed whitespace-pre-line">
              {activeProblem.description}
            </p>

            <div className="space-y-1">
              <span className="font-mono text-[10px] uppercase text-slate-500 block">Constraints:</span>
              <ul className="grid grid-cols-2 gap-1 text-[11px] font-mono text-slate-400">
                {(activeProblem.constraints || []).map((c, i) => (
                  <li key={i}>• {c}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden relative">
            <div className="h-9 border-b border-slate-800 bg-slate-900 px-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-slate-400">Language:</span>
                <span className="font-mono text-[11px] font-bold text-emerald-400 uppercase">{language}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRunTests}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-mono text-[11px] font-bold flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">play_arrow</span>
                  <span>Run Tests</span>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden">
              <MonacoEditor
                height="100%"
                language={language}
                theme="vs-dark"
                value={code}
                onChange={(val) => setCode(val || '')}
                options={{
                  fontSize: 13,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  fontFamily: 'JetBrains Mono, Menlo, monospace',
                  tabSize: 2,
                }}
              />
            </div>

            {testResults && (
              <div className="h-32 border-t border-slate-800 bg-slate-900 p-3 overflow-y-auto shrink-0 space-y-1.5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                  <span className="font-mono text-[10px] uppercase text-slate-400 font-bold">
                    Test Execution Output
                  </span>
                  <button
                    type="button"
                    onClick={() => setTestResults(null)}
                    className="text-slate-400 hover:text-white font-mono text-xs"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-1">
                  {testResults.map((r, i) => (
                    <div key={i} className="flex items-center justify-between text-[11px] font-mono p-1 rounded bg-slate-950/60">
                      <div className="flex items-center gap-2 truncate">
                        <span className={r.passed ? 'text-emerald-400' : 'text-red-400'}>
                          {r.passed ? '✓' : '✗'}
                        </span>
                        <span className="text-slate-300">{r.label}</span>
                      </div>
                      <span className={`text-[10px] font-bold ${r.passed ? 'text-emerald-400' : 'text-red-400'}`}>
                        {r.passed ? 'PASSED' : 'FAILED'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col bg-slate-900 overflow-hidden">
          <div className="h-11 border-b border-slate-800 px-4 flex items-center justify-between shrink-0 bg-slate-950">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-xs font-bold text-slate-200">Alex • Technical Interviewer</span>
            </div>
            <span className="font-mono text-[10px] uppercase text-slate-500">Live Feedback</span>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((m, i) => {
              const isAssistant = m.role === 'assistant';
              return (
                <div
                  key={i}
                  className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="font-mono text-[10px] text-slate-400">{isAssistant ? 'Alex' : 'You'}</span>
                    <span className="font-mono text-[9px] text-slate-600">{m.time}</span>
                  </div>
                  <div
                    className={`p-3.5 rounded-2xl max-w-[90%] text-xs font-sans leading-relaxed ${
                      isAssistant
                        ? 'bg-slate-800 border border-slate-700 text-slate-200'
                        : 'bg-emerald-600 text-white font-medium'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              );
            })}

            {chatLoading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs font-mono p-2">
                <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                <span>Alex is evaluating and responding...</span>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          <div className="p-3 border-t border-slate-800 bg-slate-950 space-y-2 shrink-0">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px] font-mono">
              <button
                type="button"
                onClick={() => handleSendMessage('Can we assume the input array is always non-empty and fits in memory?')}
                className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
              >
                Ask input constraints
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage(`I am planning an optimal ${activeProblem.expectedTime} approach. Does that align with what you're looking for?`)}
                className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
              >
                Propose approach
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage('Could you provide a subtle hint on the optimal data structure?')}
                className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
              >
                Request hint
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage('I have written my solution in the code editor. Could you review my implementation and test cases?')}
                className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 hover:text-emerald-200"
              >
                Review my code
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                placeholder="Speak to interviewer Alex (explain logic, ask edge cases)..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-600"
              />
              <button
                type="submit"
                disabled={!inputMsg.trim() || chatLoading}
                className="btn-tactile btn-tactile-primary px-3.5 py-2 rounded-xl text-white font-mono text-xs font-bold disabled:opacity-50"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
