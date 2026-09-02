/**
 * JEEVAN-AIR | AI & Computer Vision Interface Types
 * Team ZYNTAX — SIH26177 (Qualcomm Inc)
 * 
 * Clean abstraction decoupling neural inference providers (YOLO / MobileNet / Edge Vision)
 * from frontend dashboard presentation and Rescue Intelligence decision logic.
 */

import type { BoundingBox } from '../types';
export type { BoundingBox };

export type DetectionClass =
  | 'person'
  | 'survivor'
  | 'fire'
  | 'smoke'
  | 'flood'
  | 'debris'
  | 'damaged_structure'
  | 'vehicle';

export interface FrameData {
  id: string;
  width: number;
  height: number;
  timestamp: number; // performance.now() timestamp
  source: 'RGB_CAMERA_FEED' | 'SIMULATED_STREAM';
  data?: ImageData | Uint8ClampedArray | HTMLCanvasElement;
}

export interface ThermalFrameData {
  id: string;
  width: number;
  height: number;
  timestamp: number;
  minTempC: number;
  maxTempC: number;
  ambientTempC: number;
  // Radiometric matrix or synthetic temperature points
  radiometricGrid?: number[][];
  source: 'LWIR_CAMERA_PAYLOAD' | 'SIMULATED_THERMAL_STREAM';
}

export interface RawAIDetection {
  id: string;
  detectionClass: DetectionClass;
  confidence: number; // 0-100 percentage
  bbox: BoundingBox;
  timestamp: string;
  source: 'RGB' | 'THERMAL';
  temperatureEstimateC?: number;
  featureNotes?: string;
}

export interface FusedAIDetection {
  id: string;
  detectionClass: DetectionClass;
  fusedConfidence: number; // 0-100 percentage
  rgbConfidence?: number;
  thermalConfidence?: number;
  bbox: BoundingBox;
  thermalConfirmed: boolean;
  fusionReason: string;
  timestamp: string;
  temperatureReading?: string;
  movementObserved: 'NO_MOVEMENT' | 'MOVEMENT_DETECTED' | 'UNKNOWN';
  estimatedCondition: 'STABLE' | 'CRITICAL' | 'UNCERTAIN' | 'UNKNOWN';
  source: 'FUSED' | 'RGB' | 'THERMAL';
}

export interface InferenceBenchmark {
  modelName: string;
  modelType: 'YOLOv8_OPTICAL' | 'RADIOMETRIC_THERMAL' | 'MULTIMODAL_FUSION' | 'SIMULATED_AI';
  inferenceTimeMs: number; // strictly measured via performance.now()
  device: 'Browser CPU' | 'Edge WebAssembly' | 'Simulated Provider' | 'Fallback Mock';
  timestamp: string;
  detectionsCount: number;
  status: 'ACTIVE' | 'STANDBY' | 'FALLBACK_SIMULATION';
  isSimulated: boolean;
}

export interface IAIModelProvider {
  readonly name: string;
  readonly isSimulated: boolean;
  readonly modelType: string;

  initialize(): Promise<boolean>;
  detectRGB(frame: FrameData): Promise<RawAIDetection[]>;
  detectThermal(frame: ThermalFrameData): Promise<RawAIDetection[]>;
  getBenchmark(): InferenceBenchmark;
  dispose(): void;
}

export interface IAIHazardDetector {
  readonly supportedHazards: DetectionClass[];
  detectHazards(frame: FrameData, thermalFrame?: ThermalFrameData): Promise<RawAIDetection[]>;
}
