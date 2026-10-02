import { apiClient } from './client';
import { GroundwaterDataPoint } from '../../types';

export async function fetchTelemetry(
  borewellId?: string,
  limit = 50
): Promise<GroundwaterDataPoint[]> {
  const query = new URLSearchParams();
  if (borewellId) query.set('borewellId', borewellId);
  query.set('limit', limit.toString());

  const res = await apiClient<GroundwaterDataPoint[]>(`/telemetry?${query.toString()}`);
  if (res.success && res.data) {
    return res.data;
  }
  return [];
}
