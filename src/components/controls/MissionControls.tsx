import React from 'react';
import { useMission } from '../../context/MissionContext';
import {
  Play,
  Pause,
  RotateCcw,
  Square,
  UserPlus,
  Flame,
  Gamepad2,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

export const MissionControls: React.FC = () => {
  const {
    droneStatus,
    startAutonomousSearch,
    pauseMission,
    resumeMission,
    abortMission,
    resetMission,
    startDemoMode,
    simulateVictim,
    simulateUncertainSurvivor,
    simulateHazard,
    setManualOverride,
    isDemoRunning,
  } = useMission();

  const isSearching = droneStatus.missionState === 'SEARCHING';
  const isPaused = droneStatus.missionState === 'PAUSED';
  const isManual = droneStatus.flightMode === 'MANUAL';

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Gamepad2 className="w-4 h-4 text-cyan-400" />
            <span>Mission Control Panel</span>
          </h3>
          <p className="text-[11px] text-slate-400">
            Interactive mission simulation controls & emergency trigger injection
          </p>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
          COMMAND ENGINE
        </span>
      </div>

      {/* Primary Mission Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Start / Resume */}
        {!isSearching ? (
          <button
            onClick={isPaused ? resumeMission : startAutonomousSearch}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg font-semibold text-xs text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-950 transition active:scale-[0.98]"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{isPaused ? 'RESUME SEARCH' : 'START AUTONOMOUS SEARCH'}</span>
          </button>
        ) : (
          <button
            onClick={pauseMission}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg font-semibold text-xs text-amber-100 bg-amber-600 hover:bg-amber-500 shadow-md shadow-amber-950 transition active:scale-[0.98]"
          >
            <Pause className="w-4 h-4" />
            <span>PAUSE MISSION</span>
          </button>
        )}

        {/* Abort */}
        <button
          onClick={abortMission}
          disabled={droneStatus.missionState === 'IDLE' || droneStatus.missionState === 'ABORTED'}
          className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg font-semibold text-xs text-rose-200 bg-rose-950/80 hover:bg-rose-900 border border-rose-800/80 disabled:opacity-40 disabled:cursor-not-allowed transition active:scale-[0.98]"
        >
          <Square className="w-4 h-4" />
          <span>ABORT MISSION</span>
        </button>

        {/* Manual Override */}
        <button
          onClick={() => setManualOverride(!isManual)}
          className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg font-semibold text-xs border transition active:scale-[0.98] ${
            isManual
              ? 'bg-amber-500 text-black border-amber-400 font-bold'
              : 'bg-slate-800 hover:bg-slate-750 text-amber-300 border-amber-500/30'
          }`}
        >
          <Gamepad2 className="w-4 h-4" />
          <span>{isManual ? 'RETURN TO AUTO' : 'MANUAL OVERRIDE'}</span>
        </button>

        {/* Reset Mission */}
        <button
          onClick={resetMission}
          className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg font-semibold text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition active:scale-[0.98]"
        >
          <RotateCcw className="w-4 h-4" />
          <span>RESET MISSION</span>
        </button>
      </div>

      {/* Presentation Demo Mode Banner Button */}
      <div className="pt-2 border-t border-slate-800/80">
        <button
          onClick={startDemoMode}
          disabled={isDemoRunning}
          className={`w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-xs font-bold transition shadow-lg ${
            isDemoRunning
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 animate-pulse'
              : 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-cyan-950/50'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>
            {isDemoRunning
              ? 'DEMO MODE IN PROGRESS — RUNNING 60-90s SEQUENCE...'
              : 'START DEMO MODE (60-90s Presentation Sequence)'}
          </span>
        </button>
      </div>

      {/* Manual Simulation Triggers */}
      <div className="pt-2 border-t border-slate-800/80">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Test Trigger Injections (Rescue Intelligence Demo)
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            onClick={() => simulateVictim()}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg font-medium text-xs text-rose-300 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 transition active:scale-[0.98]"
          >
            <UserPlus className="w-4 h-4 text-rose-400" />
            <span>+ CRITICAL SURVIVOR</span>
          </button>

          <button
            onClick={() => simulateUncertainSurvivor()}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg font-medium text-xs text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 transition active:scale-[0.98]"
            title="Inject an uncertain detection to test Autonomous Second-Look verification"
          >
            <RefreshCw className="w-4 h-4 text-amber-400" />
            <span>+ UNCERTAIN (2ND-LOOK)</span>
          </button>

          <button
            onClick={() => simulateHazard('Fire')}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg font-medium text-xs text-orange-300 bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 transition active:scale-[0.98]"
          >
            <Flame className="w-4 h-4 text-orange-400" />
            <span>+ FIRE HAZARD</span>
          </button>
        </div>
      </div>
    </div>
  );
};
