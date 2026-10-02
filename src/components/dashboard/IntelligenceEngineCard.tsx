import React from 'react';
import { Cpu, ArrowRight, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { useJalRakshak } from '../../context/JalRakshakContext';

export const IntelligenceEngineCard: React.FC = () => {
  const { anomalies, setActiveTab, setActiveInvestigateAnomaly } = useJalRakshak();
  const activeAnomaly = anomalies.find((a) => a.status === 'active');

  if (!activeAnomaly) {
    return (
      <div className="bg-white dark:bg-[#11221C] rounded-2xl border border-slate-200 dark:border-emerald-950/40 p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-emerald-950/60 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 dark:text-emerald-500/70">
              HYDROLOGICAL INFERENCE
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 font-semibold">
              Nominal
            </span>
          </div>
          <span className="text-xs font-mono text-slate-400">Model Confidence: 94%</span>
        </div>

        <div className="flex items-center gap-3 py-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              No Active Anomalies Detected
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
              All monitored hydrological and hydraulic parameters for this borewell node are tracking within their 95% confidence intervals.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#11221C] rounded-2xl border border-amber-300 dark:border-amber-900/40 p-5 shadow-xs relative overflow-hidden">
      {/* Top subtle alert stripe */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-[#168AAD] to-[#2E7D5B]" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-emerald-950/60 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-amber-700 dark:text-amber-400 font-bold">
            INTELLIGENCE ENGINE
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 font-semibold">
            ANOMALY DETECTED
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500 dark:text-slate-400">
          <span>Confidence:</span>
          <strong className="text-slate-900 dark:text-white">{activeAnomaly.confidenceScore}%</strong>
        </div>
      </div>

      {/* Diagnostic Explanation Body */}
      <div className="space-y-3">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {activeAnomaly.title}
            </h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
            {activeAnomaly.whyExplanation}
          </p>
        </div>

        {/* Observed vs Expected Comparison Grid */}
        <div className="grid grid-cols-2 gap-3 p-3 bg-amber-50/50 dark:bg-[#0B1512]/60 rounded-xl border border-amber-200/60 dark:border-amber-950/50 text-xs font-mono">
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">OBSERVED EXTRACTION</span>
            <span className="text-sm font-bold text-amber-700 dark:text-amber-400">
              {activeAnomaly.actualValue}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">EXPECTED BASELINE</span>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              {activeAnomaly.expectedValue}
            </span>
          </div>
        </div>

        {/* Potential Impact & Recommended Action */}
        <div className="text-xs space-y-1.5 pt-1">
          <div className="flex items-start gap-1.5">
            <span className="text-slate-400 shrink-0 font-medium">Potential Impact:</span>
            <span className="text-slate-700 dark:text-slate-300">
              {activeAnomaly.potentialImpact}
            </span>
          </div>
          <div className="flex items-start gap-1.5">
            <span className="text-slate-400 shrink-0 font-medium">Action:</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-medium">
              {activeAnomaly.recommendedAction}
            </span>
          </div>
        </div>

        {/* Action Link Button */}
        <div className="pt-2 flex items-center justify-end">
          <button
            onClick={() => {
              setActiveInvestigateAnomaly(activeAnomaly);
              setActiveTab('anomalies');
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#168AAD] dark:text-[#78E08F] hover:underline"
          >
            <span>View Root Cause Analysis</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
