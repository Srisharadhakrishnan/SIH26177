/**
 * JEEVAN-AIR | AI Pipeline Orchestration Service
 * Team ZYNTAX — SIH26177 (Qualcomm Inc)
 * 
 * Central AI pipeline managing:
 * 1. RGB YOLO Optical Inference
 * 2. LWIR Thermal Radiometric Processing
 * 3. Hazard Heuristic Detection
 * 4. Multi-Modal Sensor Fusion
 * 5. Simulation Fallback Engine (graceful degradation if AI model is unavailable)
 * 6. Connection to Phase 2 Rescue Intelligence (Risk Assessment, Prioritization, Routing)
 * 
 * MEASURED PERFORMANCE ONLY:
 * Inference latency is strictly tracked with performance.now() without invented values.
 */

import {
  IAIModelProvider,
  FrameData,
  ThermalFrameData,
  FusedAIDetection,
  InferenceBenchmark,
} from './types';
import { YoloVisionProvider } from './YoloVisionProvider';
import { ThermalProcessingProvider } from './ThermalProcessingProvider';
import { HazardDetectionProvider } from './HazardDetectionProvider';
import { MultiModalFusionEngine } from './MultiModalFusionEngine';
import {
  assessSurvivorRisk,
} from '../services/rescueIntelligence';
import { Survivor, Hazard, SearchZone, ZoneId } from '../types';

export class AIPipelineService {
  private static instance: AIPipelineService | null = null;

  private rgbProvider: IAIModelProvider;
  private thermalProvider: IAIModelProvider;
  private hazardDetector: HazardDetectionProvider;
  private fallbackMode: boolean = false;
  private lastBenchmark: InferenceBenchmark;

  private constructor() {
    this.rgbProvider = new YoloVisionProvider();
    this.thermalProvider = new ThermalProcessingProvider();
    this.hazardDetector = new HazardDetectionProvider();

    this.lastBenchmark = {
      modelName: 'YOLOv8-RescueNano + LWIR-Radiometric',
      modelType: 'MULTIMODAL_FUSION',
      inferenceTimeMs: 0,
      device: 'Browser CPU',
      timestamp: new Date().toLocaleTimeString([], { hour12: false }),
      detectionsCount: 0,
      status: 'ACTIVE',
      isSimulated: false,
    };
  }

  public static getInstance(): AIPipelineService {
    if (!AIPipelineService.instance) {
      AIPipelineService.instance = new AIPipelineService();
    }
    return AIPipelineService.instance;
  }

  public setFallbackMode(enabled: boolean): void {
    this.fallbackMode = enabled;
  }

  public isFallbackMode(): boolean {
    return this.fallbackMode;
  }

  public async initialize(): Promise<void> {
    try {
      await Promise.all([
        this.rgbProvider.initialize(),
        this.thermalProvider.initialize(),
      ]);
    } catch (err) {
      console.warn('[AIPipelineService] AI Provider initialization warning, activating fallback:', err);
      this.fallbackMode = true;
    }
  }

  /**
   * Run end-to-end multimodal inference pipeline
   */
  public async processMultiModalFrames(
    rgbFrame: FrameData,
    thermalFrame?: ThermalFrameData
  ): Promise<{
    fusedDetections: FusedAIDetection[];
    benchmark: InferenceBenchmark;
  }> {
    const t0 = performance.now();

    // Simulation fallback pathway if active
    if (this.fallbackMode) {
      const fallbackResult = this.generateFallbackDetections(rgbFrame);
      const t1 = performance.now();
      const benchmark: InferenceBenchmark = {
        modelName: 'Simulation AI Provider (Fallback)',
        modelType: 'SIMULATED_AI',
        inferenceTimeMs: Math.round((t1 - t0) * 100) / 100,
        device: 'Fallback Mock',
        timestamp: new Date().toLocaleTimeString([], { hour12: false }),
        detectionsCount: fallbackResult.length,
        status: 'FALLBACK_SIMULATION',
        isSimulated: true,
      };
      this.lastBenchmark = benchmark;
      return { fusedDetections: fallbackResult, benchmark };
    }

    // Parallel optical & thermal inference
    const [rgbDetections, thermalDetections, hazardDetections] = await Promise.all([
      this.rgbProvider.detectRGB(rgbFrame),
      thermalFrame ? this.thermalProvider.detectThermal(thermalFrame) : Promise.resolve([]),
      this.hazardDetector.detectHazards(rgbFrame, thermalFrame),
    ]);

    // Multi-modal sensor fusion
    const fusedDetections = MultiModalFusionEngine.fuseDetections(
      [...rgbDetections, ...hazardDetections.filter((h) => h.source === 'RGB')],
      [...thermalDetections, ...hazardDetections.filter((h) => h.source === 'THERMAL')]
    );

    const tEnd = performance.now();
    const measuredTimeMs = Math.round((tEnd - t0) * 100) / 100;

    const benchmark: InferenceBenchmark = {
      modelName: `${this.rgbProvider.name} + ${this.thermalProvider.name}`,
      modelType: 'MULTIMODAL_FUSION',
      inferenceTimeMs: measuredTimeMs,
      device: 'Browser CPU',
      timestamp: new Date().toLocaleTimeString([], { hour12: false }),
      detectionsCount: fusedDetections.length,
      status: 'ACTIVE',
      isSimulated: false,
    };

    this.lastBenchmark = benchmark;
    return { fusedDetections, benchmark };
  }

  /**
   * Convert Fused AI Detection directly to Rescue Intelligence Survivor entity
   */
  public convertDetectionToSurvivor(
    detection: FusedAIDetection,
    zoneId: ZoneId,
    coordinates: { lat: number; lng: number },
    hazards: Hazard[],
    zoneData?: SearchZone
  ): Survivor {
    const nearbyHazards = hazards
      .filter((h) => h.status !== 'DISMISSED' && (h.zone === zoneId || Math.abs(h.latitude - coordinates.lat) < 0.002))
      .map((h) => h.id);

    // Feed directly into Phase 2 explainable risk engine
    const riskAnalysis = assessSurvivorRisk(
      {
        rgbConfidence: detection.rgbConfidence || 0,
        thermalConfidence: detection.thermalConfidence || 0,
        thermalConfirmed: detection.thermalConfirmed,
        movementStatus: detection.movementObserved,
        estimatedCondition: detection.estimatedCondition,
        zone: zoneId,
        latitude: coordinates.lat,
        longitude: coordinates.lng,
      },
      hazards.map((h) => ({
        hazard: h,
        distanceMeters: 45,
        withinDangerRadius: h.zone === zoneId,
      })),
      zoneData
    );

    return {
      id: `SURV-${detection.id.slice(-4)}`,
      latitude: coordinates.lat,
      longitude: coordinates.lng,
      zone: zoneId,
      timestamp: detection.timestamp,
      rgbConfidence: detection.rgbConfidence || 0,
      thermalConfidence: detection.thermalConfidence || 0,
      confidence: detection.fusedConfidence,
      thermalConfirmed: detection.thermalConfirmed,
      movementStatus: detection.movementObserved,
      estimatedCondition: detection.estimatedCondition,
      condition: detection.estimatedCondition,
      nearbyHazards,
      priority: riskAnalysis.priority,
      riskScore: riskAnalysis.riskScore,
      riskLevel: riskAnalysis.riskLevel,
      riskReasons: [detection.fusionReason, ...riskAnalysis.reasons],
      verificationStatus: detection.thermalConfirmed ? 'VERIFIED' : 'POSSIBLE',
      secondLookRequested: false,
      secondLookStatus: 'NONE',
      temperatureReading: detection.temperatureReading,
      notes: `AI Inference Source: ${detection.source}. Fusion Reason: ${detection.fusionReason}`,
    };
  }

  public getLatestBenchmark(): InferenceBenchmark {
    return { ...this.lastBenchmark };
  }

  private generateFallbackDetections(frame: FrameData): FusedAIDetection[] {
    const timestampStr = new Date().toLocaleTimeString([], { hour12: false });
    return [
      {
        id: `FALLBACK-DET-${Date.now().toString().slice(-4)}`,
        detectionClass: 'person',
        fusedConfidence: 82,
        rgbConfidence: 82,
        thermalConfidence: 78,
        bbox: { x: 38, y: 32, width: 22, height: 42 },
        thermalConfirmed: true,
        fusionReason: 'Simulated fallback detection: optical & thermal heuristic stream',
        timestamp: timestampStr,
        temperatureReading: '36.8°C (Simulated Fallback)',
        movementObserved: 'NO_MOVEMENT',
        estimatedCondition: 'CRITICAL',
        source: 'FUSED',
      },
    ];
  }
}
