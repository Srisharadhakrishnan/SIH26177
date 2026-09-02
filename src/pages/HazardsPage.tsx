import React, { useState } from 'react';
import { useMission } from '../context/MissionContext';
import { Hazard } from '../types';
import {
  Flame,
  AlertTriangle,
  Waves,
  Boxes,
  Building2,
  Car,
  ShieldAlert,
  MapPin,
  Eye,
} from 'lucide-react';

export const HazardsPage: React.FC = () => {
  const { hazards, viewLocation, simulateHazard } = useMission();
  const [selectedHazardModal, setSelectedHazardModal] = useState<Hazard | null>(null);

  const totalHazards = hazards.length;
  const highPriority = hazards.filter((h: Hazard) => h.priority === 'HIGH' || h.priority === 'CRITICAL').length;
  const reviewRequired = hazards.filter((h: Hazard) => h.status === 'REVIEW REQUIRED').length;

  const hazardTypeIcons: Record<Hazard['type'], React.ComponentType<{ className?: string }>> = {
    'Fire': Flame,
    'Flooded Area': Waves,
    'Debris': Boxes,
    'Damaged Structure': Building2,
    'Vehicle': Car,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Title */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400" />
            <span>Hazard Intelligence & Environmental Threats</span>
          </h2>
          <p className="text-xs text-slate-400">
            Automated detection and mapping of secondary risks to protect first responders on the ground
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => simulateHazard('Flooded Area')}
            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>+ Simulate Hazard</span>
          </button>
        </div>
      </div>

      {/* Hazard KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Total Hazards</p>
            <h3 className="text-2xl font-black text-slate-100 font-mono mt-1">{totalHazards}</h3>
          </div>
          <div className="p-3 rounded-lg bg-slate-800 text-slate-300">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">High Priority Threats</p>
            <h3 className="text-2xl font-black text-rose-400 font-mono mt-1">{highPriority}</h3>
          </div>
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Review Required</p>
            <h3 className="text-2xl font-black text-amber-400 font-mono mt-1">{reviewRequired}</h3>
          </div>
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Eye className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Hazard Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {hazards.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs bg-slate-900/60 border border-slate-800 rounded-xl">
            No environmental hazards detected in active sweep area.
          </div>
        ) : (
          hazards.map((hazard: Hazard) => {
            const Icon = hazardTypeIcons[hazard.type] || AlertTriangle;
            return (
              <div
                key={hazard.id}
                onClick={() => setSelectedHazardModal(hazard)}
                className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 rounded-xl p-5 shadow-xl transition cursor-pointer group space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 group-hover:bg-amber-500/20 transition">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-100">{hazard.type}</h4>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Zone {hazard.zone} • {hazard.timestamp}
                      </span>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded bg-slate-950 font-mono text-xs font-bold text-amber-300 border border-slate-800">
                    {hazard.confidence}%
                  </span>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {hazard.threatDescription}
                </p>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    Radius: <strong className="text-slate-200 font-mono">{hazard.affectedRadiusMeters}m</strong>
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      viewLocation(hazard.zone);
                    }}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium flex items-center gap-1 transition"
                  >
                    <MapPin className="w-3 h-3 text-cyan-400" />
                    <span>View Map</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Hazard Detail Modal */}
      {selectedHazardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <Flame className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">⚠️ HAZARD DETECTED</h3>
                  <p className="text-xs text-slate-400 font-mono">ID: {selectedHazardModal.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedHazardModal(null)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400 font-semibold block mb-1">Threat Type:</span>
                <span className="text-sm font-bold text-amber-300 font-mono">
                  {selectedHazardModal.type}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block mb-0.5">Zone Location:</span>
                  <span className="font-bold text-slate-100 font-mono">Zone {selectedHazardModal.zone}</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block mb-0.5">Confidence:</span>
                  <span className="font-bold text-cyan-300 font-mono">{selectedHazardModal.confidence}%</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400 font-semibold block mb-1">Responder Assessment:</span>
                <p className="text-slate-200 leading-relaxed">{selectedHazardModal.threatDescription}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
              <button
                onClick={() => {
                  viewLocation(selectedHazardModal.zone);
                  setSelectedHazardModal(null);
                }}
                className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition"
              >
                Focus on Map
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
