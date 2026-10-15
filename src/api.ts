const API = String(import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

function token() {
  return localStorage.getItem('mb_token');
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  const t = token();
  if (t) headers.set('Authorization', `Bearer ${t}`);
  let res: Response;
  try {
    res = await fetch(`${API}${path}`, { ...options, headers });
  } catch {
    throw new Error('Cannot reach the API. Keep the backend running on port 5001 and refresh.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || 'Request failed') as Error & { details?: unknown };
    err.details = data;
    throw err;
  }
  return data as T;
}
