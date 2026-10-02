import { apiClient } from './client';
import { IotDevice } from '../../types';

export async function fetchDevices(borewellId?: string, status?: string): Promise<IotDevice[]> {
  const query = new URLSearchParams();
  if (borewellId) query.set('borewellId', borewellId);
  if (status) query.set('status', status);

  const endpoint = `/devices${query.toString() ? `?${query.toString()}` : ''}`;
  const res = await apiClient<IotDevice[]>(endpoint);
  if (res.success && res.data) {
    return res.data;
  }
  return [];
}

export async function fetchDeviceById(id: string): Promise<IotDevice | null> {
  const res = await apiClient<IotDevice>(`/devices/${id}`);
  if (res.success && res.data) {
    return res.data;
  }
  return null;
}

export async function createDevice(device: IotDevice): Promise<IotDevice | null> {
  const res = await apiClient<IotDevice>('/devices', {
    method: 'POST',
    body: JSON.stringify(device),
  });
  if (res.success && res.data) {
    return res.data;
  }
  return null;
}

export async function updateDevice(
  id: string,
  updates: Partial<IotDevice>
): Promise<IotDevice | null> {
  const res = await apiClient<IotDevice>(`/devices/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
  if (res.success && res.data) {
    return res.data;
  }
  return null;
}

export async function deleteDevice(id: string): Promise<boolean> {
  const res = await apiClient(`/devices/${id}`, {
    method: 'DELETE',
  });
  return !!res.success;
}

export async function testDeviceConnection(
  id: string
): Promise<{ success: boolean; latencyMs: number; message: string }> {
  const res = await apiClient<{ deviceId: string; latencyMs: number; packetLossPct: number; status: string }>(
    `/devices/${id}/test-connection`,
    {
      method: 'POST',
    }
  );

  if (res.success && res.data) {
    return {
      success: true,
      latencyMs: res.data.latencyMs,
      message: res.message || `Uplink verified with ${res.data.latencyMs}ms round-trip latency.`,
    };
  }

  return {
    success: false,
    latencyMs: 999,
    message: res.error || 'Connection test failed',
  };
}

export async function calibrateDevice(id: string): Promise<boolean> {
  const res = await apiClient(`/devices/${id}/calibrate`, {
    method: 'POST',
  });
  return !!res.success;
}
