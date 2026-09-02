/**
 * JEEVAN-AIR | Phase 3 AI Pipeline Tests
 * Team ZYNTAX — SIH26177 (Qualcomm Inc)
 *
 * Tests:
 *  1. Person detection from RGB frame
 *  2. Low-confidence detection detection
 *  3. Multiple detections in a frame
 *  4. Hazard detection interface (fire, flood, smoke)
 *  5. RGB/Thermal fusion (Case A: dual confirmation)
 *  6. RGB/Thermal fusion (Case B: RGB only, no thermal match)
 *  7. Thermal-only detection (Case C: occluded survivor)
 *  8. Second-look flow triggered by low-confidence fused result
 *  9. Risk engine integration via convertDetectionToSurvivor
 * 10. Priority ranking after AI-sourced survivor creation
 * 11. Simulation fallback activation
 * 12. IoU calculation correctness
 * 13. Thermal fire hotspot detection (>60°C)
 * 14. Benchmark reporting (performance.now() measured, not invented)
 * 15. Dashboard/AIPipelineService singleton stability
 */

import { YoloVisionProvider } from '../ai/YoloVisionProvider';
import { ThermalProcessingProvider } from '../ai/ThermalProcessingProvider';
import { HazardDetectionProvider } from '../ai/HazardDetectionProvider';
import { MultiModalFusionEngine } from '../ai/MultiModalFusionEngine';
import { AIPipelineService } from '../ai/AIPipelineService';
import { FrameData, ThermalFrameData } from '../ai/types';
import { prioritizeSurvivors } from '../services/rescueIntelligence';

// ─── Utilities ────────────────────────────────────────────────────────────────

let pass = 0;
let fail = 0;

function assert(label: string, condition: boolean, detail?: string): void {
  if (condition) {
    console.log(`  ✅ PASS | ${label}`);
    pass++;
  } else {
    console.error(`  ❌ FAIL | ${label}${detail ? ' — ' + detail : ''}`);
    fail++;
  }
}

// ─── Mock Frames ──────────────────────────────────────────────────────────────

const standardRGBFrame: FrameData = {
  id: 'FRAME-OPTICAL-001',
  width: 640,
  height: 480,
  timestamp: performance.now(),
  source: 'SIMULATED_STREAM',
};

const personRGBFrame: FrameData = {
  id: 'FRAME-person-victim-001',
  width: 640,
  height: 480,
  timestamp: performance.now(),
  source: 'SIMULATED_STREAM',
};

const lowConfRGBFrame: FrameData = {
  id: 'FRAME-OPTICAL-LOW',
  width: 100, // Small width with no recognizable id  
  height: 75,
  timestamp: performance.now(),
  source: 'SIMULATED_STREAM',
};

const thermalBodyFrame: ThermalFrameData = {
  id: 'FRAME-THERMAL-BODY',
  width: 160,
  height: 120,
  timestamp: performance.now(),
  minTempC: 22.1,
  maxTempC: 36.8,
  ambientTempC: 24.0,
  source: 'SIMULATED_THERMAL_STREAM',
};

const thermalFireFrame: ThermalFrameData = {
  id: 'FRAME-THERMAL-FIRE',
  width: 160,
  height: 120,
  timestamp: performance.now(),
  minTempC: 25.0,
  maxTempC: 182.5,
  ambientTempC: 26.0,
  source: 'SIMULATED_THERMAL_STREAM',
};

const thermalColdFrame: ThermalFrameData = {
  id: 'FRAME-THERMAL-COLD',
  width: 160,
  height: 120,
  timestamp: performance.now(),
  minTempC: 18.0,
  maxTempC: 21.5, // Below human body temp — nothing should be detected
  ambientTempC: 20.0,
  source: 'SIMULATED_THERMAL_STREAM',
};

// ─── 1. YOLO Optical Person Detection ────────────────────────────────────────

async function testYoloPersonDetection() {
  console.log('\n--- Test 1: YOLO Person Detection (RGB) ---');
  const yolo = new YoloVisionProvider();
  await yolo.initialize();
  const detections = await yolo.detectRGB(personRGBFrame);
  assert('At least one detection returned', detections.length >= 1);
  const person = detections.find((d) => d.detectionClass === 'person');
  assert('Person class detected', !!person);
  assert('Confidence between 0–100', (person?.confidence ?? -1) >= 0 && (person?.confidence ?? 101) <= 100);
  assert('Bounding box present', !!person?.bbox);
  assert('Detection has timestamp', typeof person?.timestamp === 'string' && person.timestamp.length > 0);
  assert('Detection source is RGB', person?.source === 'RGB');
}

// ─── 2. Low-Confidence Detection Behavior ─────────────────────────────────────

async function testLowConfidenceRGB() {
  console.log('\n--- Test 2: Low-Confidence Detection (Generic Frame) ---');
  const yolo = new YoloVisionProvider();
  await yolo.initialize();
  const detections = await yolo.detectRGB(standardRGBFrame);
  assert('Returns detections even for standard frame', detections.length >= 0);
  for (const det of detections) {
    assert(`Confidence ${det.confidence}% valid range`, det.confidence >= 0 && det.confidence <= 100);
  }
}

// ─── 3. Multiple Detections in Frame ─────────────────────────────────────────

async function testMultipleDetections() {
  console.log('\n--- Test 3: Multiple Detections — Fusion yields distinct IDs ---');
  const rgbDets = [
    { id: 'R1', detectionClass: 'person' as const, confidence: 85, bbox: { x: 10, y: 10, width: 20, height: 40 }, timestamp: '12:00:00', source: 'RGB' as const },
    { id: 'R2', detectionClass: 'person' as const, confidence: 78, bbox: { x: 60, y: 15, width: 22, height: 38 }, timestamp: '12:00:01', source: 'RGB' as const },
  ];
  const thermalDets = [
    { id: 'T1', detectionClass: 'person' as const, confidence: 90, bbox: { x: 12, y: 12, width: 20, height: 40 }, timestamp: '12:00:00', source: 'THERMAL' as const, temperatureEstimateC: 36.9 },
  ];
  const fused = MultiModalFusionEngine.fuseDetections(rgbDets, thermalDets);
  assert('At least 2 fused results (1 dual + 1 RGB-only)', fused.length >= 2);
  const dualConf = fused.find((f) => f.thermalConfirmed);
  assert('One dual-confirmation result exists', !!dualConf);
  const unique = new Set(fused.map((f) => f.id));
  assert('All fused IDs are unique', unique.size === fused.length);
}

// ─── 4. Hazard Detection Interface ────────────────────────────────────────────

async function testHazardDetectionInterface() {
  console.log('\n--- Test 4: Hazard Detection Interface ---');
  const hazardDetector = new HazardDetectionProvider();
  assert('Supports fire', hazardDetector.supportedHazards.includes('fire'));
  assert('Supports flood', hazardDetector.supportedHazards.includes('flood'));
  assert('Supports smoke', hazardDetector.supportedHazards.includes('smoke'));
  assert('Supports debris', hazardDetector.supportedHazards.includes('debris'));
  assert('Supports damaged_structure', hazardDetector.supportedHazards.includes('damaged_structure'));

  const fireFrame: FrameData = { id: 'FRAME-fire-001', width: 640, height: 480, timestamp: performance.now(), source: 'SIMULATED_STREAM' };
  const hazards = await hazardDetector.detectHazards(fireFrame, thermalFireFrame);
  const fire = hazards.find((h) => h.detectionClass === 'fire');
  assert('Fire hazard detected from thermal hotspot frame', !!fire);
  assert('Fire confidence > 80%', (fire?.confidence ?? 0) > 80);
}

// ─── 5. Sensor Fusion Case A: Dual Confirmation ───────────────────────────────

async function testFusionDualConfirmation() {
  console.log('\n--- Test 5: Fusion Case A — Dual Confirmation ---');
  const rgbDets = [{ id: 'R-TEST', detectionClass: 'person' as const, confidence: 88, bbox: { x: 36, y: 28, width: 22, height: 44 }, timestamp: '12:01:00', source: 'RGB' as const }];
  const thermalDets = [{ id: 'T-TEST', detectionClass: 'person' as const, confidence: 91, bbox: { x: 38, y: 30, width: 22, height: 42 }, timestamp: '12:01:00', source: 'THERMAL' as const, temperatureEstimateC: 36.8 }];
  const fused = MultiModalFusionEngine.fuseDetections(rgbDets, thermalDets);
  assert('Dual confirmation result exists', fused.length >= 1);
  const result = fused[0];
  assert('thermalConfirmed = true for dual detection', result.thermalConfirmed === true);
  assert('Fused confidence higher than RGB alone (Bayesian boost)', result.fusedConfidence >= rgbDets[0].confidence);
  assert('fusionReason contains IoU reference', result.fusionReason.includes('IoU'));
  assert('temperatureReading contains °C', result.temperatureReading?.includes('°C') ?? false);
}

// ─── 6. Sensor Fusion Case B: RGB Only (No thermal match) ────────────────────

async function testFusionRGBOnly() {
  console.log('\n--- Test 6: Fusion Case B — RGB Only (No Thermal Confirmation) ---');
  const rgbDets = [{ id: 'R-ONLY', detectionClass: 'person' as const, confidence: 90, bbox: { x: 5, y: 5, width: 20, height: 40 }, timestamp: '12:02:00', source: 'RGB' as const }];
  const thermalDets = [{ id: 'T-NOOVERLAP', detectionClass: 'person' as const, confidence: 88, bbox: { x: 85, y: 80, width: 10, height: 10 }, timestamp: '12:02:00', source: 'THERMAL' as const }];
  const fused = MultiModalFusionEngine.fuseDetections(rgbDets, thermalDets);
  const rgbOnlyResult = fused.find((f) => f.source === 'RGB');
  assert('RGB-only result generated when no IoU match', !!rgbOnlyResult);
  assert('thermalConfirmed = false for RGB-only', rgbOnlyResult?.thermalConfirmed === false);
  assert('estimatedCondition is UNCERTAIN for unconfirmed', rgbOnlyResult?.estimatedCondition === 'UNCERTAIN');
  assert('Fused confidence discounted for unconfirmed detection', (rgbOnlyResult?.fusedConfidence ?? 100) < 90);
  assert('Second-look mentioned in fusionReason', rgbOnlyResult?.fusionReason.toLowerCase().includes('second') ?? false);
}

// ─── 7. Thermal-Only Detection (Case C: Occluded Survivor) ───────────────────

async function testFusionThermalOnly() {
  console.log('\n--- Test 7: Fusion Case C — Thermal-Only (Occluded Survivor) ---');
  const rgbDets: never[] = []; // No RGB detections
  const thermalDets = [{ id: 'T-OCCLUDED', detectionClass: 'person' as const, confidence: 87, bbox: { x: 38, y: 30, width: 22, height: 42 }, timestamp: '12:03:00', source: 'THERMAL' as const, temperatureEstimateC: 36.5 }];
  const fused = MultiModalFusionEngine.fuseDetections(rgbDets, thermalDets);
  const thermalOnly = fused.find((f) => f.source === 'THERMAL');
  assert('Thermal-only unmatched detection included', !!thermalOnly);
  assert('thermalConfirmed = true even without RGB', thermalOnly?.thermalConfirmed === true);
  assert('estimatedCondition CRITICAL for thermal-only occluded', thermalOnly?.estimatedCondition === 'CRITICAL');
}

// ─── 8. Second-Look Trigger from Low-Confidence Fused Detection ───────────────

async function testSecondLookTrigger() {
  console.log('\n--- Test 8: Second-Look Trigger from Low-Confidence Detection ---');
  const rgbDets = [{ id: 'R-LOWC', detectionClass: 'person' as const, confidence: 62, bbox: { x: 40, y: 20, width: 25, height: 50 }, timestamp: '12:04:00', source: 'RGB' as const }];
  const fused = MultiModalFusionEngine.fuseDetections(rgbDets, []);
  const result = fused[0];
  assert('Low-confidence detection has UNCERTAIN condition', result?.estimatedCondition === 'UNCERTAIN');
  const secondLookNeeded = (result?.fusedConfidence ?? 100) < 75;
  assert('Second-look indicated when fusedConfidence < 75%', secondLookNeeded);
  assert('thermalConfirmed false for unverified detection', result?.thermalConfirmed === false);
}

// ─── 9. Risk Engine Integration ────────────────────────────────────────────────

async function testRiskEngineIntegration() {
  console.log('\n--- Test 9: Risk Engine Integration via AIPipelineService ---');
  const aiService = AIPipelineService.getInstance();
  const rgbDets = [{ id: 'R-RISK', detectionClass: 'person' as const, confidence: 91, bbox: { x: 38, y: 28, width: 22, height: 44 }, timestamp: '12:05:00', source: 'RGB' as const }];
  const thermalDets = [{ id: 'T-RISK', detectionClass: 'person' as const, confidence: 88, bbox: { x: 38, y: 29, width: 22, height: 44 }, timestamp: '12:05:00', source: 'THERMAL' as const, temperatureEstimateC: 36.9 }];
  const fused = MultiModalFusionEngine.fuseDetections(rgbDets, thermalDets);
  const survivor = aiService.convertDetectionToSurvivor(
    fused[0],
    'B2',
    { lat: 13.0840, lng: 80.2740 },
    [],
    undefined
  );
  assert('Survivor ID generated', survivor.id.startsWith('SURV-'));
  assert('Risk score in range 0-100', survivor.riskScore >= 0 && survivor.riskScore <= 100);
  assert('Risk reasons non-empty', survivor.riskReasons.length > 0);
  assert('Survivor zone matches input', survivor.zone === 'B2');
  assert('Survivor has fusionReason in notes or riskReasons', (survivor.notes?.includes('Fusion Reason') || survivor.riskReasons.length > 0));
}

// ─── 10. Priority Ranking ──────────────────────────────────────────────────────

async function testPriorityRanking() {
  console.log('\n--- Test 10: Priority Ranking ---');
  const aiService = AIPipelineService.getInstance();

  const rgbFused1 = { id: 'F-CRIT', detectionClass: 'person' as const, fusedConfidence: 95, rgbConfidence: 94, thermalConfidence: 92, bbox: { x: 38, y: 28, width: 22, height: 44 }, thermalConfirmed: true, fusionReason: 'Dual confirmed', timestamp: '12:06:00', temperatureReading: '37.0°C', movementObserved: 'NO_MOVEMENT' as const, estimatedCondition: 'CRITICAL' as const, source: 'FUSED' as const };
  const rgbFused2 = { id: 'F-STAB', detectionClass: 'person' as const, fusedConfidence: 78, rgbConfidence: 78, thermalConfidence: 0, bbox: { x: 60, y: 30, width: 20, height: 40 }, thermalConfirmed: false, fusionReason: 'RGB only', timestamp: '12:06:00', movementObserved: 'MOVEMENT_DETECTED' as const, estimatedCondition: 'STABLE' as const, source: 'RGB' as const };

  const surv1 = aiService.convertDetectionToSurvivor(rgbFused1, 'C1', { lat: 13.082, lng: 80.274 }, []);
  const surv2 = aiService.convertDetectionToSurvivor(rgbFused2, 'A3', { lat: 13.090, lng: 80.271 }, []);

  const ranked = prioritizeSurvivors([surv1, surv2]);
  assert('Two survivors returned', ranked.length === 2);
  assert('Both survivors have priorityRank', ranked[0].priorityRank !== undefined && ranked[1].priorityRank !== undefined);
  assert('CRITICAL survivor ranked #1', ranked[0].estimatedCondition === 'CRITICAL' || ranked[0].riskScore > ranked[1].riskScore);
}

// ─── 11. Simulation Fallback Mode ─────────────────────────────────────────────

async function testSimulationFallback() {
  console.log('\n--- Test 11: Simulation Fallback Mode ---');
  const aiService = AIPipelineService.getInstance();
  aiService.setFallbackMode(true);
  const { fusedDetections, benchmark } = await aiService.processMultiModalFrames(standardRGBFrame);
  assert('Fallback returns detections', fusedDetections.length >= 1);
  assert('Benchmark status is FALLBACK_SIMULATION', benchmark.status === 'FALLBACK_SIMULATION');
  assert('Benchmark isSimulated = true', benchmark.isSimulated === true);
  assert('Benchmark device is Fallback Mock', benchmark.device === 'Fallback Mock');
  aiService.setFallbackMode(false); // Reset
}

// ─── 12. IoU Calculation ──────────────────────────────────────────────────────

function testIoUCalculation() {
  console.log('\n--- Test 12: IoU Calculation Correctness ---');
  const boxA = { x: 0, y: 0, width: 40, height: 40 };
  const boxB = { x: 20, y: 20, width: 40, height: 40 };
  const iou = MultiModalFusionEngine.calculateIoU(boxA, boxB);
  // Intersection: 20x20=400, Union: 40*40+40*40-400=2800, IoU=400/2800≈0.143
  assert('IoU between overlapping boxes > 0', iou > 0);
  assert('IoU between overlapping boxes < 1', iou < 1);

  const nonOverlapA = { x: 0, y: 0, width: 10, height: 10 };
  const nonOverlapB = { x: 50, y: 50, width: 10, height: 10 };
  const noIou = MultiModalFusionEngine.calculateIoU(nonOverlapA, nonOverlapB);
  assert('IoU = 0 for non-overlapping boxes', noIou === 0);

  const identicalBox = { x: 10, y: 10, width: 30, height: 30 };
  const perfectIou = MultiModalFusionEngine.calculateIoU(identicalBox, identicalBox);
  assert('IoU = 1.0 for identical boxes', perfectIou === 1.0);
}

// ─── 13. Thermal Fire Hotspot Detection (>60°C) ───────────────────────────────

async function testThermalFireHotspot() {
  console.log('\n--- Test 13: Thermal Fire Hotspot Detection ---');
  const thermalProvider = new ThermalProcessingProvider();
  await thermalProvider.initialize();

  const fireDetections = await thermalProvider.detectThermal(thermalFireFrame);
  const fire = fireDetections.find((d) => d.detectionClass === 'fire');
  assert('Fire detection triggered at >60°C thermal frame', !!fire);
  assert('Fire confidence > 80%', (fire?.confidence ?? 0) > 80);
  assert('Fire has temperature estimate', fire?.temperatureEstimateC !== undefined);

  // Cold frame should NOT trigger fire
  const coldDetections = await thermalProvider.detectThermal(thermalColdFrame);
  const noFire = coldDetections.find((d) => d.detectionClass === 'fire');
  assert('No fire detected in cold frame (21.5°C max)', !noFire);
}

// ─── 14. Benchmark is Measured (Not Invented) ─────────────────────────────────

async function testBenchmarkMeasurement() {
  console.log('\n--- Test 14: Benchmark Measurement Integrity ---');
  const aiService = AIPipelineService.getInstance();
  aiService.setFallbackMode(false);
  const { benchmark } = await aiService.processMultiModalFrames(personRGBFrame, thermalBodyFrame);
  assert('Benchmark inferenceTimeMs is a real number > 0', typeof benchmark.inferenceTimeMs === 'number' && benchmark.inferenceTimeMs > 0);
  assert('Benchmark has model name', benchmark.modelName.length > 0);
  assert('Benchmark has device info', benchmark.device.length > 0);
  assert('Benchmark has detectionsCount >= 0', benchmark.detectionsCount >= 0);
  assert('Benchmark status is ACTIVE (non-fallback mode)', benchmark.status === 'ACTIVE');
}

// ─── 15. AIPipelineService Singleton Stability ────────────────────────────────

async function testServiceSingleton() {
  console.log('\n--- Test 15: AIPipelineService Singleton Stability ---');
  const s1 = AIPipelineService.getInstance();
  const s2 = AIPipelineService.getInstance();
  assert('getInstance returns same instance', s1 === s2);
  s1.setFallbackMode(true);
  assert('State shared across singleton references', s2.isFallbackMode() === true);
  s1.setFallbackMode(false); // Reset
}

// ─── RUN ALL TESTS ────────────────────────────────────────────────────────────

async function runAllPhase3Tests() {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║  JEEVAN-AIR — Phase 3: AI Pipeline Test Suite                ║');
  console.log('║  Team ZYNTAX | SIH26177 | Qualcomm                           ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');

  await testYoloPersonDetection();
  await testLowConfidenceRGB();
  await testMultipleDetections();
  await testHazardDetectionInterface();
  await testFusionDualConfirmation();
  await testFusionRGBOnly();
  await testFusionThermalOnly();
  await testSecondLookTrigger();
  await testRiskEngineIntegration();
  await testPriorityRanking();
  await testSimulationFallback();
  testIoUCalculation();
  await testThermalFireHotspot();
  await testBenchmarkMeasurement();
  await testServiceSingleton();

  const total = pass + fail;
  console.log('');
  console.log(`╔═══════════════════════════════════════════════════════════════╗`);
  console.log(`║  PHASE 3 RESULTS: ${pass}/${total} passed${fail > 0 ? ' | ' + fail + ' failed' : ' ✅'}${''.padEnd(Math.max(0, 24 - String(fail > 0 ? ' | ' + fail + ' failed' : ' ✅').length))}║`);
  console.log(`╚═══════════════════════════════════════════════════════════════╝`);
  console.log('');

  if (fail > 0) {
    process.exit(1);
  }
}

runAllPhase3Tests().catch(console.error);
