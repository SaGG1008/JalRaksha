import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import {
  Anomaly,
  BorewellNode,
  GroundwaterDataPoint,
  IotDevice,
  RechargeAssessment,
  SensorTelemetry,
  SimulationScenarioId,
  PumpStatus,
} from '../types';
import {
  INITIAL_BOREWELLS,
  INITIAL_ANOMALIES,
  INITIAL_RECHARGE,
  INITIAL_SENSORS,
  INITIAL_DEVICES,
  HISTORICAL_7DAYS_DATA,
  SIMULATION_SCENARIOS,
} from '../data/initialData';

export type NavTab =
  | 'overview'
  | 'aquifer'
  | 'groundwater'
  | 'telemetry'
  | 'extraction'
  | 'water_quality'
  | 'recharge'
  | 'anomalies'
  | 'insights'
  | 'network'
  | 'devices'
  | 'sensors'
  | 'simulation'
  | 'settings';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'warning' | 'critical' | 'info';
  read: boolean;
  linkTab?: NavTab;
}

interface JalRakshakContextType {
  borewells: BorewellNode[];
  selectedBorewellId: string;
  setSelectedBorewellId: (id: string) => void;
  selectedBorewell: BorewellNode;
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  anomalies: Anomaly[];
  recharge: RechargeAssessment;
  sensors: SensorTelemetry[];
  devices: IotDevice[];
  selectedDeviceId: string | null;
  setSelectedDeviceId: (id: string | null) => void;
  selectedDevice: IotDevice | null;
  addDevice: (device: IotDevice) => void;
  testDeviceConnection: (deviceId: string) => Promise<{ success: boolean; latencyMs: number; message: string }>;
  calibrateDevice: (deviceId: string) => void;
  viewDeviceInAquifer: (borewellId: string) => void;
  isAddDeviceModalOpen: boolean;
  setIsAddDeviceModalOpen: (open: boolean) => void;
  historicalData: GroundwaterDataPoint[];
  activeScenario: SimulationScenarioId | null;
  isSimulating: boolean;
  runSimulation: (scenarioId: SimulationScenarioId) => void;
  resetSimulation: () => void;
  togglePump: (borewellId?: string) => void;
  resolveAnomaly: (anomalyId: string) => void;
  activeInvestigateAnomaly: Anomaly | null;
  setActiveInvestigateAnomaly: (anomaly: Anomaly | null) => void;
  viewMode: 'dashboard' | 'landing';
  setViewMode: (mode: 'dashboard' | 'landing') => void;
  liveTick: number;
  notifications: AppNotification[];
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  isSimModalOpen: boolean;
  setIsSimModalOpen: (open: boolean) => void;
}

const JalRakshakContext = createContext<JalRakshakContextType | undefined>(undefined);

export const JalRakshakProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [viewMode, setViewMode] = useState<'dashboard' | 'landing'>('dashboard');
  const [selectedBorewellId, setSelectedBorewellId] = useState<string>('BWL-03');
  const [borewells, setBorewells] = useState<BorewellNode[]>(INITIAL_BOREWELLS);
  const [anomalies, setAnomalies] = useState<Anomaly[]>(INITIAL_ANOMALIES);
  const [recharge, setRecharge] = useState<RechargeAssessment>(INITIAL_RECHARGE);
  const [sensors, setSensors] = useState<SensorTelemetry[]>(INITIAL_SENSORS);
  const [devices, setDevices] = useState<IotDevice[]>(INITIAL_DEVICES);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [isAddDeviceModalOpen, setIsAddDeviceModalOpen] = useState<boolean>(false);
  const [historicalData, setHistoricalData] = useState<GroundwaterDataPoint[]>(HISTORICAL_7DAYS_DATA);
  const [activeScenario, setActiveScenario] = useState<SimulationScenarioId | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [activeInvestigateAnomaly, setActiveInvestigateAnomaly] = useState<Anomaly | null>(null);
  const [isSimModalOpen, setIsSimModalOpen] = useState<boolean>(false);
  const [liveTick, setLiveTick] = useState<number>(0);

  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'notif-1',
      title: 'Rapid Drawdown Alert on BWL-03',
      message: 'Water level fell by 1.4 m during morning duty cycle. Pumping rate 31% above baseline.',
      time: '10:42 AM',
      type: 'warning',
      read: false,
      linkTab: 'anomalies',
    },
    {
      id: 'notif-2',
      title: 'High Recharge Opportunity Available',
      message: '28.4 mm precipitation detected. Infiltration potential high; storage capacity ready.',
      time: '08:15 AM',
      type: 'info',
      read: false,
      linkTab: 'recharge',
    },
    {
      id: 'notif-3',
      title: 'Sensor Calibration Notice',
      message: 'TDS & EC probe on BWL-03 requires biannual calibration.',
      time: 'Yesterday',
      type: 'info',
      read: true,
      linkTab: 'sensors',
    },
  ]);

  // Sync theme with HTML class
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  // Periodic heartbeat tick (simulates incoming IoT packets and live drift)
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveTick((t) => t + 1);
      setSensors((prev) =>
        prev.map((s) => ({
          ...s,
          lastSyncSecondsAgo: (s.lastSyncSecondsAgo + 2) % 30,
        }))
      );
      setDevices((prev) =>
        prev.map((d) => ({
          ...d,
          lastSyncSecondsAgo: (d.lastSyncSecondsAgo + 2) % 45,
        }))
      );
      setBorewells((prev) =>
        prev.map((b) => {
          if (b.id === 'BWL-03') {
            return {
              ...b,
              lastUpdatedSecondsAgo: (b.lastUpdatedSecondsAgo + 2) % 25,
            };
          }
          return b;
        })
      );
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const selectedBorewell = useMemo(() => {
    return borewells.find((b) => b.id === selectedBorewellId) || borewells[0];
  }, [borewells, selectedBorewellId]);

  // Toggle pump state with realistic drawdown / recovery response
  const togglePump = useCallback((borewellId?: string) => {
    const targetId = borewellId || selectedBorewellId;
    setBorewells((prev) =>
      prev.map((b) => {
        if (b.id !== targetId) return b;
        const newStatus: PumpStatus = b.pumpStatus === 'ON' ? 'OFF' : 'ON';
        const isNowOn = newStatus === 'ON';
        return {
          ...b,
          pumpStatus: newStatus,
          flowRateLps: isNowOn ? 3.4 : 0.0,
          waterLevelMeters: isNowOn
            ? Math.round((b.waterLevelMeters + 0.3) * 10) / 10
            : Math.round((b.waterLevelMeters - 0.2) * 10) / 10,
          healthScore: isNowOn ? Math.max(60, b.healthScore - 4) : Math.min(95, b.healthScore + 2),
        };
      })
    );
  }, [selectedBorewellId]);

  // Run simulation scenario for Hackathon demonstration
  const runSimulation = useCallback((scenarioId: SimulationScenarioId) => {
    const scenario = SIMULATION_SCENARIOS[scenarioId];
    if (!scenario) return;

    setIsSimulating(true);
    setActiveScenario(scenarioId);

    // Apply scenario parameters to target borewell (BWL-03)
    setBorewells((prev) =>
      prev.map((b) => {
        if (b.id !== 'BWL-03') return b;
        let newStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
        let healthScore = 88;
        let healthText = 'OPTIMAL STABLE AQUIFER';

        if (scenarioId === 'high_extraction') {
          newStatus = 'warning';
          healthScore = 68;
          healthText = 'RAPID DRAWDOWN CONE FORMING';
        } else if (scenarioId === 'poor_recovery') {
          newStatus = 'warning';
          healthScore = 71;
          healthText = 'AQUIFER RECHARGE STRESSED';
        } else if (scenarioId === 'pump_fault') {
          newStatus = 'critical';
          healthScore = 42;
          healthText = 'CRITICAL PUMP DRY RUN HAZARD';
        } else if (scenarioId === 'water_quality_spike') {
          newStatus = 'critical';
          healthScore = 55;
          healthText = 'CONTAMINANT INFLUX DETECTED';
        }

        return {
          ...b,
          pumpStatus: scenario.pumpInitialState,
          waterLevelMeters: Math.round((17.8 + scenario.waterLevelOffset) * 10) / 10,
          waterLevelDeltaToday: scenario.waterLevelOffset > 0 ? -scenario.waterLevelOffset : -0.4,
          todayExtractionLiters: Math.round(2170 * scenario.flowRateMultiplier),
          flowRateLps: scenario.pumpInitialState === 'ON' ? Math.round(3.4 * scenario.flowRateMultiplier * 10) / 10 : 0.0,
          tdsPpm: 412 + scenario.tdsOffset,
          status: newStatus,
          healthScore,
          healthStatusText: healthText,
          activeAnomaliesCount: scenarioId === 'normal' ? 0 : 1,
        };
      })
    );

    // Update anomaly if not normal
    if (scenarioId !== 'normal') {
      const newAnomaly: Anomaly = {
        id: `ANOM-SIM-${Date.now().toString().slice(-4)}`,
        borewellId: 'BWL-03',
        borewellName: 'Borewell BWL-03',
        title: scenario.anomalyTitle,
        severity: scenarioId === 'pump_fault' || scenarioId === 'water_quality_spike' ? 'critical' : 'warning',
        timestamp: 'Just now (Simulated)',
        parameter: scenarioId === 'pump_fault' ? 'Current vs Flow Disparity' : scenarioId === 'water_quality_spike' ? 'TDS & Conductivity' : 'Groundwater Drawdown',
        actualValue: scenarioId === 'pump_fault' ? '11.2A / 0.1 L/s' : scenarioId === 'water_quality_spike' ? `${412 + scenario.tdsOffset} ppm TDS` : `${Math.round((17.8 + scenario.waterLevelOffset) * 10) / 10} m Level`,
        expectedValue: scenarioId === 'pump_fault' ? '10.4A / 3.4 L/s' : scenarioId === 'water_quality_spike' ? '< 500 ppm' : '17.5 - 18.2 m',
        deviationPercent: scenarioId === 'pump_fault' ? 95 : scenarioId === 'water_quality_spike' ? 116 : 48,
        whyExplanation: scenario.whyText,
        potentialImpact: scenarioId === 'pump_fault' ? 'Impeller overheating and borehole collapse danger.' : 'Groundwater quality degradation and over-abstraction.',
        recommendedAction: scenario.prescribedAction,
        status: 'active',
        confidenceScore: 92,
        rootCauseCategory: scenarioId === 'pump_fault' ? 'Hardware Fault' : scenarioId === 'water_quality_spike' ? 'Saline Intrusion' : 'Excessive Pumping',
      };

      setAnomalies((prev) => [newAnomaly, ...prev.filter((a) => a.id !== newAnomaly.id)]);

      setNotifications((prev) => [
        {
          id: `sim-notif-${Date.now()}`,
          title: `Simulation Event: ${scenario.anomalyTitle}`,
          message: scenario.whyText,
          time: 'Just now',
          type: newAnomaly.severity,
          read: false,
          linkTab: 'anomalies',
        },
        ...prev,
      ]);
    }
  }, []);

  const resetSimulation = useCallback(() => {
    setIsSimulating(false);
    setActiveScenario(null);
    setBorewells(INITIAL_BOREWELLS);
    setAnomalies(INITIAL_ANOMALIES);
    setRecharge(INITIAL_RECHARGE);
    setSensors(INITIAL_SENSORS);
    setHistoricalData(HISTORICAL_7DAYS_DATA);
  }, []);

  const resolveAnomaly = useCallback((anomalyId: string) => {
    setAnomalies((prev) =>
      prev.map((a) => (a.id === anomalyId ? { ...a, status: 'resolved' } : a))
    );
    setBorewells((prev) =>
      prev.map((b) => (b.id === 'BWL-03' ? { ...b, activeAnomaliesCount: 0, status: 'healthy', healthScore: 86 } : b))
    );
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const selectedDevice = useMemo(() => {
    if (!selectedDeviceId) return null;
    return devices.find((d) => d.id === selectedDeviceId) || null;
  }, [devices, selectedDeviceId]);

  const addDevice = useCallback((newDev: IotDevice) => {
    setDevices((prev) => [newDev, ...prev]);
    setNotifications((prev) => [
      {
        id: `notif-add-${Date.now()}`,
        title: `Device Provisioned: ${newDev.name}`,
        message: `Node ${newDev.id} assigned to ${newDev.borewellId} via ${newDev.protocol}.`,
        time: 'Just now',
        type: 'info',
        read: false,
        linkTab: 'devices',
      },
      ...prev,
    ]);
  }, []);

  const testDeviceConnection = useCallback(async (deviceId: string) => {
    await new Promise((r) => setTimeout(r, 700));
    const randomLatency = Math.floor(28 + Math.random() * 26);
    setDevices((prev) =>
      prev.map((d) =>
        d.id === deviceId
          ? {
              ...d,
              lastSyncSecondsAgo: 0,
              latencyMs: randomLatency,
              packetLossPct: Math.round(Math.random() * 4) / 10,
              status: d.status === 'OFFLINE' ? 'ONLINE' : d.status,
            }
          : d
      )
    );
    return {
      success: true,
      latencyMs: randomLatency,
      message: `Uplink verified with ${randomLatency}ms round-trip latency. Gateway ACK received.`,
    };
  }, []);

  const calibrateDevice = useCallback((deviceId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const nextDate = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setDevices((prev) =>
      prev.map((d) =>
        d.id === deviceId
          ? {
              ...d,
              calibrationStatus: 'VALID',
              calibrationDate: today,
              nextCalibrationDate: nextDate,
              status: d.status === 'CALIBRATION REQUIRED' ? 'ONLINE' : d.status,
            }
          : d
      )
    );
    setNotifications((prev) => [
      {
        id: `notif-cal-${Date.now()}`,
        title: `Calibration Certified: ${deviceId}`,
        message: `Zero and span offsets re-calibrated. Certificate valid until ${nextDate}.`,
        time: 'Just now',
        type: 'info',
        read: false,
        linkTab: 'devices',
      },
      ...prev,
    ]);
  }, []);

  const viewDeviceInAquifer = useCallback((borewellId: string) => {
    setSelectedBorewellId(borewellId);
    setActiveTab('overview');
    setViewMode('dashboard');
  }, []);

  return (
    <JalRakshakContext.Provider
      value={{
        borewells,
        selectedBorewellId,
        setSelectedBorewellId,
        selectedBorewell,
        activeTab,
        setActiveTab,
        theme,
        toggleTheme,
        anomalies,
        recharge,
        sensors,
        devices,
        selectedDeviceId,
        setSelectedDeviceId,
        selectedDevice,
        addDevice,
        testDeviceConnection,
        calibrateDevice,
        viewDeviceInAquifer,
        isAddDeviceModalOpen,
        setIsAddDeviceModalOpen,
        historicalData,
        activeScenario,
        isSimulating,
        runSimulation,
        resetSimulation,
        togglePump,
        resolveAnomaly,
        activeInvestigateAnomaly,
        setActiveInvestigateAnomaly,
        viewMode,
        setViewMode,
        liveTick,
        notifications,
        markNotificationRead,
        clearAllNotifications,
        isSimModalOpen,
        setIsSimModalOpen,
      }}
    >
      {children}
    </JalRakshakContext.Provider>
  );
};

export const useJalRakshak = () => {
  const context = useContext(JalRakshakContext);
  if (!context) {
    throw new Error('useJalRakshak must be used within a JalRakshakProvider');
  }
  return context;
};
