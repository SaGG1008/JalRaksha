import React, { useState } from 'react';
import {
  X,
  Wifi,
  Battery,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Play,
  RotateCcw,
  CheckCircle2,
  Sliders,
  ExternalLink,
  Layers,
  Thermometer,
  Radio,
  Cpu,
  Activity,
  Send,
} from 'lucide-react';
import { IotDevice } from '../../types';
import { useJalRakshak } from '../../context/JalRakshakContext';

interface DeviceDetailsModalProps {
  device: IotDevice | null;
  onClose: () => void;
}

export const DeviceDetailsModal: React.FC<DeviceDetailsModalProps> = ({
  device,
  onClose,
}) => {
  const {
    testDeviceConnection,
    calibrateDevice,
    viewDeviceInAquifer,
    selectedBorewell,
  } = useJalRakshak();

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; latencyMs: number; message: string } | null>(null);
  const [calibratedSuccess, setCalibratedSuccess] = useState(false);

  if (!device) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testDeviceConnection(device.id);
      setTestResult(res);
    } finally {
      setIsTesting(false);
    }
  };

  const handleCalibrate = () => {
    calibrateDevice(device.id);
    setCalibratedSuccess(true);
    setTimeout(() => setCalibratedSuccess(false), 3000);
  };

  const isOnline = device.status === 'ONLINE';
  const isWarning =
    device.status === 'CALIBRATION REQUIRED' ||
    device.status === 'DEGRADED' ||
    device.status === 'LOW BATTERY' ||
    device.status === 'SIGNAL WARNING';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto font-mono select-none">
      <div className="bg-[#0B1512] rounded-3xl border border-emerald-900/80 max-w-4xl w-full p-5 sm:p-6 shadow-2xl relative overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-emerald-950/80 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#16382B] text-[#78E08F] flex items-center justify-center font-bold">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 uppercase tracking-wider">
                  {device.borewellId} · {device.borewellName}
                </span>
                <span
                  className={`text-[10px] uppercase font-bold px-2 py-0.2 rounded ${
                    isOnline
                      ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-800/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {device.status}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight mt-0.5">
                {device.name}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                viewDeviceInAquifer(device.borewellId);
                onClose();
              }}
              className="px-3 py-1.5 rounded-lg bg-[#16382B] hover:bg-emerald-900 text-[#78E08F] text-xs font-semibold flex items-center gap-1.5 transition-colors border border-emerald-800/60"
              title="Inspect in Living Aquifer Command Center"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>View in Aquifer</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Grid: Left physical & connection telemetry, Right specs & actions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column (7 cols): Physical In-Situ Borewell View & Real-time Reading */}
          <div className="lg:col-span-7 space-y-4">
            {/* Current Reading Hero Banner */}
            <div className="p-4 rounded-2xl bg-[#070e0c] border border-emerald-950/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                  CURRENT FIELD TELEMETRY
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-extrabold text-[#38BDF8] tabular-nums">
                    {device.currentReadingValue}
                  </span>
                  <span className="text-sm font-bold text-slate-300">
                    {device.currentReadingUnit}
                  </span>
                </div>
                {device.readingDeltaToday && (
                  <span className="text-xs text-amber-400 block mt-1">
                    {device.readingDeltaToday}
                  </span>
                )}
              </div>

              <div className="text-right text-xs">
                <span className="text-slate-500 block text-[10px]">SAMPLING CADENCE</span>
                <span className="text-white font-bold">{device.samplingIntervalSec} seconds</span>
                <span className="text-slate-500 block text-[10px] mt-2">DATA QUALITY</span>
                <span className="text-emerald-400 font-bold">{device.dataQualityPct}% valid frames</span>
              </div>
            </div>

            {/* Physical Device In-Situ Borewell Visualization (Section 11 in prompt) */}
            <div className="p-4 rounded-2xl bg-[#070e0c] border border-emerald-950/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold">
                  PHYSICAL IN-SITU BOREHOLE PLACEMENT
                </span>
                <span className="text-[10px] text-slate-400">
                  Depth: {device.depthMeters !== undefined ? `${device.depthMeters} m below surface` : 'Surface Wellhead'}
                </span>
              </div>

              {/* Simplified Geological Subsurface Section */}
              <div className="relative w-full h-44 bg-[#050a08] rounded-xl border border-emerald-950/60 overflow-hidden">
                <svg viewBox="0 0 460 180" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                  {/* Surface Level */}
                  <line x1="20" y1="30" x2="440" y2="30" stroke="#2E7D5B" strokeWidth="2" />
                  <text x="30" y="24" fill="#2E7D5B" fontSize="8" fontFamily="monospace">SURFACE (0.0m)</text>

                  {/* Unsaturated Vadose Zone */}
                  <rect x="20" y="30" width="420" height="50" fill="#9A7653" fillOpacity="0.08" />
                  <text x="30" y="60" fill="#64748B" fontSize="7.5" fontFamily="monospace">VADOSE ZONE</text>

                  {/* Water Table at Y = 80 */}
                  <line x1="20" y1="80" x2="440" y2="80" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="4,2" />
                  <text x="30" y="76" fill="#38BDF8" fontSize="8" fontFamily="monospace" fontWeight="bold">
                    WATER TABLE (18.4m)
                  </text>

                  {/* Saturated Aquifer Zone */}
                  <rect x="20" y="80" width="420" height="90" fill="#168AAD" fillOpacity="0.15" />
                  <text x="30" y="140" fill="#168AAD" fontSize="7.5" fontFamily="monospace">SATURATED AQUIFER MATRIX</text>

                  {/* Central Borehole Casing */}
                  <g transform="translate(230, 0)">
                    {/* Wellhead Enclosure */}
                    <rect x="-16" y="12" width="32" height="18" rx="2" fill="#1e293b" stroke="#64748b" strokeWidth="1" />
                    <circle cx="0" cy="21" r="2" fill="#10B981" />

                    {/* Borehole Pipe */}
                    <line x1="-8" y1="30" x2="-8" y2="170" stroke="#475569" strokeWidth="2" />
                    <line x1="8" y1="30" x2="8" y2="170" stroke="#475569" strokeWidth="2" />

                    {/* Sensor Cable */}
                    <line x1="0" y1="30" x2="0" y2="120" stroke="#10B981" strokeWidth="1" strokeDasharray="2,2" />

                    {/* Highlighted Active Sensor Node Marker */}
                    <g transform="translate(0, 115)">
                      <circle cx="0" cy="0" r="12" fill="#38BDF8" opacity="0.25" className="animate-ping" />
                      <rect x="-12" y="-8" width="24" height="16" rx="2" fill="#0284C7" stroke="#ffffff" strokeWidth="1" />
                      <text x="0" y="3" textAnchor="middle" fill="#FFFFFF" fontSize="7" fontWeight="bold">
                        SNS
                      </text>
                    </g>
                  </g>

                  {/* Sensor Depth Tag Callout */}
                  <g transform="translate(265, 115)">
                    <line x1="0" y1="0" x2="25" y2="0" stroke="#38BDF8" strokeWidth="1" />
                    <rect x="25" y="-10" width="140" height="20" rx="3" fill="#0e1d17" stroke="#38BDF8" strokeWidth="0.8" />
                    <text x="32" y="3" fill="#38BDF8" fontSize="8" fontFamily="monospace" fontWeight="bold">
                      {device.id} (Depth: {device.depthMeters || 72}m)
                    </text>
                  </g>
                </svg>
              </div>
            </div>

            {/* Historical 7-Day Trend Chart Preview */}
            <div className="p-3.5 rounded-2xl bg-[#070e0c] border border-emerald-950/80">
              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-2">
                <span>RECENT TELEMETRY SAMPLES</span>
                <span>Time-Series Stability: Nominal</span>
              </div>
              <div className="flex items-end gap-2 h-16 pt-2 border-b border-emerald-950/60">
                {device.history.map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-[#168AAD] rounded-xs hover:bg-[#38BDF8] transition-colors"
                      style={{ height: `${Math.min(100, Math.max(20, h.value * 2.5))}%` }}
                      title={`${h.timestamp}: ${h.value} ${device.currentReadingUnit}`}
                    />
                    <span className="text-[8px] text-slate-500">{h.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Connection Health, Hardware, and Actions */}
          <div className="lg:col-span-5 space-y-4">
            {/* Device Health Metrics */}
            <div className="p-4 rounded-2xl bg-[#070e0c] border border-emerald-950/80 space-y-2 text-xs">
              <div className="text-[10px] text-emerald-400 uppercase tracking-wider font-bold mb-2">
                DEVICE HEALTH AUDIT
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded-lg bg-[#0e1d17]">
                  <span className="text-slate-500 block text-[9px]">BATTERY</span>
                  <span className="font-bold text-white">{device.batteryPercent}%</span>
                </div>
                <div className="p-2 rounded-lg bg-[#0e1d17]">
                  <span className="text-slate-500 block text-[9px]">SIGNAL RSSI</span>
                  <span className="font-bold text-white">{device.signalRssiDbm} dBm</span>
                </div>
                <div className="p-2 rounded-lg bg-[#0e1d17]">
                  <span className="text-slate-500 block text-[9px]">DEVICE TEMP</span>
                  <span className="font-bold text-white">{device.deviceTempC}°C</span>
                </div>
                <div className="p-2 rounded-lg bg-[#0e1d17]">
                  <span className="text-slate-500 block text-[9px]">CALIBRATION</span>
                  <span
                    className={`font-bold ${
                      device.calibrationStatus === 'VALID' ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {device.calibrationStatus}
                  </span>
                </div>
              </div>
              <div className="text-[10px] text-slate-500 pt-1">
                Last Sync: {device.lastSyncSecondsAgo}s ago · Next Calibration: {device.nextCalibrationDate}
              </div>
            </div>

            {/* Device Connection Interface (Section 12 in prompt) */}
            <div className="p-4 rounded-2xl bg-[#070e0c] border border-emerald-950/80 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-bold">
                  CONNECTION TELEMETRY
                </span>
                <span className="text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  CONNECTED
                </span>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Protocol:</span>
                  <span className="font-bold text-white">{device.protocol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Edge Gateway:</span>
                  <span className="font-bold text-white">{device.gatewayId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Signal Bar:</span>
                  <span className="font-bold text-[#38BDF8]">
                    ████████░░ {device.signalQualityPct}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Round-Trip Latency:</span>
                  <span className="font-bold text-white">{device.latencyMs} ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Packet Loss:</span>
                  <span className="font-bold text-white">{device.packetLossPct}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Last Heartbeat:</span>
                  <span className="font-bold text-slate-300">{device.lastSyncSecondsAgo} sec ago</span>
                </div>
              </div>

              {testResult && (
                <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-800 text-[11px] text-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 inline mr-1 text-emerald-400" />
                  {testResult.message}
                </div>
              )}

              <button
                onClick={handleTestConnection}
                disabled={isTesting}
                className="w-full mt-2 py-2 px-3 rounded-xl bg-[#16382B] hover:bg-emerald-900 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors border border-emerald-800/60"
              >
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isTesting ? 'Pinging Gateway & Echoing...' : 'TEST CONNECTION'}</span>
              </button>
            </div>

            {/* Hardware & Calibration Actions */}
            <div className="p-4 rounded-2xl bg-[#070e0c] border border-emerald-950/80 space-y-3 text-xs">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                HARDWARE IDENTITY
              </div>
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Model:</span>
                  <span className="text-white">{device.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Firmware:</span>
                  <span className="text-white">{device.firmware}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">EUI / MAC:</span>
                  <span className="text-slate-400 text-[10px]">{device.macOrImei}</span>
                </div>
              </div>

              {calibratedSuccess && (
                <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-800 text-[11px] text-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 inline mr-1 text-emerald-400" />
                  Sensor calibration renewed for 180 days.
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleCalibrate}
                  className="flex-1 py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-[11px] border border-emerald-950/60 transition-colors"
                >
                  Calibrate Sensor
                </button>
                <button
                  onClick={onClose}
                  className="py-1.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-[11px] transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
