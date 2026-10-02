import React from 'react';
import { Zap, Power, Gauge, TrendingUp, AlertTriangle, Clock, BarChart3, CheckCircle2 } from 'lucide-react';
import { useJalRakshak } from '../context/JalRakshakContext';
import { PUMP_INTERVALS_7DAYS } from '../data/initialData';

export const ExtractionPage: React.FC = () => {
  const { selectedBorewell, togglePump } = useJalRakshak();
  const isPumpOn = selectedBorewell.pumpStatus === 'ON';
  const isPumpFault = selectedBorewell.pumpStatus === 'FAULT';

  const extractionQuota = 3500; // Permitted daily extraction limit in liters
  const quotaUsagePct = Math.min(100, Math.round((selectedBorewell.todayExtractionLiters / extractionQuota) * 100));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-emerald-950/60">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 dark:text-emerald-500/70">
            EXTRACTION TELEMETRY & DISCHARGE
          </span>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Pump Operations & Volume Accounting
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time electromagnetic flow metering, electrical current draw, and quota governance
          </p>
        </div>

        {/* Remote Pump Control Button */}
        <button
          onClick={() => togglePump()}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
            isPumpFault
              ? 'bg-rose-500 text-white'
              : isPumpOn
              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
              : 'bg-slate-200 dark:bg-emerald-950 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-emerald-900'
          }`}
        >
          <Power className="w-4 h-4" />
          <span>PUMP STATE: {selectedBorewell.pumpStatus} (CLICK TO TOGGLE)</span>
        </button>
      </div>

      {/* Primary Extraction KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cumulative Extraction */}
        <div className="bg-white dark:bg-[#11221C] rounded-xl border border-slate-200 dark:border-emerald-950/40 p-4 shadow-xs">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
            TODAY'S CUMULATIVE DRAW
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums">
              {selectedBorewell.todayExtractionLiters.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 font-semibold">Liters</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-500">Daily Quota:</span>
            <span className="text-slate-700 dark:text-slate-300">{extractionQuota.toLocaleString()} L</span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-100 dark:bg-emerald-950/60 rounded-full h-1.5 mt-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                quotaUsagePct > 90 ? 'bg-rose-500' : quotaUsagePct > 75 ? 'bg-amber-500' : 'bg-[#168AAD]'
              }`}
              style={{ width: `${quotaUsagePct}%` }}
            />
          </div>
        </div>

        {/* Live Flow Rate */}
        <div className="bg-white dark:bg-[#11221C] rounded-xl border border-slate-200 dark:border-emerald-950/40 p-4 shadow-xs">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
            INSTANTANEOUS FLOW RATE
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums">
              {selectedBorewell.flowRateLps}
            </span>
            <span className="text-xs text-slate-400 font-semibold">L/sec</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-mono">
            {isPumpOn ? 'Discharge manifold active' : 'Zero flow / Pump idle'}
          </div>
        </div>

        {/* Electrical Load & Current */}
        <div className="bg-white dark:bg-[#11221C] rounded-xl border border-slate-200 dark:border-emerald-950/40 p-4 shadow-xs">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
            PUMP POWER & MOTOR CURRENT
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums">
              {isPumpOn ? selectedBorewell.pumpPowerKw : 0.0}
            </span>
            <span className="text-xs text-slate-400 font-semibold">kW</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-mono">
            {isPumpOn ? '10.4 A @ 415V 3-Phase' : '0.0 A Standby draw'}
          </div>
        </div>

        {/* Specific Energy */}
        <div className="bg-white dark:bg-[#11221C] rounded-xl border border-slate-200 dark:border-emerald-950/40 p-4 shadow-xs">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
            ENERGY INTENSITY
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums">
              0.45
            </span>
            <span className="text-xs text-slate-400 font-semibold">kWh / m³</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-medium">
            High efficiency hydraulic lift
          </div>
        </div>
      </div>

      {/* Historical Duty Cycles & Pumping Intervals */}
      <div className="bg-white dark:bg-[#11221C] rounded-2xl border border-slate-200 dark:border-emerald-950/40 p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-emerald-950/60 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Diurnal Pumping Sessions & Recovery Telemetry
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Correlating extraction duration with aquifer drawdown depth and recovery time
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">CGWB Safe Yield Compliant</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-200 dark:border-emerald-950/60 text-slate-400 text-[10px] uppercase">
                <th className="py-2.5 px-3">Session ID</th>
                <th className="py-2.5 px-3">Start - End</th>
                <th className="py-2.5 px-3">Duration</th>
                <th className="py-2.5 px-3">Volume Extracted</th>
                <th className="py-2.5 px-3">Cone Drawdown</th>
                <th className="py-2.5 px-3">Aquifer Rebound</th>
                <th className="py-2.5 px-3">Hydraulic Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-emerald-950/40">
              {PUMP_INTERVALS_7DAYS.map((interval) => (
                <tr key={interval.id} className="hover:bg-slate-50 dark:hover:bg-emerald-950/20">
                  <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">
                    {interval.id}
                  </td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                    {interval.startTime} – {interval.endTime}
                  </td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                    {interval.durationMinutes} mins
                  </td>
                  <td className="py-3 px-3 font-bold text-[#168AAD] dark:text-[#78E08F]">
                    {interval.totalExtractedLiters.toLocaleString()} L
                  </td>
                  <td className="py-3 px-3 text-amber-600 dark:text-amber-400">
                    ↓ {interval.drawdownMeters} m
                  </td>
                  <td className="py-3 px-3 text-emerald-600 dark:text-emerald-400">
                    {interval.recoveryTimeMinutes} mins (Full rebound)
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold">
                      NOMINAL
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
