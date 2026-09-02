/**
 * JEEVAN-AIR | Hardware Data Provider
 * Team ZYNTAX — SIH26177 (Qualcomm Inc)
 *
 * ════════════════════════════════════════════════════════════
 * PHASE 4 — Hardware Integration Stub
 * ════════════════════════════════════════════════════════════
 *
 * This class is the future implementation boundary between the
 * physical drone hardware and the JEEVAN-AIR dashboard.
 *
 * It implements the same IDataAdapter interface as SimulationDataProvider,
 * meaning the dashboard NEVER needs to be rewritten when hardware arrives.
 *
 * CURRENT STATE (Phase 4 Preparation):
 * ─────────────────────────────────────────────────────────────
 * • All methods return safe fallback values (empty arrays / zeros).
 * • No real WebSocket connections are opened.
 * • No MAVLink commands are sent.
 * • No hardware is claimed to be connected.
 *
 * FUTURE IMPLEMENTATION (Phase 4 Execution):
 * ─────────────────────────────────────────────────────────────
 * When physical hardware is operational, implement:
 * 1. connectToEdgeBridge() — WebSocket to JeevanAir Edge Bridge
 * 2. parseTelemetryPacket() — Deserialize HardwareTelemetryPacket
 * 3. ingestEdgeAIResults() — Feed EdgeAIInferenceResult into AIPipelineService
 * 4. All IDataAdapter getter methods — return live hardware data
 *
 * Data path once hardware is connected:
 *   HardwareTelemetryPacket (WebSocket) → parseTelemetryPacket()
 *   → mapToCommonDataModel() → IDataAdapter.get*()
 *   → MissionContext → Dashboard
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
import type {
  HardwareTelemetryPacket,
  EdgeAIInferenceResult,
  FlightControllerTelemetry,
  GNSSPositionPayload,
  BatteryTelemetryPayload,
  LinkQualityPayload,
} from '../hardware/types';
import { HARDWARE_CONNECTION } from '../hardware/config';

export class HardwareDataProvider implements IDataAdapter {
  /**
   * WebSocket connection to the JeevanAir Edge Bridge.
   * null = not yet connected (current state in Phase 4 prep).
   *
   * Future: new WebSocket(HARDWARE_CONNECTION.telemetryBridgeUrl)
   */
  private telemetrySocket: WebSocket | null = null;

  /**
   * Latest received telemetry packet from edge bridge.
   * null = no hardware data received yet.
   */
  private latestPacket: HardwareTelemetryPacket | null = null;

  /**
   * Latest AI inference results from edge computer.
   * null = no AI inference results received yet.
   */
  private latestAIResults: EdgeAIInferenceResult | null = null;

  /**
   * Hardware connection status — only true if:
   * 1. WebSocket is open
   * 2. Heartbeat received within connectionTimeoutMs
   * 3. MAVLink HEARTBEAT present in telemetry packet
   */
  private hardwareConnected: boolean = false;

  /**
   * Reactive update listeners (same pattern as SimulationDataProvider).
   */
  private listeners: Set<() => void> = new Set();

  /**
   * Packet sequence counter for lost-packet detection.
   */
  private lastSeqReceived: number = -1;

  constructor() {
    // Phase 4 preparation: connection intentionally NOT established.
    // When hardware is ready, call this.connectToEdgeBridge()
    console.info(
      '[HardwareDataProvider] Phase 4 Integration Ready. ' +
      'Physical hardware NOT connected. ' +
      `Configure ${HARDWARE_CONNECTION.telemetryBridgeUrl} and call connectToEdgeBridge() when hardware is operational.`
    );
  }

  // ─── Future Implementation: WebSocket Bridge Connection ─────────────────────

  /**
   * FUTURE IMPLEMENTATION — Call this when physical drone and edge bridge are ready.
   *
   * Opens a persistent WebSocket to the JeevanAir Edge Bridge,
   * subscribes to telemetry and AI inference result streams,
   * and begins populating IDataAdapter state.
   *
   * @throws {Error} If SIMULATION_MODE is still true (safety guard)
   */
  public connectToEdgeBridge(): void {
    // Safety guard: must not call this with SIMULATION_MODE = true
    // (enforced by providerFactory.ts)
    console.warn(
      '[HardwareDataProvider] connectToEdgeBridge() — ' +
      'Physical hardware bridge not yet implemented. ' +
      'Awaiting: drone procurement, edge computer setup, edge bridge deployment.'
    );

    // FUTURE IMPLEMENTATION TEMPLATE:
    // ─────────────────────────────────────────────────────────
    // this.telemetrySocket = new WebSocket(HARDWARE_CONNECTION.telemetryBridgeUrl);
    //
    // this.telemetrySocket.onopen = () => {
    //   console.info('[HardwareDataProvider] Edge bridge WebSocket connected.');
    //   this.scheduleHeartbeatWatchdog();
    // };
    //
    // this.telemetrySocket.onmessage = (event) => {
    //   const packet = JSON.parse(event.data) as HardwareTelemetryPacket;
    //   this.validateAndIngestPacket(packet);
    // };
    //
    // this.telemetrySocket.onerror = (err) => {
    //   this.hardwareConnected = false;
    //   this.notifyListeners();
    //   console.error('[HardwareDataProvider] WebSocket error:', err);
    // };
    //
    // this.telemetrySocket.onclose = () => {
    //   this.hardwareConnected = false;
    //   this.scheduleReconnect();
    // };
    // ─────────────────────────────────────────────────────────
  }

  /**
   * FUTURE IMPLEMENTATION — Parses and validates an incoming hardware telemetry packet.
   * Maps HardwareTelemetryPacket fields to the Common Data Model.
   *
   * Called by: this.telemetrySocket.onmessage
   */
  private validateAndIngestPacket(_packet: HardwareTelemetryPacket): void {
    // FUTURE: Validate required fields, detect lost packets via seq number,
    // then map to common data model and notify listeners.
    //
    // if (_packet.seq !== this.lastSeqReceived + 1) {
    //   const lost = _packet.seq - this.lastSeqReceived - 1;
    //   console.warn(`[HardwareDataProvider] ${lost} telemetry packets lost.`);
    // }
    // this.lastSeqReceived = _packet.seq;
    // this.latestPacket = _packet;
    // this.hardwareConnected = _packet.flightController.isConnected;
    // this.notifyListeners();
  }

  /**
   * FUTURE IMPLEMENTATION — Maps GNSSPositionPayload to DroneStatus fields.
   */
  private mapGNSSToCommon(_gnss: GNSSPositionPayload): Partial<DroneStatus> {
    // FUTURE:
    // return {
    //   latitude: _gnss.latitude,
    //   longitude: _gnss.longitude,
    //   altitudeMeters: _gnss.altitudeAglMeters,
    //   speedMps: _gnss.groundSpeedMps,
    //   headingDegrees: _gnss.courseOverGroundDeg,
    //   gpsStatus: this.mapGPSFixType(_gnss.fixType),
    // };
    return {};
  }

  /**
   * FUTURE IMPLEMENTATION — Maps BatteryTelemetryPayload to DroneStatus.battery.
   */
  private mapBatteryToCommon(_battery: BatteryTelemetryPayload): number {
    // FUTURE: return _battery.chargePercent;
    return 0;
  }

  /**
   * FUTURE IMPLEMENTATION — Maps FlightControllerTelemetry to MissionStatus.
   */
  private mapFlightModeToMissionStatus(
    _fc: FlightControllerTelemetry
  ): DroneStatus['missionState'] {
    // FUTURE:
    // if (!_fc.isConnected) return 'IDLE';
    // if (!_fc.isArmed) return 'IDLE';
    // if (_fc.isMissionActive) return 'SEARCHING';
    // switch (_fc.flightMode) { case 'RTL': return 'RETURNING'; ... }
    return 'IDLE';
  }

  /**
   * FUTURE IMPLEMENTATION — Ingest EdgeAIInferenceResult from edge computer.
   * Feeds results into AIPipelineService for risk assessment and prioritization.
   */
  public ingestAIResults(_results: EdgeAIInferenceResult): void {
    // FUTURE:
    // this.latestAIResults = _results;
    // const survivors = _results.detections
    //   .filter(d => d.detectionClass === 'person')
    //   .map(d => AIPipelineService.getInstance().convertEdgeDetectionToSurvivor(d));
    // this.survivors = survivors;
    // this.recomputePrioritiesAndRoutes();
    // this.notifyListeners();
    console.warn('[HardwareDataProvider] ingestAIResults() — awaiting edge bridge connection.');
  }

  /**
   * FUTURE IMPLEMENTATION — GPS fix type mapper.
   * MAVLink fix_type values: 0=NoFix 2=2D 3=3D 4=DGPS 5=RTK_Float 6=RTK_Fixed
   */
  private mapGPSFixType(_fixType: number): DroneStatus['gpsStatus'] {
    // FUTURE: return fixType >= 3 ? 'HARDWARE — LOCKED' : 'HARDWARE — ACQUIRING';
    return 'SIMULATED — NO FIX';
  }

  private notifyListeners(): void {
    this.listeners.forEach((fn) => fn());
  }

  // ─── IDataAdapter Implementation (Safe Fallbacks) ────────────────────────────

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public getDroneState(): DroneStatus {
    // When hardware is connected, this will return live data from latestPacket
    const nowTime = new Date().toLocaleTimeString([], { hour12: false });
    return {
      droneId: 'JA-RESCUE-01',
      id: 'JA-RESCUE-01',
      status: 'IDLE',
      missionState: 'IDLE',
      flightMode: 'MANUAL',
      latitude: 0,
      longitude: 0,
      altitude: 0,
      altitudeMeters: 0,
      speed: 0,
      speedMps: 0,
      headingDegrees: 0,
      battery: 0,
      gpsStatus: 'SIMULATED — NO FIX',
      connectivityStatus: 'SIMULATED — DISCONNECTED',
      commsStatus: 'SIMULATED — DISCONNECTED',
      aiStatus: 'STANDBY',
      aiVisionStatus: 'STANDBY',
      flightControllerStatus: 'NOT CONNECTED (SIMULATED ROUTE)',
      mission: 'Hardware Not Connected',
      currentZone: 'A1',
      progressPercent: 0,
      cameraMode: 'RGB',
      isSimulated: false,
      timestamp: nowTime,
    };
  }

  public getTelemetry(): Telemetry {
    return {
      droneId: 'JA-RESCUE-01',
      latitude: 0,
      longitude: 0,
      altitude: 0,
      speed: 0,
      battery: 0,
      signalStrength: 0,
      timestamp: new Date().toLocaleTimeString([], { hour12: false }),
    };
  }

  public getDetections(): Detection[] { return []; }
  public getSurvivors(): Survivor[] { return []; }
  public getHazards(): Hazard[] { return []; }
  public getAlerts(): Alert[] { return []; }
  public getZones(): SearchZone[] { return []; }
  public getMissionHistory(): MissionHistoryItem[] { return []; }
  public getMissionTimeSeconds(): number { return 0; }
  public isDemoRunning(): boolean { return false; }
  public getManualOverrideNotice(): string | null { return null; }
  public getTimelineEvents(): DecisionTimelineEvent[] { return []; }
  public getSafeRouteForSurvivor(_survivorId: string): SafeRoute | null { return null; }

  public getCurrentObjective(): string {
    return this.hardwareConnected
      ? 'Hardware link established — awaiting mission start'
      : 'Hardware Not Connected — configure edge bridge';
  }

  public getMissionState(): MissionState {
    return {
      missionId: 'JA-HARDWARE-STANDBY',
      status: 'IDLE',
      searchArea: 'Awaiting Hardware Datalink',
      startTime: 'N/A',
      currentObjective: this.getCurrentObjective(),
      progress: 0,
      elapsedSeconds: 0,
    };
  }

  // ─── Command Stubs (No hardware commands sent) ────────────────────────────────

  public startAutonomousSearch(): void {
    console.warn('[HardwareDataProvider] startAutonomousSearch() — MAVLink not yet implemented. Awaiting Phase 4 hardware.');
  }
  public pauseMission(): void {
    console.warn('[HardwareDataProvider] pauseMission() — MAVLink not yet implemented.');
  }
  public resumeMission(): void {
    console.warn('[HardwareDataProvider] resumeMission() — MAVLink not yet implemented.');
  }
  public abortMission(): void {
    console.warn('[HardwareDataProvider] abortMission() — MAVLink not yet implemented.');
  }
  public resetMission(): void { /* No-op */ }
  public startDemoMode(): void { /* No-op */ }
  public setManualOverride(_enabled: boolean): void {
    console.warn('[HardwareDataProvider] setManualOverride() — MAVLink RC_OVERRIDE not yet implemented.');
  }
  public setCameraMode(_mode: CameraMode): void {
    console.warn('[HardwareDataProvider] setCameraMode() — Camera control bridge not yet implemented.');
  }
  public markAlertVerified(_alertId: string): void { /* No-op: no live alerts yet */ }
  public dismissAlert(_alertId: string): void { /* No-op */ }
  public markDetectionVerified(_detectionId: string): void { /* No-op */ }
  public dismissDetection(_detectionId: string): void { /* No-op */ }
  public requestSecondLook(_survivorId: string): void {
    console.warn('[HardwareDataProvider] requestSecondLook() — requires edge AI bridge to be operational.');
  }

  // Simulation injection methods are intentionally no-ops in hardware mode
  public simulateVictim(_zone?: ZoneId): void { /* No-op in hardware mode */ }
  public simulateUncertainSurvivor(_zone?: ZoneId): void { /* No-op in hardware mode */ }
  public simulateHazard(_type?: Hazard['type'], _zone?: ZoneId): void { /* No-op in hardware mode */ }
  public setConnectivity(_status: any): void { /* No-op in hardware mode */ }

  public destroy(): void {
    if (this.telemetrySocket) {
      this.telemetrySocket.close();
      this.telemetrySocket = null;
    }
    this.listeners.clear();
    this.hardwareConnected = false;
  }

  // ─── Hardware Status Accessors ────────────────────────────────────────────────

  /** Returns true only when edge bridge WebSocket is connected AND heartbeat confirmed */
  public isHardwareConnected(): boolean {
    return this.hardwareConnected;
  }

  /** Returns latest raw telemetry packet for diagnostics */
  public getLatestRawPacket(): HardwareTelemetryPacket | null {
    return this.latestPacket;
  }

  /** Returns latest edge AI inference results for diagnostics */
  public getLatestAIResults(): EdgeAIInferenceResult | null {
    return this.latestAIResults;
  }
}
