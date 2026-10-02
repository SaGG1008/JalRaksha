# JalRakshak — Telemetry Simulation & Scenario Specification
**Module:** Backend Telemetry Simulator (`server/services/simulator.ts`)

---

## 1. Principles of Physical Realism

Traditional IoT mock generators create random uniform numbers between min and max:
$$\text{reading}_t \sim \mathcal{U}(\text{min}, \text{max})$$
This creates erratic jumping curves ($18.42 \to 9.72 \to 23.81 \to 11.32$) that immediately break suspension of disbelief in a technical jury presentation.

In **JalRakshak**, simulated telemetry implements **inertial continuity**:
$$\text{level}_{t+1} = \text{level}_t + \Delta_{\text{pump}} + \Delta_{\text{recharge}} + \mathcal{N}(0, \sigma^2)$$

Where:
- $\Delta_{\text{pump}} = +0.03 \text{ m}$ per step when pump is running (water level deepening / increasing depth from surface)
- $\Delta_{\text{recharge}} = -0.015 \text{ m}$ per step when pump is idle (hydrostatic recharge rebound)
- $\sigma = 0.008$ (micro-fluctuations representing transducer sensor noise)
- Flow rate ramps smoothly up to nominal ($3.4 \text{ L/s}$) over 3 steps when pump switches ON, rather than step-jumping.
- TDS shifts gradually ($+12 \text{ ppm}$ per cycle) during a plume seepage event.

---

## 2. Supported Operational Scenarios

### 2.1 `NORMAL_OPERATION` (Baseline)
- **Pump State:** Diurnal cycle (currently OFF or nominal 3.4 L/s ON).
- **Water Level:** Stable around $17.6 \text{ m}$ to $18.4 \text{ m}$.
- **Flow Rate:** $0.0 \text{ L/s}$ (idle) or $3.4 \text{ L/s}$ (active).
- **TDS:** Stable at $412 \pm 6 \text{ ppm}$.
- **Anomaly Generated:** None. Health score $88/100$ ("OPTIMAL STABLE AQUIFER").

### 2.2 `HIGH_EXTRACTION`
- **Pump State:** Forced ON continuous duty.
- **Flow Rate:** $5.44 \text{ L/s}$ (1.6x multiplier).
- **Water Level:** Falls steadily ($+0.12 \text{ m}$ per step, deepening cone of depression to $19.8 \text{ m}$).
- **Extraction:** Cumulative volume exceeds daily quota ($> 3,500 \text{ L}$).
- **Anomaly:** `RAPID_DRAWDOWN` (Warning) — "Extraction behavior is 48% above diurnal baseline. Drawdown velocity exceeds 0.35 m/hr."

### 2.3 `RAPID_DRAWDOWN` / `POOR_RECOVERY`
- **Pump State:** OFF after prolonged drawdown.
- **Recharge Lag:** Recovery velocity is < 15% of nominal hydrostatic rate.
- **Water Level:** Stuck near $19.2 \text{ m}$ without normal overnight rebound.
- **Anomaly:** `AQUIFER_STRESS_LAG` (Warning) — "Transmissivity in surrounding basalt fracture zone depleted."

### 2.4 `WATER_QUALITY_ANOMALY`
- **TDS Profile:** Rises from $412 \text{ ppm} \to 892 \text{ ppm}$.
- **Conductivity:** Jumps from $644 \ \mu\text{S/cm} \to 1,390 \ \mu\text{S/cm}$.
- **pH:** Decreases slightly to $6.3$ indicating acidic runoff / fertilizer plume.
- **Anomaly:** `WATER_QUALITY_ALERT` (Critical) — "Sharp increase in Total Dissolved Solids from agricultural or industrial runoff seepage."

### 2.5 `PUMP_FAILURE` / `PUMP_FAULT`
- **Pump State:** FAULT.
- **Electrical Current:** Drawing $11.2 \text{ A}$ ($5.5 \text{ kW}$).
- **Flow Rate:** $0.1 \text{ L/s}$ (near zero discharge).
- **Anomaly:** `PUMP_CAVITATION_DRY_RUN` (Critical) — "Impeller cavitation detected. Suction head breached or mechanical blockage."

### 2.6 `SENSOR_FAILURE`
- **Device Status:** Switched to `DEGRADED` / `OFFLINE`.
- **Packet Loss:** Jumps to $100\%$ on target device (`DEV-WLS-03`).
- **Heartbeat:** Stops incrementing last sync.
- **Anomaly:** `SENSOR_OFFLINE_WARNING` (Warning) — "Telemetry heartbeat lost on node DEV-WLS-03."

---

## 3. Simulator Control API

```http
POST /api/simulation/scenario
Content-Type: application/json

{
  "scenarioId": "high_extraction",
  "targetBorewell": "BWL-03"
}
```

Reset to Nominal:
```http
POST /api/simulation/reset
```
