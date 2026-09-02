import React from 'react';
import { useMission } from '../../context/MissionContext';
import { DecisionTimelineEvent } from '../../types';
import {
  Clock,
  Eye,
  RefreshCw,
  AlertTriangle,
  Award,
  Navigation,
  CheckCircle2,
  Flame,
  Activity,
} from 'lucide-react';

export const DecisionTimeline: React.FC = () => {
  const { timelineEvents, setSelectedSurvivor, survivors, setActivePage } = useMission();

  const getEventIcon = (type: DecisionTimelineEvent['type']) => {
    switch (type) {
      case 'DETECTION':
        return <Eye className="w-3.5 h-3.5 text-cyan-400" />;
      case 'SECOND_LOOK_REQUEST':
        return <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />;
      case 'SECOND_LOOK_RESULT':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
      case 'HAZARD_PROXIMITY':
        return <Flame className="w-3.5 h-3.5 text-amber-400" />;
      case 'RISK_UPDATE':
        return <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />;
      case 'PRIORITY_ASSIGNED':
        return <Award className="w-3.5 h-3.5 text-indigo-400" />;
      case 'ROUTE_GENERATED':
        return <Navigation className="w-3.5 h-3.5 text-emerald-400" />;
      case 'MISSION_REPLAN':
      default:
        return <Activity className="w-3.5 h-3.5 text-cyan-400" />;
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 lg:p-5 shadow-xl flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Rescue Decision Timeline</h3>
            <p className="text-[11px] text-slate-400">
              Transparent operational event stream • DETECT → ASSESS → PRIORITIZE → GUIDE
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
          {timelineEvents.length} Events Logged
        </span>
      </div>

      <div className="mt-3 space-y-2.5 flex-1 overflow-y-auto max-h-[360px] pr-1">
        {timelineEvents.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No decision events recorded yet. Start autonomous search or run Demo Mode.
          </div>
        ) : (
          timelineEvents.map((evt) => (
            <div
              key={evt.id}
              className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition space-y-1"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-1 rounded bg-slate-900 border border-slate-800">
                    {getEventIcon(evt.type)}
                  </div>
                  <span className="text-xs font-bold text-slate-200">{evt.title}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">{evt.timestamp}</span>
              </div>

              <p className="text-[11px] text-slate-300 pl-6 leading-relaxed">{evt.description}</p>

              {evt.relatedSurvivorId && (
                <div className="pl-6 pt-1 flex items-center space-x-2">
                  <button
                    onClick={() => {
                      const found = survivors.find((s) => s.id === evt.relatedSurvivorId);
                      if (found) {
                        setSelectedSurvivor(found);
                        setActivePage('detections');
                      }
                    }}
                    className="text-[10px] text-cyan-400 hover:text-cyan-300 font-mono underline"
                  >
                    View Target ({evt.relatedSurvivorId})
                  </button>
                  {evt.zone && (
                    <span className="text-[10px] font-mono text-slate-400">
                      • Sector {evt.zone}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
