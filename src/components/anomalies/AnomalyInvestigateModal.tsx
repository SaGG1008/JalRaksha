import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Gauge,
  Sliders,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { useJalRakshak } from '../../context/JalRakshakContext';

export const AnomalyInvestigateModal: React.FC = () => {
  const {
    activeInvestigateAnomaly,
    setActiveInvestigateAnomaly,
    resolveAnomaly,
    togglePump,
  } = useJalRakshak();

  const [isMitigating, setIsMitigating] = useState(false);
  const [mitigationApplied, setMitigationApplied] = useState(false);

  if (!activeInvestigateAnomaly) return null;

  const a = activeInvestigateAnomaly;

  const handleApplyMitigation = () => {
    setIsMitigating(true);
    setTimeout(() => {
      setIsMitigating(false);
      setMitigationApplied(true);
      // Auto throttle / shutdown pump to restore hydrostatic equilibrium
      togglePump(a.borewellId);
    }, 1200);
  };

  const handleResolve = () => {
    resolveAnomaly(a.id);
    setActiveInvestigateAnomaly(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#11221C] rounded-2xl border border-slate-200 dark:border-emerald-900/60 max-w-2xl w-full p-6 shadow-2xl overflow-hidden relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-emerald-950/60">
          <div className="flex items-center gap-2.5">
            <span
              className={`p-2 rounded-lg ${
                a.severity === 'critical'
                  ? 'bg-rose-500/15 text-rose-500'
                  : 'bg-amber-500/15 text-amber-500'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  {a.id} · {a.borewellName}
                </span>
                <span
                  className={`text-[10px] font-mono uppercase px-1.5 py-0.2 rounded font-bold ${
                    a.severity === 'critical'
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}
                >
                  {a.severity} Priority
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                {a.title}
              </h2>
            </div>
          </div>

          <button
            onClick={() => setActiveInvestigateAnomaly(null)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Diagnostic Deep Dive */}
        <div className="py-4 space-y-4 text-xs">
          {/* Metadata Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#0B1512]/60">
              <span className="text-[10px] text-slate-400 uppercase block">TIMESTAMP</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{a.timestamp}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#0B1512]/60">
              <span className="text-[10px] text-slate-400 uppercase block">PARAMETER</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                {a.parameter}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#0B1512]/60">
              <span className="text-[10px] text-slate-400 uppercase block">OBSERVED VALUE</span>
              <span className="font-bold text-amber-600 dark:text-amber-400">{a.actualValue}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#0B1512]/60">
              <span className="text-[10px] text-slate-400 uppercase block">EXPECTED VALUE</span>
              <span className="font-semibold text-slate-600 dark:text-slate-400">{a.expectedValue}</span>
            </div>
          </div>

          {/* Root Cause Analysis Explanation Box */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
            <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-bold uppercase tracking-wider text-[11px] font-mono">
              <span>ROOT CAUSE INFERENCE</span>
              <span className="text-slate-400 font-normal">({a.confidenceScore}% Model Confidence)</span>
            </div>
            <p className="text-slate-700 dark:text-slate-200 leading-relaxed">
              <strong>WHY IS THIS HAPPENING: </strong>
              {a.whyExplanation}
            </p>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed pt-1 border-t border-amber-500/20">
              <strong>POTENTIAL AQUIFER IMPACT: </strong>
              {a.potentialImpact}
            </p>
          </div>

          {/* Recommended Action with Automated Mitigation trigger */}
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/30 space-y-3">
            <div className="text-emerald-800 dark:text-emerald-400 font-bold uppercase tracking-wider text-[11px] font-mono flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>PRESCRIBED REMEDIATION</span>
            </div>
            <p className="text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
              {a.recommendedAction}
            </p>

            {mitigationApplied ? (
              <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg text-emerald-800 dark:text-emerald-300 font-mono text-[11px] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>Interlock applied. Pump duty cycle throttled to protect aquifer cone.</span>
              </div>
            ) : (
              <button
                onClick={handleApplyMitigation}
                disabled={isMitigating}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition-colors shadow-xs"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{isMitigating ? 'Executing Remote PLC Command...' : 'Execute Automated Safe-Yield Throttling'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-emerald-950/60">
          <button
            onClick={() => setActiveInvestigateAnomaly(null)}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-emerald-950/40 transition-colors"
          >
            Close
          </button>

          <button
            onClick={handleResolve}
            className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-bold text-white bg-slate-900 dark:bg-[#16382B] hover:bg-slate-800 dark:hover:bg-emerald-900 transition-colors shadow-xs"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Mark Anomaly Resolved</span>
          </button>
        </div>
      </div>
    </div>
  );
};
