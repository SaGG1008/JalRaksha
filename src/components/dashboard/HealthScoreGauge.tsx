import React from 'react';
import { ShieldCheck, AlertTriangle, AlertCircle, RefreshCw } from 'lucide-react';
import { useJalRakshak } from '../../context/JalRakshakContext';

export const HealthScoreGauge: React.FC = () => {
  const { selectedBorewell, liveTick } = useJalRakshak();
  const score = selectedBorewell.healthScore;

  // Arc calculation for semi-circular scientific gauge
  // Radius: 88, Center: (110, 110)
  // Arc angle from 150 deg to 390 deg (240 deg sweep)
  const radius = 80;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * (240 / 360);
  const strokeDashoffset = arcLength - (arcLength * (score / 100));

  // Determine status color
  const isHealthy = score >= 80;
  const isModerate = score >= 65 && score < 80;
  const isCritical = score < 65;

  const accentColor = isHealthy
    ? '#2E7D5B'
    : isModerate
    ? '#D97706'
    : '#DC2626';

  const accentGradient = isHealthy
    ? 'from-[#2E7D5B] to-[#168AAD]'
    : isModerate
    ? 'from-[#D97706] to-[#B45309]'
    : 'from-[#DC2626] to-[#991B1B]';

  return (
    <div className="bg-white dark:bg-[#11221C] rounded-2xl border border-slate-200 dark:border-emerald-950/40 p-6 flex flex-col justify-between shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 dark:text-emerald-500/70 block">
            AQUIFER INDEX
          </span>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            Groundwater Health
          </h2>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
          <RefreshCw className="w-3 h-3 animate-spin text-slate-400" style={{ animationDuration: '6s' }} />
          <span>Updated {selectedBorewell.lastUpdatedSecondsAgo}s ago</span>
        </div>
      </div>

      {/* Main Gauge Visual */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-2">
        <div className="relative flex items-center justify-center">
          <svg className="w-48 h-40 transform" viewBox="0 0 220 180">
            <defs>
              <linearGradient id="healthGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#168AAD" />
                <stop offset="60%" stopColor="#2E7D5B" />
                <stop offset="100%" stopColor="#78E08F" />
              </linearGradient>
              <linearGradient id="warningGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#168AAD" />
                <stop offset="70%" stopColor="#D97706" />
                <stop offset="100%" stopColor="#F59E0B" />
              </linearGradient>
              <linearGradient id="criticalGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#D97706" />
                <stop offset="100%" stopColor="#DC2626" />
              </linearGradient>
            </defs>

            {/* Background track arc */}
            <path
              d="M 40 150 A 80 80 0 1 1 180 150"
              fill="none"
              stroke="currentColor"
              className="text-slate-100 dark:text-emerald-950/60"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />

            {/* Scientific subdivision tick marks */}
            {[0, 20, 40, 60, 80, 100].map((tick) => {
              const angle = 150 + (tick / 100) * 240;
              const rad = (angle * Math.PI) / 180;
              const x1 = 110 + 64 * Math.cos(rad);
              const y1 = 110 + 64 * Math.sin(rad);
              const x2 = 110 + 72 * Math.cos(rad);
              const y2 = 110 + 72 * Math.sin(rad);
              return (
                <line
                  key={tick}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="currentColor"
                  className="text-slate-300 dark:text-emerald-900/80"
                  strokeWidth="1.5"
                />
              );
            })}

            {/* Active filled arc */}
            <path
              d="M 40 150 A 80 80 0 1 1 180 150"
              fill="none"
              stroke={
                isHealthy
                  ? 'url(#healthGradient)'
                  : isModerate
                  ? 'url(#warningGradient)'
                  : 'url(#criticalGradient)'
              }
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={arcLength}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          {/* Central Score Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
            <div className="flex items-baseline">
              <span className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono tabular-nums">
                {score}
              </span>
              <span className="text-sm font-semibold text-slate-400 dark:text-emerald-500/70 ml-1">
                / 100
              </span>
            </div>
            <div className="text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400 mt-0.5">
              INDEX SCORE
            </div>
          </div>
        </div>

        {/* Status & Sub-breakdown parameters */}
        <div className="flex-1 w-full space-y-3">
          <div className="flex items-center gap-2">
            {isHealthy ? (
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : isModerate ? (
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            )}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-emerald-200">
                {selectedBorewell.healthStatusText}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isHealthy
                  ? 'Aquifer hydrostatic level is stable with optimal recharge recovery.'
                  : isModerate
                  ? 'Localized cone of depression observed. Pumping rate slightly exceeds safe yield.'
                  : 'Critical drawdown detected. Pumping interlock recommended to avert cavitation.'}
              </p>
            </div>
          </div>

          {/* Sub-parameters */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-emerald-950/60 text-xs">
            <div className="bg-slate-50 dark:bg-[#0B1512]/60 p-2 rounded-lg">
              <span className="text-[10px] text-slate-400 font-mono block">RECOVERY INDEX</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                {selectedBorewell.recoveryRatePercent}% (Normal)
              </span>
            </div>
            <div className="bg-slate-50 dark:bg-[#0B1512]/60 p-2 rounded-lg">
              <span className="text-[10px] text-slate-400 font-mono block">QUALITY COMPLIANCE</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                BIS 10500 Pass
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
