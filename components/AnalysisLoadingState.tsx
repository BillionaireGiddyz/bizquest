import React from 'react';

export const AnalysisLoadingState: React.FC = () => {
  return (
    <section className="space-y-6 rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_24px_70px_-36px_rgba(15,23,42,0.24)]">
      <div className="animate-pulse space-y-4">
        <div className="h-3 w-32 rounded-full bg-slate-200" />
        <div className="h-10 w-2/3 rounded-2xl bg-slate-200" />
        <div className="h-5 w-1/2 rounded-full bg-slate-100" />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="animate-pulse rounded-[24px] border border-slate-200 bg-slate-50/80 p-5">
            <div className="h-3 w-20 rounded-full bg-slate-200" />
            <div className="mt-5 h-8 w-24 rounded-full bg-slate-200" />
            <div className="mt-4 h-4 w-full rounded-full bg-slate-100" />
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="animate-pulse rounded-[28px] border border-slate-200 bg-slate-50/60 p-6">
            <div className="h-3 w-28 rounded-full bg-slate-200" />
            <div className="mt-4 space-y-3">
              <div className="h-4 w-full rounded-full bg-slate-100" />
              <div className="h-4 w-5/6 rounded-full bg-slate-100" />
              <div className="h-4 w-2/3 rounded-full bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
