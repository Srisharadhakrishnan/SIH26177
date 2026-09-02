import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor?: 'cyan' | 'red' | 'amber' | 'emerald' | 'blue' | 'purple';
  trend?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subValue,
  icon: Icon,
  accentColor = 'cyan',
  trend,
}) => {
  const colorMap = {
    cyan: {
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20',
      text: 'text-cyan-400',
      valueText: 'text-cyan-300',
      glow: 'shadow-cyan-950/30',
    },
    red: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
      text: 'text-red-400',
      valueText: 'text-red-300',
      glow: 'shadow-red-950/30',
    },
    amber: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      text: 'text-amber-400',
      valueText: 'text-amber-300',
      glow: 'shadow-amber-950/30',
    },
    emerald: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      text: 'text-emerald-400',
      valueText: 'text-emerald-300',
      glow: 'shadow-emerald-950/30',
    },
    blue: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      text: 'text-blue-400',
      valueText: 'text-blue-300',
      glow: 'shadow-blue-950/30',
    },
    purple: {
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
      text: 'text-purple-400',
      valueText: 'text-purple-300',
      glow: 'shadow-purple-950/30',
    },
  };

  const scheme = colorMap[accentColor];

  return (
    <div
      className={`bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all duration-200 shadow-lg ${scheme.glow} relative overflow-hidden`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
            {label}
          </p>
          <div className="flex items-baseline space-x-2">
            <h3 className={`text-2xl font-black tracking-tight font-mono-code ${scheme.valueText}`}>
              {value}
            </h3>
            {subValue && (
              <span className="text-xs text-slate-400 font-medium">{subValue}</span>
            )}
          </div>
        </div>
        <div className={`p-2.5 rounded-lg ${scheme.bg} border ${scheme.border}`}>
          <Icon className={`w-5 h-5 ${scheme.text}`} />
        </div>
      </div>

      {trend && (
        <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
          <span>{trend}</span>
          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
            LIVE
          </span>
        </div>
      )}
    </div>
  );
};
