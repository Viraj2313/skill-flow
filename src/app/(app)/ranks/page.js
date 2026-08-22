'use client';

import { useEffect, useState } from 'react';
import { getLeaderboard } from '@/lib/db';
import { supabase } from '@/lib/supabase';
import { FilterPills } from '@/components/ui';

const FILTERS = ['GLOBAL', 'WEEKLY', 'FRIENDS'];

export default function RanksPage() {
  const [filter, setFilter] = useState('GLOBAL');
  const [leaderboard, setLeaderboard] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      setUserId(user.id);
      const entries = await getLeaderboard(50);
      setLeaderboard(entries);
    });
  }, []);

  const displayList = filter === 'FRIENDS'
    ? leaderboard.filter((entry) => entry.id === userId)
    : leaderboard;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="font-sans font-bold text-[24px] sm:text-[28px] text-slate-900 tracking-tight">Global Rankings</h1>
          <p className="font-sans text-[14px] text-slate-500 mt-1">Compete with engineers worldwide • Season 4</p>
        </div>
        <FilterPills options={FILTERS} active={filter} onChange={setFilter} />
      </div>

      <div className="max-w-3xl">
        <div className="mb-6 p-4 bg-white border border-slate-200 rounded-xl card-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <span className="material-symbols-outlined text-[22px] filled">diamond</span>
            </div>
            <div>
              <span className="font-sans font-bold text-[16px] text-slate-900">Problem Solver</span>
              <p className="font-sans text-[12px] text-slate-500">Current Division</p>
            </div>
          </div>
          <div className="flex items-center gap-2 font-mono text-[13px] text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
            <span className="text-slate-400">Ends in:</span>
            <span className="font-bold text-emerald-700">03d : 14h : 22m</span>
          </div>
        </div>
        {displayList.map((entry, idx) => {
          const isUser = entry.id === userId;
          const rank = entry.rank_position || idx + 1;
          const accentColors = ['bg-aq-gold', 'bg-gray-400', 'bg-amber-600'];
          return (
            <div
              key={entry.id}
              className={`flex items-center px-5 py-3 border-b border-aq-border ${
                isUser ? 'bg-aq-primary-dim border-l-[3px] border-l-aq-primary' : 'hover:bg-aq-surface-raised'
              } transition-colors`}
            >
              <div className={`w-8 flex-shrink-0 relative`}>
                {idx < 3 && <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-8 rounded-r ${accentColors[idx]}`} />}
                <span className={`font-mono font-bold text-[14px] ml-2 ${
                  rank === 1 ? 'text-aq-gold' :
                  rank <= 3 ? 'text-aq-text-secondary' :
                  isUser ? 'text-aq-primary' : 'text-aq-text-muted'
                }`}>{rank}</span>
              </div>

              <div className="flex items-center gap-2.5 flex-1 min-w-0 ml-3">
                <div className="w-9 h-9 rounded-full bg-aq-surface-raised border border-aq-border flex items-center justify-center flex-shrink-0">
                  <span className={`font-sans font-bold text-[14px] ${isUser ? 'text-aq-primary' : 'text-aq-text-secondary'}`}>
                    {(entry.display_name || entry.username || '?')[0]}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className={`font-sans font-bold text-[14px] truncate ${isUser ? 'text-aq-primary' : 'text-aq-text-primary'}`}>
                    {entry.display_name || entry.username}{isUser && <span className="font-normal opacity-70"> (You)</span>}
                  </p>
                  <p className="font-mono text-[10px] text-aq-text-muted">Problem Solver</p>
                </div>
              </div>

              <span className="font-mono text-[13px] text-aq-text-secondary w-20 text-right flex-shrink-0">
                {entry.xp.toLocaleString()}
              </span>

              {!isUser ? (
                <button className="ml-3 px-3 py-1 border border-aq-border rounded-pill font-mono text-[10px] text-aq-text-secondary hover:bg-aq-surface-raised transition-colors flex-shrink-0">
                  DUEL
                </button>
              ) : (
                <span className="ml-3 font-mono text-[12px] text-aq-text-muted w-10 flex-shrink-0">---</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
