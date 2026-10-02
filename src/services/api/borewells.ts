import { apiClient } from './client';
import { BorewellNode, PumpStatus } from '../../types';

export async function fetchBorewells(): Promise<BorewellNode[]> {
  const res = await apiClient<BorewellNode[]>('/borewells');
  if (res.success && res.data) {
    return res.data;
  }
  return [];
}

export async function fetchBorewellById(id: string): Promise<BorewellNode | null> {
  const res = await apiClient<BorewellNode>(`/borewells/${id}`);
  if (res.success && res.data) {
    return res.data;
  }
  return null;
}

export async function setBorewellPump(
  id: string,
  status?: PumpStatus
): Promise<BorewellNode | null> {
  const res = await apiClient<BorewellNode>(`/borewells/${id}/pump`, {
    method: 'POST',
    body: JSON.stringify({ status }),
  });
  if (res.success && res.data) {
    return res.data;
  }
  return null;
}
