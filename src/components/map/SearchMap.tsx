import React from 'react';
import { useMission } from '../../context/MissionContext';
import { ZoneId, SearchZone } from '../../types';
import { SEARCH_ROUTE } from '../../data/mockData';
import {
  Navigation,
  User,
  Flame,
  CheckCircle2,
  Scan,
  MapPin,
  Compass,
  Layers,
} from 'lucide-react';

interface SearchMapProps {
  compact?: boolean;
  interactive?: boolean;
}

export const SearchMap: React.FC<SearchMapProps> = ({ compact = false, interactive = true }) => {
  const {
    zones,
    droneStatus,
    detections,
    hazards,
    selectedZoneId,
    setSelectedZoneId,
    setSelectedDetection,
    setActivePage,
  } = useMission();

  // 3x3 rows
  const gridRows: ZoneId[][] = [
    ['A1', 'A2', 'A3'],
    ['B1', 'B2', 'B3'],
    ['C1', 'C2', 'C3'],
  ];

  const getZone = (id: ZoneId): SearchZone | undefined => zones.find(z => z.id === id);

  const getZoneDetections = (id: ZoneId) => detections.filter(d => d.zone === id && d.status !== 'DISMISSED');
  const getZoneHazards = (id: ZoneId) => hazards.filter(h => h.zone === id && h.status !== 'DISMISSED');

  const selectedZoneData = zones.find(z => z.id === selectedZoneId);
  const selectedZoneVictims = selectedZoneId ? getZoneDetections(selectedZoneId).filter(d => d.type === 'Victim') : [];
  const selectedZoneHazardsList = selectedZoneId ? getZoneHazards(selectedZoneId) : [];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 lg:p-5 shadow-xl flex flex-col h-full">
      {/* Map Header & Info */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Compass className="w-4 h-4 text-cyan-400" />
            <span>Search Area Grid (3×3 Sector Map)</span>
          </h3>
          <p className="text-[11px] text-slate-400">
            Autonomous sweep path: <span className="font-mono text-cyan-400 font-semibold">A1→A2→A3→B3→B2→B1→C1→C2→C3</span>
          </p>
        </div>

        <div className="flex items-center space-x-1.5 text-xs text-slate-400">
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
            CUSTOM VECTOR GRID
          </span>
        </div>
      </div>

      {/* Main Grid Map Area */}
      <div className="my-4 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-3 gap-3.5 max-w-2xl mx-auto w-full">
          {gridRows.map((row, rowIndex) =>
            row.map((zoneId) => {
              const zone = getZone(zoneId);
              const isDroneHere = droneStatus.currentZone === zoneId;
              const isSearching = zone?.status === 'searching' || isDroneHere;
              const isSearched = zone?.status === 'searched';
              const isSelected = selectedZoneId === zoneId;
              const zoneDets = getZoneDetections(zoneId);
              const victims = zoneDets.filter(d => d.type === 'Victim');
              const zoneHaz = getZoneHazards(zoneId);

              // Route position sequence index (1 to 9)
              const routeOrder = SEARCH_ROUTE.indexOf(zoneId) + 1;

              return (
                <div
                  key={zoneId}
                  onClick={() => {
                    if (interactive) {
                      setSelectedZoneId(zoneId);
                    }
                  }}
                  className={`relative p-3.5 rounded-xl border-2 transition-all duration-300 flex flex-col justify-between min-h-[110px] cursor-pointer group ${
                    isSelected
                      ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-950'
                      : ''
                  } ${
                    isDroneHere
                      ? 'border-cyan-400 bg-cyan-950/40 shadow-lg shadow-cyan-950/50'
                      : isSearching
                      ? 'border-cyan-500/60 bg-cyan-950/20 animate-pulse'
                      : isSearched
                      ? 'border-emerald-500/30 bg-emerald-950/15'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  {/* Top Zone Label & Route sequence tag */}
                  <div className="flex items-center justify-between">
                    <span className="text-base font-black font-mono tracking-tight text-white flex items-center gap-1.5">
                      {zoneId}
                      {isSearched && !isDroneHere && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                    </span>

                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900/90 text-slate-400 border border-slate-800">
                      #{routeOrder}
                    </span>
                  </div>

                  {/* Terrain type */}
                  <div className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                    {zone?.terrain}
                  </div>

                  {/* Center Active Drone Avatar */}
                  {isDroneHere && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none z-10">
                      <div className="w-8 h-8 rounded-full bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center animate-bounce shadow-lg shadow-cyan-500/40">
                        <Navigation
                          className="w-4 h-4 text-cyan-300"
                          style={{ transform: `rotate(${droneStatus.headingDegrees}deg)` }}
                        />
                      </div>
                      <span className="text-[9px] font-mono font-bold text-cyan-300 bg-slate-950/90 px-1 rounded mt-0.5 shadow">
                        RESQ-01
                      </span>
                    </div>
                  )}

                  {/* Bottom Indicators: Victim & Hazard Markers */}
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-800/60">
                    <div className="flex items-center space-x-1.5">
                      {victims.length > 0 && (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedZoneId(zoneId);
                            setSelectedDetection(victims[0]);
                          }}
                          className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold font-mono animate-pulse hover:bg-rose-500/30"
                          title={`${victims.length} victim(s) detected in ${zoneId}`}
                        >
                          <User className="w-3 h-3 text-rose-400" />
                          <span>{victims.length}</span>
                        </div>
                      )}

                      {zoneHaz.length > 0 && (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedZoneId(zoneId);
                          }}
                          className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold font-mono hover:bg-amber-500/30"
                          title={`${zoneHaz.length} hazard(s) in ${zoneId}`}
                        >
                          <Flame className="w-3 h-3 text-amber-400" />
                          <span>{zoneHaz.length}</span>
                        </div>
                      )}

                      {victims.length === 0 && zoneHaz.length === 0 && (
                        <span className="text-[10px] text-slate-500 font-mono">CLEAR</span>
                      )}
                    </div>

                    <span className="text-[9px] text-slate-400 font-mono">
                      {isDroneHere ? 'ACTIVE' : isSearched ? 'DONE' : 'QUEUED'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Map Legend */}
      <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-semibold text-slate-300 text-[11px] uppercase tracking-wider">Legend:</span>
          
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            <span>DRONE (RESQ-01)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-rose-500"></span>
            <span className="text-rose-300 font-medium">VICTIM</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-amber-500"></span>
            <span className="text-amber-300 font-medium">HAZARD</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded border border-emerald-500/60 bg-emerald-950/40"></span>
            <span>SEARCHED</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded border border-cyan-400 bg-cyan-950/50"></span>
            <span>CURRENT SEARCH AREA</span>
          </div>
        </div>
      </div>

      {/* Zone Detail Drawer / Inspection Panel if selected */}
      {selectedZoneData && (
        <div className="mt-4 p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-slate-100 text-sm">{selectedZoneData.name}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                Lat: {selectedZoneData.lat.toFixed(4)}°N, Lng: {selectedZoneData.lng.toFixed(4)}°E
              </span>
            </div>
            <span className="text-slate-400">
              Terrain: <strong className="text-slate-200">{selectedZoneData.terrain}</strong>
            </span>
          </div>

          {/* Detections in selected zone */}
          <div className="mt-2.5 space-y-2">
            {selectedZoneVictims.length > 0 ? (
              <div className="space-y-1.5">
                {selectedZoneVictims.map(vic => (
                  <div
                    key={vic.id}
                    className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-rose-300">🚨 Victim Detected ({vic.subType})</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 bg-rose-600 text-white rounded font-black">
                          {vic.confidence}% CONFIDENCE
                        </span>
                        <span className="text-slate-400 font-mono text-[10px]">{vic.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1">{vic.notes}</p>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedDetection(vic);
                        setActivePage('detections');
                      }}
                      className="px-2.5 py-1 text-xs rounded bg-rose-600 hover:bg-rose-500 text-white font-semibold transition shrink-0 ml-3"
                    >
                      Inspect Victim
                    </button>
                  </div>
                ))}
              </div>
            ) : selectedZoneHazardsList.length > 0 ? (
              <div className="space-y-1.5">
                {selectedZoneHazardsList.map(haz => (
                  <div
                    key={haz.id}
                    className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-amber-300">⚠️ Hazard: {haz.type}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 bg-amber-500 text-black rounded font-black">
                          {haz.confidence}% CONFIDENCE
                        </span>
                        <span className="text-slate-400 font-mono text-[10px]">{haz.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1">{haz.threatDescription}</p>
                    </div>

                    <button
                      onClick={() => setActivePage('hazards')}
                      className="px-2.5 py-1 text-xs rounded bg-amber-500 hover:bg-amber-400 text-black font-semibold transition shrink-0 ml-3"
                    >
                      Inspect Hazard
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-slate-400 text-[11px] py-1">
                No active victim or hazard anomalies recorded in this sector yet.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
