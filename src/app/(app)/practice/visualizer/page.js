'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ALGORITHMS } from '@/data/algorithmFrames';

const ANIM_CSS = `
@keyframes aq-bounce {
  0%   { transform: scaleY(1.0) scaleX(1.0); }
  20%  { transform: scaleY(1.18) scaleX(0.92); }
  40%  { transform: scaleY(0.94) scaleX(1.05); }
  60%  { transform: scaleY(1.08) scaleX(0.97); }
  80%  { transform: scaleY(0.98) scaleX(1.01); }
  100% { transform: scaleY(1.0) scaleX(1.0); }
}
@keyframes aq-pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.75; }
}
@keyframes aq-glow {
  0%, 100% { box-shadow: 0 0 8px 2px var(--glow-c, #f59e0b66); }
  50%       { box-shadow: 0 0 18px 6px var(--glow-c, #f59e0b40), 0 0 40px 10px var(--glow-c, #f59e0b20); }
}
@keyframes aq-slide-down {
  from { transform: translateY(-32px); opacity: 0; }
  to   { transform: translateY(0);     opacity: 1; }
}
@keyframes aq-fade-in {
  from { opacity: 0; transform: scale(0.88); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes aq-ripple {
  0%   { transform: scale(0.9); opacity: 0.9; }
  100% { transform: scale(2.2); opacity: 0; }
}
.aq-bounce      { animation: aq-bounce 0.55s cubic-bezier(.36,.07,.19,.97) both; }
.aq-pulse       { animation: aq-pulse 1.2s ease-in-out infinite; }
.aq-glow        { animation: aq-glow  1.4s ease-in-out infinite; }
.aq-slide-down  { animation: aq-slide-down 0.3s ease both; }
.aq-fade-in     { animation: aq-fade-in 0.25s ease both; }
`;

const BAR_GRADIENTS = {
  active:     ['#60a5fa', '#2563eb'],
  mid:        ['#fbbf24', '#d97706'],
  found:      ['#34d399', '#059669'],
  window:     ['#a78bfa', '#7c3aed'],
  current:    ['#fbbf24', '#d97706'],
  reversed:   ['#34d399', '#059669'],
  normal:     ['#94a3b8', '#64748b'],
  eliminated: ['#334155', '#1e293b'],
  comparing:  ['#fbbf24', '#d97706'],
  sorted:     ['#34d399', '#059669'],
};

const BAR_GLOW = {
  mid:     '#fbbf24',
  found:   '#34d399',
  window:  '#a78bfa',
  current: '#fbbf24',
};

const POINTER_COLORS = {
  l: '#60a5fa', left: '#60a5fa',
  r: '#f87171', right: '#f87171',
  mid: '#fbbf24',
  slow: '#a78bfa', fast: '#f472b6',
  i: '#34d399', j: '#fb923c',
};

function ArrayBarRenderer({ frame, animKey }) {
  const vals = frame.elements.map(e => e.v);
  const maxV = Math.max(...vals, 1);
  return (
    <div className="flex items-end gap-1 w-full px-2" style={{ height: 200 }}>
      {frame.elements.map((el, i) => {
        const pct    = Math.max(6, Math.round((el.v / maxV) * 100));
        const [c1, c2] = BAR_GRADIENTS[el.state] || BAR_GRADIENTS.active;
        const glow   = BAR_GLOW[el.state];
        const isHot  = ['mid', 'current', 'found', 'window'].includes(el.state);
        const hasPtr = el.pointers?.length > 0;
        return (
          <div key={`${animKey}-${i}`} className="flex flex-col items-center flex-1" style={{ gap: 2 }}>
            <div className="flex flex-col items-center" style={{ height: 16 }}>
              {(el.pointers || []).map(p => (
                <span
                  key={p}
                  className="font-mono font-black leading-none"
                  style={{ fontSize: 9, color: POINTER_COLORS[p] || '#a78bfa' }}
                >
                  {p}▼
                </span>
              ))}
            </div>
            <div
              className={`w-full rounded-t-md transition-all duration-350 ${el.state === 'found' ? 'aq-bounce' : el.state === 'mid' || el.state === 'current' ? 'aq-glow' : ''}`}
              style={{
                height: `${pct}%`,
                background: `linear-gradient(180deg, ${c1}, ${c2})`,
                boxShadow: glow ? `0 0 10px 2px ${glow}55` : 'none',
                '--glow-c': glow ? `${glow}66` : undefined,
                opacity: el.state === 'eliminated' ? 0.22 : 1,
                transformOrigin: 'bottom',
                borderTop: `2px solid ${c1}`,
              }}
            />
            <span className="font-mono font-bold leading-none" style={{ fontSize: 10, color: el.state === 'eliminated' ? '#475569' : '#e2e8f0' }}>
              {el.v}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function LinkedListRenderer({ frame }) {
  const { nodes, currIdx, prevIdx, reversed } = frame;
  return (
    <div className="flex items-center gap-0 flex-wrap justify-center">
      {nodes.map((v, i) => {
        const isCurr     = i === currIdx;
        const isPrev     = i === prevIdx;
        const isRev      = reversed.includes(i);
        const [c1, c2]   = isRev ? ['#34d399','#059669'] : isCurr ? ['#fbbf24','#d97706'] : ['#60a5fa','#3b82f6'];
        const isNextRev  = reversed.includes(i) && reversed.includes(i + 1);
        return (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <span className="font-mono font-bold" style={{ fontSize: 9, color: isCurr ? '#fbbf24' : isPrev ? '#34d399' : 'transparent', minHeight: 14 }}>
                {isCurr ? 'curr' : isPrev ? 'prev' : '·'}
              </span>
              <div
                className={`flex items-center justify-center font-mono font-bold rounded-xl border-2 transition-all duration-300 ${isCurr ? 'aq-glow' : ''}`}
                style={{
                  width: 48, height: 48, fontSize: 15,
                  background: `linear-gradient(135deg,${c1},${c2})`,
                  borderColor: c1,
                  color: 'white',
                  '--glow-c': `${c1}88`,
                  boxShadow: isCurr ? `0 0 14px ${c1}60` : `0 2px 8px ${c1}30`,
                }}
              >
                {v}
              </div>
            </div>
            {i < nodes.length - 1 && (
              <div className="flex flex-col items-center w-8 mt-5">
                <div className="h-0.5 w-full" style={{ background: isNextRev ? '#34d399' : '#475569' }} />
                <span style={{ fontSize: 11, color: isNextRev ? '#34d399' : '#94a3b8' }}>{isNextRev ? '←' : '→'}</span>
              </div>
            )}
          </div>
        );
      })}
      <div className="flex flex-col items-center ml-2 mt-5">
        <div className="h-0.5 w-4" style={{ background: '#475569' }} />
        <span className="font-mono" style={{ fontSize: 11, color: '#94a3b8' }}>∅</span>
      </div>
    </div>
  );
}

function TreeRenderer({ algo, frame }) {
  const nodes = algo.treeNodes;
  const edges = [];
  nodes.forEach(n => {
    if (n.left  !== null) edges.push([n, nodes[n.left]]);
    if (n.right !== null) edges.push([n, nodes[n.right]]);
  });
  return (
    <svg width="480" height="240" viewBox="0 0 480 240" style={{ overflow: 'visible' }}>
      <defs>
        <filter id="node-glow"><feGaussianBlur stdDeviation="3" result="blur"/><feComposite in="SourceGraphic" in2="blur" operator="over"/></filter>
      </defs>
      {edges.map(([a, b], i) => (
        <line
          key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
          stroke={frame.visitedNodes?.includes(b.id) ? '#34d399' : '#334155'}
          strokeWidth={frame.visitedNodes?.includes(b.id) ? 2.5 : 1.5}
          style={{ transition: 'stroke 0.4s, stroke-width 0.4s' }}
        />
      ))}
      {nodes.map(n => {
        const isActive  = frame.activeNode === n.id;
        const isVisited = frame.visitedNodes?.includes(n.id);
        const [c1, c2]  = isActive ? ['#fbbf24','#d97706'] : isVisited ? ['#34d399','#059669'] : ['#334155','#1e293b'];
        return (
          <g key={n.id}>
            {isActive && <circle cx={n.x} cy={n.y} r={28} fill={`${c1}22`} className="aq-ripple" style={{ animation: 'aq-ripple 1.2s ease-out infinite' }} />}
            <circle
              cx={n.x} cy={n.y} r={22}
              fill={`url(#ng-${n.id})`}
              stroke={c1}
              strokeWidth={isActive ? 3 : 2}
              style={{ transition: 'all 0.35s', filter: isActive ? 'url(#node-glow)' : 'none' }}
            />
            <defs>
              <radialGradient id={`ng-${n.id}`} cx="40%" cy="35%" r="60%">
                <stop offset="0%" stopColor={c1} />
                <stop offset="100%" stopColor={c2} />
              </radialGradient>
            </defs>
            <text x={n.x} y={n.y + 5} textAnchor="middle" fill="white" fontSize="13" fontWeight="700" fontFamily="monospace">{n.val}</text>
          </g>
        );
      })}
    </svg>
  );
}

function GraphRenderer({ algo, frame }) {
  const { graphNodes, graphEdges } = algo;
  const NC = {
    unvisited: ['#1e293b','#334155'],
    active:    ['#fbbf24','#d97706'],
    queued:    ['#60a5fa','#2563eb'],
    visited:   ['#34d399','#059669'],
    current:   ['#fbbf24','#d97706'],
  };
  return (
    <div className="flex flex-col items-center gap-4">
      <svg width="520" height="260" viewBox="0 0 520 260" style={{ overflow: 'visible' }}>
        <defs>
          <filter id="g-glow"><feGaussianBlur stdDeviation="4" result="blur"/><feComposite in="SourceGraphic" in2="blur" operator="over"/></filter>
        </defs>
        {graphEdges.map(([a, b], i) => {
          const na = graphNodes[a], nb = graphNodes[b];
          const bothV = frame.nodeStates[a]==='visited' && frame.nodeStates[b]==='visited';
          return <line key={i} x1={na.x} y1={na.y} x2={nb.x} y2={nb.y} stroke={bothV ? '#34d399' : '#334155'} strokeWidth={bothV ? 2.5 : 1.5} style={{ transition: 'stroke 0.4s' }} />;
        })}
        {graphNodes.map((n, i) => {
          const state = frame.nodeStates[i] || 'unvisited';
          const [c1, c2] = NC[state] || NC.unvisited;
          const isQ = state === 'queued';
          return (
            <g key={n.id}>
              {isQ && <circle cx={n.x} cy={n.y} r={32} fill={`${c1}20`} style={{ animation: 'aq-ripple 1.4s ease-out infinite' }} />}
              <circle cx={n.x} cy={n.y} r={26} fill={`url(#gng-${i})`} stroke={c1} strokeWidth={state==='active'||isQ ? 3 : 2} style={{ transition: 'all 0.35s', filter: isQ ? 'url(#g-glow)' : 'none' }} />
              <defs>
                <radialGradient id={`gng-${i}`} cx="40%" cy="35%" r="60%">
                  <stop offset="0%" stopColor={c1} />
                  <stop offset="100%" stopColor={c2} />
                </radialGradient>
              </defs>
              <text x={n.x} y={n.y + 5} textAnchor="middle" fill="white" fontSize="13" fontWeight="700" fontFamily="monospace">{n.label}</text>
            </g>
          );
        })}
      </svg>
      <div className="flex items-center gap-3 flex-wrap justify-center">
        <span className="font-mono text-[11px] text-slate-400">Queue:</span>
        {frame.queue?.length === 0
          ? <span className="font-mono text-[11px] text-slate-500">empty</span>
          : frame.queue?.map((v, i) => (
            <span key={i} className="font-mono text-[12px] font-bold px-2.5 py-0.5 rounded-lg" style={{ background: '#1e40af22', color: '#60a5fa', border: '1px solid #3b82f640' }}>{v}</span>
          ))
        }
        <span className="font-mono text-[11px] text-slate-500 ml-2">
          visited: [{frame.result?.join(', ')}]
        </span>
      </div>
    </div>
  );
}

function StackRenderer({ frame }) {
  const { stack = [], highlight, operation } = frame;
  const MAX_SHOW = 6;
  const visible = stack.slice(-MAX_SHOW);
  return (
    <div className="flex flex-col items-center" style={{ minHeight: 200 }}>
      {stack.length === 0 ? (
        <div className="flex items-center justify-center" style={{ height: 180 }}>
          <div className="text-center">
            <div className="w-32 h-12 rounded-xl border-2 border-dashed border-slate-600 flex items-center justify-center mb-2">
              <span className="font-mono text-[12px] text-slate-500">empty</span>
            </div>
            <div className="w-36 h-2 rounded-b-lg" style={{ background: '#475569' }} />
          </div>
        </div>
      ) : (
        <div className="flex flex-col-reverse items-center gap-1.5">
          <div className="w-40 h-2.5 rounded-b-lg" style={{ background: 'linear-gradient(90deg,#475569,#64748b,#475569)' }} />
          {visible.map((v, i) => {
            const absIdx = stack.length - visible.length + i;
            const isTop = absIdx === stack.length - 1;
            const isHL  = absIdx === highlight;
            const [c1, c2] = isTop ? ['#fbbf24', '#d97706'] : ['#334155', '#1e293b'];
            return (
              <div
                key={`${v}-${absIdx}`}
                className={`flex items-center justify-between px-4 rounded-xl border-2 font-mono font-bold transition-all duration-300 ${operation === 'push' && isTop ? 'aq-slide-down' : ''} ${isTop ? 'aq-glow' : ''}`}
                style={{
                  width: 144, height: 48,
                  background: `linear-gradient(135deg,${c1},${c2})`,
                  borderColor: isTop ? '#fbbf24' : '#475569',
                  color: 'white',
                  fontSize: 18,
                  '--glow-c': '#fbbf2466',
                  boxShadow: isTop ? '0 0 16px #fbbf2444' : 'none',
                }}
              >
                <span className="opacity-40 text-[10px]">{absIdx}</span>
                <span>{v}</span>
                {isTop && <span className="text-[9px] opacity-70 font-sans uppercase tracking-wider">top</span>}
              </div>
            );
          })}
        </div>
      )}

      {operation && (
        <div className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: '#1e293b', border: '1px solid #334155' }}>
          <span className="material-symbols-outlined text-[14px]" style={{ color: operation === 'push' ? '#34d399' : operation === 'pop' ? '#f87171' : '#fbbf24' }}>
            {operation === 'push' ? 'arrow_downward' : operation === 'pop' ? 'arrow_upward' : 'visibility'}
          </span>
          <span className="font-mono text-[11px] font-bold" style={{ color: operation === 'push' ? '#34d399' : operation === 'pop' ? '#f87171' : '#fbbf24' }}>
            {operation.toUpperCase()}
          </span>
        </div>
      )}
    </div>
  );
}

function QueueRenderer({ frame }) {
  const { queue = [], operation } = frame;
  const isEnq = operation === 'enqueue';
  const isDeq = operation === 'dequeue';

  return (
    <div className="flex flex-col items-center gap-6" style={{ minHeight: 180 }}>
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-1">
          {queue.length > 0 && (
            <div className="flex flex-col items-center gap-1 mr-1">
              <span className="font-mono text-[9px] font-bold text-blue-400">FRONT</span>
              <span className="text-blue-400" style={{ fontSize: 18 }}>▶</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            {queue.length === 0 ? (
              <div className="flex items-center gap-2 px-6 py-4 rounded-2xl border-2 border-dashed border-slate-600">
                <span className="font-mono text-[13px] text-slate-500">empty</span>
              </div>
            ) : (
              queue.map((v, i) => {
                const isFront = i === 0;
                const isBack  = i === queue.length - 1;
                const isNew   = isEnq && isBack;
                return (
                  <div key={`${v}-${i}`} className="flex flex-col items-center gap-1">
                    <div
                      className={`flex items-center justify-center font-mono font-bold rounded-xl border-2 transition-all duration-300 ${isNew ? 'aq-slide-down' : ''} ${isFront && isDeq ? 'aq-pulse' : ''}`}
                      style={{
                        width: 52, height: 52, fontSize: 17,
                        background: isFront
                          ? 'linear-gradient(135deg,#60a5fa,#2563eb)'
                          : isBack
                          ? 'linear-gradient(135deg,#a78bfa,#7c3aed)'
                          : 'linear-gradient(135deg,#334155,#1e293b)',
                        borderColor: isFront ? '#60a5fa' : isBack ? '#a78bfa' : '#475569',
                        color: 'white',
                        boxShadow: isFront ? '0 0 14px #60a5fa44' : isBack ? '0 0 14px #a78bfa44' : 'none',
                      }}
                    >
                      {v}
                    </div>
                    <span className="font-mono text-[9px]" style={{ color: isFront ? '#60a5fa' : isBack ? '#a78bfa' : '#475569' }}>
                      {isFront ? 'front' : isBack && queue.length > 1 ? 'back' : ''}
                    </span>
                  </div>
                );
              })
            )}
          </div>
          {queue.length > 0 && (
            <div className="flex flex-col items-center gap-1 ml-1">
              <span className="font-mono text-[9px] font-bold text-violet-400">BACK</span>
              <span className="text-violet-400" style={{ fontSize: 18 }}>◀</span>
            </div>
          )}
        </div>
      </div>

      {operation && (
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: '#1e293b', border: '1px solid #334155' }}>
          <span className="material-symbols-outlined text-[14px]" style={{ color: isEnq ? '#a78bfa' : isDeq ? '#60a5fa' : '#fbbf24' }}>
            {isEnq ? 'arrow_back' : isDeq ? 'arrow_forward' : 'visibility'}
          </span>
          <span className="font-mono text-[11px] font-bold" style={{ color: isEnq ? '#a78bfa' : isDeq ? '#60a5fa' : '#fbbf24' }}>
            {operation === 'enqueue' ? 'ENQUEUE → BACK' : operation === 'dequeue' ? 'DEQUEUE ← FRONT' : 'PEEK FRONT'}
          </span>
        </div>
      )}
    </div>
  );
}

function Legend({ renderType }) {
  const MAP = {
    array:     [['Active','#60a5fa'],['Mid/Comparing','#fbbf24'],['Window','#a78bfa'],['Found/Sorted','#34d399'],['Eliminated','#475569']],
    sliding:   [['Active','#60a5fa'],['Window','#a78bfa'],['Found','#34d399']],
    linkedlist:[['Normal','#60a5fa'],['Current','#fbbf24'],['Reversed','#34d399']],
    tree:      [['Unvisited','#475569'],['Current','#fbbf24'],['Visited','#34d399']],
    graph:     [['Unvisited','#475569'],['In Queue','#60a5fa'],['Visited','#34d399']],
    stack:     [['Element','#334155'],['Top','#fbbf24'],['Push','#34d399'],['Pop','#f87171']],
    queue:     [['Front','#60a5fa'],['Middle','#334155'],['Back','#a78bfa']],
  };
  const items = MAP[renderType] || MAP.array;
  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {items.map(([label, color]) => (
        <div key={label} className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-md" style={{ background: color, boxShadow: `0 0 6px ${color}66` }} />
          <span className="font-mono text-[10px] text-slate-400">{label}</span>
        </div>
      ))}
    </div>
  );
}

const SPEED_OPTIONS = [
  { label: '0.5×', ms: 2200 },
  { label: '1×',   ms: 1200 },
  { label: '1.5×', ms: 800  },
  { label: '2×',   ms: 500  },
];

const CAT_COLORS = {
  'Arrays':            '#3b82f6',
  'Sorting':           '#f59e0b',
  'Linked List':       '#8b5cf6',
  'Trees':             '#10b981',
  'Graphs':            '#ef4444',
  'Linear Structures': '#06b6d4',
};

export default function VisualizerPage() {
  const [algoId,   setAlgoId]   = useState(ALGORITHMS[0].id);
  const [frameIdx, setFrameIdx] = useState(0);
  const [playing,  setPlaying]  = useState(false);
  const [speedIdx, setSpeedIdx] = useState(1);
  const [showCode, setShowCode] = useState(false);
  const [animKey,  setAnimKey]  = useState(0);
  const intervalRef = useRef(null);

  const algo  = ALGORITHMS.find(a => a.id === algoId) || ALGORITHMS[0];
  const frame = algo.frames[frameIdx];
  const total = algo.frames.length;
  const speed = SPEED_OPTIONS[speedIdx];

  const selectAlgo = useCallback((id) => {
    setAlgoId(id);
    setFrameIdx(0);
    setPlaying(false);
    setAnimKey(k => k + 1);
  }, []);

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setFrameIdx(i => {
          if (i + 1 >= total) { setPlaying(false); return i; }
          setAnimKey(k => k + 1);
          return i + 1;
        });
      }, speed.ms);
    }
    return () => clearInterval(intervalRef.current);
  }, [playing, total, speed.ms]);

  function handlePrev() {
    setPlaying(false);
    setFrameIdx(i => Math.max(0, i - 1));
    setAnimKey(k => k + 1);
  }
  function handleNext() {
    setPlaying(false);
    setFrameIdx(i => Math.min(total - 1, i + 1));
    setAnimKey(k => k + 1);
  }
  function handlePlay() {
    if (frameIdx >= total - 1) { setFrameIdx(0); setAnimKey(k => k + 1); }
    setPlaying(p => !p);
  }

  const categories = [...new Set(ALGORITHMS.map(a => a.category))];

  return (
    <>
      <style>{ANIM_CSS}</style>
      <div className="max-w-5xl mx-auto pb-16 px-4">
        <div className="py-6 border-b border-slate-200/60 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-[10px] font-semibold tracking-widest uppercase text-slate-400">Visual Learning</p>
              <h1 className="font-sans font-bold text-[22px] text-slate-900 mt-0.5">Algorithm Visualizer</h1>
            </div>
            <Link href="/practice" className="font-mono text-[10px] text-slate-400 hover:text-slate-600 tracking-widest uppercase">← Back</Link>
          </div>
        </div>

        <div className="flex gap-6 flex-col lg:flex-row">
          <div className="lg:w-48 shrink-0">
            {categories.map(cat => (
              <div key={cat} className="mb-5">
                <p className="font-mono text-[8px] font-black tracking-widest uppercase mb-2 px-1" style={{ color: CAT_COLORS[cat] || '#94a3b8' }}>{cat}</p>
                <div className="space-y-0.5">
                  {ALGORITHMS.filter(a => a.category === cat).map(a => {
                    const active = algoId === a.id;
                    const cc = CAT_COLORS[cat] || '#6366f1';
                    return (
                      <button
                        key={a.id}
                        onClick={() => selectAlgo(a.id)}
                        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all duration-150"
                        style={{
                          background:    active ? `${cc}15` : 'transparent',
                          borderLeft:    active ? `3px solid ${cc}` : '3px solid transparent',
                        }}
                      >
                        <span className="material-symbols-outlined text-[15px]" style={{ color: active ? cc : '#64748b' }}>{a.icon}</span>
                        <span className="font-sans text-[13px] font-semibold" style={{ color: active ? cc : '#64748b' }}>{a.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="flex-1 min-w-0">
            <div className="rounded-2xl overflow-hidden mb-4 border border-slate-800" style={{ background: '#0f172a' }}>
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]" style={{ color: CAT_COLORS[algo.category] || '#6366f1' }}>{algo.icon}</span>
                  <span className="font-mono text-[11px] font-bold text-slate-300">{algo.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {SPEED_OPTIONS.map((s, i) => (
                    <button
                      key={s.label}
                      onClick={() => setSpeedIdx(i)}
                      className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-lg transition-all"
                      style={{
                        background: speedIdx === i ? '#1e40af' : 'transparent',
                        color:      speedIdx === i ? '#93c5fd' : '#475569',
                        border:     `1px solid ${speedIdx === i ? '#3b82f6' : '#1e293b'}`,
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-center px-4 py-8" style={{ minHeight: 256 }}>
                {algo.renderType === 'array'      && <ArrayBarRenderer frame={frame} animKey={animKey} />}
                {algo.renderType === 'sliding'    && <ArrayBarRenderer frame={frame} animKey={animKey} />}
                {algo.renderType === 'linkedlist' && <LinkedListRenderer frame={frame} />}
                {algo.renderType === 'tree'       && <TreeRenderer algo={algo} frame={frame} />}
                {algo.renderType === 'graph'      && <GraphRenderer algo={algo} frame={frame} />}
                {algo.renderType === 'stack'      && <StackRenderer frame={frame} />}
                {algo.renderType === 'queue'      && <QueueRenderer frame={frame} />}
              </div>

              <div className="px-4 pb-4">
                <Legend renderType={algo.renderType} />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4 bg-white mb-4">
              <div className="flex items-start gap-3 mb-3">
                <div
                  className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center mt-0.5 text-[15px]"
                  style={{ background: frameIdx === total - 1 ? '#dcfce7' : '#fef3c7' }}
                >
                  {frameIdx === total - 1 ? '✅' : '💡'}
                </div>
                <p className="font-sans text-[14px] text-slate-700 leading-relaxed">{frame.message}</p>
              </div>

              {frame.variables && (
                <div className="flex flex-wrap gap-2">
                  {Object.entries(frame.variables).map(([k, v]) => (
                    <div key={k} className="flex items-center gap-1 px-2.5 py-1 rounded-lg" style={{ background: '#f1f5f9', border: '1px solid #e2e8f0' }}>
                      <span className="font-mono text-[10px] text-slate-500">{k} =</span>
                      <span className="font-mono text-[11px] font-bold text-slate-800">{String(v)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  disabled={frameIdx === 0}
                  className="w-10 h-10 rounded-xl border-2 border-slate-200 flex items-center justify-center hover:border-slate-300 transition-all disabled:opacity-30"
                >
                  <span className="material-symbols-outlined text-[18px] text-slate-600">chevron_left</span>
                </button>
                <button
                  onClick={handlePlay}
                  className="h-10 px-5 rounded-xl font-mono text-[11px] font-bold tracking-widest uppercase text-white transition-all flex items-center gap-1.5"
                  style={{ background: playing ? '#f59e0b' : 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
                >
                  <span className="material-symbols-outlined text-[17px]">{playing ? 'pause' : 'play_arrow'}</span>
                  {playing ? 'Pause' : frameIdx >= total - 1 ? 'Replay' : 'Play'}
                </button>
                <button
                  onClick={handleNext}
                  disabled={frameIdx >= total - 1}
                  className="w-10 h-10 rounded-xl border-2 border-slate-200 flex items-center justify-center hover:border-slate-300 transition-all disabled:opacity-30"
                >
                  <span className="material-symbols-outlined text-[18px] text-slate-600">chevron_right</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-mono text-[11px] text-slate-400">
                  {frameIdx + 1} <span className="text-slate-300">/</span> {total}
                </span>
                <button
                  onClick={() => setShowCode(s => !s)}
                  className="font-mono text-[10px] font-semibold tracking-widest uppercase text-indigo-500 hover:text-indigo-700 transition-colors"
                >
                  {showCode ? 'Hide Code' : 'Show Code'}
                </button>
              </div>
            </div>

            <div className="h-1.5 rounded-full overflow-hidden mb-4" style={{ background: '#e2e8f0' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${((frameIdx + 1) / total) * 100}%`, background: 'linear-gradient(90deg,#6366f1,#8b5cf6)' }}
              />
            </div>

            {showCode && (
              <div className="rounded-2xl overflow-hidden border border-slate-800">
                <div className="px-4 py-2.5 flex items-center gap-2" style={{ background: '#1e293b' }}>
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                  <span className="ml-2 font-mono text-[11px] text-slate-400">{algo.name}</span>
                </div>
                <div className="p-4" style={{ background: '#0f172a' }}>
                  {algo.code.split('\n').map((line, i) => (
                    <div
                      key={i}
                      className="flex gap-3 px-2 py-0.5 rounded transition-all duration-200"
                      style={{
                        background:  frame.codeLine === i + 1 ? '#312e8130' : 'transparent',
                        borderLeft:  frame.codeLine === i + 1 ? '3px solid #6366f1' : '3px solid transparent',
                      }}
                    >
                      <span className="font-mono text-[11px] text-slate-600 w-4 text-right select-none shrink-0">{i + 1}</span>
                      <span className="font-mono text-[12px] text-slate-300 whitespace-pre">{line}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
