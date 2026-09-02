/**
 * JEEVAN-AIR | Unified Types & Model Re-exports
 * Team ZYNTAX — SIH26177 (Qualcomm Inc)
 */

export * from './common';

import {
  MissionStatus,
  PriorityLevel,
  AcknowledgementStatus,
  DroneState,
  Detection as CommonDetection,
  Survivor as CommonSurvivor,
  Hazard as CommonHazard,
  Alert as CommonAlert,
  MissionState as CommonMissionState,
} from './common';

export interface DroneStatus extends DroneState {
  droneId: string; // alias for id
  missionState: MissionStatus; // alias for status
  commsStatus: 'SIMULATED — CONNECTED' | 'SIMULATED — DEGRADED' | 'SIMULATED — DISCONNECTED'; // alias for connectivityStatus
  aiVisionStatus: 'ACTIVE' | 'CALIBRATING' | 'STANDBY'; // alias for aiStatus
  flightControllerStatus: 'NOT CONNECTED (SIMULATED ROUTE)';
  altitudeMeters: number; // alias for altitude
  speedMps: number; // alias for speed
}

export interface Detection extends CommonDetection {
  coordinates?: { lat: number; lng: number };
}

export interface Hazard extends CommonHazard {
  priority: PriorityLevel; // alias for severity
  affectedRadiusMeters: number; // alias for radius
}

export interface Alert extends CommonAlert {
  message: string; // alias for description
  priority: PriorityLevel; // alias for severity
  status: AcknowledgementStatus; // alias for acknowledgementStatus
}
