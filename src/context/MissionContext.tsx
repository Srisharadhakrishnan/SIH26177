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
} from '../types';
import { INITIAL_ZONES, SEARCH_ROUTE, INITIAL_MISSION_HISTORY } from '../data/mockData';

interface MissionContextType {
  droneStatus: DroneStatus;
  zones: SearchZone[];
  detections: Detection[];
  hazards: Hazard[];
  alerts: Alert[];
  missionHistory: MissionHistoryItem[];
  missionTimeSeconds: number;
  formattedMissionTime: string;
  activePage: PageId;
  selectedZoneId: ZoneId | null;
  selectedDetection: Detection | null;
  selectedHazard: Hazard | null;
  isDemoRunning: boolean;
  manualOverrideNotice: string | null;
  
  // Actions
  setActivePage: (page: PageId) => void;
  setSelectedZoneId: (zoneId: ZoneId | null) => void;
  setSelectedDetection: (det: Detection | null) => void;
  setSelectedHazard: (haz: Hazard | null) => void;
  startAutonomousSearch: () => void;
  pauseMission: () => void;
  resumeMission: () => void;
  abortMission: () => void;
  resetMission: () => void;
  startDemoMode: () => void;
  simulateVictim: (customZone?: ZoneId) => void;
  simulateHazard: (type?: Hazard['type'], customZone?: ZoneId) => void;
  setManualOverride: (enabled: boolean) => void;
  setCameraMode: (mode: 'RGB' | 'THERMAL' | 'AI_OVERLAY') => void;
  markAlertVerified: (alertId: string) => void;
  dismissAlert: (alertId: string) => void;
  markDetectionVerified: (detectionId: string) => void;
  dismissDetection: (detectionId: string) => void;
  viewLocation: (zoneId: ZoneId, detectionId?: string) => void;
}

const MissionContext = createContext<MissionContextType | undefined>(undefined);

export const MissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePage, setActivePage] = useState<PageId>('dashboard');
  const [selectedZoneId, setSelectedZoneId] = useState<ZoneId | null>('B2');
  const [selectedDetection, setSelectedDetection] = useState<Detection | null>(null);
  const [selectedHazard, setSelectedHazard] = useState<Hazard | null>(null);
  const [manualOverrideNotice, setManualOverrideNotice] = useState<string | null>(null);
  const [isDemoRunning, setIsDemoRunning] = useState<boolean>(false);
  const [missionTimeSeconds, setMissionTimeSeconds] = useState<number>(0);

  const [droneStatus, setDroneStatus] = useState<DroneStatus>({
    droneId: 'RESQ-01',
    flightMode: 'AUTONOMOUS',
    missionState: 'IDLE',
    battery: 98,
    gpsStatus: 'SIMULATED — LOCKED',
    commsStatus: 'SIMULATED — CONNECTED',
    aiVisionStatus: 'ACTIVE',
    flightControllerStatus: 'NOT CONNECTED (SIMULATED ROUTE)',
    altitudeMeters: 32,
    speedMps: 8,
    headingDegrees: 45,
    currentZone: 'A1',
    progressPercent: 0,
    cameraMode: 'AI_OVERLAY',
    isSimulated: true,
  });

  const [zones, setZones] = useState<SearchZone[]>(INITIAL_ZONES);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [hazards, setHazards] = useState<Hazard[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: 'ALT-SYS-001',
      type: 'SYSTEM',
      title: 'Simulation System Ready',
      message: 'Autonomous search grid configured (9 sectors). AI inference model loaded in simulation mode.',
      zone: 'A1',
      timestamp: new Date().toLocaleTimeString([], { hour12: false }),
      priority: 'LOW',
      status: 'VERIFIED',
    }
  ]);
  const [missionHistory, setMissionHistory] = useState<MissionHistoryItem[]>(INITIAL_MISSION_HISTORY);

  // Timers ref
  const timerRef = useRef<number | null>(null);
  const stepIntervalRef = useRef<number | null>(null);
  const currentRouteIndexRef = useRef<number>(0);

  // Format mission time MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remSecs.toString().padStart(2, '0')}`;
  };

  // Helper to trigger a victim detection
  const simulateVictim = useCallback((customZone?: ZoneId) => {
    const targetZone = customZone || droneStatus.currentZone || 'B3';
    const nowTime = new Date().toLocaleTimeString([], { hour12: false });
    const detId = `DET-VIC-${Date.now().toString().slice(-4)}`;
    
    const newDetection: Detection = {
      id: detId,
      type: 'Victim',
      subType: 'Person',
      confidence: 94,
      zone: targetZone,
      timestamp: nowTime,
      priority: 'HIGH',
      status: 'REQUIRES_VERIFICATION',
      notes: 'Probable human silhouette detected trapped near flood line. Movement signature detected.',
      temperatureReading: '36.8°C (Elevated)',
      bbox: { x: 38, y: 32, width: 24, height: 42 },
      coordinates: { lat: 13.0841, lng: 80.2745 }
    };

    const newAlert: Alert = {
      id: `ALT-VIC-${Date.now().toString().slice(-4)}`,
      type: 'VICTIM',
      title: '🚨 VICTIM DETECTED',
      message: `Possible person detected in Zone ${targetZone}. Requires immediate responder verification.`,
      zone: targetZone,
      confidence: 94,
      timestamp: nowTime,
      priority: 'HIGH',
      status: 'REQUIRES_VERIFICATION',
      detectionId: detId
    };

    setDetections(prev => [newDetection, ...prev]);
    setAlerts(prev => [newAlert, ...prev]);
    setZones(prev => prev.map(z => z.id === targetZone ? { ...z, victimsCount: z.victimsCount + 1 } : z));
  }, [droneStatus.currentZone]);

  // Helper to trigger a hazard detection
  const simulateHazard = useCallback((type: Hazard['type'] = 'Fire', customZone?: ZoneId) => {
    const targetZone = customZone || droneStatus.currentZone || 'C2';
    const nowTime = new Date().toLocaleTimeString([], { hour12: false });
    const hazId = `HAZ-${Date.now().toString().slice(-4)}`;
    
    const newHazard: Hazard = {
      id: hazId,
      type: type,
      zone: targetZone,
      confidence: 89,
      priority: 'HIGH',
      status: 'REVIEW REQUIRED',
      timestamp: nowTime,
      threatDescription: `${type} detected posing immediate risk to responders and ground personnel.`,
      affectedRadiusMeters: 45,
      bbox: { x: 55, y: 40, width: 30, height: 35 }
    };

    const newDetection: Detection = {
      id: `DET-HAZ-${Date.now().toString().slice(-4)}`,
      type: 'Hazard',
      subType: type,
      confidence: 89,
      zone: targetZone,
      timestamp: nowTime,
      priority: 'HIGH',
      status: 'REQUIRES_VERIFICATION',
      notes: `${type} hotspot registered in ${targetZone}. Hazardous proximity boundary calculated.`,
      temperatureReading: type === 'Fire' ? '194.5°C' : 'N/A',
      bbox: { x: 55, y: 40, width: 30, height: 35 },
      coordinates: { lat: 13.0801, lng: 80.2699 }
    };

    const newAlert: Alert = {
      id: `ALT-HAZ-${Date.now().toString().slice(-4)}`,
      type: 'HAZARD',
      title: '⚠️ HAZARD DETECTED',
      message: `${type} identified in Zone ${targetZone}. Hazard zone flagged for ground crew avoidance.`,
      zone: targetZone,
      confidence: 89,
      timestamp: nowTime,
      priority: 'HIGH',
      status: 'REQUIRES_VERIFICATION',
      hazardId: hazId
    };

    setHazards(prev => [newHazard, ...prev]);
    setDetections(prev => [newDetection, ...prev]);
    setAlerts(prev => [newAlert, ...prev]);
    setZones(prev => prev.map(z => z.id === targetZone ? { ...z, hazardsCount: z.hazardsCount + 1 } : z));
  }, [droneStatus.currentZone]);

  // Step the drone along search route
  const stepSearchRoute = useCallback(() => {
    currentRouteIndexRef.current += 1;
    const index = currentRouteIndexRef.current;

    if (index >= SEARCH_ROUTE.length) {
      // Completed all 9 zones
      if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);
      setDroneStatus(prev => ({
        ...prev,
        missionState: 'COMPLETED',
        progressPercent: 100,
        speedMps: 0,
      }));
      setZones(prev => prev.map(z => ({ ...z, status: 'searched' })));
      setIsDemoRunning(false);
      return;
    }

    const nextZoneId = SEARCH_ROUTE[index];
    const progress = Math.round(((index + 1) / SEARCH_ROUTE.length) * 100);

    setDroneStatus(prev => ({
      ...prev,
      currentZone: nextZoneId,
      progressPercent: progress,
      battery: Math.max(20, prev.battery - 2),
      altitudeMeters: 30 + Math.floor(Math.sin(index) * 4),
      speedMps: 8 + (index % 2 === 0 ? 0.5 : -0.5),
      headingDegrees: (prev.headingDegrees + 45) % 360,
    }));

    setZones(prev => prev.map(z => {
      if (z.id === nextZoneId) return { ...z, status: 'searching' };
      const searchedIndex = SEARCH_ROUTE.indexOf(z.id);
      if (searchedIndex < index) return { ...z, status: 'searched' };
      return z;
    }));

    // Check for deterministic detections in Demo / Auto mode
    if (nextZoneId === 'B3') {
      simulateVictim('B3');
    } else if (nextZoneId === 'C2') {
      simulateHazard('Fire', 'C2');
    }
  }, [simulateVictim, simulateHazard]);

  // Start autonomous search
  const startAutonomousSearch = useCallback(() => {
    if (droneStatus.missionState === 'PAUSED') {
      resumeMission();
      return;
    }

    // Initialize search
    currentRouteIndexRef.current = 0;
    const initialZone = SEARCH_ROUTE[0];

    setDroneStatus(prev => ({
      ...prev,
      missionState: 'SEARCHING',
      flightMode: 'AUTONOMOUS',
      currentZone: initialZone,
      progressPercent: 11,
      speedMps: 8,
    }));

    setZones(prev => prev.map(z => z.id === initialZone ? { ...z, status: 'searching' } : { ...z, status: 'unsearched' }));
    setManualOverrideNotice(null);

    if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);
    stepIntervalRef.current = window.setInterval(() => {
      stepSearchRoute();
    }, 7000); // 7s per zone
  }, [droneStatus.missionState, stepSearchRoute]);

  // Pause
  const pauseMission = useCallback(() => {
    if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);
    setDroneStatus(prev => ({
      ...prev,
      missionState: 'PAUSED',
      speedMps: 0,
    }));
  }, []);

  // Resume
  const resumeMission = useCallback(() => {
    setDroneStatus(prev => ({
      ...prev,
      missionState: 'SEARCHING',
      flightMode: 'AUTONOMOUS',
      speedMps: 8,
    }));
    setManualOverrideNotice(null);

    if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);
    stepIntervalRef.current = window.setInterval(() => {
      stepSearchRoute();
    }, 7000);
  }, [stepSearchRoute]);

  // Abort
  const abortMission = useCallback(() => {
    if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);
    setIsDemoRunning(false);
    setDroneStatus(prev => ({
      ...prev,
      missionState: 'ABORTED',
      flightMode: 'RTL',
      speedMps: 0,
    }));

    const nowTime = new Date().toLocaleTimeString([], { hour12: false });
    setAlerts(prev => [
      {
        id: `ALT-ABORT-${Date.now().toString().slice(-4)}`,
        type: 'SYSTEM',
        title: 'MISSION ABORTED',
        message: 'Operator issued mission abort. Drone simulated Return-To-Launch (RTL) sequence initiated.',
        zone: droneStatus.currentZone,
        timestamp: nowTime,
        priority: 'HIGH',
        status: 'VERIFIED'
      },
      ...prev
    ]);
  }, [droneStatus.currentZone]);

  // Reset
  const resetMission = useCallback(() => {
    if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);
    setIsDemoRunning(false);
    currentRouteIndexRef.current = 0;
    setMissionTimeSeconds(0);
    setManualOverrideNotice(null);

    setDroneStatus({
      droneId: 'RESQ-01',
      flightMode: 'AUTONOMOUS',
      missionState: 'IDLE',
      battery: 98,
      gpsStatus: 'SIMULATED — LOCKED',
      commsStatus: 'SIMULATED — CONNECTED',
      aiVisionStatus: 'ACTIVE',
      flightControllerStatus: 'NOT CONNECTED (SIMULATED ROUTE)',
      altitudeMeters: 32,
      speedMps: 0,
      headingDegrees: 45,
      currentZone: 'A1',
      progressPercent: 0,
      cameraMode: 'AI_OVERLAY',
      isSimulated: true,
    });

    setZones(INITIAL_ZONES);
    setDetections([]);
    setHazards([]);
    setAlerts([
      {
        id: 'ALT-SYS-RESET',
        type: 'SYSTEM',
        title: 'System Reset Complete',
        message: 'Mission reset to initial state. Ready for autonomous search or demo execution.',
        zone: 'A1',
        timestamp: new Date().toLocaleTimeString([], { hour12: false }),
        priority: 'LOW',
        status: 'VERIFIED',
      }
    ]);
  }, []);

  // DEMO MODE - Deterministic 60-75s presentation sequence
  const startDemoMode = useCallback(() => {
    resetMission();
    setIsDemoRunning(true);
    currentRouteIndexRef.current = 0;

    // Start mission
    setDroneStatus(prev => ({
      ...prev,
      missionState: 'SEARCHING',
      flightMode: 'AUTONOMOUS',
      currentZone: 'A1',
      progressPercent: 11,
      speedMps: 8,
    }));
    setZones(prev => prev.map(z => z.id === 'A1' ? { ...z, status: 'searching' } : z));

    // Accelerated demo interval (6s per zone for reliable ~55-65s full presentation sweep)
    if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);
    stepIntervalRef.current = window.setInterval(() => {
      stepSearchRoute();
    }, 6000);
  }, [resetMission, stepSearchRoute]);

  // Manual Override
  const setManualOverride = useCallback((enabled: boolean) => {
    if (enabled) {
      if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);
      setDroneStatus(prev => ({
        ...prev,
        flightMode: 'MANUAL',
        missionState: 'PAUSED',
        speedMps: 4,
      }));
      setManualOverrideNotice('Manual control enabled — operator has software control.');
    } else {
      setManualOverrideNotice(null);
      resumeMission();
    }
  }, [resumeMission]);

  // Camera Mode
  const setCameraMode = useCallback((mode: 'RGB' | 'THERMAL' | 'AI_OVERLAY') => {
    setDroneStatus(prev => ({ ...prev, cameraMode: mode }));
  }, []);

  // Alert actions
  const markAlertVerified = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'VERIFIED' } : a));
    // If attached to detection, mark detection verified too
    const alert = alerts.find(a => a.id === alertId);
    if (alert?.detectionId) {
      setDetections(prev => prev.map(d => d.id === alert.detectionId ? { ...d, status: 'VERIFIED' } : d));
    }
  }, [alerts]);

  const dismissAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'DISMISSED' } : a));
    const alert = alerts.find(a => a.id === alertId);
    if (alert?.detectionId) {
      setDetections(prev => prev.map(d => d.id === alert.detectionId ? { ...d, status: 'DISMISSED' } : d));
    }
  }, [alerts]);

  const markDetectionVerified = useCallback((detId: string) => {
    setDetections(prev => prev.map(d => d.id === detId ? { ...d, status: 'VERIFIED' } : d));
    setAlerts(prev => prev.map(a => a.detectionId === detId ? { ...a, status: 'VERIFIED' } : a));
  }, []);

  const dismissDetection = useCallback((detId: string) => {
    setDetections(prev => prev.map(d => d.id === detId ? { ...d, status: 'DISMISSED' } : d));
    setAlerts(prev => prev.map(a => a.detectionId === detId ? { ...a, status: 'DISMISSED' } : a));
  }, []);

  const viewLocation = useCallback((zoneId: ZoneId, detectionId?: string) => {
    setSelectedZoneId(zoneId);
    if (detectionId) {
      const found = detections.find(d => d.id === detectionId);
      if (found) setSelectedDetection(found);
    }
    setActivePage('search_map');
  }, [detections]);

  // Mission timer effect
  useEffect(() => {
    if (droneStatus.missionState === 'SEARCHING') {
      timerRef.current = window.setInterval(() => {
        setMissionTimeSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [droneStatus.missionState]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <MissionContext.Provider
      value={{
        droneStatus,
        zones,
        detections,
        hazards,
        alerts,
        missionHistory,
        missionTimeSeconds,
        formattedMissionTime: formatTime(missionTimeSeconds),
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
        startAutonomousSearch,
        pauseMission,
        resumeMission,
        abortMission,
        resetMission,
        startDemoMode,
        simulateVictim,
        simulateHazard,
        setManualOverride,
        setCameraMode,
        markAlertVerified,
        dismissAlert,
        markDetectionVerified,
        dismissDetection,
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
