/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { JalRakshakProvider, useJalRakshak, NavTab } from './context/JalRakshakContext';
import { Topbar } from './components/layout/Topbar';
import { Sidebar } from './components/layout/Sidebar';
import { DigitalTwinModal } from './components/simulation/DigitalTwinModal';
import { AnomalyInvestigateModal } from './components/anomalies/AnomalyInvestigateModal';
import { OverviewPage } from './pages/OverviewPage';
import { GroundwaterPage } from './pages/GroundwaterPage';
import { ExtractionPage } from './pages/ExtractionPage';
import { WaterQualityPage } from './pages/WaterQualityPage';
import { AnomaliesPage } from './pages/AnomaliesPage';
import { RechargePage } from './pages/RechargePage';
import { NetworkPage } from './pages/NetworkPage';
import { DevicesPage } from './pages/DevicesPage';
import { InsightsPage } from './pages/InsightsPage';
import { SensorsPage } from './pages/SensorsPage';
import { SettingsPage } from './pages/SettingsPage';
import { PublicLandingPage } from './components/landing/PublicLandingPage';
import {
  LayoutDashboard,
  Waves,
  Zap,
  AlertTriangle,
  CloudRain,
  Menu,
  X,
  Cpu,
  Network,
  Settings,
  Droplets,
  HardDrive,
  LineChart,
} from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeTab, setActiveTab, viewMode, setViewMode, anomalies, devices } = useJalRakshak();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeAnomalyCount = anomalies.filter((a) => a.status === 'active').length;
  const warningDeviceCount = devices.filter((d) => d.status !== 'ONLINE').length;

  const renderContent = () => {
    if (viewMode === 'landing') {
      return <PublicLandingPage />;
    }

    switch (activeTab) {
      case 'overview':
        return <OverviewPage />;
      case 'aquifer':
      case 'groundwater':
        return <GroundwaterPage />;
      case 'telemetry':
      case 'extraction':
        return <ExtractionPage />;
      case 'water_quality':
        return <WaterQualityPage />;
      case 'anomalies':
        return <AnomaliesPage />;
      case 'insights':
        return <InsightsPage />;
      case 'recharge':
        return <RechargePage />;
      case 'network':
        return <NetworkPage />;
      case 'devices':
        return <DevicesPage />;
      case 'sensors':
        return <SensorsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <OverviewPage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7F3] dark:bg-[#070e0c] text-slate-900 dark:text-slate-100 font-sans selection:bg-[#2E7D5B]/20 selection:text-[#123C2A] dark:selection:text-[#78E08F]">
      {/* System Context Bar (No duplicate navigation) */}
      <Topbar />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar (The only primary navigation) */}
        <Sidebar />

        {/* Main Content Scroll Area */}
        <main className="flex-1 overflow-y-auto px-3 py-4 sm:px-5 sm:py-5 max-w-[1520px] mx-auto w-full pb-24 md:pb-8">
          {renderContent()}
        </main>
      </div>

      {/* Mobile Drawer / Sheet when Menu is opened on small screens */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs md:hidden flex flex-col justify-end">
          <div className="bg-[#11221C] rounded-t-3xl p-5 border-t border-emerald-950/80 space-y-3 font-mono">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-950/60">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                JalRakshak Infrastructure
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-medium py-2">
              <button
                onClick={() => {
                  setViewMode('dashboard');
                  setActiveTab('extraction');
                  setMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-xl text-left bg-[#070e0c] hover:bg-emerald-950/40 text-slate-200 flex items-center gap-2"
              >
                <Zap className="w-4 h-4 text-[#168AAD]" />
                <span>Telemetry</span>
              </button>
              <button
                onClick={() => {
                  setViewMode('dashboard');
                  setActiveTab('water_quality');
                  setMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-xl text-left bg-[#070e0c] hover:bg-emerald-950/40 text-slate-200 flex items-center gap-2"
              >
                <Droplets className="w-4 h-4 text-[#168AAD]" />
                <span>Water Quality</span>
              </button>
              <button
                onClick={() => {
                  setViewMode('dashboard');
                  setActiveTab('insights');
                  setMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-xl text-left bg-[#070e0c] hover:bg-emerald-950/40 text-slate-200 flex items-center gap-2"
              >
                <LineChart className="w-4 h-4 text-emerald-400" />
                <span>Insights</span>
              </button>
              <button
                onClick={() => {
                  setViewMode('dashboard');
                  setActiveTab('network');
                  setMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-xl text-left bg-[#070e0c] hover:bg-emerald-950/40 text-slate-200 flex items-center gap-2"
              >
                <Network className="w-4 h-4 text-[#2E7D5B]" />
                <span>Borewell Grid</span>
              </button>
              <button
                onClick={() => {
                  setViewMode('dashboard');
                  setActiveTab('recharge');
                  setMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-xl text-left bg-[#070e0c] hover:bg-emerald-950/40 text-slate-200 flex items-center gap-2"
              >
                <CloudRain className="w-4 h-4 text-[#38BDF8]" />
                <span>Recharge MAR</span>
              </button>
              <button
                onClick={() => {
                  setViewMode('dashboard');
                  setActiveTab('settings');
                  setMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-xl text-left bg-[#070e0c] hover:bg-emerald-950/40 text-slate-200 flex items-center gap-2"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Settings</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar (Visible only on mobile screens) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#08100D]/95 backdrop-blur-md border-t border-emerald-950/80 px-2 flex items-center justify-around z-30 font-mono">
        <button
          onClick={() => {
            setViewMode('dashboard');
            setActiveTab('overview');
          }}
          className={`flex flex-col items-center gap-1 p-1 text-[10px] transition-colors ${
            viewMode === 'dashboard' && activeTab === 'overview'
              ? 'text-[#78E08F] font-bold'
              : 'text-slate-400'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => {
            setViewMode('dashboard');
            setActiveTab('aquifer');
          }}
          className={`flex flex-col items-center gap-1 p-1 text-[10px] transition-colors ${
            viewMode === 'dashboard' && (activeTab === 'aquifer' || activeTab === 'groundwater')
              ? 'text-[#78E08F] font-bold'
              : 'text-slate-400'
          }`}
        >
          <Waves className="w-4 h-4" />
          <span>Aquifer</span>
        </button>

        <button
          onClick={() => {
            setViewMode('dashboard');
            setActiveTab('devices');
          }}
          className={`flex flex-col items-center gap-1 p-1 text-[10px] transition-colors relative ${
            viewMode === 'dashboard' && activeTab === 'devices'
              ? 'text-[#78E08F] font-bold'
              : 'text-slate-400'
          }`}
        >
          <HardDrive className="w-4 h-4" />
          <span>Devices</span>
          {warningDeviceCount > 0 && (
            <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => {
            setViewMode('dashboard');
            setActiveTab('anomalies');
          }}
          className={`flex flex-col items-center gap-1 p-1 text-[10px] transition-colors relative ${
            viewMode === 'dashboard' && activeTab === 'anomalies'
              ? 'text-amber-400 font-bold'
              : 'text-slate-400'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Alerts</span>
          {activeAnomalyCount > 0 && (
            <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center gap-1 p-1 text-[10px] text-slate-400 hover:text-white"
        >
          <Menu className="w-4 h-4" />
          <span>Menu</span>
        </button>
      </nav>

      {/* Global Modals */}
      <DigitalTwinModal />
      <AnomalyInvestigateModal />
    </div>
  );
};

export default function App() {
  return (
    <JalRakshakProvider>
      <MainLayout />
    </JalRakshakProvider>
  );
}
