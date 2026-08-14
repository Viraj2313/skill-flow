'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MOCK_PROBLEMS } from '@/lib/mock-data';
import { DifficultyDot, DifficultyBadge, XPPill } from '@/components/ui';

const POPULAR_TOPICS = ['Array', 'String', 'DP', 'Graph', 'Tree', 'Sorting', 'Binary Search', 'Sliding Window', 'Recursion'];
const RECENT_SEARCHES = ['two sum', 'binary search', 'merge sort'];

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [recent, setRecent] = useState(RECENT_SEARCHES);

  const results = query.length > 0
    ? MOCK_PROBLEMS.filter(p =>
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.difficulty.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const removeRecent = (term) => setRecent(recent.filter(r => r !== term));

  return (
    <div className="min-h-screen bg-aq-bg flex flex-col">
      <div className="bg-aq-surface border-b border-aq-border sticky top-0 z-40">
        <div className="flex items-center gap-3 px-4 h-14">
          <button onClick={() => router.back()} className="text-aq-text-muted flex-shrink-0">
            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
          </button>
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search problems, topics..."
            className="flex-1 h-10 px-4 bg-aq-surface-sunken border border-aq-border rounded-input font-sans text-body text-aq-text-primary placeholder:text-aq-text-muted focus:border-aq-border-strong transition-colors"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="font-sans text-[13px] text-aq-text-muted hover:text-aq-text-secondary flex-shrink-0 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 px-5 py-4 w-full">
        {query.length === 0 ? (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[10px] font-semibold tracking-widest uppercase text-aq-text-muted">RECENT</span>
                {recent.length > 0 && (
                  <button onClick={() => setRecent([])} className="font-sans text-[12px] text-aq-text-muted hover:text-aq-text-secondary transition-colors">Clear</button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {recent.map((term) => (
                  <div key={term} className="flex items-center gap-1.5 px-3 py-1.5 bg-aq-surface-raised border border-aq-border rounded-pill">
                    <button onClick={() => setQuery(term)} className="font-sans text-[13px] text-aq-text-secondary">{term}</button>
                    <button onClick={() => removeRecent(term)} className="text-aq-text-muted hover:text-aq-text-secondary">
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <span className="font-mono text-[10px] font-semibold tracking-widest uppercase text-aq-text-muted block mb-3">POPULAR TOPICS</span>
              <div className="flex flex-wrap gap-2">
                {POPULAR_TOPICS.map((topic) => (
                  <button
                    key={topic}
                    onClick={() => setQuery(topic)}
                    className="px-3 py-1.5 bg-aq-surface-raised border border-aq-border rounded-pill font-sans text-[13px] text-aq-text-secondary hover:bg-aq-surface-sunken transition-colors"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <p className="font-mono text-[11px] text-aq-text-muted tracking-widest mb-3">{results.length} problems found</p>
            <div className="flex flex-col">
              {results.map((problem) => (
                <button
                  key={problem.id}
                  onClick={() => router.push(`/editor/${problem.slug}`)}
                  className="flex items-center justify-between py-4 border-b border-aq-border hover:bg-aq-surface-raised transition-colors text-left w-full"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <DifficultyDot difficulty={problem.difficulty} />
                    <div className="flex-1 min-w-0">
                      <p className="font-sans font-semibold text-[15px] text-aq-text-primary truncate">{problem.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <DifficultyBadge difficulty={problem.difficulty} />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 ml-3 flex-shrink-0">
                    <XPPill xp={problem.xp_reward} />
                    {problem.solved && (
                      <span className="material-symbols-outlined text-[18px] text-aq-success filled">check_circle</span>
                    )}
                  </div>
                </button>
              ))}
              {results.length === 0 && (
                <div className="flex flex-col items-center gap-2 py-16 text-center">
                  <span className="material-symbols-outlined text-[48px] text-aq-border">search_off</span>
                  <p className="font-sans text-body text-aq-text-muted">No problems found for &quot;{query}&quot;</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
