/**
 * JEEVAN-AIR | Hardware Telemetry Schema & Integration Types
 * Team ZYNTAX — SIH26177 (Qualcomm Inc)
 *
 * ════════════════════════════════════════════════════════════
 * PHASE 4 — Physical Hardware Integration Preparation
 * ════════════════════════════════════════════════════════════
 *
 * This file defines the complete typed contracts for all
 * physical hardware subsystems that will transmit data to
 * the JEEVAN-AIR Ground Control Station once the physical
 * drone is built and integrated.
 *
 * IMPORTANT: No physical hardware is connected in this phase.
 * These interfaces define the future data contract between:
 *
 *   PHYSICAL DRONE (Pixhawk / ArduPilot / PX4)
 *     → Edge Computer (NVIDIA Jetson Orin Nano or equivalent)
 *     → MAVLink 2.0 / WebSocket Telemetry Bridge
 *     → HardwareDataProvider (implements IDataAdapter)
 *     → Common Data Model (types/common.ts)
 *     → Rescue Intelligence Engine
 *     → Dashboard
 *
 * All types here are precise, validated schemas to ensure
 * that when hardware is purchased and connected, the GCS
 * software requires zero structural changes.
 */

// ─── 1. Flight Controller Telemetry ──────────────────────────────────────────

/**
 * MAVLink HEARTBEAT + GLOBAL_POSITION_INT + ATTITUDE + VFR_HUD equivalent.
 * Populated from flight controller (e.g. Pixhawk 6C running ArduCopter / PX4).
 *
 * Future data path:
 *   Pixhawk UART → Edge Computer → mavlink-router / pymavlink
 *   → WebSocket JSON bridge → HardwareDataProvider
 */
export interface FlightControllerTelemetry {
  /** Drone identifier, e.g. 'JA-RESCUE-01' */
  droneId: string;

  /**
   * MAVLink system_status mapped to operational states.
   * MAVLink ref: HEARTBEAT.system_status
   */
  flightMode: 'MANUAL' | 'GUIDED' | 'AUTO' | 'LOITER' | 'RTL' | 'LAND' | 'STABILIZE' | 'ALT_HOLD' | 'POSCTL';

  /** Armed state — only true when motors are enabled */
  isArmed: boolean;

  /** True if autopilot offboard mission is executing */
  isMissionActive: boolean;

  /**
   * Connection health: MAVLink heartbeat received within last 2000ms
   * false = lost link (triggers UI warning + RTL advisory)
   */
  isConnected: boolean;

  /**
   * Measured latency from last heartbeat round-trip.
   * MAVLink ref: RADIO_STATUS.rssi or system_time
   */
  latencyMs: number;

  /** Timestamp of last received MAVLink packet (ISO-8601) */
  lastHeartbeatAt: string;

  /** MAVLink system ID of the connected autopilot */
  mavlinkSysId: number;

  /** MAVLink component ID */
  mavlinkCompId: number;

  /** Firmware type: 'ArduCopter' | 'PX4' | 'Custom' */
  autopilotFirmware: string;
}

// ─── 2. GPS / GNSS Position ───────────────────────────────────────────────────

/**
 * u-blox NEO-M9N or equivalent GNSS receiver output.
 *
 * Future data path:
 *   u-blox GNSS → Pixhawk GPS port → MAVLink GLOBAL_POSITION_INT
 *   + GPS_RAW_INT → WebSocket bridge → HardwareDataProvider
 */
export interface GNSSPositionPayload {
  /** WGS-84 latitude in decimal degrees */
  latitude: number;

  /** WGS-84 longitude in decimal degrees */
  longitude: number;

  /**
   * Altitude above Mean Sea Level (MSL) in meters.
   * MAVLink ref: GLOBAL_POSITION_INT.alt / 1000 (mm → m)
   */
  altitudeMslMeters: number;

  /**
   * Altitude Above Ground Level (AGL) in meters.
   * Computed: altitudeMslMeters - groundElevationMsl
   */
  altitudeAglMeters: number;

  /**
   * Number of satellites used in the position solution.
   * MAVLink ref: GPS_RAW_INT.satellites_visible
   * Acceptable for navigation: ≥ 6
   */
  satelliteCount: number;

  /**
   * Horizontal dilution of precision.
   * Good: < 2.0 | Acceptable: 2.0–5.0 | Poor: > 5.0
   * MAVLink ref: GPS_RAW_INT.eph / 100
   */
  hdop: number;

  /**
   * GPS fix type.
   * MAVLink ref: GPS_RAW_INT.fix_type
   * 0=NoFix 1=NoFix 2=2D 3=3D 4=DGPS 5=RTK_Float 6=RTK_Fixed
   */
  fixType: 0 | 1 | 2 | 3 | 4 | 5 | 6;

  /**
   * Ground speed in m/s (horizontal velocity magnitude).
   * MAVLink ref: VFR_HUD.groundspeed
   */
  groundSpeedMps: number;

  /**
   * Heading / course over ground in degrees (0–359).
   * MAVLink ref: GPS_RAW_INT.cog / 100
   */
  courseOverGroundDeg: number;

  /** ISO-8601 timestamp from GNSS receiver */
  gnssTimestamp: string;
}

// ─── 3. IMU / Attitude ────────────────────────────────────────────────────────

/**
 * Inertial Measurement Unit readings.
 * Source: Pixhawk onboard IMU (ICM-42688-P or equivalent)
 *
 * Future data path:
 *   Pixhawk → MAVLink ATTITUDE + RAW_IMU + SCALED_IMU → bridge
 */
export interface IMUAttitudePayload {
  /**
   * Roll angle in degrees (-180 to +180).
   * MAVLink ref: ATTITUDE.roll (rad → deg)
   */
  rollDeg: number;

  /**
   * Pitch angle in degrees (-90 to +90).
   * MAVLink ref: ATTITUDE.pitch (rad → deg)
   */
  pitchDeg: number;

  /**
   * True heading in degrees (0–359).
   * MAVLink ref: ATTITUDE.yaw (rad → deg)
   */
  yawDeg: number;

  /** Roll rate in degrees/second */
  rollRateDegS: number;
  /** Pitch rate in degrees/second */
  pitchRateDegS: number;
  /** Yaw rate in degrees/second */
  yawRateDegS: number;

  /**
   * X/Y/Z accelerations in m/s².
   * MAVLink ref: SCALED_IMU
   */
  accelXMs2: number;
  accelYMs2: number;
  accelZMs2: number;

  /** Vibration levels — high values indicate airframe issues (0.0–1.0) */
  vibrationLevel: number;

  /** Timestamp in milliseconds since boot */
  bootTimeMs: number;
}

// ─── 4. RGB Camera Stream ─────────────────────────────────────────────────────

/**
 * RGB optical camera stream metadata.
 * Actual video frames arrive over RTSP / WebRTC (separate stream).
 *
 * Camera options under consideration:
 * - Sony IMX477 / Raspberry Pi HQ Camera (12 MP, CSI-2)
 * - Basler ace U camera (USB3)
 * - GoPro Hero 12 (gimbal-mounted)
 *
 * Future data path:
 *   Camera CSI/USB → Edge Computer (libcamera / GStreamer)
 *   → RTSP server → GCS WebRTC ingress → CameraFeed component
 */
export interface RGBCameraStreamMeta {
  /** Camera hardware ID */
  cameraId: string;

  /** Stream URL for RTSP ingress — e.g. rtsp://192.168.1.10:8554/rgb */
  rtspUrl?: string;

  /** Current video resolution */
  resolutionWidth: number;
  resolutionHeight: number;

  /**
   * Actual achieved frame rate measured by the streaming pipeline.
   * Only show measured values — no invented fps numbers.
   */
  measuredFps?: number;

  /** true if the stream is actively connected and delivering frames */
  isStreamingActive: boolean;

  /** ISO-8601 timestamp of the most recently received frame */
  lastFrameAt?: string;

  /** AI inference is enabled on this stream */
  aiInferenceEnabled: boolean;

  /** Gimbal stabilization active */
  gimbalStabilized: boolean;

  /**
   * Current zoom factor (1.0 = no zoom).
   * Future: controlled via MAVLink CAMERA_SETTINGS
   */
  zoomFactor: number;
}

// ─── 5. Thermal Camera Stream ─────────────────────────────────────────────────

/**
 * LWIR Thermal camera stream metadata and radiometric configuration.
 *
 * Thermal cameras under consideration:
 * - FLIR Lepton 3.5 (160×120, 8.6°×6.6° FOV, SPI interface)
 * - FLIR Boson+ 320 (320×256, USB3-C)
 * - InfiRay C200 Pro (256×192, USB-C)
 *
 * IMPORTANT: Temperature values are raw radiometric readings.
 * Calibration formula: T(°C) = raw_pixel_value × 0.04 − 273.15
 *
 * Future data path:
 *   FLIR Boson (USB3-C) → Edge Computer (FLIR SDK / libuvc)
 *   → Radiometric processing → WebSocket thermal frame metadata
 *   → ThermalProcessingProvider (AI module) → GCS Thermal Feed
 */
export interface ThermalCameraStreamMeta {
  /** Camera hardware model identifier */
  cameraModel: string;

  /** RTSP / WebSocket URL for thermal stream ingress */
  streamUrl?: string;

  resolutionWidth: number;
  resolutionHeight: number;

  /** Spectral response range, e.g. '8–14 μm (LWIR)' */
  spectralRange: string;

  /**
   * Scene minimum temperature at time of frame capture (°C).
   * Derived from radiometric pixel calibration.
   */
  sceneMinTempC: number;

  /**
   * Scene maximum temperature at time of frame capture (°C).
   * Values > 60°C trigger fire hazard detection in ThermalProcessingProvider.
   */
  sceneMaxTempC: number;

  /**
   * Ambient / background reference temperature (°C).
   * Used to compute delta-T for biometric heat anomaly detection.
   */
  ambientTempC: number;

  /** true if thermal stream is actively connected */
  isStreamingActive: boolean;

  /** ISO-8601 timestamp of most recently processed thermal frame */
  lastFrameAt?: string;

  /** Frame integration time in milliseconds (affects sensitivity) */
  integrationTimeMs?: number;

  /**
   * Non-Uniformity Correction status.
   * NUC is a thermal calibration shutter event (≈1 second blackout).
   */
  nucStatus: 'COMPLETED' | 'IN_PROGRESS' | 'REQUIRED';
}

// ─── 6. Battery Telemetry ─────────────────────────────────────────────────────

/**
 * Smart battery / ESC power system telemetry.
 * Source: Pixhawk BATTERY_STATUS MAVLink message.
 *
 * Battery options under consideration:
 * - Tattu 6S 10000mAh LiPo
 * - Tattu Plus 2.0 Smart Battery (with BMS telemetry)
 */
export interface BatteryTelemetryPayload {
  /**
   * State of charge as a percentage (0–100).
   * MAVLink ref: BATTERY_STATUS.battery_remaining
   * Warning threshold: < 25% | Critical threshold: < 15%
   */
  chargePercent: number;

  /**
   * Pack voltage in Volts.
   * 6S nominal: 22.2V | Full: 25.2V | Critical: 21.0V
   * MAVLink ref: BATTERY_STATUS.voltages[0] / 1000
   */
  voltageV: number;

  /**
   * Current draw in Amperes (positive = discharging).
   * MAVLink ref: BATTERY_STATUS.current_battery / 100
   */
  currentA: number;

  /**
   * Consumed capacity in mAh.
   * MAVLink ref: BATTERY_STATUS.current_consumed
   */
  consumedMah: number;

  /** Estimated remaining flight time in seconds based on current draw rate */
  estimatedRemainingSeconds: number;

  /**
   * Cell temperatures in °C (one per cell for smart batteries).
   * High cell temperature (> 55°C) indicates unsafe discharge.
   */
  cellTemperaturesC?: number[];

  /**
   * Battery health status.
   * Derived from: voltage sag, capacity retention, cycle count.
   */
  healthStatus: 'GOOD' | 'DEGRADED' | 'REPLACE_SOON' | 'CRITICAL';

  /** ISO-8601 timestamp */
  timestamp: string;
}

// ─── 7. Connectivity / Link Quality ──────────────────────────────────────────

/**
 * Communication link quality between GCS and drone.
 * Sources: MAVLink RADIO_STATUS + application-level ping metrics.
 *
 * Expected comms stack:
 * - Primary: 5.8 GHz video + 2.4 GHz MAVLink telemetry radio
 * - Backup: 4G/LTE (Holybro SiK v3 or equivalent)
 * - Range target: 3–5 km LoS
 */
export interface LinkQualityPayload {
  /**
   * Overall link health assessment.
   * 'CONNECTED'       = Heartbeat received within 2s, RSSI > -85 dBm
   * 'DEGRADED'        = Packet loss > 10% or RSSI < -85 dBm
   * 'LINK_LOST'       = No heartbeat for > 5s (triggers RTL advisory)
   * 'NOT_CONNECTED'   = Initial state, no link established
   */
  linkStatus: 'CONNECTED' | 'DEGRADED' | 'LINK_LOST' | 'NOT_CONNECTED';

  /**
   * Received Signal Strength Indicator in dBm.
   * MAVLink ref: RADIO_STATUS.rssi
   * Good: > -70 dBm | Acceptable: -70 to -85 | Poor: < -85
   */
  rssiDbm: number;

  /** Remote RSSI (drone-side signal strength) in dBm */
  remoteRssiDbm: number;

  /** Packet loss rate (0.0–1.0 ratio) */
  packetLossRate: number;

  /** Round-trip latency in milliseconds (measured ping) */
  roundTripLatencyMs: number;

  /** Telemetry radio type, e.g. 'SiK v3 900MHz' | '4G LTE' */
  radioType?: string;

  /** true if backup 4G/LTE failover link is active */
  lteFailoverActive: boolean;

  /** ISO-8601 timestamp */
  timestamp: string;
}

// ─── 8. Flight Status / Mission State ────────────────────────────────────────

/**
 * High-level flight and mission state derived from MAVLink HEARTBEAT
 * + MISSION_CURRENT + STATUSTEXT messages.
 */
export interface HardwareFlightStatus {
  /**
   * Overall drone operational state.
   * Maps to IDataAdapter.getMissionState().status
   */
  operationalState:
    | 'PREFLIGHT_CHECK'
    | 'IDLE_DISARMED'
    | 'ARMED_READY'
    | 'TAKEOFF'
    | 'AUTONOMOUS_SEARCH'
    | 'HOVER_OBSERVATION'
    | 'RETURN_TO_LAUNCH'
    | 'LANDING'
    | 'EMERGENCY_LAND'
    | 'MISSION_COMPLETE';

  /**
   * Current waypoint index in the uploaded autonomous mission plan.
   * MAVLink ref: MISSION_CURRENT.seq
   */
  currentWaypointIndex: number;

  /** Total waypoints in the mission */
  totalWaypoints: number;

  /** Mission completion percentage (0–100) */
  missionProgressPercent: number;

  /**
   * Home position (where RTL will return to).
   * Set on first GPS lock + arm.
   */
  homeLatitude: number;
  homeLongitude: number;
  homeAltitudeMsl: number;

  /**
   * Geofence breach status.
   * MAVLink ref: FENCE_STATUS.breach_status
   */
  geofenceBreached: boolean;

  /** Last human-readable status message from autopilot */
  statusText: string;

  /** ISO-8601 timestamp */
  timestamp: string;
}

// ─── 9. Mission State (Hardware) ──────────────────────────────────────────────

/**
 * Runtime mission parameters transmitted from edge computer
 * alongside telemetry for situational awareness.
 */
export interface HardwareMissionPayload {
  /** Unique mission identifier (e.g. 'JA-SAR-2026-09-INDIA') */
  missionId: string;

  /** Geographic name of the search area */
  searchAreaName: string;

  /** Mission start time (ISO-8601) */
  startedAt: string;

  /**
   * Current primary mission objective as updated by the
   * Rescue Intelligence Engine on the edge computer.
   */
  currentObjective: string;

  /**
   * Number of sectors assigned for aerial search
   * (maps to 3×3 grid sectors in the tactical map)
   */
  totalSearchSectors: number;

  /** Sectors completed so far */
  completedSectors: number;

  /** Elapsed mission duration in seconds */
  elapsedSeconds: number;

  /**
   * MAVLink mission waypoints uploaded to the flight controller.
   * Format: array of lat/lng/alt coordinates.
   */
  uploadedWaypoints?: Array<{
    seq: number;
    latitude: number;
    longitude: number;
    altitudeMsl: number;
    command: number; // MAVLink CMD_NAV_WAYPOINT = 16
  }>;
}

// ─── 10. AI Inference Results from Edge Computer ──────────────────────────────

/**
 * AI inference results transmitted from edge computer (Jetson / Pi 5)
 * to the GCS over WebSocket.
 *
 * The edge computer runs:
 * - YOLOv8 / YOLOv11 (person + hazard detection on RGB frames)
 * - Radiometric thermal analysis (LWIR heat signature extraction)
 * - MultiModalFusionEngine (same algorithm as src/ai/MultiModalFusionEngine.ts)
 *
 * These results are transmitted as JSON packets and ingested by
 * HardwareDataProvider → AIPipelineService → Rescue Intelligence Engine.
 *
 * Edge AI options under consideration:
 * - NVIDIA Jetson Orin Nano (8GB, 40 TOPS, 7–15W)
 * - Raspberry Pi 5 + Hailo-8 AI accelerator (26 TOPS)
 * - Qualcomm RB5 5G Development Platform (15 TOPS)
 */
export interface EdgeAIInferenceResult {
  /** ID of the originating edge computer */
  edgeComputerId: string;

  /**
   * Model used for this inference batch.
   * E.g. 'yolov8n-rescue.onnx' | 'yolov11s-person-fire.tflite'
   */
  modelName: string;

  /** Model inference framework */
  inferenceFramework: 'ONNX Runtime' | 'TensorRT' | 'TFLite' | 'OpenCV DNN' | 'Hailo SDK';

  /**
   * Actual measured inference time for this batch in milliseconds.
   * Measured by the edge computer via clock_gettime() / perf_counter().
   * Do NOT invent or estimate — only report measured values.
   */
  measuredInferenceTimeMs: number;

  /** RGB frame ID that was processed */
  rgbFrameId?: string;

  /** Thermal frame ID that was processed */
  thermalFrameId?: string;

  /** Array of per-frame detections from the edge AI */
  detections: EdgeAIDetection[];

  /** ISO-8601 timestamp from the edge computer */
  edgeTimestamp: string;

  /**
   * Round-trip delay from capture to GCS reception in milliseconds.
   * Measured at the GCS by comparing edgeTimestamp with reception time.
   */
  gcsIngestionDelayMs?: number;
}

export interface EdgeAIDetection {
  /** Detection class matching DetectionClass in src/ai/types.ts */
  detectionClass: 'person' | 'fire' | 'smoke' | 'flood' | 'debris' | 'damaged_structure';

  /** Confidence percentage (0–100). Only report model output values. */
  confidence: number;

  /**
   * Normalized bounding box (values 0–100 as percentages of frame dims).
   * Matches BoundingBox interface in src/types/common.ts.
   */
  bboxX: number;
  bboxY: number;
  bboxWidth: number;
  bboxHeight: number;

  /** WGS-84 GPS coordinates at the time of detection */
  latitude: number;
  longitude: number;

  /** Altitude AGL at time of detection */
  altitudeAglMeters: number;

  /** Temperature reading from thermal sensor (only for thermal detections) */
  temperatureC?: number;

  /** true if thermal camera confirmed this detection */
  thermalConfirmed: boolean;

  /** Source modality */
  source: 'RGB' | 'THERMAL' | 'FUSED';
}

// ─── Hardware Connection Configuration ───────────────────────────────────────

/**
 * Runtime hardware connection endpoints.
 * In SIMULATION MODE all values are unused.
 * In HARDWARE MODE these must point to the real edge computer network.
 */
export interface HardwareConnectionConfig {
  /**
   * WebSocket URL of the telemetry bridge running on the edge computer.
   * Example: 'ws://192.168.1.100:8765/telemetry'
   * Requires: JeevanAir Edge Bridge (Python/FastAPI) running on the edge node.
   */
  telemetryBridgeUrl: string;

  /**
   * RTSP stream URL for RGB camera.
   * Example: 'rtsp://192.168.1.100:8554/rgb'
   */
  rgbStreamUrl: string;

  /**
   * WebSocket or RTSP URL for thermal camera frames.
   * Example: 'ws://192.168.1.100:8765/thermal'
   */
  thermalStreamUrl: string;

  /**
   * WebSocket URL for edge AI inference results.
   * Example: 'ws://192.168.1.100:8765/inference'
   */
  edgeAiResultsUrl: string;

  /**
   * MAVLink UDP endpoint if bypassing the bridge for direct connection.
   * Example: 'udp://192.168.1.100:14550'
   * NOTE: Browser cannot open raw UDP — this requires the bridge service.
   */
  mavlinkUdpEndpoint?: string;

  /** Connection timeout in milliseconds before marking link as lost */
  connectionTimeoutMs: number;

  /** Heartbeat interval in milliseconds */
  heartbeatIntervalMs: number;
}

// ─── Hardware Readiness Checklist ─────────────────────────────────────────────

/**
 * Pre-flight hardware integration readiness checklist.
 * Each item maps to a physical subsystem or software integration task.
 *
 * Used by the HardwareStatusPage to display integration progress.
 */
export interface HardwareReadinessItem {
  id: string;
  category: 'FLIGHT_CONTROLLER' | 'GNSS' | 'CAMERAS' | 'EDGE_COMPUTE' | 'COMMS' | 'SOFTWARE';
  title: string;
  description: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETE' | 'BLOCKED';
  dependency?: string;
  phaseTarget: 4 | 5;
}

// ─── Telemetry Packet (Full Hardware State Snapshot) ─────────────────────────

/**
 * Complete hardware telemetry packet transmitted per cycle (e.g. 10 Hz)
 * from the JeevanAir Edge Bridge to the GCS WebSocket client.
 *
 * This packet is the primary ingest format for HardwareDataProvider.
 */
export interface HardwareTelemetryPacket {
  /** Packet sequence number (monotonically increasing) */
  seq: number;

  /** ISO-8601 timestamp from the edge computer */
  timestamp: string;

  /** Flight controller telemetry */
  flightController: FlightControllerTelemetry;

  /** GNSS position fix */
  gnssPosition: GNSSPositionPayload;

  /** IMU attitude */
  attitude: IMUAttitudePayload;

  /** Battery state */
  battery: BatteryTelemetryPayload;

  /** Communication link quality */
  linkQuality: LinkQualityPayload;

  /** Flight and mission status */
  flightStatus: HardwareFlightStatus;

  /** Mission parameters */
  mission: HardwareMissionPayload;

  /** RGB camera metadata (frames arrive separately over RTSP) */
  rgbCamera?: RGBCameraStreamMeta;

  /** Thermal camera metadata */
  thermalCamera?: ThermalCameraStreamMeta;
}
