import React from 'react';
import { useMission } from '../context/MissionContext';
import {
  Activity,
  Cpu,
  Video,
  Compass,
  Radio,
  Gamepad2,
  LayoutDashboard,
  ShieldCheck,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export const SystemStatusPage: React.FC = () => {
  const { droneStatus } = useMission();

  const subsystemList = [
    {
      name: 'AI Engine',
      type: 'Software Inference',
      status: 'ONLINE',
      statusType: 'online',
      description: 'YOLOv8 vision detection pipeline running simulated local inference for victim and hazard classification.',
      icon: Cpu,
    },
    {
      name: 'Camera',
      type: 'Sensor Payload',
      status: 'SIMULATED',
      statusType: 'simulated',
      description: 'Synthetic 4K optical and LWIR thermal search video stream. Real camera module will be integrated via CSI/USB interface in Stage 2.',
      icon: Video,
    },
    {
      name: 'GPS',
      type: 'Navigation Module',
      status: 'SIMULATED',
      statusType: 'simulated',
      description: 'Synthetic NMEA GPS coordinates mapped to 3x3 tactical search grid. Physical GNSS module (u-blox NEO-M8N) to be integrated in future hardware phase.',
      icon: Compass,
    },
    {
      name: 'Drone Link',
      type: 'Telemetry Protocol',
      status: 'SIMULATED',
      statusType: 'simulated',
      description: 'Simulated MAVLink 2.0 telemetry bridge conveying battery, altitude, speed, and heading data.',
      icon: Radio,
    },
    {
      name: 'Communication',
      type: 'RF Transceiver',
      status: 'SIMULATED',
      statusType: 'simulated',
      description: 'Long-range wireless datalink simulation (915 MHz / Wi-Fi mesh). Ground station dashboard connects locally on MacBook.',
      icon: Radio,
    },
    {
      name: 'Flight Controller',
      type: 'Hardware Autopilot',
      status: 'NOT CONNECTED',
      statusType: 'disconnected',
      description: 'Physical flight controller (e.g. Pixhawk / ArduPilot / PX4) is NOT connected in this software prototype stage. Flight path is mathematically simulated.',
      icon: Gamepad2,
    },
    {
      name: 'Dashboard',
      type: 'Command Ground Station',
      status: 'ONLINE',
      statusType: 'online',
      description: 'React + TypeScript real-time emergency monitoring system running natively on client workstation.',
      icon: LayoutDashboard,
    },
  ];

  const getStatusBadge = (status: string, statusType: string) => {
    switch (statusType) {
      case 'online':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {status}
          </span>
        );
      case 'simulated':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 font-mono">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            {status}
          </span>
        );
      case 'disconnected':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5 font-mono">
            <XCircle className="w-3.5 h-3.5" />
            {status}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Title */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <span>Subsystem Telemetry & Hardware Disclosure Matrix</span>
          </h2>
          <p className="text-xs text-slate-400">
            Technical honesty verification and live operational status across software and simulated hardware layers
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono">
            Prototype Environment: MacBook Native
          </span>
        </div>
      </div>

      {/* Prominent Technical Honesty Notice */}
      <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-200 flex items-start space-x-3 shadow-lg">
        <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold text-white text-sm">Technical Transparency Guarantee</h4>
          <p className="leading-relaxed text-slate-300">
            This application is a <strong>software prototype</strong> demonstrating the core AI intelligence, autonomous search logic, and responder decision-making dashboard for SIH Problem Statement SIH26177. No physical drone, flight controller, or GPS hardware is claimed to be connected.
          </p>
        </div>
      </div>

      {/* Subsystems Table / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {subsystemList.map((sys) => {
          const Icon = sys.icon;
          return (
            <div
              key={sys.name}
              className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-cyan-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{sys.name}</h3>
                    <span className="text-[11px] text-slate-400 font-mono">{sys.type}</span>
                  </div>
                </div>

                {getStatusBadge(sys.status, sys.statusType)}
              </div>

              <p className="text-xs text-slate-300 leading-relaxed pt-2 border-t border-slate-800/60">
                {sys.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
