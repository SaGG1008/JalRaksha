# JalRakshak — Codebase Audit Report
**Date:** October 2026  
**Auditor:** Lead Backend & Integration Engineer  
**Project:** JalRakshak — IoT Underground Water Management & Groundwater Intelligence

---

## 1. Current Architecture

The JalRakshak application is currently an advanced single-page client application built with **React 19**, **TypeScript**, **Vite 8**, and **TailwindCSS v4**. The application features rich UI visualizations, SVG-based hydrogeological subsurface cross-sections, real-time animation loops, and interactive modal dialogs.

```text
┌────────────────────────────────────────────────────────────────────────┐
│                          REACT 19 FRONTEND                             │
├────────────────────────────────────────────────────────────────────────┤
│ Topbar (Global Status / Borewell Picker / Notifications / Mode Toggle) │
├────────────────────────────────────────────────────────────────────────┤
│ Sidebar (Navigation Tabs)                                              │
├────────────────────────────────────────────────────────────────────────┤
│ Active Page / View:                                                    │
│  - OverviewPage (AquiferCommandCenter, SystemStatePanel, TelemetryDock)│
│  - GroundwaterPage (BorewellCrossSection, GroundwaterLevelChart)       │
│  - ExtractionPage (Pump Telemetry, Discharge & Quota Accounting)       │
│  - WaterQualityPage (TDS, pH, EC, Temp & BIS 10500 Benchmarking)       │
│  - AnomaliesPage (Diagnostic Center, RCA Inference, Mitigate Modal)   │
│  - RechargePage (MAR Opportunities, Infiltration, Structure Capacity)  │
│  - NetworkPage (5-Node Geospatial Piezometer Topology Grid)           │
│  - DevicesPage (Sensor Fleet Management, Details & Add Device Wizard)  │
│  - SensorsPage (Hardware Telemetry, Gateway Uplinks, Raw Payloads)    │
│  - InsightsPage (Safe-Yield Predictive Modeling & Diurnal Balance)    │
│  - SettingsPage (Field Gateway Parameters, Protocol Links, CSV Export) │
│  - PublicLandingPage (Public Showcase Mode)                            │
├────────────────────────────────────────────────────────────────────────┤
│ Modals:                                                                │
│  - DigitalTwinModal (Simulation Scenarios Trigger)                     │
│  - AnomalyInvestigateModal (RCA Deep Dive & PLC Interlock)             │
│  - DeviceDetailsModal (In-Situ Subsurface SVG, Diagnostics, Ping/Cal)  │
│  - AddDeviceModal (3-Step IoT Hardware Provisioning Wizard)            │
├────────────────────────────────────────────────────────────────────────┤
│ State Management:                                                      │
│  - JalRakshakContext (React Context + Hooks)                           │
│  - 2.5s setInterval heartbeat simulating live drift and packet updates │
│  - Hardcoded local state mutations for simulation scenarios & toggles  │
└────────────────────────────────────────────────────────────────────────┘
```

### Components & Layout
- **Navigation:** Single-source state in `JalRakshakContext` (`activeTab: NavTab`). `App.tsx` routes tabs without browser reload.
- **Visualizations:** Custom SVG geometry for aquifer stratigraphic layers (vadose zone, fractured basalt, water table line, dynamic cone of depression, pumping streamlines, submersible pump, hydrostatic probes, time-series curves with scrubbers).
- **Themes:** Dual-theme engine (dark mode default with emerald/slate hues, light mode support synced to HTML class).

---

## 2. Existing Functionality

| Feature | Status | Location | Notes |
| :--- | :--- | :--- | :--- |
| **Aquifer Visualization** | Complete (Frontend) | `src/components/aquifer/AquiferCommandCenter.tsx` | SVG subsurface strata (0–100m depth), dynamic water table, pump drawdown cone, streamlines, probe markers. |
| **Telemetry** | Simulated (Frontend interval) | `src/components/aquifer/TelemetryDock.tsx`, `src/pages/ExtractionPage.tsx` | 2.5s `setInterval` in context updates `lastSyncSecondsAgo` and ticks values. Dual-axis SVG charts with hover scrubbers. |
| **Devices** | Complete UI / Mock Data | `src/pages/DevicesPage.tsx`, `src/components/devices/*` | Filter by status/borewell, search by ID/type, modal with in-situ placement SVG, test ping, calibrate sensor, provision new device. |
| **Anomalies** | Complete UI / Mock Data | `src/pages/AnomaliesPage.tsx`, `src/components/anomalies/AnomalyInvestigateModal.tsx` | Severity badges (`critical`, `warning`, `info`), actual vs. expected baseline, explainable RCA ("Why is this happening"), mitigation interlock. |
| **Simulation / Digital Twin** | Client-Only Simulation | `src/components/simulation/DigitalTwinModal.tsx`, `src/context/JalRakshakContext.tsx` | 5 scenarios (`normal`, `high_extraction`, `poor_recovery`, `pump_fault`, `water_quality_spike`). Modifies target `BWL-03` client state directly. |
| **Digital Twin Modal** | Complete UI | `src/components/simulation/DigitalTwinModal.tsx` | Allows scenario switching, shows expected cascade breadcrumb, triggers state change in context. |
| **Borewell Network** | Complete UI / Mock Data | `src/pages/NetworkPage.tsx`, `src/components/layout/Topbar.tsx` | 5 monitoring nodes (`BWL-01` to `BWL-05`). Topbar dropdown switches active node; NetworkPage shows topology grid. |
| **Water Quality** | Complete UI / Mock Data | `src/pages/WaterQualityPage.tsx` | TDS, pH, conductivity, temperature, BIS 10500 potability compliance indicators. |
| **Recharge (MAR)** | Complete UI / Mock Data | `src/pages/RechargePage.tsx` | Rainfall, soil moisture saturation, unsaturated storage capacity (18,400 m³), structure capacities (shafts, tanks). |
| **Sensors Fleet** | Complete UI / Mock Data | `src/pages/SensorsPage.tsx` | Hardware diagnostic cards (battery %, signal RSSI, sample rate, firmware, hex raw payloads). |
| **Insights** | Complete UI / Mock Data | `src/pages/InsightsPage.tsx` | Safe-yield predictive curves, diurnal balance, 30D/90D/Annual forecast projections. |
| **Settings** | Complete UI / Mock Data | `src/pages/SettingsPage.tsx` | Broker links, gateway ping tests, CSV telemetry export, interlock thresholds. |

---

## 3. Existing Data Structures

Defined in `src/types/index.ts`:

### Core Entities
1. **`BorewellNode`**
   - `id`: string (`BWL-01` to `BWL-05`)
   - `name`: string
   - `location`: string
   - `coordinates`: `{ lat: number; lng: number }`
   - `depthTotalMeters`: number (e.g. 92.0)
   - `pumpDepthMeters`: number (e.g. 55.0)
   - `sensorDepthMeters`: number (e.g. 72.0)
   - `aquiferType`: `'Unconfined Alluvial' | 'Semi-Confined Basalt' | 'Confined Sandstone' | 'Hard Rock Fissured'`
   - `casingDiameterMm`: number (e.g. 200)
   - `status`: `'healthy' | 'warning' | 'critical' | 'offline'`
   - `waterLevelMeters`: number
   - `waterLevelDeltaToday`: number
   - `expectedLevelRange`: `[number, number]`
   - `todayExtractionLiters`: number
   - `averageExtractionLiters`: number
   - `recoveryRatePercent`: number
   - `pumpStatus`: `'ON' | 'OFF' | 'FAULT' | 'COOLDOWN'`
   - `flowRateLps`: number
   - `pumpPowerKw`: number
   - `healthScore`: number (0–100)
   - `healthStatusText`: string
   - `tdsPpm`, `ph`, `temperatureC`, `conductivityUsCm`: number
   - `lastUpdatedSecondsAgo`: number
   - `activeAnomaliesCount`: number

2. **`IotDevice`**
   - `id`: string (e.g. `DEV-WLS-03`)
   - `name`: string
   - `type`: `'Water Level Sensor' | 'Flow Sensor' | 'TDS / EC Sensor' | 'Temperature Sensor' | 'Pressure Sensor' | 'Pump Controller' | 'IoT Gateway'`
   - `borewellId`: string
   - `borewellName`: string
   - `status`: `'ONLINE' | 'DEGRADED' | 'OFFLINE' | 'CALIBRATION REQUIRED' | 'LOW BATTERY' | 'SIGNAL WARNING'`
   - `model`: string
   - `firmware`: string
   - `samplingIntervalSec`: number
   - `protocol`: `'LoRaWAN' | 'MQTT' | 'Modbus RS-485' | '4G/LTE' | 'Wi-Fi'`
   - `gatewayId`: string
   - `batteryPercent`: number
   - `signalRssiDbm`: number
   - `signalQualityPct`: number
   - `latencyMs`: number
   - `packetLossPct`: number
   - `deviceTempC`: number
   - `lastSyncSecondsAgo`: number
   - `calibrationStatus`: `'VALID' | 'CALIBRATION REQUIRED' | 'EXPIRED'`
   - `calibrationDate`: string (ISO date)
   - `nextCalibrationDate`: string (ISO date)
   - `currentReadingValue`: string
   - `currentReadingUnit`: string
   - `readingDeltaToday`: string
   - `dataQualityPct`: number
   - `depthMeters`: number
   - `macOrImei`: string
   - `history`: `Array<{ timestamp: string; value: number }>`

3. **`GroundwaterDataPoint` (Telemetry)**
   - `timestamp`: string (e.g. `Today 10:42` or ISO)
   - `dateStr`: string
   - `hour`: number
   - `waterLevel`: number (meters from surface)
   - `expectedMin`: number
   - `expectedMax`: number
   - `pumpState`: `'ON' | 'OFF'`
   - `extractionLiters`: number
   - `anomaly?`: `{ type: 'depletion_surge' | 'recovery_lag' | 'tds_spike' | 'dry_run'; label: string; severity: Severity; }`

4. **`Anomaly`**
   - `id`: string (e.g. `ANOM-2026-084`)
   - `borewellId`: string
   - `borewellName`: string
   - `title`: string
   - `severity`: `'info' | 'warning' | 'critical'`
   - `timestamp`: string
   - `parameter`: string
   - `actualValue`: string
   - `expectedValue`: string
   - `deviationPercent`: number
   - `whyExplanation`: string
   - `potentialImpact`: string
   - `recommendedAction`: string
   - `status`: `'active' | 'investigating' | 'resolved'`
   - `confidenceScore`: number
   - `rootCauseCategory`: `'Excessive Pumping' | 'Aquifer Stress' | 'Hardware Fault' | 'Saline Intrusion' | 'Sensor Drift'`

5. **`SensorTelemetry`**
   - `id`: string (e.g. `SNS-WLS-03`)
   - `name`: string
   - `type`: `'Hydrostatic Pressure' | 'Electromagnetic Flow' | '4-Electrode TDS/EC' | 'Glass pH Probe' | 'Hall-Effect CT' | 'LoRaWAN Gateway'`
   - `borewellId`: string
   - `status`: `'online' | 'warning' | 'critical' | 'offline'`
   - `batteryPercent`: number
   - `signalRssiDbm`: number
   - `lastSyncSecondsAgo`: number
   - `calibrationDate`: string
   - `calibrationStatus`: `'Valid' | 'Calibration recommended' | 'Expired'`
   - `firmwareVersion`: string
   - `sampleRateHz`: number
   - `rawPayloadSample`: string

6. **`SimulationScenario`**
   - `id`: `'normal' | 'high_extraction' | 'poor_recovery' | 'pump_fault' | 'water_quality_spike'`
   - `name`: string
   - `description`: string
   - `targetBorewell`: string
   - `pumpInitialState`: PumpStatus
   - `waterLevelOffset`: number
   - `flowRateMultiplier`: number
   - `tdsOffset`: number
   - `anomalyTitle`: string
   - `whyText`: string
   - `prescribedAction`: string

---

## 4. Existing Mock Data

All mock data is currently hardcoded in `src/data/initialData.ts`:
- **5 Borewells:** `BWL-01` (North Community Hub), `BWL-02` (West Industrial), `BWL-03` (East Sector Agricultural), `BWL-04` (South Wetland Pit), `BWL-05` (Central Campus).
- **8 IoT Devices:** `DEV-WLS-03`, `DEV-FLW-03`, `DEV-TDS-03`, `DEV-PMP-03`, `DEV-GW-01`, `DEV-WLS-01`, `DEV-PRS-02`, `DEV-TMP-04`.
- **5 Sensor Diagnostic Records:** `SNS-WLS-03`, `SNS-FLW-03`, `SNS-TDS-03`, `SNS-CUR-03`, `SNS-GW-01`.
- **Anomalies:** `ANOM-2026-084` (Rapid Groundwater Decline on BWL-03), `ANOM-2026-079` (Transient Thermal Drift on BWL-02).
- **Time-Series Data:** `HISTORICAL_7DAYS_DATA` (22 data points spanning Mon 06:00 to Today 10:42 with diurnal curve and expected band).
- **Pump Duty Intervals:** `PUMP_INTERVALS_7DAYS` (`PMP-01`, `PMP-02`, `PMP-03`).
- **Recharge Assessment:** Opportunity score 84/100, 28.4mm rainfall, 3 recharge structures.
- **Simulation Scenarios:** 5 static scenario definitions.

---

## 5. Existing Frontend API Boundaries

Currently, the frontend interacts **purely with in-memory state in `JalRakshakContext.tsx`**.
The following actions and data queries represent the clean boundary points to be replaced with backend REST & Socket.IO calls:

1. **Initial Hydrological Load:**
   - Replace `INITIAL_BOREWELLS` with `GET /api/borewells`
   - Replace `INITIAL_DEVICES` with `GET /api/devices`
   - Replace `INITIAL_ANOMALIES` with `GET /api/anomalies`
   - Replace `HISTORICAL_7DAYS_DATA` with `GET /api/telemetry?borewellId=BWL-03&limit=50`
   - Replace `INITIAL_RECHARGE` with `GET /api/recharge`
   - Replace `INITIAL_SENSORS` with `GET /api/sensors`

2. **Device Management:**
   - Adding a device (`addDevice` in `AddDeviceModal.tsx`): `POST /api/devices`
   - Testing connection (`testDeviceConnection` in `DeviceDetailsModal.tsx`): `POST /api/devices/:id/test-connection`
   - Calibrating device (`calibrateDevice` in `DeviceDetailsModal.tsx`): `POST /api/devices/:id/calibrate`
   - Device status/telemetry updates: Socket event `device:status`

3. **Pump Control & Anomaly Remediation:**
   - Pump toggle (`togglePump` in `AquiferCommandCenter.tsx`, `ExtractionPage.tsx`, `AnomalyInvestigateModal.tsx`): `POST /api/borewells/:id/pump`
   - Resolving anomaly (`resolveAnomaly` in `AnomalyInvestigateModal.tsx`): `POST /api/anomalies/:id/acknowledge` (or `/resolve`)

4. **Digital Twin Simulation:**
   - Running simulation (`runSimulation` in `DigitalTwinModal.tsx`): `POST /api/simulation/scenario`
   - Resetting simulation (`resetSimulation`): `POST /api/simulation/reset`
   - Querying simulator status: `GET /api/simulation/status`

5. **Real-Time Live Telemetry Stream:**
   - Replace client `setInterval(2500)` with Socket.IO listener:
     - `telemetry:update` → feeds live water level, flow, TDS, pump state, continuous history to charts and Aquifer visualization
     - `anomaly:new` → alerts, notification bell, system state panel
     - `simulation:state` → syncs active scenario and parameters across all tabs

---

## 6. Problems / Technical Debt

1. **Client-Side Simulation Drift:**
   The client runs its own `setInterval` every 2.5s modifying seconds counters, but doesn't persist real telemetry history or continuous physical dynamics.
2. **Unused Dashboard Components:**
   `IntelligenceEngineCard.tsx`, `HealthScoreGauge.tsx`, and `PrimaryKpiGrid.tsx` in `src/components/dashboard/` are orphaned (not imported in any page). They should either be preserved as reference or integrated cleanly without disturbing `OverviewPage.tsx`.
3. **No Central API Client Abstraction:**
   There is no `src/services/api/` folder. All mock state is bundled directly inside `JalRakshakContext.tsx`.
4. **Hardcoded Initial IDs & Arrays:**
   `initialData.ts` has 757 lines of static data. If a device is added, it is lost upon browser refresh.
5. **Missing Backend & Dependencies:**
   `node_modules` is not yet installed; backend Express server and SQLite database need to be established with high-speed development runner (`tsx`).
6. **Package Script:**
   `package.json` had a default name `"react-example"`, and lacked backend start / dev scripts.

---

## 7. Recommended Backend Architecture

To fulfill all requirements while keeping the architecture minimal, reliable, and easily demonstrable for a hackathon:

```text
React 19 Frontend (Port 3000)
       ▲
       │ REST (Fetch API) + Socket.IO client
       ▼
Node.js + Express + Socket.IO Server (Port 4000)
       │
       ├── Telemetry Simulator (Physics continuity, scenario drivers)
       ├── Anomaly Detection Engine (Explainable rules: drawdown, TDS, dry run)
       ├── Recommendation Engine (Deterministic remediation & PLC interlock)
       ├── Device & Borewell Service (CRUD, health checks, calibration)
       └── Database Adapter (SQLite with better-sqlite3 or lightweight SQL layer)
       │
       ▼
   SQLite Database (jalrakshak.db)
    - borewells
    - devices
    - sensors
    - telemetry_readings
    - anomalies
    - recharge_assessments
    - simulation_state
```

### Key Highlights
- **Single Process for Hackathon Simplicity:** The backend runs with `tsx` (`npm run server`), exposing Express REST endpoints and Socket.IO on port 4000.
- **Physical Continuity in Simulator:** Telemetry values (water level, flow rate, TDS, pressure) smoothly transition with noise and inertia, rather than jumping erratically.
- **Zero Frontend Visual Disruption:** The existing beautiful UI, Living Aquifer SVG, and components remain 100% intact, wired seamlessly to the backend API and Socket.IO.
- **Physical vs. Simulated Hardware Flag:** All telemetry payloads carry `isSimulated: boolean` and `source: 'LIVE_HARDWARE' | 'SIMULATOR'` for honest and clear demonstration.
