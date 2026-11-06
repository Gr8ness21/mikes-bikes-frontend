import { API } from '../api';

let resolvedKey = String(import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '');
let loading: Promise<void> | null = null;

async function resolveGoogleMapsKey() {
  if (resolvedKey) return resolvedKey;
  const res = await fetch(`${API}/api/geo/maps-config`);
  const data = (await res.json().catch(() => ({}))) as { key?: string };
  resolvedKey = String(data.key || '');
  if (!resolvedKey) throw new Error('Missing Google Maps key');
  return resolvedKey;
}

export async function loadGoogleMaps(): Promise<void> {
  const g = window as Window & { google?: { maps?: unknown } };
  if (g.google?.maps) return;
  if (loading) return loading;
  loading = (async () => {
    const key = await resolveGoogleMapsKey();
    await new Promise<void>((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>('script[data-mb-gmaps]');
      if (existing) {
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', () => reject(new Error('Google Maps failed to load')));
        return;
      }
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}`;
      script.async = true;
      script.dataset.mbGmaps = '1';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Google Maps failed to load'));
      document.head.appendChild(script);
    });
  })().catch((err) => {
    loading = null;
    throw err;
  });
  return loading;
}

export const darkMapStyles = [
  { elementType: 'geometry', stylers: [{ color: '#1a1a1a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a1a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8d8d8d' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2a2a2a' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#111' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3a3a3a' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0b0b0b' }] },
];
