import { apiClient } from './client';
import { Anomaly, Severity } from '../../types';

export async function fetchAnomalies(
  status?: string,
  severity?: Severity
): Promise<Anomaly[]> {
  const query = new URLSearchParams();
  if (status) query.set('status', status);
  if (severity) query.set('severity', severity);

  const endpoint = `/anomalies${query.toString() ? `?${query.toString()}` : ''}`;
  const res = await apiClient<Anomaly[]>(endpoint);
  if (res.success && res.data) {
    return res.data;
  }
  return [];
}

export async function acknowledgeAnomaly(id: string): Promise<Anomaly | null> {
  const res = await apiClient<Anomaly>(`/anomalies/${id}/acknowledge`, {
    method: 'POST',
  });
  if (res.success && res.data) {
    return res.data;
  }
  return null;
}

export async function resolveAnomalyApi(id: string): Promise<boolean> {
  const res = await apiClient(`/anomalies/${id}/resolve`, {
    method: 'POST',
  });
  return !!res.success;
}
