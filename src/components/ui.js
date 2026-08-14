export function DifficultyBadge({ difficulty }) {
  const styles = {
    easy: 'bg-aq-success-bg text-aq-success',
    medium: 'bg-aq-gold-bg text-aq-gold',
    hard: 'bg-aq-error-bg text-aq-error',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-pill font-mono text-[10px] font-semibold tracking-widest uppercase ${styles[difficulty] || styles.easy}`}>
      {difficulty}
    </span>
  );
}

export function XPPill({ xp }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-pill bg-aq-primary-dim border border-aq-primary text-aq-primary-text font-mono text-[10px] font-semibold">
      ⚡ +{xp} XP
    </span>
  );
}

export function DifficultyDot({ difficulty }) {
  const colors = {
    easy: 'bg-aq-success',
    medium: 'bg-aq-gold',
    hard: 'bg-aq-error',
  };
  return <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${colors[difficulty] || colors.easy}`} />;
}

export function StatChip({ icon, value, gold }) {
  return (
    <div className="flex items-center gap-1 px-2.5 py-1 bg-aq-surface border border-aq-border rounded-pill paper-shadow">
      <span className={`material-symbols-outlined text-[16px] filled ${gold ? 'text-aq-gold' : 'text-aq-text-secondary'}`}>{icon}</span>
      <span className="font-mono text-[12px] font-bold text-aq-text-primary">{value}</span>
    </div>
  );
}

export function FilterPills({ options, active, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide px-5 py-2">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`flex-shrink-0 px-3 py-1 rounded-pill font-mono text-[10px] font-semibold tracking-widest uppercase transition-colors ${
            active === opt
              ? 'bg-aq-primary text-white'
              : 'border border-aq-border text-aq-text-muted bg-aq-surface hover:bg-aq-surface-raised'
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
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${checked ? 'bg-aq-primary' : 'bg-aq-surface-sunken'}`}
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
          className={`flex-1 h-2 rounded-sm ${i < filled ? 'bg-aq-primary' : 'bg-aq-surface-raised'}`}
        />
      ))}
    </div>
  );
}

export function Card({ children, className = '' }) {
  return (
    <div className={`bg-aq-surface border border-aq-border rounded-card card-shadow ${className}`}>
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
