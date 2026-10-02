import React from 'react';
import {
  ArrowRight,
  Droplets,
  Cpu,
  Layers,
  ShieldCheck,
  AlertTriangle,
  CloudRain,
  Activity,
  CheckCircle2,
  Zap,
  Play,
  BarChart3,
  Server,
  Radio,
} from 'lucide-react';
import { useJalRakshak } from '../../context/JalRakshakContext';
import { BorewellCrossSection } from '../groundwater/BorewellCrossSection';

export const PublicLandingPage: React.FC = () => {
  const { setViewMode, setIsSimModalOpen, setActiveTab } = useJalRakshak();

  return (
    <div className="space-y-16 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative pt-6 sm:pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 text-[#123C2A] dark:bg-emerald-950/80 dark:text-emerald-300 text-xs font-mono font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Techfest InnovateX · Theme 1: IoT Underground Water</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
              UNDERSTAND <br className="hidden sm:inline" />
              WHAT'S HAPPENING <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#168AAD] to-[#2E7D5B]">
                UNDERGROUND.
              </span>
            </h1>

            <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg">
              Intelligent groundwater monitoring for a water-secure future. JalRakshak bridges sub-surface IoT telemetry, hydrogeological physics, and predictive anomaly intelligence to safeguard shared aquifers.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => setViewMode('dashboard')}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 dark:bg-[#16382B] text-white font-bold text-xs hover:bg-slate-800 dark:hover:bg-emerald-900 transition-colors shadow-md"
              >
                <span>Explore Live System</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsSimModalOpen(true)}
                className="flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-300 dark:border-emerald-950/80 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-emerald-950/40 text-xs font-bold transition-colors font-mono"
              >
                <Play className="w-3.5 h-3.5 fill-current text-amber-500" />
                <span>Launch Digital Twin Demo</span>
              </button>
            </div>

            {/* Pipeline Flow Banner in Hero */}
            <div className="p-3 bg-white dark:bg-[#11221C] rounded-xl border border-slate-200/80 dark:border-emerald-950/60 text-xs font-mono">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">
                The JalRakshak Intelligence Pipeline
              </div>
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-semibold">
                <span>Sensors</span>
                <span className="text-slate-300 dark:text-slate-700">↓</span>
                <span>Data</span>
                <span className="text-slate-300 dark:text-slate-700">↓</span>
                <span className="text-[#168AAD]">Intelligence</span>
                <span className="text-slate-300 dark:text-slate-700">↓</span>
                <span className="text-[#2E7D5B]">Action</span>
              </div>
            </div>
          </div>

          {/* Hero Visual: Animated Cross-Section */}
          <div className="lg:col-span-6">
            <BorewellCrossSection />
          </div>
        </div>
      </section>

      {/* 2. THE PROBLEM */}
      <section className="bg-white dark:bg-[#11221C] rounded-3xl border border-slate-200 dark:border-emerald-950/40 p-8 shadow-xs">
        <div className="max-w-2xl mb-8">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 dark:text-emerald-500/70">
            01. THE CRITICAL VULNERABILITY
          </span>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Groundwater Is Invisible, Unmeasured, and Depleting
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
            Over 85% of India's drinking water and 65% of irrigation relies on groundwater. Yet most borewells operate blind: pumps run without drawdown visibility, recharge structures remain unquantified, and critical cones of depression form unnoticed until borewells fail completely.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#0B1512]/60 border border-slate-200/80 dark:border-emerald-950/50 space-y-2">
            <span className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 block tabular-nums">
              80% +
            </span>
            <span className="font-bold text-slate-900 dark:text-white block font-sans">
              Blind Extraction
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
              Borewells are operated on arbitrary timers without hydrostatic feedback, causing premature aquifer depletion.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#0B1512]/60 border border-slate-200/80 dark:border-emerald-950/50 space-y-2">
            <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 block tabular-nums">
              0 Context
            </span>
            <span className="font-bold text-slate-900 dark:text-white block font-sans">
              Raw Data Silos
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
              Existing systems report isolated numbers (e.g. "18.4m") without explaining drawdown velocity or actionable recharge pathways.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#0B1512]/60 border border-slate-200/80 dark:border-emerald-950/50 space-y-2">
            <span className="text-2xl font-extrabold text-sky-600 dark:text-sky-400 block tabular-nums">
              84% Lost
            </span>
            <span className="font-bold text-slate-900 dark:text-white block font-sans">
              Unchanneled Recharge
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
              Precipitation runoff drains away because decision-makers lack real-time vadose infiltration intelligence.
            </p>
          </div>
        </div>
      </section>

      {/* 3 & 4. HOW JALRAKSHAK WORKS & SENSOR → INTELLIGENCE PIPELINE */}
      <section className="space-y-6">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 dark:text-emerald-500/70">
            02. ARCHITECTURE
          </span>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Sensor to Actionable Intelligence Architecture
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#11221C] border border-slate-200 dark:border-emerald-950/40 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center font-bold text-xs font-mono">
              01
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Subsurface Sensing</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Hydrostatic pressure transducers measure water level to 1mm precision; electromagnetic flow and 4-electrode conductivity probes monitor volume and TDS.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#11221C] border border-slate-200 dark:border-emerald-950/40 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 flex items-center justify-center font-bold text-xs font-mono">
              02
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">LoRaWAN Edge Mesh</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Low-power 865 MHz transceivers transmit telemetry packets up to 12 km through rugged agricultural terrain with zero reliance on local Wi-Fi.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#11221C] border border-slate-200 dark:border-emerald-950/40 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 flex items-center justify-center font-bold text-xs font-mono">
              03
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Hydrological Engine</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Calculates dynamic drawdown velocity, recovery hysteresis, and safe yield thresholds against historical diurnal baselines.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#11221C] border border-slate-200 dark:border-emerald-950/40 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center font-bold text-xs font-mono">
              04
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Prescriptive Action</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Delivers automated pump interlocks, smart recharge routing advisories, and quota compliance alerts directly to water managers.
            </p>
          </div>
        </div>
      </section>

      {/* 5, 6 & 7. GROUNDWATER INTELLIGENCE, ANOMALY DETECTION, RECHARGE INTELLIGENCE */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-[#11221C] border border-slate-200 dark:border-emerald-950/40 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#168AAD]/15 text-[#168AAD] flex items-center justify-center font-bold">
            <Activity className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Groundwater Intelligence
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Replaces raw numbers with context: water level depth, today's decline rate, expected diurnal range, and aquifer rebound velocity post-shutdown.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-[#11221C] border border-amber-300 dark:border-amber-900/50 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center font-bold">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Contextual Anomaly Engine
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Identifies sudden drawdown spikes, pump cavitation, dry-run electrical hazards, and water quality degradation with explicit root cause reasoning.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-[#11221C] border border-emerald-500/30 dark:border-emerald-900/50 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <CloudRain className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Managed Recharge Advisory
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Combines local rainfall events, soil saturation, and unsaturated zone storage capacity to compute actionable stormwater routing recommendations.
          </p>
        </div>
      </section>

      {/* 8, 9, 10, 11: IMPACT, SCALABILITY, TECHNOLOGY */}
      <section className="bg-white dark:bg-[#11221C] rounded-3xl border border-slate-200 dark:border-emerald-950/40 p-8 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-2">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Target Deployment Domains
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Built for rural panchayats, municipal water boards, industrial manufacturing parks, residential townships, and watershed conservation agencies.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Scalability & Open Standards
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Standard RS-485 Modbus RTU interface allows retrofitting onto any existing agricultural or industrial submersible borewell pump in under 45 minutes.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Environmental Impact
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Prevents pump motor dry burnouts, reduces regional cone of depression overlap, and maximizes aquifer replenishment from seasonal monsoon rain.
            </p>
          </div>
        </div>
      </section>

      {/* 12. DEMO CTA SECTION */}
      <section className="bg-gradient-to-br from-[#123C2A] to-[#155E75] text-white rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-xl">
        <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight max-w-xl mx-auto">
          Experience Live Groundwater Intelligence
        </h2>
        <p className="text-xs sm:text-sm text-emerald-100 max-w-lg mx-auto leading-relaxed">
          Test real-time hydrological scenarios, trigger simulated pump cavitation faults, inspect 7-day diurnal curves, and explore artificial recharge pathways.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setViewMode('dashboard')}
            className="px-6 py-3 rounded-xl bg-white text-[#123C2A] font-bold text-xs hover:bg-emerald-50 transition-colors shadow-md"
          >
            Open Mission Control Dashboard
          </button>
          <button
            onClick={() => setIsSimModalOpen(true)}
            className="px-5 py-3 rounded-xl bg-[#168AAD] hover:bg-[#168AAD]/90 text-white font-bold text-xs transition-colors font-mono"
          >
            Launch Digital Twin Simulator
          </button>
        </div>
      </section>
    </div>
  );
};
