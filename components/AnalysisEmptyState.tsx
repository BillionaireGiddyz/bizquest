import React from 'react';
import { ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

const examplePrompts = [
  'Will a KES 10,000 portable blender sell in Nairobi West?',
  'Is there demand for vegan cookies in Karen, Nairobi?',
  'Can a student laundry pickup business work in Nakuru CBD?',
];

export const AnalysisEmptyState: React.FC = () => {
  return (
    <section className="flex h-full flex-col justify-center rounded-[32px] border border-slate-200 bg-white px-6 py-10 shadow-[0_24px_70px_-36px_rgba(15,23,42,0.24)] sm:px-8">
      <div className="mx-auto w-full max-w-4xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
          <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
          BizQuest analysis
        </div>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Make the first decision quickly, then open the detail only if you need it.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              BizQuest turns one business question into a clear verdict, four essential market signals, and an optional
              execution layer that stays out of the way until you want it.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 ring-1 ring-emerald-200/80">
              <ShieldCheck className="h-4 w-4" />
              Verified by live market signals
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-slate-50/80 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">What appears here</p>
            <ul className="mt-4 space-y-3">
              {[
                'A clean verdict with confidence and a one-line rationale',
                'Four primary metrics: demand, saturation, competition, and timing',
                'Expandable reasoning, recommendation, and build guidance',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm leading-6 text-slate-700">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 rounded-[28px] border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Try one of these</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">Type a product and location in the chat to open the analysis surface.</p>
            </div>
          </div>
          <div className="mt-4 grid gap-3">
            {examplePrompts.map((prompt) => (
              <div key={prompt} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
                <span className="pr-4 text-sm text-slate-700">{prompt}</span>
                <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
