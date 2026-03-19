import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, Clock, History, Trash2, X } from 'lucide-react';
import { AnalysisHistoryItem } from '../types';
import { cn } from '../lib/utils';

interface HistorySidebarProps {
  history: AnalysisHistoryItem[];
  onSelect: (item: AnalysisHistoryItem) => void;
  onClear: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({ history, onSelect, onClear, isOpen, setIsOpen }) => {
  const getVerdictBorder = (recommendation?: string) => {
    if (recommendation === 'GO') return 'border-l-[#10b981]';
    if (recommendation === 'BE CAREFUL') return 'border-l-[#f59e0b]';
    if (recommendation === 'AVOID') return 'border-l-[#ef4444]';
    return 'border-l-white/10';
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="workspace-history-sidebar-backdrop fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      ) : null}

      <motion.div
        initial={false}
        animate={{
          x: isOpen ? 0 : '-100%',
          width: isOpen ? '18rem' : '0rem',
          opacity: isOpen ? 1 : 0.5,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={cn(
          'workspace-history-sidebar fixed left-0 top-0 z-50 flex h-full flex-col overflow-hidden border-r border-white/8 bg-[rgba(10,13,20,0.98)] shadow-2xl shadow-black/40 lg:static lg:shadow-none',
          !isOpen && 'lg:hidden',
        )}
        style={{ width: isOpen ? '18rem' : '0' }}
      >
        <div className="workspace-history-sidebar-header flex shrink-0 items-center justify-between border-b border-white/6 bg-white/[0.02] p-5">
          <h2 className="workspace-history-sidebar-title flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white">
            <History className="h-4 w-4 text-cyan-300" />
            History <span className="text-xs font-normal text-slate-500">({history.length})</span>
          </h2>

          <div className="flex items-center gap-1">
            {history.length > 0 ? (
              <button
                onClick={onClear}
                title="Clear history"
                className="workspace-history-sidebar-action rounded-full p-1 text-slate-500 transition-colors hover:bg-white/6 hover:text-rose-300"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            ) : null}

            <button
              onClick={() => setIsOpen(false)}
              className="workspace-history-sidebar-action rounded-full p-1 text-slate-500 transition-colors hover:bg-white/6 hover:text-white lg:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="workspace-history-sidebar-body flex-1 space-y-1 overflow-y-auto p-3">
          {history.length === 0 ? (
            <div className="workspace-history-sidebar-empty flex h-64 flex-col items-center justify-center px-6 text-center text-sm text-slate-500">
              <div className="workspace-history-sidebar-empty-icon mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/6">
                <Clock className="h-6 w-6 text-slate-500" />
              </div>
              <p className="font-medium text-white">No search history</p>
              <p className="mt-1 text-xs">Your recent market analyses will appear here.</p>
            </div>
          ) : null}

          <AnimatePresence initial={false}>
            {history.map((item, index) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  onSelect(item);
                  setIsOpen(false);
                }}
                className={cn(
                  'workspace-history-sidebar-row group relative w-full overflow-hidden rounded-xl border border-white/6 border-l-[3px] p-3.5 text-left transition-all',
                  getVerdictBorder(item.recommendation),
                  item.recommendation === 'GO'
                    ? 'bg-emerald-500/[0.03] hover:bg-emerald-500/[0.06] hover:border-l-emerald-400'
                    : item.recommendation === 'BE CAREFUL'
                      ? 'bg-amber-500/[0.03] hover:bg-amber-500/[0.06] hover:border-l-amber-400'
                      : item.recommendation === 'AVOID'
                        ? 'bg-rose-500/[0.03] hover:bg-rose-500/[0.06] hover:border-l-rose-400'
                        : 'bg-white/[0.02] hover:bg-white/[0.04] hover:border-l-white/20',
                )}
              >
                <div className="relative z-10 mb-1.5 flex items-start justify-between">
                  <span className="w-[90%] truncate text-sm font-semibold text-white transition-colors group-hover:text-cyan-200">
                    {item.productName}
                  </span>
                  <ChevronRight className="h-4 w-4 transform text-slate-500 transition-colors group-hover:translate-x-0.5 group-hover:text-cyan-300" />
                </div>

                <div className="relative z-10 flex items-center justify-between text-xs">
                  <span className="max-w-[65%] truncate font-medium text-slate-400">{item.location}</span>
                  <div
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                      item.recommendation === 'GO'
                        ? 'bg-emerald-500/12 text-emerald-200'
                        : item.recommendation === 'AVOID'
                          ? 'bg-rose-500/12 text-rose-200'
                          : 'bg-amber-500/12 text-amber-200',
                    )}
                  >
                    {item.recommendation}
                  </div>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
