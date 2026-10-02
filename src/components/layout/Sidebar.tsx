import React from 'react';
import {
  LayoutDashboard,
  Waves,
  Zap,
  Droplets,
  AlertTriangle,
  CloudRain,
  Network,
  Cpu,
  Settings,
  LineChart,
  HardDrive,
  ShieldAlert,
} from 'lucide-react';
import { useJalRakshak, NavTab } from '../../context/JalRakshakContext';

interface SidebarItem {
  id: NavTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  badgeColor?: string;
}

interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, anomalies, devices, selectedBorewell } = useJalRakshak();

  const activeAnomalyCount = anomalies.filter((a) => a.status === 'active').length;
  const warningDeviceCount = devices.filter((d) => d.status !== 'ONLINE').length;

  const sections: SidebarSection[] = [
    {
      title: 'MISSION',
      items: [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'aquifer', label: 'Aquifer', icon: Waves },
        { id: 'telemetry', label: 'Telemetry', icon: Zap },
      ],
    },
    {
      title: 'WATER',
      items: [
        { id: 'extraction', label: 'Extraction', icon: Droplets },
        { id: 'water_quality', label: 'Water Quality', icon: Droplets },
        { id: 'recharge', label: 'Recharge Intelligence', icon: CloudRain },
      ],
    },
    {
      title: 'INTELLIGENCE',
      items: [
        {
          id: 'anomalies',
          label: 'Anomalies',
          icon: AlertTriangle,
          badge: activeAnomalyCount > 0 ? activeAnomalyCount : undefined,
          badgeColor: 'bg-amber-500/20 text-amber-400 border border-amber-500/40',
        },
        { id: 'insights', label: 'Insights', icon: LineChart },
      ],
    },
    {
      title: 'INFRASTRUCTURE',
      items: [
        { id: 'network', label: 'Borewell Network', icon: Network },
        {
          id: 'devices',
          label: 'Devices',
          icon: HardDrive,
          badge: warningDeviceCount > 0 ? `${devices.length}` : `${devices.length}`,
          badgeColor: warningDeviceCount > 0
            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
            : 'bg-emerald-950/70 text-emerald-400 border border-emerald-800/40',
        },
      ],
    },
    {
      title: 'SYSTEM',
      items: [{ id: 'settings', label: 'Settings', icon: Settings }],
    },
  ];

  return (
    <aside className="w-60 bg-[#08100D] border-r border-emerald-950/80 flex flex-col justify-between shrink-0 transition-colors hidden md:flex select-none z-30">
      {/* Scrollable Navigation Sections */}
      <div className="py-4 px-3 space-y-5 overflow-y-auto">
        {/* Brand header */}
        <div className="px-2 pt-1 pb-1">
          <div className="text-[10px] font-mono uppercase tracking-widest text-emerald-500/80 font-bold">
            JALRAKSHAK
          </div>
          <div className="text-xs font-semibold text-slate-300">
            Groundwater Control
          </div>
        </div>

        {/* Structured Sections */}
        {sections.map((section) => (
          <div key={section.title} className="space-y-1">
            <div className="px-2.5 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold mb-1">
              {section.title}
            </div>

            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                // Handle aliases (e.g. aquifer == groundwater, telemetry == extraction if requested)
                const isActive =
                  activeTab === item.id ||
                  (item.id === 'aquifer' && activeTab === 'groundwater') ||
                  (item.id === 'extraction' && activeTab === 'telemetry');

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all group ${
                      isActive
                        ? 'bg-[#16382B] text-[#78E08F] font-semibold border-l-2 border-[#78E08F]'
                        : 'text-slate-400 hover:text-white hover:bg-emerald-950/30'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          isActive
                            ? 'text-[#78E08F]'
                            : 'text-slate-500 group-hover:text-slate-300'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge !== undefined && (
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                          item.badgeColor || 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Mini Node Focus Card */}
      <div className="p-3 border-t border-emerald-950/80 bg-[#070e0c]/80">
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mb-1">
          <span>ACTIVE FIELD NODE</span>
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              selectedBorewell.status === 'warning'
                ? 'bg-amber-400 animate-pulse'
                : 'bg-emerald-400'
            }`}
          />
        </div>
        <div className="text-xs font-bold text-white font-mono truncate">
          {selectedBorewell.id}
        </div>
        <div className="text-[10px] text-slate-400 truncate mb-1.5 font-sans">
          {selectedBorewell.aquiferType}
        </div>
        <div className="grid grid-cols-2 gap-1 text-[10px] font-mono pt-1.5 border-t border-emerald-950/80">
          <div>
            <span className="text-slate-500 block text-[9px]">WATER TABLE</span>
            <span className="font-bold text-[#38BDF8]">
              {selectedBorewell.waterLevelMeters} m
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[9px]">PUMP MOTOR</span>
            <span
              className={`font-bold ${
                selectedBorewell.pumpStatus === 'ON'
                  ? 'text-emerald-400'
                  : 'text-slate-400'
              }`}
            >
              {selectedBorewell.pumpStatus}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
