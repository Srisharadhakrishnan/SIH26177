import React from 'react';
import { useMission } from '../../context/MissionContext';
import {
  X,
  User,
  Flame,
  CheckCircle2,
  XCircle,
  MapPin,
  Thermometer,
  Shield,
  Clock,
  Crosshair,
  AlertTriangle,
  Award,
  RefreshCw,
  Info,
} from 'lucide-react';

export const DetectionDetailModal: React.FC = () => {
  const {
    selectedDetection,
    setSelectedDetection,
    markDetectionVerified,
    dismissDetection,
    viewLocation,
    survivors,
    requestSecondLook,
  } = useMission();

  if (!selectedDetection) return null;

  const isVictim = selectedDetection.type === 'Victim';
  const matchedSurvivor = isVictim
    ? survivors.find(
        (s) =>
          s.id === selectedDetection.id ||
          s.id === `SURV-${selectedDetection.id.slice(-4)}`
      )
    : null;

  const isSecondLookRunning = matchedSurvivor?.secondLookStatus === 'IN_PROGRESS';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 relative overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Top Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div
              className={`p-2.5 rounded-xl border ${
                isVictim
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              }`}
            >
              {isVictim ? <User className="w-6 h-6" /> : <Flame className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-black text-white">
                  {isVictim ? '🚨 SURVIVOR LOCALIZED' : '⚠️ HAZARD DETECTED'}
                </h3>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                    isVictim ? 'bg-rose-600 text-white' : 'bg-amber-500 text-black'
                  }`}
                >
                  {selectedDetection.subType.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Detection ID: {selectedDetection.id} {matchedSurvivor ? `• Target ID: ${matchedSurvivor.id}` : ''}
              </p>
            </div>
          </div>

          <button
            onClick={() => setSelectedDetection(null)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Synthetic AI Crop View */}
        <div className="relative h-40 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-sky-950 opacity-90"></div>
          <div className="relative z-10 text-center p-4">
            <div
              className={`w-20 h-20 mx-auto rounded-lg border-2 flex items-center justify-center relative ${
                isVictim
                  ? 'border-rose-400 bg-rose-500/20'
                  : 'border-amber-400 bg-amber-500/20'
              }`}
            >
              <Crosshair className="w-10 h-10 text-slate-100 opacity-80" />
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-slate-950 text-[9px] font-mono font-bold text-cyan-300 rounded border border-slate-700">
                {selectedDetection.confidence}% CONF
              </div>
            </div>
            <p className="text-[10px] text-slate-400 font-mono mt-2">
              SIMULATED BOUNDING BOX CROP • 1080P SENSOR
            </p>
          </div>
        </div>

        {/* Metadata Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
            <span className="text-slate-400 flex items-center gap-1 mb-0.5 text-[10px]">
              <MapPin className="w-3 h-3 text-cyan-400" />
              Zone Location
            </span>
            <span className="font-bold text-slate-100 font-mono text-sm">
              Sector {selectedDetection.zone}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
            <span className="text-slate-400 flex items-center gap-1 mb-0.5 text-[10px]">
              <Clock className="w-3 h-3 text-indigo-400" />
              Timestamp
            </span>
            <span className="font-bold text-slate-100 font-mono text-sm">
              {selectedDetection.timestamp}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
            <span className="text-slate-400 flex items-center gap-1 mb-0.5 text-[10px]">
              <Shield className="w-3 h-3 text-emerald-400" />
              Operational Priority
            </span>
            <span className="font-bold text-rose-400 font-mono text-sm">
              {matchedSurvivor?.priorityRank ? `Rank #${matchedSurvivor.priorityRank}` : selectedDetection.priority}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
            <span className="text-slate-400 flex items-center gap-1 mb-0.5 text-[10px]">
              <Thermometer className="w-3 h-3 text-amber-400" />
              Thermal Reading
            </span>
            <span className="font-bold text-cyan-300 font-mono text-sm">
              {selectedDetection.temperatureReading || '36.8°C'}
            </span>
          </div>
        </div>

        {/* FEATURE 3 & 10: Explainable Intelligence Insights if matched survivor */}
        {matchedSurvivor && (
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2.5">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
              <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                <span>Explainable Rescue Intelligence</span>
              </span>
              <span className="font-mono text-[10px] text-rose-300 font-bold px-1.5 py-0.5 rounded bg-rose-500/20 border border-rose-500/30">
                Risk: {matchedSurvivor.riskLevel} ({matchedSurvivor.riskScore}/100)
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-400">Risk Assessment Factors:</span>
              <ul className="space-y-1 text-[11.5px] text-slate-300">
                {matchedSurvivor.riskReasons.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-cyan-400 font-bold">•</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Second-Look trigger in modal if uncertain */}
            {matchedSurvivor.verificationStatus === 'POSSIBLE' && (
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <span className="text-[10.5px] text-amber-300">
                  Uncertain detection. Multi-spectral second look recommended.
                </span>
                <button
                  onClick={() => requestSecondLook(matchedSurvivor.id)}
                  disabled={isSecondLookRunning}
                  className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-black text-xs font-bold flex items-center gap-1 transition shrink-0"
                >
                  <RefreshCw className={`w-3 h-3 ${isSecondLookRunning ? 'animate-spin' : ''}`} />
                  <span>{isSecondLookRunning ? 'Verifying...' : 'Second-Look'}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* AI Field Notes */}
        {selectedDetection.notes && !matchedSurvivor && (
          <div className="p-3 rounded-lg bg-slate-950/90 border border-slate-800 text-xs">
            <span className="text-slate-400 font-semibold block mb-1">AI Diagnostic Notes:</span>
            <p className="text-slate-200 leading-relaxed">{selectedDetection.notes}</p>
          </div>
        )}

        {/* Responder Decision Actions */}
        <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={() => {
              viewLocation(selectedDetection.zone, selectedDetection.id);
              setSelectedDetection(null);
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span>VIEW ON MAP</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                markDetectionVerified(selectedDetection.id);
                setSelectedDetection(null);
              }}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-950 transition"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>MARK VERIFIED</span>
            </button>

            <button
              onClick={() => {
                dismissDetection(selectedDetection.id);
                setSelectedDetection(null);
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs font-medium flex items-center gap-1.5 transition"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>DISMISS</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
