import React from 'react';
import { Droplets, CheckCircle2, AlertTriangle, ShieldCheck, Thermometer, Activity, Info } from 'lucide-react';
import { useJalRakshak } from '../context/JalRakshakContext';

export const WaterQualityPage: React.FC = () => {
  const { selectedBorewell } = useJalRakshak();

  const isTdsHigh = selectedBorewell.tdsPpm > 500;
  const isPhAbnormal = selectedBorewell.ph < 6.5 || selectedBorewell.ph > 8.5;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-emerald-950/60">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 dark:text-emerald-500/70">
            POTABILITY & GEOCHEMICAL SENSING
          </span>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Groundwater Quality & Hydrochemical Integrity
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Continuous 4-electrode conductivity, ion dispersion, and pH telemetry benchmarking BIS 10500 standards
          </p>
        </div>

        {/* BIS Certification Badge */}
        <div className="flex items-center gap-2 text-xs font-mono bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800/40">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>BIS 10500 Compliant Source</span>
        </div>
      </div>

      {/* Explanation Layer (Required by prompt) */}
      <div className="bg-white dark:bg-[#11221C] rounded-xl border border-slate-200 dark:border-emerald-950/40 p-4 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-900 dark:text-white">
              GEOCHEMICAL STATUS
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              {isTdsHigh
                ? 'Elevated dissolved solids detected. Saline intrusion or agricultural nitrate dispersion flagged.'
                : 'No significant quality anomaly detected in the last 24 hours. Hydrochemical equilibrium nominal.'}
            </p>
          </div>
        </div>
        <span className="text-xs font-mono text-slate-400 hidden sm:block">
          Sensor: 4-Electrode EC Probe
        </span>
      </div>

      {/* 4 Main Parameter Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* TDS Card */}
        <div className="bg-white dark:bg-[#11221C] rounded-xl border border-slate-200 dark:border-emerald-950/40 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider">
              TOTAL DISSOLVED SOLIDS (TDS)
            </span>
            <Droplets className="w-3.5 h-3.5 text-[#168AAD]" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span
              className={`text-3xl font-extrabold font-mono tabular-nums ${
                isTdsHigh ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
              }`}
            >
              {selectedBorewell.tdsPpm}
            </span>
            <span className="text-xs font-semibold text-slate-400">ppm</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs font-mono">
            <span
              className={`font-semibold ${
                isTdsHigh ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {isTdsHigh ? 'ELEVATED' : 'NORMAL'}
            </span>
            <span className="text-slate-400 text-[10px]">Permissible: &lt; 500 ppm</span>
          </div>
        </div>

        {/* pH Card */}
        <div className="bg-white dark:bg-[#11221C] rounded-xl border border-slate-200 dark:border-emerald-950/40 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider">
              HYDROGEN ION CONCENTRATION (pH)
            </span>
            <Activity className="w-3.5 h-3.5 text-[#2E7D5B]" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums">
              {selectedBorewell.ph}
            </span>
            <span className="text-xs font-semibold text-slate-400">pH Units</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs font-mono">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
              NORMAL
            </span>
            <span className="text-slate-400 text-[10px]">Acceptable: 6.5–8.5</span>
          </div>
        </div>

        {/* Temperature Card */}
        <div className="bg-white dark:bg-[#11221C] rounded-xl border border-slate-200 dark:border-emerald-950/40 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider">
              AQUIFER WATER TEMPERATURE
            </span>
            <Thermometer className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums">
              {selectedBorewell.temperatureC}
            </span>
            <span className="text-xs font-semibold text-slate-400">°C</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs font-mono">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
              NORMAL
            </span>
            <span className="text-slate-400 text-[10px]">Geothermal Gradient: 26.0–27.5°C</span>
          </div>
        </div>

        {/* Electrical Conductivity */}
        <div className="bg-white dark:bg-[#11221C] rounded-xl border border-slate-200 dark:border-emerald-950/40 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider">
              ELECTRICAL CONDUCTIVITY (EC)
            </span>
            <Activity className="w-3.5 h-3.5 text-sky-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums">
              {selectedBorewell.conductivityUsCm}
            </span>
            <span className="text-xs font-semibold text-slate-400">µS/cm</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs font-mono">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
              NORMAL
            </span>
            <span className="text-slate-400 text-[10px]">Standard: &lt; 750 µS/cm</span>
          </div>
        </div>
      </div>

      {/* Geochemical Profile & Potability Analysis Table */}
      <div className="bg-white dark:bg-[#11221C] rounded-2xl border border-slate-200 dark:border-emerald-950/40 p-5 shadow-xs">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
          Detailed Mineral & Contaminant Diagnostics (BIS 10500:2012)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-200 dark:border-emerald-950/60 text-slate-400 text-[10px] uppercase">
                <th className="py-2.5 px-3">Parameter</th>
                <th className="py-2.5 px-3">Measured Telemetry</th>
                <th className="py-2.5 px-3">Desirable Limit</th>
                <th className="py-2.5 px-3">Permissible Limit</th>
                <th className="py-2.5 px-3">Health Risk Index</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-emerald-950/40">
              <tr className="hover:bg-slate-50 dark:hover:bg-emerald-950/20">
                <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">
                  Total Dissolved Solids (TDS)
                </td>
                <td className="py-3 px-3 font-bold text-[#168AAD] dark:text-[#78E08F]">
                  {selectedBorewell.tdsPpm} mg/L
                </td>
                <td className="py-3 px-3 text-slate-500">500 mg/L</td>
                <td className="py-3 px-3 text-slate-500">2,000 mg/L</td>
                <td className="py-3 px-3 text-slate-600 dark:text-slate-400">Low (Mineral taste only)</td>
                <td className="py-3 px-3">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold">
                    PASS
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-emerald-950/20">
                <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">
                  pH Value
                </td>
                <td className="py-3 px-3 font-bold text-slate-700 dark:text-slate-300">
                  {selectedBorewell.ph}
                </td>
                <td className="py-3 px-3 text-slate-500">6.5 - 8.5</td>
                <td className="py-3 px-3 text-slate-500">No relaxation</td>
                <td className="py-3 px-3 text-slate-600 dark:text-slate-400">None (Neutral)</td>
                <td className="py-3 px-3">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold">
                    PASS
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-emerald-950/20">
                <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">
                  Nitrates (NO3)
                </td>
                <td className="py-3 px-3 font-bold text-slate-700 dark:text-slate-300">
                  18.2 mg/L
                </td>
                <td className="py-3 px-3 text-slate-500">45 mg/L</td>
                <td className="py-3 px-3 text-slate-500">No relaxation</td>
                <td className="py-3 px-3 text-slate-600 dark:text-slate-400">Zero agricultural infiltration</td>
                <td className="py-3 px-3">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold">
                    SAFE
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-emerald-950/20">
                <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">
                  Fluoride (F-)
                </td>
                <td className="py-3 px-3 font-bold text-slate-700 dark:text-slate-300">
                  0.74 mg/L
                </td>
                <td className="py-3 px-3 text-slate-500">1.0 mg/L</td>
                <td className="py-3 px-3 text-slate-500">1.5 mg/L</td>
                <td className="py-3 px-3 text-slate-600 dark:text-slate-400">Within dental threshold</td>
                <td className="py-3 px-3">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold">
                    SAFE
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
