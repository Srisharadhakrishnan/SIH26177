/**
 * JEEVAN-AIR | Rescue Intelligence Verification Test Suite
 * Team ZYNTAX — SIH26177 (Qualcomm Inc)
 * 
 * Verifies all 15 requirements specified for Phase 2:
 * 1. Normal survivor
 * 2. Critical survivor
 * 3. Low-confidence survivor
 * 4. Survivor with nearby fire
 * 5. Survivor with nearby flood
 * 6. Multiple survivors
 * 7. Multiple hazards
 * 8. Second-look verification
 * 9. Verification rejection
 * 10. Rescue priority ranking
 * 11. Safe route generation
 * 12. Blocked route
 * 13. Mission replanning
 * 14. Event timeline
 * 15. Dashboard synchronization
 */

import {
  assessSurvivorRisk,
  prioritizeSurvivors,
  calculateSafeRoute,
  findNearbyHazards,
  executeSecondLookResolution,
  calculateDistanceMeters,
} from '../services/rescueIntelligence';
import { SimulationDataProvider } from '../adapters/SimulationDataProvider';
import { Survivor, Hazard, SearchZone, ZoneId } from '../types';
import { INITIAL_ZONES } from '../data/mockData';

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    console.log(`✅ [PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`❌ [FAIL] ${testName}${detail ? ` - ${detail}` : ''}`);
    process.exitCode = 1;
  }
}

console.log('\n======================================================');
console.log('🧪 RUNNING JEEVAN-AIR PHASE 2 INTELLIGENCE TEST SUITE');
console.log('======================================================\n');

// 1. Normal Survivor
const normalSurvivor: Survivor = {
  id: 'SURV-NORM-01',
  latitude: 13.0827,
  longitude: 80.2707,
  zone: 'A1',
  timestamp: '12:00:00',
  rgbConfidence: 85,
  thermalConfidence: 80,
  confidence: 85,
  thermalConfirmed: true,
  movementStatus: 'MOVEMENT_DETECTED',
  estimatedCondition: 'STABLE',
  condition: 'STABLE',
  nearbyHazards: [],
  priority: 'LOW',
  riskScore: 0,
  riskLevel: 'LOW',
  riskReasons: [],
  verificationStatus: 'VERIFIED',
};
const normalRisk = assessSurvivorRisk(normalSurvivor, []);
assert(
  normalRisk.riskLevel === 'MEDIUM' || normalRisk.riskLevel === 'LOW',
  '1. Normal survivor risk assessment',
  `Expected LOW/MEDIUM, got ${normalRisk.riskLevel} (Score: ${normalRisk.riskScore})`
);

// 2. Critical Survivor (no movement, critical condition, trapped)
const criticalSurvivor: Survivor = {
  ...normalSurvivor,
  id: 'SURV-CRIT-01',
  movementStatus: 'NO_MOVEMENT',
  estimatedCondition: 'CRITICAL',
  condition: 'CRITICAL',
  thermalConfirmed: true,
};
const criticalRisk = assessSurvivorRisk(criticalSurvivor, []);
assert(
  criticalRisk.riskScore >= 65 && (criticalRisk.riskLevel === 'CRITICAL' || criticalRisk.riskLevel === 'HIGH'),
  '2. Critical survivor evaluation',
  `Expected CRITICAL/HIGH risk score >= 65, got ${criticalRisk.riskScore} (${criticalRisk.riskLevel})`
);
assert(
  criticalRisk.reasons.some((r) => r.includes('No movement') || r.includes('immediate responder')),
  '2b. Explainable reasons generated for critical survivor'
);

// 3. Low-Confidence Survivor
const lowConfSurvivor: Survivor = {
  ...normalSurvivor,
  id: 'SURV-UNC-01',
  rgbConfidence: 58,
  thermalConfidence: 45,
  confidence: 58,
  thermalConfirmed: false,
  movementStatus: 'UNKNOWN',
  estimatedCondition: 'UNCERTAIN',
  condition: 'UNCERTAIN',
  verificationStatus: 'POSSIBLE',
};
const lowConfRisk = assessSurvivorRisk(lowConfSurvivor, []);
assert(
  lowConfRisk.reasons.some((r) => r.includes('second-look') || r.includes('Weak thermal signature') || r.includes('Movement undetermined')),
  '3. Low-confidence survivor triggers second-look recommendation'
);

// 4. Survivor with Nearby Fire
const fireHazard: Hazard = {
  id: 'HAZ-FIRE-01',
  type: 'Fire',
  latitude: 13.0829,
  longitude: 80.2709,
  severity: 'CRITICAL',
  priority: 'CRITICAL',
  confidence: 95,
  radius: 50,
  affectedRadiusMeters: 50,
  timestamp: '12:01:00',
  status: 'REVIEW REQUIRED',
  threatDescription: 'Active structural fire',
  zone: 'A1',
};
const nearbyFire = findNearbyHazards(criticalSurvivor, [fireHazard]);
assert(
  nearbyFire.length === 1 && nearbyFire[0].withinDangerRadius,
  '4a. Spatial proximity correctly flags nearby fire threat'
);
const fireRisk = assessSurvivorRisk(criticalSurvivor, nearbyFire);
assert(
  fireRisk.riskLevel === 'CRITICAL' && fireRisk.riskScore >= 80,
  '4b. Proximity to active fire elevates risk to CRITICAL',
  `Score: ${fireRisk.riskScore}`
);

// 5. Survivor with Nearby Flood
const floodHazard: Hazard = {
  id: 'HAZ-FLOOD-01',
  type: 'Flood',
  latitude: 13.0835,
  longitude: 80.2715,
  severity: 'HIGH',
  priority: 'HIGH',
  confidence: 90,
  radius: 60,
  affectedRadiusMeters: 60,
  timestamp: '12:02:00',
  status: 'VERIFIED',
  threatDescription: 'Rising floodwater',
  zone: 'A1',
};
const floodZone = INITIAL_ZONES.find((z) => z.terrain === 'Flood Water') || INITIAL_ZONES[0];
const floodSurvivor: Survivor = {
  ...normalSurvivor,
  id: 'SURV-FLOOD-01',
  zone: floodZone.id,
  latitude: floodZone.lat,
  longitude: floodZone.lng,
};
const nearbyFlood = findNearbyHazards(floodSurvivor, [floodHazard]);
const floodRisk = assessSurvivorRisk(floodSurvivor, nearbyFlood, floodZone);
assert(
  floodRisk.reasons.some((r) => r.toLowerCase().includes('flood') || r.toLowerCase().includes('environmental')),
  '5. Flood zone terrain and hazard correctly accounted for in risk reasons'
);

// 6. Multiple Survivors
const survA: Survivor = { ...normalSurvivor, id: 'SURV-A', riskScore: 88, confidence: 95, priorityRank: 1 };
const survB: Survivor = { ...normalSurvivor, id: 'SURV-B', riskScore: 45, confidence: 80, priorityRank: 2 };
const survC: Survivor = { ...normalSurvivor, id: 'SURV-C', riskScore: 68, confidence: 88, priorityRank: 3 };
const multiRanked = prioritizeSurvivors([survB, survA, survC]);
assert(
  multiRanked[0].id === 'SURV-A' && multiRanked[1].id === 'SURV-C' && multiRanked[2].id === 'SURV-B',
  '6. Multiple survivors prioritized by descending risk score'
);
assert(
  multiRanked[0].priorityRank === 1 && multiRanked[1].priorityRank === 2 && multiRanked[2].priorityRank === 3,
  '6b. Sequential priority ranks (1, 2, 3) properly assigned'
);

// 7. Multiple Hazards
const haz1: Hazard = { ...fireHazard, id: 'H1', latitude: 13.0827, longitude: 80.2707, radius: 40 };
const haz2: Hazard = { ...floodHazard, id: 'H2', zone: 'C3', latitude: 13.0900, longitude: 80.2900, radius: 20 }; // far away in C3
const haz3: Hazard = { ...fireHazard, id: 'H3', type: 'Chemical Leak', latitude: 13.0828, longitude: 80.2708, radius: 45 };
const multiHazAnalysis = findNearbyHazards(normalSurvivor, [haz1, haz2, haz3]);
assert(
  multiHazAnalysis.length === 2 && !multiHazAnalysis.some((h) => h.hazard.id === 'H2'),
  '7. Multiple hazards: filters out distant hazards and includes nearby ones'
);

// 8. Second-Look Verification (Positive resolution)
const uncertainCandidate: Survivor = {
  ...lowConfSurvivor,
  id: 'SURV-2ND-LOOK-01',
  rgbConfidence: 68,
  thermalConfidence: 72,
  verificationStatus: 'POSSIBLE',
};
const { updatedSurvivor: verifiedSurv, event: verifyEvent } = executeSecondLookResolution(uncertainCandidate);
assert(
  verifiedSurv.verificationStatus === 'VERIFIED' && verifiedSurv.thermalConfirmed && verifiedSurv.confidence > 80,
  '8. Second-look verification successfully confirms genuine survivor'
);
assert(
  verifyEvent.type === 'SECOND_LOOK_RESULT',
  '8b. Second-look emits SECOND_LOOK_RESULT event'
);

// 9. Second-Look Rejection (False Positive)
const falseCandidate: Survivor = {
  ...lowConfSurvivor,
  id: 'SURV-FALSE-01',
  rgbConfidence: 40,
  thermalConfidence: 35,
  verificationStatus: 'POSSIBLE',
};
const { updatedSurvivor: rejectedSurv, event: rejectEvent } = executeSecondLookResolution(falseCandidate);
assert(
  rejectedSurv.verificationStatus === 'REJECTED' && rejectedSurv.confidence < 30,
  '9. Second-look verification successfully rejects false positive debris'
);

// 10. Rescue Priority Ranking with Mixed Statuses
const mixedList: Survivor[] = [
  { ...normalSurvivor, id: 'SURV-REJ', verificationStatus: 'REJECTED', riskScore: 90 },
  { ...normalSurvivor, id: 'SURV-ACTIVE-1', verificationStatus: 'VERIFIED', riskScore: 70 },
  { ...normalSurvivor, id: 'SURV-ACTIVE-2', verificationStatus: 'UNDER_REVIEW', riskScore: 85 },
];
const mixedRanked = prioritizeSurvivors(mixedList);
assert(
  mixedRanked[0].id === 'SURV-ACTIVE-2' && mixedRanked[1].id === 'SURV-ACTIVE-1' && mixedRanked[2].id === 'SURV-REJ',
  '10. Priority engine places active targets above rejected targets regardless of raw score'
);

// 11. Safe Route Generation (Obstacle Avoidance)
const destinationSurvivor: Survivor = {
  ...normalSurvivor,
  id: 'SURV-DEST-B3',
  zone: 'B3',
  latitude: 13.0841,
  longitude: 80.2745,
};
const fireObstacle: Hazard = {
  ...fireHazard,
  id: 'HAZ-FIRE-B2',
  zone: 'B2',
  severity: 'CRITICAL',
};
const safeRoute = calculateSafeRoute(destinationSurvivor, [fireObstacle], INITIAL_ZONES, 'A1');
assert(
  safeRoute.status === 'CALCULATED' && safeRoute.gridPath.length >= 2,
  '11a. Safe route generated from A1 staging area to B3 destination',
  `Path: ${safeRoute.gridPath.join(' -> ')}`
);
assert(
  !safeRoute.gridPath.includes('B2'),
  '11b. Safe route avoids dangerous Sector B2 containing critical fire hazard',
  `Path: ${safeRoute.gridPath.join(' -> ')}`
);
assert(
  safeRoute.totalDistanceMeters > 0 && safeRoute.estimatedTravelMinutes > 0,
  '11c. Safe route computes distance in meters and walking travel time'
);

// 12. Blocked Route Handling
const blockedHazards: Hazard[] = [
  { ...fireHazard, id: 'H-B1', zone: 'B1', severity: 'CRITICAL' },
  { ...fireHazard, id: 'H-A2', zone: 'A2', severity: 'CRITICAL' },
  { ...fireHazard, id: 'H-B2', zone: 'B2', severity: 'CRITICAL' },
  { ...fireHazard, id: 'H-B3', zone: 'B3', severity: 'CRITICAL' },
];
const blockedRoute = calculateSafeRoute(destinationSurvivor, blockedHazards, INITIAL_ZONES, 'A1');
assert(
  blockedRoute.status === 'BLOCKED' || blockedRoute.accessibilityRating === 'IMPASSABLE',
  '12. Blocked route scenario properly sets advisory caution/blocked status'
);

// 13. Dynamic Mission Replanning in SimulationDataProvider
const provider = new SimulationDataProvider();
assert(
  provider.getCurrentObjective().includes('Scan disaster grid'),
  '13a. Provider initializes with default search objective'
);
provider.simulateVictim('B3');
assert(
  provider.getCurrentObjective().includes('PRIORITY REPLAN') || provider.getCurrentObjective().includes('Survivor'),
  '13b. High-risk victim detection triggers dynamic mission replanning',
  `Objective: ${provider.getCurrentObjective()}`
);

// 14. Event Timeline Generation
const timeline = provider.getTimelineEvents();
assert(
  timeline.length >= 2,
  '14a. Timeline records chronological events'
);
const hasDetectionEvent = timeline.some((e) => e.type === 'DETECTION');
const hasRiskEvent = timeline.some((e) => e.type === 'RISK_UPDATE');
assert(
  hasDetectionEvent && hasRiskEvent,
  '14b. Timeline captures both DETECTION and RISK_UPDATE events'
);

// 15. Dashboard / Provider Synchronization & Second-Look Workflow
provider.simulateUncertainSurvivor('A2');
const uncertainInProvider = provider.getSurvivors().find((s) => s.verificationStatus === 'POSSIBLE');
assert(
  !!uncertainInProvider,
  '15a. Provider spawns uncertain survivor in POSSIBLE status'
);

if (uncertainInProvider) {
  provider.requestSecondLook(uncertainInProvider.id);
  const underReview = provider.getSurvivors().find((s) => s.id === uncertainInProvider.id);
  assert(
    underReview?.secondLookStatus === 'IN_PROGRESS' || underReview?.verificationStatus === 'UNDER_REVIEW',
    '15b. Second-look request immediately enters IN_PROGRESS state'
  );
}

provider.destroy();

console.log('\n======================================================');
console.log(`📊 TEST RESULTS: ${passedTests} / ${totalTests} TESTS PASSED`);
console.log('======================================================\n');
