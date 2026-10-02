import React, { useState } from 'react';
import {
  Power,
  Zap,
  Activity,
  Droplets,
  AlertTriangle,
  Radio,
  Sliders,
  Maximize2,
  Minimize2,
  RefreshCw,
  Eye,
  CheckCircle2,
  X,
  ShieldAlert,
} from 'lucide-react';
import { useJalRakshak } from '../../context/JalRakshakContext';
import { SensorTelemetry } from '../../types';

export const AquiferCommandCenter: React.FC = () => {
  const {
    selectedBorewell,
    togglePump,
    liveTick,
    anomalies,
    sensors,
    setActiveInvestigateAnomaly,
    setIsSimModalOpen,
    isSimulating,
    activeScenario,
  } = useJalRakshak();

  const [activeSensorModal, setActiveSensorModal] = useState<SensorTelemetry | null>(null);
  const [showStreamlines, setShowStreamlines] = useState<boolean>(true);

  const isPumpOn = selectedBorewell.pumpStatus === 'ON';
  const isPumpFault = selectedBorewell.pumpStatus === 'FAULT';

  const activeAnomaly = anomalies.find(
    (a) => a.borewellId === selectedBorewell.id && a.status === 'active'
  );

  // Depth geometry calculations for SVG (0m to 100m scale, SVG coordinate span: 70px to 470px = 400px)
  const surfaceY = 70;
  const bottomY = 470;
  const depthSpan = bottomY - surfaceY; // 400px for 100 meters => 4px per meter

  // Water level in meters (e.g. 18.4m)
  const waterLevelMeters = selectedBorewell.waterLevelMeters;
  const waterY = surfaceY + waterLevelMeters * 4;

  // Pump depth in meters (e.g. 55m)
  const pumpDepthMeters = selectedBorewell.pumpDepthMeters;
  const pumpY = surfaceY + pumpDepthMeters * 4;

  // Hydrostatic sensor depth in meters (e.g. 72m)
  const sensorDepthMeters = selectedBorewell.sensorDepthMeters;
  const sensorY = surfaceY + sensorDepthMeters * 4;

  // Cone of depression depth offset when pump is ON
  const coneDrawdownPx = isPumpOn ? (isSimulating && activeScenario === 'high_extraction' ? 24 : 16) : 0;

  // Dynamic groundwater wave movement
  const waveShift = (liveTick % 2 === 0 ? 1 : -1) * 1.5;

  return (
    <div className="bg-[#0B1512] text-slate-100 rounded-3xl border border-emerald-950/60 shadow-2xl relative overflow-hidden flex flex-col justify-between select-none">
      {/* Top Command Toolbar */}
      <div className="px-5 py-3.5 bg-[#0e1d17]/90 border-b border-emerald-950/80 flex flex-wrap items-center justify-between gap-3 z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#168AAD] animate-ping" />
            <span className="font-mono text-xs font-bold tracking-wider uppercase text-emerald-400">
              AQUIFER COMMAND CENTER
            </span>
          </div>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="text-xs font-mono text-slate-300 hidden sm:inline">
            Node: <strong className="text-white">{selectedBorewell.id}</strong> ({selectedBorewell.location})
          </span>
        </div>

        {/* Viewport Control Badges & Actions */}
        <div className="flex items-center gap-2 text-xs font-mono">
          {/* Streamlines toggle */}
          <button
            onClick={() => setShowStreamlines(!showStreamlines)}
            className={`px-2.5 py-1 rounded-md text-[11px] transition-colors border ${
              showStreamlines
                ? 'bg-emerald-950/70 border-emerald-800 text-emerald-300'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            Streamlines: {showStreamlines ? 'ON' : 'OFF'}
          </button>

          {/* Digital Twin Simulator Launcher */}
          <button
            onClick={() => setIsSimModalOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] transition-all border ${
              isSimulating
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 animate-pulse'
                : 'bg-[#123C2A] border-emerald-800/60 text-emerald-200 hover:bg-[#164e37]'
            }`}
          >
            <Zap className="w-3 h-3 text-amber-400" />
            <span>{isSimulating ? `Sim: ${activeScenario?.replace('_', ' ')}` : 'Digital Twin'}</span>
          </button>

          {/* Direct Pump Toggle */}
          <button
            onClick={() => togglePump()}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-bold transition-all shadow-sm ${
              isPumpFault
                ? 'bg-rose-600 text-white animate-pulse'
                : isPumpOn
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
            title="Click to toggle pump state"
          >
            <Power className="w-3 h-3" />
            <span>PUMP {selectedBorewell.pumpStatus}</span>
          </button>
        </div>
      </div>

      {/* Main Subsurface Canvas Viewport */}
      <div className="relative w-full h-[520px] bg-[#070e0c] overflow-hidden">
        {/* SVG Geological Canvas */}
        <svg
          viewBox="0 0 860 520"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Strata Shading Patterns */}
            {/* Topsoil */}
            <pattern id="soilTexture" width="24" height="24" patternUnits="userSpaceOnUse">
              <rect width="24" height="24" fill="#1b1510" opacity="0.9" />
              <circle cx="6" cy="6" r="1.2" fill="#9A7653" opacity="0.4" />
              <circle cx="18" cy="14" r="1.4" fill="#9A7653" opacity="0.3" />
              <circle cx="10" cy="20" r="0.8" fill="#9A7653" opacity="0.3" />
            </pattern>

            {/* Clay / Silt */}
            <pattern id="clayTexture" width="30" height="30" patternUnits="userSpaceOnUse">
              <rect width="30" height="30" fill="#141917" />
              <line x1="0" y1="15" x2="30" y2="15" stroke="#334139" strokeWidth="0.8" strokeDasharray="3,3" opacity="0.3" />
              <circle cx="15" cy="8" r="1" fill="#475569" opacity="0.3" />
            </pattern>

            {/* Weathered Rock */}
            <pattern id="weatheredRockTexture" width="36" height="36" patternUnits="userSpaceOnUse">
              <rect width="36" height="36" fill="#0f1f1a" />
              <path d="M 0 18 L 18 0 M 18 36 L 36 18" stroke="#1f3d32" strokeWidth="0.8" opacity="0.4" />
            </pattern>

            {/* Fractured Basalt Aquifer Matrix */}
            <pattern id="fracturedAquiferTexture" width="40" height="40" patternUnits="userSpaceOnUse">
              <rect width="40" height="40" fill="#082229" />
              <path d="M 0 20 Q 10 10 20 20 T 40 20" fill="none" stroke="#168AAD" strokeWidth="0.8" opacity="0.25" />
              <circle cx="12" cy="12" r="1.5" fill="#38BDF8" opacity="0.2" />
              <circle cx="28" cy="28" r="1.8" fill="#38BDF8" opacity="0.25" />
            </pattern>

            {/* Deep Bedrock */}
            <pattern id="bedrockTexture" width="32" height="32" patternUnits="userSpaceOnUse">
              <rect width="32" height="32" fill="#050a09" />
              <line x1="0" y1="0" x2="32" y2="32" stroke="#11221c" strokeWidth="1" opacity="0.4" />
              <line x1="32" y1="0" x2="0" y2="32" stroke="#11221c" strokeWidth="1" opacity="0.4" />
            </pattern>

            {/* Water Fluid Gradient */}
            <linearGradient id="fluidWaterGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#168AAD" stopOpacity="0.75" />
              <stop offset="40%" stopColor="#155E75" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#082833" stopOpacity="0.95" />
            </linearGradient>

            <linearGradient id="coneOfDepressionGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#0284C7" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Geological Stratigraphy Layers */}
          {/* Layer 1: Topsoil (0m to 4m, Y: 70 to 86) */}
          <rect x="90" y="70" width="770" height="16" fill="url(#soilTexture)" />

          {/* Layer 2: Clay / Silt Impervious Cap (4m to 14m, Y: 86 to 126) */}
          <rect x="90" y="86" width="770" height="40" fill="url(#clayTexture)" />
          <line x1="90" y1="126" x2="860" y2="126" stroke="#2E7D5B" strokeWidth="0.5" strokeDasharray="4,4" opacity="0.3" />

          {/* Layer 3: Weathered Rock Vadose Zone (14m to 30m, Y: 126 to 190) */}
          <rect x="90" y="126" width="770" height="64" fill="url(#weatheredRockTexture)" />
          <line x1="90" y1="190" x2="860" y2="190" stroke="#168AAD" strokeWidth="0.5" strokeDasharray="4,4" opacity="0.3" />

          {/* Layer 4: Saturated Basalt Aquifer (30m to 85m, Y: 190 to 410) */}
          <rect x="90" y="190" width="770" height="220" fill="url(#fracturedAquiferTexture)" />

          {/* Layer 5: Hard Crystalline Bedrock Base (85m to 100m, Y: 410 to 470) */}
          <rect x="90" y="410" width="770" height="60" fill="url(#bedrockTexture)" />

          {/* Live Fluid Water Table with Depression Cone */}
          {/* The water table starts from Y = waterY on left and right, and sinks into a cone of depression around X = 430 (borewell center) */}
          <g className="transition-all duration-700 ease-out">
            {/* Dynamic Water Volume Polygon */}
            <path
              d={`M 90 ${waterY + waveShift}
                  L 310 ${waterY + waveShift}
                  Q 380 ${waterY + waveShift} 430 ${waterY + coneDrawdownPx + waveShift}
                  Q 480 ${waterY + waveShift} 550 ${waterY + waveShift}
                  L 860 ${waterY + waveShift}
                  L 860 470
                  L 90 470 Z`}
              fill="url(#fluidWaterGradient)"
            />

            {/* Glowing Surface Boundary Wave Line */}
            <path
              d={`M 90 ${waterY + waveShift}
                  L 310 ${waterY + waveShift}
                  Q 380 ${waterY + waveShift} 430 ${waterY + coneDrawdownPx + waveShift}
                  Q 480 ${waterY + waveShift} 550 ${waterY + waveShift}
                  L 860 ${waterY + waveShift}`}
              fill="none"
              stroke="#38BDF8"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </g>

          {/* Flow Streamline Particles moving into borehole screen (when ON) */}
          {showStreamlines && isPumpOn && (
            <g className="opacity-60 text-sky-400">
              <path
                d={`M 220 ${waterY + 40} Q 320 ${waterY + 60} 416 ${pumpY + 10}`}
                fill="none"
                stroke="#38BDF8"
                strokeWidth="1.2"
                strokeDasharray="4,6"
                className="animate-pulse"
              />
              <path
                d={`M 640 ${waterY + 40} Q 540 ${waterY + 60} 444 ${pumpY + 10}`}
                fill="none"
                stroke="#38BDF8"
                strokeWidth="1.2"
                strokeDasharray="4,6"
                className="animate-pulse"
              />
              <path
                d={`M 260 ${pumpY + 30} Q 350 ${pumpY + 25} 416 ${pumpY + 25}`}
                fill="none"
                stroke="#38BDF8"
                strokeWidth="1"
                strokeDasharray="3,5"
              />
              <path
                d={`M 600 ${pumpY + 30} Q 510 ${pumpY + 25} 444 ${pumpY + 25}`}
                fill="none"
                stroke="#38BDF8"
                strokeWidth="1"
                strokeDasharray="3,5"
              />
            </g>
          )}

          {/* Left Vertical Depth Ruler (Section 7 in prompt) */}
          <g transform="translate(10, 0)">
            {/* Background strip for ruler */}
            <rect x="0" y="70" width="80" height="400" fill="#060c0a" opacity="0.95" />
            <line x1="80" y1="70" x2="80" y2="470" stroke="#16382b" strokeWidth="1" />

            {/* Depth Markers */}
            {[
              { m: 0, label: 'Surface', y: 70 },
              { m: 10, label: 'Clay/Silt', y: 110 },
              { m: 20, label: 'Water Table', y: 150 },
              { m: 40, label: 'Weathered', y: 230 },
              { m: 60, label: 'Aquifer', y: 310 },
              { m: 80, label: 'Aquitard', y: 390 },
              { m: 100, label: 'Bedrock', y: 470 },
            ].map((tick) => (
              <g key={tick.m}>
                <line x1="68" y1={tick.y} x2="80" y2={tick.y} stroke="#2E7D5B" strokeWidth="1" />
                <text
                  x="64"
                  y={tick.y + 3.5}
                  textAnchor="end"
                  fill="#78E08F"
                  fontSize="9"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {tick.m} m
                </text>
                <text
                  x="6"
                  y={tick.y + 3.5}
                  fill="#64748b"
                  fontSize="7.5"
                  fontFamily="monospace"
                >
                  {tick.label}
                </text>
              </g>
            ))}

            {/* Minor tick marks */}
            {Array.from({ length: 19 }).map((_, i) => {
              const y = 70 + (i + 1) * 20;
              return (
                <line key={i} x1="74" y1={y} x2="80" y2={y} stroke="#1b382d" strokeWidth="0.8" />
              );
            })}

            {/* Live Indicator on Ruler for Current Water Table Depth */}
            <g transform={`translate(70, ${waterY})`}>
              <polygon points="0,0 8,-4 8,4" fill="#38BDF8" />
              <rect x="-65" y="-9" width="62" height="18" rx="2" fill="#0284C7" />
              <text x="-34" y="3.5" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontFamily="monospace" fontWeight="bold">
                {selectedBorewell.waterLevelMeters.toFixed(1)} m
              </text>
            </g>
          </g>

          {/* Geological Stratigraphy Text Labels on Right */}
          <g transform="translate(845, 0)">
            <text x="0" y="80" textAnchor="end" fill="#9A7653" fontSize="8" fontFamily="monospace" opacity="0.8">
              TOPSOIL (0–4m)
            </text>
            <text x="0" y="112" textAnchor="end" fill="#64748B" fontSize="8" fontFamily="monospace" opacity="0.8">
              CLAY / SILT CAP (4–14m)
            </text>
            <text x="0" y="160" textAnchor="end" fill="#4B6B5E" fontSize="8" fontFamily="monospace" opacity="0.8">
              WEATHERED BASALT (14–30m)
            </text>
            <text x="0" y="270" textAnchor="end" fill="#168AAD" fontSize="9" fontFamily="monospace" fontWeight="bold">
              FRACTURED AQUIFER MATRIX (30–85m)
            </text>
            <text x="0" y="445" textAnchor="end" fill="#334155" fontSize="8" fontFamily="monospace">
              CRYSTALLINE BEDROCK (85–100m)
            </text>
          </g>

          {/* Borewell Central Hardware Column (Center X = 430) */}
          <g transform="translate(430, 0)">
            {/* Surface Wellhead Concrete Apron & IoT Enclosure */}
            <polygon points="-30,70 -20,54 20,54 30,70" fill="#334155" stroke="#64748b" strokeWidth="1" />
            <rect x="-8" y="28" width="16" height="26" fill="#1e293b" stroke="#38bdf8" strokeWidth="1" rx="2" />
            <line x1="-12" y1="26" x2="12" y2="26" stroke="#0284c7" strokeWidth="2" />
            {/* Flashing LoRa Link LED */}
            <circle cx="0" cy="38" r="2.5" fill={liveTick % 2 === 0 ? '#10B981' : '#047857'} />

            {/* Casing Outer Walls (200mm diameter) */}
            <rect x="-14" y="70" width="3" height={bottomY - surfaceY - 30} fill="#475569" />
            <rect x="11" y="70" width="3" height={bottomY - surfaceY - 30} fill="#475569" />

            {/* Borehole Water Column inside casing */}
            <rect
              x="-11"
              y={waterY}
              width="22"
              height={bottomY - waterY - 30}
              fill="#168AAD"
              opacity="0.3"
            />

            {/* Slotted Screen Perforations at aquifer zone */}
            {Array.from({ length: 12 }).map((_, i) => (
              <g key={i}>
                <line x1="-14" y1={300 + i * 8} x2="-11" y2={300 + i * 8} stroke="#cbd5e1" strokeWidth="1" />
                <line x1="11" y1={300 + i * 8} x2="14" y2={300 + i * 8} stroke="#cbd5e1" strokeWidth="1" />
              </g>
            ))}

            {/* Discharge Riser Pipe to surface */}
            <line x1="0" y1="54" x2="0" y2={pumpY} stroke="#94a3b8" strokeWidth="4" />
            {isPumpOn && (
              <line
                x1="0"
                y1="54"
                x2="0"
                y2={pumpY}
                stroke="#38bdf8"
                strokeWidth="2"
                strokeDasharray="4,4"
                className="animate-pulse"
              />
            )}

            {/* Submersible Pump Unit (Depth: 55m) */}
            <g transform={`translate(-8, ${pumpY})`}>
              <rect x="0" y="0" width="16" height="38" rx="2" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
              {/* Impeller suction vents */}
              <line x1="3" y1="20" x2="13" y2="20" stroke="#94a3b8" strokeWidth="1.5" />
              <line x1="3" y1="26" x2="13" y2="26" stroke="#94a3b8" strokeWidth="1.5" />
              {/* Electric Motor segment */}
              <rect x="2" y="4" width="12" height="12" fill="#0284c7" opacity="0.6" />
            </g>

            {/* Sensor Cable hanging down */}
            <line
              x1="6"
              y1="54"
              x2="6"
              y2={sensorY}
              stroke="#10b981"
              strokeWidth="1.2"
              strokeDasharray="2,2"
              opacity="0.8"
            />

            {/* Sensor Probe Head (Depth: 72m) */}
            <g transform={`translate(2, ${sensorY})`}>
              <rect x="0" y="0" width="8" height="18" rx="2" fill="#10b981" stroke="#047857" strokeWidth="0.8" />
              <circle cx="4" cy="14" r="1.5" fill="#ffffff" />
            </g>

            {/* Borewell Interactive Sensor Nodes (Section 9 in prompt) */}
            {/* 1. Flow Sensor Node (Surface) */}
            <g
              transform="translate(-60, 48)"
              className="cursor-pointer group"
              onClick={() => setActiveSensorModal(sensors.find((s) => s.type === 'Electromagnetic Flow') || sensors[1])}
            >
              <line x1="45" y1="0" x2="15" y2="0" stroke="#38bdf8" strokeWidth="1" strokeDasharray="2,2" />
              <rect x="-85" y="-10" width="100" height="20" rx="3" fill="#0e1d17" stroke="#38bdf8" strokeWidth="0.8" />
              <circle cx="-75" cy="0" r="2" fill="#10b981" />
              <text x="-67" y="3" fill="#38bdf8" fontSize="8" fontFamily="monospace" fontWeight="bold">
                FLOW {selectedBorewell.flowRateLps} L/s
              </text>
            </g>

            {/* 2. Pump Motor CT Sensor Node */}
            <g
              transform={`translate(35, ${pumpY + 10})`}
              className="cursor-pointer group"
              onClick={() => setActiveSensorModal(sensors.find((s) => s.type === 'Hall-Effect CT') || sensors[3])}
            >
              <line x1="-15" y1="0" x2="0" y2="0" stroke="#f59e0b" strokeWidth="1" strokeDasharray="2,2" />
              <rect x="0" y="-10" width="115" height="20" rx="3" fill="#0e1d17" stroke="#f59e0b" strokeWidth="0.8" />
              <circle cx="10" cy="0" r="2" fill="#10b981" />
              <text x="18" y="3" fill="#f59e0b" fontSize="8" fontFamily="monospace" fontWeight="bold">
                PUMP 10.4A / 5.5kW
              </text>
            </g>

            {/* 3. Hydrostatic Pressure Sensor Node */}
            <g
              transform={`translate(-135, ${sensorY + 2})`}
              className="cursor-pointer group"
              onClick={() => setActiveSensorModal(sensors.find((s) => s.type === 'Hydrostatic Pressure') || sensors[0])}
            >
              <line x1="120" y1="0" x2="135" y2="0" stroke="#10b981" strokeWidth="1" strokeDasharray="2,2" />
              <rect x="0" y="-10" width="120" height="20" rx="3" fill="#0e1d17" stroke="#10b981" strokeWidth="0.8" />
              <circle cx="10" cy="0" r="2" fill="#10b981" />
              <text x="18" y="3" fill="#78e08f" fontSize="8" fontFamily="monospace" fontWeight="bold">
                LEVEL {selectedBorewell.waterLevelMeters}m (1.8 bar)
              </text>
            </g>

            {/* 4. TDS Sensor Node */}
            <g
              transform={`translate(35, ${sensorY + 12})`}
              className="cursor-pointer group"
              onClick={() => setActiveSensorModal(sensors.find((s) => s.type === '4-Electrode TDS/EC') || sensors[2])}
            >
              <line x1="-15" y1="0" x2="0" y2="0" stroke="#38bdf8" strokeWidth="1" strokeDasharray="2,2" />
              <rect x="0" y="-10" width="115" height="20" rx="3" fill="#0e1d17" stroke="#38bdf8" strokeWidth="0.8" />
              <circle cx="10" cy="0" r="2" fill="#f59e0b" />
              <text x="18" y="3" fill="#38bdf8" fontSize="8" fontFamily="monospace" fontWeight="bold">
                TDS {selectedBorewell.tdsPpm} ppm (EC)
              </text>
            </g>
          </g>

          {/* Physical Anomaly Overlay Integrated Directly into the Drawdown Cone (Section 13 in prompt) */}
          {activeAnomaly && (
            <g transform={`translate(430, ${waterY - 32})`} className="cursor-pointer" onClick={() => setActiveInvestigateAnomaly(activeAnomaly)}>
              <rect x="-110" y="-14" width="220" height="28" rx="4" fill="#1c1306" stroke="#f59e0b" strokeWidth="1.2" className="animate-pulse" />
              <g transform="translate(-100, 4)">
                <path d="M 0 -6 L 5 4 L -5 4 Z" fill="#f59e0b" />
                <text x="12" y="0" fill="#f59e0b" fontSize="9" fontFamily="monospace" fontWeight="bold">
                  ⚠ DRAWDOWN EVENT ↓ 1.4 m
                </text>
              </g>
              <text x="50" y="4" fill="#fde68a" fontSize="8" fontFamily="monospace" textAnchor="end">
                [Investigate]
              </text>
              {/* Cone depression indicator lines pointing downwards */}
              <line x1="-15" y1="14" x2="0" y2="28" stroke="#f59e0b" strokeWidth="1" strokeDasharray="2,2" />
              <line x1="15" y1="14" x2="0" y2="28" stroke="#f59e0b" strokeWidth="1" strokeDasharray="2,2" />
            </g>
          )}

          {/* Floating Technical Instrumentation Callouts (Section 6 in prompt) */}
          {/* Surface Ground Profile */}
          <line x1="90" y1="70" x2="860" y2="70" stroke="#2E7D5B" strokeWidth="2.5" />
          <text x="100" y="64" fill="#2E7D5B" fontSize="9" fontFamily="monospace" fontWeight="bold">
            SURFACE ELEVATION 0.0 m
          </text>
        </svg>

        {/* Floating Instrumentation Overlay Badges around the Canvas */}
        {/* Top-Right: Water Table Telemetry */}
        <div className="absolute top-4 right-4 bg-[#0e1d17]/90 backdrop-blur-md p-3 rounded-xl border border-emerald-950/80 font-mono text-xs shadow-lg max-w-[210px]">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">
            CURRENT WATER TABLE
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-[#38BDF8] tabular-nums">
              {selectedBorewell.waterLevelMeters.toFixed(1)}
            </span>
            <span className="text-xs text-slate-400">meters</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-amber-400 mt-1">
            <span>↓ {Math.abs(selectedBorewell.waterLevelDeltaToday).toFixed(1)}m today</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400">Safe: {selectedBorewell.expectedLevelRange[0]}–{selectedBorewell.expectedLevelRange[1]}m</span>
          </div>
        </div>

        {/* Bottom-Left: Subsurface Aquifer Geology */}
        <div className="absolute bottom-4 left-24 bg-[#0e1d17]/90 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-emerald-950/80 font-mono text-xs shadow-lg hidden sm:block">
          <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
            HYDROGEOLOGICAL MATRIX
          </div>
          <div className="text-white text-xs font-semibold mt-0.5">
            {selectedBorewell.aquiferType} Formation
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Transmissivity: 145 m²/day · Storage Coeff: 0.018 · Specific Yield: 3.2%
          </div>
        </div>

        {/* Bottom-Right: Hydraulic Discharge & Cone Status */}
        <div className="absolute bottom-4 right-4 bg-[#0e1d17]/90 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-emerald-950/80 font-mono text-xs shadow-lg text-right">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">
            HYDRAULIC STATUS
          </div>
          <div className="text-xs font-bold text-white mt-0.5">
            {isPumpOn ? `Active Drawdown (Cone Radius: 185m)` : 'Hydrostatic Equilibrium (Rebound Active)'}
          </div>
          <div className="text-[10px] text-emerald-400 mt-0.5">
            Discharge: {selectedBorewell.flowRateLps} L/s · Cumulative: {selectedBorewell.todayExtractionLiters.toLocaleString()} L
          </div>
        </div>
      </div>

      {/* Sensor Drilldown Modal if clicked on a borehole sensor */}
      {activeSensorModal && (
        <div className="absolute inset-0 z-30 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#11221C] border border-emerald-800/80 rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-950/80">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span className="font-bold text-white text-sm">{activeSensorModal.name}</span>
              </div>
              <button onClick={() => setActiveSensorModal(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 rounded-lg bg-[#070e0c]">
                <span className="text-slate-500 block text-[9px]">STATUS</span>
                <span className="font-bold text-emerald-400 uppercase">{activeSensorModal.status}</span>
              </div>
              <div className="p-2 rounded-lg bg-[#070e0c]">
                <span className="text-slate-500 block text-[9px]">BATTERY</span>
                <span className="font-bold text-white">{activeSensorModal.batteryPercent}% (Solar Backed)</span>
              </div>
              <div className="p-2 rounded-lg bg-[#070e0c]">
                <span className="text-slate-500 block text-[9px]">SIGNAL RSSI</span>
                <span className="font-bold text-white">{activeSensorModal.signalRssiDbm} dBm</span>
              </div>
              <div className="p-2 rounded-lg bg-[#070e0c]">
                <span className="text-slate-500 block text-[9px]">CALIBRATION</span>
                <span className="font-bold text-slate-300">{activeSensorModal.calibrationStatus}</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-[#070e0c] border border-emerald-950/80">
              <span className="text-[10px] text-slate-500 block mb-1">RAW TELEMETRY FRAME (Modbus RTU)</span>
              <span className="text-emerald-400 text-[10px] break-all">{activeSensorModal.rawPayloadSample}</span>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => setActiveSensorModal(null)}
                className="px-4 py-1.5 rounded-lg bg-[#16382B] text-white hover:bg-emerald-900 transition-colors text-xs font-semibold"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
