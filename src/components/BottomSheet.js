'use client';

import { useEffect, useRef } from 'react';

export default function BottomSheet({ isOpen, onClose, children, title, icon, height = '80vh' }) {
  const sheetRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      <div
        ref={sheetRef}
        className="relative w-full bg-aq-surface rounded-t-[20px] sheet-shadow animate-slide-up flex flex-col"
        style={{ maxHeight: height }}
      >
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-8 h-1 bg-aq-border rounded-full" />
        </div>
        {(title || icon) && (
          <div className="flex items-center gap-2 px-5 pb-3 border-b border-aq-border">
            {icon && <span className="material-symbols-outlined text-aq-primary text-[20px]">{icon}</span>}
            {title && <span className="font-mono text-[11px] font-semibold tracking-widest uppercase text-aq-text-primary">{title}</span>}
          </div>
        )}
        <div className="overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
