import React from 'react';
import { useMission } from '../context/MissionContext';
import { MissionHistoryItem } from '../types';
import {
  History,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertOctagon,
  User,
  Flame,
  FileText,
} from 'lucide-react';

export const MissionHistoryPage: React.FC = () => {
  const { missionHistory } = useMission();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <History className="w-5 h-5 text-cyan-400" />
            <span>Mission History & Incident Archive</span>
          </h2>
          <p className="text-xs text-slate-400">
            Post-mission telemetry logs, zone coverage reports, and historical victim discovery records
          </p>
        </div>

        <span className="text-xs font-mono px-3 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
          Archived Operations: {missionHistory.length}
        </span>
      </div>

      {/* Mission Cards List */}
      <div className="space-y-4">
        {missionHistory.map((mission: MissionHistoryItem) => {
          const isCompleted = mission.status === 'Completed';
          return (
            <div
              key={mission.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-xl p-5 shadow-xl transition space-y-4"
            >
              {/* Top Meta Line */}
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex items-center space-x-2.5">
                    <h3 className="text-base font-bold text-white">{mission.name}</h3>
                    <span
                      className={`px-2 py-0.5 rounded text-[10.5px] font-bold border flex items-center gap-1 ${
                        isCompleted
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 className="w-3 h-3" /> : <AlertOctagon className="w-3 h-3" />}
                      <span>{mission.status}</span>
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                      {mission.location}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {mission.date}
                    </span>
                    <span>•</span>
                    <span className="font-mono text-slate-400">ID: {mission.id}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 text-xs text-slate-300 font-mono bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Duration: {mission.durationMinutes} minutes</span>
                </div>
              </div>

              {/* Stats Highlights */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 text-xs">
                  <span className="text-slate-400 block mb-1">Zones Searched</span>
                  <span className="text-base font-bold text-white font-mono">
                    {mission.zonesSearched} / {mission.totalZones}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 text-xs">
                  <span className="text-slate-400 block mb-1 flex items-center gap-1">
                    <User className="w-3 h-3 text-rose-400" />
                    Victims Detected
                  </span>
                  <span className="text-base font-bold text-rose-400 font-mono">
                    {mission.victimsDetected}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 text-xs">
                  <span className="text-slate-400 block mb-1 flex items-center gap-1">
                    <Flame className="w-3 h-3 text-amber-400" />
                    Hazards Mapped
                  </span>
                  <span className="text-base font-bold text-amber-400 font-mono">
                    {mission.hazardsDetected}
                  </span>
                </div>
              </div>

              {/* Notes */}
              <div className="p-3 rounded-lg bg-slate-950/90 border border-slate-800 text-xs text-slate-300 leading-relaxed flex items-start gap-2">
                <FileText className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <p>{mission.notes}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
