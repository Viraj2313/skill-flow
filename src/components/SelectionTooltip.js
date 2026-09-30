'use client';

import { useState, useEffect, useRef } from 'react';

export default function SelectionTooltip() {
  const [position, setPosition] = useState(null);
  const [selectedText, setSelectedText] = useState('');
  const tooltipRef = useRef(null);

  useEffect(() => {
    function handleSelectionChange() {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        setPosition(null);
        setSelectedText('');
        return;
      }

      const text = selection.toString().trim();
      if (text.length < 3 || text.length > 300) {
        setPosition(null);
        setSelectedText('');
        return;
      }

      const anchor = selection.anchorNode;
      const element = anchor?.nodeType === Node.ELEMENT_NODE ? anchor : anchor?.parentElement;
      if (element?.closest('input, textarea, [contenteditable="true"]')) {
        setPosition(null);
        setSelectedText('');
        return;
      }

      try {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) {
          setPosition(null);
          return;
        }

        setPosition({
          top: Math.max(10, rect.top + window.scrollY - 38),
          left: Math.max(10, rect.left + window.scrollX + rect.width / 2),
        });
        setSelectedText(text);
      } catch {
        setPosition(null);
      }
    }

    function handleMouseDown(e) {
      if (tooltipRef.current && tooltipRef.current.contains(e.target)) return;
      setPosition(null);
    }

    function handleScroll() {
      setPosition(null);
    }

    document.addEventListener('mouseup', handleSelectionChange);
    document.addEventListener('touchend', handleSelectionChange);
    document.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      document.removeEventListener('mouseup', handleSelectionChange);
      document.removeEventListener('touchend', handleSelectionChange);
      document.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  function handleAskAlex(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!selectedText) return;
    window.dispatchEvent(new CustomEvent('ask-alex', { detail: { text: selectedText } }));
    setPosition(null);
    setSelectedText('');
    window.getSelection()?.removeAllRanges();
  }

  if (!position) return null;

  return (
    <div
      ref={tooltipRef}
      style={{
        position: 'absolute',
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translateX(-50%)',
        zIndex: 9999,
      }}
      className="animate-in fade-in zoom-in-95 duration-150"
    >
      <button
        type="button"
        onMouseDown={handleAskAlex}
        className="btn-tactile flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/95 text-white border border-indigo-500/40 shadow-xl backdrop-blur-md text-[11px] font-sans font-medium hover:border-indigo-400 hover:bg-slate-800 transition-all select-none"
      >
        <span className="material-symbols-outlined text-[13px] text-indigo-400">psychology</span>
        <span>Ask Alex</span>
      </button>
    </div>
  );
}
