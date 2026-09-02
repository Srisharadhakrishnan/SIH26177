import React from 'react';
import {
  Layers,
  Video,
  Cpu,
  Eye,
  Compass,
  Radio,
  LayoutDashboard,
  UserCheck,
  ArrowDown,
  CheckCircle2,
  Sparkles,
  Shield,
} from 'lucide-react';

export const SystemArchitecturePage: React.FC = () => {
  const pipelineSteps = [
    {
      step: 1,
      name: 'Drone Camera',
      icon: Video,
      color: 'cyan',
      description: 'Captures images/video of the disaster area.',
      detail: 'High-resolution optical & thermal camera payload streaming aerial imagery of flood and debris zones.',
      prototypeStatus: 'Simulated 1080p stream with synthetic terrain generation',
    },
    {
      step: 2,
      name: 'Onboard Computer',
      icon: Cpu,
      color: 'indigo',
      description: 'Processes information from the camera and runs the AI.',
      detail: 'Compact edge AI compute board (e.g., Raspberry Pi 5 / NVIDIA Jetson Orin Nano) processing real-time video frames.',
      prototypeStatus: 'Simulated edge processing on host machine',
    },
    {
      step: 3,
      name: 'AI Detection Engine',
      icon: Eye,
      color: 'rose',
      description: 'Looks at images and identifies possible people or hazards.',
      detail: 'YOLOv8 custom-trained neural network classifying victims, floodwaters, collapsed structures, fires, and debris.',
      prototypeStatus: 'Active local simulation with deterministic bounding boxes',
    },
    {
      step: 4,
      name: 'GPS Location Unit',
      icon: Compass,
      color: 'emerald',
      description: 'Provides the approximate location of a detection.',
      detail: 'GNSS receiver geotagging detection coordinates and mapping victim pins directly to search sectors.',
      prototypeStatus: 'Simulated NMEA coordinates mapped to 3x3 search sectors',
    },
    {
      step: 5,
      name: 'Wireless Communication',
      icon: Radio,
      color: 'purple',
      description: 'Sends information from the drone to the rescue team.',
      detail: 'Long-range RF telemetry (915 MHz / 2.4 GHz mesh) transmitting incident alerts and telemetry packets down to ground command.',
      prototypeStatus: 'Simulated local event dispatcher',
    },
    {
      step: 6,
      name: 'Rescue Dashboard',
      icon: LayoutDashboard,
      color: 'cyan',
      description: 'Shows detections and alerts to the human responder.',
      detail: 'React command center with live map markers, camera overlays, severity rankings, and mission statistics.',
      prototypeStatus: 'Fully operational web application (Current Prototype)',
    },
    {
      step: 7,
      name: 'Human Responder Decision',
      icon: UserCheck,
      color: 'emerald',
      description: 'Reviews the alert and decides the appropriate rescue action.',
      detail: 'Incident commanders verify targets, dispatch swiftwater rescue teams, or reroute aerial sweeps.',
      prototypeStatus: 'Fully operational interactive responder verification workflow',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <span>End-to-End System Architecture & Dataflow Pipeline</span>
          </h2>
          <p className="text-xs text-slate-400">
            Complete technical blueprint from disaster area aerial scanning to final human rescue intervention
          </p>
        </div>

        <span className="text-xs font-mono px-3 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
          SIH26177 System Blueprint
        </span>
      </div>

      {/* Stage Roadmap Comparison Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Current Prototype Box */}
        <div className="bg-slate-900/90 border border-cyan-500/40 rounded-xl p-5 shadow-xl space-y-2">
          <div className="flex items-center space-x-2 text-cyan-400 font-bold text-sm">
            <CheckCircle2 className="w-4 h-4" />
            <span>CURRENT PROTOTYPE (Stage 1)</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Drone flight, GPS telemetry, camera feed, and wireless communications are mathematically <strong>simulated</strong>. The software prototype fully implements the autonomous search logic, AI detection visualization, alert dispatching, and responder decision interface.
          </p>
        </div>

        {/* Next Stage Hardware Box */}
        <div className="bg-slate-900/90 border border-indigo-500/40 rounded-xl p-5 shadow-xl space-y-2">
          <div className="flex items-center space-x-2 text-indigo-400 font-bold text-sm">
            <Sparkles className="w-4 h-4" />
            <span>NEXT STAGE (Hardware Integration)</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Integrate the tested software with a physical quadcopter drone, Pixhawk flight controller, u-blox NEO GPS, 4K/thermal camera, Raspberry Pi / Jetson edge computer, and long-range RF telemetry link.
          </p>
        </div>
      </div>

      {/* Visual Pipeline Flowchart */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 pb-3 border-b border-slate-800">
          <Shield className="w-4 h-4 text-cyan-400" />
          <span>7-Step Autonomous Search & Rescue Workflow</span>
        </h3>

        <div className="relative space-y-4 max-w-3xl mx-auto">
          {pipelineSteps.map((step, idx) => {
            const Icon = step.icon;
            const isLast = idx === pipelineSteps.length - 1;

            return (
              <React.Fragment key={step.step}>
                <div className="bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
                  <div className="flex items-start space-x-3.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 text-cyan-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-bold text-cyan-400">
                          0{step.step}.
                        </span>
                        <h4 className="text-sm font-bold text-white">{step.name}</h4>
                      </div>
                      <p className="text-xs text-slate-200 font-medium mt-0.5">
                        “{step.description}”
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">{step.detail}</p>
                    </div>
                  </div>

                  <div className="sm:text-right shrink-0">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 block sm:inline-block">
                      {step.prototypeStatus}
                    </span>
                  </div>
                </div>

                {!isLast && (
                  <div className="flex justify-center my-1 text-slate-600">
                    <ArrowDown className="w-5 h-5 text-cyan-500/60 animate-bounce" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
