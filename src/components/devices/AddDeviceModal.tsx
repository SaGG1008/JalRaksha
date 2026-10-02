import React, { useState } from 'react';
import {
  X,
  Radio,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Activity,
  Layers,
  Cpu,
  Wifi,
  Sliders,
  ShieldCheck,
} from 'lucide-react';
import { DeviceType, DeviceProtocol, IotDevice } from '../../types';
import { useJalRakshak } from '../../context/JalRakshakContext';

interface AddDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddDeviceModal: React.FC<AddDeviceModalProps> = ({ isOpen, onClose }) => {
  const { borewells, addDevice } = useJalRakshak();
  const [step, setStep] = useState<number>(1);

  // Form State
  const [deviceType, setDeviceType] = useState<DeviceType>('Water Level Sensor');
  const [deviceId, setDeviceId] = useState<string>('DEV-WLS-05');
  const [deviceName, setDeviceName] = useState<string>('Observation Well Level Probe');
  const [borewellId, setBorewellId] = useState<string>('BWL-05');
  const [protocol, setProtocol] = useState<DeviceProtocol>('LoRaWAN');
  const [depthMeters, setDepthMeters] = useState<number>(65);
  const [samplingIntervalSec, setSamplingIntervalSec] = useState<number>(30);
  const [calibrationDate, setCalibrationDate] = useState<string>('2026-10-02');
  const [isPinging, setIsPinging] = useState<boolean>(false);
  const [pingSuccess, setPingSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const deviceTypes: DeviceType[] = [
    'Water Level Sensor',
    'Flow Sensor',
    'TDS / EC Sensor',
    'Temperature Sensor',
    'Pressure Sensor',
    'Pump Controller',
    'IoT Gateway',
  ];

  const protocols: DeviceProtocol[] = [
    'LoRaWAN',
    'MQTT',
    'Modbus RS-485',
    '4G/LTE',
    'Wi-Fi',
  ];

  const handleTestPing = () => {
    setIsPinging(true);
    setTimeout(() => {
      setIsPinging(false);
      setPingSuccess(true);
    }, 900);
  };

  const handleDeploy = () => {
    const targetBorewell = borewells.find((b) => b.id === borewellId);
    const newDevice: IotDevice = {
      id: deviceId.trim() || `DEV-${Date.now().toString().slice(-4)}`,
      name: deviceName.trim() || `${deviceType} - ${borewellId}`,
      type: deviceType,
      borewellId: borewellId,
      borewellName: targetBorewell?.name || borewellId,
      status: 'ONLINE',
      model: 'JalRakshak Node v2 Pro',
      firmware: 'v2.0.1',
      samplingIntervalSec: samplingIntervalSec,
      protocol: protocol,
      gatewayId: 'GW-001',
      batteryPercent: 100,
      signalRssiDbm: -68,
      signalQualityPct: 88,
      latencyMs: 36,
      packetLossPct: 0.1,
      deviceTempC: 28.4,
      lastSyncSecondsAgo: 0,
      calibrationStatus: 'VALID',
      calibrationDate: calibrationDate,
      nextCalibrationDate: '2027-04-02',
      currentReadingValue: deviceType === 'Water Level Sensor' ? '17.8' : deviceType === 'Flow Sensor' ? '3.2' : '405',
      currentReadingUnit: deviceType === 'Water Level Sensor' ? 'm' : deviceType === 'Flow Sensor' ? 'L/s' : 'ppm',
      readingDeltaToday: 'Provisioned today',
      dataQualityPct: 99.5,
      depthMeters: depthMeters,
      macOrImei: `70:B3:D5:7E:D0:${Math.floor(Math.random() * 89 + 10)}:${Math.floor(Math.random() * 89 + 10)}`,
      history: [
        { timestamp: '12:00', value: 17.8 },
        { timestamp: '14:00', value: 17.8 },
        { timestamp: '16:00', value: 17.8 },
      ],
    };

    addDevice(newDevice);
    onClose();
    setStep(1);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 font-mono select-none">
      <div className="bg-[#0B1512] rounded-3xl border border-emerald-900/80 max-w-xl w-full p-6 shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-emerald-950/80 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#16382B] text-[#78E08F] flex items-center justify-center font-bold">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase text-emerald-500 font-bold tracking-wider">
                FIELD PROVISIONING WIZARD
              </span>
              <h2 className="text-sm font-bold text-white tracking-tight">
                Add & Provision IoT Device
              </h2>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-5 px-1">
          <span className={step >= 1 ? 'text-[#78E08F] font-bold' : ''}>1. Type</span>
          <span>→</span>
          <span className={step >= 2 ? 'text-[#78E08F] font-bold' : ''}>2. ID & Well</span>
          <span>→</span>
          <span className={step >= 3 ? 'text-[#78E08F] font-bold' : ''}>3. Protocol</span>
          <span>→</span>
          <span className={step >= 4 ? 'text-[#78E08F] font-bold' : ''}>4. Config</span>
          <span>→</span>
          <span className={step >= 5 ? 'text-[#78E08F] font-bold' : ''}>5. Deploy</span>
        </div>

        {/* Step 1: Device Type */}
        {step === 1 && (
          <div className="space-y-3">
            <label className="text-xs font-semibold text-white block">
              Select Subsurface / Surface Sensor Type:
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {deviceTypes.map((t) => (
                <button
                  key={t}
                  onClick={() => setDeviceType(t)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    deviceType === t
                      ? 'border-[#78E08F] bg-[#16382B] text-white font-bold'
                      : 'border-emerald-950/80 bg-[#070e0c] text-slate-300 hover:bg-emerald-950/30'
                  }`}
                >
                  <div className="truncate">{t}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: ID & Borewell Assignment */}
        {step === 2 && (
          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-300 block mb-1">Device Serial / Node ID:</label>
              <input
                type="text"
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#070e0c] border border-emerald-950/80 text-white font-mono focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1">Device Descriptive Name:</label>
              <input
                type="text"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#070e0c] border border-emerald-950/80 text-white font-mono focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1">Host Borewell Node:</label>
              <select
                value={borewellId}
                onChange={(e) => setBorewellId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#070e0c] border border-emerald-950/80 text-white font-mono focus:border-emerald-500 focus:outline-hidden"
              >
                {borewells.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.id} — {b.name} ({b.location})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Step 3: Connection Protocol */}
        {step === 3 && (
          <div className="space-y-3">
            <label className="text-xs font-semibold text-white block">
              Field Telemetry Protocol:
            </label>
            <div className="space-y-2 text-xs">
              {protocols.map((p) => (
                <button
                  key={p}
                  onClick={() => setProtocol(p)}
                  className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                    protocol === p
                      ? 'border-[#78E08F] bg-[#16382B] text-white font-bold'
                      : 'border-emerald-950/80 bg-[#070e0c] text-slate-300 hover:bg-emerald-950/30'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Wifi className="w-4 h-4 text-[#168AAD]" />
                    <span>{p}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {p === 'LoRaWAN' ? '865 MHz Mesh' : p === 'Modbus RS-485' ? 'Wired RTU' : 'IP Direct'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Sensor Configuration */}
        {step === 4 && (
          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-300">Deployment Depth:</span>
                <span className="text-[#38BDF8] font-bold">{depthMeters} meters below surface</span>
              </div>
              <input
                type="range"
                min="0"
                max="95"
                step="5"
                value={depthMeters}
                onChange={(e) => setDepthMeters(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-300">Sampling Cadence:</span>
                <span className="text-white font-bold">{samplingIntervalSec} seconds</span>
              </div>
              <input
                type="range"
                min="5"
                max="120"
                step="5"
                value={samplingIntervalSec}
                onChange={(e) => setSamplingIntervalSec(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1">Calibration Certificate Date:</label>
              <input
                type="date"
                value={calibrationDate}
                onChange={(e) => setCalibrationDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#070e0c] border border-emerald-950/80 text-white font-mono"
              />
            </div>
          </div>
        )}

        {/* Step 5: Test Connection & Deploy */}
        {step === 5 && (
          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-[#070e0c] border border-emerald-950/80 space-y-1.5">
              <div className="text-[10px] text-emerald-400 font-bold uppercase">
                DEVICE PROVISIONING SUMMARY
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Node ID:</span>
                <span className="font-bold text-white">{deviceId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Assigned Borewell:</span>
                <span className="font-bold text-white">{borewellId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Protocol:</span>
                <span className="font-bold text-[#38BDF8]">{protocol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Depth / Interval:</span>
                <span className="font-bold text-white">{depthMeters}m / {samplingIntervalSec}s</span>
              </div>
            </div>

            {/* Test Connection Button */}
            <div>
              {pingSuccess ? (
                <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Connection Verified! Gateway ACK received (34ms round-trip).</span>
                </div>
              ) : (
                <button
                  onClick={handleTestPing}
                  disabled={isPinging}
                  className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-emerald-950/80 font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <Activity className="w-3.5 h-3.5 text-[#168AAD]" />
                  <span>{isPinging ? 'Pinging Gateway RF Link...' : 'Test Connection Before Deploying'}</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Navigation Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-emerald-950/80 mt-5">
          {step > 1 ? (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="py-1.5 px-4 rounded-xl bg-[#16382B] hover:bg-emerald-900 text-white font-bold text-xs flex items-center gap-1 transition-colors"
            >
              <span>Next Step</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          ) : (
            <button
              onClick={handleDeploy}
              className="py-2 px-5 rounded-xl bg-gradient-to-r from-[#168AAD] to-[#2E7D5B] hover:opacity-95 text-white font-bold text-xs flex items-center gap-1.5 transition-opacity shadow-md"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Deploy to Borewell</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
