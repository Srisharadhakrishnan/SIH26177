import React, { useState, useEffect } from 'react';
import { useMission } from '../../context/MissionContext';
import { Shield, Radio, Battery, Play, AlertOctagon, RotateCcw, Clock } from 'lucide-react';

export const Header: React.FC = () => {
  const { droneStatus, startDemoMode, isDemoRunning, resetMission, alerts } = useMission();
  const [currentDateTime, setCurrentDateTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentDateTime(
        now.toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric',
        }) + ' ' + now.toLocaleTimeString([], { hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const unverifiedAlertsCount = alerts.filter(a => a.status === 'REQUIRES_VERIFICATION').length;

  return (
    <header className="bg-[#0b1120] border-b border-slate-800 text-slate-100 px-4 lg:px-6 py-3 sticky top-0 z-30 shadow-lg">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        {/* Logo & System Title */}
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shadow-inner shadow-cyan-500/20">
            <Shield className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-extrabold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300">
                JEEVAN-AIR
              </h1>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                SOFTWARE PROTOTYPE
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium tracking-tight">
              Aerial Intelligence & Rescue <span className="text-slate-600 font-normal">| TEAM ZYNTAX · SIH26177 · Qualcomm Inc</span>
            </p>
          </div>
        </div>

        {/* Mission Info & Live Indicators */}
        <div className="flex flex-wrap items-center gap-3 text-xs w-full md:w-auto justify-between md:justify-end">
          {/* Current Mission */}
          <div className="bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-md flex items-center space-x-2">
            <span className="text-slate-400 font-medium">Mission:</span>
            <span className="text-cyan-300 font-semibold">{droneStatus.mission}</span>
          </div>

          {/* Clock */}
          <div className="bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-md flex items-center space-x-1.5 text-slate-300 font-mono">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{currentDateTime}</span>
          </div>

          {/* Quick Hardware Simulation Status */}
          <div className="hidden lg:flex items-center space-x-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-md text-slate-300">
            <div className="flex items-center gap-1 text-slate-400">
              <Battery className="w-3.5 h-3.5 text-emerald-400" />
              <span>{droneStatus.battery}%</span>
            </div>
            <span className="text-slate-700">|</span>
            <div className="flex items-center gap-1 text-cyan-400 font-medium">
              <Radio className="w-3.5 h-3.5" />
              <span>SIM GPS</span>
            </div>
          </div>

          {/* Demo Mode & Quick Reset Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={startDemoMode}
              disabled={isDemoRunning}
              className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 text-xs transition-all shadow-md ${
                isDemoRunning
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                  : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-900/40 hover:shadow-cyan-500/20'
              }`}
              title="Launch deterministic 60-90 second presentation sequence"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isDemoRunning ? 'DEMO RUNNING...' : 'DEMO MODE'}</span>
            </button>

            <button
              onClick={resetMission}
              className="p-1.5 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
              title="Reset current mission to initial state"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
