import React, { useState } from 'react';
import { AlertTriangle, ShieldCheck, CheckCircle2, Sliders, ArrowRight, Filter, Search } from 'lucide-react';
import { useJalRakshak } from '../context/JalRakshakContext';
import { Severity } from '../types';

export const AnomaliesPage: React.FC = () => {
  const { anomalies, setActiveInvestigateAnomaly } = useJalRakshak();
  const [filterSeverity, setFilterSeverity] = useState<'all' | Severity>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'resolved'>('all');

  const filtered = anomalies.filter((a) => {
    if (filterSeverity !== 'all' && a.severity !== filterSeverity) return false;
    if (filterStatus !== 'all' && a.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-emerald-950/60">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 dark:text-emerald-500/70">
            DIAGNOSTIC SURVEILLANCE
          </span>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Groundwater Anomaly & Incident Management Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Physics-grounded diagnostic engine correlating drawdown velocity, recovery hysteresis, and power telemetry
          </p>
        </div>

        {/* Severity Filter Controls */}
        <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-[#11221C] rounded-xl border border-slate-200 dark:border-emerald-950/60 text-xs font-mono">
          {(['all', 'critical', 'warning', 'info'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-colors ${
                filterSeverity === sev
                  ? 'bg-slate-900 text-white dark:bg-[#16382B] dark:text-[#78E08F] font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Anomalies List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white dark:bg-[#11221C] rounded-2xl border border-slate-200 dark:border-emerald-950/40 p-12 text-center shadow-xs">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              NO ANOMALIES DETECTED
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
              All monitored parameters are within their expected diurnal ranges across the central borewell network. Last checked 12 seconds ago.
            </p>
          </div>
        ) : (
          filtered.map((anomaly) => {
            const isCritical = anomaly.severity === 'critical';
            const isWarning = anomaly.severity === 'warning';

            const borderStyle = isCritical
              ? 'border-rose-400 dark:border-rose-900/60'
              : isWarning
              ? 'border-amber-400 dark:border-amber-900/60'
              : 'border-sky-300 dark:border-sky-900/50';

            const badgeBg = isCritical
              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
              : isWarning
              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
              : 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300';

            return (
              <div
                key={anomaly.id}
                className={`bg-white dark:bg-[#11221C] rounded-2xl border ${borderStyle} p-6 shadow-xs relative overflow-hidden transition-all`}
              >
                {/* Top strip */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1.5 ${
                    isCritical
                      ? 'bg-rose-500'
                      : isWarning
                      ? 'bg-amber-500'
                      : 'bg-[#168AAD]'
                  }`}
                />

                {/* Top Bar with Severity & Meta */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-mono uppercase px-2 py-0.5 rounded-md font-bold tracking-wider ${badgeBg}`}>
                      {isCritical ? 'CRITICAL PRIORITY' : isWarning ? 'HIGH PRIORITY' : 'INFORMATIONAL'}
                    </span>
                    <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                      {anomaly.borewellName}
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">·</span>
                    <span className="text-xs font-mono text-slate-400">{anomaly.timestamp}</span>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="text-slate-400">Confidence:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {anomaly.confidenceScore}%
                    </span>
                    <span
                      className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded ${
                        anomaly.status === 'resolved'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {anomaly.status}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">
                  {anomaly.title}
                </h3>

                {/* Actual vs Expected Metric Grid (Prompt match) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-3.5 bg-slate-50 dark:bg-[#0B1512]/60 rounded-xl border border-slate-100 dark:border-emerald-950/50 mb-4 font-mono text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">PARAMETER</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {anomaly.parameter}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">ACTUAL VALUE</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">
                      {anomaly.actualValue}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">EXPECTED BASELINE</span>
                    <span className="font-semibold text-slate-600 dark:text-slate-300">
                      {anomaly.expectedValue}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">DEVIATION SPREAD</span>
                    <span className="font-bold text-rose-600 dark:text-rose-400">
                      +{anomaly.deviationPercent}% deviation
                    </span>
                  </div>
                </div>

                {/* Detailed Reasoning & Action */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 bg-amber-50/40 dark:bg-amber-950/20 rounded-xl border border-amber-200/50 dark:border-amber-900/40">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 block mb-1">
                      WHY IS THIS HAPPENING?
                    </span>
                    <p className="text-slate-700 dark:text-slate-200 leading-relaxed">
                      {anomaly.whyExplanation}
                    </p>
                  </div>

                  <div className="p-3.5 bg-emerald-50/40 dark:bg-emerald-950/20 rounded-xl border border-emerald-200/50 dark:border-emerald-900/40 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 block mb-1">
                        RECOMMENDED ACTION
                      </span>
                      <p className="text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                        {anomaly.recommendedAction}
                      </p>
                    </div>

                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={() => setActiveInvestigateAnomaly(anomaly)}
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-slate-900 dark:bg-[#16382B] text-white font-semibold hover:bg-slate-800 dark:hover:bg-emerald-900 transition-colors shadow-xs"
                      >
                        <span>Investigate & Mitigate</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
