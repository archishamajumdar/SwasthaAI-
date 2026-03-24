const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function apiRequest(endpoint: string, method: string = 'GET', body?: any) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, options);
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const message = errorData?.detail || errorData?.message || `API error ${response.status}: ${response.statusText}`;
    throw new Error(message);
  }
  return response.json();
}

export async function uploadFile(endpoint: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload error: ${response.statusText}`);
  }
  return response.json();
}
