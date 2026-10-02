import React, { useState, useMemo } from 'react';
import { Activity, AlertTriangle, Zap, Calendar, Info } from 'lucide-react';
import { useJalRakshak } from '../../context/JalRakshakContext';
import { GroundwaterDataPoint } from '../../types';

export const GroundwaterLevelChart: React.FC = () => {
  const { historicalData, selectedBorewell } = useJalRakshak();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // SVG Chart Dimensions
  const width = 800;
  const height = 260;
  const padding = { top: 30, right: 30, bottom: 40, left: 50 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Domain min and max for water level (meters depth from surface)
  // Higher meters = deeper underground = lower water table
  // In hydrogeology, level charts often have lower depth numbers at top, or standard axis. Let's make 16.5m at top and 19.5m at bottom, so dropping water table visually goes downwards!
  const minLevel = 16.5;
  const maxLevel = 19.5;

  const getX = (index: number) => {
    return padding.left + (index / (historicalData.length - 1)) * chartWidth;
  };

  const getY = (level: number) => {
    // Top of chart = minLevel (16.5m, closer to surface), Bottom of chart = maxLevel (19.5m, deeper)
    return padding.top + ((level - minLevel) / (maxLevel - minLevel)) * chartHeight;
  };

  // Generate SVG path for Actual Water Level
  const actualLinePath = useMemo(() => {
    if (historicalData.length === 0) return '';
    return historicalData.reduce((acc, point, i) => {
      const x = getX(i);
      const y = getY(point.waterLevel);
      if (i === 0) return `M ${x} ${y}`;

      // Smooth cubic bezier curve between points
      const prevX = getX(i - 1);
      const prevY = getY(historicalData[i - 1].waterLevel);
      const cpX1 = prevX + (x - prevX) / 2;
      const cpY1 = prevY;
      const cpX2 = prevX + (x - prevX) / 2;
      const cpY2 = y;

      return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${x} ${y}`;
    }, '');
  }, [historicalData]);

  // Generate Expected Range Area Polygon
  const expectedAreaPath = useMemo(() => {
    if (historicalData.length === 0) return '';
    // Top line of expected band (expectedMin)
    const topPath = historicalData.map((point, i) => `${getX(i)} ${getY(point.expectedMin)}`);
    // Bottom line of expected band (expectedMax) in reverse
    const bottomPath = [...historicalData]
      .reverse()
      .map((point, i) => `${getX(historicalData.length - 1 - i)} ${getY(point.expectedMax)}`);

    return `M ${topPath.join(' L ')} L ${bottomPath.join(' L ')} Z`;
  }, [historicalData]);

  // Selected or active hover point (defaults to the Wed 14:35 or last point)
  const activePoint: GroundwaterDataPoint =
    hoveredIndex !== null
      ? historicalData[hoveredIndex]
      : historicalData.find((p) => p.anomaly) || historicalData[historicalData.length - 1];

  return (
    <div className="bg-white dark:bg-[#11221C] rounded-2xl border border-slate-200 dark:border-emerald-950/40 p-5 shadow-xs flex flex-col justify-between">
      {/* Header & Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-emerald-950/60 mb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 dark:text-emerald-500/70">
              HYDROLOGICAL BEHAVIOR
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#168AAD]/10 text-[#168AAD] dark:text-[#78E08F] font-semibold">
              7-Day Continuous Telemetry
            </span>
          </div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
            Groundwater Level — Last 7 Days
          </h2>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-[#168AAD]" />
            <span className="text-slate-600 dark:text-slate-300">Actual Water Level</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-2 bg-emerald-500/20 border border-emerald-500/40 rounded-xs" />
            <span className="text-slate-600 dark:text-slate-300">Expected Safe Range</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-slate-600 dark:text-slate-300">Anomaly Event</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-sky-500" />
            <span className="text-slate-600 dark:text-slate-300">Pump Active</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Chart Canvas */}
      <div className="relative w-full overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto"
          preserveAspectRatio="xMidYMid meet"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <defs>
            <linearGradient id="chartAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#168AAD" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#168AAD" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Y-Axis Horizontal Gridlines & Depths */}
          {[17.0, 17.5, 18.0, 18.5, 19.0].map((level) => {
            const y = getY(level);
            return (
              <g key={level}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="currentColor"
                  className="text-slate-100 dark:text-emerald-950/40"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 10}
                  y={y + 3.5}
                  textAnchor="end"
                  fill="currentColor"
                  className="text-[10px] font-mono text-slate-400 dark:text-slate-500"
                >
                  {level.toFixed(1)}m
                </text>
              </g>
            );
          })}

          {/* Expected Safe Diurnal Envelope Band */}
          <path
            d={expectedAreaPath}
            fill="currentColor"
            className="text-emerald-500/10 dark:text-emerald-500/15"
          />

          {/* Actual Groundwater Level Path */}
          <path
            d={actualLinePath}
            fill="none"
            stroke="#168AAD"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points, Pump Indicators, and Anomaly Markers */}
          {historicalData.map((pt, i) => {
            const x = getX(i);
            const y = getY(pt.waterLevel);
            const isHovered = hoveredIndex === i;

            return (
              <g
                key={i}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(i)}
              >
                {/* Invisible hover hotspot target */}
                <rect
                  x={x - 14}
                  y={padding.top}
                  width="28"
                  height={chartHeight}
                  fill="transparent"
                />

                {/* Vertical hover scrubber bar */}
                {isHovered && (
                  <line
                    x1={x}
                    y1={padding.top}
                    x2={x}
                    y2={height - padding.bottom}
                    stroke="#168AAD"
                    strokeWidth="1.5"
                    strokeDasharray="3,2"
                    opacity="0.75"
                  />
                )}

                {/* Pump Activity Indicator Pill on Top */}
                {pt.pumpState === 'ON' && (
                  <g transform={`translate(${x}, ${padding.top - 8})`}>
                    <rect x="-8" y="-12" width="16" height="12" rx="2" fill="#0284C7" fillOpacity="0.15" />
                    <text x="0" y="-3" textAnchor="middle" fill="#0284C7" fontSize="8" fontWeight="bold">P</text>
                  </g>
                )}

                {/* Anomaly Marker if triggered */}
                {pt.anomaly && (
                  <g transform={`translate(${x}, ${y - 14})`}>
                    <circle cx="0" cy="0" r="7" fill="#F59E0B" className="animate-ping" opacity="0.4" />
                    <circle cx="0" cy="0" r="5" fill="#D97706" />
                    <path d="M 0 -2.5 L 0 0.5 M 0 2.5 L 0 3" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" />
                  </g>
                )}

                {/* Water Level Data Circle */}
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 5 : pt.anomaly ? 4 : 2.5}
                  fill={isHovered ? '#168AAD' : pt.anomaly ? '#D97706' : '#2E7D5B'}
                  stroke="#FFFFFF"
                  strokeWidth={isHovered ? 2 : 1}
                />
              </g>
            );
          })}

          {/* X-Axis Days Labels */}
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
            // Find representative index for midday of each day
            const index = Math.min(i * 3 + 1, historicalData.length - 1);
            const x = getX(index);
            return (
              <text
                key={day}
                x={x}
                y={height - 12}
                textAnchor="middle"
                fill="currentColor"
                className="text-[11px] font-mono text-slate-500 dark:text-slate-400"
              >
                {day}
              </text>
            );
          })}
        </svg>

        {/* Hover / Active Context Popover (Exact prompt match!) */}
        {activePoint && (
          <div className="absolute top-2 right-2 bg-white/95 dark:bg-[#0B1512]/95 backdrop-blur-md rounded-xl p-3 border border-slate-200 dark:border-emerald-950/80 shadow-lg text-xs font-mono min-w-[200px] transition-all">
            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-100 dark:border-emerald-950/60">
              <span className="font-semibold text-slate-900 dark:text-white">
                {activePoint.dateStr} {activePoint.timestamp.split(' ')[1] || '14:35'}
              </span>
              {activePoint.anomaly && (
                <span className="text-[10px] px-1 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-bold">
                  ANOMALY
                </span>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Water Level</span>
                <span className="font-bold text-[#168AAD] dark:text-[#78E08F]">
                  {activePoint.waterLevel} m
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Pump</span>
                <span
                  className={`font-semibold ${
                    activePoint.pumpState === 'ON'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-400'
                  }`}
                >
                  {activePoint.pumpState}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Extraction</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {activePoint.extractionLiters > 0 ? `${activePoint.extractionLiters} L` : '0 L'}
                </span>
              </div>
            </div>

            {activePoint.anomaly && (
              <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-emerald-950/60 text-[10px] text-amber-600 dark:text-amber-400 leading-tight">
                {activePoint.anomaly.label}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Correlated Pump Activity Timeline (Section 11 in Prompt) */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-emerald-950/60">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-emerald-500/70">
              PUMP ACTIVITY TIMELINE
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              Correlated Hydraulic Duty Cycle
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Total Run: 6h 30m / 24h
          </span>
        </div>

        {/* 24-Hour horizontal timeline bar */}
        <div className="relative h-6 bg-slate-100 dark:bg-[#0B1512] rounded-md overflow-hidden flex items-center">
          {/* Active pump duty blocks */}
          {/* 06:00 - 08:45 (25% to 36.4%) */}
          <div
            className="absolute top-1 bottom-1 bg-[#168AAD] rounded-xs flex items-center justify-center text-[9px] font-mono text-white font-semibold cursor-pointer group hover:bg-[#155E75] transition-colors"
            style={{ left: '25%', width: '11.5%' }}
            title="Pump Run 06:00 - 08:45 (1,120 L)"
          >
            06:00
          </div>

          {/* 13:00 - 15:30 (54% to 64.5%) */}
          <div
            className="absolute top-1 bottom-1 bg-[#168AAD] rounded-xs flex items-center justify-center text-[9px] font-mono text-white font-semibold cursor-pointer group hover:bg-[#155E75] transition-colors"
            style={{ left: '54%', width: '10.5%' }}
            title="Pump Run 13:00 - 15:30 (1,020 L)"
          >
            13:00
          </div>

          {/* 19:00 - 20:15 (79% to 84.3%) */}
          <div
            className="absolute top-1 bottom-1 bg-[#2E7D5B] rounded-xs flex items-center justify-center text-[9px] font-mono text-white font-semibold cursor-pointer group hover:bg-[#123C2A] transition-colors"
            style={{ left: '79%', width: '5.3%' }}
            title="Pump Run 19:00 - 20:15 (510 L)"
          >
            19:00
          </div>
        </div>

        {/* Timeline hour ticks */}
        <div className="flex justify-between text-[9px] font-mono text-slate-400 mt-1 px-1">
          <span>00:00</span>
          <span>03:00</span>
          <span>06:00</span>
          <span>09:00</span>
          <span>12:00</span>
          <span>15:00</span>
          <span>18:00</span>
          <span>21:00</span>
          <span>24:00</span>
        </div>
      </div>
    </div>
  );
};
