import { apiClient } from './client';
import { SimulationScenarioId } from '../../types';

export interface SimulationStatus {
  isSimulating: boolean;
  activeScenario: SimulationScenarioId | null;
  targetBorewell: string;
  mode: 'SIMULATION' | 'LIVE_HARDWARE';
  tickCount: number;
}

export async function fetchSimulationStatus(): Promise<SimulationStatus | null> {
  const res = await apiClient<SimulationStatus>('/simulation/status');
  if (res.success && res.data) {
    return res.data;
  }
  return null;
}

export async function triggerSimulationScenario(
  scenarioId: SimulationScenarioId,
  targetBorewell = 'BWL-03'
): Promise<boolean> {
  const res = await apiClient('/simulation/scenario', {
    method: 'POST',
    body: JSON.stringify({ scenarioId, targetBorewell }),
  });
  return !!res.success;
}

export async function resetSimulationApi(): Promise<boolean> {
  const res = await apiClient('/simulation/reset', {
    method: 'POST',
  });
  return !!res.success;
}
