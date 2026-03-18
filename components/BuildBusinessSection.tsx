import React from 'react';
import { CollapsibleInsightSection } from './CollapsibleInsightSection';

interface BuildBusinessSectionProps {
  startupCost: string;
  pricingHint: string;
  firstMarketingAngle: string;
  checklist: string[];
}

export const BuildBusinessSection: React.FC<BuildBusinessSectionProps> = ({
  startupCost,
  pricingHint,
  firstMarketingAngle,
  checklist,
}) => {
  return (
    <CollapsibleInsightSection
      title="Build this business"
      subtitle="Open the optional execution layer for a practical launch starting point."
    >
      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Startup cost</p>
            <p className="mt-3 text-base font-semibold text-slate-900">{startupCost}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Pricing hint</p>
            <p className="mt-3 text-base font-semibold text-slate-900">{pricingHint}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">First marketing angle</p>
            <p className="mt-3 text-base font-semibold text-slate-900">{firstMarketingAngle}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Launch checklist</p>
          <ul className="mt-4 space-y-3">
            {checklist.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm leading-6 text-slate-700">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </CollapsibleInsightSection>
  );
};
