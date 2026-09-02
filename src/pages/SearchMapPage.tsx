import React from 'react';
import { useMission } from '../context/MissionContext';
import { SearchMap } from '../components/map/SearchMap';
import { Detection, Hazard } from '../types';
import {
  Compass,
  Navigation,
  MapPin,
  User,
  Flame,
} from 'lucide-react';

export const SearchMapPage: React.FC = () => {
  const { droneStatus, detections, hazards } = useMission();

  const victims = detections.filter((d: Detection) => d.type === 'Victim' && d.status !== 'DISMISSED');
  const activeHazards = hazards.filter((h: Hazard) => h.status !== 'DISMISSED');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-cyan-400" />
            <span>Tactical Search Area & Sector Grid Map</span>
          </h2>
          <p className="text-xs text-slate-400">
            Interactive 3×3 disaster search grid, autonomous path tracking, and localized survivor/threat pins
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono px-3 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
            Current Sector: <strong className="text-cyan-400 font-bold">{droneStatus.currentZone}</strong>
          </span>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Expanded Search Map Component (8 cols) */}
        <div className="xl:col-span-8 min-h-[580px]">
          <SearchMap compact={false} interactive={true} />
        </div>

        {/* Tactical Map Information Sidebar (4 cols) */}
        <div className="xl:col-span-4 space-y-5">
          {/* Active Drone Positioning */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-3">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 pb-2 border-b border-slate-800">
              <Navigation className="w-4 h-4 text-cyan-400" />
              <span>Drone Navigational Telemetry</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Target Waypoint:</span>
                <span className="font-mono text-cyan-300 font-bold">Zone {droneStatus.currentZone}</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Simulated GPS Fix:</span>
                <span className="font-mono text-emerald-400 font-bold">13.0827° N, 80.2707° E</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Heading / Bearing:</span>
                <span className="font-mono text-slate-200">{droneStatus.headingDegrees}° NE</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Ground Clearance:</span>
                <span className="font-mono text-slate-200">{droneStatus.altitudeMeters} m AGL</span>
              </div>
            </div>
          </div>

          {/* Map Hotspots Summary */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-3">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 pb-2 border-b border-slate-800">
              <MapPin className="w-4 h-4 text-rose-400" />
              <span>Grid Geo-Located Incidents</span>
            </h3>

            {victims.length === 0 && activeHazards.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs">
                No active victim or hazard map markers logged yet.
              </div>
            ) : (
              <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1 text-xs">
                {victims.map((v: Detection) => (
                  <div key={v.id} className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <User className="w-3.5 h-3.5 text-rose-400" />
                      <span className="font-bold text-rose-300">Victim in Zone {v.zone}</span>
                    </div>
                    <span className="font-mono text-[10px] text-slate-400 font-bold">{v.confidence}% Conf</span>
                  </div>
                ))}

                {activeHazards.map((h: Hazard) => (
                  <div key={h.id} className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Flame className="w-3.5 h-3.5 text-amber-400" />
                      <span className="font-bold text-amber-300">{h.type} in Zone {h.zone}</span>
                    </div>
                    <span className="font-mono text-[10px] text-slate-400 font-bold">{h.confidence}% Conf</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
