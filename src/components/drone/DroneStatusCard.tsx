import React from 'react';
import { useMission } from '../../context/MissionContext';
import { Plane, Battery, Radio, Eye, Compass, Gauge, AlertCircle, Shield } from 'lucide-react';

export const DroneStatusCard: React.FC = () => {
  const { droneStatus, manualOverrideNotice, setManualOverride } = useMission();

  const getMissionStateColor = (state: string) => {
    switch (state) {
      case 'SEARCHING':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'PAUSED':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'ABORTED':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'COMPLETED':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  const getFlightModeColor = (mode: string) => {
    switch (mode) {
      case 'AUTONOMOUS':
        return 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30';
      case 'MANUAL':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/40';
      case 'RTL':
        return 'bg-rose-500/10 text-rose-300 border-rose-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl relative overflow-hidden">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
            <Plane className="w-5 h-5 text-cyan-400 transform rotate-45" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400 uppercase font-mono">Drone ID:</span>
              <span className="text-sm font-bold text-white font-mono">{droneStatus.droneId}</span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1">
              <Shield className="w-3 h-3 text-cyan-400" />
              <span>SIMULATED FLIGHT TELEMETRY — No hardware connected</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${getFlightModeColor(droneStatus.flightMode)}`}>
            {droneStatus.flightMode}
          </span>
          <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border flex items-center gap-1.5 ${getMissionStateColor(droneStatus.missionState)}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
            {droneStatus.missionState}
          </span>
        </div>
      </div>

      {/* Manual Override Warning Banner if active */}
      {manualOverrideNotice && (
        <div className="my-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>{manualOverrideNotice}</span>
          </div>
          <button
            onClick={() => setManualOverride(false)}
            className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 font-semibold text-[11px] transition"
          >
            RETURN TO AUTONOMOUS
          </button>
        </div>
      )}

      {/* Telemetry Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-4">
        {/* Battery */}
        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span className="flex items-center gap-1.5">
              <Battery className="w-3.5 h-3.5 text-emerald-400" />
              Battery
            </span>
            <span className="text-[9px] uppercase px-1 rounded bg-slate-800 text-slate-400 font-mono">SIM</span>
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-lg font-bold text-slate-100 font-mono">{droneStatus.battery}%</span>
            <span className="text-[10px] text-emerald-400">LiPo 4S</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                droneStatus.battery > 50
                  ? 'bg-emerald-500'
                  : droneStatus.battery > 20
                  ? 'bg-amber-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${droneStatus.battery}%` }}
            ></div>
          </div>
        </div>

        {/* GPS Status */}
        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span className="flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              GPS Lock
            </span>
            <span className="text-[9px] uppercase px-1 rounded bg-cyan-950/80 text-cyan-300 font-mono">SIM</span>
          </div>
          <div className="text-xs font-semibold text-cyan-300 font-mono mt-1">
            {droneStatus.gpsStatus}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Zone: <span className="font-bold text-slate-200">{droneStatus.currentZone}</span> (14 Sats)
          </div>
        </div>

        {/* Communication Link */}
        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span className="flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-indigo-400" />
              Telemetry Link
            </span>
            <span className="text-[9px] uppercase px-1 rounded bg-indigo-950/80 text-indigo-300 font-mono">SIM</span>
          </div>
          <div className="text-xs font-semibold text-indigo-300 font-mono mt-1">
            {droneStatus.commsStatus}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Latency: <span className="text-emerald-400 font-mono">18 ms</span> (915 MHz)
          </div>
        </div>

        {/* AI Vision Status */}
        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              AI Inference
            </span>
            <span className="text-[9px] uppercase px-1 rounded bg-cyan-950/80 text-cyan-300 font-mono">SIM</span>
          </div>
          <div className="text-xs font-semibold text-emerald-300 font-mono mt-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            {droneStatus.aiVisionStatus}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Model: <span className="text-slate-300">YOLOv8-Rescue (Sim)</span>
          </div>
        </div>

        {/* Altitude */}
        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
          <div className="text-[11px] text-slate-400 mb-1">Altitude (AGL)</div>
          <div className="flex items-baseline space-x-1">
            <span className="text-lg font-bold text-slate-100 font-mono">{droneStatus.altitudeMeters}</span>
            <span className="text-xs text-slate-400 font-mono">meters</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Baro + LiDAR Sim</div>
        </div>

        {/* Ground Speed */}
        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
          <div className="text-[11px] text-slate-400 mb-1">Ground Speed</div>
          <div className="flex items-baseline space-x-1">
            <span className="text-lg font-bold text-slate-100 font-mono">{droneStatus.speedMps}</span>
            <span className="text-xs text-slate-400 font-mono">m/s</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">{(droneStatus.speedMps * 3.6).toFixed(1)} km/h</div>
        </div>

        {/* Heading */}
        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
          <div className="text-[11px] text-slate-400 mb-1">Heading</div>
          <div className="flex items-baseline space-x-1">
            <span className="text-lg font-bold text-slate-100 font-mono">{droneStatus.headingDegrees}°</span>
            <span className="text-xs text-slate-400 font-mono">NE</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Mag Compass Sim</div>
        </div>

        {/* Hardware Status Disclosure */}
        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
          <div className="text-[11px] text-slate-400 mb-1">Flight Controller</div>
          <div className="text-[11px] font-bold text-amber-400/90 font-mono leading-tight">
            NOT CONNECTED
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Software Emulation</div>
        </div>
      </div>
    </div>
  );
};
