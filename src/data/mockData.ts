import { SearchZone, MissionHistoryItem, ZoneId } from '../types';

export const SEARCH_ROUTE: ZoneId[] = ['A1', 'A2', 'A3', 'B3', 'B2', 'B1', 'C1', 'C2', 'C3'];

export const INITIAL_ZONES: SearchZone[] = [
  { id: 'A1', name: 'Zone A1 (Sector North-West)', row: 0, col: 0, status: 'unsearched', terrain: 'Flood Water', lat: 13.0827, lng: 80.2707, victimsCount: 0, hazardsCount: 0 },
  { id: 'A2', name: 'Zone A2 (Sector North-Center)', row: 0, col: 1, status: 'unsearched', terrain: 'Urban Debris', lat: 13.0845, lng: 80.2735, victimsCount: 0, hazardsCount: 0 },
  { id: 'A3', name: 'Zone A3 (Sector North-East)', row: 0, col: 2, status: 'unsearched', terrain: 'Roadway', lat: 13.0863, lng: 80.2763, victimsCount: 0, hazardsCount: 0 },
  { id: 'B1', name: 'Zone B1 (Sector Mid-West)', row: 1, col: 0, status: 'unsearched', terrain: 'Open Field', lat: 13.0805, lng: 80.2689, victimsCount: 0, hazardsCount: 0 },
  { id: 'B2', name: 'Zone B2 (Sector Command-Center)', row: 1, col: 1, status: 'unsearched', terrain: 'Collapsed Building', lat: 13.0823, lng: 80.2717, victimsCount: 0, hazardsCount: 0 },
  { id: 'B3', name: 'Zone B3 (Sector Mid-East)', row: 1, col: 2, status: 'unsearched', terrain: 'Flood Water', lat: 13.0841, lng: 80.2745, victimsCount: 0, hazardsCount: 0 },
  { id: 'C1', name: 'Zone C1 (Sector South-West)', row: 2, col: 0, status: 'unsearched', terrain: 'Urban Debris', lat: 13.0783, lng: 80.2671, victimsCount: 0, hazardsCount: 0 },
  { id: 'C2', name: 'Zone C2 (Sector South-Center)', row: 2, col: 1, status: 'unsearched', terrain: 'Collapsed Building', lat: 13.0801, lng: 80.2699, victimsCount: 0, hazardsCount: 0 },
  { id: 'C3', name: 'Zone C3 (Sector South-East)', row: 2, col: 2, status: 'unsearched', terrain: 'Flood Water', lat: 13.0819, lng: 80.2727, victimsCount: 0, hazardsCount: 0 },
];

export const INITIAL_MISSION_HISTORY: MissionHistoryItem[] = [
  {
    id: 'MSN-2026-0902-01',
    name: 'Flood Rescue — Zone 01',
    location: 'Adyar River Basin, Sector 4',
    date: '02 September 2026',
    durationMinutes: 12,
    zonesSearched: 9,
    totalZones: 9,
    victimsDetected: 3,
    hazardsDetected: 5,
    status: 'Completed',
    notes: 'All 9 grids swept. High flood levels detected in B3 and C1. 3 individuals localized for boat extraction.'
  },
  {
    id: 'MSN-2026-0818-04',
    name: 'Earthquake Recon — Sector 4B',
    location: 'Metro Structural Collapse Zone',
    date: '18 August 2026',
    durationMinutes: 15,
    zonesSearched: 9,
    totalZones: 9,
    victimsDetected: 5,
    hazardsDetected: 4,
    status: 'Completed',
    notes: 'Thermal scanner detected body heat signatures beneath slab ruins in zone A2 and B2.'
  },
  {
    id: 'MSN-2026-0705-02',
    name: 'Flash Flood Rapid Assessment',
    location: 'Coastal Lowland Catchment',
    date: '05 July 2026',
    durationMinutes: 8,
    zonesSearched: 6,
    totalZones: 9,
    victimsDetected: 2,
    hazardsDetected: 3,
    status: 'Aborted',
    notes: 'Mission aborted early due to sudden heavy squall and wind gusts exceeding 45 km/h safety limits.'
  }
];
