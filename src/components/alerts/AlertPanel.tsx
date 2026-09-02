import React from 'react';
import { useMission } from '../../context/MissionContext';
import { Alert } from '../../types';
import {
  Bell,
  AlertTriangle,
  Flame,
  User,
  Info,
  CheckCircle2,
  XCircle,
  MapPin,
  ExternalLink,
} from 'lucide-react';

interface AlertPanelProps {
  maxItems?: number;
  showAll?: boolean;
}

export const AlertPanel: React.FC<AlertPanelProps> = ({ maxItems, showAll = false }) => {
  const { alerts, markAlertVerified, dismissAlert, viewLocation } = useMission();

  const displayedAlerts = maxItems ? alerts.slice(0, maxItems) : alerts;

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'VICTIM':
        return <User className="w-4 h-4 text-rose-400" />;
      case 'HAZARD':
        return <Flame className="w-4 h-4 text-amber-400" />;
      case 'SYSTEM':
        return <Info className="w-4 h-4 text-cyan-400" />;
    }
  };

  const getAlertStyles = (type: Alert['type'], status: Alert['status']) => {
    if (status === 'DISMISSED') {
      return 'bg-slate-950/40 border-slate-800 opacity-60';
    }
    switch (type) {
      case 'VICTIM':
        return 'bg-rose-500/10 border-rose-500/30 shadow-lg shadow-rose-950/30';
      case 'HAZARD':
        return 'bg-amber-500/10 border-amber-500/30 shadow-lg shadow-amber-950/30';
      case 'SYSTEM':
        return 'bg-cyan-500/5 border-cyan-500/20';
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 lg:p-5 shadow-xl flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Live Rescue Alerts Feed</h3>
            <p className="text-[11px] text-slate-400">Chronological incident stream</p>
          </div>
        </div>

        <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
          {alerts.filter(a => a.status === 'REQUIRES_VERIFICATION').length} Active
        </span>
      </div>

      {/* Alert List */}
      <div className="mt-3 space-y-2.5 flex-1 overflow-y-auto max-h-[460px] pr-1">
        {displayedAlerts.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No alerts generated yet. Start autonomous search or run Demo Mode.
          </div>
        ) : (
          displayedAlerts.map(alert => (
            <div
              key={alert.id}
              className={`p-3.5 rounded-xl border transition-all ${getAlertStyles(
                alert.type,
                alert.status
              )}`}
            >
              {/* Top Header Line */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-md bg-slate-950/80 border border-slate-800">
                    {getAlertIcon(alert.type)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100">{alert.title}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {alert.timestamp} • Zone: <strong className="text-cyan-300">{alert.zone}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5">
                  {alert.confidence && (
                    <span className="px-1.5 py-0.5 rounded bg-slate-950 font-mono text-[10px] text-cyan-300 border border-slate-800">
                      {alert.confidence}%
                    </span>
                  )}
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      alert.priority === 'CRITICAL' || alert.priority === 'HIGH'
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {alert.priority}
                  </span>
                </div>
              </div>

              {/* Message */}
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">{alert.message}</p>

              {/* Status & Responder Action Buttons */}
              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center space-x-1.5">
                  <span className="text-[11px] text-slate-400">Status:</span>
                  <span
                    className={`text-[10.5px] font-bold px-1.5 py-0.5 rounded ${
                      alert.status === 'VERIFIED'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : alert.status === 'DISMISSED'
                        ? 'bg-slate-800 text-slate-400'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {alert.status}
                  </span>
                </div>

                <div className="flex items-center space-x-1.5">
                  {alert.zone && (
                    <button
                      onClick={() => viewLocation(alert.zone, alert.detectionId)}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium flex items-center gap-1 transition"
                    >
                      <MapPin className="w-3 h-3 text-cyan-400" />
                      <span>VIEW LOCATION</span>
                    </button>
                  )}

                  {alert.status === 'REQUIRES_VERIFICATION' && (
                    <>
                      <button
                        onClick={() => markAlertVerified(alert.id)}
                        className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold flex items-center gap-1 transition shadow"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>MARK VERIFIED</span>
                      </button>

                      <button
                        onClick={() => dismissAlert(alert.id)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-[11px] transition"
                      >
                        <XCircle className="w-3 h-3" />
                        <span>DISMISS</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
