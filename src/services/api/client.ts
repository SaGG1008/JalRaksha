const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    const json = await res.json();
    return json as ApiResponse<T>;
  } catch (err: any) {
    console.warn(`[API Client Warning] Request to ${url} failed:`, err.message);
    return {
      success: false,
      error: err.message || 'Network request failed',
    };
  }
}
