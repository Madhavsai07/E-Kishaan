const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

export async function fetchFromBackend<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    if (data && data.success !== false) {
      return data as T;
    }
    return null;
  } catch (error) {
    // Backend offline or unreachable — returns null for seamless fallback
    return null;
  }
}
