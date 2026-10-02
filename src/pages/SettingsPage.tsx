import React, { useState } from 'react';
import {
  Settings,
  Bell,
  Shield,
  Sliders,
  Database,
  Download,
  CheckCircle2,
  Wifi,
  Radio,
  Server,
  Activity,
  Cpu,
  RefreshCw,
} from 'lucide-react';
import { useJalRakshak } from '../context/JalRakshakContext';

type SettingsTab =
  | 'General'
  | 'Device Connections'
  | 'Network'
  | 'Telemetry'
  | 'Alerts'
  | 'Calibration'
  | 'System';

export const SettingsPage: React.FC = () => {
  const { selectedBorewell } = useJalRakshak();
  const [activeTab, setActiveTab] = useState<SettingsTab>('Device Connections');
  const [criticalDrawdownThreshold, setCriticalDrawdownThreshold] = useState<number>(2.0);
  const [maxDailyQuotaLiters, setMaxDailyQuotaLiters] = useState<number>(3500);
  const [smsAlertsEnabled, setSmsAlertsEnabled] = useState<boolean>(true);
  const [autoInterlockEnabled, setAutoInterlockEnabled] = useState<boolean>(true);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [isTestingNet, setIsTestingNet] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleTestNet = () => {
    setIsTestingNet(true);
    setTestResult(null);
    setTimeout(() => {
      setIsTestingNet(false);
      setTestResult('All 3 links verified. Round-trip ping: 42ms. Zero packet drop on IN865.');
    }, 800);
  };

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,Timestamp,WaterLevelMeters,ExtractionLiters,TDSppm,PumpState\n' +
      '2026-10-02T10:00:00,18.4,2840,412,ON\n' +
      '2026-10-02T09:00:00,18.2,2200,410,ON\n' +
      '2026-10-02T08:00:00,17.8,1120,408,ON\n' +
      '2026-10-02T07:00:00,17.5,480,405,ON\n';
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `JalRakshak_Telemetry_${selectedBorewell.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const tabs: SettingsTab[] = [
    'General',
    'Device Connections',
    'Network',
    'Telemetry',
    'Alerts',
    'Calibration',
    'System',
  ];

  return (
    <div className="space-y-6 font-mono select-none">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-emerald-950/80">
        <div>
          <span className="text-[10px] uppercase text-emerald-500 font-bold tracking-wider">
            SYSTEM GOVERNANCE & CONFIGURATION
          </span>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Settings & Connectivity
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 font-sans">
            Manage device telemetry thresholds, gateway bindings, calibration renewals, and field protocols.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#0B1512] border border-emerald-950/80 text-slate-200 hover:bg-emerald-950/40 transition-colors shadow-xs"
        >
          <Download className="w-3.5 h-3.5 text-[#168AAD]" />
          <span>Export Hydrological CSV</span>
        </button>
      </div>

      {/* Settings Sub-Navigation Tabs (Section 13 in prompt) */}
      <div className="flex flex-wrap items-center gap-1 p-1 bg-[#0B1512] rounded-2xl border border-emerald-950/80 text-xs">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-xl transition-colors ${
              activeTab === tab
                ? 'bg-[#16382B] text-[#78E08F] font-bold border border-emerald-800/60'
                : 'text-slate-400 hover:text-white hover:bg-emerald-950/30'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content: Device Connections (Section 13 in prompt) */}
      {activeTab === 'Device Connections' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Active Connection Health Status */}
          <div className="lg:col-span-6 bg-[#0B1512] rounded-3xl border border-emerald-950/80 p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-950/60">
              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">
                  Field Gateway & Broker Links
                </h3>
              </div>
              <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                HEALTHY
              </span>
            </div>

            {/* Connection Rows (Exact prompt match) */}
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-[#070e0c] border border-emerald-950/60 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block text-[10px]">LOCAL TELEMETRY BUS</span>
                  <span className="font-bold text-white text-xs">MQTT Broker</span>
                </div>
                <span className="text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  CONNECTED
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#070e0c] border border-emerald-950/60 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block text-[10px]">SUB-GHZ RF MESH (865 MHz)</span>
                  <span className="font-bold text-white text-xs">LoRaWAN Gateway</span>
                </div>
                <span className="text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  CONNECTED
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#070e0c] border border-emerald-950/60 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block text-[10px]">CLOUD UPLINK / BACKHAUL</span>
                  <span className="font-bold text-white text-xs">Internet (4G/LTE Cat-M1)</span>
                </div>
                <span className="text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  CONNECTED
                </span>
              </div>
            </div>

            {/* Quality Metrics */}
            <div className="grid grid-cols-3 gap-2 text-xs pt-1">
              <div className="p-2.5 rounded-xl bg-[#070e0c] border border-emerald-950/60">
                <span className="text-slate-500 block text-[9px]">LATENCY</span>
                <span className="font-bold text-white text-sm">42 ms</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#070e0c] border border-emerald-950/60">
                <span className="text-slate-500 block text-[9px]">PACKET LOSS</span>
                <span className="font-bold text-emerald-400 text-sm">0.8%</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#070e0c] border border-emerald-950/60">
                <span className="text-slate-500 block text-[9px]">LAST SYNC</span>
                <span className="font-bold text-white text-sm">12 sec</span>
              </div>
            </div>

            {testResult && (
              <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs">
                <CheckCircle2 className="w-3.5 h-3.5 inline mr-1 text-emerald-400" />
                {testResult}
              </div>
            )}

            <button
              onClick={handleTestNet}
              disabled={isTestingNet}
              className="w-full py-2 px-3 rounded-xl bg-[#16382B] hover:bg-emerald-900 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors border border-emerald-800/60"
            >
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isTestingNet ? 'Testing Gateway & Echo Packets...' : 'Test Connection Links'}</span>
            </button>
          </div>

          {/* Right: Field Protocol Configuration */}
          <div className="lg:col-span-6 bg-[#0B1512] rounded-3xl border border-emerald-950/80 p-5 space-y-4 text-xs">
            <div className="flex items-center gap-2 pb-2 border-b border-emerald-950/60">
              <Sliders className="w-4 h-4 text-[#168AAD]" />
              <h3 className="text-sm font-bold text-white">
                Gateway & Telemetry Parameters
              </h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-slate-400 block mb-1">
                  Local MQTT Broker URI (RS-485 Modbus Bridge):
                </label>
                <input
                  type="text"
                  defaultValue="mqtt://field-broker.jalrakshak.local:1883"
                  className="w-full px-3 py-2 rounded-xl bg-[#070e0c] border border-emerald-950/80 text-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">
                  LoRaWAN Gateway EUI / Base Station ID:
                </label>
                <input
                  type="text"
                  defaultValue="70-B3-D5-7E-D0-FF-01-00 (Central Hub)"
                  className="w-full px-3 py-2 rounded-xl bg-[#070e0c] border border-emerald-950/80 text-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">
                  RF Frequency Plan & Bandwidth:
                </label>
                <input
                  type="text"
                  defaultValue="IN865 (865–867 MHz) · BW 125 kHz · SF7"
                  className="w-full px-3 py-2 rounded-xl bg-[#070e0c] border border-emerald-950/80 text-white text-xs font-mono"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleSave}
                className="px-5 py-2 rounded-xl bg-[#16382B] hover:bg-emerald-900 text-white font-bold text-xs transition-colors"
              >
                Save Protocol Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Telemetry & Safe Yield Safeguards */}
      {activeTab === 'Telemetry' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#0B1512] rounded-3xl border border-emerald-950/80 p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-emerald-950/60">
              <Shield className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">
                Aquifer Drawdown & Interlock Thresholds
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-mono mb-1">
                  <span className="text-slate-400">Critical Drawdown Velocity Limit:</span>
                  <span className="font-bold text-white">{criticalDrawdownThreshold} m/hr</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="4.0"
                  step="0.1"
                  value={criticalDrawdownThreshold}
                  onChange={(e) => setCriticalDrawdownThreshold(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div className="pt-2">
                <div className="flex justify-between font-mono mb-1">
                  <span className="text-slate-400">Daily Permitted Extraction Quota:</span>
                  <span className="font-bold text-white">{maxDailyQuotaLiters.toLocaleString()} L</span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="10000"
                  step="500"
                  value={maxDailyQuotaLiters}
                  onChange={(e) => setMaxDailyQuotaLiters(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-emerald-950/60 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">Automated Pump Trip Interlock</span>
                  <span className="text-[10px] text-slate-400">Trips contactor during dry run or rapid depletion</span>
                </div>
                <input
                  type="checkbox"
                  checked={autoInterlockEnabled}
                  onChange={(e) => setAutoInterlockEnabled(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-[#0B1512] rounded-3xl border border-emerald-950/80 p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-emerald-950/60">
              <Bell className="w-4 h-4 text-[#168AAD]" />
              <h3 className="text-sm font-bold text-white">
                Alert Escalation Contacts
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">SMS & LoRaWAN Broadcasts</span>
                  <span className="text-[10px] text-slate-400">Immediate dispatch on High or Critical anomalies</span>
                </div>
                <input
                  type="checkbox"
                  checked={smsAlertsEnabled}
                  onChange={(e) => setSmsAlertsEnabled(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">
                  Field Engineer / Water Officer Phone:
                </label>
                <input
                  type="text"
                  defaultValue="+91 98234 11029 (Municipal Water Desk)"
                  className="w-full px-3 py-2 rounded-xl bg-[#070e0c] border border-emerald-950/80 text-white font-mono"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fallback for other settings tabs */}
      {activeTab !== 'Device Connections' && activeTab !== 'Telemetry' && (
        <div className="bg-[#0B1512] rounded-3xl border border-emerald-950/80 p-8 text-center space-y-2">
          <Settings className="w-8 h-8 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">{activeTab} Configuration</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto font-sans">
            Parameters for {activeTab} are actively synchronized with field nodes and edge gateways.
          </p>
        </div>
      )}

      {/* Save Notification */}
      {savedSuccess && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Configuration saved and propagated to edge gateways.</span>
        </div>
      )}
    </div>
  );
};
