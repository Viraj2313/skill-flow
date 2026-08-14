'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, useParams } from 'next/navigation';
import { MOCK_PROBLEMS } from '@/lib/mock-data';
import { DifficultyBadge } from '@/components/ui';
import BottomSheet from '@/components/BottomSheet';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

const BOILERPLATE = {
  python: `def solution(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`,
  javascript: `function solution(nums, target) {
    const seen = {};
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (complement in seen) return [seen[complement], i];
        seen[nums[i]] = i;
    }
    return [];
}`,
  java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> seen = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (seen.containsKey(complement)) {
                return new int[]{seen.get(complement), i};
            }
            seen.put(nums[i], i);
        }
        return new int[]{};
    }
}`,
};

const KEYBOARD_SHORTCUTS = ['Tab', '{', '}', '(', ')', '[', ']', ';', '//', '=', '+', '-', '*', '/'];

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug;

  const problem = MOCK_PROBLEMS.find(p => p.slug === slug) || MOCK_PROBLEMS[0];

  const [activeTab, setActiveTab] = useState('PROBLEM');
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState(BOILERPLATE.python);
  const [hintUsed, setHintUsed] = useState([false, false, false]);
  const [revealedHint, setRevealedHint] = useState(null);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [showAIReview, setShowAIReview] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiReady, setAiReady] = useState(false);
  const [showXP, setShowXP] = useState(false);
  const [showRankUp, setShowRankUp] = useState(false);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setCode(BOILERPLATE[lang] || BOILERPLATE.python);
  };

  const handleRun = () => {
    setRunning(true);
    setTimeout(() => setRunning(false), 1500);
  };

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      const accepted = Math.random() > 0.35;
      setResult(accepted ? 'accepted' : 'failed');
      if (accepted) {
        setShowXP(true);
        setTimeout(() => setShowXP(false), 1600);
      }
    }, 1800);
  };

  const handleHint = (idx) => {
    const updated = [...hintUsed];
    updated[idx] = true;
    setHintUsed(updated);
    setRevealedHint(idx);
  };

  const openAIReview = () => {
    setShowAIReview(true);
    setAiLoading(true);
    setAiReady(false);
    setTimeout(() => { setAiLoading(false); setAiReady(true); }, 2000);
  };

  if (result) {
    const accepted = result === 'accepted';
    return (
      <div className="dark-bg min-h-screen flex flex-col items-center justify-center p-5 relative">
        {showXP && (
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 pointer-events-none z-50 animate-xp-rise">
            <span className="font-mono font-bold text-[40px] text-aq-gold">+75 XP</span>
          </div>
        )}

        <div className="flex flex-col items-center gap-4 w-full max-w-sm">
          {accepted ? (
            <svg width="80" height="80" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="36" fill="none" stroke="#3d7a42" strokeWidth="4" />
              <path
                d="M 24 40 L 36 52 L 56 28"
                fill="none"
                stroke="#3d7a42"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="draw-check-anim"
                strokeDasharray="100"
                strokeDashoffset="100"
              />
            </svg>
          ) : (
            <span className="material-symbols-outlined text-[80px] text-aq-error animate-fade-in-scale filled">cancel</span>
          )}

          <h1 className={`font-mono font-bold text-[28px] tracking-widest uppercase ${accepted ? 'text-aq-success' : 'text-aq-error'}`}>
            {accepted ? 'ACCEPTED' : 'WRONG ANSWER'}
          </h1>
          <div className={`w-16 h-px ${accepted ? 'bg-aq-success' : 'bg-aq-error'}`} />

          <div className="grid grid-cols-2 gap-3 w-full mt-2">
            {accepted ? (
              <>
                <div className="bg-aq-surface border border-aq-border rounded-card p-3 text-center">
                  <p className="font-mono text-[10px] text-aq-text-muted uppercase tracking-widest mb-1">Runtime</p>
                  <span className="font-mono font-bold text-[20px] text-aq-text-primary">124 ms</span>
                </div>
                <div className="bg-aq-surface border border-aq-border rounded-card p-3 text-center">
                  <p className="font-mono text-[10px] text-aq-text-muted uppercase tracking-widest mb-1">Memory</p>
                  <span className="font-mono font-bold text-[20px] text-aq-text-primary">18.4 MB</span>
                </div>
                <div className="bg-aq-surface border border-aq-border rounded-card p-3 text-center">
                  <p className="font-mono text-[10px] text-aq-text-muted uppercase tracking-widest mb-1">Tests Passed</p>
                  <span className="font-mono font-bold text-[20px] text-aq-success">12 / 12</span>
                </div>
                <div className="bg-aq-surface border border-aq-border rounded-card p-3 text-center">
                  <p className="font-mono text-[10px] text-aq-text-muted uppercase tracking-widest mb-1">XP Earned</p>
                  <span className="font-mono font-bold text-[20px] text-aq-gold">⚡ +75</span>
                </div>
              </>
            ) : (
              <div className="col-span-2 bg-aq-surface-raised border-l-[3px] border-aq-error rounded-r-card p-4 font-mono text-[13px] text-aq-text-secondary">
                <div className="flex flex-col gap-1">
                  <span><span className="text-aq-text-muted">Input:    </span>[1, 2, 3]</span>
                  <span><span className="text-aq-text-muted">Expected: </span>6</span>
                  <span><span className="text-aq-text-muted">Got:      </span>5</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 w-full mt-2">
            {accepted ? (
              <>
                <button
                  onClick={openAIReview}
                  className="w-full py-3 border border-aq-primary text-aq-primary font-mono text-[12px] font-semibold tracking-widest uppercase rounded-input hover:bg-aq-primary-dim transition-colors"
                >
                  VIEW AI REVIEW
                </button>
                <button onClick={() => { setResult(null); router.push('/skills'); }} className="font-sans text-[13px] text-aq-text-muted hover:text-aq-text-secondary text-center transition-colors">
                  BACK TO PROBLEMS
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setResult(null)}
                  className="w-full py-3.5 bg-aq-primary text-white font-mono text-[13px] font-semibold tracking-widest uppercase rounded-input active:scale-[0.98] transition-transform"
                >
                  TRY AGAIN
                </button>
                <button
                  onClick={() => { setResult(null); setHintUsed([true, false, false]); setRevealedHint(0); setActiveTab('PROBLEM'); }}
                  className="w-full py-2.5 border border-aq-primary text-aq-primary font-mono text-[12px] font-semibold tracking-widest uppercase rounded-input hover:bg-aq-primary-dim transition-colors"
                >
                  GET HINT
                </button>
              </>
            )}
          </div>
        </div>

        <BottomSheet isOpen={showAIReview} onClose={() => setShowAIReview(false)} title="AI CODE REVIEW" icon="smart_toy" height="85vh">
          <div className="p-5">
            {aiLoading ? (
              <div className="flex flex-col items-center gap-3 py-12">
                <span className="w-8 h-8 border-2 border-aq-primary border-t-transparent rounded-full animate-spin" />
                <p className="font-sans text-[14px] text-aq-text-muted">Analyzing your solution...</p>
              </div>
            ) : aiReady ? (
              <div className="flex flex-col gap-5">
                <p className="font-sans text-body text-aq-text-secondary leading-relaxed">
                  Your solution uses a hash map approach which achieves O(n) time complexity — excellent choice. The code is clean and readable. Consider edge cases like empty arrays for production use.
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-aq-surface-raised border border-aq-border rounded-card p-3 text-center">
                    <p className="font-mono text-[9px] text-aq-text-muted uppercase tracking-widest mb-1">TIME COMPLEXITY</p>
                    <span className="font-mono font-bold text-[16px] text-aq-primary">O(n)</span>
                  </div>
                  <div className="bg-aq-surface-raised border border-aq-border rounded-card p-3 text-center">
                    <p className="font-mono text-[9px] text-aq-text-muted uppercase tracking-widest mb-1">SPACE COMPLEXITY</p>
                    <span className="font-mono font-bold text-[16px] text-aq-primary">O(n)</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 mb-3">
                    <span className="font-mono text-[10px] font-semibold tracking-widest uppercase text-aq-text-muted">SUGGESTIONS</span>
                    <span className="material-symbols-outlined text-[14px] text-aq-text-muted">lightbulb</span>
                  </div>
                  <div className="flex flex-col gap-3">
                    {[
                      'Add input validation for null or empty arrays.',
                      'The variable name "seen" is intuitive — good naming.',
                      'Consider using enumerate() over range(len()) — more Pythonic.',
                    ].map((sug, i) => (
                      <div key={i} className="flex gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-aq-primary-dim text-aq-primary font-mono text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                        <p className="font-sans text-[14px] text-aq-text-secondary">{sug}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-aq-code-bg border border-aq-border rounded-card p-3 overflow-x-auto">
                  <pre className="font-mono text-[12px] text-aq-text-primary whitespace-pre">
{`seen = {}
for i, num in enumerate(nums):
    if (diff := target - num) in seen:
        return [seen[diff], i]
    seen[num] = i`}
                  </pre>
                </div>

                <button
                  onClick={() => setShowAIReview(false)}
                  className="w-full py-2.5 border border-aq-border text-aq-text-secondary font-mono text-[12px] font-semibold tracking-widest uppercase rounded-input hover:bg-aq-surface-raised transition-colors"
                >
                  CLOSE
                </button>
              </div>
            ) : null}
          </div>
        </BottomSheet>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-aq-bg overflow-hidden">
      <header className="bg-aq-surface border-b border-aq-border h-12 flex items-center justify-between px-4 flex-shrink-0">
        <button onClick={() => router.back()} className="text-aq-text-secondary">
          <span className="material-symbols-outlined text-[22px]">arrow_back</span>
        </button>
        <h1 className="font-sans font-semibold text-[15px] text-aq-text-primary truncate mx-3 flex-1 text-center">{problem.title}</h1>
        <DifficultyBadge difficulty={problem.difficulty} />
      </header>

      <div className="flex bg-aq-surface-raised border-b border-aq-border flex-shrink-0">
        {['PROBLEM', 'CODE'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 font-mono text-[12px] font-semibold tracking-widest uppercase transition-colors ${
              activeTab === tab ? 'text-aq-primary border-b-2 border-aq-primary bg-aq-surface' : 'text-aq-text-muted'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'PROBLEM' ? (
        <div className="flex-1 overflow-y-auto flex flex-col">
          <div className="flex-1 px-5 py-4 space-y-4">
            <p className="font-sans text-body text-aq-text-secondary leading-relaxed">{problem.description}</p>

            {problem.examples.map((ex, i) => (
              <div key={i} className="bg-aq-surface-raised border border-aq-border rounded-input p-3">
                <p className="font-mono text-[10px] text-aq-text-muted uppercase tracking-widest mb-2">Example {i + 1}</p>
                <div className="font-mono text-code text-aq-text-primary space-y-1">
                  <div><span className="text-aq-text-muted">Input:  </span>{ex.input}</div>
                  <div><span className="text-aq-text-muted">Output: </span>{ex.output}</div>
                  {ex.explanation && <div><span className="text-aq-text-muted">Expl:   </span>{ex.explanation}</div>}
                </div>
              </div>
            ))}

            <div className="bg-aq-surface-raised border border-aq-border rounded-input p-3">
              <p className="font-mono text-[10px] text-aq-text-muted uppercase tracking-widest mb-2">Constraints</p>
              <ul className="space-y-1">
                {problem.constraints.map((c, i) => (
                  <li key={i} className="font-mono text-code text-aq-text-muted">• {c}</li>
                ))}
              </ul>
            </div>

            <div className="flex items-center gap-4 text-aq-text-muted">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">timer</span>
                <span className="font-mono text-[12px]">{problem.time_limit_ms}ms</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">memory</span>
                <span className="font-mono text-[12px]">{problem.memory_limit_mb}MB</span>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0">
            {revealedHint !== null && (
              <div className="mx-4 mb-3 bg-aq-surface-raised border-l-[3px] border-aq-gold rounded-r-card p-3">
                <p className="font-mono text-[9px] text-aq-gold uppercase tracking-widest mb-1">HINT {revealedHint + 1} (-10% XP)</p>
                <p className="font-sans text-[13px] text-aq-text-secondary">{problem.hints[revealedHint]}</p>
              </div>
            )}
            <div className="flex border-t border-aq-border bg-aq-surface">
              {problem.hints.map((_, i) => (
                <button
                  key={i}
                  onClick={() => handleHint(i)}
                  disabled={hintUsed[i]}
                  className={`flex-1 py-3 font-sans text-[13px] border-r border-aq-border last:border-r-0 transition-all ${
                    hintUsed[i] ? 'text-aq-text-muted opacity-40 cursor-default' : 'text-aq-text-secondary hover:bg-aq-surface-raised'
                  }`}
                >
                  💡 Hint {i + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-aq-surface-raised border-b border-aq-border flex-shrink-0">
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="font-mono text-[13px] text-aq-text-secondary bg-transparent border-none cursor-pointer"
            >
              <option value="python">Python ▾</option>
              <option value="javascript">JavaScript ▾</option>
              <option value="java">Java ▾</option>
            </select>
            <span className="font-mono text-[12px] text-aq-text-muted">solution.{language === 'javascript' ? 'js' : language === 'java' ? 'java' : 'py'}</span>
          </div>

          <div className="flex-1 overflow-hidden">
            <MonacoEditor
              height="100%"
              language={language}
              value={code}
              onChange={(v) => setCode(v || '')}
              theme="vs-light"
              options={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 13,
                lineHeight: 20,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: 'off',
                lineNumbers: 'on',
                glyphMargin: false,
                folding: false,
                lineDecorationsWidth: 0,
                lineNumbersMinChars: 3,
                padding: { top: 12, bottom: 12 },
                automaticLayout: true,
              }}
            />
          </div>

          <div className="flex-shrink-0 overflow-x-auto scrollbar-hide border-t border-aq-border bg-aq-surface">
            <div className="flex gap-1.5 p-2 min-w-max">
              {KEYBOARD_SHORTCUTS.map((key) => (
                <button
                  key={key}
                  className="w-9 h-9 flex-shrink-0 bg-aq-surface-raised border border-aq-border rounded-pill font-mono text-[11px] text-aq-text-secondary hover:bg-aq-surface-sunken transition-colors"
                >
                  {key}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between px-4 py-2 bg-aq-surface border-t border-aq-border flex-shrink-0">
            <span className="font-mono text-[12px] text-aq-text-muted">3/5 passed</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRun}
                disabled={running}
                className="px-5 h-10 border border-aq-border rounded-input font-mono text-[12px] text-aq-text-secondary hover:bg-aq-surface-raised transition-colors disabled:opacity-60 flex items-center gap-1.5"
              >
                {running ? <span className="w-3.5 h-3.5 border-2 border-aq-text-secondary border-t-transparent rounded-full animate-spin" /> : null}
                RUN
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-5 h-10 bg-aq-primary text-white rounded-input font-mono text-[12px] font-semibold tracking-widest uppercase hover:bg-aq-primary-hover transition-colors disabled:opacity-60 flex items-center gap-1.5"
              >
                {submitting ? <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
                SUBMIT
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={openAIReview}
        className="fixed bottom-24 right-4 w-12 h-12 rounded-full bg-aq-surface border border-aq-border paper-shadow flex items-center justify-center text-aq-text-secondary hover:bg-aq-surface-raised transition-colors z-40"
      >
        <span className="material-symbols-outlined text-[22px]">smart_toy</span>
      </button>

      <BottomSheet isOpen={showAIReview} onClose={() => setShowAIReview(false)} title="AI CODE REVIEW" icon="smart_toy" height="85vh">
        <div className="p-5">
          {aiLoading ? (
            <div className="flex flex-col items-center gap-3 py-12">
              <span className="w-8 h-8 border-2 border-aq-primary border-t-transparent rounded-full animate-spin" />
              <p className="font-sans text-[14px] text-aq-text-muted">Analyzing your solution...</p>
            </div>
          ) : aiReady ? (
            <div className="flex flex-col gap-5">
              <p className="font-sans text-body text-aq-text-secondary leading-relaxed">
                Your solution uses a hash map approach which achieves O(n) time complexity — excellent choice. The code is clean and readable. A few suggestions to make it even more robust.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-aq-surface-raised border border-aq-border rounded-card p-3 text-center">
                  <p className="font-mono text-[9px] text-aq-text-muted uppercase tracking-widest mb-1">TIME</p>
                  <span className="font-mono font-bold text-[18px] text-aq-primary">O(n)</span>
                </div>
                <div className="bg-aq-surface-raised border border-aq-border rounded-card p-3 text-center">
                  <p className="font-mono text-[9px] text-aq-text-muted uppercase tracking-widest mb-1">SPACE</p>
                  <span className="font-mono font-bold text-[18px] text-aq-primary">O(n)</span>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-3">
                  <span className="font-mono text-[10px] font-semibold tracking-widest uppercase text-aq-text-muted">SUGGESTIONS</span>
                  <span className="material-symbols-outlined text-[14px] text-aq-text-muted">lightbulb</span>
                </div>
                {['Add input validation.', 'Use enumerate() over range(len()).', 'Consider walrus operator for conciseness.'].map((s, i) => (
                  <div key={i} className="flex gap-2.5 mb-2">
                    <span className="w-5 h-5 rounded-full bg-aq-primary-dim text-aq-primary font-mono text-[11px] font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                    <p className="font-sans text-[14px] text-aq-text-secondary">{s}</p>
                  </div>
                ))}
              </div>
              <button onClick={() => setShowAIReview(false)} className="w-full py-2.5 border border-aq-border text-aq-text-secondary font-mono text-[12px] tracking-widest uppercase rounded-input hover:bg-aq-surface-raised transition-colors">
                CLOSE
              </button>
            </div>
          ) : null}
        </div>
      </BottomSheet>
    </div>
  );
}
