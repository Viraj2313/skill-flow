export function DifficultyBadge({ difficulty }) {
  const styles = {
    easy:   'bg-emerald-50 text-emerald-700 border-emerald-200/70',
    medium: 'bg-amber-50 text-amber-700 border-amber-200/70',
    hard:   'bg-red-50 text-red-700 border-red-200/70',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md font-mono text-[10px] font-semibold tracking-wider uppercase border ${styles[difficulty] || styles.easy}`}>
      {difficulty}
    </span>
  );
}

export function XPPill({ xp }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-mono text-[11px] font-semibold"
      style={{ background: '#ecfdf5', border: '1px solid #a7f3d030', color: '#065f46' }}>
      <span className="material-symbols-outlined filled text-emerald-500" style={{ fontSize: 13 }}>bolt</span>
      +{xp} XP
    </span>
  );
}

export function DifficultyDot({ difficulty }) {
  const colors = {
    easy:   '#10b981',
    medium: '#f59e0b',
    hard:   '#ef4444',
  };
  return (
    <span className="inline-block w-2 h-2 rounded-full shrink-0"
      style={{ background: colors[difficulty] || colors.easy }} />
  );
}

export function StatChip({ icon, value, gold }) {
  return (
    <div
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-[12px] font-semibold transition-colors"
      style={{
        background:  gold ? '#fffbeb' : '#f8fafc',
        border:      `1px solid ${gold ? '#fde68a' : '#e2e8f0'}`,
        color:       gold ? '#92400e' : '#374151',
      }}
    >
      <span className="material-symbols-outlined filled" style={{ fontSize: 15, color: gold ? '#f59e0b' : '#6b7280' }}>
        {icon}
      </span>
      <span>{value}</span>
    </div>
  );
}

export function FilterPills({ options, active, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1">
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className="shrink-0 px-3.5 py-1.5 rounded-lg font-mono text-[11px] font-semibold tracking-wider uppercase transition-all duration-150"
          style={
            active === opt
              ? { background: '#0f172a', color: '#fff', border: '1px solid #0f172a' }
              : { background: '#fff', color: '#64748b', border: '1px solid #e2e8f0' }
          }
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
      className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200"
      style={{ background: checked ? '#059669' : '#e2e8f0' }}
    >
      <span
        className="inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform duration-200"
        style={{ transform: checked ? 'translateX(18px)' : 'translateX(2px)' }}
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
          className="flex-1 h-1 rounded-full transition-colors duration-300"
          style={{ background: i < filled ? '#059669' : '#e2e8f0' }}
        />
      ))}
    </div>
  );
}

export function Card({ children, className = '', style = {} }) {
  return (
    <div
      className={`bg-white rounded-xl transition-shadow duration-200 ${className}`}
      style={{ border: '1px solid #e8edf2', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', ...style }}
    >
      {children}
    </div>
  );
}

export function SectionLabel({ children, icon }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="font-mono font-bold tracking-widest uppercase" style={{ fontSize: 10, color: '#94a3b8' }}>
        {children}
      </span>
      {icon && (
        <span className="material-symbols-outlined" style={{ fontSize: 13, color: '#94a3b8' }}>{icon}</span>
      )}
    </div>
  );
}

export function EmptyState({ icon, title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
        style={{ background: '#f1f5f9' }}>
        <span className="material-symbols-outlined" style={{ fontSize: 24, color: '#94a3b8' }}>{icon}</span>
      </div>
      <div>
        <p className="font-sans font-semibold text-[14px] text-slate-700">{title}</p>
        {subtitle && <p className="font-sans text-[13px] text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
