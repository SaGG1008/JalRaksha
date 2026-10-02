import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import {
  BorewellNode,
  IotDevice,
  SensorTelemetry,
  Anomaly,
  RechargeAssessment,
  GroundwaterDataPoint,
} from '../types';
import {
  INITIAL_BOREWELLS,
  INITIAL_DEVICES,
  INITIAL_SENSORS,
  INITIAL_ANOMALIES,
  INITIAL_RECHARGE,
  HISTORICAL_7DAYS_DATA,
} from '../../src/data/initialData';

const DB_PATH = process.env.DATABASE_PATH || path.resolve(process.cwd(), 'jalrakshak.db');

export class AppDatabase {
  private db: DatabaseSync;
  private static instance: AppDatabase;

  private constructor() {
    this.db = new DatabaseSync(DB_PATH);
    this.initTables();
    this.seedIfEmpty();
  }

  public static getInstance(): AppDatabase {
    if (!AppDatabase.instance) {
      AppDatabase.instance = new AppDatabase();
    }
    return AppDatabase.instance;
  }

  private initTables() {
    this.db.exec(`
      PRAGMA journal_mode = WAL;

      CREATE TABLE IF NOT EXISTS borewells (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        location TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        depth_total_meters REAL NOT NULL,
        pump_depth_meters REAL NOT NULL,
        sensor_depth_meters REAL NOT NULL,
        aquifer_type TEXT NOT NULL,
        casing_diameter_mm INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'healthy',
        water_level_meters REAL NOT NULL,
        water_level_delta_today REAL NOT NULL,
        expected_min_meters REAL NOT NULL,
        expected_max_meters REAL NOT NULL,
        today_extraction_liters INTEGER NOT NULL,
        average_extraction_liters INTEGER NOT NULL,
        recovery_rate_percent INTEGER NOT NULL,
        pump_status TEXT NOT NULL DEFAULT 'OFF',
        flow_rate_lps REAL NOT NULL DEFAULT 0.0,
        pump_power_kw REAL NOT NULL DEFAULT 5.5,
        health_score INTEGER NOT NULL DEFAULT 85,
        health_status_text TEXT NOT NULL,
        tds_ppm INTEGER NOT NULL DEFAULT 412,
        ph REAL NOT NULL DEFAULT 7.2,
        temperature_c REAL NOT NULL DEFAULT 26.4,
        conductivity_us_cm REAL NOT NULL DEFAULT 644,
        last_updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS devices (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        borewell_id TEXT NOT NULL,
        borewell_name TEXT,
        status TEXT NOT NULL DEFAULT 'ONLINE',
        model TEXT NOT NULL,
        firmware TEXT NOT NULL,
        sampling_interval_sec INTEGER NOT NULL,
        protocol TEXT NOT NULL,
        gateway_id TEXT NOT NULL,
        battery_percent INTEGER NOT NULL,
        signal_rssi_dbm INTEGER NOT NULL,
        signal_quality_pct INTEGER NOT NULL,
        latency_ms INTEGER NOT NULL,
        packet_loss_pct REAL NOT NULL,
        device_temp_c REAL NOT NULL,
        calibration_status TEXT NOT NULL,
        calibration_date TEXT NOT NULL,
        next_calibration_date TEXT NOT NULL,
        current_reading_value TEXT NOT NULL,
        current_reading_unit TEXT NOT NULL,
        reading_delta_today TEXT,
        data_quality_pct REAL NOT NULL DEFAULT 98.4,
        depth_meters REAL DEFAULT 0.0,
        mac_or_imei TEXT NOT NULL,
        history_json TEXT NOT NULL DEFAULT '[]',
        last_sync_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (borewell_id) REFERENCES borewells(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS sensors (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        borewell_id TEXT NOT NULL,
        device_id TEXT,
        status TEXT NOT NULL DEFAULT 'online',
        battery_percent INTEGER NOT NULL DEFAULT 100,
        signal_rssi_dbm INTEGER NOT NULL DEFAULT -70,
        calibration_date TEXT NOT NULL,
        calibration_status TEXT NOT NULL,
        firmware_version TEXT NOT NULL,
        sample_rate_hz REAL NOT NULL DEFAULT 1.0,
        raw_payload_sample TEXT NOT NULL,
        last_sync_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS telemetry (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        borewell_id TEXT NOT NULL,
        device_id TEXT,
        timestamp TEXT NOT NULL,
        water_level REAL NOT NULL,
        flow_rate REAL NOT NULL,
        tds REAL NOT NULL,
        temperature REAL NOT NULL,
        pressure REAL NOT NULL,
        pump_status TEXT NOT NULL,
        extraction_liters INTEGER NOT NULL,
        is_simulated INTEGER NOT NULL DEFAULT 1,
        source TEXT NOT NULL DEFAULT 'SIMULATOR'
      );

      CREATE TABLE IF NOT EXISTS anomalies (
        id TEXT PRIMARY KEY,
        borewell_id TEXT NOT NULL,
        borewell_name TEXT NOT NULL,
        title TEXT NOT NULL,
        severity TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        parameter TEXT NOT NULL,
        actual_value TEXT NOT NULL,
        expected_value TEXT NOT NULL,
        deviation_percent REAL NOT NULL,
        why_explanation TEXT NOT NULL,
        potential_impact TEXT NOT NULL,
        recommended_action TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        confidence_score INTEGER NOT NULL,
        root_cause_category TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        resolved_at TEXT
      );

      CREATE TABLE IF NOT EXISTS simulation_state (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        is_simulating INTEGER NOT NULL DEFAULT 0,
        active_scenario TEXT,
        target_borewell TEXT NOT NULL DEFAULT 'BWL-03',
        water_level_offset REAL NOT NULL DEFAULT 0.0,
        flow_rate_multiplier REAL NOT NULL DEFAULT 1.0,
        tds_offset REAL NOT NULL DEFAULT 0.0,
        pump_state TEXT NOT NULL DEFAULT 'OFF',
        last_updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS recharge (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        opportunity_score INTEGER NOT NULL,
        rating TEXT NOT NULL,
        recent_rainfall_mm REAL NOT NULL,
        soil_moisture_saturation_pct INTEGER NOT NULL,
        infiltration_rate_mm_hr INTEGER NOT NULL,
        unsaturated_zone_storage_capacity_m3 INTEGER NOT NULL,
        recommended_action TEXT NOT NULL,
        potential_replenishment_liters INTEGER NOT NULL,
        structures_json TEXT NOT NULL
      );
    `);
  }

  private seedIfEmpty() {
    const row = this.db.prepare('SELECT count(*) as count FROM borewells').get() as { count: number };
    if (row && Number(row.count) > 0) return;

    // Seed Borewells
    const insertBorewell = this.db.prepare(`
      INSERT INTO borewells (
        id, name, location, latitude, longitude, depth_total_meters,
        pump_depth_meters, sensor_depth_meters, aquifer_type, casing_diameter_mm,
        status, water_level_meters, water_level_delta_today, expected_min_meters, expected_max_meters,
        today_extraction_liters, average_extraction_liters, recovery_rate_percent, pump_status,
        flow_rate_lps, pump_power_kw, health_score, health_status_text, tds_ppm, ph,
        temperature_c, conductivity_us_cm
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `);

    for (const b of INITIAL_BOREWELLS) {
      insertBorewell.run(
        b.id,
        b.name,
        b.location,
        b.coordinates.lat,
        b.coordinates.lng,
        b.depthTotalMeters,
        b.pumpDepthMeters,
        b.sensorDepthMeters,
        b.aquiferType,
        b.casingDiameterMm,
        b.status,
        b.waterLevelMeters,
        b.waterLevelDeltaToday,
        b.expectedLevelRange[0],
        b.expectedLevelRange[1],
        b.todayExtractionLiters,
        b.averageExtractionLiters,
        b.recoveryRatePercent,
        b.pumpStatus,
        b.flowRateLps,
        b.pumpPowerKw,
        b.healthScore,
        b.healthStatusText,
        b.tdsPpm,
        b.ph,
        b.temperatureC,
        b.conductivityUsCm
      );
    }

    // Seed Devices
    const insertDevice = this.db.prepare(`
      INSERT INTO devices (
        id, name, type, borewell_id, borewell_name, status, model, firmware,
        sampling_interval_sec, protocol, gateway_id, battery_percent, signal_rssi_dbm,
        signal_quality_pct, latency_ms, packet_loss_pct, device_temp_c, calibration_status,
        calibration_date, next_calibration_date, current_reading_value, current_reading_unit,
        reading_delta_today, data_quality_pct, depth_meters, mac_or_imei, history_json
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `);

    for (const d of INITIAL_DEVICES) {
      insertDevice.run(
        d.id,
        d.name,
        d.type,
        d.borewellId,
        d.borewellName || '',
        d.status,
        d.model,
        d.firmware,
        d.samplingIntervalSec,
        d.protocol,
        d.gatewayId,
        d.batteryPercent,
        d.signalRssiDbm,
        d.signalQualityPct,
        d.latencyMs,
        d.packetLossPct,
        d.deviceTempC,
        d.calibrationStatus,
        d.calibrationDate,
        d.nextCalibrationDate,
        d.currentReadingValue,
        d.currentReadingUnit,
        d.readingDeltaToday || '',
        d.dataQualityPct,
        d.depthMeters || 0,
        d.macOrImei,
        JSON.stringify(d.history || [])
      );
    }

    // Seed Sensors
    const insertSensor = this.db.prepare(`
      INSERT INTO sensors (
        id, name, type, borewell_id, status, battery_percent, signal_rssi_dbm,
        calibration_date, calibration_status, firmware_version, sample_rate_hz, raw_payload_sample
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const s of INITIAL_SENSORS) {
      insertSensor.run(
        s.id,
        s.name,
        s.type,
        s.borewellId,
        s.status,
        s.batteryPercent,
        s.signalRssiDbm,
        s.calibrationDate,
        s.calibrationStatus,
        s.firmwareVersion,
        s.sampleRateHz,
        s.rawPayloadSample
      );
    }

    // Seed Anomalies
    const insertAnomaly = this.db.prepare(`
      INSERT INTO anomalies (
        id, borewell_id, borewell_name, title, severity, timestamp, parameter,
        actual_value, expected_value, deviation_percent, why_explanation, potential_impact,
        recommended_action, status, confidence_score, root_cause_category
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const a of INITIAL_ANOMALIES) {
      insertAnomaly.run(
        a.id,
        a.borewellId,
        a.borewellName,
        a.title,
        a.severity,
        a.timestamp,
        a.parameter,
        a.actualValue,
        a.expectedValue,
        a.deviationPercent,
        a.whyExplanation,
        a.potentialImpact,
        a.recommendedAction,
        a.status,
        a.confidenceScore,
        a.rootCauseCategory
      );
    }

    // Seed Initial Telemetry (Historical 7-day data for BWL-03)
    const insertTelemetry = this.db.prepare(`
      INSERT INTO telemetry (
        borewell_id, timestamp, water_level, flow_rate, tds, temperature, pressure,
        pump_status, extraction_liters, is_simulated, source
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const pt of HISTORICAL_7DAYS_DATA) {
      insertTelemetry.run(
        'BWL-03',
        pt.timestamp,
        pt.waterLevel,
        pt.pumpState === 'ON' ? 3.4 : 0.0,
        412,
        26.4,
        1.8,
        pt.pumpState,
        pt.extractionLiters,
        1,
        'SIMULATOR'
      );
    }

    // Seed Recharge
    this.db.prepare(`
      INSERT INTO recharge (
        id, opportunity_score, rating, recent_rainfall_mm, soil_moisture_saturation_pct,
        infiltration_rate_mm_hr, unsaturated_zone_storage_capacity_m3, recommended_action,
        potential_replenishment_liters, structures_json
      ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      INITIAL_RECHARGE.opportunityScore,
      INITIAL_RECHARGE.rating,
      INITIAL_RECHARGE.recentRainfallMm,
      INITIAL_RECHARGE.soilMoistureSaturationPct,
      INITIAL_RECHARGE.infiltrationRateMmHr,
      INITIAL_RECHARGE.unsaturatedZoneStorageCapacityM3,
      INITIAL_RECHARGE.recommendedAction,
      INITIAL_RECHARGE.potentialReplenishmentLiters,
      JSON.stringify(INITIAL_RECHARGE.rechargeStructuresAvailable)
    );

    // Seed Simulation State
    this.db.prepare(`
      INSERT INTO simulation_state (
        id, is_simulating, active_scenario, target_borewell,
        water_level_offset, flow_rate_multiplier, tds_offset, pump_state
      ) VALUES (1, 0, NULL, 'BWL-03', 0.0, 1.0, 0.0, 'OFF')
    `).run();
  }

  // --- BOREWELLS ---
  public getBorewells(): BorewellNode[] {
    const rows = this.db.prepare('SELECT * FROM borewells').all() as any[];
    return rows.map(this.mapBorewell);
  }

  public getBorewellById(id: string): BorewellNode | null {
    const row = this.db.prepare('SELECT * FROM borewells WHERE id = ?').get(id) as any;
    return row ? this.mapBorewell(row) : null;
  }

  public updateBorewell(id: string, updates: Partial<BorewellNode>): void {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.waterLevelMeters !== undefined) {
      fields.push('water_level_meters = ?');
      values.push(updates.waterLevelMeters);
    }
    if (updates.waterLevelDeltaToday !== undefined) {
      fields.push('water_level_delta_today = ?');
      values.push(updates.waterLevelDeltaToday);
    }
    if (updates.todayExtractionLiters !== undefined) {
      fields.push('today_extraction_liters = ?');
      values.push(updates.todayExtractionLiters);
    }
    if (updates.pumpStatus !== undefined) {
      fields.push('pump_status = ?');
      values.push(updates.pumpStatus);
    }
    if (updates.flowRateLps !== undefined) {
      fields.push('flow_rate_lps = ?');
      values.push(updates.flowRateLps);
    }
    if (updates.healthScore !== undefined) {
      fields.push('health_score = ?');
      values.push(updates.healthScore);
    }
    if (updates.healthStatusText !== undefined) {
      fields.push('health_status_text = ?');
      values.push(updates.healthStatusText);
    }
    if (updates.status !== undefined) {
      fields.push('status = ?');
      values.push(updates.status);
    }
    if (updates.tdsPpm !== undefined) {
      fields.push('tds_ppm = ?');
      values.push(updates.tdsPpm);
    }
    if (updates.ph !== undefined) {
      fields.push('ph = ?');
      values.push(updates.ph);
    }
    if (updates.temperatureC !== undefined) {
      fields.push('temperature_c = ?');
      values.push(updates.temperatureC);
    }
    if (updates.conductivityUsCm !== undefined) {
      fields.push('conductivity_us_cm = ?');
      values.push(updates.conductivityUsCm);
    }

    if (fields.length > 0) {
      fields.push("last_updated_at = datetime('now')");
      values.push(id);
      this.db.prepare(`UPDATE borewells SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    }
  }

  private mapBorewell(row: any): BorewellNode {
    return {
      id: row.id,
      name: row.name,
      location: row.location,
      coordinates: { lat: row.latitude, lng: row.longitude },
      depthTotalMeters: row.depth_total_meters,
      pumpDepthMeters: row.pump_depth_meters,
      sensorDepthMeters: row.sensor_depth_meters,
      aquiferType: row.aquifer_type,
      casingDiameterMm: row.casing_diameter_mm,
      status: row.status,
      waterLevelMeters: row.water_level_meters,
      waterLevelDeltaToday: row.water_level_delta_today,
      expectedLevelRange: [row.expected_min_meters, row.expected_max_meters],
      todayExtractionLiters: row.today_extraction_liters,
      averageExtractionLiters: row.average_extraction_liters,
      recoveryRatePercent: row.recovery_rate_percent,
      pumpStatus: row.pump_status,
      flowRateLps: row.flow_rate_lps,
      pumpPowerKw: row.pump_power_kw,
      healthScore: row.health_score,
      healthStatusText: row.health_status_text,
      tdsPpm: row.tds_ppm,
      ph: row.ph,
      temperatureC: row.temperature_c,
      conductivityUsCm: row.conductivity_us_cm,
      lastUpdatedSecondsAgo: 2,
      activeAnomaliesCount: 0,
    };
  }

  // --- DEVICES ---
  public getDevices(borewellId?: string, status?: string): IotDevice[] {
    let sql = 'SELECT * FROM devices WHERE 1=1';
    const params: any[] = [];
    if (borewellId && borewellId !== 'All') {
      sql += ' AND borewell_id = ?';
      params.push(borewellId);
    }
    if (status && status !== 'All') {
      sql += ' AND status = ?';
      params.push(status.toUpperCase());
    }
    const rows = this.db.prepare(sql).all(...params) as any[];
    return rows.map(this.mapDevice);
  }

  public getDeviceById(id: string): IotDevice | null {
    const row = this.db.prepare('SELECT * FROM devices WHERE id = ?').get(id) as any;
    return row ? this.mapDevice(row) : null;
  }

  public createDevice(device: IotDevice): void {
    this.db.prepare(`
      INSERT INTO devices (
        id, name, type, borewell_id, borewell_name, status, model, firmware,
        sampling_interval_sec, protocol, gateway_id, battery_percent, signal_rssi_dbm,
        signal_quality_pct, latency_ms, packet_loss_pct, device_temp_c, calibration_status,
        calibration_date, next_calibration_date, current_reading_value, current_reading_unit,
        reading_delta_today, data_quality_pct, depth_meters, mac_or_imei, history_json
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `).run(
      device.id,
      device.name,
      device.type,
      device.borewellId,
      device.borewellName || '',
      device.status,
      device.model,
      device.firmware,
      device.samplingIntervalSec,
      device.protocol,
      device.gatewayId,
      device.batteryPercent,
      device.signalRssiDbm,
      device.signalQualityPct,
      device.latencyMs,
      device.packetLossPct,
      device.deviceTempC,
      device.calibrationStatus,
      device.calibrationDate,
      device.nextCalibrationDate,
      device.currentReadingValue,
      device.currentReadingUnit,
      device.readingDeltaToday || '',
      device.dataQualityPct,
      device.depthMeters || 0,
      device.macOrImei,
      JSON.stringify(device.history || [])
    );
  }

  public updateDevice(id: string, updates: Partial<IotDevice>): void {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.status !== undefined) {
      fields.push('status = ?');
      values.push(updates.status);
    }
    if (updates.latencyMs !== undefined) {
      fields.push('latency_ms = ?');
      values.push(updates.latencyMs);
    }
    if (updates.packetLossPct !== undefined) {
      fields.push('packet_loss_pct = ?');
      values.push(updates.packetLossPct);
    }
    if (updates.calibrationStatus !== undefined) {
      fields.push('calibration_status = ?');
      values.push(updates.calibrationStatus);
    }
    if (updates.calibrationDate !== undefined) {
      fields.push('calibration_date = ?');
      values.push(updates.calibrationDate);
    }
    if (updates.nextCalibrationDate !== undefined) {
      fields.push('next_calibration_date = ?');
      values.push(updates.nextCalibrationDate);
    }
    if (updates.currentReadingValue !== undefined) {
      fields.push('current_reading_value = ?');
      values.push(updates.currentReadingValue);
    }
    if (updates.history !== undefined) {
      fields.push('history_json = ?');
      values.push(JSON.stringify(updates.history));
    }

    if (fields.length > 0) {
      fields.push("last_sync_at = datetime('now')");
      values.push(id);
      this.db.prepare(`UPDATE devices SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    }
  }

  public deleteDevice(id: string): boolean {
    const info = this.db.prepare('DELETE FROM devices WHERE id = ?').run(id);
    return info.changes > 0;
  }

  private mapDevice(row: any): IotDevice {
    let history: Array<{ timestamp: string; value: number }> = [];
    try {
      history = JSON.parse(row.history_json || '[]');
    } catch {
      history = [];
    }
    return {
      id: row.id,
      name: row.name,
      type: row.type,
      borewellId: row.borewell_id,
      borewellName: row.borewell_name,
      status: row.status,
      model: row.model,
      firmware: row.firmware,
      samplingIntervalSec: row.sampling_interval_sec,
      protocol: row.protocol,
      gatewayId: row.gateway_id,
      batteryPercent: row.battery_percent,
      signalRssiDbm: row.signal_rssi_dbm,
      signalQualityPct: row.signal_quality_pct,
      latencyMs: row.latency_ms,
      packetLossPct: row.packet_loss_pct,
      deviceTempC: row.device_temp_c,
      lastSyncSecondsAgo: 4,
      calibrationStatus: row.calibration_status,
      calibrationDate: row.calibration_date,
      nextCalibrationDate: row.next_calibration_date,
      currentReadingValue: row.current_reading_value,
      currentReadingUnit: row.current_reading_unit,
      readingDeltaToday: row.reading_delta_today,
      dataQualityPct: row.data_quality_pct,
      depthMeters: row.depth_meters,
      macOrImei: row.mac_or_imei,
      history,
    };
  }

  // --- SENSORS ---
  public getSensors(borewellId?: string): SensorTelemetry[] {
    let sql = 'SELECT * FROM sensors';
    const params: any[] = [];
    if (borewellId) {
      sql += ' WHERE borewell_id = ?';
      params.push(borewellId);
    }
    const rows = this.db.prepare(sql).all(...params) as any[];
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      type: r.type,
      borewellId: r.borewell_id,
      status: r.status,
      batteryPercent: r.battery_percent,
      signalRssiDbm: r.signal_rssi_dbm,
      lastSyncSecondsAgo: 4,
      calibrationDate: r.calibration_date,
      calibrationStatus: r.calibration_status,
      firmwareVersion: r.firmware_version,
      sampleRateHz: r.sample_rate_hz,
      rawPayloadSample: r.raw_payload_sample,
    }));
  }

  // --- TELEMETRY ---
  public insertTelemetry(data: {
    borewellId: string;
    deviceId?: string;
    timestamp: string;
    waterLevel: number;
    flowRate: number;
    tds: number;
    temperature: number;
    pressure: number;
    pumpStatus: string;
    extractionLiters: number;
    isSimulated?: boolean;
    source?: string;
  }): number {
    const res = this.db.prepare(`
      INSERT INTO telemetry (
        borewell_id, device_id, timestamp, water_level, flow_rate, tds,
        temperature, pressure, pump_status, extraction_liters, is_simulated, source
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      data.borewellId,
      data.deviceId || null,
      data.timestamp,
      data.waterLevel,
      data.flowRate,
      data.tds,
      data.temperature,
      data.pressure,
      data.pumpStatus,
      data.extractionLiters,
      data.isSimulated !== undefined ? (data.isSimulated ? 1 : 0) : 1,
      data.source || 'SIMULATOR'
    );
    return Number(res.lastInsertRowid);
  }

  public getTelemetry(borewellId?: string, limit = 50): GroundwaterDataPoint[] {
    let sql = 'SELECT * FROM telemetry';
    const params: any[] = [];
    if (borewellId) {
      sql += ' WHERE borewell_id = ?';
      params.push(borewellId);
    }
    sql += ' ORDER BY id DESC LIMIT ?';
    params.push(limit);

    const rows = this.db.prepare(sql).all(...params) as any[];
    return rows.reverse().map((r, i) => {
      const parts = r.timestamp.split(' ');
      const dateStr = parts[0] || 'Today';
      const timeStr = parts[1] || '12:00';
      const hour = parseInt(timeStr.split(':')[0], 10) || 12;

      return {
        timestamp: r.timestamp,
        dateStr,
        hour,
        waterLevel: r.water_level,
        expectedMin: 17.5,
        expectedMax: 18.8,
        pumpState: r.pump_status === 'ON' ? 'ON' : 'OFF',
        extractionLiters: r.extraction_liters,
      };
    });
  }

  // --- ANOMALIES ---
  public getAnomalies(status?: string, severity?: string): Anomaly[] {
    let sql = 'SELECT * FROM anomalies WHERE 1=1';
    const params: any[] = [];
    if (status && status !== 'all') {
      sql += ' AND status = ?';
      params.push(status);
    }
    if (severity && severity !== 'all') {
      sql += ' AND severity = ?';
      params.push(severity);
    }
    sql += ' ORDER BY created_at DESC';
    const rows = this.db.prepare(sql).all(...params) as any[];
    return rows.map((r) => ({
      id: r.id,
      borewellId: r.borewell_id,
      borewellName: r.borewell_name,
      title: r.title,
      severity: r.severity,
      timestamp: r.timestamp,
      parameter: r.parameter,
      actualValue: r.actual_value,
      expectedValue: r.expected_value,
      deviationPercent: r.deviation_percent,
      whyExplanation: r.why_explanation,
      potentialImpact: r.potential_impact,
      recommendedAction: r.recommended_action,
      status: r.status,
      confidenceScore: r.confidence_score,
      rootCauseCategory: r.root_cause_category,
    }));
  }

  public getAnomalyById(id: string): Anomaly | null {
    const r = this.db.prepare('SELECT * FROM anomalies WHERE id = ?').get(id) as any;
    if (!r) return null;
    return {
      id: r.id,
      borewellId: r.borewell_id,
      borewellName: r.borewell_name,
      title: r.title,
      severity: r.severity,
      timestamp: r.timestamp,
      parameter: r.parameter,
      actualValue: r.actual_value,
      expectedValue: r.expected_value,
      deviationPercent: r.deviation_percent,
      whyExplanation: r.why_explanation,
      potentialImpact: r.potential_impact,
      recommendedAction: r.recommended_action,
      status: r.status,
      confidenceScore: r.confidence_score,
      rootCauseCategory: r.root_cause_category,
    };
  }

  public insertAnomaly(a: Anomaly): void {
    this.db.prepare(`
      INSERT OR REPLACE INTO anomalies (
        id, borewell_id, borewell_name, title, severity, timestamp, parameter,
        actual_value, expected_value, deviation_percent, why_explanation, potential_impact,
        recommended_action, status, confidence_score, root_cause_category
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      a.id,
      a.borewellId,
      a.borewellName,
      a.title,
      a.severity,
      a.timestamp,
      a.parameter,
      a.actualValue,
      a.expectedValue,
      a.deviationPercent,
      a.whyExplanation,
      a.potentialImpact,
      a.recommendedAction,
      a.status,
      a.confidenceScore,
      a.rootCauseCategory
    );
  }

  public resolveAnomaly(id: string): void {
    this.db.prepare(`
      UPDATE anomalies
      SET status = 'resolved', resolved_at = datetime('now')
      WHERE id = ?
    `).run(id);
  }

  // --- RECHARGE ---
  public getRecharge(): RechargeAssessment {
    const row = this.db.prepare('SELECT * FROM recharge WHERE id = 1').get() as any;
    if (!row) return INITIAL_RECHARGE;
    let structures: any[] = [];
    try {
      structures = JSON.parse(row.structures_json);
    } catch {
      structures = INITIAL_RECHARGE.rechargeStructuresAvailable;
    }
    return {
      opportunityScore: row.opportunity_score,
      rating: row.rating,
      recentRainfallMm: row.recent_rainfall_mm,
      soilMoistureSaturationPct: row.soil_moisture_saturation_pct,
      infiltrationRateMmHr: row.infiltration_rate_mm_hr,
      unsaturatedZoneStorageCapacityM3: row.unsaturated_zone_storage_capacity_m3,
      recommendedAction: row.recommended_action,
      potentialReplenishmentLiters: row.potential_replenishment_liters,
      rechargeStructuresAvailable: structures,
    };
  }

  // --- SIMULATION STATE ---
  public getSimulationState(): {
    isSimulating: boolean;
    activeScenario: string | null;
    targetBorewell: string;
    waterLevelOffset: number;
    flowRateMultiplier: number;
    tdsOffset: number;
    pumpState: string;
  } {
    const r = this.db.prepare('SELECT * FROM simulation_state WHERE id = 1').get() as any;
    if (!r) {
      return {
        isSimulating: false,
        activeScenario: null,
        targetBorewell: 'BWL-03',
        waterLevelOffset: 0.0,
        flowRateMultiplier: 1.0,
        tdsOffset: 0.0,
        pumpState: 'OFF',
      };
    }
    return {
      isSimulating: r.is_simulating === 1,
      activeScenario: r.active_scenario,
      targetBorewell: r.target_borewell,
      waterLevelOffset: r.water_level_offset,
      flowRateMultiplier: r.flow_rate_multiplier,
      tdsOffset: r.tds_offset,
      pumpState: r.pump_state,
    };
  }

  public updateSimulationState(data: {
    isSimulating: boolean;
    activeScenario: string | null;
    targetBorewell?: string;
    waterLevelOffset?: number;
    flowRateMultiplier?: number;
    tdsOffset?: number;
    pumpState?: string;
  }): void {
    this.db.prepare(`
      UPDATE simulation_state SET
        is_simulating = ?,
        active_scenario = ?,
        target_borewell = COALESCE(?, target_borewell),
        water_level_offset = COALESCE(?, water_level_offset),
        flow_rate_multiplier = COALESCE(?, flow_rate_multiplier),
        tds_offset = COALESCE(?, tds_offset),
        pump_state = COALESCE(?, pump_state),
        last_updated_at = datetime('now')
      WHERE id = 1
    `).run(
      data.isSimulating ? 1 : 0,
      data.activeScenario,
      data.targetBorewell || null,
      data.waterLevelOffset !== undefined ? data.waterLevelOffset : null,
      data.flowRateMultiplier !== undefined ? data.flowRateMultiplier : null,
      data.tdsOffset !== undefined ? data.tdsOffset : null,
      data.pumpState || null
    );
  }
}
