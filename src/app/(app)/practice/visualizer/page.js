'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ALGORITHMS } from '@/data/algorithmFrames';

const ANIM_CSS = `
@keyframes aq-appear {
  from { opacity: 0; transform: translateY(10px) scale(0.96); }
  to   { opacity: 1; transform: translateY(0)    scale(1);    }
}
@keyframes aq-highlight {
  0%   { transform: scaleY(1); }
  35%  { transform: scaleY(1.06); }
  100% { transform: scaleY(1); }
}
.aq-appear    { animation: aq-appear    220ms cubic-bezier(0.25, 0.46, 0.45, 0.94) both; }
.aq-highlight { animation: aq-highlight 280ms cubic-bezier(0.33, 1, 0.68, 1)       both; }
`;

const EASE = 'cubic-bezier(0.4, 0, 0.2, 1)';
const TRANSITION = `height 320ms ${EASE}, background 220ms ease, box-shadow 220ms ease, opacity 220ms ease`;
const NODE_TRANSITION = `fill 300ms ${EASE}, stroke 300ms ${EASE}, stroke-width 200ms ease`;

const BAR_STYLES = {
  active:     { grad: ['#3b82f6', '#1d4ed8'], glow: null },
  mid:        { grad: ['#f59e0b', '#b45309'], glow: '0 -6px 16px rgba(245,158,11,0.55)' },
  found:      { grad: ['#10b981', '#065f46'], glow: '0 -6px 16px rgba(16,185,129,0.5)'  },
  window:     { grad: ['#7c3aed', '#4c1d95'], glow: '0 -6px 14px rgba(124,58,237,0.45)' },
  current:    { grad: ['#f59e0b', '#b45309'], glow: '0 -6px 16px rgba(245,158,11,0.55)' },
  reversed:   { grad: ['#10b981', '#065f46'], glow: '0 -6px 16px rgba(16,185,129,0.5)'  },
  eliminated: { grad: ['#1e293b', '#0f172a'], glow: null },
  normal:     { grad: ['#334155', '#1e293b'], glow: null },
};

const POINTER_COLORS = {
  l: '#60a5fa', left: '#60a5fa',
  r: '#f87171', right: '#f87171',
  mid: '#fbbf24',
  slow: '#c084fc', fast: '#f472b6',
  i: '#34d399', j: '#fb923c',
};

const NODE_FILLS = {
  unvisited: { fill: '#1e293b', stroke: '#334155', text: '#94a3b8' },
  active:    { fill: '#92400e', stroke: '#f59e0b', text: '#fef3c7' },
  queued:    { fill: '#1e3a5f', stroke: '#3b82f6', text: '#bfdbfe' },
  visited:   { fill: '#064e3b', stroke: '#10b981', text: '#a7f3d0' },
  current:   { fill: '#92400e', stroke: '#f59e0b', text: '#fef3c7' },
};

function ArrayBarRenderer({ frame }) {
  const vals  = frame.elements.map(e => Math.max(e.v, 0));
  const maxV  = Math.max(...vals, 1);

  return (
    <div className="flex items-end gap-1.5 w-full px-6" style={{ height: 220 }}>
      {frame.elements.map((el, i) => {
        const pct = Math.max(5, Math.round((el.v / maxV) * 100));
        const s   = BAR_STYLES[el.state] || BAR_STYLES.active;
        const [c1, c2] = s.grad;
        const ptrs = el.pointers || [];
        return (
          <div key={i} className="flex flex-col items-center flex-1" style={{ gap: 3 }}>
            <div style={{ height: 18, display: 'flex', alignItems: 'flex-end', gap: 2 }}>
              {ptrs.map(p => (
                <span key={p} className="font-mono font-black" style={{ fontSize: 9, color: POINTER_COLORS[p] || '#a78bfa', lineHeight: 1 }}>
                  {p}
                </span>
              ))}
              {ptrs.length > 0 && (
                <svg width="8" height="7" style={{ marginBottom: 1 }}>
                  <polygon points="4,7 0,0 8,0" fill={POINTER_COLORS[ptrs[0]] || '#a78bfa'} />
                </svg>
              )}
            </div>
            <div
              style={{
                height: `${pct}%`,
                width: '100%',
                background: `linear-gradient(180deg, ${c1} 0%, ${c2} 100%)`,
                boxShadow: s.glow || 'none',
                opacity: el.state === 'eliminated' ? 0.18 : 1,
                transformOrigin: 'bottom',
                borderRadius: '3px 3px 0 0',
                transition: TRANSITION,
              }}
            />
            <span className="font-mono font-semibold" style={{ fontSize: 10, color: el.state === 'eliminated' ? '#334155' : '#94a3b8', lineHeight: 1 }}>
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
  const NODE_S = (i) => {
    if (reversed.includes(i)) return { bg: '#064e3b', border: '#10b981', text: '#a7f3d0' };
    if (i === currIdx)         return { bg: '#92400e', border: '#f59e0b', text: '#fef3c7' };
    return                            { bg: '#1e293b', border: '#3b82f6', text: '#bfdbfe' };
  };
  return (
    <div className="flex items-center justify-center flex-wrap gap-0">
      {nodes.map((v, i) => {
        const s = NODE_S(i);
        const isNextRev = reversed.includes(i) && reversed.includes(i + 1);
        const label = i === currIdx ? 'curr' : i === prevIdx ? 'prev' : null;
        return (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center" style={{ gap: 4 }}>
              <span className="font-mono font-bold" style={{ fontSize: 9, height: 13, color: label ? s.border : 'transparent', letterSpacing: 1 }}>
                {label || '·'}
              </span>
              <div
                style={{
                  width: 48, height: 48,
                  borderRadius: 12,
                  border: `2px solid ${s.border}`,
                  background: s.bg,
                  color: s.text,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'monospace', fontWeight: 700, fontSize: 15,
                  transition: `background 300ms ${EASE}, border-color 300ms ${EASE}`,
                  boxShadow: label === 'curr' ? `0 0 0 3px ${s.border}30` : 'none',
                }}
              >
                {v}
              </div>
            </div>
            {i < nodes.length - 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 32, marginTop: 18 }}>
                <div style={{ height: 1.5, width: '100%', background: isNextRev ? '#10b981' : '#334155', transition: 'background 300ms ease' }} />
                <span style={{ fontSize: 11, color: isNextRev ? '#10b981' : '#475569', transition: 'color 300ms ease' }}>{isNextRev ? '←' : '→'}</span>
              </div>
            )}
          </div>
        );
      })}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginLeft: 8, marginTop: 18 }}>
        <div style={{ height: 1.5, width: 16, background: '#334155' }} />
        <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#475569' }}>∅</span>
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
    <svg width="480" height="230" viewBox="0 0 480 230">
      {edges.map(([a, b], i) => {
        const visited = frame.visitedNodes?.includes(b.id);
        return (
          <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
            stroke={visited ? '#10b981' : '#334155'}
            strokeWidth={visited ? 2 : 1.5}
            style={{ transition: NODE_TRANSITION }}
          />
        );
      })}
      {nodes.map(n => {
        const isActive  = frame.activeNode === n.id;
        const isVisited = frame.visitedNodes?.includes(n.id);
        const s = isActive ? NODE_FILLS.active : isVisited ? NODE_FILLS.visited : NODE_FILLS.unvisited;
        return (
          <g key={n.id}>
            <circle
              cx={n.x} cy={n.y} r={22}
              fill={s.fill} stroke={s.stroke}
              strokeWidth={isActive ? 2.5 : 1.5}
              style={{ transition: NODE_TRANSITION }}
            />
            <text x={n.x} y={n.y + 5} textAnchor="middle"
              fill={s.text} fontSize="13" fontWeight="700" fontFamily="monospace"
              style={{ transition: 'fill 300ms ease' }}
            >
              {n.val}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function GraphRenderer({ algo, frame }) {
  const { graphNodes, graphEdges } = algo;
  return (
    <div className="flex flex-col items-center gap-4">
      <svg width="520" height="250" viewBox="0 0 520 250">
        {graphEdges.map(([a, b], i) => {
          const na = graphNodes[a], nb = graphNodes[b];
          const both = frame.nodeStates[a] === 'visited' && frame.nodeStates[b] === 'visited';
          return (
            <line key={i} x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
              stroke={both ? '#10b981' : '#334155'}
              strokeWidth={both ? 2 : 1.5}
              style={{ transition: 'stroke 300ms ease, stroke-width 200ms ease' }}
            />
          );
        })}
        {graphNodes.map((n, i) => {
          const state = frame.nodeStates[i] || 'unvisited';
          const s = NODE_FILLS[state] || NODE_FILLS.unvisited;
          return (
            <g key={n.id}>
              <circle cx={n.x} cy={n.y} r={24}
                fill={s.fill} stroke={s.stroke}
                strokeWidth={state === 'active' || state === 'queued' ? 2.5 : 1.5}
                style={{ transition: NODE_TRANSITION }}
              />
              <text x={n.x} y={n.y + 5} textAnchor="middle"
                fill={s.text} fontSize="13" fontWeight="700" fontFamily="monospace"
              >
                {n.label}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="flex items-center gap-3 flex-wrap justify-center">
        <span className="font-mono text-[11px] text-slate-500">Queue:</span>
        {frame.queue?.length === 0
          ? <span className="font-mono text-[11px] text-slate-600">empty</span>
          : frame.queue?.map((v, i) => (
            <span key={i} className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md"
              style={{ background: '#1e3a5f', color: '#60a5fa', border: '1px solid #1d4ed830' }}>
              {v}
            </span>
          ))
        }
        {frame.result?.length > 0 && (
          <span className="font-mono text-[11px] text-slate-500 ml-1">
            visited: [{frame.result.join(', ')}]
          </span>
        )}
      </div>
    </div>
  );
}

function StackRenderer({ frame }) {
  const { stack = [], operation } = frame;
  const MAX = 6;
  const visible = stack.slice(-MAX);

  return (
    <div className="flex flex-col items-center" style={{ minHeight: 220 }}>
      {stack.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 6 }}>
          <div style={{ width: 140, height: 2, background: '#334155', borderRadius: 1 }} />
          <span className="font-mono text-[12px] text-slate-600">empty stack</span>
        </div>
      ) : (
        <div className="flex flex-col-reverse items-center" style={{ gap: 3 }}>
          <div style={{ width: 152, height: 3, borderRadius: '0 0 4px 4px', background: '#475569' }} />
          {visible.map((v, i) => {
            const absIdx = stack.length - visible.length + i;
            const isTop  = absIdx === stack.length - 1;
            const isNew  = operation === 'push' && isTop;
            return (
              <div
                key={`${absIdx}`}
                className={isNew ? 'aq-appear' : ''}
                style={{
                  width: 140, height: 44,
                  borderRadius: 8,
                  background: isTop ? 'linear-gradient(135deg, #92400e, #78350f)' : '#1e293b',
                  border: `1.5px solid ${isTop ? '#f59e0b' : '#334155'}`,
                  color: isTop ? '#fef3c7' : '#94a3b8',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0 14px',
                  fontFamily: 'monospace', fontWeight: 700, fontSize: 16,
                  boxShadow: isTop ? '0 0 0 3px rgba(245,158,11,0.18)' : 'none',
                  transition: `background 250ms ${EASE}, border-color 250ms ${EASE}, box-shadow 250ms ${EASE}`,
                }}
              >
                <span style={{ fontSize: 10, fontWeight: 400, color: isTop ? '#d97706' : '#475569' }}>[{absIdx}]</span>
                <span>{v}</span>
                {isTop && <span style={{ fontSize: 9, fontWeight: 600, color: '#d97706', letterSpacing: 1, textTransform: 'uppercase' }}>top</span>}
              </div>
            );
          })}
        </div>
      )}
      {operation && (
        <div className="mt-5 flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: '#0f172a', border: '1px solid #1e293b' }}>
          <span style={{ fontSize: 13, color: operation === 'push' ? '#10b981' : operation === 'pop' ? '#f87171' : '#f59e0b' }}>
            {operation === 'push' ? '↓' : operation === 'pop' ? '↑' : '◉'}
          </span>
          <span className="font-mono text-[10px] font-semibold" style={{ color: operation === 'push' ? '#10b981' : operation === 'pop' ? '#f87171' : '#f59e0b', letterSpacing: 1, textTransform: 'uppercase' }}>
            {operation === 'push' ? 'push' : operation === 'pop' ? 'pop' : 'peek'}
          </span>
        </div>
      )}
    </div>
  );
}

function QueueRenderer({ frame }) {
  const { queue = [], operation } = frame;
  return (
    <div className="flex flex-col items-center gap-6" style={{ minHeight: 180 }}>
      <div className="flex items-center gap-2">
        {queue.length > 0 && (
          <div className="flex flex-col items-center gap-1">
            <span className="font-mono font-semibold" style={{ fontSize: 9, color: '#60a5fa', letterSpacing: 1, textTransform: 'uppercase' }}>front</span>
            <span style={{ fontSize: 14, color: '#3b82f6' }}>▶</span>
          </div>
        )}

        <div className="flex items-center gap-1.5">
          {queue.length === 0 ? (
            <div className="flex items-center px-8 py-4 rounded-xl" style={{ border: '1.5px dashed #334155' }}>
              <span className="font-mono text-[12px] text-slate-600">empty queue</span>
            </div>
          ) : (
            queue.map((v, i) => {
              const isFront  = i === 0;
              const isBack   = i === queue.length - 1;
              const isNewEl  = operation === 'enqueue' && isBack;
              return (
                <div
                  key={`${v}-${i}`}
                  className={isNewEl ? 'aq-appear' : ''}
                  style={{
                    width: 50, height: 50, borderRadius: 10,
                    background: isFront
                      ? 'linear-gradient(135deg,#1e3a8a,#1d4ed8)'
                      : isBack
                      ? 'linear-gradient(135deg,#3b0764,#6d28d9)'
                      : '#1e293b',
                    border: `1.5px solid ${isFront ? '#3b82f6' : isBack ? '#7c3aed' : '#334155'}`,
                    color:  isFront ? '#bfdbfe' : isBack ? '#ddd6fe' : '#94a3b8',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'monospace', fontWeight: 700, fontSize: 16,
                    boxShadow: isFront
                      ? '0 0 0 3px rgba(59,130,246,0.2)'
                      : isBack
                      ? '0 0 0 3px rgba(124,58,237,0.2)'
                      : 'none',
                    transition: `background 250ms ${EASE}, border-color 250ms ${EASE}`,
                  }}
                >
                  {v}
                </div>
              );
            })
          )}
        </div>

        {queue.length > 0 && (
          <div className="flex flex-col items-center gap-1">
            <span className="font-mono font-semibold" style={{ fontSize: 9, color: '#7c3aed', letterSpacing: 1, textTransform: 'uppercase' }}>back</span>
            <span style={{ fontSize: 14, color: '#7c3aed' }}>◀</span>
          </div>
        )}
      </div>

      {operation && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: '#0f172a', border: '1px solid #1e293b' }}>
          <span style={{ fontSize: 13, color: operation === 'enqueue' ? '#7c3aed' : operation === 'dequeue' ? '#3b82f6' : '#f59e0b' }}>
            {operation === 'enqueue' ? '←' : operation === 'dequeue' ? '→' : '◉'}
          </span>
          <span className="font-mono text-[10px] font-semibold" style={{ color: operation === 'enqueue' ? '#7c3aed' : operation === 'dequeue' ? '#60a5fa' : '#f59e0b', letterSpacing: 1, textTransform: 'uppercase' }}>
            {operation === 'enqueue' ? 'enqueue → back' : operation === 'dequeue' ? 'dequeue ← front' : 'peek front'}
          </span>
        </div>
      )}
    </div>
  );
}

function Legend({ renderType }) {
  const DEFS = {
    array:      [['Active','#3b82f6'],['Comparing','#f59e0b'],['Window','#7c3aed'],['Found/Sorted','#10b981'],['Eliminated','#334155']],
    sliding:    [['Active','#3b82f6'],['Window','#7c3aed'],['Found','#10b981']],
    linkedlist: [['Node','#3b82f6'],['Current','#f59e0b'],['Reversed','#10b981']],
    tree:       [['Unvisited','#334155'],['Active','#f59e0b'],['Visited','#10b981']],
    graph:      [['Unvisited','#334155'],['In Queue','#3b82f6'],['Visited','#10b981']],
    stack:      [['Element','#334155'],['Top','#f59e0b'],['Push','#10b981'],['Pop','#f87171']],
    queue:      [['Front','#3b82f6'],['Middle','#334155'],['Back','#7c3aed']],
  };
  const items = DEFS[renderType] || DEFS.array;
  return (
    <div className="flex flex-wrap gap-4 justify-center">
      {items.map(([label, color]) => (
        <div key={label} className="flex items-center gap-1.5">
          <div style={{ width: 10, height: 10, borderRadius: 3, background: color }} />
          <span className="font-mono" style={{ fontSize: 10, color: '#64748b' }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

const SPEEDS = [
  { label: '0.5×', ms: 2000 },
  { label: '1×',   ms: 1100 },
  { label: '2×',   ms: 600  },
  { label: '3×',   ms: 320  },
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
  const intervalRef = useRef(null);

  const algo  = ALGORITHMS.find(a => a.id === algoId) || ALGORITHMS[0];
  const frame = algo.frames[frameIdx];
  const total = algo.frames.length;

  const selectAlgo = useCallback((id) => {
    setAlgoId(id);
    setFrameIdx(0);
    setPlaying(false);
  }, []);

  useEffect(() => {
    clearInterval(intervalRef.current);
    if (playing) {
      intervalRef.current = setInterval(() => {
        setFrameIdx(i => {
          if (i + 1 >= total) { setPlaying(false); return i; }
          return i + 1;
        });
      }, SPEEDS[speedIdx].ms);
    }
    return () => clearInterval(intervalRef.current);
  }, [playing, total, speedIdx]);

  function step(dir) {
    setPlaying(false);
    setFrameIdx(i => Math.min(total - 1, Math.max(0, i + dir)));
  }
  function handlePlay() {
    if (frameIdx >= total - 1) setFrameIdx(0);
    setPlaying(p => !p);
  }

  const categories = [...new Set(ALGORITHMS.map(a => a.category))];

  return (
    <>
      <style>{ANIM_CSS}</style>
      <div className="max-w-5xl mx-auto pb-16 px-4">

        <div className="py-5 border-b border-slate-200/60 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-[10px] font-semibold tracking-widest uppercase text-slate-400">Visual Learning</p>
              <h1 className="font-sans font-bold text-[22px] text-slate-900 mt-0.5">Algorithm Visualizer</h1>
            </div>
            <Link href="/practice" className="font-mono text-[10px] text-slate-400 hover:text-slate-600 tracking-widest uppercase">← Back</Link>
          </div>
        </div>

        <div className="flex gap-6 flex-col lg:flex-row">

          <div className="lg:w-44 shrink-0 space-y-5">
            {categories.map(cat => (
              <div key={cat}>
                <p className="font-mono font-black text-[8px] tracking-widest uppercase mb-1.5 px-1" style={{ color: CAT_COLORS[cat] || '#94a3b8' }}>{cat}</p>
                <div className="space-y-0.5">
                  {ALGORITHMS.filter(a => a.category === cat).map(a => {
                    const active = algoId === a.id;
                    const cc = CAT_COLORS[cat] || '#6366f1';
                    return (
                      <button key={a.id} onClick={() => selectAlgo(a.id)}
                        className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-colors duration-150"
                        style={{ background: active ? `${cc}14` : 'transparent', borderLeft: `3px solid ${active ? cc : 'transparent'}` }}
                      >
                        <span className="material-symbols-outlined text-[14px]" style={{ color: active ? cc : '#94a3b8' }}>{a.icon}</span>
                        <span className="font-sans text-[13px] font-medium" style={{ color: active ? cc : '#64748b' }}>{a.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="flex-1 min-w-0">
            <div className="rounded-2xl overflow-hidden mb-3 border border-slate-800/60" style={{ background: '#0f172a' }}>
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800/60">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[15px]" style={{ color: CAT_COLORS[algo.category] || '#6366f1' }}>{algo.icon}</span>
                  <span className="font-mono text-[11px] font-semibold text-slate-400">{algo.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  {SPEEDS.map((s, i) => (
                    <button key={s.label} onClick={() => setSpeedIdx(i)}
                      className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md transition-colors"
                      style={{
                        background: speedIdx === i ? '#1e3a5f' : 'transparent',
                        color:      speedIdx === i ? '#60a5fa' : '#475569',
                        border:     `1px solid ${speedIdx === i ? '#2563eb40' : 'transparent'}`,
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-center px-4 py-8" style={{ minHeight: 264 }}>
                {algo.renderType === 'array'      && <ArrayBarRenderer frame={frame} />}
                {algo.renderType === 'sliding'    && <ArrayBarRenderer frame={frame} />}
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

            <div className="rounded-xl border border-slate-200 bg-white mb-3 overflow-hidden">
              <div className="flex items-start gap-3 p-4" style={{ borderLeft: `3px solid ${CAT_COLORS[algo.category] || '#6366f1'}` }}>
                <p className="font-sans text-[13.5px] text-slate-700 leading-relaxed flex-1">{frame.message}</p>
              </div>
              {frame.variables && Object.keys(frame.variables).length > 0 && (
                <div className="px-4 pb-3 flex flex-wrap gap-2">
                  {Object.entries(frame.variables).map(([k, v]) => (
                    <div key={k} className="flex items-center gap-1 px-2 py-1 rounded-md" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                      <span className="font-mono text-[10px] text-slate-400">{k}</span>
                      <span className="font-mono text-[10px] text-slate-300">=</span>
                      <span className="font-mono text-[11px] font-bold text-slate-700">{String(v)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <button onClick={() => step(-1)} disabled={frameIdx === 0}
                  className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center hover:border-slate-300 transition-colors disabled:opacity-30">
                  <span className="material-symbols-outlined text-[17px] text-slate-600">chevron_left</span>
                </button>
                <button onClick={handlePlay}
                  className="h-9 px-4 rounded-lg font-mono text-[10px] font-bold tracking-widest uppercase text-white flex items-center gap-1.5 transition-colors"
                  style={{ background: playing ? '#b45309' : '#4f46e5' }}
                >
                  <span className="material-symbols-outlined text-[16px]">{playing ? 'pause' : 'play_arrow'}</span>
                  {playing ? 'Pause' : frameIdx >= total - 1 ? 'Replay' : 'Play'}
                </button>
                <button onClick={() => step(1)} disabled={frameIdx >= total - 1}
                  className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center hover:border-slate-300 transition-colors disabled:opacity-30">
                  <span className="material-symbols-outlined text-[17px] text-slate-600">chevron_right</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-mono text-[11px] text-slate-400">{frameIdx + 1} / {total}</span>
                <button onClick={() => setShowCode(s => !s)}
                  className="font-mono text-[10px] font-semibold tracking-widest uppercase text-indigo-500 hover:text-indigo-700 transition-colors">
                  {showCode ? 'Hide Code' : 'Show Code'}
                </button>
              </div>
            </div>

            <div className="h-1 rounded-full overflow-hidden mb-4" style={{ background: '#e2e8f0' }}>
              <div className="h-full rounded-full transition-all duration-300"
                style={{ width: `${((frameIdx + 1) / total) * 100}%`, background: CAT_COLORS[algo.category] || '#4f46e5' }} />
            </div>

            {showCode && (
              <div className="rounded-xl overflow-hidden border border-slate-800/60">
                <div className="flex items-center gap-1.5 px-4 py-2.5" style={{ background: '#1e293b' }}>
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#f87171' }} />
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#fbbf24' }} />
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#34d399' }} />
                  <span className="ml-2 font-mono text-[11px] text-slate-500">{algo.name}</span>
                </div>
                <div className="p-4" style={{ background: '#0f172a' }}>
                  {algo.code.split('\n').map((line, i) => (
                    <div key={i} className="flex gap-3 px-2 py-0.5 rounded transition-colors duration-200"
                      style={{ background: frame.codeLine === i + 1 ? '#1e3a5f' : 'transparent', borderLeft: `2px solid ${frame.codeLine === i + 1 ? '#3b82f6' : 'transparent'}` }}>
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
