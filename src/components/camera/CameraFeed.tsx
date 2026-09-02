import React, { useState } from 'react';
import { useMission } from '../../context/MissionContext';
import {
  Video,
  Eye,
  Maximize2,
  Crosshair,
  Sliders,
  Flame,
  User,
  AlertTriangle,
  Layers,
  Sparkles,
} from 'lucide-react';

export const CameraFeed: React.FC = () => {
  const {
    droneStatus,
    detections,
    setCameraMode,
    setSelectedDetection,
    setActivePage,
  } = useMission();
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showGridOverlay, setShowGridOverlay] = useState<boolean>(true);

  // Get active detections relevant to current zone or recent detections
  const activeDetections = detections.filter(
    d => d.zone === droneStatus.currentZone && d.status !== 'DISMISSED'
  );

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col h-full">
      {/* Video Feed Header */}
      <div className="bg-slate-950/80 px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-100 tracking-wider">LIVE SEARCH FEED</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-mono font-bold">
                SIMULATION
              </span>
            </div>
            <p className="text-[10.5px] text-slate-400">
              Downlink Stream • 1080p @ 30 FPS • YOLOv8 AI Detection Layer
            </p>
          </div>
        </div>

        {/* Camera Feed Mode Controls */}
        <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 p-1 rounded-lg text-xs">
          <button
            onClick={() => setCameraMode('AI_OVERLAY')}
            className={`px-2.5 py-1 rounded font-medium text-[11px] transition ${
              droneStatus.cameraMode === 'AI_OVERLAY'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            AI Overlay
          </button>
          <button
            onClick={() => setCameraMode('THERMAL')}
            className={`px-2.5 py-1 rounded font-medium text-[11px] transition ${
              droneStatus.cameraMode === 'THERMAL'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Thermal IR
          </button>
          <button
            onClick={() => setCameraMode('RGB')}
            className={`px-2.5 py-1 rounded font-medium text-[11px] transition ${
              droneStatus.cameraMode === 'RGB'
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Optical (RGB)
          </button>
        </div>
      </div>

      {/* Main Viewport Container */}
      <div className="relative flex-1 min-h-[360px] bg-slate-950 flex items-center justify-center overflow-hidden select-none">
        {/* Synthetic Disaster Search Background Scene */}
        <div
          className={`absolute inset-0 transition-all duration-700 ${
            droneStatus.cameraMode === 'THERMAL'
              ? 'bg-gradient-to-br from-indigo-950 via-purple-950 to-orange-950/80 filter saturate-150 contrast-125'
              : 'bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950'
          }`}
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {/* Simulated Disaster Terrain Features (SVG Artwork) */}
          <svg className="w-full h-full opacity-40" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="disasterGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(6, 182, 212, 0.08)" strokeWidth="1" />
              </pattern>
              <radialGradient id="waterGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#0369a1" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#disasterGrid)" />
            {/* Water body flow */}
            <path
              d="M0,150 Q150,220 300,160 T600,200 T900,140 L900,400 L0,400 Z"
              fill="url(#waterGlow)"
            />
            {/* Debris / road contours */}
            <path
              d="M100,50 L450,280 L750,190"
              stroke="#475569"
              strokeWidth="16"
              strokeDasharray="10 5"
              fill="none"
              opacity="0.3"
            />
            <path
              d="M380,180 L520,310"
              stroke="#64748b"
              strokeWidth="24"
              fill="none"
              opacity="0.25"
            />
          </svg>
        </div>

        {/* Scanlines Effect */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none opacity-60"></div>

        {/* Tactical HUD Overlay Elements */}
        <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
          {/* Top HUD Row */}
          <div className="flex justify-between items-start text-[11px] font-mono text-cyan-400/90 drop-shadow">
            <div className="space-y-1 bg-slate-950/70 p-2 rounded border border-cyan-500/20 backdrop-blur-sm">
              <div>CAM: 4K OPTICAL/LWIR SIM</div>
              <div>ZOOM: {zoomLevel}x • FOV: 84°</div>
              <div>LAT: 13.0827° N • LNG: 80.2707° E</div>
            </div>

            <div className="space-y-1 text-right bg-slate-950/70 p-2 rounded border border-cyan-500/20 backdrop-blur-sm">
              <div className="text-emerald-400 font-bold">AI INFERENCE: 28.4ms (SIM)</div>
              <div>TARGET ZONE: <span className="text-white font-bold">{droneStatus.currentZone}</span></div>
              <div>ALTITUDE: {droneStatus.altitudeMeters}m AGL</div>
            </div>
          </div>

          {/* Center Reticle & Crosshair */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
            <div className="w-24 h-24 rounded-full border border-cyan-500/30 flex items-center justify-center">
              <div className="w-12 h-12 border-t-2 border-b-2 border-cyan-400/50 rounded-full"></div>
              <div className="absolute w-6 h-0.5 bg-cyan-400/70"></div>
              <div className="absolute h-6 w-0.5 bg-cyan-400/70"></div>
            </div>
          </div>

          {/* Bottom HUD Bar */}
          <div className="flex justify-between items-end text-[11px] font-mono text-slate-300 drop-shadow">
            <div className="bg-slate-950/80 px-2.5 py-1 rounded border border-slate-800 backdrop-blur-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>SYNTHETIC TERRAIN: {droneStatus.currentZone} SECTOR</span>
            </div>

            <div className="bg-slate-950/80 px-2.5 py-1 rounded border border-slate-800 backdrop-blur-sm text-cyan-300">
              FRAME: #04821 • RAW FEED SIMULATED
            </div>
          </div>
        </div>

        {/* AI Detection Bounding Boxes Overlay */}
        {droneStatus.cameraMode !== 'RGB' && activeDetections.map((det) => {
          const isVictim = det.type === 'Victim';
          const bbox = det.bbox || { x: 40, y: 35, width: 22, height: 38 };

          return (
            <div
              key={det.id}
              onClick={() => {
                setSelectedDetection(det);
                setActivePage('detections');
              }}
              style={{
                left: `${bbox.x}%`,
                top: `${bbox.y}%`,
                width: `${bbox.width}%`,
                height: `${bbox.height}%`,
              }}
              className={`absolute border-2 cursor-pointer transition-all duration-300 group z-20 ${
                isVictim
                  ? 'border-rose-500 bg-rose-500/10 shadow-lg shadow-rose-950/50 hover:bg-rose-500/20'
                  : 'border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-950/50 hover:bg-amber-500/20'
              }`}
            >
              {/* Corner brackets */}
              <div className={`absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 ${isVictim ? 'border-rose-400' : 'border-amber-400'}`}></div>
              <div className={`absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 ${isVictim ? 'border-rose-400' : 'border-amber-400'}`}></div>
              <div className={`absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 ${isVictim ? 'border-rose-400' : 'border-amber-400'}`}></div>
              <div className={`absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 ${isVictim ? 'border-rose-400' : 'border-amber-400'}`}></div>

              {/* Tag Label Badge */}
              <div
                className={`absolute -top-7 left-0 px-2 py-0.5 rounded text-[10.5px] font-bold font-mono tracking-wide flex items-center gap-1 shadow-md whitespace-nowrap ${
                  isVictim
                    ? 'bg-rose-600 text-white'
                    : 'bg-amber-600 text-slate-950 font-black'
                }`}
              >
                {isVictim ? <User className="w-3 h-3" /> : <Flame className="w-3 h-3" />}
                <span>{det.subType.toUpperCase()}</span>
                <span>{det.confidence}%</span>
                <span className="text-[9px] opacity-80">[{det.zone}]</span>
              </div>

              {/* Thermal signature indicator if applicable */}
              {det.temperatureReading && (
                <div className="absolute -bottom-6 left-0 px-1.5 py-0.5 bg-slate-900/90 text-[9px] font-mono text-cyan-300 rounded border border-slate-700 whitespace-nowrap">
                  TEMP: {det.temperatureReading}
                </div>
              )}
            </div>
          );
        })}

        {/* If no detection in current zone and searching, show scanning pulse */}
        {droneStatus.missionState === 'SEARCHING' && activeDetections.length === 0 && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-48 h-48 border border-cyan-500/20 rounded-full animate-ping opacity-40"></div>
            <div className="text-cyan-400/80 font-mono text-xs bg-slate-950/80 px-3 py-1.5 rounded-full border border-cyan-500/30 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              AI SCANNING ZONE {droneStatus.currentZone}...
            </div>
          </div>
        )}
      </div>

      {/* Camera Feed Bottom Tools */}
      <div className="bg-slate-950/80 px-4 py-2.5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center space-x-3">
          <span className="flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span>Target Silhouettes: <strong className="text-slate-200">{activeDetections.length}</strong></span>
          </span>
          <span className="text-slate-700">|</span>
          <span>Feed Quality: <strong className="text-emerald-400 font-mono">100%</strong> (Simulated)</span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setZoomLevel(prev => (prev === 1 ? 1.5 : prev === 1.5 ? 2 : 1))}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] transition"
          >
            Zoom: {zoomLevel}x
          </button>
        </div>
      </div>
    </div>
  );
};
