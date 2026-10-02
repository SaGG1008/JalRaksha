import React from 'react';
import { AquiferCommandCenter } from '../components/aquifer/AquiferCommandCenter';
import { SystemStatePanel } from '../components/aquifer/SystemStatePanel';
import { TelemetryDock } from '../components/aquifer/TelemetryDock';
import { useJalRakshak } from '../context/JalRakshakContext';

export const OverviewPage: React.FC = () => {
  const { selectedBorewell, isSimulating, activeScenario } = useJalRakshak();

  return (
    <div className="space-y-5">
      {/* Simulation Active Banner if triggered */}
      {isSimulating && (
        <div className="bg-amber-500/15 border border-amber-500/40 rounded-2xl px-4 py-2.5 flex items-center justify-between text-xs text-amber-200 font-mono">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span className="font-bold text-amber-300">
              PHYSICAL DIGITAL TWIN SIMULATION ACTIVE:
            </span>
            <span>
              Target {selectedBorewell.id} is responding to simulated scenario: <strong className="text-white uppercase">{activeScenario?.replace('_', ' ')}</strong>.
            </span>
          </div>
          <span className="text-[10px] text-amber-400 uppercase hidden sm:inline">
            Physics Feedback Engaged
          </span>
        </div>
      )}

      {/* Main Command Center Grid:
          Left (approx 62% on desktop): Underground Aquifer Visualization
          Right (approx 38% on desktop): System State Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-8 flex flex-col">
          <AquiferCommandCenter />
        </div>
        <div className="lg:col-span-4 flex flex-col">
          <SystemStatePanel />
        </div>
      </div>

      {/* Bottom Telemetry Dock: Dual Synchronized Time-Series & Pump Duty Blocks */}
      <div>
        <TelemetryDock />
      </div>
    </div>
  );
};
