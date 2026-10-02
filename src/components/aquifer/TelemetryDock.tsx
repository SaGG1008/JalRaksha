import React, { useState, useMemo } from 'react';
import { Activity, Zap, AlertTriangle, Clock, ArrowDown } from 'lucide-react';
import { useJalRakshak } from '../../context/JalRakshakContext';
import { GroundwaterDataPoint } from '../../types';

export const TelemetryDock: React.FC = () => {
  const { historicalData, selectedBorewell } = useJalRakshak();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // SVG Chart Dimensions
  const width = 860;
  const height = 150;
  const padding = { top: 20, right: 30, bottom: 25, left: 45 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const minLevel = 16.5;
  const maxLevel = 19.5;

  const getX = (index: number) => {
    return padding.left + (index / (historicalData.length - 1)) * chartWidth;
  };

  const getY = (level: number) => {
    return padding.top + ((level - minLevel) / (maxLevel - minLevel)) * chartHeight;
  };

  // SVG Curve Path
  const linePath = useMemo(() => {
    if (historicalData.length === 0) return '';
    return historicalData.reduce((acc, point, i) => {
      const x = getX(i);
      const y = getY(point.waterLevel);
      if (i === 0) return `M ${x} ${y}`;
      const prevX = getX(i - 1);
      const prevY = getY(historicalData[i - 1].waterLevel);
      const cpX1 = prevX + (x - prevX) / 2;
      const cpY1 = prevY;
      const cpX2 = prevX + (x - prevX) / 2;
      const cpY2 = y;
      return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${x} ${y}`;
    }, '');
  }, [historicalData]);

  // Expected range envelope area
  const envelopeAreaPath = useMemo(() => {
    if (historicalData.length === 0) return '';
    const topPath = historicalData.map((pt, i) => `${getX(i)} ${getY(pt.expectedMin)}`);
    const bottomPath = [...historicalData]
      .reverse()
      .map((pt, i) => `${getX(historicalData.length - 1 - i)} ${getY(pt.expectedMax)}`);
    return `M ${topPath.join(' L ')} L ${bottomPath.join(' L ')} Z`;
  }, [historicalData]);

  const activePoint: GroundwaterDataPoint =
    hoveredIndex !== null
      ? historicalData[hoveredIndex]
      : historicalData[historicalData.length - 1];

  return (
    <div className="bg-[#0B1512] text-slate-100 rounded-3xl border border-emerald-950/60 p-5 shadow-2xl space-y-3">
      {/* Header with Title and Current Scrubber Values */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-emerald-950/80">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-500/70">
            TIME-SERIES CORRELATION
          </span>
          <h3 className="text-sm font-bold text-white font-mono">
            Groundwater Level & Pump Duty Telemetry
          </h3>
        </div>

        {/* Live Hover Scrubber Value Strip */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Clock className="w-3.5 h-3.5 text-[#168AAD]" />
            <span className="text-white font-semibold">{activePoint.dateStr} {activePoint.timestamp.split(' ')[1] || '10:42'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Level:</span>
            <span className="text-[#38BDF8] font-bold">{activePoint.waterLevel} m</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Pump:</span>
            <span className={`font-bold ${activePoint.pumpState === 'ON' ? 'text-emerald-400' : 'text-slate-400'}`}>
              {activePoint.pumpState}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Extraction:</span>
            <span className="text-white font-bold">{activePoint.extractionLiters} L</span>
          </div>
        </div>
      </div>

      {/* Main Dual-Axis Interactive SVG Strip */}
      <div className="relative w-full overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto"
          preserveAspectRatio="xMidYMid meet"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {/* Depth Gridlines */}
          {[17.0, 18.0, 19.0].map((level) => {
            const y = getY(level);
            return (
              <g key={level}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#16382b"
                  strokeWidth="0.8"
                  strokeDasharray="2,4"
                />
                <text
                  x={padding.left - 8}
                  y={y + 3}
                  textAnchor="end"
                  fill="#64748b"
                  fontSize="8"
                  fontFamily="monospace"
                >
                  {level.toFixed(1)}m
                </text>
              </g>
            );
          })}

          {/* Safe Envelope */}
          <path d={envelopeAreaPath} fill="#2E7D5B" fillOpacity="0.15" />

          {/* Actual Line */}
          <path d={linePath} fill="none" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />

          {/* Data Points & Markers */}
          {historicalData.map((pt, i) => {
            const x = getX(i);
            const y = getY(pt.waterLevel);
            const isHovered = hoveredIndex === i;

            return (
              <g key={i} className="cursor-pointer" onMouseEnter={() => setHoveredIndex(i)}>
                <rect x={x - 12} y={padding.top} width="24" height={chartHeight} fill="transparent" />

                {isHovered && (
                  <line
                    x1={x}
                    y1={padding.top}
                    x2={x}
                    y2={height - padding.bottom}
                    stroke="#38BDF8"
                    strokeWidth="1"
                    strokeDasharray="2,2"
                  />
                )}

                {/* Anomaly dot */}
                {pt.anomaly && (
                  <circle cx={x} cy={y} r="5" fill="#F59E0B" className="animate-pulse" />
                )}

                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 4.5 : pt.anomaly ? 3.5 : 2}
                  fill={isHovered ? '#FFFFFF' : pt.anomaly ? '#F59E0B' : '#168AAD'}
                  stroke="#0B1512"
                  strokeWidth="1"
                />
              </g>
            );
          })}

          {/* Days on X Axis */}
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
            const idx = Math.min(i * 3 + 1, historicalData.length - 1);
            const x = getX(idx);
            return (
              <text
                key={day}
                x={x}
                y={height - 8}
                textAnchor="middle"
                fill="#64748b"
                fontSize="9"
                fontFamily="monospace"
              >
                {day}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Correlated 24h Pump Duty Block Bar */}
      <div className="pt-2 border-t border-emerald-950/80">
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1.5">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-[#168AAD]" />
            <span>PUMP DUTY CYCLES (24H TIMELINE)</span>
          </div>
          <span>Total Run: 6h 30m / Safe Yield Compliant</span>
        </div>

        {/* Timeline Bar */}
        <div className="relative h-5 bg-[#070e0c] rounded-md overflow-hidden flex items-center border border-emerald-950/60">
          <div
            className="absolute top-0.5 bottom-0.5 bg-[#168AAD] rounded-xs flex items-center justify-center text-[8px] font-mono text-white font-bold"
            style={{ left: '25%', width: '11.5%' }}
            title="Session 1: 06:00 - 08:45"
          >
            06:00
          </div>
          <div
            className="absolute top-0.5 bottom-0.5 bg-[#168AAD] rounded-xs flex items-center justify-center text-[8px] font-mono text-white font-bold"
            style={{ left: '54%', width: '10.5%' }}
            title="Session 2: 13:00 - 15:30"
          >
            13:00
          </div>
          <div
            className="absolute top-0.5 bottom-0.5 bg-[#2E7D5B] rounded-xs flex items-center justify-center text-[8px] font-mono text-white font-bold"
            style={{ left: '79%', width: '5.3%' }}
            title="Session 3: 19:00 - 20:15"
          >
            19:00
          </div>
        </div>

        <div className="flex justify-between text-[8px] font-mono text-slate-500 mt-1 px-1">
          <span>00:00</span>
          <span>06:00</span>
          <span>12:00</span>
          <span>18:00</span>
          <span>24:00</span>
        </div>
      </div>
    </div>
  );
};
