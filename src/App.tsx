import React from 'react';
import { MissionProvider, useMission } from './context/MissionContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { DetectionDetailModal } from './components/modals/DetectionDetailModal';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { MissionControlPage } from './pages/MissionControlPage';
import { LiveSearchPage } from './pages/LiveSearchPage';
import { DetectionsPage } from './pages/DetectionsPage';
import { HazardsPage } from './pages/HazardsPage';
import { SearchMapPage } from './pages/SearchMapPage';
import { AlertsPage } from './pages/AlertsPage';
import { MissionHistoryPage } from './pages/MissionHistoryPage';
import { SystemStatusPage } from './pages/SystemStatusPage';
import { SystemArchitecturePage } from './pages/SystemArchitecturePage';
import { HardwareIntegrationPage } from './pages/HardwareIntegrationPage';

const MainContent: React.FC = () => {
  const { activePage } = useMission();

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'mission_control':
        return <MissionControlPage />;
      case 'live_search':
        return <LiveSearchPage />;
      case 'detections':
        return <DetectionsPage />;
      case 'hazards':
        return <HazardsPage />;
      case 'search_map':
        return <SearchMapPage />;
      case 'alerts':
        return <AlertsPage />;
      case 'mission_history':
        return <MissionHistoryPage />;
      case 'system_status':
        return <SystemStatusPage />;
      case 'system_architecture':
        return <SystemArchitecturePage />;
      case 'hardware_integration':
        return <HardwareIntegrationPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="flex-1 min-w-0 bg-[#080c14] bg-tactical-grid p-4 lg:p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto">{renderPage()}</div>
    </div>
  );
};

export function App() {
  return (
    <MissionProvider>
      <div className="min-h-screen flex flex-col bg-[#080c14] text-slate-100 selection:bg-cyan-500 selection:text-black">
        <Header />
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          <Sidebar />
          <MainContent />
        </div>
        <DetectionDetailModal />
      </div>
    </MissionProvider>
  );
}

export default App;
