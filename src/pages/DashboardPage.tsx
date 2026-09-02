import React from 'react';
import { useMission } from '../context/MissionContext';
import { StatCard } from '../components/common/StatCard';
import { DroneStatusCard } from '../components/drone/DroneStatusCard';
import { CameraFeed } from '../components/camera/CameraFeed';
import { SearchMap } from '../components/map/SearchMap';
import { AlertPanel } from '../components/alerts/AlertPanel';
import { MissionControls } from '../components/controls/MissionControls';
import {
  MissionObjectiveBanner,
  RescuePriorityPanel,
  DecisionTimeline,
} from '../components/intelligence';
import { AIInferencePanel } from '../components/ai';
import {
  Activity,
  User,
  Flame,
  Grid,
  Clock,
  AlertTriangle,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const {
    droneStatus,
    zones,
    survivors,
    hazards,
    formattedMissionTime,
  } = useMission();

  const survivorsCount = survivors.filter(s => s.verificationStatus !== 'REJECTED').length;
  const criticalCount = survivors.filter(s => (s.riskLevel === 'CRITICAL' || s.riskLevel === 'HIGH') && s.verificationStatus !== 'REJECTED').length;
  const hazardsCount = hazards.filter(h => h.status !== 'DISMISSED').length;
  const searchedZonesCount = zones.filter(z => z.status === 'searched').length;

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Top 6 KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <StatCard
          label="Search Progress"
          value={`${droneStatus.progressPercent}%`}
          icon={Activity}
          accentColor="cyan"
          trend="Autonomous Grid"
        />

        <StatCard
          label="Survivors Identified"
          value={survivorsCount}
          icon={User}
          accentColor="red"
          trend={survivorsCount > 0 ? "Prioritization Active" : "Scanning Sectors"}
        />

        <StatCard
          label="High/Critical Risk"
          value={criticalCount}
          icon={AlertTriangle}
          accentColor="red"
          trend={criticalCount > 0 ? "Urgent Action Required" : "Airspace Monitored"}
        />

        <StatCard
          label="Hazards Mapped"
          value={hazardsCount}
          icon={Flame}
          accentColor="amber"
          trend={hazardsCount > 0 ? "Safe Corridors Active" : "No Critical Hazard"}
        />

        <StatCard
          label="Zones Surveyed"
          value={`${searchedZonesCount} / 9`}
          icon={Grid}
          accentColor="emerald"
          trend="3×3 Sector Grid"
        />

        <StatCard
          label="Mission Duration"
          value={formattedMissionTime}
          icon={Clock}
          accentColor="purple"
          trend="Elapsed Simulation"
        />
      </div>

      {/* FEATURE 7: Dynamic Mission Replanning Objective Strip */}
      <MissionObjectiveBanner />

      {/* Mission Controls Bar with Trigger Injections */}
      <MissionControls />

      {/* Tactical Center Grid: Camera Feed, Map, Drone Status, Alerts */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Camera Feed & Live Sector Map */}
        <div className="xl:col-span-7 space-y-6">
          <div className="h-[460px]">
            <CameraFeed />
          </div>
          <div className="min-h-[420px]">
            <SearchMap compact={false} />
          </div>
        </div>

        {/* Right Column (5 cols): Drone Telemetry & Alerts Stream */}
        <div className="xl:col-span-5 space-y-6">
          <DroneStatusCard />
          <div className="h-[520px]">
            <AlertPanel maxItems={6} />
          </div>
        </div>
      </div>

      {/* PHASE 3: AI Inference & Multi-Modal Fusion Engine Diagnostics */}
      <AIInferencePanel />

      {/* FEATURE 4, 6 & 10: Rescue Intelligence Panel (Priorities + Explainable Decision + Safe Route) */}
      <RescuePriorityPanel />

      {/* FEATURE 9: Decision & Event Timeline */}
      <DecisionTimeline />
    </div>
  );
};
