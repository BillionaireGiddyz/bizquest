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
      case 'success': return 'border-emerald-500/20 bg-emerald-500/[0.08] text-emerald-50 hover:border-emerald-400/30 hover:bg-emerald-500/[0.1]';
      case 'warning': return 'border-amber-500/20 bg-amber-500/[0.08] text-amber-50 hover:border-amber-400/30 hover:bg-amber-500/[0.1]';
      case 'danger': return 'border-rose-500/20 bg-rose-500/[0.08] text-rose-50 hover:border-rose-400/30 hover:bg-rose-500/[0.1]';
      default: return 'border-white/8 bg-[rgba(255,255,255,0.03)] text-slate-100 hover:border-cyan-400/20 hover:bg-[rgba(255,255,255,0.04)]';
    }
  };

  const getLabelColor = () => {
    switch (color) {
      case 'success': return 'text-emerald-300';
      case 'warning': return 'text-amber-300';
      case 'danger': return 'text-rose-300';
      default: return 'text-slate-400';
    }
  };

  const getValueColor = () => {
    switch (color) {
      case 'success': return 'text-emerald-200';
      case 'warning': return 'text-amber-200';
      case 'danger': return 'text-rose-200';
      default: return 'text-white';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={cn(
        'flex h-full cursor-default flex-col justify-between rounded-[20px] border p-5 shadow-[0_16px_32px_-24px_rgba(2,6,23,0.72)] transition-all',
        getColorClasses(),
      )}
    >
      <div className="flex justify-between items-start">
        <span className={`text-[11px] font-bold uppercase tracking-widest ${getLabelColor()}`}>{label}</span>
        {icon && <div className={`${getLabelColor()} opacity-80`}>{icon}</div>}
      </div>
      <div className="mt-4">
        <div className={`text-3xl font-bold leading-none tracking-tight ${getValueColor()}`}>{value}</div>
        {subValue && <div className="text-xs mt-2 opacity-80 font-medium">{subValue}</div>}

        {typeof value === 'number' && (
          <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/8">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(value, 100)}%` }}
              transition={{ duration: 1, delay: delay + 0.2, ease: 'easeOut' }}
            className={cn(
              'h-full rounded-full',
              color === 'success' ? 'bg-emerald-400' :
              color === 'danger' ? 'bg-rose-400' :
              color === 'warning' ? 'bg-amber-400' : 'bg-cyan-400',
            )}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
};
