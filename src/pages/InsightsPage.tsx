import React, { useState } from 'react';
import {
  LineChart,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  Waves,
  Droplet,
  Download,
  Calendar,
  Activity,
} from 'lucide-react';
import { useJalRakshak } from '../context/JalRakshakContext';

export const InsightsPage: React.FC = () => {
  const { selectedBorewell, historicalData } = useJalRakshak();
  const [timeHorizon, setTimeHorizon] = useState<'30D' | '90D' | 'Annual'>('30D');

  // Predictive calculations
  const dailyExtractionMean = selectedBorewell.todayExtractionLiters;
  const safeYieldLimit = selectedBorewell.averageExtractionLiters;
  const isOverdrawing = dailyExtractionMean > safeYieldLimit;
  const deficitPct = Math.round(((dailyExtractionMean - safeYieldLimit) / safeYieldLimit) * 100);

  return (
    <div className="space-y-6 font-mono select-none">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-emerald-950/80">
        <div>
          <span className="text-[10px] uppercase text-emerald-500 font-bold tracking-wider">
            HYDROLOGICAL DECISION SUPPORT & PREDICTIVE ANALYTICS
          </span>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Aquifer Insights & Safe-Yield Modeling
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Deep statistical correlation between cumulative withdrawal, recharge events, and long-term hydrostatic equilibrium.
          </p>
        </div>

        {/* Time horizon filter */}
        <div className="flex items-center gap-1 p-1 bg-[#0B1512] rounded-xl border border-emerald-950/80 text-xs">
          {(['30D', '90D', 'Annual'] as const).map((horizon) => (
            <button
              key={horizon}
              onClick={() => setTimeHorizon(horizon)}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                timeHorizon === horizon
                  ? 'bg-[#16382B] text-[#78E08F] font-bold border border-emerald-800/60'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {horizon} Forecast
            </button>
          ))}
        </div>
      </div>

      {/* Hero Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Safe Yield Compliance */}
        <div className="p-5 rounded-2xl bg-[#0B1512] border border-emerald-950/80 space-y-2">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
            SAFE-YIELD ADHERENCE INDEX
          </span>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-3xl font-extrabold ${
                isOverdrawing ? 'text-amber-400' : 'text-[#78E08F]'
              }`}
            >
              {isOverdrawing ? `+${deficitPct}%` : '100%'}
            </span>
            <span className="text-xs text-slate-400">
              {isOverdrawing ? 'Above safe envelope' : 'Sustainable withdrawal'}
            </span>
          </div>
          <p className="text-xs text-slate-400 font-sans leading-relaxed pt-1">
            Current pumping schedule produces dynamic cones of depression that recover by dawn, but continuous cycles exceed the 2,170 L/day recharge limit.
          </p>
        </div>

        {/* 2. Projected 30-Day Drawdown */}
        <div className="p-5 rounded-2xl bg-[#0B1512] border border-emerald-950/80 space-y-2">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
            PROJECTED WATER TABLE (30-DAY)
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#38BDF8]">
              19.1 m
            </span>
            <span className="text-xs text-amber-400">
              ↓ 0.7m estimated decline
            </span>
          </div>
          <p className="text-xs text-slate-400 font-sans leading-relaxed pt-1">
            Without managed artificial recharge or duty-cycle throttling, the basalt aquifer layer depth will reach 19.1 m before seasonal monsoon arrival.
          </p>
        </div>

        {/* 3. Recharge Replacement Balance */}
        <div className="p-5 rounded-2xl bg-[#0B1512] border border-emerald-950/80 space-y-2">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
            REPLENISHMENT HARVEST RATIO
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#78E08F]">
              64%
            </span>
            <span className="text-xs text-slate-400">
              of extracted volume offset
            </span>
          </div>
          <p className="text-xs text-slate-400 font-sans leading-relaxed pt-1">
            Recent 28.4 mm precipitation injected approximately 142,000 L into adjacent percolation structures, mitigating 64% of weekly regional abstraction.
          </p>
        </div>
      </div>

      {/* Detailed Forecast Simulation Curve */}
      <div className="p-6 rounded-3xl bg-[#0B1512] border border-emerald-950/80 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-emerald-950/80">
          <div>
            <h3 className="text-sm font-bold text-white">
              Groundwater Level Trajectory: Status Quo vs. Managed Recharge
            </h3>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Simulating water table depth over the next 30 days under current pumping patterns.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-[#38BDF8]">
              <span className="w-3 h-0.5 bg-[#38BDF8]" />
              <span>Status Quo (-0.7m)</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#78E08F]">
              <span className="w-3 h-0.5 bg-[#78E08F]" />
              <span>Managed MAR (+0.3m)</span>
            </div>
          </div>
        </div>

        {/* Forecast Visualization Graphic */}
        <div className="h-56 w-full relative">
          <svg viewBox="0 0 800 200" className="w-full h-full" preserveAspectRatio="none">
            {/* Gridlines */}
            <line x1="50" y1="40" x2="780" y2="40" stroke="#16382b" strokeWidth="0.8" strokeDasharray="3,3" />
            <line x1="50" y1="90" x2="780" y2="90" stroke="#16382b" strokeWidth="0.8" strokeDasharray="3,3" />
            <line x1="50" y1="140" x2="780" y2="140" stroke="#16382b" strokeWidth="0.8" strokeDasharray="3,3" />

            <text x="40" y="44" textAnchor="end" fill="#64748b" fontSize="9">17.5m</text>
            <text x="40" y="94" textAnchor="end" fill="#64748b" fontSize="9">18.5m</text>
            <text x="40" y="144" textAnchor="end" fill="#64748b" fontSize="9">19.5m</text>

            {/* Current point mark */}
            <line x1="200" y1="20" x2="200" y2="170" stroke="#78E08F" strokeWidth="1" strokeDasharray="2,2" opacity="0.6" />
            <text x="200" y="185" textAnchor="middle" fill="#78E08F" fontSize="9">Today (18.4m)</text>

            {/* Historical line (0 to 200) */}
            <path
              d="M 50 60 Q 120 70 200 88"
              fill="none"
              stroke="#38BDF8"
              strokeWidth="2.5"
            />

            {/* Status Quo Projected Decline Line (200 to 780) */}
            <path
              d="M 200 88 Q 450 115 780 135"
              fill="none"
              stroke="#38BDF8"
              strokeWidth="2"
              strokeDasharray="4,4"
            />

            {/* Managed Recharge Curve (200 to 780) */}
            <path
              d="M 200 88 Q 450 75 780 65"
              fill="none"
              stroke="#78E08F"
              strokeWidth="2"
              strokeDasharray="4,4"
            />

            <text x="780" y="148" textAnchor="end" fill="#38BDF8" fontSize="9">Status Quo: 19.1m</text>
            <text x="780" y="58" textAnchor="end" fill="#78E08F" fontSize="9">Managed MAR: 17.8m</text>
          </svg>
        </div>
      </div>
    </div>
  );
};
