import React, { useState } from 'react';
import { useMission } from '../context/MissionContext';
import { Detection } from '../types';
import {
  Scan,
  User,
  Flame,
  Search,
  MapPin,
} from 'lucide-react';

export const DetectionsPage: React.FC = () => {
  const {
    detections,
    survivors,
    setSelectedDetection,
    markDetectionVerified,
    dismissDetection,
    viewLocation,
  } = useMission();

  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredDetections = detections.filter((d: Detection) => {
    const matchesType =
      filterType === 'ALL' ||
      (filterType === 'VICTIMS' && d.type === 'Victim') ||
      (filterType === 'HAZARDS' && d.type === 'Hazard') ||
      (filterType === 'OBJECTS' && d.type === 'Object');

    const matchesQuery =
      d.subType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.zone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.id.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesType && matchesQuery;
  });

  const getPriorityBadge = (priority: Detection['priority']) => {
    switch (priority) {
      case 'CRITICAL':
      case 'HIGH':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'MEDIUM':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'LOW':
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getStatusBadge = (status: Detection['status']) => {
    switch (status) {
      case 'VERIFIED':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'DISMISSED':
        return 'bg-slate-800 text-slate-400 border-slate-700';
      case 'REQUIRES_VERIFICATION':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Title */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Scan className="w-5 h-5 text-cyan-400" />
            <span>AI Detections Log & Classification Matrix</span>
          </h2>
          <p className="text-xs text-slate-400">
            Real-time neural network detection repository with human responder verification workflow
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="px-3 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
            Total Detections: <strong className="text-cyan-400">{detections.length}</strong>
          </span>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by label, zone (e.g. B3), or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center space-x-1.5 bg-slate-950 border border-slate-800 p-1 rounded-lg text-xs">
          {['ALL', 'VICTIMS', 'HAZARDS'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded font-medium text-xs transition ${
                filterType === t
                  ? 'bg-cyan-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Detection</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Confidence</th>
                <th className="py-3.5 px-4">Zone</th>
                <th className="py-3.5 px-4">Time</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredDetections.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No detections registered yet. Start autonomous search, demo mode, or simulate a victim/hazard.
                  </td>
                </tr>
              ) : (
                filteredDetections.map((det: Detection) => {
                  const isVictim = det.type === 'Victim';
                  return (
                    <tr
                      key={det.id}
                      onClick={() => setSelectedDetection(det)}
                      className="hover:bg-slate-800/50 cursor-pointer transition"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2.5">
                          <div
                            className={`p-1.5 rounded-md ${
                              isVictim
                                ? 'bg-rose-500/15 text-rose-400'
                                : 'bg-amber-500/15 text-amber-400'
                            }`}
                          >
                            {isVictim ? <User className="w-4 h-4" /> : <Flame className="w-4 h-4" />}
                          </div>
                          <div>
                            <span className="font-bold text-slate-100">{det.subType}</span>
                            <span className="block text-[10px] text-slate-400 font-mono">{det.id}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-medium">{det.type}</td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-950 font-mono font-bold text-cyan-300 border border-slate-800">
                          {det.confidence}%
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                          {det.zone}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-400">{det.timestamp}</td>

                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-1.5">
                          {(() => {
                            const matched = isVictim ? survivors.find(s => s.id === det.id || s.id === `SURV-${det.id.slice(-4)}`) : null;
                            return matched?.priorityRank ? (
                              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-mono font-black text-[10px] flex items-center justify-center shrink-0" title={`Rescue Priority #${matched.priorityRank}`}>
                                #{matched.priorityRank}
                              </span>
                            ) : null;
                          })()}
                          <span className={`px-2 py-0.5 rounded text-[10.5px] font-bold border ${getPriorityBadge(det.priority)}`}>
                            {det.priority}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10.5px] font-bold border ${getStatusBadge(det.status)}`}>
                          {det.status === 'REQUIRES_VERIFICATION' ? 'VERIFY' : det.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => viewLocation(det.zone, det.id)}
                            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                            title="View on Map"
                          >
                            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                          </button>

                          {det.status === 'REQUIRES_VERIFICATION' && (
                            <>
                              <button
                                onClick={() => markDetectionVerified(det.id)}
                                className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] transition shadow"
                              >
                                Verify
                              </button>
                              <button
                                onClick={() => dismissDetection(det.id)}
                                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-[11px] transition"
                              >
                                Dismiss
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
