export type FlightMode = 'AUTONOMOUS' | 'MANUAL' | 'RTL' | 'HOVER';

export type MissionState = 'IDLE' | 'SEARCHING' | 'PAUSED' | 'ABORTED' | 'COMPLETED';

export type PriorityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type DetectionStatus = 'REQUIRES_VERIFICATION' | 'VERIFIED' | 'DISMISSED';

export type ZoneId = 'A1' | 'A2' | 'A3' | 'B1' | 'B2' | 'B3' | 'C1' | 'C2' | 'C3';

export interface BoundingBox {
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  width: number; // percentage
  height: number; // percentage
}

export interface Detection {
  id: string;
  type: 'Victim' | 'Hazard' | 'Object';
  subType: string; // e.g., 'Person', 'Fire', 'Flooded Area', 'Debris', 'Damaged Structure', 'Vehicle'
  confidence: number; // percentage (0-100)
  zone: ZoneId;
  timestamp: string;
  priority: PriorityLevel;
  status: DetectionStatus;
  notes?: string;
  bbox?: BoundingBox;
  temperatureReading?: string; // e.g., '37.1°C' for victims or '180°C' for fire
  coordinates?: { lat: number; lng: number };
}

export interface Hazard {
  id: string;
  type: 'Fire' | 'Flooded Area' | 'Debris' | 'Damaged Structure' | 'Vehicle';
  zone: ZoneId;
  confidence: number;
  priority: PriorityLevel;
  status: 'REVIEW REQUIRED' | 'VERIFIED' | 'DISMISSED';
  timestamp: string;
  threatDescription: string;
  affectedRadiusMeters: number;
  bbox?: BoundingBox;
}

export interface SearchZone {
  id: ZoneId;
  name: string;
  row: number;
  col: number;
  status: 'unsearched' | 'searching' | 'searched';
  terrain: 'Urban Debris' | 'Flood Water' | 'Open Field' | 'Collapsed Building' | 'Roadway';
  lat: number;
  lng: number;
  victimsCount: number;
  hazardsCount: number;
}

export interface Alert {
  id: string;
  type: 'VICTIM' | 'HAZARD' | 'SYSTEM';
  title: string;
  message: string;
  zone: ZoneId;
  confidence?: number;
  timestamp: string;
  priority: PriorityLevel;
  status: 'UNREAD' | 'REQUIRES_VERIFICATION' | 'VERIFIED' | 'DISMISSED';
  detectionId?: string;
  hazardId?: string;
}

export interface DroneStatus {
  droneId: string; // 'RESQ-01'
  flightMode: FlightMode;
  missionState: MissionState;
  battery: number; // percentage (e.g., 82)
  gpsStatus: 'SIMULATED — LOCKED' | 'SIMULATED — ACQUIRING' | 'SIMULATED — NO FIX';
  commsStatus: 'SIMULATED — CONNECTED' | 'SIMULATED — DEGRADED' | 'SIMULATED — DISCONNECTED';
  aiVisionStatus: 'ACTIVE' | 'CALIBRATING' | 'STANDBY';
  flightControllerStatus: 'NOT CONNECTED (SIMULATED ROUTE)';
  altitudeMeters: number; // e.g., 32
  speedMps: number; // e.g., 8
  headingDegrees: number; // 0-360
  currentZone: ZoneId;
  progressPercent: number; // 0-100
  cameraMode: 'RGB' | 'THERMAL' | 'AI_OVERLAY';
  isSimulated: true;
}

export interface MissionHistoryItem {
  id: string;
  name: string;
  location: string;
  date: string;
  durationMinutes: number;
  zonesSearched: number;
  totalZones: number;
  victimsDetected: number;
  hazardsDetected: number;
  status: 'Completed' | 'Aborted' | 'In Progress';
  notes: string;
}

export type PageId =
  | 'dashboard'
  | 'mission_control'
  | 'live_search'
  | 'detections'
  | 'hazards'
  | 'search_map'
  | 'alerts'
  | 'mission_history'
  | 'system_status'
  | 'system_architecture';
