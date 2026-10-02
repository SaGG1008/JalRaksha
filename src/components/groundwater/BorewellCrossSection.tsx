import React from 'react';
import { Power, Radio, Gauge, Waves, AlertTriangle, ArrowDown, ArrowUp } from 'lucide-react';
import { useJalRakshak } from '../../context/JalRakshakContext';

export const BorewellCrossSection: React.FC = () => {
  const { selectedBorewell, togglePump, liveTick } = useJalRakshak();
  const isPumpOn = selectedBorewell.pumpStatus === 'ON';
  const isPumpFault = selectedBorewell.pumpStatus === 'FAULT';

  // Calculate proportional depth percentages for SVG rendering (0 to 100m total scale)
  const totalScaleMeters = 100;
  const waterLevelPct = (selectedBorewell.waterLevelMeters / totalScaleMeters) * 100;
  // Visual top coordinate for water table line inside SVG height (SVG height = 480)
  // Surface is at Y = 80, Aquifer base is at Y = 440 (Span of 360px = 100m)
  const surfaceY = 80;
  const wellDepthSpan = 360;
  const waterY = surfaceY + (selectedBorewell.waterLevelMeters / totalScaleMeters) * wellDepthSpan;
  const pumpY = surfaceY + (selectedBorewell.pumpDepthMeters / totalScaleMeters) * wellDepthSpan;
  const sensorY = surfaceY + (selectedBorewell.sensorDepthMeters / totalScaleMeters) * wellDepthSpan;
  const bottomY = surfaceY + (selectedBorewell.depthTotalMeters / totalScaleMeters) * wellDepthSpan;

  return (
    <div className="bg-white dark:bg-[#11221C] rounded-2xl border border-slate-200 dark:border-emerald-950/40 p-5 shadow-xs flex flex-col justify-between">
      {/* Header with technical tags & pump control */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-emerald-950/60 mb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 dark:text-emerald-500/70">
              PHYSICAL DIGITAL TWIN
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-emerald-950 text-slate-600 dark:text-emerald-400">
              1:100 Hydrogeological Model
            </span>
          </div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
            Underground Borewell Cross-Section & Dynamic Aquifer
          </h2>
        </div>

        {/* Pump Interlock / Manual Toggle Button */}
        <div className="flex items-center gap-2">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] font-mono text-slate-400 block uppercase">SUBMERSIBLE MOTOR</span>
            <span className="text-xs font-semibold font-mono text-slate-700 dark:text-slate-200">
              {isPumpOn ? `${selectedBorewell.flowRateLps} L/s Discharge` : 'Standby / Cut-off'}
            </span>
          </div>
          <button
            onClick={() => togglePump()}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-xs ${
              isPumpFault
                ? 'bg-rose-500 text-white hover:bg-rose-600'
                : isPumpOn
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-slate-200 dark:bg-emerald-950 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-emerald-900'
            }`}
            title="Click to toggle pump state and observe live drawdown / recovery dynamics"
          >
            <Power className="w-3.5 h-3.5" />
            <span>PUMP {isPumpOn ? 'ON' : isPumpFault ? 'FAULT' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Cross Section Visual Graphic Container */}
      <div className="relative w-full h-[480px] bg-[#FAFBF9] dark:bg-[#08100D] rounded-xl border border-slate-200/80 dark:border-emerald-950/80 overflow-hidden select-none">
        <svg
          viewBox="0 0 600 480"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Strata patterns */}
            <pattern id="soilPattern" width="20" height="20" patternUnits="userSpaceOnUse">
              <rect width="20" height="20" fill="#9A7653" opacity="0.12" />
              <circle cx="4" cy="4" r="1" fill="#9A7653" opacity="0.25" />
              <circle cx="14" cy="12" r="1.5" fill="#9A7653" opacity="0.2" />
              <circle cx="8" cy="16" r="0.8" fill="#9A7653" opacity="0.3" />
            </pattern>

            <pattern id="vadosePattern" width="24" height="24" patternUnits="userSpaceOnUse">
              <rect width="24" height="24" fill="#B4916C" opacity="0.08" />
              <path d="M 0 12 L 24 12" stroke="#9A7653" strokeWidth="0.5" opacity="0.15" />
              <circle cx="6" cy="6" r="1" fill="#9A7653" opacity="0.2" />
              <circle cx="18" cy="18" r="1" fill="#9A7653" opacity="0.2" />
            </pattern>

            <pattern id="aquiferBasaltPattern" width="28" height="28" patternUnits="userSpaceOnUse">
              <rect width="28" height="28" fill="#155E75" opacity="0.15" />
              <path d="M 0 14 Q 7 7 14 14 T 28 14" fill="none" stroke="#168AAD" strokeWidth="0.6" opacity="0.2" />
              <circle cx="8" cy="8" r="1.2" fill="#168AAD" opacity="0.25" />
              <circle cx="20" cy="22" r="1.5" fill="#168AAD" opacity="0.25" />
            </pattern>

            {/* Water gradient */}
            <linearGradient id="aquiferWaterGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#168AAD" stopOpacity="0.45" />
              <stop offset="50%" stopColor="#155E75" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#0E3846" stopOpacity="0.85" />
            </linearGradient>

            <linearGradient id="casingGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="50%" stopColor="#94A3B8" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>

            <linearGradient id="pumpGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#1E293B" />
              <stop offset="50%" stopColor="#0284C7" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>
          </defs>

          {/* Geological Stratigraphy Background */}
          {/* Layer 1: Topsoil (0 - 4m) */}
          <rect x="0" y="80" width="600" height="28" fill="url(#soilPattern)" />
          <line x1="0" y1="108" x2="600" y2="108" stroke="#9A7653" strokeWidth="0.75" strokeDasharray="3,3" opacity="0.4" />

          {/* Layer 2: Unsaturated Vadose Zone (Clay / Silt / Fractured Rock) */}
          <rect x="0" y="108" width="600" height={waterY - 108} fill="url(#vadosePattern)" />

          {/* Layer 3: Dynamic Saturated Aquifer Zone with fluid water body */}
          <rect x="0" y={waterY} width="600" height={480 - waterY} fill="url(#aquiferWaterGradient)" />
          <rect x="0" y={waterY} width="600" height={480 - waterY} fill="url(#aquiferBasaltPattern)" />

          {/* Animated Water Table / Groundwater Boundary Line */}
          <g className="transition-all duration-700 ease-out">
            {/* Wavy water boundary */}
            <path
              d={`M 0 ${waterY} 
                  Q 75 ${waterY + (liveTick % 2 === 0 ? 2 : -2)} 150 ${waterY} 
                  T 300 ${waterY + (isPumpOn ? 3 : 0)} 
                  T 450 ${waterY + (liveTick % 2 === 0 ? -2 : 2)} 
                  T 600 ${waterY}`}
              fill="none"
              stroke="#38BDF8"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="animate-gentle-wave"
            />
            {/* Soft luminous glow below water line */}
            <rect
              x="0"
              y={waterY}
              width="600"
              height="12"
              fill="url(#aquiferWaterGradient)"
              opacity="0.6"
            />
          </g>

          {/* Cone of depression curve around well when pump is ON */}
          {isPumpOn && (
            <path
              d={`M 180 ${waterY} Q 280 ${waterY} 290 ${waterY + 12} L 310 ${waterY + 12} Q 320 ${waterY} 420 ${waterY}`}
              fill="none"
              stroke="#0284C7"
              strokeWidth="1.5"
              strokeDasharray="4,4"
              opacity="0.8"
            />
          )}

          {/* Surface Ground Profile Line */}
          <line x1="0" y1="80" x2="600" y2="80" stroke="#2E7D5B" strokeWidth="3" />
          <rect x="0" y="77" width="600" height="3" fill="#2E7D5B" opacity="0.3" />

          {/* Surface Infrastructure: Wellhead Concrete Apron */}
          <polygon
            points="240,80 260,65 340,65 360,80"
            fill="#CBD5E1"
            stroke="#94A3B8"
            strokeWidth="1.5"
          />

          {/* Surface IoT Node Enclosure */}
          <g transform="translate(325, 30)">
            {/* Stand pipe */}
            <rect x="12" y="25" width="6" height="12" fill="#64748B" />
            {/* Weatherproof IP67 Enclosure Box */}
            <rect x="0" y="4" width="30" height="24" rx="3" fill="#0F172A" stroke="#38BDF8" strokeWidth="1" />
            {/* Solar panel atop IoT node */}
            <line x1="-3" y1="2" x2="33" y2="2" stroke="#0284C7" strokeWidth="2.5" />
            {/* Flashing LoRa / 4G Telemetry LED */}
            <circle cx="6" cy="11" r="2" fill={liveTick % 2 === 0 ? '#10B981' : '#047857'} />
            <text x="11" y="14" fill="#94A3B8" fontSize="6" fontFamily="monospace">IoT</text>
            {/* Small antenna */}
            <line x1="25" y1="4" x2="25" y2="-8" stroke="#94A3B8" strokeWidth="1" />
            <circle cx="25" cy="-8" r="1.5" fill="#38BDF8" />
          </g>

          {/* Discharge Outlet Spout (Surface) */}
          <g transform="translate(250, 48)">
            <path
              d="M 40 24 L 40 10 L 10 10 L 10 18"
              fill="none"
              stroke="#475569"
              strokeWidth="5"
              strokeLinecap="round"
            />
            {/* Flow stream when pump is active */}
            {isPumpOn && (
              <path
                d="M 10 18 Q 8 28 5 34"
                fill="none"
                stroke="#38BDF8"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="4,2"
              />
            )}
          </g>

          {/* Borewell Casing Pipe (Extends from surface to bottom) */}
          {/* Casing outer walls (200mm diameter) */}
          <g transform="translate(285, 80)">
            {/* Left casing wall */}
            <rect x="0" y="0" width="4" height={bottomY - surfaceY} fill="url(#casingGradient)" />
            {/* Right casing wall */}
            <rect x="26" y="0" width="4" height={bottomY - surfaceY} fill="url(#casingGradient)" />

            {/* Well Interior Borehole (water column inside pipe) */}
            <rect
              x="4"
              y={waterY - surfaceY}
              width="22"
              height={bottomY - waterY}
              fill="#168AAD"
              opacity="0.35"
            />

            {/* Slotted Perforated Screen at Aquifer intake */}
            {Array.from({ length: 8 }).map((_, i) => (
              <g key={i}>
                <line x1="0" y1={bottomY - surfaceY - 50 + i * 6} x2="4" y2={bottomY - surfaceY - 50 + i * 6} stroke="#CBD5E1" strokeWidth="1.5" />
                <line x1="26" y1={bottomY - surfaceY - 50 + i * 6} x2="30" y2={bottomY - surfaceY - 50 + i * 6} stroke="#CBD5E1" strokeWidth="1.5" />
              </g>
            ))}

            {/* Riser Pipe from Pump to Surface */}
            <line x1="15" y1="0" x2="15" y2={pumpY - surfaceY} stroke="#64748B" strokeWidth="4" />

            {/* Animated Flow Pulse inside Riser Pipe when ON */}
            {isPumpOn && (
              <line
                x1="15"
                y1="0"
                x2="15"
                y2={pumpY - surfaceY}
                stroke="#38BDF8"
                strokeWidth="2"
                strokeDasharray="6,6"
                className="animate-pulse"
              />
            )}

            {/* Submersible Pump Unit */}
            <g transform={`translate(9, ${pumpY - surfaceY})`}>
              <rect x="0" y="0" width="12" height="34" rx="2" fill="url(#pumpGradient)" stroke="#38BDF8" strokeWidth="0.8" />
              {/* Suction strainer inlet screen */}
              <line x1="2" y1="18" x2="10" y2="18" stroke="#94A3B8" strokeWidth="1" />
              <line x1="2" y1="22" x2="10" y2="22" stroke="#94A3B8" strokeWidth="1" />
              {/* Flow intake arrows when ON */}
              {isPumpOn && (
                <g className="animate-pulse text-[#38BDF8]">
                  <path d="M -5 20 L 0 20" stroke="#38BDF8" strokeWidth="1.2" />
                  <path d="M 17 20 L 12 20" stroke="#38BDF8" strokeWidth="1.2" />
                </g>
              )}
            </g>

            {/* Hydrostatic Pressure & Level Sensor Cable & Probe */}
            {/* Sensor cable hanging alongside */}
            <line
              x1="7"
              y1="0"
              x2="7"
              y2={sensorY - surfaceY}
              stroke="#10B981"
              strokeWidth="1.2"
              strokeDasharray="3,1"
              opacity="0.85"
            />
            {/* Sensor Probe Head */}
            <g transform={`translate(4, ${sensorY - surfaceY})`}>
              <rect x="0" y="0" width="6" height="16" rx="1.5" fill="#10B981" stroke="#047857" strokeWidth="0.8" />
              {/* Sensing diaphragm dot */}
              <circle cx="3" cy="13" r="1" fill="#FFFFFF" />
            </g>
          </g>

          {/* Left Side: Technical Annotations & Depths */}
          {/* Surface Tag */}
          <g transform="translate(20, 80)">
            <line x1="0" y1="0" x2="210" y2="0" stroke="#64748B" strokeWidth="0.5" strokeDasharray="2,2" opacity="0.5" />
            <text x="0" y="-6" fill="currentColor" className="text-slate-600 dark:text-slate-300 font-mono text-[10px] font-semibold">
              SURFACE LEVEL (0.0 m)
            </text>
            <text x="0" y="16" fill="currentColor" className="text-slate-400 dark:text-slate-500 font-sans text-[9px]">
              Topsoil & Colluvium (0–4m)
            </text>
          </g>

          {/* Unsaturated Zone Label */}
          <g transform={`translate(20, ${110 + (waterY - 110) / 2})`}>
            <text x="0" y="0" fill="currentColor" className="text-amber-800 dark:text-amber-400/80 font-mono text-[10px] font-medium">
              VADOSE ZONE (Unsaturated)
            </text>
            <text x="0" y="12" fill="currentColor" className="text-slate-400 dark:text-slate-500 font-sans text-[9px]">
              Clayey Silt / Weathered Basalt
            </text>
          </g>

          {/* Water Table Tag */}
          <g transform={`translate(20, ${waterY})`}>
            <line x1="0" y1="0" x2="260" y2="0" stroke="#0284C7" strokeWidth="1" strokeDasharray="3,2" />
            <rect x="0" y="-12" width="165" height="24" rx="4" fill="#0284C7" fillOpacity="0.15" />
            <text x="8" y="4" fill="#0284C7" className="font-mono text-[11px] font-bold">
              WATER LEVEL: {selectedBorewell.waterLevelMeters.toFixed(1)} m
            </text>
            <circle cx="160" cy="0" r="3" fill="#0284C7" />
          </g>

          {/* Aquifer Zone Label */}
          <g transform={`translate(20, ${waterY + 60})`}>
            <text x="0" y="0" fill="currentColor" className="text-emerald-700 dark:text-emerald-400 font-mono text-[10px] font-semibold">
              SATURATED AQUIFER FORMATION
            </text>
            <text x="0" y="13" fill="currentColor" className="text-slate-400 dark:text-slate-500 font-sans text-[9px]">
              {selectedBorewell.aquiferType} (Fractured Water-Bearing)
            </text>
          </g>

          {/* Right Side: Component Callout Badges */}
          {/* IoT Node Callout */}
          <g transform="translate(370, 35)">
            <line x1="-15" y1="12" x2="0" y2="12" stroke="#38BDF8" strokeWidth="1" />
            <rect x="0" y="0" width="200" height="26" rx="4" fill="currentColor" className="text-white dark:text-[#11221C]" stroke="#38BDF8" strokeWidth="0.8" />
            <text x="8" y="11" fill="currentColor" className="text-slate-800 dark:text-white font-mono text-[10px] font-semibold">
              IoT Edge Gateway (LoRa/4G)
            </text>
            <text x="8" y="20" fill="currentColor" className="text-emerald-600 dark:text-emerald-400 font-mono text-[8px]">
              RSSI: -72 dBm · Battery: 94% · 8s sync
            </text>
          </g>

          {/* Submersible Pump Callout */}
          <g transform={`translate(340, ${pumpY - 5})`}>
            <line x1="-20" y1="12" x2="0" y2="12" stroke="#0284C7" strokeWidth="1" />
            <rect x="0" y="0" width="220" height="26" rx="4" fill="currentColor" className="text-white dark:text-[#11221C]" stroke="#64748B" strokeWidth="0.8" />
            <text x="8" y="11" fill="currentColor" className="text-slate-800 dark:text-white font-mono text-[10px] font-semibold">
              Submersible Pump (Depth: {selectedBorewell.pumpDepthMeters}m)
            </text>
            <text x="8" y="20" fill="currentColor" className="text-slate-500 dark:text-slate-400 font-mono text-[8px]">
              5.5 kW Multistage · 10.4 A · {selectedBorewell.flowRateLps} L/s
            </text>
          </g>

          {/* Sensor Callout */}
          <g transform={`translate(340, ${sensorY - 5})`}>
            <line x1="-20" y1="12" x2="0" y2="12" stroke="#10B981" strokeWidth="1" />
            <rect x="0" y="0" width="220" height="26" rx="4" fill="currentColor" className="text-white dark:text-[#11221C]" stroke="#10B981" strokeWidth="0.8" />
            <text x="8" y="11" fill="currentColor" className="text-slate-800 dark:text-white font-mono text-[10px] font-semibold">
              Hydrostatic Sensor (Depth: {selectedBorewell.sensorDepthMeters}m)
            </text>
            <text x="8" y="20" fill="currentColor" className="text-emerald-600 dark:text-emerald-400 font-mono text-[8px]">
              Pressure: 1.802 bar · Submerged: {(selectedBorewell.sensorDepthMeters - selectedBorewell.waterLevelMeters).toFixed(1)}m
            </text>
          </g>

          {/* Total Depth Callout at bottom */}
          <g transform={`translate(340, ${bottomY - 14})`}>
            <line x1="-20" y1="10" x2="0" y2="10" stroke="#94A3B8" strokeWidth="0.8" />
            <rect x="0" y="0" width="180" height="20" rx="3" fill="currentColor" className="text-slate-100 dark:text-[#0B1512]" />
            <text x="6" y="14" fill="currentColor" className="text-slate-600 dark:text-slate-400 font-mono text-[9px]">
              Borehole Bedrock Base: {selectedBorewell.depthTotalMeters} m
            </text>
          </g>
        </svg>

        {/* Live Hydrological Status Ribbon Overlay */}
        <div className="absolute bottom-3 left-3 right-3 bg-white/90 dark:bg-[#11221C]/90 backdrop-blur-md rounded-lg p-2.5 border border-slate-200/80 dark:border-emerald-950/60 flex flex-wrap items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isPumpOn ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'
              }`}
            />
            <span className="text-slate-800 dark:text-slate-200 font-semibold">
              {isPumpOn ? 'ACTIVE DRAWDOWN IN PROGRESS' : 'STATIC HYDROSTATIC RECOVERY'}
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 text-[11px]">
            <span>
              Dynamic Drawdown: <strong className="text-slate-700 dark:text-slate-200">{(selectedBorewell.waterLevelMeters - 17.5).toFixed(1)} m</strong>
            </span>
            <span>
              Pumping Reserve Head: <strong className="text-slate-700 dark:text-slate-200">{(selectedBorewell.pumpDepthMeters - selectedBorewell.waterLevelMeters).toFixed(1)} m</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
