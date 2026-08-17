export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // essential for httpOnly cookies
  });

  if (!response.ok) {
    let message = 'API Error';
    try {
      const errData = await response.json();
      message = errData.detail || errData.message || message;
    } catch (e) {
      // ignore
    }
    
    // If it's a 401, we might want to trigger a global logout or redirect
    if (response.status === 401) {
        // We'll let the components handle 401 via AuthContext for now
    }
    
    throw new ApiError(message, response.status);
  }

  // Handle empty responses
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const fetchHealth = async () => {
    try {
        return await fetchApi<{status: string, db: string}>('/health');
    } catch (error) {
        console.error("Health check failed:", error);
        return { status: 'error', db: 'disconnected' };
    }
};
