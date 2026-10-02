import React, { useState } from 'react';
import {
  Bell,
  Sun,
  Moon,
  Zap,
  ChevronDown,
  X,
  Radio,
  Settings,
  Clock,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { useJalRakshak } from '../../context/JalRakshakContext';

export const Topbar: React.FC = () => {
  const {
    borewells,
    selectedBorewellId,
    setSelectedBorewellId,
    selectedBorewell,
    setActiveTab,
    theme,
    toggleTheme,
    notifications,
    markNotificationRead,
    clearAllNotifications,
    isSimulating,
    activeScenario,
    setIsSimModalOpen,
    liveTick,
  } = useJalRakshak();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showLocationSelect, setShowLocationSelect] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="h-16 px-4 md:px-6 bg-[#08100D]/95 backdrop-blur-md border-b border-emerald-950/80 flex items-center justify-between sticky top-0 z-40 select-none text-slate-100">
      {/* Left: Brand + Context (Borewell location, sync status) */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#168AAD] to-[#2E7D5B] flex items-center justify-center text-white shadow-sm font-bold text-sm">
            JR
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-white text-base">
                JalRakshak
              </span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/40 hidden sm:inline">
                Groundwater IoT
              </span>
            </div>
          </div>
        </div>

        <div className="h-5 w-[1px] bg-emerald-950 hidden sm:block" />

        {/* System Context: Selected Borewell / Location */}
        <div className="relative">
          <button
            onClick={() => setShowLocationSelect(!showLocationSelect)}
            className="flex items-center gap-2 text-xs font-mono text-slate-200 hover:text-white px-2.5 py-1.5 rounded-lg bg-[#0e1d17] border border-emerald-950/80 hover:border-emerald-800/60 transition-colors"
            title="Switch Monitored Borewell Node"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                selectedBorewell.status === 'warning'
                  ? 'bg-amber-400 animate-pulse'
                  : 'bg-emerald-400 animate-pulse'
              }`}
            />
            <span className="font-semibold text-white">
              {selectedBorewell.id}
            </span>
            <span className="text-slate-400 hidden sm:inline">·</span>
            <span className="text-slate-400 text-[11px] truncate max-w-[140px] hidden sm:inline">
              {selectedBorewell.location.split(' - ')[0]}
            </span>
            <ChevronDown className="w-3.5 h-3.5 opacity-60 text-slate-400" />
          </button>

          {showLocationSelect && (
            <div className="absolute left-0 mt-1.5 w-72 bg-[#11221C] rounded-xl shadow-2xl border border-emerald-900/80 py-1.5 z-50 text-xs font-mono">
              <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-slate-500 border-b border-emerald-950/60 flex items-center justify-between">
                <span>Select Field Borewell</span>
                <span className="text-emerald-500 font-semibold">5 Nodes Monitored</span>
              </div>
              {borewells.map((b) => (
                <button
                  key={b.id}
                  onClick={() => {
                    setSelectedBorewellId(b.id);
                    setShowLocationSelect(false);
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-emerald-900/30 transition-colors ${
                    b.id === selectedBorewellId ? 'font-bold text-[#78E08F] bg-emerald-950/40' : 'text-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold">{b.id}</span>
                      <span className="text-[10px] text-slate-500">({b.aquiferType.split(' ')[0]})</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-sans truncate max-w-[150px]">
                      {b.location}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{b.waterLevelMeters} m</div>
                    <div className={`text-[10px] uppercase font-semibold ${b.status === 'warning' ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {b.status}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Center/Context telemetry indicators: LIVE + Sync timer */}
      <div className="hidden md:flex items-center gap-3 font-mono text-xs text-slate-300">
        {/* Live Status indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-bold tracking-wide">LIVE TELEMETRY</span>
        </div>

        {/* Last sync time */}
        <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
          <Clock className="w-3.5 h-3.5 text-[#168AAD]" />
          <span>Last sync: <strong className="text-slate-200">{selectedBorewell.lastUpdatedSecondsAgo}s ago</strong></span>
        </div>
      </div>

      {/* Right: Global System Controls */}
      <div className="flex items-center gap-2 sm:gap-3 font-mono text-xs">
        {/* Global LIVE / SIMULATION Mode Controller */}
        <button
          onClick={() => setIsSimModalOpen(true)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
            isSimulating
              ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 animate-pulse'
              : 'bg-[#0e1d17] border-emerald-950/90 text-slate-300 hover:text-white hover:border-emerald-800/60'
          }`}
          title="Digital Twin Simulation Controller"
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">
            {isSimulating ? `SIM: ${activeScenario?.replace('_', ' ').toUpperCase()}` : 'LIVE / SIMULATION'}
          </span>
          <span className="sm:hidden">
            {isSimulating ? 'SIM' : 'SIM'}
          </span>
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-emerald-950/50 relative transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#08100D]" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#11221C] rounded-2xl shadow-2xl border border-emerald-900/80 p-3.5 z-50 text-xs font-mono">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-emerald-950/60">
                <span className="font-bold text-white">Hydrological & Sensor Alerts</span>
                <div className="flex items-center gap-2">
                  <button onClick={clearAllNotifications} className="text-[10px] text-slate-400 hover:text-white">
                    Clear all
                  </button>
                  <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      markNotificationRead(n.id);
                      if (n.linkTab) setActiveTab(n.linkTab);
                      setShowNotifications(false);
                    }}
                    className={`p-2.5 rounded-lg cursor-pointer transition-colors ${
                      n.read
                        ? 'bg-[#070e0c] text-slate-400'
                        : 'bg-emerald-950/50 text-slate-200 border-l-2 border-amber-500'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-bold text-white truncate">{n.title}</span>
                      <span className="text-[10px] text-slate-500 shrink-0">{n.time}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-slate-300 font-sans">
                      {n.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-emerald-950/50 transition-colors"
          aria-label="Toggle theme"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
        </button>

        {/* System Settings Shortcut */}
        <button
          onClick={() => setActiveTab('settings')}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-emerald-950/50 transition-colors hidden sm:block"
          aria-label="Settings"
          title="System & Connection Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
