/**
 * JEEVAN-AIR | Simulation Data Provider with Rescue Intelligence Layer
 * Team ZYNTAX — SIH26177 (Qualcomm Inc)
 * 
 * Concrete implementation of IDataAdapter providing:
 * - Mathematical flight telemetry & 3x3 lawn-mower route stepping
 * - Fused survivor & hazard data generation with spatial proximity analysis
 * - Explainable risk assessment & operational rescue prioritization
 * - Ground responder safe-access pathfinding (A* on hazard grid)
 * - Autonomous second-look verification simulation
 * - Dynamic mission replanning & decision timeline event logging
 */

import { IDataAdapter } from './IDataAdapter';
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
import { INITIAL_ZONES, SEARCH_ROUTE, INITIAL_MISSION_HISTORY } from '../data/mockData';
import {
  findNearbyHazards,
  assessSurvivorRisk,
  prioritizeSurvivors,
  calculateSafeRoute,
  executeSecondLookResolution,
} from '../services/rescueIntelligence';

export class SimulationDataProvider implements IDataAdapter {
  private droneStatus: DroneStatus;
  private zones: SearchZone[];
  private detections: Detection[];
  private survivors: Survivor[] = [];
  private hazards: Hazard[];
  private alerts: Alert[];
  private missionHistory: MissionHistoryItem[];
  private timelineEvents: DecisionTimelineEvent[] = [];
  private safeRoutes: Map<string, SafeRoute> = new Map();
  private missionTimeSeconds: number = 0;
  private isDemoModeActive: boolean = false;
  private manualNotice: string | null = null;
  private currentObjective: string = 'Scan disaster grid (3×3 sectors) for survivors and secondary hazards';

  private listeners: Set<() => void> = new Set();
  private stepInterval: number | null = null;
  private missionTimer: number | null = null;
  private currentRouteIndex: number = 0;

  constructor() {
    const nowTime = new Date().toLocaleTimeString([], { hour12: false });

    this.droneStatus = {
      id: 'JA-RESCUE-01',
      droneId: 'JA-RESCUE-01',
      status: 'IDLE',
      missionState: 'IDLE',
      flightMode: 'AUTONOMOUS',
      latitude: 13.0827,
      longitude: 80.2707,
      altitude: 32,
      altitudeMeters: 32,
      speed: 0,
      speedMps: 0,
      headingDegrees: 45,
      battery: 98,
      gpsStatus: 'SIMULATED — LOCKED',
      connectivityStatus: 'SIMULATED — CONNECTED',
      commsStatus: 'SIMULATED — CONNECTED',
      aiStatus: 'ACTIVE',
      aiVisionStatus: 'ACTIVE',
      flightControllerStatus: 'NOT CONNECTED (SIMULATED ROUTE)',
      mission: 'Flood Rescue Simulation',
      currentZone: 'A1',
      progressPercent: 0,
      cameraMode: 'AI_OVERLAY',
      isSimulated: true,
      timestamp: nowTime,
    };

    this.zones = [...INITIAL_ZONES];
    this.detections = [];
    this.hazards = [];
    this.missionHistory = [...INITIAL_MISSION_HISTORY];

    this.alerts = [
      {
        id: 'ALT-SYS-001',
        type: 'SYSTEM',
        severity: 'LOW',
        priority: 'LOW',
        title: 'JEEVAN-AIR Intelligence Engine Online',
        description: 'Autonomous search grid initialized. Risk Assessment, Prioritization, and Safe-Access Routing active.',
        message: 'Autonomous search grid initialized. Risk Assessment, Prioritization, and Safe-Access Routing active.',
        zone: 'A1',
        timestamp: nowTime,
        acknowledgementStatus: 'VERIFIED',
        status: 'VERIFIED',
      },
    ];

    this.timelineEvents = [
      {
        id: 'EVT-INIT-01',
        timestamp: nowTime,
        type: 'MISSION_REPLAN',
        title: 'Mission Initialized: Sector Grid A1-C3',
        description: 'Command system standing by. Lawn-mower boustrophedon sweep trajectory loaded.',
        severity: 'LOW',
      },
    ];
  }

  // Reactive subscription
  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener());
  }

  // Getters
  public getDroneState(): DroneStatus {
    return { ...this.droneStatus };
  }

  public getTelemetry(): Telemetry {
    return {
      droneId: this.droneStatus.droneId,
      latitude: this.droneStatus.latitude,
      longitude: this.droneStatus.longitude,
      altitude: this.droneStatus.altitudeMeters,
      speed: this.droneStatus.speedMps,
      battery: this.droneStatus.battery,
      signalStrength: this.droneStatus.connectivityStatus === 'SIMULATED — CONNECTED' ? 94 : 42,
      timestamp: this.droneStatus.timestamp,
    };
  }

  public getDetections(): Detection[] {
    return [...this.detections];
  }

  public getSurvivors(): Survivor[] {
    return [...this.survivors];
  }

  public getHazards(): Hazard[] {
    return [...this.hazards];
  }

  public getAlerts(): Alert[] {
    return [...this.alerts];
  }

  public getZones(): SearchZone[] {
    return [...this.zones];
  }

  public getMissionHistory(): MissionHistoryItem[] {
    return [...this.missionHistory];
  }

  public getMissionTimeSeconds(): number {
    return this.missionTimeSeconds;
  }

  public isDemoRunning(): boolean {
    return this.isDemoModeActive;
  }

  public getManualOverrideNotice(): string | null {
    return this.manualNotice;
  }

  public getTimelineEvents(): DecisionTimelineEvent[] {
    return [...this.timelineEvents];
  }

  public getSafeRouteForSurvivor(survivorId: string): SafeRoute | null {
    return this.safeRoutes.get(survivorId) || null;
  }

  public getCurrentObjective(): string {
    return this.currentObjective;
  }

  public getMissionState(): MissionState {
    return {
      missionId: 'MSN-JA-2026-01',
      status: this.droneStatus.missionState,
      searchArea: '3x3 Disaster Sector Grid',
      startTime: 'Live Operational Session',
      currentObjective: this.currentObjective,
      progress: this.droneStatus.progressPercent,
      elapsedSeconds: this.missionTimeSeconds,
    };
  }

  // Flight & Mission Controls
  public startAutonomousSearch(): void {
    if (this.droneStatus.missionState === 'PAUSED') {
      this.resumeMission();
      return;
    }

    this.currentRouteIndex = 0;
    const initialZone = SEARCH_ROUTE[0];

    this.droneStatus = {
      ...this.droneStatus,
      status: 'SEARCHING',
      missionState: 'SEARCHING',
      flightMode: 'AUTONOMOUS',
      currentZone: initialZone,
      progressPercent: 11,
      speed: 8,
      speedMps: 8,
    };

    this.currentObjective = `Autonomous sweep: Sweeping Sector ${initialZone}`;

    this.zones = this.zones.map((z) =>
      z.id === initialZone ? { ...z, status: 'searching' } : { ...z, status: 'unsearched' }
    );
    this.manualNotice = null;

    this.logEvent({
      type: 'MISSION_REPLAN',
      title: 'Autonomous Sweep Initiated',
      description: `Targeting Sector ${initialZone} at 32m AGL. Sensor fusion pipeline active.`,
      severity: 'LOW',
      zone: initialZone,
    });

    this.startTimers(7000);
    this.notify();
  }

  public pauseMission(): void {
    this.stopStepInterval();
    this.droneStatus = {
      ...this.droneStatus,
      status: 'PAUSED',
      missionState: 'PAUSED',
      speed: 0,
      speedMps: 0,
    };
    this.currentObjective = 'Mission paused by operator';
    this.notify();
  }

  public resumeMission(): void {
    this.droneStatus = {
      ...this.droneStatus,
      status: 'SEARCHING',
      missionState: 'SEARCHING',
      flightMode: 'AUTONOMOUS',
      speed: 8,
      speedMps: 8,
    };
    this.manualNotice = null;
    this.currentObjective = `Resuming sweep: Sweeping Sector ${this.droneStatus.currentZone}`;

    this.startTimers(7000);
    this.notify();
  }

  public abortMission(): void {
    this.stopStepInterval();
    this.isDemoModeActive = false;

    this.droneStatus = {
      ...this.droneStatus,
      status: 'ABORTED',
      missionState: 'ABORTED',
      flightMode: 'RTL',
      speed: 0,
      speedMps: 0,
    };

    this.currentObjective = 'MISSION ABORTED — Simulating Return-To-Launch (RTL)';

    const nowTime = new Date().toLocaleTimeString([], { hour12: false });
    const abortAlert: Alert = {
      id: `ALT-ABORT-${Date.now().toString().slice(-4)}`,
      type: 'SYSTEM',
      severity: 'HIGH',
      priority: 'HIGH',
      title: 'MISSION ABORTED — RTL ENGAGED',
      description: 'Operator triggered emergency mission abort. Drone simulated Return-To-Launch sequence active.',
      message: 'Operator triggered emergency mission abort. Drone simulated Return-To-Launch sequence active.',
      zone: this.droneStatus.currentZone,
      timestamp: nowTime,
      acknowledgementStatus: 'VERIFIED',
      status: 'VERIFIED',
    };

    this.alerts = [abortAlert, ...this.alerts];
    this.logEvent({
      type: 'MISSION_REPLAN',
      title: 'Emergency Mission Abort',
      description: 'Operator engaged RTL. All autonomous tasks suspended.',
      severity: 'HIGH',
      zone: this.droneStatus.currentZone,
    });

    this.notify();
  }

  public resetMission(): void {
    this.stopStepInterval();
    this.stopMissionTimer();
    this.isDemoModeActive = false;
    this.currentRouteIndex = 0;
    this.missionTimeSeconds = 0;
    this.manualNotice = null;
    this.currentObjective = 'Scan disaster grid (3×3 sectors) for survivors and secondary hazards';

    const nowTime = new Date().toLocaleTimeString([], { hour12: false });

    this.droneStatus = {
      id: 'JA-RESCUE-01',
      droneId: 'JA-RESCUE-01',
      status: 'IDLE',
      missionState: 'IDLE',
      flightMode: 'AUTONOMOUS',
      latitude: 13.0827,
      longitude: 80.2707,
      altitude: 32,
      altitudeMeters: 32,
      speed: 0,
      speedMps: 0,
      headingDegrees: 45,
      battery: 98,
      gpsStatus: 'SIMULATED — LOCKED',
      connectivityStatus: 'SIMULATED — CONNECTED',
      commsStatus: 'SIMULATED — CONNECTED',
      aiStatus: 'ACTIVE',
      aiVisionStatus: 'ACTIVE',
      flightControllerStatus: 'NOT CONNECTED (SIMULATED ROUTE)',
      mission: 'Flood Rescue Simulation',
      currentZone: 'A1',
      progressPercent: 0,
      cameraMode: 'AI_OVERLAY',
      isSimulated: true,
      timestamp: nowTime,
    };

    this.zones = [...INITIAL_ZONES];
    this.detections = [];
    this.survivors = [];
    this.hazards = [];
    this.safeRoutes.clear();

    this.alerts = [
      {
        id: 'ALT-SYS-RESET',
        type: 'SYSTEM',
        severity: 'LOW',
        priority: 'LOW',
        title: 'System Reset Complete',
        description: 'Mission reset to initial state. Ready for autonomous search sweep or presentation demo.',
        message: 'Mission reset to initial state. Ready for autonomous search sweep or presentation demo.',
        zone: 'A1',
        timestamp: nowTime,
        acknowledgementStatus: 'VERIFIED',
        status: 'VERIFIED',
      },
    ];

    this.timelineEvents = [
      {
        id: `EVT-RESET-${Date.now().toString().slice(-4)}`,
        timestamp: nowTime,
        type: 'MISSION_REPLAN',
        title: 'Mission Reset Complete',
        description: 'All previous incidents and routes cleared. Standing by for launch.',
        severity: 'LOW',
      },
    ];

    this.notify();
  }

  public startDemoMode(): void {
    this.resetMission();
    this.isDemoModeActive = true;
    this.currentRouteIndex = 0;

    this.droneStatus = {
      ...this.droneStatus,
      status: 'SEARCHING',
      missionState: 'SEARCHING',
      flightMode: 'AUTONOMOUS',
      currentZone: 'A1',
      progressPercent: 11,
      speed: 8,
      speedMps: 8,
    };

    this.currentObjective = 'DEMO MODE: Automated 60-75s search & rescue verification sequence';
    this.zones = this.zones.map((z) => (z.id === 'A1' ? { ...z, status: 'searching' } : z));

    this.logEvent({
      type: 'MISSION_REPLAN',
      title: 'Demo Mode Launched (60-75s)',
      description: 'Running autonomous disaster sweep across 9 sectors with deterministic survivor and hazard triggers.',
      severity: 'LOW',
      zone: 'A1',
    });

    // Accelerated 6s interval for reliable presentation sequence
    this.startTimers(6000);
    this.notify();
  }

  public setManualOverride(enabled: boolean): void {
    if (enabled) {
      this.stopStepInterval();
      this.droneStatus = {
        ...this.droneStatus,
        flightMode: 'MANUAL',
        status: 'PAUSED',
        missionState: 'PAUSED',
        speed: 4,
        speedMps: 4,
      };
      this.manualNotice = 'Manual control engaged — operator software joystick active.';
      this.currentObjective = 'MANUAL OVERRIDE: Operator tactical positioning active';
    } else {
      this.manualNotice = null;
      this.resumeMission();
    }
    this.notify();
  }

  public setCameraMode(mode: CameraMode): void {
    this.droneStatus = { ...this.droneStatus, cameraMode: mode };
    this.notify();
  }

  public setConnectivity(status: 'SIMULATED — CONNECTED' | 'SIMULATED — DEGRADED' | 'SIMULATED — DISCONNECTED'): void {
    this.droneStatus = {
      ...this.droneStatus,
      connectivityStatus: status,
      commsStatus: status,
    };
    this.notify();
  }

  // Verification actions
  public markAlertVerified(alertId: string): void {
    this.alerts = this.alerts.map((a) =>
      a.id === alertId ? { ...a, acknowledgementStatus: 'VERIFIED', status: 'VERIFIED' } : a
    );
    const alert = this.alerts.find((a) => a.id === alertId);
    if (alert?.detectionId) {
      this.markDetectionVerified(alert.detectionId);
    } else if (alert?.survivorId) {
      this.survivors = this.survivors.map((s) =>
        s.id === alert.survivorId ? { ...s, verificationStatus: 'VERIFIED' } : s
      );
      this.recomputePrioritiesAndRoutes();
    } else {
      this.notify();
    }
  }

  public dismissAlert(alertId: string): void {
    this.alerts = this.alerts.map((a) =>
      a.id === alertId ? { ...a, acknowledgementStatus: 'DISMISSED', status: 'DISMISSED' } : a
    );
    const alert = this.alerts.find((a) => a.id === alertId);
    if (alert?.detectionId) {
      this.dismissDetection(alert.detectionId);
    } else {
      this.notify();
    }
  }

  public markDetectionVerified(detectionId: string): void {
    this.detections = this.detections.map((d) =>
      d.id === detectionId ? { ...d, status: 'VERIFIED' } : d
    );
    this.alerts = this.alerts.map((a) =>
      a.detectionId === detectionId ? { ...a, acknowledgementStatus: 'VERIFIED', status: 'VERIFIED' } : a
    );

    // Update matching survivor if any
    this.survivors = this.survivors.map((s) =>
      s.id === detectionId || s.id === `SURV-${detectionId.slice(-4)}`
        ? { ...s, verificationStatus: 'VERIFIED' }
        : s
    );

    this.recomputePrioritiesAndRoutes();
  }

  public dismissDetection(detectionId: string): void {
    this.detections = this.detections.map((d) =>
      d.id === detectionId ? { ...d, status: 'DISMISSED' } : d
    );
    this.alerts = this.alerts.map((a) =>
      a.detectionId === detectionId ? { ...a, acknowledgementStatus: 'DISMISSED', status: 'DISMISSED' } : a
    );

    // Mark matching survivor rejected
    this.survivors = this.survivors.map((s) =>
      s.id === detectionId || s.id === `SURV-${detectionId.slice(-4)}`
        ? { ...s, verificationStatus: 'REJECTED' }
        : s
    );

    this.recomputePrioritiesAndRoutes();
  }

  // FEATURE 5: Autonomous Second-Look Verification Workflow
  public requestSecondLook(survivorId: string): void {
    const target = this.survivors.find((s) => s.id === survivorId);
    if (!target) return;

    // Set In-Progress
    this.survivors = this.survivors.map((s) =>
      s.id === survivorId
        ? {
            ...s,
            verificationStatus: 'UNDER_REVIEW',
            secondLookStatus: 'IN_PROGRESS',
            secondLookRequested: true,
          }
        : s
    );

    this.logEvent({
      type: 'SECOND_LOOK_REQUEST',
      title: `Second-Look Requested: ${survivorId}`,
      description: `Drone simulating altitude adjustment & multi-spectral optical/thermal recheck over Sector ${target.zone}.`,
      severity: 'MEDIUM',
      relatedSurvivorId: survivorId,
      zone: target.zone,
    });

    this.currentObjective = `SECOND-LOOK IN PROGRESS: Verifying uncertain silhouette in Sector ${target.zone}`;
    this.notify();

    // Simulate second-look inspection window (1.8 seconds)
    setTimeout(() => {
      const current = this.survivors.find((s) => s.id === survivorId);
      if (!current) return;

      const { updatedSurvivor, event } = executeSecondLookResolution(current);

      this.survivors = this.survivors.map((s) => (s.id === survivorId ? updatedSurvivor : s));
      this.timelineEvents = [event, ...this.timelineEvents];

      // If verified, upgrade alert and replan mission objective
      if (updatedSurvivor.verificationStatus === 'VERIFIED') {
        this.currentObjective = `PRIORITY TARGET CONFIRMED: Ready for ground extraction guidance in Sector ${updatedSurvivor.zone}`;
      } else {
        this.currentObjective = `TARGET DISMISSED: Resuming autonomous area scan in Sector ${this.droneStatus.currentZone}`;
      }

      this.recomputePrioritiesAndRoutes();
    }, 1800);
  }

  // FEATURE 1 & 3: Normal Survivor Detection with Intelligence Scoring
  public simulateVictim(customZone?: ZoneId): void {
    const targetZone = customZone || this.droneStatus.currentZone || 'B3';
    const nowTime = new Date().toLocaleTimeString([], { hour12: false });
    const detSuffix = Date.now().toString().slice(-4);
    const survId = `SURV-${detSuffix}`;
    const detId = `DET-VIC-${detSuffix}`;

    const zoneObj = this.zones.find((z) => z.id === targetZone);
    const lat = zoneObj ? zoneObj.lat + 0.0006 : 13.0841;
    const lng = zoneObj ? zoneObj.lng + 0.0004 : 80.2745;

    // Standard detection
    const newDetection: Detection = {
      id: detId,
      type: 'Victim',
      subType: 'Person',
      latitude: lat,
      longitude: lng,
      confidence: 94,
      zone: targetZone,
      timestamp: nowTime,
      source: 'FUSED',
      priority: 'HIGH',
      status: 'REQUIRES_VERIFICATION',
      notes: 'Probable human silhouette detected trapped near flood line. Movement signature detected.',
      temperatureReading: '36.8°C (Elevated)',
      bbox: { x: 38, y: 32, width: 24, height: 42 },
      coordinates: { lat, lng },
    };

    // Calculate nearby hazards & assess risk
    const nearbyAnalysis = findNearbyHazards({ latitude: lat, longitude: lng, zone: targetZone }, this.hazards);
    const riskAnalysis = assessSurvivorRisk(
      {
        rgbConfidence: 94,
        thermalConfidence: 91,
        thermalConfirmed: true,
        movementStatus: 'NO_MOVEMENT',
        estimatedCondition: 'CRITICAL',
        zone: targetZone,
        latitude: lat,
        longitude: lng,
      },
      nearbyAnalysis,
      zoneObj
    );

    const newSurvivor: Survivor = {
      id: survId,
      latitude: lat,
      longitude: lng,
      zone: targetZone,
      timestamp: nowTime,
      rgbConfidence: 94,
      thermalConfidence: 91,
      confidence: 94,
      thermalConfirmed: true,
      movementStatus: 'NO_MOVEMENT',
      estimatedCondition: 'CRITICAL',
      condition: 'CRITICAL',
      nearbyHazards: nearbyAnalysis.map((nh) => nh.hazard.id),
      priority: riskAnalysis.priority,
      riskScore: riskAnalysis.riskScore,
      riskLevel: riskAnalysis.riskLevel,
      riskReasons: riskAnalysis.reasons,
      verificationStatus: 'VERIFIED',
      temperatureReading: '36.8°C (Elevated)',
      notes: 'Probable human silhouette localized. Hypothermia risk evaluated due to rising flood line.',
    };

    const newAlert: Alert = {
      id: `ALT-VIC-${detSuffix}`,
      type: 'VICTIM',
      severity: riskAnalysis.priority,
      priority: riskAnalysis.priority,
      title: '🚨 CRITICAL SURVIVOR IDENTIFIED',
      description: `Survivor ${survId} located in Sector ${targetZone}. Risk: ${riskAnalysis.riskLevel} (${riskAnalysis.riskScore}/100). ${riskAnalysis.reasons[0]}`,
      message: `Survivor ${survId} located in Sector ${targetZone}. Risk: ${riskAnalysis.riskLevel} (${riskAnalysis.riskScore}/100). ${riskAnalysis.reasons[0]}`,
      zone: targetZone,
      latitude: lat,
      longitude: lng,
      confidence: 94,
      timestamp: nowTime,
      acknowledgementStatus: 'REQUIRES_VERIFICATION',
      status: 'REQUIRES_VERIFICATION',
      detectionId: detId,
      survivorId: survId,
    };

    this.detections = [newDetection, ...this.detections];
    this.survivors = [newSurvivor, ...this.survivors];
    this.alerts = [newAlert, ...this.alerts];
    this.zones = this.zones.map((z) =>
      z.id === targetZone ? { ...z, victimsCount: z.victimsCount + 1 } : z
    );

    // Decision Timeline Events
    this.logEvent({
      type: 'DETECTION',
      title: `Human Silhouette Detected (${newDetection.confidence}%)`,
      description: `RGB Optical & Thermal fused detection confirmed in Sector ${targetZone}. Target ID: ${survId}.`,
      severity: 'HIGH',
      relatedSurvivorId: survId,
      zone: targetZone,
    });

    this.logEvent({
      type: 'RISK_UPDATE',
      title: `Risk Assessment: ${riskAnalysis.riskLevel} (${riskAnalysis.riskScore}/100)`,
      description: `Assigned based on: ${riskAnalysis.reasons.join('; ')}.`,
      severity: riskAnalysis.priority,
      relatedSurvivorId: survId,
      zone: targetZone,
    });

    // Dynamic Mission Replanning (FEATURE 7)
    this.currentObjective = `PRIORITY REPLAN: Monitor & guide responder approach to Survivor ${survId} in Sector ${targetZone}`;

    this.recomputePrioritiesAndRoutes();
  }

  // Low-Confidence / Uncertain Survivor (For Second-Look Demonstration)
  public simulateUncertainSurvivor(customZone?: ZoneId): void {
    const targetZone = customZone || this.droneStatus.currentZone || 'A2';
    const nowTime = new Date().toLocaleTimeString([], { hour12: false });
    const detSuffix = Date.now().toString().slice(-4);
    const survId = `SURV-UNC-${detSuffix}`;

    const zoneObj = this.zones.find((z) => z.id === targetZone);
    const lat = zoneObj ? zoneObj.lat + 0.0003 : 13.0845;
    const lng = zoneObj ? zoneObj.lng + 0.0002 : 80.2735;

    const nearbyAnalysis = findNearbyHazards({ latitude: lat, longitude: lng, zone: targetZone }, this.hazards);
    const riskAnalysis = assessSurvivorRisk(
      {
        rgbConfidence: 62,
        thermalConfidence: 55,
        thermalConfirmed: false,
        movementStatus: 'UNKNOWN',
        estimatedCondition: 'UNCERTAIN',
        zone: targetZone,
        latitude: lat,
        longitude: lng,
      },
      nearbyAnalysis,
      zoneObj
    );

    const uncertainSurvivor: Survivor = {
      id: survId,
      latitude: lat,
      longitude: lng,
      zone: targetZone,
      timestamp: nowTime,
      rgbConfidence: 62,
      thermalConfidence: 55,
      confidence: 62,
      thermalConfirmed: false,
      movementStatus: 'UNKNOWN',
      estimatedCondition: 'UNCERTAIN',
      condition: 'UNCERTAIN',
      nearbyHazards: nearbyAnalysis.map((nh) => nh.hazard.id),
      priority: 'MEDIUM',
      riskScore: riskAnalysis.riskScore,
      riskLevel: 'MEDIUM',
      riskReasons: ['Low confidence detection (62%)', 'Thermal body heat unconfirmed', 'Second-look verification recommended'],
      verificationStatus: 'POSSIBLE',
      secondLookRequested: false,
      secondLookStatus: 'NONE',
      temperatureReading: 'Unconfirmed (Weak Heat Signature)',
      notes: 'Uncertain detection: possible silhouette partially occluded by debris. Second-look recommended before dispatching ground crew.',
    };

    const uncertainAlert: Alert = {
      id: `ALT-UNC-${detSuffix}`,
      type: 'VICTIM',
      severity: 'MEDIUM',
      priority: 'MEDIUM',
      title: '🔍 UNCERTAIN SURVIVOR DETECTION',
      description: `Possible survivor in Sector ${targetZone} (62% confidence). Recommend Autonomous Second-Look verification.`,
      message: `Possible survivor in Sector ${targetZone} (62% confidence). Recommend Autonomous Second-Look verification.`,
      zone: targetZone,
      latitude: lat,
      longitude: lng,
      confidence: 62,
      timestamp: nowTime,
      acknowledgementStatus: 'REQUIRES_VERIFICATION',
      status: 'REQUIRES_VERIFICATION',
      survivorId: survId,
    };

    this.survivors = [uncertainSurvivor, ...this.survivors];
    this.alerts = [uncertainAlert, ...this.alerts];

    this.logEvent({
      type: 'DETECTION',
      title: `Low-Confidence Detection in Sector ${targetZone}`,
      description: `Candidate silhouette flagged with 62% confidence. Awaiting operator or autonomous second-look request.`,
      severity: 'MEDIUM',
      relatedSurvivorId: survId,
      zone: targetZone,
    });

    this.recomputePrioritiesAndRoutes();
  }

  // FEATURE 2: Environmental Hazard Simulation
  public simulateHazard(type: Hazard['type'] = 'Fire', customZone?: ZoneId): void {
    const targetZone = customZone || this.droneStatus.currentZone || 'C2';
    const nowTime = new Date().toLocaleTimeString([], { hour12: false });
    const hazSuffix = Date.now().toString().slice(-4);
    const hazId = `HAZ-${hazSuffix}`;

    const zoneObj = this.zones.find((z) => z.id === targetZone);
    const lat = zoneObj ? zoneObj.lat + 0.0002 : 13.0801;
    const lng = zoneObj ? zoneObj.lng - 0.0003 : 80.2699;

    const newHazard: Hazard = {
      id: hazId,
      type: type,
      zone: targetZone,
      latitude: lat,
      longitude: lng,
      severity: type === 'Fire' || type === 'Chemical Leak' ? 'CRITICAL' : 'HIGH',
      priority: type === 'Fire' || type === 'Chemical Leak' ? 'CRITICAL' : 'HIGH',
      confidence: 89,
      status: 'REVIEW REQUIRED',
      timestamp: nowTime,
      threatDescription: `${type} detected posing immediate risk to ground rescue personnel and nearby victims.`,
      radius: type === 'Fire' ? 50 : 35,
      affectedRadiusMeters: type === 'Fire' ? 50 : 35,
      bbox: { x: 55, y: 40, width: 30, height: 35 },
    };

    const newDetection: Detection = {
      id: `DET-HAZ-${hazSuffix}`,
      type: 'Hazard',
      subType: type,
      latitude: lat,
      longitude: lng,
      confidence: 89,
      zone: targetZone,
      timestamp: nowTime,
      source: 'FUSED',
      priority: newHazard.severity,
      status: 'REQUIRES_VERIFICATION',
      notes: `${type} hotspot registered in Sector ${targetZone}. Hazard perimeter established for ground crew avoidance.`,
      temperatureReading: type === 'Fire' ? '194.5°C' : 'N/A',
      bbox: { x: 55, y: 40, width: 30, height: 35 },
      coordinates: { lat, lng },
    };

    const newAlert: Alert = {
      id: `ALT-HAZ-${hazSuffix}`,
      type: 'HAZARD',
      severity: newHazard.severity,
      priority: newHazard.severity,
      title: `⚠️ ${type.toUpperCase()} DETECTED`,
      description: `${type} identified in Sector ${targetZone}. Ground responder avoidance zone established (${newHazard.radius}m radius).`,
      message: `${type} identified in Sector ${targetZone}. Ground responder avoidance zone established (${newHazard.radius}m radius).`,
      zone: targetZone,
      latitude: lat,
      longitude: lng,
      confidence: 89,
      timestamp: nowTime,
      acknowledgementStatus: 'REQUIRES_VERIFICATION',
      status: 'REQUIRES_VERIFICATION',
      hazardId: hazId,
    };

    this.hazards = [newHazard, ...this.hazards];
    this.detections = [newDetection, ...this.detections];
    this.alerts = [newAlert, ...this.alerts];
    this.zones = this.zones.map((z) =>
      z.id === targetZone ? { ...z, hazardsCount: z.hazardsCount + 1 } : z
    );

    this.logEvent({
      type: 'HAZARD_PROXIMITY',
      title: `Hazard Identified: ${type} in Sector ${targetZone}`,
      description: `Established ${newHazard.radius}m hazard boundary. Re-evaluating nearby survivor risks and responder routes.`,
      severity: newHazard.severity,
      relatedHazardId: hazId,
      zone: targetZone,
    });

    // Recompute all survivor risks & ground routes with new hazard context
    this.recomputePrioritiesAndRoutes();
  }

  // Trajectory Simulation Step
  private stepSearchRoute(): void {
    this.currentRouteIndex += 1;
    const index = this.currentRouteIndex;

    if (index >= SEARCH_ROUTE.length) {
      this.stopStepInterval();
      this.droneStatus = {
        ...this.droneStatus,
        status: 'COMPLETED',
        missionState: 'COMPLETED',
        progressPercent: 100,
        speed: 0,
        speedMps: 0,
      };
      this.zones = this.zones.map((z) => ({ ...z, status: 'searched' }));
      this.isDemoModeActive = false;
      this.currentObjective = 'Autonomous grid search completed: All 9 sectors surveyed';

      this.logEvent({
        type: 'MISSION_REPLAN',
        title: 'Area Search Completed (100%)',
        description: 'All 9 sectors surveyed. Finalizing prioritized survivor extraction list.',
        severity: 'LOW',
      });

      this.notify();
      return;
    }

    const nextZoneId = SEARCH_ROUTE[index];
    const progress = Math.round(((index + 1) / SEARCH_ROUTE.length) * 100);
    const targetZoneData = this.zones.find((z) => z.id === nextZoneId);

    this.droneStatus = {
      ...this.droneStatus,
      currentZone: nextZoneId,
      progressPercent: progress,
      battery: Math.max(20, this.droneStatus.battery - 2),
      altitude: 30 + Math.floor(Math.sin(index) * 4),
      altitudeMeters: 30 + Math.floor(Math.sin(index) * 4),
      speed: 8 + (index % 2 === 0 ? 0.5 : -0.5),
      speedMps: 8 + (index % 2 === 0 ? 0.5 : -0.5),
      headingDegrees: (this.droneStatus.headingDegrees + 45) % 360,
      latitude: targetZoneData?.lat ?? this.droneStatus.latitude,
      longitude: targetZoneData?.lng ?? this.droneStatus.longitude,
      timestamp: new Date().toLocaleTimeString([], { hour12: false }),
    };

    this.currentObjective = `Sweeping Sector ${nextZoneId} (Terrain: ${targetZoneData?.terrain || 'Open'})`;

    this.zones = this.zones.map((z) => {
      if (z.id === nextZoneId) return { ...z, status: 'searching' };
      const searchedIndex = SEARCH_ROUTE.indexOf(z.id);
      if (searchedIndex < index) return { ...z, status: 'searched' };
      return z;
    });

    // Deterministic incidents for presentation consistency
    if (nextZoneId === 'B3') {
      this.simulateVictim('B3');
    } else if (nextZoneId === 'C2') {
      this.simulateHazard('Fire', 'C2');
    }

    this.notify();
  }

  // Recalculates all survivor risk scores, priority ranking, and safe responder routes
  private recomputePrioritiesAndRoutes(): void {
    const updated = this.survivors.map((surv) => {
      const zoneObj = this.zones.find((z) => z.id === surv.zone);
      const nearby = findNearbyHazards({ latitude: surv.latitude, longitude: surv.longitude, zone: surv.zone }, this.hazards);
      const risk = assessSurvivorRisk(surv, nearby, zoneObj);

      return {
        ...surv,
        nearbyHazards: nearby.map((nh) => nh.hazard.id),
        riskScore: risk.riskScore,
        riskLevel: risk.riskLevel,
        priority: risk.priority,
        riskReasons: risk.reasons,
      };
    });

    // Rank survivors by operational priority
    this.survivors = prioritizeSurvivors(updated);

    // Calculate ground responder safe route for each survivor
    this.survivors.forEach((surv) => {
      const route = calculateSafeRoute(surv, this.hazards, this.zones);
      this.safeRoutes.set(surv.id, route);
    });

    this.notify();
  }

  private logEvent(event: Omit<DecisionTimelineEvent, 'id' | 'timestamp'>): void {
    const nowTime = new Date().toLocaleTimeString([], { hour12: false });
    const newEvt: DecisionTimelineEvent = {
      id: `EVT-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 900 + 100)}`,
      timestamp: nowTime,
      ...event,
    };
    this.timelineEvents = [newEvt, ...this.timelineEvents].slice(0, 30); // Keep last 30
  }

  private startTimers(intervalMs: number): void {
    this.stopStepInterval();
    this.stepInterval = window.setInterval(() => {
      this.stepSearchRoute();
    }, intervalMs);

    if (!this.missionTimer) {
      this.missionTimer = window.setInterval(() => {
        this.missionTimeSeconds += 1;
        this.notify();
      }, 1000);
    }
  }

  private stopStepInterval(): void {
    if (this.stepInterval) {
      clearInterval(this.stepInterval);
      this.stepInterval = null;
    }
  }

  private stopMissionTimer(): void {
    if (this.missionTimer) {
      clearInterval(this.missionTimer);
      this.missionTimer = null;
    }
  }

  public destroy(): void {
    this.stopStepInterval();
    this.stopMissionTimer();
    this.listeners.clear();
  }
}
