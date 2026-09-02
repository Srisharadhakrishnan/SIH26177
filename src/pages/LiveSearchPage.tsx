import React from 'react';
import { useMission } from '../context/MissionContext';
import { CameraFeed } from '../components/camera/CameraFeed';
import {
  Video,
  Eye,
  Layers,
  User,
  Flame,
} from 'lucide-react';

export const LiveSearchPage: React.FC = () => {
  const { droneStatus, detections, setSelectedDetection, setActivePage } = useMission();

  const activeZoneDetections = detections.filter(
    d => d.zone === droneStatus.currentZone && d.status !== 'DISMISSED'
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Video className="w-5 h-5 text-cyan-400" />
            <span>Live Drone Search & AI Vision Stream</span>
          </h2>
          <p className="text-xs text-slate-400">
            Real-time optical & thermal feed simulation with neural network inference bounding boxes
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-mono font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            LIVE DOWNLINK
          </span>
        </div>
      </div>

      {/* Main Feed Container */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Expanded Camera Feed (8 cols) */}
        <div className="xl:col-span-8 min-h-[520px]">
          <CameraFeed />
        </div>

        {/* Vision Analytics & Stream Metadata (4 cols) */}
        <div className="xl:col-span-4 space-y-5">
          {/* AI Vision Diagnostics Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Eye className="w-4 h-4 text-cyan-400" />
                <span>AI Vision Engine Diagnostics</span>
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300">
                SIMULATED INFERENCE
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                <span className="text-slate-400">Model Architecture:</span>
                <span className="font-mono text-cyan-300 font-bold">YOLOv8-Rescue Custom</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                <span className="text-slate-400">Inference Latency:</span>
                <span className="font-mono text-emerald-400 font-bold">28.4 ms (35.2 FPS)</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                <span className="text-slate-400">Detection Confidence Threshold:</span>
                <span className="font-mono text-slate-200 font-bold">75% Min</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                <span className="text-slate-400">Sensor Fusion:</span>
                <span className="font-mono text-slate-200">RGB 4K + LWIR Thermal</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                <span className="text-slate-400">Active Scan Sector:</span>
                <span className="font-mono text-white font-bold bg-cyan-900/60 px-2 py-0.5 rounded">
                  Sector {droneStatus.currentZone}
                </span>
              </div>
            </div>
          </div>

          {/* Detections in Current Field of View */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-rose-400" />
                <span>Sector {droneStatus.currentZone} In-Frame Targets</span>
              </h3>
              <span className="text-xs font-mono text-slate-400 font-bold">
                {activeZoneDetections.length} Target(s)
              </span>
            </div>

            {activeZoneDetections.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs">
                Airspace clear. No silhouettes or hazard anomalies detected in current frame.
              </div>
            ) : (
              <div className="space-y-2">
                {activeZoneDetections.map(det => {
                  const isVictim = det.type === 'Victim';
                  return (
                    <div
                      key={det.id}
                      onClick={() => {
                        setSelectedDetection(det);
                        setActivePage('detections');
                      }}
                      className={`p-3 rounded-lg border cursor-pointer transition ${
                        isVictim
                          ? 'bg-rose-500/10 border-rose-500/30 hover:bg-rose-500/20'
                          : 'bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {isVictim ? (
                            <User className="w-4 h-4 text-rose-400" />
                          ) : (
                            <Flame className="w-4 h-4 text-amber-400" />
                          )}
                          <span className="font-bold text-xs text-white">{det.subType}</span>
                        </div>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950 font-bold text-cyan-300">
                          {det.confidence}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5">
                        <span>Zone {det.zone}</span>
                        <span>{det.temperatureReading || 'Optical'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
