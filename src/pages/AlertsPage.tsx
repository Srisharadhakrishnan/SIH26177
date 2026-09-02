import React, { useState } from 'react';
import { useMission } from '../context/MissionContext';
import { Alert } from '../types';
import {
  Bell,
  User,
  Flame,
  Info,
  CheckCircle2,
  XCircle,
  MapPin,
} from 'lucide-react';

export const AlertsPage: React.FC = () => {
  const { alerts, markAlertVerified, dismissAlert, viewLocation } = useMission();
  const [filter, setFilter] = useState<'ALL' | 'VICTIM' | 'HAZARD' | 'SYSTEM'>('ALL');

  const filteredAlerts = alerts.filter((a: Alert) => (filter === 'ALL' ? true : a.type === filter));

  const unverifiedCount = alerts.filter((a: Alert) => a.status === 'REQUIRES_VERIFICATION').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Title */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-red-500" />
            <span>Emergency Alert Center & Incident Dispatch</span>
          </h2>
          <p className="text-xs text-slate-400">
            Real-time chronological incident queue requiring human responder validation and response routing
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 rounded bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-mono font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            {unverifiedCount} Action Required
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 p-1.5 rounded-xl text-xs w-fit">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-3.5 py-1.5 rounded-lg font-medium transition ${
            filter === 'ALL'
              ? 'bg-cyan-600 text-white font-semibold shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          All Alerts ({alerts.length})
        </button>
        <button
          onClick={() => setFilter('VICTIM')}
          className={`px-3.5 py-1.5 rounded-lg font-medium transition ${
            filter === 'VICTIM'
              ? 'bg-rose-600 text-white font-semibold shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          🚨 Victims ({alerts.filter((a: Alert) => a.type === 'VICTIM').length})
        </button>
        <button
          onClick={() => setFilter('HAZARD')}
          className={`px-3.5 py-1.5 rounded-lg font-medium transition ${
            filter === 'HAZARD'
              ? 'bg-amber-600 text-white font-semibold shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          ⚠️ Hazards ({alerts.filter((a: Alert) => a.type === 'HAZARD').length})
        </button>
        <button
          onClick={() => setFilter('SYSTEM')}
          className={`px-3.5 py-1.5 rounded-lg font-medium transition ${
            filter === 'SYSTEM'
              ? 'bg-slate-700 text-white font-semibold shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          ℹ️ System ({alerts.filter((a: Alert) => a.type === 'SYSTEM').length})
        </button>
      </div>

      {/* Alerts Grid */}
      <div className="grid grid-cols-1 gap-3">
        {filteredAlerts.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs bg-slate-900/60 border border-slate-800 rounded-xl">
            No alerts found matching filter.
          </div>
        ) : (
          filteredAlerts.map((alert: Alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-xl border transition-all ${
                alert.status === 'DISMISSED'
                  ? 'bg-slate-950/40 border-slate-800 opacity-60'
                  : alert.type === 'VICTIM'
                  ? 'bg-rose-500/10 border-rose-500/30'
                  : alert.type === 'HAZARD'
                  ? 'bg-amber-500/10 border-amber-500/30'
                  : 'bg-cyan-500/5 border-cyan-500/20'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                    {alert.type === 'VICTIM' ? (
                      <User className="w-5 h-5 text-rose-400" />
                    ) : alert.type === 'HAZARD' ? (
                      <Flame className="w-5 h-5 text-amber-400" />
                    ) : (
                      <Info className="w-5 h-5 text-cyan-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{alert.title}</h4>
                    <span className="text-xs text-slate-400 font-mono">
                      {alert.timestamp} • Location: <strong className="text-cyan-300">Zone {alert.zone}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {alert.confidence && (
                    <span className="px-2 py-0.5 rounded bg-slate-950 font-mono text-xs font-bold text-cyan-300 border border-slate-800">
                      {alert.confidence}% Confidence
                    </span>
                  )}
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-bold ${
                      alert.priority === 'CRITICAL' || alert.priority === 'HIGH'
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {alert.priority}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-200 mt-2.5 leading-relaxed">{alert.message}</p>

              {/* Action Controls */}
              <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-slate-400">
                  Status: <strong className="text-slate-200 uppercase font-mono">{alert.status}</strong>
                </span>

                <div className="flex items-center space-x-2">
                  {alert.zone && (
                    <button
                      onClick={() => viewLocation(alert.zone, alert.detectionId)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium flex items-center gap-1.5 transition"
                    >
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                      <span>VIEW LOCATION</span>
                    </button>
                  )}

                  {alert.status === 'REQUIRES_VERIFICATION' && (
                    <>
                      <button
                        onClick={() => markAlertVerified(alert.id)}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 transition shadow"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>MARK VERIFIED</span>
                      </button>

                      <button
                        onClick={() => dismissAlert(alert.id)}
                        className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                      >
                        <XCircle className="w-3.5 h-3.5" />
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
