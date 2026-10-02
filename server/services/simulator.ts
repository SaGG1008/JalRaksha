import { AppDatabase } from '../db/database';
import { AnomalyEngine } from './anomalyEngine';
import {
  BorewellNode,
  IotDevice,
  SimulationScenarioId,
  TelemetryReading,
  PumpStatus,
} from '../types';
import { SIMULATION_SCENARIOS } from '../../src/data/initialData';

export type SocketBroadcastCallback = (event: string, payload: any) => void;

function normalizeScenarioId(raw: string): SimulationScenarioId | 'sensor_failure' {
  const s = raw.toLowerCase().trim();
  if (s === 'normal' || s === 'normal_operation') return 'normal';
  if (s === 'high_extraction') return 'high_extraction';
  if (s === 'rapid_drawdown' || s === 'poor_recovery') return 'poor_recovery';
  if (s === 'water_quality_spike' || s === 'water_quality_anomaly') return 'water_quality_spike';
  if (s === 'pump_fault' || s === 'pump_failure') return 'pump_fault';
  if (s === 'sensor_failure') return 'sensor_failure';
  return 'normal';
}

export class TelemetrySimulator {
  private db: AppDatabase;
  private intervalTimer: NodeJS.Timeout | null = null;
  private broadcast: SocketBroadcastCallback | null = null;

  // Continuous physical state tracking
  private activeScenario: string | null = null;
  private targetBorewellId: string = 'BWL-03';
  private tickCount: number = 0;

  // Smooth continuity buffers
  private currentLevels: Map<string, number> = new Map();
  private currentFlows: Map<string, number> = new Map();
  private currentTds: Map<string, number> = new Map();
  private lastReadings: Map<string, TelemetryReading> = new Map();

  constructor(db: AppDatabase) {
    this.db = db;
    this.initBuffers();
  }

  private initBuffers() {
    const borewells = this.db.getBorewells();
    for (const b of borewells) {
      this.currentLevels.set(b.id, b.waterLevelMeters);
      this.currentFlows.set(b.id, b.flowRateLps);
      this.currentTds.set(b.id, b.tdsPpm);
    }
  }

  public setBroadcast(callback: SocketBroadcastCallback) {
    this.broadcast = callback;
  }

  public start(intervalMs = 2000) {
    if (this.intervalTimer) return;
    this.intervalTimer = setInterval(() => this.tick(), intervalMs);
  }

  public stop() {
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
      this.intervalTimer = null;
    }
  }

  public setScenario(scenarioInput: string, targetBorewell = 'BWL-03') {
    const scenarioId = normalizeScenarioId(scenarioInput);
    this.activeScenario = scenarioId;
    this.targetBorewellId = targetBorewell;

    if (scenarioId === 'sensor_failure') {
      // Degrade / offline target device
      this.db.updateDevice('DEV-WLS-03', {
        status: 'OFFLINE',
        packetLossPct: 100,
        latencyMs: 999,
      });

      this.db.updateSimulationState({
        isSimulating: true,
        activeScenario: 'sensor_failure',
        targetBorewell,
      });

      if (this.broadcast) {
        this.broadcast('device:status', {
          deviceId: 'DEV-WLS-03',
          status: 'OFFLINE',
          packetLossPct: 100,
        });
        this.broadcast('simulation:state', {
          isSimulating: true,
          activeScenario: 'sensor_failure',
          targetBorewell,
        });
      }
      return;
    }

    const scenarioDef = SIMULATION_SCENARIOS[scenarioId as SimulationScenarioId];
    if (scenarioDef) {
      this.db.updateSimulationState({
        isSimulating: scenarioId !== 'normal',
        activeScenario: scenarioId,
        targetBorewell,
        waterLevelOffset: scenarioDef.waterLevelOffset,
        flowRateMultiplier: scenarioDef.flowRateMultiplier,
        tdsOffset: scenarioDef.tdsOffset,
        pumpState: scenarioDef.pumpInitialState,
      });

      // Synchronize target borewell pump state
      this.db.updateBorewell(targetBorewell, {
        pumpStatus: scenarioDef.pumpInitialState,
        flowRateLps:
          scenarioDef.pumpInitialState === 'ON'
            ? Math.round(3.4 * scenarioDef.flowRateMultiplier * 10) / 10
            : 0.0,
      });
    }

    if (this.broadcast) {
      this.broadcast('simulation:state', {
        isSimulating: scenarioId !== 'normal',
        activeScenario: scenarioId,
        targetBorewell,
      });
    }
  }

  public resetScenario() {
    this.activeScenario = null;
    this.db.updateSimulationState({
      isSimulating: false,
      activeScenario: null,
      targetBorewell: 'BWL-03',
      waterLevelOffset: 0.0,
      flowRateMultiplier: 1.0,
      tdsOffset: 0.0,
      pumpState: 'OFF',
    });

    // Restore device statuses to ONLINE
    this.db.updateDevice('DEV-WLS-03', {
      status: 'ONLINE',
      packetLossPct: 0.8,
      latencyMs: 42,
    });

    const target = this.db.getBorewellById('BWL-03');
    if (target) {
      this.currentLevels.set('BWL-03', 18.4);
      this.currentFlows.set('BWL-03', 0.0);
      this.currentTds.set('BWL-03', 412);
      this.db.updateBorewell('BWL-03', {
        waterLevelMeters: 18.4,
        pumpStatus: 'OFF',
        flowRateLps: 0.0,
        tdsPpm: 412,
        healthScore: 88,
        healthStatusText: 'OPTIMAL STABLE AQUIFER',
        status: 'healthy',
      });
    }

    if (this.broadcast) {
      this.broadcast('simulation:state', {
        isSimulating: false,
        activeScenario: null,
        targetBorewell: 'BWL-03',
      });
      this.broadcast('device:status', {
        deviceId: 'DEV-WLS-03',
        status: 'ONLINE',
        packetLossPct: 0.8,
      });
    }
  }

  public getStatus() {
    return {
      isSimulating: this.activeScenario !== null && this.activeScenario !== 'normal',
      activeScenario: this.activeScenario,
      targetBorewell: this.targetBorewellId,
      mode: 'SIMULATION' as const,
      tickCount: this.tickCount,
    };
  }

  /**
   * Main Simulation Step: Physical Continuity Calculation
   */
  public tick() {
    this.tickCount++;
    const borewells = this.db.getBorewells();

    for (const b of borewells) {
      const isTarget = b.id === this.targetBorewellId;
      let targetLevel = this.currentLevels.get(b.id) ?? b.waterLevelMeters;
      let targetFlow = this.currentFlows.get(b.id) ?? b.flowRateLps;
      let targetTds = this.currentTds.get(b.id) ?? b.tdsPpm;

      const isPumpOn = b.pumpStatus === 'ON';
      const isPumpFault = b.pumpStatus === 'FAULT';

      // 1. Water Level Physics with Inertial Delta
      // Small sensor transducer noise sigma = 0.008
      const noise = (Math.random() - 0.5) * 0.016;

      if (isTarget && (this.activeScenario === 'high_extraction' || this.activeScenario === 'rapid_drawdown')) {
        // Rapid continuous drawdown: +0.035m per tick
        targetLevel = Math.min(21.5, targetLevel + 0.035 + noise);
        targetFlow = 5.4;
      } else if (isTarget && this.activeScenario === 'poor_recovery') {
        // Aquifer fails to rebound
        targetLevel = Math.max(19.2, targetLevel + noise);
        targetFlow = 0.0;
      } else if (isTarget && (this.activeScenario === 'pump_fault' || this.activeScenario === 'pump_failure')) {
        // Cavitation: pump is on but zero flow
        targetLevel = targetLevel + noise;
        targetFlow = 0.1;
      } else if (isTarget && (this.activeScenario === 'water_quality_spike' || this.activeScenario === 'water_quality_anomaly')) {
        // TDS ramps smoothly upward
        targetTds = Math.min(920, targetTds + 18 + noise * 10);
      } else {
        // Nominal cyclic behavior:
        if (isPumpOn) {
          targetLevel = Math.min(19.2, targetLevel + 0.012 + noise);
          targetFlow = 3.4;
        } else {
          // Recharge recovery towards baseline (17.5m)
          targetLevel = Math.max(17.2, targetLevel - 0.008 + noise);
          targetFlow = 0.0;
        }
        // Slowly relax TDS to baseline 412
        if (targetTds > 425) {
          targetTds -= 4;
        }
      }

      // Round for physical display precision
      const finalLevel = Math.round(targetLevel * 100) / 100;
      const finalFlow = Math.round(targetFlow * 10) / 10;
      const finalTds = Math.round(targetTds);

      this.currentLevels.set(b.id, finalLevel);
      this.currentFlows.set(b.id, finalFlow);
      this.currentTds.set(b.id, finalTds);

      // Hydrostatic pressure at sensor depth: P = 1.0 + (depth * 0.098)
      const sensorDepth = b.sensorDepthMeters || 70;
      const pressureBar = Math.round((1.0 + ((sensorDepth - finalLevel) * 0.098)) * 100) / 100;

      // Cumulative extraction increment
      const addedExtraction = isPumpOn ? Math.round(finalFlow * 2) : 0;
      const newTodayExtraction = b.todayExtractionLiters + addedExtraction;

      // Update Borewell Record in SQLite
      this.db.updateBorewell(b.id, {
        waterLevelMeters: finalLevel,
        flowRateLps: finalFlow,
        tdsPpm: finalTds,
        todayExtractionLiters: newTodayExtraction,
      });

      // Construct Reading Payload
      const now = new Date();
      const timestampIso = now.toISOString();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const timestampLabel = `Today ${timeStr}`;

      const reading: TelemetryReading = {
        borewellId: b.id,
        deviceId: `DEV-WLS-${b.id.split('-')[1]}`,
        timestamp: timestampIso,
        waterLevel: finalLevel,
        flowRate: finalFlow,
        tds: finalTds,
        temperature: 26.4 + (isPumpOn ? 0.3 : 0),
        pressure: pressureBar,
        pumpStatus: b.pumpStatus,
        extractionLiters: newTodayExtraction,
        isSimulated: true,
        source: 'SIMULATOR',
      };

      // Insert Telemetry every 3rd tick to avoid DB bloat while keeping real-time socket rapid
      if (this.tickCount % 3 === 0) {
        this.db.insertTelemetry({
          borewellId: b.id,
          deviceId: reading.deviceId,
          timestamp: timestampLabel,
          waterLevel: finalLevel,
          flowRate: finalFlow,
          tds: finalTds,
          temperature: reading.temperature,
          pressure: reading.pressure,
          pumpStatus: b.pumpStatus,
          extractionLiters: newTodayExtraction,
          isSimulated: true,
          source: 'SIMULATOR',
        });
      }

      // 2. Anomaly Evaluation with Deduplication
      const prevReading = this.lastReadings.get(b.id);
      const isSensorFailed = isTarget && this.activeScenario === 'sensor_failure';
      const newAnomalies = AnomalyEngine.evaluate({
        borewell: b,
        reading,
        previousReading: prevReading,
        isSensorFailed,
      });

      const activeAnomalies = this.db.getAnomalies('active');
      for (const anom of newAnomalies) {
        // Only insert if no active anomaly of this category already exists for this borewell
        const alreadyActive = activeAnomalies.some(
          (existing) =>
            existing.borewellId === anom.borewellId &&
            existing.rootCauseCategory === anom.rootCauseCategory
        );

        if (!alreadyActive) {
          this.db.insertAnomaly(anom);
          if (this.broadcast) {
            this.broadcast('anomaly:new', anom);
          }
        }
      }

      this.lastReadings.set(b.id, reading);

      // 3. Update Connected Devices in DB
      const devices = this.db.getDevices(b.id);
      for (const dev of devices) {
        let readingVal = `${finalLevel.toFixed(2)}`;
        let readingUnit = 'm';

        if (dev.type === 'Flow Sensor') {
          readingVal = `${finalFlow.toFixed(2)}`;
          readingUnit = 'L/s';
        } else if (dev.type === 'TDS / EC Sensor') {
          readingVal = `${finalTds}`;
          readingUnit = 'ppm';
        } else if (dev.type === 'Pump Controller') {
          readingVal = isPumpOn ? '10.4' : '0.0';
          readingUnit = 'A (5.5 kW)';
        }

        const updatedHistory = [
          ...(dev.history || []).slice(-9),
          { timestamp: timeStr, value: parseFloat(readingVal) || finalLevel },
        ];

        this.db.updateDevice(dev.id, {
          currentReadingValue: readingVal,
          history: updatedHistory,
        });
      }

      // 4. Socket Broadcast for Target or Active Borewell
      if (this.broadcast && isTarget) {
        this.broadcast('telemetry:update', {
          borewellId: b.id,
          timestamp: timestampLabel,
          waterLevel: finalLevel,
          flowRate: finalFlow,
          tds: finalTds,
          temperature: reading.temperature,
          pressure: pressureBar,
          pumpStatus: b.pumpStatus,
          extractionLiters: newTodayExtraction,
          isSimulated: true,
          source: 'SIMULATOR',
        });

        this.broadcast('borewell:update', {
          ...b,
          waterLevelMeters: finalLevel,
          flowRateLps: finalFlow,
          tdsPpm: finalTds,
          todayExtractionLiters: newTodayExtraction,
        });
      }
    }
  }
}
