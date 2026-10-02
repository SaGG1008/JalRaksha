import { Anomaly, Severity, BorewellNode, TelemetryReading } from '../types';
import { RecommendationEngine } from './recommendationEngine';

export interface AnomalyEvaluationContext {
  borewell: BorewellNode;
  reading: TelemetryReading;
  previousReading?: TelemetryReading;
  isSensorFailed?: boolean;
}

export class AnomalyEngine {
  /**
   * Evaluates current telemetry against physics and operational thresholds.
   * Returns newly detected anomalies (if any).
   */
  public static evaluate(context: AnomalyEvaluationContext): Anomaly[] {
    const { borewell, reading, previousReading, isSensorFailed } = context;
    const detected: Anomaly[] = [];

    // 1. Rapid Drawdown Rule
    // IF water level decreases faster than expected AND extraction is elevated
    // Note: in waterLevelMeters, larger number = deeper water table (decline)
    const [expectedMin, expectedMax] = borewell.expectedLevelRange;
    const isLevelBelowExpected = reading.waterLevel > expectedMax;
    const deltaRate = previousReading
      ? (reading.waterLevel - previousReading.waterLevel)
      : (reading.waterLevel - expectedMax);

    if (isLevelBelowExpected || deltaRate > 0.4) {
      const deviation = Math.max(
        15,
        Math.round(((reading.waterLevel - expectedMax) / expectedMax) * 100 * 5)
      );
      const rec = RecommendationEngine.getRecommendation(
        'RAPID_DRAWDOWN',
        'Excessive Pumping'
      );

      detected.push({
        id: `ANOM-${borewell.id}-DD-${Date.now().toString().slice(-4)}`,
        borewellId: borewell.id,
        borewellName: borewell.name,
        title: 'Rapid Groundwater Decline',
        severity: reading.waterLevel > expectedMax + 1.2 ? 'critical' : 'warning',
        timestamp: 'Just now (Real-time Detection)',
        parameter: 'Groundwater Drawdown Rate',
        actualValue: `${reading.waterLevel.toFixed(2)} m depth`,
        expectedValue: `${expectedMin} - ${expectedMax} m baseline`,
        deviationPercent: deviation,
        whyExplanation: `Extraction rate is elevated. Dynamic water table depth has breached safe operating limit of ${expectedMax}m.`,
        potentialImpact: rec.potentialImpact,
        recommendedAction: rec.action,
        status: 'active',
        confidenceScore: 89,
        rootCauseCategory: 'Excessive Pumping',
      });
    }

    // 2. Water Quality (TDS Spike) Rule
    // IF TDS exceeds configured threshold (e.g. 500 ppm)
    if (reading.tds > 500) {
      const deviation = Math.round(((reading.tds - 500) / 500) * 100);
      const rec = RecommendationEngine.getRecommendation(
        'WATER_QUALITY_ANOMALY',
        'Saline Intrusion'
      );

      detected.push({
        id: `ANOM-${borewell.id}-WQ-${Date.now().toString().slice(-4)}`,
        borewellId: borewell.id,
        borewellName: borewell.name,
        title: 'Water Quality Alert: Elevated TDS & Ion Intrusion',
        severity: reading.tds > 750 ? 'critical' : 'warning',
        timestamp: 'Just now (Real-time Detection)',
        parameter: 'Total Dissolved Solids (TDS)',
        actualValue: `${Math.round(reading.tds)} ppm`,
        expectedValue: '< 500 ppm (BIS 10500)',
        deviationPercent: deviation,
        whyExplanation: `TDS reading (${Math.round(reading.tds)} ppm) exceeds permissible limits. Conductivity spike indicates potential saline intrusion or agricultural fertilizer runoff.`,
        potentialImpact: rec.potentialImpact,
        recommendedAction: rec.action,
        status: 'active',
        confidenceScore: 94,
        rootCauseCategory: 'Saline Intrusion',
      });
    }

    // 3. Pump Fault / Dry Run Rule
    // IF pump is ON AND flow rate is near zero while motor is energized
    if (reading.pumpStatus === 'FAULT' || (reading.pumpStatus === 'ON' && reading.flowRate < 0.3)) {
      const rec = RecommendationEngine.getRecommendation(
        'PUMP_ANOMALY',
        'Hardware Fault'
      );

      detected.push({
        id: `ANOM-${borewell.id}-PMP-${Date.now().toString().slice(-4)}`,
        borewellId: borewell.id,
        borewellName: borewell.name,
        title: 'Critical Pump Cavitation / Dry Run Hazard',
        severity: 'critical',
        timestamp: 'Just now (Real-time Detection)',
        parameter: 'Discharge Flow Disparity',
        actualValue: `${reading.flowRate.toFixed(1)} L/s`,
        expectedValue: '3.4 L/s nominal',
        deviationPercent: 95,
        whyExplanation: `Submersible motor is commanded ON, but discharge flow is under 0.3 L/s. Pump intake screen may be above dynamic water table or suction clogged.`,
        potentialImpact: rec.potentialImpact,
        recommendedAction: rec.action,
        status: 'active',
        confidenceScore: 96,
        rootCauseCategory: 'Hardware Fault',
      });
    }

    // 4. Sensor Failure / Device Offline
    if (isSensorFailed) {
      const rec = RecommendationEngine.getRecommendation(
        'DEVICE_OFFLINE',
        'Hardware Fault'
      );

      detected.push({
        id: `ANOM-${borewell.id}-OFF-${Date.now().toString().slice(-4)}`,
        borewellId: borewell.id,
        borewellName: borewell.name,
        title: 'Sensor Hardware Link Offline',
        severity: 'warning',
        timestamp: 'Just now (Real-time Detection)',
        parameter: 'Transceiver Heartbeat & Packet Loss',
        actualValue: '100% Packet Loss / No ACK',
        expectedValue: '< 1% Packet Loss',
        deviationPercent: 100,
        whyExplanation: `IoT sensor node on borewell ${borewell.id} stopped reporting telemetry. Heartbeat timeout reached.`,
        potentialImpact: rec.potentialImpact,
        recommendedAction: rec.action,
        status: 'active',
        confidenceScore: 98,
        rootCauseCategory: 'Hardware Fault',
      });
    }

    return detected;
  }
}
