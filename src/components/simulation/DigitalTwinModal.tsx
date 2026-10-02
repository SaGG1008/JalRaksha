import React, { useState } from 'react';
import {
  X,
  Zap,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Droplets,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { useJalRakshak } from '../../context/JalRakshakContext';
import { SIMULATION_SCENARIOS } from '../../data/initialData';
import { SimulationScenarioId } from '../../types';

export const DigitalTwinModal: React.FC = () => {
  const {
    isSimModalOpen,
    setIsSimModalOpen,
    isSimulating,
    activeScenario,
    runSimulation,
    resetSimulation,
    setActiveTab,
  } = useJalRakshak();

  const [selectedScenarioId, setSelectedScenarioId] = useState<SimulationScenarioId>(
    activeScenario || 'high_extraction'
  );

  if (!isSimModalOpen) return null;

  const currentScenario = SIMULATION_SCENARIOS[selectedScenarioId];

  const scenariosList = [
    {
      id: 'normal' as SimulationScenarioId,
      title: 'Normal Operation',
      badge: 'Baseline',
      icon: CheckCircle2,
      color: 'text-emerald-500',
      desc: 'Balanced diurnal extraction with overnight hydrostatic aquifer recovery.',
    },
    {
      id: 'high_extraction' as SimulationScenarioId,
      title: 'High Extraction Surge',
      badge: 'Warning',
      icon: Flame,
      color: 'text-amber-500',
      desc: 'Rapid water level decline (1.4m) exceeding seasonal safe yield.',
    },
    {
      id: 'poor_recovery' as SimulationScenarioId,
      title: 'Poor Aquifer Recovery',
      badge: 'Warning',
      icon: Activity,
      color: 'text-amber-500',
      desc: 'Slow recharge curve following pump shutdown; localized aquifer exhaustion.',
    },
    {
      id: 'pump_fault' as SimulationScenarioId,
      title: 'Pump Cavitation & Dry Run',
      badge: 'Critical',
      icon: AlertTriangle,
      color: 'text-rose-500',
      desc: 'Motor drawing electrical current but zero hydraulic discharge.',
    },
    {
      id: 'water_quality_spike' as SimulationScenarioId,
      title: 'Water Quality Anomaly',
      badge: 'Critical',
      icon: Droplets,
      color: 'text-rose-500',
      desc: 'Sudden spike in TDS (892 ppm) from agricultural/saline seepage.',
    },
  ];

  const handleStart = () => {
    runSimulation(selectedScenarioId);
    setIsSimModalOpen(false);
  };

  const handleReset = () => {
    resetSimulation();
    setIsSimModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#11221C] rounded-2xl border border-slate-200 dark:border-emerald-900/60 max-w-2xl w-full p-6 shadow-2xl overflow-hidden relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-emerald-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 dark:text-emerald-500/70">
                TECHFEST INNOVATEX DEMO ENGINE
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Digital Twin Hydrological Simulator
              </h2>
            </div>
          </div>

          <button
            onClick={() => setIsSimModalOpen(false)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pipeline Concept Breadcrumb */}
        <div className="my-4 p-3 bg-slate-50 dark:bg-[#0B1512] rounded-xl border border-slate-200/80 dark:border-emerald-950/60">
          <div className="text-[10px] font-mono uppercase text-slate-400 text-center mb-1.5">
            Real-time Pipeline Cascade
          </div>
          <div className="flex items-center justify-between text-xs font-mono font-medium text-slate-600 dark:text-slate-300">
            <span>Sensors</span>
            <span className="text-slate-300 dark:text-slate-700">→</span>
            <span>IoT Telemetry</span>
            <span className="text-slate-300 dark:text-slate-700">→</span>
            <span>Live Data</span>
            <span className="text-slate-300 dark:text-slate-700">→</span>
            <span>Analytics</span>
            <span className="text-slate-300 dark:text-slate-700">→</span>
            <span className="text-amber-500">Anomaly</span>
            <span className="text-slate-300 dark:text-slate-700">→</span>
            <span className="text-emerald-500">Action</span>
          </div>
        </div>

        {/* Scenario Selection Grid */}
        <div className="space-y-2 mb-5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
            Select Evaluation Scenario:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {scenariosList.map((sc) => {
              const Icon = sc.icon;
              const isSelected = selectedScenarioId === sc.id;
              return (
                <div
                  key={sc.id}
                  onClick={() => setSelectedScenarioId(sc.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[#168AAD] dark:border-[#78E08F] bg-[#168AAD]/5 dark:bg-[#78E08F]/10 ring-1 ring-[#168AAD] dark:ring-[#78E08F]'
                      : 'border-slate-200 dark:border-emerald-950/60 hover:bg-slate-50 dark:hover:bg-emerald-950/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 font-semibold text-xs text-slate-900 dark:text-white">
                      <Icon className={`w-3.5 h-3.5 ${sc.color}`} />
                      <span>{sc.title}</span>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {sc.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {sc.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scenario Impact Preview */}
        {currentScenario && (
          <div className="p-3.5 bg-slate-50 dark:bg-[#0B1512]/60 rounded-xl border border-slate-200/80 dark:border-emerald-950/60 mb-5 text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-900 dark:text-white">
                Expected Simulation Cascade
              </span>
              <span className="text-[10px] font-mono text-slate-400">Target: BWL-03</span>
            </div>
            <div className="space-y-1.5 text-slate-600 dark:text-slate-300">
              <div className="flex items-start gap-2">
                <span className="text-slate-400 font-mono text-[11px] shrink-0">Trigger:</span>
                <span>{currentScenario.whyText}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-slate-400 font-mono text-[11px] shrink-0">Mitigation:</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                  {currentScenario.prescribedAction}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 pt-2">
          {isSimulating ? (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-emerald-950/40 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Live Telemetry</span>
            </button>
          ) : (
            <span className="text-xs text-slate-400">
              Modifies physical twin variables in real-time
            </span>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSimModalOpen(false)}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-emerald-950/40 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleStart}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-[#168AAD] to-[#2E7D5B] hover:opacity-90 transition-opacity shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start Simulation</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
