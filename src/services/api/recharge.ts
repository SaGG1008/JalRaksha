import { apiClient } from './client';
import { RechargeAssessment } from '../../types';

export async function fetchRecharge(): Promise<RechargeAssessment | null> {
  const res = await apiClient<RechargeAssessment>('/recharge');
  if (res.success && res.data) {
    return res.data;
  }
  return null;
}
