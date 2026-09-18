'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAhaJournal, markAhaReviewed } from '@/lib/db';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const d = Math.floor(diff / 86400000);
  const h = Math.floor(diff / 3600000);
  const m = Math.floor(diff / 60000);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  if (m > 0) return `${m}m ago`;
  return 'just now';
}

function isOldEnoughForReview(dateStr) {
  return Date.now() - new Date(dateStr).getTime() > 3 * 86400000;
}

export default function JournalPage() {
  const [entries, setEntries]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState('all');
  const [reviewed, setReviewed] = useState(new Set());

  useEffect(() => {
    getAhaJournal({ limit: 100 }).then(data => {
      setEntries(data || []);
      setLoading(false);
    });
  }, []);

  async function handleReviewed(id) {
    setReviewed(prev => new Set([...prev, id]));
    await markAhaReviewed(id).catch(() => {});
  }

  const forReview = entries.filter(
    e => !e.reviewed && !reviewed.has(e.id) && isOldEnoughForReview(e.created_at)
  );
  const displayed = tab === 'review' ? forReview : entries;

  return (
    <div className="max-w-2xl mx-auto pb-20 px-4">
      <div className="py-6 border-b border-slate-200/80 mb-6">
        <p className="font-mono text-[10px] font-semibold tracking-widest uppercase text-slate-400">Learning Log</p>
        <h1 className="font-sans font-bold text-[24px] text-slate-900 mt-0.5 mb-1">Aha Journal</h1>
        <p className="font-sans text-[14px] text-slate-500">
          The moments that clicked. Revisit them to lock in the memory.
        </p>

        <div className="flex items-center gap-3 mt-4">
          <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
            {['all', 'review'].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="px-3 py-1.5 rounded-lg font-mono text-[10px] font-bold tracking-widest uppercase transition-all"
                style={{
                  background: tab === t ? 'white' : 'transparent',
                  color:      tab === t ? '#374151' : '#94a3b8',
                  boxShadow:  tab === t ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                {t === 'all' ? `All (${entries.length})` : `Ready to Review (${forReview.length})`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-20">
          <span className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
        </div>
      )}

      {!loading && displayed.length === 0 && (
        <div className="text-center py-20">
          {tab === 'review' ? (
            <>
              <p className="text-[40px] mb-3">🎉</p>
              <p className="font-sans font-semibold text-[16px] text-slate-700 mb-1">All caught up!</p>
              <p className="font-sans text-[14px] text-slate-400">Entries become reviewable 3 days after writing them.</p>
            </>
          ) : (
            <>
              <p className="text-[40px] mb-3">📓</p>
              <p className="font-sans font-semibold text-[16px] text-slate-700 mb-1">No entries yet</p>
              <p className="font-sans text-[14px] text-slate-400 mb-6">
                After completing a lesson, write what clicked. It'll appear here.
              </p>
              <Link
                href="/skills"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-[11px] font-bold tracking-widest uppercase text-white"
                style={{ background: 'linear-gradient(135deg,#059669,#10b981)' }}
              >
                <span className="material-symbols-outlined text-[16px]">school</span>
                Start a lesson
              </Link>
            </>
          )}
        </div>
      )}

      {!loading && displayed.length > 0 && (
        <div className="space-y-4">
          {tab === 'review' && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 mb-2">
              <span className="material-symbols-outlined text-[18px] text-amber-600 shrink-0 mt-0.5">lightbulb</span>
              <div>
                <p className="font-sans font-semibold text-[14px] text-amber-900">Spaced retrieval time</p>
                <p className="font-sans text-[13px] text-amber-700">These entries are 3+ days old. Before reading your note, try to recall what you wrote first.</p>
              </div>
            </div>
          )}

          {displayed.map(entry => {
            const isDone = entry.reviewed || reviewed.has(entry.id);
            const needsReview = !isDone && isOldEnoughForReview(entry.created_at);
            return (
              <div
                key={entry.id}
                className="p-5 rounded-2xl border-2 bg-white transition-all"
                style={{ borderColor: isDone ? '#d1fae5' : needsReview ? '#fde68a' : '#e2e8f0' }}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {needsReview && (
                        <span className="font-mono text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                          Ready to review
                        </span>
                      )}
                      {isDone && (
                        <span className="font-mono text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                          ✓ Reviewed
                        </span>
                      )}
                    </div>
                    <p className="font-sans font-bold text-[15px] text-slate-900 mt-1">
                      {entry.lesson_title || 'Lesson'}
                    </p>
                    <p className="font-mono text-[10px] text-slate-400 mt-0.5">{timeAgo(entry.created_at)}</p>
                  </div>
                </div>

                <blockquote className="relative pl-4 border-l-4 border-emerald-300">
                  <p className="font-sans text-[15px] text-slate-700 leading-relaxed italic">
                    "{entry.note}"
                  </p>
                </blockquote>

                {needsReview && !reviewed.has(entry.id) && (
                  <button
                    onClick={() => handleReviewed(entry.id)}
                    className="mt-4 w-full py-2.5 rounded-xl font-mono text-[10px] font-bold tracking-widest uppercase border-2 border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                  >
                    I still understand this ✓
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
