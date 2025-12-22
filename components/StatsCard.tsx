import React, { memo } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: React.ReactNode;
  colorClass: string;
  progress?: number; // 0 to 100
}

export const StatsCard: React.FC<StatsCardProps> = memo(({ title, value, subtext, icon, colorClass, progress }) => {
  // Extract base color name (e.g., 'yellow' from 'text-yellow-400')
  const baseColor = colorClass.includes('yellow') ? 'yellow' : 'green';
  const glowClass = baseColor === 'yellow' ? 'shadow-yellow-500/10' : 'shadow-green-500/10';

  return (
    <div className={`bg-slate-800/60 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-slate-700/50 relative overflow-hidden group ${glowClass}`}>
      
      {/* Background Gradient Spot */}
      <div className={`absolute -right-6 -top-6 w-20 h-20 rounded-full blur-2xl opacity-10 transition-opacity group-hover:opacity-20 ${baseColor === 'yellow' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>

      <div className="flex justify-between items-start mb-3 relative z-10">
        <div>
          <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-1">{title}</p>
          <h3 className="text-2xl font-black text-white tracking-tight tabular-nums">{value}</h3>
        </div>
        <div className={`p-2 rounded-xl ${colorClass.replace('text-', 'bg-')}/10 border ${colorClass.replace('text-', 'border-')}/20 ${colorClass}`}>
          {icon}
        </div>
      </div>
      
      {progress !== undefined && (
        <div className="relative z-10">
            <div className="flex justify-between items-end mb-1">
                 {subtext && <p className="text-[10px] text-slate-400 font-medium">{subtext}</p>}
                 <p className={`text-[10px] font-bold ${colorClass}`}>{Math.round(progress)}%</p>
            </div>
            <div className="w-full bg-slate-700/50 h-1.5 rounded-full overflow-hidden">
                <div 
                    className={`h-1.5 rounded-full transition-all duration-1000 ease-out ${colorClass.replace('text-', 'bg-')}`} 
                    style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
                />
            </div>
        </div>
      )}
    </div>
  );
});