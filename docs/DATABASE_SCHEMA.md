# JalRakshak — Database Schema Specification
**Database:** SQLite (`jalrakshak.db`)  
**Design:** Normalized Relational Model with Indexed Foreign Keys

---

## 1. Entity-Relationship Overview

```text
┌──────────────┐
│    users     │
└──────────────┘

┌──────────────────┐       1:N       ┌─────────────────┐
│    borewells     ├─────────────────►     devices     │
└────────┬─────────┘                 └────────┬────────┘
         │                                    │ 1:N
         │ 1:N                                ▼
         │                           ┌─────────────────┐
         │                           │     sensors     │
         │                           └────────┬────────┘
         │                                    │ 1:N
         │                                    ▼
         │                           ┌─────────────────┐
         ├───────────────────────────►    telemetry    │
         │                           └────────┬────────┘
         │ 1:N                                │
         ▼                                    ▼
┌──────────────────┐       N:1       ┌─────────────────┐
│    anomalies     ◄─────────────────┤     alerts      │
└──────────────────┘                 └─────────────────┘

┌──────────────────────┐
│   simulation_state   │
└──────────────────────┘
```

---

## 2. Table Definitions

### 2.1 `users`
System operators and field engineers.
```sql
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'operator', -- 'admin', 'operator', 'viewer'
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### 2.2 `borewells`
Physical groundwater extraction nodes and piezometer observation stations.
```sql
CREATE TABLE IF NOT EXISTS borewells (
  id TEXT PRIMARY KEY,                       -- e.g. 'BWL-03'
  name TEXT NOT NULL,                        -- e.g. 'Borewell BWL-03 (East Sector)'
  location TEXT NOT NULL,                    -- e.g. 'Sector 4 - Agricultural Perimeter'
  latitude REAL NOT NULL,                    -- e.g. 18.5204
  longitude REAL NOT NULL,                   -- e.g. 73.8567
  depth_total_meters REAL NOT NULL,          -- e.g. 92.0
  pump_depth_meters REAL NOT NULL,           -- e.g. 55.0
  sensor_depth_meters REAL NOT NULL,         -- e.g. 72.0
  aquifer_type TEXT NOT NULL,                -- e.g. 'Semi-Confined Basalt'
  casing_diameter_mm INTEGER NOT NULL,       -- e.g. 200
  status TEXT NOT NULL DEFAULT 'healthy',     -- 'healthy', 'warning', 'critical', 'offline'
  water_level_meters REAL NOT NULL,          -- Current depth to water from surface
  water_level_delta_today REAL NOT NULL,     -- e.g. -0.8
  expected_min_meters REAL NOT NULL,         -- e.g. 17.5
  expected_max_meters REAL NOT NULL,         -- e.g. 18.8
  today_extraction_liters INTEGER NOT NULL,  -- e.g. 2840
  average_extraction_liters INTEGER NOT NULL,-- e.g. 2170
  recovery_rate_percent INTEGER NOT NULL,    -- e.g. 72
  pump_status TEXT NOT NULL DEFAULT 'OFF',   -- 'ON', 'OFF', 'FAULT', 'COOLDOWN'
  flow_rate_lps REAL NOT NULL DEFAULT 0.0,   -- Liters per second
  pump_power_kw REAL NOT NULL DEFAULT 5.5,   -- Motor kilowatt rating
  health_score INTEGER NOT NULL DEFAULT 85,  -- 0 to 100
  health_status_text TEXT NOT NULL,          -- e.g. 'HEALTHY WITH MODERATE RISK'
  tds_ppm INTEGER NOT NULL DEFAULT 412,      -- Total Dissolved Solids
  ph REAL NOT NULL DEFAULT 7.2,              -- pH level
  temperature_c REAL NOT NULL DEFAULT 26.4,  -- Temperature in Celsius
  conductivity_us_cm REAL NOT NULL DEFAULT 644,
  last_updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### 2.3 `devices`
IoT hardware nodes attached to borewells.
```sql
CREATE TABLE IF NOT EXISTS devices (
  id TEXT PRIMARY KEY,                       -- e.g. 'DEV-WLS-03'
  name TEXT NOT NULL,                        -- e.g. 'Water Level Sensor (Hydrostatic Pressure)'
  type TEXT NOT NULL,                        -- e.g. 'Water Level Sensor', 'Flow Sensor'
  borewell_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ONLINE',     -- 'ONLINE', 'DEGRADED', 'OFFLINE', 'CALIBRATION REQUIRED', 'LOW BATTERY', 'SIGNAL WARNING'
  model TEXT NOT NULL,                       -- e.g. 'WL-01 Pro Industrial'
  firmware TEXT NOT NULL,                    -- e.g. 'v1.4.2'
  sampling_interval_sec INTEGER NOT NULL,    -- e.g. 30
  protocol TEXT NOT NULL,                    -- 'LoRaWAN', 'MQTT', 'Modbus RS-485', '4G/LTE', 'Wi-Fi'
  gateway_id TEXT NOT NULL,                  -- e.g. 'GW-001'
  battery_percent INTEGER NOT NULL,          -- e.g. 87
  signal_rssi_dbm INTEGER NOT NULL,          -- e.g. -71
  signal_quality_pct INTEGER NOT NULL,       -- e.g. 82
  latency_ms INTEGER NOT NULL,               -- e.g. 42
  packet_loss_pct REAL NOT NULL,             -- e.g. 0.8
  device_temp_c REAL NOT NULL,               -- e.g. 31.2
  calibration_status TEXT NOT NULL,          -- 'VALID', 'CALIBRATION REQUIRED', 'EXPIRED'
  calibration_date TEXT NOT NULL,            -- 'YYYY-MM-DD'
  next_calibration_date TEXT NOT NULL,       -- 'YYYY-MM-DD'
  current_reading_value TEXT NOT NULL,       -- e.g. '18.42'
  current_reading_unit TEXT NOT NULL,        -- e.g. 'm'
  reading_delta_today TEXT,                  -- e.g. '↓ 0.8 m today'
  data_quality_pct REAL NOT NULL DEFAULT 98.4,
  depth_meters REAL DEFAULT 0.0,
  mac_or_imei TEXT NOT NULL,
  last_sync_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (borewell_id) REFERENCES borewells(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_devices_borewell_id ON devices(borewell_id);
```

### 2.4 `sensors`
Individual transducer and sensing elements associated with devices and borewells.
```sql
CREATE TABLE IF NOT EXISTS sensors (
  id TEXT PRIMARY KEY,                       -- e.g. 'SNS-WLS-03'
  name TEXT NOT NULL,
  type TEXT NOT NULL,                        -- 'Hydrostatic Pressure', 'Electromagnetic Flow', etc.
  borewell_id TEXT NOT NULL,
  device_id TEXT,
  status TEXT NOT NULL DEFAULT 'online',     -- 'online', 'warning', 'critical', 'offline'
  battery_percent INTEGER NOT NULL DEFAULT 100,
  signal_rssi_dbm INTEGER NOT NULL DEFAULT -70,
  calibration_date TEXT NOT NULL,
  calibration_status TEXT NOT NULL,
  firmware_version TEXT NOT NULL,
  sample_rate_hz REAL NOT NULL DEFAULT 1.0,
  raw_payload_sample TEXT NOT NULL,
  last_sync_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (borewell_id) REFERENCES borewells(id) ON DELETE CASCADE,
  FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE SET NULL
);
```

### 2.5 `telemetry`
Time-series telemetry readings from field sensors and simulator.
```sql
CREATE TABLE IF NOT EXISTS telemetry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  borewell_id TEXT NOT NULL,
  device_id TEXT,
  timestamp TEXT NOT NULL,                   -- ISO8601 string
  water_level REAL NOT NULL,                 -- meters
  flow_rate REAL NOT NULL,                   -- L/s
  tds REAL NOT NULL,                         -- ppm
  temperature REAL NOT NULL,                 -- °C
  pressure REAL NOT NULL,                    -- bar
  pump_status TEXT NOT NULL,                 -- 'ON' or 'OFF'
  extraction_liters INTEGER NOT NULL,        -- Liters extracted in this cycle/hour
  is_simulated INTEGER NOT NULL DEFAULT 1,   -- 1 for Simulated, 0 for Live Physical Hardware
  source TEXT NOT NULL DEFAULT 'SIMULATOR',  -- 'SIMULATOR' or 'LIVE_HARDWARE'
  FOREIGN KEY (borewell_id) REFERENCES borewells(id) ON DELETE CASCADE,
  FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_telemetry_borewell_time ON telemetry(borewell_id, timestamp);
```

### 2.6 `anomalies`
Physics and operational anomalies detected by the anomaly engine.
```sql
CREATE TABLE IF NOT EXISTS anomalies (
  id TEXT PRIMARY KEY,                       -- e.g. 'ANOM-2026-084'
  borewell_id TEXT NOT NULL,
  device_id TEXT,
  telemetry_id INTEGER,
  title TEXT NOT NULL,
  severity TEXT NOT NULL,                    -- 'info', 'warning', 'critical'
  timestamp TEXT NOT NULL,
  parameter TEXT NOT NULL,
  actual_value TEXT NOT NULL,
  expected_value TEXT NOT NULL,
  deviation_percent REAL NOT NULL,
  why_explanation TEXT NOT NULL,
  potential_impact TEXT NOT NULL,
  recommended_action TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',     -- 'active', 'investigating', 'resolved'
  confidence_score INTEGER NOT NULL,         -- 0 to 100
  root_cause_category TEXT NOT NULL,         -- 'Excessive Pumping', 'Aquifer Stress', 'Hardware Fault', 'Saline Intrusion', 'Sensor Drift'
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  resolved_at TEXT,
  FOREIGN KEY (borewell_id) REFERENCES borewells(id) ON DELETE CASCADE,
  FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE SET NULL,
  FOREIGN KEY (telemetry_id) REFERENCES telemetry(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_anomalies_status ON anomalies(status);
```

### 2.7 `alerts`
Push notifications and operator alerts.
```sql
CREATE TABLE IF NOT EXISTS alerts (
  id TEXT PRIMARY KEY,
  anomaly_id TEXT,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  time TEXT NOT NULL,
  type TEXT NOT NULL,                        -- 'warning', 'critical', 'info'
  read INTEGER NOT NULL DEFAULT 0,           -- 0 = unread, 1 = read
  link_tab TEXT,                             -- 'anomalies', 'recharge', 'devices', etc.
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (anomaly_id) REFERENCES anomalies(id) ON DELETE CASCADE
);
```

### 2.8 `simulation_state`
Current operational state of the Digital Twin simulator.
```sql
CREATE TABLE IF NOT EXISTS simulation_state (
  id INTEGER PRIMARY KEY CHECK (id = 1),     -- Singleton row
  is_simulating INTEGER NOT NULL DEFAULT 0,
  active_scenario TEXT,                      -- 'normal', 'high_extraction', 'poor_recovery', 'pump_fault', 'water_quality_spike'
  target_borewell TEXT NOT NULL DEFAULT 'BWL-03',
  water_level_offset REAL NOT NULL DEFAULT 0.0,
  flow_rate_multiplier REAL NOT NULL DEFAULT 1.0,
  tds_offset REAL NOT NULL DEFAULT 0.0,
  pump_state TEXT NOT NULL DEFAULT 'OFF',
  last_updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```
