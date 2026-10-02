import React from 'react';
import { Cpu, Wifi, Battery, RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck, Terminal } from 'lucide-react';
import { useJalRakshak } from '../context/JalRakshakContext';

export const SensorsPage: React.FC = () => {
  const { sensors, selectedBorewell } = useJalRakshak();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-emerald-950/60">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 dark:text-emerald-500/70">
            IOT HARDWARE TELEMETRY & DIAGNOSTICS
          </span>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Sensor Network Health & Edge Telemetry Gateway
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time transceiver signal RSSI, battery discharge profiles, calibration certificates, and raw byte payload streaming
          </p>
        </div>

        {/* Global gateway health badge */}
        <div className="flex items-center gap-2 text-xs font-mono bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800/40">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>LoRaWAN Gateway Node 01: 99.8% Uplink Health</span>
        </div>
      </div>

      {/* Sensor Health Grid (Section 19 in prompt) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sensors.map((sensor) => {
          const isWarning = sensor.status === 'warning';
          const isOnline = sensor.status === 'online';

          return (
            <div
              key={sensor.id}
              className={`bg-white dark:bg-[#11221C] rounded-2xl border p-5 shadow-xs flex flex-col justify-between transition-all ${
                isWarning
                  ? 'border-amber-300 dark:border-amber-900/40'
                  : 'border-slate-200 dark:border-emerald-950/40'
              }`}
            >
              <div>
                {/* Top header */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">
                    {sensor.id} · {sensor.type}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isOnline ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                    />
                    <span
                      className={`text-[11px] font-mono font-semibold uppercase ${
                        isOnline ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {sensor.status}
                    </span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                  {sensor.name}
                </h3>

                {/* Technical Diagnostic Metrics */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-4">
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-[#0B1512]/60">
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-0.5">
                      <Battery className="w-3 h-3 text-emerald-500" />
                      <span>BATTERY</span>
                    </div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {sensor.batteryPercent}% (LiFePO4)
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-[#0B1512]/60">
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-0.5">
                      <Wifi className="w-3 h-3 text-[#168AAD]" />
                      <span>SIGNAL RSSI</span>
                    </div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {sensor.signalRssiDbm} dBm (Strong)
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-[#0B1512]/60">
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-0.5">
                      <RefreshCw className="w-3 h-3 text-slate-400" />
                      <span>LAST SYNC</span>
                    </div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {sensor.lastSyncSecondsAgo} sec ago
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-[#0B1512]/60">
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-0.5">
                      <ShieldCheck className="w-3 h-3 text-emerald-500" />
                      <span>CALIBRATION</span>
                    </div>
                    <span
                      className={`font-semibold ${
                        isWarning
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {sensor.calibrationStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Raw Payload Sniffer */}
              <div className="p-2 bg-slate-900 dark:bg-[#08100D] rounded-lg text-[10px] font-mono text-emerald-400 border border-emerald-950/60">
                <div className="flex items-center gap-1 text-slate-500 mb-0.5">
                  <Terminal className="w-3 h-3" />
                  <span>Payload Frame (UART/RS-485 Modbus)</span>
                </div>
                <div className="truncate">{sensor.rawPayloadSample}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edge Gateway Topology Architecture */}
      <div className="bg-white dark:bg-[#11221C] rounded-2xl border border-slate-200 dark:border-emerald-950/40 p-5 shadow-xs">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
          IoT Subsystem Architecture & Fault Tolerance
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          Each JalRakshak borehole installation incorporates a solar-backed IP67 field node equipped with RS-485 Modbus RTU interface, continuous hydrostatic piezoresistive pressure transmitter, pulse electromagnetic flow sensor, and 4-electrode conductivity cell. Telemetry packets are encrypted via AES-128 and transmitted over LoRaWAN 865 MHz (India frequency plan) to the edge telemetry gateway with automatic local flash buffering during cellular backhaul outages.
        </p>
      </div>
    </div>
  );
};
