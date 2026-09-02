# RESQ DRONE — AI-Powered Autonomous Search & Rescue System

> **Smart India Hackathon (SIH) Prototype | Problem Statement ID: SIH26177**  
> *"A deployable AI-powered autonomous drone that aids search-and-rescue operations by detecting people and hazards, thereby improving responder safety and reducing victim discovery time."*

---

## 1. Project Title & Subtitle

**RESQ DRONE**  
*AI-Powered Autonomous Search & Rescue System*

---

## 2. SIH Problem Statement

- **Problem ID:** SIH26177
- **Problem Category:** Disaster Management / AI & Robotics / Public Safety
- **Description:** Rapid victim localization and secondary hazard detection during catastrophic events (floods, structural collapses, landslides) are critical for emergency response teams. RESQ DRONE demonstrates an end-to-end aerial search-and-rescue operational workflow that cuts down victim discovery time while shielding responders from unexpected environmental threats.

---

## 3. Project Objective

The core objective of RESQ DRONE is to demonstrate a mission-critical emergency command and monitoring workflow:
1. **Autonomous Search Grid Coverage:** Plan and execute deterministic lawn-mower search trajectories over disaster sectors.
2. **AI-Driven Victim Localization:** Detect human silhouettes in floodwaters and rubble with real-time confidence scores and coordinates.
3. **Hazard Risk Mitigation:** Classify environmental threats (fires, gas/thermal hotspots, structural collapses, debris) to establish ground responder safety zones.
4. **Human-in-the-Loop Incident Verification:** Provide emergency dispatchers with immediate review, verification, and location-focus capabilities.

---

## 4. Key Features

- **Autonomous 3×3 Search Grid Simulation:** Structured grid sweep (`A1 → A2 → A3 → B3 → B2 → B1 → C1 → C2 → C3`) with live waypoint tracking, progress meters, and sector states.
- **Deterministic 60–90s Demo Mode:** One-click presentation mode designed specifically for hackathon judging panels to reliably demonstrate the entire detection and alert lifecycle.
- **AI Vision Feed Simulator:** 4K optical and LWIR thermal camera stream simulation with real-time YOLOv8 bounding box overlays, confidence badges, and thermal signatures.
- **Custom Vector Map:** Independent interactive map displaying active drone position, flight route breadcrumbs, victim markers, and hazard danger zones without external API dependencies.
- **Emergency Alert Center:** Chronological, priority-sorted incident queue with quick responder actions (`MARK VERIFIED`, `DISMISS`, `VIEW LOCATION`).
- **Interactive Detections & Hazard Analytics:** Filterable tables, modal inspections, sensor readings, and damage assessments.
- **Manual Flight Override:** Tactical operator intervention toggle allowing manual control pause and return-to-autonomous flight.
- **Telemetry & Subsystem Matrix:** Transparent system status tracking all software modules and prototype boundaries.

---

## 5. Technology Stack

- **Frontend Framework:** React 18 with TypeScript
- **Build Tool:** Vite 5
- **Styling:** Tailwind CSS (Dark Command-Center Tactical UI)
- **Icons:** Lucide React
- **Architecture:** Modular React Context state engine (`MissionContext`)

---

## 6. Installation

Ensure Node.js (v18 or later) and npm are installed on your workstation.

```bash
# 1. Clone or open the repository
git clone https://github.com/Srisharadhakrishnan/SIH26177.git
cd SIH26177

# 2. Install dependencies
npm install
```

---

## 7. How to Run

```bash
# Start the local development server
npm run dev

# Open http://localhost:5173 in your browser
```

To build for production verification:
```bash
npm run build
npm run preview
```

---

## 8. How to Use Demo Mode (Presentation Guide)

1. Click the prominent **`DEMO MODE`** button in the header or on the dashboard.
2. **Step 1:** The mission automatically resets and launches an autonomous sweep from Zone `A1`.
3. **Step 2:** The drone moves through sectors updating search progress and telemetry.
4. **Step 3:** Upon entering Sector `B3`, a **`PERSON` (94% confidence)** victim is detected. A bounding box appears in the live camera feed and a high-priority red alert triggers.
5. **Step 4:** The victim pin appears on the 3×3 search map and increments the dashboard victim counter.
6. **Step 5:** In Sector `C2`, a **`Fire` hazard (89% confidence)** is flagged, generating a secondary risk alert and map pin.
7. **Step 6:** Use **`MARK VERIFIED`** or **`VIEW LOCATION`** to demonstrate responder interaction.

---

## 9. What is Simulated (Technical Transparency)

To maintain absolute technical honesty:

| Subsystem | Prototype State | Details |
| :--- | :--- | :--- |
| **Drone Flight Controller** | **SIMULATED** | Flight coordinates and lawnmower route are mathematically generated. No physical autopilot is connected. |
| **GPS / GNSS Module** | **SIMULATED** | Coordinates (13.0827° N, 80.2707° E) are simulated and mapped to the 3x3 search sectors. |
| **Camera Payload** | **SIMULATED** | Downlink video is a synthetic tactical feed demonstrating optical and thermal LWIR overlay modes. |
| **Wireless Telemetry** | **SIMULATED** | MAVLink packets and RF signal latency are simulated locally in memory. |
| **AI Inference** | **SIMULATED** | Bounding box coordinates and confidence ratings follow deterministic disaster scenarios for rock-solid demo reliability. |

---

## 10. Current Limitations

- Software-only prototype running on client hardware (MacBook / desktop).
- No physical drone hardware (motors, ESCs, airframe, batteries) connected.
- Real-world sensor noise and aerodynamic turbulence are not yet modeled.

---

## 11. Proposed Hardware Integration (Stage 2 Roadmap)

```
[4K Optical / LWIR Thermal Camera]
                 │ (CSI / USB 3.0)
                 ▼
[Onboard Edge Computer: Raspberry Pi 5 / NVIDIA Jetson Orin Nano]
       │ (MAVLink over UART)                 │ (Inference Output)
       ▼                                     ▼
[Pixhawk 6C Flight Controller]         [Long-Range RF Telemetry: 915MHz / Wi-Fi Mesh]
       │ (PWM / CAN)                         │ (Wireless Downlink)
       ▼                                     ▼
[Motors & GPS: u-blox NEO-M8N]         [RESQ DRONE Web Command Center Dashboard]
```

---

## 12. Future Development

- **Hardware Testing:** Deploying YOLOv8 nano models on Raspberry Pi 5 with Coral Edge TPU / Jetson Orin.
- **Swarm Coordination:** Multi-drone collaborative search partitioning larger geographical sectors.
- **Thermal Body Heat Localization:** Deep-learning based human body heat segmentation for zero-visibility night search.

---

## 13. System Architecture & Workflow

```
DISASTER AREA
      ↓
AUTONOMOUS DRONE (Aerial Sweep)
      ↓
ONBOARD CAMERA (Optical & LWIR Thermal)
      ↓
AI INFERENCE (YOLOv8 Victim / Hazard Classification)
      ↓
GPS GEOTAGGING (Sector Localization)
      ↓
WIRELESS TELEMETRY (Ground Station Downlink)
      ↓
RESCUE DASHBOARD (Real-Time HUD & Interactive Map)
      ↓
HUMAN RESPONDER DECISION (Verification & Ground Team Extraction)
```

---

*Built with ❤️ for Smart India Hackathon (SIH).*
