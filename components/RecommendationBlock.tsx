import React from 'react';
import { ArrowRight } from 'lucide-react';

interface RecommendationBlockProps {
  heading: string;
  summary: string;
  bullets: string[];
}

export const RecommendationBlock: React.FC<RecommendationBlockProps> = ({ heading, summary, bullets }) => {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.28)]">
      <div className="flex flex-col gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">What to do next</p>
        <h3 className="text-xl font-semibold tracking-tight text-slate-950">{heading}</h3>
        <p className="max-w-3xl text-sm leading-6 text-slate-600">{summary}</p>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {bullets.map((bullet) => (
          <div key={bullet} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-700 ring-1 ring-slate-200">
                <ArrowRight className="h-4 w-4" />
              </span>
              <p className="text-sm leading-6 text-slate-700">{bullet}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
