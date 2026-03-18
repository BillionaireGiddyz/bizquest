import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';

export type MetricTone = 'emerald' | 'amber' | 'rose' | 'blue';

export interface ExpandableMetricCardProps {
  title: string;
  value: string;
  eyebrow?: string;
  summary: string;
  explanation: string;
  signals: string[];
  implication: string;
  tone?: MetricTone;
  isOpen: boolean;
  onToggle: () => void;
}

const toneStyles: Record<MetricTone, { value: string; chip: string; border: string; surface: string }> = {
  emerald: {
    value: 'text-emerald-700',
    chip: 'bg-emerald-50 text-emerald-700',
    border: 'border-emerald-200/70',
    surface: 'bg-emerald-50/70',
  },
  amber: {
    value: 'text-amber-700',
    chip: 'bg-amber-50 text-amber-700',
    border: 'border-amber-200/70',
    surface: 'bg-amber-50/70',
  },
  rose: {
    value: 'text-rose-700',
    chip: 'bg-rose-50 text-rose-700',
    border: 'border-rose-200/70',
    surface: 'bg-rose-50/70',
  },
  blue: {
    value: 'text-sky-700',
    chip: 'bg-sky-50 text-sky-700',
    border: 'border-sky-200/70',
    surface: 'bg-sky-50/70',
  },
};

export const ExpandableMetricCard: React.FC<ExpandableMetricCardProps> = ({
  title,
  value,
  eyebrow,
  summary,
  explanation,
  signals,
  implication,
  tone = 'blue',
  isOpen,
  onToggle,
}) => {
  const styles = toneStyles[tone];

  return (
    <div
      className={cn(
        'rounded-[24px] border bg-white shadow-[0_16px_40px_-28px_rgba(15,23,42,0.35)] transition-colors duration-200',
        isOpen ? styles.border : 'border-slate-200',
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-start justify-between gap-4 rounded-[24px] p-5 text-left outline-none transition-colors duration-200 hover:bg-slate-50/70 focus-visible:ring-2 focus-visible:ring-indigo-500/60"
      >
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">{title}</p>
          <div className="mt-4 flex items-end gap-3">
            <span className={cn('text-3xl font-semibold tracking-tight', styles.value)}>{value}</span>
            {eyebrow && (
              <span className={cn('rounded-full px-2.5 py-1 text-[11px] font-medium', styles.chip)}>{eyebrow}</span>
            )}
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">{summary}</p>
        </div>
        <span
          className={cn(
            'mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-transform duration-200',
            isOpen ? `${styles.surface} ${styles.border} rotate-180` : 'border-slate-200 bg-slate-50',
          )}
        >
          <ChevronDown className="h-4 w-4 text-slate-500" />
        </span>
      </button>

      <div className={cn('grid transition-[grid-template-rows] duration-300 ease-out', isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
        <div className="overflow-hidden">
          <div className="border-t border-slate-100 px-5 pb-5 pt-4">
            <p className="text-sm leading-6 text-slate-700">{explanation}</p>

            {signals.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {signals.map((signal) => (
                  <span
                    key={signal}
                    className={cn('rounded-full px-3 py-1.5 text-xs font-medium ring-1 ring-inset', styles.chip, styles.border)}
                  >
                    {signal}
                  </span>
                ))}
              </div>
            )}

            <div className={cn('mt-4 rounded-2xl px-4 py-3 text-sm text-slate-700 ring-1 ring-inset', styles.surface, styles.border)}>
              <span className="font-semibold text-slate-900">Business implication:</span> {implication}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
