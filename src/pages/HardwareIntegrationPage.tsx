import React, { useState } from 'react';
import {
  Cpu,
  Wifi,
  Camera,
  Thermometer,
  Battery,
  Satellite,
  Radio,
  GitBranch,
  CheckCircle,
  Circle,
  AlertCircle,
  Clock,
  ChevronDown,
  ChevronRight,
  Layers,
  Server,
  Code2,
  Info,
} from 'lucide-react';
import { HARDWARE_READINESS_CHECKLIST, SIMULATION_MODE, HARDWARE_CONNECTION } from '../hardware/config';
import type { HardwareReadinessItem } from '../hardware/types';

const CATEGORY_META: Record<HardwareReadinessItem['category'], {
  label: string;
  icon: React.ReactNode;
  color: string;
}> = {
  FLIGHT_CONTROLLER: { label: 'Flight Controller', icon: <Cpu className="w-4 h-4" />, color: 'text-cyan-400' },
  GNSS: { label: 'GNSS / GPS', icon: <Satellite className="w-4 h-4" />, color: 'text-emerald-400' },
  CAMERAS: { label: 'Camera Payloads', icon: <Camera className="w-4 h-4" />, color: 'text-violet-400' },
  EDGE_COMPUTE: { label: 'Edge Computer', icon: <Server className="w-4 h-4" />, color: 'text-orange-400' },
  COMMS: { label: 'Communication Links', icon: <Radio className="w-4 h-4" />, color: 'text-sky-400' },
  SOFTWARE: { label: 'Software Integration', icon: <Code2 className="w-4 h-4" />, color: 'text-amber-400' },
};

const STATUS_META = {
  NOT_STARTED: { label: 'Not Started', icon: <Circle className="w-3.5 h-3.5" />, color: 'text-slate-500' },
  IN_PROGRESS: { label: 'In Progress', icon: <Clock className="w-3.5 h-3.5 animate-spin" />, color: 'text-amber-400' },
  COMPLETE: { label: 'Complete', icon: <CheckCircle className="w-3.5 h-3.5" />, color: 'text-emerald-400' },
  BLOCKED: { label: 'Blocked', icon: <AlertCircle className="w-3.5 h-3.5" />, color: 'text-red-400' },
};

export const HardwareIntegrationPage: React.FC = () => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(Object.keys(CATEGORY_META))
  );

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };

  const grouped = HARDWARE_READINESS_CHECKLIST.reduce<
    Record<HardwareReadinessItem['category'], HardwareReadinessItem[]>
  >((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as any);

  const totalItems = HARDWARE_READINESS_CHECKLIST.length;
  const completedItems = HARDWARE_READINESS_CHECKLIST.filter((i) => i.status === 'COMPLETE').length;
  const progressPct = Math.round((completedItems / totalItems) * 100);

  return (
    <div className="space-y-6 pb-10">
      {/* Page Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 flex items-center gap-2">
            <Layers className="w-6 h-6 text-cyan-400" />
            Hardware Integration Architecture
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Phase 4 readiness status — JEEVAN-AIR physical drone integration preparation
          </p>
        </div>
        {/* Mode Badge */}
        <div className={`px-4 py-2 rounded-xl border font-bold text-sm flex items-center gap-2 ${
          SIMULATION_MODE
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
        }`}>
          {SIMULATION_MODE ? (
            <><Cpu className="w-4 h-4" /> SIMULATION MODE ACTIVE</>
          ) : (
            <><Wifi className="w-4 h-4" /> HARDWARE MODE</>
          )}
        </div>
      </div>

      {/* Architecture Overview Banner */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
        <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-cyan-400" />
          Target Integration Architecture
        </h2>
        <div className="flex flex-wrap items-center gap-1 text-[11px] font-mono">
          {[
            { label: 'Physical Drone', color: 'bg-slate-800 text-slate-300' },
            { label: '→', color: 'text-slate-500' },
            { label: 'Flight Controller', color: 'bg-slate-800 text-cyan-300' },
            { label: '→', color: 'text-slate-500' },
            { label: 'MAVLink 2.0', color: 'bg-slate-800 text-sky-300' },
            { label: '→', color: 'text-slate-500' },
            { label: 'Edge Computer', color: 'bg-slate-800 text-orange-300' },
            { label: '→', color: 'text-slate-500' },
            { label: 'Edge Bridge (WS)', color: 'bg-slate-800 text-violet-300' },
            { label: '→', color: 'text-slate-500' },
            { label: 'HardwareDataProvider', color: 'bg-slate-800 text-amber-300' },
            { label: '→', color: 'text-slate-500' },
            { label: 'Rescue Intelligence', color: 'bg-slate-800 text-emerald-300' },
            { label: '→', color: 'text-slate-500' },
            { label: 'Dashboard', color: 'bg-slate-800 text-slate-200' },
          ].map((node, i) =>
            node.label === '→' ? (
              <span key={i} className={`px-1 font-bold ${node.color}`}>{node.label}</span>
            ) : (
              <span key={i} className={`px-2 py-0.5 rounded font-bold ${node.color}`}>{node.label}</span>
            )
          )}
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          <span className="text-slate-400 font-semibold">Mode switch:</span>{' '}
          Set <code className="text-cyan-300 bg-slate-800 px-1 rounded">SIMULATION_MODE = false</code> in{' '}
          <code className="text-amber-300 bg-slate-800 px-1 rounded">src/hardware/config.ts</code> when hardware is ready.
          No dashboard components need modification — the IDataAdapter contract handles everything.
        </p>
      </div>

      {/* Software Mode Status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest flex items-center gap-1">
            <Cpu className="w-3 h-3" /> Active Provider
          </span>
          <p className="font-black text-base text-amber-300 font-mono">
            {SIMULATION_MODE ? 'SimulationDataProvider' : 'HardwareDataProvider'}
          </p>
          <p className="text-slate-500 text-[10px]">
            {SIMULATION_MODE
              ? 'Safe default — all data is mathematically simulated'
              : 'Live hardware mode — physical drone required'}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest flex items-center gap-1">
            <Wifi className="w-3 h-3" /> Edge Bridge Endpoint
          </span>
          <p className="font-mono text-[11px] text-cyan-300 break-all">
            {SIMULATION_MODE ? 'N/A (Simulation)' : HARDWARE_CONNECTION.telemetryBridgeUrl}
          </p>
          <p className="text-slate-500 text-[10px]">
            {SIMULATION_MODE ? 'Configure in hardware/config.ts before switching modes' : 'WebSocket telemetry bridge'}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Checklist Progress
          </span>
          <p className="font-black text-base text-slate-200">
            {completedItems}/{totalItems} <span className="text-slate-500 text-sm font-normal">items</span>
          </p>
          <div className="w-full h-1.5 rounded bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Readiness Checklist by Category */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-widest">
          Integration Readiness Checklist
        </h2>

        {(Object.keys(CATEGORY_META) as HardwareReadinessItem['category'][]).map((cat) => {
          const meta = CATEGORY_META[cat];
          const items = grouped[cat] || [];
          const isExpanded = expandedCategories.has(cat);
          const catComplete = items.filter((i) => i.status === 'COMPLETE').length;

          return (
            <div key={cat} className="rounded-xl bg-slate-900/80 border border-slate-800 overflow-hidden">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(cat)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-800/50 transition"
              >
                <div className="flex items-center gap-2">
                  <span className={meta.color}>{meta.icon}</span>
                  <span className="font-bold text-sm text-slate-200">{meta.label}</span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {catComplete}/{items.length}
                  </span>
                </div>
                <span className="text-slate-500">
                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </span>
              </button>

              {/* Items */}
              {isExpanded && (
                <div className="divide-y divide-slate-800/60">
                  {items.map((item) => {
                    const statusMeta = STATUS_META[item.status];
                    return (
                      <div key={item.id} className="px-4 py-3 flex items-start gap-3">
                        <span className={`mt-0.5 shrink-0 ${statusMeta.color}`}>{statusMeta.icon}</span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[12px] font-semibold text-slate-200">{item.title}</span>
                            <span className={`text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded ${statusMeta.color} bg-slate-950`}>
                              {statusMeta.label}
                            </span>
                            <span className="text-[9px] font-mono text-slate-600">
                              Phase {item.phaseTarget} target
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{item.description}</p>
                          {item.dependency && (
                            <p className="text-[10px] text-slate-600 mt-0.5">
                              Depends on: <code className="text-slate-500">{item.dependency}</code>
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Data Schema Reference */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
        <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <Code2 className="w-4 h-4 text-amber-400" />
          Hardware Telemetry Schemas Defined
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
          {[
            { name: 'FlightControllerTelemetry', desc: 'MAVLink HEARTBEAT / VFR_HUD / ATTITUDE' },
            { name: 'GNSSPositionPayload', desc: 'GPS_RAW_INT / GLOBAL_POSITION_INT' },
            { name: 'IMUAttitudePayload', desc: 'ATTITUDE / SCALED_IMU / RAW_IMU' },
            { name: 'RGBCameraStreamMeta', desc: 'RTSP stream metadata + frame state' },
            { name: 'ThermalCameraStreamMeta', desc: 'LWIR radiometric frame metadata' },
            { name: 'BatteryTelemetryPayload', desc: 'BATTERY_STATUS (MAVLink)' },
            { name: 'LinkQualityPayload', desc: 'RADIO_STATUS + ping latency' },
            { name: 'HardwareFlightStatus', desc: 'HEARTBEAT + MISSION_CURRENT state' },
            { name: 'HardwareMissionPayload', desc: 'Runtime mission parameters' },
            { name: 'EdgeAIInferenceResult', desc: 'On-edge YOLOv8 detections via WS' },
            { name: 'HardwareTelemetryPacket', desc: 'Full 10 Hz telemetry bundle' },
            { name: 'HardwareConnectionConfig', desc: 'Network endpoints for edge bridge' },
          ].map((schema) => (
            <div key={schema.name} className="flex items-start gap-2 p-2 rounded bg-slate-950 border border-slate-800/60">
              <span className="text-cyan-400 font-mono font-bold shrink-0">{schema.name}</span>
              <span className="text-slate-500">{schema.desc}</span>
            </div>
          ))}
        </div>
        <p className="text-[10.5px] text-slate-500 flex items-center gap-1 pt-1">
          <Info className="w-3.5 h-3.5 text-slate-600 shrink-0" />
          All schemas defined in <code className="text-amber-300">src/hardware/types.ts</code>.
          When hardware is procured, implement HardwareDataProvider to parse these packets — no other files change.
        </p>
      </div>

      {/* Transparency Notice */}
      <div className="p-3 rounded-xl border border-amber-500/20 bg-amber-500/5 text-[11px] text-slate-400 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p>
          <strong className="text-amber-300">Phase 4 Transparency Notice:</strong> No physical drone hardware is connected.
          All telemetry visible on the dashboard remains mathematically simulated via{' '}
          <code className="text-cyan-300">SimulationDataProvider</code>.
          This page documents the engineering interfaces and integration plan for when physical hardware is procured.
          No MAVLink commands are sent. No real flight control is performed.
        </p>
      </div>
    </div>
  );
};
