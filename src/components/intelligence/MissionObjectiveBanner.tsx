import React from 'react';
import { useMission } from '../../context/MissionContext';
import { Target, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';

export const MissionObjectiveBanner: React.FC = () => {
  const { currentObjective, droneStatus, survivors } = useMission();

  const highRiskCount = survivors.filter((s) => s.riskLevel === 'CRITICAL' || s.riskLevel === 'HIGH').length;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
      <div className="flex items-center space-x-3">
        <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shrink-0">
          <Target className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-cyan-400">
              Active Mission Objective
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60">
              DYNAMIC REPLANNING
            </span>
          </div>
          <p className="text-sm font-bold text-slate-100 mt-0.5">{currentObjective}</p>
        </div>
      </div>

      <div className="flex items-center space-x-2 shrink-0">
        {highRiskCount > 0 && (
          <span className="px-2.5 py-1 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-mono font-bold flex items-center gap-1.5 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{highRiskCount} High/Critical Urgent</span>
          </span>
        )}

        <div className="bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-400 font-mono text-[11px] flex items-center gap-1.5">
          <ShieldCheck className="w-3 h-3 text-cyan-400" />
          <span>Sector: <strong className="text-white">{droneStatus.currentZone}</strong></span>
        </div>
      </div>
    </div>
  );
};
