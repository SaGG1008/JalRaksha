import React from 'react';
import {
  Wifi,
  Battery,
  Clock,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Sliders,
  ExternalLink,
  Layers,
  Radio,
} from 'lucide-react';
import { IotDevice } from '../../types';
import { useJalRakshak } from '../../context/JalRakshakContext';

interface DeviceCardProps {
  device: IotDevice;
  onViewDetails: (device: IotDevice) => void;
  onConfigure: (device: IotDevice) => void;
}

export const DeviceCard: React.FC<DeviceCardProps> = ({
  device,
  onViewDetails,
  onConfigure,
}) => {
  const { viewDeviceInAquifer } = useJalRakshak();

  const isOnline = device.status === 'ONLINE';
  const isWarning =
    device.status === 'CALIBRATION REQUIRED' ||
    device.status === 'DEGRADED' ||
    device.status === 'LOW BATTERY' ||
    device.status === 'SIGNAL WARNING';
  const isOffline = device.status === 'OFFLINE';

  const statusBadgeStyle = isOnline
    ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-800/40'
    : isWarning
    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/40'
    : 'bg-slate-900 text-slate-400 border border-slate-800';

  return (
    <div
      className={`bg-[#0B1512] rounded-2xl border transition-all flex flex-col justify-between p-4 shadow-xs relative overflow-hidden font-mono ${
        isWarning
          ? 'border-amber-500/40 hover:border-amber-500/70'
          : 'border-emerald-950/80 hover:border-emerald-800/80'
      }`}
    >
      {/* Top subtle highlight border for warning */}
      {isWarning && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500/60" />
      )}

      <div>
        {/* Header: Status, Borewell ID, Node ID */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-emerald-950/60">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isOnline
                  ? 'bg-emerald-400'
                  : isWarning
                  ? 'bg-amber-400 animate-pulse'
                  : 'bg-slate-500'
              }`}
            />
            <span className={`text-[10px] uppercase font-bold px-1.5 py-0.2 rounded ${statusBadgeStyle}`}>
              {device.status}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 text-[10px]">HOST:</span>
            <span className="font-bold text-white bg-slate-900/80 px-1.5 py-0.5 rounded border border-emerald-950/60">
              {device.borewellId}
            </span>
          </div>
        </div>

        {/* Device Name and Type */}
        <div className="mb-3">
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 uppercase tracking-wide">
            <Radio className="w-3 h-3 text-[#168AAD]" />
            <span>{device.type}</span>
          </div>
          <h3 className="text-sm font-bold text-white tracking-tight mt-0.5 truncate">
            {device.name}
          </h3>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
            ID: <span className="text-slate-400">{device.id}</span> · Model: <span className="text-slate-400">{device.model}</span>
          </div>
        </div>

        {/* Current Reading Hero Banner */}
        <div className="p-3 rounded-xl bg-[#070e0c] border border-emerald-950/80 mb-3">
          <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase">
            <span>CURRENT READING</span>
            {device.readingDeltaToday && (
              <span className="text-slate-400 text-[10px]">{device.readingDeltaToday}</span>
            )}
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-extrabold text-[#38BDF8] tabular-nums">
              {device.currentReadingValue}
            </span>
            <span className="text-xs font-semibold text-slate-400">
              {device.currentReadingUnit}
            </span>
          </div>
        </div>

        {/* Technical Telemetry Grid: Battery, Signal, Last Sync, Calibration */}
        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
          <div className="p-2 rounded-lg bg-[#0e1d17] border border-emerald-950/60">
            <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-0.5">
              <Battery className="w-3 h-3 text-emerald-400" />
              <span>BATTERY</span>
            </div>
            <span className="font-bold text-white text-xs">{device.batteryPercent}%</span>
          </div>

          <div className="p-2 rounded-lg bg-[#0e1d17] border border-emerald-950/60">
            <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-0.5">
              <Wifi className="w-3 h-3 text-[#168AAD]" />
              <span>SIGNAL</span>
            </div>
            <span className="font-bold text-white text-xs">{device.signalRssiDbm} dBm</span>
          </div>

          <div className="p-2 rounded-lg bg-[#0e1d17] border border-emerald-950/60">
            <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-0.5">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>LAST SYNC</span>
            </div>
            <span className="font-bold text-slate-300 text-xs">{device.lastSyncSecondsAgo} sec ago</span>
          </div>

          <div className="p-2 rounded-lg bg-[#0e1d17] border border-emerald-950/60">
            <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-0.5">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>CALIBRATION</span>
            </div>
            <span
              className={`font-bold text-[11px] truncate block ${
                device.calibrationStatus === 'VALID'
                  ? 'text-emerald-400'
                  : 'text-amber-400'
              }`}
            >
              {device.calibrationStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 border-t border-emerald-950/80 flex items-center justify-between gap-2 text-xs">
        <button
          onClick={() => onViewDetails(device)}
          className="flex-1 py-1.5 px-2.5 rounded-lg bg-[#16382B] hover:bg-emerald-900 text-white font-semibold text-[11px] flex items-center justify-center gap-1 transition-colors"
        >
          <span>View Device</span>
          <ArrowRight className="w-3 h-3" />
        </button>

        <button
          onClick={() => onConfigure(device)}
          className="py-1.5 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-[11px] flex items-center justify-center gap-1 border border-emerald-950/60 transition-colors"
          title="Configure Sampling & Alerts"
        >
          <Sliders className="w-3 h-3" />
          <span>Config</span>
        </button>

        <button
          onClick={() => viewDeviceInAquifer(device.borewellId)}
          className="py-1.5 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-[#38BDF8] hover:text-white font-semibold text-[11px] flex items-center justify-center gap-1 border border-emerald-950/60 transition-colors"
          title="Locate Sensor in Subsurface Aquifer Cross-Section"
        >
          <Layers className="w-3 h-3" />
          <span className="hidden sm:inline">Aquifer</span>
        </button>
      </div>
    </div>
  );
};
