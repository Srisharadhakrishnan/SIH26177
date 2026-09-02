import React, { useState } from 'react';
import { useMission } from '../context/MissionContext';
import { DroneStatusCard } from '../components/drone/DroneStatusCard';
import { MissionControls } from '../components/controls/MissionControls';
import { SEARCH_ROUTE } from '../data/mockData';
import { ZoneId, Hazard } from '../types';
import {
  SlidersHorizontal,
  Navigation,
  Zap,
  UserPlus,
  Flame,
} from 'lucide-react';

export const MissionControlPage: React.FC = () => {
  const {
    droneStatus,
    zones,
    simulateVictim,
    simulateHazard,
  } = useMission();

  const [customZone, setCustomZone] = useState<ZoneId>('B3');
  const [customHazardType, setCustomHazardType] = useState<Hazard['type']>('Fire');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Title */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-cyan-400" />
            <span>Mission Control & Flight Parameters</span>
          </h2>
          <p className="text-xs text-slate-400">
            Autonomous sweep route management, waypoint telemetry, and simulation injection cockpit
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono px-3 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
            Route Mode: Lawn-Mower (Boustrophedon)
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Telemetry & Interactive Waypoint Route Progress */}
        <div className="lg:col-span-7 space-y-6">
          <DroneStatusCard />

          {/* Autonomous Route Waypoint Matrix */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Navigation className="w-4 h-4 text-cyan-400" />
                <span>Autonomous Flight Waypoints (9 Sectors)</span>
              </h3>
              <span className="text-[11px] font-mono text-cyan-400">
                Current: {droneStatus.currentZone}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-3 sm:grid-cols-9 gap-2">
              {SEARCH_ROUTE.map((wpId, idx) => {
                const isCurrent = droneStatus.currentZone === wpId;
                const zoneData = zones.find(z => z.id === wpId);
                const isSearched = zoneData?.status === 'searched';

                return (
                  <div
                    key={wpId}
                    className={`p-2.5 rounded-lg border text-center transition ${
                      isCurrent
                        ? 'border-cyan-400 bg-cyan-950/60 shadow-md shadow-cyan-950 ring-1 ring-cyan-400'
                        : isSearched
                        ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300'
                        : 'border-slate-800 bg-slate-950 text-slate-400'
                    }`}
                  >
                    <div className="text-[10px] font-mono text-slate-400">WP {idx + 1}</div>
                    <div className="text-sm font-black font-mono text-white mt-0.5">{wpId}</div>
                    <div className="text-[9px] font-mono mt-1">
                      {isCurrent ? (
                        <span className="text-cyan-300 font-bold animate-pulse">ACTIVE</span>
                      ) : isSearched ? (
                        <span className="text-emerald-400">DONE</span>
                      ) : (
                        <span>WAIT</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
              <span>Trajectory Algorithm: <strong>Optimal Boustrophedon Grid Sweep</strong></span>
              <span className="font-mono text-cyan-400">Altitude: 32m AGL</span>
            </div>
          </div>
        </div>

        {/* Right Column: Mission Control & Custom Injection Cockpit */}
        <div className="lg:col-span-5 space-y-6">
          <MissionControls />

          {/* Precision Scenario Injection Box */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Custom Disaster Injection Tool</span>
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                SCENARIO BUILDER
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Target Sector Zone
                </label>
                <select
                  value={customZone}
                  onChange={(e) => setCustomZone(e.target.value as ZoneId)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  {SEARCH_ROUTE.map((z) => (
                    <option key={z} value={z}>
                      Sector {z} ({zones.find(zone => zone.id === z)?.terrain})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Hazard Classification Type
                </label>
                <select
                  value={customHazardType}
                  onChange={(e) => setCustomHazardType(e.target.value as Hazard['type'])}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="Fire">Fire / Hotspot</option>
                  <option value="Flooded Area">Flooded Area / Rising Water</option>
                  <option value="Debris">Debris Obstruction</option>
                  <option value="Damaged Structure">Damaged Structure / Collapse</option>
                  <option value="Vehicle">Submerged / Stranded Vehicle</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <button
                  onClick={() => simulateVictim(customZone)}
                  className="px-3 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-rose-950 transition"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Spawn Victim at {customZone}</span>
                </button>

                <button
                  onClick={() => simulateHazard(customHazardType, customZone)}
                  className="px-3 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-amber-950 transition"
                >
                  <Flame className="w-4 h-4" />
                  <span>Spawn Hazard at {customZone}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
