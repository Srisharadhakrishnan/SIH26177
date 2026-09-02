/**
 * JEEVAN-AIR | Common Data Model & Rescue Intelligence Types
 * Team ZYNTAX — SIH26177 (Qualcomm Inc)
 * 
 * Clean, strongly-typed domain interfaces decoupling simulation data
 * from frontend presentation, rescue intelligence, and future hardware adapters.
 */

export type FlightMode = 'AUTONOMOUS' | 'MANUAL' | 'RTL' | 'HOVER';

export type MissionStatus = 'IDLE' | 'SEARCHING' | 'PAUSED' | 'ABORTED' | 'COMPLETED' | 'RETURNING' | 'HOVERING' | 'EMERGENCY';

export type PriorityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type DetectionStatus = 'REQUIRES_VERIFICATION' | 'VERIFIED' | 'DISMISSED';

export type AcknowledgementStatus = 'UNREAD' | 'REQUIRES_VERIFICATION' | 'VERIFIED' | 'DISMISSED';

export type SurvivorVerificationStatus = 'POSSIBLE' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED';

export type MovementStatus = 'UNKNOWN' | 'MOVEMENT_DETECTED' | 'NO_MOVEMENT' | 'MOVING' | 'STATIC';

export type SurvivorCondition = 'UNKNOWN' | 'STABLE' | 'CRITICAL' | 'UNCERTAIN' | 'POSSIBLE' | 'CONFIRMED';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type CameraMode = 'RGB' | 'THERMAL' | 'AI_OVERLAY';

export type ZoneId = 'A1' | 'A2' | 'A3' | 'B1' | 'B2' | 'B3' | 'C1' | 'C2' | 'C3';

export type HazardType =
  | 'Fire'
  | 'Smoke'
  | 'Flood'
  | 'Flooded Area'
  | 'Debris'
  | 'Damaged Structure'
  | 'Landslide'
  | 'Electrical Hazard'
  | 'Exposed Electrical'
  | 'Chemical Hazard'
  | 'Chemical Leak'
  | 'Vehicle';

export interface BoundingBox {
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  width: number; // percentage
  height: number; // percentage
}

export interface GPSPosition {
  latitude: number;
  longitude: number;
  altitude: number;
  timestamp: string;
}

export interface Telemetry {
  droneId: string;
  latitude: number;
  longitude: number;
  altitude: number;
  speed: number;
  battery: number;
  signalStrength: number; // 0-100 percentage
  timestamp: string;
}

export interface DroneState {
  id: string; // e.g. 'JA-RESCUE-01'
  status: MissionStatus;
  flightMode: FlightMode;
  latitude: number;
  longitude: number;
  altitude: number; // meters AGL
  speed: number; // m/s
  headingDegrees: number; // 0-360
  battery: number; // 0-100 percentage
  gpsStatus: 'SIMULATED — LOCKED' | 'SIMULATED — ACQUIRING' | 'SIMULATED — NO FIX';
  connectivityStatus: 'SIMULATED — CONNECTED' | 'SIMULATED — DEGRADED' | 'SIMULATED — DISCONNECTED';
  mission: string;
  aiStatus: 'ACTIVE' | 'CALIBRATING' | 'STANDBY';
  timestamp: string;
  currentZone: ZoneId;
  progressPercent: number;
  cameraMode: CameraMode;
  isSimulated: boolean;
}

export interface Detection {
  id: string;
  type: 'Victim' | 'Hazard' | 'Object';
  subType: string; // 'Person', 'Fire', 'Flooded Area', 'Debris', 'Damaged Structure', 'Vehicle', etc.
  latitude: number;
  longitude: number;
  confidence: number; // 0-100
  timestamp: string;
  source: 'RGB' | 'THERMAL' | 'FUSED';
  status: DetectionStatus;
  zone: ZoneId;
  priority: PriorityLevel;
  notes?: string;
  temperatureReading?: string;
  bbox?: BoundingBox;
}

export interface Survivor {
  id: string;
  latitude: number;
  longitude: number;
  zone: ZoneId;
  timestamp: string;
  
  // Detection confidences
  rgbConfidence: number; // 0-100
  thermalConfidence: number; // 0-100
  confidence: number; // fused confidence 0-100
  thermalConfirmed: boolean;

  // Behavioral & physical observations (Operational, non-medical)
  movementStatus: MovementStatus;
  estimatedCondition: SurvivorCondition;
  condition: SurvivorCondition; // alias

  // Proximity & context
  nearbyHazards: string[]; // IDs of nearby hazards

  // Operational Urgency & Prioritization
  priority: PriorityLevel;
  priorityRank?: number; // 1 = highest, 2 = second, etc.
  riskScore: number; // 0-100 explainable score
  riskLevel: RiskLevel;
  riskReasons: string[];

  // Second-look verification workflow
  verificationStatus: SurvivorVerificationStatus;
  secondLookRequested?: boolean;
  secondLookStatus?: 'NONE' | 'IN_PROGRESS' | 'COMPLETED';

  // Sensor specifics
  temperatureReading?: string;
  notes?: string;
}

export interface Hazard {
  id: string;
  type: HazardType;
  latitude: number;
  longitude: number;
  severity: PriorityLevel;
  confidence: number;
  radius: number; // affected radius in meters
  timestamp: string;
  status: 'REVIEW REQUIRED' | 'VERIFIED' | 'DISMISSED';
  threatDescription: string;
  zone: ZoneId;
  bbox?: BoundingBox;
}

export interface SafeRoute {
  survivorId: string;
  destinationZone: ZoneId;
  startPoint: { lat: number; lng: number; label: string };
  waypoints: Array<{ lat: number; lng: number; label?: string }>;
  gridPath: ZoneId[]; // Sequence of sectors, e.g. ['A1', 'A2', 'B2', 'B3']
  totalDistanceMeters: number;
  estimatedTravelMinutes: number;
  avoidedHazards: string[];
  status: 'CALCULATED' | 'BLOCKED' | 'CLEAR';
  accessibilityRating: 'CLEAR' | 'CAUTION' | 'DIFFICULT' | 'IMPASSABLE';
  routeAdvisory: string;
}

export interface DecisionTimelineEvent {
  id: string;
  timestamp: string;
  type:
    | 'DETECTION'
    | 'SECOND_LOOK_REQUEST'
    | 'SECOND_LOOK_RESULT'
    | 'VERIFICATION'
    | 'HAZARD_PROXIMITY'
    | 'RISK_UPDATE'
    | 'PRIORITY_ASSIGNED'
    | 'ROUTE_GENERATED'
    | 'MISSION_REPLAN';
  title: string;
  description: string;
  severity?: PriorityLevel;
  relatedSurvivorId?: string;
  relatedHazardId?: string;
  zone?: ZoneId;
}

export interface Alert {
  id: string;
  type: 'VICTIM' | 'HAZARD' | 'SYSTEM';
  severity: PriorityLevel;
  title: string;
  description: string;
  latitude?: number;
  longitude?: number;
  timestamp: string;
  acknowledgementStatus: AcknowledgementStatus;
  zone: ZoneId;
  confidence?: number;
  detectionId?: string;
  hazardId?: string;
  survivorId?: string;
}

export interface MissionState {
  missionId: string;
  status: MissionStatus;
  searchArea: string;
  startTime: string;
  currentObjective: string;
  progress: number;
  elapsedSeconds: number;
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
  | 'system_architecture'
  | 'hardware_integration';

