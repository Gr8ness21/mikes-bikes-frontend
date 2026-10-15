import { useEffect, useRef } from 'react';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/leaflet.css';

const pin = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export type MapPoint = { lat: number; lng: number; label?: string };

type Props = {
  points: MapPoint[];
  path?: [number, number][];
  height?: number;
  label: string;
};

export default function MiniMap({ points, path, height = 190, label }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const overlay = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!host.current || mapRef.current) return;
    const map = L.map(host.current, {
      zoomControl: true,
      attributionControl: true,
      scrollWheelZoom: false,
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap',
    }).addTo(map);
    overlay.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layers = overlay.current;
    if (!map || !layers) return;
    layers.clearLayers();
    const bounds: L.LatLng[] = [];
    points.forEach((point) => {
      const latlng = L.latLng(point.lat, point.lng);
      bounds.push(latlng);
      L.marker(latlng, { icon: pin, title: point.label || label })
        .bindPopup(point.label || label)
        .addTo(layers);
    });
    if (path && path.length > 1) {
      const line = path.map(([lat, lng]) => L.latLng(lat, lng));
      L.polyline(line, { color: '#e10600', weight: 4, opacity: 0.9 }).addTo(layers);
      line.forEach((pt) => bounds.push(pt));
    }
    if (bounds.length === 1) {
      map.setView(bounds[0], 14);
    } else if (bounds.length > 1) {
      map.fitBounds(L.latLngBounds(bounds), { padding: [28, 28] });
    }
    window.setTimeout(() => map.invalidateSize(), 80);
  }, [points, path, label]);

  return (
    <div
      ref={host}
      className="mini-map"
      style={{ height, display: points.length ? 'block' : 'none' }}
      role="img"
      aria-label={label}
    />
  );
}
