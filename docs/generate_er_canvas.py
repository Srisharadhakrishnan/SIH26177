#!/usr/bin/env python3
"""
JEEVAN-AIR | ER Diagram Generator
Team ZYNTAX — SIH26177 (Qualcomm Inc)
Generates high-resolution logical ER diagram image: JEEVAN-AIR_ER_Diagram.png
Zero overlapping cards, perfectly aligned connector lines, high-DPI crisp rendering.
"""

html_content = """<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background-color: #080c14;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "JetBrains Mono", monospace;
    color: #e2e8f0;
    width: 2350px;
    height: 1350px;
    padding: 30px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  
  /* Header Title Block */
  .header {
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
    border: 2px solid #334155;
    border-radius: 14px;
    padding: 20px 30px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
  }
  .title-group h1 {
    font-size: 32px;
    font-weight: 800;
    color: #38bdf8;
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .title-group h1 span.badge {
    font-size: 14px;
    background: #0284c7;
    color: #ffffff;
    padding: 4px 12px;
    border-radius: 999px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
  }
  .title-group p {
    font-size: 15px;
    color: #94a3b8;
    margin-top: 4px;
  }
  
  .legend-bar {
    display: flex;
    gap: 20px;
    background: #090d16;
    border: 1px solid #334155;
    border-radius: 10px;
    padding: 10px 20px;
    align-items: center;
    font-size: 13px;
  }
  .legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .legend-color {
    width: 16px;
    height: 16px;
    border-radius: 3px;
  }

  .meta-group {
    text-align: right;
    font-size: 14px;
    color: #cbd5e1;
    line-height: 1.5;
  }
  .meta-group strong {
    color: #38bdf8;
  }

  /* Canvas Layout */
  .canvas {
    position: relative;
    width: 2290px;
    height: 1140px;
    background: #070a10;
    border: 1px solid #1e293b;
    border-radius: 14px;
    overflow: hidden;
  }

  /* Entity Box Styling */
  .entity {
    position: absolute;
    width: 330px;
    background: #0f172a;
    border-radius: 8px;
    box-shadow: 0 8px 16px rgba(0,0,0,0.5);
    overflow: hidden;
    font-size: 11.5px;
    z-index: 10;
  }
  .entity-header {
    padding: 8px 12px;
    font-weight: 800;
    font-size: 13px;
    letter-spacing: 0.5px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(255,255,255,0.1);
  }
  .entity-tag {
    font-size: 9px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 3px;
    text-transform: uppercase;
  }
  
  .entity-body {
    padding: 4px 0;
  }
  .attr-row {
    padding: 4px 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #1e293b;
    font-family: "JetBrains Mono", monospace;
  }
  .attr-row:last-child {
    border-bottom: none;
  }
  .attr-name {
    display: flex;
    align-items: center;
    gap: 5px;
    color: #e2e8f0;
    font-size: 11px;
  }
  .key-pk {
    color: #f59e0b;
    font-weight: 800;
    font-size: 9px;
    background: rgba(245, 158, 11, 0.15);
    padding: 1px 3px;
    border-radius: 2px;
    border: 1px solid rgba(245, 158, 11, 0.4);
  }
  .key-fk {
    color: #38bdf8;
    font-weight: 800;
    font-size: 9px;
    background: rgba(56, 189, 248, 0.15);
    padding: 1px 3px;
    border-radius: 2px;
    border: 1px solid rgba(56, 189, 248, 0.4);
  }
  .attr-type {
    color: #94a3b8;
    font-size: 10px;
  }

  /* Color Schemes */
  .impl-card { border: 2px solid #059669; }
  .impl-header { background: #064e3b; color: #6ee7b7; }
  .impl-tag { background: #059669; color: #ffffff; }

  .sim-card { border: 2px solid #0284c7; }
  .sim-header { background: #0c4a6e; color: #7dd3fc; }
  .sim-tag { background: #0284c7; color: #ffffff; }

  .intel-card { border: 2px solid #d97706; }
  .intel-header { background: #78350f; color: #fde68a; }
  .intel-tag { background: #d97706; color: #ffffff; }

  .fut-card { border: 2px solid #7c3aed; }
  .fut-header { background: #4c1d95; color: #ddd6fe; }
  .fut-tag { background: #7c3aed; color: #ffffff; }

  .alert-card { border: 2px solid #e11d48; }
  .alert-header { background: #881337; color: #fecdd3; }
  .alert-tag { background: #e11d48; color: #ffffff; }

  /* SVG Lines Layer */
  svg.connectors {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 5;
    pointer-events: none;
  }
  
  .rel-label {
    fill: #94a3b8;
    font-size: 11px;
    font-family: "JetBrains Mono", monospace;
    font-weight: 600;
  }
</style>
</head>
<body>

  <!-- Top Title Block -->
  <div class="header">
    <div class="title-group">
      <h1>
        JEEVAN-AIR &bull; LOGICAL DATA MODEL
        <span class="badge">ER Diagram</span>
      </h1>
      <p>Current Software Prototype In-Memory Data Structures + Future Persistent Database Model</p>
    </div>
    <div class="legend-bar">
      <div class="legend-item">
        <div class="legend-color" style="background: #059669;"></div>
        <span><strong>IMPLEMENTED DATA</strong></span>
      </div>
      <div class="legend-item">
        <div class="legend-color" style="background: #0284c7;"></div>
        <span><strong>SIMULATED DATA</strong></span>
      </div>
      <div class="legend-item">
        <div class="legend-color" style="background: #d97706;"></div>
        <span><strong>RESCUE INTELLIGENCE</strong></span>
      </div>
      <div class="legend-item">
        <div class="legend-color" style="background: #7c3aed;"></div>
        <span><strong>FUTURE PERSISTENT STORAGE</strong></span>
      </div>
    </div>
    <div class="meta-group">
      <div>Project: <strong>JEEVAN-AIR (SIH26177)</strong></div>
      <div>Team: <strong>TEAM ZYNTAX</strong> &bull; Qualcomm Inc</div>
      <div>Theme: <strong>Robotics & Drones (Hardware)</strong></div>
    </div>
  </div>

  <!-- Main ER Canvas (5 Clean Non-Overlapping Columns) -->
  <div class="canvas">
    <svg class="connectors">
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#64748b" />
        </marker>
        <marker id="arrow-cyan" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
        </marker>
        <marker id="arrow-amber" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b" />
        </marker>
        <marker id="arrow-emerald" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981" />
        </marker>
      </defs>

      <!-- DRONE -> MISSION -->
      <path d="M 210 320 L 210 390" stroke="#38bdf8" stroke-width="2" stroke-dasharray="5,4" marker-end="url(#arrow-cyan)" fill="none"/>
      <text x="218" y="360" class="rel-label">1 : N (executes)</text>

      <!-- DRONE -> TELEMETRY -->
      <path d="M 370 170 L 480 170" stroke="#38bdf8" stroke-width="2" stroke-dasharray="5,4" marker-end="url(#arrow-cyan)" fill="none"/>
      <text x="385" y="160" class="rel-label">1 : N (streams)</text>

      <!-- TELEMETRY -> GPS_POSITION -->
      <path d="M 645 360 L 645 420" stroke="#38bdf8" stroke-width="2" stroke-dasharray="5,4" marker-end="url(#arrow-cyan)" fill="none"/>
      <text x="655" y="395" class="rel-label">1 : 1 (fixes)</text>

      <!-- MISSION -> SEARCH_ZONE -->
      <path d="M 370 510 L 480 510 L 480 730 L 480 730" stroke="#64748b" stroke-width="2" marker-end="url(#arrow)" fill="none"/>
      <text x="390" y="580" class="rel-label">1 : 9 (partitions)</text>

      <!-- MISSION -> DETECTION -->
      <path d="M 370 450 L 450 450 L 450 200 L 920 200" stroke="#64748b" stroke-width="2" marker-end="url(#arrow)" fill="none"/>
      <text x="455" y="240" class="rel-label">1 : N (produces)</text>

      <!-- DETECTION -> SURVIVOR -->
      <path d="M 1250 160 L 1360 160" stroke="#059669" stroke-width="2.5" marker-end="url(#arrow-emerald)" fill="none"/>
      <text x="1265" y="150" class="rel-label">0..1 : 1 (Victim)</text>

      <!-- DETECTION -> HAZARD -->
      <path d="M 1085 360 L 1085 640 L 1360 640" stroke="#e11d48" stroke-width="2" marker-end="url(#arrow)" fill="none"/>
      <text x="1140" y="630" class="rel-label">0..1 : 1 (Hazard)</text>

      <!-- DETECTION -> ALERT -->
      <path d="M 1085 360 L 1085 420" stroke="#e11d48" stroke-width="2" marker-end="url(#arrow)" fill="none"/>
      <text x="1095" y="395" class="rel-label">1 : N (triggers)</text>

      <!-- SURVIVOR -> RISK_ASSESSMENT -->
      <path d="M 1690 140 L 1800 140" stroke="#f59e0b" stroke-width="2" marker-end="url(#arrow-amber)" fill="none"/>
      <text x="1705" y="130" class="rel-label">1 : 1 (evaluates)</text>

      <!-- SURVIVOR -> RESCUE_PRIORITY -->
      <path d="M 1690 220 L 1740 220 L 1740 430 L 1800 430" stroke="#f59e0b" stroke-width="2" marker-end="url(#arrow-amber)" fill="none"/>
      <text x="1710" y="310" class="rel-label">1 : 1 (ranks)</text>

      <!-- SURVIVOR -> SAFE_ROUTE -->
      <path d="M 1525 390 L 1525 680 L 1800 680" stroke="#7c3aed" stroke-width="2" marker-end="url(#arrow)" fill="none"/>
      <text x="1540" y="620" class="rel-label">1 : 0..1 (guides)</text>

      <!-- SURVIVOR & HAZARD -> HAZARD_PROXIMITY -->
      <path d="M 1525 390 L 1525 430" stroke="#f59e0b" stroke-width="2" marker-end="url(#arrow-amber)" fill="none"/>
      <path d="M 1525 610 L 1525 560" stroke="#e11d48" stroke-width="2" marker-end="url(#arrow)" fill="none"/>
      <text x="1535" y="585" class="rel-label">N : M (proximity)</text>

      <!-- MISSION & ALERT -> DECISION_EVENT -->
      <path d="M 1085 710 L 1085 780" stroke="#64748b" stroke-width="2" marker-end="url(#arrow)" fill="none"/>
      <text x="1095" y="750" class="rel-label">1 : N (logs audit)</text>

      <!-- OPERATOR -> MISSION -->
      <path d="M 210 740 L 210 670" stroke="#64748b" stroke-width="2" marker-end="url(#arrow)" fill="none"/>
      <text x="218" y="710" class="rel-label">1 : N (commands)</text>
    </svg>

    <!-- COLUMN 1: DRONE (x=40), MISSION (x=40), OPERATOR (x=40) -->
    <div class="entity sim-card" style="top: 40px; left: 40px; width: 330px;">
      <div class="entity-header sim-header">
        <span>DRONE</span>
        <span class="entity-tag sim-tag">SIMULATED</span>
      </div>
      <div class="entity-body">
        <div class="attr-row"><span class="attr-name"><span class="key-pk">PK</span> id</span><span class="attr-type">string ("JA-RESCUE-01")</span></div>
        <div class="attr-row"><span class="attr-name">call_sign</span><span class="attr-type">string ("JA-RESCUE-01")</span></div>
        <div class="attr-row"><span class="attr-name">flight_mode</span><span class="attr-type">enum (AUTONOMOUS|RTL)</span></div>
        <div class="attr-row"><span class="attr-name">status</span><span class="attr-type">enum (IDLE|SEARCHING)</span></div>
        <div class="attr-row"><span class="attr-name">battery_pct</span><span class="attr-type">float (98% -> 0%)</span></div>
        <div class="attr-row"><span class="attr-name">altitude_m</span><span class="attr-type">float (32.0m AGL)</span></div>
        <div class="attr-row"><span class="attr-name">speed_mps</span><span class="attr-type">float (3.5 m/s)</span></div>
        <div class="attr-row"><span class="attr-name">heading_deg</span><span class="attr-type">float (45 deg)</span></div>
        <div class="attr-row"><span class="attr-name">comms_status</span><span class="attr-type">string (CONNECTED)</span></div>
        <div class="attr-row"><span class="attr-name">is_simulated</span><span class="attr-type">boolean (TRUE)</span></div>
      </div>
    </div>

    <div class="entity impl-card" style="top: 390px; left: 40px; width: 330px;">
      <div class="entity-header impl-header">
        <span>MISSION</span>
        <span class="entity-tag impl-tag">IMPLEMENTED</span>
      </div>
      <div class="entity-body">
        <div class="attr-row"><span class="attr-name"><span class="key-pk">PK</span> id</span><span class="attr-type">string ("MSN-2026-09")</span></div>
        <div class="attr-row"><span class="attr-name"><span class="key-fk">FK</span> drone_id</span><span class="attr-type">string -> DRONE.id</span></div>
        <div class="attr-row"><span class="attr-name"><span class="key-fk">FK</span> operator_id</span><span class="attr-type">string -> OPERATOR.id</span></div>
        <div class="attr-row"><span class="attr-name">search_area</span><span class="attr-type">string ("Sector Alpha")</span></div>
        <div class="attr-row"><span class="attr-name">current_objective</span><span class="attr-type">string (Dynamic Replan)</span></div>
        <div class="attr-row"><span class="attr-name">status</span><span class="attr-type">enum (SEARCHING)</span></div>
        <div class="attr-row"><span class="attr-name">progress_pct</span><span class="attr-type">int (0 - 100%)</span></div>
        <div class="attr-row"><span class="attr-name">elapsed_seconds</span><span class="attr-type">int (Runtime)</span></div>
      </div>
    </div>

    <div class="entity impl-card" style="top: 740px; left: 40px; width: 330px;">
      <div class="entity-header impl-header">
        <span>OPERATOR</span>
        <span class="entity-tag impl-tag">IMPLEMENTED</span>
      </div>
      <div class="entity-body">
        <div class="attr-row"><span class="attr-name"><span class="key-pk">PK</span> id</span><span class="attr-type">string ("OP-CMD-01")</span></div>
        <div class="attr-row"><span class="attr-name">name</span><span class="attr-type">string ("Field Commander")</span></div>
        <div class="attr-row"><span class="attr-name">role</span><span class="attr-type">enum (COMMANDER|LEAD)</span></div>
        <div class="attr-row"><span class="attr-name">call_sign</span><span class="attr-type">string ("RESCUE-BASE")</span></div>
      </div>
    </div>

    <!-- COLUMN 2: TELEMETRY (x=480), GPS (x=480), SEARCH_ZONE (x=480) -->
    <div class="entity sim-card" style="top: 40px; left: 480px; width: 330px;">
      <div class="entity-header sim-header">
        <span>TELEMETRY</span>
        <span class="entity-tag sim-tag">SIMULATED</span>
      </div>
      <div class="entity-body">
        <div class="attr-row"><span class="attr-name"><span class="key-pk">PK</span> id</span><span class="attr-type">string (UUID / Packet Seq)</span></div>
        <div class="attr-row"><span class="attr-name"><span class="key-fk">FK</span> drone_id</span><span class="attr-type">string -> DRONE.id</span></div>
        <div class="attr-row"><span class="attr-name"><span class="key-fk">FK</span> mission_id</span><span class="attr-type">string -> MISSION.id</span></div>
        <div class="attr-row"><span class="attr-name">latitude</span><span class="attr-type">float (13.0827 deg N)</span></div>
        <div class="attr-row"><span class="attr-name">longitude</span><span class="attr-type">float (80.2707 deg E)</span></div>
        <div class="attr-row"><span class="attr-name">altitude_agl</span><span class="attr-type">float (32.0 meters)</span></div>
        <div class="attr-row"><span class="attr-name">speed_mps</span><span class="attr-type">float (3.5 m/s)</span></div>
        <div class="attr-row"><span class="attr-name">heading_deg</span><span class="attr-type">float (45 deg)</span></div>
        <div class="attr-row"><span class="attr-name">battery_pct</span><span class="attr-type">float (98.0%)</span></div>
        <div class="attr-row"><span class="attr-name">signal_strength</span><span class="attr-type">float (94%)</span></div>
        <div class="attr-row"><span class="attr-name">timestamp</span><span class="attr-type">datetime (1 Hz Interval)</span></div>
      </div>
    </div>

    <div class="entity sim-card" style="top: 420px; left: 480px; width: 330px;">
      <div class="entity-header sim-header">
        <span>GPS_POSITION</span>
        <span class="entity-tag sim-tag">SIMULATED (u-blox M9N)</span>
      </div>
      <div class="entity-body">
        <div class="attr-row"><span class="attr-name"><span class="key-pk">PK</span> id</span><span class="attr-type">string</span></div>
        <div class="attr-row"><span class="attr-name">latitude / longitude</span><span class="attr-type">float (WGS-84)</span></div>
        <div class="attr-row"><span class="attr-name">altitude_msl</span><span class="attr-type">float (Meters MSL)</span></div>
        <div class="attr-row"><span class="attr-name">satellite_count</span><span class="attr-type">int (14 Satellites)</span></div>
        <div class="attr-row"><span class="attr-name">hdop</span><span class="attr-type">float (1.1 - Optimal)</span></div>
        <div class="attr-row"><span class="attr-name">fix_type</span><span class="attr-type">enum (3 = 3D Fix)</span></div>
      </div>
    </div>

    <div class="entity impl-card" style="top: 670px; left: 480px; width: 330px;">
      <div class="entity-header impl-header">
        <span>SEARCH_ZONE (Grid A1-C3)</span>
        <span class="entity-tag impl-tag">IMPLEMENTED</span>
      </div>
      <div class="entity-body">
        <div class="attr-row"><span class="attr-name"><span class="key-pk">PK</span> id</span><span class="attr-type">enum ("A1" through "C3")</span></div>
        <div class="attr-row"><span class="attr-name"><span class="key-fk">FK</span> mission_id</span><span class="attr-type">string -> MISSION.id</span></div>
        <div class="attr-row"><span class="attr-name">name</span><span class="attr-type">string ("Zone B2 Command")</span></div>
        <div class="attr-row"><span class="attr-name">terrain</span><span class="attr-type">string ("Collapsed Ruins")</span></div>
        <div class="attr-row"><span class="attr-name">status</span><span class="attr-type">enum (searched|unsearched)</span></div>
        <div class="attr-row"><span class="attr-name">center_lat / lng</span><span class="attr-type">float (Centroid GPS)</span></div>
        <div class="attr-row"><span class="attr-name">victims_count</span><span class="attr-type">int (Count in Zone)</span></div>
        <div class="attr-row"><span class="attr-name">hazards_count</span><span class="attr-type">int (Count in Zone)</span></div>
      </div>
    </div>

    <!-- COLUMN 3: DETECTION (x=920), ALERT (x=920), DECISION_EVENT (x=920) -->
    <div class="entity impl-card" style="top: 40px; left: 920px; width: 330px;">
      <div class="entity-header impl-header">
        <span>DETECTION</span>
        <span class="entity-tag impl-tag">IMPLEMENTED (AI)</span>
      </div>
      <div class="entity-body">
        <div class="attr-row"><span class="attr-name"><span class="key-pk">PK</span> id</span><span class="attr-type">string ("DET-VIC-1042")</span></div>
        <div class="attr-row"><span class="attr-name"><span class="key-fk">FK</span> mission_id</span><span class="attr-type">string -> MISSION.id</span></div>
        <div class="attr-row"><span class="attr-name"><span class="key-fk">FK</span> zone_id</span><span class="attr-type">enum -> SEARCH_ZONE.id</span></div>
        <div class="attr-row"><span class="attr-name">type / sub_type</span><span class="attr-type">string ("Victim", "Person")</span></div>
        <div class="attr-row"><span class="attr-name">confidence</span><span class="attr-type">float (94.0%)</span></div>
        <div class="attr-row"><span class="attr-name">source</span><span class="attr-type">enum (FUSED|RGB|THERMAL)</span></div>
        <div class="attr-row"><span class="attr-name">status</span><span class="attr-type">enum (VERIFIED|REQUIRES)</span></div>
        <div class="attr-row"><span class="attr-name">bbox (x, y, w, h)</span><span class="attr-type">float[] (Normalized %)</span></div>
        <div class="attr-row"><span class="attr-name">temperature</span><span class="attr-type">string ("36.8 C")</span></div>
        <div class="attr-row"><span class="attr-name">timestamp</span><span class="attr-type">datetime</span></div>
      </div>
    </div>

    <div class="entity alert-card" style="top: 420px; left: 920px; width: 330px;">
      <div class="entity-header alert-header">
        <span>ALERT</span>
        <span class="entity-tag alert-tag">IMPLEMENTED</span>
      </div>
      <div class="entity-body">
        <div class="attr-row"><span class="attr-name"><span class="key-pk">PK</span> id</span><span class="attr-type">string ("ALT-VIC-1042")</span></div>
        <div class="attr-row"><span class="attr-name"><span class="key-fk">FK</span> mission_id</span><span class="attr-type">string -> MISSION.id</span></div>
        <div class="attr-row"><span class="attr-name"><span class="key-fk">FK</span> zone_id</span><span class="attr-type">enum -> SEARCH_ZONE.id</span></div>
        <div class="attr-row"><span class="attr-name"><span class="key-fk">FK</span> detection_id</span><span class="attr-type">string (Optional)</span></div>
        <div class="attr-row"><span class="attr-name">type</span><span class="attr-type">enum (VICTIM|HAZARD)</span></div>
        <div class="attr-row"><span class="attr-name">severity</span><span class="attr-type">enum (CRITICAL|HIGH)</span></div>
        <div class="attr-row"><span class="attr-name">title</span><span class="attr-type">string ("CRITICAL SURVIVOR")</span></div>
        <div class="attr-row"><span class="attr-name">message</span><span class="attr-type">string (Detailed Rationale)</span></div>
        <div class="attr-row"><span class="attr-name">acknowledgement</span><span class="attr-type">enum (VERIFIED|DISMISSED)</span></div>
      </div>
    </div>

    <div class="entity impl-card" style="top: 780px; left: 920px; width: 330px;">
      <div class="entity-header impl-header">
        <span>DECISION_EVENT (Timeline)</span>
        <span class="entity-tag impl-tag">IMPLEMENTED</span>
      </div>
      <div class="entity-body">
        <div class="attr-row"><span class="attr-name"><span class="key-pk">PK</span> id</span><span class="attr-type">string ("EVT-001")</span></div>
        <div class="attr-row"><span class="attr-name"><span class="key-fk">FK</span> mission_id</span><span class="attr-type">string -> MISSION.id</span></div>
        <div class="attr-row"><span class="attr-name"><span class="key-fk">FK</span> survivor_id</span><span class="attr-type">string (Optional)</span></div>
        <div class="attr-row"><span class="attr-name">type</span><span class="attr-type">enum (DETECTION|REPLAN)</span></div>
        <div class="attr-row"><span class="attr-name">title</span><span class="attr-type">string ("Dynamic Replan")</span></div>
        <div class="attr-row"><span class="attr-name">severity</span><span class="attr-type">enum (CRITICAL|HIGH)</span></div>
        <div class="attr-row"><span class="attr-name">timestamp</span><span class="attr-type">datetime (Audit Stamp)</span></div>
      </div>
    </div>

    <!-- COLUMN 4: SURVIVOR (x=1360), HAZARD_PROXIMITY (x=1360), HAZARD (x=1360) -->
    <div class="entity impl-card" style="top: 40px; left: 1360px; width: 330px;">
      <div class="entity-header impl-header">
        <span>SURVIVOR</span>
        <span class="entity-tag impl-tag">IMPLEMENTED</span>
      </div>
      <div class="entity-body">
        <div class="attr-row"><span class="attr-name"><span class="key-pk">PK</span> id</span><span class="attr-type">string ("SURV-1042")</span></div>
        <div class="attr-row"><span class="attr-name"><span class="key-fk">FK</span> detection_id</span><span class="attr-type">string -> DETECTION.id</span></div>
        <div class="attr-row"><span class="attr-name"><span class="key-fk">FK</span> zone_id</span><span class="attr-type">enum -> SEARCH_ZONE.id</span></div>
        <div class="attr-row"><span class="attr-name">latitude / longitude</span><span class="attr-type">float (13.0841, 80.2745)</span></div>
        <div class="attr-row"><span class="attr-name">rgb_confidence</span><span class="attr-type">float (94.0%)</span></div>
        <div class="attr-row"><span class="attr-name">thermal_confidence</span><span class="attr-type">float (91.0%)</span></div>
        <div class="attr-row"><span class="attr-name">thermal_confirmed</span><span class="attr-type">boolean (TRUE - Body Heat)</span></div>
        <div class="attr-row"><span class="attr-name">movement_status</span><span class="attr-type">enum (NO_MOVEMENT)</span></div>
        <div class="attr-row"><span class="attr-name">estimated_condition</span><span class="attr-type">enum (CRITICAL)</span></div>
        <div class="attr-row"><span class="attr-name">verification_status</span><span class="attr-type">enum (VERIFIED|POSSIBLE)</span></div>
        <div class="attr-row"><span class="attr-name">second_look_status</span><span class="attr-type">enum (NONE|IN_PROGRESS)</span></div>
      </div>
    </div>

    <div class="entity intel-card" style="top: 430px; left: 1360px; width: 330px;">
      <div class="entity-header intel-header">
        <span>HAZARD_PROXIMITY</span>
        <span class="entity-tag intel-tag">INTELLIGENCE</span>
      </div>
      <div class="entity-body">
        <div class="attr-row"><span class="attr-name"><span class="key-fk">FK</span> survivor_id</span><span class="attr-type">-> SURVIVOR.id</span></div>
        <div class="attr-row"><span class="attr-name"><span class="key-fk">FK</span> hazard_id</span><span class="attr-type">-> HAZARD.id</span></div>
        <div class="attr-row"><span class="attr-name">distance_meters</span><span class="attr-type">float (e.g. 32.4m)</span></div>
        <div class="attr-row"><span class="attr-name">within_danger_buffer</span><span class="attr-type">boolean (<= r + 35m)</span></div>
      </div>
    </div>

    <div class="entity alert-card" style="top: 610px; left: 1360px; width: 330px;">
      <div class="entity-header alert-header">
        <span>HAZARD</span>
        <span class="entity-tag alert-tag">IMPLEMENTED</span>
      </div>
      <div class="entity-body">
        <div class="attr-row"><span class="attr-name"><span class="key-pk">PK</span> id</span><span class="attr-type">string ("HAZ-001")</span></div>
        <div class="attr-row"><span class="attr-name"><span class="key-fk">FK</span> detection_id</span><span class="attr-type">string -> DETECTION.id</span></div>
        <div class="attr-row"><span class="attr-name"><span class="key-fk">FK</span> zone_id</span><span class="attr-type">enum -> SEARCH_ZONE.id</span></div>
        <div class="attr-row"><span class="attr-name">type</span><span class="attr-type">enum (Fire|Flood|Chemical)</span></div>
        <div class="attr-row"><span class="attr-name">severity</span><span class="attr-type">enum (CRITICAL|HIGH)</span></div>
        <div class="attr-row"><span class="attr-name">radius_m</span><span class="attr-type">float (50.0m Danger Ring)</span></div>
        <div class="attr-row"><span class="attr-name">latitude / longitude</span><span class="attr-type">float (GPS)</span></div>
        <div class="attr-row"><span class="attr-name">status</span><span class="attr-type">string ("REVIEW REQUIRED")</span></div>
      </div>
    </div>

    <!-- COLUMN 5: RISK (x=1800), PRIORITY (x=1800), ROUTE (x=1800) -->
    <div class="entity intel-card" style="top: 40px; left: 1800px; width: 330px;">
      <div class="entity-header intel-header">
        <span>RISK_ASSESSMENT (0-100)</span>
        <span class="entity-tag intel-tag">INTELLIGENCE</span>
      </div>
      <div class="entity-body">
        <div class="attr-row"><span class="attr-name"><span class="key-fk">FK</span> survivor_id</span><span class="attr-type">-> SURVIVOR.id (1:1)</span></div>
        <div class="attr-row"><span class="attr-name">risk_score</span><span class="attr-type">int (88 / 100)</span></div>
        <div class="attr-row"><span class="attr-name">risk_level</span><span class="attr-type">enum (CRITICAL|HIGH)</span></div>
        <div class="attr-row"><span class="attr-name">movement_pts</span><span class="attr-type">int (28 / 30 pts)</span></div>
        <div class="attr-row"><span class="attr-name">condition_pts</span><span class="attr-type">int (25 / 25 pts)</span></div>
        <div class="attr-row"><span class="attr-name">thermal_pts</span><span class="attr-type">int (15 / 15 pts)</span></div>
        <div class="attr-row"><span class="attr-name">hazard_pts</span><span class="attr-type">int (20 / 20 pts)</span></div>
        <div class="attr-row"><span class="attr-name">reasons</span><span class="attr-type">string[] (Explainable Rationale)</span></div>
      </div>
    </div>

    <div class="entity intel-card" style="top: 360px; left: 1800px; width: 330px;">
      <div class="entity-header intel-header">
        <span>RESCUE_PRIORITY (Queue)</span>
        <span class="entity-tag intel-tag">INTELLIGENCE</span>
      </div>
      <div class="entity-body">
        <div class="attr-row"><span class="attr-name"><span class="key-fk">FK</span> survivor_id</span><span class="attr-type">-> SURVIVOR.id (1:1)</span></div>
        <div class="attr-row"><span class="attr-name">priority_rank</span><span class="attr-type">int (1 = Most Urgent, 2...)</span></div>
        <div class="attr-row"><span class="attr-name">ranked_at</span><span class="attr-type">datetime</span></div>
        <div class="attr-row"><span class="attr-name">tie_breaker</span><span class="attr-type">float (Fused Confidence %)</span></div>
      </div>
    </div>

    <div class="entity fut-card" style="top: 560px; left: 1800px; width: 330px;">
      <div class="entity-header fut-header">
        <span>SAFE_ROUTE (A* Guidance)</span>
        <span class="entity-tag fut-tag">IMPLEMENTED / GUIDANCE</span>
      </div>
      <div class="entity-body">
        <div class="attr-row"><span class="attr-name"><span class="key-pk">PK</span> id</span><span class="attr-type">string ("ROUTE-1042")</span></div>
        <div class="attr-row"><span class="attr-name"><span class="key-fk">FK</span> survivor_id</span><span class="attr-type">-> SURVIVOR.id</span></div>
        <div class="attr-row"><span class="attr-name">origin_zone</span><span class="attr-type">string ("A1" Base)</span></div>
        <div class="attr-row"><span class="attr-name">destination_zone</span><span class="attr-type">string ("B3" Target)</span></div>
        <div class="attr-row"><span class="attr-name">status</span><span class="attr-type">enum (CLEAR|CAUTION|BLOCKED)</span></div>
        <div class="attr-row"><span class="attr-name">accessibility</span><span class="attr-type">enum (SAFE|IMPASSABLE)</span></div>
        <div class="attr-row"><span class="attr-name">distance_meters</span><span class="attr-type">float (e.g. 280.0m)</span></div>
        <div class="attr-row"><span class="attr-name">travel_time_sec</span><span class="attr-type">int (254 sec @ 1.1 m/s)</span></div>
        <div class="attr-row"><span class="attr-name">steps</span><span class="attr-type">json (Ordered Sector Corridor)</span></div>
        <div class="attr-row"><span class="attr-name">hazards_avoided</span><span class="attr-type">string[] (Bypassed Threats)</span></div>
      </div>
    </div>

  </div>

</body>
</html>
"""

with open("/Users/sheshagiri/jeevan air/docs/er_diagram_canvas.html", "w") as f:
    f.write(html_content)

print("Generated aligned er_diagram_canvas.html successfully.")
