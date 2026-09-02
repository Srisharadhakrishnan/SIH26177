# JEEVAN-AIR — Aerial Intelligence & Rescue

> **Smart India Hackathon 2026 | Problem Statement ID: SIH26177**  
> **Organization:** Qualcomm Inc | **Category:** Hardware | **Theme:** Robotics and Drones  
> **Team:** TEAM ZYNTAX  
> **Tagline:** *DETECT. ASSESS. PRIORITIZE. RESCUE.*  
> *"A deployable AI-powered autonomous drone that aids search-and-rescue operations by detecting people and hazards, thereby improving responder safety and reducing victim discovery time."*

---

## 1. Project Overview & Current Prototype Status

**JEEVAN-AIR** is an aerial intelligence and emergency response command system designed to accelerate victim location, assess danger zones, prioritize extractions, and guide ground responders through disaster areas safely.

### ⚠️ Prototype Disclosure & Technical Honesty Guarantee

- **Current Prototype State:** Software Prototype & Web Command Center (Phase 1).
- **Physical Drone Hardware:** Currently **NOT** connected.
- **Telemetry & Sensors:** Flight controller, GNSS GPS, 4K optical/LWIR thermal video feeds, and battery levels are **SIMULATED** via a dedicated `SimulationDataProvider`.
- **Credibility Note:** All simulated data is clearly labeled in the interface (`SIMULATED FLIGHT TELEMETRY`, `SIMULATED SENSOR STREAM`, `SOFTWARE PROTOTYPE`) so judges and evaluators know exactly where software boundaries end and physical hardware integration begins in Phase 4.

---

## 2. Core Architecture: Common Data Model & Data Adapter

In Phase 1, data generation was decoupled from the React UI into a clean **Data Adapter Layer**:

```
[ Simulation Source ]  ──►  [ SimulationDataProvider ]
                                       │
                                       ▼ (implements IDataAdapter)
                             [ Common Data Model ]
                           (DroneState, Telemetry,
                         Detection, Survivor, Hazard,
                              Alert, MissionState)
                                       │
                                       ▼
                             [ Application State ]
                             (MissionContext.tsx)
                                       │
                                       ▼
                           [ JEEVAN-AIR Dashboard ]
                  (Header, Sidebar, Map, Feed, Telemetry, Alerts)
```

### Future Hardware Bridge (Phase 4 Ready)

When physical drone hardware is integrated, a `HardwareDataProvider` connects via MAVLink 2.0 / WebSockets without requiring any changes to the UI dashboard or common models:

```
[ Physical Drone: Pixhawk + Jetson + u-blox ]  ──►  [ HardwareDataProvider ]  ──►  [ Common Data Model ]  ──►  [ Dashboard ]
```

---

## 3. Technology Stack

- **Frontend Framework:** React 18 with TypeScript 5
- **Build Tool:** Vite 5
- **Styling:** Tailwind CSS 3 (Dark Aerospace / Tactical Command Palette)
- **Icons:** Lucide React
- **Architecture:** `IDataAdapter` pattern + `MissionContext` state management
- **Data Models:** Typed Common Data Model (`src/types/common.ts`)

---

## 4. Key Features (Preserved in Phase 1)

1. **Autonomous 3×3 Search Grid Simulation:** Structured grid sweep (`A1 → A2 → A3 → B3 → B2 → B1 → C1 → C2 → C3`) with live waypoint tracking, progress meters, and sector states.
2. **Deterministic 60–75s Demo Mode:** One-click presentation mode designed specifically for hackathon judging panels to reliably demonstrate the entire detection and alert lifecycle.
3. **AI Vision Feed Simulator:** 4K optical and LWIR thermal camera stream simulation with real-time YOLOv8 bounding box overlays, confidence badges, and thermal signatures.
4. **Interactive Sector Grid Map:** Vector map displaying active drone position, flight route breadcrumbs, victim markers, and hazard danger zones without external API dependencies.
5. **Emergency Alert Center:** Chronological, priority-sorted incident queue with quick responder actions (`MARK VERIFIED`, `DISMISS`, `VIEW LOCATION`).
6. **Manual Flight Override:** Tactical operator intervention toggle allowing manual control pause and return-to-autonomous flight.
7. **Interactive Detections & Hazard Analytics:** Filterable tables, modal inspections, sensor readings, and damage assessments.
8. **Subsystem Disclosure Matrix:** Transparent system status tracking all software modules and prototype boundaries.

---

## 5. Installation & Running

Ensure Node.js (v18 or later) and npm are installed on your workstation.

```bash
# 1. Clone repository
git clone https://github.com/Srisharadhakrishnan/SIH26177.git
cd SIH26177

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
# Open http://localhost:5173

# 4. Run Rescue Intelligence Test Suite (15 Test Cases, 24 Assertions)
npm test

# 5. Production build verification
npm run build
npm run preview
```

---

## 6. How to Use Demo Mode (Judge Presentation Guide)

1. Click the prominent **`DEMO MODE`** button in the header or on the dashboard.
2. **Step 1:** The mission resets and launches an autonomous sweep from Zone `A1`.
3. **Step 2:** The drone sweeps sectors updating search progress, battery, and telemetry.
4. **Step 3:** Upon entering Sector `B3`, a **`PERSON` (94% confidence)** victim is detected.
5. **Step 4 (Phase 2 Intelligence):** The **Rescue Intelligence Engine** executes:
   - Evaluates lack of movement, trapped status, and thermal infrared verification.
   - Computes transparent risk score (**CRITICAL: 88/100**).
   - Ranks the victim as **Rescue Priority #1**.
   - Calculates **Recommended Safe-Access Route** (`A1 → A2 → B2 → B3`, bypassing fire obstacles).
   - Dynamically adapts mission objective: `PRIORITY REPLAN: Monitor & guide responder approach`.
6. **Step 5:** In Sector `C2`, an active **`Fire` hazard** is flagged, triggering spatial proximity recalculation and map corridor rerouting.
7. **Step 6:** Click **`+ UNCERTAIN (2ND-LOOK)`** in Mission Controls to demonstrate the **Autonomous Second-Look Verification** workflow.

---

## 7. Development Roadmap

- **Phase 1 (Completed):** Software Prototype Foundation, JEEVAN-AIR Branding, Common Data Model, and Simulation Data Adapter.
- **Phase 2 (Completed):** Rescue Intelligence Layer (Explainable Risk Assessment, Operational Prioritization, Autonomous Second-Look Verification, Ground Safe-Access Guidance, Dynamic Mission Replanning, Decision Timeline).
- **Phase 3 (Upcoming):** Sensor & Map Visualization Upgrade (Continuous spatial coordinate rendering, dual-sensor optical/LWIR switching).
- **Phase 4:** Hardware Integration (MAVLink 2.0 telemetry bridge, Pixhawk 6C autopilot, Jetson edge AI inference).
- **Phase 5:** Field Testing & Validation (End-to-end disaster drill evaluation).

---

*JEEVAN-AIR — Built with ❤️ by TEAM ZYNTAX for Smart India Hackathon 2026.*
