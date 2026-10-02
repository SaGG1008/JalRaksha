import React, { useState } from 'react';
import { CloudRain, Droplet, ArrowDown, ShieldCheck, CheckCircle2, Waves, ArrowRight, Sparkles } from 'lucide-react';
import { useJalRakshak } from '../context/JalRakshakContext';

export const RechargePage: React.FC = () => {
  const { recharge } = useJalRakshak();
  const [catchmentSqMeters, setCatchmentSqMeters] = useState<number>(1200);

  // Calculate runoff harvest potential: Volume = Catchment Area (m²) * Rainfall (m) * Runoff Coeff (0.85 for concrete roof)
  const rainfallMeters = recharge.recentRainfallMm / 1000;
  const runoffHarvestLiters = Math.round(catchmentSqMeters * rainfallMeters * 0.85 * 1000);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-emerald-950/60">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 dark:text-emerald-500/70">
            AQUIFER REPLENISHMENT ADVISORY
          </span>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Recharge Intelligence & Managed Aquifer Recharge (MAR)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Algorithmic infiltration modeling correlating surface precipitation, vadose saturation, and available storage volume
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800/40">
          <CloudRain className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Precipitation Event Active ({recharge.recentRainfallMm} mm)</span>
        </div>
      </div>

      {/* Hero Card (Matches Section 16 specification) */}
      <div className="bg-white dark:bg-[#11221C] rounded-2xl border border-emerald-500/30 dark:border-emerald-900/50 p-6 shadow-xs relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left score display */}
          <div className="lg:col-span-4 flex flex-col items-center sm:items-start border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-emerald-950/60 pb-6 lg:pb-0 lg:pr-6">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 dark:text-emerald-500/70 mb-1">
              RECHARGE OPPORTUNITY
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-extrabold font-mono text-[#2E7D5B] dark:text-[#78E08F] tabular-nums">
                {recharge.opportunityScore}%
              </span>
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 mt-1">
              {recharge.rating}
            </div>
            <span className="text-[11px] text-slate-400 mt-1">
              Vadose capacity available for deep infiltration
            </span>
          </div>

          {/* Center: Hydrological Causal Pipeline */}
          <div className="lg:col-span-8 space-y-4">
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Infiltration Causal Analysis:
            </div>

            {/* Infiltration Equation Box */}
            <div className="p-3 bg-slate-50 dark:bg-[#0B1512]/60 rounded-xl border border-slate-100 dark:border-emerald-950/50 text-xs font-mono">
              <div className="flex flex-wrap items-center justify-between gap-2 text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-1.5">
                  <CloudRain className="w-4 h-4 text-[#168AAD]" />
                  <span>Recent rainfall ({recharge.recentRainfallMm} mm)</span>
                </div>
                <span className="text-slate-400 font-bold">+</span>
                <div className="flex items-center gap-1.5">
                  <Waves className="w-4 h-4 text-[#2E7D5B]" />
                  <span>Moderate groundwater level (18.4 m)</span>
                </div>
                <span className="text-slate-400 font-bold">+</span>
                <div className="flex items-center gap-1.5">
                  <Droplet className="w-4 h-4 text-emerald-500" />
                  <span>High infiltration potential ({recharge.infiltrationRateMmHr} mm/hr)</span>
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-slate-200 dark:border-emerald-950/60 flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold">
                <span className="text-slate-400">↓</span>
                <span>Recharge opportunity detected: Aquifer storage capacity {recharge.unsaturatedZoneStorageCapacityM3.toLocaleString()} m³</span>
              </div>
            </div>

            {/* Prescriptive Recommendation (Strictly factual) */}
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-500/20 text-xs">
              <div className="font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider font-mono text-[10px] mb-1">
                RECOMMENDED ACTION
              </div>
              <p className="text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                {recharge.recommendedAction}
              </p>
              <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                <strong>Expected benefit: </strong> Improved aquifer replenishment and reduced cones of depression without artificial pumping interlock.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Catchment Runoff Routing Estimator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white dark:bg-[#11221C] rounded-2xl border border-slate-200 dark:border-emerald-950/40 p-5 shadow-xs">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
            Catchment Runoff Harvest Calculator
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Simulate routing stormwater toward dedicated aquifer percolation structures
          </p>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between font-mono mb-1.5">
                <span className="text-slate-500">Rooftop Catchment Area</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{catchmentSqMeters} m²</span>
              </div>
              <input
                type="range"
                min="200"
                max="5000"
                step="100"
                value={catchmentSqMeters}
                onChange={(e) => setCatchmentSqMeters(Number(e.target.value))}
                className="w-full accent-[#2E7D5B]"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B1512]/60 border border-slate-100 dark:border-emerald-950/50 space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Precipitation Input</span>
                <span className="text-slate-700 dark:text-slate-300">{recharge.recentRainfallMm} mm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Runoff Coefficient (C)</span>
                <span className="text-slate-700 dark:text-slate-300">0.85 (Reinforced Concrete)</span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-emerald-950/60 flex justify-between items-baseline">
                <span className="font-semibold text-slate-900 dark:text-white">Harvestable Yield</span>
                <span className="text-lg font-bold text-[#168AAD] dark:text-[#78E08F]">
                  {runoffHarvestLiters.toLocaleString()} Liters
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Available Recharge Structures Table */}
        <div className="lg:col-span-7 bg-white dark:bg-[#11221C] rounded-2xl border border-slate-200 dark:border-emerald-950/40 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100 dark:border-emerald-950/60">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Connected Aquifer Recharge Structures
            </h3>
            <span className="text-xs font-mono text-slate-400">3 Intake Nodes Active</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-200 dark:border-emerald-950/60 text-slate-400 text-[10px] uppercase">
                  <th className="py-2 px-3">Structure Name</th>
                  <th className="py-2 px-3">Type</th>
                  <th className="py-2 px-3">Max Intake</th>
                  <th className="py-2 px-3">Readiness</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-emerald-950/40">
                {recharge.rechargeStructuresAvailable.map((s, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-emerald-950/20">
                    <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">
                      {s.name}
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      {s.type}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-700 dark:text-slate-300">
                      {s.intakeLph.toLocaleString()} L/hr
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                          s.status === 'Ready'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                            : 'bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
