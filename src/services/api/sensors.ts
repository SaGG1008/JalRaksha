import { apiClient } from './client';
import { SensorTelemetry } from '../../types';

export async function fetchSensors(borewellId?: string): Promise<SensorTelemetry[]> {
  const query = borewellId ? `?borewellId=${borewellId}` : '';
  const res = await apiClient<SensorTelemetry[]>(`/sensors${query}`);
  if (res.success && res.data) {
    return res.data;
  }
  return [];
}
