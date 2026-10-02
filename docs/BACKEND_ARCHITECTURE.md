# JalRakshak — Backend Architecture Specification
**Author:** Lead Backend & Integration Engineer  
**Status:** Approved for Implementation  
**Technology Stack:** Node.js (v24), TypeScript, Express, Socket.IO, SQLite (`better-sqlite3`)

---

## 1. Architectural Overview

The JalRakshak backend is designed as a **lean, monolithic service** optimized for rapid hackathon deployment, physical simulation realism, and zero-latency real-time synchronization with the React frontend.

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        REACT 19 FRONTEND (Vite)                        │
│                   Port 3000 (Development / Demo UI)                   │
└───────────────────▲────────────────────────────────┬───────────────────┘
                    │                                │
          REST HTTP │ (Fetch API)          WebSocket │ (Socket.IO Client)
                    │                                │
┌───────────────────▼────────────────────────────────▼───────────────────┐
│               NODE.JS / EXPRESS / SOCKET.IO SERVER (TS)                │
│                        Port 4000 (HTTP & WS)                           │
├────────────────────────────────────────────────────────────────────────┤
│ REST Router Layer:                                                     │
│   ├── /api/health                                                      │
│   ├── /api/borewells (List, Detail, Pump Control)                      │
│   ├── /api/devices (CRUD, Test Connection, Calibrate)                  │
│   ├── /api/telemetry (Time-series query with limits & date filters)    │
│   ├── /api/anomalies (Active/Historical, Acknowledge/Resolve)          │
│   ├── /api/simulation (Status, Scenario Trigger, Reset)               │
│   └── /api/recharge (Managed Aquifer Recharge metrics)                 │
├────────────────────────────────────────────────────────────────────────┤
│ Core Engine Services:                                                  │
│   ├── TelemetrySimulator                                               │
│   │     Continuous physical inertia loop (every 2.0s)                  │
│   │     Dynamic physics equations for drawdown cone & recovery         │
│   │     Supports 6 distinct operational scenarios                      │
│   ├── AnomalyEngine                                                    │
│   │     Deterministic rule-based physics verification                  │
│   │     Evaluates drawdown velocity, TDS thresholds, pump current      │
│   │     Computes explainable "Why", confidence %, and impact           │
│   ├── RecommendationEngine                                             │
│   │     Prescribes deterministic mitigation actions                    │
│   │     Controls automated PLC safety interlocks                       │
│   └── DeviceFleetService                                               │
│         Manages sensor statuses, battery drain, calibration lifecycles │
├────────────────────────────────────────────────────────────────────────┤
│ Data Layer:                                                            │
│   SQLite Database (jalrakshak.db via better-sqlite3)                   │
│   Synchronous high-speed WAL mode with prepared statements             │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Component Design

### 2.1 Server & Protocol
- **Express 4.x Application:** Serves JSON REST API endpoints with standard CORS configuration and request validation middleware.
- **Socket.IO 4.x:** Attached directly to the same Node HTTP server instance (`server = http.createServer(app)`), sharing port 4000.
- **Client Protocol:**
  - REST for command/action queries (e.g. `POST /api/devices`, `POST /api/simulation/scenario`).
  - Socket.IO rooms/broadcasts for push-driven telemetry streams (`telemetry:update`, `anomaly:new`, `device:status`, `simulation:state`).

### 2.2 Telemetry Simulator (Physics-Guided Continuity)
The simulator maintains in-memory continuous state variables for all 5 borewells:
- `waterLevel`: Moves with smooth inertia based on pump state:
  $$\Delta \text{level} = \text{drawdownRate} \times \Delta t - \text{aquiferRechargeRate} \times \Delta t + \epsilon$$
- `flowRate`: Tied to pump state with slight cavitation / pressure variance.
- `tds`: Baseline ~412 ppm with diffusion gradient when contaminant scenario is active.
- `temperature`: Stable geothermal baseline (26.4°C) with motor thermal dissipation.
- `pressure`: Hydrostatic pressure proportional to depth:
  $$P = \rho \cdot g \cdot h$$
- Continuity guarantee: Every tick generates values incrementally offset from the previous reading (e.g., $18.42 \to 18.40 \to 18.37$ rather than random jumps).

### 2.3 Anomaly Detection Engine
Runs immediately upon every telemetry sample ingestion:
1. **Rapid Drawdown Rule:**
   $$\frac{\Delta \text{waterLevel}}{\Delta t} > 0.35 \text{ m/hr} \quad \text{AND} \quad \text{flowRate} > \text{safeYield}$$
   $\implies$ `RAPID_DRAWDOWN` (Warning/Critical)
2. **Water Quality Saline Influx Rule:**
   $$\text{TDS} > 500 \text{ ppm} \quad \text{OR} \quad \Delta \text{TDS} > 50 \text{ ppm/hr}$$
   $\implies$ `WATER_QUALITY_ANOMALY`
3. **Pump Dry Run / Cavitation Rule:**
   $$\text{pumpStatus} == \text{ON} \quad \text{AND} \quad \text{flowRate} < 0.5 \text{ L/s} \quad \text{AND} \quad \text{powerKw} > 4.0$$
   $\implies$ `PUMP_ANOMALY` (Critical dry run hazard)
4. **Device Heartbeat Timeout Rule:**
   $$\text{now} - \text{lastHeartbeat} > 60 \text{ seconds}$$
   $\implies$ `DEVICE_OFFLINE`

### 2.4 Recommendation Engine
Deterministic mapping from detected anomaly to domain action:
- `RAPID_DRAWDOWN` $\to$ "Throttle pump duty cycle immediately. Switch extraction to alternate borewell node."
- `WATER_QUALITY_ANOMALY` $\to$ "Isolate drinking distribution manifold. Engage settling pond retention."
- `PUMP_ANOMALY` $\to$ "Emergency automated trip interlock engaged. Inspect suction strainer and impeller."
- `DEVICE_OFFLINE` $\to$ "Inspect LoRaWAN transceiver and power supply battery on node."

---

## 3. Directory Layout

The backend code is organized cleanly within the project:

```text
server/
├── db/
│   ├── database.ts           # SQLite connection & schema initialization
│   ├── seed.ts               # Seeds initial borewells, devices, sensors, history
│   └── schema.sql            # Table definitions
├── services/
│   ├── simulator.ts          # Physical telemetry simulation engine & scenarios
│   ├── anomalyEngine.ts      # Explainable anomaly detection & rules
│   ├── recommendationEngine.ts# Prescriptive remediation engine
│   └── deviceService.ts      # Hardware status & diagnostic methods
├── routes/
│   ├── borewells.ts          # /api/borewells
│   ├── devices.ts            # /api/devices
│   ├── telemetry.ts          # /api/telemetry
│   ├── anomalies.ts          # /api/anomalies
│   ├── simulation.ts         # /api/simulation
│   └── recharge.ts           # /api/recharge
├── socket/
│   └── socketHandler.ts      # Socket.IO event emissions & client subscriptions
└── index.ts                  # Server entry point (Express + HTTP + Socket.IO)
```

---

## 4. Hardware vs. Simulation Transparency

Every telemetry payload emitted by the server includes metadata flags:
```json
{
  "source": "SIMULATION",
  "isSimulated": true,
  "hardwareUplinkConnected": false,
  "deviceId": "DEV-WLS-03",
  "borewellId": "BWL-03",
  "timestamp": "2026-10-02T16:58:30.120Z",
  "waterLevel": 18.42,
  "flowRate": 3.4,
  "tds": 412,
  "temperature": 26.4,
  "pressure": 1.82,
  "pumpStatus": "ON"
}
```
If an ESP32 or LoRaWAN gateway sends physical sensor packets via `POST /api/telemetry/ingest`, the source is automatically set to `"LIVE_HARDWARE"` and `isSimulated: false`.
This satisfies the critical hackathon constraint.
