const fallbackApi = import.meta.env.PROD ? 'https://mikes-bikes-backend-1.onrender.com' : '';
export const API = String(import.meta.env.VITE_API_URL || fallbackApi).replace(/\/$/, '');

export function mediaUrl(path: string) {
  if (!path || /^(https?:|data:|blob:)/i.test(path) || path.startsWith('/brand/')) {
    return path;
  }
  return `${API}${path}`;
}

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
    throw new Error(
      API
        ? 'Cannot reach the API. Check VITE_API_URL and that the backend is live.'
        : 'Cannot reach the API. Keep the backend running on port 5001 and refresh.'
    );
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || 'Request failed') as Error & { details?: unknown };
    err.details = data;
    throw err;
  }
  return data as T;
}
