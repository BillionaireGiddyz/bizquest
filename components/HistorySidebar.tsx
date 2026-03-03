import React from 'react';
import { AnalysisHistoryItem } from '../types';
import { Clock, ChevronRight, Trash2, History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

interface HistorySidebarProps {
  history: AnalysisHistoryItem[];
  onSelect: (item: AnalysisHistoryItem) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({ history, onSelect, isOpen, setIsOpen }) => {
  return (
    <AnimatePresence>
      {/* Overlay for mobile */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar Content */}
      <motion.div 
        initial={false}
        animate={{ 
          x: isOpen ? 0 : '-100%',
          width: isOpen ? '18rem' : '0rem', // 18rem = 72 (w-72)
          opacity: isOpen ? 1 : 0.5
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn(
          "fixed lg:static top-0 left-0 h-full bg-white border-r border-slate-200 shadow-2xl lg:shadow-none z-50 overflow-hidden flex flex-col",
          !isOpen && "lg:hidden" // Hide completely on desktop when closed to prevent layout shift issues if width animation isn't enough
        )}
        style={{ width: isOpen ? '18rem' : '0' }}
      >
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
            <h2 className="font-bold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wider">
                <History className="w-4 h-4 text-indigo-500" />
                History <span className="text-slate-400 text-xs font-normal">({history.length})</span>
            </h2>
            <button onClick={() => setIsOpen(false)} className="lg:hidden text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100">
                ✕
            </button>
        </div>
        
        <div className="overflow-y-auto flex-1 p-3 space-y-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
            {history.length === 0 && (
                <div className="flex flex-col items-center justify-center h-64 text-sm text-slate-400 text-center px-6">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                        <Clock className="w-6 h-6 text-slate-300" />
                    </div>
                    <p className="font-medium text-slate-500">No search history</p>
                    <p className="text-xs mt-1">Your recent market analyses will appear here.</p>
                </div>
            )}
            
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
                    className="w-full text-left p-3.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all group relative overflow-hidden"
                >
                    <div className="flex justify-between items-start mb-1.5 relative z-10">
                        <span className="font-semibold text-slate-700 text-sm truncate w-[90%] group-hover:text-indigo-700 transition-colors">{item.productName}</span>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 transition-colors transform group-hover:translate-x-0.5" />
                    </div>
                    <div className="flex justify-between items-center text-xs relative z-10">
                        <span className="text-slate-500 truncate max-w-[65%] font-medium">{item.location}</span>
                        <div className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide",
                          item.recommendation === 'GO' ? 'bg-emerald-100 text-emerald-700' : 
                          item.recommendation === 'AVOID' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                        )}>
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