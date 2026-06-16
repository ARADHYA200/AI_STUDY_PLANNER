import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../ui/GlassCard';

const StatWidget = ({ title, value, subtitle, icon, trend, color = 'brand' }) => {
  const colorMap = {
    brand: 'text-brand-600 dark:text-brand-400 bg-brand-500/10',
    cyan: 'text-cyan-600 dark:text-cyan-400 bg-cyan-500/10',
    orange: 'text-orange-600 dark:text-orange-400 bg-orange-500/10',
    rose: 'text-rose-600 dark:text-rose-400 bg-rose-500/10',
  };

  return (
    <GlassCard className="flex flex-col justify-between h-full">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${colorMap[color]}`}>
          <span className="text-2xl">{icon}</span>
        </div>
        {trend && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${trend > 0 ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider">{title}</h3>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-3xl font-black text-slate-900 dark:text-white">{value}</span>
          {subtitle && <span className="text-xs font-medium text-slate-400">{subtitle}</span>}
        </div>
      </div>
    </GlassCard>
  );
};

export default StatWidget;
