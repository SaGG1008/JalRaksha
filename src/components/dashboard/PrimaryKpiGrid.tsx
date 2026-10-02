import React from 'react';
import { ArrowDown, ArrowUp, Activity, Droplets, Zap, CheckCircle2 } from 'lucide-react';
import { useJalRakshak } from '../../context/JalRakshakContext';

export const PrimaryKpiGrid: React.FC = () => {
  const { selectedBorewell } = useJalRakshak();

  const extractionDiff = Math.round(
    ((selectedBorewell.todayExtractionLiters - selectedBorewell.averageExtractionLiters) /
      selectedBorewell.averageExtractionLiters) *
      100
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Water Level */}
      <div className="bg-white dark:bg-[#11221C] rounded-xl border border-slate-200 dark:border-emerald-950/40 p-4 shadow-xs relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 dark:text-emerald-500/70 mb-2">
          <span className="text-[11px] font-mono uppercase tracking-wider">
            GROUNDWATER LEVEL
          </span>
          <span className="w-2 h-2 rounded-full bg-[#168AAD]" />
        </div>

        <div className="mb-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono tabular-nums">
              {selectedBorewell.waterLevelMeters.toFixed(1)}
            </span>
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">m</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs mt-1">
            <span className="inline-flex items-center font-medium text-amber-600 dark:text-amber-400 font-mono">
              <ArrowDown className="w-3.5 h-3.5 mr-0.5" />
              {Math.abs(selectedBorewell.waterLevelDeltaToday).toFixed(1)} m
            </span>
            <span className="text-slate-400">today</span>
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <span className="text-slate-600 dark:text-slate-300 text-[11px]">
              {selectedBorewell.waterLevelDeltaToday < -0.5 ? 'Moderate decline' : 'Stable'}
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-emerald-950/60 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span>Expected range:</span>
          <span className="font-mono text-slate-700 dark:text-slate-300">
            {selectedBorewell.expectedLevelRange[0]}–{selectedBorewell.expectedLevelRange[1]} m
          </span>
        </div>
      </div>

      {/* 2. Today's Extraction */}
      <div className="bg-white dark:bg-[#11221C] rounded-xl border border-slate-200 dark:border-emerald-950/40 p-4 shadow-xs relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 dark:text-emerald-500/70 mb-2">
          <span className="text-[11px] font-mono uppercase tracking-wider">
            TODAY'S EXTRACTION
          </span>
          <Zap className="w-3.5 h-3.5 text-amber-500" />
        </div>

        <div className="mb-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono tabular-nums">
              {selectedBorewell.todayExtractionLiters.toLocaleString()}
            </span>
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">L</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs mt-1">
            <span
              className={`inline-flex items-center font-medium font-mono ${
                extractionDiff > 0
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {extractionDiff > 0 ? (
                <ArrowUp className="w-3.5 h-3.5 mr-0.5" />
              ) : (
                <ArrowDown className="w-3.5 h-3.5 mr-0.5" />
              )}
              {extractionDiff > 0 ? `+${extractionDiff}%` : `${extractionDiff}%`}
            </span>
            <span className="text-slate-400">vs avg</span>
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <span className="text-slate-600 dark:text-slate-300 text-[11px]">
              {selectedBorewell.pumpStatus === 'ON' ? 'Pump Active' : 'Pump Standby'}
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-emerald-950/60 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span>Current discharge:</span>
          <span className="font-mono text-slate-700 dark:text-slate-300">
            {selectedBorewell.flowRateLps} L/s ({selectedBorewell.pumpPowerKw} kW)
          </span>
        </div>
      </div>

      {/* 3. Recovery Rate */}
      <div className="bg-white dark:bg-[#11221C] rounded-xl border border-slate-200 dark:border-emerald-950/40 p-4 shadow-xs relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 dark:text-emerald-500/70 mb-2">
          <span className="text-[11px] font-mono uppercase tracking-wider">
            RECOVERY RATE
          </span>
          <Activity className="w-3.5 h-3.5 text-[#2E7D5B]" />
        </div>

        <div className="mb-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono tabular-nums">
              {selectedBorewell.recoveryRatePercent}
            </span>
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">%</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs mt-1">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
              Normal
            </span>
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <span className="text-slate-600 dark:text-slate-300 text-[11px]">
              Transmissivity stable
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-emerald-950/60 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span>Rebound velocity:</span>
          <span className="font-mono text-slate-700 dark:text-slate-300">
            0.42 m/hr post-cut
          </span>
        </div>
      </div>

      {/* 4. Water Quality */}
      <div className="bg-white dark:bg-[#11221C] rounded-xl border border-slate-200 dark:border-emerald-950/40 p-4 shadow-xs relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 dark:text-emerald-500/70 mb-2">
          <span className="text-[11px] font-mono uppercase tracking-wider">
            WATER QUALITY
          </span>
          <Droplets className="w-3.5 h-3.5 text-[#168AAD]" />
        </div>

        <div className="mb-2">
          <div className="flex items-baseline gap-1.5">
            <span
              className={`text-2xl font-extrabold tracking-tight font-mono ${
                selectedBorewell.tdsPpm > 600
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {selectedBorewell.tdsPpm > 600 ? 'ELEVATED' : 'NORMAL'}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs mt-1 font-mono">
            <span className="text-slate-700 dark:text-slate-300 font-medium">
              TDS {selectedBorewell.tdsPpm} ppm
            </span>
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <span className="text-slate-500 dark:text-slate-400">
              pH {selectedBorewell.ph}
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-emerald-950/60 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span>Temperature:</span>
          <span className="font-mono text-slate-700 dark:text-slate-300">
            {selectedBorewell.temperatureC}°C ({selectedBorewell.conductivityUsCm} µS/cm)
          </span>
        </div>
      </div>
    </div>
  );
};
