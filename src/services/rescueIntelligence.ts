/**
 * JEEVAN-AIR | Rescue Intelligence Engine
 * Team ZYNTAX — SIH26177 (Qualcomm Inc)
 * 
 * Independent intelligence module implementing:
 * 1. Explainable Risk Assessment (multi-factor transparent scoring)
 * 2. Operational Rescue Prioritization (ranking survivors by urgency)
 * 3. Spatial Hazard Proximity Analysis (distance & danger buffer calculation)
 * 4. Dynamic Safe-Access Guidance (A* responder ground pathfinding avoiding hazards)
 * 5. Autonomous Second-Look Verification (uncertainty resolution pipeline)
 * 6. Dynamic Mission Replanning (objective adaptation on priority incidents)
 * 
 * NOTE: Independent of UI, accepting Common Data Models.
 * Operates with simulated data in Phase 1/2 and will receive real AI outputs in Phase 4.
 */

import {
  Survivor,
  Hazard,
  SearchZone,
  SafeRoute,
  DecisionTimelineEvent,
  RiskLevel,
  PriorityLevel,
  ZoneId,
} from '../types';

// Approximate meters per degree in disaster area (Chennai: ~13.08 N)
const METERS_PER_DEG_LAT = 111000;
const METERS_PER_DEG_LNG = 108000;

/**
 * Calculate ground distance in meters between two GPS coordinates
 */
export function calculateDistanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const dLat = (lat2 - lat1) * METERS_PER_DEG_LAT;
  const dLng = (lng2 - lng1) * METERS_PER_DEG_LNG;
  return Math.round(Math.sqrt(dLat * dLat + dLng * dLng));
}

/**
 * Determine which active hazards are close enough to influence a survivor's risk
 */
export function findNearbyHazards(
  survivor: { latitude: number; longitude: number; zone: ZoneId },
  hazards: Hazard[]
): { hazard: Hazard; distanceMeters: number; withinDangerRadius: boolean }[] {
  return hazards
    .filter((h) => h.status !== 'DISMISSED')
    .map((hazard) => {
      const distance = calculateDistanceMeters(
        survivor.latitude,
        survivor.longitude,
        hazard.latitude,
        hazard.longitude
      );
      // Hazard danger radius + 35m safety margin
      const dangerThreshold = hazard.radius + 35;
      const sameZone = survivor.zone === hazard.zone;
      const withinDangerRadius = distance <= dangerThreshold || (sameZone && distance <= 120);

      return {
        hazard,
        distanceMeters: distance,
        withinDangerRadius,
      };
    })
    .filter((res) => res.distanceMeters <= (res.hazard.radius + 35) || (res.distanceMeters <= 120 && res.hazard.zone === survivor.zone));
}

/**
 * FEATURE 3: Explainable Risk Assessment Engine
 * Transparent, multi-factor scoring (0-100) with understandable operational reasons.
 */
export function assessSurvivorRisk(
  survivor: {
    rgbConfidence: number;
    thermalConfidence: number;
    thermalConfirmed: boolean;
    movementStatus: Survivor['movementStatus'];
    estimatedCondition: Survivor['estimatedCondition'];
    zone: ZoneId;
    latitude: number;
    longitude: number;
  },
  nearbyHazardAnalysis: { hazard: Hazard; distanceMeters: number; withinDangerRadius: boolean }[],
  zoneData?: SearchZone
): {
  riskScore: number;
  riskLevel: RiskLevel;
  priority: PriorityLevel;
  reasons: string[];
} {
  let score = 0;
  const reasons: string[] = [];

  // Factor 1: Movement & Trapped Status (Max: 30 pts)
  if (survivor.movementStatus === 'NO_MOVEMENT' || survivor.movementStatus === 'STATIC') {
    score += 28;
    reasons.push('No movement detected: high risk of entrapment or incapacitation');
  } else if (survivor.movementStatus === 'UNKNOWN') {
    score += 15;
    reasons.push('Movement undetermined: requires visual confirmation');
  } else if (survivor.movementStatus === 'MOVEMENT_DETECTED' || survivor.movementStatus === 'MOVING') {
    score += 10;
    reasons.push('Movement detected: survivor actively responsive');
  }

  // Factor 2: Survivor Estimated Condition (Max: 25 pts)
  if (survivor.estimatedCondition === 'CRITICAL') {
    score += 25;
    reasons.push('Elevated distress signature: immediate responder intervention recommended');
  } else if (survivor.estimatedCondition === 'UNCERTAIN') {
    score += 18;
    reasons.push('Uncertain condition: sensor readings indicate potential thermal vulnerability');
  } else if (survivor.estimatedCondition === 'POSSIBLE' || survivor.estimatedCondition === 'UNKNOWN') {
    score += 14;
  } else if (survivor.estimatedCondition === 'STABLE') {
    score += 8;
  }

  // Factor 3: Thermal Signature Confirmation (Max: 15 pts)
  if (survivor.thermalConfirmed || survivor.thermalConfidence >= 85) {
    score += 15;
    reasons.push('Thermal infrared confirmed: distinct body heat signature verified');
  } else if (survivor.thermalConfidence >= 60) {
    score += 8;
    reasons.push('Moderate thermal signature detected');
  } else {
    reasons.push('Weak thermal signature: second-look verification recommended');
  }

  // Factor 4: Nearby Hazard Severity & Proximity (Max: 25 pts)
  const criticalHazards = nearbyHazardAnalysis.filter(
    (nh) => nh.withinDangerRadius && (nh.hazard.severity === 'CRITICAL' || nh.hazard.type === 'Fire' || nh.hazard.type === 'Chemical Leak')
  );
  const highHazards = nearbyHazardAnalysis.filter(
    (nh) => nh.withinDangerRadius && (nh.hazard.severity === 'HIGH' || nh.hazard.type === 'Flooded Area' || nh.hazard.type === 'Damaged Structure')
  );

  if (criticalHazards.length > 0) {
    score += 25;
    const hNames = criticalHazards.map((h) => `${h.hazard.type} (~${h.distanceMeters}m)`).join(', ');
    reasons.push(`Extreme proximity to critical threat: ${hNames}`);
  } else if (highHazards.length > 0) {
    score += 18;
    const hNames = highHazards.map((h) => `${h.hazard.type} (~${h.distanceMeters}m)`).join(', ');
    reasons.push(`Secondary environmental threat nearby: ${hNames}`);
  } else if (nearbyHazardAnalysis.length > 0) {
    score += 10;
    reasons.push(`Environmental hazard present in sector periphery`);
  }

  // Factor 5: Terrain & Ground Accessibility (Max: 10 pts)
  if (zoneData) {
    if (zoneData.terrain === 'Collapsed Building') {
      score += 10;
      reasons.push('Structural collapse zone: unstable ground obstacles hamper access');
    } else if (zoneData.terrain === 'Flood Water') {
      score += 8;
      reasons.push('Floodwater zone: watercraft or wading extraction required');
    } else if (zoneData.terrain === 'Urban Debris') {
      score += 5;
    }
  }

  // Bound score between 0 and 100
  const finalScore = Math.min(100, Math.max(0, score));

  // Determine Risk Level & Operational Urgency
  let riskLevel: RiskLevel = 'LOW';
  let priority: PriorityLevel = 'LOW';

  if (finalScore >= 75) {
    riskLevel = 'CRITICAL';
    priority = 'CRITICAL';
  } else if (finalScore >= 50) {
    riskLevel = 'HIGH';
    priority = 'HIGH';
  } else if (finalScore >= 30) {
    riskLevel = 'MEDIUM';
    priority = 'MEDIUM';
  } else {
    riskLevel = 'LOW';
    priority = 'LOW';
  }

  return {
    riskScore: finalScore,
    riskLevel,
    priority,
    reasons,
  };
}

/**
 * FEATURE 4: Rescue Priority Engine
 * Ranks all survivors by operational urgency based on risk score, verification status, and time.
 */
export function prioritizeSurvivors(survivors: Survivor[]): Survivor[] {
  // Sort: Verified / Under-Review above Rejected
  // Then descending by riskScore, then ascending by creation time
  const sorted = [...survivors].sort((a, b) => {
    // Rejected survivors ranked last
    if (a.verificationStatus === 'REJECTED' && b.verificationStatus !== 'REJECTED') return 1;
    if (a.verificationStatus !== 'REJECTED' && b.verificationStatus === 'REJECTED') return -1;

    // Highest risk score first
    if (b.riskScore !== a.riskScore) {
      return b.riskScore - a.riskScore;
    }

    // Higher confidence first
    return b.confidence - a.confidence;
  });

  // Assign 1-indexed priority ranks
  return sorted.map((survivor, index) => ({
    ...survivor,
    priorityRank: survivor.verificationStatus === 'REJECTED' ? undefined : index + 1,
  }));
}

/**
 * Grid coordinates map for 3x3 sector system
 */
const SECTOR_COORDINATES: Record<ZoneId, { row: number; col: number; lat: number; lng: number }> = {
  A1: { row: 0, col: 0, lat: 13.0827, lng: 80.2707 },
  A2: { row: 0, col: 1, lat: 13.0845, lng: 80.2735 },
  A3: { row: 0, col: 2, lat: 13.0863, lng: 80.2763 },
  B1: { row: 1, col: 0, lat: 13.0805, lng: 80.2689 },
  B2: { row: 1, col: 1, lat: 13.0823, lng: 80.2717 },
  B3: { row: 1, col: 2, lat: 13.0841, lng: 80.2745 },
  C1: { row: 2, col: 0, lat: 13.0783, lng: 80.2671 },
  C2: { row: 2, col: 1, lat: 13.0801, lng: 80.2699 },
  C3: { row: 2, col: 2, lat: 13.0819, lng: 80.2727 },
};

/**
 * FEATURE 6: Dynamic Safe-Access Guidance (Pathfinding for Ground Responders)
 * Calculates a safer ground route avoiding hazard zones.
 * Note: Drone flies over obstacles, but human ground responders must avoid fires,
 * deep floods, and collapsed structures.
 */
export function calculateSafeRoute(
  survivor: Survivor,
  hazards: Hazard[],
  zones: SearchZone[],
  stagingZoneId: ZoneId = 'A1'
): SafeRoute {
  const targetZoneId = survivor.zone;

  // Identify sectors with active severe hazards to avoid
  const dangerousZones = new Set<ZoneId>();
  const avoidedHazardDescriptions: string[] = [];

  hazards
    .filter((h) => h.status !== 'DISMISSED')
    .forEach((h) => {
      // If hazard is CRITICAL or Fire / High Flood, ground responders must detour around it
      if (h.severity === 'CRITICAL' || h.type === 'Fire' || h.type === 'Chemical Leak') {
        if (h.zone !== targetZoneId) {
          dangerousZones.add(h.zone);
          avoidedHazardDescriptions.push(`Bypassed ${h.type} danger zone in Sector ${h.zone}`);
        }
      }
    });

  // Graph representation of 3x3 sectors with orthogonal & diagonal adjacency
  const zoneList: ZoneId[] = ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3'];

  // A* / BFS pathfinding on 3x3 grid
  const queue: Array<{ current: ZoneId; path: ZoneId[] }> = [
    { current: stagingZoneId, path: [stagingZoneId] },
  ];
  const visited = new Set<ZoneId>([stagingZoneId]);
  let foundPath: ZoneId[] | null = null;

  while (queue.length > 0) {
    const { current, path } = queue.shift()!;

    if (current === targetZoneId) {
      foundPath = path;
      break;
    }

    const currentCoord = SECTOR_COORDINATES[current];

    // Find valid neighboring sectors
    for (const neighbor of zoneList) {
      if (visited.has(neighbor)) continue;

      const neighborCoord = SECTOR_COORDINATES[neighbor];
      const rowDiff = Math.abs(currentCoord.row - neighborCoord.row);
      const colDiff = Math.abs(currentCoord.col - neighborCoord.col);

      // Orthogonal or diagonal step
      if (rowDiff <= 1 && colDiff <= 1 && !(rowDiff === 0 && colDiff === 0)) {
        // If neighbor is dangerous and NOT destination, avoid
        if (dangerousZones.has(neighbor) && neighbor !== targetZoneId) {
          continue;
        }

        visited.add(neighbor);
        queue.push({ current: neighbor, path: [...path, neighbor] });
      }
    }
  }

  // Fallback direct path if all detours are blocked
  const finalPath = foundPath || [stagingZoneId, targetZoneId];
  const isBlocked = !foundPath || dangerousZones.has(targetZoneId);

  // Calculate distance & travel time
  let totalDistance = 0;
  for (let i = 0; i < finalPath.length - 1; i++) {
    const p1 = SECTOR_COORDINATES[finalPath[i]];
    const p2 = SECTOR_COORDINATES[finalPath[i + 1]];
    totalDistance += calculateDistanceMeters(p1.lat, p1.lng, p2.lat, p2.lng);
  }

  // Add micro-distance inside destination sector to survivor coordinates
  const destCoord = SECTOR_COORDINATES[targetZoneId];
  totalDistance += calculateDistanceMeters(destCoord.lat, destCoord.lng, survivor.latitude, survivor.longitude);

  // Walking speed with gear in disaster terrain ~ 3.5 km/h (58 m/min)
  const estimatedMinutes = Math.max(2, Math.round(totalDistance / 58));

  // Waypoint polyline
  const waypoints = finalPath.map((zid) => ({
    lat: SECTOR_COORDINATES[zid].lat,
    lng: SECTOR_COORDINATES[zid].lng,
    label: `Sector ${zid}`,
  }));

  // Append exact survivor location as destination waypoint
  waypoints.push({
    lat: survivor.latitude,
    lng: survivor.longitude,
    label: `Survivor ${survivor.id} Extraction Point`,
  });

  const accessibilityRating = isBlocked
    ? 'IMPASSABLE'
    : finalPath.some((z) => zones.find((zd) => zd.id === z)?.terrain === 'Flood Water')
    ? 'DIFFICULT'
    : finalPath.length > 3
    ? 'CAUTION'
    : 'CLEAR';

  const routeAdvisory = isBlocked
    ? 'All ground corridors blocked by secondary hazards. Drone delivery or specialized amphibious extraction recommended.'
    : avoidedHazardDescriptions.length > 0
    ? `Safe ground detour calculated: ${avoidedHazardDescriptions.join('; ')}. Staging from Sector ${stagingZoneId}.`
    : `Direct responder approach via Sector ${finalPath.join(' → ')}. Ground clear of immediate fire/collapse boundaries.`;

  return {
    survivorId: survivor.id,
    destinationZone: targetZoneId,
    startPoint: {
      lat: SECTOR_COORDINATES[stagingZoneId].lat,
      lng: SECTOR_COORDINATES[stagingZoneId].lng,
      label: `Responder Staging Area (${stagingZoneId})`,
    },
    waypoints,
    gridPath: finalPath,
    totalDistanceMeters: Math.max(120, totalDistance),
    estimatedTravelMinutes: estimatedMinutes,
    avoidedHazards: avoidedHazardDescriptions,
    status: isBlocked ? 'BLOCKED' : 'CALCULATED',
    accessibilityRating,
    routeAdvisory,
  };
}

/**
 * FEATURE 5: Autonomous Second-Look Verification State Transition
 * Resolves uncertain/low-confidence detections through a simulated recheck.
 */
export function executeSecondLookResolution(survivor: Survivor): {
  updatedSurvivor: Survivor;
  event: DecisionTimelineEvent;
} {
  const timestamp = new Date().toLocaleTimeString([], { hour12: false });

  // If initial confidence was very low or thermal unconfirmed, test verification vs rejection
  const isConfirmed = survivor.rgbConfidence >= 65 || survivor.thermalConfidence >= 70;

  if (isConfirmed) {
    const updated: Survivor = {
      ...survivor,
      verificationStatus: 'VERIFIED',
      secondLookStatus: 'COMPLETED',
      secondLookRequested: false,
      confidence: Math.min(98, Math.max(88, survivor.confidence + 25)),
      rgbConfidence: Math.min(98, Math.max(88, survivor.rgbConfidence + 25)),
      thermalConfidence: Math.min(98, Math.max(90, survivor.thermalConfidence + 25)),
      thermalConfirmed: true,
      condition: survivor.condition === 'UNCERTAIN' ? 'CRITICAL' : survivor.condition,
      estimatedCondition: survivor.estimatedCondition === 'UNCERTAIN' ? 'CRITICAL' : survivor.estimatedCondition,
      temperatureReading: survivor.temperatureReading || '36.9°C (Body Heat Confirmed)',
      notes: 'Second-look verification complete: multi-angle optical & thermal signature confirmed genuine survivor silhouette.',
    };

    const event: DecisionTimelineEvent = {
      id: `EVT-SL-${Date.now().toString().slice(-4)}`,
      timestamp,
      type: 'SECOND_LOOK_RESULT',
      title: `Second-Look Verification Confirmed: ${survivor.id}`,
      description: `Simulated reposition & thermal cross-check verified body heat signature in Sector ${survivor.zone}. Confidence upgraded to ${updated.confidence}%.`,
      severity: 'HIGH',
      relatedSurvivorId: survivor.id,
      zone: survivor.zone,
    };

    return { updatedSurvivor: updated, event };
  } else {
    // False positive rejection
    const updated: Survivor = {
      ...survivor,
      verificationStatus: 'REJECTED',
      secondLookStatus: 'COMPLETED',
      secondLookRequested: false,
      confidence: 15,
      riskScore: 0,
      riskLevel: 'LOW',
      priority: 'LOW',
      notes: 'Second-look rejected: visual artifact caused by debris shadow and non-human thermal reflection. Marked false positive.',
    };

    const event: DecisionTimelineEvent = {
      id: `EVT-SL-REJ-${Date.now().toString().slice(-4)}`,
      timestamp,
      type: 'SECOND_LOOK_RESULT',
      title: `Second-Look Rejected (False Positive): ${survivor.id}`,
      description: `Secondary observation angle confirmed inanimate debris shadow in Sector ${survivor.zone}. Target dismissed.`,
      severity: 'LOW',
      relatedSurvivorId: survivor.id,
      zone: survivor.zone,
    };

    return { updatedSurvivor: updated, event };
  }
}
