export class ApiError extends Error {
  status: number;
  code: string;
  data?: any;
  constructor(
    status: number,
    code: string,
    message: string,
    data?: any
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.data = data;
  }
}

export async function fetchApi<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `/api${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(!(options.body instanceof FormData) && { 'Content-Type': 'application/json' }),
      ...options.headers,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      throw new ApiError(response.status, 'UNKNOWN_ERROR', 'An unknown error occurred');
    }
    throw new ApiError(
      response.status,
      errorData.code || 'UNKNOWN_ERROR',
      errorData.message || 'An unknown error occurred',
      errorData
    );
  }

  // Handle empty responses (like 204 No Content or empty 200)
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  return null as any;
}
