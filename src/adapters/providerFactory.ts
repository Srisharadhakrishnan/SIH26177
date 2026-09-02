/**
 * JEEVAN-AIR | Data Provider Factory
 * Team ZYNTAX — SIH26177 (Qualcomm Inc)
 *
 * ════════════════════════════════════════════════════════════
 * PHASE 4 — Zero-Rewrite Hardware/Simulation Switch
 * ════════════════════════════════════════════════════════════
 *
 * This factory selects the correct IDataAdapter implementation
 * based on the SIMULATION_MODE flag in hardware/config.ts.
 *
 * The dashboard (MissionContext.tsx) imports ONLY from this factory.
 * It never directly references SimulationDataProvider or HardwareDataProvider.
 * This means switching to hardware mode requires ONE config change only:
 *
 *   hardware/config.ts → SIMULATION_MODE = false
 *
 * No dashboard component, page, or context needs to be modified.
 *
 * ─── Current Default ─────────────────────────────────────────
 * SIMULATION_MODE = true → SimulationDataProvider (safe default)
 * ─────────────────────────────────────────────────────────────
 */

import { IDataAdapter } from './IDataAdapter';
import { SimulationDataProvider } from './SimulationDataProvider';
import { HardwareDataProvider } from './HardwareDataProvider';
import { SIMULATION_MODE, ACTIVE_PROVIDER_MODE } from '../hardware/config';

/**
 * Creates and returns the appropriate data provider.
 *
 * SIMULATION_MODE = true  → SimulationDataProvider (default, Phase 1–3)
 * SIMULATION_MODE = false → HardwareDataProvider   (Phase 4, requires drone)
 *
 * Called once at app startup in MissionContext.tsx.
 */
export function createDataProvider(): IDataAdapter {
  if (SIMULATION_MODE) {
    console.info(
      `[ProviderFactory] Mode: ${ACTIVE_PROVIDER_MODE} — Using SimulationDataProvider. ` +
      'Set SIMULATION_MODE = false in src/hardware/config.ts when physical hardware is ready.'
    );
    return new SimulationDataProvider();
  }

  console.info(
    `[ProviderFactory] Mode: ${ACTIVE_PROVIDER_MODE} — Using HardwareDataProvider. ` +
    'Ensure edge bridge is running at configured WebSocket URL.'
  );
  const provider = new HardwareDataProvider();
  provider.connectToEdgeBridge();
  return provider;
}

/**
 * Returns the current active mode label for display in the UI.
 */
export function getActiveProviderMode(): 'SIMULATION' | 'HARDWARE' {
  return ACTIVE_PROVIDER_MODE;
}
