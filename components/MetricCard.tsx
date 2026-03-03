import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

interface MetricCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  color?: 'default' | 'success' | 'warning' | 'danger';
  icon?: React.ReactNode;
  delay?: number;
}

export const MetricCard: React.FC<MetricCardProps> = ({ label, value, subValue, color = 'default', icon, delay = 0 }) => {
  const getColorClasses = () => {
    switch (color) {
      case 'success': return 'bg-emerald-50/50 border-emerald-100 text-emerald-900 hover:border-emerald-200 hover:bg-emerald-50';
      case 'warning': return 'bg-amber-50/50 border-amber-100 text-amber-900 hover:border-amber-200 hover:bg-amber-50';
      case 'danger': return 'bg-rose-50/50 border-rose-100 text-rose-900 hover:border-rose-200 hover:bg-rose-50';
      default: return 'bg-white border-slate-200 text-slate-800 hover:border-slate-300 hover:shadow-md';
    }
  };

  const getLabelColor = () => {
    switch (color) {
      case 'success': return 'text-emerald-600';
      case 'warning': return 'text-amber-600';
      case 'danger': return 'text-rose-600';
      default: return 'text-slate-500';
    }
  };

  const getValueColor = () => {
     switch (color) {
      case 'success': return 'text-emerald-700';
      case 'warning': return 'text-amber-700';
      case 'danger': return 'text-rose-700';
      default: return 'text-slate-900';
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={cn(
        "p-5 rounded-2xl border shadow-sm flex flex-col justify-between h-full transition-colors cursor-default",
        getColorClasses()
      )}
    >
      <div className="flex justify-between items-start">
        <span className={`text-[11px] font-bold uppercase tracking-widest ${getLabelColor()}`}>{label}</span>
        {icon && <div className={`${getLabelColor()} opacity-80`}>{icon}</div>}
      </div>
      <div className="mt-4">
        <div className={`text-3xl font-bold leading-none tracking-tight ${getValueColor()}`}>{value}</div>
        {subValue && <div className="text-xs mt-2 opacity-80 font-medium">{subValue}</div>}
        
        {/* Simple Progress Bar Visual */}
         {typeof value === 'number' && (
           <div className="w-full bg-slate-100 h-1.5 mt-4 rounded-full overflow-hidden">
             <motion.div 
               initial={{ width: 0 }}
               animate={{ width: `${Math.min(value, 100)}%` }}
               transition={{ duration: 1, delay: delay + 0.2, ease: "easeOut" }}
               className={cn(
                 "h-full rounded-full",
                 color === 'success' ? 'bg-emerald-500' : 
                 color === 'danger' ? 'bg-rose-500' : 
                 color === 'warning' ? 'bg-amber-500' : 'bg-slate-400'
               )} 
             />
           </div>
         )}
      </div>
    </motion.div>
  );
};