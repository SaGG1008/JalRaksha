import React, { useState } from 'react';
import { Waves, ArrowDown, ArrowUp, Info, Activity, Layers, Droplet } from 'lucide-react';
import { useJalRakshak } from '../context/JalRakshakContext';
import { BorewellCrossSection } from '../components/groundwater/BorewellCrossSection';
import { GroundwaterLevelChart } from '../components/groundwater/GroundwaterLevelChart';

export const GroundwaterPage: React.FC = () => {
  const { selectedBorewell } = useJalRakshak();
  const [selectedHorizon, setSelectedHorizon] = useState<'all' | 'unconfined' | 'semi-confined'>('all');

  return (
    <div className="space-y-6">
      {/* Title & Hydrogeological Context */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-emerald-950/60">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 dark:text-emerald-500/70">
            AQUIFER DEPTH & STRATIGRAPHY
          </span>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Groundwater Dynamics & Subsurface Hydrogeology
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Continuous hydrostatic pressure head monitoring across {selectedBorewell.name}
          </p>
        </div>

        {/* Aquifer classification badge */}
        <div className="flex items-center gap-2 text-xs font-mono bg-white dark:bg-[#11221C] px-3 py-2 rounded-xl border border-slate-200 dark:border-emerald-950/60">
          <Layers className="w-4 h-4 text-[#168AAD]" />
          <div>
            <span className="text-slate-400 block text-[10px]">AQUIFER MATRIX</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {selectedBorewell.aquiferType}
            </span>
          </div>
        </div>
      </div>

      {/* Main Hydrological Cross Section & Chart Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-5">
          <BorewellCrossSection />
        </div>
        <div className="xl:col-span-7 space-y-6">
          <GroundwaterLevelChart />

          {/* Hydrogeological Parameters Card */}
          <div className="bg-white dark:bg-[#11221C] rounded-2xl border border-slate-200 dark:border-emerald-950/40 p-5 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-400 dark:text-emerald-500/70 mb-3">
              Subsurface Aquifer Parameters
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B1512]/60 border border-slate-100 dark:border-emerald-950/50">
                <span className="text-[10px] text-slate-400 block uppercase">TRANSMISSIVITY (T)</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  145 m²/day
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Fractured basalt</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B1512]/60 border border-slate-100 dark:border-emerald-950/50">
                <span className="text-[10px] text-slate-400 block uppercase">STORAGE COEFF (S)</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  0.018
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Semi-confined</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B1512]/60 border border-slate-100 dark:border-emerald-950/50">
                <span className="text-[10px] text-slate-400 block uppercase">SPECIFIC CAPACITY</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  42.8 Lpm/m
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Discharge per drawdown</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B1512]/60 border border-slate-100 dark:border-emerald-950/50">
                <span className="text-[10px] text-slate-400 block uppercase">CONE INFLUENCE (R)</span>
                <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                  185 m radius
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Active depression</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-emerald-950/60 flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Info className="w-4 h-4 text-[#168AAD] shrink-0 mt-0.5" />
              <span>
                Hydrostatic equilibrium is maintained when diurnal pumping does not exceed 4.8 hours continuous run. At current extraction velocity, the cone of depression intersects adjacent monitoring observation piezometer BWL-04 by 14%.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
