import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  DroneStatus,
  SearchZone,
  Detection,
  Hazard,
  Alert,
  MissionHistoryItem,
  ZoneId,
  PageId,
  CameraMode,
  Telemetry,
  Survivor,
  MissionState,
  SafeRoute,
  DecisionTimelineEvent,
} from '../types';
import { IDataAdapter, SimulationDataProvider, createDataProvider } from '../adapters';

interface MissionContextType {
  // Common Data Model State
  droneStatus: DroneStatus;
  telemetry: Telemetry;
  zones: SearchZone[];
  detections: Detection[];
  survivors: Survivor[];
  hazards: Hazard[];
  alerts: Alert[];
  missionHistory: MissionHistoryItem[];
  missionState: MissionState;
  missionTimeSeconds: number;
  formattedMissionTime: string;

  // Rescue Intelligence State
  timelineEvents: DecisionTimelineEvent[];
  currentObjective: string;
  selectedSurvivor: Survivor | null;

  // UI Presentation State
  activePage: PageId;
  selectedZoneId: ZoneId | null;
  selectedDetection: Detection | null;
  selectedHazard: Hazard | null;
  isDemoRunning: boolean;
  manualOverrideNotice: string | null;

  // Actions delegated to Data Adapter
  setActivePage: (page: PageId) => void;
  setSelectedZoneId: (zoneId: ZoneId | null) => void;
  setSelectedDetection: (det: Detection | null) => void;
  setSelectedHazard: (haz: Hazard | null) => void;
  setSelectedSurvivor: (surv: Survivor | null) => void;
  startAutonomousSearch: () => void;
  pauseMission: () => void;
  resumeMission: () => void;
  abortMission: () => void;
  resetMission: () => void;
  startDemoMode: () => void;
  simulateVictim: (customZone?: ZoneId) => void;
  simulateUncertainSurvivor: (customZone?: ZoneId) => void;
  simulateHazard: (type?: Hazard['type'], customZone?: ZoneId) => void;
  setManualOverride: (enabled: boolean) => void;
  setCameraMode: (mode: CameraMode) => void;
  markAlertVerified: (alertId: string) => void;
  dismissAlert: (alertId: string) => void;
  markDetectionVerified: (detectionId: string) => void;
  dismissDetection: (detectionId: string) => void;
  requestSecondLook: (survivorId: string) => void;
  getSafeRouteForSurvivor: (survivorId: string) => SafeRoute | null;
  viewLocation: (zoneId: ZoneId, detectionId?: string) => void;
}

const MissionContext = createContext<MissionContextType | undefined>(undefined);

export const MissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // PHASE 4: Provider selected via factory based on SIMULATION_MODE in src/hardware/config.ts
  // SIMULATION_MODE = true  → SimulationDataProvider (current default)
  // SIMULATION_MODE = false → HardwareDataProvider (when physical drone is connected)
  const adapterRef = useRef<IDataAdapter>(createDataProvider());
  const adapter = adapterRef.current;

  // State mirror synced with the Data Adapter
  const [droneStatus, setDroneStatus] = useState<DroneStatus>(adapter.getDroneState());
  const [telemetry, setTelemetry] = useState<Telemetry>(adapter.getTelemetry());
  const [zones, setZones] = useState<SearchZone[]>(adapter.getZones());
  const [detections, setDetections] = useState<Detection[]>(adapter.getDetections());
  const [survivors, setSurvivors] = useState<Survivor[]>(adapter.getSurvivors());
  const [hazards, setHazards] = useState<Hazard[]>(adapter.getHazards());
  const [alerts, setAlerts] = useState<Alert[]>(adapter.getAlerts());
  const [missionHistory, setMissionHistory] = useState<MissionHistoryItem[]>(adapter.getMissionHistory());
  const [missionState, setMissionState] = useState<MissionState>(adapter.getMissionState());
  const [missionTimeSeconds, setMissionTimeSeconds] = useState<number>(adapter.getMissionTimeSeconds());
  const [isDemoRunning, setIsDemoRunning] = useState<boolean>(adapter.isDemoRunning());
  const [manualOverrideNotice, setManualOverrideNotice] = useState<string | null>(adapter.getManualOverrideNotice());
  const [timelineEvents, setTimelineEvents] = useState<DecisionTimelineEvent[]>(adapter.getTimelineEvents());
  const [currentObjective, setCurrentObjective] = useState<string>(adapter.getCurrentObjective());

  // UI-only presentation state
  const [activePage, setActivePage] = useState<PageId>('dashboard');
  const [selectedZoneId, setSelectedZoneId] = useState<ZoneId | null>('B2');
  const [selectedDetection, setSelectedDetection] = useState<Detection | null>(null);
  const [selectedHazard, setSelectedHazard] = useState<Hazard | null>(null);
  const [selectedSurvivor, setSelectedSurvivor] = useState<Survivor | null>(null);

  // Synchronize state whenever the Data Adapter emits a state update
  useEffect(() => {
    const syncFromAdapter = () => {
      setDroneStatus(adapter.getDroneState());
      setTelemetry(adapter.getTelemetry());
      setZones(adapter.getZones());
      setDetections(adapter.getDetections());
      const updatedSurvivors = adapter.getSurvivors();
      setSurvivors(updatedSurvivors);
      setHazards(adapter.getHazards());
      setAlerts(adapter.getAlerts());
      setMissionHistory(adapter.getMissionHistory());
      setMissionState(adapter.getMissionState());
      setMissionTimeSeconds(adapter.getMissionTimeSeconds());
      setIsDemoRunning(adapter.isDemoRunning());
      setManualOverrideNotice(adapter.getManualOverrideNotice());
      setTimelineEvents(adapter.getTimelineEvents());
      setCurrentObjective(adapter.getCurrentObjective());

      // If selected survivor was updated, refresh reference
      if (selectedSurvivor) {
        const found = updatedSurvivors.find(s => s.id === selectedSurvivor.id);
        if (found) setSelectedSurvivor(found);
      }
    };

    const unsubscribe = adapter.subscribe(syncFromAdapter);
    return () => {
      unsubscribe();
      adapter.destroy();
    };
  }, [adapter, selectedSurvivor]);

  // Format mission time MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remSecs.toString().padStart(2, '0')}`;
  };

  // Delegated Actions
  const startAutonomousSearch = useCallback(() => adapter.startAutonomousSearch(), [adapter]);
  const pauseMission = useCallback(() => adapter.pauseMission(), [adapter]);
  const resumeMission = useCallback(() => adapter.resumeMission(), [adapter]);
  const abortMission = useCallback(() => adapter.abortMission(), [adapter]);
  const resetMission = useCallback(() => adapter.resetMission(), [adapter]);
  const startDemoMode = useCallback(() => adapter.startDemoMode(), [adapter]);
  const simulateVictim = useCallback((zone?: ZoneId) => adapter.simulateVictim(zone), [adapter]);
  const simulateUncertainSurvivor = useCallback((zone?: ZoneId) => adapter.simulateUncertainSurvivor(zone), [adapter]);
  const simulateHazard = useCallback((type?: Hazard['type'], zone?: ZoneId) => adapter.simulateHazard(type, zone), [adapter]);
  const setManualOverride = useCallback((enabled: boolean) => adapter.setManualOverride(enabled), [adapter]);
  const setCameraMode = useCallback((mode: CameraMode) => adapter.setCameraMode(mode), [adapter]);
  const markAlertVerified = useCallback((alertId: string) => adapter.markAlertVerified(alertId), [adapter]);
  const dismissAlert = useCallback((alertId: string) => adapter.dismissAlert(alertId), [adapter]);
  const markDetectionVerified = useCallback((detId: string) => adapter.markDetectionVerified(detId), [adapter]);
  const dismissDetection = useCallback((detId: string) => adapter.dismissDetection(detId), [adapter]);
  const requestSecondLook = useCallback((survivorId: string) => adapter.requestSecondLook(survivorId), [adapter]);
  const getSafeRouteForSurvivor = useCallback((survivorId: string) => adapter.getSafeRouteForSurvivor(survivorId), [adapter]);

  // UI-specific navigation action
  const viewLocation = useCallback((zoneId: ZoneId, detectionId?: string) => {
    setSelectedZoneId(zoneId);
    if (detectionId) {
      const foundDet = adapter.getDetections().find(d => d.id === detectionId);
      if (foundDet) setSelectedDetection(foundDet);
      const foundSurv = adapter.getSurvivors().find(s => s.id === detectionId || s.id === `SURV-${detectionId.slice(-4)}`);
      if (foundSurv) setSelectedSurvivor(foundSurv);
    }
    setActivePage('search_map');
  }, [adapter]);

  return (
    <MissionContext.Provider
      value={{
        droneStatus,
        telemetry,
        zones,
        detections,
        survivors,
        hazards,
        alerts,
        missionHistory,
        missionState,
        missionTimeSeconds,
        formattedMissionTime: formatTime(missionTimeSeconds),
        timelineEvents,
        currentObjective,
        selectedSurvivor,
        activePage,
        selectedZoneId,
        selectedDetection,
        selectedHazard,
        isDemoRunning,
        manualOverrideNotice,
        setActivePage,
        setSelectedZoneId,
        setSelectedDetection,
        setSelectedHazard,
        setSelectedSurvivor,
        startAutonomousSearch,
        pauseMission,
        resumeMission,
        abortMission,
        resetMission,
        startDemoMode,
        simulateVictim,
        simulateUncertainSurvivor,
        simulateHazard,
        setManualOverride,
        setCameraMode,
        markAlertVerified,
        dismissAlert,
        markDetectionVerified,
        dismissDetection,
        requestSecondLook,
        getSafeRouteForSurvivor,
        viewLocation,
      }}
    >
      {children}
    </MissionContext.Provider>
  );
};

export const useMission = () => {
  const context = useContext(MissionContext);
  if (!context) {
    throw new Error('useMission must be used within a MissionProvider');
  }
  return context;
};
