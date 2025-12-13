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
    const url = `${this.baseUrl}${path}`;
    const bodyString = body ? JSON.stringify(body) : undefined;

    console.log('[API POST] URL:', url);
    console.log('[API POST] Body:', bodyString);
    console.log('[API POST] Headers:', { 'Content-Type': 'application/json' });

    const response = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      credentials: 'omit',
      headers: {
        'Content-Type': 'application/json',
      },
      body: bodyString,
    });

    console.log('[API POST] Response status:', response.status, response.statusText);

    if (!response.ok) {
      // Try to get error details from response
      console.error('❌ [API POST ERROR] Request failed!');
      console.error('❌ URL:', url);
      console.error('❌ Status:', response.status, response.statusText);
      console.error('❌ Body sent:', bodyString);

      let errorMessage = `API request failed: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        console.error('❌ Error Response:', errorData);
        errorMessage += ` - ${JSON.stringify(errorData)}`;
      } catch {
        // If response is not JSON, try to get text
        try {
          const errorText = await response.text();
          console.error('❌ Error Response (text):', errorText);
          errorMessage += ` - ${errorText}`;
        } catch {
          console.error('❌ Could not read error response');
        }
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  sendBeacon(path: string, data: Record<string, unknown>): boolean {
    const url = `${this.baseUrl}${path}`;
    const bodyString = JSON.stringify(data);

    console.log('[API BEACON] URL:', url);
    console.log('[API BEACON] Body:', bodyString);

    // Use fetch with keepalive instead of sendBeacon to avoid credentials issue
    fetch(url, {
      method: 'POST',
      mode: 'cors',
      credentials: 'omit',
      headers: {
        'Content-Type': 'application/json',
      },
      body: bodyString,
      keepalive: true,
    }).then(async response => {
      if (response.ok) {
        console.log('✅ [API BEACON] Success:', response.status, response.statusText);
      } else {
        console.error('❌ [API BEACON ERROR] Request failed!');
        console.error('❌ URL:', url);
        console.error('❌ Status:', response.status, response.statusText);
        console.error('❌ Body sent:', bodyString);

        try {
          const errorData = await response.json();
          console.error('❌ Error Response:', errorData);
        } catch {
          try {
            const errorText = await response.text();
            console.error('❌ Error Response (text):', errorText);
          } catch {
            console.error('❌ Could not read error response');
          }
        }
      }
    }).catch((error) => {
      console.error('❌ [API BEACON] Network error:', error);
      console.error('❌ URL:', url);
      console.error('❌ Body sent:', bodyString);
    });

    return true;
  }
}
