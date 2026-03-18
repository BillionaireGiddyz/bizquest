import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';

interface CollapsibleInsightSectionProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export const CollapsibleInsightSection: React.FC<CollapsibleInsightSectionProps> = ({
  title,
  subtitle,
  children,
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white shadow-[0_16px_40px_-28px_rgba(15,23,42,0.28)]">
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-4 rounded-[28px] px-6 py-5 text-left outline-none transition-colors hover:bg-slate-50/60 focus-visible:ring-2 focus-visible:ring-indigo-500/60"
      >
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">{title}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">{subtitle}</p>
        </div>
        <span
          className={cn(
            'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-slate-50 transition-transform duration-200',
            isOpen ? 'rotate-180 border-slate-300' : 'border-slate-200',
          )}
        >
          <ChevronDown className="h-4 w-4 text-slate-500" />
        </span>
      </button>

      <div className={cn('grid transition-[grid-template-rows] duration-300 ease-out', isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
        <div className="overflow-hidden">
          <div className="border-t border-slate-100 px-6 pb-6 pt-5">{children}</div>
        </div>
      </div>
    </section>
  );
};
