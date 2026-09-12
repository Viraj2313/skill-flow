'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ALGORITHMS } from '@/data/algorithmFrames';

const STATE_COLORS = {
  active:      { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' },
  eliminated:  { bg: '#f1f5f9', border: '#cbd5e1', text: '#94a3b8' },
  mid:         { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' },
  found:       { bg: '#d1fae5', border: '#10b981', text: '#065f46' },
  window:      { bg: '#ede9fe', border: '#8b5cf6', text: '#4c1d95' },
  current:     { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' },
  reversed:    { bg: '#d1fae5', border: '#10b981', text: '#065f46' },
  normal:      { bg: '#f8fafc', border: '#e2e8f0', text: '#374151' },
};

const NODE_COLORS = {
  unvisited:  { fill: '#f1f5f9', stroke: '#94a3b8', text: '#475569' },
  active:     { fill: '#fef3c7', stroke: '#f59e0b', text: '#92400e' },
  queued:     { fill: '#dbeafe', stroke: '#3b82f6', text: '#1e40af' },
  visited:    { fill: '#d1fae5', stroke: '#10b981', text: '#065f46' },
  current:    { fill: '#fef3c7', stroke: '#f59e0b', text: '#92400e' },
};

function ArrayRenderer({ frame, renderType }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-end gap-1.5 flex-wrap justify-center">
        {frame.elements.map((el, i) => {
          const col = STATE_COLORS[el.state] || STATE_COLORS.active;
          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="flex gap-0.5 h-4 justify-center">
                {el.pointers?.map(p => (
                  <span key={p} className="font-mono text-[9px] font-bold leading-none" style={{
                    color: p === 'l' || p === 'left' ? '#3b82f6' : p === 'r' || p === 'right' ? '#3b82f6' : p === 'mid' ? '#f59e0b' : '#6366f1'
                  }}>{p}</span>
                ))}
              </div>
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center font-mono font-bold text-[14px] border-2 transition-all duration-300"
                style={{ background: col.bg, borderColor: col.border, color: col.text }}
              >
                {el.v}
              </div>
              <span className="font-mono text-[9px] text-slate-400">{i}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LinkedListRenderer({ frame }) {
  const { nodes, currIdx, prevIdx, reversed } = frame;
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center gap-1">
        {nodes.map((v, i) => {
          const isCurr     = i === currIdx;
          const isPrev     = i === prevIdx;
          const isReversed = reversed.includes(i);
          const col = isCurr ? STATE_COLORS.mid : isReversed ? STATE_COLORS.found : STATE_COLORS.active;
          return (
            <div key={i} className="flex items-center">
              <div className="flex flex-col items-center gap-1">
                <span className="font-mono text-[9px] font-bold" style={{
                  color: isCurr ? '#f59e0b' : isPrev ? '#10b981' : 'transparent',
                  minHeight: '14px',
                }}>
                  {isCurr ? 'curr' : isPrev ? 'prev' : ''}
                </span>
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center font-mono font-bold text-[15px] border-2 transition-all duration-300"
                  style={{ background: col.bg, borderColor: col.border, color: col.text }}
                >
                  {v}
                </div>
              </div>
              {i < nodes.length - 1 && (
                <div className="flex flex-col items-center w-8 mt-6">
                  <div className="h-0.5 w-full" style={{ background: reversed.includes(i) && reversed.includes(i + 1) ? '#10b981' : '#94a3b8' }} />
                  <span className="text-slate-400 text-[10px]">{reversed.includes(i) && reversed.includes(i + 1) ? '←' : '→'}</span>
                </div>
              )}
            </div>
          );
        })}
        <div className="flex flex-col items-center ml-2 mt-6">
          <div className="h-0.5 w-4 bg-slate-300" />
          <span className="font-mono text-[10px] text-slate-400">∅</span>
        </div>
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
    <div className="flex flex-col items-center gap-4">
      <svg width="480" height="240" viewBox="0 0 480 240">
        {edges.map(([a, b], i) => (
          <line
            key={i}
            x1={a.x} y1={a.y}
            x2={b.x} y2={b.y}
            stroke={frame.visitedNodes?.includes(b.id) ? '#10b981' : '#cbd5e1'}
            strokeWidth="2"
          />
        ))}
        {nodes.map(n => {
          const isActive  = frame.activeNode === n.id;
          const isVisited = frame.visitedNodes?.includes(n.id);
          const col = isActive ? NODE_COLORS.current : isVisited ? NODE_COLORS.visited : NODE_COLORS.unvisited;
          return (
            <g key={n.id}>
              <circle
                cx={n.x} cy={n.y} r={20}
                fill={col.fill}
                stroke={col.stroke}
                strokeWidth="2.5"
                style={{ transition: 'fill 0.3s, stroke 0.3s' }}
              />
              <text x={n.x} y={n.y + 5} textAnchor="middle" fill={col.text} fontSize="14" fontWeight="700" fontFamily="monospace">
                {n.val}
              </text>
            </g>
          );
        })}
      </svg>
      {frame.result?.length > 0 && (
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[11px] text-slate-500">Result:</span>
          {frame.result.map((v, i) => (
            <span key={i} className="font-mono text-[12px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg">{v}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function GraphRenderer({ algo, frame }) {
  const { graphNodes, graphEdges } = algo;
  return (
    <div className="flex flex-col items-center gap-4">
      <svg width="520" height="300" viewBox="0 0 520 300">
        {graphEdges.map(([a, b], i) => {
          const na = graphNodes[a];
          const nb = graphNodes[b];
          const bothVisited = frame.nodeStates[a] === 'visited' && frame.nodeStates[b] === 'visited';
          return (
            <line
              key={i}
              x1={na.x} y1={na.y}
              x2={nb.x} y2={nb.y}
              stroke={bothVisited ? '#10b981' : '#cbd5e1'}
              strokeWidth="2"
            />
          );
        })}
        {graphNodes.map((n, i) => {
          const state = frame.nodeStates[i] || 'unvisited';
          const col = NODE_COLORS[state] || NODE_COLORS.unvisited;
          return (
            <g key={n.id}>
              <circle
                cx={n.x} cy={n.y} r={24}
                fill={col.fill}
                stroke={col.stroke}
                strokeWidth="2.5"
                style={{ transition: 'fill 0.35s, stroke 0.35s' }}
              />
              <text x={n.x} y={n.y + 5} textAnchor="middle" fill={col.text} fontSize="14" fontWeight="700" fontFamily="monospace">
                {n.label}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="flex items-center gap-3">
        <span className="font-mono text-[11px] text-slate-500">Queue:</span>
        {frame.queue?.length === 0
          ? <span className="font-mono text-[11px] text-slate-400">empty</span>
          : frame.queue?.map((v, i) => (
              <span key={i} className="font-mono text-[12px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-lg">{v}</span>
            ))
        }
        <span className="font-mono text-[11px] text-slate-400 ml-2">Order visited: [{frame.result?.join(', ')}]</span>
      </div>
    </div>
  );
}

function Legend({ type }) {
  const items =
    type === 'graph' ? [
      { label: 'Unvisited', bg: '#f1f5f9', border: '#94a3b8' },
      { label: 'In Queue',  bg: '#dbeafe', border: '#3b82f6' },
      { label: 'Visited',   bg: '#d1fae5', border: '#10b981' },
      { label: 'Current',   bg: '#fef3c7', border: '#f59e0b' },
    ] :
    type === 'tree' ? [
      { label: 'Unvisited', bg: '#f1f5f9', border: '#94a3b8' },
      { label: 'Current',   bg: '#fef3c7', border: '#f59e0b' },
      { label: 'Visited',   bg: '#d1fae5', border: '#10b981' },
    ] :
    type === 'linkedlist' ? [
      { label: 'Normal',   bg: '#dbeafe', border: '#3b82f6' },
      { label: 'Current',  bg: '#fef3c7', border: '#f59e0b' },
      { label: 'Reversed', bg: '#d1fae5', border: '#10b981' },
    ] : [
      { label: 'Active',      bg: '#dbeafe', border: '#3b82f6' },
      { label: 'Mid/Current', bg: '#fef3c7', border: '#f59e0b' },
      { label: 'Window',      bg: '#ede9fe', border: '#8b5cf6' },
      { label: 'Found',       bg: '#d1fae5', border: '#10b981' },
      { label: 'Eliminated',  bg: '#f1f5f9', border: '#cbd5e1' },
    ];

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {items.map(it => (
        <div key={it.label} className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-md border-2" style={{ background: it.bg, borderColor: it.border }} />
          <span className="font-mono text-[10px] text-slate-500">{it.label}</span>
        </div>
      ))}
    </div>
  );
}

const CAT_COLORS = {
  'Arrays': '#3b82f6',
  'Linked List': '#8b5cf6',
  'Trees': '#10b981',
  'Graphs': '#f59e0b',
};

export default function VisualizerPage() {
  const [algoId, setAlgoId]   = useState(ALGORITHMS[0].id);
  const [frameIdx, setFrameIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
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
    if (playing) {
      intervalRef.current = setInterval(() => {
        setFrameIdx(i => {
          if (i + 1 >= total) { setPlaying(false); return i; }
          return i + 1;
        });
      }, 1200);
    }
    return () => clearInterval(intervalRef.current);
  }, [playing, total]);

  function handlePrev() { setPlaying(false); setFrameIdx(i => Math.max(0, i - 1)); }
  function handleNext() { setPlaying(false); setFrameIdx(i => Math.min(total - 1, i + 1)); }
  function handlePlay() {
    if (frameIdx >= total - 1) setFrameIdx(0);
    setPlaying(p => !p);
  }

  const categories = [...new Set(ALGORITHMS.map(a => a.category))];

  return (
    <div className="max-w-4xl mx-auto pb-16 px-4">
      <div className="py-6 border-b border-slate-200/80 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-[10px] font-semibold tracking-widest uppercase text-slate-400">Practice</p>
            <h1 className="font-sans font-bold text-[22px] text-slate-900 mt-0.5">Algorithm Visualizer</h1>
          </div>
          <Link href="/practice" className="font-mono text-[10px] text-slate-400 hover:text-slate-600 tracking-widest uppercase">← Back</Link>
        </div>
      </div>

      <div className="flex gap-6 flex-col lg:flex-row">
        <div className="lg:w-52 shrink-0">
          {categories.map(cat => (
            <div key={cat} className="mb-4">
              <p className="font-mono text-[9px] font-bold tracking-widest uppercase mb-1.5" style={{ color: CAT_COLORS[cat] }}>{cat}</p>
              <div className="space-y-1">
                {ALGORITHMS.filter(a => a.category === cat).map(a => (
                  <button
                    key={a.id}
                    onClick={() => selectAlgo(a.id)}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all"
                    style={{
                      background:  algoId === a.id ? '#eef2ff' : 'transparent',
                      borderLeft:  algoId === a.id ? `3px solid #6366f1` : '3px solid transparent',
                    }}
                  >
                    <span className="material-symbols-outlined text-[16px]" style={{ color: algoId === a.id ? '#6366f1' : '#94a3b8' }}>{a.icon}</span>
                    <span className="font-sans text-[13px] font-semibold" style={{ color: algoId === a.id ? '#4338ca' : '#64748b' }}>{a.name}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex-1 min-w-0">
          <div className="border-2 border-slate-200 rounded-2xl p-5 bg-white mb-4">
            <div className="min-h-[240px] flex items-center justify-center mb-6">
              {algo.renderType === 'array'      && <ArrayRenderer frame={frame} renderType="array" />}
              {algo.renderType === 'sliding'    && <ArrayRenderer frame={frame} renderType="sliding" />}
              {algo.renderType === 'linkedlist' && <LinkedListRenderer frame={frame} />}
              {algo.renderType === 'tree'       && <TreeRenderer algo={algo} frame={frame} />}
              {algo.renderType === 'graph'      && <GraphRenderer algo={algo} frame={frame} />}
            </div>

            <div
              className="rounded-xl p-3.5 border mb-4 min-h-[56px] flex items-center gap-3"
              style={{ background: '#f8fafc', borderColor: '#e2e8f0' }}
            >
              <span className="text-[20px] shrink-0">
                {frameIdx === total - 1 ? '✅' : '💡'}
              </span>
              <p className="font-sans text-[13px] text-slate-700 leading-relaxed">{frame.message}</p>
            </div>

            {frame.variables && (
              <div className="flex flex-wrap gap-2 mb-4">
                {Object.entries(frame.variables).map(([k, v]) => (
                  <div key={k} className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-lg">
                    <span className="font-mono text-[10px] text-slate-500">{k} =</span>
                    <span className="font-mono text-[11px] font-bold text-slate-800">{String(v)}</span>
                  </div>
                ))}
              </div>
            )}

            <Legend type={algo.renderType} />
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                disabled={frameIdx === 0}
                className="w-9 h-9 rounded-xl border-2 border-slate-200 flex items-center justify-center hover:border-slate-300 transition-all disabled:opacity-30"
              >
                <span className="material-symbols-outlined text-[18px] text-slate-600">chevron_left</span>
              </button>
              <button
                onClick={handlePlay}
                className="h-9 px-4 rounded-xl font-mono text-[11px] font-bold tracking-widest uppercase text-white transition-all flex items-center gap-1.5"
                style={{ background: playing ? '#f59e0b' : 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
              >
                <span className="material-symbols-outlined text-[16px]">{playing ? 'pause' : 'play_arrow'}</span>
                {playing ? 'Pause' : frameIdx >= total - 1 ? 'Replay' : 'Play'}
              </button>
              <button
                onClick={handleNext}
                disabled={frameIdx >= total - 1}
                className="w-9 h-9 rounded-xl border-2 border-slate-200 flex items-center justify-center hover:border-slate-300 transition-all disabled:opacity-30"
              >
                <span className="material-symbols-outlined text-[18px] text-slate-600">chevron_right</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-mono text-[11px] text-slate-400">Step {frameIdx + 1} / {total}</span>
              <button
                onClick={() => setShowCode(s => !s)}
                className="font-mono text-[10px] font-semibold tracking-widest uppercase text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                {showCode ? 'Hide Code' : 'Show Code'}
              </button>
            </div>
          </div>

          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-4">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${((frameIdx + 1) / total) * 100}%`,
                background: 'linear-gradient(90deg,#6366f1,#8b5cf6)',
              }}
            />
          </div>

          {showCode && (
            <div className="rounded-2xl overflow-hidden border border-slate-800">
              <div className="px-4 py-2.5 bg-slate-800 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
                <span className="ml-2 font-mono text-[11px] text-slate-400">{algo.name}</span>
              </div>
              <div className="bg-slate-900 p-4">
                {algo.code.split('\n').map((line, i) => (
                  <div
                    key={i}
                    className="flex gap-3 px-2 py-0.5 rounded transition-all"
                    style={{
                      background: frame.codeLine === i + 1 ? '#312e8130' : 'transparent',
                      borderLeft: frame.codeLine === i + 1 ? '3px solid #6366f1' : '3px solid transparent',
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
  );
}
