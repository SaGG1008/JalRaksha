import React from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Zap,
  Droplets,
  Activity,
  ArrowRight,
  Sliders,
  Power,
  RefreshCw,
} from 'lucide-react';
import { useJalRakshak } from '../../context/JalRakshakContext';

export const SystemStatePanel: React.FC = () => {
  const {
    selectedBorewell,
    anomalies,
    togglePump,
    setActiveInvestigateAnomaly,
    setActiveTab,
    liveTick,
  } = useJalRakshak();

  const isHealthy = selectedBorewell.healthScore >= 80;
  const isModerate = selectedBorewell.healthScore >= 65 && selectedBorewell.healthScore < 80;
  const activeAnomaly = anomalies.find((a) => a.borewellId === selectedBorewell.id && a.status === 'active');

  return (
    <div className="bg-[#0B1512] text-slate-100 rounded-3xl border border-emerald-950/60 p-5 shadow-2xl flex flex-col justify-between space-y-4">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-emerald-950/80 mb-3">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-500/70 block">
              AQUIFER HEALTH AUDIT
            </span>
            <h2 className="text-sm font-bold text-white font-mono">
              SYSTEM STATE
            </h2>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            {selectedBorewell.id}
          </span>
        </div>

        {/* Overall Health Verdict Banner */}
        <div className="p-4 rounded-2xl bg-[#0e1d17] border border-emerald-900/50 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isHealthy ? (
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              )}
              <span className="text-xs font-bold font-mono tracking-wide text-white uppercase">
                {selectedBorewell.healthStatusText}
              </span>
            </div>
            <div className="flex items-baseline font-mono">
              <span className="text-3xl font-extrabold text-[#78E08F] tabular-nums">
                {selectedBorewell.healthScore}
              </span>
              <span className="text-xs font-semibold text-slate-400 ml-1">/ 100</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
            {isHealthy
              ? 'Aquifer storage and diurnal recovery within sustainable safe yield parameters.'
              : 'Localized cone of depression deepening. Rebound velocity requires duty-cycle throttling.'}
          </p>
        </div>

        {/* Core State Parameters List (Prompt format: Water level, Extraction, Recovery, Quality) */}
        <div className="mt-4 space-y-2.5 font-mono text-xs">
          {/* Water Level */}
          <div className="p-2.5 rounded-xl bg-[#0e1d17] border border-emerald-950/60 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">WATER LEVEL</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-lg font-bold text-[#38BDF8]">{selectedBorewell.waterLevelMeters.toFixed(1)} m</span>
                <span className="text-[10px] text-amber-400 font-normal">↓ 0.8m today</span>
              </div>
            </div>
            <span className="text-[10px] text-slate-500 text-right">
              Safe: {selectedBorewell.expectedLevelRange[0]}–{selectedBorewell.expectedLevelRange[1]}m
            </span>
          </div>

          {/* Extraction */}
          <div className="p-2.5 rounded-xl bg-[#0e1d17] border border-emerald-950/60 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">EXTRACTION</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-lg font-bold text-white">{selectedBorewell.todayExtractionLiters.toLocaleString()} L</span>
                <span className="text-[10px] text-amber-400 font-normal">+8.2% vs avg</span>
              </div>
            </div>
            <span className="text-[10px] text-slate-500 text-right">
              {selectedBorewell.flowRateLps} L/s Discharge
            </span>
          </div>

          {/* Recovery Rate */}
          <div className="p-2.5 rounded-xl bg-[#0e1d17] border border-emerald-950/60 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">RECOVERY RATE</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-lg font-bold text-[#78E08F]">{selectedBorewell.recoveryRatePercent}%</span>
                <span className="text-[10px] text-emerald-400 font-normal">Normal</span>
              </div>
            </div>
            <span className="text-[10px] text-slate-500 text-right">
              0.42 m/hr rebound
            </span>
          </div>

          {/* Water Quality */}
          <div className="p-2.5 rounded-xl bg-[#0e1d17] border border-emerald-950/60 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">WATER QUALITY</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-sm font-bold text-emerald-400 uppercase">NORMAL</span>
                <span className="text-[10px] text-slate-300 font-normal">TDS {selectedBorewell.tdsPpm} ppm</span>
              </div>
            </div>
            <span className="text-[10px] text-slate-500 text-right">
              pH {selectedBorewell.ph} · BIS 10500 Pass
            </span>
          </div>
        </div>

        {/* Compact Integrated Anomaly Explanation (Section 13 in prompt) */}
        {activeAnomaly && (
          <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-mono space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                <span>RAPID DRAWDOWN DETECTED</span>
              </span>
              <span className="text-[10px] text-slate-400">Confidence: {activeAnomaly.confidenceScore}%</span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-300">
              <span>Observed: <strong className="text-amber-300">1.4 m</strong></span>
              <span>Expected: <strong className="text-slate-400">0.5 m</strong></span>
            </div>
            <p className="text-[10px] text-slate-300 font-sans leading-relaxed pt-1 border-t border-amber-500/20">
              Pump duty cycle is 31% above the historical diurnal envelope. Throttling recommended.
            </p>
            <div className="pt-1 flex justify-end">
              <button
                onClick={() => setActiveInvestigateAnomaly(activeAnomaly)}
                className="text-[11px] text-amber-300 hover:text-white font-bold flex items-center gap-1"
              >
                <span>Investigate Root Cause</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Action Strip at Bottom */}
      <div className="pt-2 border-t border-emerald-950/80 flex items-center justify-between gap-2">
        <button
          onClick={() => togglePump()}
          className="flex-1 py-2 px-3 rounded-xl bg-[#16382B] hover:bg-emerald-900 text-white font-mono text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
        >
          <Power className="w-3.5 h-3.5 text-emerald-400" />
          <span>Toggle Pump</span>
        </button>

        <button
          onClick={() => setActiveTab('recharge')}
          className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-mono text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-emerald-950/60"
        >
          <Droplets className="w-3.5 h-3.5 text-[#168AAD]" />
          <span>Recharge MAR</span>
        </button>
      </div>
    </div>
  );
};
