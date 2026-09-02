import React from 'react';
import { useMission } from '../context/MissionContext';
import { StatCard } from '../components/common/StatCard';
import { DroneStatusCard } from '../components/drone/DroneStatusCard';
import { CameraFeed } from '../components/camera/CameraFeed';
import { SearchMap } from '../components/map/SearchMap';
import { AlertPanel } from '../components/alerts/AlertPanel';
import { MissionControls } from '../components/controls/MissionControls';
import {
  Activity,
  User,
  Flame,
  Grid,
  Clock,
  Compass,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const {
    droneStatus,
    zones,
    detections,
    hazards,
    formattedMissionTime,
  } = useMission();

  const victimsCount = detections.filter(d => d.type === 'Victim' && d.status !== 'DISMISSED').length;
  const hazardsCount = hazards.filter(h => h.status !== 'DISMISSED').length;
  const searchedZonesCount = zones.filter(z => z.status === 'searched').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top 6 KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <StatCard
          label="Search Progress"
          value={`${droneStatus.progressPercent}%`}
          icon={Activity}
          accentColor="cyan"
          trend="Grid Coverage"
        />

        <StatCard
          label="Victims Detected"
          value={victimsCount}
          icon={User}
          accentColor="red"
          trend={victimsCount > 0 ? "Priority Extraction" : "Monitoring Area"}
        />

        <StatCard
          label="Hazards Detected"
          value={hazardsCount}
          icon={Flame}
          accentColor="amber"
          trend={hazardsCount > 0 ? "Avoidance Active" : "Clear Airspace"}
        />

        <StatCard
          label="Zones Searched"
          value={`${searchedZonesCount} / 9`}
          icon={Grid}
          accentColor="emerald"
          trend="3x3 Tactical Grid"
        />

        <StatCard
          label="Mission Time"
          value={formattedMissionTime}
          icon={Clock}
          accentColor="purple"
          trend="Sim Elapsed"
        />

        <StatCard
          label="Current Zone"
          value={droneStatus.currentZone}
          icon={Compass}
          accentColor="blue"
          trend="Waypoint Lock"
        />
      </div>

      {/* Mission Controls Bar */}
      <MissionControls />

      {/* Main Command Center Grid: Left Live Feed & Map, Right Telemetry & Alerts */}
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
    </div>
  );
};
