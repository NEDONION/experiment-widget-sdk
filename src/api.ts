import type { ApiResponse } from './types';

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  async get<T>(path: string): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  }

  async post<T>(path: string, body?: Record<string, unknown>): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    return response.json();
  }

  sendBeacon(path: string, data: Record<string, unknown>): boolean {
    const url = `${this.baseUrl}${path}`;
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });

    if (navigator.sendBeacon) {
      return navigator.sendBeacon(url, blob);
    }

    // Fallback to fetch with keepalive
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      keepalive: true,
    }).catch(() => {
      // Silent fail for beacon
    });

    return true;
  }
}
