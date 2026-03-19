import React, { useEffect, useRef, useState } from 'react';
import { AnalysisHistoryItem } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Clock3, History, Search, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface DesktopHistoryMenuProps {
  history: AnalysisHistoryItem[];
  onSelect: (item: AnalysisHistoryItem) => void;
  onClear: () => void;
}

export const DesktopHistoryMenu: React.FC<DesktopHistoryMenuProps> = ({
  history,
  onSelect,
  onClear,
}) => {
  const getVerdictBorder = (recommendation?: string) => {
    if (recommendation === 'GO') return 'border-l-[#10b981]';
    if (recommendation === 'BE CAREFUL') return 'border-l-[#f59e0b]';
    if (recommendation === 'AVOID') return 'border-l-[#ef4444]';
    return 'border-l-white/10';
  };

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      <motion.button
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(prev => !prev)}
        className={cn(
          'group flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-[0_18px_40px_-28px_rgba(2,6,23,0.85)] transition-all',
          isOpen
            ? 'border-cyan-400/18 bg-[rgba(17,24,39,0.92)] shadow-[0_24px_48px_-28px_rgba(34,211,238,0.28)]'
            : 'border-white/8 bg-[rgba(17,24,39,0.84)] hover:border-cyan-400/18 hover:bg-[rgba(17,24,39,0.92)]'
        )}
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(34,211,238,0.18),rgba(124,58,237,0.24))] text-white shadow-lg shadow-cyan-950/40 ring-1 ring-white/10">
          <History className="h-5 w-5" />
        </div>
        <div className="min-w-0 text-left">
          <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
            History
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">
              {history.length > 0 ? `${history.length} saved analyses` : 'No saved analyses'}
            </span>
            {history.length > 0 && (
              <span className="rounded-full bg-cyan-500/12 px-2 py-0.5 text-[11px] font-bold text-cyan-200">
                Ready
              </span>
            )}
          </div>
        </div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            className="absolute right-0 top-[calc(100%+0.85rem)] z-40 w-[26rem] overflow-hidden rounded-[28px] border border-white/8 bg-[rgba(10,13,20,0.96)] shadow-2xl shadow-black/40"
          >
            <div className="relative overflow-hidden border-b border-white/6 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-5 py-5 text-white">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.22),_transparent_40%),radial-gradient(circle_at_bottom_left,_rgba(14,165,233,0.16),_transparent_35%)]" />
              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-indigo-200/80">
                    Analysis Archive
                  </p>
                  <h2 className="mt-1 text-lg font-semibold tracking-tight">
                    Reopen a past market read
                  </h2>
                  <p className="mt-1 text-sm text-slate-300">
                    Jump back into a previous verdict without losing your current workspace.
                  </p>
                </div>
                {history.length > 0 && (
                  <button
                    onClick={() => {
                      onClear();
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/8 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/12"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-[26rem] overflow-y-auto bg-[linear-gradient(180deg,rgba(10,13,20,0.94),rgba(10,13,20,0.98))] p-3">
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-[24px] border border-dashed border-white/8 bg-white/[0.03] px-8 py-12 text-center shadow-inner shadow-black/20">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/6 text-slate-500">
                    <Clock3 className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-semibold text-white">No history yet</p>
                  <p className="mt-1 max-w-xs text-sm text-slate-500">
                    Each completed market analysis will appear here for quick reloads.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {history.map((item, index) => (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      onClick={() => {
                        onSelect(item);
                        setIsOpen(false);
                      }}
                      className={cn(
                        'group w-full rounded-[22px] border border-white/8 border-l-[3px] bg-white/[0.03] p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:bg-white/[0.05] hover:shadow-lg hover:shadow-cyan-950/30',
                        getVerdictBorder(item.recommendation),
                        item.recommendation === 'GO'
                          ? 'hover:border-l-emerald-400'
                          : item.recommendation === 'BE CAREFUL'
                            ? 'hover:border-l-amber-400'
                            : item.recommendation === 'AVOID'
                              ? 'hover:border-l-rose-400'
                              : 'hover:border-l-white/20',
                      )}
                    >
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                            <Search className="h-3.5 w-3.5" />
                            {item.location}
                          </div>
                          <h3 className="mt-2 truncate text-sm font-semibold text-white group-hover:text-cyan-200">
                            {item.productName}
                          </h3>
                        </div>
                        <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-slate-500 transition-all group-hover:translate-x-0.5 group-hover:text-cyan-300" />
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <span className="truncate text-xs text-slate-400">
                          {item.userQuestion}
                        </span>
                        <span
                          className={cn(
                            'shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide',
                            item.recommendation === 'GO'
                              ? 'bg-emerald-500/12 text-emerald-200'
                              : item.recommendation === 'AVOID'
                              ? 'bg-rose-500/12 text-rose-200'
                              : 'bg-amber-500/12 text-amber-200'
                          )}
                        >
                          {item.recommendation}
                        </span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
