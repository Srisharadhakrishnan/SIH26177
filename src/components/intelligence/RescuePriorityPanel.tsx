import React from 'react';
import { useMission } from '../../context/MissionContext';
import { Survivor, SafeRoute } from '../../types';
import {
  Award,
  AlertTriangle,
  Flame,
  CheckCircle2,
  RefreshCw,
  Navigation,
  MapPin,
  ShieldCheck,
  Thermometer,
  Activity,
  Footprints,
  Info,
} from 'lucide-react';

export const RescuePriorityPanel: React.FC = () => {
  const {
    survivors,
    selectedSurvivor,
    setSelectedSurvivor,
    requestSecondLook,
    getSafeRouteForSurvivor,
    viewLocation,
  } = useMission();

  // Active verified or review-ready survivors
  const activeSurvivors = survivors.filter((s) => s.verificationStatus !== 'REJECTED');
  const activeTarget: Survivor | null = selectedSurvivor || (activeSurvivors.length > 0 ? activeSurvivors[0] : null);
  const safeRoute: SafeRoute | null = activeTarget ? getSafeRouteForSurvivor(activeTarget.id) : null;

  const getRiskBadgeColor = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-rose-600 text-white border-rose-500 shadow-rose-950/50';
      case 'HIGH':
        return 'bg-amber-500 text-black border-amber-400 font-bold';
      case 'MEDIUM':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 lg:p-5 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
              <span>Rescue Priority & Safe-Access Guidance</span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/60">
                INTELLIGENCE LAYER
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Operational urgency ranking & safe ground responder approach routes
            </p>
          </div>
        </div>

        <span className="text-xs font-mono text-slate-300 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
          Ranked Targets: <strong className="text-cyan-400">{activeSurvivors.length}</strong>
        </span>
      </div>

      {activeSurvivors.length === 0 ? (
        <div className="py-8 text-center text-slate-400 text-xs">
          No survivor targets identified yet. Start autonomous search, demo mode, or trigger a simulated detection.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column (5 cols): Prioritized Survivor Target Cards */}
          <div className="lg:col-span-5 space-y-2.5">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Prioritized Extraction Queue</span>
              <span className="text-[10px] text-slate-500 font-mono">Ranked by Urgency</span>
            </div>

            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {activeSurvivors.map((surv) => {
                const isSelected = activeTarget?.id === surv.id;
                const isSecondLookRunning = surv.secondLookStatus === 'IN_PROGRESS';

                return (
                  <div
                    key={surv.id}
                    onClick={() => setSelectedSurvivor(surv)}
                    className={`p-3 rounded-xl border transition cursor-pointer relative ${
                      isSelected
                        ? 'bg-slate-950 border-cyan-500/80 shadow-md shadow-cyan-950/40 ring-1 ring-cyan-400/50'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        {surv.priorityRank && (
                          <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-black font-mono text-[11px] flex items-center justify-center shrink-0">
                            #{surv.priorityRank}
                          </span>
                        )}
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="font-bold text-xs text-white">{surv.id}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                              Sector {surv.zone}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Fused Conf: {surv.confidence}% • {surv.timestamp}
                          </span>
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getRiskBadgeColor(surv.riskLevel)}`}>
                        {surv.riskLevel} ({surv.riskScore}/100)
                      </span>
                    </div>

                    {/* Quick status line */}
                    <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                      <div className="flex items-center space-x-2 text-slate-400 text-[10.5px]">
                        <span>Movement: <strong className="text-slate-200">{surv.movementStatus === 'NO_MOVEMENT' ? 'None (Trapped)' : 'Detected'}</strong></span>
                      </div>

                      {surv.verificationStatus === 'POSSIBLE' && !isSecondLookRunning && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            requestSecondLook(surv.id);
                          }}
                          className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-bold flex items-center gap-1 transition"
                        >
                          <RefreshCw className="w-2.5 h-2.5" />
                          <span>Second-Look</span>
                        </button>
                      )}

                      {isSecondLookRunning && (
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold animate-pulse flex items-center gap-1">
                          <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                          <span>Re-examining...</span>
                        </span>
                      )}

                      {surv.verificationStatus === 'VERIFIED' && (
                        <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>VERIFIED</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column (7 cols): Explainable Decision Panel & Safe-Access Guidance */}
          {activeTarget && (
            <div className="lg:col-span-7 space-y-4">
              {/* FEATURE 10: Explainable Decision Panel */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <Info className="w-4 h-4 text-cyan-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Why is this survivor ranked Priority #{activeTarget.priorityRank || 1}?
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    Transparent Intelligence Engine
                  </span>
                </div>

                {/* Score & Factor Pill Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block mb-0.5">Risk Score</span>
                    <span className="text-sm font-black font-mono text-rose-400">
                      {activeTarget.riskScore} / 100
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block mb-0.5">Movement Status</span>
                    <span className="text-xs font-bold font-mono text-slate-200">
                      {activeTarget.movementStatus === 'NO_MOVEMENT' ? 'None (Static)' : 'Active'}
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block mb-0.5">Thermal Verification</span>
                    <span className="text-xs font-bold font-mono text-emerald-400">
                      {activeTarget.thermalConfirmed ? 'Heat Confirmed' : 'Unconfirmed'}
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block mb-0.5">Nearby Threats</span>
                    <span className="text-xs font-bold font-mono text-amber-300">
                      {activeTarget.nearbyHazards.length > 0 ? `${activeTarget.nearbyHazards.length} In Vicinity` : 'Clear'}
                    </span>
                  </div>
                </div>

                {/* Explainable Reasons List */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-semibold text-slate-300">Contributing Assessment Factors:</span>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {activeTarget.riskReasons.map((reason, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-cyan-400 font-bold">•</span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recommended Operational Action */}
                <div className="p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-500/20 text-xs flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-cyan-300 block">Recommended Responder Action:</span>
                    <p className="text-slate-300 text-[11px] mt-0.5">
                      {activeTarget.riskLevel === 'CRITICAL'
                        ? 'Immediate priority ground team extraction recommended. Utilize safe route below avoiding active hazard epicenters.'
                        : 'Deploy scout responder unit with thermal verification gear. Maintain continuous aerial drone observation.'}
                    </p>
                  </div>
                </div>

                {/* Autonomous Second-Look Action Banner if uncertain */}
                {activeTarget.verificationStatus === 'POSSIBLE' && (
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="font-bold text-amber-300 block">Autonomous Second-Look Recommended</span>
                      <p className="text-[10.5px] text-slate-300 mt-0.5">
                        Detection confidence is uncertain. Trigger simulated repositioning and multi-spectral re-examination.
                      </p>
                    </div>

                    <button
                      onClick={() => requestSecondLook(activeTarget.id)}
                      disabled={activeTarget.secondLookStatus === 'IN_PROGRESS'}
                      className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-black font-bold text-xs flex items-center gap-1.5 transition shrink-0 shadow"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${activeTarget.secondLookStatus === 'IN_PROGRESS' ? 'animate-spin' : ''}`} />
                      <span>{activeTarget.secondLookStatus === 'IN_PROGRESS' ? 'VERIFYING...' : 'REQUEST SECOND LOOK'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* FEATURE 6: Dynamic Safe-Access Guidance Card */}
              {safeRoute && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center space-x-2">
                      <Footprints className="w-4 h-4 text-emerald-400" />
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        Recommended Safe-Access Route (Ground Responders)
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
                      Advisory Guidance · Non-Guaranteed
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Ground Distance</span>
                      <span className="text-sm font-bold font-mono text-emerald-300">
                        {safeRoute.totalDistanceMeters} meters
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Est. Ingress Time</span>
                      <span className="text-sm font-bold font-mono text-white">
                        ~{safeRoute.estimatedTravelMinutes} mins
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Terrain Accessibility</span>
                      <span className="text-xs font-bold font-mono text-cyan-300">
                        {safeRoute.accessibilityRating}
                      </span>
                    </div>
                  </div>

                  {/* Waypoint Path Sequence */}
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                    <span className="text-[10px] text-slate-400 block mb-1">Recommended Sector Ingress Corridors:</span>
                    <div className="flex items-center space-x-2 overflow-x-auto py-1 font-mono text-xs">
                      {safeRoute.gridPath.map((sectorId, idx) => (
                        <React.Fragment key={sectorId}>
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold shrink-0">
                            Sector {sectorId}
                          </span>
                          {idx < safeRoute.gridPath.length - 1 && (
                            <span className="text-slate-500">→</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed italic">
                    {safeRoute.routeAdvisory}
                  </p>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
                    <span className="text-[10px] text-slate-500 font-mono">
                      NOTE: Drone flight path is direct aerial; responder ground route navigates around surface obstacles.
                    </span>

                    <button
                      onClick={() => viewLocation(activeTarget.zone, activeTarget.id)}
                      className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Focus on Map</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
