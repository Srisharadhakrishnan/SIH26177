import React, { useState, useEffect } from 'react';
import { AIPipelineService, InferenceBenchmark } from '../../ai';
import {
  Cpu,
  Zap,
  Activity,
  ShieldCheck,
  RefreshCw,
  Eye,
  Thermometer,
  Layers,
  AlertCircle,
} from 'lucide-react';

export const AIInferencePanel: React.FC = () => {
  const aiService = AIPipelineService.getInstance();
  const [benchmark, setBenchmark] = useState<InferenceBenchmark>(aiService.getLatestBenchmark());
  const [isFallback, setIsFallback] = useState<boolean>(aiService.isFallbackMode());
  const [isRunningInference, setIsRunningInference] = useState<boolean>(false);

  useEffect(() => {
    // Refresh benchmark information periodically
    const interval = setInterval(() => {
      setBenchmark(aiService.getLatestBenchmark());
    }, 1500);
    return () => clearInterval(interval);
  }, [aiService]);

  const handleRunManualTest = async () => {
    setIsRunningInference(true);
    const { benchmark: newBench } = await aiService.processMultiModalFrames(
      {
        id: 'FRAME-TEST-OPTICAL',
        width: 640,
        height: 480,
        timestamp: performance.now(),
        source: 'SIMULATED_STREAM',
      },
      {
        id: 'FRAME-TEST-THERMAL',
        width: 160,
        height: 120,
        timestamp: performance.now(),
        minTempC: 22.4,
        maxTempC: 36.8,
        ambientTempC: 24.1,
        source: 'SIMULATED_THERMAL_STREAM',
      }
    );
    setBenchmark(newBench);
    setIsRunningInference(false);
  };

  const handleToggleFallback = (enabled: boolean) => {
    aiService.setFallbackMode(enabled);
    setIsFallback(enabled);
    setBenchmark(aiService.getLatestBenchmark());
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 lg:p-5 shadow-xl space-y-4">
      {/* Panel Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
              <span>AI Inference & Multi-Modal Fusion Engine</span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-bold">
                PHASE 3 ARCHITECTURE
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              YOLOv8 Optical Person Detection • Radiometric LWIR Thermal Processing • Measured Latency
            </p>
          </div>
        </div>

        {/* Fallback Mode Toggle */}
        <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 p-1 rounded-lg text-xs">
          <button
            onClick={() => handleToggleFallback(false)}
            className={`px-2.5 py-1 rounded font-medium text-[11px] transition ${
              !isFallback
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Real AI Engine
          </button>
          <button
            onClick={() => handleToggleFallback(true)}
            className={`px-2.5 py-1 rounded font-medium text-[11px] transition ${
              isFallback
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Simulation Fallback
          </button>
        </div>
      </div>

      {/* Measured Benchmark Statistics (Strictly Measured via performance.now()) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
          <span className="text-[10px] text-slate-400 block mb-0.5 flex items-center gap-1">
            <Activity className="w-3 h-3 text-cyan-400" />
            Measured Latency
          </span>
          <span className="text-base font-black font-mono text-cyan-300">
            {benchmark.inferenceTimeMs.toFixed(1)} ms
          </span>
          <span className="text-[9.5px] text-slate-500 block mt-0.5 font-mono">
            via performance.now()
          </span>
        </div>

        <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
          <span className="text-[10px] text-slate-400 block mb-0.5 flex items-center gap-1">
            <Cpu className="w-3 h-3 text-indigo-400" />
            Active Architecture
          </span>
          <span className="text-xs font-bold text-slate-200 truncate block font-mono">
            {benchmark.modelName}
          </span>
          <span className="text-[9.5px] text-slate-500 block mt-0.5 font-mono">
            {benchmark.device}
          </span>
        </div>

        <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
          <span className="text-[10px] text-slate-400 block mb-0.5 flex items-center gap-1">
            <Layers className="w-3 h-3 text-emerald-400" />
            Multi-Modal Fusion
          </span>
          <span className="text-xs font-bold text-emerald-400 font-mono">
            RGB + LWIR Thermal
          </span>
          <span className="text-[9.5px] text-slate-500 block mt-0.5 font-mono">
            Spatial IoU Overlap
          </span>
        </div>

        <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
          <span className="text-[10px] text-slate-400 block mb-0.5 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-amber-400" />
            Provider Mode
          </span>
          <span
            className={`text-xs font-bold font-mono ${
              isFallback ? 'text-amber-300' : 'text-cyan-300'
            }`}
          >
            {isFallback ? 'FALLBACK ACTIVE' : 'AI PIPELINE ONLINE'}
          </span>
          <span className="text-[9.5px] text-slate-500 block mt-0.5 font-mono">
            Updated: {benchmark.timestamp}
          </span>
        </div>
      </div>

      {/* Multi-modal Pipeline Breakdown */}
      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
        <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
          <span className="text-slate-300 font-semibold flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Multi-Modal Fusion Verification Breakdown</span>
          </span>
          <button
            onClick={handleRunManualTest}
            disabled={isRunningInference}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10.5px] font-semibold flex items-center gap-1 transition"
          >
            <RefreshCw className={`w-3 h-3 ${isRunningInference ? 'animate-spin' : ''}`} />
            <span>Benchmark Inference</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          <div className="p-2 rounded bg-slate-900 border border-slate-800/80 space-y-1">
            <div className="flex items-center space-x-1 text-cyan-400 font-bold text-[11px]">
              <Eye className="w-3 h-3" />
              <span>1. Optical RGB Backbone</span>
            </div>
            <p className="text-[10.5px] text-slate-400 leading-relaxed">
              YOLOv8 person detector locates human silhouettes, contours, and postures with normalized 2D bounding boxes.
            </p>
          </div>

          <div className="p-2 rounded bg-slate-900 border border-slate-800/80 space-y-1">
            <div className="flex items-center space-x-1 text-amber-400 font-bold text-[11px]">
              <Thermometer className="w-3 h-3" />
              <span>2. Radiometric LWIR Sensor</span>
            </div>
            <p className="text-[10.5px] text-slate-400 leading-relaxed">
              Thermal processor extracts biometric heat signatures (35.5°C – 38.2°C) to filter visual false positives.
            </p>
          </div>

          <div className="p-2 rounded bg-slate-900 border border-slate-800/80 space-y-1">
            <div className="flex items-center space-x-1 text-emerald-400 font-bold text-[11px]">
              <Zap className="w-3 h-3" />
              <span>3. Spatial IoU Fusion Layer</span>
            </div>
            <p className="text-[10.5px] text-slate-400 leading-relaxed">
              Correlates bounding boxes with heat anomalies. Unconfirmed silhouettes trigger Second-Look recheck.
            </p>
          </div>
        </div>
      </div>

      {/* Transparency Guarantee Note */}
      <div className="p-2.5 rounded-lg bg-cyan-950/20 border border-cyan-500/20 text-[11px] text-slate-400 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <p>
          <strong className="text-slate-200">Technical Transparency Guarantee:</strong> Model inference time is measured directly on the host machine using <code className="text-cyan-300">performance.now()</code>. Physical camera payloads and edge coprocessors (NVIDIA Jetson) will be integrated via hardware bridges in Phase 4.
        </p>
      </div>
    </div>
  );
};
