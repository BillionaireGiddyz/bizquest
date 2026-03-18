import React from 'react';
import { AlertTriangle, CheckCircle2, ShieldCheck, XCircle } from 'lucide-react';
import { cn } from '../lib/utils';

type Verdict = 'GO' | 'BE CAREFUL' | 'AVOID';

interface VerdictCardProps {
  recommendation: Verdict;
  confidence: number;
  rationale: string;
}

const verdictStyles: Record<Verdict, { badge: string; card: string; ring: string; icon: React.ReactNode; eyebrow: string }> = {
  GO: {
    badge: 'bg-emerald-500 text-white',
    card: 'bg-emerald-50/90 text-emerald-950',
    ring: 'ring-emerald-200/80',
    icon: <CheckCircle2 className="h-5 w-5" />,
    eyebrow: 'Demand outpaces friction',
  },
  'BE CAREFUL': {
    badge: 'bg-amber-500 text-white',
    card: 'bg-amber-50/90 text-amber-950',
    ring: 'ring-amber-200/80',
    icon: <AlertTriangle className="h-5 w-5" />,
    eyebrow: 'Opportunity exists with constraints',
  },
  AVOID: {
    badge: 'bg-rose-500 text-white',
    card: 'bg-rose-50/90 text-rose-950',
    ring: 'ring-rose-200/80',
    icon: <XCircle className="h-5 w-5" />,
    eyebrow: 'Risk outweighs current upside',
  },
};

function getConfidenceLabel(confidence: number) {
  if (confidence >= 80) return 'High confidence';
  if (confidence >= 65) return 'Good confidence';
  return 'Measured confidence';
}

export const VerdictCard: React.FC<VerdictCardProps> = ({ recommendation, confidence, rationale }) => {
  const styles = verdictStyles[recommendation];

  return (
    <aside
      className={cn(
        'rounded-[28px] p-5 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.35)] ring-1',
        styles.card,
        styles.ring,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">{styles.eyebrow}</p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold shadow-sm ring-1 ring-black/5">
            <span className={cn('inline-flex items-center gap-2 rounded-full px-3 py-1.5', styles.badge)}>
              {styles.icon}
              {recommendation}
            </span>
          </div>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-2 text-xs font-medium text-slate-600 ring-1 ring-white/80">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          Verified by live market signals
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <div className="flex items-center justify-between text-sm font-medium text-slate-600">
            <span>{getConfidenceLabel(confidence)}</span>
            <span>{confidence}%</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-white/70">
            <div
              className={cn(
                'h-full rounded-full transition-[width] duration-500 ease-out',
                recommendation === 'GO'
                  ? 'bg-emerald-500'
                  : recommendation === 'AVOID'
                    ? 'bg-rose-500'
                    : 'bg-amber-500',
              )}
              style={{ width: `${Math.max(18, Math.min(confidence, 100))}%` }}
            />
          </div>
        </div>

        <p className="text-sm leading-6 text-slate-700">{rationale}</p>
      </div>
    </aside>
  );
};
