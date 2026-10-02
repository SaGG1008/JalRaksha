export type Severity = 'info' | 'warning' | 'critical';

export type PumpStatus = 'ON' | 'OFF' | 'FAULT' | 'COOLDOWN';

export type AquiferType = 'Unconfined Alluvial' | 'Semi-Confined Basalt' | 'Confined Sandstone' | 'Hard Rock Fissured';

export interface BorewellNode {
  id: string; // e.g. "BWL-03"
  name: string; // e.g. "Community Well #3 (East Sector)"
  location: string; // e.g. "Zone B - Agricultural Perimeter"
  coordinates: { lat: number; lng: number };
  depthTotalMeters: number; // e.g. 90m
  pumpDepthMeters: number; // e.g. 55m
  sensorDepthMeters: number; // e.g. 70m
  aquiferType: AquiferType;
  casingDiameterMm: number; // e.g. 200mm
  status: 'healthy' | 'warning' | 'critical' | 'offline';
  waterLevelMeters: number; // Current depth to water from surface
  waterLevelDeltaToday: number; // e.g. -0.8m
  expectedLevelRange: [number, number]; // [min, max] e.g. [17.5, 18.8]
  todayExtractionLiters: number;
  averageExtractionLiters: number;
  recoveryRatePercent: number; // e.g. 72%
  pumpStatus: PumpStatus;
  flowRateLps: number; // Liters per second
  pumpPowerKw: number;
  healthScore: number; // 0 - 100
  healthStatusText: string;
  tdsPpm: number;
  ph: number;
  temperatureC: number;
  conductivityUsCm: number;
  lastUpdatedSecondsAgo: number;
  activeAnomaliesCount: number;
}

export interface GroundwaterDataPoint {
  timestamp: string; // "Mon 00:00" or ISO
  dateStr: string;
  hour: number;
  waterLevel: number; // meters from surface
  expectedMin: number;
  expectedMax: number;
  pumpState: 'ON' | 'OFF';
  extractionLiters: number;
  anomaly?: {
    type: 'depletion_surge' | 'recovery_lag' | 'tds_spike' | 'dry_run';
    label: string;
    severity: Severity;
  };
}

export interface PumpInterval {
  id: string;
  startTime: string; // "06:00"
  endTime: string; // "08:30"
  durationMinutes: number;
  totalExtractedLiters: number;
  drawdownMeters: number;
  recoveryTimeMinutes: number;
  status: 'normal' | 'excessive' | 'interrupted';
}

export interface Anomaly {
  id: string;
  borewellId: string;
  borewellName: string;
  title: string;
  severity: Severity;
  timestamp: string;
  parameter: string;
  actualValue: string;
  expectedValue: string;
  deviationPercent: number;
  whyExplanation: string;
  potentialImpact: string;
  recommendedAction: string;
  status: 'active' | 'investigating' | 'resolved';
  confidenceScore: number;
  rootCauseCategory: 'Excessive Pumping' | 'Aquifer Stress' | 'Hardware Fault' | 'Saline Intrusion' | 'Sensor Drift';
}

export interface RechargeAssessment {
  opportunityScore: number; // 0 - 100, e.g. 84
  rating: 'VERY HIGH' | 'HIGH OPPORTUNITY' | 'MODERATE' | 'LOW';
  recentRainfallMm: number; // 28.4 mm
  soilMoistureSaturationPct: number; // 68%
  infiltrationRateMmHr: number; // 14 mm/hr
  unsaturatedZoneStorageCapacityM3: number; // 18,400 m³
  recommendedAction: string;
  potentialReplenishmentLiters: number;
  rechargeStructuresAvailable: {
    name: string;
    type: 'Recharge Shaft' | 'Percolation Tank' | 'Rooftop Filter Pit' | 'Check Dam';
    status: 'Ready' | 'Inflow Active' | 'Silted / Maintenance';
    intakeLph: number;
  }[];
}

export type DeviceType =
  | 'Water Level Sensor'
  | 'Flow Sensor'
  | 'TDS / EC Sensor'
  | 'Temperature Sensor'
  | 'Pressure Sensor'
  | 'Pump Controller'
  | 'IoT Gateway';

export type DeviceConnectionStatus =
  | 'ONLINE'
  | 'DEGRADED'
  | 'OFFLINE'
  | 'CALIBRATION REQUIRED'
  | 'LOW BATTERY'
  | 'SIGNAL WARNING';

export type DeviceProtocol = 'LoRaWAN' | 'MQTT' | 'Modbus RS-485' | '4G/LTE' | 'Wi-Fi';

export interface IotDevice {
  id: string; // e.g. "DEV-WLS-03"
  name: string; // e.g. "Hydrostatic Borehole Level Probe"
  type: DeviceType;
  borewellId: string; // e.g. "BWL-03"
  borewellName?: string;
  status: DeviceConnectionStatus;
  model: string; // e.g. "WL-01 Pro"
  firmware: string; // e.g. "v1.4.2"
  samplingIntervalSec: number; // e.g. 30
  protocol: DeviceProtocol;
  gatewayId: string; // e.g. "GW-001"
  batteryPercent: number; // e.g. 87
  signalRssiDbm: number; // e.g. -71
  signalQualityPct: number; // e.g. 82
  latencyMs: number; // e.g. 42
  packetLossPct: number; // e.g. 0.8
  deviceTempC: number; // e.g. 31.2
  lastSyncSecondsAgo: number; // e.g. 12
  calibrationStatus: 'VALID' | 'CALIBRATION REQUIRED' | 'EXPIRED';
  calibrationDate: string; // "2026-06-15"
  nextCalibrationDate: string; // "2026-12-15"
  currentReadingValue: string; // "18.42 m"
  currentReadingUnit: string; // "m"
  readingDeltaToday?: string; // "↓ 0.8 m today"
  dataQualityPct: number; // e.g. 98
  depthMeters?: number; // e.g. 72m
  macOrImei: string; // e.g. "70:B3:D5:7E:D0:02:18:42"
  history: Array<{ timestamp: string; value: number }>;
}

export interface SensorTelemetry {
  id: string;
  name: string;
  type: 'Hydrostatic Pressure' | 'Electromagnetic Flow' | '4-Electrode TDS/EC' | 'Glass pH Probe' | 'Hall-Effect CT' | 'LoRaWAN Gateway';
  borewellId: string;
  status: 'online' | 'warning' | 'critical' | 'offline';
  batteryPercent: number;
  signalRssiDbm: number;
  lastSyncSecondsAgo: number;
  calibrationDate: string;
  calibrationStatus: 'Valid' | 'Calibration recommended' | 'Expired';
  firmwareVersion: string;
  sampleRateHz: number;
  rawPayloadSample: string;
}

export type SimulationScenarioId = 'normal' | 'high_extraction' | 'poor_recovery' | 'pump_fault' | 'water_quality_spike';

export interface SimulationScenario {
  id: SimulationScenarioId;
  name: string;
  description: string;
  targetBorewell: string;
  pumpInitialState: PumpStatus;
  waterLevelOffset: number;
  flowRateMultiplier: number;
  tdsOffset: number;
  anomalyTitle: string;
  whyText: string;
  prescribedAction: string;
}
