import React, { useState } from 'react';
import { Network, MapPin, CheckCircle2, AlertTriangle, ShieldAlert, WifiOff, ArrowRight } from 'lucide-react';
import { useJalRakshak } from '../context/JalRakshakContext';
import { BorewellNode } from '../types';

export const NetworkPage: React.FC = () => {
  const { borewells, selectedBorewellId, setSelectedBorewellId, setActiveTab } = useJalRakshak();
  const [statusFilter, setStatusFilter] = useState<'All' | 'Healthy' | 'Warning' | 'Critical' | 'Offline'>('All');

  const filteredBorewells = borewells.filter((b) => {
    if (statusFilter === 'All') return true;
    return b.status.toLowerCase() === statusFilter.toLowerCase();
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-emerald-950/60">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 dark:text-emerald-500/70">
            DISTRIBUTED MONITORING INFRASTRUCTURE
          </span>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Central Borewell Network Topology
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            5 Telemetered Production & Observation Piezometer Wells across Sector 1–5
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-1 p-1 bg-white dark:bg-[#11221C] rounded-xl border border-slate-200 dark:border-emerald-950/60 text-xs font-mono">
          {(['All', 'Healthy', 'Warning', 'Critical', 'Offline'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                statusFilter === status
                  ? 'bg-slate-900 text-white dark:bg-[#16382B] dark:text-[#78E08F] font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Spatial Topology Visual Canvas */}
      <div className="bg-white dark:bg-[#11221C] rounded-2xl border border-slate-200 dark:border-emerald-950/40 p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-emerald-950/60 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              GEOSPATIAL PIEZOMETER GRID
            </span>
            <span className="text-xs text-slate-500 font-mono">
              (Pune Basin - Semi-Arid Fractured Basalt)
            </span>
          </div>
          <span className="text-xs font-mono text-slate-400">Mesh Telemetry Link: 100% Operational</span>
        </div>

        {/* Interactive Schematic Map Canvas */}
        <div className="relative w-full h-72 bg-[#F6F8F5] dark:bg-[#08100D] rounded-xl border border-slate-200/80 dark:border-emerald-950/80 overflow-hidden select-none">
          <svg viewBox="0 0 800 320" className="w-full h-full">
            {/* Grid background lines */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" className="text-slate-200/60 dark:text-emerald-950/40" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="800" height="320" fill="url(#grid)" />

            {/* Aquifer Catchment Boundaries */}
            <path
              d="M 50 180 Q 200 80 400 120 T 750 150 L 750 300 L 50 300 Z"
              fill="currentColor"
              className="text-[#168AAD]/5 dark:text-[#168AAD]/10"
            />
            <text x="70" y="270" fill="currentColor" className="text-slate-400 dark:text-emerald-900/80 font-mono text-[11px]">
              Sub-Basin Hydraulic Boundary
            </text>

            {/* Interconnecting mesh telemetry paths */}
            <line x1="160" y1="90" x2="380" y2="180" stroke="#168AAD" strokeWidth="1" strokeDasharray="3,3" opacity="0.4" />
            <line x1="380" y1="180" x2="620" y2="120" stroke="#168AAD" strokeWidth="1" strokeDasharray="3,3" opacity="0.4" />
            <line x1="280" y1="230" x2="380" y2="180" stroke="#168AAD" strokeWidth="1" strokeDasharray="3,3" opacity="0.4" />
            <line x1="520" y1="240" x2="380" y2="180" stroke="#168AAD" strokeWidth="1" strokeDasharray="3,3" opacity="0.4" />

            {/* Borewell Nodes */}
            {[
              { id: 'BWL-01', x: 160, y: 90, status: 'healthy', level: 16.2 },
              { id: 'BWL-02', x: 280, y: 230, status: 'healthy', level: 22.1 },
              { id: 'BWL-03', x: 380, y: 180, status: 'warning', level: 18.4 },
              { id: 'BWL-04', x: 520, y: 240, status: 'healthy', level: 12.8 },
              { id: 'BWL-05', x: 620, y: 120, status: 'healthy', level: 26.5 },
            ].map((node) => {
              const isSelected = selectedBorewellId === node.id;
              const isWarning = node.status === 'warning';
              return (
                <g
                  key={node.id}
                  className="cursor-pointer transition-transform hover:scale-110"
                  onClick={() => setSelectedBorewellId(node.id)}
                >
                  {/* Ping animation for selected or warning */}
                  {(isSelected || isWarning) && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="16"
                      fill={isWarning ? '#F59E0B' : '#168AAD'}
                      opacity="0.25"
                      className="animate-ping"
                    />
                  )}

                  {/* Outer circle */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isSelected ? 10 : 8}
                    fill={isWarning ? '#D97706' : '#2E7D5B'}
                    stroke="#FFFFFF"
                    strokeWidth="2"
                  />

                  {/* Label */}
                  <text
                    x={node.x}
                    y={node.y - 14}
                    textAnchor="middle"
                    fill="currentColor"
                    className="text-[11px] font-mono font-bold text-slate-800 dark:text-white"
                  >
                    {node.id}
                  </text>
                  <text
                    x={node.x}
                    y={node.y + 22}
                    textAnchor="middle"
                    fill="currentColor"
                    className="text-[9px] font-mono text-slate-500 dark:text-slate-400"
                  >
                    {node.level}m
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Borewell Inventory Table (Exact prompt format) */}
      <div className="bg-white dark:bg-[#11221C] rounded-2xl border border-slate-200 dark:border-emerald-950/40 p-5 shadow-xs">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
          All Monitored Borewell Nodes
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-200 dark:border-emerald-950/60 text-slate-400 text-[10px] uppercase">
                <th className="py-2.5 px-3">Borewell Node</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Water Level</th>
                <th className="py-2.5 px-3">Aquifer Health</th>
                <th className="py-2.5 px-3">Today's Extraction</th>
                <th className="py-2.5 px-3">Last Sync</th>
                <th className="py-2.5 px-3">Active Anomaly</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-emerald-950/40">
              {filteredBorewells.map((b) => {
                const isSelected = b.id === selectedBorewellId;
                const isWarning = b.status === 'warning';
                return (
                  <tr
                    key={b.id}
                    className={`hover:bg-slate-50 dark:hover:bg-emerald-950/20 transition-colors ${
                      isSelected ? 'bg-emerald-50/40 dark:bg-emerald-950/30' : ''
                    }`}
                  >
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900 dark:text-white">{b.id}</div>
                      <div className="text-[10px] text-slate-400 font-sans truncate max-w-[160px]">
                        {b.name}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                          isWarning
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isWarning ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-200">
                      {b.waterLevelMeters.toFixed(1)} m
                    </td>
                    <td className="py-3 px-3 font-bold text-[#168AAD] dark:text-[#78E08F]">
                      {b.healthScore} / 100
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                      {b.todayExtractionLiters.toLocaleString()} L
                    </td>
                    <td className="py-3 px-3 text-slate-400 text-[11px]">
                      {b.lastUpdatedSecondsAgo}s ago
                    </td>
                    <td className="py-3 px-3">
                      {b.activeAnomaliesCount > 0 ? (
                        <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Rapid Drawdown
                        </span>
                      ) : (
                        <span className="text-slate-400">None</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => {
                          setSelectedBorewellId(b.id);
                          setActiveTab('overview');
                        }}
                        className="px-2.5 py-1 rounded-md text-[11px] font-semibold text-[#168AAD] dark:text-[#78E08F] hover:bg-[#168AAD]/10 transition-colors"
                      >
                        Focus Node →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
