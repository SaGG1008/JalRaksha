export type {
  Severity,
  PumpStatus,
  AquiferType,
  BorewellNode,
  GroundwaterDataPoint,
  PumpInterval,
  Anomaly,
  RechargeAssessment,
  DeviceType,
  DeviceConnectionStatus,
  DeviceProtocol,
  IotDevice,
  SensorTelemetry,
  SimulationScenarioId,
  SimulationScenario,
} from '../src/types';

export type OperationalScenario =
  | 'NORMAL_OPERATION'
  | 'HIGH_EXTRACTION'
  | 'RAPID_DRAWDOWN'
  | 'WATER_QUALITY_ANOMALY'
  | 'SENSOR_FAILURE'
  | 'PUMP_FAILURE';

export interface TelemetryReading {
  id?: number;
  borewellId: string;
  deviceId?: string;
  timestamp: string;
  waterLevel: number;
  flowRate: number;
  tds: number;
  temperature: number;
  pressure: number;
  pumpStatus: import('../src/types').PumpStatus;
  extractionLiters: number;
  isSimulated: boolean;
  source: 'SIMULATOR' | 'LIVE_HARDWARE';
}

export interface AnomalyDetectionResult {
  detected: boolean;
  anomaly?: import('../src/types').Anomaly;
}

export interface SimulationStatusResponse {
  isSimulating: boolean;
  activeScenario: import('../src/types').SimulationScenarioId | null;
  targetBorewell: string;
  mode: 'SIMULATION' | 'LIVE_HARDWARE';
  waterLevelOffset: number;
  flowRateMultiplier: number;
  tdsOffset: number;
  pumpState: import('../src/types').PumpStatus;
}
