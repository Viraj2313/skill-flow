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
    <div className="min-h-screen bg-aq-bg">
      <div className="bg-aq-surface border-b border-aq-border sticky top-0 z-40">
        <div className="px-5 pt-5 pb-3">
          <h1 className="font-sans font-bold text-h1 text-aq-text-primary mb-0.5">Global Rankings</h1>
          <p className="font-mono text-[11px] text-aq-text-muted tracking-wide">Season 4 · 3 days remaining</p>
        </div>

        <div className="px-5 pb-3">
          <div className="flex items-center p-3 bg-aq-surface border border-aq-border rounded-card">
            <div className="flex items-center gap-2 flex-1">
              <span className="material-symbols-outlined text-[20px] text-aq-gold filled">diamond</span>
              <div>
                <span className="font-sans font-semibold text-h3 text-aq-text-primary">Problem Solver</span>
                <p className="font-sans text-[12px] text-aq-text-muted">Division</p>
              </div>
            </div>
            <div className="w-px h-10 bg-aq-border mx-3" />
            <div className="flex-1">
              <p className="font-sans text-[12px] text-aq-text-muted">Season Ends In:</p>
              <span className="font-mono font-bold text-[14px] text-aq-primary">03d : 14h : 22m</span>
            </div>
          </div>
        </div>

        <div className="pb-1">
          <FilterPills options={FILTERS} active={filter} onChange={setFilter} />
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
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
