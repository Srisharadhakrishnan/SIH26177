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
  Footprints,
  ShieldAlert,
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
    survivors,
    selectedSurvivor,
    getSafeRouteForSurvivor,
    selectedZoneId,
    setSelectedZoneId,
    setSelectedDetection,
    setActivePage,
  } = useMission();

  // Active target survivor for safe responder route display
  const activeSurv = selectedSurvivor || survivors.find((s) => s.verificationStatus !== 'REJECTED') || null;
  const safeRoute = activeSurv ? getSafeRouteForSurvivor(activeSurv.id) : null;
  const responderCorridor: ZoneId[] = safeRoute ? safeRoute.gridPath : [];

  // 3x3 rows
  const gridRows: ZoneId[][] = [
    ['A1', 'A2', 'A3'],
    ['B1', 'B2', 'B3'],
    ['C1', 'C2', 'C3'],
  ];

  const getZone = (id: ZoneId): SearchZone | undefined => zones.find((z) => z.id === id);
  const getZoneDetections = (id: ZoneId) => detections.filter((d) => d.zone === id && d.status !== 'DISMISSED');
  const getZoneHazards = (id: ZoneId) => hazards.filter((h) => h.zone === id && h.status !== 'DISMISSED');

  const selectedZoneData = zones.find((z) => z.id === selectedZoneId);
  const selectedZoneVictims = selectedZoneId ? getZoneDetections(selectedZoneId).filter((d) => d.type === 'Victim') : [];
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

        <div className="flex items-center space-x-2 text-xs">
          {safeRoute && (
            <span className="text-[10.5px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
              <Footprints className="w-3 h-3 text-emerald-400" />
              <span>Ground Ingress: {safeRoute.gridPath.join(' → ')}</span>
            </span>
          )}

          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
            CUSTOM VECTOR GRID
          </span>
        </div>
      </div>

      {/* Main Grid Map Area */}
      <div className="my-4 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-3 gap-3.5 max-w-2xl mx-auto w-full">
          {gridRows.map((row) =>
            row.map((zoneId) => {
              const zone = getZone(zoneId);
              const isDroneHere = droneStatus.currentZone === zoneId;
              const isSearching = zone?.status === 'searching' || isDroneHere;
              const isSearched = zone?.status === 'searched';
              const isSelected = selectedZoneId === zoneId;
              const zoneDets = getZoneDetections(zoneId);
              const victims = zoneDets.filter((d) => d.type === 'Victim');
              const zoneHaz = getZoneHazards(zoneId);

              // Ground responder path properties
              const isResponderRoute = responderCorridor.includes(zoneId);
              const routeStepIndex = responderCorridor.indexOf(zoneId);
              const isDestination = activeSurv?.zone === zoneId;
              const hasSevereHazard = zoneHaz.some((h) => h.severity === 'CRITICAL' || h.type === 'Fire');

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
                      ? 'border-indigo-400 bg-indigo-950/40 ring-2 ring-indigo-500/50 shadow-xl'
                      : isDroneHere
                      ? 'border-cyan-400 bg-cyan-950/40 shadow-lg shadow-cyan-950/50'
                      : isResponderRoute
                      ? 'border-emerald-500/80 bg-emerald-950/30 shadow-md shadow-emerald-950/40'
                      : hasSevereHazard
                      ? 'border-amber-500/50 bg-amber-950/20'
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

                    <div className="flex items-center space-x-1">
                      {isResponderRoute && (
                        <span
                          className={`text-[9px] font-mono px-1 py-0.2 rounded font-bold ${
                            isDestination
                              ? 'bg-rose-500 text-white animate-pulse'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          }`}
                          title={`Ground Responder Path Step #${routeStepIndex + 1}`}
                        >
                          {isDestination ? 'GOAL' : `STEP #${routeStepIndex + 1}`}
                        </span>
                      )}

                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900/90 text-slate-400 border border-slate-800">
                        #{routeOrder}
                      </span>
                    </div>
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
                        {droneStatus.droneId}
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
                      {isDroneHere ? 'DRONE HERE' : isSearched ? 'SURVEYED' : 'PENDING'}
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
            <span>DRONE ({droneStatus.droneId})</span>
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
            <span className="w-2.5 h-2.5 rounded border border-emerald-400 bg-emerald-500/40"></span>
            <span className="text-emerald-300 font-medium">RESPONDER GROUND CORRIDOR</span>
          </div>
        </div>

        <span className="text-[10.5px] font-mono text-slate-500">
          *Drone flies aerial path; ground responders follow green obstacle-avoidance corridor
        </span>
      </div>

      {/* Interactive Zone Inspector (when a zone is selected) */}
      {interactive && selectedZoneData && (
        <div className="mt-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <h4 className="text-sm font-bold text-white">
                Sector Inspector: <span className="text-cyan-300">{selectedZoneData.id} ({selectedZoneData.name})</span>
              </h4>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Terrain: <strong className="text-slate-200">{selectedZoneData.terrain}</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Survey Status</span>
              <span className="font-bold text-slate-200 capitalize font-mono text-sm">
                {selectedZoneData.status}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Victims Present</span>
              <span className="font-bold text-rose-400 font-mono text-sm">
                {selectedZoneVictims.length}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Active Hazards</span>
              <span className="font-bold text-amber-400 font-mono text-sm">
                {selectedZoneHazardsList.length}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Coordinates</span>
              <span className="font-bold text-slate-300 font-mono text-[11px]">
                {selectedZoneData.lat.toFixed(4)}°N, {selectedZoneData.lng.toFixed(4)}°E
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
