/**
 * JEEVAN-AIR | Data Provider Interface
 * Team ZYNTAX — SIH26177 (Qualcomm Inc)
 * 
 * Abstract interface defining the contract for both Simulated data
 * and future physical Hardware telemetry sources (MAVLink / MQTT / REST).
 */

import {
  DroneStatus,
  Telemetry,
  Detection,
  Survivor,
  Hazard,
  Alert,
  MissionState,
  SearchZone,
  MissionHistoryItem,
  ZoneId,
  CameraMode,
  SafeRoute,
  DecisionTimelineEvent,
} from '../types';

export interface IDataAdapter {
  // Data retrieval
  getDroneState(): DroneStatus;
  getTelemetry(): Telemetry;
  getDetections(): Detection[];
  getSurvivors(): Survivor[];
  getHazards(): Hazard[];
  getAlerts(): Alert[];
  getMissionState(): MissionState;
  getZones(): SearchZone[];
  getMissionHistory(): MissionHistoryItem[];
  getMissionTimeSeconds(): number;
  isDemoRunning(): boolean;
  getManualOverrideNotice(): string | null;

  // Intelligence & Decision Support
  getTimelineEvents(): DecisionTimelineEvent[];
  getSafeRouteForSurvivor(survivorId: string): SafeRoute | null;
  getCurrentObjective(): string;

  // Real-time reactive subscription
  subscribe(listener: () => void): () => void;

  // Mission & Flight Controls
  startAutonomousSearch(): void;
  pauseMission(): void;
  resumeMission(): void;
  abortMission(): void;
  resetMission(): void;
  startDemoMode(): void;
  setManualOverride(enabled: boolean): void;
  setCameraMode(mode: CameraMode): void;

  // Incident & Alert Interactions
  markAlertVerified(alertId: string): void;
  dismissAlert(alertId: string): void;
  markDetectionVerified(detectionId: string): void;
  dismissDetection(detectionId: string): void;

  // Second-Look Verification Workflow
  requestSecondLook(survivorId: string): void;

  // Injections / Simulation Tools
  simulateVictim(zone?: ZoneId): void;
  simulateUncertainSurvivor(zone?: ZoneId): void;
  simulateHazard(type?: Hazard['type'], zone?: ZoneId): void;
  setConnectivity(status: 'SIMULATED — CONNECTED' | 'SIMULATED — DEGRADED' | 'SIMULATED — DISCONNECTED'): void;

  // Cleanup
  destroy(): void;
}
