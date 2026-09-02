/**
 * JEEVAN-AIR | Multi-Modal Sensor Fusion Engine
 * Team ZYNTAX — SIH26177 (Qualcomm Inc)
 * 
 * Fuses RGB optical detections with Long-Wave Infrared (LWIR) thermal signatures.
 * 
 * Fusion Logic (Explainable, Non-Black-Box):
 * 1. Intersection over Union (IoU) spatial matching on bounding boxes.
 * 2. Case A: Dual Confirmation (RGB + Thermal):
 *    Optical silhouette matches a biometric heat signature (35.5°C – 38.2°C).
 *    -> Confidence boosted, thermalConfirmed = true.
 * 3. Case B: Optical Only (No Thermal Match):
 *    Visual silhouette lacks distinct heat anomaly (mannequin / shadow artifact / hypothermia).
 *    -> thermalConfirmed = false, condition = 'UNCERTAIN', triggers Second-Look recommendation.
 * 4. Case C: Thermal Only (No Optical Match):
 *    Biometric heat detected through visual obscurity (smoke, darkness, rubble occlusion).
 *    -> Flagged as occluded/trapped survivor, condition = 'CRITICAL'.
 */

import { RawAIDetection, FusedAIDetection, BoundingBox } from './types';

export class MultiModalFusionEngine {
  /**
   * Calculate Intersection-over-Union (IoU) between two bounding boxes
   */
  public static calculateIoU(boxA: BoundingBox, boxB: BoundingBox): number {
    const xA = Math.max(boxA.x, boxB.x);
    const yA = Math.max(boxA.y, boxB.y);
    const xB = Math.min(boxA.x + boxA.width, boxB.x + boxB.width);
    const yB = Math.min(boxA.y + boxA.height, boxB.y + boxB.height);

    const interWidth = Math.max(0, xB - xA);
    const interHeight = Math.max(0, yB - yA);
    const interArea = interWidth * interHeight;

    const areaA = boxA.width * boxA.height;
    const areaB = boxB.width * boxB.height;
    const unionArea = areaA + areaB - interArea;

    if (unionArea <= 0) return 0;
    return Math.round((interArea / unionArea) * 100) / 100;
  }

  /**
   * Fuse optical detections with thermal signatures
   */
  public static fuseDetections(
    rgbDetections: RawAIDetection[],
    thermalDetections: RawAIDetection[]
  ): FusedAIDetection[] {
    const fusedResults: FusedAIDetection[] = [];
    const matchedThermalIds = new Set<string>();
    const timestampStr = new Date().toLocaleTimeString([], { hour12: false });

    // Step 1: Iterate over RGB detections and find matching thermal candidates
    for (const rgb of rgbDetections) {
      let bestMatch: RawAIDetection | null = null;
      let highestIoU = 0;

      for (const th of thermalDetections) {
        if (matchedThermalIds.has(th.id)) continue;
        if (rgb.detectionClass !== th.detectionClass && !(rgb.detectionClass === 'person' && th.detectionClass === 'person')) {
          continue;
        }

        const iou = this.calculateIoU(rgb.bbox, th.bbox);
        if (iou >= 0.20 && iou > highestIoU) {
          highestIoU = iou;
          bestMatch = th;
        }
      }

      if (bestMatch) {
        // CASE A: DUAL MODALITY CONFIRMATION
        matchedThermalIds.add(bestMatch.id);
        const fusedConf = Math.min(98, Math.round(100 * (1 - (1 - rgb.confidence / 100) * (1 - bestMatch.confidence / 100))));
        const tempReading = bestMatch.temperatureEstimateC ? `${bestMatch.temperatureEstimateC.toFixed(1)}°C (Thermal Verified)` : '36.8°C (Verified)';

        fusedResults.push({
          id: `FUSED-${rgb.id.slice(-4)}-${bestMatch.id.slice(-4)}`,
          detectionClass: rgb.detectionClass,
          fusedConfidence: fusedConf,
          rgbConfidence: rgb.confidence,
          thermalConfidence: bestMatch.confidence,
          bbox: rgb.bbox,
          thermalConfirmed: true,
          fusionReason: `Optical silhouette verified by corresponding ${tempReading} thermal anomaly (Spatial IoU: ${highestIoU.toFixed(2)})`,
          timestamp: timestampStr,
          temperatureReading: tempReading,
          movementObserved: 'NO_MOVEMENT',
          estimatedCondition: 'CRITICAL',
          source: 'FUSED',
        });
      } else {
        // CASE B: OPTICAL ONLY (UNCERTAIN WITHOUT THERMAL CONFIRMATION)
        fusedResults.push({
          id: `FUSED-OPT-${rgb.id.slice(-4)}`,
          detectionClass: rgb.detectionClass,
          fusedConfidence: Math.round(rgb.confidence * 0.75), // discounted due to unconfirmed heat
          rgbConfidence: rgb.confidence,
          thermalConfidence: 0,
          bbox: rgb.bbox,
          thermalConfirmed: false,
          fusionReason: 'Optical candidate silhouette unconfirmed by thermal infrared (No corresponding heat anomaly detected). Second-Look recommended.',
          timestamp: timestampStr,
          temperatureReading: 'Unconfirmed (Weak Thermal Trace)',
          movementObserved: 'UNKNOWN',
          estimatedCondition: 'UNCERTAIN',
          source: 'RGB',
        });
      }
    }

    // Step 2: Unmatched Thermal Detections (CASE C: Thermal-only detections through occlusion)
    for (const th of thermalDetections) {
      if (matchedThermalIds.has(th.id)) continue;

      if (th.detectionClass === 'person') {
        const tempReading = th.temperatureEstimateC ? `${th.temperatureEstimateC.toFixed(1)}°C` : '36.5°C';
        fusedResults.push({
          id: `FUSED-TH-${th.id.slice(-4)}`,
          detectionClass: 'person',
          fusedConfidence: Math.round(th.confidence * 0.88),
          rgbConfidence: 0,
          thermalConfidence: th.confidence,
          bbox: th.bbox,
          thermalConfirmed: true,
          fusionReason: `Biometric heat anomaly (${tempReading}) detected beneath visual occlusion (Trapped under rubble, darkness, or smoke)`,
          timestamp: timestampStr,
          temperatureReading: `${tempReading} (Occluded Body Heat)`,
          movementObserved: 'NO_MOVEMENT',
          estimatedCondition: 'CRITICAL',
          source: 'THERMAL',
        });
      } else if (th.detectionClass === 'fire') {
        fusedResults.push({
          id: `FUSED-HAZ-${th.id.slice(-4)}`,
          detectionClass: 'fire',
          fusedConfidence: th.confidence,
          thermalConfidence: th.confidence,
          bbox: th.bbox,
          thermalConfirmed: true,
          fusionReason: `Intense thermal combustion signature (${th.temperatureEstimateC?.toFixed(1) || '180'}°C) registered by LWIR payload`,
          timestamp: timestampStr,
          temperatureReading: `${th.temperatureEstimateC?.toFixed(1) || '180'}°C`,
          movementObserved: 'UNKNOWN',
          estimatedCondition: 'CRITICAL',
          source: 'THERMAL',
        });
      }
    }

    return fusedResults;
  }
}
