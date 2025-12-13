export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  async get<T>(path: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'GET',
      mode: 'cors',
      credentials: 'omit',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async post<T>(path: string, body?: Record<string, unknown>): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      mode: 'cors',
      credentials: 'omit',
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      // Try to get error details from response
      let errorMessage = `API request failed: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        console.error('[API Error]', errorData);
        errorMessage += ` - ${JSON.stringify(errorData)}`;
      } catch {
        // If response is not JSON, try to get text
        try {
          const errorText = await response.text();
          console.error('[API Error]', errorText);
          errorMessage += ` - ${errorText}`;
        } catch {
          // Ignore if we can't read the error
        }
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  sendBeacon(path: string, data: Record<string, unknown>): boolean {
    const url = `${this.baseUrl}${path}`;

    // Use fetch with keepalive instead of sendBeacon to avoid credentials issue
    fetch(url, {
      method: 'POST',
      mode: 'cors',
      credentials: 'omit',
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
