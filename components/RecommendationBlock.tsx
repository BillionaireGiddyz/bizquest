import React from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';

interface RecommendationBlockProps {
  heading: string;
  summary: string;
  bullets: string[];
  getIcon?: (bullet: string) => { icon: React.ReactNode; color: string };
}

export const RecommendationBlock: React.FC<RecommendationBlockProps> = ({ heading, summary, bullets, getIcon }) => {
  return (
    <section className="rounded-[28px] border border-white/6 bg-[#111827] p-6 text-slate-100 shadow-[0_18px_48px_-24px_rgba(2,6,23,0.65)]">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <span className="h-6 w-[3px] rounded-full bg-blue-500" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">What to do next</p>
        </div>
        <h3 className="text-xl font-semibold tracking-tight text-white">{heading}</h3>
        <p className="max-w-3xl text-sm leading-6 text-slate-300">{summary}</p>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {bullets.map((bullet) => {
          const actionVisual = getIcon?.(bullet) ?? { icon: <ArrowRight className="h-4 w-4" />, color: 'text-blue-400' };

          return (
          <div
            key={bullet}
            className="group rounded-2xl border border-white/6 border-l-[3px] border-l-blue-500 bg-[#111827] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-l-blue-400 hover:bg-white/[0.04] hover:shadow-[0_4px_16px_rgba(59,130,246,0.1)]"
          >
            <div className="flex items-start gap-3">
              <span className={cn('mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10', actionVisual.color)}>
                {actionVisual.icon}
              </span>
              <p className="text-sm leading-6 text-slate-200">{bullet}</p>
            </div>
          </div>
        )})}
      </div>
    </section>
  );
};
