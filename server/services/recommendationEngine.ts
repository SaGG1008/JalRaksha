export interface PrescribedRecommendation {
  action: string;
  potentialImpact: string;
  autoMitigationAvailable: boolean;
  mitigationType?: 'THROTTLE_PUMP' | 'SHUTDOWN_PUMP' | 'ISOLATE_MANIFOLD' | 'RECALIBRATE';
}

export class RecommendationEngine {
  public static getRecommendation(
    anomalyType: string,
    rootCauseCategory: string
  ): PrescribedRecommendation {
    switch (anomalyType) {
      case 'RAPID_DRAWDOWN':
        return {
          action: 'Review current pumping duration. Throttling pump schedule recommended to permit hydrostatic equilibrium.',
          potentialImpact: 'Elevated groundwater depletion risk. Cone of depression deepening into basal fracture zone.',
          autoMitigationAvailable: true,
          mitigationType: 'THROTTLE_PUMP',
        };

      case 'AQUIFER_STRESS_LAG':
        return {
          action: 'Activate artificial recharge injection shaft East Node and implement 48-hour pump interlock.',
          potentialImpact: 'Aquifer transmissivity exhaustion. Reduced safe yield for neighboring community nodes.',
          autoMitigationAvailable: true,
          mitigationType: 'SHUTDOWN_PUMP',
        };

      case 'PUMP_ANOMALY':
        return {
          action: 'Emergency automated trip interlock engaged. Inspect suction strainer and aquifer yield.',
          potentialImpact: 'Impeller overheating and borehole casing collapse hazard from cavitation dry-running.',
          autoMitigationAvailable: true,
          mitigationType: 'SHUTDOWN_PUMP',
        };

      case 'WATER_QUALITY_ANOMALY':
        return {
          action: 'Isolate drinking water distribution manifold. Switch borewell discharge to containment settling pond.',
          potentialImpact: 'Elevated salinity/nitrate influx breaching potable drinking water safety standards (BIS 10500).',
          autoMitigationAvailable: true,
          mitigationType: 'ISOLATE_MANIFOLD',
        };

      case 'DEVICE_OFFLINE':
      case 'SENSOR_FAILURE':
        return {
          action: 'Check node power supply, inspect battery voltage, and verify LoRaWAN RF gateway connection.',
          potentialImpact: 'Loss of telemetry blind-spot across active pumping zone, impeding safe yield governance.',
          autoMitigationAvailable: false,
        };

      case 'SENSOR_DRIFT':
      case 'CALIBRATION_EXPIRED':
        return {
          action: 'Perform field zero and span calibration with certified reference buffer solutions.',
          potentialImpact: 'Measurement inaccuracy leading to false depletion alerts or missed drawdown events.',
          autoMitigationAvailable: true,
          mitigationType: 'RECALIBRATE',
        };

      default:
        return {
          action: 'Continue monitoring parameters against diurnal baseline envelope.',
          potentialImpact: 'Nominal operational variance.',
          autoMitigationAvailable: false,
        };
    }
  }
}
