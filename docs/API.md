# JalRakshak — REST & Real-Time API Specification
**Base URL:** `http://localhost:4000/api`  
**WebSocket URL:** `ws://localhost:4000` (Socket.IO client namespace `/`)

---

## 1. Response Envelope Format

All REST responses adhere to a consistent JSON envelope structure:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional human-readable confirmation"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error description message",
  "code": "DEVICE_NOT_FOUND"
}
```

Standard HTTP Status Codes:
- `200 OK`: Request succeeded
- `201 Created`: Resource successfully created
- `400 Bad Request`: Validation failure or malformed payload
- `404 Not Found`: Target resource does not exist
- `409 Conflict`: Duplicate ID or invalid state transition
- `500 Internal Server Error`: Unhandled server exception (sanitized in production)

---

## 2. REST Endpoints

### 2.1 System & Health

#### `GET /api/health`
Check server runtime status, database connection, and simulator state.
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "uptimeSeconds": 3482,
    "version": "1.0.0",
    "database": "connected",
    "simulator": {
      "running": true,
      "scenario": "normal",
      "mode": "SIMULATION"
    }
  }
}
```

---

### 2.2 Borewells

#### `GET /api/borewells`
Retrieve list of all 5 monitored borewell nodes with current physical telemetry.
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": [
    {
      "id": "BWL-03",
      "name": "Borewell BWL-03 (East Sector Agricultural Node)",
      "location": "Sector 4 - Agricultural Perimeter",
      "coordinates": { "lat": 18.5204, "lng": 73.8567 },
      "depthTotalMeters": 92.0,
      "pumpDepthMeters": 55.0,
      "sensorDepthMeters": 72.0,
      "aquiferType": "Semi-Confined Basalt",
      "casingDiameterMm": 200,
      "status": "warning",
      "waterLevelMeters": 18.4,
      "waterLevelDeltaToday": -0.8,
      "expectedLevelRange": [17.5, 18.8],
      "todayExtractionLiters": 2840,
      "averageExtractionLiters": 2170,
      "recoveryRatePercent": 72,
      "pumpStatus": "ON",
      "flowRateLps": 3.4,
      "pumpPowerKw": 5.5,
      "healthScore": 78,
      "healthStatusText": "HEALTHY WITH MODERATE RISK",
      "tdsPpm": 412,
      "ph": 7.2,
      "temperatureC": 26.4,
      "conductivityUsCm": 644,
      "lastUpdatedSecondsAgo": 2,
      "activeAnomaliesCount": 1
    }
  ]
}
```

#### `GET /api/borewells/:id`
Retrieve detailed telemetry and configuration for a specific borewell node.

#### `POST /api/borewells/:id/pump`
Toggle or set the pump operational state for a borewell node.
- **Request Body**:
```json
{
  "status": "ON" // or "OFF", or omit to toggle current state
}
```
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "borewellId": "BWL-03",
    "pumpStatus": "ON",
    "flowRateLps": 3.4,
    "waterLevelMeters": 18.4
  },
  "message": "Pump state switched to ON"
}
```

---

### 2.3 Devices

#### `GET /api/devices`
List all provisioned IoT devices with optional filters.
- **Query Parameters**:
  - `borewellId` (e.g. `?borewellId=BWL-03`)
  - `status` (e.g. `?status=ONLINE`)
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": [
    {
      "id": "DEV-WLS-03",
      "name": "Water Level Sensor (Hydrostatic Pressure)",
      "type": "Water Level Sensor",
      "borewellId": "BWL-03",
      "borewellName": "Borewell BWL-03 (East Sector)",
      "status": "ONLINE",
      "model": "WL-01 Pro Industrial",
      "firmware": "v1.4.2",
      "samplingIntervalSec": 30,
      "protocol": "LoRaWAN",
      "gatewayId": "GW-001",
      "batteryPercent": 87,
      "signalRssiDbm": -71,
      "signalQualityPct": 82,
      "latencyMs": 42,
      "packetLossPct": 0.8,
      "deviceTempC": 31.2,
      "lastSyncSecondsAgo": 4,
      "calibrationStatus": "VALID",
      "calibrationDate": "2026-06-15",
      "nextCalibrationDate": "2026-12-15",
      "currentReadingValue": "18.42",
      "currentReadingUnit": "m",
      "readingDeltaToday": "↓ 0.8 m today",
      "dataQualityPct": 98.4,
      "depthMeters": 72.0,
      "macOrImei": "70:B3:D5:7E:D0:02:18:42",
      "history": [ ... ]
    }
  ]
}
```

#### `GET /api/devices/:id`
Get full device record by ID.

#### `POST /api/devices`
Provision a new IoT sensor device.
- **Request Body**:
```json
{
  "id": "DEV-WLS-06",
  "name": "Deep Aquifer Pressure Transducer",
  "type": "Water Level Sensor",
  "borewellId": "BWL-05",
  "protocol": "LoRaWAN",
  "samplingIntervalSec": 30,
  "depthMeters": 95.0,
  "macOrImei": "70:B3:D5:7E:D0:05:95:00"
}
```
- **Response `201 Created`**:
```json
{
  "success": true,
  "data": { ...deviceRecord },
  "message": "Device DEV-WLS-06 provisioned successfully"
}
```

#### `PATCH /api/devices/:id`
Update device metadata, calibration dates, or parameters.

#### `DELETE /api/devices/:id`
Decommission a device.

---

### 2.4 Device Diagnostics & Health

#### `GET /api/devices/:id/health`
Return diagnostic telemetry (battery, RSSI, packet loss, sensor drifts).

#### `POST /api/devices/:id/test-connection`
Ping device via simulated gateway handshake.
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "deviceId": "DEV-WLS-03",
    "latencyMs": 38,
    "packetLossPct": 0.2,
    "status": "ONLINE"
  },
  "message": "Uplink verified with 38ms round-trip latency. Gateway ACK received."
}
```

#### `POST /api/devices/:id/calibrate`
Reset zero/span offset and renew calibration certificate for 180 days.
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "deviceId": "DEV-WLS-03",
    "calibrationStatus": "VALID",
    "calibrationDate": "2026-10-02",
    "nextCalibrationDate": "2027-04-02",
    "status": "ONLINE"
  },
  "message": "Sensor calibration certified for 180 days."
}
```

---

### 2.5 Telemetry

#### `GET /api/telemetry`
Query time-series telemetry records.
- **Query Parameters**:
  - `borewellId` (string, optional)
  - `deviceId` (string, optional)
  - `from` (ISO string, optional)
  - `to` (ISO string, optional)
  - `limit` (integer, default 50, max 500)
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": [
    {
      "timestamp": "Today 10:42",
      "dateStr": "Today",
      "hour": 10,
      "waterLevel": 18.42,
      "expectedMin": 17.5,
      "expectedMax": 18.8,
      "pumpState": "ON",
      "extractionLiters": 640,
      "isSimulated": true,
      "source": "SIMULATOR"
    }
  ]
}
```

#### `POST /api/telemetry/ingest`
Ingest raw sensor telemetry from physical hardware (ESP32/LoRaWAN gateway) or simulator.
- **Validation**: Rejects negative waterLevel, negative flowRate, TDS < 0, temperature outside [-10, 60]°C.
- **Response `201 Created`**:
```json
{
  "success": true,
  "message": "Telemetry reading ingested and analyzed"
}
```

---

### 2.6 Anomalies & Incident Management

#### `GET /api/anomalies`
Retrieve list of detected anomalies.
- **Query Parameters**:
  - `status`: `'active'` | `'investigating'` | `'resolved'` | `'all'`
  - `severity`: `'info'` | `'warning'` | `'critical'` | `'all'`
  - `borewellId`: string (optional)
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": [
    {
      "id": "ANOM-2026-084",
      "borewellId": "BWL-03",
      "borewellName": "Borewell BWL-03",
      "title": "Rapid Groundwater Decline",
      "severity": "warning",
      "timestamp": "10:42 AM Today",
      "parameter": "Groundwater Drawdown Rate",
      "actualValue": "1.4 m drawdown",
      "expectedValue": "0.5 m baseline",
      "deviationPercent": 180,
      "whyExplanation": "Extraction behavior is 31% above the expected pattern. Water level is falling faster than historical operating diurnal curve.",
      "potentialImpact": "Elevated groundwater depletion risk. Cone of depression deepening into basal fracture zone.",
      "recommendedAction": "Review current pumping duration. Throttling pump schedule recommended to permit hydrostatic equilibrium.",
      "status": "active",
      "confidenceScore": 87,
      "rootCauseCategory": "Excessive Pumping"
    }
  ]
}
```

#### `POST /api/anomalies/:id/acknowledge`
Mark anomaly as under investigation.

#### `POST /api/anomalies/:id/resolve`
Mark anomaly resolved and restore associated borewell health score.

---

### 2.7 Simulation (Digital Twin)

#### `GET /api/simulation/status`
Returns active scenario, target borewell, and simulation parameters.

#### `POST /api/simulation/scenario`
Activate one of the 6 core scenarios.
- **Request Body**:
```json
{
  "scenarioId": "high_extraction", // 'normal', 'high_extraction', 'poor_recovery', 'pump_fault', 'water_quality_spike', 'sensor_failure'
  "targetBorewell": "BWL-03"
}
```

#### `POST /api/simulation/reset`
Reset all borewells, devices, and anomalies to live nominal telemetry.

---

## 3. Real-Time WebSocket Events (Socket.IO)

Clients connect to the Socket.IO root namespace:
```javascript
import io from 'socket.io-client';
const socket = io('http://localhost:4000');
```

### Server-to-Client Events

| Event Name | Payload Description |
| :--- | :--- |
| `telemetry:update` | Emitted every 2.0s with new telemetry reading for active borewells. |
| `anomaly:new` | Emitted immediately when the anomaly engine detects a rule violation. |
| `anomaly:resolved` | Emitted when an anomaly is resolved or mitigated. |
| `device:status` | Emitted when device connectivity, battery, or calibration changes. |
| `simulation:state` | Emitted whenever simulation scenario starts, updates, or resets. |
| `borewell:update` | Emitted when pump state, health score, or water level changes. |
