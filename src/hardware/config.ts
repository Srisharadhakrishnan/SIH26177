/**
 * JEEVAN-AIR | Provider Mode Configuration
 * Team ZYNTAX — SIH26177 (Qualcomm Inc)
 *
 * ════════════════════════════════════════════════════════════
 * PHASE 4 — Hardware Integration Mode Switch
 * ════════════════════════════════════════════════════════════
 *
 * Controls whether the application uses the SimulationDataProvider
 * (default, safe) or the HardwareDataProvider (requires physical drone).
 *
 * HOW TO SWITCH MODES:
 * ─────────────────────────────────────────────────────────────
 * Currently: SIMULATION_MODE = true (safe default)
 *
 * When physical hardware is available and the edge bridge server
 * is running on the drone's companion computer:
 *
 * 1. Set SIMULATION_MODE = false
 * 2. Set HARDWARE_CONNECTION.telemetryBridgeUrl to the actual
 *    WebSocket URL of the JeevanAir Edge Bridge running on the
 *    edge computer (e.g. 'ws://192.168.1.100:8765/telemetry')
 * 3. Run `npm run build` and deploy to GCS
 *
 * The dashboard does NOT need to be rewritten — the IDataAdapter
 * interface ensures full compatibility between providers.
 * ─────────────────────────────────────────────────────────────
 *
 * IMPORTANT: Do NOT set SIMULATION_MODE = false unless the
 * physical drone and edge bridge are operational.
 * Doing so with no hardware connected will cause the dashboard
 * to display 'Hardware Disconnected' and all data will be unavailable.
 */

import type { HardwareConnectionConfig } from './types';

// ─── Primary Mode Toggle ──────────────────────────────────────────────────────

/**
 * SIMULATION_MODE = true  → Uses SimulationDataProvider (safe default)
 * SIMULATION_MODE = false → Uses HardwareDataProvider (requires physical drone)
 *
 * Default: true (must remain true until Phase 4 hardware is built)
 */
export const SIMULATION_MODE: boolean = true;

// ─── Provider Mode Label ──────────────────────────────────────────────────────

export type ProviderMode = 'SIMULATION' | 'HARDWARE';

export const ACTIVE_PROVIDER_MODE: ProviderMode = SIMULATION_MODE ? 'SIMULATION' : 'HARDWARE';

// ─── Hardware Connection Configuration ───────────────────────────────────────

/**
 * Network configuration for the JeevanAir Edge Bridge.
 *
 * Edge Bridge is a lightweight Python/FastAPI WebSocket server
 * running on the edge companion computer (Jetson Orin Nano / Pi 5).
 * It translates MAVLink packets → JSON telemetry packets
 * and streams them to the GCS over WebSocket.
 *
 * These values are unused when SIMULATION_MODE = true.
 */
export const HARDWARE_CONNECTION: HardwareConnectionConfig = {
  // Replace with actual edge computer IP once hardware is available
  telemetryBridgeUrl: 'ws://192.168.1.100:8765/telemetry',
  rgbStreamUrl: 'rtsp://192.168.1.100:8554/rgb',
  thermalStreamUrl: 'ws://192.168.1.100:8765/thermal',
  edgeAiResultsUrl: 'ws://192.168.1.100:8765/inference',
  mavlinkUdpEndpoint: 'udp://192.168.1.100:14550',
  connectionTimeoutMs: 5000,
  heartbeatIntervalMs: 1000,
};

// ─── Hardware Readiness Checklist (Phase 4 Pre-flight Items) ─────────────────

import type { HardwareReadinessItem } from './types';

/**
 * Tracks integration readiness across all hardware subsystems.
 * Rendered on the HardwareIntegrationPage for team situational awareness.
 */
export const HARDWARE_READINESS_CHECKLIST: HardwareReadinessItem[] = [
  // Flight Controller
  {
    id: 'FC-001',
    category: 'FLIGHT_CONTROLLER',
    title: 'Pixhawk 6C / ArduCopter Procurement',
    description: 'Procure and mount Pixhawk 6C (or compatible FC) running ArduCopter 4.x. Configure ESC calibration and motor direction.',
    status: 'NOT_STARTED',
    phaseTarget: 4,
  },
  {
    id: 'FC-002',
    category: 'FLIGHT_CONTROLLER',
    title: 'MAVLink 2.0 Protocol Validation',
    description: 'Validate HEARTBEAT, GLOBAL_POSITION_INT, ATTITUDE, BATTERY_STATUS messages over UART from Pixhawk to edge computer.',
    status: 'NOT_STARTED',
    dependency: 'FC-001',
    phaseTarget: 4,
  },
  {
    id: 'FC-003',
    category: 'FLIGHT_CONTROLLER',
    title: 'JeevanAir Edge Bridge (Python/FastAPI)',
    description: 'Deploy MAVLink → WebSocket JSON bridge on edge computer. Translates telemetry to HardwareTelemetryPacket format defined in hardware/types.ts.',
    status: 'NOT_STARTED',
    dependency: 'FC-002',
    phaseTarget: 4,
  },

  // GNSS
  {
    id: 'GNSS-001',
    category: 'GNSS',
    title: 'GNSS Receiver Procurement',
    description: 'Procure u-blox NEO-M9N or compatible GNSS module. Mount with clear sky view and connect to Pixhawk GPS port.',
    status: 'NOT_STARTED',
    phaseTarget: 4,
  },
  {
    id: 'GNSS-002',
    category: 'GNSS',
    title: 'GPS Accuracy Validation (3D Fix ≥6 Sats)',
    description: 'Validate HDOP < 2.0 and ≥6 satellites in 3D fix mode. Required before autonomous flight approval.',
    status: 'NOT_STARTED',
    dependency: 'GNSS-001',
    phaseTarget: 5,
  },

  // Cameras
  {
    id: 'CAM-001',
    category: 'CAMERAS',
    title: 'RGB Camera Procurement & Mounting',
    description: 'Procure RGB camera (Sony IMX477 or equivalent). Mount on vibration-damped gimbal. Verify CSI/USB connection to edge computer.',
    status: 'NOT_STARTED',
    phaseTarget: 4,
  },
  {
    id: 'CAM-002',
    category: 'CAMERAS',
    title: 'RGB RTSP Stream Integration',
    description: 'Configure GStreamer pipeline on edge computer to expose RGB stream at rtsp://[edge-ip]:8554/rgb. Verify ingestion in GCS CameraFeed component.',
    status: 'NOT_STARTED',
    dependency: 'CAM-001',
    phaseTarget: 4,
  },
  {
    id: 'CAM-003',
    category: 'CAMERAS',
    title: 'Thermal Camera Procurement',
    description: 'Procure LWIR thermal camera (FLIR Boson+ 320 or InfiRay C200 Pro). Ensure radiometric output mode is enabled (14/16-bit grayscale).',
    status: 'NOT_STARTED',
    phaseTarget: 4,
  },
  {
    id: 'CAM-004',
    category: 'CAMERAS',
    title: 'Thermal Radiometric Pipeline',
    description: 'Configure FLIR SDK / libuvc on edge computer. Validate calibration formula T(°C) = pixel × 0.04 − 273.15. Feed into ThermalProcessingProvider.',
    status: 'NOT_STARTED',
    dependency: 'CAM-003',
    phaseTarget: 4,
  },

  // Edge Compute
  {
    id: 'EDGE-001',
    category: 'EDGE_COMPUTE',
    title: 'Edge Computer Procurement',
    description: 'Procure edge AI coprocessor (NVIDIA Jetson Orin Nano 8GB or Raspberry Pi 5 + Hailo-8). Install Ubuntu 22.04 / JetPack 6.',
    status: 'NOT_STARTED',
    phaseTarget: 4,
  },
  {
    id: 'EDGE-002',
    category: 'EDGE_COMPUTE',
    title: 'On-Edge YOLOv8 Inference',
    description: 'Deploy YOLOv8-rescue ONNX/TensorRT model on edge. Validate person + hazard detection at ≥10 FPS. Output EdgeAIInferenceResult packets.',
    status: 'NOT_STARTED',
    dependency: 'EDGE-001',
    phaseTarget: 4,
  },
  {
    id: 'EDGE-003',
    category: 'EDGE_COMPUTE',
    title: 'Edge Bridge WebSocket Server',
    description: 'Deploy JeevanAir Edge Bridge (Python FastAPI) on edge computer. Broadcast HardwareTelemetryPacket + EdgeAIInferenceResult at 10 Hz to GCS.',
    status: 'NOT_STARTED',
    dependency: 'EDGE-001',
    phaseTarget: 4,
  },

  // Communications
  {
    id: 'COMMS-001',
    category: 'COMMS',
    title: 'RF Telemetry Radio Procurement',
    description: 'Procure MAVLink-compatible radio link (Holybro SiK v3 900MHz or RFD900x). Validate 3–5 km LoS range.',
    status: 'NOT_STARTED',
    phaseTarget: 4,
  },
  {
    id: 'COMMS-002',
    category: 'COMMS',
    title: '4G/LTE Backup Link',
    description: 'Configure 4G/LTE router (GL.iNet or Teltonika) on drone for backup link to GCS. Validate failover detection in LinkQualityPayload.',
    status: 'NOT_STARTED',
    dependency: 'COMMS-001',
    phaseTarget: 4,
  },

  // Software Integration
  {
    id: 'SW-001',
    category: 'SOFTWARE',
    title: 'HardwareDataProvider WebSocket Client',
    description: 'Implement WebSocket connection in HardwareDataProvider.ts. Parse HardwareTelemetryPacket and populate IDataAdapter methods. Interface already defined.',
    status: 'NOT_STARTED',
    dependency: 'EDGE-003',
    phaseTarget: 4,
  },
  {
    id: 'SW-002',
    category: 'SOFTWARE',
    title: 'EdgeAIInferenceResult → AIPipelineService Integration',
    description: 'Wire EdgeAIInferenceResult packets from HardwareDataProvider into AIPipelineService.convertDetectionToSurvivor(). All AI types already defined.',
    status: 'NOT_STARTED',
    dependency: 'SW-001',
    phaseTarget: 4,
  },
  {
    id: 'SW-003',
    category: 'SOFTWARE',
    title: 'SIMULATION_MODE = false Switch Validation',
    description: 'After hardware is connected, set SIMULATION_MODE = false in hardware/config.ts. Rebuild and verify dashboard receives live data end-to-end.',
    status: 'NOT_STARTED',
    dependency: 'SW-002',
    phaseTarget: 4,
  },
];
