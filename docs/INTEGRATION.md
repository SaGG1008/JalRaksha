# JalRakshak — Frontend & Backend Integration Guide
**Author:** Lead Backend & Integration Engineer  
**Objective:** Connect React 19 Frontend to Express + SQLite + Socket.IO Backend with zero visual disruption.

---

## 1. Architectural Contract

The frontend was visually validated prior to backend integration. Under no circumstances is the visual language, design token system, Tailwind typography, or SVG subsurface geometry modified.

The integration replaces client-side in-memory mock mutations with:
1. **REST Client (`src/services/api/`)**: Fetches initial state and dispatches user actions (provision device, toggle pump, test connection, calibrate, run simulation).
2. **Socket.IO Listener (`src/services/api/socket.ts`)**: Receives real-time streaming telemetry, anomalies, and simulator status.
3. **Optimistic Local Updates with Server Confirmation**: UI remains snappy while syncing to SQLite.

---

## 2. API Service Layer

```text
src/services/api/
├── client.ts         # Generic HTTP fetch wrapper with error handling & base URL
├── borewells.ts      # fetchBorewells, fetchBorewellById, togglePumpState
├── devices.ts        # fetchDevices, createDevice, testConnection, calibrate
├── telemetry.ts      # fetchTelemetryHistory, ingestReading
├── anomalies.ts      # fetchAnomalies, acknowledgeAnomaly, resolveAnomaly
├── simulation.ts     # fetchSimulationStatus, triggerScenario, resetSimulation
└── socket.ts         # Socket.IO connection manager & typed event listeners
```

---

## 3. Data Flow Mappings

### 3.1 Borewells & Living Aquifer
- **Mount:** `fetchBorewells()` loads the 5 production nodes from SQLite into context state.
- **Selection:** `selectedBorewellId` updates `selectedBorewell` which is rendered by `AquiferCommandCenter` and `SystemStatePanel`.
- **Pump Toggle:**
  ```text
  User clicks "PUMP ON/OFF"
         ↓
  POST /api/borewells/:id/pump
         ↓
  Backend SQLite updates pump_status & flow_rate
         ↓
  Socket event 'borewell:update'
         ↓
  Context updates borewells array
         ↓
  AquiferCommandCenter animates drawdown cone & streamlines
  ```

### 3.2 Devices Management
- **Devices List:** `fetchDevices()` populates `devices` in `DevicesPage.tsx`.
- **Add Device:** `AddDeviceModal` calls `createDevice(newDevice)` $\to$ `POST /api/devices`.
- **Test Connection:** `DeviceDetailsModal` calls `testDeviceConnection(deviceId)` $\to$ `POST /api/devices/:id/test-connection`.
- **Calibrate:** `DeviceDetailsModal` calls `calibrateDevice(deviceId)` $\to$ `POST /api/devices/:id/calibrate`.
- **View in Aquifer:** When user clicks "View in Aquifer" in device details, `viewDeviceInAquifer(device.borewellId)` selects that borewell and routes to `'overview'` tab.

### 3.3 Digital Twin & Scenario Demonstration
```text
DigitalTwinModal (User selects 'High Extraction Surge')
       ↓
POST /api/simulation/scenario { scenarioId: 'high_extraction' }
       ↓
Simulator enters HIGH_EXTRACTION loop
       ↓
Continuous telemetry emitted every 2.0s via Socket.IO ('telemetry:update')
       ↓
Anomaly Engine detects excessive drawdown velocity (> 0.35 m/hr)
       ↓
Anomaly Engine emits 'anomaly:new' with explainable RCA
       ↓
Frontend updates:
  - OverviewPage shows "PHYSICAL DIGITAL TWIN SIMULATION ACTIVE" banner
  - AquiferCommandCenter deepens water level & cone
  - SystemStatePanel updates Health Score to 68/100
  - Topbar Notification Bell chimes
  - AnomaliesPage displays new incident card
```

### 3.4 Fallback & Resilience
If the backend is not running or network drops:
- `client.ts` catches network errors and logs a clean warning.
- Context gracefully retains cached/initial data with an indicator.
- Reconnection is handled automatically by Socket.IO with exponential backoff.
