export function DifficultyBadge({ difficulty }) {
  const styles = {
    easy: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    medium: 'bg-amber-50 text-amber-700 border-amber-200',
    hard: 'bg-red-50 text-red-700 border-red-200',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md font-mono text-[10px] font-semibold tracking-wider uppercase border ${styles[difficulty] || styles.easy}`}>
      {difficulty}
    </span>
  );
}

export function XPPill({ xp }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono text-[11px] font-semibold shadow-xs">
      <span className="material-symbols-outlined text-[14px] text-emerald-600 filled">bolt</span>
      +{xp} XP
    </span>
  );
}

export function DifficultyDot({ difficulty }) {
  const colors = {
    easy: 'bg-emerald-500',
    medium: 'bg-amber-500',
    hard: 'bg-red-500',
  };
  return <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${colors[difficulty] || colors.easy}`} />;
}

export function StatChip({ icon, value, gold }) {
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono text-[12px] font-bold shadow-xs transition-colors ${
      gold 
        ? 'bg-amber-50/70 border-amber-200/80 text-amber-900' 
        : 'bg-white border-slate-200 text-slate-800'
    }`}>
      <span className={`material-symbols-outlined text-[16px] filled ${gold ? 'text-amber-500' : 'text-slate-500'}`}>
        {icon}
      </span>
      <span>{value}</span>
    </div>
  );
}

export function FilterPills({ options, active, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide py-2">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`shrink-0 px-3.5 py-1.5 rounded-lg font-mono text-[11px] font-semibold tracking-wider uppercase transition-all duration-150 ${
            active === opt
              ? 'bg-slate-900 text-white shadow-xs'
              : 'border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${checked ? 'bg-emerald-600' : 'bg-slate-200'}`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-6' : 'translate-x-1'}`}
      />
    </button>
  );
}

export function ProgressBar({ filled, total = 10 }) {
  return (
    <div className="flex gap-1 w-full">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`flex-1 h-1.5 rounded-full transition-colors ${i < filled ? 'bg-emerald-600' : 'bg-slate-200'}`}
        />
      ))}
    </div>
  );
}

export function Card({ children, className = '' }) {
  return (
    <div className={`bg-white border border-slate-200/90 rounded-xl card-shadow transition-shadow hover:shadow-md/50 ${className}`}>
      {children}
    </div>
  );
}

export function SectionLabel({ children, icon }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="font-mono text-[10px] font-semibold tracking-widest uppercase text-aq-text-muted">{children}</span>
      {icon && <span className="material-symbols-outlined text-[14px] text-aq-text-muted">{icon}</span>}
    </div>
  );
}
