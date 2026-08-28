'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

const CONCEPTS = [
  'Hash Map',
  'Sliding Window',
  'Two Pointers',
  'Binary Search',
  'Recursion',
  'Dynamic Programming',
  'BFS (Breadth-First Search)',
  'DFS (Depth-First Search)',
  'Stack',
  'Linked List',
  'Binary Tree',
  'Big O Notation',
  'Memoization',
  'Greedy Algorithm',
];

export default function TeachPage() {
  const [concept, setConcept]   = useState('');
  const [input, setInput]       = useState('');
  const [history, setHistory]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [token, setToken]       = useState(null);
  const [totalScore, setTotal]  = useState(0);
  const [turns, setTurns]       = useState(0);
  const bottomRef               = useRef(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setToken(data?.session?.access_token || null));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  async function handleSend() {
    if (!input.trim() || !concept || loading) return;
    const userMsg = input.trim();
    setInput('');
    setLoading(true);

    const newHistory = [...history, { role: 'user', content: userMsg }];
    setHistory(newHistory);

    try {
      const res = await fetch('/api/ai/teach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ concept, explanation: userMsg, history }),
      });
      const data = await res.json();
      if (data.reply) {
        setHistory(prev => [...prev, { role: 'assistant', content: data.reply }]);
        if (data.score !== null) {
          setTotal(prev => prev + data.score);
          setTurns(prev => prev + 1);
        }
      }
    } catch {
      setHistory(prev => [...prev, { role: 'assistant', content: 'Could not reach AI. Check your connection and try again.' }]);
    } finally {
      setLoading(false);
    }
  }

  const avgScore = turns > 0 ? Math.round(totalScore / turns) : null;

  if (!concept) {
    return (
      <div className="max-w-2xl mx-auto pb-12 px-4">
        <div className="flex items-center gap-3 py-6">
          <Link href="/practice" className="text-slate-400 hover:text-slate-600 transition-colors">
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </Link>
          <div>
            <h1 className="font-sans font-bold text-[18px] text-slate-900">Teach It Back</h1>
            <p className="font-sans text-[13px] text-slate-500 mt-0.5">Pick a concept to explain</p>
          </div>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 mb-6">
          <p className="font-sans text-[14px] text-slate-700 leading-relaxed">
            You'll explain the concept to a junior dev (the AI). They'll ask follow-up questions if your explanation is incomplete or unclear. <strong>The Feynman technique:</strong> if you can't explain it simply, you don't understand it yet.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {CONCEPTS.map(c => (
            <button
              key={c}
              onClick={() => setConcept(c)}
              className="px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-left font-sans text-[14px] font-medium text-slate-700 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-800 transition-all"
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-4 px-4 flex flex-col" style={{ height: 'calc(100vh - 80px)' }}>
      <div className="flex items-center gap-3 py-4 shrink-0">
        <button onClick={() => { setConcept(''); setHistory([]); setInput(''); setTotal(0); setTurns(0); }} className="text-slate-400 hover:text-slate-600 transition-colors">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </button>
        <div className="flex-1">
          <h1 className="font-sans font-bold text-[17px] text-slate-900">Explain: <span className="text-emerald-700">{concept}</span></h1>
          <p className="font-sans text-[12px] text-slate-400">Junior dev is waiting for your explanation</p>
        </div>
        {avgScore !== null && (
          <div className="shrink-0 text-right">
            <p className="font-mono text-[18px] font-bold text-emerald-700">{avgScore}/10</p>
            <p className="font-mono text-[9px] text-slate-400 uppercase tracking-widest">avg score</p>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 py-4 min-h-0">
        {history.length === 0 && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[16px] text-emerald-700">face</span>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 max-w-sm">
              <p className="font-sans text-[14px] text-slate-700">
                Hey! I've been hearing about <strong>{concept}</strong> a lot but I don't really get it. Can you explain it to me?
              </p>
            </div>
          </div>
        )}

        {history.map((msg, i) => (
          <div key={i} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${msg.role === 'user' ? 'bg-slate-800' : 'bg-emerald-100'}`}>
              <span className={`material-symbols-outlined text-[16px] ${msg.role === 'user' ? 'text-white' : 'text-emerald-700'}`}>
                {msg.role === 'user' ? 'person' : 'face'}
              </span>
            </div>
            <div className={`px-4 py-3 rounded-2xl max-w-sm ${msg.role === 'user' ? 'bg-slate-800 text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm'}`}>
              <p className="font-sans text-[14px] leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[16px] text-emerald-700">face</span>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="shrink-0 pt-3 pb-2 border-t border-slate-200">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Explain in your own words... (Enter to send)"
            rows={2}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 font-sans text-[14px] bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-40"
          >
            <span className="material-symbols-outlined text-[20px]">send</span>
          </button>
        </div>
      </div>
    </div>
  );
}
