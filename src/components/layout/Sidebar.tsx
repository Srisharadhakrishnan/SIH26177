import React from 'react';
import { useMission } from '../../context/MissionContext';
import { PageId } from '../../types';
import {
  LayoutDashboard,
  SlidersHorizontal,
  Video,
  Scan,
  Flame,
  MapPin,
  Bell,
  History,
  Activity,
  Layers,
  Info,
  ShieldCheck
} from 'lucide-react';

interface NavItem {
  id: PageId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  badgeColor?: string;
}

export const Sidebar: React.FC = () => {
  const { activePage, setActivePage, alerts, detections, hazards } = useMission();

  const unverifiedAlertsCount = alerts.filter(a => a.status === 'REQUIRES_VERIFICATION').length;
  const victimsCount = detections.filter(d => d.type === 'Victim').length;
  const hazardsCount = hazards.length;

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'mission_control', label: 'Mission Control', icon: SlidersHorizontal },
    { id: 'live_search', label: 'Live Search', icon: Video, badge: 'CAM SIM' },
    { id: 'detections', label: 'Detections', icon: Scan, badge: victimsCount > 0 ? victimsCount : undefined, badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
    { id: 'hazards', label: 'Hazards', icon: Flame, badge: hazardsCount > 0 ? hazardsCount : undefined, badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
    { id: 'search_map', label: 'Search Map', icon: MapPin },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: unverifiedAlertsCount > 0 ? unverifiedAlertsCount : undefined, badgeColor: 'bg-red-500 text-white animate-pulse' },
    { id: 'mission_history', label: 'Mission History', icon: History },
    { id: 'system_status', label: 'System Status', icon: Activity },
    { id: 'system_architecture', label: 'System Architecture', icon: Layers },
  ];

  return (
    <aside className="w-64 bg-[#090e1a] border-r border-slate-800 flex flex-col justify-between shrink-0 select-none min-h-[calc(100vh-65px)]">
      {/* Navigation List */}
      <div className="p-3 space-y-1">
        <div className="px-3 py-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
          Command Operations
        </div>
        <nav className="space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-950'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 text-[10px] font-bold rounded border ${
                      item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Technical Honesty & Prototype Notice Box */}
      <div className="p-3.5 m-3 rounded-lg bg-slate-900/90 border border-slate-800/80 text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5 text-cyan-400 font-semibold mb-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Prototype Environment</span>
        </div>
        <p className="leading-relaxed text-[10.5px] text-slate-400">
          Hardware components (Flight Controller, GPS, Camera) are <strong className="text-slate-200 font-semibold">simulated</strong> for demonstration. Real sensors integrate in Stage 2.
        </p>
      </div>
    </aside>
  );
};
