import React, { useState, useMemo } from 'react';
import {
  HardDrive,
  Plus,
  Search,
  Filter,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Wifi,
  Sliders,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { useJalRakshak } from '../context/JalRakshakContext';
import { IotDevice } from '../types';
import { DeviceCard } from '../components/devices/DeviceCard';
import { DeviceDetailsModal } from '../components/devices/DeviceDetailsModal';
import { AddDeviceModal } from '../components/devices/AddDeviceModal';

export const DevicesPage: React.FC = () => {
  const { devices, selectedBorewell } = useJalRakshak();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Online' | 'Warning' | 'Offline' | 'Calibration'>('All');
  const [filterBorewell, setFilterBorewell] = useState<string>('All');
  const [selectedDeviceForModal, setSelectedDeviceForModal] = useState<IotDevice | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // Status counters
  const onlineCount = devices.filter((d) => d.status === 'ONLINE').length;
  const warningCount = devices.filter(
    (d) =>
      d.status === 'CALIBRATION REQUIRED' ||
      d.status === 'DEGRADED' ||
      d.status === 'LOW BATTERY' ||
      d.status === 'SIGNAL WARNING'
  ).length;
  const offlineCount = devices.filter((d) => d.status === 'OFFLINE').length;

  const filteredDevices = useMemo(() => {
    return devices.filter((device) => {
      // Status filter
      if (filterStatus === 'Online' && device.status !== 'ONLINE') return false;
      if (
        filterStatus === 'Warning' &&
        device.status !== 'CALIBRATION REQUIRED' &&
        device.status !== 'DEGRADED' &&
        device.status !== 'LOW BATTERY' &&
        device.status !== 'SIGNAL WARNING'
      )
        return false;
      if (filterStatus === 'Offline' && device.status !== 'OFFLINE') return false;
      if (filterStatus === 'Calibration' && device.calibrationStatus !== 'CALIBRATION REQUIRED') return false;

      // Borewell filter
      if (filterBorewell !== 'All' && device.borewellId !== filterBorewell) return false;

      // Search query (Device ID, Borewell ID, Sensor Type, Name)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesId = device.id.toLowerCase().includes(query);
        const matchesBorewell = device.borewellId.toLowerCase().includes(query);
        const matchesType = device.type.toLowerCase().includes(query);
        const matchesName = device.name.toLowerCase().includes(query);
        if (!matchesId && !matchesBorewell && !matchesType && !matchesName) return false;
      }

      return true;
    });
  }, [devices, filterStatus, filterBorewell, searchQuery]);

  return (
    <div className="space-y-6 font-mono select-none">
      {/* Header (Section 6 in prompt) */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-emerald-950/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase text-emerald-500 font-bold tracking-wider">
              FIELD INFRASTRUCTURE & SENSOR FLEET
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            DEVICES
          </h1>
          <div className="flex items-center gap-3 text-xs mt-1">
            <span className="text-emerald-400 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              {onlineCount} DEVICES ONLINE
            </span>
            {warningCount > 0 && (
              <>
                <span className="text-slate-600">·</span>
                <span className="text-amber-400 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  {warningCount} WARNING
                </span>
              </>
            )}
            {offlineCount > 0 && (
              <>
                <span className="text-slate-600">·</span>
                <span className="text-slate-400 font-bold">
                  {offlineCount} OFFLINE
                </span>
              </>
            )}
          </div>
        </div>

        {/* Action Button: Add Device */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#168AAD] to-[#2E7D5B] hover:opacity-95 text-white font-bold text-xs transition-opacity shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>ADD DEVICE</span>
        </button>
      </div>

      {/* Filter Bar & Search Input (Section 6 in prompt) */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#0B1512] rounded-2xl border border-emerald-950/80 text-xs">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1">
          {(['All', 'Online', 'Warning', 'Offline', 'Calibration'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterStatus === status
                  ? 'bg-[#16382B] text-[#78E08F] font-bold border border-emerald-800/60'
                  : 'text-slate-400 hover:text-white hover:bg-emerald-950/40'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Search Input & Borewell Filter */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Borewell Node Filter Dropdown */}
          <select
            value={filterBorewell}
            onChange={(e) => setFilterBorewell(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-[#070e0c] border border-emerald-950/80 text-slate-300 text-xs focus:outline-hidden"
          >
            <option value="All">All Borewells</option>
            <option value="BWL-01">BWL-01 (North Community)</option>
            <option value="BWL-02">BWL-02 (West Industrial)</option>
            <option value="BWL-03">BWL-03 (East Sector)</option>
            <option value="BWL-04">BWL-04 (South Wetland)</option>
            <option value="BWL-05">BWL-05 (Central Campus)</option>
          </select>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search ID, borewell, sensor type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg bg-[#070e0c] border border-emerald-950/80 text-white placeholder-slate-500 text-xs w-56 sm:w-64 focus:outline-hidden focus:border-emerald-600"
            />
          </div>
        </div>
      </div>

      {/* Device Cards Grid (Section 7 & 8 in prompt) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDevices.map((device) => (
          <DeviceCard
            key={device.id}
            device={device}
            onViewDetails={(d) => setSelectedDeviceForModal(d)}
            onConfigure={(d) => setSelectedDeviceForModal(d)}
          />
        ))}
      </div>

      {filteredDevices.length === 0 && (
        <div className="p-12 text-center bg-[#0B1512] rounded-3xl border border-emerald-950/60">
          <HardDrive className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-white">No Matching IoT Devices</h3>
          <p className="text-xs text-slate-400 mt-1">
            Try adjusting your search query or status filter.
          </p>
        </div>
      )}

      {/* Device Details Modal */}
      <DeviceDetailsModal
        device={selectedDeviceForModal}
        onClose={() => setSelectedDeviceForModal(null)}
      />

      {/* Add Device Wizard Modal */}
      <AddDeviceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
};
